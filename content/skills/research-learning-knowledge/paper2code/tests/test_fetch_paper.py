from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "fetch_paper.py"
FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_LOCAL_PAPER = FIXTURES_DIR / "sample_local_paper.pdf"

spec = importlib.util.spec_from_file_location("paper2code_fetch_paper", SCRIPT)
assert spec is not None and spec.loader is not None
fetch_paper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetch_paper)


class DummyResponse:
    def __init__(self, *, text: str = "", content: bytes = b"", status_code: int = 200):
        self.text = text
        self.content = content
        self.status_code = status_code

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise fetch_paper.requests.HTTPError(f"HTTP {self.status_code}")


@pytest.mark.parametrize(
    ("source", "expected"),
    [
        ("1706.03762", "arxiv_id"),
        ("https://arxiv.org/abs/1706.03762", "arxiv_url"),
        ("https://openreview.net/forum?id=abc123", "openreview_page"),
        ("https://openreview.net/pdf?id=abc123", "openreview_pdf"),
        ("10.5555/3295222.3295349", "doi"),
        ("https://example.com/paper", "unsupported_url"),
        (str(SAMPLE_LOCAL_PAPER), "local_pdf"),
    ],
)
def test_detect_source_kind(source: str, expected: str):
    assert fetch_paper.detect_source_kind(source) == expected


def test_local_pdf_processes_fixture(tmp_path: Path):
    metadata = fetch_paper.process_source(str(SAMPLE_LOCAL_PAPER), tmp_path)

    assert metadata["source_kind"] == "local_pdf"
    assert metadata["paper_key"] == "sample_local_paper"
    assert metadata["title"] == "Sparse Memory Routing for Industrial Anomaly Detection"
    assert metadata["authors"] == ["Lin Qiao", "Mira Patel"]
    assert (tmp_path / "sample_local_paper" / "paper_text.md").exists()
    assert (tmp_path / "sample_local_paper" / "paper_metadata.json").exists()
    assert (tmp_path / "sample_local_paper" / "paper.pdf").exists()


def test_doi_input_is_rejected(tmp_path: Path):
    with pytest.raises(fetch_paper.SourceResolutionError, match="DOI-only input is intentionally unsupported"):
        fetch_paper.process_source("10.5555/3295222.3295349", tmp_path)


def test_openreview_page_resolves_pdf_and_metadata(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    pdf_bytes = SAMPLE_LOCAL_PAPER.read_bytes()
    html = """
    <html>
      <head>
        <meta name="citation_title" content="OpenReview Sparse Routing" />
        <meta name="citation_author" content="Lin Qiao" />
        <meta name="citation_author" content="Mira Patel" />
        <meta name="description" content="A paper about sparse memory routing." />
      </head>
      <body>
        <a href="/pdf?id=abc123">PDF</a>
        <a href="https://github.com/example/openreview-routing">code</a>
      </body>
    </html>
    """

    def fake_get(url: str, timeout: int = 30):
        _ = timeout
        if url == "https://openreview.net/forum?id=abc123":
            return DummyResponse(text=html)
        if url == "https://openreview.net/pdf?id=abc123":
            return DummyResponse(content=pdf_bytes)
        raise AssertionError(f"Unexpected URL: {url}")

    monkeypatch.setattr(fetch_paper.requests, "get", fake_get)

    metadata = fetch_paper.process_source("https://openreview.net/forum?id=abc123", tmp_path)

    assert metadata["source_kind"] == "openreview_page"
    assert metadata["paper_url"] == "https://openreview.net/forum?id=abc123"
    assert metadata["resolved_pdf_url"] == "https://openreview.net/pdf?id=abc123"
    assert metadata["title"] == "OpenReview Sparse Routing"
    assert metadata["authors"] == ["Lin Qiao", "Mira Patel"]
    assert metadata["official_code"][0]["url"] == "https://github.com/example/openreview-routing"
    assert (tmp_path / "openreview_abc123" / "paper.pdf").exists()


def test_openreview_pdf_direct_flow(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    pdf_bytes = SAMPLE_LOCAL_PAPER.read_bytes()

    def fake_get(url: str, timeout: int = 30):
        _ = timeout
        if url == "https://openreview.net/pdf?id=def456":
            return DummyResponse(content=pdf_bytes)
        raise AssertionError(f"Unexpected URL: {url}")

    monkeypatch.setattr(fetch_paper.requests, "get", fake_get)

    metadata = fetch_paper.process_source("https://openreview.net/pdf?id=def456", tmp_path)

    assert metadata["source_kind"] == "openreview_pdf"
    assert metadata["paper_url"] == "https://openreview.net/forum?id=def456"
    assert metadata["resolved_pdf_url"] == "https://openreview.net/pdf?id=def456"
    assert metadata["title"] == "Sparse Memory Routing for Industrial Anomaly Detection"


def test_openreview_page_without_pdf_fails(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    html = "<html><head><title>OpenReview</title></head><body>No PDF here.</body></html>"

    def fake_get(url: str, timeout: int = 30):
        _ = timeout
        if url == "https://openreview.net/forum":
            return DummyResponse(text=html)
        raise AssertionError(f"Unexpected URL: {url}")

    monkeypatch.setattr(fetch_paper.requests, "get", fake_get)

    with pytest.raises(fetch_paper.SourceResolutionError, match="did not expose a resolvable PDF"):
        fetch_paper.process_source("https://openreview.net/forum", tmp_path)


def test_arxiv_regression_path_uses_existing_flow(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    pdf_bytes = SAMPLE_LOCAL_PAPER.read_bytes()

    monkeypatch.setattr(
        fetch_paper,
        "fetch_metadata",
        lambda arxiv_id: {
            "title": "Attention Is All You Need",
            "authors": ["Ashish Vaswani", "Noam Shazeer"],
            "abstract": "We propose the Transformer architecture.",
            "categories": ["cs.CL", "cs.LG"],
            "year": 2017,
        },
    )
    monkeypatch.setattr(fetch_paper, "download_binary", lambda url: pdf_bytes)
    monkeypatch.setattr(
        fetch_paper,
        "extract_with_pymupdf4llm",
        lambda path: "# Attention Is All You Need\n\nA stable extracted paper body with the common words the and of in context.",
    )
    monkeypatch.setattr(fetch_paper, "check_text_quality", lambda text: True)

    def fake_get(url: str, timeout: int = 30):
        _ = timeout
        if url == "https://arxiv.org/abs/1706.03762":
            return DummyResponse(text='<html><a href="https://github.com/example/transformer">code</a></html>')
        raise AssertionError(f"Unexpected URL: {url}")

    monkeypatch.setattr(fetch_paper.requests, "get", fake_get)

    metadata = fetch_paper.process_source("1706.03762", tmp_path)

    assert metadata["source_kind"] == "arxiv_id"
    assert metadata["paper_url"] == "https://arxiv.org/abs/1706.03762"
    assert metadata["resolved_pdf_url"] == "https://arxiv.org/pdf/1706.03762.pdf"
    assert metadata["title"] == "Attention Is All You Need"
    assert metadata["official_code"][0]["url"] == "https://github.com/example/transformer"
