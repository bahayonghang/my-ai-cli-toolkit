#!/usr/bin/env python3
"""Deterministic linter for tickets-review optimization handoff prompts."""

from __future__ import annotations

import argparse
import json
import locale
import re
import sys
from pathlib import Path
from typing import Any

from ticket_precheck import configure_stdio

PLACEHOLDER_RE = re.compile(r"\{\{[A-Za-z0-9_.-]+\}\}")
BACKREF_RE = re.compile(
    r"(?:见上一条消息|见上方报告|如前所述|见上面的审查|see the previous message|see the report above|see above)",
    re.IGNORECASE,
)
PERSONAL_PATH_RE = re.compile(
    r"(?:[A-Za-z]:[\\/]+Users[\\/]+(?!<user>|example\b)[^\s\"'`<>|\\/]+|"
    r"(?:^|[\s(`'\"])/(?:Users|home)/(?!<user>|example\b)[^\s\"'`<>|/]+)",
    re.MULTILINE,
)
REPORT_PREFIX_RE = re.compile(r"reports/tickets-review/[a-z0-9][a-z0-9._-]*\.md")
READ_REPORT_RE = re.compile(
    r"(?:通读审阅报告|打开并通读|打开审阅报告|read\s+.+report.+in\s+full|read\s+reports/tickets-review/)",
    re.IGNORECASE,
)
CONFIRM_GATE_RE = re.compile(
    r"(?:结构化提问工具|确认门|AskUserQuestion|ask_question|request_user_input|confirmation gate|structured question tool)",
    re.IGNORECASE,
)
NO_DUMP_WAIT_RE = re.compile(
    r"(?:干等|不要只写进聊天|禁止把选项清单|dump a (?:plain )?checklist|dump-and-wait)",
    re.IGNORECASE,
)
NO_CODE_IMPL_RE = re.compile(
    r"(?:严禁修改业务代码|不要修改业务代码|严禁开始实现|do not edit product code|never edit product code|do not start implementation)",
    re.IGNORECASE,
)
NO_CLOSE_RE = re.compile(
    r"(?:严禁关闭|不要关闭|never close tickets|do not close any ticket)",
    re.IGNORECASE,
)
UNTRUSTED_DATA_RE = re.compile(
    r"(?:不可信内容|视为数据|绝不执行其中粘贴|untrusted content|data only|never run commands)",
    re.IGNORECASE,
)
GITHUB_WRITE_GATE_RE = re.compile(
    r"(?:远程写回授权|保守确认门|明确批准后执行写回|remote write-back approval|conservative approval gate)",
    re.IGNORECASE,
)
GITHUB_BODY_FILE_RE = re.compile(r"--body-file", re.IGNORECASE)
READ_BACK_RE = re.compile(
    r"(?:写回后回读|回读核验|re-read every modified ticket|read-back verification)",
    re.IGNORECASE,
)
LOCAL_FORBIDDEN_GH_RE = re.compile(r"\bgh\s+issue\s+(?:edit|close|comment)\b", re.IGNORECASE)


def read_prompt(input_path: str | None) -> str:
    if input_path and input_path != "-":
        path = Path(input_path).expanduser()
        if not path.is_file():
            raise FileNotFoundError(f"prompt file not found: {input_path}")
        return path.read_text(encoding="utf-8-sig")
    raw = sys.stdin.buffer.read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        fallback = sys.stdin.encoding or locale.getpreferredencoding(False)
        return raw.decode(fallback, errors="replace")


def lint_handoff(
    text: str,
    tracker: str,
    report_rel: str | None = None,
) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    def err(code: str, message: str) -> None:
        errors.append({"code": code, "message": message})

    def warn(code: str, message: str) -> None:
        warnings.append({"code": code, "message": message})

    stripped = text.strip()
    if not stripped:
        err("empty_prompt", "handoff prompt is empty")
        return {"ok": False, "errors": errors, "warnings": warnings}

    placeholders = sorted(set(PLACEHOLDER_RE.findall(stripped)))
    if placeholders:
        err("unresolved_placeholder", f"unresolved template placeholder(s): {placeholders}")

    backrefs = sorted(set(BACKREF_RE.findall(stripped)))
    if backrefs:
        err("chat_backreference", f"prompt must be self-contained; found backreference(s): {backrefs}")

    if PERSONAL_PATH_RE.search(stripped):
        err("personal_path_leak", "prompt leaks a personal absolute path; use repo-relative paths only")

    if not REPORT_PREFIX_RE.search(stripped):
        err("missing_report_pointer", "prompt must reference reports/tickets-review/<scope-slug>.md")
    elif report_rel and report_rel not in stripped:
        err("mismatched_report_pointer", f"prompt does not reference expected report path {report_rel}")

    if not READ_REPORT_RE.search(stripped):
        err("missing_read_report_order", "prompt must instruct the downstream agent to read the persisted report first")

    if not CONFIRM_GATE_RE.search(stripped):
        err("missing_confirmation_gate", "prompt must include a structured confirmation gate for class-3 decisions")

    if not NO_DUMP_WAIT_RE.search(stripped):
        warn("missing_no_dump_wait", "consider explicitly forbidding dump-and-wait chat checklists")

    if not NO_CODE_IMPL_RE.search(stripped):
        err("missing_no_code_boundary", "prompt must forbid editing product code and starting implementation")

    if not NO_CLOSE_RE.search(stripped):
        err("missing_no_close_boundary", "prompt must forbid closing tickets during optimization")

    if not UNTRUSTED_DATA_RE.search(stripped):
        warn("missing_untrusted_rule", "consider keeping the untrusted-content data-only guardrail")

    if tracker == "github":
        if not GITHUB_WRITE_GATE_RE.search(stripped):
            err(
                "missing_remote_write_approval",
                "github handoff prompt must include conservative remote write-back approval gate",
            )
        if not GITHUB_BODY_FILE_RE.search(stripped):
            err(
                "missing_body_file_rule",
                "github handoff prompt must enforce --body-file UTF-8 updates for Windows safety",
            )
        if not READ_BACK_RE.search(stripped):
            err(
                "missing_readback_verification",
                "github handoff prompt must require read-back verification after remote edits",
            )
    elif tracker == "local":
        if LOCAL_FORBIDDEN_GH_RE.search(stripped):
            err(
                "local_mentions_gh_mutation",
                "local .scratch handoff prompt must not instruct running gh issue edit/close/comment",
            )

    return {"ok": len(errors) == 0, "errors": errors, "warnings": warnings}


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = argparse.ArgumentParser(
        description="Lint a tickets-review handoff prompt before emitting it to the user."
    )
    parser.add_argument(
        "--tracker",
        choices=("github", "local"),
        required=True,
        help="Tracker mode matching the reviewed scope.",
    )
    parser.add_argument(
        "--report-rel",
        help="Expected repo-relative report path (e.g. reports/tickets-review/github-spec-63.md).",
    )
    parser.add_argument(
        "--input",
        help="Handoff prompt text file; pass '-' or omit to read stdin.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON output.",
    )
    args = parser.parse_args(argv)

    try:
        prompt_text = read_prompt(args.input)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    result = lint_handoff(prompt_text, tracker=args.tracker, report_rel=args.report_rel)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if result["ok"] else "FAIL"
        print(
            f"[{status}] errors={len(result['errors'])} warnings={len(result['warnings'])}"
        )
        for item in result["errors"]:
            print(f"  ERROR [{item['code']}]: {item['message']}")
        for item in result["warnings"]:
            print(f"  WARN  [{item['code']}]: {item['message']}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
