#!/usr/bin/env python3
"""List, search, show, and apply design-atlas catalog entries.

Commands:
  list   [--kind brand|style|theme|scene] [--category ID] [--all] [--format text|json]
  search QUERY [--kind brand|style|theme|scene] [--all] [--format text|json]
  show   ID                      ID is kind:slug, or a slug when it is unique
  apply  ID [--root DIR] [--force]
  signals [--root DIR] [--prompt TEXT]
  route  --prompt TEXT [--root DIR] [--n 3] [--reroll N] [--kind K ...]
         [--include-brands] [--format text|json]

list and search hide entries that a theme supersedes; --all shows them with a
[superseded → theme:x] mark. show and apply still accept them and print a note
on stderr. search also matches theme keywords and material.

apply writes DIR/DESIGN.md (UTF-8, LF). An existing design.md in any letter
case stops the command with exit 3 unless --force is given; --force first
renames the old file to <name>.bak-YYYYMMDD-HHMMSS.

signals reads the project root (package.json, pyproject.toml, Cargo.toml, the
README head, CSS token blocks, Tailwind config, DESIGN.md) and prints JSON. It
never writes. Unreadable sources are listed in "notes".

route scores every routable entry (non-superseded style, theme, scene; brands
only with --include-brands) against the prompt and, with --root, the project
signals, then picks n entries with distinct clusters. The result is
deterministic: no date or random salt. See references/routing.md.

Exit codes: 0 success, 1 search found nothing or nothing is routable,
2 bad input, 3 refused overwrite.
"""

from __future__ import annotations

import argparse
import colorsys
import hashlib
import json
import math
import os
import re
import sys
from datetime import datetime
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "assets" / "catalog"
KINDS = ("brand", "style", "theme", "scene")


def load_index() -> dict:
    return json.loads((CATALOG / "index.json").read_text(encoding="utf-8"))


def enrich(index: dict) -> list[dict]:
    categories = {c["id"]: c for c in index["categories"]}
    items = []
    for entry in index["entries"]:
        category = categories[entry["category"]]
        items.append(
            {**entry, "category_en": category["en"], "category_zh": category["zh"]}
        )
    return items


def visible(items: list[dict], show_all: bool) -> list[dict]:
    if show_all:
        return items
    return [item for item in items if not item.get("superseded_by")]


def search_text(item: dict) -> list[str]:
    fields = [
        str(item[key])
        for key in ("id", "name", "description", "category_en", "category_zh")
    ]
    theme = item.get("theme") or {}
    fields.extend(theme.get("keywords", []))
    if theme.get("material"):
        fields.append(theme["material"])
    return fields


def print_grouped(index: dict, items: list[dict]) -> None:
    counts = ", ".join(
        f"{sum(item['kind'] == kind for item in items)} {kind}" for kind in KINDS
    )
    print(f"# design-atlas catalog: {len(items)} entries ({counts})")
    for category in sorted(index["categories"], key=lambda c: c["order"]):
        group = [item for item in items if item["category"] == category["id"]]
        if not group:
            continue
        print(
            f"\n## {category['zh']} / {category['en']} ({len(group)}) [{category['id']}]\n"
        )
        for item in group:
            mark = (
                f" [superseded → {item['superseded_by']}]"
                if item.get("superseded_by")
                else ""
            )
            print(f"- {item['id']} — {item['name']} — {item['description']}{mark}")


def emit(index: dict, items: list[dict], fmt: str) -> None:
    if fmt == "json":
        print(json.dumps(items, ensure_ascii=False, indent=2))
    else:
        print_grouped(index, items)


def resolve(entries: list[dict], wanted: str) -> dict:
    by_id = {entry["id"]: entry for entry in entries}
    if wanted in by_id:
        return by_id[wanted]
    matches = [entry for entry in entries if entry["slug"] == wanted]
    if len(matches) == 1:
        return matches[0]
    if matches:
        names = ", ".join(entry["id"] for entry in matches)
        raise LookupError(f"'{wanted}' is ambiguous: {names}")
    raise LookupError(f"unknown entry '{wanted}'; run the list or search command")


def provenance(index: dict, entry: dict) -> str:
    if entry["source"] == "first-party":
        return f"<!-- design-atlas: entry={entry['id']}; source=first-party; license=MIT -->"
    source = index["sources"][entry["source"]]
    return (
        f"<!-- design-atlas: entry={entry['id']}; source={source['repo']}@{source['commit'][:7]}; "
        f"license={source['license']} -->"
    )


def with_provenance(text: str, comment: str) -> str:
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            cut = end + len("\n---\n")
            return f"{text[:cut]}{comment}\n{text[cut:]}"
    return f"{comment}\n{text}"


def note_superseded(entry: dict) -> None:
    if entry.get("superseded_by"):
        print(
            f"note: {entry['id']} is superseded by {entry['superseded_by']}; "
            "continuing with the requested entry.",
            file=sys.stderr,
        )


