#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

MAX_SKILL_NAME_LENGTH = 64
CANONICAL_CATEGORY_SLUGS = {
    "development-workflows",
    "developer-tools-integrations",
    "git-github-collaboration",
    "docs-writing-publishing",
    "research-learning-knowledge",
}
ALLOWED_FRONTMATTER_KEYS = {
    "name",
    "description",
    "category",
    "tags",
    "version",
    "metadata",
    "allowed-tools",
    "license",
    "argument-hint",
}


@dataclass
class ValidationResult:
    path: str
    ok: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate skill frontmatter with the repository's current schema.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "targets",
        nargs="*",
        default=["skills"],
        help="Skill directories, SKILL.md files, or parent directories to scan.",
    )
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    skill_dirs = collect_skill_dirs(args.targets)
    if not skill_dirs:
        print("No skills found.", file=sys.stderr)
        return 1

    results = [validate_skill(skill_dir) for skill_dir in skill_dirs]

    if args.json:
        print(
            json.dumps(
                [
                    {
                        "path": result.path,
                        "ok": result.ok,
                        "errors": result.errors,
                        "warnings": result.warnings,
                    }
                    for result in results
                ],
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        render_results(results)

    return 0 if all(result.ok for result in results) else 1


def collect_skill_dirs(targets: list[str]) -> list[Path]:
    skill_dirs: set[Path] = set()
    for raw_target in targets:
        target = Path(raw_target)
        if not target.exists():
            continue
        if target.is_file() and target.name == "SKILL.md":
            skill_dirs.add(target.parent.resolve())
            continue
        if target.is_dir() and target.joinpath("SKILL.md").is_file():
            skill_dirs.add(target.resolve())
            continue
        if target.is_dir():
            for skill_md in target.rglob("SKILL.md"):
                skill_dirs.add(skill_md.parent.resolve())
    return sorted(skill_dirs)


def validate_skill(skill_dir: Path) -> ValidationResult:
    skill_md = skill_dir / "SKILL.md"
    result = ValidationResult(path=str(skill_dir), ok=True)

    if not skill_md.is_file():
        result.ok = False
        result.errors.append("SKILL.md not found")
        return result

    try:
        content = skill_md.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        result.ok = False
        result.errors.append(f"SKILL.md must be UTF-8 encoded: {exc}")
        return result

    if not content.startswith("---"):
        result.ok = False
        result.errors.append("Missing YAML frontmatter")
        return result

    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        result.ok = False
        result.errors.append("Invalid frontmatter delimiters")
        return result

    try:
        frontmatter = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        result.ok = False
        result.errors.append(f"Invalid YAML: {exc}")
        return result

    if not isinstance(frontmatter, dict):
        result.ok = False
        result.errors.append("Frontmatter must be a YAML object")
        return result

    validate_keys(frontmatter, result)
    validate_name(frontmatter.get("name"), result)
    validate_description(frontmatter.get("description"), result)
    validate_category(skill_dir, frontmatter.get("category"), frontmatter.get("metadata"), result)
    validate_tags(frontmatter.get("tags"), frontmatter.get("metadata"), result)

    if result.errors:
        result.ok = False
    return result


def validate_keys(frontmatter: dict[str, Any], result: ValidationResult) -> None:
    unexpected = sorted(set(frontmatter.keys()) - ALLOWED_FRONTMATTER_KEYS)
    if unexpected:
        result.warnings.append(
            "Unexpected frontmatter key(s): " + ", ".join(unexpected)
        )


def validate_name(name: Any, result: ValidationResult) -> None:
    if not isinstance(name, str) or not name.strip():
        result.errors.append("Missing required frontmatter key: name")
        return

    normalized = name.strip()
    if not re.fullmatch(r"[a-z0-9-]+", normalized):
        result.errors.append(
            f"Invalid skill name '{normalized}': use lowercase letters, digits, and hyphens only"
        )
    if normalized.startswith("-") or normalized.endswith("-") or "--" in normalized:
        result.errors.append(
            f"Invalid skill name '{normalized}': do not start/end with hyphens or use consecutive hyphens"
        )
    if len(normalized) > MAX_SKILL_NAME_LENGTH:
        result.errors.append(
            f"Skill name is too long ({len(normalized)} > {MAX_SKILL_NAME_LENGTH})"
        )


def validate_description(description: Any, result: ValidationResult) -> None:
    if not isinstance(description, str) or not description.strip():
        result.errors.append("Missing required frontmatter key: description")
        return

    normalized = description.strip()
    if "<" in normalized or ">" in normalized:
        result.errors.append("Description must not contain angle brackets")
    if len(normalized) > 1024:
        result.errors.append(f"Description is too long ({len(normalized)} > 1024)")


def validate_category(
    skill_dir: Path, category: Any, metadata: Any, result: ValidationResult
) -> None:
    expected_category = infer_directory_category(skill_dir)

    if category is None:
        if metadata_category(metadata):
            result.warnings.append(
                "Nested metadata.category is present, but mcs-core only reads top-level category"
            )
        else:
            result.warnings.append("Top-level category is missing")
        return

    if not isinstance(category, str):
        result.errors.append("category must be a string")
        return

    normalized = category.strip()
    if not normalized:
        result.errors.append("category must not be empty")
        return

    if normalized not in CANONICAL_CATEGORY_SLUGS:
        result.errors.append(
            "category must be one of: " + ", ".join(sorted(CANONICAL_CATEGORY_SLUGS))
        )
        return

    if expected_category and normalized != expected_category:
        result.errors.append(
            f"category '{normalized}' does not match directory category '{expected_category}'"
        )


def validate_tags(tags: Any, metadata: Any, result: ValidationResult) -> None:
    if tags is None:
        if metadata_tags(metadata):
            result.warnings.append(
                "Nested metadata.tags is present, but mcs-core only reads top-level tags"
            )
        return

    if isinstance(tags, list):
        if not all(isinstance(tag, str) and tag.strip() for tag in tags):
            result.errors.append("tags must be a list of non-empty strings")
        return

    if not isinstance(tags, str):
        result.errors.append("tags must be a string or a list of strings")


def metadata_category(metadata: Any) -> str | None:
    if isinstance(metadata, dict):
        value = metadata.get("category")
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def metadata_tags(metadata: Any) -> list[str]:
    if not isinstance(metadata, dict):
        return []
    value = metadata.get("tags")
    if isinstance(value, list):
        return [tag for tag in value if isinstance(tag, str) and tag.strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def infer_directory_category(skill_dir: Path) -> str | None:
    parts = skill_dir.parts
    try:
        skills_index = parts.index("skills")
    except ValueError:
        return skill_dir.parent.name or None

    if len(parts) > skills_index + 1:
        return parts[skills_index + 1]
    return skill_dir.parent.name or None


def render_results(results: list[ValidationResult]) -> None:
    for result in results:
        status = "OK" if result.ok else "FAIL"
        print(f"[{status}] {result.path}")
        for warning in result.warnings:
            print(f"  warning: {warning}")
        for error in result.errors:
            print(f"  error: {error}")


if __name__ == "__main__":
    raise SystemExit(main())
