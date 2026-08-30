#!/usr/bin/env python3
"""Canonical review validation and governed persistence primitives.

This module is deliberately the single implementation point shared by the
input manager and both report renderers/writers.  It has no write side effects
unless :func:`governed_write` or :func:`governed_remove` is called explicitly.
"""

from __future__ import annotations

import copy
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
import uuid
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any, Callable

if os.name == "nt":
    import msvcrt
else:
    import fcntl


NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REDACT_RE = re.compile(r"(?:sk-[A-Za-z0-9_-]+|ghp_[A-Za-z0-9]+|Bearer\s+\S+)")
REPORT_SUBTREE = Path("reports") / "skill-session-review"
REGISTERED_FORMATS = {"markdown": ".md", "html": ".html"}
PLATFORMS = ("claude", "grok", "codex", "oh-my-pi")
STATUSES = ("invoked", "loaded", "available")
QUANTUM = Decimal("0.000001")
FILE_ATTRIBUTE_REPARSE_POINT = 0x400

SCORE_MAPS = {
    "execution_efficiency": {
        "highly_efficient": Decimal("1.0"),
        "mostly_efficient": Decimal("0.8"),
        "mostly_inefficient": Decimal("0.4"),
        "highly_inefficient": Decimal("0.2"),
    },
    "instruction_fit": {
        "fit": Decimal("1.0"),
        "misfit": Decimal("0.2"),
        "insufficient_evidence": Decimal("0.5"),
    },
}

GRADE_THRESHOLDS = (
    (Decimal("0.97"), "A+"),
    (Decimal("0.93"), "A"),
    (Decimal("0.90"), "A-"),
    (Decimal("0.87"), "B+"),
    (Decimal("0.83"), "B"),
    (Decimal("0.80"), "B-"),
    (Decimal("0.77"), "C+"),
    (Decimal("0.73"), "C"),
    (Decimal("0.70"), "C-"),
    (Decimal("0.60"), "D"),
    (Decimal("0.0"), "F"),
)


class ContractError(Exception):
    """Expected, bounded helper failure with a stable process exit code."""

    def __init__(self, message: str, code: int = 1, category: str | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.category = category or "contract-error"


def configure_utf8_stdio() -> None:
    """Pin text stdio to UTF-8 even when the Windows console uses GBK."""

    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="strict", newline="\n")


def emit_json(payload: dict[str, Any]) -> None:
    """Emit one bounded JSON line under the UTF-8 CLI contract."""

    configure_utf8_stdio()
    print(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))


def emit_error(error: ContractError | str) -> None:
    """Emit a bounded category only; never echo payload or secret material."""

    configure_utf8_stdio()
    category = error.category if isinstance(error, ContractError) else str(error)
    print(f"ERROR: {category}", file=sys.stderr)


def _is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _require_dict(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{field} must be an object", code=6, category="schema-invalid")
    return value


def _require_list(value: Any, field: str) -> list[Any]:
    if not isinstance(value, list):
        raise ContractError(f"{field} must be an array", code=6, category="schema-invalid")
    return value


def _require_string(value: Any, field: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str) or (not allow_empty and not value):
        raise ContractError(f"{field} must be a string", code=6, category="schema-invalid")
    if "\x00" in value:
        raise ContractError(f"{field} contains NUL", code=6, category="schema-invalid")
    return value


def _require_bounded_text(
    value: Any,
    field: str,
    *,
    max_length: int,
    allow_empty: bool = False,
    single_line: bool = True,
) -> str:
    text = _require_string(value, field, allow_empty=allow_empty)
    if len(text) > max_length:
        raise ContractError(f"{field} is too long", code=6, category="schema-invalid")
    if single_line and ("\r" in text or "\n" in text):
        raise ContractError(f"{field} must be single-line", code=6, category="schema-invalid")
    return text


def _decimal(value: Any, field: str) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, Decimal)):
        raise ContractError(f"{field} must be decimal", code=6, category="aggregate-invalid")
    try:
        result = Decimal(value)
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ContractError(
            f"{field} must be finite decimal", code=6, category="aggregate-invalid"
        ) from exc
    if not result.is_finite():
        raise ContractError(f"{field} must be finite decimal", code=6, category="aggregate-invalid")
    return result


def quantize6(value: Decimal) -> Decimal:
    """Quantize one arithmetic stage to six decimals using ROUND_HALF_UP."""

    return value.quantize(QUANTUM, rounding=ROUND_HALF_UP)


def format_decimal(value: Decimal | int | float | None) -> str | None:
    """Format a canonical report value with exactly six decimal places."""

    if value is None:
        return None
    if isinstance(value, bool):
        raise ContractError("boolean is not decimal", code=6, category="aggregate-invalid")
    decimal_value = value if isinstance(value, Decimal) else Decimal(str(value))
    return f"{quantize6(decimal_value):.6f}"


def scan_secrets(value: Any) -> None:
    """Reject high-confidence secret patterns without echoing their content."""

    if isinstance(value, bytes):
        try:
            text = value.decode("utf-8", errors="strict")
        except UnicodeDecodeError as exc:
            raise ContractError("invalid UTF-8", code=6, category="invalid-utf8") from exc
    elif isinstance(value, str):
        text = value
    else:
        try:
            text = json.dumps(value, ensure_ascii=False, default=str)
        except (TypeError, ValueError) as exc:
            raise ContractError("unserializable value", code=6, category="schema-invalid") from exc
    if REDACT_RE.search(text):
        raise ContractError("secret-like content", code=7, category="secret-detected")


def decode_review_json(raw: bytes) -> tuple[bytes, dict[str, Any]]:
    """Strictly decode, LF-normalize and parse one JSON object.

    A leading UTF-8 BOM is accepted and removed.  JSON floats remain exact
    :class:`Decimal` values; no binary floating-point values enter scoring.
    """

    if not isinstance(raw, bytes):
        raise ContractError("input must be bytes", code=6, category="schema-invalid")
    try:
        text = raw.decode("utf-8-sig", errors="strict")
    except UnicodeDecodeError as exc:
        raise ContractError("invalid UTF-8", code=6, category="invalid-utf8") from exc
    if "\x00" in text:
        raise ContractError("input contains NUL", code=6, category="schema-invalid")
    normalized_text = text.replace("\r\n", "\n").replace("\r", "\n")
    if not normalized_text.endswith("\n"):
        normalized_text += "\n"
    normalized = normalized_text.encode("utf-8")
    try:
        review = json.loads(normalized_text, parse_float=Decimal, parse_int=int)
    except (json.JSONDecodeError, InvalidOperation, ValueError) as exc:
        raise ContractError("invalid JSON", code=6, category="json-invalid") from exc
    if not isinstance(review, dict):
        raise ContractError("JSON root must be object", code=6, category="schema-invalid")
    return normalized, review


