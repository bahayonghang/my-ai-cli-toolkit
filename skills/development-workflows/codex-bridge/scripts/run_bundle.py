#!/usr/bin/env python3
"""Run a validated codex-bridge bundle without shell command construction."""

from __future__ import annotations

import argparse
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

from bundle_common import SCENARIO_SANDBOX, configure_stdio, read_json_object, write_json_atomic


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Execute a codex-bridge bundle.")
    parser.add_argument("bundle", help="bundle directory")
    parser.add_argument("--dry-run", action="store_true", help="print argv without executing or changing files")
    parser.add_argument("--timeout", type=float, help="maximum execution time in seconds")
    parser.add_argument(
        "--output-schema",
        action="store_true",
        help="pass response.schema.json to codex exec (disabled by default for proxy compatibility)",
    )
    return parser.parse_args(argv)


def display_command(argv: list[str]) -> str:
    return subprocess.list2cmdline(argv) if os.name == "nt" else shlex.join(argv)


def resolve_codex_command() -> str | None:
    return shutil.which("codex")


def load_execution_contract(bundle: Path) -> tuple[dict[str, object], Path] | None:
    manifest_path = bundle / "manifest.json"
    try:
        manifest = read_json_object(manifest_path)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return None

    for field in ("model", "reasoning_effort", "sandbox"):
        value = manifest.get(field)
        if not isinstance(value, str) or not value.strip():
            print(f"ERROR: manifest.{field} must be a non-empty string", file=sys.stderr)
            return None

    scenario = manifest.get("scenario")
    if not isinstance(scenario, str) or scenario not in SCENARIO_SANDBOX:
        print(f"ERROR: manifest.scenario is unsupported: {scenario!r}", file=sys.stderr)
        return None
    expected_sandbox = SCENARIO_SANDBOX[scenario]
    if manifest.get("sandbox") != expected_sandbox:
        print(
            f"ERROR: manifest.sandbox must be {expected_sandbox!r} for scenario {scenario!r}",
            file=sys.stderr,
        )
        return None

    raw_project_root = manifest.get("project_root")
    project_root = (
        Path(raw_project_root).expanduser().resolve()
        if isinstance(raw_project_root, str) and raw_project_root.strip()
        else bundle.parent.parent.resolve()
    )
    if not project_root.is_dir():
        print(f"ERROR: project root is not a directory: {project_root}", file=sys.stderr)
        return None
    return manifest, project_root


def run_bundle(args: argparse.Namespace) -> int:
    if args.timeout is not None and args.timeout <= 0:
        print("ERROR: --timeout must be greater than zero", file=sys.stderr)
        return 1

    bundle = Path(args.bundle).expanduser().resolve()
    if not bundle.is_dir():
        print(f"ERROR: bundle directory does not exist: {bundle}", file=sys.stderr)
        return 1
    request_path = bundle / "request.md"
    schema_path = bundle / "response.schema.json"
    if not request_path.is_file():
        print(f"ERROR: request.md does not exist: {request_path}", file=sys.stderr)
        return 1
    if args.output_schema and not schema_path.is_file():
        print(f"ERROR: response.schema.json does not exist: {schema_path}", file=sys.stderr)
        return 1

    contract = load_execution_contract(bundle)
    if contract is None:
        return 1
    manifest, project_root = contract

    executable = resolve_codex_command()
    command_name = executable or "codex"
    response_path = bundle / "response.json"
    argv = [
        command_name,
        "exec",
        "--cd",
        str(project_root),
        "--model",
        str(manifest["model"]),
        "-c",
        f'model_reasoning_effort="{manifest["reasoning_effort"]}"',
        "--sandbox",
        str(manifest["sandbox"]),
        "--skip-git-repo-check",
        "-o",
        str(response_path),
    ]
    if args.output_schema:
        argv.extend(["--output-schema", str(schema_path)])

    if args.dry_run:
        print(display_command(argv))
        return 0
    if response_path.exists():
        print(f"ERROR: response.json already exists; create a fresh round: {response_path}", file=sys.stderr)
        return 1

    exit_code = 127
    if executable is None:
        print("ERROR: codex executable was not found on PATH", file=sys.stderr)
    else:
        try:
            with request_path.open("rb") as request_file:
                completed = subprocess.run(
                    argv,
                    cwd=project_root,
                    stdin=request_file,
                    shell=False,
                    timeout=args.timeout,
                    check=False,
                )
            exit_code = completed.returncode
        except subprocess.TimeoutExpired:
            exit_code = 124
            print("ERROR: codex execution timed out", file=sys.stderr)
        except KeyboardInterrupt:
            exit_code = 130
            print("ERROR: codex execution interrupted", file=sys.stderr)
        except OSError as exc:
            exit_code = 127
            print(f"ERROR: cannot execute codex: {exc}", file=sys.stderr)

    manifest["codex_command"] = argv
    manifest["codex_exit_code"] = exit_code
    manifest["status"] = "completed" if exit_code == 0 else "failed"
    try:
        write_json_atomic(bundle / "manifest.json", manifest)
    except OSError as exc:
        print(f"ERROR: cannot update manifest atomically: {exc}", file=sys.stderr)
        return 1
    return exit_code if 0 <= exit_code <= 255 else 1


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    return run_bundle(parse_args(argv))


if __name__ == "__main__":
    raise SystemExit(main())
