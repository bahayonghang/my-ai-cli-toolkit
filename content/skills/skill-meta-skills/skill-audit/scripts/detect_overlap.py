#!/usr/bin/env python
"""Detect scope overlap between Claude Code skills in a directory."""

import json
import re
import sys
from pathlib import Path

FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
CJK_PATTERN = re.compile(r"[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]")

# ── Helpers ──────────────────────────────────────────────────────────────────


def _parse_frontmatter_fields(content: str) -> dict[str, str | list[str]]:
    """Extract YAML frontmatter fields from SKILL.md content."""
    m = FRONTMATTER_PATTERN.match(content)
    if not m:
        return {}
    fields: dict[str, str | list[str]] = {}
    current_key: str | None = None
    for line in m.group(1).split("\n"):
        if re.match(r"^\S.*:", line):
            key, val = line.split(":", 1)
            k = key.strip()
            current_key = k
            fields[k] = val.strip()
        elif current_key and line.startswith(("  ", "\t")):
            stripped = line.strip()
            if stripped.startswith("- "):
                item = stripped[2:].strip()
                existing = fields[current_key]
                if isinstance(existing, list):
                    existing.append(item)
                else:
                    fields[current_key] = [item]
            else:
                existing = fields[current_key]
                if isinstance(existing, str):
                    fields[current_key] = existing + " " + stripped
    return fields


def _get_tags(fields: dict[str, str | list[str]]) -> set[str]:
    """Extract tags as a normalized set."""
    raw = fields.get("tags", [])
    if isinstance(raw, str):
        return {t.strip().lower() for t in raw.split(",") if t.strip()}
    return {t.lower() for t in raw}


def _tokenize(text: str) -> list[str]:
    """Tokenize text into words, handling CJK by splitting into characters."""
    if not text:
        return []
    tokens: list[str] = []
    buf: list[str] = []
    for ch in text.lower():
        if CJK_PATTERN.match(ch):
            if buf:
                tokens.append("".join(buf))
                buf = []
            tokens.append(ch)
        elif ch.isalnum() or ch == "-":
            buf.append(ch)
        else:
            if buf:
                tokens.append("".join(buf))
                buf = []
    if buf:
        tokens.append("".join(buf))
    return tokens


def _ngrams(tokens: list[str], n: int = 2) -> set[tuple[str, ...]]:
    """Generate n-grams from a token list."""
    if len(tokens) < n:
        return {tuple(tokens)} if tokens else set()
    return {tuple(tokens[i : i + n]) for i in range(len(tokens) - n + 1)}


def _jaccard(set_a: set, set_b: set) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set_a and not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


# ── Core Logic ───────────────────────────────────────────────────────────────


def scan_skills(skills_root: Path) -> list[dict]:
    """Scan a directory for skill subdirectories and extract metadata."""
    skills: list[dict] = []
    for child in sorted(skills_root.iterdir()):
        skill_md = child / "SKILL.md"
        if not child.is_dir() or not skill_md.exists():
            continue
        try:
            content = skill_md.read_text(encoding="utf-8")
        except Exception:
            continue
        fields = _parse_frontmatter_fields(content)
        name = fields.get("name", child.name)
        if isinstance(name, list):
            name = name[0]
        desc = fields.get("description", "")
        if isinstance(desc, list):
            desc = " ".join(desc)
        skills.append({
            "name": str(name),
            "path": str(child),
            "description": str(desc),
            "tags": _get_tags(fields),
            "desc_tokens": _tokenize(str(desc)),
        })
    return skills


