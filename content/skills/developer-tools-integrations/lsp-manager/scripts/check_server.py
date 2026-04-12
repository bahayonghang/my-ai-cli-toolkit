#!/usr/bin/env python3
"""Cross-platform language server availability checker.

Checks whether common LSP server executables are installed and reachable
via the system PATH. Outputs results as JSON for easy programmatic consumption.
"""

import json
import shutil
import subprocess
import sys


SERVERS = [
    {"name": "pyright-langserver", "language": "Python", "install": "pip install pyright"},
    {"name": "typescript-language-server", "language": "TypeScript/JavaScript", "install": "npm install -g typescript-language-server typescript"},
    {"name": "gopls", "language": "Go", "install": "go install golang.org/x/tools/gopls@latest"},
    {"name": "rust-analyzer", "language": "Rust", "install": "see https://rust-analyzer.github.io/manual.html#installation"},
    {"name": "clangd", "language": "C/C++", "install": "apt install clangd / brew install llvm"},
    {"name": "solargraph", "language": "Ruby", "install": "gem install solargraph"},
    {"name": "intelephense", "language": "PHP", "install": "npm install -g intelephense"},
]


def check_server(name: str) -> dict:
    path = shutil.which(name)
    result = {"name": name, "installed": path is not None, "path": path, "version": None}
    if path:
        try:
            proc = subprocess.run(
                [path, "--version"],
                capture_output=True, text=True, timeout=10,
            )
            version_line = (proc.stdout or proc.stderr).strip().splitlines()
            if version_line:
                result["version"] = version_line[0]
        except Exception:
            pass
    return result


def main():
    results = []
    for server in SERVERS:
        info = check_server(server["name"])
        info["language"] = server["language"]
        info["install_hint"] = server["install"]
        results.append(info)

    installed = [r for r in results if r["installed"]]
    missing = [r for r in results if not r["installed"]]

    output = {"installed": installed, "missing": missing}
    print(json.dumps(output, indent=2, ensure_ascii=False))

    if missing:
        print(f"\n{len(missing)} server(s) not found. Install hints:", file=sys.stderr)
        for m in missing:
            print(f"  {m['name']} ({m['language']}): {m['install_hint']}", file=sys.stderr)


if __name__ == "__main__":
    main()
