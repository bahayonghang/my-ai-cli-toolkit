#!/usr/bin/env python3
"""Helpers for researcher profiles and reusable workbench artifacts."""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import shutil
import sys
from datetime import datetime, timezone
from typing import Any


ARTIFACT_VERSION = "1.0"
SUPPORTED_ARTIFACT_TYPES = {
    "researcher-profile",
    "paper-deep-read",
    "literature-synthesis",
    "review-outline",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def slugify(value: str) -> str:
    words = re.findall(r"[a-z0-9]+", value.lower())
    if not words:
        return "artifact"
    return "-".join(words[:6])


def read_json(path: pathlib.Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: pathlib.Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_researcher_profile(
    *,
    research_field: str | None = None,
    core_question: str | None = None,
    thesis: str | None = None,
    target_tier: str | None = None,
    stage: str | None = None,
) -> dict[str, Any]:
    timestamp = now_iso()
    return {
        "artifact_type": "researcher-profile",
        "version": ARTIFACT_VERSION,
        "created_at": timestamp,
        "updated_at": timestamp,
        "research_field": research_field,
        "core_question": core_question,
        "thesis": thesis,
        "target_tier": target_tier,
        "stage": stage,
    }


def update_researcher_profile(path: pathlib.Path, updates: dict[str, Any]) -> dict[str, Any]:
    if path.exists():
        payload = read_json(path)
    else:
        payload = build_researcher_profile()
        payload["created_at"] = now_iso()

    if payload.get("artifact_type") != "researcher-profile":
        raise ValueError(f"Profile file does not contain a researcher-profile artifact: {path}")

    for key, value in updates.items():
        if value is not None:
            payload[key] = value
    payload["updated_at"] = now_iso()
    return payload


def build_artifact(
    *,
    artifact_type: str,
    title: str,
    payload: dict[str, Any],
    profile_path: str | None = None,
    source_records: list[str] | None = None,
) -> dict[str, Any]:
    if artifact_type not in SUPPORTED_ARTIFACT_TYPES - {"researcher-profile"}:
        raise ValueError(f"Unsupported artifact type: {artifact_type}")

    timestamp = now_iso()
    return {
        "artifact_type": artifact_type,
        "version": ARTIFACT_VERSION,
        "created_at": timestamp,
        "updated_at": timestamp,
        "title": title,
        "profile_path": profile_path,
        "source_records": source_records or [],
        "payload": payload,
    }


def artifact_directory_name(artifact_type: str) -> str:
    return artifact_type.replace("-", "_")


def resolve_artifact_path(workspace: pathlib.Path, artifact_type: str, title: str) -> pathlib.Path:
    if artifact_type not in SUPPORTED_ARTIFACT_TYPES - {"researcher-profile"}:
        raise ValueError(f"Unsupported artifact type: {artifact_type}")
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    base_name = f"{timestamp}--{artifact_type}--{slugify(title)}.json"
    return workspace / artifact_directory_name(artifact_type) / base_name


def read_payload_file(path: str | None) -> dict[str, Any]:
    if path is None or path == "-":
        return json.load(sys.stdin)
    payload_path = pathlib.Path(path).expanduser()
    return read_json(payload_path)


def save_sidecar(artifact_path: pathlib.Path, sidecar_file: str | None, sidecar_ext: str | None) -> pathlib.Path | None:
    if not sidecar_file:
        return None

    extension = sidecar_ext or pathlib.Path(sidecar_file).suffix.lstrip(".") or "md"
    sidecar_path = artifact_path.with_suffix(f".{extension}")
    source_path = pathlib.Path(sidecar_file).expanduser()
    sidecar_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source_path, sidecar_path)
    return sidecar_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    profile_parser = subparsers.add_parser("init-profile")
    profile_parser.add_argument("--path", required=True)
    profile_parser.add_argument("--research-field")
    profile_parser.add_argument("--core-question")
    profile_parser.add_argument("--thesis")
    profile_parser.add_argument("--target-tier")
    profile_parser.add_argument("--stage")

    show_profile_parser = subparsers.add_parser("show-profile")
    show_profile_parser.add_argument("--path", required=True)

    resolve_parser = subparsers.add_parser("resolve-artifact")
    resolve_parser.add_argument("--workspace", required=True)
    resolve_parser.add_argument("--artifact-type", required=True)
    resolve_parser.add_argument("--title", required=True)

    save_parser = subparsers.add_parser("save-artifact")
    save_parser.add_argument("--workspace", required=True)
    save_parser.add_argument("--artifact-type", required=True)
    save_parser.add_argument("--title", required=True)
    save_parser.add_argument("--profile-path")
    save_parser.add_argument("--payload-file", default="-")
    save_parser.add_argument("--sidecar-file")
    save_parser.add_argument("--sidecar-ext")
    save_parser.add_argument("--source-record", action="append", default=[])

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "init-profile":
            profile_path = pathlib.Path(args.path).expanduser()
            payload = update_researcher_profile(
                profile_path,
                {
                    "research_field": args.research_field,
                    "core_question": args.core_question,
                    "thesis": args.thesis,
                    "target_tier": args.target_tier,
                    "stage": args.stage,
                },
            )
            write_json(profile_path, payload)
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            return 0

        if args.command == "show-profile":
            profile_path = pathlib.Path(args.path).expanduser()
            payload = read_json(profile_path)
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            return 0

        if args.command == "resolve-artifact":
            workspace = pathlib.Path(args.workspace).expanduser()
            print(resolve_artifact_path(workspace, args.artifact_type, args.title))
            return 0

        if args.command == "save-artifact":
            workspace = pathlib.Path(args.workspace).expanduser()
            artifact_path = resolve_artifact_path(workspace, args.artifact_type, args.title)
            artifact = build_artifact(
                artifact_type=args.artifact_type,
                title=args.title,
                payload=read_payload_file(args.payload_file),
                profile_path=args.profile_path,
                source_records=args.source_record,
            )
            write_json(artifact_path, artifact)
            sidecar_path = save_sidecar(artifact_path, args.sidecar_file, args.sidecar_ext)
            response = {
                "artifact_path": str(artifact_path),
                "sidecar_path": str(sidecar_path) if sidecar_path else None,
                "artifact": artifact,
            }
            print(json.dumps(response, ensure_ascii=False, indent=2))
            return 0
    except Exception as exc:  # pragma: no cover - CLI error path
        print(str(exc), file=sys.stderr)
        return 1

    print(f"Unknown command: {args.command}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
