#!/usr/bin/env python3
"""Validate single-file offline HTML artifacts."""

from __future__ import annotations

import argparse
from html import unescape
import json
import re
from pathlib import Path
from typing import Any

MAX_WARN_BYTES = 1_500_000
HARDCODED_HEX_THRESHOLD = 24

XMLNS_ATTR = re.compile(
    r"""\bxmlns(?::[\w-]+)?\s*=\s*(['"])[^'"]*\1""",
    re.IGNORECASE,
)

STRUCTURE_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(r"<!doctype\s+html|<html\b", re.IGNORECASE),
        "missing <!doctype html> or <html>",
    ),
    (re.compile(r"<head\b", re.IGNORECASE), "missing <head>"),
    (re.compile(r"<body\b", re.IGNORECASE), "missing <body>"),
    (re.compile(r"</html\s*>", re.IGNORECASE), "missing closing </html>"),
    (
        re.compile(r"<meta\s+[^>]*charset\s*=", re.IGNORECASE),
        "missing <meta charset=...>",
    ),
    (
        re.compile(r"""<meta\s+[^>]*\bname\s*=\s*["']?viewport""", re.IGNORECASE),
        "missing viewport meta",
    ),
    (
        re.compile(r"<title\b[^>]*>.*?</title\s*>", re.IGNORECASE | re.DOTALL),
        "missing <title>",
    ),
    (re.compile(r"<main\b", re.IGNORECASE), "missing <main>"),
    (
        re.compile(r"""<main\b[^>]*\bid\s*=\s*["']?main\b""", re.IGNORECASE),
        'missing id="main" on <main>',
    ),
    (re.compile(r"<h1\b", re.IGNORECASE), "missing <h1>"),
)

OFFLINE_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"https?://", re.IGNORECASE), "contains http:// or https:// URL"),
    (
        re.compile(r"//\s*cdn|//cdn", re.IGNORECASE),
        "contains protocol-relative CDN URL",
    ),
    (
        re.compile(r"<script\b[^>]*\bsrc\s*=", re.IGNORECASE),
        "contains <script src=...>",
    ),
    (
        re.compile(
            r"<link\b[^>]*\brel\s*=\s*['\"]?(stylesheet|preload|prefetch|dns-prefetch|preconnect|modulepreload)\b",
            re.IGNORECASE,
        ),
        "contains remote <link rel='...'>",
    ),
    (re.compile(r"@import\b", re.IGNORECASE), "contains CSS @import"),
    (re.compile(r"\bfetch\s*\(", re.IGNORECASE), "contains fetch(...)"),
    (re.compile(r"\bXMLHttpRequest\b", re.IGNORECASE), "contains XMLHttpRequest"),
    (
        re.compile(r"\bsendBeacon\s*\(|\bnavigator\.sendBeacon\b", re.IGNORECASE),
        "contains sendBeacon",
    ),
    (re.compile(r"\bnew\s+WebSocket\b", re.IGNORECASE), "contains WebSocket"),
    (re.compile(r"\bEventSource\s*\(", re.IGNORECASE), "contains EventSource"),
    (re.compile(r"\bfetchLater\s*\(", re.IGNORECASE), "contains fetchLater"),
    (re.compile(r"<a\b[^>]*\bping\s*=", re.IGNORECASE), "contains <a ping=...>"),
    (re.compile(r"""(?<!:)//[^\s'"<>]+""", re.IGNORECASE), "contains protocol-relative URL"),
)

WARNING_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"skip-link|skip\s+to\s+main", re.IGNORECASE), "no skip link found"),
    (
        re.compile(r"prefers-reduced-motion", re.IGNORECASE),
        "no prefers-reduced-motion rule found",
    ),
    (
        re.compile(r"aria-|<caption\b", re.IGNORECASE),
        "no aria-* attribute or table caption found",
    ),
)

