import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.resolve(__dirname, "..", "scripts");
const script = path.join(scriptsDir, "figstyle.py");
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
  const probe = spawnSync(
    py.cmd,
    [...py.pre, "-c", "import matplotlib, numpy"],
    {
      encoding: "utf8",
      env: baseEnv,
    },
  );
  return !probe.error && probe.status === 0;
}

const python = resolvePython();
const skip = !python
  ? "no python interpreter available"
  : hasMatplotlib(python)
    ? false
    : "requires matplotlib and numpy";

function run(args) {
  return spawnSync(python.cmd, [...python.pre, script, ...args], {
    encoding: "utf8",
    env: baseEnv,
  });
}

// Run Python code with figstyle importable and the Agg backend selected.
function runCode(lines) {
  const code = [
    "import matplotlib",
    'matplotlib.use("Agg")',
    "import sys",
    `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
    ...lines,
  ].join("\n");
  return spawnSync(python.cmd, [...python.pre, "-c", code], {
    encoding: "utf8",
    env: baseEnv,
  });
}

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-figstyle-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function pngWidth(file) {
  // The IHDR chunk stores the width as a big-endian uint32 at byte 16.
  return readFileSync(file).readUInt32BE(16);
}

test("--help exits 0 and lists the check-palette subcommand", { skip }, () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /check-palette/);
});

test(
  "save_figure rejects a format outside the whitelist and writes nothing",
  { skip },
  () => {
    withTempDir((dir) => {
      const base = path.join(dir, "out", "fig");
      const result = runCode([
        "import matplotlib.pyplot as plt",
        "from figstyle import save_figure",
        "fig, ax = plt.subplots()",
        "try:",
        `    save_figure(fig, ${JSON.stringify(base)}, formats=("png", "bmp"))`,
        "except ValueError as exc:",
        '    print("rejected:", exc)',
        "else:",
        '    print("accepted")',
      ]);
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /rejected: .*bmp/);
      assert.ok(
        !existsSync(path.join(dir, "out")),
        "no directory or file may be written",
      );
    });
  },
);

test(
  "save_figure creates parent dirs and returns the written paths",
  { skip },
  () => {
    withTempDir((dir) => {
      const base = path.join(dir, "a", "b", "fig1");
      const result = runCode([
        "import json",
        "import matplotlib.pyplot as plt",
        "from figstyle import save_figure",
        "fig, ax = plt.subplots(figsize=(3.5, 2.0), layout='constrained')",
        "ax.plot([0, 1], [0, 1])",
        `paths = save_figure(fig, ${JSON.stringify(base)}, formats=("pdf", "png"))`,
        "print(json.dumps([str(p) for p in paths]))",
      ]);
      assert.equal(result.status, 0, result.stderr);
      const paths = JSON.parse(result.stdout.trim().split("\n").pop());
      assert.deepEqual(
        paths.map((p) => path.basename(p)),
        ["fig1.pdf", "fig1.png"],
      );
      for (const p of paths) assert.ok(existsSync(p), `missing ${p}`);
      assert.deepEqual(readdirSync(path.join(dir, "a", "b")).sort(), [
        "fig1.pdf",
        "fig1.png",
      ]);
    });
  },
);

test(
  "match_width=True keeps the PNG width equal to figsize width x dpi",
  { skip },
  () => {
    withTempDir((dir) => {
      const base = path.join(dir, "wide");
      const result = runCode([
        "import matplotlib.pyplot as plt",
        "from figstyle import save_figure",
        // A preset that sets savefig.bbox to tight must not crop the canvas.
        "plt.rcParams['savefig.bbox'] = 'tight'",
        "fig, ax = plt.subplots(figsize=(3.5, 1.97), layout='constrained')",
        "ax.plot([0, 1], [0, 1])",
        `save_figure(fig, ${JSON.stringify(base)}, formats=("png",), dpi=300)`,
      ]);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(pngWidth(`${base}.png`), Math.round(3.5 * 300));
    });
  },
);

test(
  "apply_style sets the tier and restores rcParams on exit",
  { skip },
  () => {
    const result = runCode([
      "import matplotlib as mpl",
      "from figstyle import apply_style",
      "before = dict(mpl.rcParams)",
      "with apply_style('display'):",
      "    print('inside', mpl.rcParams['font.size'], mpl.rcParams['axes.linewidth'],",
      "          mpl.rcParams['axes.spines.top'], mpl.rcParams['pdf.fonttype'])",
      "after = dict(mpl.rcParams)",
      "changed = [k for k in before if k != 'backend' and before[k] != after[k]]",
      "print('changed', len(changed), changed)",
      "ctx = apply_style('journal', journal={'width_in': 3.5, 'font_pt': 8,",
      "                                      'font_family': 'Arial'})",
      "print('journal', mpl.rcParams['figure.figsize'][0], mpl.rcParams['font.size'])",
      "ctx.restore()",
      "print('restored', mpl.rcParams['font.size'] == before['font.size'])",
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /inside 24(\.0)? 3(\.0)? False 42/);
    assert.match(result.stdout, /changed 0 \[\]/);
    assert.match(result.stdout, /journal 3\.5 8(\.0)?/);
    assert.match(result.stdout, /restored True/);
  },
);

test(
  "apply_style rejects a journal tier with a missing card key",
  { skip },
  () => {
    const result = runCode([
      "from figstyle import apply_style",
      "try:",
      "    apply_style('journal', journal={'width_in': 3.5})",
      "except ValueError as exc:",
      '    print("rejected:", exc)',
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /rejected: .*font_pt/);
  },
);

test(
  "text_color_for returns white on dark and black on light backgrounds",
  { skip },
  () => {
    const result = runCode([
      "from figstyle import text_color_for",
      "print(text_color_for('#0F4D92'), text_color_for('#272727'),",
      "      text_color_for('#DDF3DE'), text_color_for('#FFD700'))",
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "white white black black");
  },
);

test("check-palette warns for a red-green pair", { skip }, () => {
  const result = run(["check-palette", "#D62728", "#2CA02C"]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.verdict, "WARN");
  assert.equal(report.conditions.deuteranopia.verdict, "WARN");
  assert.equal(report.conditions.normal.verdict, "PASS");
});

test("check-palette passes the first four Okabe-Ito colors", { skip }, () => {
  withTempDir((dir) => {
    const out = path.join(dir, "report.json");
    const result = run([
      "check-palette",
      "#E69F00",
      "#56B4E9",
      "#009E73",
      "#F0E442",
      "--output",
      out,
    ]);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.verdict, "PASS");
    for (const name of ["normal", "deuteranopia", "protanopia", "tritanopia"]) {
      assert.equal(report.conditions[name].verdict, "PASS", name);
    }
    const bytes = readFileSync(out, "utf8");
    assert.ok(!bytes.includes("\r\n"), "the JSON file must use LF newlines");
    assert.deepEqual(JSON.parse(bytes), report);
  });
});
