#!/usr/bin/env python3
"""Prepare and publish PR reviews, then inspect or update review threads."""

from __future__ import annotations

import argparse
import json
import locale
import re
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


Runner = Callable[[list[str], Path, str | None], str]

API_HEADERS = [
    "-H",
    "Accept: application/vnd.github+json",
    "-H",
    "X-GitHub-Api-Version: 2022-11-28",
]

THREADS_QUERY = """\
query($owner: String!, $repo: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              databaseId
              body
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}
"""

THREAD_COMMENTS_QUERY = """\
query($threadId: ID!, $cursor: String) {
  node(id: $threadId) {
    ... on PullRequestReviewThread {
      comments(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          databaseId
          body
          createdAt
          author { login }
        }
      }
    }
  }
}
"""

RESOLVE_THREAD_MUTATION = """\
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}
"""

HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")
PR_URL_RE = re.compile(r"^/([^/]+)/([^/]+)/pull/(\d+)(?:/.*)?$")
EVENTS = {"APPROVE", "REQUEST_CHANGES", "COMMENT"}
SIDES = {"LEFT", "RIGHT"}
COMMENT_FIELDS = {"path", "body", "line", "side", "start_line", "start_side"}


def run_command(cmd: list[str], cwd: Path, stdin: str | None = None) -> str:
    process = subprocess.run(
        cmd,
        cwd=cwd,
        input=stdin,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if process.returncode != 0:
        detail = process.stderr.strip() or process.stdout.strip() or "no diagnostic output"
        raise RuntimeError(f"Command failed ({process.returncode}): {' '.join(cmd)}\n{detail}")
    return process.stdout


def run_json(
    cmd: list[str],
    cwd: Path,
    stdin: str | None = None,
    runner: Runner = run_command,
) -> Any:
    output = runner(cmd, cwd, stdin)
    try:
        return json.loads(output)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Failed to parse JSON output from {' '.join(cmd)}: {exc}") from exc


def resolve_git_root(path: str) -> Path:
    process = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=Path(path),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if process.returncode != 0:
        raise RuntimeError("Not inside a Git repository.")
    return Path(process.stdout.strip())


def ensure_gh_authenticated(cwd: Path, runner: Runner = run_command) -> None:
    try:
        runner(["gh", "auth", "status"], cwd, None)
    except RuntimeError as exc:
        raise RuntimeError("gh auth status failed; run `gh auth login` before using this script") from exc


def parse_pr_url(url: str) -> tuple[str, str, int]:
    parsed = urlparse(url)
    if parsed.netloc.lower() != "github.com":
        raise RuntimeError(f"Unsupported pull request URL: {url}")
    match = PR_URL_RE.match(parsed.path)
    if not match:
        raise RuntimeError(f"Unable to parse pull request URL: {url}")
    return match.group(1), match.group(2), int(match.group(3))


def resolve_pr_context(
    cwd: Path,
    pr_ref: str | None,
    runner: Runner = run_command,
) -> dict[str, Any]:
    fields = "number,url,title,state,headRefOid,headRefName,baseRefName,isDraft"
    cmd = ["gh", "pr", "view"]
    if pr_ref:
        cmd.append(pr_ref)
    cmd.extend(["--json", fields])
    payload = run_json(cmd, cwd, runner=runner)
    if not isinstance(payload, dict):
        raise RuntimeError("gh pr view returned a non-object payload")
    owner, repo, number = parse_pr_url(str(payload.get("url") or ""))
    if payload.get("number") is not None and int(payload["number"]) != number:
        raise RuntimeError("PR number does not match the resolved PR URL")
    head_sha = payload.get("headRefOid")
    if not isinstance(head_sha, str) or not head_sha:
        raise RuntimeError("Unable to resolve the pull request head SHA")
    return {
        "owner": owner,
        "repo": repo,
        "number": number,
        "url": payload["url"],
        "title": payload.get("title") or "",
        "state": payload.get("state") or "",
        "head_sha": head_sha,
        "head_ref": payload.get("headRefName") or "",
        "base_ref": payload.get("baseRefName") or "",
        "is_draft": bool(payload.get("isDraft")),
    }


def read_text_input(path: str) -> str:
    if path != "-":
        try:
            return Path(path).read_text(encoding="utf-8-sig")
        except (OSError, UnicodeError) as exc:
            raise RuntimeError(f"Unable to read UTF-8 input file {path}: {exc}") from exc

    raw = sys.stdin.buffer.read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        encoding = sys.stdin.encoding or locale.getpreferredencoding(False)
        return raw.decode(encoding, errors="replace")


def read_json_input(path: str) -> dict[str, Any]:
    text = read_text_input(path)
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise RuntimeError(f"JSON input must be an object: {path}")
    return payload


def write_json_file(path: str, payload: dict[str, Any]) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    try:
        with target.open("w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
    except OSError as exc:
        raise RuntimeError(f"Unable to write prepared review {path}: {exc}") from exc


def flatten_file_pages(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, list):
        raise RuntimeError("PR files API returned a non-array payload")
    if not payload:
        return []
    pages = payload if all(isinstance(page, list) for page in payload) else [payload]
    files: list[dict[str, Any]] = []
    for page in pages:
        if not isinstance(page, list) or not all(isinstance(item, dict) for item in page):
            raise RuntimeError("PR files API returned an invalid paginated payload")
        files.extend(page)
    return files


def fetch_pr_files(
    context: dict[str, Any],
    cwd: Path,
    runner: Runner = run_command,
) -> list[dict[str, Any]]:
    endpoint = (
        f"repos/{context['owner']}/{context['repo']}/pulls/{context['number']}/files?per_page=100"
    )
    payload = run_json(
        ["gh", "api", *API_HEADERS, "--paginate", "--slurp", endpoint],
        cwd,
        runner=runner,
    )
    return flatten_file_pages(payload)


def parse_patch(patch: str) -> set[tuple[str, int]]:
    coordinates: set[tuple[str, int]] = set()
    old_line: int | None = None
    new_line: int | None = None
    for raw_line in patch.splitlines():
        match = HUNK_RE.match(raw_line)
        if match:
            old_line = int(match.group(1))
            new_line = int(match.group(3))
            continue
        if old_line is None or new_line is None or not raw_line:
            continue
        prefix = raw_line[0]
        if prefix == "\\":
            continue
        if prefix == " ":
            coordinates.add(("LEFT", old_line))
            coordinates.add(("RIGHT", new_line))
            old_line += 1
            new_line += 1
        elif prefix == "-":
            coordinates.add(("LEFT", old_line))
            old_line += 1
        elif prefix == "+":
            coordinates.add(("RIGHT", new_line))
            new_line += 1
    return coordinates


def build_diff_index(files: list[dict[str, Any]]) -> dict[str, set[tuple[str, int]] | None]:
    index: dict[str, set[tuple[str, int]] | None] = {}
    for file_payload in files:
        filename = file_payload.get("filename")
        if not isinstance(filename, str) or not filename:
            raise RuntimeError("PR files API returned a file without a filename")
        patch = file_payload.get("patch")
        index[filename] = parse_patch(patch) if isinstance(patch, str) and patch else None
    return index


def require_positive_int(value: Any, field: str, index: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise RuntimeError(f"comments[{index}].{field} must be a positive integer")
    return value


def normalize_comment(
    comment: Any,
    index: int,
    diff_index: dict[str, set[tuple[str, int]] | None],
) -> dict[str, Any]:
    if not isinstance(comment, dict):
        raise RuntimeError(f"comments[{index}] must be an object")
    unknown = sorted(set(comment) - COMMENT_FIELDS)
    if unknown:
        raise RuntimeError(f"comments[{index}] has unsupported fields: {', '.join(unknown)}")

    path = comment.get("path")
    body = comment.get("body")
    side = str(comment.get("side") or "").upper()
    line = require_positive_int(comment.get("line"), "line", index)
    if not isinstance(path, str) or not path:
        raise RuntimeError(f"comments[{index}].path must be a non-empty string")
    if not isinstance(body, str) or not body.strip():
        raise RuntimeError(f"comments[{index}].body must be a non-empty string")
    if side not in SIDES:
        raise RuntimeError(f"comments[{index}].side must be LEFT or RIGHT")
    if path not in diff_index:
        raise RuntimeError(f"comments[{index}] path is not in the pull request: {path}")
    coordinates = diff_index[path]
    if coordinates is None:
        raise RuntimeError(f"comments[{index}] cannot be validated because patch data is unavailable: {path}")

    start_line_raw = comment.get("start_line")
    start_side_raw = comment.get("start_side")
    start_line: int | None = None
    start_side: str | None = None
    if start_line_raw is not None:
        start_line = require_positive_int(start_line_raw, "start_line", index)
        start_side = str(start_side_raw or side).upper()
        if start_side not in SIDES:
            raise RuntimeError(f"comments[{index}].start_side must be LEFT or RIGHT")
        if start_side != side:
            raise RuntimeError(f"comments[{index}] ranges must stay on one diff side")
        if start_line >= line:
            raise RuntimeError(f"comments[{index}].start_line must be less than line")
    elif start_side_raw is not None:
        raise RuntimeError(f"comments[{index}].start_side requires start_line")

    first_line = start_line if start_line is not None else line
    missing = [number for number in range(first_line, line + 1) if (side, number) not in coordinates]
    if missing:
        shown = ", ".join(str(number) for number in missing[:5])
        suffix = "..." if len(missing) > 5 else ""
        raise RuntimeError(
            f"comments[{index}] contains lines not present on the {side} diff for {path}: {shown}{suffix}"
        )

    normalized: dict[str, Any] = {"path": path, "line": line, "side": side, "body": body}
    if start_line is not None and start_side is not None:
        normalized["start_line"] = start_line
        normalized["start_side"] = start_side
    return normalized


def prepare_review_payload(
    draft: dict[str, Any],
    context: dict[str, Any],
    files: list[dict[str, Any]],
) -> dict[str, Any]:
    unknown = sorted(set(draft) - {"event", "body", "comments"})
    if unknown:
        raise RuntimeError(f"Review draft has unsupported fields: {', '.join(unknown)}")
    event = str(draft.get("event") or "").upper().replace("-", "_")
    body = draft.get("body")
    comments = draft.get("comments", [])
    if event not in EVENTS:
        raise RuntimeError("event must be APPROVE, REQUEST_CHANGES, or COMMENT")
    if not isinstance(body, str) or not body.strip():
        raise RuntimeError("body must be a non-empty review summary")
    if not isinstance(comments, list):
        raise RuntimeError("comments must be an array")

    diff_index = build_diff_index(files)
    normalized_comments = [
        normalize_comment(comment, index, diff_index) for index, comment in enumerate(comments)
    ]
    api_payload: dict[str, Any] = {
        "commit_id": context["head_sha"],
        "body": body,
        "event": event,
    }
    if normalized_comments:
        api_payload["comments"] = normalized_comments
    return {
        "schema_version": 1,
        "target": {
            "owner": context["owner"],
            "repo": context["repo"],
            "number": context["number"],
            "url": context["url"],
            "head_sha": context["head_sha"],
        },
        "payload": api_payload,
    }


def validate_prepared_review(prepared: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    if prepared.get("schema_version") != 1:
        raise RuntimeError("Unsupported prepared review schema_version")
    target = prepared.get("target")
    payload = prepared.get("payload")
    if not isinstance(target, dict) or not isinstance(payload, dict):
        raise RuntimeError("Prepared review must contain target and payload objects")
    for field in ("owner", "repo", "url", "head_sha"):
        if not isinstance(target.get(field), str) or not target[field]:
            raise RuntimeError(f"Prepared review target.{field} is missing")
    if isinstance(target.get("number"), bool) or not isinstance(target.get("number"), int):
        raise RuntimeError("Prepared review target.number must be an integer")
    if payload.get("commit_id") != target.get("head_sha"):
        raise RuntimeError("Prepared review commit_id does not match target.head_sha")
    if payload.get("event") not in EVENTS:
        raise RuntimeError("Prepared review event is invalid")
    if not isinstance(payload.get("body"), str) or not payload["body"].strip():
        raise RuntimeError("Prepared review body is missing")
    if set(payload) - {"commit_id", "body", "event", "comments"}:
        raise RuntimeError("Prepared review payload contains unsupported fields")
    comments = payload.get("comments", [])
    if not isinstance(comments, list):
        raise RuntimeError("Prepared review comments must be an array")
    for index, comment in enumerate(comments):
        if not isinstance(comment, dict):
            raise RuntimeError(f"Prepared review comments[{index}] must be an object")
        unknown = sorted(set(comment) - COMMENT_FIELDS)
        if unknown:
            raise RuntimeError(
                f"Prepared review comments[{index}] has unsupported fields: {', '.join(unknown)}"
            )
        path = comment.get("path")
        body = comment.get("body")
        side = comment.get("side")
        line = require_positive_int(comment.get("line"), "line", index)
        if not isinstance(path, str) or not path:
            raise RuntimeError(f"Prepared review comments[{index}].path is missing")
        if not isinstance(body, str) or not body.strip():
            raise RuntimeError(f"Prepared review comments[{index}].body is missing")
        if side not in SIDES:
            raise RuntimeError(f"Prepared review comments[{index}].side is invalid")
        start_line = comment.get("start_line")
        start_side = comment.get("start_side")
        if start_line is not None:
            normalized_start = require_positive_int(start_line, "start_line", index)
            if normalized_start >= line:
                raise RuntimeError(
                    f"Prepared review comments[{index}].start_line must be less than line"
                )
            if start_side != side:
                raise RuntimeError(
                    f"Prepared review comments[{index}] range must stay on one diff side"
                )
        elif start_side is not None:
            raise RuntimeError(
                f"Prepared review comments[{index}].start_side requires start_line"
            )
    return target, payload


def submit_prepared_review(
    prepared: dict[str, Any],
    cwd: Path,
    runner: Runner = run_command,
) -> dict[str, Any]:
    target, payload = validate_prepared_review(prepared)
    current = resolve_pr_context(cwd, str(target["url"]), runner=runner)
    identity = (current["owner"], current["repo"], current["number"])
    expected = (target["owner"], target["repo"], target["number"])
    if identity != expected:
        raise RuntimeError("Prepared review target no longer matches the resolved pull request")
    if current["head_sha"] != target["head_sha"]:
        raise RuntimeError(
            "Pull request head changed after preparation; regenerate and review the prepared payload"
        )
    endpoint = f"repos/{target['owner']}/{target['repo']}/pulls/{target['number']}/reviews"
    response = run_json(
        ["gh", "api", *API_HEADERS, "--method", "POST", endpoint, "--input", "-"],
        cwd,
        stdin=json.dumps(payload, ensure_ascii=False),
        runner=runner,
    )
    if not isinstance(response, dict):
        raise RuntimeError("Create-review API returned a non-object response")
    return response


def graphql(
    query: str,
    variables: dict[str, str | int],
    cwd: Path,
    runner: Runner = run_command,
) -> dict[str, Any]:
    cmd = ["gh", "api", "graphql", "-F", "query=@-"]
    for key, value in variables.items():
        cmd.extend(["-F", f"{key}={value}"])
    payload = run_json(cmd, cwd, stdin=query, runner=runner)
    if not isinstance(payload, dict):
        raise RuntimeError("GraphQL API returned a non-object payload")
    if payload.get("errors"):
        raise RuntimeError(f"GraphQL request failed: {json.dumps(payload['errors'], ensure_ascii=False)}")
    return payload


def connection_cursor(connection: dict[str, Any], label: str) -> str | None:
    page_info = connection.get("pageInfo")
    if not isinstance(page_info, dict):
        raise RuntimeError(f"GraphQL {label} connection is missing pageInfo")
    if not page_info.get("hasNextPage"):
        return None
    cursor = page_info.get("endCursor")
    if not isinstance(cursor, str) or not cursor:
        raise RuntimeError(f"GraphQL {label} connection has no endCursor")
    return cursor


def fetch_remaining_thread_comments(
    thread_id: str,
    cursor: str,
    cwd: Path,
    runner: Runner,
) -> list[dict[str, Any]]:
    comments: list[dict[str, Any]] = []
    next_cursor: str | None = cursor
    while next_cursor:
        payload = graphql(
            THREAD_COMMENTS_QUERY,
            {"threadId": thread_id, "cursor": next_cursor},
            cwd,
            runner,
        )
        node = payload.get("data", {}).get("node")
        if not isinstance(node, dict) or not isinstance(node.get("comments"), dict):
            raise RuntimeError(f"Unable to paginate comments for thread {thread_id}")
        connection = node["comments"]
        nodes = connection.get("nodes") or []
        if not isinstance(nodes, list) or not all(isinstance(item, dict) for item in nodes):
            raise RuntimeError(f"Thread {thread_id} returned invalid comments")
        comments.extend(nodes)
        next_cursor = connection_cursor(connection, f"thread {thread_id} comments")
    return comments


def fetch_threads(
    context: dict[str, Any],
    cwd: Path,
    runner: Runner = run_command,
) -> list[dict[str, Any]]:
    threads: list[dict[str, Any]] = []
    cursor: str | None = None
    while True:
        variables: dict[str, str | int] = {
            "owner": context["owner"],
            "repo": context["repo"],
            "number": context["number"],
        }
        if cursor:
            variables["cursor"] = cursor
        payload = graphql(THREADS_QUERY, variables, cwd, runner)
        connection = (
            payload.get("data", {})
            .get("repository", {})
            .get("pullRequest", {})
            .get("reviewThreads")
        )
        if not isinstance(connection, dict):
            raise RuntimeError("Unable to read pull request review threads")
        nodes = connection.get("nodes") or []
        if not isinstance(nodes, list) or not all(isinstance(item, dict) for item in nodes):
            raise RuntimeError("Review thread connection returned invalid nodes")
        for raw_thread in nodes:
            thread = dict(raw_thread)
            comments_connection = thread.get("comments")
            if not isinstance(comments_connection, dict):
                raise RuntimeError(f"Thread {thread.get('id', '<unknown>')} has no comments connection")
            comments = comments_connection.get("nodes") or []
            if not isinstance(comments, list) or not all(isinstance(item, dict) for item in comments):
                raise RuntimeError(f"Thread {thread.get('id', '<unknown>')} returned invalid comments")
            comment_cursor = connection_cursor(
                comments_connection,
                f"thread {thread.get('id', '<unknown>')} comments",
            )
            if comment_cursor:
                thread_id = thread.get("id")
                if not isinstance(thread_id, str) or not thread_id:
                    raise RuntimeError("Cannot paginate a thread without an id")
                comments = comments + fetch_remaining_thread_comments(
                    thread_id,
                    comment_cursor,
                    cwd,
                    runner,
                )
            thread["comments"] = comments
            threads.append(thread)
        cursor = connection_cursor(connection, "reviewThreads")
        if not cursor:
            break
    return threads


def thread_comment_id(thread: dict[str, Any], *, last: bool) -> int:
    comments = thread.get("comments") or []
    if not isinstance(comments, list) or not comments:
        raise RuntimeError(f"Thread {thread.get('id', '<unknown>')} has no review comments")
    comment = comments[-1] if last else comments[0]
    database_id = comment.get("databaseId") if isinstance(comment, dict) else None
    if isinstance(database_id, bool) or not isinstance(database_id, int):
        raise RuntimeError(f"Thread {thread.get('id', '<unknown>')} has no REST comment id")
    return database_id


def find_thread(threads: list[dict[str, Any]], thread_id: str) -> dict[str, Any]:
    for thread in threads:
        if thread.get("id") == thread_id:
            return thread
    raise RuntimeError(f"Review thread not found: {thread_id}")


def summarize_threads(threads: list[dict[str, Any]], include_resolved: bool) -> list[dict[str, Any]]:
    summaries: list[dict[str, Any]] = []
    for thread in threads:
        if thread.get("isResolved") and not include_resolved:
            continue
        comments = thread.get("comments") or []
        last_comment = comments[-1] if comments else {}
        summaries.append(
            {
                "thread_id": thread.get("id"),
                "root_comment_id": thread_comment_id(thread, last=False),
                "last_comment_id": thread_comment_id(thread, last=True),
                "path": thread.get("path"),
                "line": thread.get("line"),
                "side": thread.get("diffSide"),
                "resolved": bool(thread.get("isResolved")),
                "outdated": bool(thread.get("isOutdated")),
                "last_author": (last_comment.get("author") or {}).get("login"),
                "last_body": last_comment.get("body") or "",
            }
        )
    return summaries


def render_thread_summary(context: dict[str, Any], summaries: list[dict[str, Any]]) -> str:
    lines = [
        f"PR #{context['number']}: {context['title']}",
        f"URL: {context['url']}",
        f"Threads: {len(summaries)}",
        "",
    ]
    if not summaries:
        lines.append("No matching review threads found.")
        return "\n".join(lines)
    for index, item in enumerate(summaries, start=1):
        state = "resolved" if item["resolved"] else "unresolved"
        outdated = ", outdated" if item["outdated"] else ""
        location = item["path"] or "<unknown>"
        if item["line"]:
            location += f":{item['line']}"
        lines.append(f"{index}. {location} ({state}{outdated})")
        lines.append(
            f"   thread={item['thread_id']} root={item['root_comment_id']} last={item['last_comment_id']}"
        )
        if item["last_author"]:
            lines.append(f"   last by {item['last_author']}: {item['last_body'].strip()}")
    return "\n".join(lines)


def post_thread_reply(
    context: dict[str, Any],
    thread: dict[str, Any],
    body: str,
    cwd: Path,
    runner: Runner = run_command,
) -> dict[str, Any]:
    if not body.strip():
        raise RuntimeError("Reply body must not be empty")
    root_id = thread_comment_id(thread, last=False)
    endpoint = (
        f"repos/{context['owner']}/{context['repo']}/pulls/{context['number']}"
        f"/comments/{root_id}/replies"
    )
    response = run_json(
        ["gh", "api", *API_HEADERS, "--method", "POST", endpoint, "--input", "-"],
        cwd,
        stdin=json.dumps({"body": body}, ensure_ascii=False),
        runner=runner,
    )
    if not isinstance(response, dict):
        raise RuntimeError("Review reply API returned a non-object response")
    return response


def resolve_thread(
    thread: dict[str, Any],
    cwd: Path,
    runner: Runner = run_command,
) -> dict[str, Any]:
    thread_id = thread.get("id")
    if not isinstance(thread_id, str) or not thread_id:
        raise RuntimeError("Review thread has no GraphQL id")
    if thread.get("isResolved"):
        return {"id": thread_id, "isResolved": True, "alreadyResolved": True}
    payload = graphql(RESOLVE_THREAD_MUTATION, {"threadId": thread_id}, cwd, runner)
    result = payload.get("data", {}).get("resolveReviewThread", {}).get("thread")
    if not isinstance(result, dict) or result.get("isResolved") is not True:
        raise RuntimeError(f"GitHub did not confirm thread resolution: {thread_id}")
    return result


def add_target_args(parser: argparse.ArgumentParser, *, require_pr: bool = False) -> None:
    parser.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    parser.add_argument(
        "--pr",
        required=require_pr,
        default=None,
        help="PR number or URL. Defaults to the current branch PR.",
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    prepare = subparsers.add_parser("prepare-review", help="Validate and prepare a review payload.")
    add_target_args(prepare)
    prepare.add_argument("--input", required=True, help="UTF-8 JSON review draft, or - for stdin.")
    prepare.add_argument("--output", required=True, help="Prepared UTF-8 JSON output path.")

    submit = subparsers.add_parser("submit-review", help="Submit an approved prepared review.")
    submit.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    submit.add_argument("--prepared", required=True, help="Prepared review JSON path.")

    list_threads = subparsers.add_parser("list-threads", help="List review threads with stable ids.")
    add_target_args(list_threads)
    list_threads.add_argument("--include-resolved", action="store_true")
    list_threads.add_argument("--json", action="store_true", help="Emit JSON.")

    reply = subparsers.add_parser("reply", help="Reply to a review thread.")
    add_target_args(reply)
    reply.add_argument("--thread-id", required=True, help="GraphQL review thread id.")
    reply.add_argument("--body-file", required=True, help="UTF-8 reply body file, or - for stdin.")

    resolve = subparsers.add_parser("resolve", help="Resolve a review thread.")
    add_target_args(resolve)
    resolve.add_argument("--thread-id", required=True, help="GraphQL review thread id.")

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        cwd = resolve_git_root(args.repo)
        ensure_gh_authenticated(cwd)

        if args.command == "prepare-review":
            context = resolve_pr_context(cwd, args.pr)
            draft = read_json_input(args.input)
            files = fetch_pr_files(context, cwd)
            prepared = prepare_review_payload(draft, context, files)
            write_json_file(args.output, prepared)
            print(
                f"Prepared {len(prepared['payload'].get('comments', []))} inline comments "
                f"for {context['url']} at {context['head_sha']} -> {args.output}"
            )
            return 0

        if args.command == "submit-review":
            prepared = read_json_input(args.prepared)
            response = submit_prepared_review(prepared, cwd)
            print(json.dumps(response, ensure_ascii=False, indent=2))
            return 0

        context = resolve_pr_context(cwd, args.pr)
        threads = fetch_threads(context, cwd)

        if args.command == "list-threads":
            summaries = summarize_threads(threads, args.include_resolved)
            if args.json:
                print(
                    json.dumps(
                        {"pull_request": context, "threads": summaries},
                        ensure_ascii=False,
                        indent=2,
                    )
                )
            else:
                print(render_thread_summary(context, summaries))
            return 0

        thread = find_thread(threads, args.thread_id)
        if args.command == "reply":
            body = read_text_input(args.body_file)
            response = post_thread_reply(context, thread, body, cwd)
        else:
            response = resolve_thread(thread, cwd)
        print(json.dumps(response, ensure_ascii=False, indent=2))
        return 0
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
