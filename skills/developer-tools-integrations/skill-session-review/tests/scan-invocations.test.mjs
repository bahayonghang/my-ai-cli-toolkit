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

function runScan(args, options = {}) {
  return spawnSync(python.command, [...python.prefix, script, ...args], { encoding: "utf8", ...options });
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

test("Claude explicit skill path excludes name-only and other-instance invocation signals", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-claude-target-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  const otherSkill = path.join(home, ".claude", "skills", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  fs.writeFileSync(otherSkill, "---\nname: demo-skill\n---\n# demo-skill\n");

  const projectDir = path.join(home, ".claude", "projects", encodeClaude(repo));
  const skillInvocation = (baseDirectory) => [
    {
      type: "user",
      message: {
        content: [{ type: "text", text: `Base directory for this skill: ${baseDirectory}\n# demo-skill\n` }],
      },
    },
    {
      type: "assistant",
      message: {
        content: [{ type: "tool_use", name: "Skill", input: { skill: "demo-skill" } }],
      },
    },
  ];
  writeJsonl(path.join(projectDir, "target.jsonl"), skillInvocation(path.dirname(targetSkill)));
  writeJsonl(path.join(projectDir, "other.jsonl"), skillInvocation(path.dirname(otherSkill)));
  writeJsonl(path.join(projectDir, "name-only.jsonl"), [
    { attributionSkill: "demo-skill", type: "assistant", message: { content: [] } },
  ]);

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [path.basename(session.file), session.status]),
    [["target.jsonl", "invoked"]],
  );
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

test("Grok explicit skill path excludes name-only and other-instance references", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-grok-target-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  const otherSkill = path.join(home, ".grok", "skills", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  fs.writeFileSync(otherSkill, "---\nname: demo-skill\n---\n# demo-skill\n");

  const sessions = path.join(home, ".grok", "sessions", encodeGrok(repo));
  const referenced = (sessionId, pathAttribute) => {
    const pathText = pathAttribute === null ? "" : ` path="${pathAttribute.replace(/\\/g, "\\\\")}"`;
    writeJsonl(path.join(sessions, sessionId, "chat_history.jsonl"), [
      {
        type: "user",
        content: [{ type: "text", text: `<skills_referenced><skill name="demo-skill"${pathText}/></skills_referenced>` }],
      },
    ]);
  };
  referenced("target", targetSkill);
  referenced("other", otherSkill);
  referenced("name-only", null);

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.sessions.map((session) => [session.id, session.status]), [["target", "invoked"]]);
});

test("Grok keeps name-only invocation fallback when skill path is not explicit", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-grok-name-"));
  const session = path.join(home, ".grok", "sessions", encodeGrok(repo), "name-only", "chat_history.jsonl");
  writeJsonl(session, [
    {
      type: "user",
      content: [{ type: "text", text: '<skills_referenced><skill name="demo-skill"/></skills_referenced>' }],
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
  assert.deepEqual(payload.sessions.map((item) => [item.id, item.status]), [["name-only", "invoked"]]);
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
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call_output",
        output: "# demo-skill\nStep 1\nTool output is not assistant-authored workflow evidence.",
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
  for (const [suffix, text] of [
    ["en", "Step 1: unrelated repository task"],
    ["zh", "步骤 1：处理无关仓库任务"],
  ]) {
    writeJsonl(path.join(sessions, `rollout-unrelated-step-${suffix}.jsonl`), [
      {
        type: "response_item",
        payload: {
          type: "custom_tool_call",
          cmd: "Get-Content -LiteralPath 'skills/demo-skill/SKILL.md'",
        },
      },
      {
        type: "response_item",
        payload: {
          type: "message",
          role: "assistant",
          content: [{ type: "text", text }],
        },
      },
    ]);
  }
  const result = runScan(["--skill-name", "demo-skill", "--home", home, "--scope", "global"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const byFile = Object.fromEntries(payload.sessions.map((s) => [path.basename(s.file), s.status]));
  assert.equal(byFile["rollout-available.jsonl"], "available");
  assert.equal(byFile["rollout-loaded.jsonl"], "loaded");
  assert.equal(byFile["rollout-invoked.jsonl"], "invoked");
  assert.equal(byFile["rollout-unrelated-step-en.jsonl"], "loaded");
  assert.equal(byFile["rollout-unrelated-step-zh.jsonl"], "loaded");
});

test("Codex explicit skill path excludes a same-name instance at another path", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-target-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  const otherSkill = path.join(home, ".codex", "skills", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  fs.writeFileSync(otherSkill, "---\nname: demo-skill\n---\n# demo-skill\n");

  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const invokedRows = (skillPath) => [
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        cmd: `Get-Content -LiteralPath '${skillPath}'`,
      },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "# demo-skill\nFollow the target workflow" }],
      },
    },
  ];
  writeJsonl(path.join(sessions, "rollout-target.jsonl"), invokedRows(targetSkill));
  writeJsonl(path.join(sessions, "rollout-other.jsonl"), invokedRows(otherSkill));
  writeJsonl(path.join(sessions, "rollout-name-only-available.jsonl"), [
    {
      type: "world_state",
      payload: { state: { host_skills: { body: "## Skills\n- demo-skill: x (file: r1/demo-skill/SKILL.md)" } } },
    },
  ]);

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "global",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [path.basename(session.file), session.status]),
    [["rollout-target.jsonl", "invoked"]],
  );
});

