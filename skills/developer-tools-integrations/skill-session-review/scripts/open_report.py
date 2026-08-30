#!/usr/bin/env python3
"""Open one fixed skill-session-review HTML artifact in the default browser."""

from __future__ import annotations

import argparse
import os
import webbrowser

from review_contract import (
    ContractError,
    derive_report_path,
    emit_error,
    emit_json,
    refuse_existing_reparse,
    resolve_repo_root,
    validate_fixed_path,
    validate_name,
)


class _Parser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        del message
        emit_error("invalid-arguments")
        raise SystemExit(2)


def _open_uri(uri: str) -> tuple[bool, str]:
    """Open a URI, with a bounded deterministic test seam."""

    stub = os.environ.get("SSR_BROWSER_STUB")
    if stub is not None:
        normalized = stub.strip().lower()
        if normalized == "true":
            return True, ""
        if normalized == "false":
            return False, "browser-declined"
        if normalized == "error":
            return False, "browser-error"
        raise ContractError("invalid browser stub", 2, "invalid-browser-stub")

    try:
        opened = bool(webbrowser.open(uri, new=2))
    except (webbrowser.Error, OSError):
        return False, "browser-error"
    return (True, "") if opened else (False, "browser-declined")


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(
        description="Open a fixed skill-session-review HTML report."
    )
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--name", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        repo_root = resolve_repo_root(args.repo_root)
        name = validate_name(args.name)
        report_path = derive_report_path(repo_root, name, "html")
        validate_fixed_path(repo_root, report_path, report_path, "report")
        refuse_existing_reparse(report_path, "report", code=2)
        if not report_path.is_file():
            raise ContractError("report is unavailable", 2, "report-unavailable")
        opened, reason = _open_uri(report_path.as_uri())
    except ContractError as exc:
        emit_error(exc)
        return exc.code
    except OSError:
        emit_error("open-report-io-failed")
        return 2

    emit_json(
        {
            "path": report_path.as_posix(),
            "opened": opened,
            "reason": reason,
        }
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
