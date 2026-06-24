#!/usr/bin/env python3
"""Local smoke tests for polish_lint.py.

Optional and local only. `pytest` is not a declared repo dependency and is not
wired into `just ci` (CI runs `py_compile`, not test execution). Run manually:

    pytest skills/research-learning-knowledge/humanizer-paper
"""

from __future__ import annotations

import importlib.util
from pathlib import Path


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "polish_lint.py"

spec = importlib.util.spec_from_file_location("polish_lint", SCRIPT)
assert spec is not None and spec.loader is not None
polish_lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(polish_lint)


EN_SAMPLE = (
    "## Strategic Negotiations And Global Partnerships\n\n"
    "We delve into the intricate interplay between modules — leveraging a "
    "robust pipeline. Studies show that deeper networks generalize better. "
    "The model was trained for one hundred epochs here. "
    "The model was tested on three benchmark datasets here. "
    "The model reached the “best” accuracy of ninety percent. "
    "The model improved over the strong baseline by two points. "
    "The model showed consistent results across all the splits.\n"
)

ZH_SAMPLE = (
    "## 方法与结果\n\n"
    "首先，我们设计了自适应模块；其次，我们在数据集上训练了模型；"
    "再次，我们评估了模型性能；最后，我们分析了结果；综上，所提方法是有效的。"
    "研究表明，预训练能够显著提升下游任务的表现并在多个基准数据集上取得了远超"
    "以往所有传统方法的优异成绩。我们把它称为“自适应模块”，并赋能下游任务。\n"
)


def test_en_surface_tells():
    payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
    surface = payload["surface"]
    assert len(surface["em_dash"]) == 1
    assert len(surface["curly_quotes"]) == 2
    assert len(surface["title_case_headings"]) == 1
    ai_words = {hit["match"] for hit in surface["ai_words"]}
    assert {"delve", "intricate", "leveraging", "robust"} <= ai_words
    assert len(surface["ghost_citations"]) == 1


def test_en_low_burstiness_flag():
    payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
    assert payload["cadence"]["low_burstiness"] is True


def test_zh_surface_and_connectors():
    payload = polish_lint.analyze(ZH_SAMPLE, "zh-dissertation", None)
    surface = payload["surface"]
    connectors = {hit["match"] for hit in surface["zh_short_connectors"]}
    assert {"首先，", "其次，", "综上，"} <= connectors
    assert len(surface["ghost_citations"]) == 1
    assert any(hit["match"] == "赋能" for hit in surface["ai_words"])
    assert len(surface["curly_quotes"]) == 2


def test_zh_over_long_sentence():
    payload = polish_lint.analyze(ZH_SAMPLE, "zh-dissertation", None)
    cadence = payload["cadence"]
    assert cadence["over_long_threshold"] == 28
    assert cadence["over_long_count"] >= 1


def test_glossary_variant_hits():
    text = "卷积神经网络表现良好。该深度网络参数较少。此卷积模型准确率高。\n"
    glossary = SKILL_DIR / "tests" / "_tmp_glossary.txt"
    glossary.write_text("卷积神经网络: 深度网络, 卷积模型\n", encoding="utf-8")
    try:
        payload = polish_lint.analyze(text, "zh-dissertation", str(glossary))
    finally:
        glossary.unlink(missing_ok=True)
    terms = payload["terms"]
    assert terms["mode"] == "glossary"
    variants = {hit["variant"] for hit in terms["variant_hits"]}
    assert {"深度网络", "卷积模型"} <= variants


def test_terms_without_glossary_is_labeled_non_semantic():
    payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
    terms = payload["terms"]
    assert terms["mode"] == "candidates"
    assert terms["semantic"] is False
