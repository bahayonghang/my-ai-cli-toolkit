#!/usr/bin/env python3
"""Serve the storage report with a guarded trash/open API."""

from __future__ import annotations

import argparse
import json
import os
import secrets
import shutil
import subprocess
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from paths import (
    html_safe_dumps,
    is_green_trash_path,
    is_under,
    norm,
    rejected_green_trash,
    require_absolute,
    user_home,
    validate_analysis,
)

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE.parent / "assets" / "report_template.html"
TOKEN = secrets.token_urlsafe(24)

DATA: dict = {}
TPL = ""
TRASH_ALLOW: set[str] = set()
OPEN_ALLOW: set[str] = set()
STUB_ACTIONS: Path | None = None


def expand(path: str) -> str:
    return os.path.realpath(os.path.expanduser(path))


def shfileop_from_buffer(path: str):
    import ctypes

    abspath = os.path.abspath(path)
    return ctypes.create_unicode_buffer(abspath + "\0")


def load_allowlists(data: dict) -> tuple[set[str], set[str], list[str]]:
    home = user_home()
    trash_allow: set[str] = set()
    open_allow: set[str] = set()
    rejected = rejected_green_trash(data)
    for item in data.get("green") or []:
        for raw in item.get("trash_paths") or []:
            path = str(raw)
            if is_green_trash_path(path) and is_under(path, home):
                resolved = norm(path)
                trash_allow.add(resolved)
                open_allow.add(resolved)
    for item in data.get("yellow") or []:
        for raw in item.get("trash_paths") or []:
            path = str(raw)
            if is_under(path, home):
                resolved = norm(path)
                trash_allow.add(resolved)
                open_allow.add(resolved)
        if item.get("path") and is_under(str(item["path"]), home):
            resolved = expand(str(item["path"]))
            if os.path.exists(resolved):
                open_allow.add(norm(resolved))
    for item in data.get("red") or []:
        for raw in item.get("app_paths") or []:
            resolved = expand(str(raw))
            if os.path.exists(resolved):
                open_allow.add(norm(resolved))
    return trash_allow, open_allow, rejected


def load_analysis(path: Path) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("analysis must be a JSON object")
    errors = validate_analysis(payload)
    if errors:
        raise ValueError("; ".join(errors))
    return payload


def _trash_macos(path: str) -> None:
    script = "tell application \"Finder\" to delete (POSIX file %s as alias)" % json.dumps(path)
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if result.returncode != 0:
        dest = os.path.join(str(user_home()), ".Trash", os.path.basename(path.rstrip("/")) + "." + time.strftime("%H%M%S"))
        shutil.move(path, dest)


def _trash_windows(path: str) -> None:
    import ctypes
    from ctypes import wintypes

    class SHFILEOPSTRUCTW(ctypes.Structure):
        _fields_ = [
            ("hwnd", wintypes.HWND),
            ("wFunc", wintypes.UINT),
            ("pFrom", wintypes.LPCWSTR),
            ("pTo", wintypes.LPCWSTR),
            ("fFlags", ctypes.c_uint16),
            ("fAnyOperationsAborted", wintypes.BOOL),
            ("hNameMappings", ctypes.c_void_p),
            ("lpszProgressTitle", wintypes.LPCWSTR),
        ]

    buf = shfileop_from_buffer(path)
    op = SHFILEOPSTRUCTW()
    op.wFunc = 3
    op.pFrom = ctypes.cast(buf, wintypes.LPCWSTR)
    op.fFlags = 0x0040 | 0x0010 | 0x0004
    rc = ctypes.windll.shell32.SHFileOperationW(ctypes.byref(op))
    if rc != 0:
        raise OSError("SHFileOperation failed (code %d)" % rc)


def move_to_trash(path: str) -> None:
    if STUB_ACTIONS is not None:
        append_stub("trash", path, True)
        return
    if sys.platform == "darwin":
        _trash_macos(path)
    elif sys.platform.startswith("win"):
        _trash_windows(path)
    else:
        raise OSError("trash is only supported on macOS / Windows")


def open_in_file_manager(path: str) -> None:
    if STUB_ACTIONS is not None:
        append_stub("open", path, True)
        return
    target = path if os.path.isdir(path) else os.path.dirname(path)
    if sys.platform == "darwin":
        if target.rstrip("/").endswith(".app"):
            result = subprocess.run(["open", "-R", target], capture_output=True, text=True)
            if result.returncode != 0:
                raise OSError((result.stderr or "open -R failed").strip())
            return
        result = subprocess.run(["open", target], capture_output=True, text=True)
        if result.returncode != 0:
            result2 = subprocess.run(["open", "-R", target], capture_output=True, text=True)
            if result2.returncode != 0:
                raise OSError((result.stderr or result2.stderr or "open failed").strip())
    elif sys.platform.startswith("win"):
        if os.path.isdir(path):
            subprocess.run(["explorer", path])
        else:
            subprocess.run(["explorer", "/select,", path])
    else:
        raise OSError("open is only supported on macOS / Windows")


def append_stub(mode: str, path: str, ok: bool) -> None:
    if STUB_ACTIONS is None:
        return
    line = json.dumps({"mode": mode, "path": path, "ok": ok}, ensure_ascii=False)
    with STUB_ACTIONS.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(line + "\n")


