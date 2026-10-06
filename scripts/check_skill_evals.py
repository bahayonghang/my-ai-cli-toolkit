#!/usr/bin/env python3
"""Schema-check first-party skill evals. Does not call a model or the network."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

SKIP_PARTS = {
    ".git",
    "node_modules",
    "__pycache__",
    "ref",
    ".agents",
    ".claude",
    ".trellis",
    "scaffolds",
}
EVAL_FIELDS = ("id", "prompt", "expected_output", "files", "assertions")


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")


def skip_dir(path: Path) -> bool:
    name = path.name
    if name.startswith(".") or name in SKIP_PARTS:
        return True
    if path.is_symlink() or os.path.isjunction(path):
        return True
    return False


def iter_skill_dirs(skills_root: Path) -> list[Path]:
    found: list[Path] = []
    if not skills_root.is_dir():
        return found
    for dirpath, dirnames, filenames in os.walk(skills_root, followlinks=False):
        current = Path(dirpath)
        dirnames[:] = [name for name in dirnames if not skip_dir(current / name)]
        if "SKILL.md" not in filenames:
            continue
        relative = current.relative_to(skills_root)
        if len(relative.parts) != 2:
            continue
        if any(part in SKIP_PARTS or part.startswith(".") for part in relative.parts):
            continue
        found.append(current)
    found.sort(key=lambda path: path.relative_to(skills_root).as_posix())
    return found


def display_path(skills_root: Path, path: Path) -> str:
    base = skills_root.parent
    try:
        return path.relative_to(base).as_posix()
    except ValueError:
        return path.as_posix()


def check_eval_item(rel: str, index: int, item: object) -> list[str]:
    prefix = f"{rel}: evals[{index}]"
    if not isinstance(item, dict):
        return [f"{prefix}: expected object"]
    errors: list[str] = []
    for field in EVAL_FIELDS:
        if field not in item or item[field] is None:
            errors.append(f"{prefix}: missing field {field}")
    assertions = item.get("assertions") if isinstance(item, dict) else None
    if "assertions" in item and (
        not isinstance(assertions, list)
        or not assertions
        or not all(isinstance(entry, str) and entry.strip() for entry in assertions)
    ):
        errors.append(f"{prefix}: field assertions must be a non-empty array of strings")
    return errors


def check_skill_dir(skills_root: Path, skill_dir: Path) -> list[str]:
    eval_path = skill_dir / "evals" / "evals.json"
    rel = display_path(skills_root, eval_path)
    if not eval_path.is_file():
        return [f"{rel}: missing file"]
    try:
        payload = json.loads(eval_path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        return [f"{rel}: invalid JSON ({exc.msg})"]
    except OSError as exc:
        return [f"{rel}: could not read file ({exc})"]
    if not isinstance(payload, dict):
        return [f"{rel}: expected object"]
    errors: list[str] = []
    if "skill_name" not in payload or payload["skill_name"] is None:
        errors.append(f"{rel}: missing field skill_name")
    elif payload["skill_name"] != skill_dir.name:
        errors.append(f"{rel}: field skill_name must equal {skill_dir.name}")
    if "evals" not in payload or payload["evals"] is None:
        errors.append(f"{rel}: missing field evals")
        return errors
    evals = payload["evals"]
    if not isinstance(evals, list):
        errors.append(f"{rel}: field evals must be an array")
        return errors
    for index, item in enumerate(evals):
        errors.extend(check_eval_item(rel, index, item))
    return errors


def collect_errors(skills_root: Path) -> tuple[list[str], int]:
    skill_dirs = iter_skill_dirs(skills_root)
    errors: list[str] = []
    for skill_dir in skill_dirs:
        errors.extend(check_skill_dir(skills_root, skill_dir))
    return errors, len(skill_dirs)


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    args = list(sys.argv[1:] if argv is None else argv)
    if args:
        skills_root = Path(args[0])
    else:
        skills_root = Path(__file__).resolve().parents[1] / "skills"
    if not skills_root.is_dir():
        print(f"{skills_root.as_posix()}: skills directory not found", file=sys.stderr)
        return 1
    errors, count = collect_errors(skills_root)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    print(f"Checked {count} skill eval files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
