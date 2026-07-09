#!/usr/bin/env python3
"""Read or write the user's default academic-figure library and journal style."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


VALID_VALUES = {
    "library": ("matplotlib", "plotly"),
    "journal_style": ("ieee", "elsevier", "nature", "springer", "chinese-thesis"),
}
VALID_KEYS = tuple(VALID_VALUES)


def config_path() -> Path:
    override = os.environ.get("ACADEMIC_FIGURE_CONFIG")
    if override:
        return Path(override).expanduser()
    return Path("~/.config/my-claude-skills/academic-figure.json").expanduser()


def read_config(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(
            f"Invalid academic-figure config JSON at {path}: {exc}"
        ) from exc
    if not isinstance(data, dict):
        raise SystemExit(f"Invalid academic-figure config at {path}: expected object")
    return data


def write_config(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def get_value(path: Path, key: str) -> int:
    value = read_config(path).get(key)
    if value is not None:
        print(value)
    return 0


def set_value(path: Path, key: str, value: str) -> int:
    allowed = VALID_VALUES[key]
    if value not in allowed:
        raise SystemExit(f"{key} must be one of: {', '.join(allowed)}")
    data = read_config(path)
    data[key] = value
    write_config(path, data)
    print(value)
    return 0


def clear_value(path: Path, key: str | None) -> int:
    data = read_config(path)
    if key is None:
        data = {}
    else:
        data.pop(key, None)
    write_config(path, data)
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    get_parser = subparsers.add_parser(
        "get", help="Print the saved value for a key; empty if unset."
    )
    get_parser.add_argument("key", choices=VALID_KEYS)

    set_parser = subparsers.add_parser("set", help="Save a value for a key.")
    set_parser.add_argument("key", choices=VALID_KEYS)
    set_parser.add_argument("value")

    clear_parser = subparsers.add_parser(
        "clear", help="Remove one saved key, or all keys if omitted."
    )
    clear_parser.add_argument("key", nargs="?", choices=VALID_KEYS)

    subparsers.add_parser("path", help="Print the config path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    path = config_path()
    if args.command == "get":
        return get_value(path, args.key)
    if args.command == "set":
        return set_value(path, args.key, args.value)
    if args.command == "clear":
        return clear_value(path, args.key)
    if args.command == "path":
        print(path)
        return 0
    raise AssertionError(args.command)


if __name__ == "__main__":
    raise SystemExit(main())