def validate_reason(reason: Any, session_id: str) -> None:
    """Validate one structured score reason and its current-session locator."""

    reason_obj = _require_dict(reason, "reason")
    if set(reason_obj) != {"sentences", "locator"}:
        raise ContractError("reason fields invalid", code=6, category="reason-invalid")
    sentences = _require_list(reason_obj.get("sentences"), "reason.sentences")
    if not 1 <= len(sentences) <= 3:
        raise ContractError("reason sentence count invalid", code=6, category="reason-invalid")
    for sentence in sentences:
        text = _require_bounded_text(
            sentence, "reason.sentences[]", max_length=1000
        )
        if "\r" in text or "\n" in text or text.strip() != text:
            raise ContractError("reason sentence invalid", code=6, category="reason-invalid")
        scan_secrets(text)
    locator = _require_dict(reason_obj.get("locator"), "reason.locator")
    if set(locator) != {"type", "value"}:
        raise ContractError("locator fields invalid", code=6, category="reason-invalid")
    locator_type = locator.get("type")
    locator_value = _require_bounded_text(
        locator.get("value"),
        "reason.locator.value",
        max_length=256 if locator_type == "session" else 200,
    )
    if locator_type == "session":
        if locator_value != session_id:
            raise ContractError("session locator mismatch", code=6, category="reason-invalid")
    elif locator_type == "excerpt":
        if not 1 <= len(locator_value) <= 200:
            raise ContractError("excerpt locator invalid", code=6, category="reason-invalid")
        scan_secrets(locator_value)
    else:
        raise ContractError("locator type invalid", code=6, category="reason-invalid")


def _validate_score(score: Any, dimension: str, session_id: str) -> Decimal:
    score_obj = _require_dict(score, f"scores.{dimension}")
    if set(score_obj) != {"label", "score", "reason"}:
        raise ContractError("score fields invalid", code=6, category="score-invalid")
    label = _require_string(score_obj.get("label"), f"scores.{dimension}.label")
    mapping = SCORE_MAPS[dimension]
    if label not in mapping:
        raise ContractError("score label invalid", code=6, category="score-invalid")
    canonical = mapping[label]
    declared = _decimal(score_obj.get("score"), f"scores.{dimension}.score")
    if quantize6(declared) != quantize6(canonical):
        raise ContractError("score does not match label", code=6, category="score-invalid")
    validate_reason(score_obj.get("reason"), session_id)
    return canonical


def _grade(overall: Decimal) -> str:
    for threshold, grade in GRADE_THRESHOLDS:
        if overall >= threshold:
            return grade
    return "F"


def _coverage_counts(review: dict[str, Any]) -> dict[str, int]:
    coverage = _require_dict(review.get("coverage"), "coverage")
    if set(coverage) != set(PLATFORMS):
        raise ContractError("coverage platforms invalid", code=6, category="coverage-invalid")
    totals = {status: 0 for status in STATUSES}
    for platform in PLATFORMS:
        row = _require_dict(coverage.get(platform), f"coverage.{platform}")
        required = {"status", *STATUSES}
        if set(row) != required or row.get("status") not in {"ok", "missing-store"}:
            raise ContractError("coverage row invalid", code=6, category="coverage-invalid")
        for status in STATUSES:
            count = row.get(status)
            if not _is_int(count) or count < 0:
                raise ContractError("coverage count invalid", code=6, category="coverage-invalid")
            totals[status] += count
        if row.get("status") == "missing-store" and any(row.get(s) != 0 for s in STATUSES):
            raise ContractError("missing store has counts", code=6, category="coverage-invalid")
    return totals


def recompute_aggregate(review: dict[str, Any]) -> dict[str, Any]:
    """Recompute every protected aggregate field from canonical score labels."""

    sessions = _require_list(review.get("sessions"), "sessions")
    efficiency_values: list[Decimal] = []
    fit_values: list[Decimal] = []
    failed_sessions: list[str] = []
    invoked_count = 0

    for session in sessions:
        row = _require_dict(session, "sessions[]")
        session_id = _require_string(row.get("id"), "sessions[].id")
        status = row.get("status")
        if status != "invoked":
            continue
        invoked_count += 1
        scores = _require_dict(row.get("scores"), "sessions[].scores")
        if set(scores) != set(SCORE_MAPS):
            raise ContractError("score dimensions invalid", code=6, category="score-invalid")
        efficiency = _validate_score(scores.get("execution_efficiency"), "execution_efficiency", session_id)
        fit = _validate_score(scores.get("instruction_fit"), "instruction_fit", session_id)
        efficiency_values.append(efficiency)
        if scores["instruction_fit"]["label"] != "insufficient_evidence":
            fit_values.append(fit)
        if efficiency < Decimal("0.5") or (
            scores["instruction_fit"]["label"] != "insufficient_evidence" and fit < Decimal("0.5")
        ):
            failed_sessions.append(session_id)

    if invoked_count == 0:
        raise ContractError("zero invoked sessions", code=6, category="unrated-review")

    efficiency_mean = quantize6(sum(efficiency_values, Decimal("0")) / Decimal(len(efficiency_values)))
    fit_mean = (
        quantize6(sum(fit_values, Decimal("0")) / Decimal(len(fit_values))) if fit_values else None
    )
    efficiency_curve = quantize6(Decimal("0.5") + Decimal("0.5") * efficiency_mean)
    effective_fit = fit_mean if fit_mean is not None else Decimal("0.5")
    fit_curve = quantize6(Decimal("0.5") + Decimal("0.5") * effective_fit)
    overall = quantize6(
        (Decimal("0.5") * efficiency_curve + Decimal("0.35") * fit_curve) / Decimal("0.85")
    )

    totals = _coverage_counts(review)
    denominator = sum(totals.values())
    if totals["invoked"] == 0 or denominator == 0:
        raise ContractError("zero invocation denominator", code=6, category="unrated-review")
    if totals["invoked"] != invoked_count:
        raise ContractError("coverage/session count mismatch", code=6, category="coverage-invalid")
    invocation_ratio = quantize6(Decimal(totals["invoked"]) / Decimal(denominator))

    return {
        "execution_efficiency": efficiency_mean,
        "instruction_fit": fit_mean,
        "execution_efficiency_curve": efficiency_curve,
        "instruction_fit_curve": fit_curve,
        "overall": overall,
        "grade": _grade(overall),
        "scored_sessions": invoked_count,
        "failed_sessions": failed_sessions,
        "invocation_counts": totals,
        "invocation_ratio": invocation_ratio,
    }


