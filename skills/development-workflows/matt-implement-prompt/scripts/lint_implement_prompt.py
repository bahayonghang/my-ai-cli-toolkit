#!/usr/bin/env python3
"""Deterministic linter for fresh-session Matt implementation prompts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

PLACEHOLDER_BRACES_RE = re.compile(r"\{\{[^{}\n]+\}\}")
PLACEHOLDER_KEYWORD_RE = re.compile(r"\b(?:TODO|TBD|FIXME)\b")
ANGLE_PLACEHOLDER_RE = re.compile(
    r"<(?:spec[-_ ]?num|ticket[-_ ]?(?:list|num)|owner|repo|base[-_ ]?branch|integration[-_ ]?branch|"
    r"issue[-_ ]?(?:num|number)|placeholder|feature|branch|path|cmd|command|repo[-_ ]?root)[^>]*>",
    re.IGNORECASE,
)
BACK_REF_PATTERNS = (
    re.compile(r"见上一条消息"),
    re.compile(r"见上方(?:报告|消息|内容|清单)?"),
    re.compile(r"如前所述"),
    re.compile(r"见上面的"),
    re.compile(r"\bsee above\b", re.IGNORECASE),
    re.compile(r"\bsee the previous message\b", re.IGNORECASE),
    re.compile(r"\bsee the report above\b", re.IGNORECASE),
)
PRIVATE_PATH_PATTERNS = (
    re.compile(r"[A-Za-z]:\\Users\\[^\\\s`\"']+"),
    re.compile(r"[A-Za-z]:/Users/[^/\s`\"']+"),
    re.compile(r"/Users/[A-Za-z0-9._-]+/"),
    re.compile(r"/home/[A-Za-z0-9._-]+/"),
)

GITHUB_ISSUE_REF_RE = re.compile(r"#\d+")
GITHUB_FETCH_RE = re.compile(r"\bgh\s+(?:issue\s+view|api)\b", re.IGNORECASE)
LOCAL_SCRATCH_RE = re.compile(r"\.scratch[/\\][^\s`\"']+", re.IGNORECASE)
FRONTIER_RE = re.compile(r"波前|frontier|blocked_by|阻塞|依赖图|task-graph|task graph", re.IGNORECASE)
TEST_CI_RE = re.compile(r"\btdd\b|\bci\b|just\s+ci|pytest|unittest|npm\s+test|测试|校验|验证", re.IGNORECASE)
REVIEW_RE = re.compile(r"code-review|代码评审|代码审查|双轴评审|评审", re.IGNORECASE)
PUSH_RE = re.compile(r"git\s+push", re.IGNORECASE)
PUSH_BOUNDARY_RE = re.compile(r"禁止|不要|严禁|do not|never|授权.*push|allow.*push", re.IGNORECASE)
GH_COMMENT_RE = re.compile(r"\bgh\s+issue\s+comment\b", re.IGNORECASE)
GH_CLOSE_RE = re.compile(r"\bgh\s+issue\s+close\b", re.IGNORECASE)
AUTH_CLOSE_RE = re.compile(r"授权|authorized|允许关闭", re.IGNORECASE)
PR_CLOSE_RE = re.compile(r"\bgh\s+pr\s+create\b|closes\s+#\d+", re.IGNORECASE)


def read_prompt_text(input_path: str) -> str:
    if input_path == "-":
        raw = sys.stdin.buffer.read()
        return raw.decode("utf-8-sig")
    path = Path(input_path)
    return path.read_text(encoding="utf-8-sig")


def strip_inline_code(text: str) -> str:
    return re.sub(r"`[^`\n]+`", "", text)


def lint_prompt(text: str, *, tracker: str = "github", close_mode: str = "remote-close") -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []
    normalized = text.strip()

    def add_error(code: str, message: str) -> None:
        errors.append({"code": code, "message": message})

    def add_warning(code: str, message: str) -> None:
        warnings.append({"code": code, "message": message})

    if len(normalized) < 120:
        add_error("empty_input", "Prompt is empty or too short (< 120 chars) to be self-contained.")
        return {
            "ok": False,
            "tracker": tracker,
            "close_mode": close_mode,
            "error_count": len(errors),
            "errors": errors,
            "warnings": warnings,
        }

    # 1. Unresolved placeholders
    brace_matches = PLACEHOLDER_BRACES_RE.findall(normalized)
    if brace_matches:
        add_error("unresolved_placeholder", f"Found unresolved template braces: {', '.join(sorted(set(brace_matches)))}")
    keyword_matches = PLACEHOLDER_KEYWORD_RE.findall(normalized)
    if keyword_matches:
        add_error("unresolved_placeholder", f"Found placeholder marker(s): {', '.join(sorted(set(keyword_matches)))}")
    angle_matches = ANGLE_PLACEHOLDER_RE.findall(strip_inline_code(normalized))
    if angle_matches:
        add_error("unresolved_placeholder", f"Found unresolved angle placeholder(s): {', '.join(sorted(set(angle_matches)))}")

    # 2. Conversational back-references
    for pattern in BACK_REF_PATTERNS:
        if pattern.search(normalized):
            add_error("back_reference", f"Found fragile conversational back-reference matching `{pattern.pattern}`.")
            break

    # 3. Private OS user paths
    for pattern in PRIVATE_PATH_PATTERNS:
        match = pattern.search(normalized)
        if match:
            add_error("private_path_leak", f"Found machine-local user path `{match.group(0)}`; replace with repo-relative path or env var.")
            break

    # 4. Source-of-truth pointers
    if tracker == "github":
        if not GITHUB_ISSUE_REF_RE.search(normalized) or not GITHUB_FETCH_RE.search(normalized):
            add_error(
                "missing_source_pointer",
                "GitHub tracker prompts must cite concrete `#<number>` issue refs and live fetch commands (`gh issue view` / `gh api`).",
            )
    elif tracker == "local":
        if not LOCAL_SCRATCH_RE.search(normalized):
            add_error(
                "missing_source_pointer",
                "Local tracker prompts must point to concrete `.scratch/<feature>/...` ticket paths.",
            )

    # 5. Dependency frontier / task graph
    if not FRONTIER_RE.search(normalized):
        add_error("missing_frontier", "Prompt must explain the dependency frontier / blocking order (`波前`, `frontier`, or `blocked_by`).")

    # 6. Verification & code-review gates
    if not TEST_CI_RE.search(normalized) or not REVIEW_RE.search(normalized):
        add_error(
            "missing_verification_gate",
            "Prompt must require both test/TDD/CI verification and `/code-review` (or code review) before completion.",
        )

    # 7. Explicit git push boundary
    if not PUSH_RE.search(normalized) or not PUSH_BOUNDARY_RE.search(normalized):
        add_error(
            "missing_commit_boundary",
            "Prompt must explicitly state the `git push` boundary (forbidden by default or explicitly authorized).",
        )

    # 8. Issue close protocol
    if close_mode == "remote-close":
        if tracker != "github":
            add_error("invalid_close_mode", "`--close-mode remote-close` is only valid with `--tracker github`.")
        elif not (GH_COMMENT_RE.search(normalized) and GH_CLOSE_RE.search(normalized) and AUTH_CLOSE_RE.search(normalized)):
            add_error(
                "missing_close_protocol",
                "Remote-close prompts must include explicit authorization plus both `gh issue comment` (before closing) and `gh issue close`.",
            )
    elif close_mode == "pr-close":
        if not PR_CLOSE_RE.search(normalized):
            add_error("missing_close_protocol", "PR-close prompts must specify `Closes #<n>` or `gh pr create`.")
    elif close_mode == "no-close":
        if GH_CLOSE_RE.search(normalized):
            add_error("unexpected_close_command", "Prompt must not instruct `gh issue close` when `--close-mode no-close` is active.")

    if len(normalized) > 12000:
        add_warning("prompt_length", f"Prompt length is {len(normalized)} chars; verify you did not paste full issue bodies instead of pointers.")

    return {
        "ok": not errors,
        "tracker": tracker,
        "close_mode": close_mode,
        "error_count": len(errors),
        "errors": errors,
        "warnings": warnings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate a compiled Matt Pocock fresh-session implementation prompt.",
    )
    parser.add_argument(
        "input_path",
        help="Path to prompt text/markdown file, or '-' to read UTF-8 from stdin.",
    )
    parser.add_argument(
        "--tracker",
        choices=("github", "local"),
        default="github",
        help="Issue tracker mode used by the target repository.",
    )
    parser.add_argument(
        "--close-mode",
        choices=("remote-close", "pr-close", "no-close"),
        default=None,
        help="Closing strategy expected in the prompt (defaults to remote-close for github, no-close for local).",
    )
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    close_mode = args.close_mode or ("remote-close" if args.tracker == "github" else "no-close")
    try:
        text = read_prompt_text(args.input_path)
    except OSError as exc:
        print(f"Error reading input: {exc}", file=sys.stderr)
        return 2

    result = lint_prompt(text, tracker=args.tracker, close_mode=close_mode)
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if result["ok"] else "FAIL"
        print(f"[{status}] tracker={result['tracker']} close_mode={result['close_mode']} errors={result['error_count']}")
        for item in result["errors"]:
            print(f"  ERROR [{item['code']}]: {item['message']}")
        for item in result["warnings"]:
            print(f"  WARN  [{item['code']}]: {item['message']}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
