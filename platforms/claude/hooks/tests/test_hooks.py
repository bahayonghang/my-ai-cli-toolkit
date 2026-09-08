#!/usr/bin/env python3
"""Offline regressions for Claude hook stdin, exit codes, and session isolation."""

from __future__ import annotations

import json
import os
import shlex
import shutil
import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory


HOOKS_DIR = Path(__file__).resolve().parents[1]
HOOKS_JSON = HOOKS_DIR / "hooks.json"
PRE_BASH = HOOKS_DIR / "pre-bash.py"
LOG_PROMPT = HOOKS_DIR / "log-prompt.py"
REPO_ROOT = HOOKS_DIR.parents[2]
REPO_STATE = REPO_ROOT / ".claude" / "state"

DANGEROUS_COMMAND = "rm -rf /"
SAFE_COMMAND = "pwd"
PRE_BASH_COMMAND = 'python "${CLAUDE_PLUGIN_ROOT}/pre-bash.py"'
LOG_PROMPT_COMMAND = 'python "${CLAUDE_PLUGIN_ROOT}/log-prompt.py"'


def snapshot_repo_state() -> dict[str, int]:
    if not REPO_STATE.exists():
        return {}
    return {path.name: path.stat().st_size for path in REPO_STATE.glob("session-*.log")}


def hook_env() -> dict[str, str]:
    env = os.environ.copy()
    env.pop("CLAUDE_TOOL_INPUT", None)
    env.pop("CLAUDE_CODE_SSE_PORT", None)
    return env


def run_process(
    argv: list[str],
    payload: dict[str, object] | bytes,
    cwd: Path | None = None,
) -> subprocess.CompletedProcess[bytes]:
    raw = payload if isinstance(payload, bytes) else json.dumps(payload).encode("utf-8")
    return subprocess.run(
        argv,
        input=raw,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=str(cwd) if cwd is not None else None,
        env=hook_env(),
        check=False,
    )


def run_script(
    script: Path,
    payload: dict[str, object] | bytes,
    extra_argv: list[str] | None = None,
    cwd: Path | None = None,
) -> subprocess.CompletedProcess[bytes]:
    argv = [sys.executable, str(script)]
    if extra_argv:
        argv.extend(extra_argv)
    return run_process(argv, payload, cwd=cwd)


def pretool_event(command: object, **fields: object) -> dict[str, object]:
    event: dict[str, object] = {
        "hook_event_name": "PreToolUse",
        "session_id": "pretool-session",
        "cwd": str(REPO_ROOT),
        "tool_name": "Bash",
        "tool_input": {"command": command},
    }
    event.update(fields)
    return event


def prompt_event(session_id: object, cwd: object, prompt: object = "hello") -> dict[str, object]:
    return {
        "hook_event_name": "UserPromptSubmit",
        "session_id": session_id,
        "cwd": cwd,
        "prompt": prompt,
    }


def load_hooks_config() -> dict[str, object]:
    return json.loads(HOOKS_JSON.read_text(encoding="utf-8"))


def commands_for_event(event_name: str) -> list[str]:
    data = load_hooks_config()
    hooks = data["hooks"]
    if not isinstance(hooks, dict):
        raise AssertionError("hooks.json hooks must be an object")
    entries = hooks[event_name]
    if not isinstance(entries, list):
        raise AssertionError(f"hooks.json {event_name} must be a list")
    commands: list[str] = []
    for entry in entries:
        if not isinstance(entry, dict):
            raise AssertionError(f"hooks.json {event_name} entry must be an object")
        nested = entry.get("hooks")
        if not isinstance(nested, list):
            raise AssertionError(f"hooks.json {event_name} hooks must be a list")
        for hook in nested:
            if not isinstance(hook, dict):
                raise AssertionError("hook command entry must be an object")
            command = hook.get("command")
            if not isinstance(command, str):
                raise AssertionError("hook command must be a string")
            commands.append(command)
    return commands


def argv_from_plugin_command(command: str, plugin_root: Path) -> list[str]:
    posix_root = plugin_root.as_posix()
    parts = shlex.split(command.replace("${CLAUDE_PLUGIN_ROOT}", posix_root), posix=True)
    if not parts or parts[0] != "python":
        raise AssertionError(f"expected python interpreter in {command!r}")
    argv = [sys.executable]
    saw_plugin_root = False
    for part in parts[1:]:
        if posix_root in part:
            argv.append(part.replace(posix_root, str(plugin_root), 1))
            saw_plugin_root = True
        else:
            argv.append(part)
    if not saw_plugin_root:
        raise AssertionError(
            f"space-containing plugin root was not a single argument: {parts!r}"
        )
    return argv


def copy_plugin_scripts(plugin_root: Path) -> None:
    plugin_root.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PRE_BASH, plugin_root / "pre-bash.py")
    shutil.copy2(LOG_PROMPT, plugin_root / "log-prompt.py")