def origin_allowed(origin: str) -> bool:
    if not origin:
        return True
    parsed = urlparse(origin)
    return parsed.scheme == "http" and parsed.hostname in {"127.0.0.1", "localhost"}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args: object) -> None:
        return

    def _send(self, code: int, body: str | bytes, ctype: str = "application/json") -> None:
        raw = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:
        if self.path in ("/", "/index.html"):
            html = TPL.replace("__REPORT_DATA__", html_safe_dumps(DATA)).replace(
                "__DELETE_CONFIG__", json.dumps({"token": TOKEN, "endpoint": "/action"})
            )
            self._send(200, html, "text/html; charset=utf-8")
        else:
            self._send(404, "not found", "text/plain")

    def do_POST(self) -> None:
        if self.path != "/action":
            self._send(404, json.dumps({"ok": False, "error": "not found"}))
            return
        host = (self.headers.get("Host") or "").split(":")[0]
        if host not in ("127.0.0.1", "localhost"):
            self._send(403, json.dumps({"ok": False, "error": "host not allowed"}))
            return
        if not origin_allowed(self.headers.get("Origin") or ""):
            self._send(403, json.dumps({"ok": False, "error": "origin not allowed"}))
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            self._send(400, json.dumps({"ok": False, "error": "bad content-length"}))
            return
        try:
            req = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._send(400, json.dumps({"ok": False, "error": "bad json"}))
            return
        if req.get("token") != TOKEN:
            self._send(403, json.dumps({"ok": False, "error": "token mismatch"}))
            return
        mode = req.get("mode")
        if mode == "rm":
            self._send(400, json.dumps({"ok": False, "error": "rm_disabled"}))
            return
        allow = {"trash": TRASH_ALLOW, "open": OPEN_ALLOW}.get(mode)
        if allow is None:
            self._send(400, json.dumps({"ok": False, "error": "unknown mode"}))
            return
        done: list[str] = []
        home = user_home()
        for raw in req.get("paths") or []:
            resolved = expand(str(raw))
            if norm(resolved) not in allow:
                self._send(403, json.dumps({"ok": False, "error": "path not allowlisted: %s" % raw}))
                return
            if not is_under(resolved, home):
                self._send(403, json.dumps({"ok": False, "error": "path escapes home: %s" % raw}))
                return
            try:
                if mode == "open":
                    open_in_file_manager(resolved)
                elif not os.path.exists(resolved):
                    pass
                else:
                    move_to_trash(resolved)
                done.append(str(raw))
            except Exception as exc:
                self._send(500, json.dumps({"ok": False, "error": str(exc)}))
                return
        self._send(200, json.dumps({"ok": True, "done": done}))


def check_allowlist_payload(data: dict) -> dict:
    trash_allow, _open_allow, rejected = load_allowlists(data)
    return {
        "ok": not rejected,
        "rm_allowed": False,
        "green_trash": sorted(trash_allow),
        "rejected": rejected,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Optional local trash/open report server")
    parser.add_argument("analysis", nargs="?", help="Absolute analysis JSON")
    parser.add_argument("--no-browser", action="store_true", default=True)
    parser.add_argument("--browser", action="store_true", help="Open the report in a browser")
    parser.add_argument("--stub-actions", help="Append action JSONL instead of calling the OS")
    parser.add_argument("--check-allowlist", action="store_true")
    parser.add_argument("--print-shfileop-buffer", help="Print Windows double-NUL buffer sizes")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    global DATA, TPL, TRASH_ALLOW, OPEN_ALLOW, STUB_ACTIONS
    args = parse_args(argv)
    if args.print_shfileop_buffer:
        buf = shfileop_from_buffer(args.print_shfileop_buffer)
        print(
            json.dumps(
                {
                    "path_chars": len(os.path.abspath(args.print_shfileop_buffer)),
                    "buffer_wchars": len(buf),
                }
            )
        )
        return 0
    if not args.analysis:
        print("analysis JSON is required", file=sys.stderr)
        return 2
    try:
        src = require_absolute(args.analysis, "analysis")
        data = load_analysis(src)
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    trash_allow, open_allow, rejected = load_allowlists(data)
    if args.check_allowlist:
        payload = check_allowlist_payload(data)
        print(json.dumps(payload, ensure_ascii=False))
        return 0 if payload["ok"] else 2
    if rejected:
        for path in rejected:
            print(f"green trash_paths rejected: {path}", file=sys.stderr)
        return 2
    if args.stub_actions:
        STUB_ACTIONS = require_absolute(args.stub_actions, "--stub-actions")
        STUB_ACTIONS.parent.mkdir(parents=True, exist_ok=True)
        STUB_ACTIONS.write_text("", encoding="utf-8", newline="\n")
    DATA = data
    TPL = TEMPLATE.read_text(encoding="utf-8")
    TRASH_ALLOW = trash_allow
    OPEN_ALLOW = open_allow
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    url = "http://127.0.0.1:%d/" % port
    print("REPORT_URL=" + url)
    print("trash %d | open %d | rm disabled" % (len(TRASH_ALLOW), len(OPEN_ALLOW)))
    if args.browser:
        import webbrowser

        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
