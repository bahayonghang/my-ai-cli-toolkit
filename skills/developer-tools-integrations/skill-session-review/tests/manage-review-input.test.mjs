import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.join(testDir, "..", "scripts");
const script = path.join(testDir, "..", "scripts", "manage_review_input.py");
const baseReview = JSON.parse(fs.readFileSync(path.join(testDir, "valid-review.json"), "utf8"));
const CASES = [
  "create-normalized-json",
  "create-hash-readback",
  "create-parent-after-validation",
  "create-no-clobber",
  "replace-correct-hash",
  "replace-stale-hash",
  "schema-invalid-before-mutation",
  "payload-name-mismatch",
  "zero-invoked",
  "zero-scored-sessions",
  "zero-ratio-denominator",
  "cross-field-aggregate-mismatch",
  "secret-before-mutation",
  "invalid-utf8-before-mutation",
  "bom-crlf-normalizes-lf",
  "git-ignore-required",
  "non-repo-allowed",
  "canonical-name-positive",
  "legacy-skill-name-negative",
  "unsafe-name-negative",
  "input-target-link-negative",
  "input-parent-link-negative",
  "predictable-temp-regular-ignored-preserved",
  "predictable-temp-link-ignored-preserved",
  "finalization-failure-preserves-old",
  "remove-proof-missing",
  "remove-proof-duplicate",
  "remove-input-hash-stale",
  "remove-artifact-missing",
  "remove-artifact-hash-stale",
  "remove-input-lease-contention",
  "remove-artifact-lease-prefix-release",
  "remove-late-replace-preserves-new",
  "remove-late-artifact-replace-preserves-new",
  "remove-complete-proof-only-input",
  "remove-second-refused",
  "partial-html-failure-retains-input-markdown",
  "partial-retry-converges-remove",
  "stdout-bounded",
  "git-index-unchanged",
];

function pythonCommand() {
  for (const candidate of [
    { command: process.env.PYTHON, prefix: [] },
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    if (!candidate.command) continue;
    if (spawnSync(candidate.command, [...candidate.prefix, "--version"]).status === 0) return candidate;
  }
  throw new Error("Python interpreter not found");
}
const python = pythonCommand();

function bytes(review = baseReview) {
  return Buffer.from(`${JSON.stringify(review, null, 2)}\n`, "utf8");
}

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

function run(command, root, args = [], input = Buffer.alloc(0), env = {}) {
  return spawnSync(
    python.command,
    [...python.prefix, script, command, "--repo-root", root, ...args],
    { input, encoding: null, env: { ...process.env, ...env } },
  );
}

function utf8(data) {
  return new TextDecoder("utf-8", { fatal: true }).decode(data);
}

function json(result) {
  return JSON.parse(utf8(result.stdout));
}

function makeRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ssr-input-"));
}

function paths(root, name = "demo-skill") {
  const reportDir = path.join(root, "reports", "skill-session-review");
  return {
    reportDir,
    inputDir: path.join(reportDir, ".input"),
    input: path.join(reportDir, ".input", `${name}.json`),
    temp: path.join(reportDir, ".input", `.${name}.json.tmp`),
    md: path.join(reportDir, `${name}.md`),
    html: path.join(reportDir, `${name}.html`),
  };
}

function create(root, review = baseReview, name = "demo-skill", raw = bytes(review)) {
  return run("create", root, ["--name", name], raw);
}

function writeArtifacts(root, md = Buffer.from("markdown\n"), html = Buffer.from("html\n")) {
  const p = paths(root);
  fs.mkdirSync(p.reportDir, { recursive: true });
  fs.writeFileSync(p.md, md);
  fs.writeFileSync(p.html, html);
  return { md, html, p };
}

function remove(root, inputSha, mdSha, htmlSha, extra = []) {
  return run("remove", root, [
    "--name", "demo-skill",
    "--expected-sha256", inputSha,
    "--artifact-sha256", `markdown=${mdSha}`,
    "--artifact-sha256", `html=${htmlSha}`,
    ...extra,
  ]);
}

function makeGitRepo(root, ignored = true) {
  assert.equal(spawnSync("git", ["-C", root, "init", "-q"]).status, 0);
  fs.writeFileSync(path.join(root, ".gitignore"), ignored ? "reports/skill-session-review/\n" : "node_modules/\n", "utf8");
}

