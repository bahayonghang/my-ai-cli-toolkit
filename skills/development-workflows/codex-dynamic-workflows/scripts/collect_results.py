#!/usr/bin/env python3
"""Summarize workflow packet result files into an integration checklist."""

from __future__ import annotations

import argparse
from pathlib import Path


MARKERS = (
    "Accepted",
    "Rejected",
    "Conflict",
    "Decision",
    "Risk",
    "Verification",
    "TODO",
)


def heading_for(path: Path) -> str:
    return path.stem.replace("-", " ").replace("_", " ").title()


def interesting_lines(text: str) -> list[str]:
    lines: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        lowered = stripped.lower()
        if stripped.startswith(("-", "*", "#")) or any(marker.lower() in lowered for marker in MARKERS):
            lines.append(stripped)
    return lines[:40]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workflow_dir", help="Path to .workflow/<slug>")
    parser.add_argument(
        "--output",
        help="Optional output Markdown path (default: print to stdout)",
    )
    args = parser.parse_args()

    workflow_dir = Path(args.workflow_dir)
    results_dir = workflow_dir / "results"
    if not results_dir.is_dir():
        raise SystemExit(f"Missing results directory: {results_dir}")

    files = sorted(results_dir.glob("*.md"))
    lines = [f"# Integration Checklist: {workflow_dir.name}", ""]
    if not files:
        lines.extend(["No result files found.", ""])
    for file in files:
        text = file.read_text(encoding="utf-8")
        lines.extend([f"## {heading_for(file)}", ""])
        snippets = interesting_lines(text)
        if snippets:
            lines.extend(snippets)
        else:
            lines.append("No checklist-like lines found; inspect this result manually.")
        lines.append("")

    lines.extend(
        [
            "## Integration Decisions",
            "",
            "Accepted:",
            "",
            "Rejected:",
            "",
            "Conflicts:",
            "",
            "Remaining risks:",
            "",
            "Verification still needed:",
            "",
        ]
    )
    output = "\n".join(lines)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
