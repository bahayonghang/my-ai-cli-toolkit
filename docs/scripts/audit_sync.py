#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_SKILLS = REPO_ROOT / "content" / "skills"
DOCS_SKILLS = REPO_ROOT / "docs" / "skills"
DOCS_ZH_SKILLS = REPO_ROOT / "docs" / "zh" / "skills"
DOCS_ROOT = REPO_ROOT / "docs"

FORBIDDEN_DOC_REFERENCES = {
    "content/agents/": "stale agents layout (current: content/platforms/<platform>/agents/)",
    "content/commands/": "stale commands layout (current: content/platforms/<platform>/commands/)",
    "content/memorys/": "stale runtime layout (current: content/platforms/<platform>/{prompts,rules}/)",
    "content/platforms/*/guidance/": "stale guidance glob (current: content/platforms/<platform>/rules/)",
    "content/platforms/codex/guidance/": "stale Codex guidance path (current: content/platforms/codex/rules/)",
    "content/platforms/claude/guidance/": "stale Claude guidance path (current: root CLAUDE.md plus content/platforms/claude/commands/init-projects.md)",
}

RETIRED_COMMAND_DOCS = {
    "cc",
    "cli",
    "gh",
    "issue",
    "kiro",
    "memory",
    "task",
    "workflow",
    "zcf",
    "utilities",
}

LIVE_COMMAND_DOCS = {
    DOCS_ROOT / "commands" / "index.md",
    DOCS_ROOT / "commands" / "catalog.md",
    DOCS_ROOT / "commands" / "export-summary.md",
    DOCS_ROOT / "commands" / "import-summary.md",
    DOCS_ROOT / "zh" / "commands" / "index.md",
    DOCS_ROOT / "zh" / "commands" / "catalog.md",
    DOCS_ROOT / "zh" / "commands" / "export-summary.md",
    DOCS_ROOT / "zh" / "commands" / "import-summary.md",
}

EXPECTED_COMMAND_SOURCES = {
    "claude": {"archive-planning", "init-projects"},
    "gemini": {"export-summary", "import-summary", "plan/new", "plan/impl"},
    "antigravity": {"export-summary", "import-summary"},
    "trae": {"export-summary", "import-summary"},
    "windsurf": {"export-summary", "import-summary"},
}

ALLOWED_EXTRA_SKILL_DOCS = {
    ("visual-media-design", "gemini-image"): (
        "docs-only compatibility page kept after the in-repo skill removal"
    ),
}


def skill_categories() -> list[str]:
    return sorted(
        entry.name
        for entry in CONTENT_SKILLS.iterdir()
        if entry.is_dir() and not entry.name.startswith(".")
    )


def source_skill_names(category: str) -> set[str]:
    category_dir = CONTENT_SKILLS / category
    return {
        entry.name
        for entry in category_dir.iterdir()
        if entry.is_dir()
        and not entry.name.startswith(".")
        and (entry / "SKILL.md").is_file()
    }


def docs_skill_names(root: Path, category: str) -> set[str]:
    category_dir = root / category
    if not category_dir.exists():
        return set()
    return {
        file.stem
        for file in category_dir.glob("*.md")
        if file.name != "index.md"
    }


def docs_category_names(root: Path) -> set[str]:
    if not root.exists():
        return set()
    return {
        entry.name
        for entry in root.iterdir()
        if entry.is_dir() and not entry.name.startswith(".")
    }


def compare_skill_docs(root: Path, label: str) -> list[str]:
    issues: list[str] = []
    source_categories = set(skill_categories())
    docs_categories = docs_category_names(root)

    for category in sorted(docs_categories - source_categories):
        issues.append(f"[{label}] extra doc category without source category: {category}/")

    for category in skill_categories():
        source = source_skill_names(category)
        docs = docs_skill_names(root, category)

        missing = sorted(source - docs)
        extra = sorted(docs - source)

        for name in missing:
            issues.append(f"[{label}] missing doc page: {category}/{name}.md")

        for name in extra:
            if (category, name) in ALLOWED_EXTRA_SKILL_DOCS:
                continue
            issues.append(f"[{label}] extra doc page without source skill: {category}/{name}.md")

    return issues


