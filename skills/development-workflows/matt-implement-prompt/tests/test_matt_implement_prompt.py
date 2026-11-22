"""Deterministic contract tests for matt-implement-prompt."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
LINTER = SKILL_ROOT / "scripts" / "lint_implement_prompt.py"

VALID_GITHUB_PROMPT = """
请在当前仓库（bahayonghang/my-ai-cli-toolkit）基于当前干净的 `dev` 分支新建集成分支 `feat/example`，按照 `/implement-spec` 任务图波前实施父 Spec `#55` 与子票 `#56`、`#57`。不要猜测需求细节，先读取真实文件与远程 Issue。

一、任务真源与依赖波前
- 第一波（`blocked_by=0`）：`#56` 核心骨架
- 第二波（`blocked_by=#56`）：`#57` 扩展能力

二、必读顺序
1. 读取 `AGENTS.md`、`code_map.md`、`docs/agents/issue-tracker.md`
2. 实时读取 Issue：`gh issue view 55 --json number,title,body`、`gh issue view 56 --json number,title,body`、`gh api repos/bahayonghang/my-ai-cli-toolkit/issues/55/sub_issues`

三、执行与验证纪律
- 按 `/tdd` 先写测试再实施，合入集成分支前运行 `just ci`，全部分支完成后对相对 `dev` 的 diff 执行 `/code-review` 双轴评审。
- 仅使用本地 `git commit -F` 提交。

四、远程 Issue 关闭授权与操作协议
- 本指令已明确授权在验收与本地验证通过后关闭远程 Issue `#56`、`#57` 和 `#55`。
- 每张 Issue 关闭前核对 `blocked_by == 0`，先执行 `gh issue comment <n> --body-file msg.md` 记录提交 SHA 与实测输出，再执行 `gh issue close <n>`。

五、禁止边界
- 禁止自动执行 `git push` 或合并回 `dev`。
""".strip()

VALID_LOCAL_PROMPT = """
请在当前仓库基于当前 `main` 分支，使用 `/implement` 逐票实施 `.scratch/auth-flow/issues/` 下的任务图并逐票 `/clear` 切换上下文。

一、任务真源与依赖波前
- 真源目录：`.scratch/auth-flow/issues/`（`01-core.md` 无阻塞，`02-ui.md` 依赖 `01`）。
- 开工前读取 `AGENTS.md`、`.scratch/auth-flow/spec.md` 与对应票据文件，了解依赖波前。

