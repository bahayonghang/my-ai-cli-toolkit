"""Replay the proof desk's public measurement command against temporary editions."""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


FIXTURE = Path(__file__).resolve().parents[4] / "skills/development-workflows/design-atlas/tests/fixtures/task-aware/colour"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--channel", default="chromium")
    args = parser.parse_args()
    cases = (
        ("clear", "", ""),
        ("wrong third pass", ".passes li:last-child { background: var(--iris); }", "legend colours"),
        ("invisible focus", "input:focus-visible, label:has(input:focus-visible) { outline: none; }",
         "focus indicator"),
        ("focus via shadow", "input:focus-visible, label:has(input:focus-visible) { outline: none; }"
         "label:has(input:focus-visible) { box-shadow: 0 0 0 3px var(--paper); }", ""),
    )
    errors = []
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        project = root / "project"
        shutil.copytree(FIXTURE / "project", project)
        control = (FIXTURE / "control.css").read_text(encoding="utf-8")
        for case, change, expected in cases:
            (project / "edition.css").write_text(control + "\n" + change, encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(FIXTURE / "measure_proof.py"), str(project),
                 str(root / "captures"), "--channel", args.channel, "--check-clear"],
                capture_output=True, text=True, encoding="utf-8",
            )
            report = json.loads(result.stdout)
            widths = [state["width"] for state in report["viewports"]]
            print(f"{case}: Edge/Chromium {report['engine']}, {widths}, exit {result.returncode}")
            print("Visible focus pixels:", [state["focusIndicator"]["pixels_at_3_to_1"]
                                             for state in report["viewports"]])
            if widths != [1440, 390] or bool(result.returncode) != bool(expected):
                errors.append(f"{case}: unexpected viewport or exit code")
            if expected and not all(f"{width}px: " + expected in result.stderr for width in widths):
                errors.append(f"{case}: missing expected failure at one or both widths")
            if result.stderr:
                print(result.stderr.rstrip())
    if errors:
        raise SystemExit("\n".join(errors))


if __name__ == "__main__":
    main()