def stale_reference_checks() -> list[str]:
    files = [
        REPO_ROOT / "README.md",
        REPO_ROOT / "README_CN.md",
        REPO_ROOT / "docs" / "index.md",
        REPO_ROOT / "docs" / "zh" / "index.md",
        REPO_ROOT / "docs" / "guide" / "installation.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "installation.md",
        REPO_ROOT / "docs" / "guide" / "mcs.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "mcs.md",
        REPO_ROOT / "docs" / "guide" / "mcs-web.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "mcs-web.md",
        REPO_ROOT / "docs" / "guide" / "mcs-architecture.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "mcs-architecture.md",
        REPO_ROOT / "docs" / "guide" / "runtime-files.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "runtime-files.md",
        REPO_ROOT / "docs" / "guide" / "community-skills-registry.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "community-skills-registry.md",
        REPO_ROOT / "docs" / "guide" / "creating-skills.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "creating-skills.md",
        REPO_ROOT / "docs" / "commands" / "index.md",
        REPO_ROOT / "docs" / "commands" / "catalog.md",
        REPO_ROOT / "docs" / "zh" / "commands" / "index.md",
        REPO_ROOT / "docs" / "zh" / "commands" / "catalog.md",
        REPO_ROOT / "docs" / "agents" / "index.md",
        REPO_ROOT / "docs" / "agents" / "ccw.md",
        REPO_ROOT / "docs" / "agents" / "specialist.md",
        REPO_ROOT / "docs" / "zh" / "agents" / "index.md",
        REPO_ROOT / "docs" / "zh" / "agents" / "ccw.md",
        REPO_ROOT / "docs" / "zh" / "agents" / "specialist.md",
        REPO_ROOT / "content" / "skills" / "README.md",
        REPO_ROOT / "content" / "skills" / "CLAUDE.md",
        REPO_ROOT / "content" / "agents" / "CLAUDE.md",
    ]
    registry_dir = REPO_ROOT / "content" / "community-skills-registry"
    if registry_dir.exists():
        files.extend(sorted(registry_dir.rglob("*.toml")))

    forbidden = {
        "my-claude-skills": "stale repository name",
        "src/install.py": "stale CLI install path",
        "install.sh": "stale shell installer reference",
        "install.ps1": "stale shell installer reference",
        "skill-meta-skills": "stale skills category name (current: meta-skills)",
    }

    issues: list[str] = []
    for file in files:
        if not file.exists():
            continue
        text = file.read_text(encoding="utf-8")
        for needle, reason in forbidden.items():
            if needle in text:
                issues.append(f"[stale] {file.relative_to(REPO_ROOT)} contains {needle!r} ({reason})")

    return issues


def forbidden_doc_reference_checks() -> list[str]:
    issues: list[str] = []

    for file in DOCS_ROOT.rglob("*.md"):
        if not file.is_file():
            continue
        text = file.read_text(encoding="utf-8")
        for needle, reason in FORBIDDEN_DOC_REFERENCES.items():
            if needle in text:
                issues.append(
                    f"[docs] {file.relative_to(REPO_ROOT)} contains {needle!r} ({reason})"
                )

    return issues



def normalized_command_name(path: Path, command_root: Path) -> str | None:
    rel = path.relative_to(command_root)
    if path.suffix.lower() not in {".md", ".toml"}:
        return None
    parts = list(rel.with_suffix("").parts)
    if not parts:
        return None
    return "/".join(parts)


def command_source_inventory() -> dict[str, set[str]]:
    platforms_root = REPO_ROOT / "content" / "platforms"
    inventory: dict[str, set[str]] = {}
    if not platforms_root.exists():
        return inventory

    for commands_dir in sorted(platforms_root.glob("*/commands")):
        platform = commands_dir.parent.name
        names: set[str] = set()
        for file in commands_dir.rglob("*"):
            if not file.is_file():
                continue
            name = normalized_command_name(file, commands_dir)
            if name is None:
                continue
            # Compatibility typo retained in the tree; the canonical source is import-summary.
            if platform == "gemini" and name == "import- summary":
                continue
            names.add(name)
        inventory[platform] = names
    return inventory


def command_source_checks() -> list[str]:
    issues: list[str] = []
    actual = command_source_inventory()

    if actual != EXPECTED_COMMAND_SOURCES:
        issues.append(
            "[commands] live command inventory drifted; update docs/commands/catalog.md "
            f"and EXPECTED_COMMAND_SOURCES (actual={actual!r}, expected={EXPECTED_COMMAND_SOURCES!r})"
        )

    return issues