def apply(index: dict, entry: dict, root: Path, force: bool) -> int:
    if not root.is_dir():
        print(f"error: --root is not a directory: {root}", file=sys.stderr)
        return 2
    existing = [
        path
        for path in root.iterdir()
        if path.is_file() and path.name.lower() == "design.md"
    ]
    if existing and not force:
        print(
            f"error: {existing[0]} already exists. Implement from it, or rerun with --force "
            "to back it up and replace it.",
            file=sys.stderr,
        )
        return 3
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    for path in existing:
        backup = path.with_name(f"{path.name}.bak-{stamp}")
        path.rename(backup)
        print(f"backup: {backup}")
    text = (CATALOG / entry["path"]).read_text(encoding="utf-8")
    target = root / "DESIGN.md"
    target.write_text(
        with_provenance(text, provenance(index, entry)), encoding="utf-8", newline="\n"
    )
    print(f"wrote: {target} ({entry['id']})")
    return 0


# ---------------------------------------------------------------------------
# Routing: overlay merge, project signals, scoring, and deterministic picks.
# The deal algorithm follows hallmark theme.mjs (keywords weighted by df,
# genre +2/-1, pickFrom diversity), with Chinese keywords, project signals,
# cluster diversity, and a sha256 tie-break instead of a dated random seed.
# ---------------------------------------------------------------------------

GENRES = ("editorial", "modern-minimal", "atmospheric", "playful")
ROUTABLE_KINDS = ("style", "theme", "scene")
ASK = {
    "build", "make", "create", "design", "need", "want", "please", "page", "site",
    "website", "landing", "called", "for", "and", "the", "with", "that", "this",
    "our", "your", "app", "ui", "a", "an", "of", "to", "in", "my", "we", "is",
}
GENRE_WORDS_EN = {
    "modern-minimal": [
        "saas", "enterprise", "api", "platform", "developer", "devtool", "infra",
        "infrastructure", "b2b", "dashboard", "billing", "sdk", "admin", "analytics",
        "fintech", "crm", "docs", "documentation", "database", "finance", "kpi",
        "compliance", "logistics", "clinic", "medication", "law", "legal", "cli",
        "devops", "shell", "observability", "monitoring",
    ],
    "atmospheric": [
        "ai", "generative", "music", "video", "image", "voice", "moody", "cinematic",
        "nocturnal", "night", "immersive", "3d", "film", "sleep", "ambient",
        "render", "llm", "model", "dark",
    ],
    "playful": [
        "playful", "fun", "friendly", "soft", "kids", "kid", "children", "child",
        "game", "games", "gaming", "community", "toy", "cute", "camp", "arcade",
        "zine", "gig", "gigs", "sticker",
    ],
    "editorial": [
        "magazine", "portfolio", "manifesto", "specimen", "agency", "podcast",
        "journal", "blog", "essay", "newspaper", "publication", "studio", "editorial",
        "brewery", "gallery", "photographer", "book", "news",
    ],
}
GENRE_WORDS_ZH = {
    "modern-minimal": [
        "企业", "平台", "开发者", "后台", "管理系统", "看板", "仪表盘", "金融", "对账",
        "财务", "接口", "运维", "文档", "数据库", "监控", "工具", "律所", "律师", "用药",
        "诊所", "交通", "物流", "经营分析", "报表",
    ],
    "atmospheric": [
        "生成式", "音乐", "视频", "语音", "沉浸", "影像", "夜间", "深夜", "电影", "助眠",
        "冥想", "氛围", "人工智能", "大模型", "暗黑",
    ],
    "playful": [
        "可爱", "儿童", "孩子", "少儿", "游戏", "社区", "趣味", "好玩", "活泼", "亲子",
        "夏令营", "童趣", "像素",
    ],
    "editorial": [
        "杂志", "作品集", "博客", "新闻", "报纸", "出版", "品牌故事", "工作室", "宣言",
        "播客", "酒厂", "精酿", "画廊", "摄影", "书店",
    ],
}
DEP_HINTS = {
    "dashboard": (
        ("recharts", "chart.js", "react-chartjs-2", "echarts", "echarts-for-react", "d3",
         "apexcharts", "highcharts", "victory", "@tremor/react", "plotly.js", "@nivo/",
         "@visx/", "@antv/", "chartist", "@mui/x-charts", "vue-echarts"),
        ("dashboard", "analytics", "charts", "kpi", "metrics", "reporting"),
    ),
    "docs": (
        ("@docusaurus/", "docusaurus", "vitepress", "nextra", "@astrojs/starlight",
         "vuepress", "mintlify", "fumadocs-core", "@mdx-js/"),
        ("docs", "documentation"),
    ),
    "buy": (
        ("@shopify/", "stripe", "@stripe/", "@medusajs/", "snipcart", "@commercelayer/",
         "@bigcommerce/", "@paypal/"),
        ("shop", "store", "ecommerce", "checkout", "payments", "retail"),
    ),
}
FRAMEWORKS = (
    "next", "vite", "astro", "nuxt", "@sveltejs/kit", "svelte", "@remix-run/react",
    "gatsby", "react", "vue", "solid-js", "angular", "@angular/core",
)
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "out", "target", "worktrees",
    ".claude", "__pycache__", "vendor", "coverage", ".venv", "venv", ".nuxt",
    ".svelte-kit", ".astro", "ref",
}
README_BYTES = 4096
MAX_CSS_FILES = 40
MAX_CSS_BYTES = 512 * 1024
PROJECT_WEIGHT = 0.5
HAN = re.compile(r"[一-鿿]")


