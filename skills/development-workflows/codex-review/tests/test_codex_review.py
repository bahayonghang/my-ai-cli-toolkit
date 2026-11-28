import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "review.py"


class CodexReviewTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.repo = self.root / "working copy"
        self.bin = self.root / "bin"
        self.repo.mkdir()
        self.bin.mkdir()
        self.env = dict(os.environ, PATH=str(self.bin) + os.pathsep + os.environ["PATH"],
                        PYTHONIOENCODING="utf-8", RECEIPTS=str(self.root / "calls"),
                        GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
        self.git("init", "-q", "-b", "main")
        self.git("config", "user.email", "fixture@example.test")
        self.git("config", "user.name", "Fixture")
        self.tool("codex", """
import json, os, sys
from pathlib import Path
if '--version' in sys.argv:
    print('codex-cli fixture')
    sys.exit()
prompt = sys.stdin.read()
data = json.loads(prompt.split('Return the requested JSON structure.\\n', 1)[1])
assert '--sandbox' in sys.argv and 'read-only' in sys.argv and '--ignore-user-config' in sys.argv
assert Path.cwd() != Path(os.environ['RECEIPTS']).parent / 'working copy'
with open(os.environ['RECEIPTS'], 'a', encoding='utf-8') as f:
    f.write(json.dumps(data) + '\\n')
mode = os.environ.get('FAKE_MODE')
if mode == 'fail' or (mode == 'second' and len(Path(os.environ['RECEIPTS']).read_text().splitlines()) == 2):
    sys.exit(8)
if mode == 'slow':
    import time
    time.sleep(30)
if mode == 'wrong_line' or (mode == 'old_context' and data['evidence'][0]['first_line'] > 1):
    record = data['evidence'][0]
    issue = dict(path=record['path'], layer=record['layer'], line=999 if mode == 'wrong_line' else 1,
                 priority='P2', problem='fixture', verify='fixture')
    Path('response.json').write_text(json.dumps(dict(findings=[issue], limits=[])))
    sys.exit()
if mode != 'empty':
    Path('response.json').write_text('bad' if mode == 'bad' else '{"findings":[],"limits":[]}', encoding='utf-8')
""")

    def tool(self, name, code):
        source = self.bin / (name + ".py")
        source.write_text(code, encoding="utf-8")
        if os.name == "nt":
            (self.bin / (name + ".cmd")).write_text(f'@"{sys.executable}" "{source}" %*\n')
        else:
            entry = self.bin / name
            entry.write_text("#!/bin/sh\nexec " + shlex.quote(sys.executable) + " " +
                             shlex.quote(str(source)) + ' "$@"\n')
            entry.chmod(0o755)

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.repo, env=self.env, capture_output=True,
                              text=True, check=True).stdout.strip()

    def write(self, name, text):
        (self.repo / name).write_text(text, encoding="utf-8")

    def commit(self, message="fixture"):
        self.git("add", ".")
        self.git("commit", "-qm", message)
        return self.git("rev-parse", "HEAD")

    def run_review(self, *args, code=0):
        result = subprocess.run([sys.executable, str(SCRIPT), "--repo", str(self.repo), *args],
                                env=self.env, capture_output=True, encoding="utf-8")
        self.assertEqual(result.returncode, code, result.stderr + result.stdout)
        path = Path(result.stdout.strip())
        self.assertEqual(path.parent, self.repo / "reports" / "codex-review")
        return path, path.read_text(encoding="utf-8")

    def evidence(self):
        return [item for line in (self.root / "calls").read_text(encoding="utf-8").splitlines()
                for item in json.loads(line)["evidence"]]

    def test_layers_unborn_and_repeat_runs(self):
        self.write("café.py", "stage version\n")
        self.git("add", "café.py")
        self.write("café.py", "working version\n")
        self.write("new.py", "new version\n")
        index = self.git("write-tree")
        first, report = self.run_review("--focus", "交互", "worktree")
        second, _ = self.run_review("worktree")
        self.assertNotEqual(first, second)
        self.assertTrue(first.exists())
        self.assertIn("unborn", report)
        self.assertIn("交互", report)
        self.assertIn("complete", report)
        items = self.evidence()
        self.assertEqual({(x["path"], x["layer"]) for x in items},
                         {("café.py", "staged"), ("café.py", "unstaged"), ("new.py", "untracked")})
        self.assertIn("+stage version", items[0]["content"])
        self.assertIn("+working version", items[1]["content"])
        self.assertEqual(index, self.git("write-tree"))

    def test_repo_inventory_and_skips(self):
        self.write(".gitignore", "ignored.py\n")
        self.write("existing.py", "stable\n")
        self.commit()
        self.write("ignored.py", "ignore me")
        self.write(".env", "private fixture")
        self.write("fresh.py", "include me")
        (self.repo / "blob").write_bytes(b"\0\x02")
        _, report = self.run_review("repo", code=2)
        self.assertIn("partial", report)
        self.assertIn(".env", report)
        self.assertIn("blob", report)
        self.assertEqual({x["path"] for x in self.evidence()}, {".gitignore", "existing.py", "fresh.py"})

    def test_clean_and_failure_receipts(self):
        self.write("app.py", "old\n")
        self.commit()
        _, empty = self.run_review("worktree")
        self.assertIn("empty", empty)
        self.assertFalse((self.root / "calls").exists())
        self.write("app.py", "new\n")
        for value in ["fail", "bad", "empty"]:
            with self.subTest(value):
                self.env["FAKE_MODE"] = value
                _, report = self.run_review("worktree", code=2)
                self.assertIn("failed", report)
                self.assertNotIn("未报告可定位的问题", report)

    def test_pinned_commit_branch_and_pr(self):
        self.write("shared", "base\n")
        common = self.commit()
        self.git("checkout", "-qb", "topic")
        self.write("topic", "on topic\n")
        head = self.commit()
        self.git("checkout", "-q", "main")
        self.write("other", "main only\n")
        base = self.commit()
        self.git("checkout", "-q", "topic")
        self.write("topic", "private local work\n")
        _, root = self.run_review("commit", common)
        self.assertIn("shared", root)
        _, single = self.run_review("commit", head)
        _, branch = self.run_review("base", "main")
        self.assertIn(head, single)
        self.assertIn(common, branch)
        self.assertIn(base, branch)
        url = "https://github.com/example/repo/pull/9"
        payload = json.dumps({"url": url, "baseRefOid": base, "headRefOid": head})
        self.tool("gh", f"print({payload!r})")
        _, pr = self.run_review("pr", "9")
        self.assertIn(url, pr)
        self.assertIn(common, pr)
        self.assertIn(head, pr)
        self.assertNotIn("private local work", str(self.evidence()))
        self.assertNotIn("main only", str(self.evidence()))
        self.assertEqual(self.git("branch", "--show-current"), "topic")
        self.assertEqual((self.repo / "topic").read_text(), "private local work\n")
        _, missing = self.run_review("commit", "--", "unknown", code=2)
        self.assertIn("failed", missing)

    def test_merge_first_parent(self):
        self.write("base", "root")
        self.commit()
        self.git("checkout", "-qb", "side")
        self.write("side", "side")
        self.commit()
        self.git("checkout", "-q", "main")
        self.write("main", "base branch only")
        first_parent = self.commit()
        self.git("merge", "--no-edit", "side")
        _, report = self.run_review("commit", "HEAD")
        self.assertIn(first_parent, report)
        self.assertEqual([i["path"] for i in self.evidence()], ["side"])

    def test_large_repo_includes_tail_and_reports_batches(self):
        text = "some line of actual data\n" * 3400 + "tail marker"
        self.write("long.txt", text)
        _, report = self.run_review("repo")
        chunks = self.evidence()
        self.assertGreater(len(chunks), 1)
        self.assertEqual("".join(i["content"] for i in chunks).encode(),
                         (self.repo / "long.txt").read_bytes())
        self.assertIn("跨批", report)

    def test_failed_second_batch_keeps_first_receipt(self):
        self.write("large.txt", "0123456789abcdef\n" * 6000)
        self.env["FAKE_MODE"] = "second"
        _, report = self.run_review("repo", code=2)
        self.assertIn("partial", report)
        self.assertIn("1 / 2", report)
        self.assertIn("退出码 8", report)

    def test_file_to_directory_patch_preserves_exact_path(self):
        self.write("config[prod]", "old\n")
        self.commit()
        (self.repo / "config[prod]").unlink()
        (self.repo / "config[prod]").mkdir()
        self.write("config[prod]/.env", "private-value-fixture")
        self.write("config[prod]/app", "new-app-marker")
        self.commit()
        _, report = self.run_review("commit", "HEAD", code=2)
        items = self.evidence()
        self.assertEqual([i["path"] for i in items], ["config[prod]", "config[prod]/app"])
        self.assertNotIn("new-app-marker", items[0]["content"])
        self.assertNotIn("private-value-fixture", str(items))
        self.assertIn("config[prod]/.env", report)

    def test_explicit_submodule_change_overrides_local_diff_preferences(self):
        self.write("app", "base")
        base = self.commit()
        self.git("update-index", "--add", "--cacheinfo", f"160000,{base},dep")
        self.git("commit", "-qm", "pin")
        new = self.git("rev-parse", "HEAD")
        self.git("update-index", "--cacheinfo", f"160000,{new},dep")
        self.git("commit", "-qm", "update pin")
        self.git("config", "diff.ignoreSubmodules", "all")
        self.run_review("commit", "HEAD")
        self.assertIn("Subproject commit " + new, self.evidence()[0]["content"])

    def test_index_change_between_layers_is_disclosed(self):
        self.write("app", "base")
        self.commit()
        self.write("app", "actually changed")
        git = shutil.which("git")
        self.tool("git", f"""
import subprocess, sys
args = sys.argv[1:]
if 'diff' in args and '--cached' not in args and '--name-only' in args:
    subprocess.run([{git!r}, 'add', 'app'], check=True)
sys.exit(subprocess.call([{git!r}, *args]))
""")
        _, report = self.run_review("worktree", code=2)
        self.assertIn("partial", report)
        self.assertEqual(report.count("索引"), 1)

    def test_unlocatable_model_finding_and_timeout(self):
        self.write("app", "one line\n")
        self.env["FAKE_MODE"] = "wrong_line"
        _, report = self.run_review("repo", code=2)
        self.assertIn("partial", report)
        self.assertIn("待定位", report)
        self.assertNotIn("### CR-", report)
        self.env["FAKE_MODE"] = "slow"
        _, report = self.run_review("--timeout", "2", "repo", code=2)
        self.assertIn("超过 2 秒", report)

    def test_unicode_separator_and_escaped_data_keep_git_lines_and_budget(self):
        self.write("data", ('"\u2028' * 80 + '\n') * 400)
        self.run_review("repo")
        items = self.evidence()
        self.assertGreater(len(items), 1)
        for prev, curr in zip(items, items[1:]):
            self.assertEqual(curr["first_line"], prev["first_line"] + prev["content"].count("\n"))
        self.assertTrue(all(len(json.dumps(i, ensure_ascii=False).encode()) <= 64000 for i in items))

    def test_split_patch_preserves_new_file_line_numbers(self):
        self.write("app", "before\n")
        self.commit()
        self.write("app", "".join(f"{n}: a source line with content\n" for n in range(1, 4501)))
        self.run_review("worktree")
        chunks = self.evidence()
        self.assertGreater(len(chunks), 1)
        for part in chunks[1:]:
            self.assertTrue(part["content"].startswith(f"+{part['new_line']}: "))

    def test_context_lines_use_new_coordinates_in_continuation(self):
        self.write("app", "original\n")
        self.commit()
        self.write("app", "a newly inserted line\n" * 4000 + "original\n")
        self.env["FAKE_MODE"] = "old_context"
        _, report = self.run_review("worktree", code=2)
        self.assertIn("待定位（app:1", report)
        self.assertNotIn("### CR-", report)

    @unittest.skipUnless(os.name == "nt", "Windows process-tree fallback")
    def test_timeout_report_survives_taskkill_failure(self):
        program = """
import subprocess, sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, sys.argv[1])
from review import invoke_cli, ReviewError
with patch('subprocess.run', side_effect=subprocess.CalledProcessError(1, 'taskkill')):
    try:
        invoke_cli([sys.executable, '-c', 'import time; time.sleep(30)'], Path.cwd(), '', 1)
    except ReviewError as exc:
        print(exc)
"""
        result = subprocess.run([sys.executable, "-c", program, str(SCRIPT.parent)], cwd=self.root,
                                env=self.env, capture_output=True, encoding="utf-8", timeout=8, check=True)
        self.assertIn("子进程状态未确认", result.stdout)


if __name__ == "__main__":
    unittest.main()
