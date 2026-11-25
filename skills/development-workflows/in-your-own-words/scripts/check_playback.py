#!/usr/bin/env python3
"""Deterministic audit script for in-your-own-words playbacks."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Sequence


MIN_PLAYBACK_CHARS = 20
MAX_RECOMMENDED_CHARS = 2500
DEFAULT_MAX_QUESTIONS = 4
DEFAULT_MAX_COPY_RATIO = 0.55

GOAL_PATTERN = re.compile(
    r"(?im)(?:目标|预期结果|最终希望|最终想要|\bgoals?\b|\bobjectives?\b|\boutcomes?\b)"
)
PROBLEM_PATTERN = re.compile(
    r"(?im)(?:问题|痛点|障碍|卡点|根因|瓶颈|风险|要解决|\bproblems?\b|\bpain\s+points?\b|\bbottlenecks?\b|\bissues?\b|\bblockers?\b)"
)
SUCCESS_PATTERN = re.compile(
    r"(?im)(?:成功标准|验收|判断标准|怎么算完成|做到位|达到什么效果|\bsuccess(?:\s+check|\s+criteria)?\b|\bacceptance\b|\bdone\s+when\b|\bhow\s+we(?:'ll|\s+will)?\s+know\b|\bverif(?:y|ication)\b)"
)
CONFIRM_STOP_PATTERN = re.compile(
    r"(?is)(?:对吗|准确吗|对不对|偏差|遗漏|漏掉|纠正|修正|指正|确认后再|确认后我再|确认再动手|\bright\?|\bcorrect\s+me\b|\bdrifted\b|\bdid\s+i\s+(?:get|capture)\b|\bconfirm\b.*\bbefore\b)"
)

FENCED_BLOCK_RE = re.compile(r"```[^\n]*\n(.*?)```", re.DOTALL)
DIFF_MARKER_RE = re.compile(r"(?m)^(?:diff --git |@@ -\d+|--- a/|\+\+\+ b/)")
PREMATURE_EXECUTION_RE = re.compile(
    r"(?i)(?:我已(?:经)?(?:修改|改好|更新|创建|提交|实现)|已为你(?:修改|创建|更新|写入)|接下来我直接开始(?:修改|改代码|实施)|"
    r"\bi\s+have\s+(?:updated|edited|implemented|created|modified|committed)\b|"
    r"\blet\s+me\s+go\s+ahead\s+and\s+(?:edit|implement|write|modify|apply)\b)"
)

QUESTION_BULLET_RE = re.compile(r"(?m)^\s*(?:[-*]|\d+[.)]|❓)\s*(?:Q\d+\b|.*[?？]\s*$)")
QUESTION_LINE_RE = re.compile(r"[?？]\s*$")
PLACEHOLDER_RE = re.compile(
    r"(?:\b(?:TODO|TBD|FIXME)\b|\{\{[^{}\n]+\}\}|<[a-z][a-z0-9_-]{2,}>)"
)
CODE_SPAN_RE = re.compile(r"`[^`\n]+`")

STOP_TOKENS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "but",
    "by",
    "can",
    "could",
    "do",
    "for",
    "from",
    "goal",
    "goals",
    "have",
    "help",
    "how",
    "i",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "our",
    "please",
    "problem",
    "right",
    "so",
    "success",
    "check",
    "assumptions",
    "open",
    "forks",
    "that",
    "the",
    "this",
    "to",
    "we",
    "what",
    "with",
    "would",
    "you",
    "your",
    "目标",
    "问题",
    "成功",
    "标准",
    "假设",
    "分叉",
    "对吗",
}


@dataclass(frozen=True)
class Finding:
    code: str
    severity: str
    message: str


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")


def load_text(path_arg: str) -> str:
    if path_arg == "-":
        return sys.stdin.read()
    return Path(path_arg).read_text(encoding="utf-8-sig")


def strip_markdown_noise(text: str) -> str:
    cleaned = FENCED_BLOCK_RE.sub(" ", text)
    cleaned = CODE_SPAN_RE.sub(" ", cleaned)
    cleaned = re.sub(r"[#>*_`~\-\[\]()|:]+", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def extract_shingles(text: str) -> tuple[set[str], str]:
    cleaned = strip_markdown_noise(text).lower()
    latin_tokens = [
        tok
        for tok in re.findall(r"[a-z0-9']+", cleaned)
        if tok not in STOP_TOKENS
    ]
    shingles: set[str] = set()
    if len(latin_tokens) >= 3:
        for idx in range(len(latin_tokens) - 2):
            shingles.add(" ".join(latin_tokens[idx : idx + 3]))

    cjk_stream = "".join(re.findall(r"[\u4e00-\u9fff]", cleaned))
    if len(cjk_stream) >= 4:
        for idx in range(len(cjk_stream) - 3):
            shingles.add(cjk_stream[idx : idx + 4])

    compact_norm = re.sub(r"\s+", "", cleaned)
    return shingles, compact_norm


def count_questions(text: str) -> int:
    text_no_code = FENCED_BLOCK_RE.sub("", text)
    lines = [line.strip() for line in text_no_code.splitlines() if line.strip()]
    question_lines = 0
    for idx, line in enumerate(lines):
        if QUESTION_BULLET_RE.match(line) or QUESTION_LINE_RE.search(line):
            is_tail_drift_check = idx >= max(0, len(lines) - 2) and CONFIRM_STOP_PATTERN.search(line)
            if not is_tail_drift_check:
                question_lines += 1
    return question_lines


def audit_playback(
    playback: str,
    *,
    brief: str | None = None,
    max_questions: int = DEFAULT_MAX_QUESTIONS,
    max_copy_ratio: float = DEFAULT_MAX_COPY_RATIO,
) -> dict[str, object]:
    errors: list[Finding] = []
    warnings: list[Finding] = []
    trimmed = playback.strip()
    non_ws_len = len(re.sub(r"\s+", "", trimmed))

    if non_ws_len < MIN_PLAYBACK_CHARS:
        errors.append(
            Finding(
                code="empty_playback",
                severity="error",
                message="Playback is empty or too short (< 20 non-whitespace characters).",
            )
        )
        return {
            "ok": False,
            "error_count": len(errors),
            "warning_count": len(warnings),
            "errors": [asdict(item) for item in errors],
            "warnings": [asdict(item) for item in warnings],
            "metrics": {"char_count": len(trimmed), "question_count": 0, "copy_ratio": 0.0},
        }

    if not GOAL_PATTERN.search(trimmed):
        errors.append(
            Finding(
                code="missing_goal",
                severity="error",
                message="Playback must explicitly state the user's goal or expected outcome.",
            )
        )

    if not PROBLEM_PATTERN.search(trimmed):
        errors.append(
            Finding(
                code="missing_problem",
                severity="error",
                message="Playback must explicitly state the underlying problem or friction to solve.",
            )
        )

    if not SUCCESS_PATTERN.search(trimmed):
        errors.append(
            Finding(
                code="missing_success_check",
                severity="error",
                message="Playback must state an observable success check or acceptance signal.",
            )
        )

    tail_start = max(0, int(len(trimmed) * 0.55))
    tail_slice = trimmed[tail_start:]
    if not CONFIRM_STOP_PATTERN.search(tail_slice):
        errors.append(
            Finding(
                code="missing_confirmation_stop",
                severity="error",
                message="Playback must close with a confirmation / drift-check line before acting.",
            )
        )

    has_large_code_block = any(
        len([ln for ln in block.splitlines() if ln.strip()]) >= 8
        for block in FENCED_BLOCK_RE.findall(trimmed)
    )
    if has_large_code_block or DIFF_MARKER_RE.search(trimmed) or PREMATURE_EXECUTION_RE.search(trimmed):
        errors.append(
            Finding(
                code="premature_execution",
                severity="error",
                message="Playback contains diffs, large code blocks, or claims of edits already started before confirmation.",
            )
        )

    question_count = count_questions(trimmed)
    if question_count > max_questions:
        errors.append(
            Finding(
                code="questionnaire_overflow",
                severity="error",
                message=f"Playback contains {question_count} open questions (> {max_questions}); route multi-round interrogation to grilling instead.",
            )
        )

    scrubbed_for_placeholders = CODE_SPAN_RE.sub("", FENCED_BLOCK_RE.sub("", trimmed))
    if PLACEHOLDER_RE.search(scrubbed_for_placeholders):
        errors.append(
            Finding(
                code="unresolved_placeholder",
                severity="error",
                message="Playback contains unresolved placeholder tokens (TODO/TBD/FIXME/{{...}}/<...>).",
            )
        )

    copy_ratio = 0.0
    if brief and brief.strip():
        brief_shingles, brief_compact = extract_shingles(brief)
        playback_shingles, playback_compact = extract_shingles(trimmed)
        if brief_shingles:
            copy_ratio = len(brief_shingles & playback_shingles) / len(brief_shingles)
        verbatim_substring = len(brief_compact) >= 20 and brief_compact in playback_compact
        if verbatim_substring or (len(brief_shingles) >= 4 and copy_ratio >= max_copy_ratio):
            errors.append(
                Finding(
                    code="verbatim_parroting",
                    severity="error",
                    message=f"Playback echoes the user brief too closely (shingle overlap={copy_ratio:.2f}, verbatim_substring={verbatim_substring}). Paraphrase in your own words.",
                )
            )

    if len(trimmed) > MAX_RECOMMENDED_CHARS:
        warnings.append(
            Finding(
                code="overlong_playback",
                severity="warning",
                message=f"Playback is {len(trimmed)} chars (> {MAX_RECOMMENDED_CHARS}); tighten to keep alignment fast and readable.",
            )
        )

    return {
        "ok": len(errors) == 0,
        "error_count": len(errors),
        "warning_count": len(warnings),
        "errors": [asdict(item) for item in errors],
        "warnings": [asdict(item) for item in warnings],
        "metrics": {
            "char_count": len(trimmed),
            "question_count": question_count,
            "copy_ratio": round(copy_ratio, 3),
        },
    }


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Deterministically audit an in-your-own-words playback for completeness, read-only stop, and anti-parroting."
    )
    parser.add_argument(
        "path",
        help="Path to the playback text file, or '-' to read UTF-8 from stdin.",
    )
    parser.add_argument(
        "--brief",
        default=None,
        help="Optional original user brief text for anti-parroting overlap check.",
    )
    parser.add_argument(
        "--brief-file",
        default=None,
        help="Optional file containing the original user brief.",
    )
    parser.add_argument(
        "--max-questions",
        type=int,
        default=DEFAULT_MAX_QUESTIONS,
        help="Maximum non-closing questions allowed before flagging questionnaire overflow.",
    )
    parser.add_argument(
        "--max-copy-ratio",
        type=float,
        default=DEFAULT_MAX_COPY_RATIO,
        help="Maximum allowed 4-gram shingle overlap against --brief.",
    )
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    configure_stdio()
    args = parse_args(argv)
    playback = load_text(args.path)
    brief_text = args.brief
    if args.brief_file:
        brief_text = Path(args.brief_file).read_text(encoding="utf-8-sig")

    result = audit_playback(
        playback,
        brief=brief_text,
        max_questions=args.max_questions,
        max_copy_ratio=args.max_copy_ratio,
    )

    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "PASS" if result["ok"] else "FAIL"
        print(
            f"[{status}] errors={result['error_count']} warnings={result['warning_count']} "
            f"chars={result['metrics']['char_count']} questions={result['metrics']['question_count']} "
            f"copy_ratio={result['metrics']['copy_ratio']}"
        )
        for item in result["errors"]:
            print(f"  ERROR [{item['code']}]: {item['message']}")
        for item in result["warnings"]:
            print(f"  WARN  [{item['code']}]: {item['message']}")

    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
