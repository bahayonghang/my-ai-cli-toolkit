#!/usr/bin/env python3
"""Mechanical precheck for a Trellis task planning directory.

Decides only what strings, the filesystem, and read-only git queries can decide:
  * optional root/recursive-child scope integrity
  * per-task artifact presence
  * template placeholder residue
  * path:line citation resolution
  * R / AC identifier cross-reference
  * whether the one root review-report destination is ignored or tracked (git hygiene note)

Claim truth, mechanism presence, and arithmetic stay with the reviewer.

Exit codes: 0 no blocking item, 1 blocking item present, 2 argument or path error.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path

REQUIRED_ARTIFACTS = ("prd.md",)
OPTIONAL_ARTIFACTS = ("design.md", "implement.md", "implement.jsonl", "check.jsonl", "task.json")
MARKDOWN_ARTIFACTS = ("prd.md", "design.md", "implement.md")

# Blocking placeholders come from artifact templates: a surviving marker means the
# author never replaced the template text.
BLOCKING_PLACEHOLDERS = ("_example", "TBD", "[PLACEHOLDER]", "[placeholder]", "待补", "待填")
# TODO / FIXME can legitimately appear in a plan that discusses an existing marker.
NOTE_PLACEHOLDERS = ("TODO", "FIXME", "???")

SOURCE_SUFFIXES = (
    "ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts",
    "py", "rs", "go", "java", "kt", "swift", "rb", "php",
    "c", "h", "cc", "cpp", "hpp", "cs",
    "css", "scss", "less", "html", "vue", "svelte",
    "md", "json", "jsonl", "yaml", "yml", "toml", "ini", "cfg",
    "sh", "bash", "ps1", "sql", "proto", "graphql",
)

CITATION_RE = re.compile(
    r"(?P<path>[A-Za-z0-9_@.\-/\\]*[A-Za-z0-9_@\-]+\.(?:" + "|".join(SOURCE_SUFFIXES) + r"))"
    r":(?P<start>\d{1,7})"
    r"(?:\s*[-–—~]\s*(?P<end>\d{1,7}))?"
)

# `- R1：...` / `- R1: ...`
REQ_DEF_RE = re.compile(r"^\s*[-*]\s*(R\d+)\s*[：:]")
# `- [ ] AC1（R1, R2）：...` / `- [x] AC1 (R1): ...`
AC_DEF_RE = re.compile(r"^\s*[-*]\s*\[[ xX]?\]\s*(AC\d+)\s*(?P<ann>[（(][^）)]*[）)])?")
ID_REF_RE = re.compile(r"\b(R\d+|AC\d+)\b")
# An inline code span in Markdown discusses a marker; it is not a surviving marker.
INLINE_CODE_RE = re.compile(r"`[^`]*`")

SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "target", "dist", "build", "out",
    "__pycache__", ".venv", "venv", ".next", ".nuxt", "coverage", ".mypy_cache",
    ".pytest_cache", ".ruff_cache", "vendor", ".cargo", ".gradle", "worktrees",
}

TASK_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


class ScopeError(Exception):
    """A deterministic task-tree integrity failure."""


def read_text(path: Path) -> str:
    """Read a file as UTF-8. Windows would otherwise decode with the legacy code page."""
    return path.read_text(encoding="utf-8", errors="replace")


def find_repo_root(start: Path) -> Path | None:
    for candidate in (start, *start.parents):
        if (candidate / ".trellis").is_dir():
            return candidate
    return None


def _scan_gitignore_covers(repo_root: Path, rel_posix: str) -> bool:
    """Fallback when git cannot run: literal scan of the two gitignore files.

    Matches only rules that name the target path or one of its parent
    directories literally (`reviews/`, `.trellis/reviews/`, `<task>.md`, with an
    optional `**/` prefix). Globs and negation rules are out of scope, so the
    scan can miss real coverage; it never invents coverage.
    """
    parts = rel_posix.split("/")
    candidates = {"/".join(parts[i:]) for i in range(len(parts))} | {"reviews"}
    for gitignore in (repo_root / ".gitignore", repo_root / ".trellis" / ".gitignore"):
        if not gitignore.is_file():
            continue
        for line in read_text(gitignore).splitlines():
            rule = line.strip().rstrip("/")
            if not rule or rule.startswith("#") or rule.startswith("!"):
                continue
            if rule.startswith("**/"):
                rule = rule[3:]
            if rule in candidates:
                return True
    return False


def git_path_state(repo_root: Path, rel_posix: str) -> str | None:
    """Classify a repo-relative path the way `git status` would see it.

    Returns "tracked", "ignored", "untracked", or None when git cannot answer
    (no git work tree, git missing, or git refused). Only "untracked" — a new
    untracked entry in `git status` — is worth a note.
    """
    try:
        listed = subprocess.run(
            ["git", "-C", str(repo_root), "ls-files", "--", rel_posix],
            capture_output=True, encoding="utf-8", errors="replace", timeout=15,
        )
    except (OSError, subprocess.TimeoutExpired):
        listed = None
    if listed is not None and listed.returncode == 0:
        if listed.stdout.strip():
            return "tracked"
        try:
            ignored = subprocess.run(
                ["git", "-C", str(repo_root), "check-ignore", "-q", "--", rel_posix],
                capture_output=True, timeout=15,
            )
        except (OSError, subprocess.TimeoutExpired):
            return None
        if ignored.returncode == 0:
            return "ignored"
        if ignored.returncode == 1:
            return "untracked"
        return None
    if _scan_gitignore_covers(repo_root, rel_posix):
        return "ignored"
    return None


def check_artifacts(task_dir: Path) -> tuple[dict, list[str]]:
    blocking: list[str] = []
    present: dict[str, bool] = {}
    for name in (*REQUIRED_ARTIFACTS, *OPTIONAL_ARTIFACTS):
        present[name] = (task_dir / name).is_file()
    for name in REQUIRED_ARTIFACTS:
        if not present[name]:
            blocking.append(f"missing required artifact: {name}")
    complex_plan = present.get("design.md", False) and present.get("implement.md", False)
    return (
        {
            "present": present,
            "shape": "complex" if complex_plan else "lightweight",
            "note": (
                "PRD-only is valid for a lightweight task; confirm the change really is lightweight"
                if not complex_plan
                else ""
            ),
        },
        blocking,
    )


def check_placeholders(task_dir: Path) -> tuple[list[dict], list[str]]:
    """Scan the planning artifacts only.

    `research/` holds notes, not contracts, so `research/` is out of scope. In a Markdown
    artifact, an occurrence inside an inline code span is a discussion of the marker, not a
    surviving marker, so inline code spans are stripped before matching. In a `.jsonl`
    manifest the template line is detected structurally, by the `_example` key.
    """
    hits: list[dict] = []
    blocking: list[str] = []
    targets = [*MARKDOWN_ARTIFACTS, "implement.jsonl", "check.jsonl"]

    for name in targets:
        path = task_dir / name
        if not path.is_file():
            continue
        is_jsonl = path.suffix == ".jsonl"
        for lineno, line in enumerate(read_text(path).splitlines(), start=1):
            if is_jsonl:
                try:
                    parsed = json.loads(line)
                except json.JSONDecodeError:
                    parsed = None
                if isinstance(parsed, dict) and "_example" in parsed:
                    hits.append(
                        {"file": name, "line": lineno, "marker": "_example", "blocking": True,
                         "text": line.strip()[:160]}
                    )
                    blocking.append(f"{name}:{lineno} template placeholder line not deleted")
                continue

            scannable = INLINE_CODE_RE.sub(" ", line)
            for marker in BLOCKING_PLACEHOLDERS:
                if marker in scannable:
                    hits.append(
                        {"file": name, "line": lineno, "marker": marker, "blocking": True,
                         "text": line.strip()[:160]}
                    )
                    blocking.append(f"{name}:{lineno} template placeholder {marker!r}")
            for marker in NOTE_PLACEHOLDERS:
                if marker in scannable:
                    hits.append(
                        {"file": name, "line": lineno, "marker": marker, "blocking": False,
                         "text": line.strip()[:160]}
                    )
    return hits, blocking


def candidate_files(repo_root: Path, name: str) -> list[Path]:
    """Find files whose path ends with `name`. Bounded by SKIP_DIRS."""
    target = name.replace("\\", "/")
    leaf = target.rsplit("/", 1)[-1]
    found: list[Path] = []
    for path in repo_root.rglob(leaf):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(repo_root).parts[:-1]):
            continue
        if path.as_posix().endswith(target):
            found.append(path)
        if len(found) > 8:
            break
    return found


def check_citations(task_dir: Path, repo_root: Path) -> tuple[list[dict], list[str]]:
    results: list[dict] = []
    blocking: list[str] = []
    line_cache: dict[Path, int] = {}
    seen: set[tuple[str, str, int, int | None]] = set()

    for name in MARKDOWN_ARTIFACTS:
        artifact = task_dir / name
        if not artifact.is_file():
            continue
        for lineno, line in enumerate(read_text(artifact).splitlines(), start=1):
            for match in CITATION_RE.finditer(line):
                raw_path = match.group("path").replace("\\", "/").lstrip("./")
                start = int(match.group("start"))
                end = int(match.group("end")) if match.group("end") else None
                key = (name, raw_path, start, end)
                if key in seen:
                    continue
                seen.add(key)

                direct = repo_root / raw_path
                matches = [direct] if direct.is_file() else candidate_files(repo_root, raw_path)

                entry = {
                    "artifact": name,
                    "artifact_line": lineno,
                    "citation": f"{raw_path}:{start}" + (f"-{end}" if end else ""),
                    "status": "",
                    "resolved_path": None,
                    "file_lines": None,
                }
                if not matches:
                    entry["status"] = "missing_file"
                    blocking.append(f"{name}:{lineno} citation names a missing file: {raw_path}")
                elif len(matches) > 1:
                    entry["status"] = "ambiguous"
                    entry["resolved_path"] = [p.relative_to(repo_root).as_posix() for p in matches]
                else:
                    target = matches[0]
                    if target not in line_cache:
                        line_cache[target] = len(read_text(target).splitlines())
                    total = line_cache[target]
                    entry["resolved_path"] = target.relative_to(repo_root).as_posix()
                    entry["file_lines"] = total
                    highest = end if end else start
                    if highest > total:
                        entry["status"] = "line_out_of_range"
                        blocking.append(
                            f"{name}:{lineno} citation {raw_path}:{highest} exceeds "
                            f"{total} lines in the current file"
                        )
                    else:
                        entry["status"] = "resolved"
                results.append(entry)
    return results, blocking


def check_identifiers(task_dir: Path) -> tuple[dict, list[str]]:
    prd = task_dir / "prd.md"
    requirements: list[str] = []
    criteria: list[dict] = []
    if prd.is_file():
        for line in read_text(prd).splitlines():
            req = REQ_DEF_RE.match(line)
            if req:
                requirements.append(req.group(1))
                continue
            crit = AC_DEF_RE.match(line)
            if crit:
                annotation = crit.group("ann") or ""
                criteria.append(
                    {
                        "id": crit.group(1),
                        "requirements": sorted(set(ID_REF_RE.findall(annotation))),
                        "clause_hint": count_clauses(line),
                    }
                )

    defined = set(requirements) | {c["id"] for c in criteria}
    referenced: set[str] = set()
    for name in MARKDOWN_ARTIFACTS:
        artifact = task_dir / name
        if artifact.is_file():
            referenced |= set(ID_REF_RE.findall(read_text(artifact)))

    covered_reqs = {r for c in criteria for r in c["requirements"]}
    unannotated = [c["id"] for c in criteria if not c["requirements"]]
    undefined = sorted(referenced - defined)
    uncovered = [r for r in requirements if r not in covered_reqs]

    return (
        {
            "requirements": requirements,
            "criteria": criteria,
            "criteria_without_requirement": unannotated,
            "requirements_without_criterion": uncovered,
            "referenced_but_undefined": undefined,
        },
        [],
    )


def count_clauses(line: str) -> int:
    """Rough clause count for a criterion line. A hint for Pass 3, not a verdict."""
    body = line.split("：", 1)[-1] if "：" in line else line.split(":", 1)[-1]
    parts = re.split(r"[；;]|\band\b|、", body)
    return max(1, len([p for p in parts if p.strip()]))


def build_task_report(task_dir: Path, repo_root: Path) -> dict:
    """Build the existing single-task mechanical result without persistence."""
    artifacts, block_a = check_artifacts(task_dir)
    placeholders, block_p = check_placeholders(task_dir)
    citations, block_c = check_citations(task_dir, repo_root)
    identifiers, block_i = check_identifiers(task_dir)
    blocking = [*block_a, *block_p, *block_c, *block_i]
    status_counts: dict[str, int] = {}
    for entry in citations:
        status_counts[entry["status"]] = status_counts.get(entry["status"], 0) + 1
    task_status = read_task_status(task_dir)
    return {
        "task_dir": task_dir.as_posix(),
        "task_status": task_status,
        "artifacts": artifacts,
        "placeholders": placeholders,
        "citations": {"total": len(citations), "by_status": status_counts, "entries": citations},
        "identifiers": identifiers,
        "blocking": blocking,
        "drift_pass_required": task_status not in (None, "planning"),
    }


def is_reparse_point(path: Path) -> bool:
    """Return true for symlinks and Windows junction/reparse points."""
    if path.is_symlink():
        return True
    try:
        attrs = getattr(os.lstat(path), "st_file_attributes", 0)
    except OSError:
        return False
    return bool(attrs & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0))


def _task_location(relative: Path) -> str:
    parts = relative.parts
    if len(parts) == 1:
        return "active"
    if len(parts) == 3 and parts[0] == "archive":
        return f"archive/{parts[1]}"
    raise ScopeError(
        "task path must be .trellis/tasks/<task> or "
        f".trellis/tasks/archive/<period>/<task>: {relative.as_posix()}"
    )


def validate_tree_task_path(task_dir: Path, tasks_root: Path) -> tuple[Path, str]:
    """Confine a live or archived task directory to one repository task root."""
    task_abs = Path(os.path.abspath(task_dir))
    tasks_abs = Path(os.path.abspath(tasks_root))
    for protected in (tasks_abs.parent, tasks_abs):
        if protected.exists() and is_reparse_point(protected):
            raise ScopeError(f"task root uses a symlink or reparse point: {protected}")
    try:
        relative = task_abs.relative_to(tasks_abs)
    except ValueError as exc:
        raise ScopeError(f"task path escapes {tasks_abs.as_posix()}: {task_abs}") from exc
    location = _task_location(relative)
    if not TASK_NAME_RE.fullmatch(task_abs.name):
        raise ScopeError(
            f"task directory name is not a safe report basename: {task_abs.name!r}"
        )

    current = tasks_abs
    for part in relative.parts:
        current = current / part
        if current.exists() and is_reparse_point(current):
            raise ScopeError(f"task path uses a symlink or reparse point: {current}")

    resolved = task_abs.resolve()
    try:
        resolved.relative_to(tasks_abs.resolve())
    except ValueError as exc:
        raise ScopeError(f"task path resolves outside {tasks_abs.as_posix()}: {task_abs}") from exc
    return resolved, location


def read_task_metadata(task_dir: Path) -> dict:
    task_json = task_dir / "task.json"
    if not task_json.is_file():
        raise ScopeError(f"missing task.json for {task_dir.name}")
    try:
        parsed = json.loads(read_text(task_json))
    except json.JSONDecodeError as exc:
        raise ScopeError(f"invalid task.json for {task_dir.name}: {exc.msg}") from exc
    if not isinstance(parsed, dict):
        raise ScopeError(f"invalid task.json for {task_dir.name}: root must be an object")
    return parsed


def _name_list(task_name: str, field: str, value: object) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        raise ScopeError(f"invalid {field} for {task_name}: expected a list of task basenames")
    return value


def task_children(task_name: str, metadata: dict) -> tuple[list[str], bool]:
    """Return authoritative children and whether the legacy fallback was used."""
    has_children = "children" in metadata
    children = _name_list(task_name, "children", metadata["children"]) if has_children else []
    has_subtasks = "subtasks" in metadata
    subtasks = _name_list(task_name, "subtasks", metadata["subtasks"]) if has_subtasks else []

    if has_children:
        if children and subtasks and children != subtasks:
            raise ScopeError(f"conflicting children and subtasks for {task_name}")
        return children, False
    return subtasks, bool(subtasks)


class TaskTreeResolver:
    """Resolve one root and its recursive children without guessing membership."""

    def __init__(self, root_task: Path, tasks_root: Path) -> None:
        self.root_task = root_task
        self.tasks_root = tasks_root
        self.members: list[dict] = []
        self.edges: list[dict[str, str]] = []
        self.legacy_fallback_tasks: list[str] = []
        self.visiting: list[str] = []
        self.visited: set[str] = set()
        self.has_declared_descendants = False

    def resolve(self) -> None:
        self._visit(self.root_task, expected_parent=None)

    def _visit(self, task_dir: Path, expected_parent: str | None) -> None:
        resolved, location = validate_tree_task_path(task_dir, self.tasks_root)
        name = resolved.name
        if name in self.visiting:
            cycle = " -> ".join([*self.visiting, name])
            raise ScopeError(f"cycle in task tree: {cycle}")
        if name in self.visited or any(member["name"] == name for member in self.members):
            raise ScopeError(f"duplicate tree membership for {name}")

        member = {
            "name": name,
            "path": resolved.as_posix(),
            "location": location,
            "status": None,
            "_task_dir": resolved,
        }
        self.members.append(member)
        self.visiting.append(name)

        metadata = read_task_metadata(resolved)
        status_value = metadata.get("status")
        if not isinstance(status_value, str) or not status_value.strip():
            raise ScopeError(f"invalid status for {name}: expected a non-empty string")
        member["status"] = status_value
        if expected_parent is not None and metadata.get("parent") != expected_parent:
            raise ScopeError(
                f"parent mismatch for {name}: expected {expected_parent!r}, "
                f"found {metadata.get('parent')!r}"
            )

        raw_children = metadata.get("children") if "children" in metadata else metadata.get("subtasks")
        if isinstance(raw_children, list) and raw_children:
            self.has_declared_descendants = True
        children, used_legacy = task_children(name, metadata)
        if used_legacy:
            self.legacy_fallback_tasks.append(name)

        local_children: set[str] = set()
        for child_name in children:
            if not TASK_NAME_RE.fullmatch(child_name):
                raise ScopeError(f"unsafe child name under {name}: {child_name!r}")
            if child_name in local_children:
                raise ScopeError(f"duplicate edge {name} -> {child_name}")
            local_children.add(child_name)
            self.edges.append({"parent": name, "child": child_name})
            child_dir = self._resolve_child(name, child_name)
            self._visit(child_dir, expected_parent=name)

        self.visiting.pop()
        self.visited.add(name)

    def _resolve_child(self, parent_name: str, child_name: str) -> Path:
        matches: list[Path] = []
        live = self.tasks_root / child_name
        if live.is_dir():
            matches.append(live)

        archive_root = self.tasks_root / "archive"
        if archive_root.is_dir():
            for period in sorted(archive_root.iterdir(), key=lambda path: path.name):
                candidate = period / child_name
                if candidate.is_dir():
                    matches.append(candidate)

        if not matches:
            raise ScopeError(f"missing child {child_name!r} referenced by {parent_name}")
        if len(matches) > 1:
            paths = ", ".join(path.as_posix() for path in matches)
            raise ScopeError(f"ambiguous child {child_name!r} referenced by {parent_name}: {paths}")
        return matches[0]


def build_tree_report(task_dir: Path, repo_root: Path) -> dict:
    tasks_root = repo_root / ".trellis" / "tasks"
    if not tasks_root.is_dir():
        raise ScopeError(f"repository task root not found: {tasks_root}")
    root_resolved, _ = validate_tree_task_path(task_dir, tasks_root)
    resolver = TaskTreeResolver(root_resolved, tasks_root)
    tree_blocking: list[str] = []
    try:
        resolver.resolve()
    except ScopeError as exc:
        tree_blocking.append(f"tree: {exc}")

    tasks: list[dict] = []
    aggregate_blocking = list(tree_blocking)
    public_members: list[dict] = []
    for member in resolver.members:
        task_report = build_task_report(member["_task_dir"], repo_root)
        task_report["task_name"] = member["name"]
        task_report["location"] = member["location"]
        tasks.append(task_report)
        public_members.append({key: value for key, value in member.items() if not key.startswith("_")})
        aggregate_blocking.extend(
            f"[{member['name']}] {item}" for item in task_report["blocking"]
        )

    reviews_rel = f".trellis/reviews/{root_resolved.name}.md"
    mode = "task-tree" if resolver.has_declared_descendants or resolver.edges else "single-task"
    return {
        "repo_root": repo_root.as_posix(),
        "review_scope": {
            "mode": mode,
            "root": root_resolved.name,
            "task_count": len(public_members),
            "members": public_members,
            "edges": resolver.edges,
            "legacy_fallback_tasks": resolver.legacy_fallback_tasks,
        },
        "tasks": tasks,
        "reviews_git": {"path": reviews_rel, "state": git_path_state(repo_root, reviews_rel)},
        "blocking": aggregate_blocking,
    }


def write_json_output(report: dict, output: str) -> None:
    out = Path(output).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"wrote {out}", file=sys.stderr)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Mechanical precheck for a Trellis task planning directory."
    )
    parser.add_argument("task_dir", help="path to .trellis/tasks/<task>/")
    parser.add_argument("--repo-root", help="repository root; defaults to the nearest ancestor with .trellis/")
    parser.add_argument("--output", help="write the JSON report to this path (UTF-8, LF)")
    parser.add_argument(
        "--include-descendants",
        action="store_true",
        help="precheck the root task and its recursive current/archive children as one scope",
    )
    args = parser.parse_args(argv)

    task_input = Path(args.task_dir).expanduser()
    task_dir = Path(os.path.abspath(task_input)) if args.include_descendants else task_input.resolve()
    if not task_dir.is_dir():
        print(f"ERROR: task directory not found: {task_dir}", file=sys.stderr)
        return 2

    if args.repo_root:
        repo_root = Path(args.repo_root).expanduser().resolve()
        if not repo_root.is_dir():
            print(f"ERROR: repo root not found: {repo_root}", file=sys.stderr)
            return 2
    else:
        found = find_repo_root(task_dir)
        if found is None:
            print(
                "ERROR: no ancestor directory contains .trellis/; pass --repo-root",
                file=sys.stderr,
            )
            return 2
        repo_root = found

    if args.include_descendants:
        try:
            report = build_tree_report(task_dir, repo_root)
        except ScopeError as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 2
    else:
        report = build_task_report(task_dir, repo_root)
        report["repo_root"] = repo_root.as_posix()
        reviews_rel = f".trellis/reviews/{task_dir.name}.md"
        report["reviews_git"] = {
            "path": reviews_rel,
            "state": git_path_state(repo_root, reviews_rel),
        }

    if args.output:
        write_json_output(report, args.output)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    summarize(report)
    return 1 if report["blocking"] else 0


def read_task_status(task_dir: Path) -> str | None:
    task_json = task_dir / "task.json"
    if not task_json.is_file():
        return None
    try:
        return json.loads(read_text(task_json)).get("status")
    except (json.JSONDecodeError, AttributeError):
        return None


def summarize(report: dict) -> None:
    if "review_scope" in report:
        scope = report["review_scope"]
        lines = [
            f"review_scope={scope['mode']} root={scope['root']} task_count={scope['task_count']}",
            f"members={[member['name'] for member in scope['members']]}",
            f"blocking items: {len(report['blocking'])}",
        ]
    else:
        lines = [
            f"task_status={report['task_status']} shape={report['artifacts']['shape']} "
            f"drift_pass_required={report['drift_pass_required']}",
            f"citations: {report['citations']['by_status']}",
            f"requirements={len(report['identifiers']['requirements'])} "
            f"criteria={len(report['identifiers']['criteria'])} "
            f"criteria_without_requirement={report['identifiers']['criteria_without_requirement']} "
            f"requirements_without_criterion={report['identifiers']['requirements_without_criterion']}",
            f"blocking items: {len(report['blocking'])}",
        ]
    for item in report["blocking"]:
        lines.append(f"  - {item}")
    reviews = report.get("reviews_git") or {}
    if reviews.get("state") == "untracked":
        lines.append(
            f"note: {reviews['path']} is untracked and not ignored (will appear in git status); "
            "add .trellis/reviews/ to .trellis/.gitignore or commit the report (the project decides)"
        )
    print("\n".join(lines), file=sys.stderr)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
