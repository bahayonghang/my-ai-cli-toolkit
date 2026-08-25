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
