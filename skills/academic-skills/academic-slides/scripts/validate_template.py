#!/usr/bin/env python3
"""
Validate slide files by detecting unreplaced {{PLACEHOLDER}} patterns.
"""

import json
import re
import sys
from pathlib import Path
from typing import Any


def validate_template(file_path: Path) -> dict[str, Any]:
    """
    Validate a slide file for unreplaced placeholders.

    Args:
        file_path: Path to the slide file to validate

    Returns:
        Dictionary with validation results in JSON format
    """
    # Check if file exists
    if not file_path.exists():
        return {"error": f"File not found: {file_path}", "valid": False}

    # Regex pattern to match {{PLACEHOLDER_NAME}}
    placeholder_pattern = re.compile(r"\{\{([A-Z][A-Z0-9_]*)\}\}")

    placeholders = []

    try:
        # Read file with UTF-8 encoding
        with open(file_path, encoding="utf-8") as f:
            for line_num, line in enumerate(f, start=1):
                # Find all placeholders in this line
                matches = placeholder_pattern.finditer(line)
                for match in matches:
                    placeholder_name = match.group(1)
                    placeholders.append({"name": placeholder_name, "line": line_num, "context": line.strip()})
    except Exception as e:
        return {"error": f"Error reading file: {str(e)}", "valid": False}

    # Build result
    result = {
        "valid": len(placeholders) == 0,
        "file": str(file_path),
        "total_placeholders": len(placeholders),
        "placeholders": placeholders,
    }

    return result


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: validate_template.py <file_path>", "valid": False}))
        sys.exit(1)

    file_path = Path(sys.argv[1])
    result = validate_template(file_path)

    # Output JSON to stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))

    # Exit with appropriate code
    sys.exit(0 if result.get("valid", False) else 1)


if __name__ == "__main__":
    main()
