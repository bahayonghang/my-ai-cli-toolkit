#!/usr/bin/env python3
"""
Skill Packaging Script

Packages a skill folder into a deployment-ready .zip file.

Usage:
    python package_skill.py <skill-folder> <version> [output-dir]

Examples:
    python package_skill.py ./billing-migration 1.0
    python package_skill.py /path/to/my-skill 2.1 ./releases

Creates:
    skill-name-v{version}.zip

What it does:
    1. Validates skill folder and SKILL.md exist
    2. Generates DIRECTORY_STRUCTURE.txt
    3. Generates README.md (if missing)
    4. Creates versioned .zip file
"""

import re
import shutil
import sys
from datetime import datetime
from pathlib import Path


def extract_frontmatter(skill_md_path: Path) -> dict:
    """Extract YAML frontmatter from SKILL.md."""
    content = skill_md_path.read_text()

    if not content.startswith("---"):
        return {}

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}

    frontmatter = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            frontmatter[key.strip()] = value.strip()

    return frontmatter


def estimate_tokens(text: str) -> int:
    """Rough token estimate (~4 chars per token for English)."""
    return len(text) // 4


def generate_directory_structure(skill_path: Path, version: str) -> str:
    """Generate DIRECTORY_STRUCTURE.txt content."""

    def build_tree(path: Path, prefix: str = "") -> list[str]:
        """Recursively build directory tree."""
        lines = []
        children = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name))

        for i, child in enumerate(children):
            is_last = i == len(children) - 1
            connector = "└── " if is_last else "├── "
            suffix = "/" if child.is_dir() else ""
            lines.append(f"{prefix}{connector}{child.name}{suffix}")

            if child.is_dir():
                extension = "    " if is_last else "│   "
                lines.extend(build_tree(child, prefix + extension))

        return lines

    # Build tree
    tree_lines = [f"{skill_path.name}/"]
    tree_lines.extend(build_tree(skill_path))

    # Estimate tokens
    skill_md = skill_path / "SKILL.md"
    layer1_tokens = estimate_tokens(skill_md.read_text()) if skill_md.exists() else 0

    # Extract description token count
    frontmatter = extract_frontmatter(skill_md) if skill_md.exists() else {}
    desc = frontmatter.get("description", "")
    desc_tokens = len(desc.split())

    # Layer 2 tokens
    resources_path = skill_path / "resources"
    layer2_tokens = 0
    if resources_path.exists():
        for md_file in resources_path.rglob("*.md"):
            layer2_tokens += estimate_tokens(md_file.read_text())

    structure = "\n".join(tree_lines)

    return f"""{structure}

Token Budget:
- Layer 0 (description): ~{desc_tokens} tokens (always loaded)
- Layer 1 (SKILL.md): ~{layer1_tokens} tokens (loaded on trigger)
- Layer 2 (resources/): ~{layer2_tokens} tokens (loaded selectively)

Version: {version}
Created: {datetime.now().strftime("%Y-%m-%d")}
"""


def generate_readme(skill_name: str, version: str) -> str:
    """Generate README.md with deployment instructions."""
    title = skill_name.replace("-", " ").replace("_", " ").title()

    return f"""# {title}

**Version:** {version}
**Created:** {datetime.now().strftime("%Y-%m-%d")}

## Quick Deploy

1. **Unzip**
   ```bash
   unzip {skill_name}-v{version}.zip
   ```

2. **Install in Claude Desktop**
   - Open Claude Desktop → Settings → Capabilities → Skills
   - Click "Add Skill" or "Upload Skill"
   - Select the `{skill_name}` folder

3. **Verify**
   - Skill appears in your skills list
   - Available in all conversations

## Alternative: Manual Installation

```bash
# Mac/Linux
cp -r {skill_name} ~/Library/Application\\ Support/Claude/skills/

# Windows
copy {skill_name} %APPDATA%\\Claude\\skills\\
```

## Structure

See `DIRECTORY_STRUCTURE.txt` for layout and token budget.

## Usage

See `SKILL.md` for:
- Quick start
- Common scenarios
- Error handling

---

**Ready to use!**
"""


def package_skill(skill_path: Path, version: str, output_dir: Path = None) -> Path:
    """
    Package skill into deployment-ready .zip file.

    Args:
        skill_path: Path to skill folder
        version: Version number (e.g., "1.0")
        output_dir: Where to create .zip (default: current directory)

    Returns:
        Path to created .zip file
    """
    skill_path = skill_path.resolve()
    output_dir = (output_dir or Path.cwd()).resolve()

    # Validate
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill folder not found: {skill_path}")

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        raise FileNotFoundError(f"SKILL.md not found in {skill_path}")

    if not re.match(r"^\d+\.\d+$", version):
        raise ValueError(f"Invalid version format: {version}. Use X.Y (e.g., 1.0, 2.1)")

    skill_name = skill_path.name
    print(f"📦 Packaging: {skill_name} v{version}")
    print(f"   Source: {skill_path}")

    # Generate DIRECTORY_STRUCTURE.txt
    structure_content = generate_directory_structure(skill_path, version)
    (skill_path / "DIRECTORY_STRUCTURE.txt").write_text(structure_content)
    print("   ✓ Generated DIRECTORY_STRUCTURE.txt")

    # Generate README.md if missing
    readme_path = skill_path / "README.md"
    if not readme_path.exists():
        readme_path.write_text(generate_readme(skill_name, version))
        print("   ✓ Generated README.md")
    else:
        print("   ✓ Using existing README.md")

    # Create zip
    zip_name = f"{skill_name}-v{version}"
    zip_path = output_dir / f"{zip_name}.zip"

    if zip_path.exists():
        zip_path.unlink()

    # Create zip with skill folder as root
    shutil.make_archive(str(output_dir / zip_name), "zip", skill_path.parent, skill_name)

    size_kb = zip_path.stat().st_size / 1024
    print(f"   ✓ Created {zip_path.name} ({size_kb:.1f} KB)")

    print(f"\n✅ Package ready: {zip_path}")
    print("\nTo deploy:")
    print("1. Unzip the package")
    print("2. Claude Desktop → Settings → Skills → Add Skill")
    print("3. Select the skill folder")

    return zip_path


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    skill_path = Path(sys.argv[1])
    version = sys.argv[2]
    output_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else None

    try:
        package_skill(skill_path, version, output_dir)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
