#!/usr/bin/env python3
"""Deterministic environment, static audit, and compile gate for Touying 0.8.0."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

MIN_TYPST_VERSION = (0, 15, 0)
MIN_TOUYING_VERSION = (0, 8, 0)
DEFAULT_MAX_CONSECUTIVE_BULLETS = 2
TOUYING_PACKAGE_VERSION = "0.8.0"

EXIT_OK = 0
EXIT_CHECK_FAILED = 1
EXIT_ENVIRONMENT_OR_ARG_ERROR = 2

DIVERSITY_RE = re.compile(
    r"(?:"
    r"(?<![A-Za-z0-9_-])(?:grid|table|cols|side-by-side|figure|image|rect|box|"
    r"animate|animate-hidden|animate-removed|cetz|fletcher|title-slide|focus-slide)"
    r"(?![A-Za-z0-9_-])"
    r"|\braw\s*\("
    r"|```"
    r"|\btouying-"
    r"|\$"
    r")"
)
BULLET_LINE_RE = re.compile(r"^\s*(?:[-+]|\d+\.|/\s+[^:\n]+:)\s+\S")
VERSION_RE = re.compile(r"(\d+)\.(\d+)\.(\d+)")
TOUYING_IMPORT_RE = re.compile(r"@preview/touying:(\d+)\.(\d+)(?:\.(\d+))?")


@dataclass
class Finding:
    severity: str
    rule: str
    file: str
    line: int
    message: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "severity": self.severity,
            "rule": self.rule,
            "file": self.file,
            "line": self.line,
            "message": self.message,
        }


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


def parse_semver(text: str) -> tuple[int, int, int] | None:
    match = VERSION_RE.search(text)
    if not match:
        return None
    return (int(match.group(1)), int(match.group(2)), int(match.group(3)))


def format_semver(ver: tuple[int, int, int] | None) -> str | None:
    if ver is None:
        return None
    return f"{ver[0]}.{ver[1]}.{ver[2]}"


def typst_cache_base() -> Path:
    override = os.environ.get("TYPST_PACKAGE_CACHE_PATH")
    if override:
        return Path(override)
    if sys.platform.startswith("win"):
        local_app = os.environ.get("LOCALAPPDATA")
        base = Path(local_app) if local_app else (Path.home() / "AppData" / "Local")
        return base / "typst" / "packages"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Caches" / "typst" / "packages"
    xdg_cache = os.environ.get("XDG_CACHE_HOME")
    base = Path(xdg_cache) if xdg_cache else (Path.home() / ".cache")
    return base / "typst" / "packages"


def probe_typst(typst_bin: str) -> dict[str, Any]:
    resolved = shutil.which(typst_bin) if os.sep not in typst_bin and "/" not in typst_bin else typst_bin
    cmd_target = resolved or typst_bin
    typst_found = False
    version_tuple: tuple[int, int, int] | None = None
    raw_version = ""
    supports_warnings_flag = False

    try:
        proc = subprocess.run(
            [cmd_target, "--version"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if proc.returncode == 0:
            typst_found = True
            raw_version = (proc.stdout or proc.stderr).strip()
            version_tuple = parse_semver(raw_version)
            help_proc = subprocess.run(
                [cmd_target, "compile", "--help"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )
            supports_warnings_flag = "--warnings" in (help_proc.stdout or "")
    except OSError:
        typst_found = False

    meets_min = bool(typst_found and version_tuple is not None and version_tuple >= MIN_TYPST_VERSION)
    cache_root = typst_cache_base()
    touying_cache = cache_root / "preview" / "touying" / TOUYING_PACKAGE_VERSION

    remediation: list[str] = []
    if not typst_found:
        remediation.append("Install Typst >= 0.15.0 (e.g. `winget install Typst.Typst`, `brew install typst`, or `cargo install --locked typst-cli`) and verify `typst --version`.")
    elif not meets_min:
        remediation.append(f"Upgrade Typst from {format_semver(version_tuple) or raw_version} to >= 0.15.0 (e.g. `typst update` or reinstall via package manager).")
    if not touying_cache.is_dir():
        remediation.append("Prime the `@preview/touying:0.8.0` package cache by compiling a deck importing `#import \"@preview/touying:0.8.0\": *` once with network access.")

    return {
        "typst_found": typst_found,
        "typst_bin": cmd_target,
        "typst_version": format_semver(version_tuple),
        "raw_version": raw_version or None,
        "min_version": format_semver(MIN_TYPST_VERSION),
        "meets_min_version": meets_min,
        "supports_warnings_flag": supports_warnings_flag,
        "package_cache": {
            "package": f"@preview/touying:{TOUYING_PACKAGE_VERSION}",
            "found": touying_cache.is_dir(),
            "path": str(touying_cache),
        },
        "remediation": remediation,
    }


def scan_typst_source(text: str) -> tuple[str, str]:
    """Return (comment_stripped_text, comment_and_literal_masked_text) preserving newlines."""
    n = len(text)
    stripped: list[str] = []
    masked: list[str] = []
    i = 0
    block_comment_depth = 0
    in_string = False
    raw_ticks = 0

    while i < n:
        ch = text[i]

        if block_comment_depth > 0:
            if ch == "/" and i + 1 < n and text[i + 1] == "*":
                block_comment_depth += 1
                stripped.extend((" ", " "))
                masked.extend((" ", " "))
                i += 2
                continue
            if ch == "*" and i + 1 < n and text[i + 1] == "/":
                block_comment_depth -= 1
                stripped.extend((" ", " "))
                masked.extend((" ", " "))
                i += 2
                continue
            out = "\n" if ch == "\n" else " "
            stripped.append(out)
            masked.append(out)
            i += 1
            continue

        if raw_ticks > 0:
            if ch == "`":
                j = i
                while j < n and text[j] == "`":
                    j += 1
                run_len = j - i
                if run_len >= raw_ticks and (raw_ticks == 1 or run_len >= raw_ticks):
                    stripped.append(text[i:j])
                    masked.append(text[i:j])
                    raw_ticks = 0
                    i = j
                    continue
                stripped.append(text[i:j])
                masked.extend(" " * run_len)
                i = j
                continue
            stripped.append(ch)
            masked.append("\n" if ch == "\n" else " ")
            i += 1
            continue

        if in_string:
            if ch == "\\" and i + 1 < n:
                nxt = text[i + 1]
                stripped.append(ch + nxt)
                masked.append(" " + ("\n" if nxt == "\n" else " "))
                i += 2
                continue
            if ch == '"':
                in_string = False
                stripped.append('"')
                masked.append('"')
                i += 1
                continue
            stripped.append(ch)
            masked.append("\n" if ch == "\n" else " ")
            i += 1
            continue

        # Outside comments, strings, and raw blocks
        if ch == "/" and i + 1 < n and text[i + 1] == "/":
            while i < n and text[i] != "\n":
                stripped.append(" ")
                masked.append(" ")
                i += 1
            continue

        if ch == "/" and i + 1 < n and text[i + 1] == "*":
            block_comment_depth = 1
            stripped.extend((" ", " "))
            masked.extend((" ", " "))
            i += 2
            continue

        if ch == '"':
            in_string = True
            stripped.append('"')
            masked.append('"')
            i += 1
            continue

        if ch == "`":
            j = i
            while j < n and text[j] == "`":
                j += 1
            run_len = j - i
            stripped.append(text[i:j])
            masked.append(text[i:j])
            if run_len != 2:
                raw_ticks = run_len
            i = j
            continue

        stripped.append(ch)
        masked.append(ch)
        i += 1

    return "".join(stripped), "".join(masked)


def line_number_at(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def find_matching_delimiter(text: str, open_idx: int, open_ch: str, close_ch: str) -> int:
    depth = 1
    i = open_idx + 1
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return n


def iter_call_spans(text: str, open_pattern: re.Pattern[str]) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []
    for match in open_pattern.finditer(text):
        open_idx = match.end() - 1
        close_idx = find_matching_delimiter(text, open_idx, "(", ")")
        spans.append((match.start(), line_number_at(text, match.start()), text[open_idx + 1 : close_idx]))
    return spans


def split_top_level_args(args_text: str) -> list[str]:
    args: list[str] = []
    current: list[str] = []
    paren_d = 0
    bracket_d = 0
    brace_d = 0
    for ch in args_text:
        if ch == "(":
            paren_d += 1
        elif ch == ")" and paren_d > 0:
            paren_d -= 1
        elif ch == "[":
            bracket_d += 1
        elif ch == "]" and bracket_d > 0:
            bracket_d -= 1
        elif ch == "{":
            brace_d += 1
        elif ch == "}" and brace_d > 0:
            brace_d -= 1
        elif ch == "," and paren_d == 0 and bracket_d == 0 and brace_d == 0:
            args.append("".join(current))
            current = []
            continue
        current.append(ch)
    tail = "".join(current)
    if tail.strip():
        args.append(tail)
    return args


def strip_speaker_note_blocks(text: str) -> str:
    """Remove #speaker-note(...) and #speaker-note[...] blocks while keeping newlines."""
    out = list(text)
    pattern = re.compile(r"#?speaker-note\b")
    for match in pattern.finditer(text):
        i = match.end()
        n = len(text)
        while i < n and text[i] in " \t\r\n":
            i += 1
        if i < n and text[i] == "(":
            end_paren = find_matching_delimiter(text, i, "(", ")")
            i = end_paren + 1
            while i < n and text[i] in " \t":
                i += 1
        if i < n and text[i] == "[":
            end_br = find_matching_delimiter(text, i, "[", "]")
            i = end_br + 1
        for k in range(match.start(), min(i, n)):
            if out[k] != "\n":
                out[k] = " "
    return "".join(out)


