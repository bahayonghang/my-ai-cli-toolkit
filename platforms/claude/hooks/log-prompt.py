#!/usr/bin/env python3
"""
Log Prompt Hook - Record user prompts to session-specific log files.
Uses session-isolated logs to handle concurrency.
"""

import json
import locale
import sys
from datetime import datetime
from pathlib import Path


def read_stdin_text() -> str:
    raw = sys.stdin.buffer.read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        encoding = sys.stdin.encoding or locale.getpreferredencoding(False)
        return raw.decode(encoding, errors="replace")


def is_usable_session_id(session_id: str) -> bool:
    if not session_id.strip():
        return False
    if "/" in session_id or "\\" in session_id or "\x00" in session_id:
        return False
    return True


def write_log(project: Path, session_id: str, prompt: str) -> None:
    log_dir = project / ".claude" / "state"
    log_file = log_dir / f"session-{session_id}.log"
    log_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().isoformat()
    entry = f"[{timestamp}] {prompt[:500]}\n"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(entry)


def main() -> int:
    try:
        text = read_stdin_text()
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("expected a JSON object")

        session_id = data.get("session_id")
        if not isinstance(session_id, str) or not is_usable_session_id(session_id):
            print("[CWF] missing or invalid session_id", file=sys.stderr)
            return 1

        cwd = data.get("cwd")
        if not isinstance(cwd, str) or not cwd.strip():
            print("[CWF] missing or invalid project directory", file=sys.stderr)
            return 1
        project = Path(cwd)
        if not project.is_absolute() or not project.is_dir():
            print("[CWF] missing or invalid project directory", file=sys.stderr)
            return 1

        prompt = data.get("prompt", "")
        if not isinstance(prompt, str) or not prompt:
            return 0

        write_log(project, session_id, prompt)
        return 0
    except Exception as exc:
        print(f"[CWF] prompt log failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"[CWF] prompt log failed: {exc}", file=sys.stderr)
        sys.exit(1)
