import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(testDir, "..");
const scriptsDir = path.join(skillRoot, "scripts");
const skillText = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const interfaceText = fs.readFileSync(path.join(skillRoot, "agents", "interface.yaml"), "utf8");
const baseReview = JSON.parse(fs.readFileSync(path.join(testDir, "valid-review.json"), "utf8"));
const AUTH_CASES = [
  "authorization-preview-before-helper",
  "authorization-confirmed-exact-snapshot",
  "authorization-root-drift-rejected",
  "authorization-name-drift-rejected",
  "authorization-path-drift-rejected",
  "authorization-effect-drift-rejected",
  "authorization-existing-target-needs-replace-confirmation",
  "authorization-gitignore-separate",
];
const EFFECTS = [
  "create input",
  "create Markdown",
  "create HTML",
  "proof-gated remove input",
  "open HTML",
];

function pythonCommand() {
  for (const candidate of [
    { command: process.env.PYTHON, prefix: [] },
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    if (!candidate.command) continue;
    if (spawnSync(candidate.command, [...candidate.prefix, "--version"]).status === 0) return candidate;
  }
  throw new Error("Python interpreter not found");
}
const python = pythonCommand();

function makeSnapshot(root, name) {
  const reportDir = path.join(root, "reports", "skill-session-review");
  return {
    root: path.resolve(root),
    name,
    paths: {
      input: path.join(reportDir, ".input", `${name}.json`),
      markdown: path.join(reportDir, `${name}.md`),
      html: path.join(reportDir, `${name}.html`),
    },
    effects: [...EFFECTS],
  };
}

function preview(snapshot) {
  return JSON.stringify(snapshot, null, 2);
}

function authorize(snapshot) {
  return structuredClone(snapshot);
}

function sameSnapshot(authorization, current) {
  return JSON.stringify(authorization) === JSON.stringify(current);
}

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

function existingTargetGate(snapshot) {
  const existing = Object.entries(snapshot.paths)
    .filter(([, target]) => fs.existsSync(target))
    .map(([kind, target]) => ({ kind, path: target, sha256: sha(fs.readFileSync(target)), effect: "replace" }));
  return existing;
}

function runScript(name, args, { input = Buffer.alloc(0), env = {} } = {}) {
  return spawnSync(python.command, [...python.prefix, path.join(scriptsDir, name), ...args], {
    input,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function workflowReview() {
  const review = structuredClone(baseReview);
  review.coverage["oh-my-pi"] = { status: "ok", invoked: 0, loaded: 0, available: 1 };
  review.sessions.push({ id: "s5", platform: "oh-my-pi", status: "available", signal: "catalog" });
  return review;
}

function executeConfirmedPackage(authorization, current, review, calls) {
  if (!sameSnapshot(authorization, current)) return { status: "authorization-invalid" };
  const existing = existingTargetGate(current);
  if (existing.length) return { status: "replace-confirmation-required", existing };

  const raw = Buffer.from(`${JSON.stringify(review, null, 2)}\n`, "utf8");
  calls.push("create-input");
  const created = runScript("manage_review_input.py", ["create", "--repo-root", current.root, "--name", current.name], { input: raw });
  assert.equal(created.status, 0, created.stderr);
  const inputMeta = JSON.parse(created.stdout);

  const artifacts = {};
  for (const format of ["markdown", "html"]) {
    calls.push(`create-${format}`);
    const result = runScript("write_session_review.py", [
      "--repo-root", current.root,
      "--name", current.name,
      "--format", format,
      "--review-json", current.paths.input,
    ]);
    assert.equal(result.status, 0, result.stderr);
    artifacts[format] = JSON.parse(result.stdout);
  }

  calls.push("remove-input-proof");
  const removed = runScript("manage_review_input.py", [
    "remove",
    "--repo-root", current.root,
    "--name", current.name,
    "--expected-sha256", inputMeta.sha256,
    "--artifact-sha256", `markdown=${artifacts.markdown.sha256}`,
    "--artifact-sha256", `html=${artifacts.html.sha256}`,
  ]);
  assert.equal(removed.status, 0, removed.stderr);

  calls.push("open-html");
  const opened = runScript("open_report.py", ["--repo-root", current.root, "--name", current.name], {
    env: { SSR_BROWSER_STUB: "true" },
  });
  assert.equal(opened.status, 0, opened.stderr);
  assert.equal(JSON.parse(opened.stdout).opened, true);
  return { status: "complete", inputMeta, artifacts };
}

function zeroSampleGate(scan, sideEffects) {
  const rows = Object.values(scan.coverage);
  if (rows.every((status) => status === "missing-store")) {
    return { status: "unrated", reason: "no-session-stores" };
  }
  if (!scan.sessions.some((session) => session.status === "invoked")) {
    return { status: "unrated", reason: "no-invoked-sessions" };
  }
  sideEffects.readSlices += 1;
  sideEffects.helperCalls += 1;
  return { status: "rated" };
}

test("unconfirmed workflow produces the exact preview and zero helper calls", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-auth-preview-"));
  const snapshot = makeSnapshot(root, "demo-skill");
  const calls = [];
  const rendered = preview(snapshot);
  assert.deepEqual(JSON.parse(rendered), snapshot);
  assert.match(rendered, /"name": "demo-skill"/);
  for (const target of Object.values(snapshot.paths)) assert.match(rendered, new RegExp(path.basename(target).replace(".", "\\.")));
  for (const effect of EFFECTS) assert.match(rendered, new RegExp(effect));
  assert.deepEqual(calls, [], "authorization-preview-before-helper");
});

test("confirmed immutable snapshot executes input, both reports, proof removal, then open", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-auth-complete-"));
  const current = makeSnapshot(root, "demo-skill");
  const authorization = authorize(current);
  const calls = [];
  const result = executeConfirmedPackage(authorization, current, workflowReview(), calls);
  assert.equal(result.status, "complete");
  assert.deepEqual(calls, ["create-input", "create-markdown", "create-html", "remove-input-proof", "open-html"]);
  assert.equal(fs.existsSync(current.paths.input), false);
  assert.equal(fs.existsSync(current.paths.markdown), true);
  assert.equal(fs.existsSync(current.paths.html), true);
  const md = fs.readFileSync(current.paths.markdown, "utf8");
  const html = fs.readFileSync(current.paths.html, "utf8");
  for (const platform of ["claude", "grok", "codex", "oh-my-pi"]) {
    assert.match(md, new RegExp(platform));
    assert.match(html, new RegExp(platform));
  }
});

test("root, name, path, and effect drift each invalidate prior authorization", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-auth-drift-"));
  const original = makeSnapshot(root, "demo-skill");
  const authorization = authorize(original);
  const drifts = {
    "authorization-root-drift-rejected": makeSnapshot(path.join(root, "other-root"), "demo-skill"),
    "authorization-name-drift-rejected": makeSnapshot(root, "other-skill"),
    "authorization-path-drift-rejected": { ...structuredClone(original), paths: { ...original.paths, html: path.join(root, "other.html") } },
    "authorization-effect-drift-rejected": { ...structuredClone(original), effects: [...EFFECTS, "replace Markdown"] },
  };
  for (const [name, current] of Object.entries(drifts)) {
    const calls = [];
    const result = executeConfirmedPackage(authorization, current, workflowReview(), calls);
    assert.equal(result.status, "authorization-invalid", name);
    assert.deepEqual(calls, [], name);
  }
});

test("an existing target requires path/hash/effect preview and separate replace confirmation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-auth-existing-"));
  const current = makeSnapshot(root, "demo-skill");
  fs.mkdirSync(path.dirname(current.paths.markdown), { recursive: true });
  const old = Buffer.from("existing report\n", "utf8");
  fs.writeFileSync(current.paths.markdown, old);
  const calls = [];
  const result = executeConfirmedPackage(authorize(current), current, workflowReview(), calls);
  assert.equal(result.status, "replace-confirmation-required");
  assert.deepEqual(calls, []);
  assert.deepEqual(result.existing, [{
    kind: "markdown",
    path: current.paths.markdown,
    sha256: sha(old),
    effect: "replace",
  }]);
  assert.deepEqual(fs.readFileSync(current.paths.markdown), old);
});

