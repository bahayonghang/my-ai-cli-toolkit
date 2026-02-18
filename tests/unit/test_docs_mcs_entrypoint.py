from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_primary_docs_reference_just_mcs() -> None:
    paths = [
        "README.md",
        "README_CN.md",
        "docs/guide/mcs.md",
        "docs/zh/guide/mcs.md",
        "docs/guide/installation.md",
        "docs/zh/guide/installation.md",
    ]
    for path in paths:
        text = _read(path)
        assert "just mcs" in text, f"`just mcs` missing in {path}"


def test_legacy_install_tui_mentions_are_compatibility_only() -> None:
    paths = [
        "README.md",
        "README_CN.md",
        "docs/guide/mcs.md",
        "docs/zh/guide/mcs.md",
        "docs/zh/guide/tui-uiux.md",
    ]
    for path in paths:
        text = _read(path)
        if "uv run python src/install_tui.py" not in text:
            continue
        lowered = text.lower()
        assert "compat" in lowered or "兼容" in text or "forward" in lowered or "转发" in text, (
            f"legacy entrypoint in {path} must be marked compatibility/forwarding"
        )
