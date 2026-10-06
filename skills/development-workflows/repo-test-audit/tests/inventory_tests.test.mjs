import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("../scripts/inventory_tests.py", import.meta.url),
);

function write(root, rel, body) {
  const file = join(root, ...rel.split("/"));
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, body, "utf8");
}

function run(root) {
  const result = spawnSync("python", [scriptPath, root], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function withRepo(build) {
  const root = mkdtempSync(join(tmpdir(), "repo-test-audit-"));
  try {
    build(root);
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("python-test discover miss is Missing", () => {
  const payload = withRepo((root) => {
    write(
      root,
      "tests/test_sample.py",
      "def test_ok():\n    assert 1 == 1\n",
    );
    write(
      root,
      "other/tests/test_other.py",
      "import unittest\n\nclass T(unittest.TestCase):\n    def test_ok(self):\n        self.assertEqual(1, 1)\n",
    );
    write(
      root,
      "other/tests/nested/sample_test.py",
      "def test_ok():\n    assert True\n",
    );
    write(
      root,
      "justfile",
      'python-test:\n    python -m unittest discover -s other/tests -p "test_*.py"\n',
    );
  });
  const sample = payload.files.find((item) => item.path === "tests/test_sample.py");
  assert.ok(sample, JSON.stringify(payload.files));
  assert.equal(sample.location, "repo-tests");
  assert.equal(sample.collected_by, "");
  assert.equal(sample.behavior, "Missing");
  const other = payload.files.find((item) => item.path === "other/tests/test_other.py");
  assert.equal(other.collected_by, "python-test");
  assert.equal(other.behavior, "needs-review");
  const nested = payload.files.find(
    (item) => item.path === "other/tests/nested/sample_test.py",
  );
  assert.equal(nested.collected_by, "python-test");
  assert.equal(nested.behavior, "needs-review");
  assert.equal(payload.runner_status, undefined);
});

test("node-test collects skills tests mjs as needs-review", () => {
  const payload = withRepo((root) => {
    write(
      root,
      "skills/demo/tests/sample.test.mjs",
      "import assert from 'node:assert/strict';\nassert.equal(1, 1);\n",
    );
    write(root, "justfile", "node-test:\n    echo node\n");
  });
  const sample = payload.files.find(
    (item) => item.path === "skills/demo/tests/sample.test.mjs",
  );
  assert.ok(sample, JSON.stringify(payload.files));
  assert.equal(sample.location, "skill-tests");
  assert.equal(sample.collected_by, "node-test");
  assert.equal(sample.behavior, "needs-review");
  assert.ok(payload.runners.includes("node-test"));
});

test("missing justfile does not apply default globs", () => {
  const payload = withRepo((root) => {
    write(root, "tests/test_sample.py", "def test_ok():\n    assert 1 == 1\n");
    write(
      root,
      "skills/demo/tests/sample.test.mjs",
      "import assert from 'node:assert/strict';\nassert.equal(1, 1);\n",
    );
  });
  assert.equal(payload.runner_status, "runner-not-declared");
  assert.deepEqual(payload.runners, []);
  for (const item of payload.files) {
    assert.equal(item.collected_by, "");
    assert.equal(item.behavior, "Missing");
  }
  assert.equal(payload.files.length, 2);
});

test("collected file without assert is Shallow", () => {
  const payload = withRepo((root) => {
    write(root, "tests/test_shallow.py", "def test_ok():\n    return True\n");
    write(
      root,
      "justfile",
      "python-test:\n    python -m unittest discover -s tests\n",
    );
  });
  const sample = payload.files.find((item) => item.path === "tests/test_shallow.py");
  assert.equal(sample.collected_by, "python-test");
  assert.equal(sample.behavior, "Shallow");
});

test("python-check does not collect tests", () => {
  const payload = withRepo((root) => {
    write(root, "tests/test_sample.py", "def test_ok():\n    assert 1 == 1\n");
    write(root, "src/app.py", "print('ok')\n");
    write(
      root,
      "justfile",
      "python-check:\n    python -m py_compile src/app.py\npython-test:\n    python -m unittest discover -s other/tests\n",
    );
  });
  const sample = payload.files.find((item) => item.path === "tests/test_sample.py");
  assert.equal(sample.collected_by, "");
  assert.equal(sample.behavior, "Missing");
  assert.equal(
    payload.files.some((item) => item.path === "src/app.py"),
    false,
  );
  assert.ok(payload.runners.includes("python-check"));
});

test("named recipe files are collected and evals json is not", () => {
  const payload = withRepo((root) => {
    write(
      root,
      "scripts/test_install_projects.py",
      "def test_ok():\n    assert True\n",
    );
    write(
      root,
      "docs/scripts/test_sync_docs_catalog.py",
      "def test_ok():\n    assert True\n",
    );
    write(
      root,
      "docs/scripts/sync_docs_catalog.py",
      "def main():\n    return None\n",
    );
    write(root, "skills/demo/evals/evals.json", '{"skill_name":"demo","evals":[]}\n');
    write(
      root,
      "justfile",
      [
        "docs-check:",
        "    python docs/scripts/sync_docs_catalog.py --check",
        "    python docs/scripts/test_sync_docs_catalog.py",
        "install-projects-test:",
        "    python scripts/test_install_projects.py",
        "evals-check:",
        "    python scripts/check_skill_evals.py",
        "",
      ].join("\n"),
    );
  });
  const install = payload.files.find(
    (item) => item.path === "scripts/test_install_projects.py",
  );
  const docs = payload.files.find(
    (item) => item.path === "docs/scripts/test_sync_docs_catalog.py",
  );
  assert.equal(install.location, "repo-tests");
  assert.equal(install.collected_by, "install-projects-test");
  assert.equal(install.behavior, "needs-review");
  assert.equal(docs.collected_by, "docs-check");
  assert.equal(docs.behavior, "needs-review");
  assert.equal(
    payload.files.some((item) => item.path === "skills/demo/evals/evals.json"),
    false,
  );
  assert.equal(
    payload.files.some((item) => item.path === "docs/scripts/sync_docs_catalog.py"),
    false,
  );
  assert.ok(payload.runners.includes("evals-check"));
});
