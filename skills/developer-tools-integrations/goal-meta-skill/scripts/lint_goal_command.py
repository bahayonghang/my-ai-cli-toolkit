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

SUBAGENT_DEFAULT_ON_PATTERNS = [
    r"优先使用\s*(?:subagents?|sub-agents?|子代理).{0,24}(?:默认开启|默认启用|开关默认开启)",
    r"(?:prefer|prioriti[sz]e)\s+(?:subagents?|sub-agents?).{0,24}(?:default(?:s)?\s+(?:to\s+)?(?:on|enabled)|enabled\s+by\s+default)",
]

SUBAGENT_OPT_OUT_PATTERNS = [
    r"(?:subagents?|sub-agents?|子代理).{0,40}(?:用户已明确关闭|用户明确关闭|用户已明确要求不使用)",
    r"(?:subagents?|sub-agents?).{0,40}(?:explicit(?:ly)?\s+(?:disabled|opt(?:ed)?\s+out)|explicit\s+user\s+opt-out)",
]

SUBAGENT_FALLBACK_PATTERNS = [
    r"(?:subagents?|sub-agents?|子代理).{0,70}(?:技术降级|technical\s+fallback|capability\s+fallback).{0,50}(?:inline|内联)",
]

SUBAGENT_FALLBACK_REASON_PATTERNS = [
    r"dispatch_mode.{0,20}inline",
    r"workflow\.md.{0,60}(?:inline|内联)",
    r"(?:platform|host|平台|宿主).{0,50}(?:cannot|unsupported|不支持|无法).{0,30}(?:dispatch|subagent|派发|子代理)",
]

TRELLIS_PRODUCT_CHANGE_PATTERNS = [
    r"(?:current|this)\s+task.{0,60}(?:related\s+)?product\s+(?:changes|files)",
    r"(?:当前|本)任务.{0,30}(?:相关)?产品(?:改动|文件)",
]

TRELLIS_PLANNING_ARTIFACT_PATTERNS = [
    r"(?:current|this)\s+task.{0,50}planning\s+artifacts?",
    r"(?:当前|本)任务.{0,24}规划产物",
]

TRELLIS_HISTORY_CONFIRMATION_PATTERNS = [
    r"(?:product\s+(?:changes|files).{0,80}planning\s+artifacts?|both).{0,80}(?:version|commit)\s+history",
    r"(?:产品(?:改动|文件).{0,80}规划产物|二者|两类).{0,80}(?:版本历史|提交历史|均已提交)",
]

TRELLIS_UNRELATED_TASK_EXCLUSION_PATTERNS = [
    r"(?:exclude|leave\s+out|preserve).{0,50}(?:unrelated|other).{0,30}task",
    r"(?:unrelated|other).{0,30}task.{0,50}(?:excluded|left\s+out|unchanged)",
    r"(?:排除|不纳入|保留).{0,40}(?:无关|其他).{0,24}任务",
    r"(?:无关|其他).{0,24}任务.{0,40}(?:排除|不纳入|保留|不改)",
]

TRELLIS_OUT_OF_SCOPE_DIRTY_EXCLUSION_PATTERNS = [
    r"(?:exclude|leave|preserve|do\s+not\s+(?:include|change)).{0,50}out-of-scope\s+dirty",
    r"out-of-scope\s+dirty.{0,50}(?:excluded|left|preserved|unchanged)",
    r"(?:排除|不纳入|保留|不改).{0,40}范围外(?:脏文件|改动)",
    r"范围外(?:脏文件|改动).{0,40}(?:排除|不纳入|保留|不改)",
]

TRELLIS_ARCHIVE_COMMIT_SEPARATION_PATTERNS = [
    r"archive\s+commit.{0,60}(?:separate|independent|own)",
    r"(?:product.{0,40}planning|product/planning|both).{0,80}(?:must\s+not|do\s+not|cannot|excluded\s+from).{0,40}archive\s+commit",
    r"(?:产品.{0,40}规划|产品/规划|二者).{0,60}(?:不得|不能|不应).{0,30}(?:进入|混入)?归档提交",
    r"归档提交.{0,40}(?:独立|单独)",
]

TRELLIS_CONCRETE_ARCHIVE_PATTERN = (
    r"task\.py\s+archive\s+[\"']?(?:\./)?\.trellis[\\/]tasks[\\/]"
    r"[A-Za-z0-9][A-Za-z0-9._-]*[\"']?"
)

