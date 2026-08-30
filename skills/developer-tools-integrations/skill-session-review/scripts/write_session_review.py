#!/usr/bin/env python3
"""Render and govern exactly one skill-session-review report artifact."""

from __future__ import annotations

import argparse
import sys
from decimal import Decimal
from pathlib import Path

from render_review_html import render_page
from report_headings import HEADINGS
from review_contract import (
    ContractError,
    check_report_subtree_git,
    decode_review_json,
    derive_input_path,
    derive_report_path,
    emit_error,
    emit_json,
    format_decimal,
    git_visibility,
    governed_write,
    read_regular_bytes,
    resolve_repo_root,
    scan_secrets,
    validate_fixed_path,
    validate_name,
    validate_review,
)


FORMATS = ("markdown", "html")


class _Parser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        del message
        emit_error("invalid-arguments")
        raise SystemExit(2)


def _md(value: object) -> str:
    text = str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\\", "\\\\")
        .replace("|", "\\|")
        .replace("\r", " ")
        .replace("\n", " ")
    )


def _six(value: object) -> str:
    if value is None:
        return "null"
    try:
        rendered = format_decimal(Decimal(str(value)))
        return rendered if rendered is not None else "null"
    except Exception:
        return _md(value)


def _reasons(score: dict[str, object]) -> str:
    reason = score.get("reason", {})
    if not isinstance(reason, dict):
        return ""
    sentences = reason.get("sentences", [])
    if not isinstance(sentences, list):
        return ""
    return " ".join(_md(sentence) for sentence in sentences)


def _registered_heading(language: str, key: str) -> str:
    return str(HEADINGS[language][key])


