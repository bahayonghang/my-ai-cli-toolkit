#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections.abc import Iterable, Sequence
from pathlib import Path
from shutil import which
from typing import Any

FAILURE_CONCLUSIONS = {
    "failure",
    "cancelled",
    "timed_out",
    "action_required",
}

FAILURE_STATES = {
    "failure",
    "error",
    "cancelled",
    "timed_out",
    "action_required",
}

FAILURE_BUCKETS = {"fail"}

FAILURE_MARKERS = (
    "error",
    "fail",
    "failed",
    "traceback",
    "exception",
    "assert",
    "panic",
    "fatal",
    "timeout",
    "segmentation fault",
)

PENDING_LOG_MARKERS = (
    "still in progress",
    "log will be available when it is complete",
)

DEFAULT_MAX_LINES = 160
DEFAULT_CONTEXT_LINES = 30
SUPPORTED_RTK_PREFIXES = {"cargo", "npm", "npx", "pnpm", "yarn", "git", "gh"}


class GhResult:
    def __init__(self, returncode: int, stdout: str, stderr: str):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inspect failing GitHub PR checks, fetch logs, and suggest local repro commands.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    parser.add_argument("--pr", default=None, help="PR number or URL. Defaults to the current branch PR.")
    parser.add_argument("--max-lines", type=int, default=DEFAULT_MAX_LINES)
    parser.add_argument("--context", type=int, default=DEFAULT_CONTEXT_LINES)
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text output.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = find_git_root(Path(args.repo))
    if repo_root is None:
        print("Error: not inside a Git repository.", file=sys.stderr)
        return 1

    if not ensure_gh_available(repo_root):
        return 1

    pr_value = resolve_pr(args.pr, repo_root)
    if pr_value is None:
        return 1

    checks = fetch_checks(pr_value, repo_root)
    if checks is None:
        return 1

    failing = [check for check in checks if is_failing(check)]
    if not failing:
        message = f"PR #{pr_value}: no failing checks detected."
        print(json.dumps({"pr": pr_value, "results": []}, indent=2) if args.json else message)
        return 0

    results = [
        analyze_check(
            check,
            repo_root=repo_root,
            max_lines=max(1, args.max_lines),
            context=max(1, args.context),
        )
        for check in failing
    ]

    if args.json:
        print(json.dumps({"pr": pr_value, "results": results}, indent=2))
    else:
        render_results(pr_value, results)

    return 1


def run_gh_command(args: Sequence[str], cwd: Path) -> GhResult:
    process = subprocess.run(
        ["gh", *args],
        cwd=cwd,
        text=True,
        capture_output=True,
    )
    return GhResult(process.returncode, process.stdout, process.stderr)


def run_gh_command_raw(args: Sequence[str], cwd: Path) -> tuple[int, bytes, str]:
    process = subprocess.run(
        ["gh", *args],
        cwd=cwd,
        capture_output=True,
    )
    stderr = process.stderr.decode(errors="replace")
    return process.returncode, process.stdout, stderr


def find_git_root(start: Path) -> Path | None:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=start,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        return None
    return Path(result.stdout.strip())


def ensure_gh_available(repo_root: Path) -> bool:
    if which("gh") is None:
        print("Error: gh is not installed or not on PATH.", file=sys.stderr)
        return False
    result = run_gh_command(["auth", "status"], cwd=repo_root)
    if result.returncode == 0:
        return True
    message = (result.stderr or result.stdout or "").strip()
    print(message or "Error: gh not authenticated.", file=sys.stderr)
    return False


def resolve_pr(pr_value: str | None, repo_root: Path) -> str | None:
    if pr_value:
        return pr_value
    result = run_gh_command(["pr", "view", "--json", "number"], cwd=repo_root)
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "").strip()
        print(message or "Error: unable to resolve PR.", file=sys.stderr)
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print("Error: unable to parse PR JSON.", file=sys.stderr)
        return None
    number = data.get("number")
    if not number:
        print("Error: no PR number found.", file=sys.stderr)
        return None
    return str(number)


