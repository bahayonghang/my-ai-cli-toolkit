import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Every skill-relative path in inline code spans of SKILL.md,
// references/modes/*.md, and references/styles/f4p_*.md must exist. A span
// token such as `references/x.md`, `scripts/y.py`, `assets/z/`, or
// `<skill-dir>/scripts/y.py` counts. Tokens with a `*` or `<` placeholder are
// skipped.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const modesDir = path.join(skillRoot, "references", "modes");
const stylesDir = path.join(skillRoot, "references", "styles");

const docs = [
  path.join(skillRoot, "SKILL.md"),
  ...readdirSync(modesDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(modesDir, name)),
  // figures4papers style docs; an empty match adds no file.
  ...readdirSync(stylesDir)
    .filter((name) => name.startsWith("f4p_") && name.endsWith(".md"))
    .map((name) => path.join(stylesDir, name)),
];

const PATH_TOKEN =
  /(?:^|[\s"'(])(?:<skill-dir>\/)?((?:references|scripts|assets)\/[^\s"'`)]*)/g;

function referencedPaths(text) {
  const withoutFences = text.replace(/```[\s\S]*?```/g, "");
  const found = [];
  for (const span of withoutFences.matchAll(/`([^`\n]+)`/g)) {
    for (const match of span[1].matchAll(PATH_TOKEN)) {
      const token = match[1].replace(/[.,;:]+$/, "");
      if (token.includes("*") || token.includes("<")) continue;
      found.push(token);
    }
  }
  return found;
}

test("backtick paths in SKILL.md, modes/*.md, and styles/f4p_*.md exist", () => {
  let checked = 0;
  const missing = [];
  for (const doc of docs) {
    for (const rel of referencedPaths(readFileSync(doc, "utf8"))) {
      checked += 1;
      if (!existsSync(path.join(skillRoot, rel))) {
        missing.push(`${path.relative(skillRoot, doc)} -> ${rel}`);
      }
    }
  }
  assert.ok(checked >= 10, `expected at least 10 paths, found ${checked}`);
  assert.deepEqual(missing, [], `missing paths:\n${missing.join("\n")}`);
});