def render_markdown(review: dict[str, object]) -> str:
    """Render the validated canonical review as deterministic Markdown."""

    language = str(review["language"])
    aggregate = review["aggregate"]
    coverage = review["coverage"]
    sessions = review["sessions"]
    assert isinstance(aggregate, dict)
    assert isinstance(coverage, dict)
    assert isinstance(sessions, list)
    invocation_counts = aggregate["invocation_counts"]
    total_invoked = int(invocation_counts["invoked"])
    total_loaded = int(invocation_counts["loaded"])
    total_available = int(invocation_counts["available"])
    fit_mean = (
        "insufficient evidence"
        if aggregate["instruction_fit"] is None
        else _six(aggregate["instruction_fit"])
    )

    lines = [
        f"# Skill Session Review: {_md(review['skill_name'])}",
        "",
        f"- Skill: `{_md(review['skill_name'])}`",
        f"- Path: `{_md(review['skill_path'])}`",
        f"- Scope: `{_md(review['scope'])}`",
        f"- Generated: `{_md(review['generated_at'])}`",
        f"- Language: `{_md(review['language'])}`",
        "",
        f"## {_registered_heading(language, 'scorecard')}",
        "",
        "| Metric | Raw mean | Curved |",
        "| --- | ---: | ---: |",
        f"| execution_efficiency | {_six(aggregate['execution_efficiency'])} | {_six(aggregate['execution_efficiency_curve'])} |",
        f"| instruction_fit | {fit_mean} | {_six(aggregate['instruction_fit_curve'])} |",
        "",
        f"- Overall: **{_six(aggregate['overall'])}**",
        f"- Grade: **{_md(aggregate['grade'])}**",
        f"- Scored sessions: `{int(aggregate['scored_sessions'])}`",
        f"- Invoked / loaded / available: `{total_invoked} / {total_loaded} / {total_available}`",
        f"- Invocation ratio (display only): `{_six(aggregate['invocation_ratio'])}`",
        "- Note: `available` may include sessions where a complete skill catalog was injected; this ratio is not a quality score.",
        "",
        f"## {_registered_heading(language, 'coverage')}",
        "",
        "| Platform | Status | Invoked | Loaded | Available |",
        "| --- | --- | ---: | ---: | ---: |",
    ]
    for platform in ("claude", "grok", "codex", "oh-my-pi"):
        item = coverage[platform]
        lines.append(
            f"| {_md(platform)} | {_md(item['status'])} | {_md(item['invoked'])} | "
            f"{_md(item['loaded'])} | {_md(item['available'])} |"
        )

    lines.extend(
        [
            "",
            f"## {_registered_heading(language, 'invocations')}",
            "",
            "| Session | Platform | Status | Signal | execution_efficiency | instruction_fit |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )
    invoked_rows: list[dict[str, object]] = []
    for session in sessions:
        assert isinstance(session, dict)
        scores = session.get("scores")
        efficiency = "—"
        fit = "—"
        if isinstance(scores, dict):
            efficiency_score = scores["execution_efficiency"]
            fit_score = scores["instruction_fit"]
            efficiency = f"{_md(efficiency_score['label'])} ({_six(efficiency_score['score'])})"
            fit = f"{_md(fit_score['label'])} ({_six(fit_score['score'])})"
            invoked_rows.append(session)
        lines.append(
            f"| {_md(session['id'])} | {_md(session['platform'])} | {_md(session['status'])} | "
            f"{_md(session['signal'])} | {efficiency} | {fit} |"
        )
    for session in invoked_rows:
        scores = session["scores"]
        lines.extend(
            [
                "",
                f"- `{_md(session['id'])}` execution_efficiency reason: {_reasons(scores['execution_efficiency'])}",
                f"- `{_md(session['id'])}` instruction_fit reason: {_reasons(scores['instruction_fit'])}",
            ]
        )

    lines.extend(["", f"## {_registered_heading(language, 'findings')}", ""])
    findings = review["findings"]
    assert isinstance(findings, list)
    if not findings:
        lines.append("- None")
    for finding in findings:
        lines.extend(
            [
                f"### {_md(finding['id'])} — {_md(finding['verdict'])}",
                "",
                f"- Session: `{_md(finding['session_id'])}`",
                f"- Platform: `{_md(finding['platform'])}`",
                f"- Evidence: {_md(finding['evidence'])}",
                f"- Step deviation: {_md(finding['step_deviation'])}",
                f"- User correction: {_md(finding['user_correction'])}",
                f"- Gap: {_md(finding['gap'])}",
                f"- Suggestion: {_md(finding['suggestion'])}",
                "",
            ]
        )

    lines.extend([f"## {_registered_heading(language, 'suggestions')}", ""])
    suggestions = review["suggestions"]
    assert isinstance(suggestions, list)
    if not suggestions:
        lines.append("- None")
    for suggestion in suggestions:
        finding_ids = ", ".join(_md(item) for item in suggestion["finding_ids"])
        lines.append(
            f"- [{finding_ids}] {_md(suggestion['clause'])} — {_md(suggestion['why_filed'])}"
        )

    lines.extend(["", f"## {_registered_heading(language, 'not_filed')}", ""])
    not_filed = review["not_filed"]
    assert isinstance(not_filed, list)
    if not not_filed:
        lines.append("- None")
    for item in not_filed:
        lines.append(f"- {_md(item['finding_id'])}: {_md(item['why_not'])}")

    for key in ("unverified", "reliable"):
        lines.extend(["", f"## {_registered_heading(language, key)}", ""])
        items = review[key]
        assert isinstance(items, list)
        if key == "unverified" and aggregate["instruction_fit"] is None:
            items = [
                *items,
                "instruction_fit has insufficient evidence; overall substitutes raw 0.500000.",
            ]
        if not items:
            lines.append("- None")
        else:
            lines.extend(f"- {_md(item)}" for item in items)
    return "\n".join(lines).rstrip("\n") + "\n"


def _exact_review_path(raw_path: str, expected: Path) -> Path:
    supplied = Path(raw_path)
    if not supplied.is_absolute() or str(supplied) != str(expected):
        raise ContractError("review path identity mismatch", 2, "review-path-mismatch")
    return supplied


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(description="Write one validated skill-session-review artifact.")
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--format", required=True, choices=FORMATS)
    parser.add_argument("--review-json", required=True)
    parser.add_argument("--replace", action="store_true")
    parser.add_argument("--expected-sha256")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.replace != (args.expected_sha256 is not None):
        emit_error("invalid-replacement-arguments")
        return 2
    if not sys.stdin.isatty() and sys.stdin.buffer.read():
        emit_error("unexpected-stdin")
        return 2
    try:
        repo_root = resolve_repo_root(args.repo_root)
        name = validate_name(args.name)
        expected_input = derive_input_path(repo_root, name)
        review_path = _exact_review_path(args.review_json, expected_input)
        destination = derive_report_path(repo_root, name, args.format)
        validate_fixed_path(repo_root, review_path, expected_input, "review input")
        validate_fixed_path(repo_root, destination, destination, "report destination")
        git_state = check_report_subtree_git(repo_root, destination)

        raw = read_regular_bytes(review_path, "review input", code=2)
        normalized, review = decode_review_json(raw)
        if normalized != raw:
            raise ContractError("persisted input is not normalized", 6, "input-not-normalized")
        canonical = validate_review(review, name)
        rendered = render_markdown(canonical) if args.format == "markdown" else render_page(canonical)
        rendered = rendered.replace("\r\n", "\n").replace("\r", "\n")
        if not rendered.endswith("\n"):
            rendered += "\n"
        scan_secrets(rendered)
        metadata = governed_write(
            destination,
            rendered.encode("utf-8"),
            replace=args.replace,
            expected_sha256=args.expected_sha256,
        )
        emit_json(
            {
                "path": destination.as_posix(),
                "operation": "report",
                "format": args.format,
                "mode": "replace" if args.replace else "create",
                "bytes": metadata["bytes"],
                "sha256": metadata["sha256"],
                "git": git_visibility(repo_root, destination) if git_state != "non-repo" else "non-repo",
            }
        )
        return 0
    except ContractError as exc:
        emit_error(exc)
        return exc.code
    except OSError:
        emit_error("report-io-failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
