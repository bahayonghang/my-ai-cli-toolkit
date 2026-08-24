import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const composerScript = path.resolve(__dirname, "..", "scripts", "compose_commit_message.py");

// Probe interpreters in the same order as the bash wrapper
// (scripts/compose_commit_message): python3 -> python -> py -3 -> py.
// A candidate counts only when it can actually run `import sys`, which
// rejects the Microsoft Store stub without path heuristics.
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

function compose(args) {
  return spawnSync(python.command, [...python.prefix, composerScript, ...args], {
    encoding: "utf8",
    env: { ...process.env, PYTHONUTF8: "1" },
  });
}

// --- baseline: agent trailers without [AI]; --ai remains opt-in ---

test("agent trailers without --ai omit the [AI] tag", { skip }, () => {
  const result = compose([
    "--type", "feat", "--scope", "auth", "--summary", "add SMS fallback login",
    "--why", "reduce login failures during OTP outages",
    "--agent-model", "claude-opus-4-8", "--agent-task", "AUTH-42", "--generated-by-agent",
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "feat(auth): ✨ add SMS fallback login\n" +
      "\n" +
      "Why: reduce login failures during OTP outages\n" +
      "\n" +
      "Agent-Task: AUTH-42\n" +
      "Agent-Model: claude-opus-4-8\n" +
      "Generated-By: agent\n",
  );
  assert.equal(result.stderr, "", "built-in types without --ai must not add stderr output");
  assert.doesNotMatch(result.stdout, /\[AI\]/);
});

test("opt-in --ai still places [AI] after the colon and before emoji", { skip }, () => {
  const result = compose([
    "--type", "feat", "--scope", "auth", "--summary", "add SMS fallback login",
    "--why", "reduce login failures during OTP outages",
    "--ai", "--agent-model", "claude-opus-4-8", "--agent-task", "AUTH-42", "--generated-by-agent",
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "feat(auth): [AI] ✨ add SMS fallback login\n" +
      "\n" +
      "Why: reduce login failures during OTP outages\n" +
      "\n" +
      "Agent-Task: AUTH-42\n" +
      "Agent-Model: claude-opus-4-8\n" +
      "Generated-By: agent\n",
  );
});

test("leading [AI] in --summary is stripped when --ai is absent", { skip }, () => {
  const result = compose([
    "--type", "chore", "--scope", "git-commit",
    "--summary", "[AI] align git-commit skill with qiaomu-meta",
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "chore(git-commit): 🔧 align git-commit skill with qiaomu-meta\n");
  assert.doesNotMatch(result.stdout, /\[AI\]/);
});

test("Co-authored-by footer is rejected", { skip }, () => {
  const result = compose([
    "--type", "chore", "--summary", "tweak script",
    "--footer-line", "Co-authored-by: Cursor <cursoragent@cursor.com>",
  ]);
  assert.equal(result.status, 4);
  assert.match(result.stderr, /Prohibited host\/client attribution line/);
  assert.match(result.stderr, /Co-authored-by/);
  assert.equal(result.stdout, "");
});

test("Committed via Cursor Agent footer is rejected", { skip }, () => {
  const result = compose([
    "--type", "chore", "--summary", "tweak script",
    "--footer-line", "Committed via Cursor Agent",
  ]);
  assert.equal(result.status, 4);
  assert.match(result.stderr, /Committed via Cursor Agent/);
  assert.equal(result.stdout, "");
});

test("Made-with: Cursor footer is rejected", { skip }, () => {
  const result = compose([
    "--type", "chore", "--summary", "tweak script",
    "--footer-line", "Made-with: Cursor",
  ]);
  assert.equal(result.status, 4);
  assert.match(result.stderr, /Made-with: Cursor/);
  assert.equal(result.stdout, "");
});

test("full trailer block keeps the documented order", { skip }, () => {
  const result = compose([
    "--type", "fix", "--scope", "payment", "--summary", "dedupe ledger writes",
    "--why", "gateway retries duplicated ledger rows",
    "--breaking", "legacy callback endpoint removed",
    "--footer-line", "Jira: PROJ-456",
    "--closes", "128", "--refs", "#130",
    "--confidence", "high", "--scope-risk", "narrow", "--tested", "just ci",
    "--ai", "--agent-task", "PROJ-456", "--agent-model", "claude-opus-4-8",
    "--agent-prompt-ref", "prompt-2026-05-14-abc123", "--generated-by-agent",
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "fix(payment): [AI] 🐛 dedupe ledger writes\n" +
      "\n" +
      "Why: gateway retries duplicated ledger rows\n" +
      "\n" +
      "BREAKING CHANGE: legacy callback endpoint removed\n" +
      "Jira: PROJ-456\n" +
      "Closes #128\n" +
      "Refs #130\n" +
      "Confidence: high\n" +
      "Scope-risk: narrow\n" +
      "Tested: just ci\n" +
      "Agent-Task: PROJ-456\n" +
      "Agent-Model: claude-opus-4-8\n" +
      "Agent-Prompt-Ref: prompt-2026-05-14-abc123\n" +
      "Generated-By: agent\n",
  );
  assert.equal(result.stderr, "");
});

// --- gate exits ---

test("--ai without --agent-model exits 2", { skip }, () => {
  const result = compose(["--type", "feat", "--summary", "add thing", "--ai"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--ai requires --agent-model/);
  assert.equal(result.stdout, "");
});

test("--require-why on a Why-required type without --why exits 3", { skip }, () => {
  const result = compose(["--type", "feat", "--summary", "add thing", "--require-why"]);
  assert.equal(result.status, 3);
  assert.match(result.stderr, /requires --why/);
  assert.equal(result.stdout, "");
});

// --- display width and header limit ---

test("CJK header at exactly 72 display columns passes, 74 fails", { skip }, () => {
  // "feat: [AI] ✨ " is 14 columns; 29 CJK chars add 58 -> exactly 72.
  const pass = compose([
    "--type", "feat", "--summary", "宽".repeat(29),
    "--ai", "--agent-model", "claude-opus-4-8",
  ]);
  assert.equal(pass.status, 0, pass.stderr);
  assert.match(pass.stdout, /^feat: \[AI\] ✨ 宽{29}\n/);

  const fail = compose([
    "--type", "feat", "--summary", "宽".repeat(30),
    "--ai", "--agent-model", "claude-opus-4-8",
  ]);
  assert.equal(fail.status, 1);
  assert.match(fail.stderr, /74 display columns wide; limit is 72/);
});

test("--max-header-width 100 admits a 78-column header", { skip }, () => {
  // "feat: ✨ " is 9 columns; 69 ASCII chars -> 78 total.
  const result = compose(["--type", "feat", "--summary", "x".repeat(69), "--max-header-width", "100"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `feat: ✨ ${"x".repeat(69)}\n`);
});

test("--max-header-width 60 rejects a 61-column header with exit 1", { skip }, () => {
  const result = compose(["--type", "feat", "--summary", "x".repeat(52), "--max-header-width", "60"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /61 display columns wide; limit is 60/);
  assert.match(result.stderr, /--max-header-width/);
});

test("default limit stays 72 when the flag is absent (73 columns exits 1)", { skip }, () => {
  const result = compose(["--type", "feat", "--summary", "x".repeat(64)]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /73 display columns wide; limit is 72/);
});

test("--max-header-width below 20 is rejected as a usage error", { skip }, () => {
  const result = compose(["--type", "feat", "--summary", "x", "--max-header-width", "10"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--max-header-width must be at least 20/);
});

// --- custom types and emoji priority ---

test("custom type with an explicit --emoji composes normally", { skip }, () => {
  const result = compose(["--type", "hotfix", "--emoji", "🚑", "--summary", "patch prod outage"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "hotfix: 🚑 patch prod outage\n");
  assert.equal(result.stderr, "");
});

test("custom type without --emoji emits no emoji plus a stderr note, exit 0", { skip }, () => {
  const result = compose(["--type", "hotfix", "--summary", "patch prod outage"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "hotfix: patch prod outage\n");
  assert.match(result.stderr, /Unknown type 'hotfix' has no built-in emoji; pass --emoji or --no-emoji/);
});

test("--no-emoji wins over the missing-emoji note for custom types", { skip }, () => {
  const result = compose(["--type", "hotfix", "--summary", "patch prod outage", "--no-emoji"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "hotfix: patch prod outage\n");
  assert.equal(result.stderr, "");
});

test("--emoji overrides the built-in mapping for built-in types", { skip }, () => {
  const result = compose(["--type", "feat", "--emoji", "🚀", "--summary", "ship launcher"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "feat: 🚀 ship launcher\n");
});

test("malformed --type fails argparse validation", { skip }, () => {
  const result = compose(["--type", "Bad Type", "--summary", "x"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--type 'Bad Type' must match/);
});

// --- output file and normalization ---

test("--output writes UTF-8 without BOM and a single trailing newline", { skip }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "git-commit-skill-"));
  try {
    const outFile = path.join(dir, "COMMIT_MSG_SKILL");
    const result = compose([
      "--type", "feat", "--scope", "auth", "--summary", "添加短信兜底登录",
      "--output", outFile,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "", "--output must not also print to stdout");
    const bytes = fs.readFileSync(outFile);
    assert.equal(bytes[0], "f".charCodeAt(0), "file must start with the header, not a BOM");
    const text = bytes.toString("utf8");
    assert.equal(text, "feat(auth): ✨ 添加短信兜底登录\n");
    assert.ok(!text.endsWith("\n\n"), "must end with a single newline");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("summary trailing punctuation is stripped and issue refs normalize", { skip }, () => {
  const result = compose([
    "--type", "fix", "--summary", "fix cart total not updating。.!！",
    "--closes", "128", "--refs", "#130",
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "fix: 🐛 fix cart total not updating\n" +
      "\n" +
      "Closes #128\n" +
      "Refs #130\n",
  );
});
