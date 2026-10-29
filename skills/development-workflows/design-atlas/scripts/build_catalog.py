#!/usr/bin/env python3
"""Rebuild the design-atlas catalog from upstream checkouts.

Maintainer tool. The skill runtime never reads the upstream checkouts.

Inputs:
  --design-md      checkout of https://github.com/VoltAgent/awesome-design-md
  --design-skills  checkout of https://github.com/bergside/awesome-design-skills
  --hallmark       checkout of https://github.com/Nutlope/hallmark (optional)
  --out            catalog directory that holds categories.json

Modes:
  --design-md D --design-skills S --hallmark H   rebuild everything
  --design-md D --design-skills S                rebuild brands and styles; keep
                                                 theme entries and themes/ as is
  --themes-only --hallmark H                     rebuild themes only; keep brand,
                                                 style, and scene entries and files

Outputs (under --out): brands/*.md, styles/*.md, themes/*.md, scenes/**/*.md,
LICENSES/*, index.json.
Exit 1 when any entry has no category or a check fails; nothing is written then.
If out/first-party/manifest.json exists, those entries are merged before writing.
A missing manifest is skipped. first-party is not an upstream source.
Theme entries need a verdict in out/overlays/dedup.json. A supersede verdict adds
superseded_by to its target; a cluster verdict adds cluster to the theme and to
each listed entry. Old entry files are never rewritten for these fields.
Stale brands/*.md, styles/*.md, and scenes/**/*.md that this run did not write
are deleted; themes/*.md too when themes are rebuilt. first-party/, overlays/,
and LICENSES/ are left in place.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

DESIGN_MD_REPO = "https://github.com/VoltAgent/awesome-design-md"
DESIGN_SKILLS_REPO = "https://github.com/bergside/awesome-design-skills"
README_ENTRY = re.compile(
    r"^- \[\*\*(.+?)\*\*\]\(https://getdesign\.md/([^/]+)/design-md\)\s*-\s*(.+)$"
)
SECTION = re.compile(r"^## (.+)$", re.M)
MANAGED_MARKER = re.compile(r"^<!-- TYPEUI_SH_MANAGED_(START|END) -->\n?", re.M)


def normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in text.split("\n")]
    return "\n".join(lines).strip("\n") + "\n"


def split_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter body, rest). Empty frontmatter when absent."""
    if not text.startswith("---\n"):
        return "", text
    end = text.find("\n---\n", 4)
    if end == -1:
        return "", text
    return text[4:end], text[end + 5 :]


def frontmatter_value(frontmatter: str, key: str) -> str:
    match = re.search(rf"^{re.escape(key)}:\s*(.*)$", frontmatter, re.M)
    if not match:
        return ""
    value = match.group(1).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1]
    return value.strip()


def first_sentence(text: str) -> str:
    match = re.match(r"(.+?\.)(\s|$)", text)
    return match.group(1) if match else text


def sections(text: str) -> dict[str, str]:
    parts = SECTION.split(text)
    return {parts[i].strip(): parts[i + 1].strip() for i in range(1, len(parts), 2)}


