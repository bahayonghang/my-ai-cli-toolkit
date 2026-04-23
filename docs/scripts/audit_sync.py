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
    "content/memorys/": "stale prompts/memory layout (current: content/platforms/*/guidance/)",
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
