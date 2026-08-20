#!/usr/bin/env python3
"""Mechanical precheck for a Trellis task planning directory.

Decides only what strings and the filesystem can decide:
  * artifact presence
  * template placeholder residue
  * path:line citation resolution
  * R / AC identifier cross-reference

Claim truth, mechanism presence, and arithmetic stay with the reviewer.

Exit codes: 0 no blocking item, 1 blocking item present, 2 argument or path error.
"""

from __future__ import annotations

import argparse
import json
import re
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


def read_text(path: Path) -> str:
    """Read a file as UTF-8. Windows would otherwise decode with the legacy code page."""
    return path.read_text(encoding="utf-8", errors="replace")


def find_repo_root(start: Path) -> Path | None:
    for candidate in (start, *start.parents):
        if (candidate / ".trellis").is_dir():
            return candidate
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Mechanical precheck for a Trellis task planning directory."
    )
    parser.add_argument("task_dir", help="path to .trellis/tasks/<task>/")
    parser.add_argument("--repo-root", help="repository root; defaults to the nearest ancestor with .trellis/")
    parser.add_argument("--output", help="write the JSON report to this path (UTF-8, LF)")
    args = parser.parse_args(argv)

    task_dir = Path(args.task_dir).expanduser().resolve()
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

    artifacts, block_a = check_artifacts(task_dir)
    placeholders, block_p = check_placeholders(task_dir)
    citations, block_c = check_citations(task_dir, repo_root)
    identifiers, block_i = check_identifiers(task_dir)

    blocking = [*block_a, *block_p, *block_c, *block_i]
    status_counts: dict[str, int] = {}
    for entry in citations:
        status_counts[entry["status"]] = status_counts.get(entry["status"], 0) + 1

    report = {
        "task_dir": task_dir.as_posix(),
        "repo_root": repo_root.as_posix(),
        "task_status": read_task_status(task_dir),
        "artifacts": artifacts,
        "placeholders": placeholders,
        "citations": {"total": len(citations), "by_status": status_counts, "entries": citations},
        "identifiers": identifiers,
        "blocking": blocking,
        "drift_pass_required": read_task_status(task_dir) not in (None, "planning"),
    }

    if args.output:
        out = Path(args.output).expanduser().resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        print(f"wrote {out}", file=sys.stderr)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    summarize(report)
    return 1 if blocking else 0


def read_task_status(task_dir: Path) -> str | None:
    task_json = task_dir / "task.json"
    if not task_json.is_file():
        return None
    try:
        return json.loads(read_text(task_json)).get("status")
    except (json.JSONDecodeError, AttributeError):
        return None


def summarize(report: dict) -> None:
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
    print("\n".join(lines), file=sys.stderr)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
