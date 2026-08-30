"""Fail-closed validation for the repository-native goal-meta Skill IR."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[4]
IR_PATH = (
    REPO_ROOT
    / "skills"
    / "developer-tools-integrations"
    / "goal-meta-skill"
    / "reports"
    / "skill-ir.json"
)
WINDOWS_ABSOLUTE = re.compile(r"(?<![A-Za-z0-9])[A-Za-z]:[\\/]")
UNC_ABSOLUTE = re.compile(r"(?<![\\/])\\\\[^\\/\s]+[\\/]")
HOST_UNIX_ABSOLUTE = re.compile(r"(?<![A-Za-z0-9])/(?:Users|home|tmp|var/tmp)/")


def fail(message: str) -> None:
    print(f"skill-ir assertion failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def value_at(document: dict[str, Any], dotted_path: str) -> Any:
    value: Any = document
    for segment in dotted_path.split("."):
        if not isinstance(value, dict) or segment not in value:
            fail(f"missing field: {dotted_path}")
        value = value[segment]
    return value


def require_equal(document: dict[str, Any], dotted_path: str, expected: Any) -> None:
    actual = value_at(document, dotted_path)
    if actual != expected:
        fail(f"{dotted_path} must equal {expected!r}, got {actual!r}")


def require_non_empty(document: dict[str, Any], dotted_path: str) -> None:
    value = value_at(document, dotted_path)
    if value is None or isinstance(value, bool):
        fail(f"{dotted_path} must be a non-empty string, list, or object")
    if not isinstance(value, (str, list, dict)) or not value:
        fail(f"{dotted_path} must be non-empty")


def walk_strings(value: Any, path: str = "$") -> list[tuple[str, str]]:
    if isinstance(value, str):
        return [(path, value)]
    if isinstance(value, list):
        strings: list[tuple[str, str]] = []
        for index, item in enumerate(value):
            strings.extend(walk_strings(item, f"{path}[{index}]"))
        return strings
    if isinstance(value, dict):
        strings = []
        for key, item in value.items():
            strings.extend(walk_strings(item, f"{path}.{key}"))
        return strings
    return []


def main() -> None:
    try:
        document = json.loads(IR_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        fail(f"cannot parse {IR_PATH.relative_to(REPO_ROOT)}: {error}")

    if not isinstance(document, dict):
        fail("root must be a JSON object")

    require_equal(document, "package.name", "goal-meta-skill")
    require_equal(document, "package.version", "0.8.0")
    require_non_empty(document, "package.owner")
    require_equal(document, "package.maturity_tier", "governed")
    require_equal(document, "package.lifecycle_stage", "governed")

    for field in ("intent.inputs", "intent.outputs", "intent.exclusions"):
        require_non_empty(document, field)
    for field in (
        "triggers.should_trigger",
        "triggers.should_not_trigger",
        "triggers.near_neighbor",
    ):
        require_non_empty(document, field)
    for field in (
        "workflow.router_rules",
        "workflow.compact_workflow",
        "workflow.gate_ladder",
        "workflow.output_contract",
    ):
        require_non_empty(document, field)
    for field in (
        "portability.permissions",
        "portability.trust",
        "portability.degradation",
        "gates",
        "evidence_boundary",
    ):
        require_non_empty(document, field)

    evidence_claim = value_at(document, "evidence_boundary.generated_reports_are_evidence")
    if not isinstance(evidence_claim, str) or "deterministic local gate" not in evidence_claim:
        fail(
            "evidence_boundary.generated_reports_are_evidence must limit evidence "
            "to the deterministic local gate recorded"
        )
    require_equal(document, "evidence_boundary.planned_work_is_evidence", False)

    for field_path, text in walk_strings(document):
        if (
            WINDOWS_ABSOLUTE.search(text)
            or UNC_ABSOLUTE.search(text)
            or HOST_UNIX_ABSOLUTE.search(text)
        ):
            fail(f"host absolute path found at {field_path}: {text!r}")

    print(
        json.dumps(
            {
                "result": "PASS",
                "ir": str(IR_PATH.relative_to(REPO_ROOT)).replace("\\", "/"),
                "version": value_at(document, "package.version"),
                "maturity": value_at(document, "package.maturity_tier"),
                "trigger_groups": len(value_at(document, "triggers")),
                "workflow_groups": len(value_at(document, "workflow")),
                "gate_count": len(value_at(document, "gates")),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