async function startLeaseHolder(target) {
  const holderSource = [
    "import pathlib,sys,time",
    `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
    "from review_contract import _acquire_advisory_lease,_lease_path",
    "fd,identity=_acquire_advisory_lease(_lease_path(pathlib.Path(sys.argv[1])))",
    "print('READY',flush=True)",
    "time.sleep(300)",
  ].join("; ");
  const holder = spawn(python.command, [...python.prefix, "-c", holderSource, target], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let holderStderr = "";
  holder.stderr.on("data", (chunk) => { holderStderr += chunk.toString("utf8"); });
  await new Promise((resolveReady, rejectReady) => {
    const timer = setTimeout(() => rejectReady(new Error(`lease holder timeout: ${holderStderr}`)), 5000);
    holder.stdout.on("data", (chunk) => {
      if (chunk.toString("utf8").includes("READY")) {
        clearTimeout(timer);
        resolveReady();
      }
    });
    holder.once("exit", (code) => {
      clearTimeout(timer);
      rejectReady(new Error(`lease holder exited early ${code}: ${holderStderr}`));
    });
  });
  return holder;
}

async function stopLeaseHolder(holder) {
  if (holder.exitCode !== null) return;
  const exited = once(holder, "exit");
  holder.kill("SIGKILL");
  await exited;
}

function symlinkOrSkip(t, target, link, type = "file") {
  try {
    fs.symlinkSync(target, link, type);
    return true;
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) {
      t.skip(`symlink unavailable: ${error.code}`);
      return false;
    }
    throw error;
  }
}

test("create validates first, normalizes UTF-8 LF, and emits disk identity", () => {
  const root = makeRoot();
  const p = paths(root);
  const crlf = Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    Buffer.from(`${JSON.stringify(baseReview, null, 2).replaceAll("\n", "\r\n")}\r\n`, "utf8"),
  ]);
  assert.equal(fs.existsSync(p.inputDir), false, "create-parent-after-validation");
  const result = create(root, baseReview, "demo-skill", crlf);
  assert.equal(result.status, 0, utf8(result.stderr));
  const disk = fs.readFileSync(p.input);
  assert.equal(disk.includes(Buffer.from("\r\n")), false, "bom-crlf-normalizes-lf");
  assert.equal(disk.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), false);
  assert.equal(json(result).sha256, sha(disk), "create-hash-readback");
  assert.equal(json(result).mode, "create", "create-normalized-json");
  assert.equal(json(result).git, "non-repo", "non-repo-allowed");
  assert.equal(json(result).path.replaceAll("\\", "/"), p.input.replaceAll("\\", "/"), "canonical-name-positive");
});

test("create is no-clobber and replace requires the current exact hash", () => {
  const root = makeRoot();
  const created = create(root);
  assert.equal(created.status, 0, utf8(created.stderr));
  const p = paths(root);
  const old = fs.readFileSync(p.input);
  const noClobber = create(root);
  assert.equal(noClobber.status, 3, "create-no-clobber");
  assert.deepEqual(fs.readFileSync(p.input), old);
  const changed = structuredClone(baseReview);
  changed.reliable = ["替换后的可靠结论 ✅"];
  const candidate = bytes(changed);
  const stale = run("replace", root, ["--name", "demo-skill", "--expected-sha256", "0".repeat(64)], candidate);
  assert.equal(stale.status, 4, "replace-stale-hash");
  assert.deepEqual(fs.readFileSync(p.input), old);
  const replaced = run("replace", root, ["--name", "demo-skill", "--expected-sha256", sha(old)], candidate);
  assert.equal(replaced.status, 0, utf8(replaced.stderr));
  assert.deepEqual(fs.readFileSync(p.input), candidate, "replace-correct-hash");
});

test("schema, identity, zero-sample, secret, and UTF-8 failures precede parent creation", () => {
  const mutations = {
    "schema-invalid-before-mutation": (r) => { delete r.language; },
    "payload-name-mismatch": (r) => { r.skill_name = "other-skill"; },
    "zero-invoked": (r) => { r.sessions = r.sessions.filter((s) => s.status !== "invoked"); },
    "zero-scored-sessions": (r) => { r.aggregate.scored_sessions = 0; },
    "zero-ratio-denominator": (r) => {
      r.coverage = Object.fromEntries(Object.keys(r.coverage).map((key) => [key, { status: "missing-store", invoked: 0, loaded: 0, available: 0 }]));
    },
    "cross-field-aggregate-mismatch": (r) => { r.aggregate.overall = 0.999999; },
    "secret-before-mutation": (r) => { r.reliable = ["Bearer abc.def"]; },
  };
  for (const [name, mutate] of Object.entries(mutations)) {
    const root = makeRoot();
    const review = structuredClone(baseReview);
    mutate(review);
    const result = create(root, review);
    assert.equal(result.status, name === "secret-before-mutation" ? 7 : 6, `${name}: ${utf8(result.stderr)}`);
    assert.equal(fs.existsSync(paths(root).reportDir), false, name);
  }
  const root = makeRoot();
  const invalid = run("create", root, ["--name", "demo-skill"], Buffer.from([0xff, 0xfe]));
  assert.equal(invalid.status, 6, "invalid-utf8-before-mutation");
  assert.equal(fs.existsSync(paths(root).reportDir), false);
});

test("Git repositories require the fixed subtree ignore without mutating .gitignore", () => {
  const root = makeRoot();
  makeGitRepo(root, false);
  const before = fs.readFileSync(path.join(root, ".gitignore"));
  const result = create(root);
  assert.equal(result.status, 8, utf8(result.stderr));
  assert.deepEqual(fs.readFileSync(path.join(root, ".gitignore")), before, "git-ignore-required");
  assert.equal(fs.existsSync(paths(root).inputDir), false);
});

test("legacy flag, unsafe names, input target links, and linked parents are refused", async (t) => {
  const root = makeRoot();
  const oldFlag = run("create", root, ["--skill-name", "demo-skill"], bytes());
  assert.equal(oldFlag.status, 2, "legacy-skill-name-negative");
  const unsafe = create(root, baseReview, "../demo-skill");
  assert.equal(unsafe.status, 2, "unsafe-name-negative");
  await t.test("input-target-link-negative", (st) => {
    const linkedRoot = makeRoot();
    const p = paths(linkedRoot);
    fs.mkdirSync(p.inputDir, { recursive: true });
    const outside = path.join(linkedRoot, "outside.json");
    fs.writeFileSync(outside, "outside\n", "utf8");
    if (!symlinkOrSkip(st, outside, p.input)) return;
    assert.equal(create(linkedRoot).status, 2);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside\n");
  });
  await t.test("input-parent-link-negative", (st) => {
    const linkedRoot = makeRoot();
    const p = paths(linkedRoot);
    const outsideDir = path.join(linkedRoot, "outside-dir");
    fs.mkdirSync(path.dirname(p.inputDir), { recursive: true });
    fs.mkdirSync(outsideDir);
    if (!symlinkOrSkip(st, outsideDir, p.inputDir, "junction")) return;
    assert.equal(create(linkedRoot).status, 2);
    assert.deepEqual(fs.readdirSync(outsideDir), []);
  });
});

test("unpredictable temp names ignore and preserve predictable residue", async (t) => {
  const root = makeRoot();
  const p = paths(root);
  fs.mkdirSync(p.inputDir, { recursive: true });
  fs.writeFileSync(p.temp, "foreign\n", "utf8");
  const hostile = create(root);
  assert.equal(hostile.status, 0, utf8(hostile.stderr));
  assert.equal(fs.readFileSync(p.temp, "utf8"), "foreign\n");
  await t.test("predictable-temp-link-ignored-preserved", (st) => {
    const linkedRoot = makeRoot();
    const lp = paths(linkedRoot);
    fs.mkdirSync(lp.inputDir, { recursive: true });
    const outside = path.join(linkedRoot, "outside-temp");
    fs.writeFileSync(outside, "outside\n", "utf8");
    if (!symlinkOrSkip(st, outside, lp.temp)) return;
    assert.equal(create(linkedRoot).status, 0);
    assert.equal(fs.readFileSync(outside, "utf8"), "outside\n");
  });
  const failRoot = makeRoot();
  const failed = run("create", failRoot, ["--name", "demo-skill"], bytes(), { SSR_INJECT_FINALIZE_FAILURE: "1" });
  assert.equal(failed.status, 1, utf8(failed.stderr));
  assert.equal(fs.existsSync(paths(failRoot).input), false, "finalization-failure-preserves-old");
  assert.equal(fs.existsSync(paths(failRoot).temp), false);
  const residue = fs.existsSync(paths(failRoot).inputDir)
    ? fs.readdirSync(paths(failRoot).inputDir).filter((name) => /^\.demo-skill\.json\.[0-9a-f]{32}\.(?:tmp|rollback)$/.test(name))
    : [];
  assert.deepEqual(residue, []);
});

test("remove requires complete current input and both artifact proofs", () => {
  const root = makeRoot();
  const created = create(root);
  assert.equal(created.status, 0, utf8(created.stderr));
  const p = paths(root);
  const inputSha = sha(fs.readFileSync(p.input));
  const { md, html } = writeArtifacts(root);
  const missing = run("remove", root, ["--name", "demo-skill", "--expected-sha256", inputSha]);
  assert.equal(missing.status, 8, "remove-proof-missing");
  assert.equal(fs.existsSync(p.input), true);
  const duplicate = remove(root, inputSha, sha(md), sha(html), ["--artifact-sha256", `html=${sha(html)}`]);
  assert.equal(duplicate.status, 8, "remove-proof-duplicate");
  const staleInput = remove(root, "0".repeat(64), sha(md), sha(html));
  assert.equal(staleInput.status, 8, "remove-input-hash-stale");
  const staleArtifact = remove(root, inputSha, "0".repeat(64), sha(html));
  assert.equal(staleArtifact.status, 8, "remove-artifact-hash-stale");
  fs.rmSync(p.html);
  const missingArtifact = remove(root, inputSha, sha(md), sha(html));
  assert.equal(missingArtifact.status, 8, "remove-artifact-missing");
  assert.equal(fs.existsSync(p.input), true);
  assert.deepEqual(fs.readFileSync(p.md), md);
});

test("remove rejects and restores a byte-identical input with a different inode", () => {
  const root = makeRoot();
  assert.equal(create(root).status, 0);
  const p = paths(root);
  const old = fs.readFileSync(p.input);
  const { md, html } = writeArtifacts(root);
  const replacement = Buffer.from(old);
  const replacementPath = path.join(root, "replacement.json");
  fs.writeFileSync(replacementPath, replacement);
  const provedIdentity = fs.statSync(p.input, { bigint: true });
  const replacementIdentity = fs.statSync(replacementPath, { bigint: true });
  assert.notEqual(
    `${provedIdentity.dev}:${provedIdentity.ino}`,
    `${replacementIdentity.dev}:${replacementIdentity.ino}`,
  );

  const result = run(
    "remove",
    root,
    [
      "--name", "demo-skill",
      "--expected-sha256", sha(old),
      "--artifact-sha256", `markdown=${sha(md)}`,
      "--artifact-sha256", `html=${sha(html)}`,
    ],
    Buffer.alloc(0),
    { SSR_TEST_LATE_SWAP_INPUT_WITH: replacementPath },
  );

  assert.equal(result.status, 8, "remove-late-replace-preserves-new");
  assert.match(utf8(result.stderr), /ERROR: input-proof-stale/u);
  assert.deepEqual(fs.readFileSync(p.input), replacement);
  assert.equal(fs.existsSync(replacementPath), false);
  assert.deepEqual(
    fs.readdirSync(p.inputDir).filter((name) => name.endsWith(".remove")),
    [],
  );
});

test("remove serializes input, Markdown, and HTML leases and releases held prefixes", async (t) => {
  for (const [caseName, blockedTarget] of [
    ["remove-input-lease-contention", (p) => p.input],
    ["remove-artifact-lease-prefix-release", (p) => p.html],
  ]) {
    await t.test(caseName, async () => {
      const root = makeRoot();
      assert.equal(create(root).status, 0);
      const p = paths(root);
      const old = fs.readFileSync(p.input);
      const { md, html } = writeArtifacts(root);
      const holder = await startLeaseHolder(blockedTarget(p));
      try {
        const blocked = remove(root, sha(old), sha(md), sha(html));
        assert.equal(blocked.status, 5, utf8(blocked.stderr));
        assert.match(utf8(blocked.stderr), /ERROR: lease-busy/u);
        assert.deepEqual(fs.readFileSync(p.input), old);
      } finally {
        await stopLeaseHolder(holder);
      }
      const recovered = remove(root, sha(old), sha(md), sha(html));
      assert.equal(recovered.status, 0, `${caseName}: ${utf8(recovered.stderr)}`);
      assert.equal(fs.existsSync(p.input), false);
    });
  }
});

test("remove rejects a byte-identical artifact with a different inode", () => {
  const root = makeRoot();
  assert.equal(create(root).status, 0);
  const p = paths(root);
  const old = fs.readFileSync(p.input);
  const { md, html } = writeArtifacts(root);
  const replacement = Buffer.from(md);
  const replacementPath = path.join(root, "replacement.md");
  fs.writeFileSync(replacementPath, replacement);
  const provedIdentity = fs.statSync(p.md, { bigint: true });
  const replacementIdentity = fs.statSync(replacementPath, { bigint: true });
  assert.notEqual(
    `${provedIdentity.dev}:${provedIdentity.ino}`,
    `${replacementIdentity.dev}:${replacementIdentity.ino}`,
  );

  const result = run(
    "remove",
    root,
    [
      "--name", "demo-skill",
      "--expected-sha256", sha(old),
      "--artifact-sha256", `markdown=${sha(md)}`,
      "--artifact-sha256", `html=${sha(html)}`,
    ],
    Buffer.alloc(0),
    { SSR_TEST_LATE_SWAP_MARKDOWN_WITH: replacementPath },
  );

  assert.equal(result.status, 8, "remove-late-artifact-replace-preserves-new");
  assert.match(utf8(result.stderr), /ERROR: artifact-proof-stale/u);
  assert.deepEqual(fs.readFileSync(p.input), old);
  assert.deepEqual(fs.readFileSync(p.md), replacement);
  assert.equal(fs.existsSync(replacementPath), false);
});

test("partial failure retains input and Markdown; retry proof removes only input", () => {
  const root = makeRoot();
  assert.equal(create(root).status, 0);
  const p = paths(root);
  const inputSha = sha(fs.readFileSync(p.input));
  fs.writeFileSync(p.md, "markdown-success\n", "utf8");
  const md = fs.readFileSync(p.md);
  const partial = remove(root, inputSha, sha(md), "0".repeat(64));
  assert.equal(partial.status, 8, "partial-html-failure-retains-input-markdown");
  assert.equal(fs.existsSync(p.input), true);
  assert.deepEqual(fs.readFileSync(p.md), md);
  fs.writeFileSync(p.html, "html-retry-success\n", "utf8");
  const html = fs.readFileSync(p.html);
  const complete = remove(root, inputSha, sha(md), sha(html));
  assert.equal(complete.status, 0, utf8(complete.stderr));
  assert.equal(json(complete).removed, true, "remove-complete-proof-only-input");
  assert.equal(fs.existsSync(p.input), false, "partial-retry-converges-remove");
  assert.deepEqual(fs.readFileSync(p.md), md);
  assert.deepEqual(fs.readFileSync(p.html), html);
  const again = remove(root, inputSha, sha(md), sha(html));
  assert.equal(again.status, 2, "remove-second-refused");
});

test("stdout is bounded and Git index remains byte-for-byte unchanged", () => {
  const root = makeRoot();
  makeGitRepo(root, true);
  const before = spawnSync("git", ["-C", root, "diff", "--cached", "--binary"], { encoding: "utf8" }).stdout;
  const result = create(root);
  assert.equal(result.status, 0, utf8(result.stderr));
  assert.deepEqual(Object.keys(json(result)).sort(), ["bytes", "format", "git", "mode", "operation", "path", "sha256"]);
  assert.doesNotMatch(utf8(result.stdout), /流程直接完成|emoji|SSR-01|Bearer|ghp_|sk-/u, "stdout-bounded");
  const after = spawnSync("git", ["-C", root, "diff", "--cached", "--binary"], { encoding: "utf8" }).stdout;
  assert.equal(after, before, "git-index-unchanged");
});

test("input lifecycle case-name matrix remains explicit", () => {
  assert.equal(new Set(CASES).size, CASES.length);
  assert.equal(CASES.length, 40);
  console.log(`manage-review-input cases: ${CASES.join(",")}`);
});
