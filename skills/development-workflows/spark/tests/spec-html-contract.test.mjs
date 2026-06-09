import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(skillRoot, relativePath), "utf8");
}

const skill = read("SKILL.md");
const readme = read("README.md");
const reviewerPrompt = read("spec-document-reviewer-prompt.md");
const visualCompanion = read("visual-companion.md");
const startServer = read("scripts/start-server.sh");
const stopServer = read("scripts/stop-server.sh");
const template = read("assets/spec-template.html");
const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
const runtimeInstructions = [
  skill,
  reviewerPrompt,
  visualCompanion,
  startServer,
  stopServer,
].join("\n");

function sectionBetween(text, startPattern, endPattern) {
  const start = text.search(startPattern);
  assert.ok(start >= 0, `missing section start: ${startPattern}`);
  const rest = text.slice(start);
  const end = rest.search(endPattern);
  assert.ok(end >= 0, `missing section end: ${endPattern}`);
  return rest.slice(0, end);
}

const codexPlanSurface = sectionBetween(
  skill,
  /\|\s+\*\*Codex native Plan mode\*\*/,
  /\n\|\s+\*\*Claude Code Plan mode\*\*/,
);
const claudePlanSurface = sectionBetween(
  skill,
  /\|\s+\*\*Claude Code Plan mode\*\*/,
  /\n\|\s+\*\*Writable\/default mode\*\*/,
);
const writableSurface = sectionBetween(
  skill,
  /\|\s+\*\*Writable\/default mode\*\*/,
  /\n\|\s+\*\*Compatibility fallback\*\*/,
);