def audit_file(
    path: Path,
    max_consecutive_bullets: int = DEFAULT_MAX_CONSECUTIVE_BULLETS,
) -> list[Finding]:
    raw_text = path.read_text(encoding="utf-8")
    stripped, masked = scan_typst_source(raw_text)
    file_str = str(path)
    findings: list[Finding] = []

    # 1. OUTDATED_TOUYING_IMPORT
    for m in TOUYING_IMPORT_RE.finditer(stripped):
        ver = (int(m.group(1)), int(m.group(2)), int(m.group(3) or 0))
        if ver < MIN_TOUYING_VERSION:
            findings.append(
                Finding(
                    severity="error",
                    rule="OUTDATED_TOUYING_IMPORT",
                    file=file_str,
                    line=line_number_at(stripped, m.start()),
                    message=f"Outdated Touying import '{m.group(0)}'; require '@preview/touying:0.8.0' or newer.",
                )
            )

    # 2. DEPRECATED_SEMI_TRANSPARENT_COVER
    semi_re = re.compile(r"(?<![A-Za-z0-9_-])semi-transparent-cover(?![A-Za-z0-9_-])")
    for m in semi_re.finditer(masked):
        prefix = masked[max(0, m.start() - 100) : m.start()]
        if re.search(r"fallback-hide\s*:\s*(?:utils\.)?$", prefix):
            continue
        findings.append(
            Finding(
                severity="error",
                rule="DEPRECATED_SEMI_TRANSPARENT_COVER",
                file=file_str,
                line=line_number_at(masked, m.start()),
                message="Deprecated `semi-transparent-cover` (use `utils.alpha-changing-cover` or `utils.color-changing-cover`; only `fallback-hide:` is permitted).",
            )
        )

    # 3. DEPRECATED_TOUYING_EQUATION
    eq_re = re.compile(r"(?<![A-Za-z0-9_-])touying-equation(?![A-Za-z0-9_-])")
    for m in eq_re.finditer(masked):
        findings.append(
            Finding(
                severity="error",
                rule="DEPRECATED_TOUYING_EQUATION",
                file=file_str,
                line=line_number_at(masked, m.start()),
                message="Deprecated `touying-equation`; write native math animations directly (e.g. `$ frac(a #pause + b, c) $`).",
            )
        )

    # 4. REMOVED_MAGIC_BIBLIOGRAPHY
    bib_re = re.compile(r"(?<![A-Za-z0-9_-])magic\.bibliography\s*\(")
    for m in bib_re.finditer(masked):
        findings.append(
            Finding(
                severity="error",
                rule="REMOVED_MAGIC_BIBLIOGRAPHY",
                file=file_str,
                line=line_number_at(masked, m.start()),
                message="Removed `magic.bibliography()`; use `config-common(show-bibliography-as-footnote: true)` with a real `#bibliography(...)`.",
            )
        )

    # 5. REMOVED_UTILS_HANDOUT_ONLY
    handout_re = re.compile(r"(?<![A-Za-z0-9_-])utils\.handout-only(?![A-Za-z0-9_-])")
    for m in handout_re.finditer(masked):
        findings.append(
            Finding(
                severity="error",
                rule="REMOVED_UTILS_HANDOUT_ONLY",
                file=file_str,
                line=line_number_at(masked, m.start()),
                message="Removed `utils.handout-only`; use top-level `#handout-only[...]`.",
            )
        )

    # 6. REMOVED_SHOW_ONLY_NOTES_RENDERER
    for _, call_line, args_text in iter_call_spans(masked, re.compile(r"(?<![A-Za-z0-9_-])config-methods\s*\(")):
        for arg in split_top_level_args(args_text):
            if re.match(r"^\s*show-only-notes\s*:", arg):
                findings.append(
                    Finding(
                        severity="error",
                        rule="REMOVED_SHOW_ONLY_NOTES_RENDERER",
                        file=file_str,
                        line=call_line,
                        message="Removed `config-methods(show-only-notes: ...)`; customize panels via `config-common(notes-fn: ...)` built on `touying-notes`.",
                    )
                )

    # 7. OLD_TOUYING_RECALL_SUBSLIDE_ARG
    for _, call_line, args_text in iter_call_spans(masked, re.compile(r"(?<![A-Za-z0-9_-])touying-recall\s*\(")):
        for arg in split_top_level_args(args_text):
            if re.match(r"^\s*subslide\s*:", arg):
                findings.append(
                    Finding(
                        severity="error",
                        rule="OLD_TOUYING_RECALL_SUBSLIDE_ARG",
                        file=file_str,
                        line=call_line,
                        message="Outdated singular `subslide:` argument in `touying-recall`; use plural `subslides:` (`auto` = all/final, `none` = last only).",
                    )
                )

    # 8. RAW_SET_PAGE
    set_page_re = re.compile(r"(?:^[ \t]*|[;{][ \t]*)#?set\s+page(?![A-Za-z0-9_-])", re.MULTILINE)
    for m in set_page_re.finditer(masked):
        findings.append(
            Finding(
                severity="error",
                rule="RAW_SET_PAGE",
                file=file_str,
                line=line_number_at(masked, m.start()),
                message="Raw `#set page(...)` is overridden by Touying per subslide; use `config-page(...)` instead.",
            )
        )

    # 9. PAUSE_INSIDE_CONTEXT
    ctx_re = re.compile(r"(?<![A-Za-z0-9_-])context\s*(\{|\[)")
    pause_re = re.compile(r"(?<![A-Za-z0-9_-])#?pause(?![A-Za-z0-9_-])")
    seen_pause_offsets: set[int] = set()
    for m in ctx_re.finditer(masked):
        open_ch = m.group(1)
        close_ch = "}" if open_ch == "{" else "]"
        open_idx = m.end() - 1
        close_idx = find_matching_delimiter(masked, open_idx, open_ch, close_ch)
        inner = masked[open_idx + 1 : close_idx]
        for pm in pause_re.finditer(inner):
            abs_pos = open_idx + 1 + pm.start()
            if abs_pos in seen_pause_offsets:
                continue
            seen_pause_offsets.add(abs_pos)
            findings.append(
                Finding(
                    severity="error",
                    rule="PAUSE_INSIDE_CONTEXT",
                    file=file_str,
                    line=line_number_at(masked, abs_pos),
                    message="`#pause` placed inside `context` block panics (`Unsupported mark`); move marks to slide flow or use `utils.methods(self)` with explicit `repeat:`.",
                )
            )

    # 10. SLIDE_WRAPPED_BODY_ANTIPATTERN
    for _, call_line, args_text in iter_call_spans(masked, re.compile(r"(?<![A-Za-z0-9_-])touying-slide\s*\(")):
        top_args = split_top_level_args(args_text)
        has_setting = any(re.match(r"^\s*setting\s*:", a) for a in top_args)
        for arg in top_args:
            trimmed = arg.strip()
            if not trimmed or re.match(r"^[A-Za-z_][A-Za-z0-9_-]*\s*:", trimmed):
                continue
            if (
                re.search(r"(?:^|[\s{])#?(?:std\.)?(?:align|block|box)\s*(?:\(|\[)", trimmed)
                and re.search(r"(?<![A-Za-z0-9_-])bod(?:y|ies)(?![A-Za-z0-9_-])", trimmed)
                and not has_setting
            ):
                findings.append(
                    Finding(
                        severity="error",
                        rule="SLIDE_WRAPPED_BODY_ANTIPATTERN",
                        file=file_str,
                        line=call_line,
                        message="Avoid wrapping `body` in `align`/`block`/`box` directly inside `touying-slide(...)`; pass a `setting: body => ...` callback instead.",
                    )
                )

    # Advisory warnings: CONSECUTIVE_BULLET_SLIDES and MISSING_SPEAKER_NOTES
    findings.extend(audit_advisory_warnings(file_str, stripped, masked, max_consecutive_bullets))
    return findings