class PreBashTests(unittest.TestCase):
    def test_dangerous_stdin_command_exits_2(self) -> None:
        result = run_script(PRE_BASH, pretool_event(DANGEROUS_COMMAND))
        self.assertEqual(result.returncode, 2)
        stderr = result.stderr.decode("utf-8", errors="replace")
        self.assertIn("[CWF] BLOCKED", stderr)
        self.assertIn(DANGEROUS_COMMAND, stderr)

    def test_safe_stdin_command_exits_0(self) -> None:
        result = run_script(PRE_BASH, pretool_event(SAFE_COMMAND))
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stderr, b"")

    def test_invalid_events_exit_2_not_1(self) -> None:
        cases: list[dict[str, object] | bytes] = [
            b"",
            b"not-json",
            {"tool_name": "Bash"},
            {"tool_input": {}},
            {"tool_input": {"command": 1}},
            [],
        ]
        for payload in cases:
            with self.subTest(payload=payload):
                result = run_script(PRE_BASH, payload)
                self.assertEqual(result.returncode, 2)
                self.assertNotEqual(result.returncode, 1)
                self.assertIn(b"[CWF]", result.stderr)

    def test_argv_is_not_a_compatibility_input(self) -> None:
        result = run_script(
            PRE_BASH,
            pretool_event(SAFE_COMMAND),
            extra_argv=[DANGEROUS_COMMAND],
        )
        self.assertEqual(result.returncode, 0)

    def test_utf8_bom_stdin_is_accepted(self) -> None:
        raw = b"\xef\xbb\xbf" + json.dumps(pretool_event(SAFE_COMMAND)).encode("utf-8")
        result = run_script(PRE_BASH, raw)
        self.assertEqual(result.returncode, 0)


