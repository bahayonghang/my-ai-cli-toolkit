#!/usr/bin/env python3
"""List, search, show, and apply design-atlas catalog entries.

Commands:
  list   [--kind brand|style|scene] [--category ID] [--format text|json]
  search QUERY [--kind brand|style|scene] [--format text|json]
  show   ID                      ID is kind:slug, or a slug when it is unique
  apply  ID [--root DIR] [--force]

apply writes DIR/DESIGN.md (UTF-8, LF). An existing design.md in any letter
case stops the command with exit 3 unless --force is given; --force first
renames the old file to <name>.bak-YYYYMMDD-HHMMSS.

Exit codes: 0 success, 1 search found nothing, 2 bad input, 3 refused overwrite.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "assets" / "catalog"


def load_index() -> dict:
    return json.loads((CATALOG / "index.json").read_text(encoding="utf-8"))


def enrich(index: dict) -> list[dict]:
    categories = {c["id"]: c for c in index["categories"]}
    items = []
    for entry in index["entries"]:
        category = categories[entry["category"]]
        items.append(
            {**entry, "category_en": category["en"], "category_zh": category["zh"]}
        )
    return items


def print_grouped(index: dict, items: list[dict]) -> None:
    brands = sum(item["kind"] == "brand" for item in items)
    styles = sum(item["kind"] == "style" for item in items)
    scenes = sum(item["kind"] == "scene" for item in items)
    print(
        f"# design-atlas catalog: {len(items)} entries ({brands} brand, {styles} style, {scenes} scene)"
    )
    for category in sorted(index["categories"], key=lambda c: c["order"]):
        group = [item for item in items if item["category"] == category["id"]]
        if not group:
            continue
        print(
            f"\n## {category['zh']} / {category['en']} ({len(group)}) [{category['id']}]\n"
        )
        for item in group:
            print(f"- {item['id']} — {item['name']} — {item['description']}")


def emit(index: dict, items: list[dict], fmt: str) -> None:
    if fmt == "json":
        print(json.dumps(items, ensure_ascii=False, indent=2))
    else:
        print_grouped(index, items)


def resolve(entries: list[dict], wanted: str) -> dict:
    by_id = {entry["id"]: entry for entry in entries}
    if wanted in by_id:
        return by_id[wanted]
    matches = [entry for entry in entries if entry["slug"] == wanted]
    if len(matches) == 1:
        return matches[0]
    if matches:
        names = ", ".join(entry["id"] for entry in matches)
        raise LookupError(f"'{wanted}' is ambiguous: {names}")
    raise LookupError(f"unknown entry '{wanted}'; run the list or search command")


def provenance(index: dict, entry: dict) -> str:
    if entry["source"] == "first-party":
        return (
            f"<!-- design-atlas: entry={entry['id']}; source=first-party; license=MIT -->"
        )
    source = index["sources"][entry["source"]]
    return (
        f"<!-- design-atlas: entry={entry['id']}; source={source['repo']}@{source['commit'][:7]}; "
        f"license={source['license']} -->"
    )


def with_provenance(text: str, comment: str) -> str:
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            cut = end + len("\n---\n")
            return f"{text[:cut]}{comment}\n{text[cut:]}"
    return f"{comment}\n{text}"


def apply(index: dict, entry: dict, root: Path, force: bool) -> int:
    if not root.is_dir():
        print(f"error: --root is not a directory: {root}", file=sys.stderr)
        return 2
    existing = [
        path
        for path in root.iterdir()
        if path.is_file() and path.name.lower() == "design.md"
    ]
    if existing and not force:
        print(
            f"error: {existing[0]} already exists. Implement from it, or rerun with --force "
            "to back it up and replace it.",
            file=sys.stderr,
        )
        return 3
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    for path in existing:
        backup = path.with_name(f"{path.name}.bak-{stamp}")
        path.rename(backup)
        print(f"backup: {backup}")
    text = (CATALOG / entry["path"]).read_text(encoding="utf-8")
    target = root / "DESIGN.md"
    target.write_text(
        with_provenance(text, provenance(index, entry)), encoding="utf-8", newline="\n"
    )
    print(f"wrote: {target} ({entry['id']})")
    return 0


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    commands = parser.add_subparsers(dest="command", required=True)

    list_cmd = commands.add_parser("list", help="list entries grouped by category")
    list_cmd.add_argument("--kind", choices=("brand", "style", "scene"))
    list_cmd.add_argument("--category")
    list_cmd.add_argument("--format", choices=("text", "json"), default="text")

    search_cmd = commands.add_parser(
        "search", help="search id, name, description, and category names"
    )
    search_cmd.add_argument("query")
    search_cmd.add_argument("--kind", choices=("brand", "style", "scene"))
    search_cmd.add_argument("--format", choices=("text", "json"), default="text")

    show_cmd = commands.add_parser("show", help="print one entry")
    show_cmd.add_argument("id")

    apply_cmd = commands.add_parser("apply", help="write DESIGN.md into a project root")
    apply_cmd.add_argument("id")
    apply_cmd.add_argument("--root", type=Path, default=Path.cwd())
    apply_cmd.add_argument("--force", action="store_true")

    args = parser.parse_args(argv)
    index = load_index()
    items = enrich(index)

    if args.command == "list":
        if args.category and args.category not in {
            c["id"] for c in index["categories"]
        }:
            known = ", ".join(c["id"] for c in index["categories"])
            print(
                f"error: unknown category '{args.category}'. Known: {known}",
                file=sys.stderr,
            )
            return 2
        selected = [
            item
            for item in items
            if (not args.kind or item["kind"] == args.kind)
            and (not args.category or item["category"] == args.category)
        ]
        emit(index, selected, args.format)
        return 0

    if args.command == "search":
        query = args.query.casefold()
        selected = [
            item
            for item in items
            if (not args.kind or item["kind"] == args.kind)
            and any(
                query in str(item[key]).casefold()
                for key in ("id", "name", "description", "category_en", "category_zh")
            )
        ]
        if not selected:
            print(
                f"no entries match '{args.query}'; try a broader word or run list",
                file=sys.stderr,
            )
            return 1
        emit(index, selected, args.format)
        return 0

    try:
        entry = resolve(items, args.id)
    except LookupError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    if args.command == "show":
        sys.stdout.write((CATALOG / entry["path"]).read_text(encoding="utf-8"))
        return 0
    return apply(index, entry, args.root, args.force)


if __name__ == "__main__":
    sys.exit(main())
