#!/usr/bin/env python3
"""Scan local agent sessions for a named skill instance."""

from __future__ import annotations

import argparse
import json
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
STATUS_RANK = {"available": 0, "loaded": 1, "invoked": 2}


class ScanError(Exception):
    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def normalize_path(value: str | Path) -> str:
    return Path(value).expanduser().resolve().as_posix().lower()


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
    except OSError:
        return Path(candidate).as_posix().replace("\\", "/").lower() == target


def name_matches(value: str | None, skill_name: str) -> bool:
    if not value:
        return False
    return value.strip().lower() == skill_name.lower()


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
    markers = [f"# {skill_name}", f"name: {skill_name}", "Step 1", "步骤 1"]
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
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    status = None
    signal = None
    blob = dump_text(rows)
    target_name = skill_name.lower()
    if f"base directory for this skill:" in blob.lower() and (
        skill_path and skill_path in blob.replace("\\", "/").lower()
        or skill_name in blob
    ):
        status = bump(status, "loaded")
        signal = "skill-injection"
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        attr = obj.get("attributionSkill")
        if name_matches(str(attr) if attr is not None else None, skill_name):
            status = bump(status, "invoked")
            signal = "attributionSkill"
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
                    status = bump(status, "invoked")
                    signal = "Skill-tool"
    if status is None and target_name in blob.lower() and "skill" in blob.lower():
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
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    blob = dump_text(rows)
    status = None
    signal = None
    for match in SKILL_REF_RE.finditer(blob):
        ref_name, ref_path = match.group(1), match.group(2)
        if skill_path and ref_path and path_matches(ref_path, skill_path):
            status = bump(status, "invoked")
            signal = "skills_referenced-path"
        elif not skill_path and name_matches(ref_name, skill_name):
            status = bump(status, "invoked")
            signal = "skills_referenced-name"
        elif name_matches(ref_name, skill_name) and skill_path and ref_path and not path_matches(ref_path, skill_path):
            continue
        elif name_matches(ref_name, skill_name) and skill_path and not ref_path:
            status = bump(status, "loaded")
            signal = "skills_referenced-name-only"
    if f'<skill name="{skill_name}"' in blob or f"name: {skill_name}" in blob:
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
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    session_cwd = None
    status = None
    signal = None
    loaded = False
    available = False
    assistant_text = []
    skill_posix = skill_path.replace("\\", "/") if skill_path else ""
    name_token = f"skills/{skill_name}/SKILL.md".lower()
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        payload = obj.get("payload") if isinstance(obj.get("payload"), dict) else {}
        if obj.get("type") == "session_meta":
            cwd = payload.get("cwd")
            if isinstance(cwd, str):
                session_cwd = cwd
        blob = dump_text(obj)
        lower = blob.lower().replace("\\", "/")
        if "host_skills" in blob or "## Skills" in blob:
            if skill_name.lower() in lower:
                available = True
        if name_token in lower or (skill_posix and skill_posix in lower):
            if "get-content" in lower or "literalpath" in lower or '"command"' in lower:
                loaded = True
                signal = "read-SKILL.md"
            elif obj.get("type") in {"session_meta", "world_state"}:
                available = True
        if obj.get("type") == "response_item":
            assistant_text.append(blob)
    if scope == "cwd" and repo_root is not None and session_cwd:
        try:
            if normalize_path(session_cwd) != normalize_path(repo_root):
                return None
        except OSError:
            if Path(session_cwd).resolve() != repo_root.resolve():
                return None
    if loaded:
        status = "loaded"
    elif available:
        status = "available"
        signal = signal or "host_skills"
    if status is None:
        return None
    joined = "\n".join(assistant_text)
    if loaded and has_workflow_marker(joined, markers):
        status = "invoked"
        signal = "workflow-marker"
    session_id = path.stem
    if isinstance(rows[0], dict):
        payload = rows[0].get("payload")
        if isinstance(payload, dict) and payload.get("session_id"):
            session_id = str(payload["session_id"])
    return {
        "id": session_id,
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
) -> dict[str, Any] | None:
    rows = iter_jsonl(path)
    if not rows:
        return None
    status = None
    signal = None
    loaded = False
    assistant_text = []
    skill_posix = skill_path.replace("\\", "/") if skill_path else f"/{skill_name}/SKILL.md"
    for obj in rows:
        if not isinstance(obj, dict):
            continue
        message = obj.get("message") if isinstance(obj.get("message"), dict) else {}
        tool = str(message.get("toolName") or "")
        data = obj.get("data") if isinstance(obj.get("data"), dict) else {}
        blob = dump_text(obj)
        lower = blob.replace("\\", "/").lower()
        target = skill_posix.lower()
        is_read = tool.lower() in {"read", "bash"} or str(data.get("toolName", "")).lower() in {
            "read",
            "bash",
        }
        if is_read and ("skill.md" in lower) and (skill_name.lower() in lower or target in lower):
            loaded = True
            signal = "read-SKILL.md"
        if message.get("role") == "assistant":
            assistant_text.append(blob)
    if not loaded:
        return None
    status = "loaded"
    if has_workflow_marker("\n".join(assistant_text), markers):
        status = "invoked"
        signal = "workflow-marker"
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
            hit = classify_claude(path, skill_name, skill_path_norm, markers)
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
            hit = classify_grok(path, skill_name, skill_path_norm, markers)
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
            hit = classify_codex(path, skill_name, skill_path_norm, markers, repo_root, args.scope)
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
            hit = classify_omp(path, skill_name, skill_path_norm, markers)
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
