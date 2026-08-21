#!/usr/bin/env python3
"""Scan, assemble, apply, and undo file-sorter review plans."""

from __future__ import annotations

import argparse
import ctypes
import json
import os
import re
import shutil
import stat
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

KIND_SCAN = "file-sorter.scan"
KIND_PLAN = "file-sorter.plan"
KIND_APPLY = "file-sorter.apply-result"
KIND_UNDO = "file-sorter.undo"
KIND_UNDO_RESULT = "file-sorter.undo-result"

JUNK_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini"}
FILE_ATTRIBUTE_HIDDEN = 0x2
INVALID_FILE_ATTRIBUTES = 0xFFFFFFFF
FORBIDDEN_CHARS = '<>:"/\\|?*'
MAX_LABEL_LENGTH = 80
RESERVED_WINDOWS = {
    "con",
    "prn",
    "aux",
    "nul",
    *(f"com{i}" for i in range(1, 10)),
    *(f"lpt{i}" for i in range(1, 10)),
}
LOW_INFO_LABELS = {
    "documents",
    "document",
    "files",
    "file",
    "general",
    "miscellaneous",
    "misc",
    "other",
    "uncategorized",
}
LOW_INFO_IMAGE_LABELS = LOW_INFO_LABELS | {
    "image",
    "images",
    "photo",
    "photos",
    "picture",
    "pictures",
    "graphic",
    "graphics",
    "screenshot",
    "screenshots",
    "wallpaper",
    "wallpapers",
}
STABLE_DOCUMENT_MAINS = {
    "documents",
    "presentations",
    "spreadsheets",
    "data exports",
    "configs",
}
ARTIFACT_ALIASES = {
    "software": "Software",
    "application": "Software",
    "applications": "Software",
    "app": "Software",
    "apps": "Software",
    "program": "Software",
    "programs": "Software",
    "installer": "Installers",
    "installers": "Installers",
    "installation": "Installers",
    "installations": "Installers",
    "setup": "Installers",
    "setups": "Installers",
    "setup file": "Installers",
    "setup files": "Installers",
    "driver": "Drivers",
    "drivers": "Drivers",
    "operating system": "Operating Systems",
    "operating systems": "Operating Systems",
    "archive": "Archives",
    "archives": "Archives",
    "data export": "Data Exports",
    "data exports": "Data Exports",
    "other": "Other",
    "others": "Other",
    "misc": "Other",
    "miscellaneous": "Other",
    "uncategorized": "Other",
}
GENERIC_CATEGORIES = [
    "Documents",
    "Images",
    "Videos",
    "Audio",
    "Software",
    "Archives",
    "Data Exports",
    "Configs",
    "Drivers",
    "Operating Systems",
    "Ebooks",
    "Fonts",
    "Other",
]
FAMILY_CATEGORIES: dict[str, list[str]] = {
    "image": ["Images"],
    "document": ["Documents", "Presentations", "Spreadsheets", "Data Exports", "Configs"],
    "software": ["Software", "Installers", "Drivers", "Operating Systems", "Other"],
    "archive": ["Archives", "Software", "Data Exports", "Other"],
    "audio": ["Audio", "Other"],
    "video": ["Videos", "Other"],
    "ebook": ["Ebooks", "Documents", "Other"],
    "font": ["Fonts", "Other"],
    "generic": GENERIC_CATEGORIES,
}
IMAGE_EXTS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".gif",
    ".webp",
    ".tif",
    ".tiff",
    ".tga",
    ".psd",
    ".hdr",
    ".pic",
    ".pnm",
    ".ppm",
    ".pgm",
    ".pbm",
    ".heic",
    ".heif",
    ".avif",
    ".ico",
    ".svg",
}
DOCUMENT_EXTS = {
    ".txt",
    ".md",
    ".markdown",
    ".rtf",
    ".csv",
    ".tsv",
    ".log",
    ".json",
    ".xml",
    ".yml",
    ".yaml",
    ".ini",
    ".cfg",
    ".conf",
    ".html",
    ".htm",
    ".tex",
    ".rst",
    ".pdf",
    ".docx",
    ".xlsx",
    ".pptx",
    ".odt",
    ".ods",
    ".odp",
    ".doc",
    ".xls",
    ".ppt",
}
PRESENTATION_EXTS = {".pptx", ".odp", ".ppt"}
SPREADSHEET_EXTS = {".xlsx", ".ods", ".xls"}
DATA_EXPORT_EXTS = {".csv", ".tsv"}
CONFIG_EXTS = {".ini", ".cfg", ".conf"}
SUFFIX_FAMILIES: list[tuple[str, str]] = [
    (".tar.gz", "archive"),
    (".tar.bz2", "archive"),
    (".tar.xz", "archive"),
    (".msixbundle", "software"),
    (".appxbundle", "software"),
    (".appimage", "software"),
    (".tbz2", "archive"),
    (".tgz", "archive"),
    (".tbz", "archive"),
    (".txz", "archive"),
    (".msix", "software"),
    (".appx", "software"),
    (".exe", "software"),
    (".msi", "software"),
    (".deb", "software"),
    (".rpm", "software"),
    (".pkg", "software"),
    (".dmg", "software"),
    (".apk", "software"),
    (".run", "software"),
    (".bat", "software"),
    (".cmd", "software"),
    (".com", "software"),
    (".zip", "archive"),
    (".7z", "archive"),
    (".rar", "archive"),
    (".tar", "archive"),
    (".gz", "archive"),
    (".bz2", "archive"),
    (".xz", "archive"),
    (".aac", "audio"),
    (".aif", "audio"),
    (".aiff", "audio"),
    (".alac", "audio"),
    (".ape", "audio"),
    (".flac", "audio"),
    (".m4a", "audio"),
    (".mp3", "audio"),
    (".ogg", "audio"),
    (".oga", "audio"),
    (".opus", "audio"),
    (".wav", "audio"),
    (".wma", "audio"),
    (".3gp", "video"),
    (".avi", "video"),
    (".flv", "video"),
    (".m4v", "video"),
    (".mkv", "video"),
    (".mov", "video"),
    (".mp4", "video"),
    (".mpeg", "video"),
    (".mpg", "video"),
    (".mts", "video"),
    (".m2ts", "video"),
    (".ts", "video"),
    (".webm", "video"),
    (".wmv", "video"),
    (".epub", "ebook"),
    (".mobi", "ebook"),
    (".azw3", "ebook"),
    (".azw", "ebook"),
    (".fb2", "ebook"),
    (".ttf", "font"),
    (".otf", "font"),
    (".woff2", "font"),
    (".woff", "font"),
]
WHITELIST_PROMPT_THRESHOLD = 30
WHITELIST_PROMPT_LIMIT = 8

