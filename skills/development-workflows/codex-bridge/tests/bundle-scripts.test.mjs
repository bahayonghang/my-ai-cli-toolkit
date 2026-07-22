import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const createScript = path.join(skillRoot, "scripts", "create_bundle.py");
const validateScript = path.join(skillRoot, "scripts", "validate_bundle.py");
const runScript = path.join(skillRoot, "scripts", "run_bundle.py");

test("SKILL.md quotes runtime paths and avoids a bare skill variable", () => {
  const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
  assert.match(skill, /create_bundle\.py" <scenario> "<project-root>"/);
  assert.match(skill, /validate_bundle\.py" "<bundle>" --phase preflight/);
  assert.match(skill, /run_bundle\.py" "<bundle>"/);
  assert.doesNotMatch(skill, /\$SKILL_DIR/);
});

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
const utf8Env = {
  ...process.env,
  PYTHONUTF8: "1",
  PYTHONIOENCODING: "utf-8",
};

function makeProject(label = "codex bridge 中文 ") {
  return fs.mkdtempSync(path.join(os.tmpdir(), label));
}

function runPython(script, args, cwd, env = {}) {
  return spawnSync(python.command, [...python.prefix, script, ...args], {
    cwd,
    env: { ...utf8Env, ...env },
    encoding: "utf8",
  });
}

function createBundle(project, scenario = "plan-review", round, extra = []) {
  const args = [scenario, project];
  if (round !== undefined) args.push(String(round));
  args.push("--skill-root", skillRoot, ...extra);
  const result = runPython(createScript, args, project);
  return { result, bundle: result.status === 0 ? result.stdout.trim() : null };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, payload) {
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function fillBundle(bundle) {
  const requestPath = path.join(bundle, "request.md");
  const request = fs.readFileSync(requestPath, "utf8").replace(/{{[A-Z_][A-Z_0-9]*}}/g, "fixture");
  fs.writeFileSync(requestPath, request, "utf8");
  fs.writeFileSync(path.join(bundle, "conversation.md"), "# Conversation\n\nFixture context.\n", "utf8");
  fs.writeFileSync(path.join(bundle, "files", "source.txt"), "fixture\n", "utf8");
}

function validPlanResponse() {
  return {
    task_understanding: "Review the supplied plan within the stated scope.",
    result: "The plan is viable with bounded corrections.",
    key_findings: [
      { type: "validation", dimension: "rationality", content: "The main approach is coherent." },
      { type: "risk", dimension: "hidden_assumptions", content: "One runtime assumption needs a test." },
      { type: "validation", dimension: "conventions", content: "The file layout follows local rules." },
      { type: "validation", dimension: "scope_control", content: "The requested scope is bounded." },
    ],
    specific_suggestions: [{ file: "plan.md", change: "Add a smoke test.", reason: "Prove the runtime assumption." }],
    open_questions: [],
    uncertainty: "No live external call was made.",
  };
}

function validVerificationResponse() {
  return {
    task_understanding: "Verify one candidate against the source pattern.",
    verifications: [{ candidate_id: "X1", verdict: "confirmed", reasoning: "The same contract is violated." }],
    additional_findings: [],
    summary: "The candidate is confirmed.",
  };
}

function completeManifest(bundle, updates = {}) {
  const manifestPath = path.join(bundle, "manifest.json");
  const manifest = readJson(manifestPath);
  Object.assign(manifest, { status: "completed", codex_exit_code: 0 }, updates);
  writeJson(manifestPath, manifest);
}

function installFakeCodex(binDir) {
  fs.mkdirSync(binDir, { recursive: true });
  const runner = path.join(binDir, "fake-codex.mjs");
  fs.writeFileSync(
    runner,
    `import fs from "node:fs";\nconst args=process.argv.slice(2);\nconst output=args[args.indexOf("-o")+1];\nif(output) fs.writeFileSync(output, process.env.FAKE_CODEX_RESPONSE || "{}", "utf8");\nprocess.exit(Number(process.env.FAKE_CODEX_EXIT || 0));\n`,
    "utf8",
  );
  if (process.platform === "win32") {
    fs.writeFileSync(path.join(binDir, "codex.cmd"), `@echo off\r\n"${process.execPath}" "${runner}" %*\r\n`, "utf8");
  } else {
    const executable = path.join(binDir, "codex");
    fs.writeFileSync(executable, `#!/bin/sh\nexec "${process.execPath}" "${runner}" "$@"\n`, "utf8");
    fs.chmodSync(executable, 0o755);
  }
}

test("create builds a model-aware bundle in a non-ASCII path", () => {
  const project = makeProject();
  const { result, bundle } = createBundle(project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(bundle, /\.codex-bridge[\\/]round-1$/);
  const manifest = readJson(path.join(bundle, "manifest.json"));
  assert.equal(manifest.model, "gpt-5.6-sol");
  assert.equal(manifest.reasoning_effort, "high");
  assert.equal(manifest.sandbox, "read-only");
  assert.equal(manifest.project_root, path.resolve(project));
  assert.equal(fs.existsSync(path.join(bundle, "files")), true);
});

test("automatic round selection fills the first gap", () => {
  const project = makeProject();
  const runtime = path.join(project, ".codex-bridge");
  fs.mkdirSync(path.join(runtime, "round-1"), { recursive: true });
  fs.mkdirSync(path.join(runtime, "round-3"), { recursive: true });
  const { result, bundle } = createBundle(project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(path.basename(bundle), "round-2");
});

test("create preserves documented input exit codes", () => {
  const project = makeProject();
  const invalidScenario = createBundle(project, "unknown").result;
  assert.equal(invalidScenario.status, 2);
  assert.doesNotMatch(invalidScenario.stderr, /Traceback/);

  const invalidRound = createBundle(project, "plan-review", "zero").result;
  assert.equal(invalidRound.status, 1);

  const first = createBundle(project, "plan-review", 4).result;
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const duplicate = createBundle(project, "plan-review", 4).result;
  assert.equal(duplicate.status, 3);
});

test("project model override cannot raise the sandbox", () => {
  const project = makeProject();
  writeJson(path.join(project, "codex-bridge.models.json"), {
    model: "custom-model",
    reasoning_effort: "xhigh",
    sandbox: "workspace-write",
  });
  const { result, bundle } = createBundle(project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /Ignoring unsupported project config key: sandbox/);
  const manifest = readJson(path.join(bundle, "manifest.json"));
  assert.equal(manifest.model, "custom-model");
  assert.equal(manifest.reasoning_effort, "xhigh");
  assert.equal(manifest.sandbox, "read-only");
});

test("one-run model and effort flags override project settings", () => {
  const project = makeProject();
  writeJson(path.join(project, "codex-bridge.models.json"), {
    model: "project-model",
    reasoning_effort: "low",
  });
  const { result, bundle } = createBundle(project, "plan-review", undefined, [
    "--model",
    "one-run-model",
    "--effort",
    "high",
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = readJson(path.join(bundle, "manifest.json"));
  assert.equal(manifest.model, "one-run-model");
  assert.equal(manifest.reasoning_effort, "high");
  assert.equal(manifest.sandbox, "read-only");
});

test("invalid project config fails without a traceback", () => {
  const project = makeProject();
  fs.writeFileSync(path.join(project, "codex-bridge.models.json"), "{broken", "utf8");
  const { result } = createBundle(project);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid JSON/);
  assert.doesNotMatch(result.stderr, /Traceback/);
});

test("preflight passes a complete plan-review fixture", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  fillBundle(bundle);
  const result = runPython(validateScript, [bundle, "--phase", "preflight"], project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("preflight reports missing files, placeholders, and empty files directory", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  const result = runPython(validateScript, [bundle, "--phase", "preflight"], project);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /request\.md has no template placeholders/);
  assert.match(result.stdout, /conversation\.md exists/);
  assert.match(result.stdout, /files\/ contains at least one file/);
});

test("preflight rejects an invalid scenario and tampered sandbox", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  fillBundle(bundle);
  const manifestPath = path.join(bundle, "manifest.json");
  const manifest = readJson(manifestPath);
  manifest.scenario = "invalid";
  manifest.sandbox = "danger-full-access";
  writeJson(manifestPath, manifest);
  const result = runPython(validateScript, [bundle, "--phase", "preflight"], project);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /manifest\.scenario is supported/);
});

test("post-response requires response and execution state", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  fillBundle(bundle);
  const result = runPython(validateScript, [bundle, "--phase", "post-response"], project);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /manifest\.codex_exit_code is not null/);
  assert.match(result.stdout, /response\.json exists/);
});

test("post-response accepts a complete plan response", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  fillBundle(bundle);
  completeManifest(bundle);
  writeJson(path.join(bundle, "response.json"), validPlanResponse());
  const result = runPython(validateScript, [bundle, "--phase", "post-response"], project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("post-response rejects an invalid plan dimension", () => {
  const project = makeProject();
  const { bundle } = createBundle(project);
  fillBundle(bundle);
  completeManifest(bundle);
  const response = validPlanResponse();
  response.key_findings[0].dimension = "security";
  writeJson(path.join(bundle, "response.json"), response);
  const result = runPython(validateScript, [bundle, "--phase", "post-response"], project);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /finding dimensions are valid/);
});

test("post-response rejects duplicate and forbidden changed paths", () => {
  const project = makeProject();
  const { bundle } = createBundle(project, "codify");
  fillBundle(bundle);
  completeManifest(bundle);
  const response = validPlanResponse();
  delete response.key_findings[0].dimension;
  delete response.key_findings[1].dimension;
  delete response.key_findings[2].dimension;
  delete response.key_findings[3].dimension;
  response.files_changed = {
    created: ["src/new.py", "src/new.py"],
    modified: [".codex-bridge/round-1/request.md"],
    deleted: [],
  };
  writeJson(path.join(bundle, "response.json"), response);
  const result = runPython(validateScript, [bundle, "--phase", "post-response"], project);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /files_changed\.created has unique entries/);
  assert.match(result.stdout, /paths exclude \.codex-bridge/);
});

test("verification-round validates its previous-round and focused response contracts", () => {
  const project = makeProject();
  const main = createBundle(project, "plan-review", 1).bundle;
  fillBundle(main);
  const verification = createBundle(project, "verification-round", 2).bundle;
  fillBundle(verification);
  fs.writeFileSync(path.join(verification, "files", "extracted-patterns.md"), "# Patterns\n", "utf8");
  writeJson(path.join(verification, "files", "round-1-response.json"), validPlanResponse());
  completeManifest(verification, {
    purpose: "verify round-1 extrapolations",
    previous_rounds: [main],
  });
  writeJson(path.join(verification, "response.json"), validVerificationResponse());
  const result = runPython(validateScript, [verification, "--phase", "post-response"], project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("run dry-run shows the fixed model, sandbox, and optional schema", () => {
  const project = makeProject();
  const { bundle } = createBundle(project, "codify");
  const result = runPython(runScript, [bundle, "--dry-run", "--output-schema"], project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /--model gpt-5\.6-sol/);
  assert.match(result.stdout, /--sandbox workspace-write/);
  assert.match(result.stdout, /--output-schema/);
});

test("run rejects a manifest that raises scenario sandbox privilege", () => {
  const project = makeProject();
  const { bundle } = createBundle(project, "plan-review");
  const manifestPath = path.join(bundle, "manifest.json");
  const manifest = readJson(manifestPath);
  manifest.sandbox = "workspace-write";
  writeJson(manifestPath, manifest);
  const result = runPython(runScript, [bundle, "--dry-run"], project);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /manifest\.sandbox must be 'read-only'/);
});

test("run resolves a fake Codex command and atomically records success", () => {
  const project = makeProject();
  const { bundle } = createBundle(project, "plan-review");
  fillBundle(bundle);
  const binDir = path.join(project, "fake bin");
  installFakeCodex(binDir);
  const env = {
    PATH: `${binDir}${path.delimiter}${process.env.PATH || ""}`,
    FAKE_CODEX_RESPONSE: JSON.stringify(validPlanResponse()),
  };
  const result = runPython(runScript, [bundle], project, env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = readJson(path.join(bundle, "manifest.json"));
  assert.equal(manifest.status, "completed");
  assert.equal(manifest.codex_exit_code, 0);
  assert.equal(Array.isArray(manifest.codex_command), true);
  assert.equal(fs.existsSync(path.join(bundle, "response.json")), true);
  if (process.platform === "win32") assert.match(manifest.codex_command[0], /codex\.cmd$/i);
});

test("run records a nonzero fake Codex exit as failed", () => {
  const project = makeProject();
  const { bundle } = createBundle(project, "plan-review");
  fillBundle(bundle);
  const binDir = path.join(project, "fake bin");
  installFakeCodex(binDir);
  const result = runPython(runScript, [bundle], project, {
    PATH: `${binDir}${path.delimiter}${process.env.PATH || ""}`,
    FAKE_CODEX_EXIT: "7",
  });
  assert.equal(result.status, 7);
  const manifest = readJson(path.join(bundle, "manifest.json"));
  assert.equal(manifest.status, "failed");
  assert.equal(manifest.codex_exit_code, 7);
});
