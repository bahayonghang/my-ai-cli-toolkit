#!/usr/bin/env python3
"""Schema-check first-party skill evals. Does not call a model or the network."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

_SCRIPTS_DIR = str(Path(__file__).resolve().parent)
if _SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, _SCRIPTS_DIR)

from _common import (  # noqa: E402
    REPO_ROOT,
    SKIP_PARTS,
    configure_stdio,
    display_path as _display_path,
    skip_dir,
)

EVAL_FIELDS = ("id", "prompt", "expected_output", "files", "assertions")


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
    return _display_path(path, base=skills_root.parent)


def check_eval_item(rel: str, index: int, item: object) -> list[str]:
    prefix = f"{rel}: evals[{index}]"
    if not isinstance(item, dict):
        return [f"{prefix}: expected object"]
    errors: list[str] = []
    for field in EVAL_FIELDS:
        if field not in item or item[field] is None:
            errors.append(f"{prefix}: missing field {field}")
    assertions = item.get("assertions")
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
    if not evals:
        errors.append(f"{rel}: field evals must be a non-empty array")
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


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Schema-check first-party skill evals. Does not call a model or the network."
    )
    parser.add_argument(
        "skills_root",
        nargs="?",
        default=None,
        help="Skills root directory to scan (default: <repo>/skills).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    args = parse_args(list(sys.argv[1:] if argv is None else argv))
    skills_root = Path(args.skills_root) if args.skills_root else REPO_ROOT / "skills"
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
