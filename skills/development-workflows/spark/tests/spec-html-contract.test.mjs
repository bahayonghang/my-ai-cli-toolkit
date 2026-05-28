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
const reviewerPrompt = read("spec-document-reviewer-prompt.md");
const template = read("assets/spec-template.html");

test("SKILL.md defaults Spark output to gitignored .spark/ HTML specs", () => {
  assert.match(skill, /\.spark\/YYYY-MM-DD-<topic>-design\.html/);
  assert.match(skill, /assets\/spec-template\.html/);
  assert.match(skill, /HTML Spec Output Contract/);
  assert.match(skill, /offline HTML spec to .*\.spark\//i);
  assert.doesNotMatch(skill, /\.spark\/YYYY-MM-DD-<topic>-design\.md/);
  assert.doesNotMatch(skill, /docs\/superpowers\/specs\//);
  assert.doesNotMatch(skill, /docs\/spark\//);
});

test("SKILL.md documents the EnterPlanMode handoff", () => {
  assert.match(skill, /EnterPlanMode/);
  assert.match(skill, /Plan-mode handoff/);
  assert.match(skill, /Plan mode already active/);
  assert.match(skill, /ExitPlanMode/);
});

test("SKILL.md instructs use of AskUserQuestion for structured choices", () => {
  assert.match(skill, /AskUserQuestion/);
  assert.match(skill, /2-4 (?:mutually exclusive |)options/i);
});

test("SKILL.md describes .gitignore handling for .spark/", () => {
  assert.match(skill, /\.gitignore/);
  assert.match(skill, /\.spark\//);
});

test("spec template is standalone semantic HTML with required spec sections", () => {
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

test("spec template uses a neutral palette (no warm beige tokens)", () => {
  assert.doesNotMatch(template, /#f7f3ea/i);
  assert.doesNotMatch(template, /#fffaf0/i);
  assert.doesNotMatch(template, /#ded4c3/i);
});

test("reviewer prompt checks the HTML spec contract", () => {
  assert.match(reviewerPrompt, /\.spark\/YYYY-MM-DD-<topic>-design\.html/);
  assert.match(reviewerPrompt, /single-file offline HTML/i);
  assert.match(reviewerPrompt, /main id="main"/);
  assert.match(reviewerPrompt, /remote scripts\/styles\/fonts\/images/);
  assert.match(reviewerPrompt, /template placeholders/);
  assert.doesNotMatch(reviewerPrompt, /docs\/superpowers\/specs\//);
  assert.doesNotMatch(reviewerPrompt, /docs\/spark\//);
});

test("reviewer prompt checks the card layout and interactive checklist", () => {
  assert.match(reviewerPrompt, /single-column|card layout/i);
  assert.match(reviewerPrompt, /input type="checkbox"|checklist/i);
  assert.match(reviewerPrompt, /no\s+`?<nav class="toc">`?|sidebar/i);
});
