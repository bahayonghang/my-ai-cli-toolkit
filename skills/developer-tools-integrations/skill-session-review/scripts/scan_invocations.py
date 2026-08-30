#!/usr/bin/env python3
"""Scan local agent sessions for a named skill instance."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import quote

NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
SKILL_REF_RE = re.compile(
    r'<skill\s+name="([^"]+)"(?:\s+path="([^"]*)")?',
    re.IGNORECASE,
)
QUOTED_SKILL_PATH_RE = re.compile(
    r"(?P<quote>['\"])(?P<path>(?:[A-Za-z]:[\\/]|[/\\]{1,2}|\.\.?[\\/]|[^\s'\"<>|\\/]+[\\/])[^'\"\r\n]*[\\/]SKILL\.md)(?P=quote)",
    re.IGNORECASE,
)
ESCAPED_QUOTED_SKILL_PATH_RE = re.compile(
    r"(?:\\)+(?P<quote>['\"])(?P<path>(?:[A-Za-z]:[\\/]|[/\\]{1,2}|\.\.?[\\/]|[^\s'\"<>|\\/]+[\\/])[^'\"\r\n]*[\\/]SKILL\.md)(?:\\)+(?P=quote)",
    re.IGNORECASE,
)
BARE_SKILL_PATH_RE = re.compile(
    r"(?<![^\s'\"<>|])(?P<path>(?:[A-Za-z]:)?[^\s'\"<>|]+[\\/]SKILL\.md)\b",
    re.IGNORECASE,
)
BASE_DIRECTORY_RE = re.compile(r"base directory for this skill:\s*([^\r\n]+)", re.IGNORECASE)
STATUS_RANK = {"available": 0, "loaded": 1, "invoked": 2}
TEXT_BLOCK_TYPES = {"text", "output_text"}
TOOL_BLOCK_TYPES = {
    "custom_tool_call",
    "custom_tool_call_output",
    "function_call",
    "function_call_output",
    "tool_call",
    "tool_result",
    "tool_use",
}
TOOL_CARRIER_KEYS = {
    "toolcall",
    "toolcallid",
    "toolcalls",
    "toolname",
    "toolresult",
    "toolresults",
    "tooluse",
    "tooluses",
}
CODEX_READ_CARRIER_FIELDS = {
    "custom_tool_call": ("cmd", "command", "input"),
    "custom_tool_call_output": ("output",),
    "function_call": ("arguments",),
    "function_call_output": ("output",),
}
CODEX_READ_ACTION_RE = re.compile(
    r"(?:\bget-content\b|\bread_file\b|\bread_text\b|\bcat\b|\brg\b)",
    re.IGNORECASE,
)


class ScanError(Exception):
    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def configure_utf8_stdio() -> None:
    """Pin CLI text streams to UTF-8 even when Windows uses a legacy code page."""

    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="strict", newline="\n")


def normalize_path(value: str | Path) -> str:
    resolved = str(Path(value).expanduser().resolve())
    return os.path.normcase(os.path.normpath(resolved))


def normalize_session_cwd(value: Any) -> str | None:
    """Normalize a recorded cwd only when it is a usable absolute path."""

    if not isinstance(value, str) or not value.strip() or "\x00" in value:
        return None
    try:
        candidate = Path(value).expanduser()
        if not candidate.is_absolute():
            return None
        return normalize_path(candidate)
    except (OSError, RuntimeError, ValueError):
        return None


def encode_claude_cwd(cwd: Path) -> str:
    raw = str(cwd.resolve())
    return re.sub(r"[\\/:.]", "-", raw)


def encode_grok_cwd(cwd: Path) -> str:
    return quote(str(cwd.resolve()), safe="")


def encode_omp_cwd(cwd: Path) -> str:
    raw = str(cwd.resolve())
    inner = re.sub(r"[\\/:]", "-", raw)
    return f"--{inner}--"


def parse_frontmatter_name(skill_md: Path) -> str | None:
    try:
        text = skill_md.read_text(encoding="utf-8-sig")
    except OSError:
        return None
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    block = text[3:end] if end != -1 else text[3:200]
    for line in block.splitlines():
        if line.startswith("name:"):
            return line.split(":", 1)[1].strip().strip("\"'")
    return None


def iter_jsonl(path: Path) -> list[Any]:
    rows: list[Any] = []
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return rows
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def walk_strings(obj: Any) -> list[str]:
    out: list[str] = []
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, dict):
        for value in obj.values():
            out.extend(walk_strings(value))
    elif isinstance(obj, list):
        for value in obj:
            out.extend(walk_strings(value))
    return out


def dump_text(obj: Any) -> str:
    return "\n".join(walk_strings(obj))


def contains_tool_carrier(obj: Any) -> bool:
    """Return whether an assistant event carries tool metadata or tool blocks."""

    if isinstance(obj, dict):
        for key, value in obj.items():
            compact_key = re.sub(r"[^a-z]", "", str(key).lower())
            is_tool_key = compact_key.startswith("tool") or compact_key.startswith("functioncall")
            if (
                (compact_key in TOOL_CARRIER_KEYS or is_tool_key)
                and value not in (None, "", [], {})
            ):
                return True
            if compact_key == "type":
                compact_type = re.sub(r"[^a-z]", "", str(value).lower())
                if (
                    str(value).lower() in TOOL_BLOCK_TYPES
                    or "tool" in compact_type
                    or compact_type.startswith("functioncall")
                ):
                    return True
            if contains_tool_carrier(value):
                return True
    elif isinstance(obj, list):
        return any(contains_tool_carrier(value) for value in obj)
    return False


def plain_message_text(content: Any) -> str:
    """Extract only canonical assistant-authored plain-text body blocks."""

    if not isinstance(content, list):
        return ""
    parts: list[str] = []
    for block in content:
        if (
            isinstance(block, dict)
            and block.get("type") in TEXT_BLOCK_TYPES
            and isinstance(block.get("text"), str)
        ):
            parts.append(block["text"])
    return "\n".join(parts)


def canonical_assistant_text(obj: dict[str, Any], platform: str) -> str:
    """Map platform event envelopes to tool-free assistant-authored body text."""

    if platform == "codex":
        payload = obj.get("payload") if isinstance(obj.get("payload"), dict) else {}
        if not (
            obj.get("type") == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "assistant"
        ):
            return ""
        event: Any = obj
    elif platform == "oh-my-pi":
        message = obj.get("message") if isinstance(obj.get("message"), dict) else {}
        if obj.get("type") != "message" or message.get("role") != "assistant":
            return ""
        event = obj
        payload = message
    else:
        return ""
    if contains_tool_carrier(event):
        return ""
    return plain_message_text(payload.get("content"))


def codex_read_carrier_text(obj: dict[str, Any]) -> str:
    """Extract only allowlisted payload fields from a real Codex carrier envelope."""

    payload = obj.get("payload") if isinstance(obj.get("payload"), dict) else None
    if obj.get("type") != "response_item" or payload is None:
        return ""
    carrier_type = payload.get("type")
    if not isinstance(carrier_type, str):
        return ""
    allowed_fields = CODEX_READ_CARRIER_FIELDS.get(carrier_type)
    if allowed_fields is None:
        return ""
    return dump_text([payload.get(field) for field in allowed_fields if field in payload])


def codex_has_target_read(
    obj: dict[str, Any],
    skill_name: str,
    skill_path: str | None,
    explicit_skill_path: bool,
) -> bool:
    """Return whether an allowlisted Codex carrier records an exact target read."""

    carrier_text = codex_read_carrier_text(obj)
    if not carrier_text:
        return False
    recorded_paths = recorded_skill_paths(carrier_text)
    if explicit_skill_path:
        target_bound = bool(
            skill_path and any(path_matches(candidate, skill_path) for candidate in recorded_paths)
        )
    else:
        name_token = f"skills/{skill_name}/SKILL.md".lower()
        target_bound = name_token in carrier_text.lower().replace("\\", "/")
    if not target_bound:
        return False
    action_text = mask_recorded_skill_paths(carrier_text)
    return CODEX_READ_ACTION_RE.search(action_text) is not None


def bump(current: str | None, candidate: str) -> str:
    if current is None:
        return candidate
    if STATUS_RANK[candidate] > STATUS_RANK[current]:
        return candidate
    return current


def path_matches(candidate: str | None, target: str | None) -> bool:
    if not candidate or not target:
        return False
    try:
        return normalize_path(candidate) == target
    except (OSError, RuntimeError, ValueError):
        candidate_fallback = os.path.normcase(os.path.normpath(str(candidate)))
        target_fallback = os.path.normcase(os.path.normpath(str(target)))
        return candidate_fallback == target_fallback


def name_matches(value: str | None, skill_name: str) -> bool:
    if not value:
        return False
    return value.strip().lower() == skill_name.lower()


def recorded_skill_path_spans(text: str) -> list[tuple[int, int, str]]:
    """Extract one ordered, non-overlapping set of recorded SKILL.md path spans."""

    quoted_spans: list[tuple[int, int, str]] = []
    for pattern in (ESCAPED_QUOTED_SKILL_PATH_RE, QUOTED_SKILL_PATH_RE):
        for match in pattern.finditer(text):
            start, end = match.span("path")
            if any(start < prior_end and prior_start < end for prior_start, prior_end, _ in quoted_spans):
                continue
            quoted_spans.append((start, end, match.group("path")))
    spans = list(quoted_spans)
    for match in BARE_SKILL_PATH_RE.finditer(text):
        start, end = match.span("path")
        if any(start < quoted_end and quoted_start < end for quoted_start, quoted_end, _ in quoted_spans):
            continue
        spans.append((start, end, match.group("path")))
    spans.sort(key=lambda item: (item[0], item[1]))
    return spans


def recorded_skill_paths(text: str) -> list[str]:
    """Extract unique SKILL.md paths from the shared non-overlapping spans."""

    paths: list[str] = []
    seen: set[str] = set()
    for _, _, candidate in recorded_skill_path_spans(text):
        if candidate not in seen:
            seen.add(candidate)
            paths.append(candidate)
    return paths


def mask_recorded_skill_paths(text: str) -> str:
    """Mask SKILL.md path spans before looking for an independent read action."""

    masked = text
    for start, end, _ in reversed(recorded_skill_path_spans(text)):
        masked = f"{masked[:start]}<SKILL_PATH>{masked[end:]}"
    return masked


def recorded_base_directories(text: str) -> list[str]:
    return [match.group(1).strip().strip("'\"") for match in BASE_DIRECTORY_RE.finditer(text)]


def find_skill_files(home: Path, repo_root: Path | None, skill_name: str) -> list[Path]:
    roots = [
        home / ".claude" / "skills" / skill_name / "SKILL.md",
        home / ".codex" / "skills" / skill_name / "SKILL.md",
        home / ".agents" / "skills" / skill_name / "SKILL.md",
        home / ".grok" / "skills" / skill_name / "SKILL.md",
        home / ".skillsmanage" / "skills" / skill_name / "SKILL.md",
        home / ".omp" / "skills" / skill_name / "SKILL.md",
    ]
    found: list[Path] = []
    seen: set[str] = set()
    for path in roots:
        if path.is_file():
            key = normalize_path(path)
            if key not in seen:
                seen.add(key)
                found.append(path.resolve())
    if repo_root is not None:
        skills_root = repo_root / "skills"
        if skills_root.is_dir():
            for path in skills_root.glob(f"*/{skill_name}/SKILL.md"):
                if path.is_file():
                    key = normalize_path(path)
                    if key not in seen:
                        seen.add(key)
                        found.append(path.resolve())
            for path in skills_root.glob(f"*/*/{skill_name}/SKILL.md"):
                if path.is_file():
                    key = normalize_path(path)
                    if key not in seen:
                        seen.add(key)
                        found.append(path.resolve())
    return found


def workflow_markers(skill_md: Path | None, skill_name: str) -> list[str]:
    # Every invocation marker must name the target skill. Generic workflow text
    # such as "Step 1" / "步骤 1" is common in unrelated assistant responses and
    # therefore cannot establish that this particular skill was invoked.
    markers = [f"# {skill_name}", f"name: {skill_name}"]
    if skill_md is None or not skill_md.is_file():
        return markers
    try:
        text = skill_md.read_text(encoding="utf-8-sig")
    except OSError:
        return markers
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# ") and skill_name.lower() in stripped.lower():
            markers.append(stripped)
            break
    return markers


def has_workflow_marker(text: str, markers: list[str]) -> bool:
    lower = text.lower()
    return any(marker.lower() in lower for marker in markers)


def classify_claude(
    path: Path,
    skill_name: str,
    skill_path: str | None,
    markers: list[str],
    explicit_skill_path: bool,
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    status = None
    signal = None
    blob = dump_text(rows)
    target_name = skill_name.lower()
    base_directories = recorded_base_directories(blob)
    target_bound = not explicit_skill_path
    if explicit_skill_path and skill_path:
        target_parent = normalize_path(Path(skill_path).parent)
        target_bound = any(path_matches(candidate, target_parent) for candidate in base_directories)
    if base_directories and target_bound:
        status = bump(status, "loaded")
        signal = "skill-injection"
    invocation_signal = None
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        attr = obj.get("attributionSkill")
        if name_matches(str(attr) if attr is not None else None, skill_name):
            invocation_signal = "attributionSkill"
        message = obj.get("message")
        contents = []
        if isinstance(message, dict):
            raw = message.get("content")
            if isinstance(raw, list):
                contents = raw
        if isinstance(obj.get("content"), list):
            contents = contents + obj["content"]
        for block in contents:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "tool_use" and str(block.get("name", "")).lower() == "skill":
                inp = block.get("input") or {}
                skill_val = ""
                if isinstance(inp, dict):
                    skill_val = str(inp.get("skill") or inp.get("name") or "")
                if name_matches(skill_val, skill_name):
                    invocation_signal = "Skill-tool"
    if invocation_signal and target_bound:
        status = bump(status, "invoked")
        signal = invocation_signal
    if not explicit_skill_path and status is None and target_name in blob.lower() and "skill" in blob.lower():
        if "listing" in blob.lower() or "available skills" in blob.lower():
            status = bump(status, "available")
            signal = "catalog"
    if status is None:
        return None
    return {
        "id": path.stem,
        "platform": "claude",
        "status": status,
        "signal": signal,
        "file": path.as_posix(),
        "skill_path": skill_path,
    }


def classify_grok(
    path: Path,
    skill_name: str,
    skill_path: str | None,
    markers: list[str],
    explicit_skill_path: bool,
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    blob = dump_text(rows)
    status = None
    signal = None
    for match in SKILL_REF_RE.finditer(blob):
        ref_name, ref_path = match.group(1), match.group(2)
        if (
            explicit_skill_path
            and skill_path
            and ref_path
            and name_matches(ref_name, skill_name)
            and path_matches(ref_path, skill_path)
        ):
            status = bump(status, "invoked")
            signal = "skills_referenced-path"
        elif not explicit_skill_path and name_matches(ref_name, skill_name):
            status = bump(status, "invoked")
            signal = "skills_referenced-name"
    if not explicit_skill_path and (f'<skill name="{skill_name}"' in blob or f"name: {skill_name}" in blob):
        if "base directory" in blob.lower() or "<skill name=" in blob:
            status = bump(status, "loaded")
            signal = signal or "skill-injection"
    if status is None:
        return None
    session_id = path.parent.name if path.name == "chat_history.jsonl" else path.stem
    return {
        "id": session_id,
        "platform": "grok",
        "status": status,
        "signal": signal,
        "file": path.as_posix(),
        "skill_path": skill_path,
    }


def classify_codex(
    path: Path,
    skill_name: str,
    skill_path: str | None,
    markers: list[str],
    repo_root: Path | None,
    scope: str,
    explicit_skill_path: bool,
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    session_cwds: list[Any] = []
    status = None
    signal = None
    name_token = f"skills/{skill_name}/SKILL.md".lower()
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        payload = obj.get("payload") if isinstance(obj.get("payload"), dict) else {}
        if obj.get("type") == "session_meta":
            session_cwds.append(payload.get("cwd"))
        blob = dump_text(obj)
        lower = blob.lower().replace("\\", "/")
        target_bound = bool(
            explicit_skill_path
            and skill_path
            and any(path_matches(candidate, skill_path) for candidate in recorded_skill_paths(blob))
        )
        if "host_skills" in blob or "## Skills" in blob:
            if (explicit_skill_path and target_bound) or (
                not explicit_skill_path and skill_name.lower() in lower
            ):
                if status is None:
                    status = "available"
                    signal = "host_skills"
        # The broad assistant-event exclusion predicate is deliberately not a
        # positive read signal.  Only an allowlisted Codex carrier envelope and
        # its allowlisted payload fields can establish a target-bound read.
        if codex_has_target_read(obj, skill_name, skill_path, explicit_skill_path):
            status = bump(status, "loaded")
            if status == "loaded":
                signal = "read-SKILL.md"
        elif not explicit_skill_path and name_token in lower and obj.get("type") in {"session_meta", "world_state"}:
            if status is None:
                status = "available"
                signal = "host_skills"
        assistant_body = canonical_assistant_text(obj, "codex")
        if status == "loaded" and assistant_body and has_workflow_marker(assistant_body, markers):
            status = "invoked"
            signal = "workflow-marker"
    if scope == "cwd" and repo_root is not None:
        try:
            repo_root_normalized = normalize_path(repo_root)
        except (OSError, RuntimeError, ValueError):
            return None
        if not session_cwds:
            return None
        normalized_cwds = [normalize_session_cwd(value) for value in session_cwds]
        if any(value is None or value != repo_root_normalized for value in normalized_cwds):
            return None
    if status is None:
        return None
    return {
        # Full-history forks can inherit one root payload.session_id across many
        # distinct rollout files.  The governed report schema requires unique
        # session ids, so the file stem is the stable per-rollout identity.
        "id": path.stem,
        "platform": "codex",
        "status": status,
        "signal": signal,
        "file": path.as_posix(),
        "skill_path": skill_path,
    }


def classify_omp(
    path: Path,
    skill_name: str,
    skill_path: str | None,
    markers: list[str],
    explicit_skill_path: bool,
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    status = None
    signal = None
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        message = obj.get("message") if isinstance(obj.get("message"), dict) else {}
        tool = str(message.get("toolName") or "")
        data = obj.get("data") if isinstance(obj.get("data"), dict) else {}
        blob = dump_text(obj)
        lower = blob.replace("\\", "/").lower()
        is_read = tool.lower() in {"read", "bash"} or str(data.get("toolName", "")).lower() in {
            "read",
            "bash",
        }
        if explicit_skill_path:
            matches_target_instance = bool(
                skill_path and any(path_matches(candidate, skill_path) for candidate in recorded_skill_paths(blob))
            )
        else:
            matches_target_instance = "skill.md" in lower and skill_name.lower() in lower
        if is_read and matches_target_instance:
            status = bump(status, "loaded")
            if status == "loaded":
                signal = "read-SKILL.md"
        assistant_body = canonical_assistant_text(obj, "oh-my-pi")
        if status == "loaded" and assistant_body and has_workflow_marker(assistant_body, markers):
            status = "invoked"
            signal = "workflow-marker"
    if status is None:
        return None
    return {
        "id": path.stem,
        "platform": "oh-my-pi",
        "status": status,
        "signal": signal,
        "file": path.as_posix(),
        "skill_path": skill_path,
    }


def list_claude_files(home: Path, repo_root: Path | None, scope: str) -> list[Path]:
    root = home / ".claude" / "projects"
    if not root.is_dir():
        return []
    if scope == "cwd" and repo_root is not None:
        encoded = encode_claude_cwd(repo_root)
        target = root / encoded
        return list(target.glob("*.jsonl")) if target.is_dir() else []
    return list(root.glob("*/*.jsonl"))


def list_grok_files(home: Path, repo_root: Path | None, scope: str) -> list[Path]:
    root = home / ".grok" / "sessions"
    if not root.is_dir():
        return []
    if scope == "cwd" and repo_root is not None:
        encoded = encode_grok_cwd(repo_root)
        target = root / encoded
        return list(target.glob("*/chat_history.jsonl")) if target.is_dir() else []
    return list(root.glob("*/*/chat_history.jsonl"))


def list_codex_files(home: Path) -> list[Path]:
    root = home / ".codex" / "sessions"
    if not root.is_dir():
        return []
    return list(root.glob("**/rollout-*.jsonl"))


def list_omp_files(home: Path, repo_root: Path | None, scope: str) -> list[Path]:
    root = home / ".omp" / "agent" / "sessions"
    if not root.is_dir():
        return []
    if scope == "cwd" and repo_root is not None:
        encoded = encode_omp_cwd(repo_root)
        target = root / encoded
        return list(target.glob("*.jsonl")) if target.is_dir() else []
    return list(root.glob("*/*.jsonl"))


def scan(args: argparse.Namespace) -> dict[str, Any]:
    home = Path(args.home).expanduser().resolve() if args.home else Path.home()
    repo_root = Path(args.repo_root).expanduser().resolve() if args.repo_root else None
    skill_name = args.skill_name
    explicit_skill_path = bool(args.skill_path)
    if not NAME_RE.fullmatch(skill_name):
        raise ScanError(f"invalid skill name: {skill_name!r}", code=1)
    skill_path_arg = args.skill_path
    skill_files: list[Path] = []
    if skill_path_arg:
        skill_md = Path(skill_path_arg).expanduser().resolve()
        if not skill_md.is_file():
            raise ScanError(f"skill path not found: {skill_md}", code=2)
        skill_files = [skill_md]
    else:
        skill_files = find_skill_files(home, repo_root, skill_name)
        if len(skill_files) > 1:
            return {
                "skill_name": skill_name,
                "scope": args.scope,
                "coverage": {},
                "sessions": [],
                "ambiguous_targets": [p.as_posix() for p in skill_files],
            }
    skill_md = skill_files[0] if skill_files else None
    skill_path = skill_md.as_posix() if skill_md else None
    skill_path_norm = normalize_path(skill_md) if skill_md else None
    markers = workflow_markers(skill_md, skill_name)

    coverage: dict[str, str] = {}
    sessions: list[dict[str, Any]] = []

    claude_root = home / ".claude" / "projects"
    if not claude_root.is_dir():
        coverage["claude"] = "missing-store"
    else:
        coverage["claude"] = "ok"
        for path in list_claude_files(home, repo_root, args.scope):
            hit = classify_claude(path, skill_name, skill_path_norm, markers, explicit_skill_path)
            if hit:
                if skill_path:
                    hit["skill_path"] = skill_path
                sessions.append(hit)

    grok_root = home / ".grok" / "sessions"
    if not grok_root.is_dir():
        coverage["grok"] = "missing-store"
    else:
        coverage["grok"] = "ok"
        for path in list_grok_files(home, repo_root, args.scope):
            hit = classify_grok(path, skill_name, skill_path_norm, markers, explicit_skill_path)
            if hit:
                if skill_path:
                    hit["skill_path"] = skill_path
                sessions.append(hit)

    codex_root = home / ".codex" / "sessions"
    if not codex_root.is_dir():
        coverage["codex"] = "missing-store"
    else:
        coverage["codex"] = "ok"
        for path in list_codex_files(home):
            hit = classify_codex(
                path,
                skill_name,
                skill_path_norm,
                markers,
                repo_root,
                args.scope,
                explicit_skill_path,
            )
            if hit:
                if skill_path:
                    hit["skill_path"] = skill_path
                sessions.append(hit)

    omp_root = home / ".omp" / "agent" / "sessions"
    if not omp_root.is_dir():
        coverage["oh-my-pi"] = "missing-store"
    else:
        coverage["oh-my-pi"] = "ok"
        for path in list_omp_files(home, repo_root, args.scope):
            hit = classify_omp(path, skill_name, skill_path_norm, markers, explicit_skill_path)
            if hit:
                if skill_path:
                    hit["skill_path"] = skill_path
                sessions.append(hit)

    return {
        "skill_name": skill_name,
        "skill_path": skill_path,
        "scope": args.scope,
        "coverage": coverage,
        "sessions": sessions,
        "ambiguous_targets": [],
    }


def main(argv: list[str] | None = None) -> int:
    configure_utf8_stdio()
    parser = argparse.ArgumentParser(description="Scan agent sessions for a skill instance.")
    parser.add_argument("--skill-name", required=True)
    parser.add_argument("--skill-path")
    parser.add_argument("--scope", choices=("global", "cwd"), default="global")
    parser.add_argument("--repo-root")
    parser.add_argument("--home", help="override home directory (tests)")
    args = parser.parse_args(argv)
    try:
        if args.scope == "cwd" and not args.repo_root:
            raise ScanError("--scope cwd requires --repo-root", code=2)
        payload = scan(args)
    except ScanError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return exc.code
    print(json.dumps(payload, ensure_ascii=False))
    if payload.get("ambiguous_targets"):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
