#!/usr/bin/env python3
"""Rebuild the design-md catalog from upstream checkouts.

Maintainer tool. The skill runtime never reads the upstream checkouts.

Inputs:
  --design-md      checkout of https://github.com/VoltAgent/awesome-design-md
  --design-skills  checkout of https://github.com/bergside/awesome-design-skills
  --out            catalog directory that holds categories.json

Outputs (under --out): brands/*.md, styles/*.md, LICENSES/*, index.json.
Exit 1 when any entry has no category; nothing is written in that case.
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
    parser.add_argument("--design-md", type=Path, required=True)
    parser.add_argument("--design-skills", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--commit-design-md")
    parser.add_argument("--commit-design-skills")
    args = parser.parse_args(argv)

    config = json.loads((args.out / "categories.json").read_text(encoding="utf-8"))
    known_categories = {category["id"] for category in config["categories"]}
    errors: list[str] = []
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
    for entry in entries:
        if entry["category"] not in known_categories:
            errors.append(f"{entry['id']} uses unknown category {entry['category']}")
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1

    files = {**brand_files, **style_files}
    files["LICENSES/awesome-design-md.LICENSE"] = normalize(
        (args.design_md / "LICENSE").read_text(encoding="utf-8")
    )
    files["LICENSES/awesome-design-skills.LICENSE"] = normalize(
        (args.design_skills / "LICENSE").read_text(encoding="utf-8")
    )
    index = {
        "schema_version": 1,
        "sources": {
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
        },
        "categories": sorted(
            config["categories"], key=lambda category: category["order"]
        ),
        "entries": entries,
    }
    files["index.json"] = json.dumps(index, ensure_ascii=False, indent=2) + "\n"

    changed = sum(write_if_changed(args.out / rel, text) for rel, text in files.items())
    removed = 0
    for folder in ("brands", "styles"):
        for stale in sorted((args.out / folder).glob("*.md")):
            if f"{folder}/{stale.name}" not in files:
                stale.unlink()
                removed += 1
    print(
        f"brands={len(brand_entries)} styles={len(style_entries)} "
        f"files_written={changed} files_removed={removed}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
