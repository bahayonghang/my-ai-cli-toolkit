#!/usr/bin/env python3
"""Write a skill-session-review report under <repo>/reports/skill-session-review/."""

from __future__ import annotations

import argparse
import hashlib
import json
import locale
import os
import re
import sys
from pathlib import Path

NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
REPORT_DIR = Path("reports") / "skill-session-review"
IGNORE_LINE = "reports/skill-session-review/"
REDACT_RE = re.compile(r"(sk-[A-Za-z0-9_-]+|ghp_[A-Za-z0-9]+|Bearer\s+\S+)")
FILE_ATTRIBUTE_REPARSE_POINT = 0x400


class WriteError(Exception):
    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def is_reparse(path: Path) -> bool:
    if path.is_symlink():
        return True
    try:
        st = path.lstat()
    except OSError:
        return False
    attrs = getattr(st, "st_file_attributes", 0)
    return bool(attrs & FILE_ATTRIBUTE_REPARSE_POINT)


def refuse_reparse(path: Path, label: str) -> None:
    if is_reparse(path):
        raise WriteError(f"{label} is a symlink or reparse point: {path}", code=1)


def skill_basename(name: str) -> str:
    if not NAME_RE.fullmatch(name):
        raise WriteError(f"skill name is not a safe report basename: {name!r}", code=1)
    return name


def resolve_repo_root(repo_root_arg: str) -> Path:
    repo_root = Path(repo_root_arg).expanduser().resolve()
    if not repo_root.is_dir():
        raise WriteError(f"repo root not found: {repo_root}", code=2)
    refuse_reparse(repo_root, "repo root")
    return repo_root


def resolve_destination(repo_root: Path, name: str) -> Path:
    reports = repo_root / "reports"
    dest_dir = repo_root / REPORT_DIR
    if reports.exists():
        refuse_reparse(reports, "reports directory")
    if dest_dir.exists():
        refuse_reparse(dest_dir, "skill-session-review directory")
    dest = (dest_dir / f"{name}.md").resolve()
    dest_dir_resolved = dest_dir.resolve()
    try:
        dest.relative_to(dest_dir_resolved)
    except ValueError as exc:
        raise WriteError(f"destination escapes report directory: {dest}", code=1) from exc
    if dest.exists():
        refuse_reparse(dest, "report file")
    return dest


def gitignore_has_exact_line(text: str) -> bool:
    for raw in text.splitlines():
        if raw.strip() == IGNORE_LINE:
            return True
    return False


def ensure_gitignore(repo_root: Path) -> bool:
    path = repo_root / ".gitignore"
    if path.exists():
        refuse_reparse(path, ".gitignore")
        existing = path.read_text(encoding="utf-8")
    else:
        existing = ""
    if gitignore_has_exact_line(existing):
        return False
    prefix = "" if not existing or existing.endswith("\n") else "\n"
    path.write_text(existing + prefix + IGNORE_LINE + "\n", encoding="utf-8", newline="\n")
    return True


def read_body(input_path: str | None) -> str:
    if input_path:
        path = Path(input_path).expanduser()
        if not path.is_file():
            raise WriteError(f"input file not found: {path}", code=2)
        text = path.read_text(encoding="utf-8-sig")
    else:
        raw = sys.stdin.buffer.read()
        try:
            text = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            fallback = sys.stdin.encoding or locale.getpreferredencoding(False)
            text = raw.decode(fallback, errors="replace")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = REDACT_RE.sub("[REDACTED]", text)
    if not text.strip():
        raise WriteError("report body is empty", code=1)
    if not text.endswith("\n"):
        text += "\n"
    return text


def atomic_write(dest: Path, text: str) -> bytes:
    dest.parent.mkdir(parents=True, exist_ok=True)
    data = text.encode("utf-8")
    tmp = dest.with_name(dest.name + ".tmp")
    try:
        tmp.write_bytes(data)
        os.replace(tmp, dest)
    except OSError as exc:
        tmp.unlink(missing_ok=True)
        raise WriteError(f"failed to write report: {exc}", code=1) from exc
    finally:
        tmp.unlink(missing_ok=True)
    return data


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Write a skill-session-review report under reports/skill-session-review/."
    )
    parser.add_argument("--repo-root", required=True, help="absolute repository root")
    parser.add_argument("--skill-name", required=True, help="report basename")
    parser.add_argument("--skill-path", help="unused by the writer; accepted for caller symmetry")
    parser.add_argument("--input", help="UTF-8 Markdown file; omit to read stdin")
    args = parser.parse_args(argv)

    try:
        repo_root = resolve_repo_root(args.repo_root)
        name = skill_basename(args.skill_name)
        dest = resolve_destination(repo_root, name)
        body = read_body(args.input)
        gitignore_wrote = ensure_gitignore(repo_root)
        data = atomic_write(dest, body)
    except WriteError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return exc.code

    payload = {
        "path": dest.as_posix(),
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitignore_wrote": gitignore_wrote,
    }
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
