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

// Mirror the script's own path canonicalization (Python Path.resolve()), because
// Node's fs.realpathSync does not expand 8.3 short names (e.g. RUNNER~1) on Windows.
function canonicalPath(p) {
  const result = spawnSync(
    python.command,
    [
      ...python.prefix,
      "-c",
      "import pathlib,sys; sys.stdout.write(pathlib.Path(sys.argv[1]).resolve().as_posix())",
      p,
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

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
  assert.equal(payload.path.replace(/\\/g, "/"), canonicalPath(dest));
  const written = fs.readFileSync(dest);
  const expect = expectedSha(body);
  assert.equal(written.equals(expect.data), true);
  assert.equal(written.includes(Buffer.from("\r\n")), false);
  assert.equal(payload.sha256, expect.sha256);
  assert.equal(payload.bytes, expect.data.length);
  assert.match(written.toString("utf8"), /审阅报告/);
  assert.equal(fs.existsSync(`${dest}.tmp`), false);
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
  assert.equal(payload.path.replace(/\\/g, "/"), canonicalPath(dest));
});

test("a parent-scope write creates only the root report and preserves historical child reports", () => {
  const { root, taskDir: parentTask } = makeRepo();
  const liveChild = path.join(root, ".trellis", "tasks", "08-25-live-child");
  const archivedChild = path.join(
    root,
    ".trellis",
    "tasks",
    "archive",
    "2026-08",
    "08-25-archived-child",
  );
  fs.mkdirSync(liveChild, { recursive: true });
  fs.mkdirSync(archivedChild, { recursive: true });
  const reviewsDir = path.join(root, ".trellis", "reviews");
  fs.mkdirSync(reviewsDir, { recursive: true });
  const historicalChild = path.join(reviewsDir, "08-25-live-child.md");
  const historicalBytes = Buffer.from("historical child review\r\n", "utf8");
  fs.writeFileSync(historicalChild, historicalBytes);

  const result = runWriter([parentTask], { input: "# combined parent review\n" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(reviewsDir, "08-25-sample.md"), "utf8"), "# combined parent review\n");
  assert.equal(fs.readFileSync(historicalChild).equals(historicalBytes), true);
  assert.equal(fs.existsSync(path.join(reviewsDir, "08-25-archived-child.md")), false);
  assert.deepEqual(fs.readdirSync(reviewsDir).sort(), ["08-25-live-child.md", "08-25-sample.md"]);
});

test("refuses a reviews directory that is a symlink or junction", (t) => {
  const { root, taskDir } = makeRepo();
  const outsideReviews = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-outside-reviews-"));
  const reviewsDir = path.join(root, ".trellis", "reviews");
  try {
    fs.symlinkSync(outsideReviews, reviewsDir, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const result = runWriter([taskDir], { input: "# must not escape\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /reviews directory is a symlink or reparse point/);
  assert.equal(fs.existsSync(path.join(outsideReviews, "08-25-sample.md")), false);
});

test("refuses a task alias instead of changing the report basename after resolution", (t) => {
  const { root, taskDir } = makeRepo();
  const alias = path.join(root, ".trellis", "tasks", "08-25-alias");
  try {
    fs.symlinkSync(taskDir, alias, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const result = runWriter([alias], { input: "# must not rename\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /task directory.*symlink or reparse point/);
  assert.equal(fs.existsSync(path.join(root, ".trellis", "reviews")), false);
});

test("refuses an existing report symlink without changing its target", (t) => {
  const { root, taskDir } = makeRepo();
  const reviewsDir = path.join(root, ".trellis", "reviews");
  fs.mkdirSync(reviewsDir, { recursive: true });
  const target = path.join(reviewsDir, "historical-target.md");
  const targetBytes = Buffer.from("historical target\r\n", "utf8");
  fs.writeFileSync(target, targetBytes);
  const reportLink = path.join(reviewsDir, "08-25-sample.md");
  try {
    fs.symlinkSync(target, reportLink, "file");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const result = runWriter([taskDir], { input: "# must not follow\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /report file is a symlink or reparse point/);
  assert.equal(fs.readFileSync(target).equals(targetBytes), true);
  assert.equal(fs.lstatSync(reportLink).isSymbolicLink(), true);
});

test("keeps canonical output when the repository root is reached through an alias", (t) => {
  const { root } = makeRepo();
  const aliasParent = fs.mkdtempSync(path.join(os.tmpdir(), "tpr-repo-alias-"));
  const repoAlias = path.join(aliasParent, "linked-repo");
  try {
    fs.symlinkSync(root, repoAlias, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }
  const aliasedTask = path.join(repoAlias, ".trellis", "tasks", "08-25-sample");

  const result = runWriter([aliasedTask], { input: "# canonical alias write\n" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout.trim());
  const dest = path.join(root, ".trellis", "reviews", "08-25-sample.md");
  assert.equal(payload.path.replace(/\\/g, "/"), canonicalPath(dest));
  assert.equal(fs.readFileSync(dest, "utf8"), "# canonical alias write\n");

  const explicit = runWriter([aliasedTask, "--repo-root", repoAlias], {
    input: "# explicit canonical alias write\n",
  });
  assert.equal(explicit.status, 0, explicit.stderr || explicit.stdout);
  assert.equal(JSON.parse(explicit.stdout.trim()).path.replace(/\\/g, "/"), canonicalPath(dest));
  assert.equal(fs.readFileSync(dest, "utf8"), "# explicit canonical alias write\n");
});

test("refuses an ordinary pre-existing temp sibling without deleting it", () => {
  const { root, taskDir } = makeRepo();
  const reviewsDir = path.join(root, ".trellis", "reviews");
  fs.mkdirSync(reviewsDir, { recursive: true });
  const dest = path.join(reviewsDir, "08-25-sample.md");
  const tmp = `${dest}.tmp`;
  const residue = Buffer.from("inspect before removal\r\n", "utf8");
  fs.writeFileSync(tmp, residue);

  const result = runWriter([taskDir], { input: "# must not replace residue\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /temporary report sibling already exists/);
  assert.equal(fs.existsSync(dest), false);
  assert.equal(fs.readFileSync(tmp).equals(residue), true);
});

test("refuses a pre-existing temp symlink without changing external or report bytes", (t) => {
  const { root, taskDir } = makeRepo();
  const reviewsDir = path.join(root, ".trellis", "reviews");
  fs.mkdirSync(reviewsDir, { recursive: true });
  const dest = path.join(reviewsDir, "08-25-sample.md");
  const original = Buffer.from("original report\r\n", "utf8");
  fs.writeFileSync(dest, original);
  const external = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tpr-external-tmp-")), "payload.md");
  const externalBytes = Buffer.from("external must stay unchanged\r\n", "utf8");
  fs.writeFileSync(external, externalBytes);
  const tmpLink = `${dest}.tmp`;
  try {
    fs.symlinkSync(external, tmpLink, "file");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOSYS"].includes(error.code)) return t.skip("links unavailable");
    throw error;
  }

  const result = runWriter([taskDir], { input: "# must not follow temp link\n" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /temporary report sibling already exists/);
  assert.equal(fs.readFileSync(dest).equals(original), true);
  assert.equal(fs.readFileSync(external).equals(externalBytes), true);
  assert.equal(fs.lstatSync(tmpLink).isSymbolicLink(), true);
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

const hasGit = spawnSync("git", ["--version"], { encoding: "utf8" }).status === 0;

function makeGitRepo() {
  const { root, taskDir } = makeRepo();
  const init = spawnSync("git", ["-C", root, "init", "-q"], { encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
  return { root, taskDir };
}

test("notes when the report destination is untracked and not ignored", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { taskDir } = makeGitRepo();
  const result = runWriter([taskDir], { input: "# report\n" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /untracked and not ignored/);
});

test("stays silent about gitignore when the reviews directory is ignored", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { root, taskDir } = makeGitRepo();
  fs.writeFileSync(path.join(root, ".trellis", ".gitignore"), "reviews/\n", "utf8");
  const result = runWriter([taskDir], { input: "# report\n" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stderr, /untracked and not ignored/);
});

test("stays silent when the report destination is already tracked", (t) => {
  if (!hasGit) return t.skip("git not available");
  const { root, taskDir } = makeGitRepo();
  fs.mkdirSync(path.join(root, ".trellis", "reviews"), { recursive: true });
  fs.writeFileSync(path.join(root, ".trellis", "reviews", "08-25-sample.md"), "old\n", "utf8");
  spawnSync("git", ["-C", root, "add", ".trellis/reviews/08-25-sample.md"], { encoding: "utf8" });
  const result = runWriter([taskDir], { input: "# report\n" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stderr, /untracked and not ignored/);
});
