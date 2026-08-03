#!/usr/bin/env python3
"""Lightweight validation for goal-meta-skill outputs."""

from __future__ import annotations

import re
import sys
import argparse
from pathlib import Path


REQUIRED_MARKER_GROUPS = [
    ("command", [r"/goal"]),
    ("verification", [r"Verification[:：]", r"验证[:：]"]),
    ("constraints", [r"Constraints[:：]", r"约束[:：]"]),
    ("boundaries", [r"Boundaries[:：]", r"边界[:：]"]),
    ("iteration policy", [r"Iteration policy[:：]", r"迭代策略[:：]"]),
    ("stop when", [r"Stop when[:：]", r"完成条件[:：]", r"停止条件[:：]"]),
    ("pause if", [r"Pause if[:：]", r"暂停条件[:：]", r"阻塞条件[:：]"]),
]

PLACEHOLDER_PATTERNS = [
    r"\[[^\]]+\]",
    r"\bTBD\b",
    r"\bTODO\b",
    r"<[^>]+>",
    r"待补充",
    r"待定",
]

VERIFICATION_EVIDENCE_PATTERNS = [
    r"\b(run|start|open|test|build|lint|typecheck|verify|inspect|capture|screenshot|log|artifact|file|url|api|simulator|browser|local)\b",
    r"(运行|启动|打开|测试|构建|检查|验证|读取|截图|日志|产物|文件|链接|接口|API|模拟器|浏览器|本地|证据)",
]

COMPLETION_QUANTIFIER_PATTERNS = [
    r"\b(?:all|every)\b",
    r"\bclean\s+up\b",
    r"(?:全部|所有|每个)",
]

COMPLETION_ANCHOR_PATTERNS = [
    r"\b(?:command|exit code|test|tests|pytest|lint|build|typecheck|benchmark|report|artifact|file list|issue|acceptance criteria|docs?)\b",
    r"(?:命令|退出码|测试|检查|构建|类型检查|基准|报告|产物|文件清单|问题单|验收标准|文档)",
    r"(?:[\w.-]+[/\\])+[\w.-]+",
]

NUMBERED_COMPLETION_PATTERN = r"^\s*(?:[-*]\s*)?\d+[.)、]\s*"

BUDGET_MISREPRESENTATION_PATTERNS = [
    r"(?:/goal|goal\s+(?:text|clause|prompt)).{0,80}(?:sets?|configures?|enforces?|limits?).{0,40}(?:runtime\s+)?(?:token\s+)?budget",
    r"(?:runtime|platform)\s+(?:token\s+)?budget.{0,50}(?:is|gets)\s+(?:set|configured|enforced|limited).{0,40}(?:/goal|goal\s+(?:text|clause|prompt))",
    r"(?:目标文本|目标条款|goal\s*正文|/goal).{0,50}(?:设置|配置|强制|限制).{0,40}(?:平台|运行时|token).{0,20}预算",
]

BUDGET_NEGATION_PATTERNS = [
    r"\b(?:does not|doesn't|cannot|can't|never)\b",
    r"(?:不等于|不会|不能|无法|并非|不是)",
]

DANGEROUS_VAGUE_PATTERNS = [
    r"make sure it works",
    r"edit anything",
    r"change whatever",
    r"keep trying",
    r"until it (looks|seems|feels) good",
    r"随便改",
    r"随意修改",
    r"一直尝试",
    r"直到满意",
    r"看起来不错就行",
    r"感觉可以",
]

GOAL_OBJECTIVE_MAX_CHARS = 4000

CLAUDE_FORBIDDEN_COMMAND_PATTERNS = [
    r"/goal\s+pause",
    r"/goal\s+resume",
]

CLAUDE_BOUNDING_CLAUSE_PATTERNS = [
    r"stop after \d+",
    r"\d+\s*turns",
    r"\d+\s*轮",
    r"(分钟|小时)后(停止|暂停)",
    r"after \d+\s*(minutes|hours)",
]

CHINESE_COMPANION_SECTIONS = [
    "推荐执行版（中文，可直接复制）",
    "默认选择理由",
    "可选调整",
    "你可以直接回复",
    "Goal Draft (English-compatible)",
]

