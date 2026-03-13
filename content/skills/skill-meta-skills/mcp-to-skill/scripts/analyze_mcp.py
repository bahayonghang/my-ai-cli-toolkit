#!/usr/bin/env python3
"""
Analyze MCP server projects and extract tool, resource, and prompt definitions.
Supports TypeScript/JavaScript and Python MCP servers.
"""

import argparse
import json
import re
from pathlib import Path
from typing import Any


def find_files(directory: Path, patterns: list[str]) -> list[Path]:
    """Find files matching patterns recursively."""
    files = []
    for pattern in patterns:
        files.extend(directory.rglob(pattern))
    return [f for f in files if "node_modules" not in str(f) and "dist" not in str(f)]


def detect_mcp_sdk(content: str, lang: str) -> list[str]:
    """Detect MCP SDK imports to confirm project type."""
    sdks = []
    if lang == "typescript":
        if re.search(r'''from\s+['"]@modelcontextprotocol/sdk''', content):
            sdks.append("@modelcontextprotocol/sdk")
        if re.search(r'''require\s*\(\s*['"]@modelcontextprotocol/sdk''', content):
            sdks.append("@modelcontextprotocol/sdk")
    elif lang == "python":
        if re.search(r"from\s+mcp\.server", content):
            sdks.append("mcp.server")
        if re.search(r"from\s+mcp\s+import", content):
            sdks.append("mcp")
        if re.search(r"from\s+fastmcp", content) or re.search(r"import\s+fastmcp", content):
            sdks.append("fastmcp")
    return sdks


def extract_input_schema(content: str, start_pos: int) -> dict[str, Any] | None:
    """Try to extract inputSchema object following a tool definition."""
    # Look for { type: "object", properties: ... } or Zod schema
    schema_match = re.search(
        r'\{\s*(?:type:\s*["\']object["\'],\s*)?properties:\s*\{([^}]+)\}',
        content[start_pos : start_pos + 500],
    )
    if schema_match:
        return {"raw": schema_match.group(0)}
    return None


def extract_ts_tools(content: str) -> list[dict[str, Any]]:
    """Extract tool definitions from TypeScript MCP server code."""
    tools = []

    # Pattern 1: Object literal style { name: "x", description: "y" }
    script_pattern = r'\{\s*name:\s*["\']([^"\']+)["\'],\s*description:\s*["\']([^"\']+)["\']'
    for match in re.finditer(script_pattern, content, re.DOTALL):
        tools.append({"name": match.group(1), "description": match.group(2), "type": "script"})

    # Pattern 2: server.tool("name", "desc", schema, handler) — new SDK simplified API
    sdk_tool_pattern = r'server\.tool\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']'
    for match in re.finditer(sdk_tool_pattern, content, re.DOTALL):
        name, desc = match.group(1), match.group(2)
        if not any(t["name"] == name for t in tools):
            schema = extract_input_schema(content, match.end())
            tool = {"name": name, "description": desc, "type": "tool"}
            if schema:
                tool["inputSchema"] = schema
            tools.append(tool)

    # Pattern 3: setRequestHandler(ListToolsRequestSchema, ...) with tool arrays
    list_tools_pattern = r'setRequestHandler\s*\(\s*ListToolsRequestSchema'
    if re.search(list_tools_pattern, content):
        # Extract tool objects from the handler: { name: "x", description: "y", inputSchema: {...} }
        tool_obj_pattern = r'\{\s*name:\s*["\']([^"\']+)["\'],\s*description:\s*["\']([^"\']+)["\'](?:,\s*inputSchema:\s*(\{[^}]*\}))?'
        for match in re.finditer(tool_obj_pattern, content, re.DOTALL):
            name = match.group(1)
            if not any(t["name"] == name for t in tools):
                tool = {"name": name, "description": match.group(2), "type": "tool"}
                if match.group(3):
                    tool["inputSchema"] = {"raw": match.group(3)}
                tools.append(tool)

    # Pattern 4: Category-based tools (e.g. applescript-mcp style)
    category_pattern = r'export\s+const\s+(\w+)(?:Category)?\s*:\s*ScriptCategory\s*=\s*\{[^}]*name:\s*["\']([^"\']+)["\'][^}]*description:\s*["\']([^"\']+)["\']'
    for match in re.finditer(category_pattern, content, re.DOTALL):
        tools.append({"name": match.group(2), "description": match.group(3), "type": "category", "variable": match.group(1)})

    return tools


