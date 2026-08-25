import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const script = path.join(skillRoot, "scripts", "scan_invocations.py");

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

function py(code, extraArgs = []) {
  const result = spawnSync(python.command, [...python.prefix, "-c", code, ...extraArgs], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function encodeClaude(cwd) {
  return py(
    "import pathlib,re,sys; p=pathlib.Path(sys.argv[1]).resolve(); print(re.sub(r'[\\\\/:.]', '-', str(p)))",
    [cwd],
  );
}

function encodeGrok(cwd) {
  return py(
    "from pathlib import Path; from urllib.parse import quote; import sys; print(quote(str(Path(sys.argv[1]).resolve()), safe=''))",
    [cwd],
  );
}

function encodeOmp(cwd) {
  return py(
    "import pathlib,re,sys; p=str(pathlib.Path(sys.argv[1]).resolve()); inner=re.sub(r'[\\\\/:]', '-', p); print('--'+inner+'--')",
    [cwd],
  );
}

function runScan(args) {
  return spawnSync(python.command, [...python.prefix, script, ...args], { encoding: "utf8" });
}

function writeJsonl(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function makeHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ssr-home-"));
}

test("Claude Skill tool is invoked; second cwd appears only in global scope", () => {
  const home = makeHome();
  const repoA = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-repo-a-"));
  const repoB = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-repo-b-"));
  const encA = encodeClaude(repoA);
  const encB = encodeClaude(repoB);
  writeJsonl(path.join(home, ".claude", "projects", encA, "sess-a.jsonl"), [
    {
      type: "assistant",
      message: {
        content: [{ type: "tool_use", name: "Skill", input: { skill: "demo-skill" } }],
      },
    },
  ]);
  writeJsonl(path.join(home, ".claude", "projects", encB, "sess-b.jsonl"), [
    { attributionSkill: "demo-skill", type: "assistant", message: { content: [] } },
  ]);
  const global = runScan([
    "--skill-name",
    "demo-skill",
    "--home",
    home,
    "--repo-root",
    repoA,
    "--scope",
    "global",
  ]);
  assert.equal(global.status, 0, global.stderr);
  const globalPayload = JSON.parse(global.stdout);
  assert.equal(globalPayload.sessions.length, 2);
  assert.ok(globalPayload.sessions.every((s) => s.status === "invoked"));

  const cwdOnly = runScan([
    "--skill-name",
    "demo-skill",
    "--home",
    home,
    "--repo-root",
    repoA,
    "--scope",
    "cwd",
  ]);
  assert.equal(cwdOnly.status, 0, cwdOnly.stderr);
  const cwdPayload = JSON.parse(cwdOnly.stdout);
  assert.equal(cwdPayload.sessions.length, 1);
  assert.equal(cwdPayload.sessions[0].id, "sess-a");
});

test("Grok nested session id and skills_referenced path match", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-grok-"));
  const skillPath = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(skillPath), { recursive: true });
  fs.writeFileSync(skillPath, "---\nname: demo-skill\ndescription: d\n---\n# Demo Skill\n");
  const enc = encodeGrok(repo);
  const sessionDir = path.join(home, ".grok", "sessions", enc, "01abc-session");
  writeJsonl(path.join(sessionDir, "chat_history.jsonl"), [
    {
      type: "user",
      content: [
        {
          type: "text",
          text: `<skills_referenced><skill name="demo-skill" path="${skillPath.replace(/\\/g, "\\\\")}"/></skills_referenced>`,
        },
      ],
    },
  ]);
  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    skillPath,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.sessions.length, 1);
  assert.equal(payload.sessions[0].platform, "grok");
  assert.equal(payload.sessions[0].status, "invoked");
  assert.equal(payload.sessions[0].id, "01abc-session");
});

