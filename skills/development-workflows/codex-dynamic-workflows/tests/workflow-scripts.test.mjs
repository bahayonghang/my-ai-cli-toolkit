import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const newWorkflowScript = path.join(skillRoot, "scripts", "new_workflow.py");
const verifyWorkflowScript = path.join(skillRoot, "scripts", "verify_workflow.py");
const collectResultsScript = path.join(skillRoot, "scripts", "collect_results.py");

function pythonCommand() {
  if (process.env.PYTHON) return { command: process.env.PYTHON, prefix: [] };
  for (const candidate of [
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"], { encoding: "utf8" });
    if (result.status === 0) return candidate;
  }
  return { command: "python", prefix: [] };
}

const python = pythonCommand();

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "codex workflow scripts "));
}

function runPython(script, args, cwd) {
  return spawnSync(python.command, [...python.prefix, script, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function workflowPath(cwd, slug) {
  return path.join(cwd, ".workflow", slug);
}

test("new_workflow scaffolds slugged workflow in a path containing spaces", () => {
  const cwd = makeTempDir();
  const result = runPython(newWorkflowScript, ["Provider Migration!!"], cwd);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(path.basename(result.stdout.trim()), "provider-migration");
  assert.match(result.stdout.trim(), /\.workflow[\\/]provider-migration$/);

  const runDir = workflowPath(cwd, "provider-migration");
  assert.equal(fs.existsSync(path.join(runDir, "plan.md")), true);
  assert.equal(fs.existsSync(path.join(runDir, "orchestration.md")), true);
  assert.equal(fs.existsSync(path.join(runDir, "packets")), true);
  assert.equal(fs.existsSync(path.join(runDir, "results")), true);

  const state = JSON.parse(fs.readFileSync(path.join(runDir, "state.json"), "utf8"));
  assert.equal(state.slug, "provider-migration");
  assert.deepEqual(state.packets, []);
  assert.equal(state.runner_capabilities.goal_mode, "explicit_request_only");
  assert.match(fs.readFileSync(path.join(runDir, "plan.md"), "utf8"), /py -3/);
});

test("packet scaffold writes packet templates and ready verification passes", () => {
  const cwd = makeTempDir();
  const create = runPython(
    newWorkflowScript,
    [
      "SSO rollout",
      "--packet",
      "01-research:Provider research",
      "--packet",
      "02-tests:Verification plan",
    ],
    cwd,
  );
  assert.equal(create.status, 0, create.stderr || create.stdout);

  const runDir = workflowPath(cwd, "sso-rollout");
  const packetPath = path.join(runDir, "packets", "01-research.md");
  assert.equal(fs.existsSync(packetPath), true);
  assert.match(fs.readFileSync(packetPath, "utf8"), /Provider research/);

  const state = JSON.parse(fs.readFileSync(path.join(runDir, "state.json"), "utf8"));
  assert.deepEqual(
    state.packets.map((packet) => packet.id),
    ["01-research", "02-tests"],
  );

  const ready = runPython(verifyWorkflowScript, [runDir, "--level", "ready"], cwd);
  assert.equal(ready.status, 0, ready.stderr || ready.stdout);
  assert.match(ready.stdout, /level 'ready'/);
});

test("verify levels distinguish structure, ready, and complete", () => {
  const cwd = makeTempDir();
  const create = runPython(newWorkflowScript, ["No packet task"], cwd);
  assert.equal(create.status, 0, create.stderr || create.stdout);
  const runDir = workflowPath(cwd, "no-packet-task");

  const structure = runPython(verifyWorkflowScript, [runDir, "--level", "structure"], cwd);
  assert.equal(structure.status, 0, structure.stderr || structure.stdout);

  const ready = runPython(verifyWorkflowScript, [runDir, "--level", "ready"], cwd);
  assert.notEqual(ready.status, 0);
  assert.match(ready.stdout, /No packet files found/);

  const complete = runPython(verifyWorkflowScript, [runDir], cwd);
  assert.notEqual(complete.status, 0);
  assert.match(complete.stdout, /No packet files found/);
  assert.match(complete.stdout, /No result files found/);
});

test("complete verification passes after packet result and final report exist", () => {
  const cwd = makeTempDir();
  const create = runPython(newWorkflowScript, ["Complete run", "--packet", "01-impl:Implementation"], cwd);
  assert.equal(create.status, 0, create.stderr || create.stdout);
  const runDir = workflowPath(cwd, "complete-run");

  fs.writeFileSync(
    path.join(runDir, "results", "01-impl.md"),
    "# Result\n\nAccepted: implementation complete.\nVerification: targeted test passed.\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(runDir, "final-report.md"),
    "# Final Report\n\n## Outcome\n\nComplete.\n",
    "utf8",
  );

  const complete = runPython(verifyWorkflowScript, [runDir, "--level", "complete"], cwd);
  assert.equal(complete.status, 0, complete.stderr || complete.stdout);
});

test("collect_results summarizes result markers", () => {
  const cwd = makeTempDir();
  const create = runPython(newWorkflowScript, ["Collect results", "--packet", "01-review:Review"], cwd);
  assert.equal(create.status, 0, create.stderr || create.stdout);
  const runDir = workflowPath(cwd, "collect-results");

  fs.writeFileSync(
    path.join(runDir, "results", "01-review.md"),
    "# Review\n\n- Accepted: safe change.\n- Risk: missing browser smoke.\nDecision: proceed after test.\n",
    "utf8",
  );

  const result = runPython(collectResultsScript, [runDir], cwd);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Integration Checklist: collect-results/);
  assert.match(result.stdout, /Accepted: safe change/);
  assert.match(result.stdout, /Risk: missing browser smoke/);
  assert.match(result.stdout, /Integration Decisions/);
});

test("invalid packet syntax fails clearly", () => {
  const cwd = makeTempDir();
  const result = runPython(newWorkflowScript, ["Bad packet", "--packet", "missing-title"], cwd);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /packet must use the form id:title/);
});
