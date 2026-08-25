#!/usr/bin/env python3
"""Lightweight validation for goal-meta-skill outputs."""

from __future__ import annotations

import argparse
import re
import sys
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

DISPATCH_REQUIREMENT_PATTERNS = [
    r"trellis-implement",
    r"trellis-check",
    r"spawn_subagent",
    r"subagent_type",
    r"派发",
    r"子代理",
]

INLINE_MODE_PATTERNS = [
    r"dispatch_mode.{0,20}inline",
    r"inline\s+mode",
    r"内联模式",
    r"trellis-before-dev",
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

PLATFORMS = ("codex", "claude", "grok", "omp", "kimi", "both", "all")

PLATFORM_MANAGEMENT_COMMANDS = {
    "codex": {"edit", "pause", "resume", "clear"},
    "claude": {"clear", "stop", "off", "reset", "none", "cancel"},
    "grok": {"status", "pause", "resume", "clear"},
    "omp": {"set", "show", "pause", "resume", "drop", "budget"},
    "kimi": {"status", "pause", "resume", "cancel", "replace", "next"},
}

ALL_MANAGEMENT_COMMANDS = set().union(*PLATFORM_MANAGEMENT_COMMANDS.values())

PLATFORM_LABELS = {
    "codex": "Codex",
    "claude": "Claude Code",
    "grok": "Grok Build",
    "omp": "Oh My Pi",
    "kimi": "Kimi Code",
}

CONTRACT_REQUIRED_SECTIONS = (
    "Contract metadata",
    "Authority and startup",
    "Objective",
    "Required reading and current context",
    "Scope and boundaries",
    "Constraints",
    "Verification",
    "Iteration policy",
    "Completion conditions",
    "Pause / stop conditions",
    "Launch commands",
)

CONTRACT_PLACEHOLDER_PATTERNS = (
    r"\bTBD\b",
    r"\bTODO\b",
    r"\[(?:TBD|TODO|PLACEHOLDER)[^\]]*\]",
    r"<[^>]+>",
    r"待补充",
    r"待定",
)

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


def lint_goal_block_length(
    text: str, source: str, *, platform: str = "both"
) -> list[str]:
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
            if platform in {"grok", "omp"}:
                errors.append(
                    f"{source}: /goal block is {block_length} characters; the "
                    f"goal-meta portability limit is {GOAL_OBJECTIVE_MAX_CHARS}. "
                    "No official objective cap was found for this platform; move "
                    "the contract into a file and point /goal at it"
                )
            else:
                limit_owner = {
                    "codex": "Codex caps objectives",
                    "claude": "Claude Code caps conditions",
                    "kimi": "Kimi Code caps objectives",
                    "all": "Codex, Claude Code, and Kimi Code cap objectives/conditions",
                    "both": "Codex and Claude Code cap objectives/conditions",
                }.get(platform, "supported platforms cap objectives/conditions")
                errors.append(
                    f"{source}: /goal block is {block_length} characters; {limit_owner} "
                    f"at {GOAL_OBJECTIVE_MAX_CHARS}. Move the "
                    "contract into a file and point /goal at it"
                )
    return errors


def lint_platform_commands(text: str, source: str, platform: str) -> list[str]:
    """Reject slash-command verbs that belong to another platform."""
    if platform not in PLATFORM_MANAGEMENT_COMMANDS:
        return []

    errors: list[str] = []
    allowed = PLATFORM_MANAGEMENT_COMMANDS[platform]
    for match in re.finditer(
        r"/goal\s+(edit|pause|resume|clear|status|set|show|drop|budget|stop|off|reset|none|cancel|replace|next)\b",
        text,
        flags=re.IGNORECASE,
    ):
        command = match.group(1).lower()
        if command in ALL_MANAGEMENT_COMMANDS and command not in allowed:
            errors.append(
                f"{source}: `/goal {command}` is not valid for {platform}; "
                "use that platform's documented management vocabulary"
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


def _trellis_cadence_region(text: str) -> str:
    parts: list[str] = []
    iteration = find_marker_content(text, REQUIRED_MARKER_GROUPS[4][1])
    completion = find_marker_content(text, REQUIRED_MARKER_GROUPS[5][1])
    if iteration:
        parts.append(iteration)
    if completion:
        parts.append(completion)
    return "\n".join(parts) if parts else text


def lint_trellis_dispatch(text: str, source: str, *, cadence: str) -> list[str]:
    """Require dispatch on Trellis implementation text unless inline mode is stated.

    Missing dispatch is a contract defect and belongs in errors, not warnings.
    """
    if any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in INLINE_MODE_PATTERNS):
        return []
    if any(
        re.search(pattern, cadence, flags=re.IGNORECASE)
        for pattern in DISPATCH_REQUIREMENT_PATTERNS
    ):
        return []
    return [
        f"{source}: Trellis implementation must require dispatch of "
        "`trellis-implement` / `trellis-check` unless the text states inline mode"
    ]


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

    errors.extend(lint_goal_block_length(text, source, platform=platform))
    errors.extend(lint_budget_misrepresentation(text, source))
    errors.extend(lint_platform_commands(text, source, platform))

    if ".trellis/tasks/" in text and re.search(r"archive", text, flags=re.IGNORECASE):
        errors.extend(
            lint_trellis_dispatch(text, source, cadence=_trellis_cadence_region(text))
        )

    if platform == "claude":
        errors.extend(lint_claude_platform(text, source))

    if require_chinese_companion:
        errors.extend(lint_chinese_companion(text, source))

    return errors


def _sections(text: str) -> dict[str, str]:
    matches = list(re.finditer(r"^##\s+(.+?)\s*$", text, flags=re.MULTILINE))
    result: dict[str, str] = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[match.group(1).strip()] = text[match.end() : end].strip()
    return result


def _metadata(section: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for match in re.finditer(r"^-\s+([^:\n]+):\s*(.+?)\s*$", section, flags=re.MULTILINE):
        result[match.group(1).strip()] = match.group(2).strip()
    return result


def _parse_contract_platforms(value: str) -> set[str]:
    tokens = {
        token.lower()
        for token in re.findall(r"\b(?:codex|claude|grok|omp|kimi)\b", value, flags=re.IGNORECASE)
    }
    return tokens


def _expected_platforms(platform: str) -> set[str]:
    if platform == "both":
        return {"codex", "claude"}
    if platform == "all":
        return {"codex", "claude", "grok", "omp", "kimi"}
    return {platform}


def _launch_commands(section: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for platform, label in PLATFORM_LABELS.items():
        match = re.search(
            rf"^-\s+{re.escape(label)}:\s+`?(/goal[^`\n]+)`?\s*$",
            section,
            flags=re.MULTILINE | re.IGNORECASE,
        )
        if match:
            result[platform] = match.group(1).strip()
    return result


def lint_persisted_contract(
    text: str,
    source: str,
    *,
    expected_path: str = "GOAL.md",
    platform: str | None = None,
) -> list[str]:
    """Validate the immutable root Markdown contract used for fresh-agent handoff."""
    errors: list[str] = []
    sections = _sections(text)

    if not re.search(r"^# Goal Contract:\s+\S", text, flags=re.MULTILINE):
        errors.append(f"{source}: missing non-empty `# Goal Contract: ...` title")

    for heading in CONTRACT_REQUIRED_SECTIONS:
        if heading not in sections:
            errors.append(f"{source}: missing required contract section `## {heading}`")
        elif not sections[heading]:
            errors.append(f"{source}: contract section `## {heading}` is empty")

    for pattern in CONTRACT_PLACEHOLDER_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            errors.append(f"{source}: unresolved contract placeholder matched `{pattern}`")

    if errors:
        return errors

    metadata = _metadata(sections["Contract metadata"])
    required_metadata = (
        "Status",
        "Target platform",
        "Generated by",
        "Project root",
        "Contract path",
        "Baseline",
        "Generated at",
    )
    for key in required_metadata:
        if key not in metadata:
            errors.append(f"{source}: missing contract metadata `{key}`")

    if metadata.get("Status", "").lower() != "approved":
        errors.append(f"{source}: contract Status must be `approved`")
    if metadata.get("Generated by") != "goal-meta-skill 0.6.0":
        errors.append(f"{source}: Generated by must be `goal-meta-skill 0.6.0`")
    if metadata.get("Project root") != ".":
        errors.append(f"{source}: Project root must be the relative marker `.`")
    if metadata.get("Contract path") != expected_path:
        errors.append(
            f"{source}: Contract path `{metadata.get('Contract path', '')}` does not "
            f"match output `{expected_path}`"
        )
    if not re.search(
        r"\S+\s+@\s+[0-9a-f]{40}\b.*\bdirty paths:\s*\S",
        metadata.get("Baseline", ""),
        flags=re.IGNORECASE,
    ):
        errors.append(
            f"{source}: Baseline must include a full 40-character HEAD and dirty paths summary"
        )
    if not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})",
        metadata.get("Generated at", ""),
    ):
        errors.append(f"{source}: Generated at must be ISO-8601 with a timezone")

    declared_platforms = _parse_contract_platforms(metadata.get("Target platform", ""))
    if not declared_platforms:
        errors.append(f"{source}: Target platform must name at least one supported platform")
    platform_residue = re.sub(
        r"\b(?:codex|claude|grok|omp|kimi|and)\b|[,|+/&\s-]+",
        "",
        metadata.get("Target platform", ""),
        flags=re.IGNORECASE,
    )
    if platform_residue:
        errors.append(
            f"{source}: Target platform contains unsupported value `{platform_residue}`"
        )
    if platform is not None and declared_platforms != _expected_platforms(platform):
        errors.append(
            f"{source}: Target platform metadata {sorted(declared_platforms)} does not "
            f"match --platform {platform}"
        )

    authority = sections["Authority and startup"]
    for label, pattern in (
        ("system authority", r"\bsystem\b|系统"),
        ("user authority", r"\buser\b|用户"),
        ("scoped project rules", r"AGENTS\.md|CLAUDE\.md|project rules|项目规则"),
        (
            "drift/conflict stop",
            r"(?:drift|conflict).{0,80}(?:stop|report)|(?:stop|report).{0,80}(?:drift|conflict)|"
            r"(?:漂移|冲突).{0,40}(?:停止|报告)|(?:停止|报告).{0,40}(?:漂移|冲突)",
        ),
    ):
        if not re.search(pattern, authority, flags=re.IGNORECASE | re.DOTALL):
            errors.append(f"{source}: Authority and startup missing {label}")

    verification = sections["Verification"]
    if not re.search(r"\b(?:VERIFIED|UNVERIFIED)\b", verification):
        errors.append(f"{source}: Verification must label evidence VERIFIED or UNVERIFIED")

    if len(sections["Objective"]) < 20:
        errors.append(f"{source}: Objective is too short to be observable")

    if not re.search(NUMBERED_COMPLETION_PATTERN, sections["Completion conditions"], re.MULTILINE):
        errors.append(f"{source}: Completion conditions must be numbered")

    pause = sections["Pause / stop conditions"]
    if not re.search(r"pause|stop|blocked|暂停|停止|阻塞", pause, flags=re.IGNORECASE):
        errors.append(f"{source}: Pause / stop conditions must define a pause or stop state")

    if re.search(
        r"GOAL\.md.{0,30}(?:auto(?:matically)?[- ]?load|automatically (?:read|discover))|"
        r"(?:自动加载|自动读取|自动发现).{0,30}GOAL\.md",
        text,
        flags=re.IGNORECASE,
    ):
        errors.append(f"{source}: arbitrary GOAL.md files are not automatically loaded")

    launchers = _launch_commands(sections["Launch commands"])
    for target_platform in sorted(declared_platforms):
        command = launchers.get(target_platform)
        if command is None:
            errors.append(
                f"{source}: Launch commands missing {PLATFORM_LABELS[target_platform]} renderer"
            )
            continue
        pointer = f"@{expected_path}" if target_platform == "claude" else f"./{expected_path}"
        if pointer not in command:
            errors.append(
                f"{source}: {target_platform} launch command must explicitly reference `{pointer}`"
            )
        if target_platform == "claude":
            if "transcript" not in command.lower():
                errors.append(f"{source}: Claude launch must surface evidence in the transcript")
        elif not re.search(r"first read and follow", command, flags=re.IGNORECASE):
            errors.append(f"{source}: {target_platform} launch must explicitly read and follow the file")
        errors.extend(lint_goal_block_length(command, source, platform=target_platform))
        errors.extend(lint_platform_commands(command, source, target_platform))

    if ".trellis/tasks/" in text:
        for artifact in ("prd.md", "design.md", "implement.md"):
            if artifact not in sections["Required reading and current context"]:
                errors.append(f"{source}: Trellis contract must link concrete `{artifact}`")
        cadence = sections["Iteration policy"] + "\n" + sections["Completion conditions"]
        if not re.search(r"commit|提交", cadence, flags=re.IGNORECASE) or "archive" not in cadence:
            errors.append(f"{source}: Trellis contract must preserve commit-then-archive cadence")
        errors.extend(lint_trellis_dispatch(text, source, cadence=cadence))

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
        choices=PLATFORMS,
        default=None,
        help="Target platform. Inline default is `both`; contracts infer metadata when omitted. `all` covers all five renderers.",
    )
    parser.add_argument(
        "--contract",
        action="store_true",
        help="Validate the persisted GOAL.md contract schema instead of an inline draft.",
    )
    parser.add_argument(
        "--expected-path",
        default="GOAL.md",
        help="Expected project-relative contract basename when --contract is used.",
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
            text = path.read_text(encoding="utf-8-sig")
        except (OSError, UnicodeDecodeError) as exc:
            all_errors.append(f"{path}: cannot read file: {exc}")
            continue
        if args.contract:
            all_errors.extend(
                lint_persisted_contract(
                    text,
                    str(path),
                    expected_path=args.expected_path,
                    platform=args.platform,
                )
            )
        else:
            all_errors.extend(
                lint_text(
                    text,
                    str(path),
                    require_chinese_companion=args.require_chinese_companion,
                    platform=args.platform or "both",
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