二、验证与收尾边界
- 每张票据按 `/tdd` 编写测试并运行 `npm test`，完成后执行 `/code-review` 评审并本地提交。
- 禁止执行 `git push`。本地更新票据验收勾选框即可。
""".strip()


def run_linter(
    args: list[str],
    *,
    stdin_text: str | None = None,
) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"}
    return subprocess.run(
        [sys.executable, str(LINTER), *args],
        input=stdin_text,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
        check=False,
    )


class LinterContractTests(unittest.TestCase):
    def test_valid_github_remote_close_prompt_passes_via_stdin(self) -> None:
        proc = run_linter(
            ["--tracker", "github", "--close-mode", "remote-close", "--format", "json", "-"],
            stdin_text=VALID_GITHUB_PROMPT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["error_count"], 0)

    def test_valid_local_scratch_prompt_passes(self) -> None:
        proc = run_linter(
            ["--tracker", "local", "--close-mode", "no-close", "--format", "json", "-"],
            stdin_text=VALID_LOCAL_PROMPT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["error_count"], 0)

    def test_adversarial_mutations_fail_with_expected_error_codes(self) -> None:
        cases: list[tuple[str, str, list[str], str]] = [
            ("empty", "too short", ["--tracker", "github"], "empty_input"),
            (
                "unresolved-braces",
                VALID_GITHUB_PROMPT.replace("#55", "{{SPEC_NUM}}"),
                ["--tracker", "github"],
                "unresolved_placeholder",
            ),
            (
                "todo-marker",
                VALID_GITHUB_PROMPT + "\nTODO: add later",
                ["--tracker", "github"],
                "unresolved_placeholder",
            ),
            (
                "angle-placeholder",
                VALID_GITHUB_PROMPT.replace("`dev`", "<base-branch>"),
                ["--tracker", "github"],
                "unresolved_placeholder",
            ),
            (
                "back-ref",
                VALID_GITHUB_PROMPT + "\n详细步骤见上一条消息。",
                ["--tracker", "github"],
                "back_reference",
            ),
            (
                "private-path",
                VALID_GITHUB_PROMPT + "\n参考 C:\\Users\\demo-user\\secret.md",
                ["--tracker", "github"],
                "private_path_leak",
            ),
            (
                "missing-source-pointer",
                VALID_GITHUB_PROMPT.replace("gh issue view", "cat").replace("gh api", "echo"),
                ["--tracker", "github"],
                "missing_source_pointer",
            ),
            (
                "missing-frontier",
                VALID_GITHUB_PROMPT.replace("波前", "清单").replace("blocked_by", "order"),
                ["--tracker", "github"],
                "missing_frontier",
            ),
            (
                "missing-review",
                VALID_GITHUB_PROMPT.replace("/code-review", "检查").replace("评审", "检查"),
                ["--tracker", "github"],
                "missing_verification_gate",
            ),
            (
                "missing-push-boundary",
                VALID_GITHUB_PROMPT.replace("git push", "外部上传"),
                ["--tracker", "github"],
                "missing_commit_boundary",
            ),
            (
                "missing-comment-before-close",
                VALID_GITHUB_PROMPT.replace("gh issue comment", "echo done"),
                ["--tracker", "github", "--close-mode", "remote-close"],
                "missing_close_protocol",
            ),
            (
                "unexpected-close-in-local",
                VALID_LOCAL_PROMPT + "\n顺便跑 gh issue close 12",
                ["--tracker", "local", "--close-mode", "no-close"],
                "unexpected_close_command",
            ),
        ]
        for label, body, cli_args, expected_code in cases:
            with self.subTest(case=label):
                proc = run_linter([*cli_args, "--format", "json", "-"], stdin_text=body)
                self.assertEqual(proc.returncode, 1, f"{label}: expected failure, got {proc.stdout}")
                codes = {item["code"] for item in json.loads(proc.stdout)["errors"]}
                self.assertIn(expected_code, codes, f"{label}: got codes={codes}")

    def test_non_ascii_directory_file_input_works(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            nested = Path(tmp) / "中文目录"
            nested.mkdir(parents=True)
            prompt_file = nested / "实施提示词.md"
            prompt_file.write_text(VALID_GITHUB_PROMPT, encoding="utf-8")
            proc = run_linter(["--tracker", "github", "--format", "json", str(prompt_file)])
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertTrue(json.loads(proc.stdout)["ok"])


class PackageInvariantsTests(unittest.TestCase):
    def test_single_skill_md_entrypoint_and_budget(self) -> None:
        entrypoints = sorted(p.relative_to(SKILL_ROOT).as_posix() for p in SKILL_ROOT.rglob("SKILL.md"))
        self.assertEqual(entrypoints, ["SKILL.md"])
        skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertLessEqual(len(skill_text.encode("utf-8")), 14000)

    def test_skill_md_relative_links_exist(self) -> None:
        skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        for target in re.findall(r"\]\(([^)]+\.(?:md|py|json|yaml))\)", skill_text):
            if target.startswith(("http://", "https://", "#")):
                continue
            self.assertTrue((SKILL_ROOT / target).is_file(), f"Broken link in SKILL.md: {target}")

    def test_evals_json_matches_skill_name(self) -> None:
        payload = json.loads((SKILL_ROOT / "evals" / "evals.json").read_text(encoding="utf-8"))
        self.assertEqual(payload.get("skill_name"), "matt-implement-prompt")
        self.assertGreaterEqual(len(payload.get("evals", [])), 5)


if __name__ == "__main__":
    unittest.main()