test("Codex host_skills is available; read is loaded; workflow marker is invoked", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-"));
  const skillRel = path.join(".agents", "skills", "demo-skill", "SKILL.md");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "25");
  writeJsonl(path.join(sessions, "rollout-available.jsonl"), [
    {
      type: "world_state",
      payload: { state: { host_skills: { body: "## Skills\n- demo-skill: x (file: r1/demo-skill/SKILL.md)" } } },
    },
  ]);
  writeJsonl(path.join(sessions, "rollout-loaded.jsonl"), [
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        cmd: `Get-Content -LiteralPath '${skillRel}'`,
      },
    },
  ]);
  writeJsonl(path.join(sessions, "rollout-invoked.jsonl"), [
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        cmd: `Get-Content -LiteralPath 'skills/demo-skill/SKILL.md'`,
      },
    },
    {
      type: "response_item",
      payload: { type: "message", role: "assistant", content: [{ type: "text", text: "# demo-skill\nStep 1 done" }] },
    },
  ]);
  const result = runScan(["--skill-name", "demo-skill", "--home", home, "--scope", "global"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const byFile = Object.fromEntries(payload.sessions.map((s) => [path.basename(s.file), s.status]));
  assert.equal(byFile["rollout-available.jsonl"], "available");
  assert.equal(byFile["rollout-loaded.jsonl"], "loaded");
  assert.equal(byFile["rollout-invoked.jsonl"], "invoked");
});

test("Oh My Pi read-only is loaded; workflow after read is invoked; missing pi store ignored", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-omp-"));
  const enc = encodeOmp(repo);
  const skillPath = path.join(repo, "skills", "demo-skill", "SKILL.md");
  writeJsonl(path.join(home, ".omp", "agent", "sessions", enc, "only-read.jsonl"), [
    {
      type: "message",
      message: { role: "toolResult", toolName: "read", content: skillPath },
    },
  ]);
  writeJsonl(path.join(home, ".omp", "agent", "sessions", enc, "with-flow.jsonl"), [
    {
      type: "message",
      message: { role: "toolResult", toolName: "read", content: `${skillPath}` },
    },
    {
      type: "message",
      message: { role: "assistant", content: [{ type: "text", text: "# demo-skill\nStep 1" }] },
    },
  ]);
  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.coverage["oh-my-pi"], "ok");
  assert.ok(!("pi" in payload.coverage));
  const byId = Object.fromEntries(payload.sessions.map((s) => [s.id, s.status]));
  assert.equal(byId["only-read"], "loaded");
  assert.equal(byId["with-flow"], "invoked");
});

test("Claude SKILL.md injection without Skill tool stays loaded", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-inj-"));
  const enc = encodeClaude(repo);
  writeJsonl(path.join(home, ".claude", "projects", enc, "inject.jsonl"), [
    {
      type: "user",
      message: {
        content: [
          {
            type: "text",
            text: "Base directory for this skill: C:/x/demo-skill\n---\nname: demo-skill\n---\n# Demo Skill\nStep 1 do the thing\n",
          },
        ],
      },
    },
  ]);
  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.sessions.length, 1);
  assert.equal(payload.sessions[0].status, "loaded");
});

test("missing stores are coverage notes and exit 0", () => {
  const home = makeHome();
  const result = runScan(["--skill-name", "demo-skill", "--home", home, "--scope", "global"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.coverage.claude, "missing-store");
  assert.equal(payload.coverage.grok, "missing-store");
  assert.equal(payload.coverage.codex, "missing-store");
  assert.equal(payload.coverage["oh-my-pi"], "missing-store");
  assert.equal(payload.sessions.length, 0);
});

test("ambiguous skill names list targets and exit 1", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-amb-"));
  const a = path.join(repo, "skills", "development-workflows", "demo-skill", "SKILL.md");
  const b = path.join(home, ".skillsmanage", "skills", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.writeFileSync(a, "---\nname: demo-skill\n---\n");
  fs.writeFileSync(b, "---\nname: demo-skill\n---\n");
  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "global",
  ]);
  assert.equal(result.status, 1, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ambiguous_targets.length, 2);
  assert.equal(payload.sessions.length, 0);
});
