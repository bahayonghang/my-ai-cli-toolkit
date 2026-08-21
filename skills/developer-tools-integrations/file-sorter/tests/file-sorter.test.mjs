import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const helperScript = path.resolve(__dirname, "..", "scripts", "file_sorter.py");

function detectPython() {
  const candidates = [
    { command: "python3", prefix: [] },
    { command: "python", prefix: [] },
    { command: "py", prefix: ["-3"] },
    { command: "py", prefix: [] },
  ];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.command, [...candidate.prefix, "-c", "import sys"], {
      stdio: "ignore",
    });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
}

const python = detectPython();
const skip = python ? false : "requires a Python interpreter (tried python3, python, py -3, py)";

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "file-sorter-skill-"));
}

function writeFile(root, rel, contents = "x") {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents, "utf8");
  return full;
}

function runHelper(args, extraEnv = {}) {
  return spawnSync(python.command, [...python.prefix, "-X", "utf8", helperScript, ...args], {
    encoding: "utf8",
    env: { ...process.env, PYTHONUTF8: "1", ...extraEnv },
  });
}

function readJson(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function writeJson(root, name, payload) {
  const full = path.join(root, name);
  fs.writeFileSync(full, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return full;
}

test("relative root is rejected", { skip }, () => {
  const result = runHelper(["scan", "--root", "downloads"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /absolute path/);
});

test("junk, hidden, git root, node child, blend weak, families", { skip }, () => {
  const root = tmpDir();
  writeFile(root, "lion.jpg");
  writeFile(root, "notes.pdf");
  writeFile(root, "setup.msi");
  writeFile(root, "archive.zip");
  writeFile(root, "song.mp3");
  writeFile(root, "unknown.bin");
  writeFile(root, "Thumbs.db");
  writeFile(root, ".secret.txt");
  writeFile(root, "node-app/package.json", "{}");
  writeFile(root, "node-app/src/index.js", "console.log(1)\n");
  writeFile(root, "scene/shot.blend", "blend");

  const gitRoot = tmpDir();
  fs.mkdirSync(path.join(gitRoot, ".git"));
  writeFile(gitRoot, "readme.txt", "x");

  const scanned = readJson(runHelper(["scan", "--root", root, "--recursive"]));
  const names = scanned.entries.map((item) => item.name).sort();
  const expected = ["archive.zip", "lion.jpg", "notes.pdf", "setup.msi", "shot.blend", "song.mp3", "unknown.bin"];
  if (process.platform === "win32") {
    expected.unshift(".secret.txt");
  }
  assert.deepEqual(names, expected);
  const byName = Object.fromEntries(scanned.entries.map((item) => [item.name, item]));
  assert.equal(byName["lion.jpg"].family, "image");
  assert.equal(byName["lion.jpg"].preferred_main_category, "Images");
  assert.equal(byName["notes.pdf"].family, "document");
  assert.equal(byName["notes.pdf"].preferred_main_category, "Documents");
  assert.equal(byName["setup.msi"].family, "software");
  assert.equal(byName["unknown.bin"].family, "generic");
  assert.ok(scanned.skipped.some((item) => item.id === "junk"));
  assert.ok(scanned.skipped.some((item) => item.id === "node"));
  assert.ok(scanned.notes.some((item) => item.id === "blender-file"));
  if (process.platform !== "win32") {
    assert.ok(scanned.skipped.some((item) => item.id === "hidden"));
  }

  const gitScan = readJson(runHelper(["scan", "--root", gitRoot]));
  assert.equal(gitScan.ok_to_scan, false);
  assert.equal(gitScan.entries.length, 0);
  assert.ok(gitScan.skipped.some((item) => item.id === "git"));
});

test("consistent vs refined and whitelist", { skip }, () => {
  const root = tmpDir();
  const pdf = writeFile(root, "pci_dss.pdf", "pci");
  const jpg = writeFile(root, "lion.jpg", "img");
  const scanPath = writeJson(root, "scan.json", readJson(runHelper(["scan", "--root", root])));
  const proposalsPath = writeJson(root, "proposals.json", {
    proposals: [
      { source: pdf, category: "Security", subcategory: "PCI DSS" },
      { source: jpg, category: "Wildlife", subcategory: "Lions" },
    ],
  });

  const consistent = readJson(
    runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath, "--mode", "more-consistent"]),
  );
  const pdfItem = consistent.items.find((item) => item.source === pdf.replaceAll("\\", "/"));
  const jpgItem = consistent.items.find((item) => item.source === jpg.replaceAll("\\", "/"));
  assert.equal(pdfItem.category, "Documents");
  assert.equal(pdfItem.subcategory, "PCI DSS");
  assert.equal(jpgItem.category, "Images");
  assert.equal(jpgItem.subcategory, "Lions");

  const refined = readJson(
    runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath, "--mode", "more-refined"]),
  );
  const refinedPdf = refined.items.find((item) => item.source === pdf.replaceAll("\\", "/"));
  assert.equal(refinedPdf.category, "Security");

  const whitelistPath = writeJson(root, "whitelist.json", {
    categories: ["Documents", "Images"],
    subcategories: [],
    subcategories_by_category: {
      Documents: ["Invoices"],
      Images: ["Screenshots"],
    },
  });
  const branch = JSON.parse(
    runHelper([
      "assemble-plan",
      "--scan",
      scanPath,
      "--proposals",
      proposalsPath,
      "--mode",
      "more-refined",
      "--whitelist",
      whitelistPath,
    ]).stdout,
  );
  assert.equal(branch.ok_to_apply, false);
  assert.ok(branch.rejected.length >= 1);

  const bothStyles = writeJson(root, "bad-whitelist.json", {
    categories: ["Images"],
    subcategories: ["Screenshots"],
    subcategories_by_category: { Images: ["Screenshots"] },
  });
  const mixed = runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath, "--whitelist", bothStyles]);
  assert.equal(mixed.status, 2);

  const categories = [];
  const byCategory = {};
  for (let i = 0; i < 20; i += 1) {
    const name = `Cat${i}`;
    categories.push(name);
    byCategory[name] = [`Sub${i}A`, [`Sub${i}B`]];
  }
  const large = writeJson(root, "large-whitelist.json", {
    categories,
    subcategories: [],
    subcategories_by_category: Object.fromEntries(
      Object.entries(byCategory).map(([key, values]) => [key, values.flat()]),
    ),
  });
  const largeProposals = writeJson(root, "large-proposals.json", {
    proposals: [{ source: pdf, category: "NotListed", subcategory: "Nope" }],
  });
  const largePlan = JSON.parse(
    runHelper(["assemble-plan", "--scan", scanPath, "--proposals", largeProposals, "--whitelist", large]).stdout,
  );
  assert.ok(largePlan.whitelist_constraint_count > 30);
  assert.equal(largePlan.prompt_whitelist.truncated, true);
  assert.ok(largePlan.rejected.some((item) => item.reasons.some((reason) => /whitelist/.test(reason))));
});

