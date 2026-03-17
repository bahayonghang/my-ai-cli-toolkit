#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_SKILLS = REPO_ROOT / "content" / "skills"
DOCS_SKILLS = REPO_ROOT / "docs" / "skills"
DOCS_ZH_SKILLS = REPO_ROOT / "docs" / "zh" / "skills"


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
        if entry.is_dir() and not entry.name.startswith(".")
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


def compare_skill_docs(root: Path, label: str) -> list[str]:
    issues: list[str] = []

    for category in skill_categories():
        source = source_skill_names(category)
        docs = docs_skill_names(root, category)

        missing = sorted(source - docs)
        extra = sorted(docs - source)

        for name in missing:
            issues.append(f"[{label}] missing doc page: {category}/{name}.md")

        for name in extra:
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
        REPO_ROOT / "docs" / "guide" / "external-skills.md",
        REPO_ROOT / "docs" / "zh" / "guide" / "external-skills.md",
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
        REPO_ROOT / "content" / "skills" / "external-skills.toml",
    ]

    forbidden = {
        "my-claude-skills": "stale repository name",
        "src/install.py": "stale CLI install path",
        "install.sh": "stale shell installer reference",
        "install.ps1": "stale shell installer reference",
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


def main() -> int:
    issues: list[str] = []
    issues.extend(compare_skill_docs(DOCS_SKILLS, "en"))
    issues.extend(compare_skill_docs(DOCS_ZH_SKILLS, "zh"))
    issues.extend(stale_reference_checks())

    if issues:
        print("Documentation audit failed:\n")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Documentation audit passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
