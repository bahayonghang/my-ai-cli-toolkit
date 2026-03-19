#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

TYPE_EMOJIS = {
    "feat": "✨",
    "fix": "🐛",
    "docs": "📝",
    "style": "💄",
    "refactor": "♻️",
    "perf": "⚡",
    "test": "✅",
    "build": "📦",
    "ci": "👷",
    "chore": "🔧",
    "revert": "⏪",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compose a Chinese Conventional Commit message with emoji.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--type", required=True, choices=sorted(TYPE_EMOJIS.keys()))
    parser.add_argument("--scope", default=None, help="Optional commit scope.")
    parser.add_argument("--summary", required=True, help="Short Chinese summary without trailing punctuation.")
    parser.add_argument(
        "--body-line",
        action="append",
        default=[],
        help="Body line. May be supplied multiple times.",
    )
    parser.add_argument("--breaking", default=None, help="Optional BREAKING CHANGE message.")
    parser.add_argument(
        "--closes",
        action="append",
        default=[],
        help="Issue number or reference to close. May be supplied multiple times.",
    )
    parser.add_argument("--output", default=None, help="Write the composed message to a file instead of stdout.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    summary = normalize_summary(args.summary)
    if len(summary) > 50:
        print("Summary must be 50 characters or fewer.", file=sys.stderr)
        return 1

    header = f"{args.type}"
    if args.scope:
        header += f"({args.scope})"
    header += f": {TYPE_EMOJIS[args.type]} {summary}"

    lines = [header]
    body_lines = [line.strip() for line in args.body_line if line.strip()]
    trailer_lines: list[str] = []

    if args.breaking:
        trailer_lines.append(f"BREAKING CHANGE: {args.breaking.strip()}")
    for close_ref in args.closes:
        close_ref = close_ref.strip()
        if close_ref:
            if close_ref.startswith("#"):
                trailer_lines.append(f"Closes {close_ref}")
            else:
                trailer_lines.append(f"Closes #{close_ref}")

    if body_lines or trailer_lines:
        lines.append("")
    lines.extend(body_lines)
    if body_lines and trailer_lines:
        lines.append("")
    lines.extend(trailer_lines)

    message = "\n".join(lines).rstrip() + "\n"
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(message, encoding="utf-8")
    else:
        sys.stdout.buffer.write(message.encode("utf-8"))
    return 0


def normalize_summary(summary: str) -> str:
    summary = summary.strip()
    if summary.endswith(("。", ".", "!", "！")):
        summary = summary[:-1].rstrip()
    return summary


if __name__ == "__main__":
    raise SystemExit(main())