def extract_ts_resources(content: str) -> list[dict[str, Any]]:
    """Extract resource definitions from TypeScript MCP server code."""
    resources = []

    # server.resource("name", "uri", handler)
    res_pattern = r'server\.resource\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']'
    for match in re.finditer(res_pattern, content):
        resources.append({"name": match.group(1), "uri": match.group(2)})

    # setRequestHandler(ListResourcesRequestSchema, ...)
    if re.search(r'setRequestHandler\s*\(\s*ListResourcesRequestSchema', content):
        res_obj_pattern = r'\{\s*(?:uri|name):\s*["\']([^"\']+)["\'].*?(?:name|uri):\s*["\']([^"\']+)["\']'
        for match in re.finditer(res_obj_pattern, content, re.DOTALL):
            name = match.group(2) if match.group(1).startswith(("http", "file", "/")) else match.group(1)
            uri = match.group(1) if match.group(1).startswith(("http", "file", "/")) else match.group(2)
            if not any(r["name"] == name for r in resources):
                resources.append({"name": name, "uri": uri})

    return resources


def extract_ts_prompts(content: str) -> list[dict[str, Any]]:
    """Extract prompt definitions from TypeScript MCP server code."""
    prompts = []

    # server.prompt("name", "desc", handler)
    prompt_pattern = r'server\.prompt\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']'
    for match in re.finditer(prompt_pattern, content):
        prompts.append({"name": match.group(1), "description": match.group(2)})

    # setRequestHandler(ListPromptsRequestSchema, ...)
    if re.search(r'setRequestHandler\s*\(\s*ListPromptsRequestSchema', content):
        prompt_obj_pattern = r'\{\s*name:\s*["\']([^"\']+)["\'],\s*description:\s*["\']([^"\']+)["\']'
        for match in re.finditer(prompt_obj_pattern, content, re.DOTALL):
            name = match.group(1)
            if not any(p["name"] == name for p in prompts):
                prompts.append({"name": name, "description": match.group(2)})

    return prompts


def extract_python_tools(content: str) -> list[dict[str, Any]]:
    """Extract tool definitions from Python MCP server code."""
    tools = []

    # Pattern 1: @mcp.tool() or @server.tool() decorator (with or without parens)
    tool_pattern = (
        r'@\w+\.tool\((?:[^)]*)\)\s*(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*'
        r'(?:->.*?)?:\s*(?:"""|\'\'\')([\s\S]*?)(?:"""|\'\'\')'
    )
    for match in re.finditer(tool_pattern, content):
        tools.append({"name": match.group(1), "description": match.group(2).strip(), "type": "tool"})

    # Pattern 2: @server.call_tool() decorator
    call_tool_pattern = (
        r'@\w+\.call_tool\(\)\s*(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*'
        r'(?:->.*?)?:\s*(?:"""|\'\'\')([\s\S]*?)(?:"""|\'\'\')'
    )
    for match in re.finditer(call_tool_pattern, content):
        name = match.group(1)
        if not any(t["name"] == name for t in tools):
            tools.append({"name": name, "description": match.group(2).strip(), "type": "tool"})

    # Pattern 3: server.add_tool(Tool(name="x", description="y", ...))
    add_tool_pattern = r'add_tool\(\s*Tool\(\s*name\s*=\s*["\']([^"\']+)["\'](?:\s*,\s*description\s*=\s*["\']([^"\']+)["\'])?'
    for match in re.finditer(add_tool_pattern, content):
        name = match.group(1)
        if not any(t["name"] == name for t in tools):
            tools.append({"name": name, "description": match.group(2) or "", "type": "tool"})

    return tools


def extract_python_resources(content: str) -> list[dict[str, Any]]:
    """Extract resource definitions from Python MCP server code."""
    resources = []

    # @mcp.resource("uri") or @server.resource("uri")
    res_pattern = r'@\w+\.resource\(\s*["\']([^"\']+)["\']\s*\)\s*(?:async\s+)?def\s+(\w+)'
    for match in re.finditer(res_pattern, content):
        resources.append({"name": match.group(2), "uri": match.group(1)})

    return resources


def extract_python_prompts(content: str) -> list[dict[str, Any]]:
    """Extract prompt definitions from Python MCP server code."""
    prompts = []

    # @mcp.prompt() or @server.prompt()
    prompt_pattern = (
        r'@\w+\.prompt\((?:[^)]*)\)\s*(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*'
        r'(?:->.*?)?:\s*(?:"""|\'\'\')([\s\S]*?)(?:"""|\'\'\')'
    )
    for match in re.finditer(prompt_pattern, content):
        prompts.append({"name": match.group(1), "description": match.group(2).strip()})

    return prompts


