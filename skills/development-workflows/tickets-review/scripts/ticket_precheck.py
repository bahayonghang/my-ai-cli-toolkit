#!/usr/bin/env python3
"""Pass 0 mechanical precheck for tickets-review.

Collects remote GitHub Issues (read-only gh CLI), local .scratch ticket sets,
or an offline JSON snapshot, then validates graph integrity, metadata drift,
placeholder residue, repo path links, and report destination git status.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

SAFE_SLUG_RE = re.compile(r"[^a-z0-9._-]+")
BLOCKED_BY_LINE_RE = re.compile(
    r"(?im)^\s*(?:[-*]\s*)?(?:blocked\s*by|阻塞于|依赖)\s*[:：]\s*(.+)$"
)
PART_OF_RE = re.compile(r"(?im)(?:part\s+of|父规格|parent)\s*[:：]?\s*#(\d+)")
ISSUE_REF_RE = re.compile(r"#(\d+)")
FENCED_CODE_RE = re.compile(r"```.*?```", re.DOTALL)
PLACEHOLDER_RE = re.compile(
    r"\b(?:TODO|TBD|FIXME|XXX)\b|<fill[-_ ]?me>|\[placeholder\]|\{\{[A-Za-z0-9_.-]+\}\}",
    re.IGNORECASE,
)
GITHUB_BLOB_RE = re.compile(
    r"https://github\.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)/blob/([0-9a-fA-F]{7,40}|[^/\s#]+)/([^\s)#]+)"
)
LOCAL_META_RE = re.compile(r"^\s*([A-Za-z][A-Za-z0-9 _-]{0,30})\s*:\s*(.+?)\s*$")
TRIAGE_LABEL_RE = re.compile(r"`ready-for-agent`\s*\|\s*`([^`]+)`")
DEFAULT_EXECUTION_LABELS = {"ready-for-agent", "afk-ready"}


class PrecheckError(Exception):
    """Expected operational or scope validation failure."""

    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


def is_reparse_point(path: Path) -> bool:
    try:
        st = os.lstat(path)
    except OSError:
        return False
    if stat.S_ISLNK(st.st_mode):
        return True
    attrs = getattr(st, "st_file_attributes", 0)
    reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
    return bool(attrs & reparse_flag)


def run_readonly(argv: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            argv,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
    except FileNotFoundError as exc:
        raise PrecheckError(f"required executable not found: {argv[0]}", code=2) from exc


def git_head_sha(repo_root: Path) -> str | None:
    proc = run_readonly(["git", "rev-parse", "--short", "HEAD"], repo_root)
    if proc.returncode != 0:
        return None
    return proc.stdout.strip() or None


def git_path_state(repo_root: Path, rel_posix: str) -> str:
    tracked = run_readonly(
        ["git", "ls-files", "--error-unmatch", "--", rel_posix], repo_root
    )
    if tracked.returncode == 0:
        return "tracked"
    ignored = run_readonly(["git", "check-ignore", "-q", "--", rel_posix], repo_root)
    if ignored.returncode == 0:
        return "ignored"
    return "untracked"


def git_commit_exists(repo_root: Path, ref: str) -> bool | None:
    if not re.fullmatch(r"[0-9a-fA-F]{7,40}", ref):
        return None
    proc = run_readonly(["git", "cat-file", "-e", f"{ref}^{{commit}}"], repo_root)
    return proc.returncode == 0


def load_execution_labels(repo_root: Path) -> set[str]:
    labels = set(DEFAULT_EXECUTION_LABELS)
    triage_doc = repo_root / "docs" / "agents" / "triage-labels.md"
    if triage_doc.is_file():
        text = triage_doc.read_text(encoding="utf-8", errors="replace")
        for match in TRIAGE_LABEL_RE.finditer(text):
            label = match.group(1).strip()
            if label:
                labels.add(label)
    return labels


def sanitize_slug(raw: str) -> str:
    lowered = SAFE_SLUG_RE.sub("-", raw.strip().lower()).strip("._-")
    return lowered or "scope"


def compute_scope_slug(
    tracker: str,
    scope_mode: str,
    spec_num: int | None,
    ticket_ids: list[str],
    issues_dir_name: str | None = None,
) -> str:
    if tracker == "local":
        return f"local-{sanitize_slug(issues_dir_name or 'tickets')}"
    if scope_mode == "all-open":
        return "github-open-all"
    if scope_mode == "spec-graph" and spec_num is not None:
        return f"github-spec-{spec_num}"
    nums = sorted(
        {
            int(match.group(1))
            for tid in ticket_ids
            for match in [ISSUE_REF_RE.search(str(tid))]
            if match
        }
    )
    if len(nums) == 1:
        return f"github-issue-{nums[0]}"
    if nums:
        digest = hashlib.sha256(",".join(map(str, nums)).encode("utf-8")).hexdigest()[:6]
        return f"github-issues-{nums[0]}-{nums[-1]}-{digest}"
    return "github-scope"


def gh_json(argv: list[str], cwd: Path) -> Any:
    proc = run_readonly(["gh", *argv], cwd)
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout).strip()
        raise PrecheckError(f"gh command failed ({' '.join(argv[:3])}): {err}", code=2)
    text = proc.stdout.strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise PrecheckError(f"invalid JSON from gh: {exc}", code=2) from exc


def resolve_github_repo(repo_root: Path, repo_arg: str | None) -> dict[str, Any]:
    if repo_arg:
        return {"nameWithOwner": repo_arg, "isFork": None, "parent": None}
    info = gh_json(
        ["repo", "view", "--json", "nameWithOwner,defaultBranchRef,isFork,parent"],
        repo_root,
    )
    if not isinstance(info, dict) or not info.get("nameWithOwner"):
        raise PrecheckError(
            "could not resolve GitHub repository; pass --repo <owner/repo>", code=2
        )
    return info


def fetch_github_issue(repo_root: Path, repo_slug: str, number: int) -> dict[str, Any]:
    raw = gh_json(["api", f"repos/{repo_slug}/issues/{number}"], repo_root)
    if not isinstance(raw, dict):
        raise PrecheckError(f"issue #{number} could not be fetched", code=1)
    is_pr = "pull_request" in raw and raw["pull_request"] is not None
    sub_issues: list[dict[str, Any]] = []
    blocked_by: list[dict[str, Any]] = []
    blocking: list[dict[str, Any]] = []
    if not is_pr:
        for endpoint, target in (
            (f"repos/{repo_slug}/issues/{number}/sub_issues", sub_issues),
            (f"repos/{repo_slug}/issues/{number}/dependencies/blocked_by", blocked_by),
            (f"repos/{repo_slug}/issues/{number}/dependencies/blocking", blocking),
        ):
            proc = run_readonly(["gh", "api", endpoint], repo_root)
            if proc.returncode == 0 and proc.stdout.strip():
                try:
                    data = json.loads(proc.stdout)
                except json.JSONDecodeError:
                    data = []
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "number" in item:
                            target.append(
                                {
                                    "id": f"#{item['number']}",
                                    "number": int(item["number"]),
                                    "state": str(item.get("state", "")).lower(),
                                    "title": str(item.get("title", "")),
                                }
                            )
    labels = [
        str(lbl["name"])
        for lbl in raw.get("labels", [])
        if isinstance(lbl, dict) and lbl.get("name")
    ]
    return {
        "id": f"#{number}",
        "number": number,
        "title": str(raw.get("title") or ""),
        "state": str(raw.get("state") or "").lower(),
        "is_pr": is_pr,
        "labels": labels,
        "assignees": [
            str(a["login"])
            for a in raw.get("assignees", [])
            if isinstance(a, dict) and a.get("login")
        ],
        "body": str(raw.get("body") or ""),
        "sub_issues": sub_issues,
        "blocked_by": blocked_by,
        "blocking": blocking,
        "url": str(raw.get("html_url") or ""),
    }


def collect_github_scope(
    repo_root: Path,
    repo_arg: str | None,
    scope: str | None,
    spec_num: int | None,
    issue_nums: list[int],
) -> dict[str, Any]:
    repo_info = resolve_github_repo(repo_root, repo_arg)
    repo_slug = str(repo_info["nameWithOwner"])
    open_prs_raw = gh_json(
        [
            "pr",
            "list",
            "--repo",
            repo_slug,
            "--state",
            "open",
            "--limit",
            "30",
            "--json",
            "number,title,headRefName,baseRefName,url",
        ],
        repo_root,
    )
    open_prs = open_prs_raw if isinstance(open_prs_raw, list) else []

    tickets: list[dict[str, Any]] = []
    if spec_num is not None:
        scope_mode = "spec-graph"
        parent = fetch_github_issue(repo_root, repo_slug, spec_num)
        tickets.append(parent)
        child_nums = [c["number"] for c in parent["sub_issues"]]
        if not child_nums and not parent["is_pr"]:
            listed = gh_json(
                [
                    "issue",
                    "list",
                    "--repo",
                    repo_slug,
                    "--state",
                    "open",
                    "--limit",
                    "100",
                    "--json",
                    "number,body",
                ],
                repo_root,
            )
            if isinstance(listed, list):
                for item in listed:
                    num = int(item["number"])
                    if num == spec_num:
                        continue
                    body = str(item.get("body") or "")
                    if any(int(m.group(1)) == spec_num for m in PART_OF_RE.finditer(body)):
                        child_nums.append(num)
        for num in sorted(set(child_nums)):
            if num != spec_num:
                tickets.append(fetch_github_issue(repo_root, repo_slug, num))
    elif issue_nums:
        scope_mode = "selected-issues"
        for num in sorted(set(issue_nums)):
            tickets.append(fetch_github_issue(repo_root, repo_slug, num))
    else:
        scope_mode = "all-open"
        listed = gh_json(
            [
                "issue",
                "list",
                "--repo",
                repo_slug,
                "--state",
                "open",
                "--limit",
                "100",
                "--json",
                "number",
            ],
            repo_root,
        )
        nums = sorted({int(item["number"]) for item in listed}) if isinstance(listed, list) else []
        for num in nums:
            tickets.append(fetch_github_issue(repo_root, repo_slug, num))

    return {
        "tracker": "github",
        "target": repo_slug,
        "repo_info": repo_info,
        "scope_mode": scope_mode,
        "spec_num": spec_num,
        "tickets": tickets,
        "open_prs": open_prs,
    }


def parse_local_ticket_file(path: Path, repo_root: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    lines = text.splitlines()
    meta: dict[str, str] = {}
    body_lines = lines
    if lines and lines[0].strip() == "---":
        try:
            end_idx = lines[1:].index("---") + 1
            for line in lines[1:end_idx]:
                match = LOCAL_META_RE.match(line)
                if match:
                    meta[match.group(1).strip().lower()] = match.group(2).strip()
            body_lines = lines[end_idx + 1 :]
        except ValueError:
            pass
    for line in body_lines[:20]:
        match = LOCAL_META_RE.match(line)
        if match:
            key = match.group(1).strip().lower()
            if key in {"id", "status", "labels", "blocked by", "blocked_by", "parent"}:
                meta.setdefault(key, match.group(2).strip())

    title = path.stem
    for line in body_lines:
        stripped = line.strip()
        if stripped.startswith("# "):
            title = stripped[2:].strip()
            break

    raw_labels = meta.get("labels", "")
    labels = [
        item.strip(" []'\"`")
        for item in re.split(r"[,;]", raw_labels)
        if item.strip(" []'\"`")
    ]
    raw_blocked = meta.get("blocked by") or meta.get("blocked_by") or ""
    blocked_ids: list[dict[str, Any]] = []
    if raw_blocked and raw_blocked.lower() not in {"none", "null", "n/a", "无", "-"}:
        for token in re.split(r"[,;\s]+", raw_blocked):
            cleaned = token.strip(" []'\"`")
            if cleaned and cleaned.lower() not in {"none", "无"}:
                blocked_ids.append({"id": cleaned, "state": "open"})

    rel = path.relative_to(repo_root).as_posix()
    ticket_id = meta.get("id") or path.name
    return {
        "id": ticket_id,
        "title": title,
        "state": (meta.get("status") or "open").lower(),
        "is_pr": False,
        "labels": labels,
        "assignees": [],
        "body": "\n".join(body_lines).strip(),
        "sub_issues": [],
        "blocked_by": blocked_ids,
        "blocking": [],
        "path": rel,
    }


def collect_local_scope(repo_root: Path, issues_dir_arg: str) -> dict[str, Any]:
    raw_dir = Path(issues_dir_arg)
    candidate = raw_dir if raw_dir.is_absolute() else (repo_root / raw_dir)
    if is_reparse_point(candidate):
        raise PrecheckError(f"issues directory is a symlink/reparse point: {issues_dir_arg}", code=1)
    if not candidate.is_dir():
        raise PrecheckError(f"issues directory not found: {issues_dir_arg}", code=1)
    resolved_root = repo_root.resolve()
    resolved_dir = candidate.resolve()
    try:
        rel_dir = resolved_dir.relative_to(resolved_root).as_posix()
    except ValueError as exc:
        raise PrecheckError(
            f"issues directory escapes repository root: {issues_dir_arg}", code=1
        ) from exc

    feature_name = resolved_dir.parent.name if resolved_dir.name == "issues" else resolved_dir.name
    tickets: list[dict[str, Any]] = []
    spec_file = resolved_dir.parent / "spec.md"
    if spec_file.is_file() and not is_reparse_point(spec_file):
        spec_item = parse_local_ticket_file(spec_file, resolved_root)
        spec_item["id"] = "spec.md"
        tickets.append(spec_item)

    child_items: list[dict[str, Any]] = []
    for md_file in sorted(resolved_dir.glob("*.md")):
        if is_reparse_point(md_file):
            raise PrecheckError(f"ticket file is a symlink/reparse point: {md_file.name}", code=1)
        child_items.append(parse_local_ticket_file(md_file, resolved_root))

    if tickets and tickets[0]["id"] == "spec.md":
        tickets[0]["sub_issues"] = [
            {"id": item["id"], "state": item["state"], "title": item["title"]}
            for item in child_items
        ]
    tickets.extend(child_items)
    return {
        "tracker": "local",
        "target": rel_dir,
        "scope_mode": "local-dir",
        "spec_num": None,
        "feature_name": feature_name,
        "tickets": tickets,
        "open_prs": [],
    }


def extract_body_blockers(body: str) -> list[str]:
    stripped = FENCED_CODE_RE.sub("", body)
    refs: list[str] = []
    for match in BLOCKED_BY_LINE_RE.finditer(stripped):
        tail = match.group(1).strip()
        if tail.lower() in {"none", "n/a", "无", "-"}:
            continue
        for num in ISSUE_REF_RE.findall(tail):
            refs.append(f"#{num}")
    return sorted(set(refs))


def detect_cycles(graph: dict[str, list[str]]) -> list[list[str]]:
    state: dict[str, int] = {}
    stack: list[str] = []
    cycles: list[list[str]] = []
    seen_cycles: set[tuple[str, ...]] = set()

    def dfs(node: str) -> None:
        state[node] = 1
        stack.append(node)
        for nxt in graph.get(node, []):
            if nxt not in graph:
                continue
            if state.get(nxt, 0) == 1:
                idx = stack.index(nxt)
                cyc = stack[idx:] + [nxt]
                key = tuple(cyc)
                if key not in seen_cycles:
                    seen_cycles.add(key)
                    cycles.append(cyc)
            elif state.get(nxt, 0) == 0:
                dfs(nxt)
        stack.pop()
        state[node] = 2

    for node in sorted(graph):
        if state.get(node, 0) == 0:
            dfs(node)
    return cycles


def analyze_scope(raw_scope: dict[str, Any], repo_root: Path) -> dict[str, Any]:
    tracker = str(raw_scope.get("tracker") or "github")
    target = str(raw_scope.get("target") or "")
    scope_mode = str(raw_scope.get("scope_mode") or "all-open")
    spec_num = raw_scope.get("spec_num")
    tickets = list(raw_scope.get("tickets") or [])
    open_prs = list(raw_scope.get("open_prs") or [])

    blocking_errors: list[dict[str, Any]] = []
    signals: list[dict[str, Any]] = []
    execution_labels = load_execution_labels(repo_root)

    if not tickets:
        blocking_errors.append(
            {"code": "empty_scope", "message": "no tickets found in the requested scope"}
        )

    seen_ids: set[str] = set()
    id_set: set[str] = set()
    for ticket in tickets:
        tid = str(ticket.get("id") or "")
        if not tid:
            blocking_errors.append(
                {"code": "missing_ticket_id", "message": "ticket entry is missing id"}
            )
            continue
        if tid in seen_ids:
            blocking_errors.append(
                {"code": "duplicate_ticket_id", "ticket": tid, "message": f"duplicate ticket {tid}"}
            )
        seen_ids.add(tid)
        id_set.add(tid)
        if ticket.get("is_pr"):
            blocking_errors.append(
                {
                    "code": "pr_number_in_issue_scope",
                    "ticket": tid,
                    "message": f"{tid} is a Pull Request, not an Issue; route to code-review or gh-pr-release",
                }
            )

    dep_graph: dict[str, list[str]] = {}
    for ticket in tickets:
        tid = str(ticket.get("id") or "")
        body = str(ticket.get("body") or "")
        labels = [str(x) for x in ticket.get("labels", [])]
        sub_issues = list(ticket.get("sub_issues") or [])
        native_blockers = [
            str(b["id"] if isinstance(b, dict) else b)
            for b in (ticket.get("blocked_by") or [])
        ]
        dep_graph[tid] = sorted(set(native_blockers))

        if sub_issues:
            bad_labels = sorted(set(labels) & execution_labels)
            if bad_labels:
                signals.append(
                    {
                        "code": "parent_spec_has_execution_label",
                        "ticket": tid,
                        "labels": bad_labels,
                        "sub_issue_count": len(sub_issues),
                        "message": f"parent spec {tid} carries execution label(s) {bad_labels} while owning {len(sub_issues)} sub-issues",
                    }
                )

        if tracker == "github":
            body_blockers = extract_body_blockers(body)
            if body_blockers and sorted(set(body_blockers)) != sorted(set(native_blockers)):
                signals.append(
                    {
                        "code": "body_vs_native_dependency_drift",
                        "ticket": tid,
                        "body_blockers": body_blockers,
                        "native_blockers": sorted(set(native_blockers)),
                        "message": f"{tid} body blockers {body_blockers} differ from native blocked_by {sorted(set(native_blockers))}",
                    }
                )

        for blocker in native_blockers:
            if blocker not in id_set:
                signals.append(
                    {
                        "code": "external_or_missing_blocker_ref",
                        "ticket": tid,
                        "blocker": blocker,
                        "message": f"{tid} is blocked by {blocker}, which is outside the resolved scope",
                    }
                )

        stripped_body = FENCED_CODE_RE.sub("", body).strip()
        if not stripped_body:
            signals.append(
                {
                    "code": "empty_ticket_body",
                    "ticket": tid,
                    "message": f"{tid} has an empty body",
                }
            )
        else:
            hits = sorted(set(PLACEHOLDER_RE.findall(stripped_body)))
            if hits:
                signals.append(
                    {
                        "code": "placeholder_residue",
                        "ticket": tid,
                        "matches": hits,
                        "message": f"{tid} contains unresolved placeholder token(s): {hits}",
                    }
                )

        for match in GITHUB_BLOB_RE.finditer(body):
            link_repo, ref, rel_path = match.group(1), match.group(2), match.group(3)
            if tracker == "github" and target and link_repo.lower() == target.lower():
                clean_rel = rel_path.split("#", 1)[0]
                if not (repo_root / clean_rel).exists():
                    signals.append(
                        {
                            "code": "missing_repo_path_ref",
                            "ticket": tid,
                            "path": clean_rel,
                            "ref": ref,
                            "message": f"{tid} links to {clean_rel} (at {ref}), which does not exist in the current checkout",
                        }
                    )
                commit_ok = git_commit_exists(repo_root, ref)
                if commit_ok is False:
                    signals.append(
                        {
                            "code": "unknown_commit_ref",
                            "ticket": tid,
                            "ref": ref,
                            "message": f"{tid} links to commit {ref}, which was not found in local git history",
                        }
                    )

    for cycle in detect_cycles(dep_graph):
        blocking_errors.append(
            {
                "code": "dependency_cycle",
                "cycle": cycle,
                "message": f"dependency cycle detected: {' -> '.join(cycle)}",
            }
        )

    ticket_ids = [str(t.get("id") or "") for t in tickets if t.get("id")]
    scope_slug = compute_scope_slug(
        tracker=tracker,
        scope_mode=scope_mode,
        spec_num=spec_num,
        ticket_ids=ticket_ids,
        issues_dir_name=raw_scope.get("feature_name"),
    )
    report_rel = f"reports/tickets-review/{scope_slug}.md"
    report_git_state = git_path_state(repo_root, report_rel)

    member_summaries = [
        {
            "id": str(t.get("id") or ""),
            "title": str(t.get("title") or ""),
            "state": str(t.get("state") or ""),
            "labels": list(t.get("labels") or []),
            "sub_issues": [
                str(s["id"] if isinstance(s, dict) else s)
                for s in (t.get("sub_issues") or [])
            ],
            "blocked_by": [
                str(b["id"] if isinstance(b, dict) else b)
                for b in (t.get("blocked_by") or [])
            ],
            "body_chars": len(str(t.get("body") or "")),
        }
        for t in tickets
    ]

    return {
        "ok": len(blocking_errors) == 0,
        "tracker": tracker,
        "target": target,
        "scope_mode": scope_mode,
        "scope_slug": scope_slug,
        "report_rel": report_rel,
        "report_git_state": report_git_state,
        "base_commit": git_head_sha(repo_root),
        "ticket_count": len(tickets),
        "open_pr_count": len(open_prs),
        "open_prs": open_prs,
        "members": member_summaries,
        "blocking_errors": blocking_errors,
        "signals": signals,
    }


def parse_issue_csv(raw: str | None) -> list[int]:
    if not raw:
        return []
    nums: list[int] = []
    for part in re.split(r"[\s,]+", raw.strip()):
        cleaned = part.lstrip("#").strip()
        if not cleaned:
            continue
        if not cleaned.isdigit():
            raise PrecheckError(f"invalid issue number: {part!r}", code=2)
        nums.append(int(cleaned))
    return nums


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = argparse.ArgumentParser(
        description="Pass 0 mechanical precheck for remote GitHub Issues or local .scratch tickets."
    )
    parser.add_argument(
        "--tracker",
        choices=("github", "local"),
        default="github",
        help="Ticket tracker backend (default: github).",
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repository root directory (default: current directory).",
    )
    parser.add_argument(
        "--repo",
        help="Explicit GitHub owner/repo override to prevent fork misdirection.",
    )
    parser.add_argument(
        "--scope",
        choices=("all",),
        help="Fetch all open GitHub issues.",
    )
    parser.add_argument(
        "--spec",
        type=int,
        help="Parent Spec GitHub issue number to expand with its sub-issues.",
    )
    parser.add_argument(
        "--issues",
        help="Comma- or space-separated GitHub issue numbers (e.g. 64,65,66).",
    )
    parser.add_argument(
        "--issues-dir",
        help="Local .scratch/<feature>/issues directory path (required for --tracker local).",
    )
    parser.add_argument(
        "--snapshot",
        help="Offline JSON snapshot file to precheck without calling gh.",
    )
    parser.add_argument(
        "--output",
        help="Optional UTF-8 LF JSON output path (avoids shell redirection encoding bugs).",
    )
    args = parser.parse_args(argv)

    repo_root = Path(args.repo_root).expanduser().resolve()
    if not repo_root.is_dir():
        print(f"ERROR: repo root not found: {args.repo_root}", file=sys.stderr)
        return 2

    try:
        if args.snapshot:
            snap_path = Path(args.snapshot).expanduser()
            if not snap_path.is_file():
                raise PrecheckError(f"snapshot file not found: {args.snapshot}", code=2)
            raw_scope = json.loads(snap_path.read_text(encoding="utf-8-sig"))
            if not isinstance(raw_scope, dict):
                raise PrecheckError("snapshot JSON must be an object", code=2)
        elif args.tracker == "local":
            if not args.issues_dir:
                raise PrecheckError("--issues-dir is required when --tracker local", code=2)
            raw_scope = collect_local_scope(repo_root, args.issues_dir)
        else:
            issue_nums = parse_issue_csv(args.issues)
            raw_scope = collect_github_scope(
                repo_root=repo_root,
                repo_arg=args.repo,
                scope=args.scope,
                spec_num=args.spec,
                issue_nums=issue_nums,
            )
        report = analyze_scope(raw_scope, repo_root)
    except PrecheckError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return exc.code
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid snapshot JSON: {exc}", file=sys.stderr)
        return 2

    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        out_path = Path(args.output).expanduser()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(rendered, encoding="utf-8", newline="\n")
    else:
        sys.stdout.write(rendered)
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
