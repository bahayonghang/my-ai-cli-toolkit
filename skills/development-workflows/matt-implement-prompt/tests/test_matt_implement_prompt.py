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

VALID_GITHUB_DEV_MERGE_PROMPT = """
请在当前仓库（bahayonghang/my-ai-cli-toolkit）基于 `dev` 分支，使用 `git worktree add -b feat/example .claude/worktrees/example dev` 开展隔离实施（依据：当前主工作树有未提交改动且任务图含多票并行波前），按照 `/implement-spec` 任务图波前实施父 Spec `#55` 与子票 `#56`、`#57`。不要猜测需求细节，先读取真实文件与远程 Issue。

一、任务真源与依赖波前
- 仓库：bahayonghang/my-ai-cli-toolkit，基线分支：`dev`
- 第一波（`blocked_by=0`）：`#56` 核心骨架
- 第二波（`blocked_by=#56`）：`#57` 扩展能力

二、必读顺序
1. 读取 `AGENTS.md`、`code_map.md`、`docs/agents/issue-tracker.md`
2. 实时读取 Issue：`gh issue view 55 --json number,title,body`、`gh issue view 56 --json number,title,body`、`gh api repos/bahayonghang/my-ai-cli-toolkit/issues/55/sub_issues`

三、执行、拆分提交与清零门禁
- 按 `/tdd` 先写测试再实施，合入工作分支前运行 `just ci`，全部分支完成后对相对 `dev` 的 diff 执行 `/code-review` 双轴评审。
- 必须按票据与逻辑边界拆分原子提交（含评审返修），仅使用本地 `git commit -F` 提交，禁用 `Co-authored-by`/`Made-with`/`Committed via`。
- 关单与合并前运行 `git status --short --untracked-files=all` 确认工作区干净无未提交残留，并用 `git log dev..HEAD --oneline` 核对真实提交 SHA。

四、关联 Commit SHA 的远程 Issue 关闭协议
- 本指令已明确授权在验收通过、工作区清零且本地拆分提交完成后关闭远程 Issue `#56`、`#57` 和 `#55`。
- 每张 Issue 关闭前核对 `blocked_by == 0`，先执行 `gh issue comment <n> --body-file msg.md` 记录对应真实 commit SHA 与实测输出，再执行 `gh issue close <n>`。

五、合并回 `dev`、清理与禁止边界
- 全部 Issue 关闭后切回 `dev` 执行 `git merge --no-ff feat/example`（保留拆分提交 SHA），清理临时 worktree（`git worktree remove .claude/worktrees/example`、`git worktree prune`）并删除已合并临时分支（`git branch -d feat/example`）。
- 禁止默认自动执行 `git push`（不推送 `dev` 或临时分支）。
""".strip()

VALID_GITHUB_MAIN_PR_PROMPT = """
请在当前仓库（bahayonghang/my-ai-cli-toolkit）基于 `main` 分支，使用 `git switch -c feat/example main` 新建工作分支（依据：当前主工作树干净且单路串行推进），按照 `/implement-spec` 任务图波前实施父 Spec `#55` 与子票 `#56`、`#57`。不要猜测需求细节，先读取真实文件与远程 Issue。

一、任务真源与依赖波前
- 仓库：bahayonghang/my-ai-cli-toolkit，基线分支：`main`（严禁直接向 `main` 提交或 `git push`）
- 第一波（`blocked_by=0`）：`#56` 核心骨架
- 第二波（`blocked_by=#56`）：`#57` 扩展能力

二、必读顺序
1. 读取 `AGENTS.md`、`code_map.md`、`docs/agents/issue-tracker.md`
2. 实时读取 Issue：`gh issue view 55 --json number,title,body`、`gh issue view 56 --json number,title,body`、`gh api repos/bahayonghang/my-ai-cli-toolkit/issues/55/sub_issues`

三、执行、拆分提交与清零门禁
- 按 `/tdd` 先写测试再实施，运行 `just ci` 并对相对 `main` 的 diff 执行 `/code-review` 双轴评审。
- 必须按票据与逻辑边界拆分原子提交（含评审返修），仅用本地 `git commit -F`。推送前执行 `git status --short --untracked-files=all` 确认工作区干净且 `git log main..HEAD --oneline` 非空。

四、PR 创建、关联 Commit SHA 关单与合并协议
- 推送工作分支 `git push -u origin feat/example`，执行 `gh pr create --base main --head feat/example`，在 PR 正文中写明全部拆分提交 SHA 与 `Closes #56`、`Closes #57`、`Closes #55`。
- 为每张 Issue 执行 `gh issue comment <n> --body-file msg.md` 写明对应的真实 commit SHA、PR URL 与验证实测结果。
- 确认 `gh pr checks` 通过后执行 `gh pr merge --merge --delete-branch`（若受分支保护阻塞则停止汇报 PR URL，严禁 `--admin`/`--force`），合并后复核所有子票与父 Spec 已关闭。

五、清理、本地与远端同步校验及禁止边界
- 严禁直接向 `main` 提交或 `git push`，严禁 `--force` 与 `--admin`。
- 清理任务临时分支与 worktree（`git worktree prune`），执行 `git fetch origin --prune`、`git switch main`、`git pull --ff-only origin main`，核对 `git rev-parse HEAD` 与 `origin/main` 一致且本地工作区干净同步。
""".strip()