def _compare_declared_aggregate(declared: Any, canonical: dict[str, Any]) -> None:
    aggregate = _require_dict(declared, "aggregate")
    expected_fields = {
        "execution_efficiency",
        "instruction_fit",
        "overall",
        "grade",
        "scored_sessions",
        "failed_sessions",
    }
    if set(aggregate) != expected_fields:
        raise ContractError("aggregate fields invalid", code=6, category="aggregate-invalid")
    for field in ("execution_efficiency", "overall"):
        if quantize6(_decimal(aggregate.get(field), f"aggregate.{field}")) != canonical[field]:
            raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")
    declared_fit = aggregate.get("instruction_fit")
    if canonical["instruction_fit"] is None:
        if declared_fit is not None:
            raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")
    elif declared_fit is None or quantize6(_decimal(declared_fit, "aggregate.instruction_fit")) != canonical[
        "instruction_fit"
    ]:
        raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")
    if aggregate.get("grade") != canonical["grade"]:
        raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")
    if aggregate.get("scored_sessions") != canonical["scored_sessions"] or not _is_int(
        aggregate.get("scored_sessions")
    ):
        raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")
    failed = aggregate.get("failed_sessions")
    if failed != canonical["failed_sessions"]:
        raise ContractError("aggregate mismatch", code=6, category="aggregate-mismatch")


def validate_finding_partition(review: dict[str, Any]) -> None:
    """Require suggestions and not_filed to partition every finding exactly once."""

    findings = _require_list(review.get("findings"), "findings")
    finding_ids = [row.get("id") for row in findings if isinstance(row, dict)]
    if len(finding_ids) != len(findings) or any(not isinstance(value, str) for value in finding_ids):
        raise ContractError("finding id invalid", code=6, category="finding-invalid")
    if len(set(finding_ids)) != len(finding_ids):
        raise ContractError("finding id duplicate", code=6, category="finding-partition-invalid")
    filed: list[str] = []
    for suggestion in _require_list(review.get("suggestions"), "suggestions"):
        row = _require_dict(suggestion, "suggestions[]")
        ids = _require_list(row.get("finding_ids"), "suggestions[].finding_ids")
        filed.extend(ids)
    not_filed: list[str] = []
    for item in _require_list(review.get("not_filed"), "not_filed"):
        row = _require_dict(item, "not_filed[]")
        not_filed.append(row.get("finding_id"))
    combined = filed + not_filed
    if (
        any(not isinstance(value, str) or value not in set(finding_ids) for value in combined)
        or len(combined) != len(set(combined))
        or set(combined) != set(finding_ids)
    ):
        raise ContractError(
            "findings are not exactly partitioned", code=6, category="finding-partition-invalid"
        )


def validate_suggestions(review: dict[str, Any], canonical: dict[str, Any]) -> None:
    """Require each filed pattern to span two invoked sessions and one failure."""

    findings = {row["id"]: row for row in review["findings"]}
    invoked_ids = {row["id"] for row in review["sessions"] if row["status"] == "invoked"}
    failed_ids = set(canonical["failed_sessions"])
    for suggestion in review["suggestions"]:
        ids = suggestion["finding_ids"]
        if any(findings[finding_id]["verdict"] != "UPDATE SKILL" for finding_id in ids):
            raise ContractError(
                "suggestion references non-update finding",
                code=6,
                category="suggestion-invalid",
            )
        supporting_sessions = {findings[finding_id]["session_id"] for finding_id in ids}
        if len(supporting_sessions & invoked_ids) < 2 or not supporting_sessions.intersection(failed_ids):
            raise ContractError(
                "suggestion support threshold not met", code=6, category="suggestion-invalid"
            )


def _validate_findings_and_outcomes(review: dict[str, Any]) -> None:
    session_index = {row["id"]: row for row in review["sessions"]}
    for finding in review["findings"]:
        row = _require_dict(finding, "findings[]")
        required = {
            "id",
            "verdict",
            "session_id",
            "platform",
            "evidence",
            "step_deviation",
            "user_correction",
            "gap",
            "suggestion",
        }
        if set(row) != required or not re.fullmatch(r"SSR-[0-9]{2,}", str(row.get("id", ""))):
            raise ContractError("finding fields invalid", code=6, category="finding-invalid")
        if row.get("verdict") not in {"UPDATE SKILL", "COMPLIANCE GAP", "ONE-OFF", "INCONCLUSIVE"}:
            raise ContractError("finding verdict invalid", code=6, category="finding-invalid")
        session_id = _require_bounded_text(
            row.get("session_id"), "findings[].session_id", max_length=256
        )
        if session_id not in session_index or row.get("platform") != session_index[session_id]["platform"]:
            raise ContractError("finding session invalid", code=6, category="finding-invalid")
        _require_bounded_text(
            row.get("evidence"), "findings[].evidence", max_length=200
        )
        for field in ("step_deviation", "user_correction", "gap", "suggestion"):
            _require_bounded_text(
                row.get(field),
                f"findings[].{field}",
                max_length=2000,
                allow_empty=True,
            )

    for suggestion in review["suggestions"]:
        row = _require_dict(suggestion, "suggestions[]")
        if set(row) != {"finding_ids", "clause", "why_filed"}:
            raise ContractError("suggestion fields invalid", code=6, category="suggestion-invalid")
        ids = _require_list(row.get("finding_ids"), "suggestions[].finding_ids")
        if not ids or len(ids) != len(set(ids)) or any(not isinstance(item, str) for item in ids):
            raise ContractError("suggestion ids invalid", code=6, category="suggestion-invalid")
        _require_bounded_text(row.get("clause"), "suggestions[].clause", max_length=2000)
        _require_bounded_text(
            row.get("why_filed"), "suggestions[].why_filed", max_length=2000
        )

    for item in review["not_filed"]:
        row = _require_dict(item, "not_filed[]")
        if set(row) != {"finding_id", "why_not"}:
            raise ContractError("not_filed fields invalid", code=6, category="finding-partition-invalid")
        _require_bounded_text(
            row.get("finding_id"), "not_filed[].finding_id", max_length=64
        )
        _require_bounded_text(row.get("why_not"), "not_filed[].why_not", max_length=2000)


