#!/usr/bin/env python3
"""
Pre-Bash Hook - Block dangerous commands before execution.
"""

import json
import locale
import sys

DANGEROUS_PATTERNS = [
    'rm -rf /',
    'rm -rf ~',
    'dd if=',
    ':(){:|:&};:',
    'mkfs.',
    '> /dev/sd',
]


def read_stdin_text():
    raw = sys.stdin.buffer.read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        encoding = sys.stdin.encoding or locale.getpreferredencoding(False)
        return raw.decode(encoding, errors="replace")


def command_from_event(text):
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("expected a JSON object")
    tool_input = data.get("tool_input")
    if not isinstance(tool_input, dict):
        raise ValueError("missing tool_input.command")
    command = tool_input.get("command")
    if not isinstance(command, str):
        raise ValueError("missing tool_input.command")
    return command


def main():
    try:
        command = command_from_event(read_stdin_text())
    except Exception as exc:
        print(f"[CWF] invalid PreToolUse event: {exc}", file=sys.stderr)
        return 2

    for pattern in DANGEROUS_PATTERNS:
        if pattern in command:
            print(f"[CWF] BLOCKED: Dangerous command detected: {pattern}", file=sys.stderr)
            return 2

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"[CWF] invalid PreToolUse event: {exc}", file=sys.stderr)
        sys.exit(2)
