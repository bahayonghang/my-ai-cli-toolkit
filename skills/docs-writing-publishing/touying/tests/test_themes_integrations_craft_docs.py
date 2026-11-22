"""TDD contract tests for Touying 0.8.0 themes, notes, integrations, and visual craft (#58)."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
REFS_DIR = SKILL_ROOT / "references"
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def _extract_relative_md_links(md_path: Path) -> set[str]:
    text = md_path.read_text(encoding="utf-8")
    resolved: set[str] = set()
    for raw in LINK_RE.findall(text):
        target = raw.strip().split("#", 1)[0]
        if not target or target.startswith(("http://", "https://")) or not target.endswith(".md"):
            continue
        rel = (md_path.parent / target).resolve().relative_to(SKILL_ROOT.resolve()).as_posix()
        resolved.add(rel)
    return resolved


def _assert_not_recommended(test_case: unittest.TestCase, text: str, token_pattern: str, context_label: str) -> None:
    regex = re.compile(token_pattern)
    prohibition_re = re.compile(
        r"(不要|禁止|禁用|勿|切勿|不要再|已移除|已废弃|废弃|弃用|替代|旧版|legacy|removed|deprecated|ban|banned|forbid|never|do not|instead of|not\b|旧语法)",
        re.IGNORECASE,
    )
    for lineno, line in enumerate(text.splitlines(), start=1):
        if regex.search(line):
            test_case.assertRegex(
                line,
                prohibition_re,
                f"{context_label} line {lineno} mentions banned/removed `{token_pattern}` without negation: {line}",
            )


class TouyingWave2ThemesIntegrationsCraftTests(unittest.TestCase):
    def test_required_reference_files_exist_and_are_routed(self) -> None:
        expected_refs = (
            "references/themes-notes-export.md",
            "references/integrations.md",
            "references/visual-craft.md",
        )
        for rel in expected_refs:
            path = SKILL_ROOT / rel
            self.assertTrue(path.is_file(), f"missing reference file: {rel}")

        skill_md = SKILL_ROOT / "SKILL.md"
        skill_text = skill_md.read_text(encoding="utf-8")
        self.assertLess(
            len(skill_text.encode("utf-8")),
            10_000,
            "SKILL.md UTF-8 size must stay under 10 KB",
        )
        skill_links = _extract_relative_md_links(skill_md)
        for rel in expected_refs:
            self.assertIn(rel, skill_links, f"SKILL.md must route to {rel}")

        troubleshooting_md = REFS_DIR / "troubleshooting.md"
        self.assertTrue(troubleshooting_md.is_file())
        trouble_links = _extract_relative_md_links(troubleshooting_md)
        for rel in expected_refs:
            self.assertIn(rel, trouble_links, f"references/troubleshooting.md must link to {rel}")

    def test_themes_notes_export_contract(self) -> None:
        path = REFS_DIR / "themes-notes-export.md"
        text = path.read_text(encoding="utf-8")

        # All 8 bundled themes + theme-specific caveats
        for token in (
            "default",
            "simple",
            "metropolis",
            "outline-slide",
            "dewdrop",
            "outline-title",
            "university",
            "aqua",
            "stargazer",
            "footer-right",
            "themes.article",
        ):
            self.assertIn(token, text, f"themes-notes-export.md missing `{token}`")

        self.assertRegex(
            text,
            re.compile(r"outline-title.{0,40}(不存在|没有|does not exist|not a parameter|无效|removed)", re.IGNORECASE),
            "must note dewdrop outline-title does not exist",
        )
        self.assertRegex(
            text,
            re.compile(r"footer-right.{0,50}(不存在|没有|does not exist|not exist|未定义)", re.IGNORECASE),
            "must note stargazer footer/footer-right params do not exist",
        )

        # config-info, appendix vs freeze-slide-counter vs <touying:hidden>, overflow & components
        for token in (
            "config-info",
            "contact",
            "extra",
            "appendix",
            "freeze-slide-counter",
            "<touying:hidden>",
            "detect-overflow: auto",
            "cols",
            "lazy-layout",
            "lazy-v",
            "lazy-h",
            "components.left-mid-right",
            "components.full-width-block",
        ):
            self.assertIn(token, text, f"themes-notes-export.md missing `{token}`")

        # Custom theme rules
        for token in (
            "touying-slide(",
            "setting:",
            "touying-fn-wrapper-raw",
            "place(hide(heading(",
            "utils.page-args-from-aspect-ratio",
            "utils.merge-dicts",
        ):
            self.assertIn(token, text, f"themes-notes-export.md missing custom-theme rule `{token}`")

        # Speaker notes, second screen (4 directions), bundle .pdfpc & multi-#document
        for token in (
            "#speaker-note",
            "receive-body-for-new-section-slide-fn: false",
            "show-notes-on-second-screen",
            "top",
            "bottom",
            "left",
            "right",
            "notes-fn",
            "touying-notes",
            "--features bundle --format bundle",
            "#pdfpc.bundle-assets()",
            "#document(",
            "typst eval",
            "pympress",
            "Tinymist",
        ):
            self.assertIn(token, text, f"themes-notes-export.md missing speaker-note/export item `{token}`")

        # Bibliography as footnote & CSL note caution
        for token in (
            "show-bibliography-as-footnote: true",
            "#bibliography",
            'only("h", bibliography',
            "footnote-style",
            "chicago-notes",
        ):
            self.assertIn(token, text, f"themes-notes-export.md missing bibliography item `{token}`")

        # Ensure removed APIs and invalid dict footnote-style are never recommended
        self.assertNotRegex(
            text,
            r"footnote-style:\s*\(",
            "themes-notes-export.md must not pass a dictionary to config-common(footnote-style:)",
        )
        _assert_not_recommended(self, text, r"config-methods\s*\(\s*show-only-notes\s*:", "themes-notes-export.md")
        _assert_not_recommended(self, text, r"magic\.bibliography\s*\(", "themes-notes-export.md")

    def test_integrations_contract(self) -> None:
        path = REFS_DIR / "integrations.md"
        text = path.read_text(encoding="utf-8")

        for token in (
            "touying-reducer-bindings",
            "module =>",
            "touying-reduce",
            "touying-reducer",
            "CeTZ",
            "Fletcher",
            "Lilaq",
            "Alchemist",
            "lq.diagram",
            "skeletize",
            "Codly",
            "Theorion",
            "theorem-counter",
            "Pinit",
            "MiTeX",
            "touying-mitex",
            "touying-exporter",
            "utils.get-input",
            "tylina",
            "gistd",
        ):
            self.assertIn(token, text, f"integrations.md missing `{token}`")

        # Legacy reducer array-path syntax and `(uncover(..),)` callback array syntax must only appear as banned/prohibited
        _assert_not_recommended(self, text, r'\(\s*"canvas"\s*,?\s*\)', "integrations.md")
        _assert_not_recommended(self, text, r'\(\s*"draw"\s*,\s*"hide"', "integrations.md")
        _assert_not_recommended(self, text, r'\(\s*uncover\s*\(', "integrations.md")

    def test_visual_craft_contract(self) -> None:
        path = REFS_DIR / "visual-craft.md"
        text = path.read_text(encoding="utf-8")

        for token in (
            "视觉隐喻",
            "拓扑",
            "叙事语法",
            "参数",
            "Palette",
            "不要做",
        ):
            self.assertIn(token, text, f"visual-craft.md missing `{token}`")

        # Bullet-only cap & consecutive same-topology cap
        self.assertRegex(text, r"(列表|bullet).{0,30}(上限|cap|<=|不超过)", "must specify bullet-only cap")
        self.assertRegex(text, r"(连续|consecutive).{0,30}(同拓扑|same-topology|相同|上限|<=|不超过)", "must specify consecutive same-topology cap")

        # 3 direction prototypes on real content + must NOT hardcode fixed palette
        self.assertRegex(text, r"3\s*(个|种)?.*?(方向|原型|direction|prototype)", "must specify 3 restrained direction prototypes")
        self.assertRegex(text, r"(写死|固定|hardcode).{0,40}(配色|色板|palette|字体)", "must warn against hardcoding one palette/typography")

    def test_evals_include_ids_10_to_12(self) -> None:
        evals_path = SKILL_ROOT / "evals" / "evals.json"
        data = json.loads(evals_path.read_text(encoding="utf-8"))
        items = data.get("evals", [])
        by_id = {item.get("id"): item for item in items if isinstance(item, dict)}

        for eid in (10, 11, 12):
            self.assertIn(eid, by_id, f"evals/evals.json missing id {eid}")
            entry = by_id[eid]
            for field in ("prompt", "expected_output", "files", "assertions"):
                self.assertIn(field, entry)
            self.assertIsInstance(entry["assertions"], list)
            self.assertGreaterEqual(len(entry["assertions"]), 2)

        text_10 = json.dumps(by_id[10], ensure_ascii=False)
        self.assertIn("notes-fn", text_10)
        self.assertIn(".pdfpc", text_10)

        text_11 = json.dumps(by_id[11], ensure_ascii=False)
        self.assertIn("touying-reducer", text_11)
        self.assertIn("module =>", text_11)

        text_12 = json.dumps(by_id[12], ensure_ascii=False)
        self.assertRegex(text_12, r"(视觉隐喻|visual metaphor|拓扑|layout diversity|原型|prototype)")


if __name__ == "__main__":
    unittest.main()
