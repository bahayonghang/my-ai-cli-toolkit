#!/usr/bin/env python3
"""Deterministic BibTeX inventory and review/ledger structural audit."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence


SCHEMA_VERSION = "1.0"
KEY_PATTERN = re.compile(r"^[^\s,{}()]+$")
NAME_PATTERN = re.compile(r"[A-Za-z][A-Za-z0-9_:\-]*")
PANDOC_BLOCK_PATTERN = re.compile(r"\[(?=[^\]\n]*@[A-Za-z0-9])[^\]\n]+\]")
PANDOC_KEY_PATTERN = re.compile(r"@([A-Za-z0-9][A-Za-z0-9_.:+/\-]*)")
LATEX_CITE_PATTERN = re.compile(
    r"\\(?:cite|citep|citet|autocite|parencite|textcite)\w*"
    r"\s*(?:\[[^\]]*\]\s*){0,2}\{([^{}]+)\}"
)
ALLOWED_IDENTITY = {"input_only", "metadata_verified", "metadata_conflict", "unresolved"}
ALLOWED_BASIS = {"metadata", "abstract", "full_text", "user_excerpt", "unavailable"}
ALLOWED_SUPPORT = {"supported", "partial", "conflicted", "gap", "unassessed"}
ALLOWED_CLAIM_KINDS = {
    "bibliographic",
    "descriptive",
    "quantitative",
    "causal",
    "quotation",
    "synthesis",
}
BUILTIN_MACROS = {
    "jan": "January",
    "feb": "February",
    "mar": "March",
    "apr": "April",
    "may": "May",
    "jun": "June",
    "jul": "July",
    "aug": "August",
    "sep": "September",
    "oct": "October",
    "nov": "November",
    "dec": "December",
}
REQUIRED_FIELDS = {
    "article": (("title",), ("author",), ("year",)),
    "book": (("title",), ("author", "editor"), ("year",)),
    "inbook": (("title",), ("author", "editor"), ("year",)),
    "incollection": (("title",), ("author",), ("booktitle",), ("year",)),
    "inproceedings": (("title",), ("author",), ("booktitle",), ("year",)),
    "conference": (("title",), ("author",), ("booktitle",), ("year",)),
    "phdthesis": (("title",), ("author",), ("school",), ("year",)),
    "mastersthesis": (("title",), ("author",), ("school",), ("year",)),
    "techreport": (("title",), ("author",), ("institution",), ("year",)),
}


class BibParseError(ValueError):
    """Raised when conservative BibTeX parsing cannot preserve meaning."""

    def __init__(self, message: str, text: str, offset: int) -> None:
        line = text.count("\n", 0, offset) + 1
        last_newline = text.rfind("\n", 0, offset)
        column = offset - last_newline
        super().__init__(f"line {line}, column {column}: {message}")


@dataclass(frozen=True)
class BibEntry:
    entry_type: str
    citation_key: str
    fields: dict[str, str]
    source: str


@dataclass(frozen=True)
class CitationOccurrence:
    key: str
    start: int
    end: int
    syntax: str


def diagnostic(code: str, message: str, **details: Any) -> dict[str, Any]:
    item: dict[str, Any] = {"code": code, "message": message}
    item.update(details)
    return item


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(rendered)


def _skip_space_and_comments(text: str, offset: int) -> int:
    while offset < len(text):
        if text[offset].isspace():
            offset += 1
            continue
        if text[offset] == "%":
            newline = text.find("\n", offset)
            return len(text) if newline < 0 else _skip_space_and_comments(text, newline + 1)
        break
    return offset


def _read_delimited(text: str, offset: int) -> tuple[str, int]:
    opener = text[offset]
    if opener not in "{(":
        raise BibParseError("expected '{' or '('", text, offset)
    closer = "}" if opener == "{" else ")"
    depth = 1
    brace_depth = 0
    quoted = False
    escaped = False
    cursor = offset + 1
    while cursor < len(text):
        char = text[cursor]
        if escaped:
            escaped = False
            cursor += 1
            continue
        if char == "\\":
            escaped = True
            cursor += 1
            continue
        quote_is_delimiter = (opener == "{" and depth == 1) or (opener == "(" and brace_depth == 0)
        if char == '"' and quote_is_delimiter:
            quoted = not quoted
            cursor += 1
            continue
        if quoted:
            cursor += 1
            continue
        if opener == "{":
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return text[offset + 1 : cursor], cursor + 1
        else:
            if char == "{":
                brace_depth += 1
            elif char == "}" and brace_depth:
                brace_depth -= 1
            elif brace_depth == 0 and char == "(":
                depth += 1
            elif brace_depth == 0 and char == closer:
                depth -= 1
                if depth == 0:
                    return text[offset + 1 : cursor], cursor + 1
        cursor += 1
    problem = "unterminated quoted string" if quoted else f"unterminated '{opener}' block"
    raise BibParseError(problem, text, offset)


def _split_entry_body(body: str, source_text: str, base_offset: int) -> tuple[str, str]:
    brace_depth = 0
    quoted = False
    escaped = False
    for index, char in enumerate(body):
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == '"' and brace_depth == 0:
            quoted = not quoted
            continue
        if quoted:
            continue
        if char == "{":
            brace_depth += 1
        elif char == "}":
            if brace_depth == 0:
                raise BibParseError("unexpected closing brace", source_text, base_offset + index)
            brace_depth -= 1
        elif char == "," and brace_depth == 0:
            return body[:index].strip(), body[index + 1 :]
    raise BibParseError("entry is missing the key/field comma", source_text, base_offset)


class ValueParser:
    def __init__(self, text: str, source_text: str, base_offset: int, macros: dict[str, str]) -> None:
        self.text = text
        self.source_text = source_text
        self.base_offset = base_offset
        self.macros = macros
        self.offset = 0

    def error(self, message: str, at: int | None = None) -> BibParseError:
        return BibParseError(message, self.source_text, self.base_offset + (self.offset if at is None else at))

    def skip(self) -> None:
        self.offset = _skip_space_and_comments(self.text, self.offset)

    def atom(self) -> str:
        self.skip()
        if self.offset >= len(self.text):
            raise self.error("expected a field value")
        char = self.text[self.offset]
        if char == "{":
            start = self.offset
            depth = 1
            escaped = False
            self.offset += 1
            while self.offset < len(self.text):
                current = self.text[self.offset]
                if escaped:
                    escaped = False
                elif current == "\\":
                    escaped = True
                elif current == "{":
                    depth += 1
                elif current == "}":
                    depth -= 1
                    if depth == 0:
                        value = self.text[start + 1 : self.offset]
                        self.offset += 1
                        return value
                self.offset += 1
            raise self.error("unterminated braced field value", start)
        if char == '"':
            start = self.offset
            escaped = False
            brace_depth = 0
            self.offset += 1
            while self.offset < len(self.text):
                current = self.text[self.offset]
                if escaped:
                    escaped = False
                elif current == "\\":
                    escaped = True
                elif current == "{":
                    brace_depth += 1
                elif current == "}" and brace_depth:
                    brace_depth -= 1
                elif current == '"' and brace_depth == 0:
                    value = self.text[start + 1 : self.offset]
                    self.offset += 1
                    return value
                self.offset += 1
            raise self.error("unterminated quoted field value", start)
        token_match = re.match(r"[A-Za-z][A-Za-z0-9_:\-]*|[+-]?\d+", self.text[self.offset :])
        if not token_match:
            raise self.error("unsupported bare field value")
        token = token_match.group(0)
        self.offset += len(token)
        if re.fullmatch(r"[+-]?\d+", token):
            return token
        macro = self.macros.get(token.lower())
        if macro is None:
            raise self.error(f"unknown string macro '{token}'", self.offset - len(token))
        return macro

    def expression(self) -> str:
        parts = [self.atom()]
        while True:
            self.skip()
            if self.offset >= len(self.text) or self.text[self.offset] != "#":
                return "".join(parts)
            self.offset += 1
            parts.append(self.atom())

    def fields(self) -> dict[str, str]:
        fields: dict[str, str] = {}
        while True:
            self.skip()
            while self.offset < len(self.text) and self.text[self.offset] == ",":
                self.offset += 1
                self.skip()
            if self.offset >= len(self.text):
                return fields
            name_match = NAME_PATTERN.match(self.text, self.offset)
            if not name_match:
                raise self.error("expected a field name")
            raw_name = name_match.group(0)
            name = raw_name.lower()
            self.offset = name_match.end()
            self.skip()
            if self.offset >= len(self.text) or self.text[self.offset] != "=":
                raise self.error(f"field '{raw_name}' is missing '='")
            self.offset += 1
            if name in fields:
                raise self.error(f"duplicate field '{raw_name}'")
            fields[name] = self.expression().strip()
            self.skip()
            if self.offset >= len(self.text):
                return fields
            if self.text[self.offset] != ",":
                raise self.error("expected ',' after field value")


def parse_bibtex(text: str, source: str) -> list[BibEntry]:
    text = text.removeprefix("\ufeff")
    macros = dict(BUILTIN_MACROS)
    entries: list[BibEntry] = []
    offset = 0
    while True:
        offset = _skip_space_and_comments(text, offset)
        if offset >= len(text):
            return entries
        if text[offset] != "@":
            raise BibParseError("unexpected text outside an entry", text, offset)
        type_match = NAME_PATTERN.match(text, offset + 1)
        if not type_match:
            raise BibParseError("expected an entry type after '@'", text, offset)
        entry_type = type_match.group(0).lower()
        cursor = _skip_space_and_comments(text, type_match.end())
        if cursor >= len(text) or text[cursor] not in "{(":
            raise BibParseError("entry type must be followed by '{' or '('", text, cursor)
        body, offset = _read_delimited(text, cursor)
        body_base = cursor + 1
        if entry_type == "comment":
            continue
        if entry_type == "preamble":
            parser = ValueParser(body, text, body_base, macros)
            parser.expression()
            parser.skip()
            if parser.offset != len(body):
                raise BibParseError("unexpected text after @preamble value", text, body_base + parser.offset)
            continue
        if entry_type == "string":
            definitions = ValueParser(body, text, body_base, macros).fields()
            if not definitions:
                raise BibParseError("@string contains no definitions", text, body_base)
            macros.update({name.lower(): value for name, value in definitions.items()})
            continue
        key, fields_text = _split_entry_body(body, text, body_base)
        if not key or not KEY_PATTERN.fullmatch(key):
            raise BibParseError(f"invalid citation key '{key}'", text, body_base)
        field_offset = body.find(",") + 1
        fields = ValueParser(fields_text, text, body_base + field_offset, macros).fields()
        entries.append(BibEntry(entry_type, key, fields, source))


def normalize_doi(value: str) -> str:
    normalized = value.strip().lower()
    normalized = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:\s*)", "", normalized)
    return normalized.rstrip(". ,;")


def missing_fields(entry: BibEntry) -> list[str]:
    groups = REQUIRED_FIELDS.get(entry.entry_type, (("title",),))
    missing: list[str] = []
    for alternatives in groups:
        if not any(entry.fields.get(name, "").strip() for name in alternatives):
            missing.append("/".join(alternatives))
    return missing


def inventory_sources(paths: Sequence[Path]) -> tuple[dict[str, Any], list[BibEntry]]:
    entries: list[BibEntry] = []
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []
    source_names = [str(path) for path in paths]
    for path in paths:
        try:
            text = path.read_text(encoding="utf-8")
            entries.extend(parse_bibtex(text, str(path)))
        except (OSError, UnicodeError, BibParseError) as exc:
            errors.append(diagnostic("bib_parse_error", str(exc), source=str(path)))

    if not entries and not errors:
        errors.append(
            diagnostic(
                "empty_bibliography",
                "the supplied BibTeX corpus contains no regular entries",
                sources=source_names,
            )
        )

    exact_keys: dict[str, BibEntry] = {}
    folded_keys: dict[str, BibEntry] = {}
    dois: dict[str, BibEntry] = {}
    entry_diagnostics: dict[tuple[str, str], list[dict[str, Any]]] = {}

    def add_entry_diagnostic(entry: BibEntry, item: dict[str, Any]) -> None:
        entry_diagnostics.setdefault((entry.source, entry.citation_key), []).append(item)

    for entry in entries:
        existing = exact_keys.get(entry.citation_key)
        if existing is not None:
            item = diagnostic(
                "duplicate_key",
                f"citation key '{entry.citation_key}' appears more than once",
                citation_key=entry.citation_key,
                sources=[existing.source, entry.source],
            )
            errors.append(item)
            add_entry_diagnostic(entry, item)
        else:
            exact_keys[entry.citation_key] = entry

        folded = entry.citation_key.casefold()
        folded_existing = folded_keys.get(folded)
        if folded_existing is not None and folded_existing.citation_key != entry.citation_key:
            item = diagnostic(
                "case_colliding_key",
                f"citation keys '{folded_existing.citation_key}' and '{entry.citation_key}' differ only by case",
                citation_keys=[folded_existing.citation_key, entry.citation_key],
                sources=[folded_existing.source, entry.source],
            )
            errors.append(item)
            add_entry_diagnostic(entry, item)
        else:
            folded_keys.setdefault(folded, entry)

        doi = normalize_doi(entry.fields.get("doi", ""))
        if doi:
            doi_existing = dois.get(doi)
            if doi_existing is not None and doi_existing.citation_key != entry.citation_key:
                item = diagnostic(
                    "duplicate_doi",
                    f"DOI '{doi}' is shared by multiple citation keys",
                    normalized_doi=doi,
                    citation_keys=[doi_existing.citation_key, entry.citation_key],
                )
                warnings.append(item)
                add_entry_diagnostic(entry, item)
            else:
                dois[doi] = entry

        missing = missing_fields(entry)
        if missing:
            item = diagnostic(
                "missing_fields",
                f"entry '{entry.citation_key}' is missing expected fields: {', '.join(missing)}",
                citation_key=entry.citation_key,
                fields=missing,
            )
            warnings.append(item)
            add_entry_diagnostic(entry, item)

    rendered_entries = []
    for entry in entries:
        fields = entry.fields
        content_basis = "abstract" if fields.get("abstract", "").strip() else (
            "metadata" if any(fields.get(name, "").strip() for name in ("title", "author", "year", "doi", "url")) else "unavailable"
        )
        rendered_entries.append(
            {
                "citation_key": entry.citation_key,
                "entry_type": entry.entry_type,
                "title": fields.get("title", ""),
                "authors_raw": fields.get("author", "") or fields.get("editor", ""),
                "year": fields.get("year", ""),
                "doi": fields.get("doi", ""),
                "url": fields.get("url", ""),
                "identity_status": "input_only",
                "content_basis": content_basis,
                "diagnostics": entry_diagnostics.get((entry.source, entry.citation_key), []),
                "source": entry.source,
                "fields": fields,
            }
        )

    report = {
        "schema_version": SCHEMA_VERSION,
        "ok": not errors,
        "sources": source_names,
        "entries": rendered_entries,
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "source_count": len(paths),
            "entry_count": len(entries),
            "error_count": len(errors),
            "warning_count": len(warnings),
        },
    }
    return report, entries


def normalize_span(value: str) -> str:
    return " ".join(unicodedata.normalize("NFC", value).split())


def span_hash(value: str) -> str:
    return hashlib.sha256(normalize_span(value).encode("utf-8")).hexdigest()


def find_all(text: str, needle: str) -> list[int]:
    positions: list[int] = []
    offset = 0
    while needle and (found := text.find(needle, offset)) >= 0:
        positions.append(found)
        offset = found + 1
    return positions


def extract_citations(review: str) -> list[CitationOccurrence]:
    occurrences: list[CitationOccurrence] = []
    for block in PANDOC_BLOCK_PATTERN.finditer(review):
        for match in PANDOC_KEY_PATTERN.finditer(block.group(0)):
            start = block.start() + match.start(1)
            occurrences.append(CitationOccurrence(match.group(1), start, start + len(match.group(1)), "pandoc"))
    for citation in LATEX_CITE_PATTERN.finditer(review):
        body = citation.group(1)
        body_start = citation.start(1)
        cursor = 0
        for raw_key in body.split(","):
            key = raw_key.strip()
            if not key:
                continue
            relative = body.find(key, cursor)
            cursor = relative + len(key)
            occurrences.append(CitationOccurrence(key, body_start + relative, body_start + relative + len(key), "latex"))
    return sorted(occurrences, key=lambda item: (item.start, item.end, item.key))


def _has_limitations(value: Any) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, list):
        return any(str(item).strip() for item in value)
    return False


def _evidence_minimum_errors(claim: dict[str, Any], evidence: list[dict[str, Any]]) -> list[str]:
    kind = claim.get("claim_kind")
    reasons: list[str] = []
    if kind == "bibliographic":
        for item in evidence:
            if item.get("content_basis") == "unavailable" or item.get("identity_status") != "metadata_verified":
                reasons.append("bibliographic claims require available metadata and metadata_verified identity")
                break
    elif kind == "descriptive":
        if any(item.get("content_basis") not in {"abstract", "full_text", "user_excerpt"} for item in evidence):
            reasons.append("descriptive claims require abstract, full_text, or user_excerpt evidence")
    elif kind in {"quantitative", "causal", "quotation"}:
        if any(item.get("content_basis") not in {"full_text", "user_excerpt"} for item in evidence):
            reasons.append(f"{kind} claims require full_text or user_excerpt evidence")
    elif kind == "synthesis":
        cited_keys = set(claim.get("citation_keys", []))
        usable = {
            str(item.get("citation_key"))
            for item in evidence
            if item.get("citation_key") in cited_keys
            and item.get("identity_status") == "metadata_verified"
            and item.get("content_basis") in {"abstract", "full_text", "user_excerpt"}
        }
        if len(usable) < 2:
            reasons.append("synthesis claims require at least two usable sources")
        if claim.get("is_inference") is not True:
            reasons.append("synthesis claims require is_inference true")
        if not _has_limitations(claim.get("limitations")):
            reasons.append("synthesis claims require an explicit limitation")
    return reasons


def audit_review(
    bib_paths: Sequence[Path],
    approved_paths: Sequence[Path],
    candidate_paths: Sequence[Path],
    review_path: Path,
    ledger_path: Path,
) -> dict[str, Any]:
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []
    corpus_report, corpus_entries = inventory_sources([*bib_paths, *approved_paths])
    if corpus_report["errors"]:
        errors.extend(
            diagnostic("corpus_inventory_error", item["message"], inventory_diagnostic=item)
            for item in corpus_report["errors"]
        )
    warnings.extend(corpus_report["warnings"])
    candidate_report, candidate_entries = inventory_sources(candidate_paths) if candidate_paths else (
        {"errors": [], "warnings": []},
        [],
    )
    if candidate_report["errors"]:
        errors.extend(
            diagnostic("candidate_inventory_error", item["message"], inventory_diagnostic=item)
            for item in candidate_report["errors"]
        )

    try:
        review = review_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        errors.append(diagnostic("review_read_error", str(exc), source=str(review_path)))
        review = ""
    try:
        ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        errors.append(diagnostic("ledger_read_error", str(exc), source=str(ledger_path)))
        ledger = {}
    if not isinstance(ledger, dict):
        errors.append(diagnostic("ledger_schema_error", "ledger root must be a JSON object"))
        ledger = {}
    if ledger.get("schema_version") != SCHEMA_VERSION:
        errors.append(
            diagnostic(
                "ledger_schema_error",
                f"ledger schema_version must be '{SCHEMA_VERSION}'",
                actual=ledger.get("schema_version"),
            )
        )
    claims = ledger.get("claims")
    if not isinstance(claims, list):
        errors.append(diagnostic("ledger_schema_error", "ledger claims must be an array"))
        claims = []

    known_keys = {entry.citation_key for entry in corpus_entries}
    candidate_keys = {entry.citation_key for entry in candidate_entries} - known_keys
    occurrences = extract_citations(review)
    if not review.strip():
        errors.append(diagnostic("review_empty", "review must contain auditable prose and citations"))
    elif not occurrences:
        errors.append(diagnostic("review_has_no_citations", "review contains no supported Pandoc or LaTeX citations"))
    if not claims:
        errors.append(diagnostic("ledger_has_no_claims", "ledger must contain at least one claim"))
    for occurrence in occurrences:
        if occurrence.key in known_keys:
            continue
        code = "unapproved_candidate_citation" if occurrence.key in candidate_keys else "unknown_citation"
        errors.append(
            diagnostic(
                code,
                f"citation '{occurrence.key}' is not in the approved corpus",
                citation_key=occurrence.key,
                offset=occurrence.start,
                syntax=occurrence.syntax,
            )
        )

    claim_ranges: list[tuple[int, int, str]] = []
    seen_claim_ids: set[str] = set()
    for index, raw_claim in enumerate(claims):
        if not isinstance(raw_claim, dict):
            errors.append(diagnostic("ledger_schema_error", "claim must be an object", claim_index=index))
            continue
        claim = raw_claim
        claim_id = str(claim.get("claim_id", "")).strip()
        if not claim_id:
            errors.append(diagnostic("ledger_schema_error", "claim_id is required", claim_index=index))
            claim_id = f"claim-index-{index}"
        elif claim_id in seen_claim_ids:
            errors.append(diagnostic("duplicate_claim_id", f"claim_id '{claim_id}' appears more than once", claim_id=claim_id))
        seen_claim_ids.add(claim_id)

        kind = claim.get("claim_kind")
        if kind not in ALLOWED_CLAIM_KINDS:
            errors.append(diagnostic("invalid_claim_kind", f"claim '{claim_id}' has invalid claim_kind", claim_id=claim_id, actual=kind))
        support = claim.get("support_status")
        if support not in ALLOWED_SUPPORT:
            errors.append(diagnostic("invalid_support_status", f"claim '{claim_id}' has invalid support_status", claim_id=claim_id, actual=support))
        elif support in {"conflicted", "gap", "unassessed"}:
            errors.append(diagnostic("undeliverable_support_status", f"claim '{claim_id}' cannot be delivered with support_status '{support}'", claim_id=claim_id))
        elif support == "partial" and not _has_limitations(claim.get("limitations")):
            errors.append(diagnostic("missing_limitations", f"partial claim '{claim_id}' requires limitations", claim_id=claim_id))

        span = claim.get("draft_span")
        if not isinstance(span, str) or not span:
            errors.append(diagnostic("missing_draft_span", f"claim '{claim_id}' requires a non-empty draft_span", claim_id=claim_id))
            span_positions: list[int] = []
        else:
            span_positions = find_all(review, span)
            if len(span_positions) != 1:
                errors.append(
                    diagnostic(
                        "draft_span_occurrence",
                        f"claim '{claim_id}' draft_span must occur exactly once; found {len(span_positions)}",
                        claim_id=claim_id,
                        occurrence_count=len(span_positions),
                    )
                )
            expected_hash = span_hash(span)
            actual_hash = claim.get("draft_hash")
            if actual_hash != expected_hash:
                errors.append(
                    diagnostic(
                        "draft_hash_mismatch",
                        f"claim '{claim_id}' draft_hash does not match its normalized draft_span",
                        claim_id=claim_id,
                        expected=expected_hash,
                        actual=actual_hash,
                    )
                )
            if len(span_positions) == 1:
                claim_ranges.append((span_positions[0], span_positions[0] + len(span), claim_id))

        citation_keys = claim.get("citation_keys")
        if not isinstance(citation_keys, list) or not citation_keys or not all(isinstance(key, str) and key for key in citation_keys):
            errors.append(diagnostic("ledger_schema_error", f"claim '{claim_id}' requires non-empty string citation_keys", claim_id=claim_id))
            citation_keys = []
        if len(set(citation_keys)) != len(citation_keys):
            errors.append(diagnostic("duplicate_claim_citation_key", f"claim '{claim_id}' repeats a citation key", claim_id=claim_id))
        for key in citation_keys:
            if key not in known_keys:
                code = "unapproved_candidate_citation" if key in candidate_keys else "unknown_ledger_citation"
                errors.append(diagnostic(code, f"claim '{claim_id}' uses unapproved key '{key}'", claim_id=claim_id, citation_key=key))

        evidence_raw = claim.get("evidence")
        if not isinstance(evidence_raw, list):
            errors.append(diagnostic("ledger_schema_error", f"claim '{claim_id}' evidence must be an array", claim_id=claim_id))
            evidence: list[dict[str, Any]] = []
        else:
            evidence = []
            seen_evidence_keys: set[str] = set()
            for evidence_index, raw_evidence in enumerate(evidence_raw):
                if not isinstance(raw_evidence, dict):
                    errors.append(diagnostic("ledger_schema_error", f"claim '{claim_id}' evidence item must be an object", claim_id=claim_id, evidence_index=evidence_index))
                    continue
                evidence.append(raw_evidence)
                evidence_key = raw_evidence.get("citation_key")
                if evidence_key not in known_keys:
                    errors.append(diagnostic("unknown_evidence_key", f"claim '{claim_id}' evidence key '{evidence_key}' is outside the approved corpus", claim_id=claim_id, citation_key=evidence_key))
                if evidence_key not in citation_keys:
                    errors.append(diagnostic("unreferenced_evidence", f"claim '{claim_id}' evidence key '{evidence_key}' is not listed in citation_keys", claim_id=claim_id, citation_key=evidence_key))
                if isinstance(evidence_key, str) and evidence_key in seen_evidence_keys:
                    errors.append(diagnostic("duplicate_evidence_key", f"claim '{claim_id}' repeats evidence for '{evidence_key}'", claim_id=claim_id, citation_key=evidence_key))
                elif isinstance(evidence_key, str):
                    seen_evidence_keys.add(evidence_key)
                basis = raw_evidence.get("content_basis")
                if basis not in ALLOWED_BASIS:
                    errors.append(diagnostic("invalid_content_basis", f"claim '{claim_id}' has invalid content_basis '{basis}'", claim_id=claim_id, citation_key=evidence_key))
                identity = raw_evidence.get("identity_status")
                if identity not in ALLOWED_IDENTITY:
                    errors.append(diagnostic("invalid_identity_status", f"claim '{claim_id}' has invalid identity_status '{identity}'", claim_id=claim_id, citation_key=evidence_key))
                elif identity != "metadata_verified":
                    errors.append(diagnostic("unverified_evidence_identity", f"claim '{claim_id}' cannot use '{identity}' evidence in deliverable prose", claim_id=claim_id, citation_key=evidence_key, identity_status=identity))
                for field in ("locator", "excerpt", "source_url", "checked_at"):
                    if not isinstance(raw_evidence.get(field), str) or not raw_evidence[field].strip():
                        errors.append(diagnostic("missing_evidence_field", f"claim '{claim_id}' evidence requires non-empty string field '{field}'", claim_id=claim_id, citation_key=evidence_key, field=field))

        evidence_keys = {str(item.get("citation_key")) for item in evidence}
        for key in citation_keys:
            if key not in evidence_keys:
                errors.append(diagnostic("missing_citation_evidence", f"claim '{claim_id}' has no evidence record for '{key}'", claim_id=claim_id, citation_key=key))
        for reason in _evidence_minimum_errors(claim, evidence):
            errors.append(diagnostic("insufficient_evidence", f"claim '{claim_id}': {reason}", claim_id=claim_id, claim_kind=kind))

        if len(span_positions) == 1:
            start = span_positions[0]
            end = start + len(span)
            span_keys = {item.key for item in occurrences if item.start >= start and item.end <= end}
            if span_keys != set(citation_keys):
                errors.append(
                    diagnostic(
                        "span_citation_mismatch",
                        f"claim '{claim_id}' citation_keys do not match citations inside draft_span",
                        claim_id=claim_id,
                        ledger_keys=sorted(set(citation_keys)),
                        span_keys=sorted(span_keys),
                    )
                )

    for occurrence in occurrences:
        covering = [claim_id for start, end, claim_id in claim_ranges if occurrence.start >= start and occurrence.end <= end]
        if len(covering) != 1:
            code = "uncovered_citation" if not covering else "multiply_covered_citation"
            errors.append(
                diagnostic(
                    code,
                    f"citation '{occurrence.key}' must belong to exactly one ledger span; found {len(covering)}",
                    citation_key=occurrence.key,
                    offset=occurrence.start,
                    covering_claim_ids=covering,
                )
            )

    used_keys = {occurrence.key for occurrence in occurrences}
    for unused in sorted(known_keys - used_keys):
        warnings.append(diagnostic("unused_bib_entry", f"approved BibTeX entry '{unused}' is not cited", citation_key=unused))

    return {
        "schema_version": SCHEMA_VERSION,
        "ok": not errors,
        "sources": {
            "bib": [str(path) for path in bib_paths],
            "approved_bib": [str(path) for path in approved_paths],
            "candidate_bib": [str(path) for path in candidate_paths],
            "review": str(review_path),
            "ledger": str(ledger_path),
        },
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "approved_entry_count": len(corpus_entries),
            "candidate_entry_count": len(candidate_entries),
            "citation_occurrence_count": len(occurrences),
            "claim_count": len(claims),
            "error_count": len(errors),
            "warning_count": len(warnings),
        },
        "semantic_review": {
            "required": True,
            "status": "missing evidence",
            "boundary": "This audit does not prove semantic entailment or detect every uncited substantive sentence.",
        },
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Inventory BibTeX or audit review citations against a claim-evidence ledger."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    inventory = subparsers.add_parser("inventory", help="Parse and diagnose one or more BibTeX files.")
    inventory.add_argument("--bib", action="append", required=True, type=Path, help="BibTeX file; repeat for multiple files.")
    inventory.add_argument("--output", required=True, type=Path, help="UTF-8 JSON report written by this script.")

    audit = subparsers.add_parser("audit", help="Audit review citations, approved corpus, and claim evidence.")
    audit.add_argument("--bib", action="append", required=True, type=Path, help="Original BibTeX file; repeat as needed.")
    audit.add_argument("--approved-bib", action="append", default=[], type=Path, help="Explicitly approved supplement; repeat as needed.")
    audit.add_argument("--candidate-bib", action="append", default=[], type=Path, help="Unapproved candidate corpus used only to diagnose candidate citations.")
    audit.add_argument("--review", required=True, type=Path, help="Markdown/Pandoc or LaTeX review draft.")
    audit.add_argument("--ledger", required=True, type=Path, help="Claim-evidence JSON ledger.")
    audit.add_argument("--output", required=True, type=Path, help="UTF-8 JSON report written by this script.")
    return parser


def execute(args: argparse.Namespace) -> dict[str, Any]:
    if args.command == "inventory":
        report, _ = inventory_sources(args.bib)
        return report
    return audit_review(args.bib, args.approved_bib, args.candidate_bib, args.review, args.ledger)


def main(argv: Iterable[str] | None = None) -> int:
    args = build_parser().parse_args(list(argv) if argv is not None else None)
    try:
        report = execute(args)
    except Exception as exc:  # Last-resort structured failure for unexpected I/O/data errors.
        report = {
            "schema_version": SCHEMA_VERSION,
            "ok": False,
            "errors": [diagnostic("unexpected_error", f"{type(exc).__name__}: {exc}")],
            "warnings": [],
        }
    write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report.get("ok") is True else 2


if __name__ == "__main__":
    sys.exit(main())
