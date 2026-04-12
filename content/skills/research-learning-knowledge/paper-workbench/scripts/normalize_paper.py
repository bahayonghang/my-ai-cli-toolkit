#!/usr/bin/env python3
"""Normalize arXiv inputs and generic academic PDFs into a shared JSON schema."""

from __future__ import annotations

import argparse
import importlib.util
import json
import pathlib
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from html import unescape
from typing import Any


SCHEMA_VERSION = "paper-record"
USER_AGENT = "paper-workbench/1.0 (+https://example.invalid)"
ARXIV_ID_RE = re.compile(
    r"(?P<id>(?:\d{4}\.\d{4,5}|[a-z\-]+(?:\.[A-Z]{2})?/\d{7})(?:v\d+)?)",
    re.IGNORECASE,
)
DOI_RE = re.compile(r"(?P<doi>10\.\d{4,9}/[-._;()/:A-Z0-9]+)", re.IGNORECASE)
URL_RE = re.compile(r"^https?://", re.IGNORECASE)
PDF_LINK_RE = re.compile(r'href=["\']([^"\']+\.pdf(?:\?[^"\']*)?)["\']', re.IGNORECASE)
META_PDF_RE = re.compile(
    r'<meta[^>]+(?:name|property)=["\'](?:citation_pdf_url|pdf_url)["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
TITLE_META_RE = re.compile(
    r'<meta[^>]+(?:name|property)=["\'](?:citation_title|og:title|dc\.title)["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
SECTION_PATTERNS = [
    re.compile(r"^(abstract|introduction|background|method|methods|approach|experiment|experiments|results|discussion|conclusion|limitations|references)\b", re.IGNORECASE),
    re.compile(r"^\d+(?:\.\d+)*\s+\S"),
    re.compile(r"^[IVXLC]+\.\s+\S", re.IGNORECASE),
    re.compile(r"^(摘\s*要|关键词|引言|绪论|研究方法|实验|结果|讨论|结论|参考文献)\b"),
]
ABSTRACT_START_PATTERNS = [
    re.compile(r"^abstract\b", re.IGNORECASE),
    re.compile(r"^摘\s*要\b"),
]
ABSTRACT_END_PATTERNS = [
    re.compile(r"^keywords?\b", re.IGNORECASE),
    re.compile(r"^index terms\b", re.IGNORECASE),
    re.compile(r"^关键词[:：]?", re.IGNORECASE),
    re.compile(r"^\d+(?:\.\d+)*\s+[A-Z]"),
    re.compile(r"^[IVXLC]+\.\s+[A-Z]", re.IGNORECASE),
    re.compile(r"^(introduction|background|method|methods|approach|引言|绪论|研究方法)\b", re.IGNORECASE),
]
KEYWORDS_PATTERNS = [
    re.compile(r"^keywords?[:：]?\s*(.+)$", re.IGNORECASE),
    re.compile(r"^index terms[:：]?\s*(.+)$", re.IGNORECASE),
    re.compile(r"^关键词[:：]?\s*(.+)$", re.IGNORECASE),
]
THESIS_PATTERNS = {
    "doctor": [
        re.compile(r"博士学位论文"),
        re.compile(r"doctoral dissertation", re.IGNORECASE),
        re.compile(r"ph\.?d\.?\s+thesis", re.IGNORECASE),
    ],
    "master": [
        re.compile(r"硕士学位论文"),
        re.compile(r"master(?:'s)? thesis", re.IGNORECASE),
        re.compile(r"master dissertation", re.IGNORECASE),
    ],
}


def load_xray_io_module():
    script_path = pathlib.Path(__file__).resolve().parent / "xray_io.py"
    spec = importlib.util.spec_from_file_location("xray_io", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load xray_io helper from {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


XRAY_IO = load_xray_io_module()


def make_base_record(source: str, input_kind: str) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "status": "unresolved",
        "source": {
            "input": source,
            "input_kind": input_kind,
            "resolved_pdf_url": None,
            "canonical_url": None,
        },
        "document": {
            "document_type": "unknown",
            "degree_level": None,
            "language": None,
        },
        "bibliography": {
            "title": None,
            "authors": [],
            "year": None,
            "venue": None,
            "publisher": None,
            "doi": None,
            "abstract": None,
            "keywords": [],
        },
        "content": {
            "summary": None,
            "problem": None,
            "method": None,
            "results": None,
            "sections": [],
            "page_chunks": [],
            "full_text_markdown": None,
            "full_text_included": False,
        },
        "arxiv_enhancement": {
            "arxiv_id": None,
            "alphaxiv_available": False,
            "intermediate_report": None,
            "key_insights": [],
            "citations": [],
        },
        "provenance": {
            "metadata_sources": [],
            "content_sources": [],
            "warnings": [],
            "confidence": "low",
        },
        "errors": [],
    }


def is_url(value: str) -> bool:
    return bool(URL_RE.match(value.strip()))


def extract_arxiv_id(source: str) -> str | None:
    parsed = urllib.parse.urlparse(source)
    if parsed.scheme and parsed.netloc:
        candidate = urllib.parse.unquote(parsed.path)
        for part in candidate.split("/"):
            match = ARXIV_ID_RE.fullmatch(part)
            if match:
                return match.group("id")
        if parsed.netloc.lower().endswith("alphaxiv.org"):
            query_id = urllib.parse.parse_qs(parsed.query).get("id")
            if query_id:
                match = ARXIV_ID_RE.search(query_id[0])
                if match:
                    return match.group("id")
    match = ARXIV_ID_RE.fullmatch(source.strip())
    if match:
        return match.group("id")
    match = ARXIV_ID_RE.search(source)
    return match.group("id") if match else None


def extract_doi(source: str) -> str | None:
    parsed = urllib.parse.urlparse(source)
    if parsed.scheme and parsed.netloc:
        candidates = [urllib.parse.unquote(parsed.path), urllib.parse.unquote(parsed.query)]
        for candidate in candidates:
            match = DOI_RE.search(candidate)
            if match:
                return match.group("doi").rstrip(").,;]")
    match = DOI_RE.search(source.strip())
    if match:
        return match.group("doi").rstrip(").,;]")
    return None


def detect_input_kind(source: str) -> str:
    path = pathlib.Path(source).expanduser()
    if path.exists():
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            return "local_pdf"
        if suffix == ".json":
            return "normalized_json"
        return "local_text"

    lowered = source.lower().strip()
    arxiv_id = extract_arxiv_id(source)
    doi = extract_doi(source)
    if arxiv_id and ("arxiv.org" in lowered or "alphaxiv.org" in lowered or ARXIV_ID_RE.fullmatch(source.strip())):
        if "alphaxiv.org" in lowered:
            return "alphaxiv_url"
        if "arxiv.org" in lowered:
            return "arxiv_url"
        return "arxiv_id"
    if doi:
        return "doi"
    if is_url(source):
        if lowered.endswith(".pdf") or "/pdf/" in lowered:
            return "web_pdf"
        return "generic_paper_url"
    return "generic_text"


def read_json_file(path: pathlib.Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    schema_version = payload.get("schema_version")
    if schema_version == SCHEMA_VERSION:
        return payload
    raise ValueError("Unsupported normalized JSON schema")


def http_get(url: str, *, binary: bool = False) -> tuple[bytes | str, str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as response:
        final_url = response.geturl()
        content_type = response.headers.get_content_type()
        data = response.read()
    if binary:
        return data, content_type, final_url
    return data.decode("utf-8", errors="replace"), content_type, final_url


def fetch_json(url: str) -> dict[str, Any] | None:
    try:
        text, _, _ = http_get(url)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    assert isinstance(text, str)
    return json.loads(text)


def fetch_text(url: str) -> str | None:
    try:
        text, _, _ = http_get(url)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    assert isinstance(text, str)
    return text


def fetch_binary(url: str) -> tuple[bytes, str, str]:
    data, content_type, final_url = http_get(url, binary=True)
    assert isinstance(data, bytes)
    return data, content_type, final_url


def fetch_crossref_json(doi: str) -> dict[str, Any] | None:
    encoded = urllib.parse.quote(doi, safe="")
    try:
        text, _, _ = http_get(f"https://api.crossref.org/works/{encoded}")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    assert isinstance(text, str)
    payload = json.loads(text)
    message = payload.get("message")
    return message if isinstance(message, dict) else None


def crossref_authors(message: dict[str, Any]) -> list[dict[str, Any]]:
    authors = []
    for author in message.get("author") or []:
        if not isinstance(author, dict):
            continue
        given = clean_line(str(author.get("given") or ""))
        family = clean_line(str(author.get("family") or ""))
        name = clean_line(" ".join(part for part in [given, family] if part))
        if not name:
            name = clean_line(str(author.get("name") or ""))
        affiliation = None
        raw_affiliations = author.get("affiliation") or []
        if raw_affiliations and isinstance(raw_affiliations, list):
            first = raw_affiliations[0]
            if isinstance(first, dict):
                affiliation = clean_line(str(first.get("name") or "")) or None
        if name:
            authors.append({"name": name, "affiliation": affiliation})
    return authors


def first_crossref_value(value: Any) -> str | None:
    if isinstance(value, list):
        for item in value:
            if isinstance(item, str) and clean_line(item):
                return clean_line(item)
        return None
    if isinstance(value, str):
        return clean_line(value)
    return None


def normalize_doi_source(source: str, *, fulltext_mode: str) -> dict[str, Any]:
    record = make_base_record(source, "doi")
    doi = extract_doi(source)
    record["bibliography"]["doi"] = doi
    record["source"]["canonical_url"] = f"https://doi.org/{doi}" if doi else None

    if not doi:
        record["errors"].append("Could not extract a DOI from the source.")
        return record

    message = fetch_crossref_json(doi)
    if not message:
        record["errors"].append("Crossref did not return metadata for this DOI.")
        return record

    record["provenance"]["metadata_sources"].append("crossref")
    record["bibliography"]["title"] = first_crossref_value(message.get("title"))
    record["bibliography"]["authors"] = crossref_authors(message)
    issued = message.get("issued", {}).get("date-parts", [])
    if issued and isinstance(issued, list) and issued[0]:
        first_year = issued[0][0]
        if isinstance(first_year, int):
            record["bibliography"]["year"] = first_year
    record["bibliography"]["venue"] = first_crossref_value(message.get("container-title"))
    record["bibliography"]["publisher"] = clean_line(str(message.get("publisher") or "")) or None
    record["bibliography"]["abstract"] = clean_line(str(message.get("abstract") or "")) or None
    record["bibliography"]["keywords"] = [clean_line(str(item)) for item in (message.get("subject") or []) if clean_line(str(item))]

    landing_page = first_crossref_value(message.get("URL"))
    raw_resource = message.get("resource")
    resource = raw_resource if isinstance(raw_resource, dict) else {}
    primary_url = first_crossref_value(resource.get("primary")) or landing_page
    if primary_url:
        record["source"]["canonical_url"] = primary_url

    record["document"]["document_type"] = infer_document_type("", "doi", record["bibliography"]["venue"])
    summary, problem, method, results = summarize_from_abstract(record["bibliography"]["abstract"])
    record["content"]["summary"] = summary
    record["content"]["problem"] = problem
    record["content"]["method"] = method
    record["content"]["results"] = results
    record["content"]["sections"] = []
    record["content"]["full_text_included"] = False
    record["content"]["full_text_markdown"] = None
    record["provenance"]["confidence"] = "medium" if record["content"]["summary"] else "low"
    record["status"] = "resolved" if record["bibliography"]["title"] and record["content"]["summary"] else "partial"

    if fulltext_mode == "prefer":
        record["provenance"]["warnings"].append("DOI resolution returned metadata only; no direct full text was fetched.")

    return record


def resolve_pdf_from_html(url: str, html: str) -> tuple[str | None, str | None]:
    meta_match = META_PDF_RE.search(html)
    if meta_match:
        return urllib.parse.urljoin(url, unescape(meta_match.group(1).strip())), extract_html_title(html)

    link_match = PDF_LINK_RE.search(html)
    if link_match:
        return urllib.parse.urljoin(url, unescape(link_match.group(1).strip())), extract_html_title(html)

    return None, extract_html_title(html)


def extract_html_title(html: str) -> str | None:
    meta_match = TITLE_META_RE.search(html)
    if meta_match:
        return clean_line(meta_match.group(1))
    title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    if title_match:
        return clean_line(unescape(title_match.group(1)))
    return None


def clean_line(value: str) -> str:
    value = unescape(value)
    value = re.sub(r"\s+", " ", value).strip(" \t\r\n-:|")
    return value


def build_page_chunks(
    raw_chunks: list[dict[str, Any]] | None,
    *,
    include_text: bool,
) -> list[dict[str, Any]]:
    if not raw_chunks:
        return []

    normalized: list[dict[str, Any]] = []
    for index, chunk in enumerate(raw_chunks, start=1):
        text = str(chunk.get("text") or "").strip()
        if not text:
            continue

        anchor = str(chunk.get("anchor") or f"p{index}").strip() or f"p{index}"
        page_start = chunk.get("page_start") or index
        page_end = chunk.get("page_end") or page_start
        label = clean_line(str(chunk.get("label") or anchor)) or anchor
        excerpt = clean_line(str(chunk.get("excerpt") or text[:280])) or None
        normalized.append(
            {
                "anchor": anchor,
                "page_start": page_start,
                "page_end": page_end,
                "label": label,
                "excerpt": excerpt,
                "text": text if include_text else None,
            }
        )

    return normalized


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_lines(text: str) -> list[str]:
    return [line.strip() for line in normalize_whitespace(text).splitlines()]


def is_heading(line: str) -> bool:
    if not line:
        return False
    return any(pattern.search(line) for pattern in SECTION_PATTERNS)


def top_block_lines(text: str, *, max_lines: int = 60) -> list[str]:
    lines = split_lines(text)
    return [line for line in lines[:max_lines] if line]


def infer_language(text: str) -> str:
    sample = text[:6000]
    cjk_count = sum(1 for char in sample if "\u4e00" <= char <= "\u9fff")
    if cjk_count >= 30 or (sample and cjk_count / max(len(sample), 1) > 0.02):
        return "zh"
    return "en"


def extract_title_from_label(lines: list[str]) -> str | None:
    patterns = [
        re.compile(r"^title[:：]\s*(.+)$", re.IGNORECASE),
        re.compile(r"^题目[:：]\s*(.+)$"),
    ]
    for line in lines[:15]:
        for pattern in patterns:
            match = pattern.match(line)
            if match:
                return clean_line(match.group(1))
    return None


def score_title_candidate(line: str, title_context: bool) -> int:
    score = 0
    if 12 <= len(line) <= 180:
        score += 5
    if re.search(r"[A-Za-z\u4e00-\u9fff]", line):
        score += 3
    if "@" in line or re.search(r"\b(university|department|school|email|advisor)\b", line, re.IGNORECASE):
        score -= 6
    if re.search(r"\b(arxiv|doi|abstract|authors?|venue|keywords?)\b", line, re.IGNORECASE):
        score -= 5
    if re.search(r"(硕士学位论文|博士学位论文|master(?:'s)? thesis|doctoral dissertation)", line, re.IGNORECASE):
        score -= 4
    if title_context:
        score += 2
    if len(line.split()) >= 3:
        score += 2
    return score


def extract_title(text: str) -> str | None:
    lines = top_block_lines(text)
    labelled = extract_title_from_label(lines)
    if labelled:
        return labelled

    best_line = None
    best_score = -999
    for index, line in enumerate(lines[:20]):
        score = score_title_candidate(line, title_context=index < 8)
        if score > best_score:
            best_score = score
            best_line = line
    return clean_line(best_line) if best_line and best_score > 2 else None


def parse_author_names(raw: str) -> list[dict[str, Any]]:
    raw = clean_line(raw)
    raw = re.sub(r"^(authors?|作者)[:：]\s*", "", raw, flags=re.IGNORECASE)
    separators = [";", "；", ",", "，", " and ", "、"]
    normalized = raw
    for separator in separators:
        normalized = normalized.replace(separator, "|")
    names = [clean_line(part) for part in normalized.split("|") if clean_line(part)]
    results = []
    for name in names:
        if re.search(r"(university|department|school|laboratory|email|advisor|指导教师)", name, re.IGNORECASE):
            continue
        if len(name) > 80:
            continue
        results.append({"name": name, "affiliation": None})
    return results


def extract_authors(text: str, title: str | None = None) -> list[dict[str, Any]]:
    lines = top_block_lines(text)
    for line in lines[:20]:
        if re.match(r"^(authors?|作者)[:：]", line, re.IGNORECASE):
            authors = parse_author_names(line)
            if authors:
                return authors

    title_seen = title is None
    for line in lines[:20]:
        if title and clean_line(line) == clean_line(title):
            title_seen = True
            continue
        if not title_seen or len(line) > 160:
            continue
        english_names = re.findall(r"[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3}", line)
        if len(english_names) >= 2:
            authors = [{"name": clean_line(name), "affiliation": None} for name in english_names]
            if authors:
                return authors
        if re.search(r"作者", line):
            authors = parse_author_names(line)
            if authors:
                return authors
    return []


def extract_year(text: str) -> int | None:
    top = "\n".join(top_block_lines(text, max_lines=80))
    matches = [int(match.group(0)) for match in re.finditer(r"\b(19|20)\d{2}\b", top)]
    plausible = [year for year in matches if 1990 <= year <= 2035]
    return plausible[0] if plausible else None


def extract_venue_and_publisher(text: str) -> tuple[str | None, str | None]:
    lines = top_block_lines(text, max_lines=50)
    venue = None
    publisher = None

    for line in lines:
        venue_match = re.match(r"^venue[:：]\s*(.+)$", line, re.IGNORECASE)
        if venue_match:
            venue = clean_line(venue_match.group(1))
            break

    if venue is None:
        for line in lines:
            if re.search(r"\b(proceedings|conference|symposium|workshop|transactions on|journal of)\b", line, re.IGNORECASE):
                venue = clean_line(line)
                break

    sample = "\n".join(lines)
    if re.search(r"\bIEEE\b", sample):
        publisher = "IEEE"
    elif re.search(r"\bElsevier\b", sample, re.IGNORECASE):
        publisher = "Elsevier"
    elif re.search(r"\bACM\b", sample):
        publisher = "ACM"
    elif re.search(r"\bSpringer\b", sample, re.IGNORECASE):
        publisher = "Springer"

    return venue, publisher


def collect_block(
    lines: list[str],
    start_patterns: list[re.Pattern[str]],
    end_patterns: list[re.Pattern[str]],
) -> str | None:
    start_index = None
    for index, line in enumerate(lines):
        if any(pattern.match(line) for pattern in start_patterns):
            start_index = index
            break
    if start_index is None:
        return None

    parts = []
    first_line = lines[start_index]
    stripped_first = re.sub(r"^[A-Za-z\u4e00-\u9fff ]+[:：]?\s*", "", first_line)
    if stripped_first and stripped_first != first_line:
        parts.append(stripped_first)

    for line in lines[start_index + 1 :]:
        if any(pattern.match(line) for pattern in end_patterns):
            break
        parts.append(line)
    block = "\n".join(part for part in parts if part).strip()
    return block or None


def extract_abstract(text: str) -> str | None:
    lines = split_lines(text)
    block = collect_block(lines, ABSTRACT_START_PATTERNS, ABSTRACT_END_PATTERNS)
    if block:
        return normalize_whitespace(block)
    return None


def split_keywords(raw: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", raw).strip(" :：;；,.，")
    if not cleaned:
        return []
    normalized = cleaned
    for separator in [";", "；", ",", "，", " / ", "|", "·"]:
        normalized = normalized.replace(separator, "|")
    return [part.strip() for part in normalized.split("|") if part.strip()]


def extract_keywords(text: str) -> list[str]:
    for line in split_lines(text):
        for pattern in KEYWORDS_PATTERNS:
            match = pattern.match(line)
            if match:
                return split_keywords(match.group(1))
    return []


def extract_sections(text: str) -> list[str]:
    sections = []
    seen = set()
    for line in split_lines(text):
        candidate = clean_line(line)
        if not candidate or len(candidate) > 120:
            continue
        if is_heading(candidate):
            normalized = candidate.lower()
            if normalized not in seen:
                seen.add(normalized)
                sections.append(candidate)
    return sections[:20]


def extract_label_value(text: str, labels: list[str]) -> str | None:
    pattern = re.compile(
        rf"^(?:{'|'.join(labels)})[:：]\s*(.+)$",
        re.IGNORECASE | re.MULTILINE,
    )
    match = pattern.search(text)
    if match:
        return clean_line(match.group(1))
    return None


def infer_degree_level(text: str) -> str | None:
    for level, patterns in THESIS_PATTERNS.items():
        if any(pattern.search(text) for pattern in patterns):
            return level
    return None


def infer_document_type(text: str, source_kind: str, venue: str | None) -> str:
    if source_kind in {"arxiv_id", "arxiv_url", "alphaxiv_url"}:
        return "preprint"
    degree_level = infer_degree_level(text)
    if degree_level:
        return "thesis"
    venue_text = f"{venue or ''}\n{text[:3000]}"
    if re.search(r"\b(proceedings|conference|symposium|workshop)\b", venue_text, re.IGNORECASE):
        return "conference-paper"
    if re.search(r"\b(journal|transactions on|letters|review)\b", venue_text, re.IGNORECASE):
        return "journal-article"
    return "unknown"


def sentence_split(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    pieces = re.split(r"(?<=[.!?。！？])\s+", text)
    return [piece.strip() for piece in pieces if piece.strip()]


def find_sentence(text: str, patterns: list[str]) -> str | None:
    for sentence in sentence_split(text):
        if any(re.search(pattern, sentence, re.IGNORECASE) for pattern in patterns):
            return sentence
    return None


def summarize_from_abstract(abstract: str | None) -> tuple[str | None, str | None, str | None, str | None]:
    if not abstract:
        return None, None, None, None
    sentences = sentence_split(abstract)
    summary = " ".join(sentences[:2]) if sentences else abstract
    problem = sentences[0] if sentences else abstract
    method = find_sentence(
        abstract,
        [r"\bwe (propose|present|introduce|develop)\b", r"\b提出\b", r"\b设计\b"],
    )
    if method is None and len(sentences) >= 2:
        method = sentences[1]
    results = find_sentence(
        abstract,
        [r"\b(improv|outperform|achiev|reduce|f1|accuracy|bleu|auc)\b", r"实验结果", r"提升"],
    )
    return summary, problem, method, results


def should_include_full_text(text: str, mode: str, *, summary_present: bool) -> bool:
    if mode == "prefer":
        return True
    if mode == "never":
        return False
    return len(text) <= 8000 or not summary_present


def choose_canonical_url(source: str, input_kind: str, arxiv_id: str | None) -> str | None:
    if input_kind == "alphaxiv_url":
        return source
    if arxiv_id:
        return f"https://arxiv.org/abs/{arxiv_id}"
    return source if is_url(source) else None


def parse_bibtex_value(bibtex: str | None, field: str) -> str | None:
    if not bibtex:
        return None
    match = re.search(rf"{field}\s*=\s*{{(.*?)}}", bibtex, re.IGNORECASE | re.DOTALL)
    if match:
        return clean_line(match.group(1))
    return None


def authors_from_bibtex(bibtex: str | None) -> list[dict[str, Any]]:
    raw = parse_bibtex_value(bibtex, "author")
    if not raw:
        return []
    parts = [clean_line(part) for part in re.split(r"\s+and\s+", raw) if clean_line(part)]
    return [{"name": part, "affiliation": None} for part in parts]


def enrich_from_text_record(
    record: dict[str, Any],
    text: str,
    *,
    fulltext_mode: str,
    page_chunks: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    text = normalize_whitespace(text)
    language = infer_language(text)
    title = record["bibliography"]["title"] or extract_title(text)
    authors = record["bibliography"]["authors"] or extract_authors(text, title)
    abstract = record["bibliography"]["abstract"] or extract_abstract(text)
    year = record["bibliography"]["year"] or extract_year(text)
    venue, publisher = extract_venue_and_publisher(text)
    keywords = record["bibliography"]["keywords"] or extract_keywords(text)
    sections = extract_sections(text)
    summary, problem, method, results = summarize_from_abstract(abstract)
    labelled_problem = extract_label_value(text, ["problem"])
    labelled_method = extract_label_value(text, ["method", "approach", "solution", "insight"])
    labelled_results = extract_label_value(text, ["results?", "delta"])
    if summary is None:
        summary_parts = [part for part in [labelled_problem, labelled_method, labelled_results] if part]
        summary = " ".join(summary_parts) if summary_parts else None
    problem = problem or labelled_problem
    method = method or labelled_method
    results = results or labelled_results

    record["document"]["language"] = language
    record["document"]["degree_level"] = record["document"]["degree_level"] or infer_degree_level(text)
    record["document"]["document_type"] = infer_document_type(
        text,
        record["source"]["input_kind"],
        venue or record["bibliography"]["venue"],
    )

    record["bibliography"]["title"] = title
    record["bibliography"]["authors"] = authors
    record["bibliography"]["year"] = year
    record["bibliography"]["venue"] = record["bibliography"]["venue"] or venue
    record["bibliography"]["publisher"] = record["bibliography"]["publisher"] or publisher
    record["bibliography"]["abstract"] = abstract
    record["bibliography"]["keywords"] = keywords

    record["content"]["summary"] = record["content"]["summary"] or summary
    record["content"]["problem"] = record["content"]["problem"] or problem
    record["content"]["method"] = record["content"]["method"] or method
    record["content"]["results"] = record["content"]["results"] or results
    record["content"]["sections"] = record["content"]["sections"] or sections

    include_full_text = should_include_full_text(
        text,
        fulltext_mode,
        summary_present=bool(record["content"]["summary"]),
    )
    record["content"]["page_chunks"] = build_page_chunks(page_chunks, include_text=include_full_text)
    record["content"]["full_text_included"] = include_full_text
    record["content"]["full_text_markdown"] = text if include_full_text else None

    has_content_signal = bool(
        record["bibliography"]["abstract"]
        or record["content"]["summary"]
        or record["content"]["problem"]
        or record["content"]["method"]
        or record["content"]["results"]
        or record["content"]["sections"]
        or include_full_text
    )

    if record["bibliography"]["title"] and has_content_signal:
        record["status"] = "resolved"
        record["provenance"]["confidence"] = "medium"
    elif record["bibliography"]["title"] or record["bibliography"]["authors"]:
        record["status"] = "partial"
        record["provenance"]["confidence"] = "low"
    else:
        record["status"] = "unresolved"
        record["errors"].append("Could not extract enough metadata from the paper text.")

    return record


def extract_text_from_downloaded_pdf(url: str) -> tuple[str, str, list[dict[str, Any]]]:
    binary, _, final_url = fetch_binary(url)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as handle:
        handle.write(binary)
        temp_path = pathlib.Path(handle.name)
    try:
        pages = XRAY_IO.extract_pages(str(temp_path))
    finally:
        temp_path.unlink(missing_ok=True)
    text = "\n\n".join(page["text"] for page in pages if page.get("text"))
    return text, final_url, pages


def normalize_generic_pdf_source(source: str, *, input_kind: str, fulltext_mode: str) -> dict[str, Any]:
    record = make_base_record(source, input_kind)
    record["source"]["canonical_url"] = source if is_url(source) else None

    if input_kind in {"local_pdf", "local_text"}:
        pages = XRAY_IO.extract_pages(source)
        text = "\n\n".join(page["text"] for page in pages if page.get("text"))
        record["provenance"]["content_sources"].append("local-file")
        return enrich_from_text_record(record, text, fulltext_mode=fulltext_mode, page_chunks=pages)

    if input_kind == "web_pdf":
        text, final_url, pages = extract_text_from_downloaded_pdf(source)
        record["source"]["resolved_pdf_url"] = final_url
        record["source"]["canonical_url"] = final_url
        record["provenance"]["content_sources"].append("remote-pdf")
        return enrich_from_text_record(record, text, fulltext_mode=fulltext_mode, page_chunks=pages)

    if input_kind == "generic_paper_url":
        html, content_type, final_url = http_get(source)
        if content_type == "application/pdf":
            text, resolved_final_url, pages = extract_text_from_downloaded_pdf(final_url)
            record["source"]["resolved_pdf_url"] = resolved_final_url
            record["source"]["canonical_url"] = resolved_final_url
            record["provenance"]["content_sources"].append("remote-pdf")
            return enrich_from_text_record(record, text, fulltext_mode=fulltext_mode, page_chunks=pages)

        assert isinstance(html, str)
        pdf_url, html_title = resolve_pdf_from_html(final_url, html)
        if html_title:
            record["bibliography"]["title"] = html_title
            record["provenance"]["metadata_sources"].append("page-metadata")
        if pdf_url:
            record["source"]["resolved_pdf_url"] = pdf_url
            text, resolved_final_url, pages = extract_text_from_downloaded_pdf(pdf_url)
            record["source"]["resolved_pdf_url"] = resolved_final_url
            record["provenance"]["content_sources"].append("resolved-page-pdf")
            return enrich_from_text_record(record, text, fulltext_mode=fulltext_mode, page_chunks=pages)

        record["status"] = "unresolved"
        record["provenance"]["warnings"].append("The page did not expose a PDF link.")
        record["errors"].append("Paper landing pages must expose a PDF for generic parsing.")
        return record

    record["status"] = "unresolved"
    record["errors"].append(f"Unsupported generic source kind: {input_kind}")
    return record


def normalize_arxiv_source(source: str, *, input_kind: str, lang: str, fulltext_mode: str) -> dict[str, Any]:
    record = make_base_record(source, input_kind)
    arxiv_id = extract_arxiv_id(source)
    record["source"]["canonical_url"] = choose_canonical_url(source, input_kind, arxiv_id)
    record["source"]["resolved_pdf_url"] = f"https://arxiv.org/pdf/{arxiv_id}.pdf" if arxiv_id else None
    record["arxiv_enhancement"]["arxiv_id"] = arxiv_id

    if not arxiv_id:
        record["errors"].append("Could not extract an arXiv identifier from the source.")
        return record

    paper_payload = fetch_json(f"https://api.alphaxiv.org/papers/v3/{arxiv_id}")
    if not paper_payload:
        record["provenance"]["warnings"].append("AlphaXiv did not return metadata; falling back to the arXiv PDF.")
        fallback = normalize_generic_pdf_source(
            record["source"]["resolved_pdf_url"],
            input_kind="web_pdf",
            fulltext_mode=fulltext_mode,
        )
        fallback["source"]["input"] = source
        fallback["source"]["input_kind"] = input_kind
        fallback["source"]["canonical_url"] = record["source"]["canonical_url"]
        fallback["arxiv_enhancement"]["arxiv_id"] = arxiv_id
        return fallback

    record["provenance"]["metadata_sources"].append("alphaxiv-paper")
    bibtex = paper_payload.get("citationBibtex")
    record["bibliography"]["title"] = paper_payload.get("title") or parse_bibtex_value(bibtex, "title")
    record["bibliography"]["authors"] = authors_from_bibtex(bibtex)
    record["bibliography"]["year"] = int(parse_bibtex_value(bibtex, "year") or 0) or None
    record["bibliography"]["venue"] = parse_bibtex_value(bibtex, "booktitle") or parse_bibtex_value(bibtex, "journal")
    record["bibliography"]["abstract"] = paper_payload.get("abstract")
    record["document"]["language"] = lang
    record["document"]["document_type"] = "preprint"
    record["provenance"]["confidence"] = "medium"

    version_id = paper_payload.get("versionId")
    overview_payload = None
    if version_id:
        overview_payload = fetch_json(f"https://api.alphaxiv.org/papers/v3/{version_id}/overview/{lang}")
    if overview_payload:
        record["provenance"]["content_sources"].append("alphaxiv-overview")
        record["arxiv_enhancement"]["alphaxiv_available"] = True
        record["arxiv_enhancement"]["intermediate_report"] = overview_payload.get("intermediateReport")
        record["arxiv_enhancement"]["key_insights"] = overview_payload.get("summary", {}).get("keyInsights", [])
        record["arxiv_enhancement"]["citations"] = overview_payload.get("citations", [])
        summary_payload = overview_payload.get("summary") or {}
        record["content"]["summary"] = summary_payload.get("summary")
        problems = summary_payload.get("originalProblem") or []
        solutions = summary_payload.get("solution") or []
        results = summary_payload.get("results") or []
        record["content"]["problem"] = " ".join(problems) if isinstance(problems, list) else problems
        record["content"]["method"] = " ".join(solutions) if isinstance(solutions, list) else solutions
        record["content"]["results"] = " ".join(results) if isinstance(results, list) else results
        if record["content"]["summary"]:
            record["status"] = "resolved"
            record["provenance"]["confidence"] = "high"

    alphaxiv_markdown = None
    if fulltext_mode == "prefer" or (fulltext_mode == "auto" and not record["content"]["summary"]):
        alphaxiv_markdown = fetch_text(f"https://alphaxiv.org/abs/{arxiv_id}.md")

    if alphaxiv_markdown:
        record["provenance"]["content_sources"].append("alphaxiv-markdown")
        synthetic_page = [{"anchor": "p1", "page_start": 1, "page_end": 1, "label": "p1", "excerpt": alphaxiv_markdown[:280], "text": alphaxiv_markdown}]
        enrich_from_text_record(record, alphaxiv_markdown, fulltext_mode="prefer", page_chunks=synthetic_page)
    else:
        summary, problem, method, results = summarize_from_abstract(record["bibliography"]["abstract"])
        record["content"]["summary"] = record["content"]["summary"] or summary
        record["content"]["problem"] = record["content"]["problem"] or problem
        record["content"]["method"] = record["content"]["method"] or method
        record["content"]["results"] = record["content"]["results"] or results
        record["content"]["page_chunks"] = []
        record["content"]["full_text_markdown"] = None
        record["content"]["full_text_included"] = False
        if record["bibliography"]["title"] and record["content"]["summary"]:
            record["status"] = "resolved"
        elif record["bibliography"]["title"]:
            record["status"] = "partial"

    if record["status"] == "unresolved" and record["bibliography"]["title"]:
        record["status"] = "partial"

    return record


def normalize_source(source: str, *, lang: str = "en", fulltext_mode: str = "auto") -> dict[str, Any]:
    input_kind = detect_input_kind(source)

    if input_kind == "normalized_json":
        return read_json_file(pathlib.Path(source).expanduser())

    if input_kind in {"arxiv_id", "arxiv_url", "alphaxiv_url"}:
        return normalize_arxiv_source(source, input_kind=input_kind, lang=lang, fulltext_mode=fulltext_mode)

    if input_kind == "doi":
        return normalize_doi_source(source, fulltext_mode=fulltext_mode)

    if input_kind in {"local_pdf", "local_text", "web_pdf", "generic_paper_url"}:
        return normalize_generic_pdf_source(source, input_kind=input_kind, fulltext_mode=fulltext_mode)

    record = make_base_record(source, input_kind)
    record["errors"].append("Unsupported paper source. Provide an arXiv reference, DOI, or a paper PDF.")
    return record


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, help="Local path, URL, or arXiv identifier.")
    parser.add_argument("--lang", default="en", help="Language code for AlphaXiv summary fetches.")
    parser.add_argument(
        "--fulltext",
        default="auto",
        choices=["auto", "prefer", "never"],
        help="Whether to include extracted full text in the JSON output.",
    )
    parser.add_argument("--save", help="Optional path to write the JSON payload.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        payload = normalize_source(args.source, lang=args.lang, fulltext_mode=args.fulltext)
    except Exception as exc:  # pragma: no cover - CLI error path
        print(str(exc), file=sys.stderr)
        return 1

    rendered = json.dumps(payload, ensure_ascii=False, indent=2)
    if args.save:
        target = pathlib.Path(args.save).expanduser()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
