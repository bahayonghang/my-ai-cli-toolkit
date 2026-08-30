import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(testDir, "..", "scripts", "render_review_html.py");

function pythonCommand() {
  for (const candidate of [
    { command: process.env.PYTHON, prefix: [] },
    { command: "python", prefix: [] },
    { command: "python3", prefix: [] },
    { command: "py", prefix: ["-3"] },
  ]) {
    if (!candidate.command) continue;
    const result = spawnSync(candidate.command, [...candidate.prefix, "--version"]);
    if (result.status === 0) return candidate;
  }
  throw new Error("Python interpreter not found");
}

const python = pythonCommand();
const RESOURCE_ATTRS = new Map([
  ["script", ["src"]],
  ["link", ["href"]],
  ["img", ["src"]],
  ["iframe", ["src"]],
  ["source", ["src", "srcset"]],
  ["object", ["data"]],
  ["embed", ["src"]],
  ["video", ["src", "poster"]],
  ["audio", ["src"]],
  ["use", ["href", "xlink:href"]],
]);

function externalResourceViolations(html) {
  const violations = [];
  for (const match of html.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = RESOURCE_ATTRS.get(tag) ?? [];
    for (const attr of attrs) {
      const escaped = attr.replace(":", "\\:");
      if (new RegExp(`(?:^|\\s)${escaped}\\s*=`, "i").test(match[2])) {
        violations.push(`${tag}[${attr}]`);
      }
    }
  }
  for (const style of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (/url\s*\(/i.test(style[1])) violations.push("css:url");
    if (/@import\b/i.test(style[1])) violations.push("css:@import");
  }
  return violations;
}

function minimalReview() {
  return {
    schema_version: 1,
    language: "en",
    skill_name: "demo-skill",
    skill_path: "skills/demo-skill/SKILL.md",
    scope: "cwd",
    generated_at: "2026-08-30T08:00:00Z",
    coverage: {
      claude: { status: "ok", invoked: 1, loaded: 0, available: 0 },
      grok: { status: "missing-store", invoked: 0, loaded: 0, available: 0 },
      codex: { status: "missing-store", invoked: 0, loaded: 0, available: 0 },
      "oh-my-pi": { status: "missing-store", invoked: 0, loaded: 0, available: 0 },
    },
    sessions: [
      {
        id: "s1",
        platform: "claude",
        status: "invoked",
        signal: "Skill",
        scores: {
          execution_efficiency: {
            label: "highly_efficient",
            score: 1.0,
            reason: { sentences: ["Direct."], locator: { type: "session", value: "s1" } },
          },
          instruction_fit: {
            label: "fit",
            score: 1.0,
            reason: { sentences: ["Covered."], locator: { type: "session", value: "s1" } },
          },
        },
      },
    ],
    aggregate: {
      execution_efficiency: 1.0,
      instruction_fit: 1.0,
      overall: 1.0,
      grade: "A+",
      scored_sessions: 1,
      failed_sessions: [],
    },
    findings: [
      {
        id: "SSR-01",
        verdict: "INCONCLUSIVE",
        session_id: "s1",
        platform: "claude",
        evidence: "Text evidence: https://example.test/session-log",
        step_deviation: "none",
        user_correction: "none",
        gap: "none",
        suggestion: "none",
      },
    ],
    suggestions: [],
    not_filed: [{ finding_id: "SSR-01", why_not: "One-off evidence." }],
    unverified: ["Visual layout."],
    reliable: ["Escaping."],
  };
}

function render(review) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-no-resource-"));
  const input = path.join(dir, "review.json");
  fs.writeFileSync(input, `${JSON.stringify(review)}\n`, "utf8");
  const result = spawnSync(
    python.command,
    [...python.prefix, script, "--review-json", input],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test("generated HTML is self-contained while a URL text node remains allowed", () => {
  const html = render(minimalReview());
  assert.deepEqual(externalResourceViolations(html), []);
  assert.match(html, /https:\/\/example\.test\/session-log/);
  assert.doesNotMatch(html, /warp/i);
});

test("resource scanner rejects every governed carrier and CSS form", () => {
  const cases = {
    "network-script": '<script src="https://example.test/a.js"></script>',
    "protocol-relative-link": '<link href="//example.test/a.css">',
    "relative-image": '<img src="./relative.png">',
    "windows-iframe": '<iframe src="C:\\\\tmp\\\\x.html"></iframe>',
    "posix-source": '<source src="/tmp/a.mp4">',
    "file-object": '<object data="file:///tmp/a"></object>',
    "embed-source": '<embed src="a.bin">',
    "video-poster": '<video poster="poster.png"></video>',
    "audio-source": '<audio src="sound.wav"></audio>',
    "svg-use": '<svg><use xlink:href="icons.svg#x"></use></svg>',
    "css-url": "<style>body{background:url(./x.png)}</style>",
    "css-import": '<style>@import "file:///tmp/x.css";</style>',
  };
  for (const [name, html] of Object.entries(cases)) {
    assert.notDeepEqual(externalResourceViolations(html), [], name);
  }
});