def audit_advisory_warnings(
    file_str: str,
    stripped: str,
    masked: str,
    max_consecutive_bullets: int,
) -> list[Finding]:
    findings: list[Finding] = []
    slide_level_m = re.search(r"slide-level\s*:\s*(\d+)", masked)
    slide_level = int(slide_level_m.group(1)) if slide_level_m else 2
    slide_level = max(1, min(slide_level, 6))
    allow_hr = re.search(r"horizontal-line-to-pagebreak\s*:\s*false", masked) is None

    heading_re = re.compile(rf"^\s*={{1,{slide_level}}}\s+\S")
    hr_re = re.compile(r"^\s*---\s*$")
    explicit_slide_re = re.compile(
        r"^\s*#(?:slide|empty-slide|focus-slide|title-slide|centered-slide)\b"
    )

    clean_stripped = strip_speaker_note_blocks(stripped)
    lines = clean_stripped.splitlines()

    slides: list[tuple[int, str, list[str]]] = []
    current_start: int | None = None
    current_kind = ""
    current_lines: list[str] = []
    in_fenced_raw = False

    for lineno, line in enumerate(lines, start=1):
        fence_stripped = line.strip()
        if fence_stripped.startswith("```"):
            if current_start is not None:
                current_lines.append(line)
            if not in_fenced_raw:
                in_fenced_raw = True
            else:
                in_fenced_raw = False
            continue

        if not in_fenced_raw and (
            heading_re.match(line)
            or (allow_hr and hr_re.match(line))
            or explicit_slide_re.match(line)
        ):
            if current_start is not None:
                slides.append((current_start, current_kind, current_lines))
            current_start = lineno
            current_kind = "explicit" if explicit_slide_re.match(line) else "heading"
            current_lines = [line]
            continue

        if current_start is not None:
            current_lines.append(line)

    if current_start is not None:
        slides.append((current_start, current_kind, current_lines))

    # Count meaningful slides for MISSING_SPEAKER_NOTES
    meaningful_slides = 0
    for _, kind, slines in slides:
        body_text = "\n".join(slines[1:]) if kind == "heading" else "\n".join(slines)
        if kind == "explicit" or body_text.strip():
            meaningful_slides += 1

    if meaningful_slides > 2 and not re.search(
        r"(?<![A-Za-z0-9_-])speaker-note(?![A-Za-z0-9_-])",
        masked,
    ):
        findings.append(
            Finding(
                severity="warning",
                rule="MISSING_SPEAKER_NOTES",
                file=file_str,
                line=1,
                message=f"Presentation has {meaningful_slides} slides with zero `#speaker-note` annotations.",
            )
        )

    # Check consecutive bullet-only slides
    streak = 0
    streak_start_line = 0
    reported_streak = False

    def flush_streak() -> None:
        nonlocal streak, streak_start_line, reported_streak
        if streak > max_consecutive_bullets and not reported_streak:
            findings.append(
                Finding(
                    severity="warning",
                    rule="CONSECUTIVE_BULLET_SLIDES",
                    file=file_str,
                    line=streak_start_line,
                    message=f"{streak} consecutive bullet-only slides without visual/layout diversity (max {max_consecutive_bullets}).",
                )
            )
        streak = 0
        streak_start_line = 0
        reported_streak = False

    for start_line, kind, slines in slides:
        opener = slines[0] if slines else ""
        if re.match(r"^\s*#(?:title-slide|focus-slide)\b", opener):
            flush_streak()
            continue

        body_lines = slines[1:] if kind == "heading" else slines
        nonempty = [ln for ln in body_lines if ln.strip()]
        if not nonempty:
            # Empty section divider headings do not form bullet streaks and break monotony runs if level 1.
            if re.match(r"^\s*=\s+\S", opener):
                flush_streak()
            continue

        body_blob = "\n".join(body_lines)
        if DIVERSITY_RE.search(body_blob):
            flush_streak()
            continue

        has_bullet = any(BULLET_LINE_RE.match(ln) for ln in nonempty)
        if not has_bullet:
            flush_streak()
            continue

        all_bullets_or_flow = True
        for ln in nonempty:
            s = ln.strip()
            if BULLET_LINE_RE.match(ln):
                continue
            if s in ("[", "]", ")", "}", "(", "{"):
                continue
            if re.match(r"^#(?:pause|meanwhile|waypoint\b|item-by-item(?:-fn)?\b)", s):
                continue
            if ln.startswith(("  ", "\t")):
                continue
            all_bullets_or_flow = False
            break

        if all_bullets_or_flow:
            if streak == 0:
                streak_start_line = start_line
            streak += 1
        else:
            flush_streak()

    flush_streak()
    return findings


