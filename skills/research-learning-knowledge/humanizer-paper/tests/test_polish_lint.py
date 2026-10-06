#!/usr/bin/env python3
"""Stdlib unittest for polish_lint.py.

Collected by `just python-test`. Do not add pytest.
"""

from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "polish_lint.py"

spec = importlib.util.spec_from_file_location("polish_lint", SCRIPT)
assert spec is not None and spec.loader is not None
polish_lint = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = polish_lint
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


class PolishLintTests(unittest.TestCase):
    def test_en_surface_tells(self) -> None:
        payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
        surface = payload["surface"]
        self.assertEqual(len(surface["em_dash"]), 1)
        self.assertEqual(len(surface["curly_quotes"]), 2)
        self.assertEqual(len(surface["title_case_headings"]), 1)
        ai_words = {hit["match"] for hit in surface["ai_words"]}
        self.assertTrue({"delve", "intricate", "leveraging", "robust"} <= ai_words)
        self.assertEqual(len(surface["ghost_citations"]), 1)

    def test_en_low_burstiness_flag(self) -> None:
        payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
        self.assertTrue(payload["cadence"]["low_burstiness"])

    def test_zh_surface_and_connectors(self) -> None:
        payload = polish_lint.analyze(ZH_SAMPLE, "zh-dissertation", None)
        surface = payload["surface"]
        connectors = {hit["match"] for hit in surface["zh_short_connectors"]}
        self.assertTrue({"首先，", "其次，", "综上，"} <= connectors)
        self.assertEqual(len(surface["ghost_citations"]), 1)
        self.assertTrue(any(hit["match"] == "赋能" for hit in surface["ai_words"]))
        self.assertEqual(len(surface["curly_quotes"]), 2)

    def test_zh_over_long_sentence(self) -> None:
        payload = polish_lint.analyze(ZH_SAMPLE, "zh-dissertation", None)
        cadence = payload["cadence"]
        self.assertEqual(cadence["over_long_threshold"], 28)
        self.assertGreaterEqual(cadence["over_long_count"], 1)

    def test_glossary_variant_hits(self) -> None:
        text = "卷积神经网络表现良好。该深度网络参数较少。此卷积模型准确率高。\n"
        with tempfile.TemporaryDirectory() as tmp:
            glossary = Path(tmp) / "glossary.txt"
            glossary.write_text("卷积神经网络: 深度网络, 卷积模型\n", encoding="utf-8")
            payload = polish_lint.analyze(text, "zh-dissertation", str(glossary))
        terms = payload["terms"]
        self.assertEqual(terms["mode"], "glossary")
        variants = {hit["variant"] for hit in terms["variant_hits"]}
        self.assertTrue({"深度网络", "卷积模型"} <= variants)

    def test_terms_without_glossary_is_labeled_non_semantic(self) -> None:
        payload = polish_lint.analyze(EN_SAMPLE, "en-journal", None)
        terms = payload["terms"]
        self.assertEqual(terms["mode"], "candidates")
        self.assertFalse(terms["semantic"])


if __name__ == "__main__":
    unittest.main()
