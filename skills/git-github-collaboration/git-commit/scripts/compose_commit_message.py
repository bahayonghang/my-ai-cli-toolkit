#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
import unicodedata
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

WHY_REQUIRED_TYPES = {"feat", "fix", "refactor", "perf"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compose a Conventional Commit message with optional agent-aware metadata.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--type", required=True, choices=sorted(TYPE_EMOJIS.keys()))
    parser.add_argument("--scope", default=None, help="Optional commit scope.")
    parser.add_argument("--summary", required=True, help="Short summary without trailing punctuation.")
    parser.add_argument(
        "--body-line",
        action="append",
        default=[],
        help="Body line. May be supplied multiple times.",
    )
    parser.add_argument(
        "--why",
        default=None,
        help="Motivation for the change. Rendered as the first body line as `Why: <text>`.",
    )
    parser.add_argument("--breaking", default=None, help="Optional BREAKING CHANGE message.")
    parser.add_argument(
        "--closes",
        action="append",
        default=[],
        help="Issue number or reference to close. May be supplied multiple times.",
    )
    parser.add_argument(
        "--refs",
        action="append",
        default=[],
        help="Issue number or reference to mention without closing. May be supplied multiple times.",
    )
    parser.add_argument(
        "--footer-line",
        action="append",
        default=[],
        help="Raw footer/trailer line. May be supplied multiple times.",
    )
    parser.add_argument(
        "--confidence",
        default=None,
        help="Agent self-assessed confidence, rendered as `Confidence:` trailer (e.g. high/medium/low).",
    )
    parser.add_argument(
        "--scope-risk",
        default=None,
        help="Blast-radius estimate, rendered as `Scope-risk:` trailer (e.g. narrow/moderate/broad).",
    )
    parser.add_argument(
        "--tested",
        default=None,
        help="How the change was verified, rendered as `Tested:` trailer (e.g. `just ci`).",
    )
    parser.add_argument(
        "--breaking-header",
        action="store_true",
        help="Append ! to the commit header before the colon.",
    )
    parser.add_argument(
        "--no-emoji",
        action="store_true",
        help="Omit the emoji prefix from the header.",
    )
    parser.add_argument(
        "--ai",
        action="store_true",
        help="Insert the [AI] tag right after the header colon (before emoji).",
    )
    parser.add_argument(
        "--agent-task",
        default=None,
        help="Agent task identifier or URL, rendered as `Agent-Task:` trailer.",
    )
    parser.add_argument(
        "--agent-model",
        default=None,
        help="Model identifier, rendered as `Agent-Model:` trailer. Required when --ai is set.",
    )
    parser.add_argument(
        "--agent-prompt-ref",
        default=None,
        help="Optional prompt reference (hash, URL, or short label), rendered as `Agent-Prompt-Ref:` trailer.",
    )
    parser.add_argument(
        "--generated-by-agent",
        action="store_true",
        help="Append the `Generated-By: agent` sentinel trailer for audit grep.",
    )
    parser.add_argument(
        "--require-why",
        action="store_true",
        help="Fail when --why is missing for Why-required types (feat/fix/refactor/perf).",
    )
    parser.add_argument("--output", default=None, help="Write the composed message to a file instead of stdout.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    summary = normalize_summary(args.summary)

    if args.ai and not args.agent_model:
        print("--ai requires --agent-model so the commit declares which model produced it.", file=sys.stderr)
        return 2

    if args.require_why and args.type in WHY_REQUIRED_TYPES and not (args.why and args.why.strip()):
        print(
            f"--require-why is set and type `{args.type}` requires --why explaining the motivation.",
            file=sys.stderr,
        )
        return 3

    header = f"{args.type}"
    if args.scope:
        header += f"({args.scope})"
    if args.breaking_header:
        header += "!"
    header += ": "
    header_parts = []
    if args.ai:
        header_parts.append("[AI]")
    if not args.no_emoji:
        header_parts.append(TYPE_EMOJIS[args.type])
    header_parts.append(summary)
    header += " ".join(header_parts)

    header_width = display_width(header)
    if header_width > 72:
        print(
            f"Commit header is {header_width} display columns wide; keep the subject line within 72 "
            "(≈50 preferred). Tighten the summary or drop the scope.",
            file=sys.stderr,
        )
        return 1

    lines = [header]

    body_lines: list[str] = []
    if args.why and args.why.strip():
        body_lines.append(f"Why: {args.why.strip()}")
    body_lines.extend(line.strip() for line in args.body_line if line.strip())

    trailer_lines: list[str] = []
    if args.breaking:
        trailer_lines.append(f"BREAKING CHANGE: {args.breaking.strip()}")
    trailer_lines.extend(normalize_trailer_lines(args.footer_line))
    for close_ref in args.closes:
        normalized = normalize_issue_ref(close_ref)
        if normalized:
            trailer_lines.append(f"Closes {normalized}")
    for ref in args.refs:
        normalized = normalize_issue_ref(ref)
        if normalized:
            trailer_lines.append(f"Refs {normalized}")
    if args.confidence and args.confidence.strip():
        trailer_lines.append(f"Confidence: {args.confidence.strip()}")
    if args.scope_risk and args.scope_risk.strip():
        trailer_lines.append(f"Scope-risk: {args.scope_risk.strip()}")
    if args.tested and args.tested.strip():
        trailer_lines.append(f"Tested: {args.tested.strip()}")
    if args.agent_task and args.agent_task.strip():
        trailer_lines.append(f"Agent-Task: {args.agent_task.strip()}")
    if args.agent_model and args.agent_model.strip():
        trailer_lines.append(f"Agent-Model: {args.agent_model.strip()}")
    if args.agent_prompt_ref and args.agent_prompt_ref.strip():
        trailer_lines.append(f"Agent-Prompt-Ref: {args.agent_prompt_ref.strip()}")
    if args.generated_by_agent:
        trailer_lines.append("Generated-By: agent")

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


def display_width(text: str) -> int:
    """Approximate terminal columns: CJK/fullwidth and emoji count as 2, combining marks as 0.

    A plain ``len()`` undercounts Chinese subjects (each CJK glyph is one code point but two
    columns), so the old summary-only check let visually-overlong headers through. Measuring the
    whole header here matches what a reviewer actually sees in ``git log``.
    """
    width = 0
    for ch in text:
        if unicodedata.combining(ch):
            continue
        if unicodedata.east_asian_width(ch) in ("W", "F") or ord(ch) >= 0x1F000:
            width += 2
        else:
            width += 1
    return width


def normalize_summary(summary: str) -> str:
    summary = summary.strip()
    while summary.endswith(("。", ".", "!", "！")):
        summary = summary[:-1].rstrip()
    return summary


def normalize_issue_ref(ref: str) -> str | None:
    ref = ref.strip()
    if not ref:
        return None
    if ref.startswith("#"):
        return ref
    if ref.isdigit():
        return f"#{ref}"
    return ref


def normalize_trailer_lines(lines: list[str]) -> list[str]:
    return [line.strip() for line in lines if line.strip()]


if __name__ == "__main__":
    raise SystemExit(main())