def load_overlay(path: Path | None = None) -> dict:
    path = path or CATALOG / "overlays" / "routing.json"
    return json.loads(path.read_text(encoding="utf-8"))


def stem(word: str) -> str:
    """Port of hallmark's stem: drop -ing/-ed, then a trailing s (keep ss)."""
    x = re.sub(r"(?:ing|ed)$", "", word)
    if len(x) < 3:
        x = word
    return x if x.endswith("ss") else re.sub(r"s$", "", x)


def tokens(text: str) -> list[str]:
    """Lowercase ASCII word tokens without stopwords, in order of appearance."""
    words = re.split(r"[^a-z0-9]+", (text or "").lower())
    return [w for w in words if len(w) >= 2 and w not in ASK]


def stems(text: str) -> set[str]:
    return {stem(w) for w in tokens(text)}


def keyword_stems(keyword: str) -> list[str]:
    parts = [w for w in re.split(r"[^a-z0-9]+", keyword.lower()) if w]
    return [stem(w) for w in parts]


def routable(
    items: list[dict],
    overlay: dict,
    kinds: tuple[str, ...] | None = None,
    include_brands: bool = False,
) -> list[dict]:
    """Merge index entries with the overlay into route records."""
    wanted = set(kinds or ROUTABLE_KINDS)
    if include_brands:
        wanted.add("brand")
    extra = overlay.get("entries", {})
    records = []
    for item in items:
        if item["kind"] not in wanted or item.get("superseded_by"):
            continue
        over = extra.get(item["id"], {})
        record = {
            "id": item["id"],
            "kind": item["kind"],
            "name": item["name"],
            "genre": over.get("genre"),
            "paper": over.get("paper", "unknown"),
            "display": over.get("display", "unknown"),
            "accent": over.get("accent", "unknown"),
            "cluster": over.get("cluster") or item.get("cluster") or item["id"],
            "keywords_en": list(over.get("keywords_en", [])),
            "keywords_zh": list(over.get("keywords_zh", [])),
        }
        theme = item.get("theme")
        if theme:
            record.update(
                genre=theme["genre"],
                paper=theme["paper"]["band"],
                display=theme["display"]["class"],
                accent=theme["accent"]["band"],
                keywords_en=list(theme.get("keywords", [])),
            )
        if item["kind"] == "brand":
            record["keywords_en"] = sorted({item["slug"].lower(), item["name"].lower()})
        records.append(record)
    return records


def validate_overlay(index: dict, overlay: dict, dedup: dict) -> list[str]:
    """Return problems: coverage, field values, keyword counts, cluster agreement."""
    errors: list[str] = []
    entries = overlay.get("entries", {})
    expected = {
        e["id"]: e
        for e in index["entries"]
        if e["kind"] in ROUTABLE_KINDS and not e.get("superseded_by")
    }
    for missing in sorted(set(expected) - set(entries)):
        errors.append(f"{missing}: no overlay entry")
    for extra in sorted(set(entries) - set(expected)):
        errors.append(f"{extra}: overlay entry is not routable")
    dedup_cluster: dict[str, str] = {}
    for slug, verdict in dedup.get("verdicts", {}).items():
        if verdict.get("verdict") == "cluster":
            dedup_cluster[f"theme:{slug}"] = verdict["cluster"]
            for member in verdict.get("with", []):
                dedup_cluster[member] = verdict["cluster"]
    for entry_id, over in entries.items():
        entry = expected.get(entry_id)
        if entry is None:
            continue
        is_theme = entry["kind"] == "theme"
        allowed = {"cluster", "keywords_zh"} if is_theme else {
            "genre", "paper", "display", "accent", "cluster", "keywords_en", "keywords_zh"
        }
        if set(over) != allowed:
            errors.append(f"{entry_id}: fields {sorted(over)} != {sorted(allowed)}")
        cluster = over.get("cluster")
        if not isinstance(cluster, str) or not re.fullmatch(r"[a-z0-9-]+", cluster or ""):
            errors.append(f"{entry_id}: cluster must be a kebab-case string")
        if entry_id in dedup_cluster and cluster != dedup_cluster[entry_id]:
            errors.append(f"{entry_id}: cluster {cluster} != dedup {dedup_cluster[entry_id]}")
        if entry.get("cluster") and cluster != entry["cluster"]:
            errors.append(f"{entry_id}: cluster {cluster} != index {entry['cluster']}")
        zh = over.get("keywords_zh", [])
        if not 6 <= len(zh) <= 20:
            errors.append(f"{entry_id}: {len(zh)} keywords_zh, want 6-20")
        if len(set(zh)) != len(zh):
            errors.append(f"{entry_id}: duplicate keywords_zh")
        for word in zh:
            if len(HAN.findall(word)) < 2:
                errors.append(f"{entry_id}: keywords_zh {word!r} needs 2+ Han characters")
        if is_theme:
            continue
        en = over.get("keywords_en", [])
        if not 10 <= len(en) <= 25:
            errors.append(f"{entry_id}: {len(en)} keywords_en, want 10-25")
        for word in en:
            if word != word.lower() or not keyword_stems(word):
                errors.append(f"{entry_id}: keywords_en {word!r} must be lowercase words")
            elif all(w in ASK for w in re.split(r"[^a-z0-9]+", word) if w):
                errors.append(f"{entry_id}: keywords_en {word!r} is only stopwords")
        if over.get("genre") not in GENRES:
            errors.append(f"{entry_id}: genre {over.get('genre')!r}")
        if over.get("paper") not in ("light", "mid", "dark", "unknown"):
            errors.append(f"{entry_id}: paper {over.get('paper')!r}")
        if not isinstance(over.get("display"), str) or not over.get("display"):
            errors.append(f"{entry_id}: display missing")
        accent = over.get("accent")
        if not isinstance(accent, str) or not re.fullmatch(
            r"warm|cool|neutral|unknown|chromatic-[a-z-]+", accent
        ):
            errors.append(f"{entry_id}: accent {accent!r}")
    return errors


