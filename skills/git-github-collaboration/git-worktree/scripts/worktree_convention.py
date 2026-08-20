#!/usr/bin/env python3
"""Resolve worktree convention roots, ignore gates, and git argv plans."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

KNOWN_ROOTS = (
    ".agents/worktrees",
    ".claude/worktrees",
    ".worktrees",
    "worktrees",
)
KNOWN_ROOT_PRIORITY = (
    ".worktrees",
    ".claude/worktrees",
    ".agents/worktrees",
    "worktrees",
)
IN_PROGRESS_NAMES = (
    "MERGE_HEAD",
    "CHERRY_PICK_HEAD",
    "REVERT_HEAD",
    "BISECT_LOG",
    "rebase-merge",
    "rebase-apply",
)
META_DIRNAME = ".git-worktree-meta"


class HelperError(Exception):
    def __init__(self, message: str, code: int) -> None:
        super().__init__(message)
        self.code = code


def emit_json(payload: dict[str, Any], output: Path | None) -> None:
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if output is not None:
        output.write_text(text, encoding="utf-8", newline="\n")
    sys.stdout.write(text)


def fail(message: str, code: int) -> int:
    print(f"ERROR: {message}", file=sys.stderr)
    return code


def which_git() -> str:
    executable = shutil.which("git")
    if executable is None:
        raise HelperError("git executable was not found on PATH", 2)
    return executable


def run_git(
    repo: Path,
    args: list[str],
    cwd: Path | None = None,
    stdin: str | None = None,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [which_git(), *args],
        cwd=str(cwd or repo),
        input=stdin,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def require_repo(repo_root: Path) -> Path:
    repo = repo_root.expanduser()
    if not repo.exists():
        raise HelperError(f"repo-root does not exist: {repo}", 2)
    repo = repo.resolve()
    probe = run_git(repo, ["rev-parse", "--show-toplevel"])
    if probe.returncode != 0:
        raise HelperError("repo-root is not a git repository", 2)
    toplevel = Path(probe.stdout.strip())
    try:
        resolved_top = toplevel.resolve()
    except OSError as exc:
        raise HelperError(f"cannot resolve git toplevel: {exc}", 2) from exc
    return resolved_top


def posix_rel(path: str) -> str:
    return path.replace("\\", "/").strip()


def is_inside(repo: Path, candidate: Path) -> bool:
    try:
        candidate.resolve().relative_to(repo)
        return True
    except ValueError:
        return False


def validate_explicit_root(repo: Path, raw: str) -> str:
    text = posix_rel(raw)
    if not text or text in {".", ".."}:
        raise HelperError("explicit-root must be a relative directory inside the repository", 2)
    path = Path(text)
    if path.is_absolute() or (len(text) >= 2 and text[1] == ":"):
        raise HelperError("explicit-root must not be an absolute path", 2)
    parts = [part for part in path.parts if part not in {"/", "\\"}]
    if any(part in {".", ".."} for part in parts):
        raise HelperError("explicit-root must not contain . or .. segments", 2)
    if parts[0] == ".git" or text == ".git" or text.startswith(".git/"):
        raise HelperError("explicit-root must not target .git", 2)
    candidate = (repo / Path(*parts))
    if candidate.exists() and candidate.is_symlink():
        if not is_inside(repo, candidate):
            raise HelperError("explicit-root symlink escapes the repository", 2)
    resolved = candidate.resolve()
    if not is_inside(repo, resolved) and resolved != repo:
        raise HelperError("explicit-root escapes the repository", 2)
    if resolved == repo:
        raise HelperError("explicit-root must not be the repository root", 2)
    return "/".join(parts)


def sanitize_slug(raw: str) -> str:
    text = raw.strip().replace("/", "-").replace("\\", "-")
    if not text or text in {".", ".."}:
        raise HelperError("slug is empty or illegal", 2)
    if Path(text).is_absolute() or "/" in text or "\\" in text:
        raise HelperError("slug must not contain path separators after sanitizing", 2)
    if text.startswith(".git"):
        raise HelperError("slug must not target .git", 2)
    return text


def parse_worktree_list(repo: Path) -> list[dict[str, Any]]:
    result = run_git(repo, ["worktree", "list", "--porcelain"])
    if result.returncode != 0:
        raise HelperError(result.stderr.strip() or "git worktree list failed", 1)
    records: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for line in result.stdout.splitlines():
        if not line:
            if current is not None:
                records.append(current)
                current = None
            continue
        if line.startswith("worktree "):
            if current is not None:
                records.append(current)
            current = {
                "path": line[len("worktree ") :],
                "head": None,
                "branch": None,
                "detached": False,
                "locked": False,
                "prunable": False,
            }
        elif current is None:
            continue
        elif line.startswith("HEAD "):
            current["head"] = line[len("HEAD ") :]
        elif line.startswith("branch "):
            ref = line[len("branch ") :]
            current["branch"] = ref.removeprefix("refs/heads/")
        elif line == "detached":
            current["detached"] = True
        elif line.startswith("locked"):
            current["locked"] = True
        elif line.startswith("prunable"):
            current["prunable"] = True
    if current is not None:
        records.append(current)
    return records


def classify_root_from_rel(rel: str) -> str:
    posix = posix_rel(rel)
    for known in KNOWN_ROOTS:
        if posix == known or posix.startswith(known + "/"):
            return known
    parent = str(Path(posix).parent).replace("\\", "/")
    if parent in {".", ""}:
        return posix
    return parent


def registered_in_repo_roots(repo: Path, records: list[dict[str, Any]]) -> list[str]:
    roots: list[str] = []
    for index, record in enumerate(records):
        if index == 0:
            continue
        path = Path(record["path"])
        if not path.exists():
            continue
        resolved = path.resolve()
        if not is_inside(repo, resolved):
            continue
        rel = resolved.relative_to(repo).as_posix()
        root = classify_root_from_rel(rel)
        if root not in roots:
            roots.append(root)
    return roots


def existing_known_roots(repo: Path) -> list[str]:
    found: list[str] = []
    for root in KNOWN_ROOT_PRIORITY:
        if (repo / root).is_dir():
            found.append(root)
    return found


def pick_root(explicit: str | None, registered: list[str], existing: list[str]) -> tuple[str, str]:
    if explicit:
        return explicit, "explicit"
    if registered:
        if len(registered) == 1:
            return registered[0], "registered"
        for preferred in KNOWN_ROOT_PRIORITY:
            if preferred in registered:
                return preferred, "registered"
        return sorted(registered)[0], "registered"
    if existing:
        return existing[0], "existing-local"
    return ".worktrees", "default"


def isolation_state(repo: Path) -> dict[str, Any]:
    git_dir = run_git(repo, ["rev-parse", "--absolute-git-dir"])
    common = run_git(repo, ["rev-parse", "--git-common-dir"])
    superproject = run_git(repo, ["rev-parse", "--show-superproject-working-tree"])
    git_dir_path = Path(git_dir.stdout.strip()).resolve() if git_dir.returncode == 0 else None
    common_raw = common.stdout.strip()
    common_path = (repo / common_raw).resolve() if common_raw else None
    super_path = superproject.stdout.strip()
    already_linked = (
        git_dir_path is not None
        and common_path is not None
        and git_dir_path != common_path
        and not super_path
    )
    return {
        "git_dir": str(git_dir_path) if git_dir_path else None,
        "common_dir": str(common_path) if common_path else None,
        "submodule": bool(super_path),
        "already_linked": already_linked,
    }


def parse_check_ignore_z(raw: str) -> list[dict[str, str]]:
    parts = raw.split("\0")
    while parts and parts[-1] == "":
        parts.pop()
    records: list[dict[str, str]] = []
    index = 0
    while index + 3 < len(parts):
        records.append(
            {
                "source": parts[index],
                "linenum": parts[index + 1],
                "pattern": parts[index + 2],
                "pathname": parts[index + 3],
            }
        )
        index += 4
    return records


def parse_check_ignore_text(raw: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for line in raw.splitlines():
        if not line or ":" not in line:
            continue
        left, pathname = (line.split("\t", 1) + [""])[:2]
        fields = left.split(":")
        if len(fields) < 3:
            continue
        records.append(
            {
                "source": fields[0],
                "linenum": fields[1],
                "pattern": ":".join(fields[2:]),
                "pathname": pathname,
            }
        )
    return records


def excludes_file(repo: Path) -> Path | None:
    result = run_git(repo, ["config", "--get", "core.excludesFile"])
    if result.returncode != 0 or not result.stdout.strip():
        return None
    return Path(result.stdout.strip()).expanduser()


def source_is_repo_gitignore(repo: Path, source: str) -> bool:
    if not source or source == "pathspec":
        return False
    source_path = Path(source)
    if not source_path.is_absolute():
        source_path = repo / source_path
    try:
        resolved = source_path.resolve()
    except OSError:
        return False
    if resolved.name != ".gitignore":
        return False
    info_exclude = (repo / ".git" / "info" / "exclude").resolve()
    if resolved == info_exclude:
        return False
    global_exclude = excludes_file(repo)
    if global_exclude is not None:
        try:
            if resolved == global_exclude.resolve():
                return False
        except OSError:
            pass
    return is_inside(repo, resolved) or resolved == repo / ".gitignore"


def inspect_ignore(repo: Path, resolved_root: str) -> dict[str, Any]:
    probe = posix_rel(resolved_root).rstrip("/") + "/"
    result = run_git(repo, ["check-ignore", "-v", "-z", "--stdin"], stdin=probe + "\0")
    records = parse_check_ignore_z(result.stdout)
    if not records and result.stdout:
        records = parse_check_ignore_text(result.stdout)
    matched = records[0] if records else None
    check_ignore = result.returncode == 0 and matched is not None
    source = matched["source"] if matched else None
    covers = bool(check_ignore and source and source_is_repo_gitignore(repo, source))
    return {
        "probe": probe,
        "check_ignore": check_ignore,
        "check_ignore_source": source,
        "check_ignore_linenum": matched["linenum"] if matched else None,
        "gitignore_patterns": [matched["pattern"]] if matched else [],
        "gitignore_covers": covers,
        "write_required": not covers,
        "proposed_line": probe,
    }


def gitignore_path(repo: Path) -> Path:
    return repo / ".gitignore"


def apply_ignore(repo: Path, resolved_root: str) -> dict[str, Any]:
    gate = inspect_ignore(repo, resolved_root)
    if gate["gitignore_covers"]:
        return {**gate, "wrote": False, "restored": False}
    path = gitignore_path(repo)
    previous = path.read_bytes() if path.exists() else None
    line = posix_rel(resolved_root).rstrip("/") + "/"
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    prefix = "" if not existing or existing.endswith("\n") else "\n"
    try:
        path.write_text(existing + prefix + line + "\n", encoding="utf-8", newline="\n")
        gate = inspect_ignore(repo, resolved_root)
        if not gate["gitignore_covers"]:
            if previous is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(previous)
            raise HelperError("gitignore apply did not make check-ignore accept a repo .gitignore source", 1)
        return {**gate, "wrote": True, "restored": False}
    except HelperError:
        raise
    except OSError as exc:
        if previous is None:
            path.unlink(missing_ok=True)
        else:
            path.write_bytes(previous)
        raise HelperError(f"failed to update .gitignore: {exc}", 1) from exc


IGNORE_FIELDS = (
    "probe",
    "check_ignore",
    "check_ignore_source",
    "check_ignore_linenum",
    "gitignore_patterns",
    "gitignore_covers",
    "write_required",
    "proposed_line",
)


def merge_ignore(payload: dict[str, Any], ignore: dict[str, Any]) -> None:
    for key in IGNORE_FIELDS:
        if key in ignore:
            payload[key] = ignore[key]


def default_start_point(repo: Path) -> str | None:
    symbolic = run_git(repo, ["symbolic-ref", "--quiet", "refs/remotes/origin/HEAD"])
    if symbolic.returncode == 0:
        ref = symbolic.stdout.strip()
        if ref and run_git(repo, ["rev-parse", "--verify", ref]).returncode == 0:
            return ref
    for ref in ("refs/heads/main", "refs/heads/master"):
        if run_git(repo, ["rev-parse", "--verify", ref]).returncode == 0:
            return ref
    return None


def local_branch_exists(repo: Path, branch: str) -> bool:
    return run_git(repo, ["show-ref", "--verify", "--quiet", f"refs/heads/{branch}"]).returncode == 0


def remote_branch_exists(repo: Path, branch: str) -> bool:
    listed = run_git(repo, ["for-each-ref", "--format=%(refname)", "refs/remotes"])
    if listed.returncode != 0:
        return False
    suffix = "/" + branch
    return any(line.endswith(suffix) for line in listed.stdout.splitlines() if line)


def branch_in_use(records: list[dict[str, Any]], branch: str) -> str | None:
    for record in records:
        if record.get("branch") == branch:
            return record["path"]
    return None


def path_registered(records: list[dict[str, Any]], path: Path) -> bool:
    resolved = path.resolve() if path.exists() else path
    for record in records:
        registered = Path(record["path"])
        compare = registered.resolve() if registered.exists() else registered
        if compare == resolved:
            return True
    return False


def meta_path(repo: Path, resolved_root: str, slug: str) -> Path:
    return repo / resolved_root / META_DIRNAME / f"{slug}.json"


def read_owner(path: Path) -> str | None:
    if not path.is_file():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    owner = payload.get("owner")
    return str(owner) if owner else None


def worktree_git_dir(repo: Path, worktree_path: Path) -> Path | None:
    result = run_git(repo, ["rev-parse", "--absolute-git-dir"], cwd=worktree_path)
    if result.returncode != 0:
        return None
    return Path(result.stdout.strip())


def in_progress_markers(git_dir: Path) -> list[str]:
    found: list[str] = []
    for name in IN_PROGRESS_NAMES:
        if (git_dir / name).exists():
            found.append(name)
    return found


def build_inspect(repo: Path, args: argparse.Namespace) -> dict[str, Any]:
    explicit = validate_explicit_root(repo, args.explicit_root) if args.explicit_root else None
    records = parse_worktree_list(repo)
    registered = registered_in_repo_roots(repo, records)
    existing = existing_known_roots(repo)
    resolved_root, reason = pick_root(explicit, registered, existing)
    isolation = isolation_state(repo)
    ignore = inspect_ignore(repo, resolved_root)
    branch = args.branch
    slug = sanitize_slug(args.slug or branch) if (args.slug or branch) else None
    worktree_path = str((repo / resolved_root / slug).resolve()) if slug else None
    return {
        "repo_root": str(repo),
        "resolved_root": resolved_root,
        "resolution_reason": reason,
        "registered_in_repo_roots": registered,
        "existing_known_roots": existing,
        "slug": slug,
        "branch": branch,
        "worktree_path": worktree_path,
        "meta_path": str(meta_path(repo, resolved_root, slug)) if slug else None,
        "already_linked": isolation["already_linked"],
        "isolation": isolation,
        "branch_in_use": branch_in_use(records, branch) if branch else None,
        **ignore,
        "ok_to_create": False,
    }


def plan_create(repo: Path, args: argparse.Namespace) -> dict[str, Any]:
    if not args.mode:
        raise HelperError("plan-create requires --mode new-branch", 2)
    if args.mode != "new-branch":
        raise HelperError("MVP only supports --mode new-branch", 1)
    if not args.branch:
        raise HelperError("plan-create requires --branch", 2)
    payload = build_inspect(repo, args)
    ignore_wrote = False
    if payload["write_required"] and not payload["already_linked"]:
        applied = apply_ignore(repo, payload["resolved_root"])
        merge_ignore(payload, applied)
        ignore_wrote = bool(applied.get("wrote"))
    payload["ignore_wrote"] = ignore_wrote
    records = parse_worktree_list(repo)
    start_point = args.start_point or default_start_point(repo)
    refusals: list[str] = []
    if payload["already_linked"]:
        refusals.append("already_in_linked_worktree")
    if local_branch_exists(repo, args.branch):
        refusals.append("local_branch_exists")
    if remote_branch_exists(repo, args.branch):
        refusals.append("remote_branch_exists")
    if payload["branch_in_use"]:
        refusals.append("branch_checked_out")
    if start_point is None:
        refusals.append("start_point_unresolved")
    elif run_git(repo, ["rev-parse", "--verify", start_point]).returncode != 0:
        refusals.append("start_point_unresolved")
    target = Path(payload["worktree_path"]) if payload["worktree_path"] else None
    if target is not None and target.exists():
        refusals.append("path_exists")
    if target is not None and path_registered(records, target):
        refusals.append("path_registered")
    if payload["write_required"]:
        refusals.append("ignore_gate")
    ok = not refusals
    payload.update(
        {
            "mode": "new-branch",
            "start_point": start_point,
            "refusals": refusals,
            "ok_to_create": ok,
            "argv": (
                ["git", "worktree", "add", "-b", args.branch, payload["worktree_path"], start_point]
                if ok and payload["worktree_path"] and start_point
                else None
            ),
            "meta_record": {
                "path": payload["worktree_path"],
                "branch": args.branch,
                "start_point": start_point,
                "owner": args.owner,
                "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            },
        }
    )
    return payload


def plan_list(repo: Path) -> dict[str, Any]:
    records = parse_worktree_list(repo)
    enriched = []
    for record in records:
        path = Path(record["path"])
        rel = path.resolve().relative_to(repo).as_posix() if path.exists() and is_inside(repo, path) else None
        slug = Path(rel).name if rel else None
        root = classify_root_from_rel(rel) if rel else None
        owner = read_owner(meta_path(repo, root, slug)) if root and slug else None
        enriched.append({**record, "relative_path": rel, "owner": owner})
    return {"repo_root": str(repo), "worktrees": enriched}


def plan_remove(repo: Path, args: argparse.Namespace) -> dict[str, Any]:
    if not args.path:
        raise HelperError("plan-remove requires --path", 2)
    requested = Path(args.path)
    if not requested.is_absolute():
        requested = repo / requested
    records = parse_worktree_list(repo)
    match = None
    for index, record in enumerate(records):
        registered = Path(record["path"])
        compare = registered.resolve() if registered.exists() else registered
        target = requested.resolve() if requested.exists() else requested
        if compare == target:
            match = {**record, "is_main": index == 0}
            break
    refusals: list[str] = []
    if match is None:
        refusals.append("path_not_registered")
    elif match["is_main"]:
        refusals.append("main_worktree")
    path = Path(match["path"]) if match else requested
    status = None
    if match and path.exists():
        status_proc = run_git(repo, ["status", "--porcelain", "-uall"], cwd=path)
        status = status_proc.stdout
        if status_proc.stdout.strip():
            refusals.append("dirty_worktree")
        git_dir = worktree_git_dir(repo, path)
        if git_dir is not None:
            if (git_dir / "locked").exists() or match.get("locked"):
                refusals.append("locked")
            markers = in_progress_markers(git_dir)
            if markers:
                refusals.append("git_operation_in_progress")
        superproject = run_git(repo, ["rev-parse", "--show-superproject-working-tree"], cwd=path)
        if superproject.stdout.strip():
            refusals.append("submodule")
    owner = None
    if match and path.exists() and is_inside(repo, path):
        rel = path.resolve().relative_to(repo).as_posix()
        root = classify_root_from_rel(rel)
        owner = read_owner(meta_path(repo, root, Path(rel).name))
    if match and owner is None and not args.allow_unowned:
        refusals.append("unowned")
    if match and owner is not None and args.owner and owner != args.owner and not args.allow_unowned:
        refusals.append("owner_mismatch")
    ok = not refusals
    return {
        "repo_root": str(repo),
        "path": str(path.resolve() if path.exists() else path),
        "owner": owner,
        "status_porcelain": status,
        "refusals": refusals,
        "ok_to_remove": ok,
        "argv": ["git", "worktree", "remove", str(path)] if ok else None,
    }


def plan_prune(repo: Path) -> dict[str, Any]:
    result = run_git(repo, ["worktree", "prune", "--dry-run"])
    if result.returncode != 0:
        raise HelperError(result.stderr.strip() or "git worktree prune --dry-run failed", 1)
    candidates = [line for line in result.stdout.splitlines() if line.strip()]
    return {
        "repo_root": str(repo),
        "dry_run_output": candidates,
        "ok_to_prune": False,
        "authorization_required": True,
        "argv": None,
    }


def record_meta(repo: Path, args: argparse.Namespace) -> dict[str, Any]:
    if not args.branch:
        raise HelperError("record-meta requires --branch", 2)
    inspect = build_inspect(repo, args)
    if not inspect["meta_path"] or not inspect["worktree_path"]:
        raise HelperError("record-meta could not resolve the worktree path", 2)
    record = {
        "path": inspect["worktree_path"],
        "branch": args.branch,
        "start_point": args.start_point,
        "owner": args.owner,
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    path = Path(inspect["meta_path"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return {"repo_root": str(repo), "meta_path": str(path), "wrote": True, "meta_record": record}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Plan git worktree convention operations.")
    parser.add_argument("--repo-root", required=True, help="Repository root to inspect.")
    parser.add_argument("--output", help="Write JSON to this UTF-8 LF file.")
    parser.add_argument("--explicit-root", help="Caller-supplied convention root relative to the repo.")
    parser.add_argument("--branch", help="Feature branch name.")
    parser.add_argument("--slug", help="Directory name under the resolved root.")
    parser.add_argument("--start-point", help="Create start-point ref.")
    parser.add_argument("--mode", help="Create mode. MVP accepts only new-branch.")
    parser.add_argument("--path", help="Worktree path for plan-remove.")
    parser.add_argument("--owner", default="agent", help="Lifecycle owner id.")
    parser.add_argument("--allow-unowned", action="store_true", help="Allow remove without owner metadata.")
    parser.add_argument("--apply", action="store_true", help="Write the proposed .gitignore line.")
    parser.add_argument(
        "command",
        choices=(
            "inspect",
            "ensure-ignore",
            "plan-create",
            "plan-list",
            "plan-remove",
            "plan-prune",
            "record-meta",
        ),
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        repo = require_repo(Path(args.repo_root))
        if args.command == "inspect":
            payload = build_inspect(repo, args)
        elif args.command == "ensure-ignore":
            explicit = validate_explicit_root(repo, args.explicit_root) if args.explicit_root else None
            records = parse_worktree_list(repo)
            resolved_root, reason = pick_root(
                explicit,
                registered_in_repo_roots(repo, records),
                existing_known_roots(repo),
            )
            if args.apply:
                payload = {"resolved_root": resolved_root, "resolution_reason": reason, **apply_ignore(repo, resolved_root)}
            else:
                payload = {
                    "resolved_root": resolved_root,
                    "resolution_reason": reason,
                    **inspect_ignore(repo, resolved_root),
                    "wrote": False,
                }
        elif args.command == "plan-create":
            payload = plan_create(repo, args)
        elif args.command == "plan-list":
            payload = plan_list(repo)
        elif args.command == "plan-remove":
            payload = plan_remove(repo, args)
        elif args.command == "plan-prune":
            payload = plan_prune(repo)
        else:
            payload = record_meta(repo, args)
        emit_json(payload, Path(args.output) if args.output else None)
        return 0
    except HelperError as exc:
        return fail(str(exc), exc.code)


if __name__ == "__main__":
    sys.exit(main())
