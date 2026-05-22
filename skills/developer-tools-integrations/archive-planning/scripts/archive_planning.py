#!/usr/bin/env python3
"""Archive active root planning files into a timestamped .plannings folder."""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

REQUIRED_FILES = ("task_plan.md", "findings.md", "progress.md")
PLACEHOLDER_VALUES = {
    "",
    "xxx",
    "todo",
    "tbd",
    "待填写",
    "待补充",
    "功能名",
    "项目名",
    "示例",
    "请填写",
}
INVALID_PATH_CHARS = re.compile(r"[\x00-\x1f<>:\"/\\|?*]+")
WHITESPACE = re.compile(r"\s+")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Archive task_plan.md, findings.md, and progress.md into .plannings/."
    )
    parser.add_argument(
        "feature_name",
        nargs="*",
        help="Optional feature name. Multiple tokens are joined with spaces.",
    )
    parser.add_argument(
        "--feature-name",
        dest="feature_name_option",
        help="Optional feature name override.",
    )
    return parser.parse_args()


def normalize_feature_arg(args: argparse.Namespace) -> str:
    if args.feature_name_option is not None:
        return " ".join(args.feature_name_option.split())
    return " ".join(" ".join(args.feature_name).split())


def is_placeholder(value: str) -> bool:
    stripped = value.strip().strip("`*_[]()（）【】")
    lowered = stripped.lower()
    if lowered in PLACEHOLDER_VALUES:
        return True
    if re.fullmatch(r"<[^>]*>|\{[^}]*\}", stripped):
        return True
    return any(token in stripped for token in ("待填写", "待补充", "请填写", "功能名", "项目名"))


def strip_markdown_marker(line: str) -> str:
    stripped = line.strip()
    stripped = re.sub(r"^[-*+]\s+", "", stripped)
    stripped = re.sub(r"^\d+[.)]\s+", "", stripped)
    stripped = re.sub(r"^\[[ xX]\]\s+", "", stripped)
    return stripped.strip()


def valid_content_candidate(line: str) -> str:
    stripped = line.strip()
    if not stripped:
        return ""
    if stripped.startswith("<!--"):
        return ""
    if re.fullmatch(r"[-*_]{3,}", stripped):
        return ""
    if stripped.startswith("#"):
        return ""
    candidate = strip_markdown_marker(stripped)
    if not candidate or is_placeholder(candidate):
        return ""
    return candidate


def first_section_candidate(path: Path, heading: str) -> str:
    in_section = False
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if re.fullmatch(rf"##\s+{re.escape(heading)}\s*", stripped):
            in_section = True
            continue
        if in_section and stripped.startswith("## "):
            break
        if in_section:
            candidate = valid_content_candidate(line)
            if candidate:
                return candidate
    return ""


def infer_feature_name(root: Path) -> str:
    task_plan = root / "task_plan.md"
    findings = root / "findings.md"

    first_line = task_plan.read_text(encoding="utf-8").splitlines()[0:1]
    if first_line:
        match = re.match(r"^#\s*任务计划[:：]\s*(.+?)\s*$", first_line[0].strip())
        if match:
            candidate = match.group(1).strip()
            if candidate and not is_placeholder(candidate):
                return candidate

    for path, heading in ((task_plan, "目标"), (findings, "需求")):
        candidate = first_section_candidate(path, heading)
        if candidate:
            return candidate

    return root.name


def slugify(feature_name: str, fallback: str) -> str:
    def sanitize(value: str) -> str:
        value = INVALID_PATH_CHARS.sub("", value)
        value = WHITESPACE.sub("-", value)
        return value.strip(" .-")

    slug = sanitize(feature_name)
    if not slug or is_placeholder(slug):
        slug = sanitize(fallback)
    return slug or "planning"


def unique_archive_dir(root: Path, slug: str) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive_root = root / ".plannings"
    base_name = f"{timestamp}-{slug}"
    target = archive_root / base_name
    suffix = 2
    while target.exists():
        target = archive_root / f"{base_name}-{suffix}"
        suffix += 1
    return target


def print_missing(missing: list[str]) -> None:
    print("Archive aborted: required planning files are missing.")
    print("Missing files:")
    for name in missing:
        print(f"- {name}")
    print("No archive directory was created and no files were moved.")


def print_success(root: Path, target: Path) -> None:
    rel_target = target.relative_to(root).as_posix().rstrip("/") + "/"
    print(f"Archive directory: {rel_target}")
    print("Moved files:")
    for name in REQUIRED_FILES:
        print(f"- {name}")


def main() -> int:
    args = parse_args()
    root = Path.cwd()
    missing = [name for name in REQUIRED_FILES if not (root / name).is_file()]
    if missing:
        print_missing(missing)
        return 1

    feature_name = normalize_feature_arg(args) or infer_feature_name(root)
    slug = slugify(feature_name, root.name)
    target = unique_archive_dir(root, slug)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.mkdir()

    for name in REQUIRED_FILES:
        shutil.move(str(root / name), str(target / name))

    print_success(root, target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
