#!/usr/bin/env python3
"""Tests for build_catalog.py. Fixtures are generated in a temp directory.

Do not commit fixture files named SKILL.md: the docs catalog sync and
scripts/check.py collect every SKILL.md under skills/.
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
BUILD = SKILL_ROOT / "scripts" / "build_catalog.py"

CATEGORIES = {
    "categories": [
        {"id": "brand-ai", "kind": "brand", "en": "AI", "zh": "AI", "order": 1},
        {
            "id": "brand-retro",
            "kind": "brand",
            "en": "Retro Web",
            "zh": "复古网页",
            "order": 2,
        },
        {"id": "style-min", "kind": "style", "en": "Minimal", "zh": "极简", "order": 3},
    ],
    "brand": {
        "readme_heading_prefixes": [
            ["AI Platforms", "brand-ai"],
            ["Retro Web", "brand-retro"],
        ],
        "overrides": {"extra": "brand-ai"},
    },
    "style": {"style-min": ["calm", "plain"]},
}

README = """# Awesome

## Collection

### AI Platforms

- [**Acme AI**](https://getdesign.md/acme/design-md) - Acme model host. Calm blue

### Retro Web · Nostalgia

- [**Old Site**](https://getdesign.md/old/design-md) - Old portal. Beveled chrome
"""

BRAND_STITCH = """---
version: alpha
name: Acme
description: Acme blue system.
colors:
  primary: "#0000ff"
---

## Overview

Acme overview.
"""

BRAND_LEGACY = (
    "# Design System Inspired by Old\r\n\r\n## 1. Visual Theme\r\n\r\nOld text.   \r\n"
)

BRAND_EXTRA = """---
version: alpha
name: Extra-design-analysis
description: An extra brand. Second sentence.
---

## Overview

Extra.
"""


def style_skill(slug: str, brand: str) -> str:
    return f"""---
name: {slug}
description: "{slug.title()} style description."
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# {slug} Design System Skill (Universal)

## Mission
You are an expert.

## Brand
{brand}

## Style Foundations
- Visual style: {slug}

## Accessibility
WCAG 2.2 AA

## Writing Tone
concise

## Rules: Do
- prefer semantic tokens

## Rules: Don't
- avoid low contrast text

## Expected Behavior
- Follow the foundations first.

## Guideline Authoring Workflow
1. Restate the design intent.

<!-- TYPEUI_SH_MANAGED_END -->
"""


def style_design(slug: str) -> str:
    return f"""---
name: {slug.title()}
colors:
  primary: "#111111"
---

## Overview

{slug.title()} style description.

## Style Foundations

- **Visual style:** {slug}

## Colors

- **Primary (#111111):** Token.
"""


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def make_upstreams(
    root: Path, *, uncategorized: bool = False
) -> tuple[Path, Path, Path]:
    design_md = root / "awesome-design-md"
    write(design_md / "README.md", README)
    write(design_md / "LICENSE", "MIT License\n\nCopyright (c) VoltAgent  \n")
    write(design_md / "design-md" / "acme" / "DESIGN.md", BRAND_STITCH)
    write(design_md / "design-md" / "old" / "DESIGN.md", BRAND_LEGACY)
    write(design_md / "design-md" / "extra" / "DESIGN.md", BRAND_EXTRA)
    if uncategorized:
        write(design_md / "design-md" / "lost" / "DESIGN.md", BRAND_EXTRA)

    skills = root / "awesome-design-skills"
    write(skills / "LICENSE", "MIT License\n\nCopyright (c) Bergside\n")
    index = {}
    for slug, brand in (("calm", "Calm brand character text."), ("plain", "")):
        write(skills / "skills" / slug / "SKILL.md", style_skill(slug, brand))
        write(skills / "skills" / slug / "DESIGN.md", style_design(slug))
        index[slug] = {"slug": slug, "name": slug.title()}
    write(skills / "skills" / "index.json", json.dumps(index))

    out = root / "out"
    write(out / "categories.json", json.dumps(CATEGORIES, ensure_ascii=False))
    return design_md, skills, out


def run_build(design_md: Path, skills: Path, out: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [
            sys.executable,
            str(BUILD),
            "--design-md",
            str(design_md),
            "--design-skills",
            str(skills),
            "--out",
            str(out),
            "--commit-design-md",
            "aaaaaaa",
            "--commit-design-skills",
            "bbbbbbb",
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


class BuildCatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_builds_index_and_entries(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 0, result.stderr)

        index = json.loads((out / "index.json").read_text(encoding="utf-8"))
        ids = [entry["id"] for entry in index["entries"]]
        self.assertEqual(
            ids, ["brand:acme", "brand:extra", "brand:old", "style:calm", "style:plain"]
        )
        by_id = {entry["id"]: entry for entry in index["entries"]}
        self.assertEqual(by_id["brand:acme"]["category"], "brand-ai")
        self.assertEqual(by_id["brand:acme"]["name"], "Acme AI")
        self.assertEqual(by_id["brand:acme"]["format"], "stitch")
        self.assertEqual(by_id["brand:old"]["category"], "brand-retro")
        self.assertEqual(by_id["brand:old"]["format"], "legacy")
        self.assertEqual(by_id["brand:extra"]["category"], "brand-ai")
        self.assertEqual(by_id["brand:extra"]["description"], "An extra brand.")
        self.assertEqual(by_id["style:calm"]["description"], "Calm style description.")
        self.assertEqual(index["sources"]["awesome-design-md"]["commit"], "aaaaaaa")
        self.assertTrue((out / "LICENSES" / "awesome-design-skills.LICENSE").is_file())

    def test_style_entry_keeps_style_sections_only(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        calm = (out / "styles" / "calm.md").read_text(encoding="utf-8")
        for heading in (
            "## Brand Character",
            "## Accessibility",
            "## Writing Tone",
            "## Do's and Don'ts",
            "### Do",
            "### Don't",
        ):
            self.assertIn(heading, calm)
        self.assertEqual(calm.count("## Style Foundations"), 1)
        for removed in (
            "Guideline Authoring Workflow",
            "Expected Behavior",
            "TYPEUI_SH_MANAGED",
            "## Mission",
        ):
            self.assertNotIn(removed, calm)
        plain = (out / "styles" / "plain.md").read_text(encoding="utf-8")
        self.assertNotIn("## Brand Character", plain)

    def test_output_is_normalized(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        for path in out.rglob("*"):
            if (
                path.is_file()
                and path.name != "categories.json"
                and path.suffix in {".md", ".json", ".LICENSE"}
            ):
                data = path.read_bytes()
                self.assertNotIn(b"\r", data, path)
                self.assertTrue(
                    data.endswith(b"\n") and not data.endswith(b"\n\n"), path
                )
                for line in data.decode("utf-8").split("\n"):
                    self.assertEqual(line, line.rstrip(), path)

    def test_rebuild_is_byte_identical(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        first = {p: p.read_bytes() for p in out.rglob("*") if p.is_file()}
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        second = {p: p.read_bytes() for p in out.rglob("*") if p.is_file()}
        self.assertEqual(first, second)

    def test_removes_stale_entries(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        write(out / "brands" / "gone.md", "stale\n")
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        self.assertFalse((out / "brands" / "gone.md").exists())

    def test_first_party_is_kept_and_other_stale_styles_are_removed(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        source = "---\nname: Airy\n---\n\n## Overview\n\nLight field.\n"
        entry = {
            "id": "style:airy-glass",
            "kind": "style",
            "slug": "airy-glass",
            "name": "轻盈毛玻璃",
            "category": "style-min",
            "description": "轻盈毛玻璃 is airy frosted glass.",
            "format": "stitch",
            "path": "styles/airy-glass.md",
            "source": "first-party",
            "upstream_path": "assets/catalog/first-party/airy-glass.md",
        }
        write(
            out / "first-party" / "manifest.json",
            json.dumps(entry, ensure_ascii=False, indent=2) + "\n",
        )
        write(out / "first-party" / "airy-glass.md", source)
        write(out / "styles" / "orphan.md", "stale style\n")
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 0, result.stderr)
        index = json.loads((out / "index.json").read_text(encoding="utf-8"))
        self.assertEqual(
            [item["id"] for item in index["entries"]],
            [
                "brand:acme",
                "brand:extra",
                "brand:old",
                "style:airy-glass",
                "style:calm",
                "style:plain",
            ],
        )
        self.assertEqual(
            (out / "styles" / "airy-glass.md").read_text(encoding="utf-8"), source
        )
        self.assertFalse((out / "styles" / "orphan.md").exists())
        self.assertNotIn("first-party", index["sources"])
        kept = next(
            item for item in index["entries"] if item["id"] == "style:airy-glass"
        )
        self.assertEqual(kept["source"], "first-party")
        self.assertEqual(kept["name"], "轻盈毛玻璃")

    def test_scene_manifest_array_appends_scene_and_removes_stale_scene_file(
        self,
    ) -> None:
        design_md, skills, out = make_upstreams(self.root)
        categories = json.loads((out / "categories.json").read_text(encoding="utf-8"))
        categories["categories"].append(
            {
                "id": "scene-analytics",
                "kind": "scene",
                "en": "Analytics and BI",
                "zh": "分析与 BI",
                "order": 19,
            }
        )
        write(out / "categories.json", json.dumps(categories, ensure_ascii=False))
        style_entry = {
            "id": "style:airy-glass",
            "kind": "style",
            "slug": "airy-glass",
            "name": "轻盈毛玻璃",
            "category": "style-min",
            "description": "轻盈毛玻璃 is airy frosted glass.",
            "format": "stitch",
            "path": "styles/airy-glass.md",
            "source": "first-party",
            "upstream_path": "assets/catalog/first-party/airy-glass.md",
        }
        scene_entry = {
            "id": "scene:bi",
            "kind": "scene",
            "slug": "bi",
            "name": "企业级 BI 工作台",
            "category": "scene-analytics",
            "description": "浅色、高信息密度的企业级 BI 工作台，用于经营分析和数据看板，覆盖 KPI、趋势、明细表和待办。",
            "format": "legacy",
            "path": "scenes/analytics/bi.md",
            "source": "first-party",
            "upstream_path": "assets/catalog/first-party/bi.md",
        }
        write(
            out / "first-party" / "manifest.json",
            json.dumps([style_entry, scene_entry], ensure_ascii=False, indent=2) + "\n",
        )
        write(
            out / "first-party" / "airy-glass.md",
            "---\nname: Airy\n---\n\n## Overview\n\nLight field.\n",
        )
        scene_source = "# 企业级 BI\r\n\r\n浅色工作台。   \r\n"
        write(out / "first-party" / "bi.md", scene_source)
        write(out / "scenes" / "analytics" / "stale.md", "stale scene\n")
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 0, result.stderr)
        index = json.loads((out / "index.json").read_text(encoding="utf-8"))
        ids = [item["id"] for item in index["entries"]]
        self.assertEqual(ids[-1], "scene:bi")
        self.assertIn("style:airy-glass", ids)
        spec = importlib.util.spec_from_file_location("design_md_build_catalog", BUILD)
        module = importlib.util.module_from_spec(spec)
        assert spec.loader is not None
        spec.loader.exec_module(module)
        expected = module.normalize(scene_source).encode("utf-8")
        self.assertEqual(
            (out / "scenes" / "analytics" / "bi.md").read_bytes(), expected
        )
        self.assertFalse((out / "scenes" / "analytics" / "stale.md").exists())
        self.assertEqual(
            (out / "first-party" / "bi.md").read_bytes(), scene_source.encode("utf-8")
        )
        self.assertTrue((out / "first-party" / "manifest.json").is_file())

    def test_uncategorized_entry_fails(self) -> None:
        design_md, skills, out = make_upstreams(self.root, uncategorized=True)
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 1)
        self.assertIn("lost", result.stderr)
        self.assertFalse((out / "index.json").exists())


HALLMARK_THEMES = Path("skills") / "hallmark" / "references" / "themes"
THEME_CATEGORIES = [
    {
        "id": "theme-editorial",
        "kind": "theme",
        "en": "Editorial Themes",
        "zh": "主题·编辑出版",
        "order": 4,
    },
    {
        "id": "theme-playful",
        "kind": "theme",
        "en": "Playful Themes",
        "zh": "主题·活泼趣味",
        "order": 5,
    },
]
THEME_GENRES = {"editorial": "theme-editorial", "playful": "theme-playful"}


def theme_text(slug: str, genre: str, *, extra_ref: str = "") -> str:
    name = slug.title()
    return f"""---
name: {name}
slug: {slug}
genre: {genre}
paper: light 97 90
display: grotesk-heavy Cabinet Grotesk
accent: chromatic-pink 356
posture: committed
keywords: Zine, small press, {slug} word
material: bright stock, a blue drum, a pink drum
photo: duotone ink paper-2 con=14
pictured: Job Sheet, Stage hero
---

# {name}

A small-press run from two drums. It is not vector flatness.

## Tokens

```css
:root {{
  --color-paper: oklch(97% 0.011 90); --color-paper-2: oklch(93.5% 0.034 356); --color-paper-3: oklch(84% 0.11 356);
  --color-ink: oklch(40% 0.165 265); --color-ink-2: oklch(45% 0.15 265); --color-muted: oklch(50% 0.115 265);
  --color-rule: oklch(85% 0.045 265);
  --color-accent: oklch(68% 0.235 356); --color-accent-ink: oklch(27% 0.13 265); --color-focus: oklch(44% 0.2 265);
  --font-display: "Cabinet Grotesk", ui-sans-serif, sans-serif; --font-body: "Literata", ui-serif, Georgia, serif;
  --radius-card: 2px; --radius-pill: 2px; --rule-hair: 1px;
  --shadow-card: none; --texture-opacity: 0.08; --grain: url("data:image/svg+xml;a=1");
  --tracking-display: -0.025em; --display-weight: 800;
}}
```

Two colourways, stated in the stamp (`{slug}: paper`).

## Type

- **Display:** Cabinet Grotesk 800 (stamp `waive 38iii`), see `texture.md` § 3.
- Sizes come from the shared scale (`layout.md` § 2).{extra_ref}

## Surfaces

- Grain (`texture.md` § 1) under fills.

## Range

- Figures as overprint; compositions of `layout.md` § 5 set best (83).

## Controls

- A pink pair (`craft.md`).

## Motion

One reveal over `--dur-long`.

## Voice

Specific and hand-set.

## Do-nots

- Never black ink.

## Build hint

```html
<link href="https://fonts.googleapis.com/css2?family=Literata" rel="stylesheet">
```

```css
.btn {{ transition: transform var(--dur-short) var(--ease-out); }}
```
"""


def make_hallmark(
    root: Path, slugs=(("alpha", "editorial"), ("beta", "playful"))
) -> Path:
    hallmark = root / "hallmark"
    write(
        hallmark / "LICENSE",
        "MIT License\n\nCopyright (c) 2026 Hallmark contributors\n",
    )
    themes = hallmark / HALLMARK_THEMES
    write(themes / "README.md", "# Writing a theme file\n\nSee `layout.md`.\n")
    for slug, genre in slugs:
        write(themes / f"{slug}.md", theme_text(slug, genre))
    (themes / "alpha.jpg").write_bytes(b"\xff\xd8")
    return hallmark


def add_theme_config(out: Path, verdicts: dict | None = None) -> None:
    config = json.loads((out / "categories.json").read_text(encoding="utf-8"))
    config["categories"].extend(THEME_CATEGORIES)
    config["theme"] = {"genres": THEME_GENRES}
    write(out / "categories.json", json.dumps(config, ensure_ascii=False))
    if verdicts is None:
        verdicts = {
            "alpha": {
                "verdict": "supersede",
                "target": "style:calm",
                "reason": "Same two-drum print material as the calm fixture.",
            },
            "beta": {
                "verdict": "cluster",
                "cluster": "print",
                "with": ["style:plain"],
                "reason": "Same print family, different stock and face.",
            },
        }
    write(
        out / "overlays" / "dedup.json",
        json.dumps({"schema": 1, "verdicts": verdicts}, indent=2) + "\n",
    )


def run_cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(BUILD), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def run_full(
    design_md: Path, skills: Path, out: Path, hallmark: Path | None
) -> subprocess.CompletedProcess:
    args = [
        "--design-md",
        str(design_md),
        "--design-skills",
        str(skills),
        "--out",
        str(out),
        "--commit-design-md",
        "aaaaaaa",
        "--commit-design-skills",
        "bbbbbbb",
    ]
    if hallmark is not None:
        args += ["--hallmark", str(hallmark), "--commit-hallmark", "ccccccccc"]
    return run_cli(*args)


def run_themes_only(hallmark: Path, out: Path) -> subprocess.CompletedProcess:
    return run_cli(
        "--themes-only",
        "--hallmark",
        str(hallmark),
        "--out",
        str(out),
        "--commit-hallmark",
        "ccccccccc",
    )


class HallmarkThemeTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.design_md, self.skills, self.out = make_upstreams(self.root)
        self.hallmark = make_hallmark(self.root)
        add_theme_config(self.out)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def index(self) -> dict:
        return json.loads((self.out / "index.json").read_text(encoding="utf-8"))

    def test_full_build_converts_themes(self) -> None:
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 0, result.stderr)
        index = self.index()
        ids = [entry["id"] for entry in index["entries"]]
        self.assertEqual(ids[-2:], ["theme:alpha", "theme:beta"])
        by_id = {entry["id"]: entry for entry in index["entries"]}
        alpha = by_id["theme:alpha"]
        self.assertEqual(alpha["category"], "theme-editorial")
        self.assertEqual(alpha["format"], "theme")
        self.assertEqual(alpha["source"], "hallmark")
        self.assertEqual(alpha["description"], "A small-press run from two drums.")
        self.assertEqual(alpha["theme"]["paper"], {"band": "light", "L": 97, "hue": 90})
        self.assertEqual(
            alpha["theme"]["accent"], {"band": "chromatic-pink", "hue": 356}
        )
        self.assertEqual(alpha["theme"]["keywords"][:2], ["zine", "small press"])
        self.assertTrue(
            alpha["preview_url"].endswith(
                "/ccccccccc/skills/hallmark/references/themes/alpha.jpg"
            )
        )
        self.assertNotIn("preview_url", by_id["theme:beta"])
        self.assertEqual(by_id["style:calm"]["superseded_by"], "theme:alpha")
        self.assertEqual(by_id["style:plain"]["cluster"], "print")
        self.assertEqual(by_id["theme:beta"]["cluster"], "print")
        self.assertEqual(index["sources"]["hallmark"]["commit"], "ccccccccc")
        self.assertTrue((self.out / "LICENSES" / "hallmark.LICENSE").is_file())

        text = (self.out / "themes" / "alpha.md").read_text(encoding="utf-8")
        self.assertTrue(text.startswith('---\nversion: "alpha"\nname: "Alpha"\n'))
        self.assertIn('  primary: "oklch(68% 0.235 356)"', text)
        self.assertIn('  canvas: "oklch(97% 0.011 90)"', text)
        self.assertIn("    fontWeight: 800", text)
        self.assertIn("x-theme:", text)
        self.assertIn('    texture-opacity: "0.08"', text)
        self.assertIn('    grain: "url(\\"data:image/svg+xml;a=1\\")"', text)
        headings = [line for line in text.splitlines() if line.startswith("## ")]
        self.assertEqual(
            headings,
            [
                "## Overview",
                "## Colors",
                "## Typography",
                "## Layout",
                "## Elevation & Depth",
                "## Components",
                "## Motion",
                "## Voice",
                "## Do's and Don'ts",
                "## Implementation Hint",
                "## Known Gaps",
            ],
        )
        self.assertIn("`--dur-long`", text.split("## Known Gaps")[1])
        self.assertIn("`fonts.googleapis.com`", text)

    def test_references_are_rewritten(self) -> None:
        self.assertEqual(
            run_full(self.design_md, self.skills, self.out, self.hallmark).returncode, 0
        )
        text = (self.out / "themes" / "alpha.md").read_text(encoding="utf-8")
        self.assertIn("`references/texture.md` § 3", text)
        self.assertIn("(`references/texture.md` § 1)", text)
        for name in ("layout.md", "craft.md", "stated in the stamp", "stamp `waive"):
            self.assertNotIn(name, text)
        self.assertIn("Sizes come from the shared scale.", text)
        self.assertIn("compositions of the shared layout rules set best (83)", text)
        self.assertIn("- A pink pair.", text)
        self.assertIn("waiver `waive 38iii`", text)
        self.assertIn("stated in DESIGN.md", text)

    def test_unresolved_reference_fails(self) -> None:
        write(
            self.hallmark / HALLMARK_THEMES / "beta.md",
            theme_text("beta", "playful", extra_ref=" See `anatomy.md`."),
        )
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 1)
        self.assertIn("anatomy.md", result.stderr)
        self.assertFalse((self.out / "index.json").exists())

    def test_dedup_missing_slug_fails(self) -> None:
        add_theme_config(
            self.out,
            {"alpha": {"verdict": "distinct", "reason": "No catalog match at all."}},
        )
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 1)
        self.assertIn("no verdict for theme beta", result.stderr)
        self.assertFalse((self.out / "index.json").exists())

    def test_dedup_missing_target_fails(self) -> None:
        add_theme_config(
            self.out,
            {
                "alpha": {
                    "verdict": "supersede",
                    "target": "style:nope",
                    "reason": "Same material as nope.",
                },
                "beta": {"verdict": "distinct", "reason": "No catalog match at all."},
            },
        )
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 1)
        self.assertIn("style:nope", result.stderr)

    def test_dedup_short_reason_fails(self) -> None:
        add_theme_config(
            self.out,
            {
                "alpha": {"verdict": "distinct", "reason": "short"},
                "beta": {"verdict": "distinct", "reason": "No catalog match at all."},
            },
        )
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 1)
        self.assertIn("alpha: reason", result.stderr)

    def test_upstream_index_mismatch_fails(self) -> None:
        upstream = {
            "themes": [
                {"slug": "alpha", "name": "Other"},
                {"slug": "beta", "name": "Beta"},
            ]
        }
        write(self.hallmark / HALLMARK_THEMES / "index.json", json.dumps(upstream))
        result = run_full(self.design_md, self.skills, self.out, self.hallmark)
        self.assertEqual(result.returncode, 1)
        self.assertIn("theme:alpha header name differs", result.stderr)

    def test_rebuild_with_themes_is_byte_identical(self) -> None:
        self.assertEqual(
            run_full(self.design_md, self.skills, self.out, self.hallmark).returncode, 0
        )
        first = {p: p.read_bytes() for p in self.out.rglob("*") if p.is_file()}
        self.assertEqual(
            run_full(self.design_md, self.skills, self.out, self.hallmark).returncode, 0
        )
        self.assertEqual(run_themes_only(self.hallmark, self.out).returncode, 0)
        second = {p: p.read_bytes() for p in self.out.rglob("*") if p.is_file()}
        self.assertEqual(first, second)
        for data in second.values():
            self.assertNotIn(b"\r", data)

    def test_themes_only_keeps_old_entries_and_files(self) -> None:
        self.assertEqual(
            run_full(self.design_md, self.skills, self.out, None).returncode, 0
        )
        before_index = self.index()
        before_files = {
            p: p.read_bytes()
            for folder in ("brands", "styles")
            for p in (self.out / folder).glob("*.md")
        }
        write(self.out / "themes" / "gone.md", "stale theme\n")
        result = run_themes_only(self.hallmark, self.out)
        self.assertEqual(result.returncode, 0, result.stderr)
        after = self.index()
        kept = [
            {k: v for k, v in entry.items() if k not in ("superseded_by", "cluster")}
            for entry in after["entries"]
            if entry["kind"] != "theme"
        ]
        self.assertEqual(kept, before_index["entries"])
        for path, data in before_files.items():
            self.assertEqual(path.read_bytes(), data, path)
        self.assertEqual(
            {k: v for k, v in after["sources"].items() if k != "hallmark"},
            before_index["sources"],
        )
        self.assertFalse((self.out / "themes" / "gone.md").exists())
        self.assertTrue((self.out / "themes" / "alpha.md").is_file())
        self.assertTrue((self.out / "overlays" / "dedup.json").is_file())

    def test_build_without_hallmark_keeps_themes(self) -> None:
        self.assertEqual(
            run_full(self.design_md, self.skills, self.out, self.hallmark).returncode, 0
        )
        before = (self.out / "index.json").read_bytes()
        result = run_full(self.design_md, self.skills, self.out, None)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("themes: kept (no --hallmark)", result.stdout)
        self.assertEqual((self.out / "index.json").read_bytes(), before)
        self.assertTrue((self.out / "themes" / "alpha.md").is_file())

    def test_themes_only_requires_hallmark(self) -> None:
        result = run_cli("--themes-only", "--out", str(self.out))
        self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main()
