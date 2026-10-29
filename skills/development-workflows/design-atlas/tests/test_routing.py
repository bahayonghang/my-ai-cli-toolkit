#!/usr/bin/env python3
"""Tests for design-atlas routing: overlay, signals, scoring, picks, and the CLI."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
CATALOG = SKILL_ROOT / "assets" / "catalog"
CLI = SKILL_ROOT / "scripts" / "design_catalog.py"
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

import design_catalog as dc  # noqa: E402

# (prompt, acceptable top-1 ids). Half Chinese, half English.
FIXTURES: list[tuple[str, set[str]]] = [
    ("经营分析 BI 看板", {"scene:bi"}),
    ("CLI 工具官网", {"theme:terminal", "theme:cobalt", "style:mono"}),
    ("精酿啤酒厂官网", {"theme:hedgerow", "theme:vellum", "theme:solstice"}),
    ("儿童编程夏令营报名", {"theme:werkstatt", "theme:hum", "style:friendly"}),
    ("AI 语音合成 API", {"theme:lumen", "theme:cobalt", "theme:bloom", "theme:midnight"}),
    ("摄影师作品集网站", {"theme:darkroom", "theme:studio", "theme:atelier"}),
    ("家庭用药提醒小程序", {"theme:dose"}),
    ("独立咖啡烘焙店官网", {"theme:vellum", "theme:spore", "style:cafe"}),
    ("本地新闻周报网站", {"theme:newsprint", "theme:editorial"}),
    ("滑雪场门票与雪况查询", {"theme:piste"}),
    ("财务团队的对账与月结工具", {"theme:dusk", "theme:coral"}),
    ("地铁换乘时刻表", {"theme:wayfind"}),
    ("手绘风格的读书笔记分享站", {"style:sketch", "style:doodle"}),
    ("Landing page for a CLI tool", {"theme:terminal", "theme:cobalt", "style:mono"}),
    ("Website for a craft brewery", {"theme:hedgerow", "theme:vellum", "theme:solstice"}),
    (
        "Sign-up page for a kids coding summer camp",
        {
            "theme:werkstatt", "theme:hum", "style:friendly", "style:lingo",
            "style:claymorphism",
        },
    ),
    ("A medication reminder app for families and carers", {"theme:dose"}),
    ("Portfolio for a black and white film photographer", {"theme:darkroom"}),
    ("Developer docs for a database SDK", {"theme:cobalt"}),
    (
        "Gig listings and tickets for a live music venue",
        {"theme:overprint", "theme:pasteup", "theme:carnival", "theme:arcade"},
    ),
    ("Kiln temperature monitor for a ceramics studio", {"theme:kiln"}),
    ("Weekly fruit and veg box delivery", {"theme:squeeze", "theme:garden"}),
    ("Marathon training club with race results", {"theme:sport"}),
    ("Treasury payouts and reconciliation for finance teams", {"theme:dusk"}),
    ("Material samples library for interior architects", {"theme:terrazzo", "theme:blueprint"}),
    ("Business intelligence dashboard for sales KPIs", {"scene:bi"}),
    ("Launch page for a retro pixel arcade game", {"theme:arcade", "style:pacman", "style:sega"}),
]


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(CLI), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


class RoutingBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index = dc.load_index()
        cls.items = dc.enrich(cls.index)
        cls.overlay = dc.load_overlay()

    def route(self, prompt: str, **kwargs) -> dict:
        return dc.route(self.items, self.overlay, prompt=prompt, **kwargs)


class FixtureRoutingTests(RoutingBase):
    def test_fixture_count_and_language_split(self) -> None:
        self.assertGreaterEqual(len(FIXTURES), 24)
        chinese = sum(bool(dc.HAN.search(prompt)) for prompt, _ in FIXTURES)
        self.assertGreaterEqual(chinese, len(FIXTURES) // 2)

    def test_top_pick_is_acceptable(self) -> None:
        for prompt, accept in FIXTURES:
            with self.subTest(prompt=prompt):
                result = self.route(prompt)
                top = result["picks"][0]["id"]
                self.assertIn(top, accept, json.dumps(result["picks"], ensure_ascii=False))

    def test_law_firm_routes_to_editorial_or_modern_minimal(self) -> None:
        for prompt in ("律所官网", "Website for a law firm"):
            with self.subTest(prompt=prompt):
                pick = self.route(prompt)["picks"][0]
                record = next(
                    r for r in dc.routable(self.items, self.overlay) if r["id"] == pick["id"]
                )
                self.assertIn(record["genre"], {"editorial", "modern-minimal"})
                self.assertGreater(pick["parts"]["kw"], 0)

    def test_top_three_clusters_are_distinct(self) -> None:
        for prompt, _ in FIXTURES:
            with self.subTest(prompt=prompt):
                picks = self.route(prompt)["picks"]
                self.assertEqual(len(picks), 3)
                clusters = [p["cluster"] for p in picks]
                self.assertEqual(len(set(clusters)), 3, clusters)


class DeterminismTests(RoutingBase):
    def test_same_input_same_json(self) -> None:
        for prompt in ("精酿啤酒厂官网", "Developer docs for a database SDK", "随便做个页面"):
            first = run("route", "--prompt", prompt, "--format", "json")
            second = run("route", "--prompt", prompt, "--format", "json")
            self.assertEqual(first.returncode, 0, first.stderr)
            self.assertEqual(first.stdout, second.stdout)

    def test_reroll_changes_top_pick(self) -> None:
        for prompt, _ in FIXTURES[:6]:
            with self.subTest(prompt=prompt):
                zero = self.route(prompt, reroll=0)["picks"]
                one = self.route(prompt, reroll=1)["picks"]
                self.assertNotEqual(zero[0]["id"], one[0]["id"])
                self.assertFalse({p["id"] for p in zero} & {p["id"] for p in one})

    def test_no_hit_falls_back_by_genre_with_low_confidence(self) -> None:
        proc = run("route", "--prompt", "zzqx", "--format", "json")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        result = json.loads(proc.stdout)
        self.assertEqual(result["confidence"], "low")
        self.assertEqual(result["genre"], "editorial")
        self.assertEqual(len(result["picks"]), 3)
        self.assertTrue(all(p["parts"]["kw"] == 0 for p in result["picks"]))

    def test_empty_routable_set_exits_1(self) -> None:
        proc = run("route", "--prompt", "x", "--kind", "scene", "--reroll", "1")
        self.assertEqual(proc.returncode, 1)
        self.assertIn("nothing routable", proc.stderr)

    def test_bad_args_exit_2(self) -> None:
        self.assertEqual(run("route", "--prompt", "x", "--n", "0").returncode, 2)
        self.assertEqual(run("route", "--prompt", "x", "--reroll", "-1").returncode, 2)
        self.assertEqual(run("route", "--prompt", "x", "--kind", "nope").returncode, 2)
        self.assertEqual(run("route").returncode, 2)
        self.assertEqual(
            run("route", "--prompt", "x", "--root", str(SKILL_ROOT / "missing")).returncode, 2
        )
        self.assertEqual(run("signals", "--root", str(SKILL_ROOT / "missing")).returncode, 2)

    def test_brands_only_with_flag(self) -> None:
        plain = self.route("in the style of linear")
        self.assertFalse(any(p["kind"] == "brand" for p in plain["picks"]))
        with_brands = self.route("in the style of linear", include_brands=True)
        self.assertEqual(with_brands["picks"][0]["id"], "brand:linear.app")

    def test_superseded_entries_are_not_routable(self) -> None:
        ids = {r["id"] for r in dc.routable(self.items, self.overlay)}
        self.assertNotIn("style:riso", ids)
        self.assertIn("theme:riso", ids)

    def test_text_output_names_next_apply(self) -> None:
        proc = run("route", "--prompt", "经营分析 BI 看板")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertTrue(proc.stdout.startswith("route: confidence high"))
        self.assertIn("1. scene:bi", proc.stdout)
        self.assertIn("next: apply scene:bi --root", proc.stdout)


class TextTests(unittest.TestCase):
    def test_stem_matches_hallmark(self) -> None:
        self.assertEqual(dc.stem("breweries"), "brewerie")
        self.assertEqual(dc.stem("running"), "runn")
        self.assertEqual(dc.stem("glass"), "glass")
        self.assertEqual(dc.stem("tickets"), "ticket")
        self.assertEqual(dc.stem("red"), "red")

    def test_stopwords_and_short_tokens(self) -> None:
        self.assertEqual(dc.tokens("Build a website for my AI app"), ["ai"])

    def test_genre_inference(self) -> None:
        self.assertEqual(dc.infer_genre("AI 语音合成 API", "", [])[0], "atmospheric")
        self.assertEqual(dc.infer_genre("儿童编程夏令营", "", [])[0], "playful")
        self.assertEqual(dc.infer_genre("精酿啤酒厂", "", [])[0], "editorial")
        self.assertEqual(dc.infer_genre("something", "", []), ("editorial", []))
        self.assertEqual(dc.infer_genre("", "", []), (None, []))
        self.assertEqual(dc.infer_genre("", "", ["dashboard"])[0], "modern-minimal")

    def test_parse_color_and_band(self) -> None:
        self.assertEqual(dc.paper_band(dc.parse_color("#0b0d12")[0]), "dark")
        self.assertEqual(dc.paper_band(dc.parse_color("#ffffff")[0]), "light")
        self.assertEqual(dc.paper_band(dc.parse_color("oklch(97% 0.01 86)")[0]), "light")
        self.assertEqual(dc.paper_band(dc.parse_color("oklch(0.24 0.03 158)")[0]), "dark")
        self.assertEqual(dc.paper_band(dc.parse_color("rgb(192, 192, 192)")[0]), "mid")
        self.assertEqual(dc.paper_band(dc.parse_color("0 0% 100%")[0]), "light")
        self.assertIsNone(dc.parse_color("var(--x)"))


def make_project(root: Path, *, css: str | None = None, package: dict | None = None) -> None:
    if package is not None:
        (root / "package.json").write_text(json.dumps(package), encoding="utf-8")
    if css is not None:
        (root / "src").mkdir()
        (root / "src" / "globals.css").write_text(css, encoding="utf-8")


DARK_CSS = """
:root {
  --color-bg: #0b0d12;
  --color-ink: #e8e8e8;
  --color-accent: oklch(0.7 0.15 60);
  --font-display: "Space Grotesk", sans-serif;
}
.dark { --color-bg: #ffffff; }
"""


class SignalTests(RoutingBase):
    def test_signals_reads_project_without_writing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_project(
                root,
                css=DARK_CSS,
                package={
                    "name": "acme-ops",
                    "description": "Operations console",
                    "keywords": ["observability"],
                    "dependencies": {"next": "15", "recharts": "2", "tailwindcss": "4"},
                },
            )
            (root / "README.md").write_text("# Acme\n" + "x" * 9000, encoding="utf-8")
            (root / "pyproject.toml").write_text("not = [valid", encoding="utf-8")
            before = sorted(p.as_posix() for p in root.rglob("*"))
            proc = run("signals", "--root", str(root), "--prompt", "看板")
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertEqual(before, sorted(p.as_posix() for p in root.rglob("*")))
            data = json.loads(proc.stdout)
            self.assertEqual(data["project"]["name"], "acme-ops")
            self.assertEqual(data["dependency_hints"], ["dashboard"])
            self.assertEqual(data["frameworks"], ["next"])
            self.assertTrue(data["tailwind"])
            self.assertEqual(data["palette"]["band"], "dark")
            self.assertEqual(data["palette"]["paper_var"], "--color-bg")
            self.assertEqual(data["palette"]["accent_var"], "--color-accent")
            self.assertEqual(data["palette"]["accent_hue"], 60)
            self.assertEqual(len(data["project"]["readme"]), 4096)
            self.assertIsNone(data["design_md"])
            self.assertTrue(any(n.startswith("pyproject.toml skipped") for n in data["notes"]))
            self.assertEqual(data["prompt"]["genre"], "modern-minimal")

    def test_empty_project_notes_missing_sources(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "design.md").write_text("x", encoding="utf-8")
            data = dc.collect_signals(Path(tmp))
            self.assertIn("package.json not found", data["notes"])
            self.assertIn("no CSS token layer found", data["notes"])
            self.assertIsNone(data["palette"])
            self.assertTrue(data["design_md"].endswith("design.md"))

    def test_dark_tokens_raise_dark_entries(self) -> None:
        prompt = "observability and monitoring for developers"
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_project(root, css=DARK_CSS)
            signals = dc.collect_signals(root)
        plain = dc.route(self.items, self.overlay, prompt=prompt, n=200)
        dark = dc.route(self.items, self.overlay, prompt=prompt, signals=signals, n=200)
        before = {p["id"]: p for p in plain["picks"]}
        after = {p["id"]: p for p in dark["picks"]}
        for entry_id, pick in after.items():
            delta = pick["score"] - before[entry_id]["score"]
            self.assertEqual(delta, 1 if pick["paper"] == "dark" else 0, entry_id)
        self.assertEqual(after["theme:console"]["parts"]["palette"], 1)
        self.assertEqual(dark["picks"][0]["paper"], "dark")
        self.assertIn("palette:dark", dark["signals_used"])

    def test_recharts_with_empty_prompt_routes_to_dashboard(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            make_project(root, package={"name": "x", "dependencies": {"recharts": "2"}})
            proc = run("route", "--prompt", "", "--root", str(root), "--format", "json")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        result = json.loads(proc.stdout)
        top = result["picks"][0]
        dashboard_words = set(dc.DEP_HINTS["dashboard"][1])
        record = next(r for r in dc.routable(self.items, self.overlay) if r["id"] == top["id"])
        self.assertTrue(dashboard_words & set(record["keywords_en"]), top["id"])
        self.assertEqual(top["parts"]["deps"], 1)
        self.assertIn("dependency:dashboard", result["signals_used"])


class OverlayTests(RoutingBase):
    def test_overlay_is_valid_and_matches_dedup(self) -> None:
        dedup = json.loads((CATALOG / "overlays" / "dedup.json").read_text(encoding="utf-8"))
        self.assertEqual(dc.validate_overlay(self.index, self.overlay, dedup), [])

    def test_every_routable_entry_has_a_cluster_and_genre(self) -> None:
        for record in dc.routable(self.items, self.overlay):
            self.assertIn(record["genre"], dc.GENRES, record["id"])
            self.assertTrue(record["cluster"], record["id"])
            self.assertTrue(record["keywords_en"], record["id"])

    def test_validator_catches_problems(self) -> None:
        dedup = json.loads((CATALOG / "overlays" / "dedup.json").read_text(encoding="utf-8"))
        broken = json.loads(json.dumps(self.overlay))
        del broken["entries"]["style:ant"]
        broken["entries"]["theme:arcade"]["cluster"] = "elsewhere"
        broken["entries"]["style:cafe"]["keywords_zh"].append("咖")
        broken["entries"]["style:bold"]["keywords_en"] = ["bold"]
        errors = "\n".join(dc.validate_overlay(self.index, broken, dedup))
        self.assertIn("style:ant: no overlay entry", errors)
        self.assertIn("theme:arcade: cluster elsewhere != dedup retro-arcade", errors)
        self.assertIn("needs 2+ Han characters", errors)
        self.assertIn("style:bold: 1 keywords_en", errors)

    def test_overlay_file_is_lf_utf8(self) -> None:
        raw = (CATALOG / "overlays" / "routing.json").read_bytes()
        self.assertNotIn(b"\r\n", raw)
        self.assertTrue(raw.endswith(b"\n"))
        for line in raw.decode("utf-8").splitlines():
            self.assertEqual(line, line.rstrip())


if __name__ == "__main__":
    unittest.main()
