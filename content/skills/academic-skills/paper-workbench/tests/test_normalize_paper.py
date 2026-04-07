#!/usr/bin/env python3
"""Tests for the paper-pdf-normalizer helper script."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path


SKILL_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = SKILL_DIR / "scripts"
SCRIPT = SCRIPTS_DIR / "normalize_paper.py"
FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_LOCAL_PAPER = FIXTURES_DIR / "sample_local_paper.pdf"

spec = importlib.util.spec_from_file_location("normalize_paper", SCRIPT)
assert spec is not None and spec.loader is not None
normalize_paper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalize_paper)


def run_python_script(script: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(script), *args],
        capture_output=True,
        text=True,
        check=True,
    )


def load_payload(*args: str) -> dict:
    completed = run_python_script(SCRIPT, *args)
    return json.loads(completed.stdout)


def test_local_pdf_normalizes_sample_fixture():
    payload = load_payload(
        "--source",
        str(SAMPLE_LOCAL_PAPER),
        "--fulltext",
        "never",
    )

    assert payload["schema_version"] == "paper-record"
    assert payload["status"] == "resolved"
    assert payload["source"]["input_kind"] == "local_pdf"
    assert payload["bibliography"]["title"] == "Sparse Memory Routing for Industrial Anomaly Detection"
    assert [author["name"] for author in payload["bibliography"]["authors"]] == ["Lin Qiao", "Mira Patel"]
    assert payload["bibliography"]["venue"] == "Workshop on Reliable Industrial AI 2025"
    assert payload["bibliography"]["doi"] is None
    assert payload["document"]["document_type"] == "conference-paper"
    assert payload["content"]["full_text_included"] is False


def test_master_thesis_fixture_sets_thesis_type():
    payload = normalize_paper.normalize_source(
        str(FIXTURES_DIR / "master_thesis.txt"),
        fulltext_mode="never",
    )

    assert payload["schema_version"] == "paper-record"
    assert payload["status"] == "resolved"
    assert payload["document"]["document_type"] == "thesis"
    assert payload["document"]["degree_level"] == "master"
    assert payload["document"]["language"] == "zh"
    assert payload["bibliography"]["title"] == "面向工业日志异常检测的稀疏记忆路由方法"
    assert payload["bibliography"]["keywords"] == ["工业日志", "异常检测", "记忆路由"]
    assert any("绪论" in section for section in payload["content"]["sections"])


def test_doctoral_thesis_fixture_sets_doctor_level():
    payload = normalize_paper.normalize_source(
        str(FIXTURES_DIR / "doctor_thesis.txt"),
        fulltext_mode="never",
    )

    assert payload["schema_version"] == "paper-record"
    assert payload["status"] == "resolved"
    assert payload["document"]["document_type"] == "thesis"
    assert payload["document"]["degree_level"] == "doctor"
    assert payload["bibliography"]["authors"][0]["name"] == "Mei Chen"
    assert payload["content"]["summary"]


def test_normalized_json_is_passthrough(tmp_path: Path):
    existing = normalize_paper.normalize_source(
        str(FIXTURES_DIR / "doctor_thesis.txt"),
        fulltext_mode="never",
    )
    json_path = tmp_path / "normalized.json"
    json_path.write_text(json.dumps(existing, ensure_ascii=False), encoding="utf-8")

    payload = normalize_paper.normalize_source(str(json_path))

    assert payload == existing


def test_doi_source_uses_crossref_metadata(monkeypatch):
    def fake_fetch_crossref_json(doi):
        _ = doi
        return {
            "title": ["Attention Is All You Need"],
            "author": [
                {"given": "Ashish", "family": "Vaswani"},
                {"given": "Noam", "family": "Shazeer"},
            ],
            "issued": {"date-parts": [[2017, 6, 12]]},
            "container-title": ["Neural Information Processing Systems"],
            "publisher": "Curran Associates, Inc.",
            "abstract": "We propose the Transformer architecture.",
            "subject": ["Machine Learning", "Attention"],
            "URL": "https://doi.org/10.5555/3295222.3295349",
            "resource": {"primary": {"URL": "https://papers.example.org/transformer"}},
        }

    monkeypatch.setattr(normalize_paper, "fetch_crossref_json", fake_fetch_crossref_json)

    payload = normalize_paper.normalize_source("10.5555/3295222.3295349", fulltext_mode="never")

    assert payload["schema_version"] == "paper-record"
    assert payload["source"]["input_kind"] == "doi"
    assert payload["bibliography"]["doi"] == "10.5555/3295222.3295349"
    assert payload["bibliography"]["title"] == "Attention Is All You Need"
    assert [author["name"] for author in payload["bibliography"]["authors"]] == ["Ashish Vaswani", "Noam Shazeer"]
    assert payload["bibliography"]["year"] == 2017
    assert payload["bibliography"]["venue"] == "Neural Information Processing Systems"
    assert payload["source"]["canonical_url"] == "https://doi.org/10.5555/3295222.3295349"
    assert payload["status"] in {"resolved", "partial"}


def test_arxiv_source_uses_alphaxiv_when_available(monkeypatch):
    def fake_fetch_json(url: str):
        if url.endswith("/papers/v3/1706.03762"):
            return {
                "title": "Attention Is All You Need",
                "abstract": "We propose the Transformer architecture.",
                "citationBibtex": (
                    "@Article{Vaswani2017AttentionIA,\n"
                    " author = {Ashish Vaswani and Noam Shazeer},\n"
                    " booktitle = {Neural Information Processing Systems},\n"
                    " title = {Attention Is All You Need},\n"
                    " year = {2017}\n"
                    "}\n"
                ),
                "versionId": "version-123",
            }
        if url.endswith("/papers/v3/version-123/overview/en"):
            return {
                "summary": {
                    "summary": "The Transformer replaces recurrence with attention.",
                    "originalProblem": ["RNNs train slowly."],
                    "solution": ["Use attention-only encoder-decoder stacks."],
                    "keyInsights": ["Parallel attention works."],
                    "results": ["Better BLEU with less training cost."],
                },
                "intermediateReport": "structured report",
                "citations": [{"title": "Seq2Seq"}],
            }
        raise AssertionError(f"Unexpected URL: {url}")

    def fake_fetch_text(url):
        _ = url
        return None

    monkeypatch.setattr(normalize_paper, "fetch_json", fake_fetch_json)
    monkeypatch.setattr(normalize_paper, "fetch_text", fake_fetch_text)

    payload = normalize_paper.normalize_source("1706.03762", fulltext_mode="never")

    assert payload["status"] == "resolved"
    assert payload["source"]["input_kind"] == "arxiv_id"
    assert payload["document"]["document_type"] == "preprint"
    assert payload["arxiv_enhancement"]["alphaxiv_available"] is True
    assert payload["content"]["summary"] == "The Transformer replaces recurrence with attention."
    assert payload["bibliography"]["venue"] == "Neural Information Processing Systems"


def test_generic_page_without_pdf_returns_unresolved(monkeypatch):
    def fake_http_get(url, binary=False):
        _ = binary
        return ("<html><title>Paper</title></html>", "text/html", url)

    monkeypatch.setattr(normalize_paper, "http_get", fake_http_get)

    payload = normalize_paper.normalize_source("https://example.com/paper", fulltext_mode="never")

    assert payload["status"] == "unresolved"
    assert payload["bibliography"]["title"] == "Paper"
    assert payload["errors"]
