#!/usr/bin/env python3
"""Shared section headings for skill-session-review renderers."""

from __future__ import annotations


HEADINGS = {
    "zh": {
        "scorecard": "量表得分",
        "coverage": "覆盖说明",
        "invocations": "调用清单",
        "findings": "问题清单",
        "suggestions": "建议条款",
        "not_filed": "未提项",
        "unverified": "未能核实",
        "reliable": "可靠部分",
    },
    "en": {
        "scorecard": "Scorecard",
        "coverage": "Coverage",
        "invocations": "Invocations",
        "findings": "Findings",
        "suggestions": "Suggestions",
        "not_filed": "Not filed",
        "unverified": "Unverified",
        "reliable": "Reliable",
    },
}


def headings_for(language: str) -> dict[str, str]:
    """Return a defensive copy of the registered headings for *language*."""

    if language not in HEADINGS:
        raise ValueError(f"unsupported report language: {language!r}")
    return dict(HEADINGS[language])


def text_entrypoint(language: str = "zh") -> str:
    """Return UTF-8 text for the encoding smoke test without doing file IO."""

    return " | ".join(headings_for(language).values()) + " · 中文 + emoji ✅"
