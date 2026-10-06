#!/usr/bin/env python3
"""Read-only test inventory. Prints one JSON object. Does not run recipes."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

SKIP_DIR_NAMES = {
    "node_modules",
    "__pycache__",
    "dist",
    "dist-docs",
    "ref",
    "target",
    "vendor",
    "snapshots",
    "worktrees",
    ".venv",
    "venv",
}
# Both names count under a discover root. The recipe's `-p` filter is not a second rule.
DISCOVER_RE = re.compile(
    r"""unittest\s+discover\b[^\n]*?-s(?:=|\s+)("[^"]+"|'[^']+'|\S+)""",
    re.IGNORECASE,
)
DYNAMIC_DISCOVER_MARKER = "--dynamic-unittest-discover"
DYNAMIC_SKIP_PARTS = {
    ".git",
    "node_modules",
    "__pycache__",
    "ref",
    ".agents",
    ".claude",
    ".trellis",
    "scaffolds",
}
RECIPE_HEADER_RE = re.compile(r"^([A-Za-z_][\w-]*)\b[^:]*:(?!=)(.*)$")
PATH_RE = re.compile(r"(?P<path>(?:[A-Za-z0-9_.@{}\\/-]+)\.(?:py|mjs))\b")
NAMED_RECIPES = ("install-projects-test", "docs-check")


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")


def strip_just_comment(line: str) -> str:
    in_single = False
    in_double = False
    for index, char in enumerate(line):
        if char == "'" and not in_double:
            in_single = not in_single
        elif char == '"' and not in_single:
            in_double = not in_double
        elif char == "#" and not in_single and not in_double:
            return line[:index]
    return line


