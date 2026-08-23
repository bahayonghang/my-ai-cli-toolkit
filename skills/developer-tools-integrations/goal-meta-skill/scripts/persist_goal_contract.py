#!/usr/bin/env python3
"""Safely persist one approved Goal contract at a confirmed project root."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

from lint_goal_command import lint_persisted_contract


SAFE_BASENAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.md$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
REPARSE_POINT = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)

SECRET_PATTERNS = (
    ("private-key block", re.compile(r"-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----")),
    ("OpenAI-style API key", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b")),
    (
        "GitHub token",
        re.compile(r"\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[opusr]_[A-Za-z0-9]{20,})\b"),
    ),
    ("bearer token", re.compile(r"\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b", re.IGNORECASE)),
)

ASSIGNMENT_SECRET = re.compile(
    r"\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|cookie|password|passwd|secret)\b"
    r"\s*[:=]\s*[\"']?([^\s\"'#]+)",
    re.IGNORECASE,
)

SAFE_VARIABLE_VALUES = (
    re.compile(r"^\$\{?[A-Z][A-Z0-9_]*\}?$"),
    re.compile(r"^%[A-Z][A-Z0-9_]*%$"),
    re.compile(r"^(?:process\.env\.|env:|ENV\[|os\.environ\[)[A-Z0-9_'\"\]]+$", re.IGNORECASE),
    re.compile(r"^[A-Z][A-Z0-9_]{3,}$"),
)

SAFE_ENV_REFERENCE = re.compile(
    r"\$\{?[A-Z][A-Z0-9_]*\}?|%[A-Z][A-Z0-9_]*%|"
    r"process\.env\.[A-Z][A-Z0-9_]*|env:[A-Z][A-Z0-9_]*|"
    r"os\.environ\[[\"'][A-Z][A-Z0-9_]*[\"']\]",
    re.IGNORECASE,
)


class ContractError(Exception):
    """Expected validation or policy failure that is safe to show to users."""


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate an approved Goal contract from stdin and persist one root Markdown file."
        )
    )
    parser.add_argument(
        "--repo-root",
        required=True,
        help="Literal Git/workspace root that the caller already established.",
    )
    parser.add_argument(
        "--name",
        default="GOAL.md",
        help="Direct-child Markdown basename (default: GOAL.md).",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Replace an existing regular file after its SHA-256 is confirmed.",
    )
    parser.add_argument(
        "--expected-sha256",
        help="Lowercase SHA-256 of the existing file; required with --replace.",
    )
    return parser.parse_args(argv[1:])


def decode_contract(raw: bytes) -> str:
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ContractError(f"stdin is not strict UTF-8/UTF-8-BOM: byte {exc.start}") from None
    if not text.strip():
        raise ContractError("stdin contract is empty")
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return normalized.rstrip("\n") + "\n"


def resolve_target(repo_root: str, name: str) -> tuple[Path, Path]:
    root = Path(repo_root)
    try:
        root = root.resolve(strict=True)
    except OSError as exc:
        raise ContractError(f"repo root cannot be resolved: {exc}") from None
    if not root.is_dir():
        raise ContractError("repo root is not a directory")

    if (
        not SAFE_BASENAME.fullmatch(name)
        or Path(name).is_absolute()
        or Path(name).name != name
        or "/" in name
        or "\\" in name
        or name in {".", ".."}
    ):
        raise ContractError(
            "output name must be a safe direct-child Markdown basename without separators"
        )

    target = root / name
    if is_reparse_or_symlink(target):
        raise ContractError("target is a symlink or reparse point")
    try:
        if target.resolve(strict=False).parent != root:
            raise ContractError("output target escapes the confirmed project root")
    except OSError as exc:
        raise ContractError(f"output target cannot be resolved safely: {exc}") from None
    return root, target


def is_reparse_or_symlink(path: Path) -> bool:
    try:
        details = path.lstat()
    except FileNotFoundError:
        return False
    return stat.S_ISLNK(details.st_mode) or bool(
        getattr(details, "st_file_attributes", 0) & REPARSE_POINT
    )


def read_existing_regular(path: Path) -> bytes:
    if is_reparse_or_symlink(path):
        raise ContractError("target is a symlink or reparse point")
    try:
        details = path.stat()
    except FileNotFoundError:
        raise ContractError("target disappeared before replacement") from None
    if not stat.S_ISREG(details.st_mode):
        raise ContractError("existing target is not a regular file")
    try:
        return path.read_bytes()
    except OSError as exc:
        raise ContractError(f"cannot read existing target: {exc}") from None


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def secret_findings(text: str) -> list[tuple[str, int]]:
    findings: list[tuple[str, int]] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        for category, pattern in SECRET_PATTERNS:
            if pattern.search(line):
                findings.append((category, line_number))
        assignment = ASSIGNMENT_SECRET.search(line)
        if assignment:
            value = assignment.group(1).rstrip(",;.)")
            if not SAFE_ENV_REFERENCE.search(line) and not any(
                pattern.fullmatch(value) for pattern in SAFE_VARIABLE_VALUES
            ):
                findings.append(("credential assignment", line_number))
    return findings


def validate_contract(text: str, name: str) -> None:
    findings = secret_findings(text)
    if findings:
        category, line_number = findings[0]
        raise ContractError(
            f"contract rejected by secret backstop: {category} at line {line_number}"
        )

    errors = lint_persisted_contract(text, "stdin", expected_path=name)
    if errors:
        raise ContractError("contract lint failed: " + "; ".join(errors[:8]))


def git_command(root: Path, args: list[str]) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(
            ["git", "-C", str(root), *args],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except OSError:
        return None


def git_visibility(root: Path, name: str) -> str:
    inside = git_command(root, ["rev-parse", "--is-inside-work-tree"])
    if inside is None or inside.returncode != 0 or inside.stdout.strip() != "true":
        return "not-a-repository"

    tracked = git_command(root, ["ls-files", "--error-unmatch", "--", name])
    if tracked is not None and tracked.returncode == 0:
        return "tracked"

    ignored = git_command(root, ["check-ignore", "--quiet", "--", name])
    if ignored is not None and ignored.returncode == 0:
        return "ignored"
    return "untracked"


def write_temp(root: Path, name: str, data: bytes) -> Path:
    descriptor, raw_path = tempfile.mkstemp(prefix=f".{name}.", suffix=".tmp", dir=root)
    temp_path = Path(raw_path)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
    except Exception:
        try:
            os.close(descriptor)
        except OSError:
            pass
        temp_path.unlink(missing_ok=True)
        raise
    return temp_path


def finalize_create(temp_path: Path, target: Path) -> None:
    try:
        os.link(temp_path, target)
    except FileExistsError:
        raise ContractError("target already exists; create-only finalize refused it") from None
    except OSError as exc:
        raise ContractError(f"atomic no-overwrite finalize failed: {exc}") from None
    try:
        temp_path.unlink()
    except OSError:
        # The target is already a complete hard link. The outer cleanup retries
        # without turning a successful atomic create into a false failure.
        pass


def finalize_replace(temp_path: Path, target: Path, expected_hash: str) -> bytes:
    current = read_existing_regular(target)
    current_hash = sha256(current)
    if current_hash != expected_hash:
        raise ContractError(
            f"existing target SHA-256 mismatch: expected {expected_hash}, found {current_hash}"
        )
    try:
        os.replace(temp_path, target)
    except OSError as exc:
        raise ContractError(f"atomic replacement failed: {exc}") from None
    return current


def persist(
    root: Path,
    target: Path,
    data: bytes,
    *,
    replace: bool,
    expected_hash: str | None,
) -> str:
    old_bytes: bytes | None = None
    if target.exists() or is_reparse_or_symlink(target):
        existing = read_existing_regular(target)
        existing_hash = sha256(existing)
        if not replace:
            visibility = git_visibility(root, target.name)
            raise ContractError(
                f"target already exists (sha256={existing_hash}, git_visibility={visibility}); "
                "explicit --replace with the observed hash is required"
            )
        if existing_hash != expected_hash:
            raise ContractError(
                f"existing target SHA-256 mismatch: expected {expected_hash}, found {existing_hash}"
            )
    elif replace:
        raise ContractError("--replace requires an existing regular target")

    temp_path = write_temp(root, target.name, data)
    action = "replaced" if replace else "created"
    try:
        if replace:
            old_bytes = finalize_replace(temp_path, target, expected_hash or "")
        else:
            finalize_create(temp_path, target)

        readback = read_existing_regular(target)
        if sha256(readback) != sha256(data):
            if old_bytes is None:
                target.unlink(missing_ok=True)
            else:
                rollback = write_temp(root, target.name, old_bytes)
                os.replace(rollback, target)
            raise ContractError("readback SHA-256 mismatch; the write was rolled back")
    finally:
        temp_path.unlink(missing_ok=True)
    return action


def main(argv: list[str]) -> int:
    try:
        args = parse_args(argv)
        if args.replace:
            if not args.expected_sha256 or not SHA256.fullmatch(args.expected_sha256):
                raise ContractError(
                    "--replace requires --expected-sha256 as 64 lowercase hexadecimal characters"
                )
        elif args.expected_sha256:
            raise ContractError("--expected-sha256 is valid only with --replace")

        text = decode_contract(sys.stdin.buffer.read())
        root, target = resolve_target(args.repo_root, args.name)
        validate_contract(text, args.name)
        data = text.encode("utf-8")
        action = persist(
            root,
            target,
            data,
            replace=args.replace,
            expected_hash=args.expected_sha256,
        )
        readback = target.read_bytes()
        result = {
            "path": target.name,
            "bytes": len(readback),
            "sha256": sha256(readback),
            "action": action,
            "git_visibility": git_visibility(root, target.name),
        }
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0
    except ContractError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"error: persistence I/O failure: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
