"""Deterministic contract and audit tests for in-your-own-words."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

import yaml


SKILL_ROOT = Path(__file__).resolve().parents[1]
CHECKER = SKILL_ROOT / "scripts" / "check_playback.py"

ZH_BRIEF = "最近老有用户反馈登录态动不动掉线，你帮我看下是不是 token 刷新那里竞态了，顺便把重连稳一点。"

VALID_ZH_PLAYBACK = """
- **目标**：把异常掉线率压下来，让用户在短时网络抖动或凭证临期时保持无缝登录，不打断正在进行的操作。
- **要解决的问题**：并发请求同时触发凭证续期可能使旧凭证提前失效，加上断线重连缺乏退避和状态恢复，导致原本可自愈的瞬时故障直接踢出用户。
- **成功标准**：并发请求下续期动作只执行一次且其余请求复用新凭证；模拟网络抖动后会话可自动恢复，相关登录与回归测试全部通过。
- **关键假设与分叉**：
  1. 优先排查客户端请求拦截器与刷新锁，暂不调整服务端签发 TTL 策略。
  2. 确认无法恢复的凭证失效时只做一次明确登出提示，不做静默死循环重试。

我理解得对吗？哪里有偏差或漏掉的约束请直接纠正，确认后再动手。
""".strip()

EN_BRIEF = "Our CI is getting super slow, can you speed up the test suite without losing coverage?"

VALID_EN_PLAYBACK = """
- **Goal**: Cut CI wall-clock feedback time meaningfully while preserving the exact same regression coverage on pull requests.
- **Problem**: The pipeline is likely bottlenecked by serial job scheduling, repeated dependency setup, or running heavy suites redundantly on every push rather than missing tests.
- **Success check**: Clean CI runs finish noticeably faster with zero skipped tests or lowered assertion coverage.
- **Assumptions & open forks**:
  1. I am assuming we want to optimize caching and parallelism first instead of moving suites to nightly-only runs.

