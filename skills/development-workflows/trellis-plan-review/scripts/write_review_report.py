#!/usr/bin/env python3
"""Write a Trellis plan-review report under <repo>/.trellis/reviews/.

Destination is derived from the selected root task directory. The helper never enumerates child
reports and never writes planning artifacts or product code.
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

from plan_precheck import (
    ScopeError,
    find_repo_root,
    git_path_state,
    is_reparse_point,
    validate_tree_task_path,
)

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


def refuse_reparse(path: Path, label: str) -> None:
    if is_reparse_point(path):
        raise WriteError(
            f"{label} is a symlink or reparse point; refusing to write: {path}",
            code=1,
        )


def assert_task_in_repo(task_dir: Path, repo_root: Path) -> None:
    tasks_root = repo_root / ".trellis" / "tasks"
    try:
        validate_tree_task_path(task_dir, tasks_root)
    except ScopeError as exc:
        raise WriteError(
            f"task directory is not under {tasks_root.resolve().as_posix()} or is unsafe: {exc}",
            code=1,
        ) from exc


def resolve_repo_root(task_dir: Path, repo_root_arg: str | None) -> Path:
    if repo_root_arg:
        repo_root = Path(os.path.abspath(Path(repo_root_arg).expanduser()))
        if not repo_root.is_dir():
            raise WriteError(f"repo root not found: {repo_root}", code=2)
        if not (repo_root / ".trellis").is_dir():
            raise WriteError(
                f"repo root has no .trellis directory: {repo_root}",
                code=1,
            )
        assert_task_in_repo(task_dir, repo_root)
        return repo_root.resolve()
    found = find_repo_root(task_dir)
    if found is None:
        raise WriteError(
            "no ancestor directory contains .trellis/; pass --repo-root",
            code=2,
        )
    assert_task_in_repo(task_dir, found)
    return found.resolve()


def resolve_destination(task_dir: Path, repo_root: Path) -> Path:
    name = task_dir_name(task_dir)
    trellis_dir = repo_root / ".trellis"
    reviews_dir = trellis_dir / REVIEWS_DIRNAME
    refuse_reparse(trellis_dir, ".trellis")
    if reviews_dir.exists() or is_reparse_point(reviews_dir):
        refuse_reparse(reviews_dir, "reviews directory")
    logical_dest = reviews_dir / f"{name}.md"
    if logical_dest.exists() or is_reparse_point(logical_dest):
        refuse_reparse(logical_dest, "report file")
    dest = logical_dest.resolve()
    reviews_resolved = reviews_dir.resolve()
    try:
        dest.relative_to(reviews_resolved)
    except ValueError as exc:
        raise WriteError(f"destination escapes reviews directory: {dest}", code=1) from exc
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
            f"temporary report sibling already exists; refusing to follow or replace it: {tmp}",
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
    parser = argparse.ArgumentParser(
        description="Write one Trellis plan-review scope to .trellis/reviews/<root-task>.md."
    )
    parser.add_argument("task_dir", help="path to the reviewed root .trellis/tasks/<task>/ directory")
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
        task_dir = Path(os.path.abspath(Path(args.task_dir).expanduser()))
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
