#!/usr/bin/env python3
"""
Fetch GitHub PR comments and review threads, then print a stable actionable summary.

Examples:
  python fetch_comments.py --repo .
  python fetch_comments.py --repo . --pr 42
  python fetch_comments.py --repo . --pr https://github.com/org/repo/pull/42 --json
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

QUERY = """\
query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $commentsCursor: String,
  $reviewsCursor: String,
  $threadsCursor: String
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number
      url
      title
      state
      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          createdAt
          updatedAt
          author { login }
        }
      }
      reviews(first: 100, after: $reviewsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          state
          body
          submittedAt
          author { login }
        }
      }
      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          startLine
          startDiffSide
          originalLine
          originalStartLine
          resolvedBy { login }
          comments(first: 100) {
            nodes {
              id
              body
              createdAt
              updatedAt
              author { login }
            }
          }
        }
      }
    }
  }
}
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch PR review comments and summarize actionable items.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    parser.add_argument("--pr", default=None, help="PR number or URL. Defaults to the current branch PR.")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of the summary view.")
    parser.add_argument(
        "--include-resolved",
        action="store_true",
        help="Include resolved review threads in the summary output.",
    )
    return parser.parse_args()


def _run(cmd: list[str], cwd: Path, stdin: str | None = None) -> str:
    process = subprocess.run(cmd, cwd=cwd, input=stdin, capture_output=True, text=True)
    if process.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{process.stderr.strip()}")
    return process.stdout


def _run_json(cmd: list[str], cwd: Path, stdin: str | None = None) -> dict[str, Any]:
    output = _run(cmd, cwd=cwd, stdin=stdin)
    try:
        return json.loads(output)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Failed to parse JSON output: {exc}") from exc


def ensure_gh_authenticated(cwd: Path) -> None:
    try:
        _run(["gh", "auth", "status"], cwd=cwd)
    except RuntimeError as exc:
        raise RuntimeError(
            "gh auth status failed; run `gh auth login` before using this script"
        ) from exc


def resolve_git_root(path: str) -> Path:
    process = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=Path(path),
        capture_output=True,
        text=True,
    )
    if process.returncode != 0:
        raise RuntimeError("Not inside a Git repository.")
    return Path(process.stdout.strip())


def gh_pr_view_json(fields: str, cwd: Path, pr_ref: str | None = None) -> dict[str, Any]:
    cmd = ["gh", "pr", "view"]
    if pr_ref:
        cmd.append(pr_ref)
    cmd.extend(["--json", fields])
    return _run_json(cmd, cwd=cwd)


def resolve_pr_ref(cwd: Path, pr_ref: str | None) -> tuple[str, str, int, dict[str, Any]]:
    fields = "number,title,url,state,headRepositoryOwner,headRepository"
    payload = gh_pr_view_json(fields, cwd=cwd, pr_ref=pr_ref)

    owner = payload.get("headRepositoryOwner", {}).get("login")
    repo = payload.get("headRepository", {}).get("name")
    number = payload.get("number")
    if not owner or not repo or number is None:
        raise RuntimeError("Unable to resolve PR owner/repo/number.")
    return owner, repo, int(number), payload


def gh_api_graphql(
    owner: str,
    repo: str,
    number: int,
    cwd: Path,
    comments_cursor: str | None = None,
    reviews_cursor: str | None = None,
    threads_cursor: str | None = None,
) -> dict[str, Any]:
    cmd = [
        "gh",
        "api",
        "graphql",
        "-F",
        "query=@-",
        "-F",
        f"owner={owner}",
        "-F",
        f"repo={repo}",
        "-F",
        f"number={number}",
    ]
    if comments_cursor:
        cmd += ["-F", f"commentsCursor={comments_cursor}"]
    if reviews_cursor:
        cmd += ["-F", f"reviewsCursor={reviews_cursor}"]
    if threads_cursor:
        cmd += ["-F", f"threadsCursor={threads_cursor}"]
    return _run_json(cmd, cwd=cwd, stdin=QUERY)