# --- project signals --------------------------------------------------------


def _srgb_to_oklch(r: float, g: float, b: float) -> tuple[float, float]:
    def lin(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = lin(r), lin(g), lin(b)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (max(v, 0.0) ** (1 / 3) for v in (l, m, s))
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    hue = (math.degrees(math.atan2(B, A)) + 360) % 360
    return L, hue


def _hsl_to_rgb(h: float, s: float, l: float) -> tuple[float, float, float]:
    return colorsys.hls_to_rgb((h % 360) / 360, l, s)


def _num(text: str, scale: float = 1.0) -> float:
    text = text.strip()
    if text.endswith("%"):
        return float(text[:-1]) / 100 * scale
    return float(text)


def parse_color(value: str) -> tuple[float, float] | None:
    """Return (OKLCH lightness 0-1, hue degrees) for hex, rgb, hsl, oklch, or bare HSL."""
    v = value.strip().lower()
    try:
        m = re.fullmatch(r"#([0-9a-f]{3,8})", v)
        if m:
            h = m.group(1)
            if len(h) in (3, 4):
                h = "".join(c * 2 for c in h[:3])
            rgb = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
            return _srgb_to_oklch(*rgb)
        m = re.fullmatch(r"rgba?\((.*)\)", v)
        if m:
            parts = re.split(r"[\s,/]+", m.group(1).strip())[:3]
            rgb = [_num(p, 255) / 255 if not p.endswith("%") else _num(p) for p in parts]
            return _srgb_to_oklch(*rgb)
        m = re.fullmatch(r"oklch\((.*)\)", v)
        if m:
            parts = re.split(r"[\s,/]+", m.group(1).strip())
            L = _num(parts[0])
            L = L / 100 if L > 1 else L
            hue = float(re.sub(r"deg$", "", parts[2])) if len(parts) > 2 else 0.0
            return L, hue % 360
        m = re.fullmatch(r"(?:hsla?\()?\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%.*?\)?", v)
        if m:
            rgb = _hsl_to_rgb(float(m.group(1)), float(m.group(2)) / 100, float(m.group(3)) / 100)
            return _srgb_to_oklch(*rgb)
    except (ValueError, IndexError):
        return None
    return None


def paper_band(lightness: float) -> str:
    if lightness < 0.30:
        return "dark"
    if lightness < 0.89:
        return "mid"
    return "light"


def token_blocks(css: str) -> dict[str, str]:
    """Custom properties declared in :root, @theme, [data-theme], and .dark blocks."""
    found: dict[str, str] = {}
    for m in re.finditer(r"(:root|@theme|\[data-theme[^\]]*\]|\.dark)\b[^{]*\{([^{}]*)\}", css):
        if m.group(1) == ".dark":
            continue  # alternate mode; the default paper is in :root
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", m.group(2)):
            found.setdefault(name.lower(), value.strip())
    return found


def resolve_var(value: str, props: dict[str, str]) -> str:
    for _ in range(4):
        m = re.fullmatch(r"var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)", value.strip())
        if not m or m.group(1).lower() not in props:
            break
        value = props[m.group(1).lower()]
    return value


PAPER_NAMES = (r"(^|-)(bg|background|paper|canvas|page)($|-)", r"(^|-)(surface|base)($|-)")
ACCENT_NAMES = (r"(^|-)(accent|primary|brand)($|-)",)


def _pick_prop(props: dict[str, str], patterns: tuple[str, ...]) -> tuple[str, tuple[float, float]] | None:
    for pattern in patterns:
        for name in sorted(props):
            if re.search(pattern, name[2:]) and not re.search(r"(fg|foreground|ink|text|on-)", name):
                parsed = parse_color(resolve_var(props[name], props))
                if parsed:
                    return name, parsed
    return None


def _walk_css(root: Path) -> list[Path]:
    found: list[Path] = []
    for current, dirs, files in os.walk(root):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not d.startswith("."))
        for name in sorted(files):
            if name.endswith((".css", ".scss", ".pcss")):
                found.append(Path(current) / name)
                if len(found) >= MAX_CSS_FILES:
                    return found
    return found


