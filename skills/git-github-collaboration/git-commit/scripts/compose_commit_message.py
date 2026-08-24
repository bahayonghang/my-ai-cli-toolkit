#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

TYPE_PATTERN = re.compile(r"^[a-z][a-z0-9-]*$")
AI_TAG_PREFIX = re.compile(r"^\[AI\]\s*", re.IGNORECASE)
# Host/client lines GitHub renders as extra avatars or "Committed via …".
ATTRIBUTION_LINE = re.compile(
    r"(?i)("
    r"^co-authored-by\s*:"
    r"|^committed[\s-]via\b"
    r"|^made-with\s*:"
    r"|generated with\s+(claude|cursor|copilot|codex|devin|grok)"
    r")"
)

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
    parser.add_argument(
        "--type",
        required=True,
        help=(
            "Commit type. Built-in types ("
            + ", ".join(sorted(TYPE_EMOJIS))
            + ") carry an emoji automatically; repo-specific custom types are accepted too."
        ),
    )
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
        "--emoji",
        default=None,
        help=(
            "Explicit header emoji. Overrides the built-in type mapping; required when a "
            "custom (non-built-in) type should carry an emoji."
        ),
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
    parser.add_argument(
        "--max-header-width",
        type=int,
        default=72,
        help=(
            "Maximum header width in display columns (CJK and emoji count as 2). Pass the "
            "target repo's own header length limit when its commitlint config differs from 72."
        ),
    )
    parser.add_argument("--output", default=None, help="Write the composed message to a file instead of stdout.")
    args = parser.parse_args()
    if not TYPE_PATTERN.fullmatch(args.type):
        parser.error(
            f"--type '{args.type}' must match ^[a-z][a-z0-9-]*$ (lowercase letters, digits, hyphens)."
        )
    if args.max_header_width < 20:
        parser.error("--max-header-width must be at least 20 columns.")
    return args


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
        # Priority: --no-emoji > --emoji > built-in mapping > (unknown type) none.
        emoji = args.emoji or TYPE_EMOJIS.get(args.type)
        if emoji:
            header_parts.append(emoji)
        elif args.type not in TYPE_EMOJIS:
            print(
                f"Unknown type '{args.type}' has no built-in emoji; pass --emoji or --no-emoji "
                "to silence this note.",
                file=sys.stderr,
            )
    header_parts.append(summary)
    header += " ".join(header_parts)

    header_width = display_width(header)
    if header_width > args.max_header_width:
        print(
            f"Commit header is {header_width} display columns wide; limit is "
            f"{args.max_header_width}. Tighten the summary, drop the scope, or pass "
            "--max-header-width if the repo allows longer headers.",
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

    blocked = find_prohibited_attribution_line(
        [summary, args.why or "", *body_lines, *trailer_lines]
    )
    if blocked:
        print(
            "Prohibited host/client attribution line: "
            f"{blocked!r}. Omit Co-authored-by, Made-with, and "
            "'Committed via' text. Use local git commit -F without --trailer.",
            file=sys.stderr,
        )
        return 4

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
        # Pin newline="\n" so Windows text mode does not rewrite the message as CRLF;
        # the file must carry the same bytes the stdout path emits.
        output_path.write_text(message, encoding="utf-8", newline="\n")
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
    while True:
        stripped = AI_TAG_PREFIX.sub("", summary, count=1).strip()
        if stripped == summary:
            break
        summary = stripped
    while summary.endswith(("。", ".", "!", "！")):
        summary = summary[:-1].rstrip()
    return summary


def find_prohibited_attribution_line(lines: list[str]) -> str | None:
    for line in lines:
        text = line.strip()
        if text and ATTRIBUTION_LINE.search(text):
            return text
    return None


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