VALID_GITHUB_MASTER_PR_PROMPT = VALID_GITHUB_MAIN_PR_PROMPT.replace("`main`", "`master`").replace(
    " main", " master"
).replace("origin/main", "origin/master")

VALID_GITHUB_BRANCH_ONLY_PROMPT = """
请在当前仓库（bahayonghang/my-ai-cli-toolkit）基于 `release/v2` 分支，新建集成分支 `feat/release-hotfix`（`git switch -c feat/release-hotfix release/v2`；依据：干净工作树单分支推进），按任务图波前实施父 Spec `#55` 与子票 `#56`、`#57`。不要猜测需求细节，先读取真实文件与远程 Issue。

一、任务真源与依赖波前
- 第一波（`blocked_by=0`）：`#56`；第二波（`blocked_by=#56`）：`#57`
- 实时读取：`gh issue view 55 --json number,title,body`、`gh api repos/bahayonghang/my-ai-cli-toolkit/issues/55/sub_issues`

二、执行、拆分提交与清零门禁
- 按 `/tdd` 先写测试再实施，跑通 `just ci` 与 `/code-review` 评审。
- 必须按票据拆分原子提交，仅用本地 `git commit -F`，提交后运行 `git status --short --untracked-files=all` 确认工作区干净。

三、关联提交关单与禁止边界
- 本指令已明确授权在验证与工作区清零后关闭 `#56`、`#57`、`#55`：核实 `blocked_by == 0`，先执行 `gh issue comment <n> --body-file msg.md` 写明真实 commit SHA 与测试结果，再执行 `gh issue close <n>`。
- 禁止执行 `git push`、合并回 `release/v2` 或创建 PR。
""".strip()