PROTECTED_RULES: list[dict[str, Any]] = [
    {
        "id": "unity",
        "name": "Unity project",
        "required": ["Assets", "ProjectSettings/ProjectVersion.txt"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Unity relies on project-relative assets and .meta GUID mappings.",
    },
    {
        "id": "unreal",
        "name": "Unreal Engine project",
        "required": ["Config", "Content"],
        "any_groups": [],
        "suffixes": [".uproject"],
        "strength": "strong",
        "reason": "Unreal projects depend on Content, Config, and .uproject-relative paths.",
    },
    {
        "id": "godot",
        "name": "Godot project",
        "required": ["project.godot"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Godot projects depend on project.godot and resource-relative paths.",
    },
    {
        "id": "git",
        "name": "Git repository",
        "required": [".git"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Source repositories depend on stable relative paths tracked by version control.",
    },
    {
        "id": "node",
        "name": "Node.js project",
        "required": ["package.json"],
        "any_groups": [["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "node_modules", "src"]],
        "suffixes": [],
        "strength": "strong",
        "reason": "JavaScript projects depend on package metadata, imports, and build scripts.",
    },
    {
        "id": "python",
        "name": "Python project",
        "required": ["pyproject.toml"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Python projects depend on package metadata and source-relative imports.",
    },
    {
        "id": "rust",
        "name": "Rust project",
        "required": ["Cargo.toml"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Rust projects depend on Cargo metadata and source-relative module paths.",
    },
    {
        "id": "go",
        "name": "Go module",
        "required": ["go.mod"],
        "any_groups": [],
        "suffixes": [],
        "strength": "strong",
        "reason": "Go modules depend on module-root-relative package layout.",
    },
    {
        "id": "gradle",
        "name": "Gradle project",
        "required": [],
        "any_groups": [
            ["settings.gradle", "settings.gradle.kts"],
            ["build.gradle", "build.gradle.kts", "gradlew"],
        ],
        "suffixes": [],
        "strength": "strong",
        "reason": "Gradle projects depend on build files and source-relative layouts.",
    },
    {
        "id": "dotnet",
        "name": ".NET project",
        "required": [],
        "any_groups": [],
        "suffixes": [".sln", ".csproj", ".fsproj", ".vbproj"],
        "strength": "strong",
        "reason": ".NET projects depend on solution and project-relative paths.",
    },
    {
        "id": "xcode",
        "name": "Xcode project",
        "required": [],
        "any_groups": [],
        "suffixes": [".xcodeproj", ".xcworkspace"],
        "strength": "strong",
        "reason": "Xcode projects depend on bundle metadata and project-relative paths.",
    },
    {
        "id": "blender",
        "name": "Blender project",
        "required": [],
        "any_groups": [["assets", "textures", "materials", "renders", "render", "cache", "blendcache"]],
        "suffixes": [".blend"],
        "strength": "strong",
        "reason": "Blender project folders often depend on sibling asset and cache paths.",
    },
    {
        "id": "blender-file",
        "name": "Blender scene folder",
        "required": [],
        "any_groups": [],
        "suffixes": [".blend"],
        "strength": "weak",
        "reason": "A .blend file alone is a weak signal; no automatic scan skip is applied.",
    },
]


class HelperError(Exception):
    def __init__(self, message: str, code: int) -> None:
        super().__init__(message)
        self.code = code


def fail(message: str, code: int) -> int:
    print(f"ERROR: {message}", file=sys.stderr)
    return code


def emit_json(payload: dict[str, Any], output: Path | None) -> None:
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if output is not None:
        output.write_text(text, encoding="utf-8", newline="\n")
    sys.stdout.write(text)


def load_json(path: Path) -> Any:
    if not path.is_file():
        raise HelperError(f"file does not exist: {path}", 2)
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise HelperError(f"invalid JSON in {path}: {exc}", 2) from exc


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def require_absolute_dir(raw: str) -> Path:
    path = Path(raw)
    if not path.is_absolute():
        raise HelperError("root must be an absolute path", 2)
    if not path.exists():
        raise HelperError(f"root does not exist: {path}", 2)
    if path.is_symlink():
        raise HelperError("root must not be a symlink", 2)
    if not path.is_dir():
        raise HelperError(f"root is not a directory: {path}", 2)
    return path


def is_inside(root: Path, candidate: Path) -> bool:
    try:
        candidate.resolve().relative_to(root.resolve())
        return True
    except (ValueError, OSError):
        return False


def posix_path(path: Path) -> str:
    return str(path).replace("\\", "/")


def last_extension(name: str) -> str:
    lower = name.lower()
    dot = lower.rfind(".")
    if dot <= 0 or dot == len(lower) - 1:
        return ""
    return lower[dot:]


def family_for_name(name: str) -> str:
    lower = name.lower()
    ext = last_extension(name)
    if ext in IMAGE_EXTS:
        return "image"
    if ext in DOCUMENT_EXTS:
        return "document"
    for suffix, family in SUFFIX_FAMILIES:
        if lower.endswith(suffix):
            return family
    return "generic"


def preferred_main_category(name: str) -> str | None:
    family = family_for_name(name)
    if family == "image":
        return "Images"
    if family != "document":
        return None
    ext = last_extension(name)
    if ext in PRESENTATION_EXTS:
        return "Presentations"
    if ext in SPREADSHEET_EXTS:
        return "Spreadsheets"
    if ext in DATA_EXPORT_EXTS:
        return "Data Exports"
    if ext in CONFIG_EXTS:
        return "Configs"
    return "Documents"


def classify_file(name: str) -> dict[str, Any]:
    family = family_for_name(name)
    return {
        "family": family,
        "allowed_main_categories": list(FAMILY_CATEGORIES[family]),
        "preferred_main_category": preferred_main_category(name),
    }


def is_hidden(path: Path) -> bool:
    if os.name == "nt":
        try:
            attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
        except OSError:
            return False
        if attrs == INVALID_FILE_ATTRIBUTES:
            return False
        return bool(attrs & FILE_ATTRIBUTE_HIDDEN)
    return path.name.startswith(".")


def is_symlink(path: Path) -> bool:
    try:
        return path.is_symlink()
    except OSError:
        return False


def path_exists(path: Path) -> bool:
    try:
        return path.exists()
    except OSError:
        return False


def dir_has_suffix(root: Path, suffixes: list[str]) -> bool:
    if not suffixes:
        return True
    lowered = [item.lower() for item in suffixes]
    try:
        with os.scandir(root) as iterator:
            for entry in iterator:
                name = entry.name.lower()
                if any(name.endswith(suffix) for suffix in lowered):
                    return True
    except OSError:
        return False
    return False


def match_protected_rule(root: Path, rule: dict[str, Any]) -> bool:
    for rel in rule["required"]:
        if not path_exists(root / rel):
            return False
    for group in rule["any_groups"]:
        if not any(path_exists(root / rel) for rel in group):
            return False
    if not dir_has_suffix(root, rule["suffixes"]):
        return False
    has_marker = bool(rule["required"] or rule["any_groups"] or rule["suffixes"])
    return has_marker


def detect_protected(root: Path) -> dict[str, Any] | None:
    if not root.is_dir() or is_symlink(root):
        return None
    for rule in PROTECTED_RULES:
        if match_protected_rule(root, rule):
            return {
                "id": rule["id"],
                "name": rule["name"],
                "strength": rule["strength"],
                "reason": rule["reason"],
                "path": posix_path(root),
            }
    return None


def lstat_identity(path: Path) -> tuple[int, int]:
    info = path.lstat()
    return int(info.st_size), int(getattr(info, "st_mtime_ns", int(info.st_mtime * 1_000_000_000)))


def is_regular_file(path: Path) -> bool:
    try:
        return stat.S_ISREG(path.lstat().st_mode)
    except OSError:
        return False


def scan_root(root: Path, recursive: bool, include_hidden: bool) -> dict[str, Any]:
    skipped: list[dict[str, Any]] = []
    notes: list[dict[str, Any]] = []
    entries: list[dict[str, Any]] = []
    root_match = detect_protected(root)
    if root_match and root_match["strength"] == "strong":
        skipped.append(root_match)
        return {
            "kind": KIND_SCAN,
            "scan_root": posix_path(root),
            "recursive": recursive,
            "ok_to_scan": False,
            "entries": [],
            "skipped": skipped,
            "notes": notes,
        }
    if root_match and root_match["strength"] == "weak":
        notes.append(root_match)

    stack = [root]
    while stack:
        current = stack.pop()
        try:
            iterator = os.scandir(current)
        except OSError as exc:
            skipped.append(
                {
                    "id": "fs-error",
                    "name": "filesystem error",
                    "strength": "strong",
                    "reason": str(exc),
                    "path": posix_path(current),
                }
            )
            continue
        with iterator:
            for entry in iterator:
                path = Path(entry.path)
                name = entry.name
                try:
                    symlink = entry.is_symlink()
                    is_dir = entry.is_dir(follow_symlinks=False)
                    is_file = entry.is_file(follow_symlinks=False)
                except OSError as exc:
                    skipped.append(
                        {
                            "id": "fs-error",
                            "name": "filesystem error",
                            "strength": "strong",
                            "reason": str(exc),
                            "path": posix_path(path),
                        }
                    )
                    continue
                if name in JUNK_NAMES:
                    skipped.append(
                        {
                            "id": "junk",
                            "name": "junk file",
                            "strength": "strong",
                            "reason": f"junk name {name}",
                            "path": posix_path(path),
                        }
                    )
                    continue
                if not include_hidden and is_hidden(path):
                    skipped.append(
                        {
                            "id": "hidden",
                            "name": "hidden entry",
                            "strength": "strong",
                            "reason": "hidden entries are skipped by default",
                            "path": posix_path(path),
                        }
                    )
                    continue
                if symlink:
                    skipped.append(
                        {
                            "id": "symlink",
                            "name": "symlink",
                            "strength": "strong",
                            "reason": "symlinks are not followed",
                            "path": posix_path(path),
                        }
                    )
                    continue
                if is_dir:
                    match = detect_protected(path)
                    if match and match["strength"] == "strong":
                        skipped.append(match)
                        continue
                    if match and match["strength"] == "weak":
                        notes.append(match)
                    if recursive:
                        stack.append(path)
                    continue
                if not is_file:
                    continue
                meta = classify_file(name)
                size, mtime_ns = lstat_identity(path)
                entries.append(
                    {
                        "path": posix_path(path),
                        "name": name,
                        "family": meta["family"],
                        "allowed_main_categories": meta["allowed_main_categories"],
                        "preferred_main_category": meta["preferred_main_category"],
                        "is_symlink": False,
                        "size": size,
                        "mtime_ns": str(mtime_ns),
                    }
                )

    entries.sort(key=lambda item: item["path"].lower())
    return {
        "kind": KIND_SCAN,
        "scan_root": posix_path(root),
        "recursive": recursive,
        "ok_to_scan": True,
        "entries": entries,
        "skipped": skipped,
        "notes": notes,
    }


def collapse_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def sanitize_path_label(value: str) -> str:
    cleaned: list[str] = []
    for char in value:
        code = ord(char)
        if code < 32 or char in FORBIDDEN_CHARS:
            cleaned.append(" ")
        else:
            cleaned.append(char)
    return collapse_spaces("".join(cleaned))


def normalize_match(value: str) -> str:
    lowered = []
    previous_space = False
    for char in value.lower():
        if char.isalnum():
            lowered.append(char)
            previous_space = False
        elif lowered and not previous_space:
            lowered.append(" ")
            previous_space = True
    return "".join(lowered).strip()


def looks_like_extension_label(value: str) -> bool:
    dot = value.rfind(".")
    if dot == -1 or dot == len(value) - 1:
        return False
    ext = value[dot + 1 :]
    if not ext or len(ext) > 5:
        return False
    return ext.isalpha()


def validate_label_pair(category: str, subcategory: str) -> str | None:
    if not category or not subcategory:
        return "Category or subcategory is empty"
    if len(category) > MAX_LABEL_LENGTH or len(subcategory) > MAX_LABEL_LENGTH:
        return "Category or subcategory exceeds max length"
    if any(char in FORBIDDEN_CHARS or ord(char) < 32 for char in category + subcategory):
        return "Category or subcategory contains disallowed characters"
    if looks_like_extension_label(category) or looks_like_extension_label(subcategory):
        return "Category or subcategory looks like a file extension"
    if category.lower() in RESERVED_WINDOWS or subcategory.lower() in RESERVED_WINDOWS:
        return "Category or subcategory is a reserved name"
    if category in {".", ".."} or subcategory in {".", ".."}:
        return "Category or subcategory is an invalid path segment"
    if category.lower() == subcategory.lower():
        return "Category and subcategory are identical"
    return None


def validate_filename(name: str) -> str | None:
    if not name or name in {".", ".."}:
        return "Filename is invalid"
    if any(char in FORBIDDEN_CHARS or ord(char) < 32 for char in name):
        return "Filename contains disallowed characters"
    if name[0] in " ." or name[-1] in " .":
        return "Filename has leading/trailing space or dot"
    stem = Path(name).stem
    if not stem:
        return "Filename is missing a base name"
    if stem.lower() in RESERVED_WINDOWS:
        return "Filename is a reserved name"
    return None


def canonicalize_artifact_main(category: str) -> str | None:
    return ARTIFACT_ALIASES.get(normalize_match(category))


def choose_subcategory(
    stable_main: str,
    category: str,
    subcategory: str,
    image: bool,
) -> str:
    def candidate(value: str, allow_stable: bool) -> str:
        sanitized = sanitize_path_label(value)
        if not sanitized or sanitized.lower() == stable_main.lower():
            return ""
        key = normalize_match(sanitized)
        blocked = LOW_INFO_IMAGE_LABELS if image else LOW_INFO_LABELS
        if key in blocked:
            return ""
        if not image and not allow_stable and key in STABLE_DOCUMENT_MAINS:
            return ""
        return sanitized

    for value, allow in ((subcategory, False), (category, False), (subcategory, True), (category, True)):
        picked = candidate(value, allow)
        if picked:
            return picked
    return "General"


def load_whitelist(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise HelperError("whitelist must be a JSON object", 2)
    categories = [str(item) for item in raw.get("categories") or []]
    subcategories = [str(item) for item in raw.get("subcategories") or []]
    by_category_raw = raw.get("subcategories_by_category") or {}
    if not isinstance(by_category_raw, dict):
        raise HelperError("subcategories_by_category must be an object", 2)
    by_category = {
        str(key): [str(item) for item in values]
        for key, values in by_category_raw.items()
        if values
    }
    if subcategories and by_category:
        raise HelperError("global subcategories and branching subcategories are mutually exclusive", 2)
    return {
        "categories": categories,
        "subcategories": subcategories,
        "subcategories_by_category": by_category,
    }


def in_list(value: str, allowed: list[str]) -> bool:
    if not allowed:
        return True
    key = value.lower()
    return any(item.lower() == key for item in allowed)


def split_name(name: str) -> tuple[str, str]:
    path = Path(name)
    return path.stem, path.suffix


def unique_dest_name(target_dir: Path, desired: str, used: set[str], source: Path) -> str:
    def available(name: str) -> bool:
        key = name.lower()
        if key in used:
            return False
        dest = target_dir / name
        if dest.exists():
            try:
                return dest.resolve() == source.resolve()
            except OSError:
                return False
        return True

    if available(desired):
        used.add(desired.lower())
        return desired
    stem, ext = split_name(desired)
    index = 2
    while True:
        candidate = f"{stem}_{index}{ext}"
        if available(candidate):
            used.add(candidate.lower())
            return candidate
        index += 1


def parse_proposals(raw: Any) -> list[dict[str, Any]]:
    if isinstance(raw, dict):
        items = raw.get("proposals", raw.get("items", []))
    else:
        items = raw
    if not isinstance(items, list):
        raise HelperError("proposals must be a list", 2)
    parsed: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            raise HelperError("each proposal must be an object", 2)
        source = item.get("source")
        if not source:
            raise HelperError("proposal is missing source", 2)
        parsed.append(
            {
                "source": str(source),
                "category": str(item.get("category") or ""),
                "subcategory": str(item.get("subcategory") or ""),
                "suggested_name": str(item.get("suggested_name") or ""),
            }
        )
    return parsed


def assemble_plan(
    scan: dict[str, Any],
    proposals: list[dict[str, Any]],
    mode: str,
    operation: str,
    whitelist: dict[str, Any] | None,
    use_subcategory: bool,
) -> dict[str, Any]:
    if scan.get("kind") != KIND_SCAN:
        raise HelperError("scan JSON kind must be file-sorter.scan", 2)
    scan_root = Path(scan["scan_root"])
    by_path = {item["path"].replace("\\", "/").lower(): item for item in scan.get("entries") or []}
    items: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    used_names: dict[str, set[str]] = {}
    whitelist_enabled = whitelist is not None
    allowed_categories = whitelist["categories"] if whitelist else []
    allowed_subs = whitelist["subcategories"] if whitelist else []
    by_category = whitelist["subcategories_by_category"] if whitelist else {}

    if not scan.get("ok_to_scan", False):
        return {
            "kind": KIND_PLAN,
            "plan_id": uuid.uuid4().hex,
            "scan_root": scan["scan_root"],
            "operation": operation,
            "mode": mode,
            "use_subcategory": use_subcategory,
            "ok_to_apply": False,
            "items": [],
            "rejected": [{"source": scan["scan_root"], "reasons": ["scan root is protected"]}],
            "skipped": scan.get("skipped") or [],
            "created_at": utc_now(),
        }

    for proposal in proposals:
        source = Path(proposal["source"])
        source_key = posix_path(source).lower()
        reasons: list[str] = []
        scan_entry = by_path.get(source_key)
        if scan_entry is None:
            reasons.append("source is not in the scan entries")
        if not source.is_absolute():
            reasons.append("source must be an absolute path")
        elif not is_inside(scan_root, source):
            reasons.append("source is outside the scan root")
        if is_symlink(source):
            reasons.append("source is a symlink")
        if scan_entry is None:
            rejected.append({"source": posix_path(source), "reasons": reasons or ["unknown source"]})
            continue

        family = scan_entry["family"]
        category = sanitize_path_label(proposal["category"])
        subcategory = sanitize_path_label(proposal["subcategory"])
        if mode == "more-consistent" and scan_entry["preferred_main_category"] and not whitelist_enabled:
            category = scan_entry["preferred_main_category"]
            subcategory = choose_subcategory(
                category,
                proposal["category"],
                proposal["subcategory"],
                image=(family == "image"),
            )
        elif family in {"software", "archive"} and not whitelist_enabled:
            artifact_main = canonicalize_artifact_main(category)
            if artifact_main:
                category = artifact_main
                subcategory = choose_subcategory(category, proposal["category"], proposal["subcategory"], False)

        allowed = scan_entry["allowed_main_categories"]
        if (
            not whitelist_enabled
            and mode == "more-consistent"
            and category.lower() not in {item.lower() for item in allowed}
        ):
            if "Other" in allowed and normalize_match(category) in {"other", "others", "misc", "miscellaneous"}:
                category = "Other"
            else:
                reasons.append("main category is not in the file-family candidate list")

        if whitelist_enabled:
            if allowed_categories and not in_list(category, allowed_categories):
                reasons.append("main category is not in the whitelist")
            if by_category:
                mapped = None
                for key, values in by_category.items():
                    if key.lower() == category.lower():
                        mapped = values
                        break
                if mapped is not None and not in_list(subcategory, mapped):
                    reasons.append("subcategory is not allowed for this main category")
            elif allowed_subs and not in_list(subcategory, allowed_subs):
                reasons.append("subcategory is not in the whitelist")

        label_error = validate_label_pair(category, subcategory)
        if label_error:
            reasons.append(label_error)

        dest_name = scan_entry["name"]
        if operation in {"rename", "categorize-and-rename"} and proposal["suggested_name"]:
            dest_name = proposal["suggested_name"]
        name_error = validate_filename(dest_name)
        if name_error:
            reasons.append(name_error)

        if operation == "rename":
            target_dir = source.parent
        else:
            target_dir = scan_root / category
            if use_subcategory:
                target_dir = target_dir / subcategory
        if not is_inside(scan_root, target_dir) and target_dir.resolve() != scan_root.resolve():
            try:
                target_dir.resolve().relative_to(scan_root.resolve())
            except ValueError:
                reasons.append("target directory escapes the scan root")

        if reasons:
            rejected.append({"source": posix_path(source), "reasons": reasons})
            continue

        bucket = posix_path(target_dir).lower()
        used = used_names.setdefault(bucket, set())
        dest_name = unique_dest_name(target_dir, dest_name, used, source)
        size, mtime_ns = lstat_identity(source)
        items.append(
            {
                "source": posix_path(source),
                "family": family,
                "category": category,
                "subcategory": subcategory,
                "target_dir": posix_path(target_dir),
                "dest_name": dest_name,
                "operation": operation,
                "source_size": size,
                "source_mtime_ns": str(mtime_ns),
                "reasons": [],
            }
        )

    constraint_count = 0
    prompt_whitelist = None
    if whitelist is not None:
        constraint_count = (
            len(whitelist["categories"])
            + len(whitelist["subcategories"])
            + sum(len(values) for values in whitelist["subcategories_by_category"].values())
        )
        if constraint_count > WHITELIST_PROMPT_THRESHOLD:
            prompt_whitelist = {
                "categories": whitelist["categories"][:WHITELIST_PROMPT_LIMIT],
                "subcategories": whitelist["subcategories"][:WHITELIST_PROMPT_LIMIT],
                "truncated": True,
            }

    return {
        "kind": KIND_PLAN,
        "plan_id": uuid.uuid4().hex,
        "scan_root": scan["scan_root"],
        "operation": operation,
        "mode": mode,
        "use_subcategory": use_subcategory,
        "ok_to_apply": bool(items),
        "items": items,
        "rejected": rejected,
        "skipped": scan.get("skipped") or [],
        "whitelist_constraint_count": constraint_count,
        "prompt_whitelist": prompt_whitelist,
        "created_at": utc_now(),
    }


def destination_path(item: dict[str, Any]) -> Path:
    return Path(item["target_dir"]) / item["dest_name"]


def apply_plan(plan: dict[str, Any], execute: bool, undo_output: Path | None, plan_path: Path | None) -> dict[str, Any]:
    if plan.get("kind") != KIND_PLAN:
        raise HelperError("plan JSON kind must be file-sorter.plan", 2)
    scan_root = Path(plan["scan_root"])
    if not plan.get("ok_to_apply"):
        if execute:
            raise HelperError("plan is not ok_to_apply", 1)
        return {
            "kind": KIND_APPLY,
            "plan_id": plan.get("plan_id"),
            "dry_run": not execute,
            "executed": False,
            "completed": [],
            "failed": None,
            "undo_path": None,
        }
    if execute and undo_output is None:
        if plan_path is None:
            raise HelperError("apply --execute requires --undo-output when the plan is not a file", 2)
        undo_output = plan_path.with_name(plan_path.stem + ".undo.json")

    completed: list[dict[str, Any]] = []
    undo_entries: list[dict[str, Any]] = []
    failed = None
    for item in plan.get("items") or []:
        source = Path(item["source"])
        dest = destination_path(item)
        target_dir = Path(item["target_dir"])
        if not is_inside(scan_root, dest) and dest.parent.resolve() != scan_root.resolve():
            try:
                dest.resolve().relative_to(scan_root.resolve())
            except ValueError:
                failed = {"source": item["source"], "reason": "destination escapes the scan root"}
                break
        if is_symlink(source):
            failed = {"source": item["source"], "reason": "source is a symlink"}
            break
        if not source.exists():
            failed = {"source": item["source"], "reason": "source is missing"}
            break
        size, mtime_ns = lstat_identity(source)
        if size != int(item["source_size"]) or mtime_ns != int(str(item["source_mtime_ns"])):
            failed = {"source": item["source"], "reason": "source size or mtime drifted"}
            break
        same_path = False
        if dest.exists():
            try:
                same_path = dest.resolve() == source.resolve()
            except OSError:
                same_path = False
            if not same_path:
                failed = {"source": item["source"], "reason": "destination already exists"}
                break
        record = {
            "source": posix_path(source),
            "destination": posix_path(dest),
            "size": size,
            "mtime_ns": str(mtime_ns),
        }
        if execute and not same_path:
            target_dir.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(dest))
            undo_entries.append(
                {
                    "source": posix_path(source),
                    "destination": posix_path(dest),
                    "size": size,
                    "mtime_ns": str(mtime_ns),
                }
            )
        completed.append(record)
        if failed:
            break

    undo_path = None
    if execute and undo_output is not None and undo_entries:
        undo_payload = {
            "kind": KIND_UNDO,
            "plan_id": plan.get("plan_id"),
            "created_at": utc_now(),
            "entries": undo_entries,
        }
        undo_output.write_text(
            json.dumps(undo_payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        undo_path = posix_path(undo_output)

    if failed and execute:
        raise_after = {
            "kind": KIND_APPLY,
            "plan_id": plan.get("plan_id"),
            "dry_run": False,
            "executed": True,
            "completed": completed,
            "failed": failed,
            "undo_path": undo_path,
        }
        emit_json(raise_after, None)
        raise HelperError(failed["reason"], 1)

    return {
        "kind": KIND_APPLY,
        "plan_id": plan.get("plan_id"),
        "dry_run": not execute,
        "executed": execute,
        "completed": completed,
        "failed": failed,
        "undo_path": undo_path,
    }


def undo_plan(payload: dict[str, Any], execute: bool) -> dict[str, Any]:
    if payload.get("kind") != KIND_UNDO:
        raise HelperError("undo JSON kind must be file-sorter.undo", 2)
    completed: list[dict[str, Any]] = []
    failed = None
    for item in payload.get("entries") or []:
        source = Path(item["source"])
        destination = Path(item["destination"])
        if not destination.exists():
            failed = {"source": item["source"], "reason": "undo destination is missing"}
            break
        if source.exists():
            failed = {"source": item["source"], "reason": "undo source already exists"}
            break
        size, _mtime = lstat_identity(destination)
        if size != int(str(item["size"])):
            failed = {"source": item["source"], "reason": "undo destination size drifted"}
            break
        if execute:
            source.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(destination), str(source))
        completed.append(
            {
                "source": posix_path(destination),
                "destination": posix_path(source),
                "size": size,
            }
        )
    if failed and execute:
        emit_json(
            {
                "kind": KIND_UNDO_RESULT,
                "plan_id": payload.get("plan_id"),
                "dry_run": False,
                "executed": True,
                "completed": completed,
                "failed": failed,
            },
            None,
        )
        raise HelperError(failed["reason"], 1)
    return {
        "kind": KIND_UNDO_RESULT,
        "plan_id": payload.get("plan_id"),
        "dry_run": not execute,
        "executed": execute,
        "completed": completed,
        "failed": failed,
    }


def resolve_execute(args: argparse.Namespace) -> bool:
    dry = bool(getattr(args, "dry_run", False))
    execute = bool(getattr(args, "execute", False))
    if dry and execute:
        raise HelperError("--dry-run and --execute cannot be combined", 2)
    return execute


def cmd_scan(args: argparse.Namespace) -> int:
    root = require_absolute_dir(args.root)
    payload = scan_root(root, bool(args.recursive), bool(args.include_hidden))
    emit_json(payload, Path(args.output) if args.output else None)
    return 0


def cmd_assemble(args: argparse.Namespace) -> int:
    scan = load_json(Path(args.scan))
    proposals = parse_proposals(load_json(Path(args.proposals)))
    whitelist = load_whitelist(load_json(Path(args.whitelist))) if args.whitelist else None
    payload = assemble_plan(
        scan,
        proposals,
        args.mode,
        args.operation,
        whitelist,
        use_subcategory=not args.no_subcategory,
    )
    emit_json(payload, Path(args.output) if args.output else None)
    return 0


def cmd_apply(args: argparse.Namespace) -> int:
    plan_path = Path(args.plan)
    plan = load_json(plan_path)
    execute = resolve_execute(args)
    undo_output = Path(args.undo_output) if args.undo_output else None
    payload = apply_plan(plan, execute, undo_output, plan_path)
    emit_json(payload, Path(args.output) if args.output else None)
    if payload.get("failed") and execute:
        return 1
    return 0


def cmd_undo(args: argparse.Namespace) -> int:
    payload_in = load_json(Path(args.undo))
    execute = resolve_execute(args)
    payload = undo_plan(payload_in, execute)
    emit_json(payload, Path(args.output) if args.output else None)
    if payload.get("failed") and execute:
        return 1
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="File-sorter scan, plan, apply, and undo helper")
    sub = parser.add_subparsers(dest="command", required=True)

    scan = sub.add_parser("scan")
    scan.add_argument("--root", required=True)
    scan.add_argument("--recursive", action="store_true")
    scan.add_argument("--include-hidden", action="store_true")
    scan.add_argument("--output")
    scan.set_defaults(func=cmd_scan)

    assemble = sub.add_parser("assemble-plan")
    assemble.add_argument("--scan", required=True)
    assemble.add_argument("--proposals", required=True)
    assemble.add_argument("--mode", choices=("more-consistent", "more-refined"), default="more-consistent")
    assemble.add_argument(
        "--operation",
        choices=("categorize", "rename", "categorize-and-rename"),
        default="categorize",
    )
    assemble.add_argument("--whitelist")
    assemble.add_argument("--no-subcategory", action="store_true")
    assemble.add_argument("--output")
    assemble.set_defaults(func=cmd_assemble)

    apply_cmd = sub.add_parser("apply")
    apply_cmd.add_argument("--plan", required=True)
    apply_cmd.add_argument("--dry-run", action="store_true")
    apply_cmd.add_argument("--execute", action="store_true")
    apply_cmd.add_argument("--undo-output")
    apply_cmd.add_argument("--output")
    apply_cmd.set_defaults(func=cmd_apply)

    undo_cmd = sub.add_parser("undo")
    undo_cmd.add_argument("--undo", required=True)
    undo_cmd.add_argument("--dry-run", action="store_true")
    undo_cmd.add_argument("--execute", action="store_true")
    undo_cmd.add_argument("--output")
    undo_cmd.set_defaults(func=cmd_undo)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except HelperError as exc:
        return fail(str(exc), exc.code)


if __name__ == "__main__":
    sys.exit(main())