def _read_toml(path: Path) -> dict:
    import tomllib

    return tomllib.loads(path.read_text(encoding="utf-8"))


def collect_signals(root: Path) -> dict:
    """Read-only project scan. Missing or unreadable sources are recorded in notes."""
    notes: list[str] = []
    project: dict = {"name": None, "description": None, "keywords": [], "readme": ""}
    deps: list[str] = []
    out: dict = {
        "root": str(root),
        "project": project,
        "dependency_hints": [],
        "frameworks": [],
        "palette": None,
        "fonts": [],
        "tailwind": False,
        "design_md": None,
        "notes": notes,
    }

    pkg_path = root / "package.json"
    if pkg_path.is_file():
        try:
            pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
            project["name"] = pkg.get("name")
            project["description"] = pkg.get("description")
            if isinstance(pkg.get("keywords"), list):
                project["keywords"] = [str(k) for k in pkg["keywords"]]
            for key in ("dependencies", "devDependencies"):
                if isinstance(pkg.get(key), dict):
                    deps.extend(sorted(pkg[key]))
        except (OSError, ValueError, AttributeError) as error:
            notes.append(f"package.json skipped: {error}")
    else:
        notes.append("package.json not found")

    for name, table in (("pyproject.toml", ("project", "tool.poetry")), ("Cargo.toml", ("package",))):
        path = root / name
        if not path.is_file():
            continue
        try:
            data = _read_toml(path)
        except Exception as error:  # noqa: BLE001 - any parse failure is a note
            notes.append(f"{name} skipped: {error}")
            continue
        for dotted in table:
            node = data
            for part in dotted.split("."):
                node = node.get(part, {}) if isinstance(node, dict) else {}
            if isinstance(node, dict) and node:
                project["name"] = project["name"] or node.get("name")
                project["description"] = project["description"] or node.get("description")
                if isinstance(node.get("keywords"), list):
                    project["keywords"].extend(str(k) for k in node["keywords"])

    readmes = sorted(p for p in root.iterdir() if p.is_file() and p.name.lower().startswith("readme")) if root.is_dir() else []
    if readmes:
        try:
            with readmes[0].open("rb") as handle:
                project["readme"] = handle.read(README_BYTES).decode("utf-8", errors="replace")
        except OSError as error:
            notes.append(f"{readmes[0].name} skipped: {error}")
    else:
        notes.append("README not found")

    hints = []
    for hint, (packages, _words) in DEP_HINTS.items():
        if any(dep == p or (p.endswith("/") and dep.startswith(p)) for dep in deps for p in packages):
            hints.append(hint)
    out["dependency_hints"] = hints
    out["frameworks"] = [f for f in FRAMEWORKS if f in deps]

    tailwind_files = [p.name for p in sorted(root.glob("tailwind.config.*"))]
    out["tailwind"] = bool(tailwind_files) or "tailwindcss" in deps

    props: dict[str, str] = {}
    for path in _walk_css(root):
        try:
            if path.stat().st_size > MAX_CSS_BYTES:
                notes.append(f"{path.relative_to(root).as_posix()} skipped: larger than 512 KB")
                continue
            css = path.read_text(encoding="utf-8", errors="replace")
        except OSError as error:
            notes.append(f"{path.name} skipped: {error}")
            continue
        if "@import \"tailwindcss\"" in css or "@tailwind" in css:
            out["tailwind"] = True
        for name, value in token_blocks(css).items():
            props.setdefault(name, value)
    if props:
        paper = _pick_prop(props, PAPER_NAMES)
        accent = _pick_prop(props, ACCENT_NAMES)
        if paper:
            out["palette"] = {
                "band": paper_band(paper[1][0]),
                "paper_var": paper[0],
                "L": round(paper[1][0], 3),
                "accent_var": accent[0] if accent else None,
                "accent_hue": round(accent[1][1]) if accent else None,
            }
        else:
            notes.append("token layer found but no paper/background color could be read")
        out["fonts"] = [
            resolve_var(v, props) for k, v in sorted(props.items()) if k.startswith("--font")
        ][:6]
    else:
        notes.append("no CSS token layer found")

    design = [p for p in root.iterdir() if p.is_file() and p.name.lower() == "design.md"] if root.is_dir() else []
    out["design_md"] = str(design[0]) if design else None
    return out