HEX_LITERAL = re.compile(r"#[0-9a-f]{3}(?:[0-9a-f]{3}(?:[0-9a-f]{2})?)?\b", re.IGNORECASE)
TOKEN_DEFINITION = re.compile(
    r"--[\w-]+\s*:\s*[^;{}]*?#[0-9a-f]{3,8}\b[^;{}]*[;{}]",
    re.IGNORECASE,
)
SUPPORTS_FALLBACK = re.compile(
    r"@supports\s+not\s*\(\s*color\s*:\s*oklch\b[^{]*\)\s*\{",
    re.IGNORECASE,
)
SVG_BLOCK = re.compile(r"<svg\b[^>]*>.*?</svg\s*>", re.IGNORECASE | re.DOTALL)
SVG_TEXT_BLOCK = re.compile(
    r"<text\b(?P<attrs>[^>]*)>(?P<body>.*?)</text\s*>",
    re.IGNORECASE | re.DOTALL,
)
SVG_HEX_ATTR = re.compile(
    r"""\b(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*['"]#[0-9a-f]{3,8}['"]""",
    re.IGNORECASE,
)
STYLE_BLOCK = re.compile(r"<style\b[^>]*>(.*?)</style\s*>", re.IGNORECASE | re.DOTALL)
CSS_RULE = re.compile(r"(?P<selector>[^{}]+)\{(?P<body>[^{}]*)\}", re.DOTALL)
ATTR_VALUE = re.compile(r"""\b(?P<name>[\w:-]+)\s*=\s*(?P<quote>['"])(?P<value>.*?)(?P=quote)""", re.DOTALL)
TAG_BLOCK = re.compile(r"<[^>]+>")
TABLE_BLOCK = re.compile(r"<table\b[^>]*>.*?</table\s*>", re.IGNORECASE | re.DOTALL)
HAS_CAPTION = re.compile(r"<caption\b", re.IGNORECASE)
H1_TAG = re.compile(r"<h1\b", re.IGNORECASE)
MERMAID_BLOCK = re.compile(
    r"(?:^|>|\n)\s*(?:graph\s+(?:TD|TB|BT|LR|RL)|flowchart\s+(?:TD|TB|BT|LR|RL)|sequenceDiagram\b|classDiagram\b|stateDiagram(?:-v2)?\b|erDiagram\b|journey\b|gantt\b|pie\b|mindmap\b|timeline\b)",
    re.IGNORECASE | re.MULTILINE,
)
FIGURE_DIAGRAM_BLOCK = re.compile(
    r"<figure\b(?=[^>]*\bclass\s*=\s*['\"][^'\"]*\bdiagram-frame\b)[^>]*>.*?</figure\s*>",
    re.IGNORECASE | re.DOTALL,
)
HAS_FIGCAPTION = re.compile(r"<figcaption\b", re.IGNORECASE)
TITLE_TAG = re.compile(r"<title\b[^>]*>.*?</title\s*>", re.IGNORECASE | re.DOTALL)
DESC_TAG = re.compile(r"<desc\b[^>]*>.*?</desc\s*>", re.IGNORECASE | re.DOTALL)
SVG_OPEN = re.compile(r"<svg\b(?P<attrs>[^>]*)>", re.IGNORECASE | re.DOTALL)
ACCESSIBLE_NAME_ATTR = re.compile(
    r"\b(?:aria-label|aria-labelledby|title)\s*=\s*(['\"])[^'\"]+\1", re.IGNORECASE | re.DOTALL
)

SVG_LABEL_MAX_CHARS = 44
SVG_LABEL_MAX_WORD_CHARS = 28


def _strip_balanced_block(text: str, opener_match: re.Match[str]) -> str:
    """Remove the @supports{...} block whose opening brace `opener_match` ends on."""
    depth = 1
    i = opener_match.end()
    while i < len(text) and depth > 0:
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        i += 1
    return text[: opener_match.start()] + text[i:]


def _without_fallback_blocks(text: str) -> str:
    """Strip every @supports not(color: oklch(...)) {...} block — those legitimately hold hex fallbacks."""
    out = text
    while True:
        m = SUPPORTS_FALLBACK.search(out)
        if not m:
            return out
        out = _strip_balanced_block(out, m)


def read_html(path: Path) -> tuple[str | None, str | None]:
    try:
        return path.read_text(encoding="utf-8"), None
    except UnicodeDecodeError as exc:
        return None, f"file is not valid UTF-8: {exc}"
    except OSError as exc:
        return None, f"cannot read file: {exc}"


def _hex_count_warning(html: str) -> str | None:
    stripped = _without_fallback_blocks(html)
    # Token definitions (--foo: #ff0000;) are legitimate sources of hex literals.
    stripped = TOKEN_DEFINITION.sub("", stripped)
    count = len(HEX_LITERAL.findall(stripped))
    if count > HARDCODED_HEX_THRESHOLD:
        return (
            f"{count} hard-coded hex colors outside the OKLCH @supports fallback "
            f"and token definitions (threshold {HARDCODED_HEX_THRESHOLD}); "
            "consider moving them to var(--*) tokens or currentColor"
        )
    return None


def _svg_token_warning(html: str) -> list[str]:
    findings: list[str] = []
    for idx, block in enumerate(SVG_BLOCK.findall(html), start=1):
        if SVG_HEX_ATTR.search(block):
            findings.append(
                f"<svg> block #{idx} uses hard-coded hex in fill/stroke/stop-color; "
                "prefer currentColor or var(--accent)/var(--chart-*) so theme/mode switches propagate"
            )
    return findings


def _attr_map(attrs: str) -> dict[str, str]:
    return {
        match.group("name").lower(): match.group("value")
        for match in ATTR_VALUE.finditer(attrs)
    }