def validate_schema(review: Any, expected_name: str) -> dict[str, Any]:
    """Validate a complete review and return its canonical derived view."""

    review_obj = _require_dict(review, "review")
    scan_secrets(review_obj)
    required = {
        "schema_version",
        "language",
        "skill_name",
        "skill_path",
        "scope",
        "generated_at",
        "coverage",
        "sessions",
        "aggregate",
        "findings",
        "suggestions",
        "not_filed",
        "unverified",
        "reliable",
    }
    if set(review_obj) != required:
        raise ContractError("review fields invalid", code=6, category="schema-invalid")
    if review_obj.get("schema_version") != 1 or not _is_int(review_obj.get("schema_version")):
        raise ContractError("schema version invalid", code=6, category="schema-invalid")
    validate_name(expected_name)
    if review_obj.get("skill_name") != expected_name:
        raise ContractError("payload name mismatch", code=6, category="payload-name-mismatch")
    if review_obj.get("language") not in {"zh", "en"} or review_obj.get("scope") not in {
        "global",
        "cwd",
    }:
        raise ContractError("review enum invalid", code=6, category="schema-invalid")
    _require_bounded_text(review_obj.get("skill_name"), "skill_name", max_length=128)
    _require_bounded_text(
        review_obj.get("skill_path"), "skill_path", max_length=4096, allow_empty=True
    )
    _require_bounded_text(review_obj.get("generated_at"), "generated_at", max_length=128)

    sessions = _require_list(review_obj.get("sessions"), "sessions")
    seen_ids: set[str] = set()
    actual_counts = {platform: {status: 0 for status in STATUSES} for platform in PLATFORMS}
    for session in sessions:
        row = _require_dict(session, "sessions[]")
        required_session = {"id", "platform", "status", "signal"}
        status = row.get("status")
        if status == "invoked":
            required_session.add("scores")
        if set(row) != required_session:
            raise ContractError("session fields invalid", code=6, category="schema-invalid")
        session_id = _require_bounded_text(row.get("id"), "sessions[].id", max_length=256)
        if session_id in seen_ids:
            raise ContractError("duplicate session id", code=6, category="schema-invalid")
        seen_ids.add(session_id)
        platform = row.get("platform")
        if platform not in PLATFORMS or status not in STATUSES:
            raise ContractError("session enum invalid", code=6, category="schema-invalid")
        _require_bounded_text(
            row.get("signal"), "sessions[].signal", max_length=500, allow_empty=True
        )
        actual_counts[platform][status] += 1

    coverage = _require_dict(review_obj.get("coverage"), "coverage")
    _coverage_counts(review_obj)
    for platform in PLATFORMS:
        for status in STATUSES:
            if coverage[platform][status] != actual_counts[platform][status]:
                raise ContractError("coverage/session count mismatch", code=6, category="coverage-invalid")

    canonical = recompute_aggregate(review_obj)
    _compare_declared_aggregate(review_obj.get("aggregate"), canonical)

    _require_list(review_obj.get("findings"), "findings")
    _require_list(review_obj.get("suggestions"), "suggestions")
    _require_list(review_obj.get("not_filed"), "not_filed")
    _validate_findings_and_outcomes(review_obj)
    validate_finding_partition(review_obj)
    validate_suggestions(review_obj, canonical)

    for field in ("unverified", "reliable"):
        values = _require_list(review_obj.get(field), field)
        for value in values:
            _require_bounded_text(value, f"{field}[]", max_length=2000)

    derived = copy.deepcopy(review_obj)
    for session in derived["sessions"]:
        if session["status"] != "invoked":
            continue
        for dimension, mapping in SCORE_MAPS.items():
            label = session["scores"][dimension]["label"]
            session["scores"][dimension]["score"] = mapping[label]
    derived["aggregate"] = canonical
    derived["_derived"] = {
        "execution_efficiency_curve": canonical["execution_efficiency_curve"],
        "instruction_fit_curve": canonical["instruction_fit_curve"],
        "total_invoked": canonical["invocation_counts"]["invoked"],
        "total_loaded": canonical["invocation_counts"]["loaded"],
        "total_available": canonical["invocation_counts"]["available"],
        "invocation_ratio": canonical["invocation_ratio"],
    }
    derived["_canonical"] = True
    return derived


def validate_review(review: Any, expected_name: str) -> dict[str, Any]:
    """Public alias used by input managers and report writers."""

    return validate_schema(review, expected_name)


def text_entrypoint() -> str:
    """Exercise Decimal and Unicode text in the no-UTF8-environment smoke."""

    return f"量化 {format_decimal(quantize6(Decimal('0.8')))} · emoji ✅"


def is_reparse(path: Path) -> bool:
    """Return whether an existing path is a symlink/junction/reparse point."""

    try:
        info = path.lstat()
    except OSError:
        return False
    return stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, "st_file_attributes", 0) & FILE_ATTRIBUTE_REPARSE_POINT
    )


def refuse_existing_reparse(path: Path, label: str, code: int = 2) -> None:
    if path.exists() or path.is_symlink():
        if is_reparse(path):
            raise ContractError(f"{label} is reparse point", code=code, category="unsafe-path")


def resolve_repo_root(repo_root_arg: str) -> Path:
    literal = Path(repo_root_arg).expanduser()
    if not literal.is_absolute():
        raise ContractError("repo root must be absolute", code=2, category="invalid-root")
    refuse_existing_reparse(literal, "repo root")
    try:
        resolved = literal.resolve(strict=True)
    except OSError as exc:
        raise ContractError("repo root not found", code=2, category="invalid-root") from exc
    if not resolved.is_dir() or is_reparse(resolved):
        raise ContractError("repo root invalid", code=2, category="invalid-root")
    # Keep the caller-visible absolute path. Path.resolve() rewrites OS aliases
    # above the root (macOS /var -> /private/var, Windows 8.3 names) and would
    # desynchronize derived paths from --repo-root / --review-json. Reparse
    # walks still inspect these raw components; resolve() only proves existence.
    return Path(os.path.abspath(literal))


def validate_name(name: str) -> str:
    if not isinstance(name, str) or not NAME_RE.fullmatch(name):
        raise ContractError("unsafe report basename", code=2, category="invalid-name")
    return name


def derive_input_path(root: Path, name: str) -> Path:
    validate_name(name)
    return root / REPORT_SUBTREE / ".input" / f"{name}.json"


def derive_report_path(root: Path, name: str, format_name: str) -> Path:
    validate_name(name)
    if format_name not in REGISTERED_FORMATS:
        raise ContractError("unregistered format", code=2, category="invalid-format")
    return root / REPORT_SUBTREE / f"{name}{REGISTERED_FORMATS[format_name]}"


def validate_fixed_path(root: Path, path: Path, expected: Path, label: str) -> Path:
    """Require a supplied literal path to equal one unique derived path."""

    supplied = path.expanduser()
    if not supplied.is_absolute():
        supplied = root / supplied
    if os.path.normcase(os.path.abspath(supplied)) != os.path.normcase(os.path.abspath(expected)):
        raise ContractError(f"{label} does not match derived path", code=2, category="invalid-path")
    current = root
    for part in expected.relative_to(root).parts:
        current = current / part
        refuse_existing_reparse(current, label)
    return expected


