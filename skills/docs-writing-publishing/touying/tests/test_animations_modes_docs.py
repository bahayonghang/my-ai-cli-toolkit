"""Tests for Touying 0.8.0 animations/waypoints and output-modes/article docs (#57)."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SKILL_MD = SKILL_ROOT / "SKILL.md"
TROUBLESHOOTING_MD = SKILL_ROOT / "references" / "troubleshooting.md"
ANIMATIONS_MD = SKILL_ROOT / "references" / "animations-waypoints.md"
OUTPUT_MODES_MD = SKILL_ROOT / "references" / "output-modes-article.md"
EVALS_JSON = SKILL_ROOT / "evals" / "evals.json"
TRIGGER_CASES_JSON = SKILL_ROOT / "evals" / "trigger_cases.json"

DEPRECATED_OR_REMOVED_PATTERNS = (
    ("touying-equation", re.compile(r"touying-equation")),
    ("semi-transparent-cover", re.compile(r"(?:utils\.)?semi-transparent-cover")),
    ("utils.handout-only", re.compile(r"utils\.handout-only")),
    (
        "touying-recall(..., subslide: ...)",
        re.compile(r"touying-recall\([^)]*\bsubslide\s*:"),
    ),
)

WARNING_LINE_RE = re.compile(
    r"(deprecated|removed|use instead|instead of|never|do not|don't|avoid|anti-pattern|replaced|legacy)",
    re.IGNORECASE,
)

CODE_BLOCK_RE = re.compile(r"```[^\n]*\n(.*?)```", re.DOTALL)


class TouyingAnimationsAndModesDocsTests(unittest.TestCase):
    def test_reference_files_exist_and_are_linked(self) -> None:
        self.assertTrue(ANIMATIONS_MD.is_file(), "references/animations-waypoints.md missing")
        self.assertTrue(OUTPUT_MODES_MD.is_file(), "references/output-modes-article.md missing")

        skill_text = SKILL_MD.read_text(encoding="utf-8")
        self.assertIn("references/animations-waypoints.md", skill_text)
        self.assertIn("references/output-modes-article.md", skill_text)
        self.assertLess(
            len(skill_text.encode("utf-8")),
            10_000,
            "SKILL.md must stay under 10 KB UTF-8 budget",
        )

        troubleshooting_text = TROUBLESHOOTING_MD.read_text(encoding="utf-8")
        self.assertIn("animations-waypoints.md", troubleshooting_text)
        self.assertIn("output-modes-article.md", troubleshooting_text)

    def test_animations_waypoints_coverage(self) -> None:
        self.assertTrue(ANIMATIONS_MD.is_file(), "references/animations-waypoints.md missing")
        text = ANIMATIONS_MD.read_text(encoding="utf-8")

        required_tokens = (
            "#jump",
            "#item-by-item",
            "#item-by-item-fn",
            "advances-flow",
            "#touying-raw",
            "#waypoint",
            "start:",
            "<part:intro>",
            "get-first",
            "get-last",
            "from-wp",
            "until-wp",
            "prev-wp",
            "next-wp",
            "not-wp",
            "<slide.waypoint>",
            "#animate",
            "#animate-hidden",
            "#animate-removed",
            "swap",
            "stretch",
            "#touying-render",
            "#touying-recall",
            "subslides:",
            "frac",
            "mat",
            "vec",
            "cases",
            "attach",
            "accent",
            "#measure",
            "alpha-changing-cover",
            "color-changing-cover",
            "cover-kind-query",
            '"-2"',
            '"!2-3"',
            '"h"',
        )
        for token in required_tokens:
            self.assertIn(token, text, f"animations-waypoints.md missing token: {token}")

        # 0.8.0 pause-after-uncover and negative int panic vs "-2" open range
        self.assertRegex(
            text,
            re.compile(r"#pause.*uncover|uncover.*#pause", re.IGNORECASE | re.DOTALL),
        )
        self.assertRegex(
            text,
            re.compile(r"negative.*panic|panic.*negative", re.IGNORECASE | re.DOTALL),
        )

    def test_output_modes_article_coverage(self) -> None:
        self.assertTrue(OUTPUT_MODES_MD.is_file(), "references/output-modes-article.md missing")
        text = OUTPUT_MODES_MD.read_text(encoding="utf-8")

        required_tokens = (
            '"slides"',
            '"presentation"',
            '"handout"',
            '"article"',
            "--input export-mode=",
            "utils.get-input",
            "#presentation-only",
            "#handout-only",
            "#slides-only",
            "#article-only",
            "#article-text",
            "<touying:presentation>",
            "<touying:handout>",
            "<touying:slides>",
            "<touying:article>",
            "<touying:never>",
            "config-article",
            "wrap",
            "linearize",
            "available-fields",
            "title-block-fn",
            "graphic-marker",
            "graphic-marker-of",
            "#article-linearize",
            "#article-keep-layout",
            "themes.article",
            "handout-subslides",
        )
        for token in required_tokens:
            self.assertIn(token, text, f"output-modes-article.md missing token: {token}")

        # Must NOT document nonexistent config-article keys from draft changelog
        self.assertNotIn("wrap-images", text)
        self.assertNotIn("wrap-width", text)

    def test_deprecated_apis_never_recommended_in_new_references(self) -> None:
        for path in (ANIMATIONS_MD, OUTPUT_MODES_MD):
            self.assertTrue(path.is_file(), f"missing reference file: {path.name}")
            text = path.read_text(encoding="utf-8")

            # Code blocks must never use deprecated/removed APIs in positive examples
            for block in CODE_BLOCK_RE.findall(text):
                for label, pattern in DEPRECATED_OR_REMOVED_PATTERNS:
                    self.assertIsNone(
                        pattern.search(block),
                        f"{path.name} code example uses deprecated/removed API {label}",
                    )

            # Any prose mention must appear strictly in an explicit warning/removal context
            for lineno, line in enumerate(text.splitlines(), start=1):
                for label, pattern in DEPRECATED_OR_REMOVED_PATTERNS:
                    if pattern.search(line):
                        self.assertRegex(
                            line,
                            WARNING_LINE_RE,
                            f"{path.name}:{lineno} mentions {label} outside deprecation/removal warning",
                        )

    def test_evals_include_ids_7_to_9_and_trigger_cases(self) -> None:
        evals_payload = json.loads(EVALS_JSON.read_text(encoding="utf-8"))
        evals = evals_payload.get("evals", [])
        by_id = {item.get("id"): item for item in evals if isinstance(item, dict)}
        for eval_id in (7, 8, 9):
            self.assertIn(eval_id, by_id, f"evals.json missing id {eval_id}")

        combined_new_evals = json.dumps([by_id[7], by_id[8], by_id[9]], ensure_ascii=False)
        self.assertRegex(combined_new_evals, re.compile(r"waypoint|#animate|animate", re.IGNORECASE))
        self.assertRegex(combined_new_evals, re.compile(r"frac|mat|native math|公式", re.IGNORECASE))
        self.assertRegex(combined_new_evals, re.compile(r"article|export-mode|config-article|handout", re.IGNORECASE))

        cases = json.loads(TRIGGER_CASES_JSON.read_text(encoding="utf-8"))
        should_trigger_text = json.dumps(cases.get("should_trigger", []), ensure_ascii=False)
        for token in ("waypoint", "#animate", "article", "export-mode"):
            self.assertRegex(
                should_trigger_text,
                re.compile(re.escape(token), re.IGNORECASE),
                f"trigger_cases.json should_trigger missing {token} coverage",
            )


if __name__ == "__main__":
    unittest.main()