def command_sidebar_checks() -> list[str]:
    issues: list[str] = []
    config = REPO_ROOT / "docs" / ".vitepress" / "config.mts"
    if not config.exists():
        return issues
    text = config.read_text(encoding="utf-8")
    for name in sorted(RETIRED_COMMAND_DOCS):
        for prefix in ("/commands/", "/zh/commands/"):
            needle = f"{prefix}{name}"
            if needle in text:
                issues.append(f"[commands] live sidebar links retired command page: {needle}")
    return issues


def live_command_doc_reference_checks() -> list[str]:
    issues: list[str] = []
    retired_needles = [
        f"](/commands/{name})" for name in RETIRED_COMMAND_DOCS
    ] + [
        f"](/zh/commands/{name})" for name in RETIRED_COMMAND_DOCS
    ]
    stale_source_needles = [
        "content/platforms/claude/commands/cc/",
        "content/platforms/claude/commands/cli/",
        "content/platforms/claude/commands/gh/",
        "content/platforms/claude/commands/issue/",
        "content/platforms/claude/commands/kiro/",
        "content/platforms/claude/commands/memory/",
        "content/platforms/claude/commands/task/",
        "content/platforms/claude/commands/workflow/",
        "content/platforms/claude/commands/zcf/",
        "content/platforms/gemini/commands/zcf/",
        "content/platforms/trae/commands/zcf/",
    ]

    for file in sorted(LIVE_COMMAND_DOCS):
        if not file.exists():
            issues.append(f"[commands] missing live command doc: {file.relative_to(REPO_ROOT)}")
            continue
        text = file.read_text(encoding="utf-8")
        for needle in retired_needles + stale_source_needles:
            if needle in text:
                issues.append(
                    f"[commands] {file.relative_to(REPO_ROOT)} references retired command source/page: {needle}"
                )
    return issues


def retired_command_page_checks() -> list[str]:
    issues: list[str] = []
    for root, marker in [
        (DOCS_ROOT / "commands", "Historical / offline note"),
        (DOCS_ROOT / "zh" / "commands", "历史 / 已下线说明"),
    ]:
        for name in sorted(RETIRED_COMMAND_DOCS):
            file = root / f"{name}.md"
            if file.exists() and marker not in file.read_text(encoding="utf-8"):
                issues.append(f"[commands] retired page lacks historical banner: {file.relative_to(REPO_ROOT)}")
    return issues


def readme_skill_link_checks() -> list[str]:
    issues: list[str] = []
    import re

    for file in [REPO_ROOT / "README.md", REPO_ROOT / "README_CN.md"]:
        if not file.exists():
            continue
        text = file.read_text(encoding="utf-8")
        for match in re.finditer(r"`(docs/(?:zh/)?skills/[^`]+?\.md)`", text):
            target = REPO_ROOT / match.group(1)
            if not target.is_file():
                issues.append(
                    f"[readme] {file.name} links missing skill doc: {match.group(1)}"
                )
    return issues

def compare_i18n_section(section: str) -> list[str]:
    issues: list[str] = []
    en_root = DOCS_ROOT / section
    zh_root = DOCS_ROOT / "zh" / section

    if not en_root.exists() or not zh_root.exists():
        return issues

    en_files = sorted(
        file.relative_to(en_root)
        for file in en_root.rglob("*.md")
        if file.is_file()
    )
    zh_files = sorted(
        file.relative_to(zh_root)
        for file in zh_root.rglob("*.md")
        if file.is_file()
    )

    en_set = set(en_files)
    zh_set = set(zh_files)

    for rel in sorted(en_set - zh_set):
        issues.append(f"[i18n] missing zh page: zh/{section}/{rel}")
    for rel in sorted(zh_set - en_set):
        issues.append(f"[i18n] extra zh page without en peer: zh/{section}/{rel}")

    return issues


def main() -> int:
    issues: list[str] = []
    issues.extend(compare_skill_docs(DOCS_SKILLS, "en"))
    issues.extend(compare_skill_docs(DOCS_ZH_SKILLS, "zh"))
    issues.extend(stale_reference_checks())
    issues.extend(forbidden_doc_reference_checks())
    issues.extend(command_source_checks())
    issues.extend(command_sidebar_checks())
    issues.extend(live_command_doc_reference_checks())
    issues.extend(retired_command_page_checks())
    issues.extend(readme_skill_link_checks())
    issues.extend(compare_i18n_section("commands"))
    issues.extend(compare_i18n_section("agents"))
    if issues:
        print("Documentation audit failed:\n")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Documentation audit passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
