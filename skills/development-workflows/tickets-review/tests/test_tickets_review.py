#!/usr/bin/env python3
"""Unit tests for skills/development-workflows/tickets-review."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = SKILL_DIR / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import lint_ticket_handoff as linter  # noqa: E402
import ticket_precheck as precheck  # noqa: E402
import write_ticket_review_report as writer  # noqa: E402


VALID_ZH_REPORT = """---
skill: tickets-review
version: 0.1.0
tracker: github
target: owner/demo-repo
scope_mode: spec-graph
scope_slug: github-spec-63
ticket_count: 2
tickets:
  - "#63"
  - "#64"
verdict: 需返回规划
blocking: 1
should_fix: 0
notes: 1
base_commit: abc1234
generated_at: 2026-11-24T22:00:00Z
---

# Tickets 审阅报告

## 审阅范围

- 追踪器：github（`owner/demo-repo`）
- 作用域模式：spec-graph（`github-spec-63`）
- 成员总览：
  - `#63`（open）— Parent Spec
  - `#64`（open）— Child Ticket

## 结论

需返回规划 — 阻断 1 / 应修 0 / 提示 1

## 问题清单

### TKR-01 · 阻断 · 缺少离线构建入口

- Owner: #64
- Affected tickets: #63, #64
- Location: #64 验收条件第 2 条
- Claim: 要求离线重建目录
- Evidence: scripts/build_catalog.py:946-960
- Impact: AFK 执行时无法在无外部仓库时跑通重建
- Route: 方案 A 新增局部重建参数；方案 B 明确手工同步加单测

## 未能核实

- 浏览器渲染截图 — 当前会话未配置无头浏览器

## 可靠部分

- 原生父子与阻塞关系绑定完整

## 盲区

AI Agent 审阅由 Agent 或团队撰写的 tickets 并非独立的人类评审；审阅者与起草者可能共享相似盲区。请将本报告作为修订分诊清单，而非最终签收。
"""

VALID_EN_REPORT = """---
skill: tickets-review
version: 0.1.0
tracker: local
target: .scratch/auth/issues
scope_mode: local-dir
scope_slug: local-auth
ticket_count: 1
tickets:
  - "01-login.md"
verdict: Ready
blocking: 0
should_fix: 0
notes: 0
base_commit: abc1234
generated_at: 2026-11-24T22:00:00Z
---

# Tickets Review Report

## Review Scope

- Tracker: local (`.scratch/auth/issues`)

## Verdict

Ready — blocking 0 / should-fix 0 / notes 0

## Findings

None

## Unverified

None

## Sound Parts

- All cited files exist in the repository.

## Blind Spots