test("Codex real response_item carriers establish target reads from allowlisted payload fields", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-carriers-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const marker = {
    type: "response_item",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "# demo-skill\nFollow the target workflow" }],
    },
  };
  const command = `Get-Content -LiteralPath '${targetSkill}'`;
  const carriers = {
    "custom-tool-call": { type: "custom_tool_call", cmd: command },
    "custom-tool-call-output": { type: "custom_tool_call_output", output: command },
    "function-call": { type: "function_call", arguments: JSON.stringify({ cmd: command }) },
    "function-call-output": { type: "function_call_output", output: command },
  };
  for (const [name, payload] of Object.entries(carriers)) {
    writeJsonl(path.join(sessions, `rollout-${name}.jsonl`), [
      { type: "session_meta", payload: { cwd: repo } },
      { type: "response_item", payload },
      marker,
    ]);
  }

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [session.id, session.status]).sort(),
    [
      ["rollout-custom-tool-call", "invoked"],
      ["rollout-custom-tool-call-output", "invoked"],
      ["rollout-function-call", "invoked"],
      ["rollout-function-call-output", "invoked"],
    ],
  );
});

test("Codex JSON carrier commands keep actions outside unquoted path spans", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-json-carriers-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const marker = {
    type: "response_item",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "# demo-skill\nFollow the target workflow" }],
    },
  };
  const carriers = {
    "custom-tool-call-json": { type: "custom_tool_call", input: JSON.stringify({ cmd: `rg ${targetSkill}` }) },
    "custom-tool-call-output-json": {
      type: "custom_tool_call_output",
      output: JSON.stringify({ cmd: `read_text ${targetSkill}` }),
    },
    "function-call-json": { type: "function_call", arguments: JSON.stringify({ cmd: `rg ${targetSkill}` }) },
    "function-call-output-json": {
      type: "function_call_output",
      output: JSON.stringify({ cmd: `read_text ${targetSkill}` }),
    },
  };
  for (const [name, payload] of Object.entries(carriers)) {
    writeJsonl(path.join(sessions, `rollout-${name}.jsonl`), [
      { type: "session_meta", payload: { cwd: repo } },
      { type: "response_item", payload },
      marker,
    ]);
  }

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [session.id, session.status]).sort(),
    [
      ["rollout-custom-tool-call-json", "invoked"],
      ["rollout-custom-tool-call-output-json", "invoked"],
      ["rollout-function-call-json", "invoked"],
      ["rollout-function-call-output-json", "invoked"],
    ],
  );
});

