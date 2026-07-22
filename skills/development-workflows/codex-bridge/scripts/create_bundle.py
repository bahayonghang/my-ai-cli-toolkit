#!/usr/bin/env python3
"""Create a cross-platform codex-bridge round bundle."""

from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from bundle_common import (
    SCENARIOS,
    SCENARIO_SANDBOX,
    configure_stdio,
    is_positive_int,
    read_json_object,
    write_json_atomic,
)


class UsageParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        self.print_usage(sys.stderr)
        self.exit(1, f"error: {message}\n")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = UsageParser(description="Create a codex-bridge round bundle.")
    parser.add_argument("scenario", help="plan-review, codify, review-iteration, or verification-round")
    parser.add_argument("project_root", nargs="?", default=".", help="project root (default: current directory)")
    parser.add_argument("round", nargs="?", help="positive round number (default: first available)")
    parser.add_argument("--model", help="one-run model override")
    parser.add_argument("--effort", help="one-run reasoning-effort override")
    parser.add_argument("--skill-root", help="explicit codex-bridge skill directory")
    return parser.parse_args(argv)


def find_skill_root(explicit: str | None, project_root: Path) -> Path | None:
    candidates = []
    if explicit:
        candidates.append(Path(explicit).expanduser())
    candidates.extend(
        [
            Path(__file__).resolve().parent.parent,
            Path.home() / ".claude" / "skills" / "codex-bridge",
            project_root / "codex-bridge",
        ]
    )
    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if (resolved / "SKILL.md").is_file():
            return resolved
    return None


def load_model_settings(skill_root: Path, project_root: Path, scenario: str) -> dict[str, str]:
    built_in_path = skill_root / "models.json"
    built_in = read_json_object(built_in_path)
    defaults = built_in.get("defaults", {})
    scenarios = built_in.get("scenarios", {})
    if not isinstance(defaults, dict) or not isinstance(scenarios, dict):
        raise ValueError(f"defaults and scenarios must be objects: {built_in_path}")
    scenario_config = scenarios.get(scenario)
    if not isinstance(scenario_config, dict):
        raise ValueError(f"models.json has no object config for scenario: {scenario}")

    model = scenario_config.get("model", defaults.get("model"))
    effort = scenario_config.get("reasoning_effort", defaults.get("reasoning_effort"))
    if not isinstance(model, str) or not model.strip():
        raise ValueError(f"models.json must provide a non-empty model for {scenario}")
    if not isinstance(effort, str) or not effort.strip():
        raise ValueError(f"models.json must provide a non-empty reasoning_effort for {scenario}")

    settings = {"model": model.strip(), "reasoning_effort": effort.strip()}
    project_config_path = project_root / "codex-bridge.models.json"
    if project_config_path.exists():
        project_config = read_json_object(project_config_path)
        allowed = {"model", "reasoning_effort"}
        for key in sorted(set(project_config) - allowed):
            print(f"[WARN] Ignoring unsupported project config key: {key}", file=sys.stderr)
        for key in allowed:
            if key not in project_config:
                continue
            value = project_config[key]
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{project_config_path}: {key} must be a non-empty string")
            settings[key] = value.strip()
    return settings


def resolve_round(project_root: Path, raw_round: str | None) -> int:
    if raw_round is not None:
        try:
            value = int(raw_round)
        except ValueError as exc:
            raise ValueError(f"round must be a positive integer (got {raw_round!r})") from exc
        if not is_positive_int(value) or str(value) != raw_round:
            raise ValueError(f"round must be a positive integer (got {raw_round!r})")
        return value

    value = 1
    while (project_root / ".codex-bridge" / f"round-{value}").is_dir():
        value += 1
    return value


def create_bundle(args: argparse.Namespace) -> int:
    scenario = args.scenario
    if scenario not in SCENARIOS:
        print(
            f"ERROR: scenario must be one of {', '.join(SCENARIOS)} (got {scenario!r})",
            file=sys.stderr,
        )
        return 2

    try:
        project_root = Path(args.project_root).expanduser().resolve(strict=True)
    except OSError as exc:
        print(f"ERROR: project root is unavailable: {exc}", file=sys.stderr)
        return 1
    if not project_root.is_dir():
        print(f"ERROR: project root is not a directory: {project_root}", file=sys.stderr)
        return 1

    skill_root = find_skill_root(args.skill_root, project_root)
    if skill_root is None:
        print("ERROR: cannot find a codex-bridge skill root containing SKILL.md", file=sys.stderr)
        return 4

    try:
        round_number = resolve_round(project_root, args.round)
        model_settings = load_model_settings(skill_root, project_root, scenario)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if args.model is not None:
        if not args.model.strip():
            print("ERROR: --model must be a non-empty string", file=sys.stderr)
            return 1
        model_settings["model"] = args.model.strip()
    if args.effort is not None:
        if not args.effort.strip():
            print("ERROR: --effort must be a non-empty string", file=sys.stderr)
            return 1
        model_settings["reasoning_effort"] = args.effort.strip()

    template_dir = skill_root / "templates" / scenario
    schema_source = template_dir / "response.schema.json"
    request_source = template_dir / "request.md"
    if not schema_source.is_file() or not request_source.is_file():
        print(f"ERROR: scenario templates are incomplete: {template_dir}", file=sys.stderr)
        return 4

    bundle = project_root / ".codex-bridge" / f"round-{round_number}"
    if bundle.exists():
        print(f"ERROR: bundle directory already exists: {bundle}", file=sys.stderr)
        return 3

    manifest: dict[str, Any] = {
        "round": round_number,
        "max_rounds": 2 if scenario == "review-iteration" else 1,
        "scenario": scenario,
        "status": "pending",
        "claude_session_jsonl": None,
        "previous_rounds": [],
        "created_at": datetime.now().astimezone().isoformat(),
        "bundle_dir": str(bundle.resolve()),
        "project_root": str(project_root),
        "model": model_settings["model"],
        "reasoning_effort": model_settings["reasoning_effort"],
        "sandbox": SCENARIO_SANDBOX[scenario],
        "codex_command": None,
        "codex_exit_code": None,
    }

    try:
        (bundle / "files").mkdir(parents=True)
        shutil.copy2(schema_source, bundle / "response.schema.json")
        shutil.copy2(request_source, bundle / "request.md")
        write_json_atomic(bundle / "manifest.json", manifest)
    except OSError as exc:
        shutil.rmtree(bundle, ignore_errors=True)
        print(f"ERROR: failed to create bundle: {exc}", file=sys.stderr)
        return 1

    print(f"[OK] Created {scenario} bundle round {round_number}", file=sys.stderr)
    print(f"[OK] Model: {manifest['model']} ({manifest['reasoning_effort']})", file=sys.stderr)
    print(f"[OK] Sandbox: {manifest['sandbox']}", file=sys.stderr)
    print("TODO: fill request.md, conversation.md, and files/, then run validate_bundle.py", file=sys.stderr)
    print("TODO: execute the validated bundle with run_bundle.py", file=sys.stderr)
    print(str(bundle.resolve()))
    return 0


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    return create_bundle(parse_args(argv))


if __name__ == "__main__":
    raise SystemExit(main())