An AI agent reviewing tickets is not an independent human review. Treat this report as a triage list, not an approval.
"""


def make_git_repo(tmp: Path) -> Path:
    repo = tmp / "repo"
    repo.mkdir()
    subprocess.run(["git", "init", "-q"], cwd=str(repo), check=True)
    (repo / "src").mkdir()
    (repo / "src" / "app.py").write_text("print('ok')\n", encoding="utf-8", newline="\n")
    (repo / "docs" / "agents").mkdir(parents=True)
    (repo / "docs" / "agents" / "triage-labels.md").write_text(
        "| `ready-for-agent` | `ready-for-agent` | AFK |\n",
        encoding="utf-8",
        newline="\n",
    )
    return repo


class TicketPrecheckTests(unittest.TestCase):
    def test_snapshot_detects_signals_and_passes_when_acyclic(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            snapshot = {
                "tracker": "github",
                "target": "owner/demo",
                "scope_mode": "spec-graph",
                "spec_num": 63,
                "open_prs": [],
                "tickets": [
                    {
                        "id": "#63",
                        "number": 63,
                        "title": "Parent Spec",
                        "state": "open",
                        "is_pr": False,
                        "labels": ["ready-for-agent"],
                        "body": "See https://github.com/owner/demo/blob/main/src/missing.py and TODO",
                        "sub_issues": [{"id": "#64", "number": 64, "state": "open"}],
                        "blocked_by": [],
                    },
                    {
                        "id": "#64",
                        "number": 64,
                        "title": "Child",
                        "state": "open",
                        "is_pr": False,
                        "labels": ["ready-for-agent"],
                        "body": "Blocked by: #65\nReal body content.",
                        "sub_issues": [],
                        "blocked_by": [],
                    },
                ],
            }
            snap_file = Path(tmp) / "snap.json"
            snap_file.write_text(json.dumps(snapshot), encoding="utf-8", newline="\n")
            out_file = Path(tmp) / "precheck.json"

            code = precheck.main(
                [
                    "--snapshot",
                    str(snap_file),
                    "--repo-root",
                    str(repo),
                    "--output",
                    str(out_file),
                ]
            )
            self.assertEqual(code, 0)
            result = json.loads(out_file.read_text(encoding="utf-8"))
            self.assertTrue(result["ok"])
            self.assertEqual(result["scope_slug"], "github-spec-63")
            self.assertEqual(result["report_rel"], "reports/tickets-review/github-spec-63.md")
            signal_codes = {s["code"] for s in result["signals"]}
            self.assertIn("parent_spec_has_execution_label", signal_codes)
            self.assertIn("body_vs_native_dependency_drift", signal_codes)
            self.assertIn("placeholder_residue", signal_codes)
            self.assertIn("missing_repo_path_ref", signal_codes)

    def test_snapshot_fails_closed_on_cycle_and_pr_number(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            snapshot = {
                "tracker": "github",
                "target": "owner/demo",
                "scope_mode": "selected-issues",
                "tickets": [
                    {
                        "id": "#10",
                        "title": "A",
                        "state": "open",
                        "is_pr": False,
                        "labels": [],
                        "body": "ok",
                        "sub_issues": [],
                        "blocked_by": [{"id": "#11"}],
                    },
                    {
                        "id": "#11",
                        "title": "B",
                        "state": "open",
                        "is_pr": False,
                        "labels": [],
                        "body": "ok",
                        "sub_issues": [],
                        "blocked_by": [{"id": "#10"}],
                    },
                    {
                        "id": "#12",
                        "title": "PR",
                        "state": "open",
                        "is_pr": True,
                        "labels": [],
                        "body": "pr body",
                        "sub_issues": [],
                        "blocked_by": [],
                    },
                ],
            }
            snap_file = Path(tmp) / "bad.json"
            snap_file.write_text(json.dumps(snapshot), encoding="utf-8", newline="\n")
            out_file = Path(tmp) / "bad-out.json"
            code = precheck.main(
                [
                    "--snapshot",
                    str(snap_file),
                    "--repo-root",
                    str(repo),
                    "--output",
                    str(out_file),
                ]
            )
            self.assertEqual(code, 1)
            result = json.loads(out_file.read_text(encoding="utf-8"))
            err_codes = {e["code"] for e in result["blocking_errors"]}
            self.assertIn("dependency_cycle", err_codes)
            self.assertIn("pr_number_in_issue_scope", err_codes)

    def test_local_scratch_collection_and_escape_guard(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            feat = repo / ".scratch" / "billing-v2"
            issues_dir = feat / "issues"
            issues_dir.mkdir(parents=True)
            (feat / "spec.md").write_text("# Billing Spec\nScope text.\n", encoding="utf-8")
            (issues_dir / "01-schema.md").write_text(
                "---\nid: 01-schema\nstatus: open\nlabels: ready-for-agent\nblocked_by: None\n---\n# Schema\nDetails.\n",
                encoding="utf-8",
            )
            (issues_dir / "02-api.md").write_text(
                "ID: 02-api\nStatus: open\nBlocked by: 01-schema\n# API\nDetails.\n",
                encoding="utf-8",
            )

            raw = precheck.collect_local_scope(repo, ".scratch/billing-v2/issues")
            report = precheck.analyze_scope(raw, repo)
            self.assertTrue(report["ok"])
            self.assertEqual(report["scope_slug"], "local-billing-v2")
            self.assertEqual(report["ticket_count"], 3)

            outside = Path(tmp) / "outside"
            outside.mkdir()
            with self.assertRaises(precheck.PrecheckError):
                precheck.collect_local_scope(repo, str(outside))


class WriteReportTests(unittest.TestCase):
    def test_atomic_write_valid_zh_and_en_reports_and_gitignore_note(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            draft = Path(tmp) / "draft.md"
            draft.write_text(VALID_ZH_REPORT, encoding="utf-8", newline="\n")

            proc = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPTS_DIR / "write_ticket_review_report.py"),
                    "--repo-root",
                    str(repo),
                    "--scope-slug",
                    "github-spec-63",
                    "--input",
                    str(draft),
                ],
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["rel_path"], "reports/tickets-review/github-spec-63.md")
            self.assertEqual(payload["git_state"], "untracked")
            self.assertIn("neither gitignored nor tracked", proc.stderr)
            self.assertFalse((repo / ".gitignore").exists())
            dest = repo / "reports" / "tickets-review" / "github-spec-63.md"
            self.assertTrue(dest.is_file())
            self.assertNotIn(b"\r", dest.read_bytes())

            en_draft = Path(tmp) / "en.md"
            en_draft.write_text(VALID_EN_REPORT, encoding="utf-8", newline="\n")
            code = writer.main(
                [
                    "--repo-root",
                    str(repo),
                    "--scope-slug",
                    "local-auth",
                    "--input",
                    str(en_draft),
                ]
            )
            self.assertEqual(code, 0)

    def test_rejects_path_escape_missing_sections_and_personal_path_leak(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            with self.assertRaises(writer.WriteError):
                writer.resolve_destination(repo, "../escape")
            with self.assertRaises(writer.WriteError):
                writer.validate_report_content("# Missing frontmatter\n")
            leaked = VALID_ZH_REPORT.replace(
                "scripts/build_catalog.py:946-960",
                r"C:\Users\alice\project\scripts\build_catalog.py:946",
            )
            with self.assertRaises(writer.WriteError) as ctx:
                writer.validate_report_content(leaked)
            self.assertIn("personal absolute path", str(ctx.exception))

            leaked_posix = VALID_EN_REPORT.replace(
                "All cited files exist",
                "Checked /Users/alice/work/repo/app.py",
            )
            with self.assertRaises(writer.WriteError):
                writer.validate_report_content(leaked_posix)

    def test_refuses_preexisting_tmp_sibling(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_git_repo(Path(tmp))
            target_dir = repo / "reports" / "tickets-review"
            target_dir.mkdir(parents=True)
            (target_dir / "github-spec-63.md.tmp").write_text("stale", encoding="utf-8")
            with self.assertRaises(writer.WriteError):
                writer.atomic_write(target_dir / "github-spec-63.md", VALID_ZH_REPORT)


class HandoffLinterTests(unittest.TestCase):
    def _extract_template(self, lang_heading: str) -> str:
        text = (SKILL_DIR / "references" / "handoff-prompt.md").read_text(encoding="utf-8")
        pattern = rf"## {re.escape(lang_heading)}\s+```text\n(.*?)\n```"
        match = re.search(pattern, text, re.DOTALL)
        self.assertIsNotNone(match, f"template section {lang_heading} not found")
        assert match is not None
        return match.group(1)

    def _fill(self, template: str, tracker: str, report_rel: str) -> str:
        replacements = {
            "{{target_ref}}": "owner/demo-repo" if tracker == "github" else ".scratch/auth/issues",
            "{{tracker_mode}}": tracker,
            "{{scope_summary}}": "Spec #63 and children #64-#68" if tracker == "github" else "local auth tickets",
            "{{ticket_count}}": "6" if tracker == "github" else "2",
            "{{ticket_ids}}": "#63, #64, #65, #66, #67, #68" if tracker == "github" else "01-schema.md, 02-api.md",
            "{{report_rel}}": report_rel,
            "{{verdict}}": "需返回规划" if "定位" in template else "Return to planning",
            "{{counts}}": "阻断 3 / 应修 4 / 提示 3" if "定位" in template else "blocking 3 / should-fix 4 / notes 3",
        }
        filled = template
        for key, value in replacements.items():
            filled = filled.replace(key, value)
        if tracker == "local":
            lines = [
                line
                for line in filled.splitlines()
                if "gh issue" not in line and "远程 GitHub Issues" not in line and "Remote GitHub Issues" not in line
            ]
            filled = "\n".join(lines)
        return filled

    def test_filled_zh_and_en_templates_pass_with_zero_errors(self) -> None:
        for heading in ("Chinese", "English"):
            tpl = self._extract_template(heading)
            gh_prompt = self._fill(tpl, "github", "reports/tickets-review/github-spec-63.md")
            res_gh = linter.lint_handoff(
                gh_prompt, tracker="github", report_rel="reports/tickets-review/github-spec-63.md"
            )
            self.assertTrue(res_gh["ok"], f"{heading} github failed: {res_gh}")
            self.assertEqual(res_gh["warnings"], [], f"{heading} github warnings: {res_gh}")

            local_prompt = self._fill(tpl, "local", "reports/tickets-review/local-auth.md")
            res_local = linter.lint_handoff(
                local_prompt, tracker="local", report_rel="reports/tickets-review/local-auth.md"
            )
            self.assertTrue(res_local["ok"], f"{heading} local failed: {res_local}")

    def test_linter_catches_placeholders_backrefs_leaks_and_tracker_violations(self) -> None:
        raw_zh = self._extract_template("Chinese")
        res_placeholder = linter.lint_handoff(raw_zh, tracker="github")
        self.assertFalse(res_placeholder["ok"])
        codes = {e["code"] for e in res_placeholder["errors"]}
        self.assertIn("unresolved_placeholder", codes)

        bad_prompt = self._fill(raw_zh, "github", "reports/tickets-review/github-spec-63.md")
        bad_prompt += "\n见上一条消息，路径 C:\\Users\\alice\\repo。\n"
        res_bad = linter.lint_handoff(
            bad_prompt, tracker="github", report_rel="reports/tickets-review/github-spec-63.md"
        )
        bad_codes = {e["code"] for e in res_bad["errors"]}
        self.assertIn("chat_backreference", bad_codes)
        self.assertIn("personal_path_leak", bad_codes)

        # Unstripped GitHub template must fail local tracker check
        unstripped_local = self._fill(raw_zh, "github", "reports/tickets-review/local-auth.md")
        res_local_bad = linter.lint_handoff(
            unstripped_local, tracker="local", report_rel="reports/tickets-review/local-auth.md"
        )
        self.assertIn(
            "local_mentions_gh_mutation", {e["code"] for e in res_local_bad["errors"]}
        )


class PackageContractTests(unittest.TestCase):
    def test_skill_links_and_budget(self) -> None:
        skill_md = SKILL_DIR / "SKILL.md"
        text = skill_md.read_text(encoding="utf-8")
        self.assertLess(len(text.encode("utf-8")), 14_000)
        for rel in re.findall(r"\]\(([^)]+\.(?:md|py|json))\)", text):
            if rel.startswith(("http://", "https://", "#")):
                continue
            self.assertTrue((SKILL_DIR / rel).is_file(), f"missing linked file: {rel}")


if __name__ == "__main__":
    unittest.main()
