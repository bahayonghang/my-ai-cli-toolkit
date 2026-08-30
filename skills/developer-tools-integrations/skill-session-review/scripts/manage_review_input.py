#!/usr/bin/env python3
"""Create, replace, or proof-gate removal of one review JSON input."""

from __future__ import annotations

import argparse
import re
import sys

from review_contract import (
    ContractError,
    check_report_subtree_git,
    decode_review_json,
    derive_input_path,
    derive_report_path,
    emit_error,
    emit_json,
    git_visibility,
    governed_remove,
    governed_write,
    resolve_repo_root,
    validate_fixed_path,
    validate_name,
    validate_review,
)


SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REQUIRED_FORMATS = ("markdown", "html")


class _Parser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        del message
        emit_error("invalid-arguments")
        raise SystemExit(2)


def _add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--name", required=True)


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(description="Manage one validated skill-session-review input.")
    commands = parser.add_subparsers(dest="command", required=True, parser_class=_Parser)

    create = commands.add_parser("create")
    _add_common(create)

    replace = commands.add_parser("replace")
    _add_common(replace)
    replace.add_argument("--expected-sha256", required=True)

    remove = commands.add_parser("remove")
    _add_common(remove)
    remove.add_argument("--expected-sha256", required=True)
    remove.add_argument("--artifact-sha256", action="append", default=[])
    return parser


def _validate_hash(value: str, *, code: int, category: str) -> str:
    if not SHA256_RE.fullmatch(value):
        raise ContractError("invalid SHA-256", code, category)
    return value


def _parse_artifact_proofs(values: list[str]) -> dict[str, str]:
    proofs: dict[str, str] = {}
    for value in values:
        if "=" not in value:
            raise ContractError("invalid artifact proof", 8, "artifact-proof-invalid")
        format_name, digest = value.split("=", 1)
        if format_name not in REQUIRED_FORMATS or format_name in proofs:
            raise ContractError("invalid artifact proof", 8, "artifact-proof-invalid")
        proofs[format_name] = _validate_hash(
            digest, code=8, category="artifact-proof-invalid"
        )
    if set(proofs) != set(REQUIRED_FORMATS):
        raise ContractError("artifact proof is incomplete", 8, "artifact-proof-incomplete")
    return proofs


def _validate_input_bytes(raw: bytes, name: str) -> None:
    normalized, review = decode_review_json(raw)
    validate_review(review, name)
    if normalized != raw:
        raise ContractError("persisted input is not normalized", 6, "input-not-normalized")


def _write_input(args: argparse.Namespace, repo_root, name: str, input_path) -> int:
    git_state = check_report_subtree_git(repo_root, input_path)
    raw = sys.stdin.buffer.read()
    normalized, review = decode_review_json(raw)
    validate_review(review, name)

    replace = args.command == "replace"
    expected = getattr(args, "expected_sha256", None)
    if expected is not None:
        _validate_hash(expected, code=2, category="invalid-expected-sha256")

    metadata = governed_write(
        input_path,
        normalized,
        replace=replace,
        expected_sha256=expected,
    )
    emit_json(
        {
            "path": input_path.as_posix(),
            "operation": "input",
            "format": "json",
            "mode": "replace" if replace else "create",
            "bytes": metadata["bytes"],
            "sha256": metadata["sha256"],
            "git": git_visibility(repo_root, input_path)
            if git_state != "non-repo"
            else "non-repo",
        }
    )
    return 0


def _remove_input(args: argparse.Namespace, repo_root, name: str, input_path) -> int:
    if not sys.stdin.isatty() and sys.stdin.buffer.read():
        raise ContractError("remove accepts no payload", 2, "unexpected-stdin")

    check_report_subtree_git(repo_root, input_path)
    expected_input = _validate_hash(
        args.expected_sha256, code=8, category="input-proof-invalid"
    )
    proofs = _parse_artifact_proofs(args.artifact_sha256)
    artifact_paths = {
        format_name: derive_report_path(repo_root, name, format_name)
        for format_name in REQUIRED_FORMATS
    }
    for format_name, path in artifact_paths.items():
        validate_fixed_path(repo_root, path, path, f"{format_name} artifact")

    def validate_proofs(raw: bytes) -> None:
        _validate_input_bytes(raw, name)

    metadata = governed_remove(
        input_path,
        expected_sha256=expected_input,
        artifact_proofs=[
            (format_name, artifact_paths[format_name], proofs[format_name])
            for format_name in REQUIRED_FORMATS
        ],
        proof_validator=validate_proofs,
    )
    emit_json(
        {
            "path": input_path.as_posix(),
            "operation": "input",
            "mode": metadata["mode"],
            "sha256": metadata["sha256"],
            "removed": metadata["removed"],
        }
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        repo_root = resolve_repo_root(args.repo_root)
        name = validate_name(args.name)
        input_path = derive_input_path(repo_root, name)
        validate_fixed_path(repo_root, input_path, input_path, "review input")
        if args.command in {"create", "replace"}:
            return _write_input(args, repo_root, name, input_path)
        return _remove_input(args, repo_root, name, input_path)
    except ContractError as exc:
        emit_error(exc)
        return exc.code
    except OSError:
        emit_error("input-io-failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