def project_text(signals: dict | None) -> str:
    if not signals:
        return ""
    project = signals.get("project", {})
    parts = [
        str(project.get("name") or "").replace("-", " ").replace("_", " "),
        str(project.get("description") or ""),
        " ".join(project.get("keywords") or []),
        str(project.get("readme") or ""),
    ]
    return "\n".join(p for p in parts if p)


# --- scoring ----------------------------------------------------------------


def infer_genre(prompt: str, project: str, hints: list[str]) -> tuple[str | None, list[str]]:
    """Return (genre, hits). Default editorial when there is text but no hit; None when empty."""
    hint_text = " ".join(hints)
    texts = [(prompt, 1.0), (project, PROJECT_WEIGHT), (hint_text, PROJECT_WEIGHT)]
    totals: dict[str, float] = {}
    first: dict[str, int] = {}
    hits: dict[str, list[str]] = {g: [] for g in GENRES}
    offset = 0
    for text, weight in texts:
        lower = text.lower()
        words = tokens(text)
        word_pos = {}
        pos = 0
        for w in words:
            at = lower.find(w, pos)
            word_pos.setdefault(w, at if at >= 0 else pos)
            pos = max(at, pos)
        for genre in GENRES:
            for word in GENRE_WORDS_EN[genre]:
                if word in word_pos:
                    totals[genre] = totals.get(genre, 0) + weight
                    first[genre] = min(first.get(genre, 1 << 30), offset + word_pos[word])
                    hits[genre].append(word)
            for word in GENRE_WORDS_ZH[genre]:
                at = text.find(word)
                if at >= 0:
                    totals[genre] = totals.get(genre, 0) + weight
                    first[genre] = min(first.get(genre, 1 << 30), offset + at)
                    hits[genre].append(word)
        offset += len(text) + 1
    if not totals:
        has_text = any(t.strip() for t, _ in texts)
        return ("editorial" if has_text else None), []
    best = sorted(totals, key=lambda g: (-totals[g], first[g]))[0]
    return best, list(dict.fromkeys(hits[best]))


def doc_frequencies(records: list[dict]) -> tuple[dict[str, int], dict[str, int]]:
    df_en: dict[str, int] = {}
    df_zh: dict[str, int] = {}
    for record in records:
        for word in {k.lower() for k in record["keywords_en"]}:
            df_en[word] = df_en.get(word, 0) + 1
        for word in {k.casefold() for k in record["keywords_zh"]}:
            df_zh[word] = df_zh.get(word, 0) + 1
    return df_en, df_zh


def idf_weight(df: int) -> int:
    return 3 if df <= 2 else 2 if df <= 4 else 1


def score_record(
    record: dict,
    *,
    prompt: str,
    project: str,
    genre: str | None,
    palette_band: str | None,
    hint_words: set[str],
    df_en: dict[str, int],
    df_zh: dict[str, int],
) -> dict:
    prompt_stems = stems(prompt)
    all_stems = prompt_stems | stems(project)
    prompt_fold = prompt.casefold()
    project_fold = project.casefold()
    kw = 0.0
    hits: list[str] = []
    for keyword in record["keywords_en"]:
        parts = keyword_stems(keyword)
        if not parts:
            continue
        weight = idf_weight(df_en.get(keyword.lower(), 1))
        if all(p in prompt_stems for p in parts):
            kw += weight
            hits.append(keyword)
        elif project and all(p in all_stems for p in parts):
            kw += weight * PROJECT_WEIGHT
            hits.append(f"{keyword} (project)")
    for keyword in record["keywords_zh"]:
        folded = keyword.casefold()
        weight = idf_weight(df_zh.get(folded, 1))
        if folded in prompt_fold:
            kw += weight
            hits.append(keyword)
        elif project and folded in project_fold:
            kw += weight * PROJECT_WEIGHT
            hits.append(f"{keyword} (project)")
    parts = {
        "kw": kw,
        "genre": 0 if genre is None or record["genre"] is None else (2 if record["genre"] == genre else -1),
        "scene": 4 if record["kind"] == "scene" and kw >= 3 else 0,
        "palette": 1 if palette_band and record["paper"] == palette_band else 0,
        "deps": 1 if hint_words & {k.lower() for k in record["keywords_en"]} else 0,
    }
    return {
        **record,
        "score": sum(parts.values()),
        "parts": parts,
        "hits": hits,
    }


def normalize_prompt(prompt: str) -> str:
    return " ".join(prompt.casefold().split())


def rank(scored: list[dict], prompt: str, root_name: str) -> list[dict]:
    salt = normalize_prompt(prompt)

    def tie(item: dict) -> str:
        return hashlib.sha256(f"{salt}|{root_name}|{item['id']}".encode("utf-8")).hexdigest()

    return sorted(scored, key=lambda s: (-s["score"], tie(s)))


