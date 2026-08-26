import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const script = path.join(skillRoot, "scripts", "plan_precheck.py");

function pythonCommand() {
  if (process.env.PYTHON) return { command: process.env.PYTHON, prefix: [] };
  for (const candidate of [
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"], {
      encoding: "utf8",
    });
    if (result.status === 0) return candidate;
  }
  return { command: "python", prefix: [] };
}

const python = pythonCommand();

function runPrecheck(args) {
  return spawnSync(python.command, [...python.prefix, script, ...args], { encoding: "utf8" });
}

function makeTask(withPrd = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-precheck-"));
  const taskDir = path.join(root, ".trellis", "tasks", "08-25-sample");
  fs.mkdirSync(taskDir, { recursive: true });
  if (withPrd) fs.writeFileSync(path.join(taskDir, "prd.md"), "# sample\n", "utf8");
  return { root, taskDir };
}

function writeTask(taskDir, {
  status = "planning",
  parent = null,
  children = [],
  subtasks,
  omitChildren = false,
  withPrd = true,
} = {}) {
  fs.mkdirSync(taskDir, { recursive: true });
  if (withPrd) fs.writeFileSync(path.join(taskDir, "prd.md"), `# ${path.basename(taskDir)}\n`, "utf8");
  const metadata = { status, parent };
  if (!omitChildren) metadata.children = children;
  if (subtasks !== undefined) metadata.subtasks = subtasks;
  fs.writeFileSync(path.join(taskDir, "task.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

function makeTaskTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-tree-"));
  const tasksRoot = path.join(root, ".trellis", "tasks");
  const rootTask = path.join(tasksRoot, "08-26-parent");
  const liveChild = path.join(tasksRoot, "08-26-live-child");
  const archivedChild = path.join(tasksRoot, "archive", "2026-08", "08-26-archived-child");
  writeTask(rootTask, { children: ["08-26-live-child", "08-26-archived-child"] });
  writeTask(liveChild, { parent: "08-26-parent", status: "in_progress" });
  writeTask(archivedChild, { parent: "08-26-parent", status: "completed" });
  return { root, tasksRoot, rootTask, liveChild, archivedChild };
}

function parseReport(result) {
  assert.notEqual(result.stdout.trim(), "", result.stderr);
  return JSON.parse(result.stdout.trim());
}

function gitInit(root) {
  const init = spawnSync("git", ["-C", root, "init", "-q"], { encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
}

const hasGit = spawnSync("git", ["--version"], { encoding: "utf8" }).status === 0;

test("reports an untracked reviews destination as a note without failing", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { root, taskDir } = makeTask();
  gitInit(root);
  const result = runPrecheck([taskDir]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.reviews_git.path, ".trellis/reviews/08-25-sample.md");
  assert.equal(report.reviews_git.state, "untracked");
  assert.match(result.stderr, /untracked and not ignored/);
});

test("reports an ignored reviews destination without a note", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { root, taskDir } = makeTask();
  gitInit(root);
  fs.writeFileSync(path.join(root, ".trellis", ".gitignore"), "reviews/\n", "utf8");
  const result = runPrecheck([taskDir]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.reviews_git.state, "ignored");
  assert.doesNotMatch(result.stderr, /untracked and not ignored/);
});

test("state is null outside a git work tree and exit code stays 0", () => {
  const { taskDir } = makeTask();
  const result = runPrecheck([taskDir]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.reviews_git.state, null);
  assert.doesNotMatch(result.stderr, /untracked and not ignored/);
});

test("the git note never changes the blocking exit code", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { root, taskDir } = makeTask(false);
  gitInit(root);
  const result = runPrecheck([taskDir]);
  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.reviews_git.state, "untracked");
  assert.equal(report.blocking.length > 0, true);
});

