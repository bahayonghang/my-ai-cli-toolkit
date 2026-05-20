#!/usr/bin/env python3
"""Generate the VitePress docs catalog from repository content sources."""
from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"
SKILLS_DIR = CONTENT_DIR / "skills"
HOOKS_DIR = CONTENT_DIR / "hooks"
PLATFORMS_DIR = CONTENT_DIR / "platforms"
DOCS_DIR = ROOT / "docs"
GENERATED_DIR = DOCS_DIR / ".vitepress" / "generated"
CATALOG_MODULE = GENERATED_DIR / "catalog.mjs"

REPO_SOURCE = "bahayonghang/my-claude-code-settings/content/skills"

CATEGORY_LABELS_ZH = {
    "developer-tools-integrations": "开发者工具集成",
    "development-workflows": "开发工作流",
    "docs-writing-publishing": "文档写作与发布",
    "git-github-collaboration": "Git / GitHub 协作",
    "research-learning-knowledge": "研究、学习与知识",
}

CATEGORY_LABELS_EN = {
    "developer-tools-integrations": "Developer Tools & Integrations",
    "development-workflows": "Development Workflows",
    "docs-writing-publishing": "Docs, Writing & Publishing",
    "git-github-collaboration": "Git & GitHub Collaboration",
    "research-learning-knowledge": "Research, Learning & Knowledge",
}

RESOURCE_LABELS_ZH = {
    "scripts": "可执行脚本",
    "references": "引用资料",
    "tests": "自动化测试",
    "evals": "评测样例",
    "assets": "素材资源",
    "agents": "配套 agent",
    "templates": "模板",
    "schemas": "数据结构",
    "prompts": "提示词",
    "docs": "内嵌文档",
    "examples": "示例",
    "resources": "资源文件",
    "specs": "规格说明",
    "phases": "阶段说明",
    ".omc": "OMC 元数据",
}

RESOURCE_LABELS_EN = {
    "scripts": "Executable scripts",
    "references": "Reference material",
    "tests": "Automated tests",
    "evals": "Evaluation samples",
    "assets": "Assets",
    "agents": "Companion agents",
    "templates": "Templates",
    "schemas": "Schemas",
    "prompts": "Prompts",
    "docs": "Embedded docs",
    "examples": "Examples",
    "resources": "Resources",
    "specs": "Specs",
    "phases": "Phase guides",
    ".omc": "OMC metadata",
}

IMPORTANT_RESOURCE_NAMES = set(RESOURCE_LABELS_EN)

HOOK_ROLE_ZH = {
    "hooks.json": "声明 hook 入口、matcher 与命令调用顺序。",
    "pre-bash.py": "在 Bash 调用前做保守危险命令拦截。",
    "inject-spec.py": "兼容保留的 no-op spec 注入入口。",
    "log-prompt.py": "记录 UserPromptSubmit 输入，写入本地会话日志。",
}

HOOK_ROLE_EN = {
    "hooks.json": "Declares hook entrypoints, matchers, and command order.",
    "pre-bash.py": "Blocks conservative dangerous Bash fragments before execution.",
    "inject-spec.py": "Compatibility no-op for the former spec-injection hook.",
    "log-prompt.py": "Logs UserPromptSubmit input to local session logs.",
}

PLATFORM_LABELS_ZH = {
    "antigravity": "Antigravity",
    "claude": "Claude",
    "codex": "Codex",
}

PLATFORM_LABELS_EN = PLATFORM_LABELS_ZH.copy()


@dataclass(frozen=True)
class ResourceEntry:
    name: str
    rel_path: str
    kind: str
    count: int


@dataclass(frozen=True)
class SkillEntry:
    name: str
    category: str
    description: str
    version: str
    tags: tuple[str, ...]
    rel_dir: str
    rel_skill_md: str
    resources: tuple[ResourceEntry, ...]
    has_python: bool
    has_node_tests: bool


@dataclass(frozen=True)
class HookEntry:
    name: str
    rel_path: str
    role_zh: str
    role_en: str
    summary: str


@dataclass(frozen=True)
class PlatformEntry:
    name: str
    groups: dict[str, list[str]]


