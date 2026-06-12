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


def lint_text(text: str, source: str, *, require_chinese_companion: bool = False) -> list[str]:
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
    parser.add_argument("files", nargs="+", help="Files to lint.")
    return parser.parse_args(argv[1:])


def main(argv: list[str]) -> int:
    try:
        args = parse_args(argv)
    except SystemExit as exc:
        return int(exc.code)

    all_errors: list[str] = []
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
            )
        )

    if all_errors:
        for error in all_errors:
            print(error, file=sys.stderr)
        return 1

    print("Goal command lint passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