test("label and filename validation", { skip }, () => {
  const root = tmpDir();
  const pdf = writeFile(root, "notes.pdf", "n");
  const scanPath = writeJson(root, "scan.json", readJson(runHelper(["scan", "--root", root])));
  const bad = writeJson(root, "bad.json", {
    proposals: [{ source: pdf, category: "Documents", subcategory: "notes.pdf" }],
  });
  const plan = JSON.parse(runHelper(["assemble-plan", "--scan", scanPath, "--proposals", bad]).stdout);
  assert.equal(plan.ok_to_apply, false);
  assert.ok(plan.rejected[0].reasons.length > 0);

  const identical = writeJson(root, "same.json", {
    proposals: [{ source: pdf, category: "Documents", subcategory: "Documents" }],
  });
  const samePlan = JSON.parse(
    runHelper(["assemble-plan", "--scan", scanPath, "--proposals", identical, "--mode", "more-refined"]).stdout,
  );
  assert.ok(samePlan.rejected.some((item) => item.reasons.some((reason) => /identical/.test(reason))));
});

test("dry-run apply does not move; execute writes undo and undo restores", { skip }, () => {
  const root = tmpDir();
  const pdf = writeFile(root, "notes.pdf", "hello");
  const scanPath = writeJson(root, "scan.json", readJson(runHelper(["scan", "--root", root])));
  const proposalsPath = writeJson(root, "proposals.json", {
    proposals: [{ source: pdf, category: "Documents", subcategory: "Notes" }],
  });
  const planPath = writeJson(
    root,
    "plan.json",
    readJson(runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath])),
  );
  const dry = readJson(runHelper(["apply", "--plan", planPath]));
  assert.equal(dry.dry_run, true);
  assert.equal(fs.existsSync(pdf), true);
  assert.equal(fs.existsSync(path.join(root, "Documents")), false);

  const applied = readJson(runHelper(["apply", "--plan", planPath, "--execute"]));
  assert.equal(applied.executed, true);
  assert.equal(fs.existsSync(pdf), false);
  const moved = path.join(root, "Documents", "Notes", "notes.pdf");
  assert.equal(fs.existsSync(moved), true);
  assert.ok(applied.undo_path);

  const second = runHelper(["apply", "--plan", planPath, "--execute"]);
  assert.notEqual(second.status, 0);

  const undone = readJson(runHelper(["undo", "--undo", applied.undo_path, "--execute"]));
  assert.equal(undone.executed, true);
  assert.equal(fs.existsSync(pdf), true);
  assert.equal(fs.existsSync(moved), false);
});