test("Codex escaped JSON quoted paths with spaces work in all allowlisted carriers", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-json-escaped-"));
  const targetSkill = path.join(repo, "Target Skills", "demo", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo\n---\n# demo\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const commandJson = JSON.stringify({ cmd: `Get-Content -LiteralPath "${targetSkill}"` });
  const marker = {
    type: "response_item",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "# demo\nFollow the target workflow" }],
    },
  };
  const carriers = {
    "custom-tool-call-escaped": { type: "custom_tool_call", input: commandJson },
    "custom-tool-call-output-escaped": { type: "custom_tool_call_output", output: commandJson },
    "function-call-escaped": { type: "function_call", arguments: commandJson },
    "function-call-output-escaped": { type: "function_call_output", output: commandJson },
  };
  for (const [name, payload] of Object.entries(carriers)) {
    writeJsonl(path.join(sessions, `rollout-${name}.jsonl`), [
      { type: "session_meta", payload: { cwd: repo } },
      { type: "response_item", payload },
      marker,
    ]);
  }

  const result = runScan([
    "--skill-name",
    "demo",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [session.id, session.status]).sort(),
    [
      ["rollout-custom-tool-call-escaped", "invoked"],
      ["rollout-custom-tool-call-output-escaped", "invoked"],
      ["rollout-function-call-escaped", "invoked"],
      ["rollout-function-call-output-escaped", "invoked"],
    ],
  );
});

test("Codex nested JSON escaped paths preserve exact target identity", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-json-nested-"));
  const targetSkill = path.join(repo, "Target Skills", "demo", "SKILL.md");
  const otherSkill = path.join(repo, "My Target Skills", "demo", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo\n---\n# demo\n");
  fs.writeFileSync(otherSkill, "---\nname: demo\n---\n# demo\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const nestedArguments = (skillPath) => {
    const inner = JSON.stringify({ cmd: `Get-Content -LiteralPath "${skillPath}"` });
    return JSON.stringify({ wrapper: inner });
  };
  const marker = {
    type: "response_item",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "# demo\nFollow the target workflow" }],
    },
  };
  for (const [name, skillPath] of [
    ["target", targetSkill],
    ["other", otherSkill],
  ]) {
    writeJsonl(path.join(sessions, `rollout-nested-${name}.jsonl`), [
      { type: "session_meta", payload: { cwd: repo } },
      {
        type: "world_state",
        payload: { state: { host_skills: { body: `## Skills\n- demo (file: "${targetSkill}")` } } },
      },
      {
        type: "response_item",
        payload: { type: "function_call", arguments: nestedArguments(skillPath) },
      },
      marker,
    ]);
  }

  const result = runScan(
    [
      "--skill-name",
      "demo",
      "--skill-path",
      targetSkill,
      "--home",
      home,
      "--repo-root",
      repo,
      "--scope",
      "cwd",
    ],
    { cwd: repo },
  );
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => [session.id, session.status]).sort(),
    [
      ["rollout-nested-other", "available"],
      ["rollout-nested-target", "invoked"],
    ],
  );
});

test("Codex quoted paths with spaces do not emit a target-matching bare suffix", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-quoted-suffix-"));
  const targetSkill = path.join(repo, "Skills", "demo", "SKILL.md");
  const otherSkill = path.join(repo, "My Skills", "demo", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo\n---\n# demo\n");
  fs.writeFileSync(otherSkill, "---\nname: demo\n---\n# demo\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  writeJsonl(path.join(sessions, "rollout-other-instance.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    {
      type: "world_state",
      payload: { state: { host_skills: { body: `## Skills\n- demo (file: ${targetSkill})` } } },
    },
    {
      type: "response_item",
      payload: {
        type: "function_call",
        arguments: JSON.stringify({ cmd: `Get-Content -LiteralPath "${otherSkill}"` }),
      },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "# demo\nFollow the target workflow" }],
      },
    },
  ]);

  const result = runScan(
    [
      "--skill-name",
      "demo",
      "--skill-path",
      targetSkill,
      "--home",
      home,
      "--repo-root",
      repo,
      "--scope",
      "cwd",
    ],
    { cwd: repo },
  );
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.sessions.map((session) => [session.id, session.status]), [
    ["rollout-other-instance", "available"],
  ]);
});