def fetch_checks(pr_value: str, repo_root: Path) -> list[dict[str, Any]] | None:
    primary_fields = ["name", "state", "conclusion", "detailsUrl", "startedAt", "completedAt"]
    result = run_gh_command(
        ["pr", "checks", pr_value, "--json", ",".join(primary_fields)],
        cwd=repo_root,
    )
    if result.returncode != 0:
        message = "\n".join(filter(None, [result.stderr, result.stdout])).strip()
        available_fields = parse_available_fields(message)
        if available_fields:
            fallback_fields = ["name", "state", "bucket", "link", "startedAt", "completedAt", "workflow"]
            selected_fields = [field for field in fallback_fields if field in available_fields]
            if not selected_fields:
                print("Error: no usable fields available for gh pr checks.", file=sys.stderr)
                return None
            result = run_gh_command(
                ["pr", "checks", pr_value, "--json", ",".join(selected_fields)],
                cwd=repo_root,
            )
            if result.returncode != 0:
                message = (result.stderr or result.stdout or "").strip()
                print(message or "Error: gh pr checks failed.", file=sys.stderr)
                return None
        else:
            print(message or "Error: gh pr checks failed.", file=sys.stderr)
            return None

    try:
        data = json.loads(result.stdout or "[]")
    except json.JSONDecodeError:
        print("Error: unable to parse checks JSON.", file=sys.stderr)
        return None
    if not isinstance(data, list):
        print("Error: unexpected checks JSON shape.", file=sys.stderr)
        return None
    return data


def is_failing(check: dict[str, Any]) -> bool:
    conclusion = normalize_field(check.get("conclusion"))
    if conclusion in FAILURE_CONCLUSIONS:
        return True
    state = normalize_field(check.get("state") or check.get("status"))
    if state in FAILURE_STATES:
        return True
    bucket = normalize_field(check.get("bucket"))
    return bucket in FAILURE_BUCKETS


def analyze_check(check: dict[str, Any], repo_root: Path, max_lines: int, context: int) -> dict[str, Any]:
    url = check.get("detailsUrl") or check.get("link") or ""
    run_id = extract_run_id(url)
    job_id = extract_job_id(url)
    reproduction_commands = suggest_reproduction_commands(str(check.get("name", "")), repo_root)
    result: dict[str, Any] = {
        "name": check.get("name", ""),
        "detailsUrl": url,
        "runId": run_id,
        "jobId": job_id,
        "reproductionCommands": reproduction_commands,
        "rtkCommands": build_rtk_commands(reproduction_commands),
    }

    if run_id is None:
        result["status"] = "external"
        result["note"] = "No GitHub Actions run id detected in detailsUrl. Treat this as an external provider unless the user asks otherwise."
        return result

    metadata = fetch_run_metadata(run_id, repo_root)
    log_text, log_error, log_status = fetch_check_log(run_id=run_id, job_id=job_id, repo_root=repo_root)

    if log_status == "pending":
        result["status"] = "log_pending"
        result["note"] = log_error or "Logs are not available yet."
        if metadata:
            result["run"] = metadata
        return result

    if log_error:
        result["status"] = "log_unavailable"
        result["error"] = log_error
        if metadata:
            result["run"] = metadata
        return result

    result["status"] = "ok"
    result["run"] = metadata or {}
    result["logSnippet"] = extract_failure_snippet(log_text, max_lines=max_lines, context=context)
    result["logTail"] = tail_lines(log_text, max_lines)
    return result


def extract_run_id(url: str) -> str | None:
    if not url:
        return None
    for pattern in (r"/actions/runs/(\d+)", r"/runs/(\d+)"):
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def extract_job_id(url: str) -> str | None:
    if not url:
        return None
    match = re.search(r"/actions/runs/\d+/job/(\d+)", url)
    if match:
        return match.group(1)
    match = re.search(r"/job/(\d+)", url)
    if match:
        return match.group(1)
    return None


def fetch_run_metadata(run_id: str, repo_root: Path) -> dict[str, Any] | None:
    fields = ["conclusion", "status", "workflowName", "name", "event", "headBranch", "headSha", "url"]
    result = run_gh_command(["run", "view", run_id, "--json", ",".join(fields)], cwd=repo_root)
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def fetch_check_log(run_id: str, job_id: str | None, repo_root: Path) -> tuple[str, str, str]:
    log_text, log_error = fetch_run_log(run_id, repo_root)
    if not log_error:
        return log_text, "", "ok"

    if is_log_pending_message(log_error) and job_id:
        job_log, job_error = fetch_job_log(job_id, repo_root)
        if job_log:
            return job_log, "", "ok"
        if job_error and is_log_pending_message(job_error):
            return "", job_error, "pending"
        if job_error:
            return "", job_error, "error"
        return "", log_error, "pending"

    if is_log_pending_message(log_error):
        return "", log_error, "pending"

    return "", log_error, "error"


def fetch_run_log(run_id: str, repo_root: Path) -> tuple[str, str]:
    result = run_gh_command(["run", "view", run_id, "--log"], cwd=repo_root)
    if result.returncode != 0:
        error = (result.stderr or result.stdout or "").strip()
        return "", error or "gh run view failed"
    return result.stdout, ""


