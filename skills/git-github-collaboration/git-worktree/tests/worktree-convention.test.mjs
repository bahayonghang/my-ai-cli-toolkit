import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const helperScript = path.resolve(__dirname, "..", "scripts", "worktree_convention.py");

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

function detectGit() {
  const probe = spawnSync("git", ["--version"], { stdio: "ignore" });
  return !probe.error && probe.status === 0;
}

const python = detectPython();
const skip = python
  ? detectGit()
    ? false
    : "requires git"
  : "requires a Python interpreter (tried python3, python, py -3, py)";

function runGit(cwd, args, extraEnv = {}) {
  return spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", ...extraEnv },
  });
}

function initRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "git-worktree-skill-"));
  const git = (args) => {
    const result = runGit(root, args);
    assert.equal(result.status, 0, result.stderr);
    return result;
  };
  git(["init", "-b", "main"]);
  git(["config", "user.email", "test@example.com"]);
  git(["config", "user.name", "Test"]);
  git(["config", "commit.gpgsign", "false"]);
  fs.writeFileSync(path.join(root, "README.md"), "seed\n", "utf8");
  git(["add", "README.md"]);
  git(["commit", "-m", "seed"]);
  return root;
}

function runHelper(repo, args, extraEnv = {}) {
  return spawnSync(python.command, [...python.prefix, helperScript, "--repo-root", repo, ...args], {
    encoding: "utf8",
    env: { ...process.env, PYTHONUTF8: "1", GIT_CONFIG_NOSYSTEM: "1", ...extraEnv },
  });
}

function readJson(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("default root is .worktrees when nothing exists", { skip }, () => {
  const repo = initRepo();
  const payload = readJson(runHelper(repo, ["inspect"]));
  assert.equal(payload.resolved_root, ".worktrees");
  assert.equal(payload.resolution_reason, "default");
});

test("existing .agents/worktrees is used when it is the only local root", { skip }, () => {
  const repo = initRepo();
  fs.mkdirSync(path.join(repo, ".agents", "worktrees"), { recursive: true });
  const payload = readJson(runHelper(repo, ["inspect"]));
  assert.equal(payload.resolved_root, ".agents/worktrees");
  assert.equal(payload.resolution_reason, "existing-local");
});

test("registered .claude/worktrees wins over a later default .worktrees", { skip }, () => {
  const repo = initRepo();
  const added = runGit(repo, ["worktree", "add", "-b", "lane", ".claude/worktrees/lane"]);
  assert.equal(added.status, 0, added.stderr);
  const payload = readJson(runHelper(repo, ["inspect"]));
  assert.equal(payload.resolved_root, ".claude/worktrees");
  assert.equal(payload.resolution_reason, "registered");
  assert.ok(payload.registered_in_repo_roots.includes(".claude/worktrees"));
});

test("explicit root overrides registered and default roots", { skip }, () => {
  const repo = initRepo();
  fs.mkdirSync(path.join(repo, ".worktrees"), { recursive: true });
  const payload = readJson(runHelper(repo, ["--explicit-root", ".agents/worktrees", "inspect"]));
  assert.equal(payload.resolved_root, ".agents/worktrees");
  assert.equal(payload.resolution_reason, "explicit");
});

test("explicit-root escapes are rejected with exit 2", { skip }, () => {
  const repo = initRepo();
  const cases = [["../outside"], [path.resolve(os.tmpdir())], [".git"], ["foo/../bar"]];
  for (const value of cases) {
    const result = runHelper(repo, ["--explicit-root", value[0], "inspect"]);
    assert.equal(result.status, 2, `${value[0]} => ${result.stderr}`);
    assert.match(result.stderr, /ERROR:/);
  }
});

test("symlink escape is rejected", { skip }, () => {
  const repo = initRepo();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "wt-outside-"));
  const link = path.join(repo, "escaped");
  try {
    fs.symlinkSync(outside, link, "dir");
  } catch (error) {
    if (process.platform === "win32") {
      return;
    }
    throw error;
  }
  const result = runHelper(repo, ["--explicit-root", "escaped", "inspect"]);
  assert.equal(result.status, 2, result.stderr);
});

test("missing repo gitignore blocks create until apply", { skip }, () => {
  const repo = initRepo();
  const before = readJson(runHelper(repo, ["--branch", "feat/login", "inspect"]));
  assert.equal(before.gitignore_covers, false);
  assert.equal(before.write_required, true);
  const planned = readJson(
    runHelper(repo, ["--mode", "new-branch", "--branch", "feat/login", "plan-create"]),
  );
  assert.equal(planned.ok_to_create, false);
  assert.ok(planned.refusals.includes("ignore_gate"));
  const applied = readJson(runHelper(repo, ["ensure-ignore", "--apply"]));
  assert.equal(applied.gitignore_covers, true);
  assert.equal(applied.wrote, true);
  const gitignore = fs.readFileSync(path.join(repo, ".gitignore"), "utf8");
  assert.match(gitignore, /\.worktrees\//);
  const after = readJson(
    runHelper(repo, ["--mode", "new-branch", "--branch", "feat/login", "plan-create"]),
  );
  assert.equal(after.ok_to_create, true);
  assert.deepEqual(after.argv.slice(0, 5), ["git", "worktree", "add", "-b", "feat/login"]);
});

test("global exclude alone does not satisfy the ignore gate", { skip }, () => {
  const repo = initRepo();
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "wt-home-"));
  const excludes = path.join(home, "excludes");
  const globalConfig = path.join(home, "gitconfig");
  fs.writeFileSync(excludes, ".worktrees/\n", "utf8");
  fs.writeFileSync(globalConfig, `[core]\n\texcludesFile = ${excludes.replaceAll("\\", "/")}\n`, "utf8");
  const payload = readJson(
    runHelper(repo, ["inspect"], { GIT_CONFIG_GLOBAL: globalConfig }),
  );
  assert.equal(payload.check_ignore, true);
  assert.equal(payload.gitignore_covers, false);
});