def detect_overlaps(
    skills: list[dict],
    *,
    desc_threshold: float = 0.4,
    min_shared_tags: int = 2,
    target: str | None = None,
) -> dict:
    """Detect scope overlaps between skills.

    Args:
        skills: List of skill metadata dicts from scan_skills().
        desc_threshold: Jaccard similarity threshold for description overlap.
        min_shared_tags: Minimum shared tags to flag overlap.
        target: If set, only report overlaps involving this skill name.

    Returns:
        Report dict with overlaps and summary.
    """
    overlaps: list[dict] = []
    pairs_checked = 0

    for i, a in enumerate(skills):
        for b in skills[i + 1 :]:
            # Filter by target if specified
            if target and a["name"] != target and b["name"] != target:
                continue
            pairs_checked += 1

            pair_issues: list[dict] = []

            # 1. Description similarity (bigram Jaccard)
            ngrams_a = _ngrams(a["desc_tokens"])
            ngrams_b = _ngrams(b["desc_tokens"])
            desc_sim = _jaccard(ngrams_a, ngrams_b)
            if desc_sim >= desc_threshold:
                pair_issues.append({
                    "type": "description_similarity",
                    "severity": "critical" if desc_sim >= 0.6 else "recommended",
                    "score": round(desc_sim, 3),
                    "detail": (
                        f"Description similarity {desc_sim:.1%}"
                        f" ≥ {desc_threshold:.0%} threshold"
                    ),
                    "fix": "Differentiate descriptions with distinct trigger conditions and scope.",
                })

            # 2. Tags overlap
            shared_tags = a["tags"] & b["tags"]
            if len(shared_tags) >= min_shared_tags:
                pair_issues.append({
                    "type": "tags_overlap",
                    "severity": "recommended",
                    "shared_tags": sorted(shared_tags),
                    "detail": f"Shared {len(shared_tags)} tags: {', '.join(sorted(shared_tags))}",
                    "fix": "Use more specific tags to differentiate skill scopes.",
                })

            # 3. Description keyword overlap (unigram overlap ratio)
            # Filter out stop words for meaningful comparison
            stop = {
                "a", "an", "the", "is", "are", "to", "for", "and",
                "or", "of", "in", "on", "use", "when", "with",
                "this", "that",
            }
            kw_a = {t for t in a["desc_tokens"] if t not in stop and len(t) > 1}
            kw_b = {t for t in b["desc_tokens"] if t not in stop and len(t) > 1}
            kw_overlap = _jaccard(kw_a, kw_b)
            has_desc_sim = any(
                x["type"] == "description_similarity" for x in pair_issues
            )
            if kw_overlap >= 0.5 and not has_desc_sim:
                pair_issues.append({
                    "type": "keyword_overlap",
                    "severity": "recommended",
                    "score": round(kw_overlap, 3),
                    "shared_keywords": sorted(kw_a & kw_b),
                    "detail": (
                        f"Keyword overlap {kw_overlap:.1%}"
                        " — skills may serve similar purposes"
                    ),
                    "fix": "Clarify scope boundaries in descriptions.",
                })

            if pair_issues:
                overlaps.append({
                    "skill_a": a["name"],
                    "skill_b": b["name"],
                    "issues": pair_issues,
                })

    return {
        "skills_scanned": len(skills),
        "pairs_checked": pairs_checked,
        "overlaps": overlaps,
        "summary": {
            "total_overlaps": len(overlaps),
            "critical": sum(
                1 for o in overlaps for iss in o["issues"] if iss["severity"] == "critical"
            ),
            "recommended": sum(
                1 for o in overlaps for iss in o["issues"] if iss["severity"] == "recommended"
            ),
        },
    }


# ── CLI ──────────────────────────────────────────────────────────────────────


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python detect_overlap.py <skills-root-dir>"
            " [--target <skill-name>]",
            file=sys.stderr,
        )
        sys.exit(1)

    skills_root = Path(sys.argv[1])
    if not skills_root.is_dir():
        print(f"Error: '{skills_root}' is not a directory.", file=sys.stderr)
        sys.exit(1)

    target = None
    if "--target" in sys.argv:
        idx = sys.argv.index("--target")
        if idx + 1 < len(sys.argv):
            target = sys.argv[idx + 1]

    skills = scan_skills(skills_root)
    report = detect_overlaps(skills, target=target)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
