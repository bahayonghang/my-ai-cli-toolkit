#!/usr/bin/env python3
"""Atomically write a tickets-review report under <repo>/reports/tickets-review/.

Enforces strict directory confinement, refuses symlinks/reparse points,
checks required report sections and path sanitization (anti-doxxing),
and reports gitignore state without ever modifying .gitignore.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import locale
import os
import re
import sys
from pathlib import Path

from ticket_precheck import configure_stdio, git_path_state, is_reparse_point

SCOPE_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,120}$")
PERSONAL_PATH_RE = re.compile(
    r"(?:[A-Za-z]:[\\/]+Users[\\/]+(?!<user>|example\b)[^\s\"'`<>|\\/]+|"
    r"(?:^|[\s(`'\"])/(?:Users|home)/(?!<user>|example\b)[^\s\"'`<>|/]+)",
    re.MULTILINE,
)
REQUIRED_SECTIONS_ZH = ("审阅范围", "结论", "问题清单", "未能核实", "可靠部分", "盲区")
REQUIRED_SECTIONS_EN = (
    "Review Scope",
    "Verdict",
    "Findings",
    "Unverified",
    "Sound Parts",
    "Blind Spots",
)


class WriteError(Exception):
    """Expected validation or policy failure."""

    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def validate_scope_slug(slug: str) -> str:
    cleaned = slug.strip()
    if not SCOPE_SLUG_RE.fullmatch(cleaned) or ".." in cleaned:
        raise WriteError(f"invalid scope slug: {slug!r}", code=1)
    return cleaned


def refuse_reparse(path: Path, label: str) -> None:
    if is_reparse_point(path):
        raise WriteError(
            f"{label} is a symlink or reparse point; refusing to write: {path.name}",
            code=1,
        )


def resolve_destination(repo_root: Path, scope_slug: str) -> Path:
    slug = validate_scope_slug(scope_slug)
    reports_root = repo_root / "reports"
    target_dir = reports_root / "tickets-review"
    if reports_root.exists() or is_reparse_point(reports_root):
        refuse_reparse(reports_root, "reports directory")
    if target_dir.exists() or is_reparse_point(target_dir):
        refuse_reparse(target_dir, "reports/tickets-review directory")
    logical_dest = target_dir / f"{slug}.md"
    if logical_dest.exists() or is_reparse_point(logical_dest):
        refuse_reparse(logical_dest, "report file")

    resolved_root = repo_root.resolve()
    resolved_dir = (resolved_root / "reports" / "tickets-review").resolve()
    dest = (resolved_dir / f"{slug}.md").resolve()
    try:
        dest.relative_to(resolved_dir)
    except ValueError as exc:
        raise WriteError("destination escapes reports/tickets-review/", code=1) from exc
    return dest


def read_body(input_path: str | None) -> str:
    if input_path and input_path != "-":
        path = Path(input_path).expanduser()
        if not path.is_file():
            raise WriteError(f"input file not found: {input_path}", code=2)
        text = path.read_text(encoding="utf-8-sig")
    else:
        raw = sys.stdin.buffer.read()
        try:
            text = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            fallback = sys.stdin.encoding or locale.getpreferredencoding(False)
            text = raw.decode(fallback, errors="replace")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if not text.strip():
        raise WriteError("report body is empty", code=1)
    if not text.endswith("\n"):
        text += "\n"
    return text


def validate_report_content(text: str) -> None:
    if not text.startswith("---\n"):
        raise WriteError("report must begin with YAML frontmatter ('---')", code=1)
    lines = text.splitlines()
    try:
        fm_end = lines[1:].index("---") + 1
    except ValueError as exc:
        raise WriteError("report YAML frontmatter is not closed with '---'", code=1) from exc

    fm_block = "\n".join(lines[1:fm_end])
    if "skill: tickets-review" not in fm_block:
        raise WriteError("frontmatter must include 'skill: tickets-review'", code=1)

    headings = {
        line[3:].strip() for line in lines[fm_end + 1 :] if line.startswith("## ")
    }
    zh_missing = [h for h in REQUIRED_SECTIONS_ZH if h not in headings]
    en_missing = [h for h in REQUIRED_SECTIONS_EN if h not in headings]
    if zh_missing and en_missing:
        raise WriteError(
            f"report missing required sections (zh missing: {zh_missing}; en missing: {en_missing})",
            code=1,
        )

    for idx, line in enumerate(lines, start=1):
        if PERSONAL_PATH_RE.search(line):
            raise WriteError(
                f"line {idx} leaks a personal absolute path; use repo-relative paths only",
                code=1,
            )


def atomic_write(dest: Path, text: str) -> bytes:
    dest.parent.mkdir(parents=True, exist_ok=True)
    data = text.encode("utf-8")
    tmp = dest.with_name(dest.name + ".tmp")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_BINARY", 0)
    fd: int | None = None
    owns_tmp = False
    try:
        fd = os.open(tmp, flags, 0o600)
        owns_tmp = True
        with os.fdopen(fd, "wb") as stream:
            fd = None
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, dest)
        owns_tmp = False
    except FileExistsError as exc:
        raise WriteError(
            f"temporary report sibling already exists; refusing to overwrite: {tmp.name}",
            code=1,
        ) from exc
    except OSError as exc:
        raise WriteError(f"failed to write report: {exc}", code=1) from exc
    finally:
        if fd is not None:
            os.close(fd)
        if owns_tmp:
            try:
                tmp.unlink(missing_ok=True)
            except OSError:
                pass
    return data


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = argparse.ArgumentParser(
        description="Atomically write a tickets-review Markdown report under reports/tickets-review/."
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Reviewed repository root directory (default: current directory).",
    )
    parser.add_argument(
        "--scope-slug",
        required=True,
        help="Safe report basename slug (e.g. github-spec-63, github-open-all, local-auth).",
    )
    parser.add_argument(
        "--input",
        help="UTF-8 Markdown file to write; pass '-' or omit to read stdin.",
    )
    parser.add_argument(
        "--skip-content-check",
        action="store_true",
        help="Skip section/frontmatter content check (testing only).",
    )
    args = parser.parse_args(argv)

    repo_root = Path(args.repo_root).expanduser().resolve()
    if not repo_root.is_dir():
        print(f"ERROR: repo root not found: {args.repo_root}", file=sys.stderr)
        return 2

    try:
        dest = resolve_destination(repo_root, args.scope_slug)
        body = read_body(args.input)
        if not args.skip_content_check:
            validate_report_content(body)
        data = atomic_write(dest, body)
    except WriteError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return exc.code

    rel_dest = dest.relative_to(repo_root).as_posix()
    state = git_path_state(repo_root, rel_dest)
    payload = {
        "rel_path": rel_dest,
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "git_state": state,
    }
    print(json.dumps(payload, ensure_ascii=False))
    if state == "untracked":
        print(
            f"NOTE: {rel_dest} is neither gitignored nor tracked. "
            "Leave .gitignore unchanged; decide separately whether to ignore or commit reports/tickets-review/.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
