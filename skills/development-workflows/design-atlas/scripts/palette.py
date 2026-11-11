#!/usr/bin/env python3
"""Colourway dial for catalog entries that ship palette data.

Palette data lives in assets/catalog/overlays/palettes.json, keyed by entry id.
This module is pure: colour math, WCAG contrast gates, preset choice, hue
derivation, and DESIGN.md rendering. It never reads or writes project files;
design_catalog.py passes in the project signals and does the I/O.

Contrast method: white paper at alpha 0.78 is mixed over a field colour per
sRGB channel with 8-bit rounding, then WCAG 2.x relative luminance is used.
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "assets" / "catalog"
PALETTES = CATALOG / "overlays" / "palettes.json"
WHITE = "#FFFFFF"
ROLES = ("field-start", "field-end", "input", "input-wash", "output", "output-wash")
TEXT_MIN = 4.5
PROJECT_WEIGHT = 0.5
MAX_SKIP_NOTES = 3

# Derivation template (OKLCH lightness, chroma), modelled on the mint preset.
FIELD_START = (0.96, 0.020)
FIELD_END = (0.94, 0.025)
FIELD_MAX_C = 0.03
WASH = (0.965, 0.020)
ACCENT = (0.52, 0.12)
ACCENT_MIN_L = 0.30
ACCENT_MIN_C = 0.04
STEP_L = 0.005
STEP_C = 0.02


def load_palettes(path: Path | None = None) -> dict:
    return json.loads((path or PALETTES).read_text(encoding="utf-8"))


def spec_for(entry_id: str, path: Path | None = None) -> dict | None:
    """Palette data for one entry, or None when the entry has no colourway dial."""
    return load_palettes(path).get(entry_id)


# --- colour math -------------------------------------------------------------


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    h = value.strip().lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h[:3])
    if not re.fullmatch(r"[0-9a-fA-F]{6}([0-9a-fA-F]{2})?", h):
        raise ValueError(f"not a hex colour: {value}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#" + "".join(f"{max(0, min(255, int(c))):02X}" for c in rgb)


def _to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _to_gamma(c: float) -> float:
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def srgb_to_oklch(r: float, g: float, b: float) -> tuple[float, float, float]:
    """sRGB channels 0-1 to OKLCH (L 0-1, C, H degrees)."""
    r, g, b = _to_linear(r), _to_linear(g), _to_linear(b)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (max(v, 0.0) ** (1 / 3) for v in (l, m, s))
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    return L, math.hypot(A, B), (math.degrees(math.atan2(B, A)) + 360) % 360


def hex_to_oklch(value: str) -> tuple[float, float, float]:
    return srgb_to_oklch(*(c / 255 for c in hex_to_rgb(value)))


def oklch_to_srgb(L: float, C: float, H: float) -> tuple[float, float, float]:
    """OKLCH to sRGB channels 0-1. May fall outside [0, 1] when out of gamut."""
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def gamma(c: float) -> float:
        return _to_gamma(c) if c >= 0 else -_to_gamma(-c)

    return gamma(r), gamma(g), gamma(bl)


def _in_gamut(rgb: tuple[float, float, float]) -> bool:
    return all(-1e-6 <= c <= 1 + 1e-6 for c in rgb)


def oklch_to_hex(L: float, C: float, H: float) -> str:
    """Convert to hex; outside sRGB, lower chroma until the colour fits."""
    rgb = oklch_to_srgb(L, C, H)
    if not _in_gamut(rgb):
        lo, hi = 0.0, C
        for _ in range(30):
            mid = (lo + hi) / 2
            if _in_gamut(oklch_to_srgb(L, mid, H)):
                lo = mid
            else:
                hi = mid
        rgb = oklch_to_srgb(L, lo, H)
    return rgb_to_hex(tuple(math.floor(max(0.0, min(1.0, c)) * 255 + 0.5) for c in rgb))


def luminance(value: str) -> float:
    r, g, b = (_to_linear(c / 255) for c in hex_to_rgb(value))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)


def over(fg: str, bg: str, alpha: float) -> str:
    """fg at alpha over bg, per sRGB channel, rounded to 8 bits."""
    top, base = hex_to_rgb(fg), hex_to_rgb(bg)
    return rgb_to_hex(
        tuple(math.floor(alpha * t + (1 - alpha) * b + 0.5) for t, b in zip(top, base))
    )


def hue_distance(a: float, b: float) -> float:
    d = abs(a - b) % 360
    return min(d, 360 - d)


def in_reserved(hue: float, reserved: list[list[float]]) -> bool:
    """True inside any [lo, hi] band. A band with lo > hi wraps through 0."""
    h = hue % 360
    return any(
        lo <= h <= hi if lo <= hi else (h >= lo or h <= hi) for lo, hi in reserved
    )


# --- gates -------------------------------------------------------------------


def gates(colors: dict, fixed: dict) -> list[dict]:
    """The contrast pairs for one colourway. edge-field is reported, not gated."""
    alpha = float(fixed["sheet-alpha"])
    ink, muted = fixed["ink"], fixed["muted"]
    start, end = colors["field-start"], colors["field-end"]
    sheet_start, sheet_end = over(WHITE, start, alpha), over(WHITE, end, alpha)
    rows = [
        ("ink-white", ink, WHITE, WHITE, TEXT_MIN, "正文,不透明回退"),
        ("ink-sheet-start", ink, sheet_start, f"白 {alpha:g} 叠 `{start}`", TEXT_MIN, "正文,字段起点"),
        ("ink-sheet-end", ink, sheet_end, f"白 {alpha:g} 叠 `{end}`", TEXT_MIN, "正文,字段终点"),
        ("muted-sheet-start", muted, sheet_start, f"白 {alpha:g} 叠 `{start}`", TEXT_MIN, "次要文字,字段起点"),
        ("muted-sheet-end", muted, sheet_end, f"白 {alpha:g} 叠 `{end}`", TEXT_MIN, "次要文字,字段终点"),
        ("input-wash", colors["input"], colors["input-wash"], colors["input-wash"], TEXT_MIN, "输入或完成,正文与大号数字"),
        ("input-white", colors["input"], WHITE, WHITE, TEXT_MIN, "链接与焦点环"),
        ("output-wash", colors["output"], colors["output-wash"], colors["output-wash"], TEXT_MIN, "输出,正文与大号数字"),
        ("output-white", colors["output"], WHITE, WHITE, TEXT_MIN, "输出色在白纸上"),
        ("edge-field", WHITE, start, start, None, "白描边,不能当控件边界"),
    ]
    out = []
    for gate_id, fg, bg, label, minimum, use in rows:
        ratio = contrast(fg, bg)
        out.append(
            {
                "id": gate_id,
                "fg": fg,
                "bg": bg,
                "bg_label": label,
                "ratio": round(ratio, 2),
                "min": minimum,
                "pass": None if minimum is None else ratio >= minimum,
                "use": use,
            }
        )
    return out


def failures(rows: list[dict]) -> list[str]:
    return [row["id"] for row in rows if row["pass"] is False]


# --- derivation --------------------------------------------------------------


def output_hue(hue: int, spec: dict) -> int:
    for offset in spec["output_offsets"]:
        candidate = (hue + offset) % 360
        if not in_reserved(candidate, spec["reserved_hues"]):
            return candidate
    raise ValueError(f"no output hue for {hue} outside the reserved bands")


def _accent(hue: float, wash: str) -> str:
    chroma_steps = int(round((ACCENT[1] - ACCENT_MIN_C) / STEP_C))
    light_steps = int(round((ACCENT[0] - ACCENT_MIN_L) / STEP_L))
    for ci in range(chroma_steps + 1):
        C = ACCENT[1] - ci * STEP_C
        for li in range(light_steps + 1):
            candidate = oklch_to_hex(ACCENT[0] - li * STEP_L, C, hue)
            if contrast(candidate, wash) >= TEXT_MIN and contrast(candidate, WHITE) >= TEXT_MIN:
                return candidate
    raise ValueError(f"no accent at hue {hue} reaches {TEXT_MIN}:1")


def _field(hue: float, template: tuple[float, float], fixed: dict) -> str:
    L, C = template
    C = min(C, FIELD_MAX_C)
    alpha = float(fixed["sheet-alpha"])
    for li in range(int(round((0.985 - L) / STEP_L)) + 1):
        candidate = oklch_to_hex(L + li * STEP_L, C, hue)
        sheet = over(WHITE, candidate, alpha)
        if min(contrast(fixed["ink"], sheet), contrast(fixed["muted"], sheet)) >= TEXT_MIN:
            return candidate
    raise ValueError(f"no field at hue {hue} keeps text at {TEXT_MIN}:1")


def derive(hue: int, spec: dict) -> dict:
    """A full colourway for one input hue. Every gate passes or ValueError."""
    hue = int(hue) % 360
    out_hue = output_hue(hue, spec)
    fixed = spec["fixed"]
    input_wash = oklch_to_hex(WASH[0], WASH[1], hue)
    output_wash = oklch_to_hex(WASH[0], WASH[1], out_hue)
    colors = {
        "field-start": _field(hue, FIELD_START, fixed),
        "field-end": _field(out_hue, FIELD_END, fixed),
        "input": _accent(hue, input_wash),
        "input-wash": input_wash,
        "output": _accent(out_hue, output_wash),
        "output-wash": output_wash,
    }
    failed = failures(gates(colors, fixed))
    if failed:
        raise ValueError(f"derived hue {hue} fails {', '.join(failed)}")
    return {"hue": hue, "output_hue": out_hue, "colors": colors}


# --- choice ------------------------------------------------------------------

OVERRIDE_HUE = re.compile(r"hue:(\d{1,3})")


def parse_override(value: str | None, spec: dict) -> tuple[str, str | int] | None:
    """None or 'auto' → None; preset → ('preset', name); hue:N → ('hue', N)."""
    if value is None or value == "auto":
        return None
    if value in spec["presets"]:
        return "preset", value
    m = OVERRIDE_HUE.fullmatch(value)
    if m and 0 <= int(m.group(1)) <= 359:
        return "hue", int(m.group(1))
    names = ", ".join(spec["presets"])
    raise ValueError(
        f"--palette must be auto, a preset ({names}), or hue:<0-359>; got {value!r}"
    )


def _keyword_hits(text: str, words_en: list[str], words_zh: list[str]) -> list[str]:
    lower = text.lower()
    hits = [
        w for w in words_en
        if re.search(rf"(?<![a-z0-9]){re.escape(w.lower())}(?![a-z0-9])", lower)
    ]
    hits.extend(w for w in words_zh if w in text)
    return hits


def _accent_candidates(signal: dict) -> list[dict]:
    """Accent tokens to try, in order: signals 'accents', or the single accent_* fields."""
    listed = signal.get("accents")
    if listed is None:
        listed = [
            {
                "var": signal.get("accent_var"),
                "hue": signal.get("accent_hue"),
                "C": signal.get("accent_C"),
                "hex": signal.get("accent_hex"),
            }
        ]
    return [c for c in listed if c.get("hue") is not None]


def _lightness(candidate: dict) -> float | None:
    """OKLCH lightness of an accent candidate, read from its hex; None without one."""
    value = candidate.get("hex")
    return hex_to_oklch(value)[0] if value else None


def _preset(name: str, spec: dict) -> dict:
    preset = spec["presets"][name]
    return {role: preset[role] for role in ROLES}


def choose(
    spec: dict,
    *,
    signal: dict | None = None,
    prompt: str = "",
    project: str = "",
    override: str | None = None,
) -> dict:
    """Pick a colourway. signal is the signals 'palette' object (or None).

    Order: explicit override, the first accent token with enough chroma and
    lightness, preset keywords in the prompt and project text, then the default.
    Returns {palette, kind, hue, reason, colors, notes}. Deterministic.
    """
    notes: list[str] = []
    signal = signal or {}
    if signal.get("band") == "dark":
        notes.append(
            "the project paper is dark; this entry has a light colourway only, "
            "so DESIGN.md is still written in light"
        )

    def preset_result(name: str, reason: str) -> dict:
        return {"palette": name, "kind": "preset", "hue": spec["presets"][name]["anchor"],
                "reason": reason, "colors": _preset(name, spec), "notes": notes}

    def derived_result(hue: int, reason: str) -> dict:
        derived = derive(hue, spec)
        return {"palette": f"hue:{derived['hue']}", "kind": "derived", "hue": derived["hue"],
                "output_hue": derived["output_hue"], "reason": reason,
                "colors": derived["colors"], "notes": notes}

    parsed = parse_override(override, spec)
    if parsed and parsed[0] == "preset":
        return preset_result(str(parsed[1]), f"explicit --palette {parsed[1]}")
    if parsed and parsed[0] == "hue":
        return derived_result(int(parsed[1]), f"explicit --palette hue:{parsed[1]}")

    # The first accent token with enough chroma and lightness wins. A near-gray or
    # near-black one is skipped with a note, so a gray --accent or an ink-coloured
    # --primary does not hide a chromatic token further down the list.
    skipped = 0
    dark = 0
    for candidate in _accent_candidates(signal):
        accent_hue = int(round(candidate["hue"])) % 360
        accent_c = candidate.get("C")
        accent_l = _lightness(candidate)
        why = None
        if accent_c is None:
            why = "has no readable chroma"
        elif accent_c < spec["min_accent_chroma"]:
            why = f"is near gray (chroma {accent_c})"
        elif accent_l is not None and accent_l < spec["min_accent_lightness"]:
            why = f"is near black (lightness {accent_l:.2f})"
            dark += 1
        if why:
            skipped += 1
            if skipped <= MAX_SKIP_NOTES:
                notes.append(f"accent {candidate.get('var')} {why}; not used as an accent")
            continue
        where = f"accent {candidate.get('var')} {candidate.get('hex') or ''}".rstrip()
        where += f" (hue {accent_hue})"
        name, distance = min(
            ((n, hue_distance(accent_hue, p["anchor"])) for n, p in spec["presets"].items()),
            key=lambda item: item[1],
        )
        if distance <= spec["match_degrees"]:
            anchor = spec["presets"][name]["anchor"]
            return preset_result(name, f"{where} is within {distance:g}° of {name} (anchor {anchor})")
        return derived_result(
            accent_hue,
            f"{where}; no preset within {spec['match_degrees']}°, derived from its hue",
        )
    if skipped > MAX_SKIP_NOTES:
        kind = "near gray or near black" if dark else "near gray"
        notes.append(f"{skipped - MAX_SKIP_NOTES} more accent tokens are {kind}; not used")

    scores: dict[str, float] = {}
    hits: dict[str, list[str]] = {}
    for name, preset in spec["presets"].items():
        in_prompt = _keyword_hits(prompt, preset["keywords_en"], preset["keywords_zh"])
        in_project = [
            w for w in _keyword_hits(project, preset["keywords_en"], preset["keywords_zh"])
            if w not in in_prompt
        ]
        scores[name] = len(in_prompt) + PROJECT_WEIGHT * len(in_project)
        hits[name] = in_prompt + [f"{w} (project)" for w in in_project]
    best = max(spec["presets"], key=lambda n: scores[n])  # first preset wins ties
    if scores[best] > 0:
        return preset_result(best, f"keywords {', '.join(hits[best])} match {best}")
    default = spec["default"]
    return preset_result(default, "fallback (no palette or content signal)")


# --- rendering ---------------------------------------------------------------

BLOCK = re.compile(r"(<!-- palette:begin (?P<name>[a-z]+) -->\n)(?P<body>.*?)(\n<!-- palette:end (?P=name) -->)", re.S)


def colourway_block(choice: dict, spec: dict) -> str:
    c = choice["colors"]
    if choice["kind"] == "preset":
        label = spec["presets"][choice["palette"]]["label"]
        head = f"Colourway: `{choice['palette']}` ({label['zh']} / {label['en']})."
    else:
        head = (
            f"Colourway: `{choice['palette']}` (derived: input hue {choice['hue']}, "
            f"output hue {choice['output_hue']})."
        )
    presets = ", ".join(f"`{name}`" for name in spec["presets"])
    return "\n".join(
        [
            head,
            "",
            f"- Field: `{c['field-start']}` to `{c['field-end']}`.",
            f"- Input: `{c['input']}` on `{c['input-wash']}`.",
            f"- Output: `{c['output']}` on `{c['output-wash']}`.",
            f"- Other colourways: {presets}, or `hue:<0-359>`.",
        ]
    )


def contrast_block(choice: dict, spec: dict) -> str:
    rows = gates(choice["colors"], spec["fixed"])
    by_id = {row["id"]: row for row in rows}
    ring, edge = by_id["input-white"], by_id["edge-field"]
    lines = [
        f"Controls show their boundary by fill, plus a 2px focus ring in `{{colors.input}}` "
        f"(`{choice['colors']['input']}`). On white that ring is {ring['ratio']:.2f}:1. "
        f"The white edge on the field start is {edge['ratio']:.2f}:1, which is below the 3:1 "
        "non-text boundary, so the edge cannot be the control boundary.",
        "",
        "| 前景 | 背景 | 比值 | 用途 |",
        "| --- | --- | --- | --- |",
    ]
    for row in rows:
        bg = row["bg_label"] if row["bg_label"].startswith("白 ") else f"`{row['bg_label']}`"
        lines.append(f"| `{row['fg']}` | {bg} | {row['ratio']:.2f} | {row['use']} |")
    return "\n".join(lines)


def render(template: str, choice: dict, spec: dict) -> str:
    """Swap the default colourway hex values and regenerate the palette blocks."""
    default = _preset(spec["default"], spec)
    mapping = {default[role]: choice["colors"][role] for role in ROLES}
    pattern = re.compile("|".join(re.escape(h) for h in mapping))
    text = pattern.sub(lambda m: mapping[m.group(0)], template)
    blocks = {"colourway": colourway_block(choice, spec), "contrast": contrast_block(choice, spec)}
    seen: set[str] = set()

    def fill(m: re.Match) -> str:
        name = m.group("name")
        if name not in blocks:
            raise ValueError(f"unknown palette block {name!r}")
        seen.add(name)
        return f"{m.group(1)}{blocks[name]}{m.group(4)}"

    text = BLOCK.sub(fill, text)
    missing = sorted(set(blocks) - seen)
    if missing:
        raise ValueError(f"template has no palette block {', '.join(missing)}")
    return text


def comment(choice: dict) -> str:
    """The line apply writes under the provenance comment."""
    reason = choice["reason"].replace("-->", "->")
    return f"<!-- palette: {choice['palette']}; reason: {reason} -->"


def format_text(entry_id: str, choice: dict, spec: dict) -> str:
    lines = [f"entry: {entry_id}", f"palette: {choice['palette']} ({choice['reason']})"]
    lines.extend(f"note: {note}" for note in choice["notes"])
    lines.append("colors:")
    lines.extend(f"  {role:<12} {choice['colors'][role]}" for role in ROLES)
    lines.append("contrast:")
    for row in gates(choice["colors"], spec["fixed"]):
        verdict = "report" if row["pass"] is None else ("pass" if row["pass"] else "FAIL")
        minimum = f">= {row['min']:g}" if row["min"] is not None else "      "
        lines.append(
            f"  {row['id']:<18} {row['fg']} on {row['bg']}  {row['ratio']:>5.2f}  {minimum}  {verdict}"
        )
    return "\n".join(lines)


def as_json(entry_id: str, choice: dict, spec: dict) -> dict:
    return {
        "entry": entry_id,
        "palette": choice["palette"],
        "reason": choice["reason"],
        "notes": choice["notes"],
        "colors": choice["colors"],
        "contrast": [
            {k: row[k] for k in ("id", "fg", "bg", "ratio", "min", "pass")}
            for row in gates(choice["colors"], spec["fixed"])
        ],
    }