TRELLIS_IMPLEMENTATION_INTENT_PATTERNS = [
    r"\b(?:implement|repair|fix|remediate|execute|complete)\b",
    r"(?:实施|修复|整改|执行|完成|收敛)",
]

TRELLIS_READ_ONLY_INTENT_PATTERNS = [
    r"\b(?:read[- ]only|review only|report only|analysis only)\b",
    r"\b(?:review|inspect|analy[sz]e|report).{0,80}\bwithout (?:any )?(?:edits?|changes?|implementation|repairs?)\b",
    r"\bdo not (?:edit|change|implement|repair)(?: anything| any (?:code|files?))\b",
    r"(?:只读(?:审阅|审查|分析|报告)|仅(?:审阅|审查|分析|报告)|"
    r"(?:不要|不得)(?:修改|实施|修复)(?:任何)?(?:代码|文件|内容|改动)?(?:[，。；]|$))",
]

REVIEW_REMEDIATION_ENVELOPE_LABELS = {
    "scanner": r"scanner|扫描器",
    "scanner_identity": r"scanner[_ ]identity|扫描器身份",
    "config": r"config|配置",
    "inputs": r"inputs|输入(?:全集|集合)?",
    "targets": r"targets|目标(?:路径|集合)?",
    "baseline_report": r"baseline[_ ]report|基线报告",
    "git_baseline": r"git[_ ]baseline|Git\s*基线",
}

REVIEW_REMEDIATION_LEDGER_FIELDS = (
    "id",
    "severity",
    "path_or_scope",
    "issue",
    "fix_required",
    "test_required",
    "status",
    "evidence",
)

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


def _matches_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns)


def _is_trellis_implementation(text: str) -> bool:
    """Detect a named Trellis implementation without requiring archive wording."""
    if ".trellis/tasks/" not in text:
        return False
    first_statement = _trellis_first_statement(text)
    if _matches_any(first_statement, TRELLIS_READ_ONLY_INTENT_PATTERNS):
        return False
    return _matches_any(text, TRELLIS_IMPLEMENTATION_INTENT_PATTERNS)


def _review_error(source: str, detail: str) -> str:
    return f"{source}: review-remediation {detail}"


def _inline_goal_blocks(text: str) -> list[str]:
    """Return each contiguous inline /goal payload without wrapper prose."""
    blocks: list[str] = []
    lines = text.splitlines()
    index = 0
    while index < len(lines):
        if not re.match(r"^\s*/goal\b", lines[index], flags=re.IGNORECASE):
            index += 1
            continue
        block = [lines[index]]
        index += 1
        while index < len(lines) and lines[index].strip():
            block.append(lines[index])
            index += 1
        blocks.append("\n".join(block))
    return blocks


def _inline_goal_sections(text: str) -> dict[str, str]:
    """Parse inline Goal fields so profile rules cannot be satisfied by wrappers."""
    marker_map = {
        "Verification": REQUIRED_MARKER_GROUPS[1][1],
        "Constraints": REQUIRED_MARKER_GROUPS[2][1],
        "Boundaries": REQUIRED_MARKER_GROUPS[3][1],
        "Iteration policy": REQUIRED_MARKER_GROUPS[4][1],
        "Completion conditions": REQUIRED_MARKER_GROUPS[5][1],
        "Pause / stop conditions": REQUIRED_MARKER_GROUPS[6][1],
    }
    sections = {name: "" for name in marker_map}
    current: str | None = None
    for raw_line in text.splitlines():
        matched = False
        for name, patterns in marker_map.items():
            for pattern in patterns:
                match = re.match(
                    rf"^\s*{pattern}\s*(.*)$",
                    raw_line,
                    flags=re.IGNORECASE,
                )
                if match:
                    current = name
                    sections[name] = match.group(1).strip()
                    matched = True
                    break
            if matched:
                break
        if not matched and current is not None:
            sections[current] = (sections[current] + "\n" + raw_line.strip()).strip()
    return sections


def _review_regions(text: str, *, contract: bool) -> dict[str, str]:
    sections = _sections(text) if contract else _inline_goal_sections(text)
    return {
        "envelope": "\n".join(
            filter(
                None,
                (
                    sections.get("Required reading and current context", ""),
                    sections.get("Verification", ""),
                ),
            )
        ),
        "constraints": "\n".join(
            filter(
                None,
                (
                    sections.get("Scope and boundaries", ""),
                    sections.get("Constraints", ""),
                ),
            )
        ),
        "iteration": sections.get("Iteration policy", ""),
        "completion": sections.get("Completion conditions", ""),
        "pause": sections.get("Pause / stop conditions", ""),
    }