def fetch_job_log(job_id: str, repo_root: Path) -> tuple[str, str]:
    repo_slug = fetch_repo_slug(repo_root)
    if not repo_slug:
        return "", "Error: unable to resolve repository name for job logs."
    endpoint = f"/repos/{repo_slug}/actions/jobs/{job_id}/logs"
    returncode, stdout_bytes, stderr = run_gh_command_raw(["api", endpoint], cwd=repo_root)
    if returncode != 0:
        message = (stderr or stdout_bytes.decode(errors="replace")).strip()
        return "", message or "gh api job logs failed"
    if stdout_bytes.startswith(b"PK"):
        return "", "Job logs returned a zip archive; unable to parse."
    return stdout_bytes.decode(errors="replace"), ""


def fetch_repo_slug(repo_root: Path) -> str | None:
    result = run_gh_command(["repo", "view", "--json", "nameWithOwner"], cwd=repo_root)
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        return None
    name_with_owner = data.get("nameWithOwner")
    return str(name_with_owner) if name_with_owner else None


def parse_available_fields(message: str) -> list[str]:
    if "Available fields:" not in message:
        return []
    fields: list[str] = []
    collecting = False
    for line in message.splitlines():
        if "Available fields:" in line:
            collecting = True
            continue
        if not collecting:
            continue
        field = line.strip()
        if field:
            fields.append(field)
    return fields


def normalize_field(value: Any) -> str:
    return str(value or "").strip().lower()


def is_log_pending_message(message: str) -> bool:
    lowered = message.lower()
    return any(marker in lowered for marker in PENDING_LOG_MARKERS)


def extract_failure_snippet(log_text: str, max_lines: int, context: int) -> str:
    lines = log_text.splitlines()
    if not lines:
        return ""

    marker_index = find_failure_index(lines)
    if marker_index is None:
        return "\n".join(lines[-max_lines:])

    start = max(0, marker_index - context)
    end = min(len(lines), marker_index + context)
    window = lines[start:end]
    if len(window) > max_lines:
        window = window[-max_lines:]
    return "\n".join(window)


def find_failure_index(lines: Sequence[str]) -> int | None:
    for index in range(len(lines) - 1, -1, -1):
        lowered = lines[index].lower()
        if any(marker in lowered for marker in FAILURE_MARKERS):
            return index
    return None


def tail_lines(text: str, max_lines: int) -> str:
    lines = text.splitlines()
    return "\n".join(lines[-max_lines:]) if max_lines > 0 else ""


def render_results(pr_number: str, results: Iterable[dict[str, Any]]) -> None:
    results_list = list(results)
    print(f"PR #{pr_number}: {len(results_list)} failing checks analyzed.")
    for result in results_list:
        print("-" * 60)
        print(f"Check: {result.get('name', '')}")
        if result.get("detailsUrl"):
            print(f"Details: {result['detailsUrl']}")
        if result.get("runId"):
            print(f"Run ID: {result['runId']}")
        if result.get("jobId"):
            print(f"Job ID: {result['jobId']}")
        print(f"Status: {result.get('status', 'unknown')}")

        run_meta = result.get("run", {})
        if run_meta:
            workflow = run_meta.get("workflowName") or run_meta.get("name") or ""
            conclusion = run_meta.get("conclusion") or run_meta.get("status") or ""
            branch = run_meta.get("headBranch", "")
            sha = (run_meta.get("headSha") or "")[:12]
            print(f"Workflow: {workflow} ({conclusion})")
            if branch or sha:
                print(f"Branch/SHA: {branch} {sha}")
            if run_meta.get("url"):
                print(f"Run URL: {run_meta['url']}")

        if result.get("note"):
            print(f"Note: {result['note']}")
        if result.get("error"):
            print(f"Error fetching logs: {result['error']}")
        elif result.get("logSnippet"):
            print("Failure snippet:")
            print(indent_block(result["logSnippet"]))

        reproduction_commands = result.get("reproductionCommands") or []
        if reproduction_commands:
            print("Local repro:")
            for command in reproduction_commands:
                print(f"  - {command}")
        rtk_commands = result.get("rtkCommands") or []
        if rtk_commands:
            print("RTK fast path:")
            for command in rtk_commands:
                print(f"  - {command}")
    print("-" * 60)


def indent_block(text: str, prefix: str = "  ") -> str:
    return "\n".join(f"{prefix}{line}" for line in text.splitlines())


