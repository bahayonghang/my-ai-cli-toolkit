#!/usr/bin/env python3
"""Validate codex-bridge bundles before and after Codex execution."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from bundle_common import (
    SCENARIOS,
    SCENARIO_SANDBOX,
    configure_stdio,
    is_positive_int,
)


PLACEHOLDER_RE = re.compile(r"{{[A-Z_][A-Z_0-9]*}}")
PURPOSE_RE = re.compile(r"^verify round-([1-9][0-9]*) extrapolations$")
FINDING_TYPES = {"hidden_assumption", "disagreement", "risk", "validation"}
PLAN_DIMENSIONS = {"rationality", "hidden_assumptions", "conventions", "scope_control"}
VERDICTS = {"confirmed", "refuted", "partial", "unsure"}
FORBIDDEN_PATH_PARTS = {".codex-bridge", ".git", "node_modules"}


class Validator:
    def __init__(self) -> None:
        self.failures = 0
        self.warnings = 0

    def check(self, description: str, passed: bool) -> bool:
        marker = "[OK]" if passed else "[FAIL]"
        print(f"  {marker} {description}")
        if not passed:
            self.failures += 1
        return passed

    def warn(self, description: str) -> None:
        self.warnings += 1
        print(f"  [WARN] {description}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate a codex-bridge bundle.")
    parser.add_argument("bundle", help="bundle directory")
    parser.add_argument(
        "--phase",
        choices=("preflight", "post-response"),
        default="preflight",
        help="validation phase (default: preflight)",
    )
    return parser.parse_args(argv)


def load_json(path: Path, validator: Validator, label: str) -> dict[str, Any] | None:
    if not path.is_file():
        validator.check(f"{label} exists", False)
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        validator.check(f"{label} is valid JSON ({exc})", False)
        return None
    if not isinstance(payload, dict):
        validator.check(f"{label} root is an object", False)
        return None
    validator.check(f"{label} is valid JSON object", True)
    return payload


def validate_manifest(
    bundle: Path,
    manifest: dict[str, Any],
    schema: dict[str, Any] | None,
    validator: Validator,
) -> tuple[str | None, int | None, str]:
    print("\n## Manifest")
    for field in ("round", "scenario", "status", "created_at", "bundle_dir"):
        validator.check(f"manifest.{field} exists", field in manifest)

    scenario = manifest.get("scenario")
    scenario_valid = isinstance(scenario, str) and scenario in SCENARIOS
    validator.check(f"manifest.scenario is supported: {scenario!r}", scenario_valid)

    round_value = manifest.get("round")
    round_valid = is_positive_int(round_value)
    validator.check(f"manifest.round is a positive integer: {round_value!r}", round_valid)

    max_rounds = manifest.get("max_rounds", 1)
    max_rounds_valid = is_positive_int(max_rounds)
    validator.check(f"manifest.max_rounds is a positive integer: {max_rounds!r}", max_rounds_valid)

    for field in ("model", "reasoning_effort", "sandbox"):
        value = manifest.get(field)
        if not isinstance(value, str) or not value.strip():
            validator.warn(f"manifest.{field} is missing or empty; hand-built bundle compatibility only")

    if scenario_valid:
        expected_sandbox = SCENARIO_SANDBOX[scenario]
        validator.check(
            f"manifest.sandbox matches fixed scenario policy: {expected_sandbox}",
            manifest.get("sandbox") == expected_sandbox,
        )

    session_jsonl = manifest.get("claude_session_jsonl")
    if not isinstance(session_jsonl, str) or not session_jsonl.strip():
        validator.warn("manifest.claude_session_jsonl is not set")
    else:
        session_path = Path(session_jsonl).expanduser()
        if not session_path.is_absolute():
            validator.warn("manifest.claude_session_jsonl is not absolute")
        elif not session_path.is_file():
            validator.warn(f"manifest.claude_session_jsonl does not exist: {session_path}")

    previous_rounds = manifest.get("previous_rounds", [])
    previous_valid = isinstance(previous_rounds, list)
    validator.check("manifest.previous_rounds is an array", previous_valid)
    if previous_valid:
        for index, raw_path in enumerate(previous_rounds):
            path_valid = isinstance(raw_path, str) and Path(raw_path).expanduser().is_absolute()
            validator.check(f"previous_rounds[{index}] is an absolute path", path_valid)
            if path_valid:
                validator.check(
                    f"previous_rounds[{index}] directory exists",
                    Path(raw_path).expanduser().is_dir(),
                )
    previous_count = len(previous_rounds) if previous_valid else 0
    if round_valid and round_value > 1:
        validator.check("round > 1 has at least one previous_round", previous_count > 0)

    purpose = manifest.get("purpose", "")
    purpose_text = purpose if isinstance(purpose, str) else ""
    if round_valid and max_rounds_valid and round_value > max_rounds:
        allowed_override = bool(purpose_text) and scenario in {"plan-review", "verification-round"}
        validator.check("round above max_rounds has an allowed audit purpose", allowed_override)

    if schema is not None and scenario_valid:
        title = schema.get("title")
        validator.check(
            f"response schema title contains scenario {scenario}",
            isinstance(title, str) and scenario in title,
        )

    if scenario == "verification-round":
        validate_verification_round_bundle(
            bundle,
            previous_rounds if previous_valid else [],
            purpose_text,
            validator,
        )

    return scenario if scenario_valid else None, round_value if round_valid else None, purpose_text


def validate_verification_round_bundle(
    bundle: Path,
    previous_rounds: list[object],
    purpose: str,
    validator: Validator,
) -> None:
    print("\n## Verification-round contract")
    validator.check("verification-round has exactly one previous_round", len(previous_rounds) == 1)
    purpose_match = PURPOSE_RE.fullmatch(purpose)
    validator.check("verification-round purpose has the required format", purpose_match is not None)

    main_round = int(purpose_match.group(1)) if purpose_match else None
    if len(previous_rounds) == 1 and isinstance(previous_rounds[0], str):
        previous_manifest_path = Path(previous_rounds[0]).expanduser() / "manifest.json"
        if previous_manifest_path.is_file():
            try:
                previous_manifest = json.loads(previous_manifest_path.read_text(encoding="utf-8-sig"))
            except (OSError, json.JSONDecodeError):
                previous_manifest = None
            validator.check("previous round manifest is readable JSON", isinstance(previous_manifest, dict))
            if isinstance(previous_manifest, dict):
                validator.check(
                    "verification-round does not recurse",
                    previous_manifest.get("scenario") != "verification-round",
                )
                if main_round is not None:
                    validator.check(
                        "verification purpose round matches previous manifest.round",
                        previous_manifest.get("round") == main_round,
                    )

    validator.check(
        "verification files/extracted-patterns.md exists",
        (bundle / "files" / "extracted-patterns.md").is_file(),
    )
    if main_round is not None:
        validator.check(
            f"verification files/round-{main_round}-response.json exists",
            (bundle / "files" / f"round-{main_round}-response.json").is_file(),
        )


def validate_request_and_files(bundle: Path, validator: Validator) -> None:
    print("\n## Request and files")
    request_path = bundle / "request.md"
    if not request_path.is_file():
        validator.check("request.md exists", False)
    else:
        validator.check("request.md exists", True)
        try:
            request_text = request_path.read_text(encoding="utf-8-sig")
        except OSError as exc:
            validator.check(f"request.md is readable ({exc})", False)
        else:
            placeholders = sorted(set(PLACEHOLDER_RE.findall(request_text)))
            validator.check(
                "request.md has no template placeholders"
                + (f" ({', '.join(placeholders)})" if placeholders else ""),
                not placeholders,
            )

    validator.check("conversation.md exists", (bundle / "conversation.md").is_file())
    files_dir = bundle / "files"
    validator.check("files/ directory exists", files_dir.is_dir())
    file_count = len([path for path in files_dir.rglob("*") if path.is_file()]) if files_dir.is_dir() else 0
    validator.check(f"files/ contains at least one file (found {file_count})", file_count > 0)


def is_string_array(value: object) -> bool:
    return isinstance(value, list) and all(isinstance(item, str) for item in value)


def validate_standard_response(response: dict[str, Any], scenario: str, validator: Validator) -> None:
    required = {
        "task_understanding",
        "result",
        "key_findings",
        "specific_suggestions",
        "open_questions",
        "uncertainty",
    }
    if scenario in {"codify", "review-iteration"}:
        required.add("files_changed")
    for field in sorted(required):
        validator.check(f"response.{field} exists", field in response)

    validator.check("response.task_understanding is a string", isinstance(response.get("task_understanding"), str))
    validator.check("response.result is a string", isinstance(response.get("result"), str))
    validator.check("response.key_findings is an array", isinstance(response.get("key_findings"), list))
    validator.check("response.specific_suggestions is an array", isinstance(response.get("specific_suggestions"), list))
    validator.check("response.open_questions is a string array", is_string_array(response.get("open_questions")))
    validator.check("response.uncertainty is a string", isinstance(response.get("uncertainty"), str))

    findings = response.get("key_findings")
    if isinstance(findings, list):
        finding_shapes = all(
            isinstance(item, dict)
            and item.get("type") in FINDING_TYPES
            and isinstance(item.get("content"), str)
            for item in findings
        )
        validator.check("key_findings items have valid type and string content", finding_shapes)
        if scenario == "plan-review":
            dimensions = [item.get("dimension") for item in findings if isinstance(item, dict)]
            validator.check("plan-review finding dimensions are valid", all(item in PLAN_DIMENSIONS for item in dimensions))
            covered = set(dimensions) & PLAN_DIMENSIONS
            if len(covered) < len(PLAN_DIMENSIONS):
                validator.warn(f"plan-review covers {len(covered)} of {len(PLAN_DIMENSIONS)} dimensions")

    suggestions = response.get("specific_suggestions")
    if isinstance(suggestions, list):
        validator.check(
            "specific_suggestions items contain string file and reason",
            all(
                isinstance(item, dict)
                and isinstance(item.get("file"), str)
                and isinstance(item.get("reason"), str)
                for item in suggestions
            ),
        )

    if scenario in {"codify", "review-iteration"}:
        validate_files_changed(response.get("files_changed"), validator)


def validate_files_changed(value: object, validator: Validator) -> None:
    validator.check("response.files_changed is an object", isinstance(value, dict))
    if not isinstance(value, dict):
        return
    all_paths: list[str] = []
    for action in ("created", "modified", "deleted"):
        paths = value.get(action)
        valid = is_string_array(paths)
        validator.check(f"files_changed.{action} is a string array", valid)
        if not valid:
            continue
        validator.check(f"files_changed.{action} has unique entries", len(paths) == len(set(paths)))
        all_paths.extend(paths)
    forbidden = []
    for raw_path in all_paths:
        parts = {part for part in raw_path.replace("\\", "/").split("/") if part}
        if parts & FORBIDDEN_PATH_PARTS:
            forbidden.append(raw_path)
    validator.check(
        "files_changed paths exclude .codex-bridge, .git, and node_modules"
        + (f" ({', '.join(forbidden)})" if forbidden else ""),
        not forbidden,
    )


def validate_verification_response(response: dict[str, Any], validator: Validator) -> None:
    for field in ("task_understanding", "verifications", "additional_findings", "summary"):
        validator.check(f"response.{field} exists", field in response)
    validator.check("response.task_understanding is a string", isinstance(response.get("task_understanding"), str))
    validator.check("response.summary is a string", isinstance(response.get("summary"), str))
    validator.check("response.additional_findings is a string array", is_string_array(response.get("additional_findings")))
    verifications = response.get("verifications")
    validator.check("response.verifications is an array", isinstance(verifications, list))
    if isinstance(verifications, list):
        validator.check(
            "verification items have candidate_id, verdict, and reasoning",
            all(
                isinstance(item, dict)
                and isinstance(item.get("candidate_id"), str)
                and item.get("verdict") in VERDICTS
                and isinstance(item.get("reasoning"), str)
                for item in verifications
            ),
        )


def validate_response(
    bundle: Path,
    manifest: dict[str, Any],
    scenario: str | None,
    validator: Validator,
) -> None:
    print("\n## Post-response")
    validator.check("manifest.codex_exit_code is not null", manifest.get("codex_exit_code") is not None)
    validator.check("manifest.status is completed or failed", manifest.get("status") in {"completed", "failed"})
    response = load_json(bundle / "response.json", validator, "response.json")
    if response is None or scenario is None:
        return
    if scenario == "verification-round":
        validate_verification_response(response, validator)
    else:
        validate_standard_response(response, scenario, validator)
        if not (bundle / "extracted-patterns.md").is_file():
            validator.warn("extracted-patterns.md is missing; record the pattern-extraction decision")


def validate_bundle(args: argparse.Namespace) -> int:
    bundle = Path(args.bundle).expanduser().resolve()
    if not bundle.is_dir():
        print(f"ERROR: bundle directory does not exist: {bundle}", file=sys.stderr)
        return 1

    validator = Validator()
    print(f"Validating ({args.phase}): {bundle}")
    print("\n## Required JSON")
    manifest = load_json(bundle / "manifest.json", validator, "manifest.json")
    schema = load_json(bundle / "response.schema.json", validator, "response.schema.json")
    validate_request_and_files(bundle, validator)

    scenario: str | None = None
    if manifest is not None:
        scenario, _, _ = validate_manifest(bundle, manifest, schema, validator)
    if args.phase == "post-response" and manifest is not None:
        validate_response(bundle, manifest, scenario, validator)

    print()
    if validator.failures:
        print(
            f"[FAIL] {validator.failures} check(s) failed; {validator.warnings} warning(s)",
            file=sys.stderr,
        )
        return 2
    print(f"[OK] All checks passed; {validator.warnings} warning(s)")
    return 0


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    return validate_bundle(parse_args(argv))


if __name__ == "__main__":
    raise SystemExit(main())