def _extract_envelope_records(text: str) -> dict[str, list[str]]:
    records: dict[str, list[str]] = {}
    for name, label in REVIEW_REMEDIATION_ENVELOPE_LABELS.items():
        pattern = (
            rf"(?:^|[;\n])\s*(?:[-*]\s*)?(?:{label})\s*[:：]\s*([^;\n]*)"
        )
        records[name] = [
            match.group(1).strip()
            for match in re.finditer(pattern, text, flags=re.IGNORECASE)
        ]
    return records


def _meaningful_envelope_value(name: str, value: str) -> bool:
    if not value or re.fullmatch(
        r"(?:TBD|TODO|unknown|待定|待补充|authoritative command or named entrypoint|"
        r"version, commit, or UNVERIFIED|path/hash plus material flags|"
        r"window/corpus/session IDs or a stable enumeration source|"
        r"paths, modules, or files|path or artifact ID|branch \+ HEAD \+ dirty-scope summary)",
        value,
        flags=re.IGNORECASE,
    ):
        return False
    anchors = {
        "config": r"(?:[/\\]|\b(?:path|hash|sha-?256|flag|none)\b|路径|哈希|参数|无外部配置)",
        "inputs": r"(?:[/\\]|\b(?:id|path|source|window|corpus|session|enumeration|list)\b|ID|路径|来源|窗口|语料|会话|枚举|集合)",
        "targets": r"(?:[/\\]|\b(?:path|module|file|directory)\b|路径|模块|文件|目录)",
        "baseline_report": r"(?:[/\\]|\b(?:path|artifact|report|id)\b|路径|产物|报告|ID)",
    }
    pattern = anchors.get(name)
    return pattern is None or bool(re.search(pattern, value, flags=re.IGNORECASE))


def _statement_has_unnegated_action(
    text: str,
    *,
    subject_pattern: str,
    action_pattern: str,
) -> bool:
    """Find affirmative dangerous clauses while tolerating explicit prohibitions."""
    for statement in re.split(r"[;；。.!?\n]+", text):
        if not re.search(subject_pattern, statement, flags=re.IGNORECASE):
            continue
        action = re.search(action_pattern, statement, flags=re.IGNORECASE)
        if not action:
            continue
        prefix = statement[: action.start()]
        if not re.search(
            r"(?:do not|must not|never|cannot|不得|禁止|不能|不再|无需|不要求)",
            prefix,
            flags=re.IGNORECASE,
        ):
            return True
    return False


