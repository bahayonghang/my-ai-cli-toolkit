"""Contract tests for Touying 0.8.0 Qiaomu Production package (#56)."""

from __future__ import annotations

import json
import os
import re
import unittest
from pathlib import Path

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover
    yaml = None


SKILL_ROOT = Path(__file__).resolve().parents[1]
REQUIRED_ADAPTER_TARGETS = ("openai", "claude", "generic", "agent-skills-compatible")
LINK_PATTERN = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def load_yaml_fallback(text: str) -> dict:
    if yaml is not None:
        loaded = yaml.safe_load(text) or {}
        if isinstance(loaded, dict):
            return loaded

    root: dict = {}
    section: str | None = None
    subsection: str | None = None
    multiline_key: str | None = None
    multiline_indent = 0
    multiline_buf: list[str] = []

    def flush_multiline() -> None:
        nonlocal multiline_key, multiline_buf
        if multiline_key and section:
            root[section][multiline_key] = " ".join(multiline_buf).strip()
        multiline_key = None
        multiline_buf = []

    for raw in text.splitlines():
        if multiline_key is not None:
            indent = len(raw) - len(raw.lstrip(" "))
            if raw.strip() and indent > multiline_indent:
                multiline_buf.append(raw.strip())
                continue
            flush_multiline()

        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        stripped = raw.strip()

        if indent == 0 and stripped.endswith(":"):
            section = stripped[:-1]
            subsection = None
            root.setdefault(section, {})
            continue
        if indent == 2 and section and stripped.endswith(":"):
            subsection = stripped[:-1]
            root[section].setdefault(subsection, [])
            continue
        if stripped.startswith("- ") and section and subsection:
            val = stripped[2:].strip().strip("'\"")
            if isinstance(root[section].get(subsection), list):
                root[section][subsection].append(val)
            continue
        if ":" in stripped and section:
            key, val = stripped.split(":", 1)
            key = key.strip()
            val = val.strip()
            if val in ("|", "|-", ">", ">-"):
                multiline_key = key
                multiline_indent = indent
                multiline_buf = []
                subsection = None
            else:
                root[section][key] = val.strip("'\"")
                subsection = None

    flush_multiline()
    return root


