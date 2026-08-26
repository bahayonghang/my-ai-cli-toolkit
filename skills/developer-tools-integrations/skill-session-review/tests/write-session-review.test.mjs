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
const script = path.join(skillRoot, "scripts", "write_session_review.py");

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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-write-"));
  fs.writeFileSync(path.join(root, ".gitignore"), "node_modules/\n", "utf8");
  return root;
}

function expectedSha(text) {
  const normalized = text.endsWith("\n") ? text : `${text}\n`;
  const data = Buffer.from(normalized, "utf8");
  return { data, sha256: createHash("sha256").update(data).digest("hex") };
}

test("writes UTF-8 LF report and appends exact gitignore line", () => {
  const root = makeRepo();
  const body = "# 使用情况\n\n结论：需修订\n";
  const result = runWriter(["--repo-root", root, "--skill-name", "trellis-plan-review"], {
    input: body,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout.trim());
  const dest = path.join(root, "reports", "skill-session-review", "trellis-plan-review.md");
  assert.equal(payload.path.replace(/\\/g, "/"), canonicalPath(dest));
  assert.equal(payload.gitignore_wrote, true);
  const written = fs.readFileSync(dest);
  const expect = expectedSha(body);
  assert.equal(written.equals(expect.data), true);
  assert.equal(written.includes(Buffer.from("\r\n")), false);
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^reports\/skill-session-review\/$/m);
  assert.equal((gitignore.match(/reports\/skill-session-review\//g) || []).length, 1);
});

test("second write overwrites the same path and does not duplicate gitignore", () => {
  const root = makeRepo();
  const first = runWriter(["--repo-root", root, "--skill-name", "demo"], { input: "first\n" });
  assert.equal(first.status, 0, first.stderr);
  const second = runWriter(["--repo-root", root, "--skill-name", "demo"], { input: "second\n" });
  assert.equal(second.status, 0, second.stderr);
  const dest = path.join(root, "reports", "skill-session-review", "demo.md");
  assert.equal(fs.readFileSync(dest, "utf8"), "second\n");
  assert.equal(JSON.parse(second.stdout.trim()).gitignore_wrote, false);
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.equal((gitignore.match(/reports\/skill-session-review\//g) || []).length, 1);
});

test("refuses unsafe skill names and path escape", () => {
  const root = makeRepo();
  const badName = runWriter(["--repo-root", root, "--skill-name", "../secret"], {
    input: "body\n",
  });
  assert.equal(badName.status, 1, badName.stderr);
  assert.match(badName.stderr, /safe report basename/);
  const absName = runWriter(["--repo-root", root, "--skill-name", "ok"], {
    input: "body\n",
  });
  assert.equal(absName.status, 0);
});

test("refuses a missing repo root", () => {
  const missing = path.join(os.tmpdir(), "ssr-missing-root-does-not-exist");
  const result = runWriter(["--repo-root", missing, "--skill-name", "demo"], {
    input: "body\n",
  });
  assert.equal(result.status, 2, result.stderr);
});

test("redacts ghp_ and Bearer fragments", () => {
  const root = makeRepo();
  const result = runWriter(["--repo-root", root, "--skill-name", "demo"], {
    input: "token ghp_abcdefghijklmnopqrstuvwxyz012345 and Bearer abc.def\n",
  });
  assert.equal(result.status, 0, result.stderr);
  const dest = path.join(root, "reports", "skill-session-review", "demo.md");
  const text = fs.readFileSync(dest, "utf8");
  assert.equal(text.includes("ghp_"), false);
  assert.equal(text.includes("Bearer abc"), false);
  assert.match(text, /\[REDACTED\]/);
});

test("appends gitignore when only a global exclude would cover the path", () => {
  const root = makeRepo();
  const gitDir = path.join(root, ".git");
  fs.mkdirSync(path.join(gitDir, "info"), { recursive: true });
  fs.writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
  fs.writeFileSync(path.join(gitDir, "info", "exclude"), "reports/\n", "utf8");
  const result = runWriter(["--repo-root", root, "--skill-name", "demo"], {
    input: "body\n",
  });
  assert.equal(result.status, 0, result.stderr);
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^reports\/skill-session-review\/$/m);
  assert.equal(JSON.parse(result.stdout.trim()).gitignore_wrote, true);
});