test("mtime drift and existing destination refuse execute", { skip }, () => {
  const root = tmpDir();
  const pdf = writeFile(root, "notes.pdf", "hello");
  const scanPath = writeJson(root, "scan.json", readJson(runHelper(["scan", "--root", root])));
  const proposalsPath = writeJson(root, "proposals.json", {
    proposals: [{ source: pdf, category: "Documents", subcategory: "Notes" }],
  });
  const plan = readJson(runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath]));
  const destDir = path.join(root, "Documents", "Notes");
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, "notes.pdf"), "taken", "utf8");
  const planPath = writeJson(root, "plan.json", plan);
  const blocked = runHelper(["apply", "--plan", planPath, "--execute"]);
  assert.notEqual(blocked.status, 0);
  assert.equal(fs.existsSync(pdf), true);

  const root2 = tmpDir();
  const pdf2 = writeFile(root2, "notes.pdf", "hello");
  const scan2 = writeJson(root2, "scan.json", readJson(runHelper(["scan", "--root", root2])));
  const proposals2 = writeJson(root2, "proposals.json", {
    proposals: [{ source: pdf2, category: "Documents", subcategory: "Notes" }],
  });
  const plan2 = readJson(runHelper(["assemble-plan", "--scan", scan2, "--proposals", proposals2]));
  fs.appendFileSync(pdf2, "changed");
  const plan2Path = writeJson(root2, "plan2.json", plan2);
  const drifted = runHelper(["apply", "--plan", plan2Path, "--execute"]);
  assert.notEqual(drifted.status, 0);
});

test("cross-parent proposal is rejected", { skip }, () => {
  const root = tmpDir();
  const other = tmpDir();
  writeFile(root, "notes.pdf", "n");
  const outsider = writeFile(other, "out.pdf", "o");
  const scanPath = writeJson(root, "scan.json", readJson(runHelper(["scan", "--root", root])));
  const proposalsPath = writeJson(root, "proposals.json", {
    proposals: [{ source: outsider, category: "Documents", subcategory: "Notes" }],
  });
  const plan = JSON.parse(runHelper(["assemble-plan", "--scan", scanPath, "--proposals", proposalsPath]).stdout);
  assert.equal(plan.ok_to_apply, false);
  assert.ok(plan.rejected.length >= 1);
});
