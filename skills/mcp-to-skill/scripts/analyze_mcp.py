#!/usr/bin/env python3
"""
Analyze MCP server projects and extract tool definitions.
Supports TypeScript/JavaScript and Python MCP servers.
"""

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any


def find_files(directory: Path, patterns: list[str]) -> list[Path]:
    """Find files matching patterns recursively."""
    files = []
    for pattern in patterns:
        files.extend(directory.rglob(pattern))
    return [f for f in files if 'node_modules' not in str(f) and 'dist' not in str(f)]


def extract_ts_tools(content: str) -> list[dict[str, Any]]:
    """Extract tool definitions from TypeScript MCP server code."""
    tools = []

    # Pattern for script definitions in applescript-mcp style
    script_pattern = r'\{\s*name:\s*["\']([^"\']+)["\'],\s*description:\s*["\']([^"\']+)["\']'
    for match in re.finditer(script_pattern, content, re.DOTALL):
        tools.append({
            'name': match.group(1),
            'description': match.group(2),
            'type': 'script'
        })

    # Pattern for MCP SDK tool definitions
    tool_pattern = r'server\.setRequestHandler\s*\(\s*.*?tools/call.*?\{([^}]+)\}'

    # Pattern for category-based tools
    category_pattern = r'export\s+const\s+(\w+)(?:Category)?\s*:\s*ScriptCategory\s*=\s*\{[^}]*name:\s*["\']([^"\']+)["\'][^}]*description:\s*["\']([^"\']+)["\']'
    for match in re.finditer(category_pattern, content, re.DOTALL):
        tools.append({
            'name': match.group(2),
            'description': match.group(3),
            'type': 'category',
            'variable': match.group(1)
        })

    return tools


def extract_python_tools(content: str) -> list[dict[str, Any]]:
    """Extract tool definitions from Python MCP server code."""
    tools = []

    # Pattern for @mcp.tool() decorator
    tool_pattern = r'@\w+\.tool\(\)\s*(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*(?:->.*?)?:\s*(?:"""|\'\'\')([^"\']+)(?:"""|\'\'\')'
    for match in re.finditer(tool_pattern, content, re.DOTALL):
        tools.append({
            'name': match.group(1),
            'description': match.group(2).strip(),
            'type': 'tool'
        })

    return tools


def analyze_package_json(path: Path) -> dict[str, Any]:
    """Extract info from package.json."""
    try:
        with open(path) as f:
            data = json.load(f)
        return {
            'name': data.get('name', ''),
            'version': data.get('version', ''),
            'description': data.get('description', ''),
            'main': data.get('main', ''),
            'scripts': data.get('scripts', {}),
            'dependencies': list(data.get('dependencies', {}).keys())
        }
    except Exception:
        return {}


def analyze_pyproject(path: Path) -> dict[str, Any]:
    """Extract info from pyproject.toml."""
    try:
        content = path.read_text()
        info = {}

        name_match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', content)
        if name_match:
            info['name'] = name_match.group(1)

        desc_match = re.search(r'description\s*=\s*["\']([^"\']+)["\']', content)
        if desc_match:
            info['description'] = desc_match.group(1)

        return info
    except Exception:
        return {}


def analyze_mcp_project(project_path: str) -> dict[str, Any]:
    """Analyze an MCP server project and extract all relevant information."""
    path = Path(project_path)
    result = {
        'project_path': str(path.absolute()),
        'project_type': 'unknown',
        'name': '',
        'description': '',
        'tools': [],
        'categories': [],
        'dependencies': [],
        'entry_point': ''
    }

    # Check for TypeScript/JavaScript project
    package_json = path / 'package.json'
    if package_json.exists():
        result['project_type'] = 'typescript'
        pkg_info = analyze_package_json(package_json)
        result['name'] = pkg_info.get('name', '')
        result['description'] = pkg_info.get('description', '')
        result['dependencies'] = pkg_info.get('dependencies', [])
        result['entry_point'] = pkg_info.get('main', 'dist/index.js')
        result['scripts'] = pkg_info.get('scripts', {})

    # Check for Python project
    pyproject = path / 'pyproject.toml'
    if pyproject.exists():
        result['project_type'] = 'python'
        py_info = analyze_pyproject(pyproject)
        result['name'] = py_info.get('name', result['name'])
        result['description'] = py_info.get('description', result['description'])

    # Find and analyze source files
    ts_files = find_files(path, ['*.ts', '*.tsx'])
    py_files = find_files(path, ['*.py'])

    all_tools = []
    categories = []

    for ts_file in ts_files:
        try:
            content = ts_file.read_text()
            tools = extract_ts_tools(content)
            for tool in tools:
                tool['source_file'] = str(ts_file.relative_to(path))
                if tool['type'] == 'category':
                    categories.append(tool)
                else:
                    all_tools.append(tool)
        except Exception:
            pass

    for py_file in py_files:
        try:
            content = py_file.read_text()
            tools = extract_python_tools(content)
            for tool in tools:
                tool['source_file'] = str(py_file.relative_to(path))
                all_tools.append(tool)
        except Exception:
            pass

    result['tools'] = all_tools
    result['categories'] = categories

    return result


def main():
    parser = argparse.ArgumentParser(description='Analyze MCP server project')
    parser.add_argument('project_path', help='Path to MCP server project')
    parser.add_argument('--output', '-o', help='Output JSON file path')
    parser.add_argument('--pretty', '-p', action='store_true', help='Pretty print JSON')

    args = parser.parse_args()

    result = analyze_mcp_project(args.project_path)

    indent = 2 if args.pretty else None
    output = json.dumps(result, indent=indent, ensure_ascii=False)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Analysis saved to: {args.output}")
    else:
        print(output)


if __name__ == '__main__':
    main()
