"""Deterministic package contracts only; fixtures do not prove model behavior."""

from __future__ import annotations

import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("laoyeye_context_report", ROOT / "scripts" / "context_report.py")
reporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reporter)


def load_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def lexical_failures(description, cases):
    """Portable reproduction of qiaomu's lexical smoke, never a runtime router."""
    def normalize(text):
        return re.sub(r"\s+", " ", re.sub(r"[^\w\u4e00-\u9fff]+", " ", text.lower())).strip()

    def present(text, phrase):
        phrase = normalize(phrase)
        return phrase in text if re.search(r"[\u4e00-\u9fff]", phrase) else f" {phrase} " in f" {text} "

    def hits(text):
        text = normalize(text)
        return {name for name, phrases in cases["positive_concepts"].items()
                if any(present(text, phrase) for phrase in phrases)}

    description_hits = hits(description)
    failures = list(set(cases["description_required_concepts"]) - description_hits)
    denominator = max(3, min(5, len(description_hits) or len(cases["positive_concepts"])))
    for bucket in ("should_trigger", "should_not_trigger", "near_neighbor"):
        for case in cases[bucket]:
            text = case["text"]
            veto = any(present(normalize(text), phrase) for phrase in cases["negative_patterns"])
            prediction = len(hits(text) & description_hits) / denominator >= cases["recommended_threshold"] and not veto
            if prediction != (bucket == "should_trigger"):
                failures.append(text)
    return failures


def brief_boundary_errors(root):
    errors = []
    for relative in ("SKILL.md", "agents/interface.yaml", "references/modes/brief.md"):
        text = (root / relative).read_text(encoding="utf-8").lower()
        if not re.search(r"compile\s*→\s*validate\s*→\s*present\s*→\s*stop", text) or "payload" not in text:
            errors.append(relative)
    return errors


def missing_routing_boundaries(description):
    return [phrase for phrase in ("学术论文", "润色", "生产 UI", "Trellis", "原生 Goal")
            if phrase not in description]


class PackageContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline = load_json("evals/upstream-baseline.json")
        cls.evals = load_json("evals/evals.json")["evals"]
        cls.triggers = load_json("evals/trigger_cases.json")

    def test_package_passes_and_counts_complete_dependency_closure(self):
        report = reporter.analyze(ROOT)
        self.assertTrue(report["ok"], report["errors"])
        self.assertEqual(report["entrypoints"], ["SKILL.md"])
        self.assertEqual(report["coverage"], {"source_entries": 25, "distinct_methods": 24})
        teaching = next(row for row in report["scenarios"]["routed_single_method"] if row["mode"] == "teaching")
        self.assertEqual(set(teaching["package_files"]), {"SKILL.md", "references/modes/teaching.md", "references/teaching-workspace.md"})
        self.assertEqual(len(teaching["upstream_files"]), 6)
        self.assertTrue(all(row["within_budget"] for row in report["scenarios"]["routed_single_method"]))
        self.assertTrue(any(row["new_is_larger"] for row in report["scenarios"]["direct_old_leaf"]))
        self.assertEqual(report["token_measurement"]["status"], "unavailable")

    def test_frozen_baseline_and_alias_are_not_runtime_dependencies(self):
        self.assertEqual(self.baseline["upstream_commit"], "5af2b57ceb169d81b2da90cc902556a2cad11c0a")
        sources = self.baseline["sources"]
        self.assertEqual([row["id"] for row in sources], [f"{i:02}" for i in range(1, 26)])
        self.assertEqual(len({row["source_entry"] for row in sources}), 25)
        self.assertEqual(len({row["mode"] for row in sources}), 24)
        self.assertEqual(self.baseline["discovery"]["all_metadata_chars"], 4923)
        self.assertEqual(self.baseline["discovery"]["model_eligible_metadata_chars"], 4484)
        self.assertEqual(sum(row["size"]["chars"] for row in [self.baseline["router"], *sources]), 80771)
        alias = next(row for row in sources if row["source_entry"] == "matt-grill-me")
        self.assertEqual(alias["mode"], "grilling")
        self.assertEqual(alias["required_dependencies"][0]["path"], "skills/asking/matt-grilling/SKILL.md")
        for row in [self.baseline["router"], *sources]:
            self.assertFalse(Path(row["path"]).is_absolute())
            self.assertRegex(row["raw_sha256"], r"^[0-9a-f]{64}$")

    def test_frontmatter_scalar_measurements(self):
        for indicator, expected in ((">-", "hello world"), (">", "hello world\n"),
                                    ("|-", "hello\nworld"), ("|", "hello\nworld\n")):
            parsed = reporter.metadata(f"---\nname: laoyeye\ndescription: {indicator}\n  hello\n  world\nversion: '0.1.0'\n---\n")
            self.assertEqual(parsed["description"], expected)
        self.assertEqual(reporter.size("汉字\n"), {"chars": 3, "utf8_bytes": 7})

    def test_one_capability_fixture_per_source_with_semantic_and_forbidden_assertions(self):
        capabilities = [case for case in self.evals if case.get("kind") == "capability"]
        self.assertEqual(len(capabilities), 25)
        by_source = {case["source_entry"]: case for case in capabilities}
        for source in self.baseline["sources"]:
            case = by_source[source["source_entry"]]
            self.assertEqual(case["mode"], source["mode"])
            self.assertIn(f"references/modes/{source['mode']}.md", case["required_resources"])
            self.assertTrue(all((ROOT / resource).is_file() for resource in case["required_resources"]))
            self.assertTrue(any("do not" in assertion.lower() for assertion in case["assertions"]))
        self.assertGreaterEqual(len([case for case in self.evals if case.get("kind") == "boundary"]), 12)
        self.assertEqual(len({case["id"] for case in self.evals}), len(self.evals))
        for case in self.evals:
            for field in ("id", "prompt", "expected_output", "files", "assertions"):
                self.assertIn(field, case)
            for text in [case["expected_output"], *case["assertions"]]:
                self.assertFalse(re.search(r"[\u4e00-\u9fff]", text), case["id"])

    def test_sibling_routing_negatives_are_explicit(self):
        negatives = {case["expected_sibling"]: case for case in self.evals if case.get("routing_negative")}
        for sibling in ("literature-mentor", "paper-workbench", "humanizer-paper"):
            self.assertIn(sibling, negatives)
            self.assertTrue(any("do not" in assertion.lower() for assertion in negatives[sibling]["assertions"]))
        description = reporter.metadata(reporter.read_text(ROOT / "SKILL.md"))["description"]
        self.assertEqual(missing_routing_boundaries(description), [])
        for exclusion in ("学术论文", "润色", "生产 UI", "Trellis", "原生 Goal"):
            self.assertIn(exclusion, missing_routing_boundaries(description.replace(exclusion, "")))

    def test_lexical_smoke_and_removed_core_trigger_turns_red(self):
        for bucket, minimum in (("should_trigger", 25), ("should_not_trigger", 12), ("near_neighbor", 12)):
            self.assertGreaterEqual(len(self.triggers[bucket]), minimum)
        description = reporter.metadata(reporter.read_text(ROOT / "SKILL.md"))["description"]
        self.assertEqual(lexical_failures(description, self.triggers), [])
        self.assertTrue(lexical_failures("普通文本处理。", self.triggers))
        # Vetoes are reusable phrase families, not complete test-prompt matches.
        for pattern in self.triggers["negative_patterns"]:
            self.assertLess(len(pattern), 30)
            self.assertFalse(any(pattern == case["text"] for bucket in ("should_not_trigger", "near_neighbor") for case in self.triggers[bucket]))

    def test_brief_payload_boundary_across_all_three_authoritative_surfaces(self):
        self.assertEqual(brief_boundary_errors(ROOT), [])
        with tempfile.TemporaryDirectory() as directory:
            copy = Path(directory) / "laoyeye"
            shutil.copytree(ROOT, copy, ignore=shutil.ignore_patterns("__pycache__"))
            for relative in ("SKILL.md", "agents/interface.yaml", "references/modes/brief.md"):
                path = copy / relative
                original = path.read_text(encoding="utf-8")
                path.write_text(original.replace("payload", "text"), encoding="utf-8")
                self.assertIn(relative, brief_boundary_errors(copy))
                path.write_text(original, encoding="utf-8")
            self.assertEqual(brief_boundary_errors(copy), [])

    def test_adversarial_mutations_turn_checks_red_then_restore_green(self):
        with tempfile.TemporaryDirectory() as directory:
            copy = Path(directory) / "laoyeye"
            shutil.copytree(ROOT, copy, ignore=shutil.ignore_patterns("__pycache__"))
            self.assertTrue(reporter.analyze(copy)["ok"])
            root_path = copy / "SKILL.md"
            original = root_path.read_text(encoding="utf-8")
            extra = copy / "references" / "SKILL.md"
            extra.write_text("unwanted entrypoint\n", encoding="utf-8")
            self.assertIn("entrypoints", {e["code"] for e in reporter.analyze(copy)["errors"]})
            extra.unlink()
            mutations = [
                (original.replace("references/modes/socratic.md", "references/modes/missing.md"), "link"),
                (original.replace("matt-grill-me", "matt-grill-me-missing"), "coverage"),
                (original + "\n" + "x" * 4001, "budget"),
                (original + "\n[bad](../../outside.md)\n", "link"),
                (original + "\n[bad](C:/private/file.md)\n", "link"),
                (original + "\n[bad](#no-such-heading)\n", "link"),
                (original + "\n![bad](assets/no-such-image.png)\n", "link"),
            ]
            for changed, code in mutations:
                with self.subTest(code=code):
                    root_path.write_text(changed, encoding="utf-8")
                    self.assertIn(code, {e["code"] for e in reporter.analyze(copy)["errors"]})
                    root_path.write_text(original, encoding="utf-8")
                    self.assertTrue(reporter.analyze(copy)["ok"])
            method = copy / "references" / "modes" / "socratic.md"
            before = method.read_text(encoding="utf-8")
            method.write_text(before + "x" * 12000, encoding="utf-8")
            self.assertIn("routed_budget", {e["code"] for e in reporter.analyze(copy)["errors"]})
            method.write_text(before, encoding="utf-8")
            self.assertTrue(reporter.analyze(copy)["ok"])

    def test_standalone_copy_has_no_external_import_or_write_dependency(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            copy = base / "laoyeye"
            shutil.copytree(ROOT, copy, ignore=shutil.ignore_patterns("__pycache__"))
            script = copy / "scripts" / "context_report.py"
            before = {p.relative_to(base).as_posix(): p.read_bytes() for p in base.rglob("*") if p.is_file()}
            env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONPATH": ""}
            first = subprocess.run([sys.executable, "-I", "-B", str(script)], cwd=base, env=env, capture_output=True)
            self.assertEqual(first.returncode, 0, first.stderr.decode(errors="replace"))
            report = json.loads(first.stdout.decode("utf-8"))
            self.assertTrue(report["ok"], report["errors"])
            self.assertEqual(before, {p.relative_to(base).as_posix(): p.read_bytes() for p in base.rglob("*") if p.is_file()})
            second = subprocess.run([sys.executable, "-I", "-B", str(script), "--output", "receipt.json"], cwd=base, env=env, capture_output=True)
            self.assertEqual(second.returncode, 0, second.stderr.decode(errors="replace"))
            receipt = base / "receipt.json"
            self.assertEqual(receipt.read_bytes(), second.stdout)
            self.assertNotIn(b"\r\n", receipt.read_bytes())
            after = {p.relative_to(base).as_posix(): p.read_bytes() for p in base.rglob("*") if p.is_file() and p != receipt}
            self.assertEqual(before, after)

    def test_output_parent_regular_file_fails_concisely_without_changing_files(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            blocked = base / "regular-file"
            blocked.write_bytes(b"keep existing content\n")
            result = subprocess.run([sys.executable, "-I", "-B", str(ROOT / "scripts" / "context_report.py"),
                                     "--output", str(blocked / "report.json")], cwd=base, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(b"Cannot write requested report", result.stderr)
            self.assertNotIn(b"Traceback", result.stderr)
            self.assertEqual(result.stdout, b"")
            self.assertEqual(list(base.iterdir()), [blocked])
            self.assertEqual(blocked.read_bytes(), b"keep existing content\n")


if __name__ == "__main__":
    unittest.main()
