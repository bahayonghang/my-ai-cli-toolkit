import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Run each catalog style script in a temp directory with LaTeX forced off
// (ACADEMIC_FIGURE_NO_TEX=1) and the non-interactive Agg backend.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.resolve(__dirname, "..", "scripts");
const baseEnv = {
  ...process.env,
  PYTHONUTF8: "1",
  PYTHONIOENCODING: "utf-8",
  ACADEMIC_FIGURE_NO_TEX: "1",
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

function hasModules(py, modules) {
  const probe = spawnSync(
    py.cmd,
    [...py.pre, "-c", `import ${modules.join(", ")}`],
    { encoding: "utf8", env: baseEnv },
  );
  return !probe.error && probe.status === 0;
}

const python = resolvePython();
const skip = !python
  ? "no python interpreter available"
  : hasModules(python, ["matplotlib", "numpy"])
    ? false
    : "requires matplotlib and numpy";

// Script name -> output file names (argv[1], argv[2], ...).
const SCRIPTS = {
  "bar_memevolve.py": ["bar_memevolve.png"],
  "bar_spice.py": ["bar_spice.png"],
  "classwise_iou_table.py": ["classwise_iou.png"],
  "line_aime.py": ["line_aime.png"],
  "line_loss_inset.py": ["line_loss_inset.png"],
  "line_selfdistill.py": ["selfdistill_v6.png", "selfdistill_scaling.png"],
  "radar_dora.py": ["radar_dora.png"],
  "scatter_break.py": ["scatter_break.png"],
  "scatter_tsne.py": ["scatter_tsne.png"],
};

for (const [script, outputs] of Object.entries(SCRIPTS)) {
  test(`${script} renders its PNG without LaTeX`, { skip }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-style-"));
    try {
      const outPaths = outputs.map((name) => path.join(dir, name));
      const result = spawnSync(
        python.cmd,
        [...python.pre, path.join(scriptsDir, script), ...outPaths],
        { encoding: "utf8", env: baseEnv, cwd: dir },
      );
      assert.equal(result.status, 0, `${script} failed:\n${result.stderr}`);
      for (const out of outPaths) {
        assert.ok(existsSync(out), `${script} did not write ${out}`);
        assert.ok(statSync(out).size > 0, `${out} is empty`);
      }
      // Scripts that print a success line must print the real output path.
      if (/saved:/.test(result.stdout)) {
        for (const name of outputs) {
          assert.ok(
            result.stdout.includes(name),
            `${script} printed a path other than ${name}: ${result.stdout}`,
          );
        }
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
