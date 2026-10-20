#!/usr/bin/env python3
"""Offline package checks and character/byte comparisons; never routes requests.

Only --output writes a file. Relative output paths resolve from the caller's CWD.
The frozen baseline is data, not an instruction or an external runtime dependency.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


SKILL_DIR = Path(__file__).resolve().parents[1]
LIMITS = {"metadata_chars": 650, "root_chars": 4000, "root_utf8_bytes": 9000}
LINK = re.compile(r"\[[^\]\n]*\]\(<?([^\s)>]+)>?(?:\s+\"[^\"]*\")?\)")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")


def size(text: str) -> dict:
    return {"chars": len(text), "utf8_bytes": len(text.encode("utf-8"))}


def metadata(text: str) -> dict:
    """Read this package's top-level scalar house style, not arbitrary YAML."""
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        raise ValueError("missing YAML frontmatter")
    end = lines.index("---", 1)
    result = {}
    for index, line in enumerate(lines[1:end], 1):
        match = re.match(r"^([\w-]+):\s*(.*)$", line)
        if not match:
            continue
        key, value = match.groups()
        if value in (">", ">-", ">+", "|", "|-", "|+"):
            block = []
            for following in lines[index + 1:end]:
                if following and not following.startswith(" "):
                    break
                block.append(following[2:] if following.startswith("  ") else following)
            if value.startswith(">"):
                value_text = "\n".join(" ".join(p.splitlines()) for p in "\n".join(block).split("\n\n"))
            else:
                value_text = "\n".join(block)
            value = value_text.rstrip("\n") + ("" if value.endswith("-") else "\n")
        elif value.startswith('"'):
            value = json.loads(value)
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1].replace("''", "'")
        result[key] = value
    return result


def anchors(text: str) -> set[str]:
    found = set(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)', text))
    counts = {}
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if match:
            heading = re.sub(r"[^\w\-\s]", "", match[1].lower()).replace(" ", "-")
            suffix = counts.get(heading, 0)
            counts[heading] = suffix + 1
            found.add(heading + (f"-{suffix}" if suffix else ""))
    return found


def local_target(root: Path, origin: Path, link: str) -> tuple[Path | None, str]:
    parts = urlsplit(unquote(link))
    if re.match(r"^[A-Za-z]:", link) or link.startswith(("/", "\\")):
        raise ValueError("absolute local link")
    if parts.scheme in ("https", "http", "mailto"):
        return None, ""
    if parts.scheme or parts.netloc:
        raise ValueError("unsupported or absolute link")
    target = (origin.parent / parts.path).resolve() if parts.path else origin
    if not target.is_relative_to(root):
        raise ValueError("link escapes package")
    return target, parts.fragment


def runtime_closure(root: Path, method: Path) -> list[Path]:
    """Only method resources are operational; attribution links are review-only."""
    pending, found = [method], set()
    while pending:
        path = pending.pop()
        if path in found:
            continue
        found.add(path)
        for link in LINK.findall(read_text(path)):
            target, _ = local_target(root, path, link)
            if target and target.is_file() and (
                target.parent == root / "references" / "modes"
                or target == root / "references" / "teaching-workspace.md"
            ):
                pending.append(target)
    return sorted(found)