test("tree mode aggregates a root, live child, and archived child in declared DFS order", () => {
  const { root, rootTask } = makeTaskTree();
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 0, result.stderr);
  const report = parseReport(result);

  assert.equal(report.review_scope.mode, "task-tree");
  assert.equal(report.review_scope.root, "08-26-parent");
  assert.equal(report.review_scope.task_count, 3);
  assert.deepEqual(
    report.review_scope.members.map(({ name, status, location }) => ({ name, status, location })),
    [
      { name: "08-26-parent", status: "planning", location: "active" },
      { name: "08-26-live-child", status: "in_progress", location: "active" },
      { name: "08-26-archived-child", status: "completed", location: "archive/2026-08" },
    ],
  );
  assert.deepEqual(report.review_scope.edges, [
    { parent: "08-26-parent", child: "08-26-live-child" },
    { parent: "08-26-parent", child: "08-26-archived-child" },
  ]);
  assert.deepEqual(report.tasks.map((task) => task.task_name), [
    "08-26-parent",
    "08-26-live-child",
    "08-26-archived-child",
  ]);
  assert.equal(report.tasks[1].drift_pass_required, true);
  assert.equal(report.reviews_git.path, ".trellis/reviews/08-26-parent.md");
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("tree mode --output persists the same single aggregate JSON with LF", () => {
  const { root, rootTask } = makeTaskTree();
  const output = path.join(root, "tree-precheck.json");
  const result = runPrecheck([
    rootTask,
    "--repo-root",
    root,
    "--include-descendants",
    "--output",
    output,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const stdoutReport = parseReport(result);
  const bytes = fs.readFileSync(output);
  assert.equal(bytes.includes(Buffer.from("\r\n")), false);
  assert.deepEqual(JSON.parse(bytes.toString("utf8")), stdoutReport);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("tree mode keeps leaf behavior as one single-task scope", () => {
  const { root, taskDir } = makeTask(false);
  writeTask(taskDir);
  const result = runPrecheck([taskDir, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 0, result.stderr);
  const report = parseReport(result);
  assert.equal(report.review_scope.mode, "single-task");
  assert.equal(report.review_scope.task_count, 1);
  assert.deepEqual(report.review_scope.members.map((member) => member.name), ["08-25-sample"]);
  assert.deepEqual(report.review_scope.edges, []);
  assert.equal(report.reviews_git.path, ".trellis/reviews/08-25-sample.md");
});

test("tree mode resolves deprecated subtasks only when children is absent", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-legacy-tree-"));
  const tasksRoot = path.join(root, ".trellis", "tasks");
  const rootTask = path.join(tasksRoot, "08-26-legacy-parent");
  const child = path.join(tasksRoot, "08-26-legacy-child");
  writeTask(rootTask, { omitChildren: true, subtasks: ["08-26-legacy-child"] });
  writeTask(child, { parent: "08-26-legacy-parent" });

  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 0, result.stderr);
  const report = parseReport(result);
  assert.deepEqual(report.review_scope.legacy_fallback_tasks, ["08-26-legacy-parent"]);
  assert.deepEqual(report.review_scope.members.map((member) => member.name), [
    "08-26-legacy-parent",
    "08-26-legacy-child",
  ]);
});

test("tree mode blocks conflicting non-empty children and subtasks", () => {
  const { root, taskDir } = makeTask(false);
  writeTask(taskDir, { children: ["08-26-current"], subtasks: ["08-26-legacy"] });
  const result = runPrecheck([taskDir, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /conflicting children and subtasks/);
});

test("tree mode blocks a missing child without creating report residue", () => {
  const { root, taskDir } = makeTask(false);
  writeTask(taskDir, { children: ["08-26-missing"] });
  const result = runPrecheck([taskDir, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /missing child.*08-26-missing/);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
  assert.deepEqual(fs.readdirSync(taskDir).filter((name) => name.endsWith(".tmp")), []);
});

test("tree mode blocks an active and archived child-name ambiguity", () => {
  const { root, tasksRoot, rootTask } = makeTaskTree();
  writeTask(path.join(tasksRoot, "08-26-archived-child"), { parent: "08-26-parent" });
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /ambiguous child.*08-26-archived-child/);
});

test("tree mode blocks cycles", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-cycle-tree-"));
  const tasksRoot = path.join(root, ".trellis", "tasks");
  const rootTask = path.join(tasksRoot, "08-26-cycle-parent");
  const child = path.join(tasksRoot, "08-26-cycle-child");
  writeTask(rootTask, { children: ["08-26-cycle-child"] });
  writeTask(child, { parent: "08-26-cycle-parent", children: ["08-26-cycle-parent"] });
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /cycle.*08-26-cycle-parent/);
});

test("tree mode blocks duplicate edges", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-duplicate-tree-"));
  const tasksRoot = path.join(root, ".trellis", "tasks");
  const rootTask = path.join(tasksRoot, "08-26-duplicate-parent");
  const child = path.join(tasksRoot, "08-26-duplicate-child");
  writeTask(rootTask, { children: ["08-26-duplicate-child", "08-26-duplicate-child"] });
  writeTask(child, { parent: "08-26-duplicate-parent" });
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /duplicate edge.*08-26-duplicate-child/);
});

test("tree mode blocks a child whose parent backlink disagrees", () => {
  const { root, rootTask, liveChild } = makeTaskTree();
  writeTask(liveChild, { parent: "08-26-someone-else", status: "in_progress" });
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /parent mismatch.*08-26-live-child/);
});

