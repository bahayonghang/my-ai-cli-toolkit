import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(testDir, "..", "scripts", "ensure_report_ignore.py");
const exact = Buffer.from("reports/skill-session-review/\n", "utf8");
const CASES = [
  "root-missing",
  "root-not-directory",
  "root-reparse",
  "invalid-utf8-before-mutation",
  "nul-before-mutation",
  "create-exact-artifact-only",
  "secret-before-mutation",
  "bom-crlf-normalizes-lf",
  "existing-exact-line-unchanged",
  "existing-no-replace-refused",
  "replace-stale-hash-preserves-old",
  "replace-exact-delta-succeeds",
  "replace-removal-reorder-change-refused",
  "target-link-refused",
  "predictable-temp-regular-ignored-preserved",
  "predictable-temp-link-ignored-preserved",
  "finalization-failure-preserves-old",
  "readback-hash-matches-stdout",
  "git-visibility-ignored",
  "git-visibility-tracked",
  "git-visibility-untracked",
  "git-visibility-non-repo",
  "stdout-bounded-no-body-secret",
  "git-index-unchanged",
  "only-gitignore-payload-changed",
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

function run(root, args = [], input = exact, env = {}) {
  return spawnSync(
    python.command,
    [...python.prefix, script, "--repo-root", root, ...args],
    { input, encoding: null, env: { ...process.env, ...env } },
  );
}

function text(buffer) {
  return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
}

function payload(result) {
  return JSON.parse(text(result.stdout));
}

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

function makeRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ssr-ignore-"));
}

function tempFor(root) {
  return path.join(root, "..gitignore.tmp");
}

function git(root, args) {
  return spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function createSymlinkOrSkip(t, target, link, type = "file") {
  try {
    fs.symlinkSync(target, link, type);
    return true;
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) {
      t.skip(`symlink unavailable: ${error.code}`);
      return false;
    }
    throw error;
  }
}

test("rejects missing, non-directory, and reparse roots", async (t) => {
  const missing = path.join(os.tmpdir(), `ssr-missing-${Date.now()}`);
  assert.equal(run(missing).status, 2, "root-missing");
  const file = path.join(makeRoot(), "file-root");
  fs.writeFileSync(file, "x", "utf8");
  assert.equal(run(file).status, 2, "root-not-directory");
  await t.test("root-reparse", (st) => {
    const parent = makeRoot();
    const actual = path.join(parent, "actual");
    const link = path.join(parent, "link");
    fs.mkdirSync(actual);
    if (!createSymlinkOrSkip(st, actual, link, "junction")) return;
    assert.equal(run(link).status, 2);
    assert.equal(fs.existsSync(path.join(actual, ".gitignore")), false);
  });
});

test("validates encoding, artifact shape, and secrets before mutation", () => {
  const cases = [
    ["invalid-utf8-before-mutation", Buffer.from([0xff, 0xfe, 0xfd]), 6],
    ["nul-before-mutation", Buffer.from("reports/skill-session-review/\0\n"), 6],
    ["create-exact-artifact-only", Buffer.from("node_modules/\nreports/skill-session-review/\n"), 6],
    ["secret-before-mutation", Buffer.from("reports/skill-session-review/\n# Bearer abc.def\n"), 7],
  ];
  for (const [name, input, code] of cases) {
    const root = makeRoot();
    const before = fs.readdirSync(root);
    const result = run(root, [], input);
    assert.equal(result.status, code, `${name}: ${text(result.stderr)}`);
    assert.deepEqual(fs.readdirSync(root), before, name);
    assert.equal(fs.existsSync(tempFor(root)), false, name);
  }
});

test("normalizes BOM and CRLF, reports disk hash, and changes one payload", () => {
  const root = makeRoot();
  fs.writeFileSync(path.join(root, "sentinel.txt"), "unchanged\n", "utf8");
  const input = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("reports/skill-session-review/\r\n")]);
  const result = run(root, [], input);
  assert.equal(result.status, 0, text(result.stderr));
  const data = fs.readFileSync(path.join(root, ".gitignore"));
  assert.deepEqual(data, exact, "bom-crlf-normalizes-lf");
  assert.equal(payload(result).sha256, sha(data), "readback-hash-matches-stdout");
  assert.equal(fs.readFileSync(path.join(root, "sentinel.txt"), "utf8"), "unchanged\n", "only-gitignore-payload-changed");
  assert.equal(payload(result).git, "non-repo", "git-visibility-non-repo");
});

test("enforces unchanged, no-clobber, stale-hash, and exact-delta replacement", () => {
  const root = makeRoot();
  const current = Buffer.from("node_modules/\n", "utf8");
  fs.writeFileSync(path.join(root, ".gitignore"), current);
  const candidate = Buffer.from("node_modules/\nreports/skill-session-review/\n", "utf8");
  const noReplace = run(root, [], candidate);
  assert.equal(noReplace.status, 3, "existing-no-replace-refused");
  assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), current);
  const stale = run(root, ["--replace", "--expected-sha256", "0".repeat(64)], candidate);
  assert.equal(stale.status, 4, "replace-stale-hash-preserves-old");
  assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), current);
  const badDeltas = [
    Buffer.from("reports/skill-session-review/\n"),
    Buffer.from("reports/skill-session-review/\nnode_modules/\n"),
    Buffer.from("node_modules/changed\nreports/skill-session-review/\n"),
  ];
  for (const bad of badDeltas) {
    const refused = run(root, ["--replace", "--expected-sha256", sha(current)], bad);
    assert.equal(refused.status, 6, "replace-removal-reorder-change-refused");
    assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), current);
  }
  const replaced = run(root, ["--replace", "--expected-sha256", sha(current)], candidate);
  assert.equal(replaced.status, 0, text(replaced.stderr));
  assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), candidate, "replace-exact-delta-succeeds");
  const unchanged = run(root, [], Buffer.from([0xff]));
  assert.equal(unchanged.status, 0, text(unchanged.stderr));
  assert.equal(payload(unchanged).mode, "unchanged", "existing-exact-line-unchanged");
});

