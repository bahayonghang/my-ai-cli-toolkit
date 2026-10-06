import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Run each ported figures4papers script in a temp directory. LaTeX is forced
// off (ACADEMIC_FIGURE_NO_TEX=1) and DPI is lowered (ACADEMIC_FIGURE_DPI=40).
// The first argument is the output directory; the PNG names are the upstream
// names. A script whose optional module is missing is skipped with the module
// name in the reason.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portDir = path.resolve(__dirname, "..", "scripts", "figures4papers");
const baseEnv = {
  ...process.env,
  PYTHONUTF8: "1",
  PYTHONIOENCODING: "utf-8",
  PYTHONDONTWRITEBYTECODE: "1",
  ACADEMIC_FIGURE_NO_TEX: "1",
  ACADEMIC_FIGURE_DPI: "40",
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

function hasModule(py, name) {
  const probe = spawnSync(py.cmd, [...py.pre, "-c", `import ${name}`], {
    encoding: "utf8",
    env: baseEnv,
  });
  return !probe.error && probe.status === 0;
}

const python = resolvePython();
const baseSkip = !python
  ? "no python interpreter available"
  : hasModule(python, "matplotlib") && hasModule(python, "numpy")
    ? false
    : "requires matplotlib and numpy";

// Script (relative to scripts/figures4papers) -> optional modules and the
// upstream PNG names (catalog section 1.3).
const SCRIPTS = {
  "figure_Brainteaser/plot_brute_force.py": { outputs: ["brute_force.png"] },
  "figure_Brainteaser/plot_correctness_by_category.py": {
    outputs: ["correctness_by_category.png"],
  },
  "figure_Brainteaser/plot_correctness_by_subcategory.py": {
    outputs: ["correctness_by_subcategory.png"],
  },
  "figure_Brainteaser/plot_rewriting.py": { outputs: ["rewriting.png"] },
  "figure_Brainteaser/plot_selfcorrection_math.py": {
    outputs: ["selfcorrection_math.png"],
  },
  "figure_CellSpliceNet/plot_ablation.py": { outputs: ["ablation.png"] },
  "figure_CellSpliceNet/plot_comparison.py": {
    outputs: ["comparison_worm.png", "comparison_human.png"],
  },
  "figure_Cflows/diffusion_swiss_roll.py": {
    requires: ["scipy"],
    outputs: ["diffusion_swiss_roll.png"],
  },
  "figure_Cflows/plot_comparison_Ablation.py": {
    outputs: ["figX_comparison_Ablation.png"],
  },
  "figure_Cflows/plot_comparison_GeneRegulatory.py": {
    outputs: ["fig2_comparison_GeneRegulatory.png"],
  },
  "figure_Cflows/plot_comparison_Trajectory.py": {
    outputs: ["fig2_comparison_Trajectory.png"],
  },
  "figure_Dispersion/plot_idea.py": { outputs: ["idea.png"] },
  "figure_Dispersion/plot_illustration.py": { outputs: ["illustration.png"] },
  "figure_ImmunoStruct/plot_bars.py": {
    outputs: [
      "bars_comparison_IEDB.png",
      "bars_ablation_IEDB.png",
      "bars_comparison_Cancer.png",
      "bars_ablation_Cancer.png",
    ],
  },
  "figure_RNAGenScape/plot_comparison.py": {
    outputs: [
      "results_comparison_speed.png",
      "results_comparison_optimization.png",
    ],
  },
  "figure_RNAGenScape/plot_hole_manifold.py": {
    outputs: ["manifold_holes.png"],
  },
  "figure_RNAGenScape/plot_manifold.py": { outputs: ["manifold.png"] },
  "figure_RNAGenScape/plot_sweep.py": { outputs: ["results_sweep.png"] },
  "figure_VIGIL/plot_ablation.py": { outputs: ["ablation_curves.png"] },
  "figure_VIGIL/plot_comparison_radar.py": {
    outputs: ["comparison_radar.png"],
  },
  "figure_VIGIL/plot_concept.py": {
    requires: ["scipy"],
    outputs: ["concept.png"],
  },
  "figure_VIGIL/plot_posttraining.py": {
    outputs: ["comparison_posttraining.png"],
  },
  "figure_ophthal_review/plot_composition.py": {
    requires: ["seaborn"],
    outputs: ["composition_heatmap.png"],
  },
  "figure_ophthal_review/plot_trend.py": {
    requires: ["dateutil"],
    outputs: ["trend_by_month.png"],
  },
};

const moduleCache = new Map();
function missingModules(modules) {
  return modules.filter((name) => {
    if (!moduleCache.has(name)) moduleCache.set(name, hasModule(python, name));
    return !moduleCache.get(name);
  });
}

test("the port table lists 24 plot scripts, all present", () => {
  const scripts = Object.keys(SCRIPTS);
  assert.equal(scripts.length, 24);
  for (const rel of scripts) {
    assert.ok(existsSync(path.join(portDir, rel)), `missing ${rel}`);
  }
  assert.ok(
    existsSync(path.join(portDir, "figure_ImmunoStruct", "raw_data.py")),
    "missing figure_ImmunoStruct/raw_data.py",
  );
});

for (const [rel, { requires = [], outputs }] of Object.entries(SCRIPTS)) {
  let skip = baseSkip;
  if (!skip) {
    const missing = missingModules(requires);
    if (missing.length > 0) {
      skip = `requires python module(s): ${missing.join(", ")}`;
    }
  }
  test(`${rel} writes ${outputs.join(", ")}`, { skip }, () => {
    const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-f4p-"));
    try {
      const outDir = path.join(dir, "out");
      const result = spawnSync(
        python.cmd,
        [...python.pre, path.join(portDir, rel), outDir],
        { encoding: "utf8", env: baseEnv, cwd: dir },
      );
      assert.equal(result.status, 0, `${rel} failed:\n${result.stderr}`);
      for (const name of outputs) {
        const out = path.join(outDir, name);
        assert.ok(existsSync(out), `${rel} did not write ${name}`);
        assert.ok(statSync(out).size > 0, `${name} is empty`);
        assert.ok(
          result.stdout.includes(name),
          `${rel} did not print the path of ${name}: ${result.stdout}`,
        );
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