def _style_decl_value(style: str, property_name: str) -> str | None:
    pattern = re.compile(
        rf"(?:^|;)\s*{re.escape(property_name)}\s*:\s*([^;]+)",
        re.IGNORECASE,
    )
    match = pattern.search(style)
    if not match:
        return None
    return match.group(1).strip()


def _is_effectively_none(value: str) -> bool:
    normalized = value.strip().lower()
    return normalized in {"", "none", "0", "0px", "0em", "0rem", "normal", "initial", "inherit", "unset"}


def _selector_can_target_svg_text(selector: str) -> bool:
    selector_lower = selector.lower()
    parts = [part.strip() for part in selector_lower.split(",")]
    for part in parts:
        if not part:
            continue
        if ".svg-label" in part:
            return True
        if "diagram-frame" in part and re.search(r"(?:^|[\s>+~])text(?:$|[\.#:\[\s>+~])", part):
            return True
        if re.search(r"(?:^|[\s>+~])svg(?:$|[\.#:\[\s>+~])", part) and (
            re.search(r"(?:^|[\s>+~])text(?:$|[\.#:\[\s>+~])", part)
            or "*" in part
        ):
            return True
        if re.fullmatch(r"text(?:[\.#:\[].*)?", part):
            return True
    return False


def _css_svg_text_warning(html: str) -> list[str]:
    findings: list[str] = []
    for style_idx, style_block in enumerate(STYLE_BLOCK.findall(html), start=1):
        for rule in CSS_RULE.finditer(style_block):
            selector = " ".join(rule.group("selector").split())
            if not _selector_can_target_svg_text(selector):
                continue
            body = rule.group("body")
            warning_properties: list[str] = []
            text_shadow = _style_decl_value(body, "text-shadow")
            if text_shadow and not _is_effectively_none(text_shadow):
                warning_properties.append("text-shadow")
            paint_order = _style_decl_value(body, "paint-order")
            if paint_order and "stroke" in paint_order.lower():
                warning_properties.append("paint-order: stroke")
            filter_value = _style_decl_value(body, "filter")
            if filter_value and not _is_effectively_none(filter_value):
                warning_properties.append("filter")
            if "drop-shadow(" in body.lower():
                warning_properties.append("drop-shadow")
            if warning_properties:
                findings.append(
                    f"<style> block #{style_idx} has SVG text selector '{selector}' "
                    f"using {', '.join(dict.fromkeys(warning_properties))}; "
                    "keep SVG labels fill-only and move emphasis to shapes or nearby HTML"
                )
    return findings


def _text_content(markup: str) -> str:
    return " ".join(unescape(TAG_BLOCK.sub(" ", markup)).split())


def _svg_text_legibility_warning(html: str) -> list[str]:
    findings: list[str] = []
    for svg_idx, block in enumerate(SVG_BLOCK.findall(html), start=1):
        for text_idx, match in enumerate(SVG_TEXT_BLOCK.finditer(block), start=1):
            attrs = _attr_map(match.group("attrs"))
            style = attrs.get("style", "")
            risky: list[str] = []

            stroke = attrs.get("stroke")
            if stroke and not _is_effectively_none(stroke):
                risky.append("stroke")
            stroke_width = attrs.get("stroke-width") or _style_decl_value(style, "stroke-width")
            if stroke_width and not _is_effectively_none(stroke_width):
                risky.append("stroke-width")
            style_stroke = _style_decl_value(style, "stroke")
            if style_stroke and not _is_effectively_none(style_stroke):
                risky.append("style stroke")
            paint_order = attrs.get("paint-order") or _style_decl_value(style, "paint-order")
            if paint_order and "stroke" in paint_order.lower():
                risky.append("paint-order: stroke")
            text_shadow = _style_decl_value(style, "text-shadow")
            if text_shadow and not _is_effectively_none(text_shadow):
                risky.append("text-shadow")
            filter_attr = attrs.get("filter") or _style_decl_value(style, "filter")
            if filter_attr and not _is_effectively_none(filter_attr):
                risky.append("filter")
            if "drop-shadow(" in style.lower():
                risky.append("drop-shadow")

            if risky:
                findings.append(
                    f"<svg> block #{svg_idx} <text> #{text_idx} uses "
                    f"{', '.join(dict.fromkeys(risky))}; avoid stroke/shadow/filter on SVG text"
                )

            label = _text_content(match.group("body"))
            longest_word = max((len(word) for word in re.split(r"\s+", label) if word), default=0)
            if (
                label
                and "<tspan" not in match.group("body").lower()
                and (
                    len(label) > SVG_LABEL_MAX_CHARS
                    or longest_word > SVG_LABEL_MAX_WORD_CHARS
                )
            ):
                findings.append(
                    f"<svg> block #{svg_idx} <text> #{text_idx} is a long unwrapped label "
                    f"({len(label)} chars); keep SVG labels short, split with <tspan>, "
                    "or move long code/path text to nearby HTML"
                )
    return findings