test("refuses target links but ignores and preserves predictable temp residue", async (t) => {
  await t.test("target-link-refused", (st) => {
    const root = makeRoot();
    const outside = path.join(root, "outside");
    fs.writeFileSync(outside, "outside\n", "utf8");
    if (!createSymlinkOrSkip(st, outside, path.join(root, ".gitignore"))) return;
    assert.equal(run(root).status, 2);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside\n");
  });
  const root = makeRoot();
  fs.writeFileSync(tempFor(root), "foreign\n", "utf8");
  assert.equal(run(root).status, 0, "predictable-temp-regular-ignored-preserved");
  assert.equal(fs.readFileSync(tempFor(root), "utf8"), "foreign\n");
  await t.test("predictable-temp-link-ignored-preserved", (st) => {
    const linkedRoot = makeRoot();
    const outside = path.join(linkedRoot, "outside-temp");
    fs.writeFileSync(outside, "outside-temp\n", "utf8");
    if (!createSymlinkOrSkip(st, outside, tempFor(linkedRoot))) return;
    assert.equal(run(linkedRoot).status, 0);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside-temp\n");
    assert.equal(fs.lstatSync(tempFor(linkedRoot)).isSymbolicLink(), true);
  });
});

test("injected finalization failure preserves old bytes and removes only owned temp", () => {
  const root = makeRoot();
  const current = Buffer.from("node_modules/\n");
  const candidate = Buffer.from("node_modules/\nreports/skill-session-review/\n");
  fs.writeFileSync(path.join(root, ".gitignore"), current);
  const result = run(
    root,
    ["--replace", "--expected-sha256", sha(current)],
    candidate,
    { SSR_INJECT_FINALIZE_FAILURE: "1" },
  );
  assert.equal(result.status, 1, text(result.stderr));
  assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), current, "finalization-failure-preserves-old");
  assert.equal(fs.existsSync(tempFor(root)), false);
  assert.deepEqual(
    fs.readdirSync(root).filter((name) => /^\.\.gitignore\.[0-9a-f]{32}\.(?:tmp|rollback)$/.test(name)),
    [],
  );
});

test("reports all four Git visibility states and never mutates the index", () => {
  const untracked = makeRoot();
  assert.equal(git(untracked, ["init", "-q"]).status, 0);
  const untrackedResult = run(untracked);
  assert.equal(untrackedResult.status, 0, text(untrackedResult.stderr));
  assert.equal(payload(untrackedResult).git, "untracked", "git-visibility-untracked");

  const tracked = makeRoot();
  assert.equal(git(tracked, ["init", "-q"]).status, 0);
  fs.writeFileSync(path.join(tracked, ".gitignore"), exact);
  assert.equal(git(tracked, ["add", ".gitignore"]).status, 0);
  const before = git(tracked, ["diff", "--cached", "--name-only"]).stdout;
  const trackedResult = run(tracked, [], Buffer.from("Bearer should-not-be-read"));
  assert.equal(trackedResult.status, 0, text(trackedResult.stderr));
  assert.equal(payload(trackedResult).git, "tracked", "git-visibility-tracked");
  assert.equal(git(tracked, ["diff", "--cached", "--name-only"]).stdout, before, "git-index-unchanged");

  const ignored = makeRoot();
  assert.equal(git(ignored, ["init", "-q"]).status, 0);
  fs.mkdirSync(path.join(ignored, ".git", "info"), { recursive: true });
  fs.writeFileSync(path.join(ignored, ".git", "info", "exclude"), ".gitignore\n", "utf8");
  const ignoredResult = run(ignored);
  assert.equal(ignoredResult.status, 0, text(ignoredResult.stderr));
  assert.equal(payload(ignoredResult).git, "ignored", "git-visibility-ignored");
});

test("stdout is bounded metadata and never includes body or secret input", () => {
  const root = makeRoot();
  const result = run(root);
  assert.equal(result.status, 0, text(result.stderr));
  const keys = Object.keys(payload(result)).sort();
  assert.deepEqual(keys, ["bytes", "format", "git", "mode", "operation", "path", "sha256"]);
  assert.doesNotMatch(text(result.stdout), /reports\/skill-session-review\/\\n|Bearer|ghp_|sk-/);
  const secretRoot = makeRoot();
  const secret = run(secretRoot, [], Buffer.from("reports/skill-session-review/\n# ghp_abcdefghijklmnopqrstuvwxyz0123456789\n"));
  assert.equal(secret.status, 7);
  assert.doesNotMatch(text(secret.stderr), /ghp_|abcdefghijklmnopqrstuvwxyz/);
});

test("contract case-name matrix remains explicit", () => {
  assert.equal(new Set(CASES).size, CASES.length);
  assert.equal(CASES.length, 25);
  console.log(`ensure-report-ignore cases: ${CASES.join(",")}`);
});