def _ensure_parent_directories(parent: Path) -> None:
    missing: list[Path] = []
    cursor = parent
    while not cursor.exists():
        if cursor.is_symlink():
            raise ContractError("parent is reparse point", code=2, category="unsafe-path")
        missing.append(cursor)
        if cursor.parent == cursor:
            raise ContractError("no existing parent", code=1, category="io-failure")
        cursor = cursor.parent
    refuse_existing_reparse(cursor, "parent")
    if not cursor.is_dir():
        raise ContractError("parent is not directory", code=2, category="unsafe-path")
    for directory in reversed(missing):
        try:
            directory.mkdir()
        except FileExistsError:
            pass
        except OSError as exc:
            raise ContractError("parent creation failed", code=1, category="io-failure") from exc
        refuse_existing_reparse(directory, "created parent")
        if not directory.is_dir():
            raise ContractError("created parent invalid", code=2, category="unsafe-path")


def ensure_fixed_ancestors(root: Path, destination: Path) -> None:
    """Create only missing ancestors beneath *root*, rejecting reparse paths."""

    try:
        destination.relative_to(root)
    except ValueError as exc:
        raise ContractError("destination escapes root", code=2, category="invalid-path") from exc
    current = root
    for part in destination.parent.relative_to(root).parts:
        current = current / part
        if current.exists() or current.is_symlink():
            refuse_existing_reparse(current, "destination ancestor")
            if not current.is_dir():
                raise ContractError("ancestor is not directory", code=2, category="unsafe-path")
    _ensure_parent_directories(destination.parent)


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _identity(info: os.stat_result) -> tuple[int, int, int, int]:
    """Return the strongest portable file-object identity exposed by Python."""

    return (
        int(getattr(info, "st_dev", 0)),
        int(getattr(info, "st_ino", 0)),
        stat.S_IFMT(info.st_mode),
        0,
    )


def _open_flags(access: int) -> int:
    flags = access
    if hasattr(os, "O_BINARY"):
        flags |= os.O_BINARY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    return flags


def _read_descriptor(descriptor: int) -> bytes:
    os.lseek(descriptor, 0, os.SEEK_SET)
    chunks: list[bytes] = []
    while True:
        chunk = os.read(descriptor, 1024 * 1024)
        if not chunk:
            return b"".join(chunks)
        chunks.append(chunk)


def _read_regular_snapshot(
    path: Path, label: str, code: int = 2
) -> tuple[bytes, tuple[int, int, int, int]]:
    """Read a regular file through a no-follow descriptor and bind path identity."""

    refuse_existing_reparse(path, label, code=code)
    try:
        before = path.lstat()
    except OSError as exc:
        raise ContractError(f"{label} missing", code=code, category="invalid-path") from exc
    if not stat.S_ISREG(before.st_mode):
        raise ContractError(f"{label} is not regular file", code=code, category="invalid-path")
    descriptor: int | None = None
    try:
        descriptor = os.open(path, _open_flags(os.O_RDONLY))
        opened = os.fstat(descriptor)
        if not stat.S_ISREG(opened.st_mode) or _identity(opened) != _identity(before):
            raise ContractError(
                f"{label} identity changed", code=code, category="path-identity-changed"
            )
        data = _read_descriptor(descriptor)
        after_fd = os.fstat(descriptor)
        after_path = path.lstat()
        identity = _identity(opened)
        if _identity(after_fd) != identity or _identity(after_path) != identity:
            raise ContractError(
                f"{label} identity changed", code=code, category="path-identity-changed"
            )
        return data, identity
    except ContractError:
        raise
    except OSError as exc:
        raise ContractError(f"{label} read failed", code=1, category="io-failure") from exc
    finally:
        if descriptor is not None:
            os.close(descriptor)


def read_regular_bytes(path: Path, label: str, code: int = 2) -> bytes:
    return _read_regular_snapshot(path, label, code=code)[0]


def _path_has_identity(path: Path, identity: tuple[int, int, int, int]) -> bool:
    try:
        info = path.lstat()
    except OSError:
        return False
    return stat.S_ISREG(info.st_mode) and not is_reparse(path) and _identity(info) == identity


def _unlink_owned(path: Path, identity: tuple[int, int, int, int] | None) -> bool:
    """Delete only a path still naming the regular file created by this call."""

    if identity is None or not _path_has_identity(path, identity):
        return False
    try:
        path.unlink()
    except OSError:
        return False
    return not path.exists() and not path.is_symlink()


def _write_owned_sibling(
    path: Path, data: bytes, *, category: str
) -> tuple[int, tuple[int, int, int, int]]:
    """Exclusively write one sibling and return its still-open descriptor."""

    if path.exists() or path.is_symlink():
        raise ContractError("owned sibling exists", code=5, category=category)
    descriptor: int | None = None
    created_identity: tuple[int, int, int, int] | None = None
    success = False
    flags = _open_flags(os.O_RDWR | os.O_CREAT | os.O_EXCL)
    try:
        descriptor = os.open(path, flags, 0o600)
        opened = os.fstat(descriptor)
        created_identity = _identity(opened)
        if not stat.S_ISREG(opened.st_mode):
            raise ContractError("owned sibling is not regular", code=5, category=category)
        view = memoryview(data)
        written = 0
        while written < len(view):
            written += os.write(descriptor, view[written:])
        os.fsync(descriptor)
        if _read_descriptor(descriptor) != data:
            raise ContractError("owned sibling verification failed", code=1, category=category)
        identity = _identity(os.fstat(descriptor))
        path_info = path.lstat()
        if _identity(path_info) != identity or is_reparse(path):
            raise ContractError("owned sibling identity changed", code=5, category=category)
        success = True
        return descriptor, identity
    except ContractError:
        raise
    except FileExistsError as exc:
        raise ContractError("owned sibling exists", code=5, category=category) from exc
    except OSError as exc:
        raise ContractError("owned sibling write failed", code=1, category=category) from exc
    finally:
        if descriptor is not None and not success:
            os.close(descriptor)
        if not success:
            _unlink_owned(path, created_identity)


def _verify_open_owned(
    descriptor: int,
    path: Path,
    identity: tuple[int, int, int, int],
    *,
    expected: bytes | None,
    code: int,
    category: str,
) -> None:
    """Bind an open descriptor to its current directory entry and bytes."""

    try:
        descriptor_info = os.fstat(descriptor)
        path_info = path.lstat()
    except OSError as exc:
        raise ContractError("owned path unavailable", code=code, category=category) from exc
    if (
        not stat.S_ISREG(descriptor_info.st_mode)
        or is_reparse(path)
        or _identity(descriptor_info) != identity
        or _identity(path_info) != identity
    ):
        raise ContractError("owned path identity changed", code=code, category=category)
    if expected is not None and _read_descriptor(descriptor) != expected:
        raise ContractError("owned path bytes changed", code=code, category=category)


