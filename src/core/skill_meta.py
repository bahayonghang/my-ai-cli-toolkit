"""Skill metadata parsing utilities.

Extracted from SkillManager to serve as shared logic for both CLI and TUI.
Parses YAML frontmatter from SKILL.md files.
"""

from pathlib import Path


def parse_skill_frontmatter(skill_path: Path) -> dict:
    """Parse YAML frontmatter from SKILL.md file.

    Extracts metadata fields: name, description, category, tags, version.
    Handles both inline `tags: [a, b]` and multiline list formats.

    Args:
        skill_path: Path to the skill directory containing SKILL.md

    Returns:
        dict with keys: name, description, category, tags, version
        Missing fields default to None/[]
    """
    result = {
        "name": skill_path.name,  # fallback to directory name
        "description": None,
        "category": None,
        "tags": [],
        "version": None,
    }

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return result

    try:
        with open(skill_md, encoding='utf-8') as f:
            content = f.read()
    except OSError:
        return result

    # Check for YAML frontmatter (--- delimited)
    if not content.startswith('---'):
        # Legacy fallback: search for description line
        for line in content.split('\n'):
            if line.startswith("description:"):
                result["description"] = line.replace("description:", "").strip()
                break
        return result

    # Parse YAML frontmatter
    parts = content.split('---', 2)
    if len(parts) < 3:
        return result

    frontmatter = parts[1].strip()

    # Simple YAML parsing (avoid external dependency)
    current_key = None
    multiline_value = []
    in_multiline = False

    for line in frontmatter.split('\n'):
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            if in_multiline and current_key == "description":
                multiline_value.append("")
            continue

        # Check for key: value pattern
        if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
            # Save previous multiline value
            if in_multiline and current_key:
                if current_key == "description":
                    result["description"] = '\n'.join(multiline_value).strip()
                in_multiline = False
                multiline_value = []

            colon_idx = line.index(':')
            key = line[:colon_idx].strip()
            value = line[colon_idx + 1:].strip()

            if key == "name":
                result["name"] = value if value else skill_path.name
            elif key == "description":
                if value.startswith('|'):
                    # Multiline description
                    in_multiline = True
                    current_key = "description"
                    multiline_value = []
                else:
                    result["description"] = value
            elif key == "category":
                result["category"] = value if value else None
            elif key == "version":
                result["version"] = value if value else None
            elif key == "tags":
                # Handle inline array format: tags: [a, b, c]
                if value.startswith('[') and value.endswith(']'):
                    tags_str = value[1:-1]
                    result["tags"] = [t.strip() for t in tags_str.split(',') if t.strip()]
                elif value:
                    # Single tag on same line
                    result["tags"] = [value]
                else:
                    # Multiline tags list
                    in_multiline = True
                    current_key = "tags"
                    multiline_value = []
        elif in_multiline:
            # Handle multiline content
            if line.startswith('  ') or line.startswith('\t'):
                content_line = line.strip()
                if current_key == "tags" and content_line.startswith('- '):
                    multiline_value.append(content_line[2:].strip())
                elif current_key == "description":
                    multiline_value.append(content_line)
            else:
                # End of multiline
                if current_key == "description":
                    result["description"] = '\n'.join(multiline_value).strip()
                elif current_key == "tags":
                    result["tags"] = multiline_value
                in_multiline = False
                multiline_value = []

    # Handle trailing multiline value
    if in_multiline and current_key:
        if current_key == "description":
            result["description"] = '\n'.join(multiline_value).strip()
        elif current_key == "tags":
            result["tags"] = multiline_value

    return result
