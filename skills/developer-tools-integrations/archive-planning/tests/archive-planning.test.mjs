import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, "..", "scripts", "archive_planning.py");
const pythonCommand = process.env.PYTHON || "python";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "archive-planning-test-"));
}

function writePlanningFiles(cwd, overrides = {}) {
  const files = {
    "task_plan.md": "# 任务计划：默认功能\n\n## 目标\n\n- 默认目标\n",
    "findings.md": "## 需求\n\n- 默认需求\n",
    "progress.md": "# Progress\n\n- todo\n",
    ...overrides
  };
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(cwd, name), content, "utf8");
  }
}

function runArchive(cwd, args = []) {
  return spawnSync(pythonCommand, [scriptPath, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function archiveDirs(cwd) {
  const archiveRoot = path.join(cwd, ".plannings");
  if (!fs.existsSync(archiveRoot)) return [];
  return fs.readdirSync(archiveRoot).map((name) => path.join(archiveRoot, name));
}

test("archives required planning files with an explicit feature name", () => {
  const cwd = makeTempDir();
  writePlanningFiles(cwd);

  const result = runArchive(cwd, ["Explicit Feature"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Archive directory: \.plannings\/\d{8}-\d{6}-Explicit-Feature\//);
  assert.match(result.stdout, /Moved files:\r?\n- task_plan\.md\r?\n- findings\.md\r?\n- progress\.md/);
  assert.equal(fs.existsSync(path.join(cwd, "task_plan.md")), false);
  assert.equal(fs.existsSync(path.join(cwd, "findings.md")), false);
  assert.equal(fs.existsSync(path.join(cwd, "progress.md")), false);

  const dirs = archiveDirs(cwd);
  assert.equal(dirs.length, 1);
  assert.match(path.basename(dirs[0]), /^\d{8}-\d{6}-Explicit-Feature$/);
  assert.equal(fs.readFileSync(path.join(dirs[0], "task_plan.md"), "utf8"), "# 任务计划：默认功能\n\n## 目标\n\n- 默认目标\n");
});

test("infers the feature name from the first valid 目标 section line", () => {
  const cwd = makeTempDir();
  writePlanningFiles(cwd, {
    "task_plan.md": "# 任务计划：TODO\n\n## 目标\n\n- 火山引擎 调研\n\n## 范围\n\n- ignore me\n",
    "findings.md": "## 需求\n\n- 不应优先使用\n"
  });

  const result = runArchive(cwd);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const dirs = archiveDirs(cwd);
  assert.equal(dirs.length, 1);
  assert.match(path.basename(dirs[0]), /^\d{8}-\d{6}-火山引擎-调研$/u);
  assert.match(result.stdout, /Archive directory: \.plannings\/\d{8}-\d{6}-火山引擎-调研\//u);
});

test("aborts without creating an archive when required files are missing", () => {
  const cwd = makeTempDir();
  fs.writeFileSync(path.join(cwd, "task_plan.md"), "# 任务计划：缺文件\n", "utf8");

  const result = runArchive(cwd);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Archive aborted: required planning files are missing\./);
  assert.match(result.stdout, /- findings\.md/);
  assert.match(result.stdout, /- progress\.md/);
  assert.equal(fs.existsSync(path.join(cwd, ".plannings")), false);
  assert.equal(fs.existsSync(path.join(cwd, "task_plan.md")), true);
});