def analyze_package_json(path: Path) -> dict[str, Any]:
    """Extract info from package.json."""
    try:
        with open(path) as f:
            data = json.load(f)
        return {
            "name": data.get("name", ""),
            "version": data.get("version", ""),
            "description": data.get("description", ""),
            "main": data.get("main", ""),
            "scripts": data.get("scripts", {}),
            "dependencies": list(data.get("dependencies", {}).keys()),
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
            info["name"] = name_match.group(1)

        desc_match = re.search(r'description\s*=\s*["\']([^"\']+)["\']', content)
        if desc_match:
            info["description"] = desc_match.group(1)

        return info
    except Exception:
        return {}


def analyze_mcp_project(project_path: str) -> dict[str, Any]:
    """Analyze an MCP server project and extract all relevant information."""
    path = Path(project_path)
    result: dict[str, Any] = {
        "project_path": str(path.absolute()),
        "project_type": "unknown",
        "mcp_sdks": [],
        "name": "",
        "description": "",
        "tools": [],
        "resources": [],
        "prompts": [],
        "categories": [],
        "dependencies": [],
        "entry_point": "",
    }

    # Check for TypeScript/JavaScript project
    package_json = path / "package.json"
    if package_json.exists():
        result["project_type"] = "typescript"
        pkg_info = analyze_package_json(package_json)
        result["name"] = pkg_info.get("name", "")
        result["description"] = pkg_info.get("description", "")
        result["dependencies"] = pkg_info.get("dependencies", [])
        result["entry_point"] = pkg_info.get("main", "dist/index.js")
        result["scripts"] = pkg_info.get("scripts", {})

    # Check for Python project
    pyproject = path / "pyproject.toml"
    if pyproject.exists():
        result["project_type"] = "python"
        py_info = analyze_pyproject(pyproject)
        result["name"] = py_info.get("name", result["name"])
        result["description"] = py_info.get("description", result["description"])

    # Find and analyze source files
    ts_files = find_files(path, ["*.ts", "*.tsx", "*.js", "*.mjs"])
    py_files = find_files(path, ["*.py"])

    all_tools = []
    all_resources = []
    all_prompts = []
    categories = []
    detected_sdks: set[str] = set()

    for ts_file in ts_files:
        try:
            content = ts_file.read_text()
            detected_sdks.update(detect_mcp_sdk(content, "typescript"))
            tools = extract_ts_tools(content)
            resources = extract_ts_resources(content)
            prompts = extract_ts_prompts(content)
            rel_path = str(ts_file.relative_to(path))
            for tool in tools:
                tool["source_file"] = rel_path
                if tool["type"] == "category":
                    categories.append(tool)
                else:
                    all_tools.append(tool)
            for res in resources:
                res["source_file"] = rel_path
                all_resources.append(res)
            for prompt in prompts:
                prompt["source_file"] = rel_path
                all_prompts.append(prompt)
        except Exception:
            pass

    for py_file in py_files:
        try:
            content = py_file.read_text()
            detected_sdks.update(detect_mcp_sdk(content, "python"))
            tools = extract_python_tools(content)
            resources = extract_python_resources(content)
            prompts = extract_python_prompts(content)
            rel_path = str(py_file.relative_to(path))
            for tool in tools:
                tool["source_file"] = rel_path
                all_tools.append(tool)
            for res in resources:
                res["source_file"] = rel_path
                all_resources.append(res)
            for prompt in prompts:
                prompt["source_file"] = rel_path
                all_prompts.append(prompt)
        except Exception:
            pass

    result["mcp_sdks"] = sorted(detected_sdks)
    result["tools"] = all_tools
    result["resources"] = all_resources
    result["prompts"] = all_prompts
    result["categories"] = categories

    return result


def main():
    parser = argparse.ArgumentParser(description="Analyze MCP server project")
    parser.add_argument("project_path", help="Path to MCP server project")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    parser.add_argument("--pretty", "-p", action="store_true", help="Pretty print JSON")

    args = parser.parse_args()

    result = analyze_mcp_project(args.project_path)

    indent = 2 if args.pretty else None
    output = json.dumps(result, indent=indent, ensure_ascii=False)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Analysis saved to: {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()
