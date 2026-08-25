#!/usr/bin/env python3
"""Write a Trellis plan-review report under <repo>/.trellis/reviews/.

Destination is derived from the task directory. The helper never writes
planning artifacts or product code.
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

from plan_precheck import find_repo_root, git_path_state

TASK_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
REVIEWS_DIRNAME = "reviews"


class WriteError(Exception):
    """Expected validation or policy failure."""

    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def task_dir_name(task_dir: Path) -> str:
    name = task_dir.name
    if not TASK_NAME_RE.fullmatch(name):
        raise WriteError(
            f"task directory name is not a safe report basename: {name!r}",
            code=1,
        )
    return name


def refuse_symlink(path: Path, label: str) -> None:
    if path.is_symlink():
        raise WriteError(f"{label} is a symlink; refusing to write: {path}", code=1)


def assert_task_in_repo(task_dir: Path, repo_root: Path) -> None:
    tasks_root = (repo_root / ".trellis" / "tasks").resolve()
    try:
        task_dir.resolve().relative_to(tasks_root)
    except ValueError as exc:
        raise WriteError(
            f"task directory is not under {tasks_root.as_posix()}: {task_dir}",
            code=1,
        ) from exc


def resolve_repo_root(task_dir: Path, repo_root_arg: str | None) -> Path:
    if repo_root_arg:
        repo_root = Path(repo_root_arg).expanduser().resolve()
        if not repo_root.is_dir():
            raise WriteError(f"repo root not found: {repo_root}", code=2)
        if not (repo_root / ".trellis").is_dir():
            raise WriteError(
                f"repo root has no .trellis directory: {repo_root}",
                code=1,
            )
        assert_task_in_repo(task_dir, repo_root)
        return repo_root
    found = find_repo_root(task_dir)
    if found is None:
        raise WriteError(
            "no ancestor directory contains .trellis/; pass --repo-root",
            code=2,
        )
    assert_task_in_repo(task_dir, found)
    return found


def resolve_destination(task_dir: Path, repo_root: Path) -> Path:
    name = task_dir_name(task_dir)
    trellis_dir = repo_root / ".trellis"
    reviews_dir = trellis_dir / REVIEWS_DIRNAME
    refuse_symlink(trellis_dir, ".trellis")
    if reviews_dir.exists():
        refuse_symlink(reviews_dir, "reviews directory")
    dest = (reviews_dir / f"{name}.md").resolve()
    reviews_resolved = reviews_dir.resolve()
    try:
        dest.relative_to(reviews_resolved)
    except ValueError as exc:
        raise WriteError(f"destination escapes reviews directory: {dest}", code=1) from exc
    if dest.exists():
        refuse_symlink(dest, "report file")
    return dest


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
        description="Write a Trellis plan-review report to .trellis/reviews/<task>.md."
    )
    parser.add_argument("task_dir", help="path to the reviewed .trellis/tasks/<task>/ directory")
    parser.add_argument(
        "--repo-root",
        help="repository root; defaults to the nearest ancestor with .trellis/",
    )
    parser.add_argument(
        "--input",
        help="UTF-8 Markdown file to write; omit to read stdin",
    )
    args = parser.parse_args(argv)

    try:
        task_dir = Path(args.task_dir).expanduser().resolve()
        if not task_dir.is_dir():
            raise WriteError(f"task directory not found: {task_dir}", code=2)
        repo_root = resolve_repo_root(task_dir, args.repo_root)
        dest = resolve_destination(task_dir, repo_root)
        body = read_body(args.input)
        data = atomic_write(dest, body)
    except WriteError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return exc.code

    payload = {
        "path": dest.as_posix(),
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
    }
    print(json.dumps(payload, ensure_ascii=False))
    rel_dest = dest.relative_to(repo_root).as_posix()
    if git_path_state(repo_root, rel_dest) == "untracked":
        print(
            f"note: {rel_dest} is untracked and not ignored (will appear in git status); "
            "add .trellis/reviews/ to .trellis/.gitignore or commit the report (the project decides)",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
