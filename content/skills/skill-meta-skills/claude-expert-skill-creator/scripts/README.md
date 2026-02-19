# Scripts

Automation utilities for skill packaging.

## package_skill.py

Packages a skill folder into a deployment-ready .zip file.

### Usage

```bash
python package_skill.py <skill-folder> <version> [output-dir]
```

### Examples

```bash
# Package skill in current directory
python package_skill.py ./my-skill 1.0

# Specify output location
python package_skill.py /path/to/skill 2.0 ./releases

# Package this skill itself
python package_skill.py ../ 2.1
```

### What it does

1. Validates skill folder has SKILL.md
2. Generates `DIRECTORY_STRUCTURE.txt` with token estimates
3. Generates `README.md` if missing
4. Creates `skill-name-v{version}.zip`

### Requirements

- Python 3.8+
- Standard library only (no dependencies)
