#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

PLACEHOLDER_PATTERN = re.compile(r"{{\s*([A-Za-z0-9_.-]+)\s*}}")
IGNORED_PARTS = {".git", "node_modules", "target", "dist", "build", ".venv", "venv"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Runtime helpers for the gh-bootstrap skill.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    detect = subparsers.add_parser("detect", help="Detect languages, frameworks, and existing GitHub files.")
    detect.add_argument("root", nargs="?", default=".", help="Project root to scan.")
    detect.add_argument("--json", action="store_true", help="Emit JSON.")

    fetch = subparsers.add_parser("fetch-template", help="Clone a template repository into a cache directory.")
    fetch.add_argument("repo_url", help="Git repository URL to clone.")
    fetch.add_argument("dest", help="Destination directory.")
    fetch.add_argument("--ref", default=None, help="Optional branch, tag, or commit to checkout after clone.")
    fetch.add_argument("--force", action="store_true", help="Replace the destination if it already exists.")

    render = subparsers.add_parser("render-template", help="Render a template file with placeholder substitution.")
    render.add_argument("template", help="Source template file.")
    render.add_argument("output", help="Output file path.")
    render.add_argument(
        "--var",
        action="append",
        default=[],
        help="Placeholder replacement in KEY=VALUE form. May be provided multiple times.",
    )
    render.add_argument("--vars-json", default=None, help="Path to a JSON object containing replacements.")

    validate = subparsers.add_parser("validate-tree", help="Scan a directory for unreplaced {{placeholders}}.")
    validate.add_argument("root", help="Directory to scan.")
    validate.add_argument("--json", action="store_true", help="Emit JSON.")

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.command == "detect":
        report = detect_project(Path(args.root))
        emit(report, args.json)
        return 0

    if args.command == "fetch-template":
        fetch_template(args.repo_url, Path(args.dest), ref=args.ref, force=args.force)
        print(str(Path(args.dest).resolve()))
        return 0

    if args.command == "render-template":
        replacements = load_replacements(args.vars_json, args.var)
        render_template(Path(args.template), Path(args.output), replacements)
        print(str(Path(args.output).resolve()))
        return 0

    if args.command == "validate-tree":
        report = validate_tree(Path(args.root))
        emit(report, args.json)
        return 0 if not report["files"] else 1

    print(f"Unknown command: {args.command}", file=sys.stderr)
    return 1


def emit(payload: dict[str, Any], as_json: bool) -> None:
    if as_json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return
    for key, value in payload.items():
        print(f"{key}: {value}")


def detect_project(root: Path) -> dict[str, Any]:
    root = root.resolve()
    package_jsons = list(find_named_files(root, {"package.json"}))
    package_names = set()
    for package_json_path in package_jsons:
        package_names.update(collect_package_names(read_json_if_exists(package_json_path)))
    github_files = sorted(
        str(path.relative_to(root))
        for path in root.rglob("*")
        if path.is_file() and not is_ignored(path, root) and ".github" in path.parts
    )

    languages: set[str] = set()
    frameworks: set[str] = set()
    package_managers: set[str] = set()
    manifests: list[str] = []

    cargo_files = list(find_named_files(root, {"Cargo.toml"}))
    if cargo_files:
        languages.add("rust")
        manifests.extend(str(path.relative_to(root)) for path in cargo_files)
    if package_jsons:
        manifests.extend(str(path.relative_to(root)) for path in package_jsons)
        package_managers.update(detect_package_managers(root))
        if list(find_named_files(root, {"tsconfig.json"})) or any(name.startswith("@types/") for name in package_names):
            languages.add("typescript")
        else:
            languages.add("javascript")
    python_files = list(find_named_files(root, {"pyproject.toml", "requirements.txt"}))
    if python_files:
        languages.add("python")
        manifests.extend(str(path.relative_to(root)) for path in python_files)
    go_files = list(find_named_files(root, {"go.mod"}))
    if go_files:
        languages.add("go")
        manifests.extend(str(path.relative_to(root)) for path in go_files)
    java_files = list(find_named_files(root, {"pom.xml", "build.gradle", "build.gradle.kts"}))
    if java_files:
        languages.add("java")
        manifests.extend(str(path.relative_to(root)) for path in java_files)

    if {"react", "react-dom"} & package_names:
        frameworks.add("react")
    if "next" in package_names or list(find_globs(root, ("next.config.js", "next.config.mjs"))):
        frameworks.add("nextjs")
    if "vite" in package_names or list(find_globs(root, ("vite.config.*",))):
        frameworks.add("vite")
    if "vitest" in package_names or list(find_globs(root, ("vitest.config.*",))):
        frameworks.add("vitest")
    if "playwright" in package_names or list(find_globs(root, ("playwright.config.*",))):
        frameworks.add("playwright")
    if "vue" in package_names:
        frameworks.add("vue")

    return {
        "root": str(root),
        "languages": sorted(languages),
        "frameworks": sorted(frameworks),
        "packageManagers": sorted(package_managers),
        "manifests": sorted(dict.fromkeys(manifests)),
        "githubFiles": github_files,
    }


def detect_package_managers(root: Path) -> set[str]:
    managers: set[str] = set()
    for path in find_named_files(root, {"package-lock.json"}):
        managers.add("npm")
    for path in find_named_files(root, {"pnpm-lock.yaml"}):
        managers.add("pnpm")
    for path in find_named_files(root, {"yarn.lock"}):
        managers.add("yarn")
    for path in find_named_files(root, {"bun.lockb", "bun.lock"}):
        managers.add("bun")
    return managers


def collect_package_names(package_json: dict[str, Any] | None) -> set[str]:
    if not package_json:
        return set()
    names: set[str] = set()
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        value = package_json.get(key) or {}
        if isinstance(value, dict):
            names.update(name for name in value.keys() if isinstance(name, str))
    return names


def read_json_if_exists(path: Path) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def find_named_files(root: Path, names: set[str]) -> list[Path]:
    return [
        path
        for path in root.rglob("*")
        if path.is_file() and path.name in names and not is_ignored(path, root)
    ]


def find_globs(root: Path, patterns: tuple[str, ...]) -> list[Path]:
    matches: list[Path] = []
    for pattern in patterns:
        matches.extend(
            path for path in root.rglob(pattern) if path.is_file() and not is_ignored(path, root)
        )
    return matches


def is_ignored(path: Path, root: Path) -> bool:
    relative_parts = path.relative_to(root).parts
    return any(part in IGNORED_PARTS for part in relative_parts)


def fetch_template(repo_url: str, dest: Path, ref: str | None, force: bool) -> None:
    dest = dest.resolve()
    if dest.exists():
        if not force:
            return
        shutil.rmtree(dest)

    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(dest)],
        check=True,
        capture_output=True,
        text=True,
    )
    if ref:
        subprocess.run(
            ["git", "-C", str(dest), "checkout", ref],
            check=True,
            capture_output=True,
            text=True,
        )