def _h1_count_error(html: str) -> str | None:
    count = len(H1_TAG.findall(html))
    if count > 1:
        return f"multiple <h1> elements found ({count}); use exactly one document-level <h1>"
    return None


def _raw_mermaid_warning(html: str) -> list[str]:
    if MERMAID_BLOCK.search(html):
        return [
            "raw Mermaid-like diagram syntax found; convert final diagrams to inline SVG or structured HTML with a text equivalent"
        ]
    return []


def _diagram_frame_warning(html: str) -> list[str]:
    findings: list[str] = []
    for idx, block in enumerate(FIGURE_DIAGRAM_BLOCK.findall(html), start=1):
        if not HAS_FIGCAPTION.search(block):
            findings.append(
                f"figure.diagram-frame block #{idx} has no <figcaption>; add a caption explaining what the diagram proves"
            )
    return findings


def _svg_accessibility_warning(html: str) -> list[str]:
    findings: list[str] = []
    for idx, block in enumerate(SVG_BLOCK.findall(html), start=1):
        opening = SVG_OPEN.search(block)
        attrs = opening.group("attrs") if opening else ""
        role_img = re.search(r"\brole\s*=\s*(['\"])img\1", attrs, re.IGNORECASE)
        aria_hidden = re.search(r"\baria-hidden\s*=\s*(['\"])true\1", attrs, re.IGNORECASE)
        informative = bool(role_img or ACCESSIBLE_NAME_ATTR.search(attrs)) and not aria_hidden
        if not informative:
            continue
        missing: list[str] = []
        if not TITLE_TAG.search(block):
            missing.append("<title>")
        if not DESC_TAG.search(block):
            missing.append("<desc>")
        if not ACCESSIBLE_NAME_ATTR.search(attrs):
            missing.append("accessible name")
        if missing:
            findings.append(
                f"informative <svg> block #{idx} is missing {', '.join(missing)}; add title/desc and aria-label or aria-labelledby"
            )
    return findings


def _caption_warning(html: str) -> list[str]:
    findings: list[str] = []
    for idx, block in enumerate(TABLE_BLOCK.findall(html), start=1):
        if not HAS_CAPTION.search(block):
            findings.append(
                f"<table> block #{idx} has no <caption>; add one summarising what the table proves"
            )
    return findings


def validate(path: Path, allow_external: bool = False) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if path.suffix.lower() not in {".html", ".htm"}:
        errors.append("file extension must be .html or .htm")

    html, read_error = read_html(path)
    if read_error:
        errors.append(read_error)
        return {"ok": False, "errors": errors, "warnings": warnings}
    assert html is not None

    for pattern, message in STRUCTURE_CHECKS:
        if not pattern.search(html):
            errors.append(message)

    h1_error = _h1_count_error(html)
    if h1_error:
        errors.append(h1_error)

    if not allow_external:
        scrubbed = XMLNS_ATTR.sub("", html)
        for pattern, message in OFFLINE_CHECKS:
            if pattern.search(scrubbed):
                errors.append(message)

    for pattern, message in WARNING_CHECKS:
        if not pattern.search(html):
            warnings.append(message)

    hex_msg = _hex_count_warning(html)
    if hex_msg:
        warnings.append(hex_msg)
    warnings.extend(_raw_mermaid_warning(html))
    warnings.extend(_diagram_frame_warning(html))
    warnings.extend(_svg_accessibility_warning(html))
    warnings.extend(_svg_token_warning(html))
    warnings.extend(_css_svg_text_warning(html))
    warnings.extend(_svg_text_legibility_warning(html))
    warnings.extend(_caption_warning(html))

    try:
        size = path.stat().st_size
    except OSError:
        size = len(html.encode("utf-8", errors="replace"))
    if size > MAX_WARN_BYTES:
        warnings.append(f"file is large ({size} bytes > {MAX_WARN_BYTES} bytes)")

    return {"ok": not errors, "errors": errors, "warnings": warnings}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate a self-contained HTML artifact."
    )
    parser.add_argument("path", type=Path, help="HTML artifact path")
    parser.add_argument("--json", action="store_true", help="emit JSON result")
    parser.add_argument(
        "--allow-external",
        action="store_true",
        help="allow external URLs/network APIs while keeping structure checks",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    result = validate(args.path, allow_external=args.allow_external)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "ok" if result["ok"] else "failed"
        print(f"HTML artifact validation: {status}")
        errors = result["errors"]
        warnings = result["warnings"]
        if errors:
            print("\nErrors:")
            for error in errors:
                print(f"- {error}")
        if warnings:
            print("\nWarnings:")
            for warning in warnings:
                print(f"- {warning}")
        if not errors and not warnings:
            print("No errors or warnings.")

    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
