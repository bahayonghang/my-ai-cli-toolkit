import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.resolve(__dirname, "..", "scripts");
const script = path.join(scriptsDir, "visual_qa.py");
const baseEnv = {
  ...process.env,
  PYTHONUTF8: "1",
  PYTHONIOENCODING: "utf-8",
  MPLBACKEND: "Agg",
};

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

function hasMatplotlib(py) {
  const probe = spawnSync(py.cmd, [...py.pre, "-c", "import matplotlib"], {
    encoding: "utf8",
    env: baseEnv,
  });
  return !probe.error && probe.status === 0;
}

const python = resolvePython();
const skip = !python
  ? "no python interpreter available"
  : hasMatplotlib(python)
    ? false
    : "requires matplotlib";

function run(args, cwd) {
  return spawnSync(python.cmd, [...python.pre, script, ...args], {
    encoding: "utf8",
    env: baseEnv,
    cwd,
  });
}

function runCode(code) {
  return spawnSync(python.cmd, [...python.pre, "-c", code], {
    encoding: "utf8",
    env: baseEnv,
  });
}

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-visual-qa-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("--help exits 0 and documents the CLI", { skip }, () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--preview/);
  assert.match(result.stdout, /--dpi/);
});

test("demo audits a bad layout and writes a preview", { skip }, () => {
  withTempDir((dir) => {
    const out = path.join(dir, "preview.png");
    const result = run(["demo", "--preview", out], dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /verdict: (WARN|FAIL)/);
    assert.match(result.stdout, /\[WARN\]/);
    assert.ok(existsSync(out), "the demo must write the preview PNG");
  });
});

test("audit_layout returns graded issues for a clean figure", { skip }, () => {
  const code = [
    "import matplotlib",
    'matplotlib.use("Agg")',
    "import sys",
    `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
    "import matplotlib.pyplot as plt",
    "from visual_qa import audit_layout",
    "fig, ax = plt.subplots(figsize=(4, 3))",
    "ax.plot([0, 1, 2], [0, 1, 4])",
    'ax.set_xlabel("x")',
    'ax.set_ylabel("y")',
    "issues = audit_layout(fig)",
    'print("count=%d" % len(issues))',
    'print("severities=%s" % ",".join(s for s, _ in issues))',
  ].join("\n");
  const result = runCode(code);
  assert.equal(result.status, 0, result.stderr);
  const count = /count=(\d+)/.exec(result.stdout);
  assert.ok(count, `expected a count line, got: ${result.stdout}`);
  const severities = /severities=(.*)/
    .exec(result.stdout)[1]
    .trim()
    .split(",")
    .filter(Boolean);
  assert.equal(severities.length, Number(count[1]));
  for (const severity of severities) {
    assert.ok(
      ["INFO", "WARN", "FAIL"].includes(severity),
      `unexpected severity ${severity}`,
    );
  }
});

test("a preview of a missing file exits non-zero", { skip }, () => {
  withTempDir((dir) => {
    const result = run(
      [path.join(dir, "absent.png"), "--preview", path.join(dir, "out.png")],
      dir,
    );
    assert.notEqual(result.status, 0);
  });
});