def git_commit(path: Path, override: str | None) -> str | None:
    if override:
        return override
    try:
        result = subprocess.run(
            ["git", "-C", str(path), "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None
    return result.stdout.strip() if result.returncode == 0 else None


def parse_readme(
    readme: str, prefixes: list[list[str]]
) -> dict[str, tuple[str, str, str | None]]:
    """Map slug -> (name, description, category id or None)."""
    found: dict[str, tuple[str, str, str | None]] = {}
    category: str | None = None
    for line in readme.splitlines():
        if line.startswith("### "):
            heading = line[4:].strip()
            category = next(
                (cid for prefix, cid in prefixes if heading.startswith(prefix)), None
            )
            continue
        match = README_ENTRY.match(line.strip())
        if match:
            found[match.group(2)] = (match.group(1), match.group(3).strip(), category)
    return found


def build_brands(
    design_md: Path, config: dict, errors: list[str]
) -> tuple[list[dict], dict[str, str]]:
    readme = parse_readme(
        (design_md / "README.md").read_text(encoding="utf-8"),
        config["brand"]["readme_heading_prefixes"],
    )
    overrides = config["brand"].get("overrides", {})
    entries: list[dict] = []
    files: dict[str, str] = {}
    for directory in sorted(
        p for p in (design_md / "design-md").iterdir() if p.is_dir()
    ):
        slug = directory.name
        source = directory / "DESIGN.md"
        if not source.is_file():
            continue
        text = normalize(source.read_text(encoding="utf-8"))
        frontmatter, _ = split_frontmatter(text)
        name, description, category = readme.get(slug, ("", "", None))
        category = overrides.get(slug, category)
        if not name:
            name = slug.split(".")[0].replace("-", " ").title()
            description = first_sentence(frontmatter_value(frontmatter, "description"))
        if category is None:
            errors.append(f"brand:{slug} has no category (add it to brand.overrides)")
            continue
        path = f"brands/{slug}.md"
        files[path] = text
        entries.append(
            {
                "id": f"brand:{slug}",
                "kind": "brand",
                "slug": slug,
                "name": name,
                "category": category,
                "description": description,
                "format": "stitch" if frontmatter else "legacy",
                "path": path,
                "source": "awesome-design-md",
                "upstream_path": f"design-md/{slug}/DESIGN.md",
            }
        )
    return entries, files


def style_document(design_text: str, skill_text: str) -> str:
    design_text = normalize(design_text)
    _, skill_body = split_frontmatter(
        normalize(MANAGED_MARKER.sub("", normalize(skill_text)))
    )
    skill_sections = sections(skill_body)
    design_sections = sections(split_frontmatter(design_text)[1])

    extra: list[str] = []
    brand = skill_sections.get("Brand", "")
    if brand and brand != design_sections.get("Overview", ""):
        extra.append(f"## Brand Character\n\n{brand}")
    if "Style Foundations" not in design_sections and skill_sections.get(
        "Style Foundations"
    ):
        extra.append(f"## Style Foundations\n\n{skill_sections['Style Foundations']}")
    for name in ("Accessibility", "Writing Tone"):
        if skill_sections.get(name):
            extra.append(f"## {name}\n\n{skill_sections[name]}")
    do_rules = skill_sections.get("Rules: Do", "")
    dont_rules = skill_sections.get("Rules: Don't", "")
    if do_rules or dont_rules:
        extra.append(
            f"## Do's and Don'ts\n\n### Do\n\n{do_rules}\n\n### Don't\n\n{dont_rules}"
        )
    return normalize(design_text + "\n" + "\n\n".join(extra))


def build_styles(
    design_skills: Path, config: dict, errors: list[str]
) -> tuple[list[dict], dict[str, str]]:
    root = design_skills / "skills"
    index_path = root / "index.json"
    upstream_index = (
        json.loads(index_path.read_text(encoding="utf-8"))
        if index_path.is_file()
        else {}
    )
    slug_to_category: dict[str, str] = {}
    for category, slugs in config["style"].items():
        for slug in slugs:
            if slug in slug_to_category:
                errors.append(f"style:{slug} is mapped to two categories")
            slug_to_category[slug] = category

    entries: list[dict] = []
    files: dict[str, str] = {}
    seen: set[str] = set()
    for directory in sorted(p for p in root.iterdir() if p.is_dir()):
        slug = directory.name
        design_path, skill_path = directory / "DESIGN.md", directory / "SKILL.md"
        if not (design_path.is_file() and skill_path.is_file()):
            continue
        seen.add(slug)
        category = slug_to_category.get(slug)
        if category is None:
            errors.append(
                f"style:{slug} has no category (add it to style in categories.json)"
            )
            continue
        skill_text = skill_path.read_text(encoding="utf-8")
        frontmatter, _ = split_frontmatter(normalize(skill_text))
        path = f"styles/{slug}.md"
        files[path] = style_document(
            design_path.read_text(encoding="utf-8"), skill_text
        )
        entries.append(
            {
                "id": f"style:{slug}",
                "kind": "style",
                "slug": slug,
                "name": upstream_index.get(slug, {}).get("name") or slug.title(),
                "category": category,
                "description": frontmatter_value(frontmatter, "description"),
                "format": "stitch",
                "path": path,
                "source": "awesome-design-skills",
                "upstream_path": f"skills/{slug}/DESIGN.md + skills/{slug}/SKILL.md",
            }
        )
    for slug in sorted(set(slug_to_category) - seen):
        errors.append(f"style:{slug} is mapped but missing upstream")
    return entries, files


def insert_entry(entries: list[dict], item: dict) -> None:
    """Place an entry among the same kind, ordered by slug."""
    kind = item["kind"]
    slug = item["slug"]
    indexes = [index for index, entry in enumerate(entries) if entry["kind"] == kind]
    if not indexes:
        entries.append(item)
        return
    for index in indexes:
        if entries[index]["slug"] > slug:
            entries.insert(index, item)
            return
    entries.insert(indexes[-1] + 1, item)


def merge_first_party(
    out: Path,
    entries: list[dict],
    files: dict[str, str],
    known_categories: set[str],
    errors: list[str],
) -> None:
    """Merge out/first-party/manifest.json. Skip the merge when it is absent."""
    manifest_path = out / "first-party" / "manifest.json"
    if not manifest_path.is_file():
        return
    try:
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        errors.append(f"first-party manifest is not valid JSON: {error}")
        return
    if isinstance(payload, dict):
        items = [payload]
    elif isinstance(payload, list):
        items = payload
    else:
        errors.append("first-party manifest must be an entry object or a list")
        return

    existing_ids = {entry["id"] for entry in entries}
    staged: list[tuple[dict, str, str]] = []
    local_errors: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            local_errors.append("first-party manifest entry must be an object")
            continue
        entry_id = str(item.get("id") or "")
        slug = str(item.get("slug") or "")
        kind = str(item.get("kind") or "")
        category = str(item.get("category") or "")
        rel = str(item.get("path") or "")
        label = entry_id or "first-party entry"
        if not (entry_id and slug and kind and category and rel):
            local_errors.append(f"{label} is missing id, kind, slug, category, or path")
            continue
        if entry_id in existing_ids or any(
            staged_item["id"] == entry_id for staged_item, _, _ in staged
        ):
            local_errors.append(f"{entry_id} conflicts with an existing entry")
            continue
        if category not in known_categories:
            local_errors.append(f"{entry_id} uses unknown category {category}")
            continue
        source = out / "first-party" / f"{slug}.md"
        if not source.is_file():
            local_errors.append(f"{entry_id} source file is missing")
            continue
        if rel in files or any(staged_rel == rel for _, staged_rel, _ in staged):
            local_errors.append(f"{entry_id} conflicts with an upstream file {rel}")
            continue
        staged.append((item, rel, normalize(source.read_text(encoding="utf-8"))))

    if local_errors:
        errors.extend(local_errors)
        return
    for item, rel, text in staged:
        files[rel] = text
        insert_entry(entries, item)


# --- hallmark themes -------------------------------------------------------

HALLMARK_REPO = "https://github.com/Nutlope/hallmark"
HALLMARK_THEMES = "skills/hallmark/references/themes"
HALLMARK_PREVIEW = (
    "https://raw.githubusercontent.com/Nutlope/hallmark/{commit}/"
    + HALLMARK_THEMES
    + "/{slug}.jpg"
)
HEADER_REQUIRED = (
    "name",
    "slug",
    "genre",
    "paper",
    "display",
    "accent",
    "posture",
    "keywords",
    "material",
)
# Upstream sections every theme file must carry (hallmark themes/README.md).
THEME_SECTIONS = (
    "Tokens",
    "Type",
    "Surfaces",
    "Range",
    "Controls",
    "Motion",
    "Voice",
    "Do-nots",
    "Build hint",
)
COLOR_ROLES = (
    ("canvas", "color-paper"),
    ("surface", "color-paper-2"),
    ("surface-strong", "color-paper-3"),
    ("ink", "color-ink"),
    ("ink-muted", "color-ink-2"),
    ("muted", "color-muted"),
    ("rule", "color-rule"),
    ("primary", "color-accent"),
    ("on-primary", "color-accent-ink"),
    ("focus", "color-focus"),
    ("slot", "color-slot"),
)
MAPPED_TOKENS = {name for _, name in COLOR_ROLES} | {
    "font-display",
    "font-body",
    "font-outlier",
    "display-weight",
    "tracking-display",
    "radius-card",
    "radius-pill",
    "shadow-card",
    "rule-hair",
}
# Hallmark-only reference files that this skill does not ship. A parenthetical
# that points at one is dropped; a clause that names one is reworded.
UNSHIPPED_REFS = {
    "layout.md": "the shared layout rules",
    "craft.md": "the shared craft rules",
    "imagery.md": "the shared imagery rules",
    "gates.md": "`references/anti-slop.md`",
    "flow.md": "the build workflow",
}
_UNSHIPPED = "|".join(re.escape(name) for name in UNSHIPPED_REFS)
# Ordered (pattern, replacement) rewrites applied to every theme document.
REF_REWRITES: tuple[tuple[re.Pattern[str], object], ...] = (
    (re.compile(r"(?<![\w/])texture\.md"), "references/texture.md"),
    (re.compile(rf"\s*\((?:see )?`?(?:{_UNSHIPPED})`?(?:\s*§\s*[\w.]+)?\)"), ""),
    (
        re.compile(rf"`?({_UNSHIPPED})`?(?:\s*§\s*[\w.]+)?"),
        lambda match: UNSHIPPED_REFS[match.group(1)],
    ),
    # Hallmark records choices and waivers in a CSS stamp. A DESIGN.md records
    # them in the file itself (references/anti-slop.md).
    (re.compile(r"stated in the stamp"), "stated in DESIGN.md"),
    (re.compile(r"The stamp states"), "DESIGN.md states"),
    (re.compile(r"stamp `waive "), "waiver `waive "),
)
ALLOWED_REFS = {"texture.md", "anti-slop.md", "design-system-core.md"}
MD_REF = re.compile(r"\b[a-z][a-z-]*\.md\b")
DEDUP_VERDICTS = {"supersede", "cluster", "distinct"}
DEDUP_MIN_REASON = 12


def _number(text: str) -> int | float:
    value = float(text)
    return int(value) if value.is_integer() else value


def parse_theme_header(text: str, label: str) -> dict:
    """Python port of hallmark scripts/theme.mjs parseHeader."""
    match = re.match(r"^---\n([\s\S]*?)\n---", text)
    if not match:
        raise ValueError(f"{label}: no header block")
    header: dict[str, str] = {}
    for line in match.group(1).split("\n"):
        field = re.match(r"^([a-z]+):\s*(.*)$", line.strip())
        if field:
            header[field.group(1)] = field.group(2).strip()
    for key in HEADER_REQUIRED:
        if not header.get(key):
            raise ValueError(f'{label}: header is missing "{key}"')
    paper = header["paper"].split()
    display = header["display"].split()
    accent = header["accent"].split()
    if len(paper) < 3 or len(display) < 2 or len(accent) < 2:
        raise ValueError(f"{label}: paper, display, or accent is incomplete")
    try:
        paper_value = {
            "band": paper[0],
            "L": _number(paper[1]),
            "hue": _number(paper[2]),
        }
        accent_value = {"band": accent[0], "hue": _number(accent[1])}
    except ValueError:
        raise ValueError(f"{label}: paper or accent has a non-numeric value") from None
    parsed = {
        "name": header["name"],
        "slug": header["slug"],
        "genre": header["genre"],
        "posture": header["posture"],
        "paper": paper_value,
        "display": {"class": display[0], "face": " ".join(display[1:])},
        "accent": accent_value,
        "keywords": [
            word.strip().lower()
            for word in header["keywords"].split(",")
            if word.strip()
        ],
        "material": header["material"],
    }
    for key in ("photo", "pictured"):
        if header.get(key):
            parsed[key] = header[key]
    return parsed


def split_css_declarations(css: str) -> list[tuple[str, str]]:
    """Return (name, value) for each --custom-property in a :root block."""
    body = css[css.index("{") + 1 : css.rindex("}")]
    declarations: list[str] = []
    current: list[str] = []
    depth = 0
    quote = ""
    for char in body:
        if quote:
            current.append(char)
            if char == quote:
                quote = ""
            continue
        if char in "\"'":
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        elif char == ";" and depth == 0:
            declarations.append("".join(current))
            current = []
            continue
        current.append(char)
    declarations.append("".join(current))
    tokens: list[tuple[str, str]] = []
    for declaration in declarations:
        declaration = " ".join(declaration.split())
        name, _, value = declaration.partition(":")
        name = name.strip()
        if name.startswith("--"):
            tokens.append((name[2:], value.strip()))
    return tokens


def markdown_sections(body: str) -> tuple[str, dict[str, str]]:
    """Split on level-2 headings outside code fences. Return (lead, sections)."""
    lead: list[str] = []
    found: dict[str, list[str]] = {}
    current = lead
    fenced = False
    for line in body.split("\n"):
        if line.startswith("```"):
            fenced = not fenced
        if not fenced and line.startswith("## "):
            current = found.setdefault(line[3:].strip(), [])
            continue
        current.append(line)
    lead_text = re.sub(r"^# .*\n", "", "\n".join(lead).strip("\n") + "\n")
    return lead_text.strip("\n"), {
        name: "\n".join(lines).strip("\n") for name, lines in found.items()
    }


def yaml_scalar(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return json.dumps(value)
    return json.dumps(str(value), ensure_ascii=False)


def yaml_block(data: dict, indent: int = 0) -> list[str]:
    lines: list[str] = []
    pad = "  " * indent
    for key, value in data.items():
        if isinstance(value, dict):
            lines.append(f"{pad}{key}:")
            lines.extend(yaml_block(value, indent + 1))
        elif isinstance(value, list):
            items = ", ".join(yaml_scalar(item) for item in value)
            lines.append(f"{pad}{key}: [{items}]")
        else:
            lines.append(f"{pad}{key}: {yaml_scalar(value)}")
    return lines


def rewrite_refs(text: str) -> str:
    for pattern, replacement in REF_REWRITES:
        text = pattern.sub(replacement, text)  # type: ignore[arg-type]
    return text


def unresolved_refs(text: str) -> list[str]:
    return sorted({ref for ref in MD_REF.findall(text) if ref not in ALLOWED_REFS})


def theme_record(header: dict) -> dict:
    record = {
        "genre": header["genre"],
        "paper": header["paper"],
        "display": header["display"],
        "accent": header["accent"],
        "posture": header["posture"],
    }
    for key in ("photo", "material", "pictured", "keywords"):
        if key in header:
            record[key] = header[key]
    return record


def theme_frontmatter(header: dict, tokens: dict[str, str]) -> dict:
    colors = {role: tokens[name] for role, name in COLOR_ROLES if name in tokens}
    typography: dict[str, dict] = {}
    for role in ("display", "body", "outlier"):
        if f"font-{role}" in tokens:
            typography[role] = {"fontFamily": tokens[f"font-{role}"]}
    if "display" in typography:
        if "display-weight" in tokens:
            weight = tokens["display-weight"]
            typography["display"]["fontWeight"] = (
                int(weight) if weight.isdigit() else weight
            )
        if "tracking-display" in tokens:
            typography["display"]["letterSpacing"] = tokens["tracking-display"]
    frontmatter: dict = {
        "version": "alpha",
        "name": header["name"],
        "description": header["material"],
        "colors": colors,
        "typography": typography,
    }
    rounded = {
        key: tokens[f"radius-{key}"]
        for key in ("card", "pill")
        if f"radius-{key}" in tokens
    }
    if rounded:
        frontmatter["rounded"] = rounded
    if "shadow-card" in tokens:
        frontmatter["elevation"] = {"card": tokens["shadow-card"]}
    if "rule-hair" in tokens:
        frontmatter["rule"] = {"hair": tokens["rule-hair"]}
    x_theme = theme_record(header)
    extra = {name: value for name, value in tokens.items() if name not in MAPPED_TOKENS}
    if extra:
        x_theme["tokens"] = extra
    frontmatter["x-theme"] = x_theme
    return frontmatter


def theme_known_gaps(
    body: str, tokens: dict[str, str], build_hint: str, preview_url: str | None
) -> list[str]:
    defined = set(tokens)
    for block in re.findall(r"```css\n(.*?)```", body, re.S):
        defined.update(name[2:] for name in re.findall(r"(--[\w-]+)\s*:", block))
    used = set(re.findall(r"var\(--([\w-]+)", body))
    used.update(re.findall(r"`--([\w-]+)`", body))
    shared = sorted(used - defined)
    hosts = sorted(set(re.findall(r'href="https://([^/"]+)', build_hint)))
    gaps: list[str] = []
    if hosts:
        listed = ", ".join(f"`{host}`" for host in hosts)
        gaps.append(
            f"- Fonts load from {listed} (see Implementation Hint). Confirm each "
            "face's license before you self-host or bundle it."
        )
    else:
        gaps.append("- Font sources are not listed. Confirm each face's license.")
    if preview_url:
        gaps.append(
            f"- The preview picture is not bundled. View it online: {preview_url}"
        )
    else:
        gaps.append("- No preview picture is available for this theme.")
    if shared:
        names = ", ".join(f"`--{name}`" for name in shared)
        gaps.append(
            f"- Shared tokens used here but not defined: {names}. Define them in "
            "the project's token layer."
        )
    gaps.append(
        "- Where this file names `waive <gate>`, record the waiver under "
        "`## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`)."
    )
    gaps.append("- Photographs are not supplied. Use the project's own.")
    return gaps


def theme_document(header: dict, text: str, preview_url: str | None) -> str:
    """Convert one hallmark theme file into a stitch-shaped DESIGN.md entry."""
    _, body = split_frontmatter(text)
    lead, upstream = markdown_sections(body)
    missing = [name for name in THEME_SECTIONS if name not in upstream]
    if missing:
        raise ValueError(
            f"theme:{header['slug']} is missing sections: {', '.join(missing)}"
        )
    css = re.search(r"```css\n(.*?)```", upstream["Tokens"], re.S)
    if not css or ":root" not in css.group(1):
        raise ValueError(f"theme:{header['slug']} has no :root token block")
    tokens = dict(split_css_declarations(css.group(1)))
    parts = [
        "---",
        *yaml_block(theme_frontmatter(header, tokens)),
        "---",
        "",
        "## Overview",
        "",
        lead,
        "",
        "## Colors",
        "",
        "This is the theme's token layer. Copy the `:root` block into the "
        "project's token layer as written; the frontmatter maps the same values "
        "to roles. Values are OKLCH.",
        "",
        upstream["Tokens"],
        "",
        "## Typography",
        "",
        upstream["Type"],
        "",
        "## Layout",
        "",
        "This is the material's compositional range: what it sets well without a "
        "photograph. It is not a page structure, a section order, or a component "
        "that a page must include.",
        "",
        upstream["Range"],
        "",
        "## Elevation & Depth",
        "",
        upstream["Surfaces"],
        "",
        "## Components",
        "",
        upstream["Controls"],
        "",
        "## Motion",
        "",
        upstream["Motion"],
        "",
        "## Voice",
        "",
        upstream["Voice"],
        "",
        "## Do's and Don'ts",
        "",
        "### Do",
        "",
        "- Build sections from the treatments in Layout; they are what this "
        "material makes.",
        "- Keep every colour, face, radius, and shadow on the tokens in Colors.",
        "",
        "### Don't",
        "",
        upstream["Do-nots"],
        "",
        "## Implementation Hint",
        "",
        upstream["Build hint"],
        "",
        "## Known Gaps",
        "",
        *theme_known_gaps(body, tokens, upstream["Build hint"], preview_url),
    ]
    return normalize(rewrite_refs("\n".join(parts)))


def build_themes(
    hallmark: Path, commit: str | None, config: dict, errors: list[str]
) -> tuple[list[dict], dict[str, str]]:
    root = hallmark / HALLMARK_THEMES
    if not root.is_dir():
        errors.append(f"hallmark themes directory not found: {root}")
        return [], {}
    genre_map = config.get("theme", {}).get("genres", {})
    upstream_index: dict[str, dict] = {}
    index_path = root / "index.json"
    if index_path.is_file():
        payload = json.loads(index_path.read_text(encoding="utf-8"))
        upstream_index = {item["slug"]: item for item in payload.get("themes", [])}
    entries: list[dict] = []
    files: dict[str, str] = {}
    seen: set[str] = set()
    for source in sorted(root.glob("*.md")):
        if source.name == "README.md":
            continue
        text = normalize(source.read_text(encoding="utf-8"))
        try:
            header = parse_theme_header(text, source.name)
        except ValueError as error:
            errors.append(str(error))
            continue
        slug = header["slug"]
        seen.add(slug)
        if slug != source.stem:
            errors.append(f"{source.name}: slug {slug} does not match the file name")
            continue
        if upstream_index:
            upstream = upstream_index.get(slug)
            if upstream is None:
                errors.append(f"theme:{slug} is missing from upstream index.json")
            else:
                for key, value in header.items():
                    if upstream.get(key) != value:
                        errors.append(
                            f"theme:{slug} header {key} differs from upstream index.json"
                        )
        category = genre_map.get(header["genre"])
        if category is None:
            errors.append(
                f"theme:{slug} genre {header['genre']} has no category "
                "(add it to theme.genres in categories.json)"
            )
            continue
        preview_url = (
            HALLMARK_PREVIEW.format(commit=commit, slug=slug)
            if commit and source.with_suffix(".jpg").is_file()
            else None
        )
        try:
            document = theme_document(header, text, preview_url)
        except ValueError as error:
            errors.append(str(error))
            continue
        unresolved = unresolved_refs(document)
        if unresolved:
            errors.append(
                f"theme:{slug} has unresolved references: {', '.join(unresolved)}"
            )
            continue
        lead, _ = markdown_sections(split_frontmatter(text)[1])
        path = f"themes/{slug}.md"
        files[path] = document
        entry = {
            "id": f"theme:{slug}",
            "kind": "theme",
            "slug": slug,
            "name": header["name"],
            "category": category,
            "description": first_sentence(" ".join(lead.split())),
            "format": "theme",
            "path": path,
            "source": "hallmark",
            "upstream_path": f"{HALLMARK_THEMES}/{slug}.md",
            "theme": theme_record(header),
        }
        if preview_url:
            entry["preview_url"] = preview_url
        entries.append(entry)
    for slug in sorted(set(upstream_index) - seen):
        errors.append(f"theme:{slug} is in upstream index.json but has no file")
    if not entries and not errors:
        errors.append(f"no theme files found under {root}")
    return entries, files


def apply_dedup(out: Path, entries: list[dict], errors: list[str]) -> None:
    """Merge out/overlays/dedup.json into theme entries and their targets."""
    for entry in entries:
        entry.pop("superseded_by", None)
        entry.pop("cluster", None)
    themes = {entry["slug"]: entry for entry in entries if entry["kind"] == "theme"}
    if not themes:
        return
    path = out / "overlays" / "dedup.json"
    if not path.is_file():
        errors.append("overlays/dedup.json is missing; every theme needs a verdict")
        return
    try:
        verdicts = json.loads(path.read_text(encoding="utf-8"))["verdicts"]
        if not isinstance(verdicts, dict):
            raise TypeError("verdicts must be an object")
    except (json.JSONDecodeError, KeyError, TypeError) as error:
        errors.append(f"overlays/dedup.json is not valid: {error}")
        return
    by_id = {entry["id"]: entry for entry in entries if entry["kind"] != "theme"}
    local_errors: list[str] = []
    for slug in sorted(set(themes) - set(verdicts)):
        local_errors.append(f"dedup.json has no verdict for theme {slug}")
    for slug in sorted(set(verdicts) - set(themes)):
        print(f"warning: dedup.json names unknown theme {slug}", file=sys.stderr)
    clusters: dict[str, str] = {}
    superseded: dict[str, str] = {}
    staged: list[tuple[dict, str, str]] = []
    for slug in sorted(set(verdicts) & set(themes)):
        item = verdicts[slug]
        verdict = item.get("verdict") if isinstance(item, dict) else None
        if verdict not in DEDUP_VERDICTS:
            local_errors.append(f"dedup.json {slug}: unknown verdict {verdict!r}")
            continue
        if len(str(item.get("reason") or "").strip()) < DEDUP_MIN_REASON:
            local_errors.append(
                f"dedup.json {slug}: reason must be at least "
                f"{DEDUP_MIN_REASON} characters"
            )
            continue
        if verdict == "supersede":
            target = str(item.get("target") or "")
            if target not in by_id:
                local_errors.append(
                    f"dedup.json {slug}: supersede target {target!r} not found"
                )
                continue
            if target in superseded:
                local_errors.append(
                    f"dedup.json {slug}: {target} is already superseded by "
                    f"{superseded[target]}"
                )
                continue
            superseded[target] = f"theme:{slug}"
            staged.append((by_id[target], "superseded_by", f"theme:{slug}"))
        elif verdict == "cluster":
            cluster = str(item.get("cluster") or "")
            members = item.get("with") or []
            if not cluster or not isinstance(members, list):
                local_errors.append(
                    f"dedup.json {slug}: a cluster verdict needs cluster and a with list"
                )
                continue
            staged.append((themes[slug], "cluster", cluster))
            for member in members:
                if member not in by_id:
                    local_errors.append(
                        f"dedup.json {slug}: cluster member {member!r} not found"
                    )
                elif clusters.setdefault(member, cluster) != cluster:
                    local_errors.append(
                        f"dedup.json {slug}: {member} is already in cluster "
                        f"{clusters[member]}"
                    )
                else:
                    staged.append((by_id[member], "cluster", cluster))
    if local_errors:
        errors.extend(local_errors)
        return
    for entry, key, value in staged:
        entry[key] = value


def place_themes(entries: list[dict], themes: list[dict]) -> list[dict]:
    """Put themes after the last brand or style entry, before scenes."""
    kept = [entry for entry in entries if entry["kind"] != "theme"]
    cut = 0
    for position, entry in enumerate(kept):
        if entry["kind"] in ("brand", "style"):
            cut = position + 1
    return kept[:cut] + themes + kept[cut:]


def hallmark_source(commit: str) -> dict:
    return {
        "repo": HALLMARK_REPO,
        "commit": commit,
        "license": "MIT",
        "license_file": "LICENSES/hallmark.LICENSE",
    }


def load_existing_index(out: Path, errors: list[str]) -> dict:
    path = out / "index.json"
    if not path.is_file():
        errors.append(f"{path} is missing; it is needed to keep existing entries")
        return {"sources": {}, "entries": []}
    return json.loads(path.read_text(encoding="utf-8"))


def write_if_changed(path: Path, text: str) -> bool:
    data = text.encode("utf-8")
    if path.is_file() and path.read_bytes() == data:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return True


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--design-md", type=Path)
    parser.add_argument("--design-skills", type=Path)
    parser.add_argument("--hallmark", type=Path)
    parser.add_argument("--themes-only", action="store_true")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--commit-design-md")
    parser.add_argument("--commit-design-skills")
    parser.add_argument("--commit-hallmark")
    args = parser.parse_args(argv)
    if args.themes_only and not args.hallmark:
        parser.error("--themes-only needs --hallmark")
    if not args.themes_only and not (args.design_md and args.design_skills):
        parser.error(
            "--design-md and --design-skills are required without --themes-only"
        )

    config = json.loads((args.out / "categories.json").read_text(encoding="utf-8"))
    known_categories = {category["id"] for category in config["categories"]}
    errors: list[str] = []
    files: dict[str, str] = {}
    sources: dict[str, dict] = {}
    existing: dict | None = None

    if args.themes_only:
        existing = load_existing_index(args.out, errors)
        entries = [entry for entry in existing["entries"] if entry["kind"] != "theme"]
        sources = {
            name: source
            for name, source in existing["sources"].items()
            if name != "hallmark"
        }
    else:
        commits = {
            "awesome-design-md": git_commit(args.design_md, args.commit_design_md),
            "awesome-design-skills": git_commit(
                args.design_skills, args.commit_design_skills
            ),
        }
        for name, commit in commits.items():
            if not commit:
                errors.append(
                    f"cannot read the {name} commit; pass --commit-{name.removeprefix('awesome-')}"
                )
        brand_entries, brand_files = build_brands(args.design_md, config, errors)
        style_entries, style_files = build_styles(args.design_skills, config, errors)
        entries = brand_entries + style_entries
        files = {**brand_files, **style_files}
        sources = {
            "awesome-design-md": {
                "repo": DESIGN_MD_REPO,
                "commit": commits["awesome-design-md"],
                "license": "MIT",
                "license_file": "LICENSES/awesome-design-md.LICENSE",
            },
            "awesome-design-skills": {
                "repo": DESIGN_SKILLS_REPO,
                "commit": commits["awesome-design-skills"],
                "license": "MIT",
                "license_file": "LICENSES/awesome-design-skills.LICENSE",
            },
        }

    hallmark_commit: str | None = None
    kept_hallmark: dict | None = None
    if args.hallmark:
        hallmark_commit = git_commit(args.hallmark, args.commit_hallmark)
        if not hallmark_commit:
            errors.append("cannot read the hallmark commit; pass --commit-hallmark")
        themes, theme_files = build_themes(
            args.hallmark, hallmark_commit, config, errors
        )
        files.update(theme_files)
    else:
        if (args.out / "index.json").is_file():
            existing = json.loads((args.out / "index.json").read_text(encoding="utf-8"))
            themes = [
                entry for entry in existing["entries"] if entry["kind"] == "theme"
            ]
            kept_hallmark = existing["sources"].get("hallmark")
        else:
            themes = []
        print(f"themes: kept (no --hallmark), {len(themes)} entries")

    entries = place_themes(entries, themes)
    for entry in entries:
        if entry["category"] not in known_categories:
            errors.append(f"{entry['id']} uses unknown category {entry['category']}")
    if not args.themes_only:
        merge_first_party(args.out, entries, files, known_categories, errors)
    apply_dedup(args.out, entries, errors)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1

    if not args.themes_only:
        files["LICENSES/awesome-design-md.LICENSE"] = normalize(
            (args.design_md / "LICENSE").read_text(encoding="utf-8")
        )
        files["LICENSES/awesome-design-skills.LICENSE"] = normalize(
            (args.design_skills / "LICENSE").read_text(encoding="utf-8")
        )
    if args.hallmark and hallmark_commit:
        files["LICENSES/hallmark.LICENSE"] = normalize(
            (args.hallmark / "LICENSE").read_text(encoding="utf-8")
        )
        sources["hallmark"] = hallmark_source(hallmark_commit)
    elif kept_hallmark:
        sources["hallmark"] = kept_hallmark
    index = {
        "schema_version": 1,
        "sources": sources,
        "categories": sorted(
            config["categories"], key=lambda category: category["order"]
        ),
        "entries": entries,
    }
    files["index.json"] = json.dumps(index, ensure_ascii=False, indent=2) + "\n"

    changed = sum(write_if_changed(args.out / rel, text) for rel, text in files.items())
    removed = 0
    folders = [] if args.themes_only else ["brands", "styles"]
    if args.hallmark:
        folders.append("themes")
    for folder in folders:
        for stale in sorted((args.out / folder).glob("*.md")):
            if f"{folder}/{stale.name}" not in files:
                stale.unlink()
                removed += 1
    scenes_root = args.out / "scenes"
    if not args.themes_only and scenes_root.is_dir():
        for stale in sorted(scenes_root.rglob("*.md")):
            # Manifest paths use forward slashes. Match them on Windows.
            rel = stale.relative_to(args.out).as_posix()
            if rel not in files:
                stale.unlink()
                removed += 1
    counts = {
        kind: sum(entry["kind"] == kind for entry in entries)
        for kind in ("brand", "style", "theme", "scene")
    }
    print(
        f"brands={counts['brand']} styles={counts['style']} themes={counts['theme']} "
        f"scenes={counts['scene']} files_written={changed} files_removed={removed}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