def fetch_all(owner: str, repo: str, number: int, cwd: Path, pr_view: dict[str, Any]) -> dict[str, Any]:
    conversation_comments: list[dict[str, Any]] = []
    reviews: list[dict[str, Any]] = []
    review_threads: list[dict[str, Any]] = []

    comments_cursor: str | None = None
    reviews_cursor: str | None = None
    threads_cursor: str | None = None

    while True:
        payload = gh_api_graphql(
            owner=owner,
            repo=repo,
            number=number,
            cwd=cwd,
            comments_cursor=comments_cursor,
            reviews_cursor=reviews_cursor,
            threads_cursor=threads_cursor,
        )
        if payload.get("errors"):
            raise RuntimeError(json.dumps(payload["errors"], indent=2))

        pr = payload["data"]["repository"]["pullRequest"]
        comments = pr["comments"]
        review_nodes = pr["reviews"]
        threads = pr["reviewThreads"]

        conversation_comments.extend(comments.get("nodes") or [])
        reviews.extend(review_nodes.get("nodes") or [])
        review_threads.extend(threads.get("nodes") or [])

        comments_cursor = comments["pageInfo"]["endCursor"] if comments["pageInfo"]["hasNextPage"] else None
        reviews_cursor = review_nodes["pageInfo"]["endCursor"] if review_nodes["pageInfo"]["hasNextPage"] else None
        threads_cursor = threads["pageInfo"]["endCursor"] if threads["pageInfo"]["hasNextPage"] else None

        if not any([comments_cursor, reviews_cursor, threads_cursor]):
            break

    return {
        "pull_request": {
            "number": number,
            "title": pr_view["title"],
            "url": pr_view["url"],
            "state": pr_view["state"],
            "owner": owner,
            "repo": repo,
        },
        "conversation_comments": conversation_comments,
        "reviews": reviews,
        "review_threads": review_threads,
    }


def summarize_actionable_items(payload: dict[str, Any], include_resolved: bool) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for thread in payload.get("review_threads", []):
        if thread.get("isResolved") and not include_resolved:
            continue
        comments = thread.get("comments", {}).get("nodes") or []
        excerpt_source = next((comment.get("body", "") for comment in reversed(comments) if comment.get("body")), "")
        author = next((comment.get("author", {}).get("login") for comment in reversed(comments) if comment.get("author")), None)
        location = format_thread_location(thread)
        items.append(
            {
                "kind": "review-thread",
                "path": thread.get("path"),
                "location": location,
                "author": author or "unknown",
                "resolved": bool(thread.get("isResolved")),
                "outdated": bool(thread.get("isOutdated")),
                "excerpt": excerpt(excerpt_source),
            }
        )

    for review in payload.get("reviews", []):
        state = normalize_state(review.get("state"))
        body = excerpt(review.get("body", ""))
        if state not in {"changes requested", "commented"}:
            continue
        if not body:
            continue
        items.append(
            {
                "kind": "review",
                "state": state,
                "author": review.get("author", {}).get("login") or "unknown",
                "excerpt": body,
            }
        )

    for comment in payload.get("conversation_comments", []):
        body = excerpt(comment.get("body", ""))
        if not body:
            continue
        items.append(
            {
                "kind": "conversation-comment",
                "author": comment.get("author", {}).get("login") or "unknown",
                "excerpt": body,
            }
        )

    return items


def normalize_state(value: str | None) -> str:
    return str(value or "").replace("_", " ").strip().lower()


def excerpt(text: str, limit: int = 160) -> str:
    compact = re.sub(r"\s+", " ", text or "").strip()
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "…"


def format_thread_location(thread: dict[str, Any]) -> str:
    path = thread.get("path") or "<unknown>"
    line = thread.get("line") or thread.get("originalLine") or thread.get("startLine")
    if line:
        return f"{path}:{line}"
    return path


def render_summary(payload: dict[str, Any], actionable_items: list[dict[str, Any]]) -> str:
    pr = payload["pull_request"]
    lines = [
        f"PR #{pr['number']}: {pr['title']}",
        f"URL: {pr['url']}",
        f"Actionable items: {len(actionable_items)}",
        "",
    ]
    if not actionable_items:
        lines.append("No actionable review items found.")
        return "\n".join(lines)

    for index, item in enumerate(actionable_items, start=1):
        if item["kind"] == "review-thread":
            status = "resolved" if item["resolved"] else "unresolved"
            outdated = ", outdated" if item["outdated"] else ""
            lines.append(
                f"{index}. [thread] {item['location']} ({status}{outdated}) by {item['author']}"
            )
        elif item["kind"] == "review":
            lines.append(f"{index}. [review] {item['author']} ({item['state']})")
        else:
            lines.append(f"{index}. [comment] {item['author']}")
        lines.append(f"   {item['excerpt'] or '(no text)'}")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    try:
        repo_root = resolve_git_root(args.repo)
        ensure_gh_authenticated(repo_root)
        owner, repo, number, pr_view = resolve_pr_ref(repo_root, args.pr)
        payload = fetch_all(owner, repo, number, repo_root, pr_view)
        actionable_items = summarize_actionable_items(payload, include_resolved=args.include_resolved)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if args.json:
        payload["actionable_items"] = actionable_items
        print(json.dumps(payload, indent=2))
    else:
        print(render_summary(payload, actionable_items))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
