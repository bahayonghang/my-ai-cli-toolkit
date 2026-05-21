import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { buildEnv, installFakeCodex } from "./fake-codex-fixture.mjs";
import { initGitRepo, makeTempDir, run } from "./helpers.mjs";
import { resolveStateDir } from "../scripts/lib/state.mjs";

const SKILL_ROOT = path.resolve(import.meta.dirname, "..");
const SCRIPT = path.join(SKILL_ROOT, "scripts", "codex-companion.mjs");

async function waitFor(predicate, { timeoutMs = 5000, intervalMs = 50 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await predicate();
    if (value) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for condition.");
}

test("review returns the built-in no-findings result for working tree changes", () => {
  const repo = makeTempDir();
  const binDir = makeTempDir();
  installFakeCodex(binDir);
  initGitRepo(repo);
  fs.writeFileSync(path.join(repo, "app.js"), "console.log('v1');\n");
  run("git", ["add", "app.js"], { cwd: repo });
  run("git", ["commit", "-m", "init"], { cwd: repo });
  fs.writeFileSync(path.join(repo, "app.js"), "console.log('v2');\n");

  const result = run(process.execPath, [SCRIPT, "review"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Reviewed uncommitted changes/);
  assert.match(result.stdout, /No material issues found/);
});

test("adversarial-review renders structured findings", () => {
  const repo = makeTempDir();
  const binDir = makeTempDir();
  installFakeCodex(binDir);
  initGitRepo(repo);
  fs.writeFileSync(path.join(repo, "app.js"), "const value = items[0];\n");
  run("git", ["add", "app.js"], { cwd: repo });
  run("git", ["commit", "-m", "init"], { cwd: repo });
  fs.writeFileSync(path.join(repo, "app.js"), "const value = items[0].id;\n");

  const result = run(process.execPath, [SCRIPT, "adversarial-review"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Missing empty-state guard/);
});

test("task --resume-last resumes the latest persisted task thread", () => {
  const repo = makeTempDir();
  const binDir = makeTempDir();
  installFakeCodex(binDir);
  initGitRepo(repo);
  fs.writeFileSync(path.join(repo, "README.md"), "hello\n");
  run("git", ["add", "README.md"], { cwd: repo });
  run("git", ["commit", "-m", "init"], { cwd: repo });

  const firstRun = run(process.execPath, [SCRIPT, "task", "initial task"], {
    cwd: repo,
    env: buildEnv(binDir)
  });
  assert.equal(firstRun.status, 0, firstRun.stderr);

  const result = run(process.execPath, [SCRIPT, "task", "--resume-last", "follow up"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "Resumed the prior run.\nFollow-up prompt accepted.\n");
});

test("background task can be inspected with status and fetched with result", () => {
  const repo = makeTempDir();
  const binDir = makeTempDir();
  installFakeCodex(binDir, "slow-task");
  initGitRepo(repo);
  fs.writeFileSync(path.join(repo, "README.md"), "hello\n");
  run("git", ["add", "README.md"], { cwd: repo });
  run("git", ["commit", "-m", "init"], { cwd: repo });

  const launch = run(process.execPath, [SCRIPT, "task", "--background", "--json", "investigate the flaky worker timeout"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(launch.status, 0, launch.stderr);
  const launchPayload = JSON.parse(launch.stdout);
  assert.ok(launchPayload.jobId);

  const waited = run(process.execPath, [SCRIPT, "status", launchPayload.jobId, "--wait", "--json"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(waited.status, 0, waited.stderr);
  const waitedPayload = JSON.parse(waited.stdout);
  assert.equal(waitedPayload.job.status, "completed");

  const result = run(process.execPath, [SCRIPT, "result", launchPayload.jobId], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Handled the requested task/);
});

test("cancel stops an interruptible background task", async () => {
  const repo = makeTempDir();
  const binDir = makeTempDir();
  installFakeCodex(binDir, "interruptible-slow-task");
  initGitRepo(repo);
  fs.writeFileSync(path.join(repo, "README.md"), "hello\n");
  run("git", ["add", "README.md"], { cwd: repo });
  run("git", ["commit", "-m", "init"], { cwd: repo });

  const launch = run(process.execPath, [SCRIPT, "task", "--background", "--json", "investigate the flaky worker timeout"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(launch.status, 0, launch.stderr);
  const launchPayload = JSON.parse(launch.stdout);
  const stateDir = resolveStateDir(repo);

  await waitFor(() => {
    const state = JSON.parse(fs.readFileSync(path.join(stateDir, "state.json"), "utf8"));
    const job = state.jobs.find((candidate) => candidate.id === launchPayload.jobId);
    return job?.status === "running" ? job : null;
  }, { timeoutMs: 15000 });

  const cancel = run(process.execPath, [SCRIPT, "cancel", launchPayload.jobId, "--json"], {
    cwd: repo,
    env: buildEnv(binDir)
  });

  assert.equal(cancel.status, 0, cancel.stderr);
  const cancelPayload = JSON.parse(cancel.stdout);
  assert.equal(cancelPayload.status, "cancelled");

  await waitFor(() => {
    const state = JSON.parse(fs.readFileSync(path.join(stateDir, "state.json"), "utf8"));
    return state.jobs.find((candidate) => candidate.id === launchPayload.jobId)?.status === "cancelled";
  }, { timeoutMs: 10000 });
});
