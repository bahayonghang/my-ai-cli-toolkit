import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(
  __dirname,
  "..",
  "scripts",
  "academic_figure_pref.py",
);
const baseEnv = { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" };

function resolvePython() {
  const candidates = [["python"], ["python3"]];
  if (process.platform === "win32") candidates.push(["py", "-3"]);
  for (const [cmd, ...pre] of candidates) {
    const probe = spawnSync(cmd, [...pre, "--version"], {
      encoding: "utf8",
      env: baseEnv,
    });
    if (!probe.error && probe.status === 0) return { cmd, pre };
  }
  return null;
}

const python = resolvePython();
const skip = python ? false : "no python interpreter available";

function run(args, configFile) {
  const env = { ...baseEnv, ACADEMIC_FIGURE_CONFIG: configFile };
  return spawnSync(python.cmd, [...python.pre, script, ...args], {
    encoding: "utf8",
    env,
  });
}

function withConfig(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-pref-"));
  const configFile = path.join(dir, "academic-figure.json");
  try {
    return fn(configFile);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("set then get round-trips both keys", { skip }, () => {
  withConfig((configFile) => {
    assert.equal(run(["set", "library", "matplotlib"], configFile).status, 0);
    assert.equal(run(["set", "journal_style", "ieee"], configFile).status, 0);
    assert.equal(
      run(["get", "library"], configFile).stdout.trim(),
      "matplotlib",
    );
    assert.equal(
      run(["get", "journal_style"], configFile).stdout.trim(),
      "ieee",
    );
  });
});

test("get on an unset key prints nothing and exits 0", { skip }, () => {
  withConfig((configFile) => {
    const result = run(["get", "library"], configFile);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "");
  });
});

test("clear drops a saved value", { skip }, () => {
  withConfig((configFile) => {
    run(["set", "library", "plotly"], configFile);
    assert.equal(run(["clear"], configFile).status, 0);
    const result = run(["get", "library"], configFile);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "");
  });
});

test("an invalid value is rejected with a non-zero exit", { skip }, () => {
  withConfig((configFile) => {
    assert.notEqual(run(["set", "library", "ggplot"], configFile).status, 0);
  });
});

test("path reports the ACADEMIC_FIGURE_CONFIG override", { skip }, () => {
  withConfig((configFile) => {
    const result = run(["path"], configFile);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      path.normalize(result.stdout.trim()),
      path.normalize(configFile),
    );
  });
});
