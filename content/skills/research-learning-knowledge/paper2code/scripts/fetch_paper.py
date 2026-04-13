#!/usr/bin/env python3
"""
Fetch and parse a supported paper source.

Supported inputs:
  - arXiv ID
  - arXiv URL
  - local PDF path
  - OpenReview forum / paper page URL
  - OpenReview direct PDF URL

Usage:
    python fetch_paper.py <paper_source> <workspace_root>

Outputs:
    <workspace_root>/<paper_key>/paper_text.md
    <workspace_root>/<paper_key>/paper_metadata.json
    <workspace_root>/<paper_key>/paper.pdf  (when a PDF is available)
"""

from __future__ import annotations

import importlib.util
import json
import re
import sys
import tempfile
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urljoin, urlparse

import requests


ARXIV_ID_RE = re.compile(r"(?P<id>(?:\d{4}\.\d{4,5}|[a-z\-]+/\d{7})(?:v\d+)?)", re.IGNORECASE)
DOI_RE = re.compile(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.IGNORECASE)
URL_RE = re.compile(r"^https?://", re.IGNORECASE)
REPO_URL_RE = re.compile(
    r"https?://(?:github\.com|gitlab\.com|bitbucket\.org)/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+",
    re.IGNORECASE,
)
META_TAG_RE = re.compile(
    r'<meta[^>]+(?:name|property)=["\'](?P<name>[^"\']+)["\'][^>]+content=["\'](?P<content>[^"\']+)["\']',
    re.IGNORECASE,
)
OPENREVIEW_HOST = "openreview.net"


class SourceResolutionError(RuntimeError):
    """Raised when a paper source cannot be resolved into a supported paper."""