Did I get that right? Correct me anywhere I drifted before I start.
""".strip()


def run_checker(args: list[str], *, stdin_text: str) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"}
    return subprocess.run(
        [sys.executable, str(CHECKER), *args],
        input=stdin_text,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
        check=False,
    )


class PlaybackCheckerTests(unittest.TestCase):
    def test_valid_zh_and_en_playbacks_pass(self) -> None:
        cases = (
            ("zh-standalone", [], VALID_ZH_PLAYBACK),
            ("zh-with-brief", ["--brief", ZH_BRIEF], VALID_ZH_PLAYBACK),
            ("en-standalone", [], VALID_EN_PLAYBACK),
            ("en-with-brief", ["--brief", EN_BRIEF], VALID_EN_PLAYBACK),
        )
        for label, extra_args, payload in cases:
            with self.subTest(case=label):
                proc = run_checker([*extra_args, "--format", "json", "-"], stdin_text=payload)
                self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
                parsed = json.loads(proc.stdout)
                self.assertTrue(parsed["ok"])
                self.assertEqual(parsed["error_count"], 0)

    def test_missing_required_sections_fail(self) -> None:
        cases = (
            (
                "missing_goal",
                "- **问题**：token 刷新存在竞态导致掉线。\n- **成功标准**：并发测试全绿。\n确认后再动手？",
                "missing_goal",
            ),
            (
                "missing_problem",
                "- **目标**：让用户保持稳定登录。\n- **成功标准**：登录与回归测试全绿。\n我理解得对吗？",
                "missing_problem",
            ),
            (
                "missing_success_check",
                "- **目标**：保持稳定登录。\n- **问题**：token 刷新发生竞态且重连脆弱。\n我理解得对吗？",
                "missing_success_check",
            ),
            (
                "missing_confirmation_stop",
                "- **目标**：保持稳定登录。\n- **问题**：token 刷新发生竞态。\n- **成功标准**：登录测试全绿。\n现在进入下一步分析。",
                "missing_confirmation_stop",
            ),
        )
        for label, text, expected_code in cases:
            with self.subTest(case=label):
                proc = run_checker(["--format", "json", "-"], stdin_text=text)
                self.assertEqual(proc.returncode, 1)
                parsed = json.loads(proc.stdout)
                codes = {item["code"] for item in parsed["errors"]}
                self.assertIn(expected_code, codes)

    def test_verbatim_parroting_is_rejected(self) -> None:
        zh_echo = (
            "- **目标**：最近老有用户反馈登录态动不动掉线，你帮我看下是不是 token 刷新那里竞态了，顺便把重连稳一点。\n"
            "- **问题**：用户反馈登录态动不动掉线，可能是 token 刷新竞态了，重连不够稳。\n"
            "- **成功标准**：看下竞态并把重连稳一点。\n"
            "我理解得对吗？"
        )
        en_echo = (
            "- **Goal**: Speed up the test suite without losing coverage because our CI is getting super slow.\n"
            "- **Problem**: Our CI is getting super slow and needs to speed up the test suite without losing coverage.\n"
            "- **Success check**: Our CI is no longer super slow without losing coverage.\n"
            "Did I get that right?"
        )
        for label, brief, playback in (("zh-echo", ZH_BRIEF, zh_echo), ("en-echo", EN_BRIEF, en_echo)):
            with self.subTest(case=label):
                proc = run_checker(["--brief", brief, "--format", "json", "-"], stdin_text=playback)
                self.assertEqual(proc.returncode, 1)
                codes = {item["code"] for item in json.loads(proc.stdout)["errors"]}
                self.assertIn("verbatim_parroting", codes)

    def test_premature_execution_is_rejected(self) -> None:
        diff_playback = VALID_ZH_PLAYBACK + "\n\n```diff\ndiff --git a/auth.ts b/auth.ts\n@@ -1,2 +1,2 @@\n-a\n+b\n```"
        acted_playback = VALID_EN_PLAYBACK + "\n\nI have updated auth.ts as a quick start."
        for label, text in (("diff", diff_playback), ("acted", acted_playback)):
            with self.subTest(case=label):
                proc = run_checker(["--format", "json", "-"], stdin_text=text)
                self.assertEqual(proc.returncode, 1)
                codes = {item["code"] for item in json.loads(proc.stdout)["errors"]}
                self.assertIn("premature_execution", codes)

    def test_questionnaire_overflow_and_placeholders_fail(self) -> None:
        many_questions = (
            VALID_ZH_PLAYBACK
            + "\n1. 要改客户端吗？\n2. 要改服务端吗？\n3. 超时设几秒？\n4. 要写端到端测试吗？\n5. 需要兼容旧版本吗？"
        )
        proc_q = run_checker(["--format", "json", "-"], stdin_text=many_questions)
        self.assertEqual(proc_q.returncode, 1)
        self.assertIn("questionnaire_overflow", {e["code"] for e in json.loads(proc_q.stdout)["errors"]})

        placeholder = VALID_EN_PLAYBACK + "\n- Extra assumption: TODO confirm {{target_env}}."
        proc_p = run_checker(["--format", "json", "-"], stdin_text=placeholder)
        self.assertEqual(proc_p.returncode, 1)
        self.assertIn("unresolved_placeholder", {e["code"] for e in json.loads(proc_p.stdout)["errors"]})


class PackageContractTests(unittest.TestCase):
    def test_frontmatter_and_package_integrity(self) -> None:
        skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertTrue(skill_text.startswith("---\n"))
        parts = skill_text.split("---\n", 2)
        fm = yaml.safe_load(parts[1])
        self.assertEqual(fm["name"], "in-your-own-words")
        self.assertEqual(fm["category"], "development-workflows")
        self.assertEqual(fm["version"], "0.1.0")
        self.assertNotIn("<", fm["description"])
        self.assertNotIn(">", fm["description"])
        self.assertLessEqual(len(fm["description"].strip()), 1024)
        self.assertNotIn("disable-model-invocation", fm)
        self.assertIsInstance(fm["allowed-tools"], str)

        for rel in re.findall(r"\]\(([^)]+\.md)\)", skill_text):
            self.assertTrue((SKILL_ROOT / rel).is_file(), f"Missing link target: {rel}")

        nested_skills = [p for p in SKILL_ROOT.rglob("SKILL.md") if p != SKILL_ROOT / "SKILL.md"]
        self.assertEqual(nested_skills, [])

        manifest = json.loads((SKILL_ROOT / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["name"], "in-your-own-words")
        self.assertEqual(manifest["version"], "0.1.0")
        self.assertEqual(manifest["maturity_tier"], "production")
        readme_text = (SKILL_ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn(manifest["upstream_inspiration"], readme_text)

        interface = yaml.safe_load((SKILL_ROOT / "agents" / "interface.yaml").read_text(encoding="utf-8"))
        self.assertEqual(
            set(interface["compatibility"]["adapter_targets"]),
            {"openai", "claude", "generic", "agent-skills-compatible"},
        )


if __name__ == "__main__":
    unittest.main()