test("path span extraction keeps escaped Windows and POSIX paths whole", () => {
  const windowsPath = String.raw`D:\Root\My Skills\demo\SKILL.md`;
  const posixPath = "/opt/My Skills/demo/SKILL.md";
  const samples = [
    String.raw`{"cmd":"Get-Content -LiteralPath \"${windowsPath}\""}`,
    `{"cmd":"Get-Content -LiteralPath \\"${posixPath}\\""}`,
  ];
  const source = [
    "import json,sys",
    `sys.path.insert(0, ${JSON.stringify(path.join(skillRoot, "scripts"))})`,
    "from scan_invocations import recorded_skill_paths",
    "print(json.dumps([recorded_skill_paths(value) for value in sys.argv[1:]]))",
  ].join("; ");
  const result = spawnSync(python.command, [...python.prefix, "-c", source, ...samples], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [[windowsPath], [posixPath]]);
});

test("Codex read actions must occur outside target SKILL.md path spans", () => {
  const actionNames = ["get-content", "read_file", "read_text", "cat", "rg"];
  for (const actionName of actionNames) {
    const home = makeHome();
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), `ssr-codex-path-action-${actionName}-`));
    const targetSkill = path.join(repo, "skills", actionName, "SKILL.md");
    fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
    fs.writeFileSync(targetSkill, `---\nname: ${actionName}\n---\n# ${actionName}\n`);
    const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
    writeJsonl(path.join(sessions, `rollout-${actionName}.jsonl`), [
      { type: "session_meta", payload: { cwd: repo } },
      {
        type: "world_state",
        payload: { state: { host_skills: { body: `## Skills\n- ${actionName} (file: ${targetSkill})` } } },
      },
      {
        type: "response_item",
        payload: { type: "custom_tool_call_output", output: targetSkill },
      },
      {
        type: "response_item",
        payload: {
          type: "message",
          role: "assistant",
          content: [{ type: "text", text: `# ${actionName}\nFollow the target workflow` }],
        },
      },
    ]);

    const result = runScan([
      "--skill-name",
      actionName,
      "--skill-path",
      targetSkill,
      "--home",
      home,
      "--repo-root",
      repo,
      "--scope",
      "cwd",
    ]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.deepEqual(payload.sessions.map((session) => [session.id, session.status]), [
      [`rollout-${actionName}`, "available"],
    ]);
  }
});

test("Codex cwd scope fails closed on missing, invalid, conflicting, and mismatched session metadata", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-cwd-target-"));
  const otherRepo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-codex-cwd-other-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const evidenceRows = (meta) => [
    ...(meta === undefined ? [] : [{ type: "session_meta", payload: meta }]),
    {
      type: "response_item",
      payload: { type: "custom_tool_call", cmd: `Get-Content -LiteralPath '${targetSkill}'` },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "# demo-skill\nFollow the target workflow" }],
      },
    },
  ];
  writeJsonl(path.join(sessions, "rollout-cwd-match.jsonl"), evidenceRows({ cwd: repo }));
  writeJsonl(path.join(sessions, "rollout-cwd-missing.jsonl"), evidenceRows(undefined));
  writeJsonl(path.join(sessions, "rollout-cwd-invalid.jsonl"), evidenceRows({ cwd: "\u0000not-a-cwd" }));
  writeJsonl(path.join(sessions, "rollout-cwd-relative.jsonl"), evidenceRows({ cwd: "relative/repo" }));
  writeJsonl(path.join(sessions, "rollout-cwd-mismatch.jsonl"), evidenceRows({ cwd: otherRepo }));
  writeJsonl(path.join(sessions, "rollout-cwd-conflict.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    { type: "session_meta", payload: { cwd: otherRepo } },
    ...evidenceRows(undefined),
  ]);

  const commonArgs = [
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
  ];
  const globalResult = runScan([...commonArgs, "--scope", "global"]);
  assert.equal(globalResult.status, 0, globalResult.stderr);
  const globalPayload = JSON.parse(globalResult.stdout);
  assert.deepEqual(
    globalPayload.sessions.map((session) => session.id).sort(),
    [
      "rollout-cwd-conflict",
      "rollout-cwd-invalid",
      "rollout-cwd-match",
      "rollout-cwd-mismatch",
      "rollout-cwd-missing",
      "rollout-cwd-relative",
    ],
  );
  assert.ok(globalPayload.sessions.every((session) => session.status === "invoked"));

  const cwdResult = runScan([...commonArgs, "--scope", "cwd"]);
  assert.equal(cwdResult.status, 0, cwdResult.stderr);
  const cwdPayload = JSON.parse(cwdResult.stdout);
  assert.deepEqual(cwdPayload.sessions.map((session) => [session.id, session.status]), [
    ["rollout-cwd-match", "invoked"],
  ]);
});