test("SKILL.md selects the platform surface before writing artifacts", () => {
  assert.match(frontmatter, /version:\s*0\.6\.0/);
  assert.match(frontmatter, /Codex native Plan mode[^"]+chat-only final plan/i);
  assert.match(frontmatter, /Claude Code Plan mode[^"]+approval exits Plan mode/i);
  assert.match(frontmatter, /writable\/default mode[^"]+\.plannings\/YYYY-MM-DD-feature-slug\.md/i);
  assert.match(skill, /Planning Surface Selection/);
  assert.match(skill, /Surface before artifact/);
  assert.match(skill, /Writable Output Path and Slug Rules/);
});

test("Codex native Plan mode is chat-only and read-only", () => {
  assert.match(codexPlanSurface, /Final plan in chat only|chat-only final plan/i);
  assert.match(codexPlanSurface, /request_user_input/);
  assert.match(codexPlanSurface, /Read-only/i);
  assert.match(codexPlanSurface, /Do not derive or write[^|]+\.plannings[^|]+\.spark[^|]+HTML[^|]+CONTEXT\.md[^|]+ADR[^|]+task[^|]+implementation files/i);
  assert.doesNotMatch(codexPlanSurface, /EnterPlanMode|ExitPlanMode|AskUserQuestion/);
});

test("Claude Code Plan mode uses approval/exit before writing", () => {
  assert.match(claudePlanSurface, /EnterPlanMode/);
  assert.match(claudePlanSurface, /ExitPlanMode/);
  assert.match(claudePlanSurface, /Do not write files while Plan mode is active/i);
  assert.match(claudePlanSurface, /approval exits Plan mode into a writable permission mode/i);
  assert.match(claudePlanSurface, /materialize the approved Spark plan/i);
});

test("EnterPlanMode and ExitPlanMode are only described in Claude-specific context", () => {
  const contexts = [
    ...skill.matchAll(/.{0,120}\b(?:EnterPlanMode|ExitPlanMode)\b.{0,120}/gs),
  ].map((match) => match[0]);
  assert.ok(contexts.length >= 2, "expected Claude Code Plan mode tool references");
  for (const context of contexts) {
    assert.match(context, /Claude/i);
    assert.doesNotMatch(context, /Codex native Plan mode[^.|\n]*(?:EnterPlanMode|ExitPlanMode)/i);
  }
});

test("writable/default mode preserves Markdown plans in .plannings", () => {
  assert.match(writableSurface, /\.plannings\/YYYY-MM-DD-<feature-slug>\.md/);
  assert.match(skill, /\.plannings\/YYYY-MM-DD-<feature-slug>\.md/);
  assert.match(skill, /Markdown Plan Structure/);
  assert.match(skill, /Do not create or edit `\.gitignore`/i);
  assert.match(skill, /Skip this path entirely in Codex native Plan mode/i);
  assert.match(skill, /after `ExitPlanMode` approval has exited Plan mode/i);
  assert.doesNotMatch(frontmatter, /offline HTML spec to .*\.spark/i);
  assert.doesNotMatch(skill, /\.spark\/YYYY-MM-DD-<topic>-design\.html/);
  assert.doesNotMatch(skill, /default(?:s|ing)?\s+to\s+(?:an\s+)?HTML/i);
});

test("SKILL.md makes HTML an explicit writable-mode-only branch", () => {
  assert.match(skill, /Explicit HTML\/Visual Branch/);
  assert.match(skill, /Only create a `\.html` artifact when the user explicitly requests/i);
  assert.match(skill, /unavailable while Codex native Plan mode or Claude Code Plan mode is active/i);
  assert.match(skill, /list the requested HTML\/visual artifact as a follow-up/i);
  assert.match(skill, /\.plannings\/YYYY-MM-DD-<feature-slug>\.html/);
  assert.match(skill, /assets\/spec-template\.html/);
  assert.match(skill, /spec-document-reviewer-prompt\.md` only for this HTML branch/);
});

test("SKILL.md includes evidence-first grilling mechanics", () => {
  assert.match(skill, /Decision-tree interrogation/);
  assert.match(skill, /Ask exactly one blocking question at a time/i);
  assert.match(skill, /Spark's recommended answer/i);
  assert.match(skill, /trade-off/i);
  assert.match(skill, /If a question can be answered by exploring the codebase or docs, explore instead of asking/i);
  assert.match(skill, /Challenge glossary conflicts/i);
  assert.match(skill, /concrete scenarios/i);
  assert.match(skill, /Cross-check user claims against code and docs/i);
});

test("SKILL.md stops after user approval instead of implementing", () => {
  assert.match(skill, /User approval gate/i);
  assert.match(skill, /waits? for a separate execution request/i);
  assert.match(skill, /Do NOT write production code/i);
  assert.match(skill, /Do not force-enter Codex Plan mode/i);
});

test("only writing-plans is named as a fallback planning skill", () => {
  assert.match(runtimeInstructions, /writing-plans/);
  const fallbackNames = new Set(
    runtimeInstructions.match(/\b(?:writing-plans|executing-plans|subagent-driven-development)\b/g) ?? [],
  );
  assert.deepEqual([...fallbackNames].sort(), ["writing-plans"]);
});

test("runtime instructions and scripts do not use superpowers paths", () => {
  assert.doesNotMatch(runtimeInstructions, /docs\/superpowers\//);
  assert.doesNotMatch(runtimeInstructions, /\.superpowers\//);
  assert.match(visualCompanion, /\.spark\/brainstorm\//);
  assert.match(startServer, /\.spark\/brainstorm/);
  assert.match(stopServer, /\.spark\//);
});

test("README describes current Spark behavior without a runtime superpowers chain", () => {
  assert.match(readme, /Codex native Plan mode[\s\S]+read-only[\s\S]+chat-only/i);
  assert.match(readme, /Claude Code Plan mode[\s\S]+EnterPlanMode[\s\S]+ExitPlanMode/i);
  assert.match(readme, /Writable\/default mode[\s\S]+\.plannings\//i);
  assert.match(readme, /\.plannings\/YYYY-MM-DD-<feature-slug>\.md/);
  assert.match(readme, /HTML and visual artifacts are opt-in and writable-mode-only/i);
  assert.match(readme, /v0\.6\.0/);
  assert.doesNotMatch(readme, /\.superpowers\//);
  assert.doesNotMatch(readme, /docs\/superpowers\//);
  assert.doesNotMatch(readme, /executing-plans|subagent-driven-development/);
});

test("HTML reviewer prompt is scoped to explicit HTML output", () => {
  assert.match(reviewerPrompt, /only when Spark's explicit HTML\/visual branch/i);
  assert.match(reviewerPrompt, /Default Markdown plans do not use this prompt/i);
  assert.match(reviewerPrompt, /\.plannings\/YYYY-MM-DD-<feature-slug>\.html/);
  assert.match(reviewerPrompt, /single-file offline HTML/i);
  assert.match(reviewerPrompt, /main id="main"/);
  assert.match(reviewerPrompt, /remote scripts\/styles\/fonts\/images/);
  assert.match(reviewerPrompt, /template placeholders/);
  assert.doesNotMatch(reviewerPrompt, /docs\/superpowers\/specs\//);
  assert.doesNotMatch(reviewerPrompt, /docs\/spark\//);
});

test("spec template is standalone semantic HTML with required sections", () => {
  assert.match(template, /^<!doctype html>/i);
  assert.match(template, /<html\s+lang="en"/i);
  assert.match(template, /<meta\s+charset="utf-8"/i);
  assert.match(template, /<meta\s+name="viewport"/i);
  assert.match(template, /<title>[^<]+<\/title>/i);
  assert.match(template, /<main\s+id="main"/i);
  assert.equal((template.match(/<h1\b/gi) ?? []).length, 1);

  for (const heading of [
    "Summary",
    "Goals",
    "Non-goals",
    "Context",
    "Recommended Approach",
    "Alternatives",
    "Design Details",
    "Risks",
    "Test/Acceptance Criteria",
    "Review Status",
  ]) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    assert.match(
      template,
      new RegExp(`>\\s*${escaped}\\s*<`, "i"),
      `missing heading: ${heading}`,
    );
  }
});

test("spec template has no remote dependencies or protocol-relative URLs", () => {
  assert.doesNotMatch(template, /<script\b/i);
  assert.doesNotMatch(template, /<link\b/i);
  assert.doesNotMatch(template, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(template, /(?:src|href)=["']\/\//i);
  assert.doesNotMatch(template, /@import\s+url\(/i);
  assert.doesNotMatch(template, /url\(["']?https?:\/\//i);
});

test("spec template uses single-column card layout (no sidebar TOC)", () => {
  assert.doesNotMatch(template, /class="toc"/);
  assert.doesNotMatch(template, /<nav\b/i);
  assert.doesNotMatch(template, /grid-template-columns:\s*minmax\(14rem/);
});

test("spec template uses interactive checkboxes in tracked sections", () => {
  const trackedSections = [
    {
      heading: "Test/Acceptance Criteria",
      anchor: "test-acceptance-criteria-heading",
    },
    { heading: "Risks", anchor: "risks-heading" },
    { heading: "Review Status", anchor: "review-status-heading" },
  ];

  for (const { heading, anchor } of trackedSections) {
    const start = template.indexOf(anchor);
    assert.ok(start >= 0, `missing anchor for ${heading}`);
    const rest = template.slice(start);
    const nextSection = rest.indexOf("<section", 1);
    const endOfMain = rest.indexOf("</main>");
    const sliceEnd =
      nextSection >= 0 && nextSection < endOfMain ? nextSection : endOfMain;
    const slice = rest.slice(0, sliceEnd);
    assert.match(
      slice,
      /<input[^>]+type="checkbox"/i,
      `expected an interactive checkbox inside the ${heading} section`,
    );
  }
});

test("spec template uses a neutral palette and no plan-mode handoff wording", () => {
  assert.doesNotMatch(template, /#f7f3ea/i);
  assert.doesNotMatch(template, /#fffaf0/i);
  assert.doesNotMatch(template, /#ded4c3/i);
  assert.doesNotMatch(template, /EnterPlanMode|ExitPlanMode/);
});

test("reviewer prompt checks the card layout and interactive checklist", () => {
  assert.match(reviewerPrompt, /single-column|card layout/i);
  assert.match(reviewerPrompt, /input type="checkbox"|checklist/i);
  assert.match(reviewerPrompt, /no\s+`?<nav class="toc">`?|sidebar/i);
});