class TouyingPackageContractTests(unittest.TestCase):
    def test_manifest_contract(self) -> None:
        manifest_path = SKILL_ROOT / "manifest.json"
        self.assertTrue(manifest_path.is_file(), "manifest.json missing")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(manifest.get("name"), "touying")
        self.assertEqual(manifest.get("version"), "2.0.0")
        self.assertEqual(manifest.get("maturity_tier"), "production")
        gates = manifest.get("release_gates")
        self.assertIsInstance(gates, list)
        self.assertGreater(len(gates), 0)
        upstream = manifest.get("upstream_inspiration")
        self.assertIsInstance(upstream, str)
        self.assertTrue(bool(upstream.strip()))

    def test_interface_yaml_contract(self) -> None:
        interface_path = SKILL_ROOT / "agents" / "interface.yaml"
        self.assertTrue(interface_path.is_file(), "agents/interface.yaml missing")
        data = load_yaml_fallback(interface_path.read_text(encoding="utf-8"))
        meta = data.get("interface", {})
        for field in ("display_name", "short_description", "default_prompt"):
            val = meta.get(field)
            self.assertIsInstance(val, str, f"interface.{field} missing")
            self.assertTrue(bool(val.strip()), f"interface.{field} empty")
        targets = data.get("compatibility", {}).get("adapter_targets", [])
        self.assertIsInstance(targets, list)
        for target in REQUIRED_ADAPTER_TARGETS:
            self.assertIn(target, targets)

    def test_readme_product_page_contract(self) -> None:
        readme_path = SKILL_ROOT / "README.md"
        manifest_path = SKILL_ROOT / "manifest.json"
        self.assertTrue(readme_path.is_file(), "README.md missing")
        self.assertTrue(manifest_path.is_file(), "manifest.json missing")
        readme = readme_path.read_text(encoding="utf-8")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for marker in ("npx skills add", "你可以直接这样说", "validate_skill.py", "Troubleshooting"):
            self.assertIn(marker, readme)
        upstream = manifest.get("upstream_inspiration", "").strip()
        self.assertTrue(upstream)
        self.assertIn(upstream, readme)

    def test_trigger_cases_contract(self) -> None:
        cases_path = SKILL_ROOT / "evals" / "trigger_cases.json"
        self.assertTrue(cases_path.is_file(), "evals/trigger_cases.json missing")
        cases = json.loads(cases_path.read_text(encoding="utf-8"))
        for bucket in ("should_trigger", "should_not_trigger", "near_neighbor"):
            items = cases.get(bucket)
            self.assertIsInstance(items, list, f"{bucket} must be a list")
            self.assertGreater(len(items), 0, f"{bucket} must be non-empty")
        near_neighbor_text = json.dumps(cases["near_neighbor"], ensure_ascii=False)
        self.assertIn("academic-defense-beamer", near_neighbor_text)

    def test_reports_and_evidence_contract(self) -> None:
        required = (
            SKILL_ROOT / "reports" / "skill-ir.json",
            SKILL_ROOT / "reports" / "trigger-eval.json",
            SKILL_ROOT / "reports" / "prior-art-research.md",
            SKILL_ROOT / "reports" / "creation-handoff.md",
        )
        for path in required:
            self.assertTrue(path.is_file(), f"missing report: {path.relative_to(SKILL_ROOT)}")

        ir_data = json.loads((SKILL_ROOT / "reports" / "skill-ir.json").read_text(encoding="utf-8"))
        pkg = ir_data.get("package", {})
        self.assertEqual(pkg.get("name"), "touying")
        self.assertEqual(pkg.get("version"), "2.0.0")

        trig = json.loads((SKILL_ROOT / "reports" / "trigger-eval.json").read_text(encoding="utf-8"))
        self.assertIs(trig.get("ok"), True)
        summary = trig.get("summary", {})
        total = summary.get("total", 0)
        passed = summary.get("passed", 0)
        self.assertGreater(total, 0)
        self.assertEqual(passed, total)

        handoff = (SKILL_ROOT / "reports" / "creation-handoff.md").read_text(encoding="utf-8")
        self.assertIn("2.0.0", handoff)
        self.assertIn("missing evidence", handoff)

    def test_no_broken_relative_markdown_links(self) -> None:
        md_files = [SKILL_ROOT / "SKILL.md"]
        refs_dir = SKILL_ROOT / "references"
        if refs_dir.is_dir():
            md_files.extend(sorted(refs_dir.glob("*.md")))

        for md_file in md_files:
            self.assertTrue(md_file.is_file(), f"missing markdown file: {md_file}")
            text = md_file.read_text(encoding="utf-8")
            for target in LINK_PATTERN.findall(text):
                target = target.strip()
                if target.startswith(("http://", "https://", "#")):
                    continue
                rel_target = target.split("#", 1)[0]
                if not rel_target.endswith(".md"):
                    continue
                resolved = (md_file.parent / rel_target).resolve()
                self.assertTrue(
                    resolved.is_file(),
                    f"broken link {target} in {md_file.relative_to(SKILL_ROOT)}",
                )

    def test_no_local_machine_or_user_leaks(self) -> None:
        win_users_re = re.compile(r"[A-Za-z]:[/\\]" + r"Users[/\\]")
        mac_users_re = re.compile(r"/Users" + r"/[A-Za-z0-9._-]+")
        username = (os.environ.get("USERNAME") or os.environ.get("USER") or "").strip()
        home_name = Path.home().name.strip()
        user_tokens = {tok for tok in (username, home_name) if len(tok) >= 3}

        scan_files: list[Path] = []
        for single in ("SKILL.md", "README.md", "manifest.json"):
            candidate = SKILL_ROOT / single
            if candidate.is_file():
                scan_files.append(candidate)
        for folder in ("agents", "references", "evals", "reports", "tests"):
            folder_path = SKILL_ROOT / folder
            if folder_path.is_dir():
                for item in sorted(folder_path.rglob("*")):
                    if item.is_file() and "__pycache__" not in item.parts:
                        scan_files.append(item)

        for path in scan_files:
            content = path.read_text(encoding="utf-8")
            self.assertIsNone(
                win_users_re.search(content),
                f"Windows user path leak in {path.relative_to(SKILL_ROOT)}",
            )
            self.assertIsNone(
                mac_users_re.search(content),
                f"macOS user path leak in {path.relative_to(SKILL_ROOT)}",
            )
            for tok in user_tokens:
                path_user_re = re.compile(r"[/\\]" + re.escape(tok) + r"(?:[/\\]|$)")
                self.assertIsNone(
                    path_user_re.search(content),
                    f"local username path segment leak in {path.relative_to(SKILL_ROOT)}",
                )


if __name__ == "__main__":
    unittest.main()