def pick_from(pool: list[dict], n: int, exclude: set[str]) -> list[dict]:
    """hallmark pickFrom, with cluster in place of the axis triple."""
    avail = [s for s in pool if s["id"] not in exclude]
    picked: list[dict] = []
    if not avail or n < 1:
        return picked

    def rest() -> list[dict]:
        return [s for s in avail if s not in picked]

    picked.append(avail[0])
    if n >= 2 and rest():
        top = picked[0]
        other = next(
            (
                s
                for s in rest()
                if s["paper"] != top["paper"]
                and "unknown" not in (s["paper"], top["paper"])
                and s["score"] >= top["score"] - 2
                and s["cluster"] != top["cluster"]
            ),
            None,
        )
        picked.append(
            other
            or next((s for s in rest() if s["cluster"] != top["cluster"]), None)
            or rest()[0]
        )
    while len(picked) < n and rest():
        clusters = {p["cluster"] for p in picked}
        picked.append(next((s for s in rest() if s["cluster"] not in clusters), rest()[0]))
    return picked


def route(
    items: list[dict],
    overlay: dict,
    *,
    prompt: str,
    signals: dict | None = None,
    n: int = 3,
    reroll: int = 0,
    kinds: tuple[str, ...] | None = None,
    include_brands: bool = False,
) -> dict:
    """Pure routing core. Returns a result dict; picks is empty when nothing is routable."""
    records = routable(items, overlay, kinds, include_brands)
    project = project_text(signals)
    hints = list((signals or {}).get("dependency_hints", []))
    hint_words = {w for h in hints for w in DEP_HINTS[h][1]}
    palette = (signals or {}).get("palette") or {}
    genre, genre_hits = infer_genre(prompt, project, hints)
    df_en, df_zh = doc_frequencies(records)
    scored = [
        score_record(
            r,
            prompt=prompt,
            project=project,
            genre=genre,
            palette_band=palette.get("band"),
            hint_words=hint_words,
            df_en=df_en,
            df_zh=df_zh,
        )
        for r in records
    ]
    root_name = Path(signals["root"]).name if signals and signals.get("root") else ""
    pool = rank(scored, prompt, root_name)
    previous: set[str] = set()
    for _ in range(reroll):
        previous.update(p["id"] for p in pick_from(pool, n, previous))
    picks = pick_from(pool, n, previous)
    avail = [s for s in pool if s["id"] not in previous]
    confidence = "low"
    if avail and avail[0]["parts"]["kw"] > 0:
        gap = avail[0]["score"] - (avail[1]["score"] if len(avail) > 1 else 0)
        confidence = "high" if gap >= 2 else "low"
    used = []
    if signals:
        project_info = signals.get("project", {})
        if project_info.get("name") or project_info.get("description"):
            used.append("project description")
        if project_info.get("readme"):
            used.append("readme")
        used.extend(f"dependency:{h}" for h in hints)
        if palette.get("band"):
            used.append(f"palette:{palette['band']}")
    return {
        "confidence": confidence,
        "genre": genre,
        "genre_hits": genre_hits,
        "reroll": reroll,
        "picks": [
            {
                "id": p["id"],
                "kind": p["kind"],
                "name": p["name"],
                "score": tidy(p["score"]),
                "parts": {k: tidy(v) for k, v in p["parts"].items()},
                "hits": p["hits"],
                "cluster": p["cluster"],
                "paper": p["paper"],
            }
            for p in picks
        ],
        "signals_used": used,
        "design_md": (signals or {}).get("design_md"),
    }


def tidy(value: float) -> float | int:
    value = round(float(value), 1)
    return int(value) if value.is_integer() else value