test("gitignore authorization remains outside the report-package snapshot", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-auth-ignore-"));
  const snapshot = makeSnapshot(root, "demo-skill");
  assert.equal(JSON.stringify(snapshot).includes("gitignore"), false);
  assert.match(skillText, /independently preview[\s\S]*\.gitignore/i);
  assert.match(skillText, /separate confirmations/i);
  assert.match(interfaceText, /separately governed repo-root gitignore operation require its own confirmation/i);
});

test("all adapter targets share canonical basename, dual artifacts, proof cleanup, and opener", () => {
  const adapterBlock = interfaceText.match(/adapter_targets:\s*([\s\S]*?)\n\s*activation:/)?.[1] ?? "";
  const adapters = [...adapterBlock.matchAll(/-\s+"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(adapters, ["openai", "claude", "generic"]);
  for (const adapter of adapters) {
    assert.match(interfaceText, /canonical --name/);
    assert.match(interfaceText, /Markdown and self-contained HTML separately/);
    assert.match(interfaceText, /complete hash proof/);
    assert.match(interfaceText, /open the HTML/);
    assert.match(interfaceText, new RegExp(`^\\s*${adapter}:`, "m"));
  }
  assert.match(skillText, /scan_invocations\.py" --skill-name/);
  assert.doesNotMatch(skillText.match(/manage_review_input\.py[\s\S]*?open_report\.py --repo-root <abs> --name <name>/)?.[0] ?? "", /--skill-name/);
});

test("zero-sample branches are bounded and perform no slice read or helper call", () => {
  const allMissing = {
    coverage: { claude: "missing-store", grok: "missing-store", codex: "missing-store", "oh-my-pi": "missing-store" },
    sessions: [],
  };
  const availableNoInvoked = {
    coverage: { claude: "ok", grok: "missing-store", codex: "ok", "oh-my-pi": "ok" },
    sessions: [
      { platform: "claude", status: "loaded" },
      { platform: "codex", status: "available" },
    ],
  };
  for (const [scan, reason] of [[allMissing, "no-session-stores"], [availableNoInvoked, "no-invoked-sessions"]]) {
    const effects = { readSlices: 0, helperCalls: 0 };
    assert.deepEqual(zeroSampleGate(scan, effects), { status: "unrated", reason });
    assert.deepEqual(effects, { readSlices: 0, helperCalls: 0 });
  }
  assert.match(skillText, /no-session-stores/);
  assert.match(skillText, /no-invoked-sessions/);
  assert.match(skillText, /Do not read slices/i);
  assert.match(skillText, /call a\s+helper/i);
  assert.match(skillText, /open a browser/i);
});

test("authorization case-name matrix is exact", () => {
  assert.deepEqual(AUTH_CASES, [
    "authorization-preview-before-helper",
    "authorization-confirmed-exact-snapshot",
    "authorization-root-drift-rejected",
    "authorization-name-drift-rejected",
    "authorization-path-drift-rejected",
    "authorization-effect-drift-rejected",
    "authorization-existing-target-needs-replace-confirmation",
    "authorization-gitignore-separate",
  ]);
  console.log(`skill-workflow-contract cases: ${AUTH_CASES.join(",")}`);
});
