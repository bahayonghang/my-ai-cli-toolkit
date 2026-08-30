import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(testDir, "..", "scripts", "open_report.py");

function pythonCommand() {
  for (const candidate of [
    { command: process.env.PYTHON, prefix: [] },
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    if (!candidate.command) continue;
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"]);
    if (result.status === 0) return candidate;
  }
  throw new Error("Python interpreter not found");
}

const python = pythonCommand();

function makeRoot(name = "demo-skill") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-open-"));
  const reportDir = path.join(root, "reports", "skill-session-review");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${name}.html`), "<!doctype html><title>报告 ✅</title>\n", "utf8");
  return root;
}

function run(args, stub = "true") {
  return spawnSync(python.command, [...python.prefix, script, ...args], {
    encoding: "utf8",
    env: { ...process.env, SSR_BROWSER_STUB: stub },
  });
}

test("canonical --name opens the derived HTML target through the injected stub", () => {
  const root = makeRoot();
  const result = run(["--repo-root", root, "--name", "demo-skill"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.opened, true);
  assert.equal(path.normalize(payload.path), path.join(root, "reports", "skill-session-review", "demo-skill.html"));
  assert.equal(fs.readFileSync(path.join(root, "reports", "skill-session-review", "demo-skill.html"), "utf8"), "<!doctype html><title>报告 ✅</title>\n");
});

test("legacy basename flag and unsafe names are argparse/path errors", () => {
  const root = makeRoot();
  const oldFlag = run(["--repo-root", root, "--skill-name", "demo-skill"]);
  assert.equal(oldFlag.status, 2);
  const traversal = run(["--repo-root", root, "--name", "../demo-skill"]);
  assert.equal(traversal.status, 2);
  assert.equal(fs.existsSync(path.join(root, "demo-skill.html")), false);
});

test("missing targets and link targets outside the governed subtree are refused", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-open-missing-"));
  const missing = run(["--repo-root", root, "--name", "demo-skill"]);
  assert.equal(missing.status, 2);

  const outside = path.join(root, "outside.html");
  fs.writeFileSync(outside, "outside\n", "utf8");
  const reportDir = path.join(root, "reports", "skill-session-review");
  fs.mkdirSync(reportDir, { recursive: true });
  try {
    fs.symlinkSync(outside, path.join(reportDir, "demo-skill.html"), "file");
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) {
      t.skip(`symlink unavailable: ${error.code}`);
      return;
    }
    throw error;
  }
  const linked = run(["--repo-root", root, "--name", "demo-skill"]);
  assert.equal(linked.status, 2);
  assert.equal(fs.readFileSync(outside, "utf8"), "outside\n");
});

for (const stub of ["false", "error"]) {
  test(`browser ${stub === "false" ? "False return" : "exception"} is non-fatal and bounded`, () => {
    const root = makeRoot();
    const result = run(["--repo-root", root, "--name", "demo-skill"], stub);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.opened, false);
    assert.equal(typeof payload.reason, "string");
    assert.doesNotMatch(result.stdout, /<!doctype|报告 ✅/u);
  });
}