def lint_review_remediation_envelope(
    regions: dict[str, str], source: str
) -> list[str]:
    """Require a reproducible scanner/config/input/target baseline envelope."""
    errors: list[str] = []
    envelope = regions["envelope"]
    records = _extract_envelope_records(envelope)
    for name, values in records.items():
        if not values:
            errors.append(_review_error(source, f"scan envelope missing `{name}` record"))
            continue
        if len(values) > 1:
            errors.append(_review_error(source, f"scan envelope has ambiguous duplicate `{name}` records"))
        if not _meaningful_envelope_value(name, values[0]):
            errors.append(_review_error(source, f"scan envelope `{name}` needs a concrete non-placeholder value"))

    identity_value = (records.get("scanner_identity") or [""])[0]
    if not re.search(
        r"\bUNVERIFIED\b|\b(?:version|commit)\b|\bv?\d+\.\d+(?:\.\d+)?\b|\b[0-9a-f]{7,40}\b",
        identity_value,
        flags=re.IGNORECASE,
    ):
        errors.append(
            _review_error(
                source,
                "`scanner_identity` must name a version/commit or use `UNVERIFIED`",
            )
        )

    if re.search(r"\bUNVERIFIED\b", identity_value, flags=re.IGNORECASE):
        evidence_policy = envelope + "\n" + regions["iteration"]
        if not re.search(
            r"(?:bounded|有限|有界).{0,30}(?:repeated runs|reruns|复跑|重复运行)",
            evidence_policy,
            flags=re.IGNORECASE | re.DOTALL,
        ) or not re.search(
            r"(?:second|independent|第二|独立).{0,20}(?:evidence source|evidence|证据源|证据)",
            evidence_policy,
            flags=re.IGNORECASE | re.DOTALL,
        ):
            errors.append(
                _review_error(
                    source,
                    "`UNVERIFIED` scanner identity needs bounded reruns and a second evidence source",
                )
            )

    git_value = (records.get("git_baseline") or [""])[0]
    if git_value and not (
        re.search(r"\bHEAD\b", git_value, flags=re.IGNORECASE)
        and re.search(r"dirty|脏", git_value, flags=re.IGNORECASE)
        and re.search(r"branch|分支|\b[^\s;]+/[^\s;]+", git_value, flags=re.IGNORECASE)
    ):
        errors.append(
            _review_error(source, "`git_baseline` must bind branch, HEAD, and dirty-scope summary")
        )

    drift_text = envelope + "\n" + regions["pause"]
    drift_named = re.search(
        r"(?:scope|config|corpus|input|target|scanner).{0,30}drift|"
        r"(?:范围|配置|语料|输入|目标|扫描器).{0,20}漂移",
        drift_text,
        flags=re.IGNORECASE,
    )
    drift_resolution = re.search(
        r"(?:re[- ]?baseline|new baseline|重新建立基线|重建基线).{0,80}\bBLOCKED\b|"
        r"\bBLOCKED\b.{0,80}(?:re[- ]?baseline|new baseline|重新建立基线|重建基线)",
        drift_text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not drift_named or not drift_resolution:
        errors.append(
            _review_error(
                source,
                "must treat material scanner/config/corpus/target drift as re-baseline or `BLOCKED`",
            )
        )
    if not re.search(
        r"(?:drift|漂移).{0,100}(?:must not|cannot|never|不得|不能|不可).{0,50}(?:clean|归零|通过)",
        drift_text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(_review_error(source, "drifted comparisons must be forbidden from claiming clean"))
    return errors


def lint_review_remediation_feedback_loop(
    regions: dict[str, str], source: str, *, trellis: bool
) -> list[str]:
    """Require one stable ledger and a checker-to-implementation feedback edge."""
    errors: list[str] = []
    iteration = regions["iteration"]
    constraint_loop = regions["constraints"] + "\n" + iteration
    ledger_match = re.search(
        r"(?:finding(?:s)?\s+ledger|finding\s*台账|问题台账|发现项台账)",
        iteration,
        flags=re.IGNORECASE,
    )
    if not ledger_match:
        errors.append(_review_error(source, "must name one stable finding ledger"))
    elif not re.search(
        r"(?:stable|稳定).{0,30}(?:finding(?:s)?\s+ledger|finding\s*台账|问题台账|发现项台账)|"
        r"(?:finding(?:s)?\s+ledger|finding\s*台账|问题台账|发现项台账).{0,30}(?:stable|稳定)",
        iteration,
        flags=re.IGNORECASE,
    ):
        errors.append(_review_error(source, "finding ledger must be explicitly stable across rounds"))

    ledger_statement = ""
    if ledger_match:
        ledger_statement = re.split(r"[.\n。]", iteration[ledger_match.start() :], maxsplit=1)[0]
    missing_fields = [
        field
        for field in REVIEW_REMEDIATION_LEDGER_FIELDS
        if not re.search(rf"\b{re.escape(field)}\b", ledger_statement, flags=re.IGNORECASE)
    ]
    if missing_fields:
        errors.append(
            _review_error(
                source,
                "finding ledger missing fields: " + ", ".join(missing_fields),
            )
        )
    if not re.search(
        r"(?:finding\s+IDs?|发现项?\s*ID).{0,50}(?:remain|stay|保持).{0,30}(?:stable|unchanged|稳定|不变).{0,40}(?:round|轮)",
        iteration,
        flags=re.IGNORECASE,
    ):
        errors.append(_review_error(source, "finding IDs must remain stable across rounds"))

    for status in ("open", "fixed", "wontfix", "blocked"):
        if not re.search(rf"\b{status}\b", ledger_statement, flags=re.IGNORECASE):
            errors.append(_review_error(source, f"finding ledger missing `{status}` status"))

    if not all(re.search(rf"\b{status}\b", iteration) for status in ("PASS", "FINDINGS", "BLOCKED")):
        errors.append(
            _review_error(source, "checker result vocabulary must be `PASS | FINDINGS | BLOCKED`")
        )

    findings_edge = re.search(
        r"\bFINDINGS\b.{0,240}(?:trellis-implement|back to implementation|return to implementation|"
        r"回灌.{0,30}(?:实施|实现)|返回.{0,30}(?:实施|实现)).{0,100}(?:same task|同一任务|当前任务)",
        iteration,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not findings_edge:
        errors.append(
            _review_error(
                source,
                "checker `FINDINGS` must feed back to implementation in the same task",
            )
        )
    if not re.search(
        r"\bFINDINGS\b.{0,240}(?:implementation|trellis-implement|实施|实现).{0,160}"
        r"(?:independent\s+)?(?:recheck|check again|复查|重新检查)",
        iteration,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(
            _review_error(source, "implementation feedback must return to an independent recheck")
        )

    same_scope_merge = re.search(
        r"(?:same[- ]scope|within[- ]scope|同范围|原范围).{0,100}"
        r"(?:append|merge|add|追加|合并|加入).{0,80}(?:ledger|台账)",
        iteration,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not same_scope_merge:
        errors.append(
            _review_error(source, "same-scope new findings must merge into the existing ledger")
        )

    no_second_prompt = re.search(
        r"(?:do not|must not|never|without|不得|禁止|不再|不能|无需|不要求).{0,100}"
        r"(?:second|another|new|next|第二条|新的|下一条).{0,50}(?:repair\s+prompt|修复\s*Prompt|Prompt)",
        constraint_loop,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not no_second_prompt:
        errors.append(
            _review_error(source, "must forbid requesting or emitting a second repair Prompt")
        )
    if _statement_has_unnegated_action(
        constraint_loop,
        subject_pattern=r"(?:second|another|new|next|第二条|新的|下一条).{0,50}(?:repair\s+prompt|修复\s*Prompt|Prompt)",
        action_pattern=r"(?:emit|request|generate|create|return|ask|产生|生成|创建|请求|要求|返回)",
    ):
        errors.append(_review_error(source, "must not also authorize a new repair Prompt"))

    round_cap = re.search(
        r"(?:at most|maximum|max|最多|不超过).{0,20}(?:three|3|三).{0,30}(?:round|轮)",
        iteration,
        flags=re.IGNORECASE,
    )
    stall_gate = re.search(
        r"(?:same finding signature|同一 finding signature|同一发现签名).{0,80}"
        r"(?:two|2|两).{0,30}(?:round|轮).{0,80}(?:no progress|无进展).{0,80}\bBLOCKED\b",
        iteration + "\n" + regions["pause"],
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not round_cap:
        errors.append(_review_error(source, "must cap focused repair at three rounds"))
    if not stall_gate:
        errors.append(
            _review_error(source, "must enter `BLOCKED` after two no-progress rounds for one signature")
        )
    if trellis and not re.search(
        r"(?:only after|仅在|只有在).{0,100}(?:completion gate|完成门|完成条件).{0,160}"
        r"(?:commit|提交).{0,200}(?:task\.py\s+archive|archive|归档)",
        iteration,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(
            _review_error(source, "Trellis commit/archive must follow the review-remediation completion gate")
        )
    return errors


def lint_review_remediation_question_gate(
    regions: dict[str, str], source: str
) -> list[str]:
    """Allow a question only for a material user-owned authority decision."""
    errors: list[str] = []
    text = regions["constraints"]
    if "AskUserQuestion" not in text:
        errors.append(
            _review_error(source, "question gate must name Claude Code `AskUserQuestion`")
        )
    if not re.search(
        r"(?:before the first product write|首次产品写入前|第一次产品写入前)",
        text,
        flags=re.IGNORECASE,
    ):
        errors.append(_review_error(source, "question classification must happen before first product write"))
    if not re.search(
        r"(?:only|仅|只有).{0,100}(?:user-owned|用户所有|用户决策).{0,120}"
        r"(?:scope|risk|cost|public behavior|authorization|范围|风险|成本|公开行为|授权)",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(
            _review_error(
                source,
                "question gate must be exclusive to material user-owned scope/risk/cost/behavior/authority decisions",
            )
        )
    if not re.search(
        r"(?:do not|must not|never|不得|禁止|不能)[^.。\n]{0,120}"
        r"(?:same[- ]scope|同范围|原范围)[^.。\n]{0,80}(?:finding|发现)[^.。\n]{0,100}"
        r"(?:AskUserQuestion|question|ask|提问|询问)",
        text,
        flags=re.IGNORECASE,
    ):
        errors.append(
            _review_error(source, "same-scope findings must not trigger a user question")
        )
    if not re.search(
        r"(?:do not|must not|never|不得|禁止|不能)[^.。\n]{0,120}"
        r"(?:ordinary implementation|implementation detail|普通实现|实现细节)[^.。\n]{0,100}"
        r"(?:AskUserQuestion|question|ask|提问|询问)",
        text,
        flags=re.IGNORECASE,
    ):
        errors.append(_review_error(source, "ordinary implementation choices must not trigger a user question"))
    if not re.search(
        r"(?:do not|must not|never|不得|禁止|不能)[^.。\n]{0,160}"
        r"(?:repository-readable|repository facts|原扫描|scanner rerun|per-batch|每批|仓库可回答)[^.。\n]{0,160}"
        r"(?:AskUserQuestion|question|ask|提问|询问)",
        text,
        flags=re.IGNORECASE,
    ):
        errors.append(
            _review_error(source, "repository facts, scanner reruns, and per-batch approval must stay outside the question gate")
        )
    if not re.search(
        r"(?:another|other|其他).{0,30}(?:host|platform|宿主|平台).{0,60}(?:actual|available|实际|可用).{0,30}(?:equivalent|等价)",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    ) or not re.search(
        r"(?:without|no|没有|无).{0,30}(?:structured|结构化).{0,30}(?:tool|工具).{0,50}(?:one|一个).{0,30}(?:concise|short|简短|简洁).{0,20}(?:question|问题)",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(
            _review_error(source, "question gate must name the actual host equivalent and one concise no-tool fallback")
        )
    if _statement_has_unnegated_action(
        text,
        subject_pattern=r"(?:same[- ]scope|同范围|原范围).{0,80}(?:finding|发现)",
        action_pattern=r"(?:may|can|use|trigger|可|可以|触发|使用).{0,40}(?:AskUserQuestion|question|ask|提问|询问)",
    ):
        errors.append(_review_error(source, "must not also authorize questions for same-scope findings"))
    return errors


def lint_review_remediation_completion(
    regions: dict[str, str], source: str
) -> list[str]:
    """Require conjunctive zero-open, same-envelope rescan, regression and scope gates."""
    errors: list[str] = []
    completion = regions["completion"]
    pause = regions["pause"]
    if not re.search(
        r"(?:complete only when|completion requires all|only when all|只有在.{0,60}全部|完成.*同时满足|合取)",
        completion,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(_review_error(source, "completion conditions must make the final gate conjunctive"))
    checks = [
        (
            r"(?:open actionable findings|可执行的 open findings|开放可执行发现).{0,20}(?:=|为|等于)\s*0",
            "completion must require `open actionable findings = 0`",
        ),
        (
            r"(?:original|same|原始|原参数|同参数).{0,50}(?:scanner|scan|扫描).{0,80}(?:same envelope|同一 envelope|同一扫描包络|原 envelope)",
            "completion must rerun the original scanner with the same envelope",
        ),
        (
            r"(?:regression|回归).{0,50}(?:pass|通过)",
            "completion must require regression checks to pass",
        ),
        (
            r"(?:just ci|final gate|最终门禁).{0,50}(?:pass|通过|exit(?:s| code)?\s*(?:zero|0)|退出码为\s*0)",
            "completion must require the named final gate to pass",
        ),
        (
            r"(?:diff|status).{0,80}(?:scope|boundary|越界|范围|边界)",
            "completion must inspect diff/status for scope escape",
        ),
    ]
    for pattern, message in checks:
        if not re.search(pattern, completion, flags=re.IGNORECASE | re.DOTALL):
            errors.append(_review_error(source, message))
    if not re.search(
        r"(?:third|3rd|第三|three|3|三).{0,30}(?:round|轮).{0,80}"
        r"(?:open actionable|仍有.{0,30}(?:open|未关闭)).{0,80}\bBLOCKED\b",
        pause,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(
            _review_error(source, "round-cap residual findings must end `BLOCKED`, not complete")
        )
    if not re.search(
        r"\bBLOCKED\b.{0,100}(?:residual ledger|剩余台账|残余台账|残余 ledger).{0,80}(?:stop|report|停止|报告)",
        pause,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        errors.append(_review_error(source, "`BLOCKED` must stop with the residual ledger"))
    return errors


def lint_review_remediation(
    text: str, source: str, *, contract: bool = False
) -> list[str]:
    errors: list[str] = []
    regions = _review_regions(text, contract=contract)
    errors.extend(lint_review_remediation_envelope(regions, source))
    errors.extend(
        lint_review_remediation_feedback_loop(
            regions,
            source,
            trellis=_is_trellis_implementation(text),
        )
    )
    errors.extend(lint_review_remediation_question_gate(regions, source))
    errors.extend(lint_review_remediation_completion(regions, source))
    return errors


def _trellis_first_statement(text: str) -> str:
    """Return the first execution-policy statement, not a later dispatch hint."""
    if re.search(r"^## Objective\s*$", text, flags=re.MULTILINE):
        objective = _sections(text).get("Objective", "")
        first_line = next((line.strip() for line in objective.splitlines() if line.strip()), "")
    else:
        match = re.search(r"^\s*/goal\s+(.+)$", text, flags=re.MULTILINE)
        first_line = match.group(1).strip() if match else ""

    # Inline /goal payloads commonly put the whole contract on one physical
    # line. Treat semicolons and sentence-ending punctuation as statement
    # boundaries so a switch buried in a later clause cannot satisfy the
    # first-statement contract. Require whitespace after an ASCII period to
    # avoid splitting paths such as `.trellis/tasks/...`.
    return re.split(
        r"(?<=[;；。！？])\s*|(?<=[.!?])\s+",
        first_line,
        maxsplit=1,
    )[0].strip()


def _has_trellis_dispatch(cadence: str) -> bool:
    return bool(
        re.search(r"trellis-implement", cadence, flags=re.IGNORECASE)
        and re.search(r"trellis-check", cadence, flags=re.IGNORECASE)
    )


def lint_trellis_dispatch(text: str, source: str, *, cadence: str) -> list[str]:
    """Require a first-statement subagent switch consistent with later execution policy.

    Missing or contradictory policy is a contract defect and belongs in errors,
    not warnings.
    """
    errors: list[str] = []
    first_statement = _trellis_first_statement(text)
    default_on = _matches_any(first_statement, SUBAGENT_DEFAULT_ON_PATTERNS)
    opt_out = _matches_any(first_statement, SUBAGENT_OPT_OUT_PATTERNS)
    fallback = _matches_any(first_statement, SUBAGENT_FALLBACK_PATTERNS)
    has_dispatch = _has_trellis_dispatch(cadence)

    if default_on and opt_out:
        errors.append(
            f"{source}: Trellis first statement cannot mark subagents both default-on "
            "and explicitly disabled by the user"
        )
        return errors

    if fallback:
        if not default_on:
            errors.append(
                f"{source}: Trellis inline technical fallback must keep the subagent "
                "preference marked default-on in the first /goal statement"
            )
        if not _matches_any(first_statement, SUBAGENT_FALLBACK_REASON_PATTERNS):
            errors.append(
                f"{source}: Trellis inline technical fallback must name a workflow, "
                "dispatch_mode, host, or platform capability reason in the first statement"
            )
        if has_dispatch:
            errors.append(
                f"{source}: Trellis first statement declares inline technical fallback "
                "but later cadence still dispatches trellis-implement / trellis-check"
            )
        return errors

    if opt_out:
        if has_dispatch:
            errors.append(
                f"{source}: Trellis first statement says the user explicitly disabled "
                "subagents but later cadence still dispatches them"
            )
        return errors

    if not default_on:
        errors.append(
            f"{source}: Trellis implementation first /goal statement must say "
            "`优先使用 subagents` and mark the switch default-on, or record an "
            "explicit user opt-out / explained inline technical fallback"
        )
        return errors

    if _matches_any(cadence, INLINE_MODE_PATTERNS) and not has_dispatch:
        errors.append(
            f"{source}: Trellis first statement marks subagents default-on but later "
            "cadence silently switches to inline execution"
        )
    elif not has_dispatch:
        errors.append(
            f"{source}: Trellis implementation with subagents default-on must require "
            "dispatch of `trellis-implement` / `trellis-check`"
        )
    return errors


def lint_trellis_closeout(text: str, source: str, *, cadence: str) -> list[str]:
    """Require current-task product/planning commits before task archive."""
    errors: list[str] = []
    product_match = next(
        (
            re.search(pattern, cadence, flags=re.IGNORECASE)
            for pattern in TRELLIS_PRODUCT_CHANGE_PATTERNS
            if re.search(pattern, cadence, flags=re.IGNORECASE)
        ),
        None,
    )
    planning_match = next(
        (
            re.search(pattern, cadence, flags=re.IGNORECASE)
            for pattern in TRELLIS_PLANNING_ARTIFACT_PATTERNS
            if re.search(pattern, cadence, flags=re.IGNORECASE)
        ),
        None,
    )
    archive_match = re.search(
        TRELLIS_CONCRETE_ARCHIVE_PATTERN,
        cadence,
        flags=re.IGNORECASE,
    )

    if product_match is None:
        errors.append(f"{source}: Trellis closeout must commit the current task's product changes")
    if planning_match is None:
        errors.append(
            f"{source}: Trellis closeout must commit the current task's planning artifacts "
            "before archive"
        )
    if not _matches_any(cadence, TRELLIS_HISTORY_CONFIRMATION_PATTERNS):
        errors.append(
            f"{source}: Trellis closeout must confirm product changes and current-task "
            "planning artifacts are in version history before archive"
        )
    if archive_match is None:
        errors.append(
            f"{source}: Trellis closeout must run `task.py archive` with the concrete "
            "current task directory"
        )
    if archive_match and (
        (product_match is not None and product_match.start() > archive_match.start())
        or (planning_match is not None and planning_match.start() > archive_match.start())
    ):
        errors.append(
            f"{source}: Trellis archive must follow the current-task product and planning commits"
        )
    if not _matches_any(text, TRELLIS_UNRELATED_TASK_EXCLUSION_PATTERNS):
        errors.append(
            f"{source}: Trellis planning commit must explicitly exclude unrelated or other task directories"
        )
    if not _matches_any(text, TRELLIS_OUT_OF_SCOPE_DIRTY_EXCLUSION_PATTERNS):
        errors.append(
            f"{source}: Trellis closeout must explicitly preserve out-of-scope dirty files"
        )
    if not _matches_any(text, TRELLIS_ARCHIVE_COMMIT_SEPARATION_PATTERNS):
        errors.append(
            f"{source}: Trellis closeout must keep the archive commit separate from "
            "product changes and pre-archive planning artifacts"
        )
    return errors


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
    review_remediation: bool = False,
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

    if _is_trellis_implementation(text):
        cadence = _trellis_cadence_region(text)
        errors.extend(lint_trellis_closeout(text, source, cadence=cadence))
        errors.extend(
            lint_trellis_dispatch(text, source, cadence=cadence)
        )

    if review_remediation:
        goal_blocks = _inline_goal_blocks(text)
        if not goal_blocks:
            errors.append(_review_error(source, "profile requires an inline `/goal` block"))
        for index, block in enumerate(goal_blocks, start=1):
            errors.extend(
                lint_review_remediation(
                    block,
                    f"{source} /goal[{index}]",
                )
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
    review_remediation: bool = False,
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
    if metadata.get("Generated by") != "goal-meta-skill 0.8.0":
        errors.append(f"{source}: Generated by must be `goal-meta-skill 0.8.0`")
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

    if _is_trellis_implementation(text):
        for artifact in ("prd.md", "design.md", "implement.md"):
            if artifact not in sections["Required reading and current context"]:
                errors.append(f"{source}: Trellis contract must link concrete `{artifact}`")
        cadence = sections["Iteration policy"] + "\n" + sections["Completion conditions"]
        if not re.search(r"commit|提交", cadence, flags=re.IGNORECASE) or "archive" not in cadence:
            errors.append(f"{source}: Trellis contract must preserve commit-then-archive cadence")
        errors.extend(lint_trellis_closeout(text, source, cadence=cadence))
        errors.extend(lint_trellis_dispatch(text, source, cadence=cadence))

    if review_remediation:
        errors.extend(lint_review_remediation(text, source, contract=True))

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
        "--review-remediation",
        action="store_true",
        help="Fail closed on the frozen scan, finding-ledger feedback, question, and convergence contract.",
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
                    review_remediation=args.review_remediation,
                )
            )
        else:
            all_errors.extend(
                lint_text(
                    text,
                    str(path),
                    require_chinese_companion=args.require_chinese_companion,
                    platform=args.platform or "both",
                    review_remediation=args.review_remediation,
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