def suggest_reproduction_commands(check_name: str, repo_root: Path) -> list[str]:
    lowered = check_name.lower()
    commands: list[str] = []
    just_recipes = discover_just_recipes(repo_root)
    package_scripts = discover_package_scripts(repo_root)
    has_cargo = (repo_root / "Cargo.toml").exists()
    has_tsconfig = any(repo_root.rglob("tsconfig.json"))

    if "clippy" in lowered:
        commands.extend(command_if_recipe(just_recipes, "rust-check-all"))
        if has_cargo:
            commands.append("cargo clippy --workspace --all-targets --all-features -- -D warnings")
    if "fmt" in lowered or "format" in lowered:
        if has_cargo:
            commands.append("cargo fmt --all -- --check")
    if any(token in lowered for token in ("rust", "cargo test")):
        commands.extend(command_if_recipe(just_recipes, "rust-test"))
        if has_cargo:
            commands.append("cargo test --workspace")

    if any(token in lowered for token in ("type", "tsc", "typescript")):
        commands.extend(command_if_recipe(just_recipes, "ts-check"))
        commands.extend(
            match_package_scripts(
                package_scripts,
                repo_root=repo_root,
                include=("type", "tsc", "check"),
                body=("tsc", "typecheck"),
            )
        )
        if has_tsconfig:
            commands.append("npx tsc --noEmit")

    if any(token in lowered for token in ("vitest", "unit test", "tests", "test")):
        commands.extend(command_if_recipe(just_recipes, "mcs-web-test"))
        commands.extend(command_if_recipe(just_recipes, "rust-test"))
        commands.extend(
            match_package_scripts(
                package_scripts,
                repo_root=repo_root,
                include=("test", "vitest"),
                body=("vitest", "test"),
            )
        )
        if has_cargo:
            commands.append("cargo test --workspace")

    if any(token in lowered for token in ("playwright", "e2e", "end-to-end")):
        commands.extend(
            match_package_scripts(
                package_scripts,
                repo_root=repo_root,
                include=("e2e", "playwright"),
                body=("playwright",),
            )
        )

    if "build" in lowered:
        commands.extend(
            match_package_scripts(
                package_scripts,
                repo_root=repo_root,
                include=("build",),
                body=("build",),
            )
        )
        if has_cargo:
            commands.append("cargo build --workspace")

    if not commands:
        commands.extend(command_if_recipe(just_recipes, "ci"))
        commands.extend(
            match_package_scripts(
                package_scripts,
                repo_root=repo_root,
                include=("test", "build"),
                body=("test", "build"),
            )
        )
        if has_cargo:
            commands.append("cargo test --workspace")
        elif has_tsconfig:
            commands.append("npx tsc --noEmit")

    return dedupe(commands)[:4]


def discover_just_recipes(repo_root: Path) -> set[str]:
    justfile = repo_root / "justfile"
    if not justfile.is_file():
        return set()
    recipes: set[str] = set()
    for line in justfile.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^([A-Za-z0-9_-]+):(?:\s|$)", line)
        if match:
            recipes.add(match.group(1))
    return recipes


def command_if_recipe(recipes: set[str], recipe: str) -> list[str]:
    return [f"just {recipe}"] if recipe in recipes else []


def discover_package_scripts(repo_root: Path) -> list[tuple[Path, str, str]]:
    scripts: list[tuple[Path, str, str]] = []
    for package_json in repo_root.rglob("package.json"):
        if "node_modules" in package_json.parts:
            continue
        try:
            data = json.loads(package_json.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for name, command in (data.get("scripts") or {}).items():
            if isinstance(name, str) and isinstance(command, str):
                scripts.append((package_json.parent, name, command))
    return scripts


def match_package_scripts(
    package_scripts: list[tuple[Path, str, str]],
    repo_root: Path,
    include: tuple[str, ...],
    body: tuple[str, ...],
) -> list[str]:
    commands: list[str] = []
    for directory, name, script_body in package_scripts:
        lowered_name = name.lower()
        lowered_body = script_body.lower()
        if include and not any(token in lowered_name for token in include):
            if body and not any(token in lowered_body for token in body):
                continue
        if directory.resolve() == repo_root.resolve():
            commands.append(f"npm run {name}")
        else:
            commands.append(f'npm --prefix "{directory.relative_to(repo_root)}" run {name}')
    return commands


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        unique.append(value)
    return unique


def build_rtk_commands(commands: list[str]) -> list[str]:
    rtk_commands: list[str] = []
    for command in commands:
        normalized = command.strip()
        if normalized.startswith("npx tsc"):
            rtk_commands.append("rtk tsc" + normalized[len("npx tsc") :])
            continue
        if normalized.startswith("npx vitest"):
            rtk_commands.append("rtk vitest" + normalized[len("npx vitest") :])
            continue
        if normalized.startswith("npx playwright"):
            rtk_commands.append("rtk playwright" + normalized[len("npx playwright") :])
            continue
        if normalized.startswith("cargo "):
            rtk_commands.append("rtk cargo" + normalized[len("cargo") :])
            continue
        prefix = normalized.split(maxsplit=1)[0]
        if prefix in SUPPORTED_RTK_PREFIXES:
            rtk_commands.append(f"rtk {normalized}")
    return dedupe(rtk_commands)


if __name__ == "__main__":
    raise SystemExit(main())