test("Codex rollout stems stay unique when forks share a root payload session id", () => {
  const home = makeHome();
  const sessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const sharedMeta = {
    type: "session_meta",
    payload: { session_id: "shared-root-session" },
  };
  const invokedRows = (label) => [
    sharedMeta,
    {
      type: "response_item",
      payload: {
        type: "custom_tool_call",
        cmd: "Get-Content -LiteralPath 'skills/demo-skill/SKILL.md'",
      },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: `# demo-skill\nStep 1 ${label}` }],
      },
    },
  ];
  writeJsonl(path.join(sessions, "rollout-fork-a.jsonl"), invokedRows("a"));
  writeJsonl(path.join(sessions, "rollout-fork-b.jsonl"), invokedRows("b"));

  const result = runScan(["--skill-name", "demo-skill", "--home", home, "--scope", "global"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.sessions.map((session) => session.id).sort(),
    ["rollout-fork-a", "rollout-fork-b"],
  );
  assert.ok(payload.sessions.every((session) => session.status === "invoked"));
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

test("Oh My Pi explicit skill path excludes another same-name instance", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-omp-target-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  const otherSkill = path.join(home, ".omp", "skills", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.mkdirSync(path.dirname(otherSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  fs.writeFileSync(otherSkill, "---\nname: demo-skill\n---\n# demo-skill\n");

  const sessions = path.join(home, ".omp", "agent", "sessions", encodeOmp(repo));
  const invokedRows = (skillPath) => [
    { type: "message", message: { role: "toolResult", toolName: "read", content: skillPath } },
    {
      type: "message",
      message: { role: "assistant", content: [{ type: "text", text: "# demo-skill\nFollow the target workflow" }] },
    },
  ];
  writeJsonl(path.join(sessions, "target.jsonl"), invokedRows(targetSkill));
  writeJsonl(path.join(sessions, "other.jsonl"), invokedRows(otherSkill));

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.sessions.map((session) => [session.id, session.status]), [["target", "invoked"]]);
});

test("Codex and Oh My Pi require target load before a canonical workflow marker", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-event-order-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  const marker = "# demo-skill\nFollow the target workflow";
  const codexMarker = {
    type: "response_item",
    payload: { type: "message", role: "assistant", content: [{ type: "text", text: marker }] },
  };
  const codexRead = {
    type: "response_item",
    payload: { type: "custom_tool_call", cmd: `Get-Content -LiteralPath '${targetSkill}'` },
  };
  const codexAssistantReadMention = {
    type: "response_item",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: `Get-Content -LiteralPath '${targetSkill}'\n${marker}` }],
    },
  };
  const codexToolboxReadMention = {
    type: "response_item",
    toolbox_note: "not a tool call",
    payload: {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: `Get-Content -LiteralPath '${targetSkill}'` }],
    },
  };
  const codexSessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  writeJsonl(path.join(codexSessions, "rollout-marker-before-read.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    codexMarker,
    codexRead,
  ]);
  writeJsonl(path.join(codexSessions, "rollout-read-before-marker.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    codexRead,
    codexMarker,
  ]);
  writeJsonl(path.join(codexSessions, "rollout-assistant-read-mention-before-read.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    codexAssistantReadMention,
    codexRead,
  ]);
  writeJsonl(path.join(codexSessions, "rollout-toolbox-note-assistant-read.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    {
      type: "world_state",
      payload: { state: { host_skills: { body: `## Skills\n- demo-skill (file: '${targetSkill}')` } } },
    },
    codexToolboxReadMention,
    codexMarker,
  ]);

  const ompMarker = {
    type: "message",
    message: { role: "assistant", content: [{ type: "output_text", text: marker }] },
  };
  const ompRead = { type: "message", message: { role: "toolResult", toolName: "read", content: targetSkill } };
  const ompSessions = path.join(home, ".omp", "agent", "sessions", encodeOmp(repo));
  writeJsonl(path.join(ompSessions, "marker-before-read.jsonl"), [ompMarker, ompRead]);
  writeJsonl(path.join(ompSessions, "read-before-marker.jsonl"), [ompRead, ompMarker]);

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const states = Object.fromEntries(payload.sessions.map((session) => [`${session.platform}:${session.id}`, session.status]));
  assert.equal(states["codex:rollout-marker-before-read"], "loaded");
  assert.equal(states["codex:rollout-read-before-marker"], "invoked");
  assert.equal(states["codex:rollout-assistant-read-mention-before-read"], "loaded");
  assert.equal(states["codex:rollout-toolbox-note-assistant-read"], "available");
  assert.equal(states["oh-my-pi:marker-before-read"], "loaded");
  assert.equal(states["oh-my-pi:read-before-marker"], "invoked");
});