test("parent .agents/ rule covers .agents/worktrees via check-ignore", { skip }, () => {
  const repo = initRepo();
  fs.writeFileSync(path.join(repo, ".gitignore"), ".agents/\n", "utf8");
  fs.mkdirSync(path.join(repo, ".agents", "worktrees"), { recursive: true });
  const payload = readJson(runHelper(repo, ["inspect"]));
  assert.equal(payload.resolved_root, ".agents/worktrees");
  assert.equal(payload.gitignore_covers, true);
  assert.equal(payload.write_required, false);
});

test("slug converts feat/login to feat-login", { skip }, () => {
  const repo = initRepo();
  const payload = readJson(runHelper(repo, ["--branch", "feat/login", "inspect"]));
  assert.equal(payload.slug, "feat-login");
  assert.ok(payload.worktree_path.replaceAll("\\", "/").endsWith("/.worktrees/feat-login"));
});

test("illegal slug exits 2", { skip }, () => {
  const repo = initRepo();
  const result = runHelper(repo, ["--slug", "..", "inspect"]);
  assert.equal(result.status, 2, result.stderr);
});

test("plan-create refuses existing local branch and existing path", { skip }, () => {
  const repo = initRepo();
  readJson(runHelper(repo, ["ensure-ignore", "--apply"]));
  const branched = runGit(repo, ["branch", "feat/exists"]);
  assert.equal(branched.status, 0, branched.stderr);
  const exists = readJson(
    runHelper(repo, ["--mode", "new-branch", "--branch", "feat/exists", "plan-create"]),
  );
  assert.equal(exists.ok_to_create, false);
  assert.ok(exists.refusals.includes("local_branch_exists"));
  fs.mkdirSync(path.join(repo, ".worktrees", "feat-new"), { recursive: true });
  const pathExists = readJson(
    runHelper(repo, ["--mode", "new-branch", "--branch", "feat/new", "plan-create"]),
  );
  assert.equal(pathExists.ok_to_create, false);
  assert.ok(pathExists.refusals.includes("path_exists"));
});

test("plan-create without new-branch mode is rejected", { skip }, () => {
  const repo = initRepo();
  const missing = runHelper(repo, ["--branch", "feat/x", "plan-create"]);
  assert.equal(missing.status, 2, missing.stderr);
  const other = runHelper(repo, ["--mode", "existing-ref", "--branch", "main", "plan-create"]);
  assert.equal(other.status, 1, other.stderr);
});

test("plan-remove requires -uall cleanliness, exact path, and owner", { skip }, () => {
  const repo = initRepo();
  readJson(runHelper(repo, ["ensure-ignore", "--apply"]));
  const plan = readJson(
    runHelper(repo, ["--mode", "new-branch", "--branch", "feat/clean", "plan-create"]),
  );
  assert.equal(plan.ok_to_create, true, JSON.stringify(plan));
  const added = runGit(repo, plan.argv.slice(1));
  assert.equal(added.status, 0, added.stderr);
  const unowned = readJson(runHelper(repo, ["--path", plan.worktree_path, "plan-remove"]));
  assert.equal(unowned.ok_to_remove, false);
  assert.ok(unowned.refusals.includes("unowned"));
  readJson(
    runHelper(repo, [
      "--mode",
      "new-branch",
      "--branch",
      "feat/clean",
      "--owner",
      "agent",
      "record-meta",
    ]),
  );
  fs.writeFileSync(path.join(plan.worktree_path, "scratch.txt"), "n\n", "utf8");
  const dirty = readJson(
    runHelper(repo, ["--path", plan.worktree_path, "--owner", "agent", "plan-remove"]),
  );
  assert.equal(dirty.ok_to_remove, false);
  assert.ok(dirty.refusals.includes("dirty_worktree"));
  fs.unlinkSync(path.join(plan.worktree_path, "scratch.txt"));
  const mismatch = readJson(runHelper(repo, ["--path", path.join(repo, "nope"), "plan-remove"]));
  assert.equal(mismatch.ok_to_remove, false);
  assert.ok(mismatch.refusals.includes("path_not_registered"));
  const clean = readJson(
    runHelper(repo, ["--path", plan.worktree_path, "--owner", "agent", "plan-remove"]),
  );
  assert.equal(clean.ok_to_remove, true, JSON.stringify(clean));
  assert.deepEqual(clean.argv, ["git", "worktree", "remove", plan.worktree_path]);
});

test("plan-prune never sets ok_to_prune", { skip }, () => {
  const repo = initRepo();
  const payload = readJson(runHelper(repo, ["plan-prune"]));
  assert.equal(payload.ok_to_prune, false);
  assert.equal(payload.authorization_required, true);
  assert.equal(payload.argv, null);
});

test("ensure-ignore without --apply does not write", { skip }, () => {
  const repo = initRepo();
  const payload = readJson(runHelper(repo, ["ensure-ignore"]));
  assert.equal(payload.wrote, false);
  assert.equal(fs.existsSync(path.join(repo, ".gitignore")), false);
});
