import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const script = path.join(skillRoot, "scripts", "write_review_report.py");

function pythonCommand() {
  if (process.env.PYTHON) return { command: process.env.PYTHON, prefix: [] };
  for (const candidate of [
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"], {
      encoding: "utf8",
    });
    if (result.status === 0) return candidate;
  }
  return { command: "python", prefix: [] };
}

const python = pythonCommand();

function runWriter(args, options = {}) {
  return spawnSync(python.command, [...python.prefix, script, ...args], {
    encoding: "utf8",
    input: options.input,
    cwd: options.cwd,
  });
}

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-reviews-"));
  const taskDir = path.join(root, ".trellis", "tasks", "08-25-sample");
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(path.join(taskDir, "prd.md"), "# sample\n", "utf8");
  return { root, taskDir };
}

function expectedSha(text) {
  const normalized = text.endsWith("\n") ? text : `${text}\n`;
  const data = Buffer.from(normalized, "utf8");
  return { data, sha256: createHash("sha256").update(data).digest("hex") };
}

test("writes UTF-8 LF report under .trellis/reviews/<task-dir-name>.md", () => {
  const { root, taskDir } = makeRepo();
  const body = "# 审阅报告\n\n结论：可执行\n";
  const result = runWriter([taskDir], { input: body });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const payload = JSON.parse(result.stdout.trim());
  const dest = path.join(root, ".trellis", "reviews", "08-25-sample.md");
  assert.equal(
    fs.realpathSync(payload.path).replace(/\\/g, "/"),
    fs.realpathSync(dest).replace(/\\/g, "/"),
  );
  const written = fs.readFileSync(dest);
  const expect = expectedSha(body);
  assert.equal(written.equals(expect.data), true);
  assert.equal(written.includes(Buffer.from("\r\n")), false);
  assert.equal(payload.sha256, expect.sha256);
  assert.equal(payload.bytes, expect.data.length);
  assert.match(written.toString("utf8"), /审阅报告/);
});

test("second write overwrites the same path", () => {
  const { root, taskDir } = makeRepo();
  const first = runWriter([taskDir], { input: "first\n" });
  assert.equal(first.status, 0, first.stderr);
  const second = runWriter([taskDir], { input: "second\n" });
  assert.equal(second.status, 0, second.stderr);
  const dest = path.join(root, ".trellis", "reviews", "08-25-sample.md");
  assert.equal(fs.readFileSync(dest, "utf8"), "second\n");
  const payload = JSON.parse(second.stdout.trim());
  assert.equal(
    fs.realpathSync(payload.path).replace(/\\/g, "/"),
    fs.realpathSync(dest).replace(/\\/g, "/"),
  );
});

test("refuses a task directory name that is not a safe basename", () => {
  const { root } = makeRepo();
  const hidden = path.join(root, ".trellis", "tasks", ".hidden");
  fs.mkdirSync(hidden);
  const result = runWriter([hidden], { input: "body\n" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /safe report basename/);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("refuses a task directory outside repo .trellis/tasks", () => {
  const { root } = makeRepo();
  const outsider = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-outsider-"));
  const result = runWriter([outsider, "--repo-root", root], { input: "body\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /task directory is not under/);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("without --repo-root, a directory that is not under .trellis/tasks is refused", () => {
  const outsider = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-orphan-"));
  const result = runWriter([outsider], { input: "body\n" });
  assert.notEqual(result.status, 0, result.stderr);
  assert.match(result.stderr, /ERROR:/);
});

test("exits 1 when --repo-root has no .trellis directory", () => {
  const { taskDir } = makeRepo();
  const other = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-noroottrellis-"));
  const result = runWriter([taskDir, "--repo-root", other], { input: "body\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /has no \.trellis directory/);
});

test("reads --input as UTF-8 including Chinese text", () => {
  const { root, taskDir } = makeRepo();
  const inputPath = path.join(root, "payload.md");
  const body = "阻断 1\n应修 2\n提示 0\n";
  fs.writeFileSync(inputPath, body, { encoding: "utf8" });
  const result = runWriter([taskDir, "--input", inputPath]);
  assert.equal(result.status, 0, result.stderr);
  const dest = path.join(root, ".trellis", "reviews", "08-25-sample.md");
  assert.equal(fs.readFileSync(dest, "utf8"), body);
});

test("refuses an empty body", () => {
  const { taskDir } = makeRepo();
  const result = runWriter([taskDir], { input: "   \n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /empty/);
});
