#!/usr/bin/env python3
"""Render one validated skill-session-review JSON document as self-contained HTML."""

from __future__ import annotations

import argparse
import html
import json
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any

from report_headings import headings_for
from review_contract import (
    ContractError,
    configure_utf8_stdio,
    decode_review_json,
    emit_error,
    format_decimal,
    read_regular_bytes,
    validate_review,
)


def esc(value: Any) -> str:
    """Escape every value interpolated into HTML text or attributes."""

    if isinstance(value, Decimal):
        value = format_decimal(value)
    if value is None:
        value = ""
    return html.escape(str(value), quote=True)


def _list_or_empty(items: list[Any], empty_text: str) -> str:
    if not items:
        return f'<p class="empty">{esc(empty_text)}</p>'
    return "<ul>" + "".join(f"<li>{esc(item)}</li>" for item in items) + "</ul>"


def _score_reason(score: dict[str, Any]) -> str:
    reason = score["reason"]
    locator = reason["locator"]
    sentences = " ".join(reason["sentences"])
    return (
        f'<div class="score-reason"><p>{esc(sentences)}</p>'
        f'<p class="locator">Locator type: {esc(locator["type"])} · '
        f'Locator value: {esc(locator["value"])}</p></div>'
    )


def _score_details(session: dict[str, Any], insufficient: str) -> str:
    if session["status"] != "invoked":
        return '<span class="muted">—</span>'
    blocks: list[str] = []
    for dimension in ("execution_efficiency", "instruction_fit"):
        score = session["scores"][dimension]
        displayed_score = insufficient if score["label"] == "insufficient_evidence" else format_decimal(score["score"])
        blocks.append(
            f'<section class="dimension"><h4>{esc(dimension)}</h4>'
            f'<p>Label: <code>{esc(score["label"])}</code> · Score: {esc(displayed_score)}</p>'
            f'{_score_reason(score)}</section>'
        )
    return '<details><summary>Scores and reasons</summary>' + "".join(blocks) + "</details>"