test("tree mode blocks child references that are not safe basenames", () => {
  const { root, taskDir } = makeTask(false);
  writeTask(taskDir, { children: ["../outside"] });
  const result = runPrecheck([taskDir, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /unsafe child name.*\.\.\/outside/);
});

test("tree mode rejects an unsafe root basename before producing a report target", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-unsafe-root-"));
  const rootTask = path.join(root, ".trellis", "tasks", ".hidden");
  writeTask(rootTask);
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /safe report basename.*\.hidden/);
  assert.equal(result.stdout.trim(), "");
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("tree mode rejects a reparse-point tasks root", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-linked-root-"));
  const trellisRoot = path.join(root, ".trellis");
  const outsideTasks = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-outside-tasks-"));
  const rootTask = path.join(outsideTasks, "08-26-linked-parent");
  writeTask(rootTask);
  fs.mkdirSync(trellisRoot, { recursive: true });
  const tasksLink = path.join(trellisRoot, "tasks");
  try {
    fs.symlinkSync(outsideTasks, tasksLink, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const linkedRoot = path.join(tasksLink, "08-26-linked-parent");
  const result = runPrecheck([linkedRoot, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /task root uses a symlink or reparse point/);
  assert.equal(result.stdout.trim(), "");
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("tree mode blocks a child directory that escapes through a symlink or junction", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-link-tree-"));
  const tasksRoot = path.join(root, ".trellis", "tasks");
  const rootTask = path.join(tasksRoot, "08-26-link-parent");
  const outsideChild = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-outside-child-"));
  writeTask(rootTask, { children: ["08-26-link-child"] });
  writeTask(outsideChild, { parent: "08-26-link-parent" });
  const link = path.join(tasksRoot, "08-26-link-child");
  try {
    fs.symlinkSync(outsideChild, link, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /symlink or reparse point|resolves outside/);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("tree mode blocks malformed member task.json", () => {
  const { root, rootTask, liveChild } = makeTaskTree();
  fs.writeFileSync(path.join(liveChild, "task.json"), "{not json}\n", "utf8");
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /invalid task\.json.*08-26-live-child/);
});

test("tree mode blocks a member whose status cannot select the drift pass", () => {
  const { root, rootTask, liveChild } = makeTaskTree();
  fs.writeFileSync(
    path.join(liveChild, "task.json"),
    `${JSON.stringify({ parent: "08-26-parent", children: [] }, null, 2)}\n`,
    "utf8",
  );
  const result = runPrecheck([rootTask, "--repo-root", root, "--include-descendants"]);
  assert.equal(result.status, 1, result.stderr);
  assert.match(parseReport(result).blocking.join("\n"), /invalid status.*08-26-live-child/);
});
