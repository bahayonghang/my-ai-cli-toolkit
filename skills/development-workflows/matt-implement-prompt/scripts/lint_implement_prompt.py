#!/usr/bin/env python3
"""Deterministic linter for fresh-session Matt implementation prompts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

PLACEHOLDER_BRACES_RE = re.compile(r"\{\{[^{}\n]+\}\}")
PLACEHOLDER_KEYWORD_RE = re.compile(r"\b(?:TODO|TBD|FIXME)\b")
ANGLE_PLACEHOLDER_RE = re.compile(
    r"<(?:spec[-_ ]?num|ticket[-_ ]?(?:list|num)|owner|repo|base[-_ ]?branch|integration[-_ ]?branch|"
    r"work[-_ ]?branch|wt[-_ ]?path|worktree[-_ ]?path|pr[-_ ]?num|main[-_ ]?or[-_ ]?master|"
    r"issue[-_ ]?(?:num|number)|placeholder|feature|branch|path|cmd|command|repo[-_ ]?root)[^>]*>",
    re.IGNORECASE,
)
BACK_REF_PATTERNS = (
    re.compile(r"见上一条消息"),
    re.compile(r"见上方(?:报告|消息|内容|清单)?"),
    re.compile(r"如前所述"),
    re.compile(r"见上面的"),
    re.compile(r"\bsee above\b", re.IGNORECASE),
    re.compile(r"\bsee the previous message\b", re.IGNORECASE),
    re.compile(r"\bsee the report above\b", re.IGNORECASE),
)
PRIVATE_PATH_PATTERNS = (
    re.compile(r"[A-Za-z]:\\Users\\[^\\\s`\"']+"),
    re.compile(r"[A-Za-z]:/Users/[^/\s`\"']+"),
    re.compile(r"/Users/[A-Za-z0-9._-]+/"),
    re.compile(r"/home/[A-Za-z0-9._-]+/"),
)

GITHUB_ISSUE_REF_RE = re.compile(r"#\d+")
GITHUB_FETCH_RE = re.compile(r"\bgh\s+(?:issue\s+view|api)\b", re.IGNORECASE)
LOCAL_SCRATCH_RE = re.compile(r"\.scratch[/\\][^\s`\"']+", re.IGNORECASE)
FRONTIER_RE = re.compile(r"波前|frontier|blocked_by|阻塞|依赖图|task-graph|task graph", re.IGNORECASE)
TEST_CI_RE = re.compile(r"\btdd\b|\bci\b|just\s+ci|pytest|unittest|npm\s+test|测试|校验|验证", re.IGNORECASE)
REVIEW_RE = re.compile(r"code-review|代码评审|代码审查|双轴评审|评审", re.IGNORECASE)
PUSH_RE = re.compile(r"git\s+push", re.IGNORECASE)
PUSH_BOUNDARY_RE = re.compile(
    r"禁止|不要|严禁|do not|never|授权[^\n。]{0,20}(?:推送|push)|authorized[^\n.]{0,24}push|allow.*push",
    re.IGNORECASE,
)
GH_COMMENT_RE = re.compile(r"\bgh\s+issue\s+comment\b", re.IGNORECASE)
GH_CLOSE_RE = re.compile(r"\bgh\s+issue\s+close\b", re.IGNORECASE)
AUTH_CLOSE_RE = re.compile(r"授权|authorized|允许关闭", re.IGNORECASE)
GH_PR_CREATE_RE = re.compile(r"\bgh\s+pr\s+create\b", re.IGNORECASE)
CLOSES_ISSUE_RE = re.compile(r"\bcloses\s+#\d+", re.IGNORECASE)

WORKSPACE_ISOLATION_RE = re.compile(
    r"新建[^\n。]{0,16}(?:分支|worktree)|创建[^\n。]{0,16}(?:分支|worktree)|"
    r"使用[^\n。]{0,12}worktree|选用[^\n。]{0,12}worktree|独立[^\n。]{0,10}worktree|"
    r"git\s+switch\s+-c|git\s+checkout\s+-b|git\s+worktree\s+add|"
    r"集成分支|工作分支|integration\s+branch|new\s+branch|feature\s+branch|working\s+branch|"
    r"isolated\s+worktree|new\s+worktree|create\s+(?:a\s+)?worktree",
    re.IGNORECASE,
)
SPLIT_COMMIT_RE = re.compile(
    r"拆分(?:原子)?提交|原子提交|按票[^\n。]{0,8}提交|按切片[^\n。]{0,8}提交|分批提交|逐票[^\n。]{0,8}提交|"
    r"split\s+(?:atomic\s+)?commits?|atomic\s+commits?|per-(?:ticket|slice)\s+commits?|logical\s+commits?|git-commit",
    re.IGNORECASE,
)
CLEAN_TREE_RE = re.compile(
    r"git\s+status\s+--short|工作区[^\n。]{0,8}(?:干净|清零)|工作树[^\n。]{0,8}(?:干净|清零)|"
    r"清零检查|清零门禁|无未提交|零未提交|未提交[^\n。]{0,12}(?:清零|为空|提交)|"
    r"clean\s+working\s+tree|clean\s+worktree|no\s+uncommitted",
    re.IGNORECASE,
)
COMMIT_LINK_RE = re.compile(
    r"提交\s*SHA|commit\s+SHA|commit\s+hash|"
    r"关联[^\n。]{0,12}(?:提交|SHA)|引用[^\n。]{0,12}(?:提交\s*SHA|commit\s*SHA|提交记录)|"
    r"记录[^\n。]{0,12}(?:提交\s*SHA|commit\s*SHA)|写入[^\n。]{0,12}(?:提交\s*SHA|commit\s*SHA)",
    re.IGNORECASE,
)

DEV_MERGE_RE = re.compile(
    r"git\s+merge|合并(?:回|到)\s*(?:本地\s*)?`?dev`?|merge\s+(?:back\s+)?into\s+(?:local\s+)?`?dev`?",
    re.IGNORECASE,
)
CLEANUP_RE = re.compile(
    r"git\s+worktree\s+(?:remove|prune)|git\s+branch\s+-[dD]|--delete-branch|"
    r"清理[^\n。]{0,20}(?:分支|worktree)|删除[^\n。]{0,16}(?:临时|工作|集成|已合并)?分支|"
    r"clean\s*up[^\n.]{0,24}(?:branch|worktree)",
    re.IGNORECASE,
)

DIRECT_PUSH_GUARD_RE = re.compile(
    r"(?:禁止|严禁|不要|do\s+not|never)[^\n。;；]{0,36}(?:"
    r"直推\s*`?(?:main|master|主干)`?|"
    r"直接[^\n。;；]{0,16}(?:git\s+push|push|推送|提交)[^\n。;；]{0,20}(?:main|master|主干)|"
    r"直接[^\n。;；]{0,12}(?:向|往|对|到)\s*`?(?:main|master|主干)`?[^\n。;；]{0,12}(?:git\s+push|push|推送|提交)|"
    r"(?:push|commit)\s+directly\s+to\s+`?(?:main|master)`?)",
    re.IGNORECASE,
)
PR_CREATE_RE = re.compile(
    r"\bgh\s+pr\s+create\b|创建\s*PR|发起\s*PR|open\s+a?\s*PR|create\s+(?:a\s+)?PR",
    re.IGNORECASE,
)
PR_MERGE_RE = re.compile(
    r"\bgh\s+pr\s+merge\b|合并\s*PR|merge\s+(?:the\s+)?PR",
    re.IGNORECASE,
)
SYNC_CMD_RE = re.compile(r"\bgit\s+fetch\b|\bgit\s+pull\b", re.IGNORECASE)
SYNC_WORD_RE = re.compile(r"同步|\bsync\b|origin/(?:main|master)|最新状态|up[- ]to[- ]date", re.IGNORECASE)

CONTRADICT_DEV_MERGE_RE = re.compile(
    r"(?:禁止|严禁|不要|do\s+not|never)[^\n。;；，,]{0,40}(?:擅自|自动)?(?:合并(?:回|到)\s*`?dev`?|merge\s+(?:back\s+)?into\s+(?:local\s+)?`?dev`?)",
    re.IGNORECASE,
)
CONTRADICT_MAIN_PR_RE = re.compile(
    r"(?:禁止|严禁|不要|do\s+not|never)[^\n。;；，,]{0,40}(?:自动)?(?:开|创建|发起)\s*(?:远端\s*)?PR|"
    r"(?:do\s+not|never)[^\n.;]{0,36}(?:open|create)\s+a?\s*PR",
    re.IGNORECASE,
)


def read_prompt_text(input_path: str) -> str:
    if input_path == "-":
        raw = sys.stdin.buffer.read()
        return raw.decode("utf-8-sig")
    path = Path(input_path)
    return path.read_text(encoding="utf-8-sig")


def strip_inline_code(text: str) -> str:
    return re.sub(r"`[^`\n]+`", "", text)


def resolve_delivery_mode(base_branch: str | None, delivery_mode: str = "auto") -> str:
    if delivery_mode != "auto":
        return delivery_mode
    normalized = (base_branch or "").strip().lower()
    if normalized.startswith("origin/"):
        normalized = normalized[len("origin/"):]
    if normalized == "dev":
        return "dev-merge"
    if normalized in {"main", "master"}:
        return "main-pr"
    return "branch-only"


def resolve_close_mode(tracker: str, close_mode: str | None, delivery_mode: str) -> str:
    if close_mode is not None:
        return close_mode
    if tracker == "local":
        return "no-close"
    if delivery_mode == "main-pr":
        return "pr-close"
    return "remote-close"


def lint_prompt(
    text: str,
    *,
    tracker: str = "github",
    close_mode: str = "remote-close",
    base_branch: str | None = None,
    delivery_mode: str = "auto",
) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []
    normalized = text.strip()
    resolved_delivery = resolve_delivery_mode(base_branch, delivery_mode)

    def add_error(code: str, message: str) -> None:
        errors.append({"code": code, "message": message})

    def add_warning(code: str, message: str) -> None:
        warnings.append({"code": code, "message": message})

    if len(normalized) < 120:
        add_error("empty_input", "Prompt is empty or too short (< 120 chars) to be self-contained.")
        return {
            "ok": False,
            "tracker": tracker,
            "close_mode": close_mode,
            "base_branch": base_branch,
            "delivery_mode": resolved_delivery,
            "error_count": len(errors),
            "errors": errors,
            "warnings": warnings,
        }

    # 1. Unresolved placeholders
    brace_matches = PLACEHOLDER_BRACES_RE.findall(normalized)
    if brace_matches:
        add_error("unresolved_placeholder", f"Found unresolved template braces: {', '.join(sorted(set(brace_matches)))}")
    keyword_matches = PLACEHOLDER_KEYWORD_RE.findall(normalized)
    if keyword_matches:
        add_error("unresolved_placeholder", f"Found placeholder marker(s): {', '.join(sorted(set(keyword_matches)))}")
    angle_matches = ANGLE_PLACEHOLDER_RE.findall(strip_inline_code(normalized))
    if angle_matches:
        add_error("unresolved_placeholder", f"Found unresolved angle placeholder(s): {', '.join(sorted(set(angle_matches)))}")

    # 2. Conversational back-references
    for pattern in BACK_REF_PATTERNS:
        if pattern.search(normalized):
            add_error("back_reference", f"Found fragile conversational back-reference matching `{pattern.pattern}`.")
            break

    # 3. Private OS user paths
    for pattern in PRIVATE_PATH_PATTERNS:
        match = pattern.search(normalized)
        if match:
            add_error("private_path_leak", f"Found machine-local user path `{match.group(0)}`; replace with repo-relative path or env var.")
            break

    # 4. Source-of-truth pointers
    if tracker == "github":
        if not GITHUB_ISSUE_REF_RE.search(normalized) or not GITHUB_FETCH_RE.search(normalized):
            add_error(
                "missing_source_pointer",
                "GitHub tracker prompts must cite concrete `#<number>` issue refs and live fetch commands (`gh issue view` / `gh api`).",
            )
    elif tracker == "local":
        if not LOCAL_SCRATCH_RE.search(normalized):
            add_error(
                "missing_source_pointer",
                "Local tracker prompts must point to concrete `.scratch/<feature>/...` ticket paths.",
            )

    # 5. Dependency frontier / task graph
    if not FRONTIER_RE.search(normalized):
        add_error("missing_frontier", "Prompt must explain the dependency frontier / blocking order (`波前`, `frontier`, or `blocked_by`).")

    # 6. Branch or worktree isolation
    if not WORKSPACE_ISOLATION_RE.search(normalized):
        add_error(
            "missing_workspace_isolation",
            "Prompt must explicitly choose and instruct creating a new branch or worktree based on the base branch.",
        )

    # 7. Verification & code-review gates
    if not TEST_CI_RE.search(normalized) or not REVIEW_RE.search(normalized):
        add_error(
            "missing_verification_gate",
            "Prompt must require both test/TDD/CI verification and `/code-review` (or code review) before completion.",
        )

    # 8. Split atomic commits & clean working tree gate
    if not SPLIT_COMMIT_RE.search(normalized) or not CLEAN_TREE_RE.search(normalized):
        add_error(
            "missing_split_commit_gate",
            "Prompt must require split/atomic commits AND a clean working tree check (`git status --short`) before closing, merging, or creating a PR.",
        )

    # 9. Commit SHA linked to issues/tickets before closing
    if not COMMIT_LINK_RE.search(normalized):
        add_error(
            "missing_commit_issue_link",
            "Prompt must require linking/recording concrete commit SHA(s) in issues or ticket files before closing.",
        )

    # 10. Base-branch-aware delivery & contradictory policy gates
    if resolved_delivery == "dev-merge":
        if CONTRADICT_DEV_MERGE_RE.search(normalized):
            add_error(
                "contradictory_delivery_policy",
                "Prompt under `dev-merge` contains a prohibition against merging back into `dev`.",
            )
        if not DEV_MERGE_RE.search(normalized) or not CLEANUP_RE.search(normalized):
            add_error(
                "missing_dev_merge_cleanup",
                "Prompts targeting `dev` (`dev-merge`) must require merging back into `dev` and cleaning up temporary branches/worktrees.",
            )
        if not PUSH_RE.search(normalized) or not PUSH_BOUNDARY_RE.search(normalized):
            add_error(
                "missing_commit_boundary",
                "Prompt must explicitly state the `git push` boundary (forbidden by default or explicitly authorized).",
            )
    elif resolved_delivery == "main-pr":
        if CONTRADICT_MAIN_PR_RE.search(normalized):
            add_error(
                "contradictory_delivery_policy",
                "Prompt under `main-pr` contains a prohibition against creating/opening a PR.",
            )
        has_guard = bool(DIRECT_PUSH_GUARD_RE.search(normalized))
        has_pr_flow = bool(PR_CREATE_RE.search(normalized) and PR_MERGE_RE.search(normalized))
        has_sync = bool(SYNC_CMD_RE.search(normalized) and SYNC_WORD_RE.search(normalized))
        has_cleanup = bool(CLEANUP_RE.search(normalized))
        if not (has_guard and has_pr_flow and has_sync and has_cleanup):
            missing_parts = [
                label
                for label, present in (
                    ("direct-push guard", has_guard),
                    ("PR create + merge", has_pr_flow),
                    ("local/remote sync", has_sync),
                    ("branch/worktree cleanup", has_cleanup),
                )
                if not present
            ]
            add_error(
                "missing_main_pr_sync",
                f"Prompts targeting `main`/`master` (`main-pr`) must include all 4 pillars; missing: {', '.join(missing_parts)}.",
            )
    else:
        if not PUSH_RE.search(normalized) or not PUSH_BOUNDARY_RE.search(normalized):
            add_error(
                "missing_commit_boundary",
                "Prompt must explicitly state the `git push` boundary (forbidden by default or explicitly authorized).",
            )

    # 11. Issue close protocol
    if close_mode == "remote-close":
        if tracker != "github":
            add_error("invalid_close_mode", "`--close-mode remote-close` is only valid with `--tracker github`.")
        elif not (GH_COMMENT_RE.search(normalized) and GH_CLOSE_RE.search(normalized) and AUTH_CLOSE_RE.search(normalized)):
            add_error(
                "missing_close_protocol",
                "Remote-close prompts must include explicit authorization plus both `gh issue comment` (before closing) and `gh issue close`.",
            )
    elif close_mode == "pr-close":
        if tracker != "github":
            add_error("invalid_close_mode", "`--close-mode pr-close` is only valid with `--tracker github`.")
        elif not (
            GH_PR_CREATE_RE.search(normalized)
            and (CLOSES_ISSUE_RE.search(normalized) or GH_CLOSE_RE.search(normalized))
            and GH_COMMENT_RE.search(normalized)
        ):
            add_error(
                "missing_close_protocol",
                "PR-close prompts must specify `gh pr create`, `Closes #<n>` (or `gh issue close`), and `gh issue comment` for commit SHA linking.",
            )
    elif close_mode == "no-close":
        if GH_CLOSE_RE.search(normalized):
            add_error("unexpected_close_command", "Prompt must not instruct `gh issue close` when `--close-mode no-close` is active.")

    if len(normalized) > 12000:
        add_warning("prompt_length", f"Prompt length is {len(normalized)} chars; verify you did not paste full issue bodies instead of pointers.")

    return {
        "ok": not errors,
        "tracker": tracker,
        "close_mode": close_mode,
        "base_branch": base_branch,
        "delivery_mode": resolved_delivery,
        "error_count": len(errors),
        "errors": errors,
        "warnings": warnings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate a compiled Matt Pocock fresh-session implementation prompt.",
    )
    parser.add_argument(
        "input_path",
        help="Path to prompt text/markdown file, or '-' to read UTF-8 from stdin.",
    )
    parser.add_argument(
        "--tracker",
        choices=("github", "local"),
        default="github",
        help="Issue tracker mode used by the target repository.",
    )
    parser.add_argument(
        "--base-branch",
        default=None,
        help="Target base branch (e.g. dev, main, master, release/v2).",
    )
    parser.add_argument(
        "--delivery-mode",
        choices=("auto", "dev-merge", "main-pr", "branch-only"),
        default="auto",
        help="Delivery mode (defaults to auto-mapping from --base-branch).",
    )
    parser.add_argument(
        "--close-mode",
        choices=("remote-close", "pr-close", "no-close"),
        default=None,
        help="Closing strategy expected in the prompt (defaults to pr-close for main-pr, remote-close for other github modes, no-close for local).",
    )
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    resolved_delivery = resolve_delivery_mode(args.base_branch, args.delivery_mode)
    close_mode = resolve_close_mode(args.tracker, args.close_mode, resolved_delivery)
    try:
        text = read_prompt_text(args.input_path)
    except OSError as exc:
        print(f"Error reading input: {exc}", file=sys.stderr)
        return 2

    result = lint_prompt(
        text,
        tracker=args.tracker,
        close_mode=close_mode,
        base_branch=args.base_branch,
        delivery_mode=args.delivery_mode,
    )
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if result["ok"] else "FAIL"
        base_label = result["base_branch"] or "-"
        print(
            f"[{status}] tracker={result['tracker']} base={base_label} "
            f"delivery={result['delivery_mode']} close_mode={result['close_mode']} errors={result['error_count']}"
        )
        for item in result["errors"]:
            print(f"  ERROR [{item['code']}]: {item['message']}")
        for item in result["warnings"]:
            print(f"  WARN  [{item['code']}]: {item['message']}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