def collect_typ_files(targets: list[str]) -> tuple[list[Path], list[Finding]]:
    collected: list[Path] = []
    seen: set[Path] = set()
    missing_findings: list[Finding] = []

    for raw in targets:
        target = Path(raw)
        if not target.exists():
            missing_findings.append(
                Finding(
                    severity="error",
                    rule="PATH_NOT_FOUND",
                    file=str(target),
                    line=1,
                    message=f"Target path does not exist: {target}",
                )
            )
            continue
        if target.is_file():
            if target.suffix.lower() == ".typ":
                resolved = target.resolve()
                if resolved not in seen:
                    seen.add(resolved)
                    collected.append(target)
        elif target.is_dir():
            for item in sorted(target.rglob("*.typ")):
                if item.is_file():
                    resolved = item.resolve()
                    if resolved not in seen:
                        seen.add(resolved)
                        collected.append(item)

    return collected, missing_findings


def extract_warnings_from_stderr(stderr_text: str, allow_bundle_experimental: bool = False) -> list[str]:
    warnings: list[str] = []
    for line in stderr_text.splitlines():
        if re.match(r"^(?:.*:\d+:\d+:\s*)?warning:", line.strip()):
            if allow_bundle_experimental and "bundle export is experimental" in line:
                continue
            warnings.append(line.strip())
    return warnings


