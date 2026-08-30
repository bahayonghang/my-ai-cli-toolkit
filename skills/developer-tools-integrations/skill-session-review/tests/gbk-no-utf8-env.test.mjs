import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(testDir, "..");
const scriptsDir = path.join(skillRoot, "scripts");
const review = JSON.parse(fs.readFileSync(path.join(testDir, "valid-review.json"), "utf8"));
const EXPECTED = [
  "ensure_report_ignore.py",
  "manage_review_input.py",
  "open_report.py",
  "render_review_html.py",
  "report_headings.py",
  "review_contract.py",
  "scan_invocations.py",
  "write_session_review.py",
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

function noUtf8Env(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env.PYTHONUTF8;
  delete env.PYTHONIOENCODING;
  return env;
}

function decode(data, label) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch (error) {
    throw new Error(`${label} was not strict UTF-8: ${error.message}`);
  }
}

function run(scriptName, args, { input = Buffer.alloc(0), env = {}, cwd } = {}) {
  const result = spawnSync(
    python.command,
    [...python.prefix, path.join(scriptsDir, scriptName), ...args],
    { input, encoding: null, env: noUtf8Env(env), cwd },
  );
  const stdout = decode(result.stdout, `${scriptName} stdout`);
  const stderr = decode(result.stderr, `${scriptName} stderr`);
  assert.doesNotMatch(`${stdout}\n${stderr}`, /UnicodeEncodeError|UnicodeDecodeError/, scriptName);
  return { ...result, stdoutText: stdout, stderrText: stderr };
}

function makeRoot(label) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), `ssr-gbk-${label}-`));
  const root = path.join(parent, "中文-🐛");
  fs.mkdirSync(root);
  return root;
}

function reviewBytes() {
  return Buffer.from(`${JSON.stringify(review, null, 2)}\n`, "utf8");
}

test("planned scripts set is exact and every case emits strict UTF-8 without UTF-8 env overrides", () => {
  const actual = fs.readdirSync(scriptsDir).filter((name) => name.endsWith(".py")).sort();
  assert.deepEqual(actual, EXPECTED);
  const passed = [];

  {
    const root = makeRoot("scan");
    const home = path.join(root, "会话-✅");
    const skillPath = path.join(root, "技能-✅", "SKILL.md");
    fs.mkdirSync(path.dirname(skillPath), { recursive: true });
    fs.mkdirSync(home, { recursive: true });
    fs.writeFileSync(skillPath, "---\nname: demo-skill\n---\n# 技能 ✅\n", "utf8");
    const result = run("scan_invocations.py", [
      "--skill-name", "demo-skill",
      "--skill-path", skillPath,
      "--home", home,
      "--repo-root", root,
      "--scope", "global",
    ]);
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /技能-✅/u);
    passed.push("scan_invocations.py");
  }

  {
    const root = makeRoot("ignore");
    const result = run("ensure_report_ignore.py", ["--repo-root", root], {
      input: Buffer.from("reports/skill-session-review/\n", "utf8"),
    });
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /中文-🐛/u);
    passed.push("ensure_report_ignore.py");
  }

  {
    const root = makeRoot("input");
    const result = run("manage_review_input.py", ["create", "--repo-root", root, "--name", "demo-skill"], {
      input: reviewBytes(),
    });
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /中文-🐛/u);
    passed.push("manage_review_input.py");
  }

  {
    const root = makeRoot("writer");
    const input = path.join(root, "reports", "skill-session-review", ".input", "demo-skill.json");
    fs.mkdirSync(path.dirname(input), { recursive: true });
    fs.writeFileSync(input, reviewBytes());
    const result = run("write_session_review.py", [
      "--repo-root", root,
      "--name", "demo-skill",
      "--format", "markdown",
      "--review-json", input,
    ]);
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /中文-🐛/u);
    assert.match(fs.readFileSync(path.join(root, "reports", "skill-session-review", "demo-skill.md"), "utf8"), /emoji ✅/u);
    passed.push("write_session_review.py");
  }

  {
    const root = makeRoot("render");
    const input = path.join(root, "复盘-✅.json");
    fs.writeFileSync(input, reviewBytes());
    const result = run("render_review_html.py", ["--review-json", input]);
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /中文与 emoji ✅/u);
    passed.push("render_review_html.py");
  }

  {
    const root = makeRoot("open");
    const html = path.join(root, "reports", "skill-session-review", "demo-skill.html");
    fs.mkdirSync(path.dirname(html), { recursive: true });
    fs.writeFileSync(html, "<!doctype html><title>报告 ✅</title>\n", "utf8");
    const result = run("open_report.py", ["--repo-root", root, "--name", "demo-skill"], {
      env: { SSR_BROWSER_STUB: "true" },
    });
    assert.equal(result.status, 0, result.stderrText);
    assert.match(result.stdoutText, /中文-🐛/u);
    passed.push("open_report.py");
  }

  {
    const code = [
      "import sys",
      `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
      "from report_headings import HEADINGS",
      "sys.stdout.buffer.write((HEADINGS['zh']['scorecard'] + ' ✅').encode('utf-8'))",
    ].join("; ");
    const result = spawnSync(python.command, [...python.prefix, "-c", code], { encoding: null, env: noUtf8Env() });
    const stdout = decode(result.stdout, "report_headings.py stdout");
    const stderr = decode(result.stderr, "report_headings.py stderr");
    assert.equal(result.status, 0, stderr);
    assert.match(stdout, /✅/u);
    passed.push("report_headings.py");
  }

  {
    const input = reviewBytes().toString("base64");
    const code = [
      "import base64,sys",
      `sys.path.insert(0, ${JSON.stringify(scriptsDir)})`,
      "from review_contract import decode_review_json,validate_review",
      `raw=base64.b64decode(${JSON.stringify(input)})`,
      "_,review=decode_review_json(raw)",
      "canonical=validate_review(review,'demo-skill')",
      "sys.stdout.buffer.write((canonical['reliable'][0] + ' 🐛').encode('utf-8'))",
    ].join("; ");
    const result = spawnSync(python.command, [...python.prefix, "-c", code], { encoding: null, env: noUtf8Env() });
    const stdout = decode(result.stdout, "review_contract.py stdout");
    const stderr = decode(result.stderr, "review_contract.py stderr");
    assert.equal(result.status, 0, stderr);
    assert.match(stdout, /静态 HTML.*🐛/u);
    passed.push("review_contract.py");
  }

  assert.deepEqual(passed.sort(), EXPECTED);
  console.log(`gbk-no-utf8-env cases: ${passed.sort().join(",")}`);
});
