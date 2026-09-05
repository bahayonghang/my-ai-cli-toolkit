#!/usr/bin/env python3
from __future__ import annotations

import io
import os
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import install_projects  # noqa: E402


class CatalogListTests(unittest.TestCase):
    def test_list_includes_canonical_category_and_skill(self) -> None:
        buf = io.StringIO()
        with redirect_stdout(buf):
            code = install_projects.main(["--list"])
        self.assertEqual(code, 0)
        out = buf.getvalue()
        self.assertIn("academic-research-tools", out)
        self.assertIn("git-commit", out)
        self.assertIn("git-github-collaboration", out)

    def test_json_list_is_parseable(self) -> None:
        buf = io.StringIO()
        with redirect_stdout(buf):
            code = install_projects.main(["--json"])
        self.assertEqual(code, 0)
        self.assertIn('"category": "academic-research-tools"', buf.getvalue())


class SelectionTests(unittest.TestCase):
    def test_unknown_skill_does_not_write(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            err = io.StringIO()
            with redirect_stderr(err), redirect_stdout(io.StringIO()):
                code = install_projects.main(
                    ["--project", str(project), "--skill", "no-such-skill"]
                )
            self.assertEqual(code, 1)
            self.assertFalse((project / ".agents").exists())
            self.assertIn("Unknown skill", err.getvalue())

    def test_unknown_category_does_not_write(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            err = io.StringIO()
            with redirect_stderr(err), redirect_stdout(io.StringIO()):
                code = install_projects.main(
                    ["--project", str(project), "--category", "not-a-category"]
                )
            self.assertEqual(code, 1)
            self.assertFalse((project / ".agents").exists())

    @patch.object(install_projects, "is_interactive", return_value=False)
    def test_non_tty_without_selection_fails(self, _mock: object) -> None:
        err = io.StringIO()
        with redirect_stderr(err), redirect_stdout(io.StringIO()):
            code = install_projects.main([])
        self.assertEqual(code, 1)
        self.assertIn("Non-interactive", err.getvalue())


class InstallLinkTests(unittest.TestCase):
    def test_project_installs_agents_skills_link(self) -> None:
        catalog = install_projects.catalog_root()
        source = catalog / "skills" / "git-github-collaboration" / "git-commit"
        with TemporaryDirectory() as raw:
            project = Path(raw)
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(io.StringIO()):
                code = install_projects.main(
                    ["--project", str(project), "--skill", "git-commit"]
                )
            self.assertEqual(code, 0, out.getvalue())
            dest = project / ".agents" / "skills" / "git-commit"
            self.assertTrue((dest / "SKILL.md").is_file())
            self.assertEqual(dest.resolve(), source.resolve())
            self.assertFalse((project / ".agent").exists())
            self.assertFalse((project / ".agent" / "skills").exists())

    def test_project_flag_does_not_write_cwd(self) -> None:
        with TemporaryDirectory() as raw:
            root = Path(raw)
            project = root / "proj"
            cwd = root / "cwd"
            project.mkdir()
            cwd.mkdir()
            previous = Path.cwd()
            os.chdir(cwd)
            try:
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    code = install_projects.main(
                        ["--project", str(project), "--skill", "git-commit"]
                    )
            finally:
                os.chdir(previous)
            self.assertEqual(code, 0)
            self.assertFalse((cwd / ".agents").exists())
            self.assertTrue(
                (project / ".agents" / "skills" / "git-commit" / "SKILL.md").is_file()
            )

    def test_conflict_rolls_back_new_links(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".claude").mkdir()
            conflict = project / ".claude" / "skills" / "git-commit"
            conflict.mkdir(parents=True)
            (conflict / "keeper.txt").write_text("keep", encoding="utf-8")
            err = io.StringIO()
            with redirect_stdout(io.StringIO()), redirect_stderr(err):
                code = install_projects.main(
                    ["--project", str(project), "--skill", "git-commit"]
                )
            self.assertEqual(code, 1)
            self.assertIn("Refusing to replace", err.getvalue())
            self.assertFalse((project / ".agents" / "skills" / "git-commit").exists())
            self.assertTrue((conflict / "keeper.txt").is_file())

    def test_same_source_link_is_reused(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                first = install_projects.main(
                    ["--project", str(project), "--skill", "git-commit"]
                )
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(io.StringIO()):
                second = install_projects.main(
                    ["--project", str(project), "--skill", "git-commit"]
                )
            self.assertEqual(first, 0)
            self.assertEqual(second, 0)
            self.assertIn("reused:", out.getvalue())

    def test_category_expands_multiple_skills(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                code = install_projects.main(
                    [
                        "--project",
                        str(project),
                        "--category",
                        "git-github-collaboration",
                    ]
                )
            self.assertEqual(code, 0)
            dest = project / ".agents" / "skills"
            self.assertTrue((dest / "git-commit" / "SKILL.md").is_file())
            self.assertTrue((dest / "git-worktree" / "SKILL.md").is_file())


class PickerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.skills = install_projects.discover_skills()

    def setUp(self) -> None:
        self.picker = install_projects.SkillPicker(self.skills)

    def test_tree_has_select_all_groups_and_skills(self) -> None:
        kinds = [row.kind for row in self.picker.rows]
        self.assertEqual(kinds[0], "all")
        self.assertIn("group", kinds)
        self.assertIn("skill", kinds)
        self.assertGreaterEqual(kinds.count("group"), 6)

    def test_select_all_toggles_every_skill(self) -> None:
        self.picker.toggle()
        self.assertEqual(self.picker.all_state(), "all")
        self.assertEqual(len(self.picker.selected_skills()), len(self.skills))
        self.picker.toggle()
        self.assertEqual(self.picker.all_state(), "none")
        self.assertEqual(self.picker.selected_skills(), [])

    def test_category_row_toggles_whole_group(self) -> None:
        index = next(
            i
            for i, row in enumerate(self.picker.rows)
            if row.kind == "group" and row.category == "git-github-collaboration"
        )
        self.picker.cursor = index
        self.picker.toggle()
        names = self.picker.names_in_category("git-github-collaboration")
        self.assertEqual(names, {skill.name for skill in self.picker.selected_skills()})
        self.assertEqual(self.picker.group_state("git-github-collaboration"), "all")
        self.assertEqual(self.picker.all_state(), "partial")

    def test_skill_row_toggles_one_item(self) -> None:
        index = next(
            i
            for i, row in enumerate(self.picker.rows)
            if row.skill is not None and row.skill.name == "git-commit"
        )
        self.picker.cursor = index
        self.picker.toggle()
        self.assertEqual(
            [skill.name for skill in self.picker.selected_skills()],
            ["git-commit"],
        )
        self.picker.toggle()
        self.assertEqual(self.picker.selected_skills(), [])

    def test_move_stays_in_range(self) -> None:
        self.picker.move(-5)
        self.assertEqual(self.picker.cursor, 0)
        self.picker.move(10_000)
        self.assertEqual(self.picker.cursor, len(self.picker.rows) - 1)

    def test_detail_lines_are_fixed_height(self) -> None:
        short = install_projects.format_detail_lines("hi", 40, 2)
        long = install_projects.format_detail_lines("磁盘满了 " * 80, 40, 2)
        self.assertEqual(len(short), 2)
        self.assertEqual(len(long), 2)

    def test_render_height_does_not_depend_on_description(self) -> None:
        window = 12
        first = install_projects.render_picker(self.picker, window, 80)
        storage = next(
            i
            for i, row in enumerate(self.picker.rows)
            if row.skill is not None and row.skill.name == "storage-analyzer"
        )
        commit = next(
            i
            for i, row in enumerate(self.picker.rows)
            if row.skill is not None and row.skill.name == "git-commit"
        )
        self.picker.cursor = storage
        second = install_projects.render_picker(self.picker, window, 80)
        self.picker.cursor = commit
        third = install_projects.render_picker(self.picker, window, 80)
        self.assertEqual(len(first), window + install_projects.PICKER_CHROME)
        self.assertEqual(len(first), len(second))
        self.assertEqual(len(second), len(third))

    def test_installed_skill_lists_agent_dirs(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".agents" / "skills" / "git-commit").mkdir(parents=True)
            (project / ".claude" / "skills" / "git-commit").mkdir(parents=True)
            picker = install_projects.SkillPicker(self.skills, project)
            self.assertEqual(picker.installed["git-commit"], (".agents", ".claude"))
            rendered = "\n".join(install_projects.render_picker(picker, 48, 120))
            self.assertRegex(rendered, r"git-commit.*\(\.agents, \.claude\)")

    def test_uninstalled_skill_has_empty_install_dirs(self) -> None:
        with TemporaryDirectory() as raw:
            picker = install_projects.SkillPicker(self.skills, Path(raw))
            self.assertEqual(picker.installed["git-commit"], ())

    def test_render_includes_project_root(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            picker = install_projects.SkillPicker(self.skills, project)
            rendered = "\n".join(install_projects.render_picker(picker, 12, 120))
            self.assertIn(str(project.resolve()), rendered)



class AgentPickerTests(unittest.TestCase):
    def test_default_selects_detected_agents_only(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            picker = install_projects.AgentPicker(project)
            self.assertEqual(picker.all_state(), "partial")
            self.assertEqual(set(picker.selected_keys()), {"universal"})
            dests = install_projects.dests_from_keys(project, picker.selected_keys())
            self.assertEqual(dests, [project / ".agents" / "skills"])

    def test_default_includes_existing_agent_root(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".claude").mkdir()
            picker = install_projects.AgentPicker(project)
            self.assertEqual(set(picker.selected_keys()), {"universal", "claude-code"})

    def test_toggle_one_agent_leaves_partial(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".claude").mkdir()
            picker = install_projects.AgentPicker(project)
            picker.cursor = picker.keys.index("claude-code") + 1
            picker.toggle()
            self.assertEqual(picker.all_state(), "partial")
            self.assertNotIn("claude-code", picker.selected_keys())
            self.assertEqual(set(picker.selected_keys()), {"universal"})

    def test_dests_from_keys_only_selected_agents(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            dests = install_projects.dests_from_keys(project, ["universal", "claude-code"])
            self.assertEqual(
                dests,
                [
                    project / ".agents" / "skills",
                    project / ".claude" / "skills",
                ],
            )
            self.assertFalse((project / ".grok").exists())

    def test_auto_agent_keys_detects_existing_roots(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".claude").mkdir()
            keys = install_projects.auto_agent_keys(project)
            self.assertEqual(keys, {"universal", "claude-code"})

    def test_render_detected_only_for_existing_roots(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            (project / ".claude").mkdir()
            picker = install_projects.AgentPicker(project)
            lines = install_projects.render_agent_picker(picker, 20, 120)
            rendered = "\n".join(lines)
            self.assertIn(str(project.resolve()), rendered)
            claude_line = next(line for line in lines if ".claude/skills" in line)
            trae_line = next(line for line in lines if ".trae/skills" in line)
            self.assertIn("detected", claude_line)
            self.assertNotIn("detected", trae_line)


class HomeDirectoryTests(unittest.TestCase):
    def test_refuses_implicit_home_cwd(self) -> None:
        sentinel = Path.home() / ".agents" / "skills" / "storage-analyzer"
        existed = sentinel.exists()
        previous = Path.cwd()
        err = io.StringIO()
        try:
            os.chdir(Path.home())
            with redirect_stdout(io.StringIO()), redirect_stderr(err):
                code = install_projects.main(["--skill", "storage-analyzer"])
        finally:
            os.chdir(previous)
        self.assertEqual(code, 1)
        self.assertIn("home directory", err.getvalue())
        if not existed:
            self.assertFalse(sentinel.exists())

    def test_refuses_explicit_home_project(self) -> None:
        err = io.StringIO()
        with redirect_stdout(io.StringIO()), redirect_stderr(err):
            code = install_projects.main(
                ["--project", str(Path.home()), "--skill", "storage-analyzer"]
            )
        self.assertEqual(code, 1)
        self.assertIn("home directory", err.getvalue())

    def test_project_flag_from_home_cwd_still_installs(self) -> None:
        with TemporaryDirectory() as raw:
            project = Path(raw)
            previous = Path.cwd()
            os.chdir(Path.home())
            try:
                with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                    code = install_projects.main(
                        ["--project", str(project), "--skill", "git-commit"]
                    )
            finally:
                os.chdir(previous)
            self.assertEqual(code, 0)
            self.assertTrue(
                (project / ".agents" / "skills" / "git-commit" / "SKILL.md").is_file()
            )

if __name__ == "__main__":
    unittest.main(verbosity=1)