def format_route(result: dict, root: str) -> str:
    genre = result["genre"] or "none"
    source = (
        f" (from: {', '.join(result['genre_hits'][:4])})"
        if result["genre_hits"]
        else (" (default)" if result["genre"] else "")
    )
    lines = [f"route: confidence {result['confidence']} · genre {genre}{source}"]
    if result["reroll"]:
        lines[0] += f" · reroll {result['reroll']}"
    for i, pick in enumerate(result["picks"], 1):
        parts = ", ".join(f"{k} {v}" for k, v in pick["parts"].items() if v)
        why = (
            "fits: " + ", ".join(pick["hits"][:4])
            if pick["hits"]
            else ("genre fit" if pick["parts"]["genre"] > 0 else "fallback")
        )
        lines.append(
            f"{i}. {pick['id']} · {pick['name']} · score {pick['score']}"
            f"{f' ({parts})' if parts else ''} · {why}"
        )
    if result["signals_used"]:
        lines.append(f"signals: {', '.join(result['signals_used'])}")
    if result.get("design_md"):
        lines.append(
            f"note: {result['design_md']} already exists; implement from it unless the user asked to switch"
        )
    if result["picks"]:
        lines.append(f"next: apply {result['picks'][0]['id']} --root {root}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    commands = parser.add_subparsers(dest="command", required=True)

    list_cmd = commands.add_parser("list", help="list entries grouped by category")
    list_cmd.add_argument("--kind", choices=KINDS)
    list_cmd.add_argument("--category")
    list_cmd.add_argument(
        "--all", action="store_true", help="include superseded entries"
    )
    list_cmd.add_argument("--format", choices=("text", "json"), default="text")

    search_cmd = commands.add_parser(
        "search",
        help="search id, name, description, category names, theme keywords and material",
    )
    search_cmd.add_argument("query")
    search_cmd.add_argument("--kind", choices=KINDS)
    search_cmd.add_argument(
        "--all", action="store_true", help="include superseded entries"
    )
    search_cmd.add_argument("--format", choices=("text", "json"), default="text")

    show_cmd = commands.add_parser("show", help="print one entry")
    show_cmd.add_argument("id")

    apply_cmd = commands.add_parser("apply", help="write DESIGN.md into a project root")
    apply_cmd.add_argument("id")
    apply_cmd.add_argument("--root", type=Path, default=Path.cwd())
    apply_cmd.add_argument("--force", action="store_true")

    signals_cmd = commands.add_parser("signals", help="print project signals as JSON")
    signals_cmd.add_argument("--root", type=Path, default=Path.cwd())
    signals_cmd.add_argument("--prompt", default="")

    route_cmd = commands.add_parser("route", help="pick entries for a prompt and project")
    route_cmd.add_argument("--prompt", required=True)
    route_cmd.add_argument("--root", type=Path)
    route_cmd.add_argument("--n", type=int, default=3)
    route_cmd.add_argument("--reroll", type=int, default=0)
    route_cmd.add_argument("--kind", action="append", choices=KINDS)
    route_cmd.add_argument("--include-brands", action="store_true")
    route_cmd.add_argument("--format", choices=("text", "json"), default="text")

    args = parser.parse_args(argv)
    index = load_index()
    items = enrich(index)

    if args.command == "signals":
        if not args.root.is_dir():
            print(f"error: --root is not a directory: {args.root}", file=sys.stderr)
            return 2
        result = collect_signals(args.root)
        if args.prompt:
            genre, hits = infer_genre(args.prompt, project_text(result), result["dependency_hints"])
            result["prompt"] = {"text": args.prompt, "genre": genre, "genre_hits": hits}
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    if args.command == "route":
        if args.n < 1 or args.reroll < 0:
            print("error: --n must be at least 1 and --reroll at least 0", file=sys.stderr)
            return 2
        if args.root is not None and not args.root.is_dir():
            print(f"error: --root is not a directory: {args.root}", file=sys.stderr)
            return 2
        kinds = tuple(k for k in (args.kind or ROUTABLE_KINDS) if k != "brand") or None
        brands = args.include_brands or "brand" in (args.kind or [])
        if args.kind and kinds is None:
            kinds = ()
        signals = collect_signals(args.root) if args.root is not None else None
        try:
            overlay = load_overlay()
        except (OSError, ValueError) as error:
            print(f"error: cannot read overlays/routing.json: {error}", file=sys.stderr)
            return 2
        result = route(
            items, overlay, prompt=args.prompt, signals=signals, n=args.n,
            reroll=args.reroll, kinds=kinds, include_brands=brands,
        )
        if not result["picks"]:
            print(
                f"error: nothing routable (reroll {args.reroll}, kinds {list(kinds or []) or 'brand'}); "
                "lower --reroll or widen --kind",
                file=sys.stderr,
            )
            return 1
        if args.format == "json":
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(format_route(result, str(args.root) if args.root else "<project-root>"))
        return 0

    if args.command == "list":
        if args.category and args.category not in {
            c["id"] for c in index["categories"]
        }:
            known = ", ".join(c["id"] for c in index["categories"])
            print(
                f"error: unknown category '{args.category}'. Known: {known}",
                file=sys.stderr,
            )
            return 2
        selected = [
            item
            for item in visible(items, args.all)
            if (not args.kind or item["kind"] == args.kind)
            and (not args.category or item["category"] == args.category)
        ]
        emit(index, selected, args.format)
        return 0

    if args.command == "search":
        query = args.query.casefold()
        selected = [
            item
            for item in visible(items, args.all)
            if (not args.kind or item["kind"] == args.kind)
            and any(query in field.casefold() for field in search_text(item))
        ]
        if not selected:
            print(
                f"no entries match '{args.query}'; try a broader word or run list",
                file=sys.stderr,
            )
            return 1
        emit(index, selected, args.format)
        return 0

    try:
        entry = resolve(items, args.id)
    except LookupError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    note_superseded(entry)
    if args.command == "show":
        sys.stdout.write((CATALOG / entry["path"]).read_text(encoding="utf-8"))
        return 0
    return apply(index, entry, args.root, args.force)


if __name__ == "__main__":
    sys.exit(main())