def cmd_doctor(args: argparse.Namespace) -> int:
    info = probe_typst(args.typst_bin)
    payload = {
        "command": "doctor",
        "ok": info["meets_min_version"],
        **info,
    }
    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        status = "OK" if payload["ok"] else "WARN/FAIL"
        print(f"[{status}] typst={payload['typst_version'] or 'missing'} (min {payload['min_version']})")
        print(f"  package_cache ({payload['package_cache']['package']}): {'found' if payload['package_cache']['found'] else 'missing'} -> {payload['package_cache']['path']}")
        for step in payload["remediation"]:
            print(f"  remediation: {step}")
    return EXIT_OK if payload["ok"] else EXIT_CHECK_FAILED


def cmd_audit(args: argparse.Namespace) -> int:
    files, findings = collect_typ_files(args.paths)
    if not files and not findings:
        findings.append(
            Finding(
                severity="error",
                rule="ZERO_FILES_SCANNED",
                file=str(args.paths[0]) if args.paths else ".",
                line=1,
                message="Zero .typ files found across target paths.",
            )
        )
    elif not files:
        findings.append(
            Finding(
                severity="error",
                rule="ZERO_FILES_SCANNED",
                file=str(args.paths[0]) if args.paths else ".",
                line=1,
                message="Zero .typ files found across target paths.",
            )
        )

    for typ_file in files:
        findings.extend(audit_file(typ_file, max_consecutive_bullets=args.max_consecutive_bullets))

    errors = sum(1 for f in findings if f.severity == "error")
    warnings = sum(1 for f in findings if f.severity == "warning")
    ok = errors == 0 and (warnings == 0 or not args.strict_warnings)

    payload = {
        "command": "audit",
        "ok": ok,
        "files_scanned": len(files),
        "files": [str(p) for p in files],
        "errors": errors,
        "warnings": warnings,
        "strict_warnings": bool(args.strict_warnings),
        "findings": [f.to_dict() for f in findings],
    }

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        for f in findings:
            print(f"{f.severity.upper()} [{f.rule}] {f.file}:{f.line} - {f.message}")
        print(f"Scanned {len(files)} file(s): {errors} error(s), {warnings} warning(s).")

    return EXIT_OK if ok else EXIT_CHECK_FAILED


