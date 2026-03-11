"""Shared utilities for skill-creator scripts."""

import re
from pathlib import Path

FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)


def estimate_tokens(text: str) -> int:
    """Estimate tokens with CJK-aware weighting (~4 chars/token English, ~2 chars/token CJK)."""
    if not text:
        return 0
    cjk = sum(
        1 for c in text
        if '\u4e00' <= c <= '\u9fff'
        or '\u3040' <= c <= '\u30ff'
        or '\uac00' <= c <= '\ud7af'
    )
    ascii_chars = len(text) - cjk
    return max(1, -(ascii_chars // -4) + -(cjk // -2)) if (ascii_chars or cjk) else 0


def parse_frontmatter(content: str) -> tuple[dict[str, str | list[str]], str]:
    """Extract YAML frontmatter as key-value pairs with multi-line and list support.

    Returns (fields_dict, body_text).
    """
    m = FRONTMATTER_PATTERN.match(content)
    if not m:
        return {}, content.strip()
    fm_text = m.group(1)
    body = content[m.end():].strip()
    fields: dict[str, str | list[str]] = {}
    current_key: str | None = None
    for line in fm_text.split("\n"):
        if re.match(r"^\S.*:", line):
            key, val = line.split(":", 1)
            k = key.strip()
            current_key = k
            fields[k] = val.strip()
        elif current_key and line.startswith(("  ", "\t")):
            stripped = line.strip()
            if stripped.startswith("- "):
                item = stripped[2:].strip()
                existing = fields[current_key]
                if isinstance(existing, list):
                    existing.append(item)
                else:
                    fields[current_key] = [item]
            else:
                existing = fields[current_key]
                if isinstance(existing, str):
                    fields[current_key] = existing + " " + stripped
    return fields, body


def parse_skill_md(skill_path: Path) -> tuple[str, str, str]:
    """Parse a SKILL.md file, returning (name, description, full_content)."""
    content = (skill_path / "SKILL.md").read_text()
    fields, _ = parse_frontmatter(content)

    if not fields:
        raise ValueError("SKILL.md missing frontmatter")

    name = fields.get("name", "")
    if isinstance(name, list):
        name = name[0]
    name = str(name).strip('"').strip("'")

    description = fields.get("description", "")
    if isinstance(description, list):
        description = " ".join(description)
    description = str(description).strip('"').strip("'")

    # Strip YAML block scalar indicators (>, |, >-, |-)
    # parse_frontmatter stores them as the start of the value
    for indicator in (">-", "|-", ">", "|"):
        if description == indicator or description.startswith(indicator + " "):
            description = description[len(indicator):].strip()
            break

    return name, description, content