VALID_LOCAL_SCRATCH_DEV_PROMPT = """
请在当前仓库基于 `dev` 分支，新建工作分支 `feat/auth-flow`（`git switch -c feat/auth-flow dev`；依据：干净工作树且逐票串行推进），使用 `/implement` 逐票实施 `.scratch/auth-flow/issues/` 下的任务图并逐票 `/clear` 切换上下文。

一、任务真源与依赖波前
- 真源目录：`.scratch/auth-flow/issues/`（`01-core.md` 无阻塞，`02-ui.md` 依赖 `01`）。
- 开工前读取 `AGENTS.md`、`.scratch/auth-flow/spec.md` 与对应票据文件，了解依赖波前。

二、拆分提交、验证与完结协议
- 每张票据按 `/tdd` 编写测试并运行 `npm test`，完成后执行 `/code-review` 评审。
- 按票据边界拆分提交（`git commit -F`），确认 `git status --short --untracked-files=all` 工作区干净无未提交改动。
- 将对应真实提交 SHA 写入 `.scratch/auth-flow/issues/` 各票据文件并勾选验收条目，严禁虚构远程关单。

三、合并回 `dev`、清理与禁止边界
- 全部票据完成后切回 `dev` 执行 `git merge --no-ff feat/auth-flow` 并清理临时分支 `git branch -d feat/auth-flow`（及 `git worktree prune`）。
- 禁止执行 `git push`。
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
    def test_valid_github_dev_merge_prompt_passes_and_infers_defaults(self) -> None:
        proc = run_linter(
            ["--tracker", "github", "--base-branch", "dev", "--format", "json", "-"],
            stdin_text=VALID_GITHUB_DEV_MERGE_PROMPT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["delivery_mode"], "dev-merge")
        self.assertEqual(payload["close_mode"], "remote-close")
        self.assertEqual(payload["error_count"], 0)

    def test_valid_github_main_and_master_pr_prompts_pass_and_infer_defaults(self) -> None:
        for base, prompt in (
            ("main", VALID_GITHUB_MAIN_PR_PROMPT),
            ("origin/main", VALID_GITHUB_MAIN_PR_PROMPT),
            ("master", VALID_GITHUB_MASTER_PR_PROMPT),
        ):
            with self.subTest(base_branch=base):
                proc = run_linter(
                    ["--tracker", "github", "--base-branch", base, "--format", "json", "-"],
                    stdin_text=prompt,
                )
                self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
                payload = json.loads(proc.stdout)
                self.assertTrue(payload["ok"])
                self.assertEqual(payload["delivery_mode"], "main-pr")
                self.assertEqual(payload["close_mode"], "pr-close")
                self.assertEqual(payload["error_count"], 0)

    def test_valid_github_branch_only_and_explicit_override(self) -> None:
        proc = run_linter(
            ["--tracker", "github", "--base-branch", "release/v2", "--format", "json", "-"],
            stdin_text=VALID_GITHUB_BRANCH_ONLY_PROMPT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["delivery_mode"], "branch-only")
        self.assertEqual(payload["close_mode"], "remote-close")

        override = run_linter(
            [
                "--tracker",
                "github",
                "--base-branch",
                "release/v2",
                "--delivery-mode",
                "main-pr",
                "--format",
                "json",
                "-",
            ],
            stdin_text=VALID_GITHUB_MAIN_PR_PROMPT,
        )
        self.assertEqual(override.returncode, 0, override.stdout + override.stderr)
        override_payload = json.loads(override.stdout)
        self.assertEqual(override_payload["delivery_mode"], "main-pr")
        self.assertEqual(override_payload["close_mode"], "pr-close")

    def test_valid_local_scratch_dev_prompt_passes(self) -> None:
        proc = run_linter(
            ["--tracker", "local", "--base-branch", "dev", "--format", "json", "-"],
            stdin_text=VALID_LOCAL_SCRATCH_DEV_PROMPT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["delivery_mode"], "dev-merge")
        self.assertEqual(payload["close_mode"], "no-close")
        self.assertEqual(payload["error_count"], 0)

    def test_adversarial_mutations_fail_with_expected_error_codes(self) -> None:
        cases: list[tuple[str, str, list[str], str]] = [
            ("empty", "too short", ["--tracker", "github", "--base-branch", "dev"], "empty_input"),
            (
                "unresolved-braces",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("#55", "{{SPEC_NUM}}"),
                ["--tracker", "github", "--base-branch", "dev"],
                "unresolved_placeholder",
            ),
            (
                "todo-marker",
                VALID_GITHUB_DEV_MERGE_PROMPT + "\nTODO: add later",
                ["--tracker", "github", "--base-branch", "dev"],
                "unresolved_placeholder",
            ),
            (
                "angle-placeholder",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("`dev`", "<base-branch>"),
                ["--tracker", "github", "--base-branch", "dev"],
                "unresolved_placeholder",
            ),
            (
                "back-ref",
                VALID_GITHUB_DEV_MERGE_PROMPT + "\n详细步骤见上一条消息。",
                ["--tracker", "github", "--base-branch", "dev"],
                "back_reference",
            ),
            (
                "private-path",
                VALID_GITHUB_DEV_MERGE_PROMPT + "\n参考 C:\\Users\\demo-user\\secret.md",
                ["--tracker", "github", "--base-branch", "dev"],
                "private_path_leak",
            ),
            (
                "missing-source-pointer",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("gh issue view", "cat").replace("gh api", "echo"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_source_pointer",
            ),
            (
                "missing-frontier",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("波前", "清单").replace("blocked_by", "order"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_frontier",
            ),
            (
                "missing-workspace-isolation",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace(
                    "git worktree add -b feat/example .claude/worktrees/example dev",
                    "直接在当前目录操作",
                )
                .replace("工作分支", "当前分支")
                .replace("worktree remove", "clean")
                .replace("临时 worktree", "临时目录"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_workspace_isolation",
            ),
            (
                "missing-review",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("/code-review", "检查").replace("评审", "检查"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_verification_gate",
            ),
            (
                "missing-split-commit-requirement",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("拆分原子提交", "完成修改").replace("拆分提交", "修改").replace("拆分", "合并"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_split_commit_gate",
            ),
            (
                "missing-clean-tree-check",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("git status --short --untracked-files=all", "echo ok")
                .replace("工作区干净", "构建完成")
                .replace("无未提交残留", "全部完成")
                .replace("工作区清零", "验收通过")
                .replace("清零门禁", "完成门禁"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_split_commit_gate",
            ),
            (
                "missing-commit-issue-link",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("commit SHA", "结果说明").replace("提交 SHA", "结果说明").replace("Commit SHA", "结果说明"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_commit_issue_link",
            ),
            (
                "missing-dev-merge-step",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("git merge --no-ff feat/example", "echo done").replace("合并回 `dev`", "留在分支"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_dev_merge_cleanup",
            ),
            (
                "missing-dev-cleanup-step",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("git worktree remove .claude/worktrees/example", "echo ok")
                .replace("git worktree prune", "echo ok")
                .replace("git branch -d feat/example", "echo ok")
                .replace("清理", "保留")
                .replace("删除已合并临时分支", "保留临时分支"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_dev_merge_cleanup",
            ),
            (
                "contradictory-dev-merge-prohibition",
                VALID_GITHUB_DEV_MERGE_PROMPT + "\n禁止擅自合并回 `dev`。",
                ["--tracker", "github", "--base-branch", "dev"],
                "contradictory_delivery_policy",
            ),
            (
                "missing-main-direct-push-guard",
                VALID_GITHUB_MAIN_PR_PROMPT.replace("严禁直接向 `main` 提交或 `git push`", "尽量少改 `main`"),
                ["--tracker", "github", "--base-branch", "main"],
                "missing_main_pr_sync",
            ),
            (
                "missing-main-pr-merge",
                VALID_GITHUB_MAIN_PR_PROMPT.replace("gh pr merge --merge --delete-branch", "echo waiting").replace("合并协议", "推送协议"),
                ["--tracker", "github", "--base-branch", "main"],
                "missing_main_pr_sync",
            ),
            (
                "missing-main-sync",
                VALID_GITHUB_MAIN_PR_PROMPT.replace("git fetch origin --prune", "echo ok")
                .replace("git pull --ff-only origin main", "echo ok")
                .replace("同步校验", "收尾检查")
                .replace("干净同步", "干净"),
                ["--tracker", "github", "--base-branch", "main"],
                "missing_main_pr_sync",
            ),
            (
                "missing-main-cleanup",
                VALID_GITHUB_MAIN_PR_PROMPT.replace("--delete-branch", "")
                .replace("git worktree prune", "echo ok")
                .replace("清理、本地与远端同步校验", "本地与远端同步校验")
                .replace("清理任务临时分支与 worktree", "保留现场"),
                ["--tracker", "github", "--base-branch", "main"],
                "missing_main_pr_sync",
            ),
            (
                "contradictory-main-pr-prohibition",
                VALID_GITHUB_MAIN_PR_PROMPT + "\n默认不要自动创建远端 PR。",
                ["--tracker", "github", "--base-branch", "main"],
                "contradictory_delivery_policy",
            ),
            (
                "missing-push-boundary",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("git push", "外部上传"),
                ["--tracker", "github", "--base-branch", "dev"],
                "missing_commit_boundary",
            ),
            (
                "missing-comment-before-close",
                VALID_GITHUB_DEV_MERGE_PROMPT.replace("gh issue comment", "echo done"),
                ["--tracker", "github", "--base-branch", "dev", "--close-mode", "remote-close"],
                "missing_close_protocol",
            ),
            (
                "pr-close-missing-issue-comment",
                VALID_GITHUB_MAIN_PR_PROMPT.replace("gh issue comment", "echo done"),
                ["--tracker", "github", "--base-branch", "main", "--close-mode", "pr-close"],
                "missing_close_protocol",
            ),
            (
                "unexpected-close-in-local",
                VALID_LOCAL_SCRATCH_DEV_PROMPT + "\n顺便跑 gh issue close 12",
                ["--tracker", "local", "--base-branch", "dev", "--close-mode", "no-close"],
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
            prompt_file.write_text(VALID_GITHUB_DEV_MERGE_PROMPT, encoding="utf-8")
            proc = run_linter(["--tracker", "github", "--base-branch", "dev", "--format", "json", str(prompt_file)])
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
        self.assertGreaterEqual(len(payload.get("evals", [])), 7)


if __name__ == "__main__":
    unittest.main()