def _lease_path(destination: Path) -> Path:
    """Return the predictable cooperative lease name for one destination."""

    normalized = os.path.normcase(os.path.abspath(destination))
    key = hashlib.sha256(os.fsencode(normalized)).hexdigest()
    return Path(tempfile.gettempdir()) / f".skill-session-review-{key}.lease"


def _acquire_advisory_lease(
    path: Path,
) -> tuple[int, tuple[int, int, int, int]]:
    """Acquire a non-blocking OS lock whose ownership dies with the process.

    The regular lock file is a stable inode only. It is reusable after normal
    exit, crash, or forced termination and need not be unlinked for correctness.
    """

    refuse_existing_reparse(path, "lease", code=5)
    flags = _open_flags(os.O_RDWR | os.O_CREAT)
    descriptor: int | None = None
    success = False
    try:
        descriptor = os.open(path, flags, 0o600)
        opened = os.fstat(descriptor)
        if not stat.S_ISREG(opened.st_mode):
            raise ContractError("lease is not regular", code=5, category="lease-invalid")
        identity = _identity(opened)
        path_info = path.lstat()
        if is_reparse(path) or _identity(path_info) != identity:
            raise ContractError("lease identity changed", code=5, category="lease-invalid")

        if os.name == "nt":
            if opened.st_size == 0:
                os.write(descriptor, b"\0")
                os.fsync(descriptor)
            os.lseek(descriptor, 0, os.SEEK_SET)
            try:
                msvcrt.locking(descriptor, msvcrt.LK_NBLCK, 1)
            except OSError as exc:
                raise ContractError("lease busy", code=5, category="lease-busy") from exc
        else:
            try:
                fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except (BlockingIOError, OSError) as exc:
                raise ContractError("lease busy", code=5, category="lease-busy") from exc
        _verify_open_owned(
            descriptor,
            path,
            identity,
            expected=None,
            code=5,
            category="lease-lost",
        )
        success = True
        return descriptor, identity
    except ContractError:
        raise
    except OSError as exc:
        raise ContractError("lease unavailable", code=5, category="lease-invalid") from exc
    finally:
        if descriptor is not None and not success:
            # Descriptor close is also the crash-safe unlock operation.
            os.close(descriptor)


def _release_advisory_lease(descriptor: int | None) -> None:
    """Release a lease; close remains the authoritative crash-safe release."""

    if descriptor is None:
        return
    try:
        if os.name == "nt":
            os.lseek(descriptor, 0, os.SEEK_SET)
            msvcrt.locking(descriptor, msvcrt.LK_UNLCK, 1)
        else:
            fcntl.flock(descriptor, fcntl.LOCK_UN)
    except OSError:
        # Closing releases the OS lock even when explicit unlock reports an
        # error. A residual regular file is safe and reusable.
        pass
    finally:
        os.close(descriptor)


def _run_git(root: Path, args: list[str]) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            ["git", "-C", str(root), *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=False,
            check=False,
        )
    except OSError as exc:
        raise ContractError("git probe failed", code=1, category="git-probe-failed") from exc


def _is_git_repository(root: Path) -> bool:
    result = _run_git(root, ["rev-parse", "--is-inside-work-tree"])
    return result.returncode == 0 and (result.stdout or "").strip() == "true"


def git_visibility(root: Path, path: Path) -> str:
    """Return ignored/tracked/untracked/non-repo without mutating Git state."""

    if not _is_git_repository(root):
        return "non-repo"
    relative = path.relative_to(root).as_posix()
    tracked = _run_git(root, ["ls-files", "--error-unmatch", "--", relative])
    if tracked.returncode == 0:
        return "tracked"
    ignored = _run_git(root, ["check-ignore", "-q", "--", relative])
    return "ignored" if ignored.returncode == 0 else "untracked"


def check_report_subtree_git(root: Path, probe_path: Path) -> str:
    """Require the fixed report subtree to be effectively ignored in Git repos."""

    visibility = git_visibility(root, probe_path)
    if visibility != "non-repo" and visibility != "ignored":
        raise ContractError("report subtree is not ignored", code=8, category="ignore-not-effective")
    return visibility