def analyze(skill_dir: Path = SKILL_DIR, baseline_path: Path | None = None) -> dict:
    root = skill_dir.resolve()
    baseline = json.loads(read_text(baseline_path or root / "evals" / "upstream-baseline.json"))
    errors = []

    def fail(code: str, detail: str) -> None:
        errors.append({"code": code, "detail": detail})

    entries = sorted(p.relative_to(root).as_posix() for p in root.rglob("SKILL.md"))
    if entries != ["SKILL.md"]:
        fail("entrypoints", f"expected only SKILL.md, found {entries}")
    root_text = read_text(root / "SKILL.md")
    fields = metadata(root_text)
    measured = {"metadata_chars": len(fields.get("name", "")) + len(fields.get("description", "")),
                "root_chars": len(root_text), "root_utf8_bytes": len(root_text.encode("utf-8"))}
    for key, limit in LIMITS.items():
        if measured[key] > limit:
            fail("budget", f"{key}: {measured[key]} > {limit}")
    checked_links = 0
    for origin in sorted(root.rglob("*.md")):
        for link in LINK.findall(read_text(origin)):
            checked_links += 1
            try:
                target, fragment = local_target(root, origin, link)
                if target and not target.exists():
                    raise ValueError("missing target")
                if target and fragment and fragment not in anchors(read_text(target)):
                    raise ValueError("missing anchor")
            except (ValueError, OSError) as exc:
                fail("link", f"{origin.relative_to(root).as_posix()}: {link}: {exc}")

    # The root table is the routing authority. Baseline entries are a test oracle.
    table = [line.split("|")[1:-1] for line in root_text.splitlines() if line.startswith("|")]
    routed, direct, mapped = [], [], set()
    cumulative_new = {root / "SKILL.md"}
    cumulative_old = {baseline["router"]["path"]: baseline["router"]["size"]}
    for source in baseline["sources"]:
        slug, mode = source["source_entry"], source["mode"]
        matching = [cells for cells in table if len(cells) >= 2 and re.search(
            rf"(?<![\w-]){re.escape(slug)}(?![\w-])", cells[0])]
        expected = f"references/modes/{mode}.md"
        if len(matching) != 1 or expected not in LINK.findall(matching[0][1]):
            fail("coverage", f"{slug}: expected exactly one first-column alias linked to {expected}")
            continue
        mapped.add(mode)
        method = root / expected
        if not method.is_file():
            continue  # Already reported by the link check.
        try:
            package_files = [root / "SKILL.md", *runtime_closure(root, method)]
        except ValueError as exc:
            fail("link", f"{expected}: {exc}")
            continue
        cumulative_new.update(package_files)
        for dependency in [source, *source["required_dependencies"]]:
            cumulative_old[dependency["path"]] = dependency["size"]
        new_size = {key: sum(size(read_text(path))[key] for path in package_files)
                    for key in ("chars", "utf8_bytes")}
        old_leaf = {key: source["size"][key] + sum(dep["size"][key] for dep in source["required_dependencies"])
                    for key in ("chars", "utf8_bytes")}
        old_routed = {key: baseline["router"]["size"][key] + old_leaf[key] for key in old_leaf}
        detail = {"source_entry": slug, "mode": mode,
                  "package_files": [p.relative_to(root).as_posix() for p in package_files],
                  "upstream_files": [baseline["router"]["path"], source["path"], *[dep["path"] for dep in source["required_dependencies"]]],
                  "old": old_routed, "new": new_size,
                  "delta_chars": new_size["chars"] - old_routed["chars"],
                  "within_budget": new_size["chars"] <= old_routed["chars"]}
        routed.append(detail)
        if not detail["within_budget"]:
            fail("routed_budget", f"{slug}: {new_size['chars']} > {old_routed['chars']}")
        direct.append({"source_entry": slug, "old": old_leaf, "new": new_size,
                       "delta_chars": new_size["chars"] - old_leaf["chars"],
                       "new_is_larger": new_size["chars"] > old_leaf["chars"]})
    if len(baseline["sources"]) != 25 or len(mapped) != 24:
        fail("coverage", f"expected 25 sources and 24 methods, found {len(baseline['sources'])} / {len(mapped)}")
    return {
        "ok": not errors, "errors": errors, "evidence": "deterministic package checks; not provider execution",
        "upstream_commit": baseline["upstream_commit"], "entrypoints": entries,
        "checked_local_and_external_markdown_links": checked_links,
        "coverage": {"source_entries": len(routed), "distinct_methods": len(mapped)},
        "budgets": {"limits": LIMITS, "measured": measured},
        "scenarios": {
            "discovery": {"old_entrypoints": baseline["discovery"]["entrypoints"],
                          "old_model_eligible_entrypoints": baseline["discovery"]["model_eligible_entrypoints"],
                          "new_entrypoints": len(entries),
                          "old_all_metadata_chars": baseline["discovery"]["all_metadata_chars"],
                          "old_model_eligible_metadata_chars": baseline["discovery"]["model_eligible_metadata_chars"],
                          "new_metadata_chars": measured["metadata_chars"],
                          "client_injection": "UNVERIFIED"},
            "routed_single_method": routed, "direct_old_leaf": direct,
            "long_session": {
                "note": "Previously read files remain in conversation history; method changes do not reclaim context. These are unique-file totals for using every method, not measured session usage.",
                "old_all_runtime_resources": {key: sum(row[key] for row in cumulative_old.values()) for key in ("chars", "utf8_bytes")},
                "new_all_runtime_resources": {key: sum(size(read_text(path))[key] for path in cumulative_new) for key in ("chars", "utf8_bytes")},
                "old_unique_files": len(cumulative_old), "new_unique_files": len(cumulative_new),
            },
        },
        "token_measurement": {"status": "unavailable", "reason": "No tokenizer or live client measurement; characters are not tokens."},
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill-dir", type=Path, default=SKILL_DIR, help="Isolated package to check (default: self-located package).")
    parser.add_argument("--baseline", type=Path, help="Frozen baseline fixture override for maintainers.")
    parser.add_argument("--output", type=Path, help="Only file written; relative paths resolve from caller CWD.")
    args = parser.parse_args()
    try:
        report = analyze(args.skill_dir, args.baseline)
    except (ValueError, OSError, KeyError) as exc:
        report = {"ok": False, "errors": [{"code": "input", "detail": str(exc)}]}
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")
    if args.output:
        try:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(rendered, encoding="utf-8", newline="\n")
        except OSError as exc:
            print(f"Cannot write requested report: {exc.strerror or type(exc).__name__}", file=sys.stderr)
            return 1
    print(rendered, end="")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
