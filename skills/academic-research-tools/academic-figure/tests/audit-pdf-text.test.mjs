import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(__dirname, "..", "scripts", "audit_pdf_text.py");
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

function run(args) {
  return spawnSync(python.cmd, [...python.pre, script, ...args], {
    encoding: "utf8",
    env: baseEnv,
  });
}

// Smallest PDF the Tf scanner can read: one uncompressed content stream that
// declares a font size and draws text. No xref table is needed, because the
// audit scans content streams instead of parsing the document structure.
function minimalPdf(sizePt) {
  const content = `BT /F1 ${sizePt} Tf 20 20 Td (Sample) Tj ET`;
  return [
    "%PDF-1.4",
    "1 0 obj",
    `<< /Length ${content.length} >>`,
    "stream",
    content,
    "endstream",
    "endobj",
    "%%EOF",
    "",
  ].join("\n");
}

function withFile(contents, fn) {
  const dir = mkdtempSync(path.join(tmpdir(), "academic-figure-audit-"));
  const file = path.join(dir, "figure.pdf");
  writeFileSync(file, contents, "utf8");
  try {
    return fn(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a missing file exits non-zero with a clear error", { skip }, () => {
  const result = run([path.join(tmpdir(), "academic-figure-absent.pdf")]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /^error: /m);
});

test("a file that is not a PDF is rejected", { skip }, () => {
  withFile("plain text, not a PDF\n", (file) => {
    const result = run([file]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /not a PDF file/);
  });
});

test("text above the floor passes", { skip }, () => {
  withFile(minimalPdf(7), (file) => {
    const result = run([file, "--min-pt", "5"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /verdict: PASS/);
    assert.match(result.stdout, /minimum found: 7 pt/);
  });
});

test("text below the floor fails with exit 1", { skip }, () => {
  withFile(minimalPdf(4.2), (file) => {
    const result = run([file, "--min-pt", "5"]);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /verdict: FAIL/);
    assert.match(result.stdout, /\/F1 4\.2 Tf/);
  });
});

test("--json reports the offending run", { skip }, () => {
  withFile(minimalPdf(4.2), (file) => {
    const result = run([file, "--min-pt", "5", "--json"]);
    assert.equal(result.status, 1, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.auditable, true);
    assert.equal(report.text_run_count, 1);
    assert.equal(report.below_minimum_count, 1);
    assert.equal(report.below_minimum[0].size_pt, 4.2);
    assert.deepEqual(report.warnings, []);
  });
});

test("a PDF without text runs is not auditable", { skip }, () => {
  withFile(
    "%PDF-1.4\n1 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n",
    (file) => {
      const result = run([file]);
      assert.equal(result.status, 2);
      assert.match(result.stdout, /NOT AUDITABLE/);
    },
  );
});

test("a non-positive --min-pt is rejected", { skip }, () => {
  withFile(minimalPdf(7), (file) => {
    const result = run([file, "--min-pt", "0"]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /--min-pt must be positive/);
  });
});