def render_page(review: dict[str, Any]) -> str:
    """Return deterministic, self-contained HTML for a complete review."""

    if review.get("_canonical") is not True:
        if not isinstance(review, dict):
            raise ContractError("review must be object", code=6, category="schema-invalid")
        # The pure renderer is also a convenient import API.  Route ordinary
        # json.loads floats through the same Decimal decoder before validation;
        # persisted CLI/writer inputs already arrive through that decoder.
        raw = (json.dumps(review, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
        _, decimal_review = decode_review_json(raw)
        expected_name = decimal_review.get("skill_name")
        if not isinstance(expected_name, str):
            raise ContractError("skill name missing", code=6, category="schema-invalid")
        review = validate_review(decimal_review, expected_name)

    language = review["language"]
    headings = headings_for(language)
    insufficient = "证据不足" if language == "zh" else "Insufficient evidence"
    empty = "None"
    aggregate = review["aggregate"]
    counts = aggregate["invocation_counts"]
    fit_mean = aggregate["instruction_fit"]
    unverified_items = list(review["unverified"])
    if fit_mean is None:
        unverified_items.append(
            "instruction_fit：证据不足，overall 按原始 0.500000 代入。"
            if language == "zh"
            else "instruction_fit: insufficient evidence; overall used the raw 0.500000 fallback."
        )

    coverage_rows = "".join(
        "<tr>"
        f"<td>{esc(platform)}</td><td>{esc(review['coverage'][platform]['status'])}</td>"
        f"<td>{esc(review['coverage'][platform]['invoked'])}</td>"
        f"<td>{esc(review['coverage'][platform]['loaded'])}</td>"
        f"<td>{esc(review['coverage'][platform]['available'])}</td>"
        "</tr>"
        for platform in ("claude", "grok", "codex", "oh-my-pi")
    )
    session_rows = "".join(
        "<tr>"
        f"<td>{esc(session['id'])}</td><td>{esc(session['platform'])}</td>"
        f"<td>{esc(session['status'])}</td><td>{esc(session['signal'])}</td>"
        f"<td>{_score_details(session, insufficient)}</td>"
        "</tr>"
        for session in review["sessions"]
    )

    finding_blocks = "".join(
        f'<details class="finding"><summary>{esc(item["id"])} · {esc(item["verdict"])}</summary>'
        '<dl class="facts">'
        f'<dt>Session</dt><dd>{esc(item["session_id"])}</dd>'
        f'<dt>Platform</dt><dd>{esc(item["platform"])}</dd>'
        f'<dt>Evidence</dt><dd>{esc(item["evidence"])}</dd>'
        f'<dt>Step deviation</dt><dd>{esc(item["step_deviation"])}</dd>'
        f'<dt>User correction</dt><dd>{esc(item["user_correction"])}</dd>'
        f'<dt>Gap</dt><dd>{esc(item["gap"])}</dd>'
        f'<dt>Reusable suggestion</dt><dd>{esc(item["suggestion"])}</dd>'
        "</dl></details>"
        for item in review["findings"]
    ) or f'<p class="empty">{esc(empty)}</p>'

    suggestion_blocks = "".join(
        '<article class="card">'
        f'<p><strong>Finding ids:</strong> {esc(", ".join(item["finding_ids"]))}</p>'
        f'<p><strong>Clause:</strong> {esc(item["clause"])}</p>'
        f'<p><strong>Why filed:</strong> {esc(item["why_filed"])}</p>'
        "</article>"
        for item in review["suggestions"]
    ) or f'<p class="empty">{esc(empty)}</p>'
    not_filed_blocks = "".join(
        '<article class="card">'
        f'<p><strong>Finding id:</strong> {esc(item["finding_id"])}</p>'
        f'<p><strong>Why not:</strong> {esc(item["why_not"])}</p>'
        "</article>"
        for item in review["not_filed"]
    ) or f'<p class="empty">{esc(empty)}</p>'

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>skill-session-review · {esc(review['skill_name'])}</title>
<style>
:root {{ color-scheme: light; --ink:#18212f; --muted:#657085; --line:#d9e0ea; --panel:#f7f9fc; --accent:#3157c8; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:#eef2f7; color:var(--ink); font:15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif; }}
main {{ width:min(1120px,calc(100% - 32px)); margin:32px auto; }}
header,.section {{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:24px; margin:0 0 18px; box-shadow:0 8px 24px rgba(23,35,58,.06); }}
h1,h2,h3,h4,p {{ overflow-wrap:anywhere; }}
h1 {{ margin:0 0 8px; font-size:clamp(1.65rem,4vw,2.3rem); }}
h2 {{ margin:0 0 16px; font-size:1.25rem; }}
h4 {{ margin:.4rem 0; }}
.meta,.muted,.locator,.note,.empty {{ color:var(--muted); }}
.score-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }}
.metric,.card,.dimension {{ border:1px solid var(--line); border-radius:10px; padding:14px; background:var(--panel); }}
.metric strong {{ display:block; font-size:1.3rem; color:var(--accent); }}
.grade strong {{ font-size:2rem; }}
.table-wrap {{ overflow-x:auto; }}
table {{ width:100%; border-collapse:collapse; min-width:680px; }}
th,td {{ padding:10px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }}
th {{ background:var(--panel); }}
details {{ margin:.3rem 0; }}
summary {{ cursor:pointer; font-weight:650; }}
.finding {{ border:1px solid var(--line); border-radius:10px; padding:12px 14px; margin:10px 0; }}
.facts {{ display:grid; grid-template-columns:minmax(130px,180px) minmax(0,1fr); gap:6px 14px; }}
.facts dt {{ font-weight:650; }} .facts dd {{ margin:0; overflow-wrap:anywhere; }}
code {{ font-family:ui-monospace,"Cascadia Code",monospace; }}
@media (max-width:640px) {{ main {{ width:min(100% - 18px,1120px); margin:12px auto; }} header,.section {{ padding:16px; }} .facts {{ grid-template-columns:1fr; }} }}
</style>
</head>
<body>
<main>
<header>
<h1>skill-session-review · {esc(review['skill_name'])}</h1>
<p class="meta">Target path: {esc(review['skill_path'] or 'unresolved')} · Scope: {esc(review['scope'])} · Generated at: {esc(review['generated_at'])} · Language: {esc(language)}</p>
</header>
<section class="section" id="scorecard"><h2>{esc(headings['scorecard'])}</h2>
<div class="score-grid">
<div class="metric grade"><span>Grade</span><strong>{esc(aggregate['grade'])}</strong></div>
<div class="metric"><span>Overall</span><strong>{esc(format_decimal(aggregate['overall']))}</strong></div>
<div class="metric"><span>execution_efficiency mean</span><strong>{esc(format_decimal(aggregate['execution_efficiency']))}</strong><small>Curve: {esc(format_decimal(aggregate['execution_efficiency_curve']))}</small></div>
<div class="metric"><span>instruction_fit mean</span><strong>{esc(insufficient if fit_mean is None else format_decimal(fit_mean))}</strong><small>Curve: {esc(format_decimal(aggregate['instruction_fit_curve']))}</small></div>
<div class="metric"><span>Scored sessions</span><strong>{esc(aggregate['scored_sessions'])}</strong></div>
<div class="metric"><span>Invocation ratio</span><strong>{esc(format_decimal(aggregate['invocation_ratio']))}</strong><small>invoked {esc(counts['invoked'])} · loaded {esc(counts['loaded'])} · available {esc(counts['available'])}</small></div>
</div>
<p class="note">available includes Codex catalog-wide session exposure; invocation counts and ratio are diagnostic display only and are not part of overall.</p>
</section>
<section class="section" id="coverage"><h2>{esc(headings['coverage'])}</h2><div class="table-wrap"><table><thead><tr><th>Platform</th><th>Status</th><th>invoked</th><th>loaded</th><th>available</th></tr></thead><tbody>{coverage_rows}</tbody></table></div></section>
<section class="section" id="invocations"><h2>{esc(headings['invocations'])}</h2><div class="table-wrap"><table><thead><tr><th>Session</th><th>Platform</th><th>Status</th><th>Signal</th><th>Scores</th></tr></thead><tbody>{session_rows}</tbody></table></div></section>
<section class="section" id="findings"><h2>{esc(headings['findings'])}</h2>{finding_blocks}</section>
<section class="section" id="suggestions"><h2>{esc(headings['suggestions'])}</h2>{suggestion_blocks}</section>
<section class="section" id="not-filed"><h2>{esc(headings['not_filed'])}</h2>{not_filed_blocks}</section>
<section class="section" id="unverified"><h2>{esc(headings['unverified'])}</h2>{_list_or_empty(unverified_items, empty)}</section>
<section class="section" id="reliable"><h2>{esc(headings['reliable'])}</h2>{_list_or_empty(review['reliable'], empty)}</section>
</main>
</body>
</html>
"""


def main(argv: list[str] | None = None) -> int:
    configure_utf8_stdio()
    parser = argparse.ArgumentParser(description="Render validated review JSON as HTML on stdout.")
    parser.add_argument("--review-json", required=True)
    args = parser.parse_args(argv)
    try:
        raw = read_regular_bytes(Path(args.review_json).expanduser(), "review JSON")
        _, review = decode_review_json(raw)
        validated = validate_review(review, review.get("skill_name", ""))
        sys.stdout.write(render_page(validated))
    except ContractError as exc:
        emit_error(exc)
        return exc.code
    return 0


if __name__ == "__main__":
    sys.exit(main())
