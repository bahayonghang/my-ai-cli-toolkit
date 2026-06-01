#!/usr/bin/env python3
"""Check that an AI-agent dynamic workflow artifact is complete enough to audit."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED_FILES = ("plan.md", "state.json", "orchestration.md", "final-report.md")
REQUIRED_DIRS = ("packets", "results")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workflow_dir", help="Path to .workflow/<slug>")
    args = parser.parse_args()

    workflow_dir = Path(args.workflow_dir)
    failures: list[str] = []

    if not workflow_dir.is_dir():
        failures.append(f"Missing workflow directory: {workflow_dir}")
    for name in REQUIRED_FILES:
        path = workflow_dir / name
        if not path.is_file():
            failures.append(f"Missing file: {path}")
        elif not path.read_text(encoding="utf-8").strip():
            failures.append(f"Empty file: {path}")
    for name in REQUIRED_DIRS:
        path = workflow_dir / name
        if not path.is_dir():
            failures.append(f"Missing directory: {path}")

    state_path = workflow_dir / "state.json"
    if state_path.is_file():
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            failures.append(f"Invalid JSON in {state_path}: {exc}")
        else:
            for key in ("title", "slug", "status", "approval", "packets", "verification"):
                if key not in state:
                    failures.append(f"Missing state key: {key}")

    packet_files = sorted((workflow_dir / "packets").glob("*.md")) if (workflow_dir / "packets").is_dir() else []
    result_files = sorted((workflow_dir / "results").glob("*.md")) if (workflow_dir / "results").is_dir() else []
    if not packet_files:
        failures.append("No packet files found under packets/")
    if not result_files:
        failures.append("No result files found under results/")

    if failures:
        print("Workflow verification failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Workflow verification passed: {workflow_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
