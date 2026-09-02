#!/usr/bin/env python3
"""Shared path, prefix, and JSON helpers for storage-analyzer."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

SCRIPT_INTERFACE = "internal-module"

HERE = Path(__file__).resolve().parent
SKILL_DIR = HERE.parent
PREFIX_FILE = SKILL_DIR / "references" / "cache-prefixes.json"


def user_home() -> Path:
    raw = os.environ.get("USERPROFILE") or os.environ.get("HOME") or os.path.expanduser("~")
    return Path(os.path.realpath(os.path.expanduser(raw)))


def norm(path: str | Path) -> str:
    resolved = os.path.realpath(os.path.expanduser(str(path)))
    if sys.platform.startswith("win"):
        return os.path.normcase(resolved)
    return resolved


def is_link(path: str | Path) -> bool:
    raw = str(path)
    try:
        if os.path.islink(raw):
            return True
        isjunction = getattr(os.path, "isjunction", None)
        if callable(isjunction) and isjunction(raw):
            return True
    except OSError:
        return True
    if sys.platform.startswith("win"):
        try:
            import ctypes

            attrs = ctypes.windll.kernel32.GetFileAttributesW(raw)
            if attrs != 0xFFFFFFFF and attrs & 0x400:
                return True
        except Exception:
            return False
    return False


def is_under(path: str | Path, root: str | Path) -> bool:
    child = norm(path)
    base = norm(root)
    sep = os.sep
    return child == base or child.startswith(base + sep)


def placeholder_values() -> dict[str, str]:
    home = str(user_home())
    local = os.environ.get("LOCALAPPDATA") or os.path.join(home, "AppData", "Local")
    roaming = os.environ.get("APPDATA") or os.path.join(home, "AppData", "Roaming")
    temp = os.environ.get("TEMP") or os.environ.get("TMP") or os.path.join(local, "Temp")
    return {
        "HOME": os.path.realpath(home),
        "TEMP": os.path.realpath(os.path.expanduser(temp)),
        "LOCALAPPDATA": os.path.realpath(os.path.expanduser(local)),
        "APPDATA": os.path.realpath(os.path.expanduser(roaming)),
    }


def expand_prefix(spec: str) -> Path:
    out = spec
    for key, value in placeholder_values().items():
        out = out.replace("{" + key + "}", value)
    out = out.replace("/", os.sep)
    return Path(os.path.expanduser(out))


def platform_key(platform: str | None = None) -> str:
    if platform:
        return platform
    if sys.platform == "darwin":
        return "darwin"
    if sys.platform.startswith("win"):
        return "win32"
    return sys.platform


def load_prefix_specs(platform: str | None = None) -> dict[str, Any]:
    data = json.loads(PREFIX_FILE.read_text(encoding="utf-8"))
    block = data.get(platform_key(platform)) or {}
    return {
        "prefixes": list(block.get("prefixes") or []),
        "cache_globs": list(block.get("cache_globs") or []),
    }


def _segment_match(path_segs: list[str], pat_segs: list[str]) -> bool:
    if not pat_segs or len(pat_segs) > len(path_segs):
        return False
    for i in range(0, len(path_segs) - len(pat_segs) + 1):
        window = path_segs[i : i + len(pat_segs)]
        if all(b == "*" or a == b for a, b in zip(window, pat_segs)):
            return True
    return False


def is_green_trash_path(path: str | Path) -> bool:
    spec = load_prefix_specs()
    for prefix in spec["prefixes"]:
        if is_under(path, expand_prefix(prefix)):
            return True
    segs = norm(path).replace("\\", "/").split("/")
    for glob in spec["cache_globs"]:
        pat = glob.replace("\\", "/").lower().split("/")
        if _segment_match([s.lower() for s in segs], pat):
            return True
    return False


def html_safe_dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False).replace("<", "\\u003c")


def validate_analysis(data: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(data, dict):
        return ["analysis must be a JSON object"]
    system = data.get("system")
    if not isinstance(system, dict):
        errors.append("system must be an object")
    else:
        for key in ("os", "home", "disk_total", "disk_used", "disk_free"):
            if key not in system:
                errors.append(f"system.{key} is required")
    for key in ("green", "yellow", "red", "top5"):
        if key not in data:
            errors.append(f"{key} is required")
        elif not isinstance(data.get(key), list):
            errors.append(f"{key} must be an array")
    summary = data.get("summary")
    if not isinstance(summary, dict):
        errors.append("summary must be an object")
        return errors
    if not isinstance(summary.get("overview"), str):
        errors.append("summary.overview must be a string")
    stats = summary.get("tier_stats")
    if not isinstance(stats, dict):
        errors.append("summary.tier_stats must be an object")
    else:
        for key in ("green", "yellow", "red"):
            if key not in stats:
                errors.append(f"summary.tier_stats.{key} is required")
    for key in ("priority", "long_term"):
        if key not in summary:
            errors.append(f"summary.{key} is required")
        elif not isinstance(summary.get(key), list):
            errors.append(f"summary.{key} must be an array")
    return errors


def rejected_green_trash(data: dict[str, Any]) -> list[str]:
    rejected: list[str] = []
    home = user_home()
    for item in data.get("green") or []:
        if not isinstance(item, dict):
            continue
        for raw in item.get("trash_paths") or []:
            path = str(raw)
            if not is_green_trash_path(path) or not is_under(path, home):
                rejected.append(path)
    return rejected


def require_absolute(path: str, flag: str) -> Path:
    candidate = Path(path)
    if not candidate.is_absolute():
        raise ValueError(f"{flag} must be an absolute path")
    return candidate
