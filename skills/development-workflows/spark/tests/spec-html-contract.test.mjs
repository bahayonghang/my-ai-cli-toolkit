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

test("SKILL.md defaults Spark output to committed HTML specs", () => {
  assert.match(skill, /docs\/spark\/YYYY-MM-DD-<topic>-design\.html/);
  assert.match(skill, /assets\/spec-template\.html/);
  assert.match(skill, /HTML Spec Output Contract/);
  assert.match(skill, /single-file HTML spec document to docs\/spark\//);
  assert.doesNotMatch(skill, /docs\/spark\/YYYY-MM-DD-<topic>-design\.md/);
  assert.doesNotMatch(skill, /docs\/superpowers\/specs\//);
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
    "Review Status"
  ]) {
    assert.match(template, new RegExp(`>${heading}<`, "i"), `missing heading: ${heading}`);
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

test("reviewer prompt checks the HTML spec contract", () => {
  assert.match(reviewerPrompt, /docs\/spark\/YYYY-MM-DD-<topic>-design\.html/);
  assert.match(reviewerPrompt, /single-file offline HTML/i);
  assert.match(reviewerPrompt, /main id="main"/);
  assert.match(reviewerPrompt, /remote scripts\/styles\/fonts\/images/);
  assert.match(reviewerPrompt, /template placeholders/);
  assert.doesNotMatch(reviewerPrompt, /docs\/superpowers\/specs\//);
});