def governed_remove(
    dest: Path,
    *,
    expected_sha256: str,
    artifact_proofs: list[tuple[str, Path, str]],
    proof_validator: Callable[[bytes], None],
    inject_swap_env: str | None = "SSR_TEST_LATE_SWAP_INPUT_WITH",
) -> dict[str, Any]:
    """Remove one proved destination inside the cooperative-helper boundary.

    The input, Markdown, and HTML leases serialize this operation with
    :func:`governed_write`. All proved bytes and file identities are checked
    twice while every lease is held. The input is then atomically quarantined,
    verified by identity, and deleted only from its invocation-owned name. If
    a replacement wins the final path exchange, that object is restored and
    the removal fails closed.

    As with :func:`governed_write`, this does not claim protection against a
    same-user process that ignores advisory locking and continuously mutates
    directory entries or file contents.
    """

    if not SHA256_RE.fullmatch(expected_sha256):
        raise ContractError("removal hash invalid", code=8, category="input-proof-invalid")
    if tuple(format_name for format_name, _, _ in artifact_proofs) != (
        "markdown",
        "html",
    ):
        raise ContractError(
            "artifact proof order is invalid", code=8, category="artifact-proof-invalid"
        )
    for _, _, digest in artifact_proofs:
        if not SHA256_RE.fullmatch(digest):
            raise ContractError(
                "artifact proof is invalid", code=8, category="artifact-proof-invalid"
            )

    lease_targets = [dest, *(path for _, path, _ in artifact_proofs)]
    leases: list[tuple[Path, int, tuple[int, int, int, int]]] = []
    quarantine = dest.with_name(f".{dest.name}.{uuid.uuid4().hex}.remove")
    quarantine_identity: tuple[int, int, int, int] | None = None

    def read_artifacts() -> list[tuple[bytes, tuple[int, int, int, int]]]:
        snapshots: list[tuple[bytes, tuple[int, int, int, int]]] = []
        for format_name, path, digest in artifact_proofs:
            raw, identity = _read_regular_snapshot(
                path, f"{format_name} artifact", code=8
            )
            if sha256_hex(raw) != digest:
                raise ContractError(
                    "artifact proof is stale", 8, "artifact-proof-stale"
                )
            snapshots.append((raw, identity))
        return snapshots

    try:
        # The order is contractual: input, Markdown, then HTML. If a later
        # acquisition fails, the finally block releases the already-held prefix.
        for target in lease_targets:
            lease = _lease_path(target)
            descriptor, identity = _acquire_advisory_lease(lease)
            leases.append((lease, descriptor, identity))

        proved_bytes, proved_identity = _read_regular_snapshot(
            dest, "review input", code=2
        )
        if sha256_hex(proved_bytes) != expected_sha256:
            raise ContractError("input proof is stale", 8, "input-proof-stale")
        proof_validator(proved_bytes)
        proved_artifacts = read_artifacts()

        current_bytes, current_identity = _read_regular_snapshot(
            dest, "review input", code=2
        )
        if (
            current_bytes != proved_bytes
            or current_identity != proved_identity
            or sha256_hex(current_bytes) != expected_sha256
        ):
            raise ContractError("input proof is stale", 8, "input-proof-stale")
        proof_validator(current_bytes)
        current_artifacts = read_artifacts()
        if current_artifacts != proved_artifacts:
            raise ContractError("artifact proof is stale", 8, "artifact-proof-stale")

        for format_name, path, _ in artifact_proofs:
            swap_source = os.environ.get(
                f"SSR_TEST_LATE_SWAP_{format_name.upper()}_WITH"
            )
            if swap_source:
                try:
                    os.replace(Path(swap_source), path)
                except OSError as exc:
                    raise ContractError(
                        "late artifact exchange blocked", 1, "input-remove-failed"
                    ) from exc

        for lease, descriptor, identity in leases:
            _verify_open_owned(
                descriptor,
                lease,
                identity,
                expected=None,
                code=5,
                category="lease-lost",
            )
        if not _path_has_identity(dest, proved_identity):
            raise ContractError("input proof is stale", 8, "input-proof-stale")
        for (_, path, _), (_, identity) in zip(
            artifact_proofs, proved_artifacts, strict=True
        ):
            if not _path_has_identity(path, identity):
                raise ContractError(
                    "artifact proof is stale", 8, "artifact-proof-stale"
                )

        swap_source = os.environ.get(inject_swap_env) if inject_swap_env else None
        if swap_source:
            try:
                os.replace(Path(swap_source), dest)
            except OSError as exc:
                raise ContractError(
                    "late destination exchange blocked", 1, "input-remove-failed"
                ) from exc

        try:
            os.rename(dest, quarantine)
        except OSError as exc:
            raise ContractError("input quarantine failed", 1, "input-remove-failed") from exc
        quarantined_bytes, quarantine_identity = _read_regular_snapshot(
            quarantine, "quarantined input", code=1
        )
        if (
            quarantine_identity != proved_identity
            or quarantined_bytes != proved_bytes
            or sha256_hex(quarantined_bytes) != expected_sha256
        ):
            replacement_identity = quarantine_identity
            # This object did not satisfy the proof. Never let generic cleanup
            # delete it if restoration itself encounters another race.
            quarantine_identity = None
            if dest.exists() or dest.is_symlink():
                raise ContractError(
                    "input replacement could not be restored", 1, "input-remove-failed"
                )
            try:
                os.link(quarantine, dest, follow_symlinks=False)
            except (AttributeError, NotImplementedError, OSError):
                try:
                    os.rename(quarantine, dest)
                except OSError as exc:
                    raise ContractError(
                        "input replacement could not be restored",
                        1,
                        "input-remove-failed",
                    ) from exc
            else:
                if not _unlink_owned(quarantine, replacement_identity):
                    raise ContractError(
                        "input replacement cleanup failed", 1, "input-remove-failed"
                    )
            if not _path_has_identity(dest, replacement_identity):
                raise ContractError(
                    "input replacement restoration failed", 1, "input-remove-failed"
                )
            raise ContractError("input proof is stale", 8, "input-proof-stale")

        if not _unlink_owned(quarantine, quarantine_identity):
            raise ContractError("input removal failed", 1, "input-remove-failed")
        quarantine_identity = None
        if (
            dest.exists()
            or dest.is_symlink()
            or quarantine.exists()
            or quarantine.is_symlink()
        ):
            raise ContractError(
                "input removal could not be verified", 1, "input-remove-failed"
            )
        return {"mode": "remove", "sha256": expected_sha256, "removed": True}
    finally:
        _unlink_owned(quarantine, quarantine_identity)
        for _, descriptor, _ in reversed(leases):
            _release_advisory_lease(descriptor)