test("Codex and Oh My Pi tool-bearing assistant events do not promote loaded sessions", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-assistant-body-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");

  const codexSessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  writeJsonl(path.join(codexSessions, "rollout-tool-bearing.jsonl"), [
    { type: "session_meta", payload: { cwd: repo } },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        content: [
          { type: "output_text", text: "No target workflow marker in the plain response." },
          { type: "tool_call", arguments: `# demo-skill\nFollow the target workflow` },
        ],
      },
    },
    {
      type: "response_item",
      payload: { type: "custom_tool_call", cmd: `Get-Content -LiteralPath '${targetSkill}'` },
    },
  ]);

  const ompSessions = path.join(home, ".omp", "agent", "sessions", encodeOmp(repo));
  writeJsonl(path.join(ompSessions, "tool-bearing.jsonl"), [
    { type: "message", message: { role: "toolResult", toolName: "read", content: targetSkill } },
    {
      type: "message",
      message: {
        role: "assistant",
        toolName: "bash",
        content: [{ type: "text", text: `# demo-skill\nFollow the target workflow` }],
      },
    },
  ]);

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const states = Object.fromEntries(payload.sessions.map((session) => [`${session.platform}:${session.id}`, session.status]));
  assert.equal(states["codex:rollout-tool-bearing"], "loaded");
  assert.equal(states["oh-my-pi:tool-bearing"], "loaded");
});

