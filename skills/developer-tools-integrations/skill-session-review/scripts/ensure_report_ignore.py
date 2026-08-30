#!/usr/bin/env python3
"""Govern one exact repo-root .gitignore rule for skill-session-review reports."""

from __future__ import annotations

import argparse
import sys

from review_contract import (
    ContractError,
    emit_error,
    emit_json,
    git_visibility,
    governed_write,
    read_regular_bytes,
    refuse_existing_reparse,
    resolve_repo_root,
    scan_secrets,
    sha256_hex,
)


IGNORE_LINE = "reports/skill-session-review/"


class _Parser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        del message
        emit_error("invalid-arguments")
        raise SystemExit(2)


def _normalize_utf8(raw: bytes) -> bytes:
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ContractError("invalid UTF-8", 6, "invalid-utf8") from exc
    if "\x00" in text:
        raise ContractError("NUL is forbidden", 6, "invalid-gitignore")
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    scan_secrets(normalized)
    return normalized.encode("utf-8")


def _has_exact_rule(data: bytes) -> bool:
    normalized = _normalize_utf8(data).decode("utf-8")
    return any(line == IGNORE_LINE for line in normalized.splitlines())


def _expected_candidate(current: bytes | None) -> bytes:
    if current is None:
        return f"{IGNORE_LINE}\n".encode("utf-8")
    normalized = _normalize_utf8(current).decode("utf-8")
    separator = "" if not normalized or normalized.endswith("\n") else "\n"
    return f"{normalized}{separator}{IGNORE_LINE}\n".encode("utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(
        description="Create or replace the exact skill-session-review ignore rule."
    )
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--replace", action="store_true")
    parser.add_argument("--expected-sha256")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.replace != (args.expected_sha256 is not None):
        emit_error("invalid-replacement-arguments")
        return 2

    try:
        repo_root = resolve_repo_root(args.repo_root)
        destination = repo_root / ".gitignore"
        refuse_existing_reparse(destination, ".gitignore", code=2)

        current = (
            read_regular_bytes(destination, ".gitignore", code=2)
            if destination.exists()
            else None
        )
        if current is not None and _has_exact_rule(current):
            emit_json(
                {
                    "path": destination.as_posix(),
                    "operation": "gitignore",
                    "format": "text",
                    "mode": "unchanged",
                    "bytes": len(current),
                    "sha256": sha256_hex(current),
                    "git": git_visibility(repo_root, destination),
                }
            )
            return 0

        candidate = _normalize_utf8(sys.stdin.buffer.read())
        if candidate != _expected_candidate(current):
            raise ContractError(
                "candidate changes more than the exact rule",
                6,
                "invalid-gitignore-delta",
            )

        if current is None and args.replace:
            raise ContractError("replacement target is missing", 4, "stale-hash")
        if current is not None and not args.replace:
            raise ContractError("target already exists", 3, "target-exists")

        metadata = governed_write(
            destination,
            candidate,
            replace=args.replace,
            expected_sha256=args.expected_sha256,
        )
        emit_json(
            {
                "path": destination.as_posix(),
                "operation": "gitignore",
                "format": "text",
                "mode": "replace" if args.replace else "create",
                "bytes": metadata["bytes"],
                "sha256": metadata["sha256"],
                "git": git_visibility(repo_root, destination),
            }
        )
        return 0
    except ContractError as exc:
        emit_error(exc)
        return exc.code
    except OSError:
        emit_error("gitignore-io-failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
