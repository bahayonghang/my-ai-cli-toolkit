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
const skillRoot = path.resolve(testDir, "..");
const scriptsDir = path.join(skillRoot, "scripts");
const script = path.join(scriptsDir, "write_session_review.py");
const baseReview = JSON.parse(fs.readFileSync(path.join(testDir, "valid-review.json"), "utf8"));
const FORMATS = ["markdown", "html"];

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

function reviewBytes(review = baseReview) {
  return Buffer.from(`${JSON.stringify(review, null, 2)}\n`, "utf8");
}

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

function utf8(data) {
  return new TextDecoder("utf-8", { fatal: true }).decode(data);
}

function json(result) {
  return JSON.parse(utf8(result.stdout));
}

function makeRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ssr-report-"));
}

function paths(root, format = "markdown", name = "demo-skill") {
  const reportDir = path.join(root, "reports", "skill-session-review");
  const ext = format === "markdown" ? "md" : "html";
  return {
    reportDir,
    inputDir: path.join(reportDir, ".input"),
    input: path.join(reportDir, ".input", `${name}.json`),
    dest: path.join(reportDir, `${name}.${ext}`),
    temp: path.join(reportDir, `.${name}.${ext}.tmp`),
    gitignore: path.join(root, ".gitignore"),
  };
}

function prepare(root, review = baseReview, raw = reviewBytes(review), name = "demo-skill") {
  const p = paths(root, "markdown", name);
  fs.mkdirSync(p.inputDir, { recursive: true });
  fs.writeFileSync(p.input, raw);
  return p.input;
}