def cmd_compile(args: argparse.Namespace) -> int:
    target = Path(args.target)
    if not target.is_file() or target.suffix.lower() != ".typ":
        payload = {
            "command": "compile",
            "target": str(target),
            "status": "fail",
            "missing_evidence": False,
            "reason": "Provide an existing .typ file path.",
            "runs": [],
        }
        if args.json:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        else:
            print(f"Error: {payload['reason']}", file=sys.stderr)
        return EXIT_ENVIRONMENT_OR_ARG_ERROR

    env_info = probe_typst(args.typst_bin)
    if not env_info["meets_min_version"]:
        reason = (
            f"Typst CLI '{args.typst_bin}' not found."
            if not env_info["typst_found"]
            else f"Typst {env_info['typst_version']} is older than required {env_info['min_version']}."
        )
        payload = {
            "command": "compile",
            "target": str(target),
            "status": "skipped",
            "missing_evidence": True,
            "reason": reason,
            "typst_found": env_info["typst_found"],
            "typst_version": env_info["typst_version"],
            "meets_min_version": env_info["meets_min_version"],
            "remediation": env_info["remediation"],
            "runs": [],
        }
        if args.json:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        else:
            print(f"SKIPPED (missing evidence): {reason}")
        return EXIT_ENVIRONMENT_OR_ARG_ERROR if args.require_typst else EXIT_OK

    root_dir = Path(args.root).resolve() if args.root else target.resolve().parent
    typst_cmd = env_info["typst_bin"]
    supports_warnings_flag = env_info["supports_warnings_flag"]

    modes: list[str | None]
    if args.modes:
        modes = [m.strip() for m in args.modes.split(",") if m.strip()]
    else:
        modes = [None]

    runs: list[dict[str, Any]] = []
    all_passed = True

    with tempfile.TemporaryDirectory(prefix="touying-check-") as tmp_dir_str:
        tmp_dir = Path(tmp_dir_str)
        for idx, mode in enumerate(modes):
            cmd = [typst_cmd, "compile"]
            if supports_warnings_flag:
                cmd.extend(["--warnings", "promote"])
            cmd.extend(["--root", str(root_dir)])

            if args.bundle:
                out_path = tmp_dir / f"bundle-{idx}"
                cmd.extend(["--features", "bundle", "--format", "bundle"])
            else:
                suffix = f"-{mode}" if mode else ""
                out_path = tmp_dir / f"{target.stem}{suffix}.pdf"

            if mode is not None:
                cmd.extend(["--input", f"export-mode={mode}"])

            cmd.extend([str(target.resolve()), str(out_path)])

            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )
            promoted_warnings = extract_warnings_from_stderr(
                proc.stderr or "",
                allow_bundle_experimental=bool(args.bundle),
            )
            run_ok = proc.returncode == 0 and not promoted_warnings
            bundle_files: list[str] = []
            pdfpc_valid = False
            artifact_error: str | None = None

            if run_ok and args.bundle:
                pdfs = sorted(out_path.rglob("*.pdf"))
                pdfpcs = sorted(out_path.rglob("*.pdfpc"))
                bundle_files = [str(p.relative_to(out_path)) for p in [*pdfs, *pdfpcs]]
                if not pdfs or not pdfpcs:
                    run_ok = False
                    artifact_error = "Bundle output missing .pdf or .pdfpc artifact."
                else:
                    try:
                        for pdfpc_path in pdfpcs:
                            data = json.loads(pdfpc_path.read_text(encoding="utf-8"))
                            if not isinstance(data, dict) or "pages" not in data:
                                raise ValueError(f"Invalid .pdfpc JSON schema in {pdfpc_path.name}")
                        pdfpc_valid = True
                    except (OSError, ValueError, json.JSONDecodeError) as exc:
                        run_ok = False
                        artifact_error = str(exc)
            elif run_ok:
                if not out_path.is_file() or out_path.stat().st_size == 0:
                    run_ok = False
                    artifact_error = "Compiled PDF output is missing or empty."

            if not run_ok:
                all_passed = False

            run_record: dict[str, Any] = {
                "mode": mode or ("bundle" if args.bundle else "default"),
                "ok": run_ok,
                "returncode": proc.returncode,
                "warnings_promoted": promoted_warnings,
                "stderr": (proc.stderr or "").strip(),
            }
            if args.bundle:
                run_record["bundle_files"] = bundle_files
                run_record["pdfpc_valid"] = pdfpc_valid
            if artifact_error:
                run_record["artifact_error"] = artifact_error
            runs.append(run_record)

    payload = {
        "command": "compile",
        "target": str(target),
        "status": "pass" if all_passed else "fail",
        "missing_evidence": False,
        "typst_found": True,
        "typst_version": env_info["typst_version"],
        "meets_min_version": True,
        "runs": runs,
    }

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        for run in runs:
            tag = "PASS" if run["ok"] else "FAIL"
            print(f"[{tag}] {target} ({run['mode']})")
            if not run["ok"]:
                if run.get("artifact_error"):
                    print(f"  artifact_error: {run['artifact_error']}")
                for w in run.get("warnings_promoted", []):
                    print(f"  promoted_warning: {w}")
                if run.get("stderr"):
                    print(run["stderr"])

    return EXIT_OK if all_passed else EXIT_CHECK_FAILED


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Deterministic environment, static audit, and compile gate for Touying 0.8.0.",
    )
    sub = parser.add_subparsers(dest="subcommand", required=True)

    p_doc = sub.add_parser("doctor", help="Check Typst CLI (>= 0.15.0) and Touying 0.8.0 package cache.")
    p_doc.add_argument("--typst-bin", default="typst", help="Typst executable name or path.")
    p_doc.add_argument("--json", action="store_true", help="Emit JSON output.")
    p_doc.set_defaults(func=cmd_doctor)

    p_aud = sub.add_parser("audit", help="Statically audit .typ files against Touying 0.8.0 contracts.")
    p_aud.add_argument("paths", nargs="+", help="One or more .typ files or directories.")
    p_aud.add_argument("--strict-warnings", action="store_true", help="Treat advisory warnings as failures.")
    p_aud.add_argument(
        "--max-consecutive-bullets",
        type=int,
        default=DEFAULT_MAX_CONSECUTIVE_BULLETS,
        help="Maximum allowed consecutive bullet-only slides before warning.",
    )
    p_aud.add_argument("--json", action="store_true", help="Emit JSON output.")
    p_aud.set_defaults(func=cmd_audit)

    p_cmp = sub.add_parser("compile", help="Compile target .typ into a temporary directory with strict warnings.")
    p_cmp.add_argument("target", help="Path to target .typ entrypoint.")
    p_cmp.add_argument("--typst-bin", default="typst", help="Typst executable name or path.")
    p_cmp.add_argument("--root", default=None, help="Typst project root (defaults to target parent dir).")
    p_cmp.add_argument("--modes", default=None, help="Comma-separated export-mode values (e.g. presentation,handout,article).")
    p_cmp.add_argument("--bundle", action="store_true", help="Compile with `--features bundle --format bundle` and verify `.pdf` + `.pdfpc`.")
    p_cmp.add_argument("--require-typst", action="store_true", help="Exit non-zero instead of skipping when Typst >= 0.15.0 is missing.")
    p_cmp.add_argument("--json", action="store_true", help="Emit JSON output.")
    p_cmp.set_defaults(func=cmd_compile)

    return parser


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