class LogPromptTests(unittest.TestCase):
    def setUp(self) -> None:
        self._repo_state = snapshot_repo_state()

    def tearDown(self) -> None:
        self.assertEqual(snapshot_repo_state(), self._repo_state)

    def test_distinct_session_ids_write_distinct_files(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            first = run_script(
                LOG_PROMPT,
                prompt_event("audit-session-a", str(event_cwd), "alpha"),
            )
            second = run_script(
                LOG_PROMPT,
                prompt_event("audit-session-b", str(event_cwd), "beta"),
            )
            self.assertEqual(first.returncode, 0)
            self.assertEqual(second.returncode, 0)
            log_dir = event_cwd / ".claude" / "state"
            names = sorted(path.name for path in log_dir.glob("*.log"))
            self.assertEqual(names, ["session-audit-session-a.log", "session-audit-session-b.log"])
            self.assertIn("alpha", (log_dir / "session-audit-session-a.log").read_text(encoding="utf-8"))
            self.assertIn("beta", (log_dir / "session-audit-session-b.log").read_text(encoding="utf-8"))
            self.assertFalse((log_dir / "session-default.log").exists())

    def test_same_session_id_appends_its_own_file(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            first = run_script(
                LOG_PROMPT,
                prompt_event("same-session", str(event_cwd), "first"),
            )
            second = run_script(
                LOG_PROMPT,
                prompt_event("same-session", str(event_cwd), "second"),
            )
            self.assertEqual(first.returncode, 0)
            self.assertEqual(second.returncode, 0)
            log_file = event_cwd / ".claude" / "state" / "session-same-session.log"
            text = log_file.read_text(encoding="utf-8")
            self.assertEqual(len(log_file.read_text(encoding="utf-8").splitlines()), 2)
            self.assertIn("first", text)
            self.assertIn("second", text)

    def test_event_cwd_not_process_cwd(self) -> None:
        with TemporaryDirectory() as event_raw, TemporaryDirectory() as process_raw:
            event_cwd = Path(event_raw)
            process_cwd = Path(process_raw)
            result = run_script(
                LOG_PROMPT,
                prompt_event("cwd-session", str(event_cwd), "isolated"),
                cwd=process_cwd,
            )
            self.assertEqual(result.returncode, 0)
            event_log = event_cwd / ".claude" / "state" / "session-cwd-session.log"
            self.assertTrue(event_log.exists())
            self.assertIn("isolated", event_log.read_text(encoding="utf-8"))
            self.assertFalse((process_cwd / ".claude").exists())

    def test_missing_identity_does_not_write_default_file(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            result = run_script(
                LOG_PROMPT,
                {
                    "hook_event_name": "UserPromptSubmit",
                    "cwd": str(event_cwd),
                    "prompt": "should-not-log",
                },
            )
            self.assertEqual(result.returncode, 1)
            self.assertNotEqual(result.returncode, 2)
            self.assertIn(b"session_id", result.stderr)
            state_dir = event_cwd / ".claude" / "state"
            self.assertFalse(state_dir.exists())
            self.assertFalse((state_dir / "session-default.log").exists())

    def test_invalid_project_directory_does_not_write(self) -> None:
        with TemporaryDirectory() as raw:
            missing = Path(raw) / "missing-project"
            result = run_script(
                LOG_PROMPT,
                prompt_event("valid-session", str(missing), "should-not-log"),
            )
            self.assertEqual(result.returncode, 1)
            self.assertNotEqual(result.returncode, 2)
            self.assertIn(b"project directory", result.stderr)
            self.assertFalse(missing.exists())

    def test_path_separator_session_id_is_rejected(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            result = run_script(
                LOG_PROMPT,
                prompt_event("../escape", str(event_cwd), "should-not-log"),
            )
            self.assertEqual(result.returncode, 1)
            self.assertNotEqual(result.returncode, 2)
            self.assertFalse((event_cwd / ".claude").exists())
            self.assertFalse((event_cwd / "escape.log").exists())

    def test_truncates_prompt_to_500_characters(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            prompt = "x" * 600
            result = run_script(
                LOG_PROMPT,
                prompt_event("truncate-session", str(event_cwd), prompt),
            )
            self.assertEqual(result.returncode, 0)
            text = (event_cwd / ".claude" / "state" / "session-truncate-session.log").read_text(
                encoding="utf-8"
            )
            self.assertIn("x" * 500, text)
            self.assertNotIn("x" * 501, text)

    def test_invalid_json_is_not_a_permission_gate(self) -> None:
        result = run_script(LOG_PROMPT, b"not-json")
        self.assertEqual(result.returncode, 1)
        self.assertNotEqual(result.returncode, 2)
        self.assertIn(b"[CWF]", result.stderr)

    def test_does_not_write_repo_session_logs(self) -> None:
        with TemporaryDirectory() as raw:
            event_cwd = Path(raw)
            result = run_script(
                LOG_PROMPT,
                prompt_event("repo-isolation", str(event_cwd), "temp-only"),
                cwd=REPO_ROOT,
            )
            self.assertEqual(result.returncode, 0)
            self.assertTrue(
                (event_cwd / ".claude" / "state" / "session-repo-isolation.log").exists()
            )
            self.assertFalse((REPO_STATE / "session-repo-isolation.log").exists())


class HooksJsonTests(unittest.TestCase):
    def test_command_shape_and_source_layout(self) -> None:
        data = load_hooks_config()
        encoded = json.dumps(data)
        self.assertEqual(commands_for_event("PreToolUse"), [PRE_BASH_COMMAND])
        self.assertEqual(commands_for_event("UserPromptSubmit"), [LOG_PROMPT_COMMAND])
        self.assertNotIn("CLAUDE_TOOL_INPUT", encoded)
        self.assertNotIn("inject-spec", encoded)
        self.assertNotIn("python3", encoded)
        self.assertNotIn("Stop", data["hooks"])
        description = data.get("description")
        self.assertIsInstance(description, str)
        self.assertNotIn("session review", description.lower())
        self.assertFalse((HOOKS_DIR / "inject-spec.py").exists())

    def test_space_containing_plugin_root_from_hooks_json(self) -> None:
        with TemporaryDirectory() as raw:
            plugin_root = Path(raw) / "plugin root"
            event_cwd = Path(raw) / "project dir"
            event_cwd.mkdir()
            copy_plugin_scripts(plugin_root)
            pre_bash_command = commands_for_event("PreToolUse")[0]
            log_command = commands_for_event("UserPromptSubmit")[0]
            pre_bash_argv = argv_from_plugin_command(pre_bash_command, plugin_root)
            log_argv = argv_from_plugin_command(log_command, plugin_root)
            self.assertTrue(any("plugin root" in part for part in pre_bash_argv[1:]))

            blocked = run_process(pre_bash_argv, pretool_event(DANGEROUS_COMMAND), cwd=event_cwd)
            self.assertEqual(blocked.returncode, 2)
            self.assertIn(b"[CWF] BLOCKED", blocked.stderr)

            allowed = run_process(pre_bash_argv, pretool_event(SAFE_COMMAND), cwd=event_cwd)
            self.assertEqual(allowed.returncode, 0)

            logged = run_process(
                log_argv,
                prompt_event("json-wired", str(event_cwd), "from-hooks-json"),
                cwd=plugin_root,
            )
            self.assertEqual(logged.returncode, 0)
            log_file = event_cwd / ".claude" / "state" / "session-json-wired.log"
            self.assertTrue(log_file.exists())
            self.assertIn("from-hooks-json", log_file.read_text(encoding="utf-8"))
            self.assertFalse((plugin_root / ".claude").exists())


if __name__ == "__main__":
    unittest.main()