function runWriter(root, format, args = [], options = {}) {
  const name = options.name ?? "demo-skill";
  const reviewPath = options.reviewPath ?? paths(root, format, name).input;
  return spawnSync(
    python.command,
    [
      ...python.prefix,
      script,
      "--repo-root", root,
      "--name", name,
      "--format", format,
      "--review-json", reviewPath,
      ...args,
    ],
    {
      input: options.input ?? Buffer.alloc(0),
      encoding: null,
      env: { ...process.env, ...(options.env ?? {}) },
    },
  );
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

function makeUniformReview(effLabel, effScore, fitLabel, fitScore, aggregate) {
  const review = structuredClone(baseReview);
  for (const session of review.sessions.filter((row) => row.status === "invoked")) {
    session.scores.execution_efficiency.label = effLabel;
    session.scores.execution_efficiency.score = effScore;
    session.scores.instruction_fit.label = fitLabel;
    session.scores.instruction_fit.score = fitScore;
  }
  review.aggregate = {
    ...aggregate,
    scored_sessions: 2,
    failed_sessions: effScore < 0.5 || (fitLabel !== "insufficient_evidence" && fitScore < 0.5)
      ? ["s1", "s2"]
      : [],
  };
  review.findings = review.findings.map((finding) => ({ ...finding, verdict: "INCONCLUSIVE" }));
  review.suggestions = [];
  review.not_filed = review.findings.map((finding) => ({ finding_id: finding.id, why_not: "Not filed in score fixture." }));
  return review;
}

for (const format of FORMATS) {
  test(`${format}: create writes one deterministic UTF-8 artifact with bounded identity`, () => {
    const root = makeRoot();
    prepare(root);
    const beforeIgnore = fs.existsSync(paths(root, format).gitignore);
    const result = runWriter(root, format);
    assert.equal(result.status, 0, utf8(result.stderr));
    const p = paths(root, format);
    const disk = fs.readFileSync(p.dest);
    assert.equal(json(result).mode, "create");
    assert.equal(json(result).format, format);
    assert.equal(json(result).sha256, sha(disk));
    assert.equal(json(result).bytes, disk.length);
    assert.equal(disk.includes(Buffer.from("\r\n")), false);
    assert.match(utf8(disk), /SSR-01/);
    assert.match(utf8(disk), /0\.829412/);
    assert.match(utf8(disk), /B-/);
    assert.match(utf8(disk), /中文与 emoji ✅/u);
    assert.equal(fs.existsSync(p.gitignore), beforeIgnore, "writer must not mutate .gitignore");
  });

  test(`${format}: no-clobber and hash-authorized replace preserve old bytes on refusal`, () => {
    const root = makeRoot();
    prepare(root);
    assert.equal(runWriter(root, format).status, 0);
    const p = paths(root, format);
    const old = fs.readFileSync(p.dest);
    const exists = runWriter(root, format);
    assert.equal(exists.status, 3);
    assert.deepEqual(fs.readFileSync(p.dest), old);
    const stale = runWriter(root, format, ["--replace", "--expected-sha256", "0".repeat(64)]);
    assert.equal(stale.status, 4);
    assert.deepEqual(fs.readFileSync(p.dest), old);
    const replaced = runWriter(root, format, ["--replace", "--expected-sha256", sha(old)]);
    assert.equal(replaced.status, 0, utf8(replaced.stderr));
    assert.equal(json(replaced).mode, "replace");
    assert.deepEqual(fs.readFileSync(p.dest), old, "deterministic same input produces same bytes");
  });
}

test("both formats revalidate tampered input before creating destination or temp", () => {
  const mutations = {
    "schema-invalid": (r) => { delete r.scope; },
    "payload-name-mismatch": (r) => { r.skill_name = "other-skill"; },
    "zero-sample": (r) => { r.sessions = r.sessions.filter((row) => row.status !== "invoked"); },
    "zero-ratio": (r) => {
      r.sessions = [];
      for (const row of Object.values(r.coverage)) Object.assign(row, { invoked: 0, loaded: 0, available: 0 });
      Object.assign(r.aggregate, { execution_efficiency: 0, instruction_fit: 0, overall: 0, grade: "F", scored_sessions: 0, failed_sessions: [] });
      r.findings = [];
      r.suggestions = [];
      r.not_filed = [];
    },
    "aggregate-mismatch": (r) => { r.aggregate.overall = 0.900001; },
  };
  for (const format of FORMATS) {
    for (const [name, mutate] of Object.entries(mutations)) {
      const root = makeRoot();
      const review = structuredClone(baseReview);
      mutate(review);
      prepare(root, review);
      const result = runWriter(root, format);
      assert.equal(result.status, 6, `${format}/${name}: ${utf8(result.stderr)}`);
      const p = paths(root, format);
      assert.equal(fs.existsSync(p.dest), false, `${format}/${name}`);
      assert.equal(fs.existsSync(p.temp), false, `${format}/${name}`);
    }
    const secretRoot = makeRoot();
    const secret = structuredClone(baseReview);
    secret.reliable = ["ghp_abcdefghijklmnopqrstuvwxyz0123456789"];
    prepare(secretRoot, secret);
    const result = runWriter(secretRoot, format);
    assert.equal(result.status, 7, `${format}/secret: ${utf8(result.stderr)}`);
    assert.equal(fs.existsSync(paths(secretRoot, format).dest), false);
    assert.doesNotMatch(utf8(result.stderr), /ghp_|abcdefghijklmnopqrstuvwxyz/);
  }
});

test("Decimal label mapping, phased rounding, equivalent literals, and grades are canonical", () => {
  const fixtures = [
    makeUniformReview("highly_efficient", 1.0, "fit", 1.0, {
      execution_efficiency: 1.0, instruction_fit: 1.0, overall: 1.0, grade: "A+",
    }),
    structuredClone(baseReview),
    makeUniformReview("highly_inefficient", 0.2, "misfit", 0.2, {
      execution_efficiency: 0.2, instruction_fit: 0.2, overall: 0.6, grade: "D",
    }),
  ];
  for (const [index, review] of fixtures.entries()) {
    const root = makeRoot();
    prepare(root, review);
    const result = runWriter(root, "markdown");
    assert.equal(result.status, 0, `grade fixture ${index}: ${utf8(result.stderr)}`);
    const body = fs.readFileSync(paths(root).dest, "utf8");
    assert.match(body, new RegExp(`Grade: \\*\\*${review.aggregate.grade.replace("+", "\\+")}\\*\\*`));
    assert.match(body, new RegExp(Number(review.aggregate.overall).toFixed(6).replace(".", "\\.")));
  }

  const decimalRoot = makeRoot();
  const normal = reviewBytes(baseReview);
  const equivalent = Buffer.from(
    utf8(normal)
      .replace('"score": 1', '"score": 1.000000e0')
      .replace('"execution_efficiency": 0.7', '"execution_efficiency": 7e-1')
      .replace('"instruction_fit": 0.6', '"instruction_fit": 6.000000e-1'),
    "utf8",
  );
  prepare(decimalRoot, baseReview, equivalent);
  const equivalentResult = runWriter(decimalRoot, "markdown");
  assert.equal(equivalentResult.status, 0, utf8(equivalentResult.stderr));
  assert.match(fs.readFileSync(paths(decimalRoot).dest, "utf8"), /0\.829412/);

  const source = [
    "import sys", `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
    "from decimal import Decimal", "from review_contract import _grade",
    "vals=['0.829999','0.830000','0.830001','0.969999','0.970000','0.970001']",
    "print(','.join(f'{v}:{_grade(Decimal(v))}' for v in vals))",
  ].join("; ");
  const grades = spawnSync(python.command, [...python.prefix, "-c", source], { encoding: "utf8" });
  assert.equal(grades.status, 0, grades.stderr);
  assert.equal(grades.stdout.trim(), "0.829999:B-,0.830000:B,0.830001:B,0.969999:A,0.970000:A+,0.970001:A+");
});

test("instruction-fit insufficient evidence is excluded and rendered as unverified", () => {
  const review = makeUniformReview("mostly_efficient", 0.8, "insufficient_evidence", 0.5, {
    execution_efficiency: 0.8,
    instruction_fit: null,
    overall: 0.838235,
    grade: "B",
  });
  review.unverified.push("instruction_fit evidence is insufficient; neutral 0.5 was used for weighting.");
  for (const format of FORMATS) {
    const root = makeRoot();
    prepare(root, review);
    const result = runWriter(root, format);
    assert.equal(result.status, 0, `${format}: ${utf8(result.stderr)}`);
    const body = fs.readFileSync(paths(root, format).dest, "utf8");
    assert.match(body, /0\.838235/);
    assert.match(body, /insufficient|证据不足/i);
  }
});

test("coverage ratio is display-only and cannot change overall or grade", () => {
  const firstRoot = makeRoot();
  prepare(firstRoot);
  assert.equal(runWriter(firstRoot, "markdown").status, 0);
  const first = fs.readFileSync(paths(firstRoot).dest, "utf8");

  const review = structuredClone(baseReview);
  review.sessions.push({ id: "s5", platform: "codex", status: "available", signal: "host_skills" });
  review.coverage.codex.available = 2;
  const secondRoot = makeRoot();
  prepare(secondRoot, review);
  const result = runWriter(secondRoot, "markdown");
  assert.equal(result.status, 0, utf8(result.stderr));
  const second = fs.readFileSync(paths(secondRoot).dest, "utf8");
  assert.match(first, /Overall: \*\*0\.829412\*\*/);
  assert.match(second, /Overall: \*\*0\.829412\*\*/);
  assert.match(first, /Grade: \*\*B-\*\*/);
  assert.match(second, /Grade: \*\*B-\*\*/);
  assert.notEqual(
    first.match(/Invocation ratio \(display only\): `([^`]+)`/)[1],
    second.match(/Invocation ratio \(display only\): `([^`]+)`/)[1],
  );
  assert.doesNotMatch(JSON.stringify(review.aggregate), /coverage|invocation|third/i);
});

test("suggestion support, reasons, language, and finding partition are closed contracts", () => {
  const mutations = {
    "suggestion-one-session": (r) => {
      r.suggestions[0].finding_ids = ["SSR-02"];
      r.not_filed = [{ finding_id: "SSR-01", why_not: "Separate pattern." }];
    },
    "reason-empty": (r) => { r.sessions[0].scores.execution_efficiency.reason.sentences = []; },
    "reason-too-many": (r) => { r.sessions[0].scores.execution_efficiency.reason.sentences = ["1", "2", "3", "4"]; },
    "reason-newline": (r) => { r.sessions[0].scores.execution_efficiency.reason.sentences = ["bad\nline"]; },
    "locator-mismatch": (r) => { r.sessions[0].scores.execution_efficiency.reason.locator.value = "s2"; },
    "excerpt-too-long": (r) => {
      r.sessions[0].scores.execution_efficiency.reason.locator = { type: "excerpt", value: "x".repeat(201) };
    },
    "finding-evidence-empty": (r) => { r.findings[0].evidence = ""; },
    "finding-evidence-too-long": (r) => { r.findings[0].evidence = "x".repeat(201); },
    "finding-evidence-newline": (r) => { r.findings[0].evidence = "first\nsecond"; },
    "finding-field-30k": (r) => { r.findings[0].gap = "x".repeat(30_000); },
    "suggestion-non-update-finding": (r) => { r.findings[0].verdict = "COMPLIANCE GAP"; },
    "partition-missing": (r) => { r.suggestions = []; },
    "partition-duplicate": (r) => { r.not_filed = [{ finding_id: "SSR-01", why_not: "duplicate" }]; },
    "partition-unknown": (r) => { r.suggestions[0].finding_ids = ["SSR-01", "SSR-99"]; },
    "language-missing": (r) => { delete r.language; },
    "language-invalid": (r) => { r.language = "fr"; },
    "score-label-mismatch": (r) => { r.sessions[0].scores.execution_efficiency.score = 0.8; },
    "efficiency-insufficient-invalid": (r) => {
      r.sessions[0].scores.execution_efficiency.label = "insufficient_evidence";
      r.sessions[0].scores.execution_efficiency.score = 0.5;
    },
  };
  for (const [name, mutate] of Object.entries(mutations)) {
    const root = makeRoot();
    const review = structuredClone(baseReview);
    mutate(review);
    prepare(root, review);
    const result = runWriter(root, "markdown");
    assert.equal(result.status, 6, `${name}: ${utf8(result.stderr)}`);
    assert.equal(fs.existsSync(paths(root).dest), false, name);
  }
  const secretRoot = makeRoot();
  const secret = structuredClone(baseReview);
  secret.sessions[0].scores.execution_efficiency.reason.locator = { type: "excerpt", value: "Bearer abc.def" };
  prepare(secretRoot, secret);
  const secretResult = runWriter(secretRoot, "markdown");
  assert.equal(secretResult.status, 7);
  assert.equal(fs.existsSync(paths(secretRoot).dest), false);
});

test("input identity and removed flags are strict; only exact absolute .input/name.json works", async (t) => {
  const root = makeRoot();
  const exactInput = prepare(root);
  const cases = [
    ["outside", path.join(root, "review.json")],
    ["wrong-basename", path.join(paths(root).inputDir, "other.json")],
    ["wrong-extension", path.join(paths(root).inputDir, "demo-skill.JSON")],
    ["nested", path.join(paths(root).inputDir, "nested", "demo-skill.json")],
    ["relative", path.join("reports", "skill-session-review", ".input", "demo-skill.json")],
  ];
  for (const [name, supplied] of cases) {
    const result = runWriter(root, "markdown", [], { reviewPath: supplied });
    assert.equal(result.status, 2, `${name}: ${utf8(result.stderr)}`);
  }
  const oldName = spawnSync(python.command, [...python.prefix, script, "--repo-root", root, "--skill-name", "demo-skill", "--format", "markdown", "--review-json", exactInput], { encoding: "utf8" });
  assert.equal(oldName.status, 2);
  const oldInput = spawnSync(python.command, [...python.prefix, script, "--repo-root", root, "--name", "demo-skill", "--format", "markdown", "--input", exactInput], { encoding: "utf8" });
  assert.equal(oldInput.status, 2);
  assert.equal(runWriter(root, "markdown", [], { input: Buffer.from("unexpected stdin") }).status, 2);
  assert.equal(runWriter(root, "markdown", [], { name: "../demo-skill" }).status, 2);

  await t.test("input symlink", (st) => {
    const linkedRoot = makeRoot();
    const p = paths(linkedRoot);
    fs.mkdirSync(p.inputDir, { recursive: true });
    const outside = path.join(linkedRoot, "outside.json");
    fs.writeFileSync(outside, reviewBytes());
    if (!symlinkOrSkip(st, outside, p.input)) return;
    assert.equal(runWriter(linkedRoot, "markdown").status, 2);
    assert.deepEqual(fs.readFileSync(outside), reviewBytes());
  });
});

test("target/temp links and finalization failures preserve foreign or old bytes", async (t) => {
  for (const format of FORMATS) {
    await t.test(`${format} target symlink`, (st) => {
      const root = makeRoot();
      prepare(root);
      const p = paths(root, format);
      const outside = path.join(root, `outside-${format}`);
      fs.writeFileSync(outside, "outside\n", "utf8");
      if (!symlinkOrSkip(st, outside, p.dest)) return;
      assert.equal(runWriter(root, format).status, 2);
      assert.equal(fs.readFileSync(outside, "utf8"), "outside\n");
    });

    const residueRoot = makeRoot();
    prepare(residueRoot);
    const residue = paths(residueRoot, format);
    fs.writeFileSync(residue.temp, "foreign\n", "utf8");
    assert.equal(runWriter(residueRoot, format).status, 0);
    assert.equal(fs.readFileSync(residue.temp, "utf8"), "foreign\n");

    const failRoot = makeRoot();
    prepare(failRoot);
    const failed = runWriter(failRoot, format, [], { env: { SSR_INJECT_FINALIZE_FAILURE: "1" } });
    assert.equal(failed.status, 1, utf8(failed.stderr));
    assert.equal(fs.existsSync(paths(failRoot, format).dest), false);
    assert.equal(fs.existsSync(paths(failRoot, format).temp), false);

    const mismatchRoot = makeRoot();
    prepare(mismatchRoot);
    const mismatch = runWriter(mismatchRoot, format, [], { env: { SSR_INJECT_READBACK_MISMATCH: "1" } });
    assert.equal(mismatch.status, 1, utf8(mismatch.stderr));
    assert.equal(fs.existsSync(paths(mismatchRoot, format).dest), false, "create mismatch removes only owned destination");
    assert.equal(fs.existsSync(paths(mismatchRoot, format).temp), false);
  }
});

test("late temp exchange after the former last check is rejected and replace rollback restores old bytes", () => {
  for (const format of FORMATS) {
    const swapRoot = makeRoot();
    prepare(swapRoot);
    const first = runWriter(swapRoot, format);
    assert.equal(first.status, 0, utf8(first.stderr));
    const p = paths(swapRoot, format);
    const old = fs.readFileSync(p.dest);
    const changed = structuredClone(baseReview);
    changed.reliable = ["Replacement candidate bytes differ."];
    fs.writeFileSync(p.input, reviewBytes(changed));
    const swapSource = path.join(swapRoot, `foreign-${format}.tmp`);
    fs.writeFileSync(swapSource, "foreign-swap\n", "utf8");
    const swapped = runWriter(
      swapRoot,
      format,
      ["--replace", "--expected-sha256", sha(old)],
      { env: { SSR_TEST_LATE_SWAP_TEMP_WITH: swapSource } },
    );
    assert.equal(swapped.status, 5, utf8(swapped.stderr));
    assert.deepEqual(fs.readFileSync(p.dest), old, "temp exchange must not alter destination");
    const exchanged = fs.readdirSync(p.reportDir).filter(
      (name) => name.startsWith(`.${path.basename(p.dest)}.`) && name.endsWith(".tmp"),
    );
    assert.ok(exchanged.length <= 1);
    if (exchanged.length === 1) {
      const exchangedPath = path.join(p.reportDir, exchanged[0]);
      assert.equal(fs.readFileSync(exchangedPath, "utf8"), "foreign-swap\n", "foreign exchanged temp is preserved");
      fs.rmSync(exchangedPath);
    } else {
      assert.equal(
        fs.readFileSync(swapSource, "utf8"),
        "foreign-swap\n",
        "platform-held descriptor blocked exchange and preserved its source",
      );
      fs.rmSync(swapSource);
    }
    const rolledBack = runWriter(
      swapRoot,
      format,
      ["--replace", "--expected-sha256", sha(old)],
      { env: { SSR_INJECT_READBACK_MISMATCH: "1" } },
    );
    assert.equal(rolledBack.status, 1, utf8(rolledBack.stderr));
    assert.deepEqual(fs.readFileSync(p.dest), old, "replace readback mismatch must restore old bytes");
    assert.equal(fs.existsSync(p.temp), false);
    assert.equal(fs.existsSync(path.join(p.reportDir, `.${path.basename(p.dest)}.rollback`)), false);
    assert.deepEqual(
      fs.readdirSync(p.reportDir).filter((name) => name.startsWith(`.${path.basename(p.dest)}.`) && name.endsWith(".rollback")),
      [],
    );
  }
});

test("advisory lease reuses residue, rejects live contention, and recovers after owner death", async () => {
  const root = makeRoot();
  prepare(root);
  const p = paths(root);
  const leaseSource = [
    "import pathlib,sys",
    `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
    "from review_contract import _lease_path",
    "print(_lease_path(pathlib.Path(sys.argv[1])))",
  ].join("; ");
  const resolved = spawnSync(python.command, [...python.prefix, "-c", leaseSource, p.dest], { encoding: "utf8" });
  assert.equal(resolved.status, 0, resolved.stderr);
  const lease = resolved.stdout.trim();
  fs.writeFileSync(lease, "safe-residual-lock-inode\n", "utf8");
  let holder;
  try {
    const created = runWriter(root, "markdown");
    assert.equal(created.status, 0, utf8(created.stderr));
    const old = fs.readFileSync(p.dest);
    assert.equal(fs.readFileSync(lease, "utf8"), "safe-residual-lock-inode\n");
    const reused = runWriter(root, "markdown", ["--replace", "--expected-sha256", sha(old)]);
    assert.equal(reused.status, 0, utf8(reused.stderr));

    const holderSource = [
      "import pathlib,sys,time",
      `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
      "from review_contract import _acquire_advisory_lease,_lease_path",
      "fd,identity=_acquire_advisory_lease(_lease_path(pathlib.Path(sys.argv[1])))",
      "print('READY',flush=True)",
      "time.sleep(300)",
    ].join("; ");
    holder = spawn(python.command, [...python.prefix, "-c", holderSource, p.dest], {
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

    const blocked = runWriter(root, "markdown", ["--replace", "--expected-sha256", sha(old)]);
    assert.equal(blocked.status, 5, utf8(blocked.stderr));
    assert.deepEqual(fs.readFileSync(p.dest), old);

    const exited = once(holder, "exit");
    holder.kill("SIGKILL");
    await exited;
    holder = undefined;
    const recovered = runWriter(root, "markdown", ["--replace", "--expected-sha256", sha(old)]);
    assert.equal(recovered.status, 0, utf8(recovered.stderr));
    assert.deepEqual(fs.readFileSync(p.dest), old);
  } finally {
    if (holder && holder.exitCode === null) {
      const exited = once(holder, "exit");
      holder.kill("SIGKILL");
      await exited;
    }
    fs.rmSync(lease, { force: true });
  }
  // Security boundary: the OS advisory lock serializes cooperative helpers and
  // owner death releases it. It does not constrain a same-user process that
  // deliberately ignores advisory locking and mutates directory entries.
  console.log("security-boundary: advisory lock + GUID temp; excludes non-cooperative same-user tampering");
});

test("same input yields same finding/score and stable hashes in both formats", () => {
  const first = {};
  for (const format of FORMATS) {
    const root = makeRoot();
    prepare(root);
    const result = runWriter(root, format);
    assert.equal(result.status, 0, utf8(result.stderr));
    const body = fs.readFileSync(paths(root, format).dest, "utf8");
    assert.match(body, /SSR-01/);
    assert.match(body, /0\.829412/);
    first[format] = json(result).sha256;

    const rootAgain = makeRoot();
    prepare(rootAgain);
    const again = runWriter(rootAgain, format);
    assert.equal(again.status, 0, utf8(again.stderr));
    assert.equal(json(again).sha256, first[format]);
  }
});

test("writer argument contract, stdout bounds, Git visibility, and source IO policy", () => {
  const missingRoot = path.join(os.tmpdir(), `ssr-missing-${Date.now()}`);
  const missing = runWriter(missingRoot, "markdown", [], { reviewPath: path.join(missingRoot, "reports", "skill-session-review", ".input", "demo-skill.json") });
  assert.equal(missing.status, 2);
  const noFormat = spawnSync(python.command, [...python.prefix, script, "--repo-root", makeRoot(), "--name", "demo-skill", "--review-json", "x"], { encoding: "utf8" });
  assert.equal(noFormat.status, 2);
  const badFormat = spawnSync(python.command, [...python.prefix, script, "--repo-root", makeRoot(), "--name", "demo-skill", "--format", "pdf", "--review-json", "x"], { encoding: "utf8" });
  assert.equal(badFormat.status, 2);

  const root = makeRoot();
  assert.equal(spawnSync("git", ["-C", root, "init", "-q"]).status, 0);
  fs.writeFileSync(path.join(root, ".gitignore"), "reports/skill-session-review/\n", "utf8");
  prepare(root);
  const beforeIndex = spawnSync("git", ["-C", root, "diff", "--cached", "--binary"], { encoding: "utf8" }).stdout;
  const result = runWriter(root, "markdown");
  assert.equal(result.status, 0, utf8(result.stderr));
  assert.equal(json(result).git, "ignored");
  assert.deepEqual(Object.keys(json(result)).sort(), ["bytes", "format", "git", "mode", "operation", "path", "sha256"]);
  assert.doesNotMatch(utf8(result.stdout), /SSR-01|中文与 emoji|Bearer|ghp_|sk-/u);
  assert.equal(spawnSync("git", ["-C", root, "diff", "--cached", "--binary"], { encoding: "utf8" }).stdout, beforeIndex);

  const pyFiles = fs.readdirSync(scriptsDir).filter((name) => name.endsWith(".py"));
  for (const name of pyFiles) {
    const source = fs.readFileSync(path.join(scriptsDir, name), "utf8");
    const stripped = source
      .replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, "")
      .replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, "")
      .replace(/#.*$/gm, "");
    for (const match of stripped.matchAll(/\.(read_text|write_text)\s*\(([^)]*)\)/g)) {
      assert.match(match[2], /encoding\s*=/, `${name}:${match[1]} must pin encoding`);
      if (match[1] === "write_text") assert.match(match[2], /newline\s*=/, `${name}:write_text must pin newline`);
    }
  }
});