CHINESE_DRAFT_MARKERS = [
    "验证：",
    "约束：",
    "边界：",
    "迭代策略：",
    "完成条件：",
    "暂停条件：",
]

ENGLISH_DRAFT_MARKERS = [
    "Verification:",
    "Constraints:",
    "Boundaries:",
    "Iteration policy:",
    "Stop when:",
    "Pause if:",
]


def find_marker_content(text: str, patterns: list[str]) -> str | None:
    for pattern in patterns:
        match = re.search(rf"^{pattern}\s*(.+)$", text, flags=re.MULTILINE | re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def lint_chinese_companion(text: str, source: str) -> list[str]:
    errors: list[str] = []
    positions: list[tuple[str, int]] = []

    for label in CHINESE_COMPANION_SECTIONS:
        index = text.find(label)
        if index < 0:
            errors.append(f"{source}: missing Chinese-first companion section `{label}`")
            continue
        positions.append((label, index))

    if len(positions) == len(CHINESE_COMPANION_SECTIONS):
        ordered = sorted(positions, key=lambda item: item[1])
        if [label for label, _ in ordered] != CHINESE_COMPANION_SECTIONS:
            errors.append(
                f"{source}: Chinese-first companion sections must appear in the documented order"
            )

        chinese_start = text.find(CHINESE_COMPANION_SECTIONS[0])
        english_start = text.find(CHINESE_COMPANION_SECTIONS[-1])
        chinese_block = text[chinese_start:english_start]
        english_block = text[english_start:]

        for marker in CHINESE_DRAFT_MARKERS:
            if marker not in chinese_block:
                errors.append(f"{source}: Chinese recommended draft missing `{marker}`")

        for marker in ENGLISH_DRAFT_MARKERS:
            if marker not in english_block:
                errors.append(f"{source}: English-compatible draft missing `{marker}`")

    return errors


def lint_goal_block_length(text: str, source: str) -> list[str]:
    """Check the pasted /goal block stays within the 4,000 character limit.

    Both Codex objectives and Claude Code conditions share the limit. The
    block is measured from each /goal line to the next blank line, matching
    what a user would paste as one message.
    """
    errors: list[str] = []
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if not line.strip().startswith("/goal"):
            continue
        block_lines = [line.strip().removeprefix("/goal").strip()]
        for follower in lines[index + 1 :]:
            if not follower.strip():
                break
            block_lines.append(follower.strip())
        block_length = len("\n".join(block_lines))
        if block_length > GOAL_OBJECTIVE_MAX_CHARS:
            errors.append(
                f"{source}: /goal block is {block_length} characters; both platforms "
                f"cap objectives/conditions at {GOAL_OBJECTIVE_MAX_CHARS}. Move the "
                "contract into a file and point /goal at it"
            )
    return errors


def lint_claude_platform(text: str, source: str) -> list[str]:
    errors: list[str] = []

    for pattern in CLAUDE_FORBIDDEN_COMMAND_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            errors.append(
                f"{source}: Claude Code has no pause/resume; matched `{pattern}`. "
                "Use /goal clear (or interrupt) and re-set the goal later"
            )

    if not any(
        re.search(pattern, text, flags=re.IGNORECASE)
        for pattern in CLAUDE_BOUNDING_CLAUSE_PATTERNS
    ):
        errors.append(
            f"{source}: Claude Code goals need a bounding clause such as "
            "`or stop after 20 turns` / `否则在 20 轮后停止并总结剩余问题`"
        )

    return errors


def lint_completion_warnings(text: str, source: str) -> list[str]:
    warnings: list[str] = []
    completion = find_marker_content(text, REQUIRED_MARKER_GROUPS[5][1])
    if not completion:
        return warnings

    has_quantifier = any(
        re.search(pattern, completion, flags=re.IGNORECASE)
        for pattern in COMPLETION_QUANTIFIER_PATTERNS
    )
    has_anchor = any(
        re.search(pattern, completion, flags=re.IGNORECASE)
        for pattern in COMPLETION_ANCHOR_PATTERNS
    )
    if has_quantifier and not has_anchor:
        warnings.append(
            f"{source}: broad completion quantifier lacks an authoritative "
            "enumeration source or deterministic check"
        )

    if not re.search(NUMBERED_COMPLETION_PATTERN, completion):
        warnings.append(
            f"{source}: completion conditions are easier to verify when numbered "
            "(recommended, not required)"
        )

    return warnings


def lint_budget_misrepresentation(text: str, source: str) -> list[str]:
    errors: list[str] = []
    for line in text.splitlines():
        if not any(
            re.search(pattern, line, flags=re.IGNORECASE)
            for pattern in BUDGET_MISREPRESENTATION_PATTERNS
        ):
            continue
        if any(
            re.search(pattern, line, flags=re.IGNORECASE)
            for pattern in BUDGET_NEGATION_PATTERNS
        ):
            continue
        errors.append(
            f"{source}: goal text cannot set or enforce a platform runtime budget; "
            "express budget, time, or turn limits only as soft stop clauses"
        )
    return errors


def lint_text(
    text: str,
    source: str,
    *,
    require_chinese_companion: bool = False,
    platform: str = "both",
) -> list[str]:
    errors: list[str] = []

    if re.search(r"^\s*/目标\b", text, flags=re.MULTILINE):
        errors.append(f"{source}: use `/goal`, not `/目标`, as the executable command")

    for name, patterns in REQUIRED_MARKER_GROUPS:
        if not any(re.search(pattern, text) for pattern in patterns):
            readable = " or ".join(pattern.replace(r"[:：]", ":") for pattern in patterns)
            errors.append(f"{source}: missing required marker `{readable}`")

    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            errors.append(f"{source}: unresolved placeholder matched `{pattern}`")

    for pattern in DANGEROUS_VAGUE_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            errors.append(f"{source}: dangerous vague instruction matched `{pattern}`")

    if "/goal" in text:
        goal_line = next((line.strip() for line in text.splitlines() if line.strip().startswith("/goal")), "")
        if len(goal_line.removeprefix("/goal").strip()) < 20:
            errors.append(f"{source}: /goal outcome is too short to be actionable")

    verification = find_marker_content(text, REQUIRED_MARKER_GROUPS[1][1])
    if verification and not any(re.search(pattern, verification, flags=re.IGNORECASE) for pattern in VERIFICATION_EVIDENCE_PATTERNS):
        errors.append(f"{source}: verification should name concrete evidence such as commands, logs, screenshots, files, APIs, browser/simulator checks, or artifacts")

    for name, patterns in REQUIRED_MARKER_GROUPS[1:]:
        content = find_marker_content(text, patterns)
        if content and len(content) < 12:
            errors.append(f"{source}: `{name}` content is too thin")

    errors.extend(lint_goal_block_length(text, source))
    errors.extend(lint_budget_misrepresentation(text, source))

    if platform == "claude":
        errors.extend(lint_claude_platform(text, source))

    if require_chinese_companion:
        errors.extend(lint_chinese_companion(text, source))

    return errors


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate goal-meta-skill /goal command output.",
    )
    parser.add_argument(
        "--require-chinese-companion",
        action="store_true",
        help="Require the Chinese-first recommended draft, reason, adjustments, reply hint, and English-compatible mirror.",
    )
    parser.add_argument(
        "--platform",
        choices=("codex", "claude", "both"),
        default="both",
        help="Target platform. `claude` adds Claude Code rules: no /goal pause|resume advice and a required turn/time bounding clause.",
    )
    parser.add_argument("files", nargs="+", help="Files to lint.")
    return parser.parse_args(argv[1:])


def main(argv: list[str]) -> int:
    try:
        args = parse_args(argv)
    except SystemExit as exc:
        return int(exc.code)

    all_errors: list[str] = []
    all_warnings: list[str] = []
    for raw_path in args.files:
        path = Path(raw_path)
        try:
            text = path.read_text(encoding="utf-8")
        except OSError as exc:
            all_errors.append(f"{path}: cannot read file: {exc}")
            continue
        all_errors.extend(
            lint_text(
                text,
                str(path),
                require_chinese_companion=args.require_chinese_companion,
                platform=args.platform,
            )
        )
        all_warnings.extend(lint_completion_warnings(text, str(path)))

    for warning in all_warnings:
        print(f"warning: {warning}", file=sys.stderr)

    if all_errors:
        for error in all_errors:
            print(error, file=sys.stderr)
        return 1

    print("Goal command lint passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