def parse_recipes(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    recipes: list[tuple[str, str]] = []
    seen: set[str] = set()
    index = 0
    while index < len(lines):
        raw = lines[index]
        stripped = raw.strip()
        if (
            not stripped
            or stripped.startswith("#")
            or raw.startswith((" ", "\t"))
            or stripped.startswith("[")
        ):
            index += 1
            continue
        code = strip_just_comment(raw).rstrip()
        if ":=" in code:
            index += 1
            continue
        match = RECIPE_HEADER_RE.match(code)
        if not match:
            index += 1
            continue
        name = match.group(1)
        body_parts: list[str] = []
        tail = strip_just_comment(match.group(2)).strip()
        if tail:
            body_parts.append(tail)
        index += 1
        while index < len(lines):
            line = lines[index]
            if line.strip() == "":
                peek = index + 1
                while peek < len(lines) and lines[peek].strip() == "":
                    peek += 1
                if peek < len(lines) and lines[peek].startswith((" ", "\t")):
                    index += 1
                    continue
                break
            if line.startswith((" ", "\t")):
                body_parts.append(strip_just_comment(line).strip())
                index += 1
                continue
            break
        if name not in seen:
            seen.add(name)
            recipes.append((name, join_continuations(body_parts)))
    return recipes


def join_continuations(parts: list[str]) -> str:
    joined: list[str] = []
    buffer = ""
    for part in parts:
        buffer = f"{buffer}{part}" if buffer else part
        if buffer.endswith("\\"):
            buffer = buffer[:-1]
            continue
        joined.append(buffer)
        buffer = ""
    if buffer:
        joined.append(buffer)
    return "\n".join(joined)


def find_justfile(root: Path) -> Path | None:
    for name in ("justfile", "Justfile", ".justfile"):
        candidate = root / name
        if candidate.is_file():
            return candidate
    return None


def normalize_rel(token: str) -> str:
    token = token.strip().strip("\"'")
    token = token.replace("\\", "/")
    while token.startswith("./"):
        token = token[2:]
    return token.rstrip("/")


def to_repo_rel(root: Path, token: str) -> str | None:
    token = normalize_rel(token)
    if not token:
        return None
    path = Path(token)
    if path.is_absolute():
        try:
            token = path.resolve().relative_to(root.resolve()).as_posix()
        except ValueError:
            return None
    if ".." in Path(token).parts:
        return None
    return token


def _dynamic_skip_dir(path: Path) -> bool:
    name = path.name
    if name.startswith(".") or name in DYNAMIC_SKIP_PARTS:
        return True
    if path.is_symlink() or os.path.isjunction(path):
        return True
    return False


def dynamic_python_test_dirs(root: Path) -> list[str]:
    """Directory list for a python-test recipe that calls run_python_tests.py.

    Keep the skip set aligned with scripts/run_python_tests.py.
    """
    found: list[str] = []

    def add(directory: Path) -> None:
        if not directory.is_dir() or _dynamic_skip_dir(directory):
            return
        try:
            relative_parts = directory.relative_to(root).parts
        except ValueError:
            return
        if any(part in DYNAMIC_SKIP_PARTS or part.startswith(".") for part in relative_parts):
            return
        if not any(path.is_file() for path in directory.glob("test_*.py")):
            return
        rel = directory.relative_to(root).as_posix()
        if rel not in found:
            found.append(rel)

    add(root / "platforms" / "claude" / "hooks" / "tests")
    skills = root / "skills"
    skill_dirs: list[str] = []
    if skills.is_dir() and not _dynamic_skip_dir(skills):
        for dirpath, dirnames, filenames in os.walk(skills, followlinks=False):
            current = Path(dirpath)
            dirnames[:] = [name for name in dirnames if not _dynamic_skip_dir(current / name)]
            if current.name != "tests":
                continue
            if not any(name.startswith("test_") and name.endswith(".py") for name in filenames):
                continue
            rel = current.relative_to(root).as_posix()
            if any(part in DYNAMIC_SKIP_PARTS or part.startswith(".") for part in Path(rel).parts):
                continue
            skill_dirs.append(rel)
    for rel in sorted(skill_dirs):
        if rel not in found:
            found.append(rel)
    add(root / "scripts" / "tests")
    return found


def discover_dirs(body: str, root: Path | None = None) -> list[str]:
    found: list[str] = []
    for match in DISCOVER_RE.finditer(body):
        rel = normalize_rel(match.group(1))
        if rel and ".." not in Path(rel).parts and rel not in found:
            found.append(rel)
    if root is not None and DYNAMIC_DISCOVER_MARKER in body:
        for rel in dynamic_python_test_dirs(root):
            if rel not in found:
                found.append(rel)
    return found


def under_dir(rel: str, directory: str) -> bool:
    rel_parts = tuple(part.casefold() for part in Path(rel).parts)
    dir_parts = tuple(part.casefold() for part in Path(directory).parts)
    if not dir_parts or len(rel_parts) <= len(dir_parts):
        return False
    return rel_parts[: len(dir_parts)] == dir_parts


def is_python_test_name(name: str) -> bool:
    return (name.startswith("test_") and name.endswith(".py")) or name.endswith("_test.py")


def is_node_collected(rel: str) -> bool:
    parts = Path(rel).parts
    if len(parts) < 3 or parts[0] != "skills":
        return False
    if "tests" not in parts[:-1]:
        return False
    return parts[-1].endswith(".mjs")


def looks_like_named_test(rel: str) -> bool:
    name = Path(rel).name
    if is_python_test_name(name):
        return True
    if name.endswith((".test.mjs", ".spec.mjs", ".test.py")):
        return True
    return "tests" in Path(rel).parts[:-1] and name.endswith((".py", ".mjs"))


def named_test_files(root: Path, recipes: dict[str, str]) -> dict[str, set[str]]:
    found = {name: set() for name in NAMED_RECIPES}
    for recipe in NAMED_RECIPES:
        body = recipes.get(recipe, "")
        for match in PATH_RE.finditer(body):
            rel = to_repo_rel(root, match.group("path"))
            if rel is None or not looks_like_named_test(rel):
                continue
            if (root / rel).is_file():
                found[recipe].add(rel)
    return found


def location_for(rel: str) -> str:
    parts = Path(rel).parts
    if parts and parts[0] == "skills" and "tests" in parts[:-1]:
        return "skill-tests"
    if "tests" in parts[:-1] or (parts and parts[0] == "tests"):
        return "repo-tests"
    if parts and parts[0] in {"scripts", "docs", "platforms"} and is_python_test_name(parts[-1]):
        return "repo-tests"
    return "unknown"


def has_assertion(text: str) -> bool:
    lowered = text.lower()
    return "assert" in lowered


def behavior_for(collected_by: str, text: str) -> str:
    if not collected_by:
        return "Missing"
    if has_assertion(text):
        return "needs-review"
    return "Shallow"


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8-sig", errors="replace")
    except OSError:
        return ""


def should_skip_dir(path: Path) -> bool:
    name = path.name
    if name.startswith(".") or name in SKIP_DIR_NAMES:
        return True
    if path.is_symlink():
        return True
    return os.path.isjunction(path)


def iter_files(root: Path) -> list[Path]:
    found: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        current = Path(dirpath)
        kept: list[str] = []
        for name in dirnames:
            child = current / name
            if should_skip_dir(child):
                continue
            kept.append(name)
        dirnames[:] = kept
        for name in filenames:
            found.append(current / name)
    return found


def is_candidate(rel: str, node_test_enabled: bool, named_paths: set[str]) -> bool:
    if rel in named_paths:
        return True
    name = Path(rel).name
    if is_python_test_name(name):
        return True
    if name.endswith((".test.mjs", ".spec.mjs")):
        return True
    return node_test_enabled and is_node_collected(rel)


def collected_by_for(
    rel: str,
    discover: list[str],
    node_test_enabled: bool,
    named: dict[str, set[str]],
) -> str:
    if rel in named["install-projects-test"]:
        return "install-projects-test"
    if rel in named["docs-check"]:
        return "docs-check"
    name = Path(rel).name
    if is_python_test_name(name) and any(under_dir(rel, directory) for directory in discover):
        return "python-test"
    if node_test_enabled and is_node_collected(rel):
        return "node-test"
    return ""


def inventory(root: Path) -> dict[str, object]:
    justfile = find_justfile(root)
    if justfile is None:
        recipes_list: list[tuple[str, str]] = []
        runner_status: str | None = "runner-not-declared"
    else:
        recipes_list = parse_recipes(read_text(justfile))
        runner_status = None
    recipes = dict(recipes_list)
    runners = [name for name, _body in recipes_list]
    discover = discover_dirs(recipes.get("python-test", ""), root)
    node_test_enabled = "node-test" in recipes
    named = named_test_files(root, recipes)
    named_paths: set[str] = set()
    for paths in named.values():
        named_paths.update(paths)

    files: list[dict[str, str]] = []
    root_resolved = root.resolve()
    for path in iter_files(root):
        if not path.is_file() or path.is_symlink() or os.path.isjunction(path):
            continue
        try:
            rel = path.resolve().relative_to(root_resolved).as_posix()
        except ValueError:
            continue
        if not is_candidate(rel, node_test_enabled, named_paths):
            continue
        collected_by = collected_by_for(rel, discover, node_test_enabled, named)
        text = read_text(path) if collected_by else ""
        files.append(
            {
                "path": rel,
                "location": location_for(rel),
                "collected_by": collected_by,
                "behavior": behavior_for(collected_by, text),
            }
        )
    files.sort(key=lambda item: item["path"])
    payload: dict[str, object] = {"runners": runners, "files": files}
    if runner_status is not None:
        payload["runner_status"] = runner_status
    return payload


def main(argv: list[str]) -> int:
    configure_stdio()
    parser = argparse.ArgumentParser(
        description="Read-only test inventory. Prints one JSON object and does not run recipes."
    )
    parser.add_argument("repo_root", help="Repository root to inventory.")
    args = parser.parse_args(argv[1:])
    root = Path(args.repo_root)
    if not root.is_dir():
        print(f"repo root is not a directory: {root}", file=sys.stderr)
        return 1
    json.dump(inventory(root), sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
