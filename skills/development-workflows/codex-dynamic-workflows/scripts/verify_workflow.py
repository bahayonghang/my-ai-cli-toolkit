#!/usr/bin/env python3
"""Check an AI-agent dynamic workflow artifact at structure, ready, or complete level."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


REQUIRED_FILES = ("plan.md", "state.json", "orchestration.md", "final-report.md")
REQUIRED_DIRS = ("packets", "results")
REQUIRED_STATE_KEYS = ("title", "slug", "status", "approval", "packets", "verification")


def read_state(state_path: Path, failures: list[str]) -> dict[str, Any] | None:
    if not state_path.is_file():
        return None
    try:
        state = json.loads(state_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        failures.append(f"Invalid JSON in {state_path}: {exc}")
        return None
    if not isinstance(state, dict):
        failures.append(f"Invalid JSON in {state_path}: top-level value must be an object")
        return None
    for key in REQUIRED_STATE_KEYS:
        if key not in state:
            failures.append(f"Missing state key: {key}")
    return state


def markdown_files(path: Path) -> list[Path]:
    return sorted(path.glob("*.md")) if path.is_dir() else []


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workflow_dir", help="Path to .workflow/<slug>")
    parser.add_argument(
        "--level",
        choices=("structure", "ready", "complete"),
        default="complete",
        help="Validation strictness. Default complete preserves the original strict behavior.",
    )
    args = parser.parse_args()

    workflow_dir = Path(args.workflow_dir)
    failures: list[str] = []

    if not workflow_dir.is_dir():
        failures.append(f"Missing workflow directory: {workflow_dir}")
    for name in REQUIRED_FILES:
        path = workflow_dir / name
        if not path.is_file():
            failures.append(f"Missing file: {path}")
    for name in REQUIRED_DIRS:
        path = workflow_dir / name
        if not path.is_dir():
            failures.append(f"Missing directory: {path}")

    state = read_state(workflow_dir / "state.json", failures)
    if state is not None and "packets" in state and not isinstance(state["packets"], list):
        failures.append("State key 'packets' must be a list")

    packet_files = markdown_files(workflow_dir / "packets")
    result_files = markdown_files(workflow_dir / "results")

    if args.level in ("ready", "complete") and not packet_files:
        failures.append("No packet files found under packets/")

    if args.level == "complete":
        final_report = workflow_dir / "final-report.md"
        if final_report.is_file() and not final_report.read_text(encoding="utf-8").strip():
            failures.append(f"Empty final report: {final_report}")
        if not result_files:
            failures.append("No result files found under results/")

    if failures:
        print(f"Workflow verification failed at level '{args.level}':")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Workflow verification passed at level '{args.level}': {workflow_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