def load_replacements(vars_json: str | None, inline_vars: list[str]) -> dict[str, str]:
    replacements: dict[str, str] = {}
    if vars_json:
        data = json.loads(Path(vars_json).read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("--vars-json must point to a JSON object")
        replacements.update({str(key): stringify(value) for key, value in data.items()})

    for raw_var in inline_vars:
        if "=" not in raw_var:
            raise ValueError(f"Invalid --var value '{raw_var}'. Expected KEY=VALUE.")
        key, value = raw_var.split("=", 1)
        replacements[key.strip()] = value
    return replacements


def render_template(template_path: Path, output_path: Path, replacements: dict[str, str]) -> None:
    content = template_path.read_text(encoding="utf-8")
    rendered = PLACEHOLDER_PATTERN.sub(lambda match: replacements.get(match.group(1), match.group(0)), content)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(rendered, encoding="utf-8")


def validate_tree(root: Path) -> dict[str, Any]:
    root = root.resolve()
    findings: list[dict[str, Any]] = []
    for path in root.rglob("*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        matches = sorted({match.group(0) for match in PLACEHOLDER_PATTERN.finditer(content)})
        if matches:
            findings.append(
                {
                    "path": str(path.relative_to(root)),
                    "placeholders": matches,
                }
            )
    return {
        "root": str(root),
        "files": findings,
    }


def stringify(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False)


if __name__ == "__main__":
    raise SystemExit(main())
