import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(testDir, "..");
const script = path.join(skillRoot, "scripts", "render_review_html.py");

function pythonCommand() {
  if (process.env.PYTHON) return { command: process.env.PYTHON, prefix: [] };
  for (const candidate of [
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"]);
    if (result.status === 0) return candidate;
  }
  throw new Error("Python interpreter not found");
}

const python = pythonCommand();

function makeReview(overrides = {}) {
  const review = {
    schema_version: 1,
    language: "zh",
    skill_name: "demo-skill",
    skill_path: "skills/demo-skill/SKILL.md",
    scope: "cwd",
    generated_at: "2026-08-30T08:00:00Z",
    coverage: {
      claude: { status: "ok", invoked: 1, loaded: 0, available: 0 },
      grok: { status: "ok", invoked: 1, loaded: 0, available: 0 },
      codex: { status: "ok", invoked: 0, loaded: 1, available: 1 },
      "oh-my-pi": { status: "missing-store", invoked: 0, loaded: 0, available: 0 },
    },
    sessions: [
      {
        id: "s1",
        platform: "claude",
        status: "invoked",
        signal: "Skill tool",
        scores: {
          execution_efficiency: {
            label: "highly_efficient",
            score: 1.0,
            reason: {
              sentences: ["流程直接完成，且中文与 emoji ✅ 保持完整。"],
              locator: { type: "session", value: "s1" },
            },
          },
          instruction_fit: {
            label: "fit",
            score: 1.0,
            reason: {
              sentences: ["指令覆盖了所需判断。"],
              locator: { type: "session", value: "s1" },
            },
          },
        },
      },
      {
        id: "s2",
        platform: "grok",
        status: "invoked",
        signal: "referenced",
        scores: {
          execution_efficiency: {
            label: "mostly_inefficient",
            score: 0.4,
            reason: {
              sentences: ["发生了可避免的重复校验。"],
              locator: { type: "session", value: "s2" },
            },
          },
          instruction_fit: {
            label: "misfit",
            score: 0.2,
            reason: {
              sentences: ["缺少授权快照失效规则。"],
              locator: { type: "session", value: "s2" },
            },
          },
        },
      },
      { id: "s3", platform: "codex", status: "loaded", signal: "read" },
      { id: "s4", platform: "codex", status: "available", signal: "host_skills" },
    ],
    aggregate: {
      execution_efficiency: 0.7,
      instruction_fit: 0.6,
      overall: 0.829412,
      grade: "B-",
      scored_sessions: 2,
      failed_sessions: ["s2"],
    },
    findings: [
      {
        id: "SSR-01",
        verdict: "UPDATE SKILL",
        session_id: "s1",
        platform: "claude",
        evidence: "<script>alert(1)</script>",
        step_deviation: "缺少快照检查。",
        user_correction: "用户要求重新确认。",
        gap: "未规定漂移失效。",
        suggestion: "增加快照失效门。",
      },
      {
        id: "SSR-02",
        verdict: "UPDATE SKILL",
        session_id: "s2",
        platform: "grok",
        evidence: "发生重复操作。",
        step_deviation: "未先检查授权。",
        user_correction: "先展示目标。",
        gap: "授权顺序不明确。",
        suggestion: "固定授权顺序。",
      },
    ],
    suggestions: [
      {
        finding_ids: ["SSR-01", "SSR-02"],
        clause: "在任何 helper 前校验授权快照。",
        why_filed: "两个 invoked 会话呈现同一模式，且一个失败。",
      },
    ],
    not_filed: [],
    unverified: ["浏览器视觉布局仍需人工核实。"],
    reliable: ["静态 HTML 转义已由测试覆盖。"],
  };
  return Object.assign(review, overrides);
}

function render(review) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-render-"));
  const input = path.join(dir, "review.json");
  fs.writeFileSync(input, `${JSON.stringify(review)}\n`, "utf8");
  return spawnSync(python.command, [...python.prefix, script, "--review-json", input], {
    encoding: "utf8",
  });
}

test("renders every registered section, scorecard values, and escaped content", () => {
  const result = render(makeReview());
  assert.equal(result.status, 0, result.stderr);
  const html = result.stdout;
  for (const heading of [
    "量表得分",
    "覆盖说明",
    "调用清单",
    "问题清单",
    "建议条款",
    "未提项",
    "未能核实",
    "可靠部分",
  ]) {
    assert.match(html, new RegExp(heading), `missing heading: ${heading}`);
  }
  assert.match(html, /0\.829412/);
  assert.match(html, />B-</);
  assert.match(html, /0\.850000/);
  assert.match(html, /0\.800000/);
  assert.match(html, /中文与 emoji ✅/u);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script[^>]*>\s*alert\(1\)/i);
  assert.match(html, /<details[ >]/i);
});

test("renders null instruction fit as insufficient evidence, never numeric zero", () => {
  const review = makeReview();
  review.sessions[0].scores.instruction_fit = {
    label: "insufficient_evidence",
    score: 0.5,
    reason: {
      sentences: ["现有记录不足以判断。"],
      locator: { type: "session", value: "s1" },
    },
  };
  review.sessions[1].scores.instruction_fit = {
    label: "insufficient_evidence",
    score: 0.5,
    reason: {
      sentences: ["没有足够的行为证据。"],
      locator: { type: "session", value: "s2" },
    },
  };
  review.aggregate.instruction_fit = null;
  review.aggregate.overall = 0.808824;
  review.aggregate.grade = "B-";
  const result = render(review);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /证据不足/);
  assert.doesNotMatch(result.stdout, /instruction_fit[^<\n]*0\.0(?:00000)?/i);
});

test("renderer CLI exposes no arbitrary output option", () => {
  const result = spawnSync(python.command, [...python.prefix, script, "--help"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--review-json/);
  assert.doesNotMatch(result.stdout, /--out(?:put)?\b/);
});