@dataclass(frozen=True)
class GeneratedFile:
    path: Path
    content: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Fail if generated docs are not up to date instead of writing files.",
    )
    return parser.parse_args()


def posix(path: Path | str) -> str:
    return str(path).replace("\\", "/")


def rel(path: Path) -> str:
    return posix(path.relative_to(ROOT))


def parse_frontmatter(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    data = yaml.safe_load(match.group(1))
    return data if isinstance(data, dict) else {}


def as_str(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    if isinstance(value, str):
        return " ".join(value.split())
    return str(value)


def as_tags(value: Any) -> tuple[str, ...]:
    if isinstance(value, list):
        return tuple(as_str(item) for item in value if as_str(item))
    if isinstance(value, str):
        return tuple(part.strip() for part in value.split(",") if part.strip())
    return ()


def count_files(path: Path) -> int:
    if path.is_file():
        return 1
    return sum(
        1
        for child in path.rglob("*")
        if child.is_file() and "__pycache__" not in child.parts
    )


def collect_resources(skill_dir: Path) -> tuple[ResourceEntry, ...]:
    entries: list[ResourceEntry] = []
    for child in sorted(skill_dir.iterdir(), key=lambda item: item.name.lower()):
        if child.name in {"SKILL.md", "__pycache__"}:
            continue
        kind = "directory" if child.is_dir() else "file"
        entries.append(
            ResourceEntry(
                name=child.name,
                rel_path=rel(child),
                kind=kind,
                count=count_files(child),
            )
        )
    return tuple(entries)


def discover_skills() -> list[SkillEntry]:
    skills: list[SkillEntry] = []
    for skill_md in sorted(SKILLS_DIR.rglob("SKILL.md"), key=lambda path: rel(path).lower()):
        skill_dir = skill_md.parent
        parts = skill_dir.relative_to(SKILLS_DIR).parts
        if len(parts) < 2:
            continue
        category, slug = parts[0], parts[1]
        meta = parse_frontmatter(skill_md)
        skills.append(
            SkillEntry(
                name=as_str(meta.get("name"), slug),
                category=as_str(meta.get("category"), category),
                description=as_str(meta.get("description"), "No description declared."),
                version=as_str(meta.get("version"), ""),
                tags=as_tags(meta.get("tags")),
                rel_dir=rel(skill_dir),
                rel_skill_md=rel(skill_md),
                resources=collect_resources(skill_dir),
                has_python=any(path.suffix == ".py" for path in skill_dir.rglob("*") if path.is_file()),
                has_node_tests=any(
                    "tests" in path.parts and path.suffix == ".mjs"
                    for path in skill_dir.rglob("*")
                    if path.is_file()
                ),
            )
        )
    return skills


def python_docstring(path: Path) -> str:
    if path.suffix != ".py":
        return ""
    try:
        module = ast.parse(path.read_text(encoding="utf-8"))
        return " ".join((ast.get_docstring(module) or "").split())
    except SyntaxError:
        return ""


def discover_hooks() -> list[HookEntry]:
    hooks: list[HookEntry] = []
    if not HOOKS_DIR.exists():
        return hooks
    for path in sorted(HOOKS_DIR.iterdir(), key=lambda item: item.name.lower()):
        if not path.is_file() or path.name == "__pycache__":
            continue
        summary = python_docstring(path)
        if path.suffix == ".json":
            summary = "Runtime hook declaration file."
        hooks.append(
            HookEntry(
                name=path.name,
                rel_path=rel(path),
                role_zh=HOOK_ROLE_ZH.get(path.name, "运行时 hook 资源。"),
                role_en=HOOK_ROLE_EN.get(path.name, "Runtime hook asset."),
                summary=summary,
            )
        )
    return hooks


def discover_platforms() -> list[PlatformEntry]:
    entries: list[PlatformEntry] = []
    if not PLATFORMS_DIR.exists():
        return entries
    for platform_dir in sorted((p for p in PLATFORMS_DIR.iterdir() if p.is_dir()), key=lambda item: item.name):
        groups: dict[str, list[str]] = {}
        for file_path in sorted(platform_dir.rglob("*"), key=lambda item: rel(item).lower()):
            if not file_path.is_file() or "__pycache__" in file_path.parts:
                continue
            parts = file_path.relative_to(platform_dir).parts
            group = parts[0] if len(parts) > 1 else "root"
            groups.setdefault(group, []).append(rel(file_path))
        entries.append(PlatformEntry(name=platform_dir.name, groups=groups))
    return entries


def code(text: str) -> str:
    return f"`{text}`"


def anchor_slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "section"


def format_tags(tags: tuple[str, ...], empty: str) -> str:
    return ", ".join(code(tag) for tag in tags) if tags else empty


def category_label(slug: str, lang: str) -> str:
    labels = CATEGORY_LABELS_ZH if lang == "zh" else CATEGORY_LABELS_EN
    return labels.get(slug, slug.replace("-", " ").title())


def overview_from_description(description: str) -> str:
    marker = re.search(
        r"\bUse this skill proactively whenever\b|\bUse (?:this skill )?(?:when|whenever)\b|\bTriggers include\b",
        description,
        re.IGNORECASE,
    )
    if marker and marker.start() > 0:
        return description[: marker.start()].strip(" .") + "."
    sentence = re.split(r"(?<=[.!?。！？])\s+", description, maxsplit=1)[0]
    return sentence.strip() or description


def trigger_points(description: str) -> list[str]:
    markers = [
        r"Use this skill proactively whenever",
        r"Use this skill when",
        r"Use whenever",
        r"Use when",
        r"Triggers include",
        r"Trigger even when",
    ]
    lower = description.lower()
    start = -1
    for marker in markers:
        idx = lower.find(marker.lower())
        if idx >= 0 and (start == -1 or idx < start):
            start = idx
    text = description[start:] if start >= 0 else description
    stop = re.search(
        r"\bDo not use\b|\bDo NOT use\b|\bDo not trigger\b|\bPrefer this over\b",
        text,
    )
    if stop and stop.start() > 0:
        text = text[: stop.start()]
    text = re.sub(
        r"^(Use this skill proactively whenever|Use this skill when|Use whenever|Use when|Triggers include|Trigger even when)\s*",
        "",
        text,
        flags=re.IGNORECASE,
    ).strip(" .")
    parts = [
        part.strip(" .")
        for part in re.split(r";|\.(?=\s+[A-Z\"“`]|$)", text)
        if part.strip(" .")
    ]
    return (parts or [description])[:4]


def resource_note(name: str, lang: str) -> str:
    labels = RESOURCE_LABELS_ZH if lang == "zh" else RESOURCE_LABELS_EN
    if name in labels:
        return labels[name]
    if lang == "zh":
        return "顶层文件" if "." in name else "顶层目录"
    return "Top-level file" if "." in name else "Top-level directory"


def skill_detail(skill: SkillEntry, lang: str) -> str:
    zh = lang == "zh"
    missing = "未声明" if zh else "Not declared"
    lines: list[str] = [
        f"# {skill.name}",
        "",
        f"> {'此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。' if zh else 'This page is generated by `docs/scripts/sync_docs_catalog.py` from `SKILL.md`.'}",
        "",
        f"## {'用途概览' if zh else 'Purpose overview'}",
        "",
        overview_from_description(skill.description),
        "",
        f"## {'触发场景' if zh else 'Trigger scenarios'}",
        "",
    ]
    for point in trigger_points(skill.description):
        lines.append(f"- {point}")
    lines.extend(
        [
            "",
            f"## {'元数据' if zh else 'Metadata'}",
            "",
            "| 字段 | 值 |" if zh else "| Field | Value |",
            "| --- | --- |",
            f"| {'名称' if zh else 'Name'} | {code(skill.name)} |",
            f"| {'分类' if zh else 'Category'} | {code(skill.category)} ({category_label(skill.category, lang)}) |",
            f"| {'版本' if zh else 'Version'} | {code(skill.version) if skill.version else missing} |",
            f"| {'标签' if zh else 'Tags'} | {format_tags(skill.tags, missing)} |",
            "",
            f"## {'安装命令' if zh else 'Install command'}",
            "",
            "```bash",
            f"npx skills add {REPO_SOURCE} --skill {skill.name}",
            "```",
            "",
            f"## {'目录内容' if zh else 'Directory contents'}",
            "",
        ]
    )
    if skill.resources:
        lines.extend(
            [
                "| 路径 | 类型 | 文件数 | 说明 |"
                if zh
                else "| Path | Type | Files | Notes |",
                "| --- | --- | ---: | --- |",
            ]
        )
        for entry in skill.resources:
            kind = "目录" if zh and entry.kind == "directory" else "文件" if zh else entry.kind
            lines.append(
                f"| {code(entry.rel_path)} | {kind} | {entry.count} | {resource_note(entry.name, lang)} |"
            )
    else:
        lines.append(
            "未检测到 `SKILL.md` 以外的顶层资源。"
            if zh
            else "No top-level resources beyond `SKILL.md` were detected."
        )

    important = [entry for entry in skill.resources if entry.name in IMPORTANT_RESOURCE_NAMES]
    lines.extend(["", f"## {'脚本、引用与测试资源' if zh else 'Scripts, references, and test resources'}", ""])
    if important:
        lines.extend(
            [
                "| 资源 | 路径 | 用途 |" if zh else "| Resource | Path | Purpose |",
                "| --- | --- | --- |",
            ]
        )
        for entry in important:
            lines.append(f"| {entry.name} | {code(entry.rel_path)} | {resource_note(entry.name, lang)} |")
    else:
        lines.append(
            "未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。"
            if zh
            else "No dedicated `scripts`, `references`, `tests`, or other common resource directories were detected."
        )

    validations = ["just skills-check"]
    if skill.has_python:
        validations.append("just python-check")
    if skill.has_node_tests:
        validations.append("just node-test")
    validations.append("just ci")
    lines.extend(["", f"## {'验证方式' if zh else 'Validation'}", "", "```bash", *validations, "```"])
    if not skill.has_node_tests:
        lines.extend(
            [
                "",
                "此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。"
                if zh
                else "This skill has no detected `tests/*.mjs`; if you add Node tests, make sure `just node-test` covers them.",
            ]
        )

    lines.extend(
        [
            "",
            f"## {'源码路径' if zh else 'Source path'}",
            "",
            f"- {code(skill.rel_skill_md)}",
            f"- {code(skill.rel_dir)}",
            "",
        ]
    )
    return "\n".join(lines)


def group_skills(skills: list[SkillEntry]) -> dict[str, list[SkillEntry]]:
    grouped: dict[str, list[SkillEntry]] = {}
    for skill in sorted(skills, key=lambda item: (item.category, item.name)):
        grouped.setdefault(skill.category, []).append(skill)
    return grouped


def skills_index(skills: list[SkillEntry], lang: str) -> str:
    zh = lang == "zh"
    grouped = group_skills(skills)
    lines = [
        "# Skills",
        "",
        (
            f"`content/skills/` 是一方 skill catalog。当前自动索引到 **{len(grouped)} 个分类、{len(skills)} 个 skill**；每个条目都有独立详情页。"
            if zh
            else f"`content/skills/` is the first-party skill catalog. The generated catalog currently indexes **{len(grouped)} categories and {len(skills)} skills**; every entry has its own detail page."
        ),
        "",
        "## 快速安装" if zh else "## Quick install",
        "",
        "```bash",
        f"npx skills add {REPO_SOURCE}",
        f"npx skills add {REPO_SOURCE} --skill '<skill-name>'",
        "```",
        "",
        "## 如何选择 skill" if zh else "## How to choose a skill",
        "",
    ]
    if zh:
        lines.extend(
            [
                "- 先按分类缩小范围：开发流程、工具集成、Git/GitHub、文档写作、研究学习。",
                "- 再打开详情页确认触发场景、资源目录和验证方式。",
                "- 如果一个任务跨多个 skill，优先选择能覆盖主要执行动作的最小 skill 集合。",
                "- 修改或新增 skill 后，运行 `just docs-sync` 重新生成目录，再运行 `just docs-check`。",
            ]
        )
    else:
        lines.extend(
            [
                "- Start with the category: development workflow, tool integration, Git/GitHub, docs writing, or research/learning.",
                "- Open the detail page to confirm trigger scenarios, bundled resources, and validation commands.",
                "- If a task spans multiple skills, choose the smallest skill set that covers the main execution path.",
                "- After adding or changing a skill, run `just docs-sync` to regenerate the catalog, then `just docs-check`.",
            ]
        )
    lines.extend(["", "## 分类目录" if zh else "## Category catalog", ""])
    for category, entries in grouped.items():
        link_prefix = "/skills" if zh else "/en/skills"
        lines.extend(
            [
                f"### {category_label(category, lang)}",
                "",
                f"`{category}` · {len(entries)} skills",
                "",
            ]
        )
        for skill in entries:
            lines.append(
                f"- [{skill.name}]({link_prefix}/{skill.category}/{skill.name}) — {overview_from_description(skill.description)}"
            )
        lines.append("")
    lines.extend(
        [
            "## Frontmatter 约定" if zh else "## Frontmatter contract",
            "",
            (
                "仓库校验器要求 `SKILL.md` 使用可解析的 YAML frontmatter，并读取 `name`、`description`、`category`、`tags`、`version` 等顶层字段。新增 skill 时保持目录分类与 `category` 一致，并使用 kebab-case skill 名称。"
                if zh
                else "The repository validator expects `SKILL.md` to start with parseable YAML frontmatter and reads top-level fields such as `name`, `description`, `category`, `tags`, and `version`. For new skills, keep the directory category aligned with `category` and use kebab-case skill names."
            ),
            "",
            "## 校验方式" if zh else "## Validation",
            "",
            "```bash",
            "just docs-sync",
            "just docs-check",
            "just skills-check",
            "just ci",
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def hook_trigger_rows() -> list[tuple[str, str, str]]:
    hooks_json = HOOKS_DIR / "hooks.json"
    if not hooks_json.exists():
        return []
    data = json.loads(hooks_json.read_text(encoding="utf-8"))
    rows: list[tuple[str, str, str]] = []
    hooks = data.get("hooks", {}) if isinstance(data, dict) else {}
    if not isinstance(hooks, dict):
        return rows
    for event, definitions in hooks.items():
        if not isinstance(definitions, list):
            continue
        for definition in definitions:
            if not isinstance(definition, dict):
                continue
            matcher = definition.get("matcher", "*")
            commands = []
            for hook in definition.get("hooks", []):
                if isinstance(hook, dict) and hook.get("command"):
                    commands.append(str(hook["command"]))
            rows.append((str(event), str(matcher), "<br>".join(code(command) for command in commands)))
    return rows


def hooks_page(hooks: list[HookEntry], lang: str) -> str:
    zh = lang == "zh"
    rows = hook_trigger_rows()
    lines = [
        "# Hooks",
        "",
        (
            "`content/hooks/` 保存运行时 hook 资产。它们描述 agent runtime 何时调用外部脚本，并把实际逻辑保持为小型、可审计的文件。"
            if zh
            else "`content/hooks/` stores runtime hook assets. They describe when an agent runtime invokes external scripts while keeping behavior in small, auditable files."
        ),
        "",
        "## 运行时触发点" if zh else "## Runtime trigger points",
        "",
    ]
    if rows:
        lines.extend(["| 事件 | 匹配器 | 命令 |" if zh else "| Event | Matcher | Commands |", "| --- | --- | --- |"])
        for event, matcher, commands in rows:
            lines.append(f"| {code(event)} | {code(matcher)} | {commands} |")
    else:
        lines.append("未检测到 `hooks.json` 触发点。" if zh else "No `hooks.json` trigger points were detected.")

    lines.extend(["", "## 文件职责" if zh else "## File responsibilities", ""])
    lines.extend(["| 文件 | 职责 | 备注 |" if zh else "| File | Responsibility | Notes |", "| --- | --- | --- |"])
    for hook in hooks:
        role = hook.role_zh if zh else hook.role_en
        summary = hook.summary or ("无额外 docstring。" if zh else "No additional docstring.")
        lines.append(f"| {code(hook.rel_path)} | {role} | {summary.replace('|', '\\|')} |")

    lines.extend(["", "## Hook 文件目录" if zh else "## Hook file catalog", ""])
    for hook in hooks:
        role = hook.role_zh if zh else hook.role_en
        summary = hook.summary or ("无额外 docstring。" if zh else "No additional docstring.")
        lines.extend(
            [
                f"### {hook.name}",
                "",
                f"- {'路径' if zh else 'Path'}: {code(hook.rel_path)}",
                f"- {'职责' if zh else 'Responsibility'}: {role}",
                f"- {'备注' if zh else 'Notes'}: {summary}",
                "",
            ]
        )

    lines.extend(["", "## 安全边界" if zh else "## Safety boundaries", ""])
    if zh:
        lines.extend(
            [
                "- Hooks 是运行时资源，不是 docs 站构建步骤。",
                "- `pre-bash.py` 只做保守字符串匹配；它是安全护栏，不替代对命令副作用的判断。",
                "- `inject-spec.py` 目前必须保持可执行且无副作用，以兼容仍引用它的旧 hook 配置。",
                "- `log-prompt.py` 写入 `.claude/state/`；该目录属于本地运行状态，不应作为内容源提交。",
            ]
        )
    else:
        lines.extend(
            [
                "- Hooks are runtime assets, not part of the docs-site build pipeline.",
                "- `pre-bash.py` is a conservative string-match guardrail; it does not replace review of command side effects.",
                "- `inject-spec.py` should stay executable and side-effect free while older hook configs still reference it.",
                "- `log-prompt.py` writes local runtime state under `.claude/state/`; that directory is not a content source to commit.",
            ]
        )
    lines.extend(
        [
            "",
            "## 修改后验证" if zh else "## Validation after changes",
            "",
            "```bash",
            "just python-check",
            "just docs-check",
            "just ci",
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def platform_group_label(group: str, lang: str) -> str:
    labels = {
        "commands": "Commands",
        "agents": "Agents",
        "prompts": "Prompts",
        "rules": "Rules",
        "root": "Root files",
    }
    return labels.get(group, group.title())


def commands_page(platforms: list[PlatformEntry], lang: str) -> str:
    zh = lang == "zh"
    lines = [
        "# Commands / Prompts",
        "",
        (
            "平台内容位于 `content/platforms/<platform>/`。不同平台消费内容的方式不同：有的平台使用 command 文件，有的平台使用 prompts、agents 或 rules。"
            if zh
            else "Platform content lives under `content/platforms/<platform>/`. Each platform consumes content differently: some use command files, while others use prompts, agents, or rules."
        ),
        "",
        "## 何时添加 command / prompt / agent / rule" if zh else "## When to add a command, prompt, agent, or rule",
        "",
    ]
    if zh:
        lines.extend(
            [
                "- **Command**：用户显式调用的工作流入口，适合有参数、固定步骤和平台 command 语义的任务。",
                "- **Prompt**：Codex 等平台上的命令式工作流提示，适合复用但不一定映射为 command 文件的流程。",
                "- **Agent**：角色化执行面，适合长期保持独立职责、模型/工具边界或子任务分派。",
                "- **Rule / AGENTS.md**：项目或平台的基础指导，适合默认约束、目录规则和安全边界。",
            ]
        )
    else:
        lines.extend(
            [
                "- **Command**: user-invoked workflow entrypoint with arguments, fixed steps, and platform command semantics.",
                "- **Prompt**: command-like workflow prompt for platforms such as Codex when no command directory is the native surface.",
                "- **Agent**: role-specialized execution surface with stable responsibility, model/tool boundaries, or subtask routing.",
                "- **Rule / AGENTS.md**: baseline project or platform guidance for default constraints, directory rules, and safety boundaries.",
            ]
        )
    lines.extend(["", "## 平台目录" if zh else "## Platform catalog", ""])
    for platform in platforms:
        label = (PLATFORM_LABELS_ZH if zh else PLATFORM_LABELS_EN).get(platform.name, platform.name)
        lines.extend([f"### {label}", "", f"`content/platforms/{platform.name}/`", ""])
        for group, files in sorted(platform.groups.items()):
            lines.extend([f"#### {platform_group_label(group, lang)}", ""])
            for file_path in files:
                lines.append(f"- {code(file_path)}")
            lines.append("")
        if platform.name == "codex":
            lines.append(
                "Codex 当前主要使用 prompt / rule / agent 结构；添加“命令”前应先检查 `prompts/`、`agents/` 和 `rules/` 的既有约定。"
                if zh
                else "Codex currently uses prompt / rule / agent assets; before adding a “command”, check existing `prompts/`, `agents/`, and `rules/` conventions."
            )
            lines.append("")
    lines.extend(
        [
            "## 修改后验证" if zh else "## Validation after changes",
            "",
            "```bash",
            "just docs-check",
            "just ci",
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def make_sidebar_item(text: str, link: str) -> dict[str, str]:
    return {"text": text, "link": link}


def sidebar_module(skills: list[SkillEntry], hooks: list[HookEntry], platforms: list[PlatformEntry]) -> str:
    grouped = group_skills(skills)

    def skills_sidebar(lang: str) -> list[dict[str, Any]]:
        prefix = "" if lang == "zh" else "/en"
        overview = "总览" if lang == "zh" else "Overview"
        sidebar: list[dict[str, Any]] = [
            {"text": "Skills", "items": [make_sidebar_item(overview, f"{prefix}/skills")]}
        ]
        for category, entries in grouped.items():
            sidebar.append(
                {
                    "text": category_label(category, lang),
                    "collapsed": True,
                    "items": [
                        make_sidebar_item(skill.name, f"{prefix}/skills/{skill.category}/{skill.name}")
                        for skill in entries
                    ],
                }
            )
        return sidebar

    def hooks_sidebar(lang: str) -> list[dict[str, Any]]:
        prefix = "" if lang == "zh" else "/en"
        return [
            {"text": "Hooks", "items": [make_sidebar_item("总览" if lang == "zh" else "Overview", f"{prefix}/hooks")]},
            {
                "text": "Hook 文件" if lang == "zh" else "Hook files",
                "collapsed": False,
                "items": [
                    make_sidebar_item(hook.name, f"{prefix}/hooks#{anchor_slug(hook.name)}")
                    for hook in hooks
                ],
            },
        ]

    def commands_sidebar(lang: str) -> list[dict[str, Any]]:
        prefix = "" if lang == "zh" else "/en"
        sidebar: list[dict[str, Any]] = [
            {
                "text": "Commands / Prompts",
                "items": [make_sidebar_item("总览" if lang == "zh" else "Overview", f"{prefix}/commands")],
            }
        ]
        for platform in platforms:
            label = (PLATFORM_LABELS_ZH if lang == "zh" else PLATFORM_LABELS_EN).get(platform.name, platform.name)
            items = [
                make_sidebar_item(
                    f"{platform_group_label(group, lang)} ({len(platform.groups[group])})",
                    f"{prefix}/commands#{anchor_slug(label)}",
                )
                for group in sorted(platform.groups)
            ]
            sidebar.append({"text": label, "collapsed": False, "items": items})
        return sidebar

    exports = {
        "catalogStats": {
            "skills": len(skills),
            "categories": len(grouped),
            "hooks": len(hooks),
            "platforms": len(platforms),
        },
        "zhSkillsSidebar": skills_sidebar("zh"),
        "enSkillsSidebar": skills_sidebar("en"),
        "zhHooksSidebar": hooks_sidebar("zh"),
        "enHooksSidebar": hooks_sidebar("en"),
        "zhCommandsSidebar": commands_sidebar("zh"),
        "enCommandsSidebar": commands_sidebar("en"),
    }
    lines = ["// Generated by docs/scripts/sync_docs_catalog.py. Do not edit by hand."]
    for name, value in exports.items():
        lines.append(f"export const {name} = {json.dumps(value, ensure_ascii=False, indent=2)};")
    lines.append("")
    return "\n".join(lines)


def generated_files(
    skills: list[SkillEntry],
    hooks: list[HookEntry],
    platforms: list[PlatformEntry],
) -> tuple[list[GeneratedFile], set[Path]]:
    files: list[GeneratedFile] = [
        GeneratedFile(CATALOG_MODULE, sidebar_module(skills, hooks, platforms)),
        GeneratedFile(DOCS_DIR / "skills.md", skills_index(skills, "zh")),
        GeneratedFile(DOCS_DIR / "en" / "skills.md", skills_index(skills, "en")),
        GeneratedFile(DOCS_DIR / "hooks.md", hooks_page(hooks, "zh")),
        GeneratedFile(DOCS_DIR / "en" / "hooks.md", hooks_page(hooks, "en")),
        GeneratedFile(DOCS_DIR / "commands.md", commands_page(platforms, "zh")),
        GeneratedFile(DOCS_DIR / "en" / "commands.md", commands_page(platforms, "en")),
    ]
    expected_skill_pages: set[Path] = set()
    for skill in skills:
        zh_path = DOCS_DIR / "skills" / skill.category / f"{skill.name}.md"
        en_path = DOCS_DIR / "en" / "skills" / skill.category / f"{skill.name}.md"
        expected_skill_pages.update({zh_path, en_path})
        files.append(GeneratedFile(zh_path, skill_detail(skill, "zh")))
        files.append(GeneratedFile(en_path, skill_detail(skill, "en")))
    return files, expected_skill_pages


def existing_skill_pages() -> set[Path]:
    roots = [DOCS_DIR / "skills", DOCS_DIR / "en" / "skills"]
    pages: set[Path] = set()
    for root in roots:
        if root.exists():
            pages.update(path for path in root.rglob("*.md") if path.is_file())
    return pages


def normalize_content(content: str) -> str:
    return content.rstrip() + "\n"


def check(files: list[GeneratedFile], expected_skill_pages: set[Path]) -> int:
    drift: list[str] = []
    for generated in files:
        desired = normalize_content(generated.content)
        if not generated.path.exists():
            drift.append(f"missing: {rel(generated.path)}")
            continue
        current = generated.path.read_text(encoding="utf-8")
        if current != desired:
            drift.append(f"outdated: {rel(generated.path)}")
    stale = sorted(existing_skill_pages() - expected_skill_pages)
    for path in stale:
        drift.append(f"stale: {rel(path)}")
    if drift:
        print("Generated docs are out of date. Run `just docs-sync`.", file=sys.stderr)
        for item in drift[:80]:
            print(f"- {item}", file=sys.stderr)
        if len(drift) > 80:
            print(f"... and {len(drift) - 80} more", file=sys.stderr)
        return 1
    print(f"Docs catalog is up to date ({(len(files) - 7) // 2} skills, {len(files)} generated files checked).")
    return 0


def write(files: list[GeneratedFile], expected_skill_pages: set[Path]) -> int:
    for generated in files:
        generated.path.parent.mkdir(parents=True, exist_ok=True)
        generated.path.write_text(normalize_content(generated.content), encoding="utf-8", newline="\n")
    stale = sorted(existing_skill_pages() - expected_skill_pages)
    for path in stale:
        path.unlink()
    for root in [DOCS_DIR / "skills", DOCS_DIR / "en" / "skills"]:
        if root.exists():
            for child in sorted((p for p in root.rglob("*") if p.is_dir()), reverse=True):
                try:
                    child.rmdir()
                except OSError:
                    pass
    print(f"Generated docs catalog: {len(expected_skill_pages)} skill detail pages, {len(files)} total generated files.")
    if stale:
        print(f"Removed {len(stale)} stale generated skill pages.")
    return 0


def main() -> int:
    args = parse_args()
    skills = discover_skills()
    hooks = discover_hooks()
    platforms = discover_platforms()
    files, expected_skill_pages = generated_files(skills, hooks, platforms)
    return check(files, expected_skill_pages) if args.check else write(files, expected_skill_pages)


if __name__ == "__main__":
    raise SystemExit(main())