def load_xray_io_module():
    script_path = Path(__file__).resolve().parent / "xray_io.py"
    spec = importlib.util.spec_from_file_location("paper2code_xray_io", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load xray_io helper from {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


XRAY_IO = load_xray_io_module()


def is_url(value: str) -> bool:
    return bool(URL_RE.match(value.strip()))


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def clean_line(value: str) -> str:
    return normalize_whitespace(value).strip(" \t\r\n-:|")


def split_lines(text: str) -> list[str]:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return [line.strip() for line in text.splitlines()]


def top_block_lines(text: str, *, max_lines: int = 80) -> list[str]:
    return [line for line in split_lines(text)[:max_lines] if line]


def extract_title_from_text(text: str) -> str | None:
    lines = top_block_lines(text)
    label_patterns = [
        re.compile(r"^title[:：]\s*(.+)$", re.IGNORECASE),
        re.compile(r"^题目[:：]\s*(.+)$"),
    ]
    for line in lines[:15]:
        for pattern in label_patterns:
            match = pattern.match(line)
            if match:
                return clean_line(match.group(1))

    best_line = None
    best_score = -999
    for index, line in enumerate(lines[:20]):
        score = 0
        if 12 <= len(line) <= 180:
            score += 5
        if re.search(r"[A-Za-z\u4e00-\u9fff]", line):
            score += 3
        if "@" in line or re.search(r"\b(university|department|school|advisor|email)\b", line, re.IGNORECASE):
            score -= 6
        if re.search(r"\b(arxiv|doi|abstract|authors?|venue|keywords?)\b", line, re.IGNORECASE):
            score -= 5
        if re.search(r"(硕士学位论文|博士学位论文|master(?:'s)? thesis|doctoral dissertation)", line, re.IGNORECASE):
            score -= 4
        if index < 8:
            score += 2
        if len(line.split()) >= 3:
            score += 2
        if score > best_score:
            best_score = score
            best_line = line
    return clean_line(best_line) if best_line and best_score > 2 else None


def parse_author_names(raw: str) -> list[str]:
    raw = clean_line(raw)
    raw = re.sub(r"^(authors?|作者)[:：]\s*", "", raw, flags=re.IGNORECASE)
    normalized = raw
    for separator in [";", "；", ",", "，", " and ", "、"]:
        normalized = normalized.replace(separator, "|")
    names = [clean_line(part) for part in normalized.split("|") if clean_line(part)]
    results: list[str] = []
    for name in names:
        if re.search(r"(university|department|school|laboratory|email|advisor|指导教师)", name, re.IGNORECASE):
            continue
        if len(name) > 80:
            continue
        results.append(name)
    return results


def extract_authors_from_text(text: str, title: str | None) -> list[str]:
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
            return [clean_line(name) for name in english_names]
        if re.search(r"作者", line):
            authors = parse_author_names(line)
            if authors:
                return authors
    return []


def extract_year_from_text(text: str) -> int | None:
    top = "\n".join(top_block_lines(text, max_lines=80))
    matches = [int(match.group(0)) for match in re.finditer(r"\b(19|20)\d{2}\b", top)]
    plausible = [year for year in matches if 1990 <= year <= 2035]
    return plausible[0] if plausible else None


def extract_abstract_from_text(text: str) -> str:
    lines = split_lines(text)
    start_patterns = [re.compile(r"^abstract\b", re.IGNORECASE), re.compile(r"^摘\s*要\b")]
    end_patterns = [
        re.compile(r"^keywords?\b", re.IGNORECASE),
        re.compile(r"^index terms\b", re.IGNORECASE),
        re.compile(r"^关键词[:：]?", re.IGNORECASE),
        re.compile(r"^\d+(?:\.\d+)*\s+[A-Z]"),
        re.compile(r"^[IVXLC]+\.\s+[A-Z]", re.IGNORECASE),
        re.compile(r"^(introduction|background|method|methods|approach|引言|绪论|研究方法)\b", re.IGNORECASE),
    ]

    start_index = None
    for index, line in enumerate(lines):
        if any(pattern.match(line) for pattern in start_patterns):
            start_index = index
            break
    if start_index is None:
        return ""

    parts: list[str] = []
    first_line = lines[start_index]
    stripped_first = re.sub(r"^[A-Za-z\u4e00-\u9fff ]+[:：]?\s*", "", first_line)
    if stripped_first and stripped_first != first_line:
        parts.append(stripped_first)
    for line in lines[start_index + 1 :]:
        if any(pattern.match(line) for pattern in end_patterns):
            break
        parts.append(line)
    return normalize_whitespace("\n".join(part for part in parts if part))


def normalize_arxiv_id(input_str: str) -> str:
    input_str = input_str.strip().rstrip("/")
    for prefix in [
        "https://arxiv.org/abs/",
        "http://arxiv.org/abs/",
        "https://arxiv.org/pdf/",
        "http://arxiv.org/pdf/",
    ]:
        if input_str.startswith(prefix):
            input_str = input_str[len(prefix):]
            break
    if input_str.endswith(".pdf"):
        input_str = input_str[:-4]
    match = ARXIV_ID_RE.fullmatch(input_str)
    if not match:
        raise SourceResolutionError(f"Unsupported arXiv source: {input_str}")
    return match.group("id")


def extract_openreview_id(source: str) -> str | None:
    parsed = urlparse(source)
    if parsed.netloc.lower().endswith(OPENREVIEW_HOST):
        query = parse_qs(parsed.query)
        for key in ["id", "noteId", "forum"]:
            values = query.get(key)
            if values:
                return values[0]
    return None


def slugify_token(value: str) -> str:
    parts = re.findall(r"[a-z0-9]+", value.lower())
    return "_".join(parts) if parts else "paper"


def detect_source_kind(source: str) -> str:
    stripped = source.strip()

    if DOI_RE.search(stripped):
        return "doi"

    if ARXIV_ID_RE.fullmatch(stripped):
        return "arxiv_id"

    if is_url(stripped):
        parsed = urlparse(stripped)
        host = parsed.netloc.lower()
        path = parsed.path.rstrip("/")
        if host.endswith("arxiv.org"):
            return "arxiv_url"
        if host.endswith(OPENREVIEW_HOST):
            if path.endswith("/pdf") or path == "/pdf":
                return "openreview_pdf"
            return "openreview_page"
        return "unsupported_url"

    if Path(stripped).expanduser().suffix.lower() == ".pdf":
        return "local_pdf"

    return "unsupported_input"


def make_paper_key(source: str, source_kind: str) -> str:
    if source_kind in {"arxiv_id", "arxiv_url"}:
        return normalize_arxiv_id(source).replace(".", "_")
    if source_kind.startswith("openreview"):
        openreview_id = extract_openreview_id(source)
        if openreview_id:
            return f"openreview_{slugify_token(openreview_id)}"
    if source_kind == "local_pdf":
        return slugify_token(Path(source).expanduser().stem)
    return "paper"


def fetch_metadata(arxiv_id: str) -> dict[str, Any]:
    base_id = re.sub(r"v\d+$", "", arxiv_id)
    api_url = f"http://export.arxiv.org/api/query?id_list={base_id}"
    try:
        resp = requests.get(api_url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"WARNING: Could not fetch metadata from arXiv API: {exc}", file=sys.stderr)
        return {"title": "Unknown", "authors": [], "abstract": "", "categories": [], "year": None}

    text = resp.text

    def extract_tag(tag: str, content: str) -> str:
        pattern = rf"<{tag}[^>]*>(.*?)</{tag}>"
        match = re.search(pattern, content, re.DOTALL)
        return normalize_whitespace(match.group(1)) if match else ""

    entry_match = re.search(r"<entry>(.*?)</entry>", text, re.DOTALL)
    if not entry_match:
        return {"title": "Unknown", "authors": [], "abstract": "", "categories": [], "year": None}

    entry = entry_match.group(1)
    authors = []
    for author_block in re.findall(r"<author>(.*?)</author>", entry, re.DOTALL):
        name = extract_tag("name", author_block)
        if name:
            authors.append(name)

    published = extract_tag("published", entry)
    year = int(published[:4]) if published[:4].isdigit() else None
    categories = re.findall(r'<category[^>]*term="([^"]+)"', entry)
    return {
        "title": extract_tag("title", entry) or "Unknown",
        "authors": authors,
        "abstract": extract_tag("summary", entry),
        "categories": categories,
        "year": year,
    }


def download_binary(url: str) -> bytes:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    return resp.content


def extract_with_pymupdf4llm(pdf_path: Path) -> str | None:
    try:
        import pymupdf4llm

        text = pymupdf4llm.to_markdown(str(pdf_path))
        return text if text and len(text) > 500 else None
    except Exception:
        return None


def extract_with_pdfplumber(pdf_path: Path) -> str | None:
    try:
        import pdfplumber

        pages = []
        with pdfplumber.open(str(pdf_path)) as pdf:
            for index, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text:
                    pages.append(f"<!-- Page {index} -->\n{text}")
        if not pages:
            return None
        return "\n\n".join(pages)
    except Exception:
        return None


def fetch_ar5iv_html(arxiv_id: str) -> str | None:
    base_id = re.sub(r"v\d+$", "", arxiv_id)
    html_url = f"https://ar5iv.labs.arxiv.org/html/{base_id}"
    try:
        resp = requests.get(html_url, timeout=60)
        resp.raise_for_status()
    except requests.RequestException:
        return None

    text = resp.text
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    for level in range(1, 7):
        text = re.sub(
            rf"<h{level}[^>]*>(.*?)</h{level}>",
            lambda match, lv=level: f"\n{'#' * lv} {clean_line(match.group(1))}\n",
            text,
            flags=re.DOTALL,
        )
    text = re.sub(r"<p[^>]*>", "\n\n", text)
    text = re.sub(r"</p>", "", text)
    text = re.sub(r"<li[^>]*>", "\n- ", text)
    text = re.sub(r'<math[^>]*alttext="([^"]*)"[^>]*>.*?</math>', r"$\1$", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()
    return text if len(text) > 500 else None


def check_text_quality(text: str) -> bool:
    if not text or len(text) < 500:
        return False
    sample = text[:1000]
    weird_chars = sum(
        1
        for char in sample
        if ord(char) > 127 and char not in "αβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΦΨΩ∑∏∫∂∇√∞±≤≥≠≈∈∉⊂⊃∪∩"
    )
    weird_ratio = weird_chars / max(len(sample), 1)
    if weird_ratio > 0.2:
        return False
    common_words = {"the", "and", "of", "in", "to", "we", "is", "for", "that", "with"}
    words_lower = set(re.findall(r"\b[a-z]+\b", sample.lower()))
    return len(words_lower & common_words) >= 3


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> tuple[str, list[dict[str, Any]]]:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as handle:
        handle.write(pdf_bytes)
        pdf_path = Path(handle.name)
    try:
        pages = XRAY_IO.extract_pages(str(pdf_path))
        text = "\n\n".join(page["text"] for page in pages if page.get("text"))
        return text, pages
    finally:
        pdf_path.unlink(missing_ok=True)


def extract_text_from_local_pdf(pdf_path: Path) -> tuple[str, list[dict[str, Any]]]:
    pages = XRAY_IO.extract_pages(str(pdf_path))
    text = "\n\n".join(page["text"] for page in pages if page.get("text"))
    return text, pages


def find_repo_links_in_text(text: str, label: str) -> list[dict[str, str]]:
    found: list[dict[str, str]] = []
    seen: set[str] = set()
    for match in REPO_URL_RE.finditer(text):
        url = match.group(0).rstrip("/").rstrip(").,;:")
        normalized = url.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        start = max(0, match.start() - 120)
        end = min(len(text), match.end() + 120)
        context = text[start:end].replace("\n", " ")
        found.append({"url": url, "source": label, "context": clean_line(context)})
    return found


def find_repo_links_in_html(html: str, label: str) -> list[dict[str, str]]:
    urls = sorted({match.group(0).rstrip("/") for match in REPO_URL_RE.finditer(html)})
    return [{"url": url, "source": label, "context": f"Link found on {label.replace('_', ' ')}"} for url in urls]


def dedupe_links(*groups: list[dict[str, str]]) -> list[dict[str, str]]:
    merged: list[dict[str, str]] = []
    seen: set[str] = set()
    for group in groups:
        for item in group:
            normalized = item["url"].lower().rstrip("/")
            if normalized in seen:
                continue
            seen.add(normalized)
            merged.append(item)
    return merged


def extract_meta_values(html: str, target_names: set[str]) -> list[str]:
    values = []
    for match in META_TAG_RE.finditer(html):
        name = match.group("name").lower()
        if name in target_names:
            values.append(clean_line(match.group("content")))
    return [value for value in values if value]


def resolve_openreview_pdf_url(source: str, html: str) -> str | None:
    meta_pdf = extract_meta_values(html, {"citation_pdf_url", "pdf_url"})
    if meta_pdf:
        return urljoin(source, meta_pdf[0])

    href_match = re.search(r'href=["\']([^"\']*/pdf\?id=[^"\']+)["\']', html, re.IGNORECASE)
    if href_match:
        return urljoin(source, href_match.group(1))

    openreview_id = extract_openreview_id(source)
    if openreview_id:
        return f"https://openreview.net/pdf?id={openreview_id}"
    return None


def build_metadata(
    *,
    source_kind: str,
    source_input: str,
    paper_key: str,
    title: str | None,
    authors: list[str] | None,
    abstract: str | None,
    year: int | None,
    categories: list[str] | None,
    paper_url: str | None,
    resolved_pdf_url: str | None,
    official_code: list[dict[str, str]] | None,
) -> dict[str, Any]:
    return {
        "source_kind": source_kind,
        "source_input": source_input,
        "paper_key": paper_key,
        "title": title or "Unknown",
        "authors": authors or [],
        "abstract": abstract or "",
        "year": year,
        "categories": categories or [],
        "paper_url": paper_url,
        "resolved_pdf_url": resolved_pdf_url,
        "official_code": official_code or [],
    }


def write_workspace_outputs(
    *,
    output_dir: Path,
    metadata: dict[str, Any],
    text: str,
    pdf_bytes: bytes | None,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    metadata_path = output_dir / "paper_metadata.json"
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    text_path = output_dir / "paper_text.md"
    with text_path.open("w", encoding="utf-8") as handle:
        handle.write(f"# {metadata['title']}\n\n")
        if metadata.get("authors"):
            handle.write(f"**Authors:** {', '.join(metadata['authors'])}\n\n")
        handle.write(f"**Source kind:** {metadata['source_kind']}\n\n")
        if metadata.get("paper_url"):
            handle.write(f"**Paper URL:** {metadata['paper_url']}\n\n")
        if metadata.get("resolved_pdf_url") and metadata["resolved_pdf_url"] != metadata.get("paper_url"):
            handle.write(f"**Resolved PDF:** {metadata['resolved_pdf_url']}\n\n")
        handle.write("---\n\n")
        handle.write(text)

    if pdf_bytes is not None:
        (output_dir / "paper.pdf").write_bytes(pdf_bytes)


def process_arxiv(source: str, output_dir: Path, paper_key: str, source_kind: str) -> dict[str, Any]:
    arxiv_id = normalize_arxiv_id(source)
    metadata_fields = fetch_metadata(arxiv_id)
    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    paper_url = f"https://arxiv.org/abs/{arxiv_id}"
    pdf_bytes = download_binary(pdf_url)

    paper_pdf_path = output_dir / "paper.pdf"
    output_dir.mkdir(parents=True, exist_ok=True)
    paper_pdf_path.write_bytes(pdf_bytes)

    text = extract_with_pymupdf4llm(paper_pdf_path)
    if text and not check_text_quality(text):
        text = None
    if text is None:
        text = extract_with_pdfplumber(paper_pdf_path)
    if text and not check_text_quality(text):
        text = None
    if text is None:
        text = fetch_ar5iv_html(arxiv_id)
    if text is None:
        raise SourceResolutionError("Failed to extract readable text from the arXiv source.")

    abs_html = requests.get(paper_url, timeout=30)
    abs_html.raise_for_status()
    official_code = dedupe_links(
        find_repo_links_in_text(text, "paper_text"),
        find_repo_links_in_html(abs_html.text, "arxiv_page"),
    )
    metadata = build_metadata(
        source_kind=source_kind,
        source_input=source,
        paper_key=paper_key,
        title=metadata_fields.get("title"),
        authors=metadata_fields.get("authors"),
        abstract=metadata_fields.get("abstract"),
        year=metadata_fields.get("year"),
        categories=metadata_fields.get("categories"),
        paper_url=paper_url,
        resolved_pdf_url=pdf_url,
        official_code=official_code,
    )
    write_workspace_outputs(output_dir=output_dir, metadata=metadata, text=text, pdf_bytes=pdf_bytes)
    return metadata


def process_local_pdf(source: str, output_dir: Path, paper_key: str) -> dict[str, Any]:
    pdf_path = Path(source).expanduser()
    if not pdf_path.exists():
        raise SourceResolutionError(f"Local PDF does not exist: {pdf_path}")

    text, _pages = extract_text_from_local_pdf(pdf_path)
    if not text.strip():
        raise SourceResolutionError(
            f"Could not extract text from local PDF: {pdf_path}. Try a different PDF file path."
        )

    title = extract_title_from_text(text)
    authors = extract_authors_from_text(text, title)
    abstract = extract_abstract_from_text(text)
    year = extract_year_from_text(text)
    official_code = find_repo_links_in_text(text, "paper_text")

    metadata = build_metadata(
        source_kind="local_pdf",
        source_input=source,
        paper_key=paper_key,
        title=title,
        authors=authors,
        abstract=abstract,
        year=year,
        categories=[],
        paper_url=None,
        resolved_pdf_url=str(pdf_path.resolve()),
        official_code=official_code,
    )
    write_workspace_outputs(output_dir=output_dir, metadata=metadata, text=text, pdf_bytes=pdf_path.read_bytes())
    return metadata


def process_openreview_page(source: str, output_dir: Path, paper_key: str) -> dict[str, Any]:
    page_resp = requests.get(source, timeout=30)
    page_resp.raise_for_status()
    html = page_resp.text
    pdf_url = resolve_openreview_pdf_url(source, html)
    if not pdf_url:
        raise SourceResolutionError(
            "OpenReview page did not expose a resolvable PDF. Supported sources are arXiv, local PDF, and OpenReview."
        )

    pdf_bytes = download_binary(pdf_url)
    text, _pages = extract_text_from_pdf_bytes(pdf_bytes)
    if not text.strip():
        raise SourceResolutionError("OpenReview PDF downloaded but no readable text could be extracted.")

    meta_title = extract_meta_values(html, {"citation_title", "og:title", "dc.title"})
    meta_authors = extract_meta_values(html, {"citation_author"})
    title = meta_title[0] if meta_title else extract_title_from_text(text)
    authors = meta_authors if meta_authors else extract_authors_from_text(text, title)
    abstract_candidates = extract_meta_values(html, {"description", "og:description", "citation_abstract"})
    abstract = abstract_candidates[0] if abstract_candidates else extract_abstract_from_text(text)
    year = extract_year_from_text(text)
    official_code = dedupe_links(
        find_repo_links_in_text(text, "paper_text"),
        find_repo_links_in_html(html, "openreview_page"),
    )

    metadata = build_metadata(
        source_kind="openreview_page",
        source_input=source,
        paper_key=paper_key,
        title=title,
        authors=authors,
        abstract=abstract,
        year=year,
        categories=[],
        paper_url=source,
        resolved_pdf_url=pdf_url,
        official_code=official_code,
    )
    write_workspace_outputs(output_dir=output_dir, metadata=metadata, text=text, pdf_bytes=pdf_bytes)
    return metadata


def process_openreview_pdf(source: str, output_dir: Path, paper_key: str) -> dict[str, Any]:
    pdf_bytes = download_binary(source)
    text, _pages = extract_text_from_pdf_bytes(pdf_bytes)
    if not text.strip():
        raise SourceResolutionError("OpenReview PDF downloaded but no readable text could be extracted.")

    title = extract_title_from_text(text)
    authors = extract_authors_from_text(text, title)
    abstract = extract_abstract_from_text(text)
    year = extract_year_from_text(text)
    openreview_id = extract_openreview_id(source)
    paper_url = f"https://openreview.net/forum?id={openreview_id}" if openreview_id else None
    official_code = find_repo_links_in_text(text, "paper_text")
    metadata = build_metadata(
        source_kind="openreview_pdf",
        source_input=source,
        paper_key=paper_key,
        title=title,
        authors=authors,
        abstract=abstract,
        year=year,
        categories=[],
        paper_url=paper_url,
        resolved_pdf_url=source,
        official_code=official_code,
    )
    write_workspace_outputs(output_dir=output_dir, metadata=metadata, text=text, pdf_bytes=pdf_bytes)
    return metadata


def process_source(source: str, workspace_root: Path) -> dict[str, Any]:
    source_kind = detect_source_kind(source)
    if source_kind == "doi":
        raise SourceResolutionError(
            "DOI-only input is intentionally unsupported. Provide an arXiv source, local PDF, or OpenReview paper instead."
        )
    if source_kind == "unsupported_url":
        raise SourceResolutionError(
            "Unsupported URL source. Supported sources are arXiv, local PDF, and OpenReview."
        )
    if source_kind == "unsupported_input":
        raise SourceResolutionError(
            "Unsupported paper source. Provide an arXiv ID, arXiv URL, local PDF path, OpenReview page, or OpenReview PDF."
        )

    paper_key = make_paper_key(source, source_kind)
    output_dir = workspace_root / paper_key

    if source_kind in {"arxiv_id", "arxiv_url"}:
        return process_arxiv(source, output_dir, paper_key, source_kind)
    if source_kind == "local_pdf":
        return process_local_pdf(source, output_dir, paper_key)
    if source_kind == "openreview_page":
        return process_openreview_page(source, output_dir, paper_key)
    if source_kind == "openreview_pdf":
        return process_openreview_pdf(source, output_dir, paper_key)

    raise SourceResolutionError(f"Unhandled source kind: {source_kind}")


def parse_args() -> tuple[str, Path]:
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <paper_source> <workspace_root>", file=sys.stderr)
        raise SystemExit(1)
    return sys.argv[1], Path(sys.argv[2]).expanduser()


def main() -> int:
    source, workspace_root = parse_args()
    try:
        metadata = process_source(source, workspace_root)
    except SourceResolutionError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except requests.RequestException as exc:
        print(f"Network error while fetching paper source: {exc}", file=sys.stderr)
        return 1

    print(f"Paper key: {metadata['paper_key']}")
    print(f"Source kind: {metadata['source_kind']}")
    print(f"Title: {metadata['title']}")
    print(f"Workspace: {workspace_root / metadata['paper_key']}")
    print(f"Official code links: {len(metadata.get('official_code', []))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