test("canonical assistant bodies reject untyped text and every tool-bearing event layer", () => {
  const home = makeHome();
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-assistant-strict-"));
  const targetSkill = path.join(repo, "skills", "developer-tools-integrations", "demo-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
  fs.writeFileSync(targetSkill, "---\nname: demo-skill\n---\n# demo-skill\n");
  const marker = "# demo-skill\nFollow the target workflow";

  const codexSessions = path.join(home, ".codex", "sessions", "2026", "08", "30");
  const codexRows = (assistant) => [
    { type: "session_meta", payload: { cwd: repo } },
    {
      type: "response_item",
      payload: { type: "custom_tool_call", cmd: `Get-Content -LiteralPath '${targetSkill}'` },
    },
    assistant,
  ];
  const codexAssistant = (content, outer = {}) => ({
    type: "response_item",
    ...outer,
    payload: { type: "message", role: "assistant", content },
  });
  writeJsonl(path.join(codexSessions, "rollout-raw-string.jsonl"), codexRows(codexAssistant(marker)));
  writeJsonl(path.join(codexSessions, "rollout-list-string.jsonl"), codexRows(codexAssistant([marker])));
  writeJsonl(
    path.join(codexSessions, "rollout-noncanonical-text-type.jsonl"),
    codexRows(codexAssistant([{ type: "TEXT", text: marker }])),
  );
  writeJsonl(
    path.join(codexSessions, "rollout-outer-tool.jsonl"),
    codexRows(codexAssistant([{ type: "output_text", text: marker }], { toolName: "shell" })),
  );
  writeJsonl(
    path.join(codexSessions, "rollout-nested-tool.jsonl"),
    codexRows({
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        function_call: { name: "shell" },
        content: [{ type: "text", text: marker }],
      },
    }),
  );
  writeJsonl(
    path.join(codexSessions, "rollout-tool-output.jsonl"),
    codexRows(codexAssistant([{ type: "tool_output", text: marker }])),
  );
  writeJsonl(
    path.join(codexSessions, "rollout-mixed.jsonl"),
    codexRows(codexAssistant([{ type: "output_text", text: marker }, { type: "future_tool_payload", value: "x" }])),
  );

  const ompSessions = path.join(home, ".omp", "agent", "sessions", encodeOmp(repo));
  const ompRows = (assistant) => [
    { type: "message", message: { role: "toolResult", toolName: "read", content: targetSkill } },
    assistant,
  ];
  const ompAssistant = (content, messageExtra = {}, outer = {}) => ({
    type: "message",
    ...outer,
    message: { role: "assistant", content, ...messageExtra },
  });
  writeJsonl(path.join(ompSessions, "raw-string.jsonl"), ompRows(ompAssistant(marker)));
  writeJsonl(path.join(ompSessions, "list-string.jsonl"), ompRows(ompAssistant([marker])));
  writeJsonl(
    path.join(ompSessions, "noncanonical-output-text-type.jsonl"),
    ompRows(ompAssistant([{ type: "OUTPUT_TEXT", text: marker }])),
  );
  writeJsonl(
    path.join(ompSessions, "outer-tool.jsonl"),
    ompRows(ompAssistant([{ type: "text", text: marker }], {}, { toolName: "shell" })),
  );
  writeJsonl(
    path.join(ompSessions, "nested-tool.jsonl"),
    ompRows(ompAssistant([{ type: "text", text: marker }], { function_call: { name: "shell" } })),
  );
  writeJsonl(
    path.join(ompSessions, "tool-output.jsonl"),
    ompRows(ompAssistant([{ type: "tool_output", text: marker }])),
  );
  writeJsonl(
    path.join(ompSessions, "mixed.jsonl"),
    ompRows(ompAssistant([{ type: "text", text: marker }, { type: "future_tool_payload", value: "x" }])),
  );

  const result = runScan([
    "--skill-name",
    "demo-skill",
    "--skill-path",
    targetSkill,
    "--home",
    home,
    "--repo-root",
    repo,
    "--scope",
    "cwd",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.sessions.length, 14);
  assert.ok(payload.sessions.every((session) => session.status === "loaded"));
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

test("path normalization preserves case distinctions on case-sensitive platforms", (t) => {
  if (process.platform === "win32") {
    t.skip("Windows path comparison follows normcase case-insensitive semantics");
    return;
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-path-case-"));
  const upper = path.join(root, "Skill", "SKILL.md");
  const lower = path.join(root, "skill", "SKILL.md");
  fs.mkdirSync(path.dirname(upper), { recursive: true });
  fs.mkdirSync(path.dirname(lower), { recursive: true });
  fs.writeFileSync(upper, "upper\n");
  fs.writeFileSync(lower, "lower\n");
  const source = [
    "import sys",
    `sys.path.insert(0, ${JSON.stringify(path.join(skillRoot, "scripts"))})`,
    "from scan_invocations import normalize_path,path_matches",
    "a=normalize_path(sys.argv[1]); b=normalize_path(sys.argv[2])",
    "print(f'{a == b},{path_matches(sys.argv[1], b)}')",
  ].join("; ");
  const result = spawnSync(python.command, [...python.prefix, "-c", source, upper, lower], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "False,False");
});

test("bare SKILL.md path extraction stays bounded after a long non-path token", () => {
  const source = [
    "import sys",
    `sys.path.insert(0, ${JSON.stringify(path.join(skillRoot, "scripts"))})`,
    "from scan_invocations import recorded_skill_paths",
    "text=('x'*250000)+' D:/repo/skills/demo-skill/SKILL.md'",
    "print(recorded_skill_paths(text))",
  ].join("; ");
  const result = spawnSync(python.command, [...python.prefix, "-c", source], {
    encoding: "utf8",
    timeout: 3000,
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /demo-skill[\\/]SKILL\.md/);
});