def governed_write(
    dest: Path,
    data: bytes,
    *,
    replace: bool = False,
    expected_sha256: str | None = None,
    inject_failure_env: str | None = "SSR_INJECT_FINALIZE_FAILURE",
) -> dict[str, Any]:
    """Persist one payload inside the cooperative-helper threat boundary.

    A destination-specific OS advisory lock serializes cooperating helper
    invocations.  Invocation-owned temp and rollback names contain a random
    UUID, so predictable residue cannot be mistaken for this invocation's
    state.  Open descriptors remain bound to their directory entries until an
    identity check immediately before finalization.  Replacement keeps an
    owned rollback copy until the new destination passes read-back validation.

    The lock is released by the OS when its descriptor closes or its owner dies;
    the reusable regular lock file may safely remain. This prevents concurrent
    cooperative-helper races and pre-positioned predictable temp entries. It
    intentionally does not claim protection against another same-user process
    that ignores advisory locking and continuously mutates directory entries.
    """

    if not isinstance(data, bytes):
        raise ContractError("payload must be bytes", code=1, category="io-failure")
    old_data: bytes | None = None
    if replace:
        if not expected_sha256 or not SHA256_RE.fullmatch(expected_sha256):
            raise ContractError("replacement hash invalid", code=4, category="stale-hash")
        old_data = read_regular_bytes(dest, "destination", code=4)
        if sha256_hex(old_data) != expected_sha256:
            raise ContractError("replacement hash stale", code=4, category="stale-hash")
        mode = "replace"
    else:
        if expected_sha256 is not None:
            raise ContractError("unexpected replacement hash", code=2, category="invalid-arguments")
        if dest.exists() or dest.is_symlink():
            refuse_existing_reparse(dest, "destination")
            raise ContractError("destination exists", code=3, category="destination-exists")
        mode = "create"

    invocation = uuid.uuid4().hex
    temp = dest.with_name(f".{dest.name}.{invocation}.tmp")
    rollback = dest.with_name(f".{dest.name}.{invocation}.rollback")
    lease = _lease_path(dest)
    lease_descriptor: int | None = None
    lease_identity: tuple[int, int, int, int] | None = None
    temp_descriptor: int | None = None
    temp_identity: tuple[int, int, int, int] | None = None
    rollback_descriptor: int | None = None
    rollback_identity: tuple[int, int, int, int] | None = None
    finalized = False
    restored = False
    try:
        # This is deliberately the first mutation after all caller/preflight
        # validation. Lock ownership is held by the OS descriptor, not by the
        # lifetime of the safely reusable sentinel inode.
        lease_descriptor, lease_identity = _acquire_advisory_lease(lease)

        boundary = dest.parent
        cursor = dest.parent
        while cursor.parent != cursor:
            if cursor.name == "skill-session-review" and cursor.parent.name == "reports":
                boundary = cursor.parent.parent
                break
            cursor = cursor.parent
        ensure_fixed_ancestors(boundary, dest)
        refuse_existing_reparse(dest.parent, "destination parent")
        refuse_existing_reparse(dest, "destination")

        temp_descriptor, temp_identity = _write_owned_sibling(
            temp, data, category="temporary-invalid"
        )
        _verify_open_owned(
            temp_descriptor,
            temp,
            temp_identity,
            expected=data,
            code=5,
            category="temporary-identity-changed",
        )

        if replace:
            assert old_data is not None
            current, _ = _read_regular_snapshot(dest, "destination", code=4)
            if sha256_hex(current) != expected_sha256 or current != old_data:
                raise ContractError("replacement hash stale", code=4, category="stale-hash")
            rollback_descriptor, rollback_identity = _write_owned_sibling(
                rollback, old_data, category="rollback-invalid"
            )
            _verify_open_owned(
                rollback_descriptor,
                rollback,
                rollback_identity,
                expected=old_data,
                code=1,
                category="rollback-invalid",
            )
            current, _ = _read_regular_snapshot(dest, "destination", code=4)
            if sha256_hex(current) != expected_sha256 or current != old_data:
                raise ContractError("replacement hash stale", code=4, category="stale-hash")
        elif dest.exists() or dest.is_symlink():
            raise ContractError("destination appeared", code=3, category="destination-exists")

        # This was the former final identity check.  The late-swap seam is
        # intentionally after it; the new check below is adjacent to rename.
        _verify_open_owned(
            temp_descriptor,
            temp,
            temp_identity,
            expected=data,
            code=5,
            category="temporary-identity-changed",
        )
        swap_source = os.environ.get("SSR_TEST_LATE_SWAP_TEMP_WITH") or os.environ.get(
            "SSR_TEST_SWAP_TEMP_WITH"
        )
        if swap_source:
            try:
                os.replace(Path(swap_source), temp)
            except OSError as exc:
                raise ContractError(
                    "late temp exchange blocked",
                    code=5,
                    category="temporary-exchange-blocked",
                ) from exc

        _verify_open_owned(
            temp_descriptor,
            temp,
            temp_identity,
            expected=data,
            code=5,
            category="temporary-identity-changed",
        )
        _verify_open_owned(
            lease_descriptor,
            lease,
            lease_identity,
            expected=None,
            code=5,
            category="lease-lost",
        )
        if inject_failure_env and os.environ.get(inject_failure_env) == "1":
            raise OSError("injected finalization failure")

        # Windows may not rename an open CRT file.  Close only after the final
        # descriptor/path identity check and immediately before finalization.
        os.close(temp_descriptor)
        temp_descriptor = None
        if replace:
            os.replace(temp, dest)
            finalized = True
        else:
            try:
                os.link(temp, dest, follow_symlinks=False)
            except (AttributeError, NotImplementedError):
                os.rename(temp, dest)
                finalized = True
            else:
                finalized = True
                if not _unlink_owned(temp, temp_identity):
                    raise ContractError(
                        "temporary cleanup failed", code=1, category="temporary-cleanup-failed"
                    )

        if not _path_has_identity(dest, temp_identity):
            raise ContractError(
                "destination identity changed", code=1, category="destination-identity-changed"
            )

        if os.environ.get("SSR_INJECT_READBACK_MISMATCH") == "1":
            descriptor = os.open(dest, _open_flags(os.O_WRONLY | os.O_TRUNC))
            try:
                os.write(descriptor, b"injected-readback-mismatch")
                os.fsync(descriptor)
            finally:
                os.close(descriptor)

        read_back, readback_identity = _read_regular_snapshot(dest, "destination")
        if (
            readback_identity != temp_identity
            or read_back != data
            or sha256_hex(read_back) != sha256_hex(data)
        ):
            raise ContractError("read-back verification failed", code=1, category="readback-failed")
        if replace and not _unlink_owned(rollback, rollback_identity):
            if rollback_descriptor is not None:
                os.close(rollback_descriptor)
                rollback_descriptor = None
            if not _unlink_owned(rollback, rollback_identity):
                raise ContractError(
                    "rollback cleanup failed", code=1, category="rollback-cleanup-failed"
                )
        elif replace and rollback_descriptor is not None:
            os.close(rollback_descriptor)
            rollback_descriptor = None
        if replace and rollback.exists():
            raise ContractError(
                "rollback cleanup failed", code=1, category="rollback-cleanup-failed"
            )
        rollback_identity = None
    except ContractError:
        if finalized:
            if replace:
                # Never overwrite an unrelated path.  When the destination
                # still names our finalized object, atomically restore the
                # authorized old bytes from the owned rollback sibling.
                if _path_has_identity(dest, temp_identity) and _path_has_identity(
                    rollback, rollback_identity
                ):
                    try:
                        if rollback_descriptor is not None:
                            os.close(rollback_descriptor)
                            rollback_descriptor = None
                        os.replace(rollback, dest)
                        restored = True
                        rollback_identity = None
                        assert old_data is not None
                        restored_bytes, restored_identity = _read_regular_snapshot(
                            dest, "restored destination", code=1
                        )
                        if restored_bytes != old_data:
                            raise ContractError(
                                "rollback verification failed",
                                code=1,
                                category="rollback-failed",
                            )
                        del restored_identity
                    except ContractError:
                        raise
                    except OSError as exc:
                        raise ContractError(
                            "rollback failed", code=1, category="rollback-failed"
                        ) from exc
            elif _path_has_identity(dest, temp_identity):
                _unlink_owned(dest, temp_identity)
        raise
    except FileExistsError as exc:
        raise ContractError("temporary or destination exists", code=5, category="temporary-exists") from exc
    except OSError as exc:
        if finalized:
            if replace and _path_has_identity(dest, temp_identity) and _path_has_identity(
                rollback, rollback_identity
            ):
                try:
                    if rollback_descriptor is not None:
                        os.close(rollback_descriptor)
                        rollback_descriptor = None
                    os.replace(rollback, dest)
                    restored = True
                    rollback_identity = None
                except OSError:
                    pass
            elif not replace and _path_has_identity(dest, temp_identity):
                _unlink_owned(dest, temp_identity)
        raise ContractError("finalization failed", code=1, category="finalization-failed") from exc
    finally:
        if temp_descriptor is not None:
            os.close(temp_descriptor)
        if rollback_descriptor is not None:
            os.close(rollback_descriptor)
        _unlink_owned(temp, temp_identity)
        if rollback_identity is not None and not restored:
            _unlink_owned(rollback, rollback_identity)
        _release_advisory_lease(lease_descriptor)
    return {"mode": mode, "bytes": len(data), "sha256": sha256_hex(data)}
