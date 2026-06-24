#!/usr/bin/env python3
"""Mechanical lint for academic AI-writing tells (en-journal / zh-dissertation).

A reporter, not a gate. It surfaces the *quantifiable* tells the model tends to
miss — dash and quote characters, AI high-frequency vocabulary, Chinese
"几字+逗号" short clauses, sentence cadence/burstiness, over-long sentences, and
optional glossary-driven terminology variants. It never rewrites text and its
exit code is always 0; the rewrite stays with the model, guided by the skill's
`references/`.
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from collections import Counter
from pathlib import Path
from typing import Any

# Self-locate in the suite style (Path(__file__)). Not needed for the logic
# below, but kept so the script matches the bundled-script convention and can
# resolve sibling resources if that is ever required.
SCRIPT_DIR = Path(__file__).resolve().parent

TARGETS = ("en-journal", "zh-dissertation")

# --- Surface-tell character classes ----------------------------------------

EM_DASH = "—"  # —
EN_DASH = "–"  # –
CURLY_QUOTES = "“”‘’"  # “ ” ‘ ’
DOUBLE_HYPHEN_RE = re.compile(r"(?<!-)--(?!-)")
# Emoji / pictographic ranges (deliberately broad; misc symbols + dingbats +
# supplemental pictographs + emoticons + transport + flags).
EMOJI_RE = re.compile(
    "["
    "\U0001f300-\U0001faff"
    "\U00002600-\U000027bf"
    "\U0001f000-\U0001f0ff"
    "\U0001f1e6-\U0001f1ff"
    "⬀-⯿"
    "️"
    "]"
)

# Markdown ATX heading line, e.g. "## Strategic Negotiations And Partners".
HEADING_RE = re.compile(r"^\s{0,3}#{1,6}\s+(.*\S)\s*$")
SMALL_WORDS = {
    "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into",
    "nor", "of", "on", "or", "the", "to", "via", "vs", "with",
}

# AI high-frequency vocabulary, kept in sync with
# references/ai-tells-academic.md (Part 1 §7 + Part 2). English markers are
# matched as whole words, case-insensitively; Chinese markers are matched as
# substrings.
AI_WORDS_EN = [
    "delve", "intricate", "tapestry", "testament", "underscore",
    "underscores", "underscoring", "leverage", "leverages", "leveraging",
    "pivotal", "realm", "nuanced", "robust", "groundbreaking",
    "state-of-the-art", "seamless", "seamlessly", "showcase", "showcases",
    "showcasing", "boast", "boasts", "vibrant", "landscape", "interplay",
    "meticulous", "meticulously", "paradigm", "holistic", "synergy",
    "furthermore", "moreover", "additionally",
]
AI_WORDS_ZH = [
    "赋能", "抓手", "维度", "深入", "助力", "强大的", "先进的", "卓越的",
    "前景广阔", "未来可期", "至关重要", "重要意义", "广泛应用", "显著成效",
    "众所周知", "值得注意的是", "综上所述",
]

# Ghost-citation phrases (no author-year / numbered reference).
GHOST_CITE_EN = [
    r"studies show",
    r"research (?:shows|proves|indicates|suggests)",
    r"it is (?:well[ -]established|widely (?:known|accepted)) that",
    r"experts (?:say|argue|believe|agree)",
    r"data prove[s]?",
]
GHOST_CITE_ZH = [
    "研究表明", "大量文献指出", "众所周知", "有研究表明", "实验表明",
    "已有研究表明", "相关研究指出", "普遍认为",
]

# Chinese "几字 + 逗号" short connectors that stack into low-burstiness lists.
ZH_SHORT_CONNECTORS = [
    "首先，", "其次，", "再次，", "然后，", "接着，", "最后，",
    "综上，", "综上所述，", "总之，", "总而言之，", "此外，", "另外，",
    "因此，", "由此可见，", "一方面，", "另一方面，",
]

# Sentence terminators.
EN_SENT_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
ZH_SENT_SPLIT_RE = re.compile(r"(?<=[。！？；])")

ZH_LONG_SENTENCE_CHARS = 28
LOW_BURSTINESS_STDEV = 4.0  # stdev of sentence length below this flags monotony.


def read_input(file_path: str | None) -> str:
    """Read the target text from a file (UTF-8) or stdin."""
    if file_path:
        return Path(file_path).expanduser().read_text(encoding="utf-8")
    return sys.stdin.read()


def iter_lines(text: str) -> list[str]:
    return text.replace("\r\n", "\n").replace("\r", "\n").split("\n")


def excerpt_at(line: str, index: int, width: int = 40) -> str:
    start = max(0, index - width // 2)
    end = min(len(line), start + width)
    snippet = line[start:end].strip()
    return snippet


def find_char_hits(lines: list[str], needles: str) -> list[dict[str, Any]]:
    """One hit per line per distinct character in `needles`."""
    hits: list[dict[str, Any]] = []
    for lineno, line in enumerate(lines, start=1):
        for ch in needles:
            idx = line.find(ch)
            if idx != -1:
                hits.append(
                    {
                        "line": lineno,
                        "char": ch,
                        "count": line.count(ch),
                        "excerpt": excerpt_at(line, idx),
                    }
                )
    return hits


def find_regex_hits(
    lines: list[str], pattern: re.Pattern[str], *, label_group: int = 0
) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    for lineno, line in enumerate(lines, start=1):
        for match in pattern.finditer(line):
            hits.append(
                {
                    "line": lineno,
                    "match": match.group(label_group),
                    "excerpt": excerpt_at(line, match.start()),
                }
            )
    return hits


def find_substring_hits(
    lines: list[str], needles: list[str]
) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    for lineno, line in enumerate(lines, start=1):
        for needle in needles:
            idx = line.find(needle)
            if idx != -1:
                hits.append(
                    {
                        "line": lineno,
                        "match": needle,
                        "count": line.count(needle),
                        "excerpt": excerpt_at(line, idx),
                    }
                )
    return hits


def find_word_hits(
    lines: list[str], words: list[str]
) -> list[dict[str, Any]]:
    """Whole-word, case-insensitive English vocabulary hits."""
    pattern = re.compile(
        r"(?<![\w-])(" + "|".join(re.escape(w) for w in words) + r")(?![\w-])",
        re.IGNORECASE,
    )
    hits: list[dict[str, Any]] = []
    for lineno, line in enumerate(lines, start=1):
        for match in pattern.finditer(line):
            hits.append(
                {
                    "line": lineno,
                    "match": match.group(1).lower(),
                    "excerpt": excerpt_at(line, match.start()),
                }
            )
    return hits


def is_title_case_heading(heading: str) -> bool:
    """True if a heading looks like Title Case (most non-small words capped)."""
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", heading)
    if len(words) < 3:
        return False
    significant = [w for w in words if w.lower() not in SMALL_WORDS]
    if len(significant) < 2:
        return False
    capped = sum(1 for w in significant if w[0].isupper())
    return capped >= max(2, int(round(len(significant) * 0.8)))


def find_title_case_headings(lines: list[str]) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    for lineno, line in enumerate(lines, start=1):
        match = HEADING_RE.match(line)
        if not match:
            continue
        heading = match.group(1)
        if is_title_case_heading(heading):
            hits.append({"line": lineno, "heading": heading})
    return hits


def split_sentences(text: str, target: str) -> list[str]:
    flat = re.sub(r"\s+", " ", text).strip()
    if not flat:
        return []
    if target == "zh-dissertation":
        pieces = ZH_SENT_SPLIT_RE.split(flat)
    else:
        pieces = EN_SENT_SPLIT_RE.split(flat)
    return [piece.strip() for piece in pieces if piece.strip()]


def sentence_length(sentence: str, target: str) -> int:
    if target == "zh-dissertation":
        # Count CJK + alphanumerics as "字"; ignore punctuation/spaces.
        return sum(
            1
            for ch in sentence
            if "一" <= ch <= "鿿" or ch.isalnum()
        )
    return len(sentence.split())


def cadence_report(text: str, target: str) -> dict[str, Any]:
    sentences = split_sentences(text, target)
    lengths = [sentence_length(s, target) for s in sentences]
    unit = "chars" if target == "zh-dissertation" else "words"
    report: dict[str, Any] = {
        "unit": unit,
        "sentence_count": len(sentences),
        "mean_length": 0.0,
        "stdev_length": 0.0,
        "min_length": 0,
        "max_length": 0,
        "low_burstiness": False,
    }
    if not lengths:
        return report

    report["mean_length"] = round(statistics.fmean(lengths), 2)
    report["stdev_length"] = (
        round(statistics.stdev(lengths), 2) if len(lengths) > 1 else 0.0
    )
    report["min_length"] = min(lengths)
    report["max_length"] = max(lengths)
    report["low_burstiness"] = (
        len(lengths) >= 3 and report["stdev_length"] < LOW_BURSTINESS_STDEV
    )

    if target == "zh-dissertation":
        over_long = [
            {"length": length, "excerpt": sentence[:50]}
            for sentence, length in zip(sentences, lengths)
            if length > ZH_LONG_SENTENCE_CHARS
        ]
        report["over_long_threshold"] = ZH_LONG_SENTENCE_CHARS
        report["over_long_count"] = len(over_long)
        report["over_long_ratio"] = round(len(over_long) / len(lengths), 3)
        report["over_long_sentences"] = over_long[:20]

    return report


def parse_glossary(glossary_path: str) -> dict[str, list[str]]:
    """Parse `canonical: variant1, variant2` lines into {canonical: [variants]}."""
    glossary: dict[str, list[str]] = {}
    for raw in Path(glossary_path).expanduser().read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        canonical, _, rest = line.partition(":")
        canonical = canonical.strip()
        if not canonical:
            continue
        variants = [
            part.strip()
            for part in re.split(r"[,，]", rest)
            if part.strip()
        ]
        if variants:
            glossary[canonical] = variants
    return glossary


def candidate_terms(text: str, target: str, *, top: int = 15) -> list[dict[str, Any]]:
    """Frequent term-like tokens for human review (NON-semantic heuristic)."""
    if target == "zh-dissertation":
        tokens = re.findall(r"[一-鿿]{2,6}", text)
    else:
        tokens = [
            t.lower()
            for t in re.findall(r"[A-Za-z][A-Za-z-]{3,}", text)
            if t.lower() not in SMALL_WORDS
        ]
    counter = Counter(tokens)
    return [
        {"term": term, "count": count}
        for term, count in counter.most_common(top)
        if count > 1
    ]


def terms_report(
    text: str, lines: list[str], target: str, glossary_path: str | None
) -> dict[str, Any]:
    if glossary_path:
        glossary = parse_glossary(glossary_path)
        variant_hits: list[dict[str, Any]] = []
        for canonical, variants in glossary.items():
            for variant in variants:
                for hit in find_substring_hits(lines, [variant]):
                    variant_hits.append(
                        {
                            "canonical": canonical,
                            "variant": variant,
                            "line": hit["line"],
                            "excerpt": hit["excerpt"],
                        }
                    )
        return {
            "mode": "glossary",
            "semantic": True,
            "glossary_terms": len(glossary),
            "variant_hits": variant_hits,
            "variant_hit_count": len(variant_hits),
        }
    return {
        "mode": "candidates",
        "semantic": False,
        "note": (
            "No --glossary supplied; these are frequent term-like tokens for "
            "human review only. This is a frequency heuristic, NOT semantic "
            "terminology-drift detection. A human/model must decide canonical "
            "terms and real drift."
        ),
        "candidate_terms": candidate_terms(text, target),
    }


def surface_report(lines: list[str], target: str) -> dict[str, Any]:
    em_dash = find_char_hits(lines, EM_DASH)
    en_dash = find_char_hits(lines, EN_DASH)
    double_hyphen = find_regex_hits(lines, DOUBLE_HYPHEN_RE)
    curly_quotes = find_char_hits(lines, CURLY_QUOTES)
    emoji = find_regex_hits(lines, EMOJI_RE)
    title_case = find_title_case_headings(lines)

    report: dict[str, Any] = {
        "em_dash": em_dash,
        "en_dash": en_dash,
        "double_hyphen": double_hyphen,
        "curly_quotes": curly_quotes,
        "emoji": emoji,
        "title_case_headings": title_case,
    }

    if target == "zh-dissertation":
        report["ai_words"] = find_substring_hits(lines, AI_WORDS_ZH)
        report["ghost_citations"] = find_substring_hits(lines, GHOST_CITE_ZH)
        report["zh_short_connectors"] = find_substring_hits(lines, ZH_SHORT_CONNECTORS)
    else:
        report["ai_words"] = find_word_hits(lines, AI_WORDS_EN)
        ghost_pattern = re.compile("|".join(GHOST_CITE_EN), re.IGNORECASE)
        report["ghost_citations"] = find_regex_hits(lines, ghost_pattern)

    return report


def count_hits(value: Any) -> int:
    return len(value) if isinstance(value, list) else 0


def build_summary(surface: dict[str, Any], cadence: dict[str, Any]) -> dict[str, Any]:
    surface_total = sum(count_hits(v) for v in surface.values())
    summary = {
        "surface_hit_total": surface_total,
        "sentence_count": cadence.get("sentence_count", 0),
        "mean_length": cadence.get("mean_length", 0.0),
        "low_burstiness": cadence.get("low_burstiness", False),
    }
    if "over_long_count" in cadence:
        summary["over_long_count"] = cadence["over_long_count"]
        summary["over_long_ratio"] = cadence["over_long_ratio"]
    return summary


def analyze(
    text: str, target: str, glossary_path: str | None
) -> dict[str, Any]:
    lines = iter_lines(text)
    surface = surface_report(lines, target)
    cadence = cadence_report(text, target)
    terms = terms_report(text, lines, target, glossary_path)
    summary = build_summary(surface, cadence)
    return {
        "target": target,
        "surface": surface,
        "cadence": cadence,
        "terms": terms,
        "summary": summary,
    }


def render_human(payload: dict[str, Any]) -> str:
    out: list[str] = []
    out.append(f"polish_lint — target: {payload['target']}")
    out.append("")

    out.append("## surface tells")
    surface = payload["surface"]
    surface_labels = {
        "em_dash": "em dash (—)",
        "en_dash": "en dash (–)",
        "double_hyphen": "double hyphen (--)",
        "curly_quotes": "curly quotes",
        "emoji": "emoji",
        "title_case_headings": "Title Case headings",
        "ai_words": "AI high-frequency words",
        "ghost_citations": "ghost citations",
        "zh_short_connectors": "几字+逗号 short connectors",
    }
    for key, label in surface_labels.items():
        if key not in surface:
            continue
        hits = surface[key]
        out.append(f"- {label}: {len(hits)}")
        for hit in hits[:5]:
            token = hit.get("match") or hit.get("char") or hit.get("heading") or ""
            out.append(f"    line {hit['line']}: {token!r}  | {hit.get('excerpt', '')}")
        if len(hits) > 5:
            out.append(f"    … and {len(hits) - 5} more")

    out.append("")
    out.append("## cadence")
    cadence = payload["cadence"]
    out.append(f"- sentences: {cadence['sentence_count']} (unit: {cadence['unit']})")
    out.append(
        f"- mean length: {cadence['mean_length']}  stdev: {cadence['stdev_length']}  "
        f"min/max: {cadence['min_length']}/{cadence['max_length']}"
    )
    out.append(f"- low burstiness: {cadence['low_burstiness']}")
    if "over_long_count" in cadence:
        out.append(
            f"- over-long (> {cadence['over_long_threshold']} 字): "
            f"{cadence['over_long_count']} ({cadence['over_long_ratio']:.1%})"
        )

    out.append("")
    out.append("## terms")
    terms = payload["terms"]
    if terms["mode"] == "glossary":
        out.append(
            f"- glossary terms: {terms['glossary_terms']}, "
            f"variant hits: {terms['variant_hit_count']}"
        )
        for hit in terms["variant_hits"][:10]:
            out.append(
                f"    line {hit['line']}: {hit['variant']!r} "
                f"(→ {hit['canonical']!r})"
            )
    else:
        out.append("- mode: candidate frequency (NON-semantic; human review only)")
        for cand in terms["candidate_terms"][:10]:
            out.append(f"    {cand['term']!r}: {cand['count']}")

    out.append("")
    out.append("## summary")
    for key, value in payload["summary"].items():
        out.append(f"- {key}: {value}")

    out.append("")
    out.append(
        "Reporter only: this maps quantifiable tells; the rewrite stays with "
        "the model, guided by references/. Judge by clusters, not single hits."
    )
    return "\n".join(out)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--target",
        required=True,
        choices=list(TARGETS),
        help="Language rule set to apply.",
    )
    parser.add_argument(
        "--file",
        help="Path to the text file to lint. Reads stdin when omitted.",
    )
    parser.add_argument(
        "--glossary",
        help="Optional glossary file: 'canonical: variant1, variant2' per line.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON (default is a human-readable report).",
    )
    parser.add_argument(
        "--save",
        help="Optional path to write the report (matches --json/human choice).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        text = read_input(args.file)
    except OSError as exc:
        print(f"Could not read input: {exc}", file=sys.stderr)
        # Reporter contract: still exit 0; emit an empty-but-valid report shape.
        text = ""

    payload = analyze(text, args.target, args.glossary)

    if args.json:
        rendered = json.dumps(payload, ensure_ascii=False, indent=2)
    else:
        rendered = render_human(payload)

    if args.save:
        target = Path(args.save).expanduser()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(rendered + "\n", encoding="utf-8")

    print(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
