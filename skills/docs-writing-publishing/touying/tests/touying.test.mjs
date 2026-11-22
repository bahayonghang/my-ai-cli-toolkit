import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillMdPath = path.join(skillRoot, "SKILL.md");
const evalsPath = path.join(skillRoot, "evals", "evals.json");

const skillMd = readFileSync(skillMdPath, "utf8");
const evals = JSON.parse(readFileSync(evalsPath, "utf8"));
const exclusions = ["reveal.js", "PPT", "Marp", "HTML", "academic-defense-beamer"];

function parseFrontmatter(markdown) {
  const fence = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) {
    throw new Error("missing frontmatter");
  }
  const lines = fence[1].split(/\r?\n/);
  const data = {};
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    const key = match[1];
    const rest = match[2].trim();
    if (rest === ">" || rest === ">-" || rest === "|" || rest === "|-") {
      const parts = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (!/^\s/.test(lines[cursor])) {
          break;
        }
        parts.push(lines[cursor].trim());
        index = cursor;
      }
      data[key] = parts.join(" ").replace(/\s+/g, " ").trim();
    } else if (
      (rest.startsWith('"') && rest.endsWith('"')) ||
      (rest.startsWith("'") && rest.endsWith("'"))
    ) {
      data[key] = rest.slice(1, -1);
    } else {
      data[key] = rest;
    }
  }
  return data;
}

function findAllSkillEntrypoints(dir, relBase = "") {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "__pycache__" || entry.name === "dist") {
      continue;
    }
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAllSkillEntrypoints(fullPath, relPath));
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      results.push(relPath);
    }
  }
  return results.sort();
}

function relativeMarkdownLinks(markdown) {
  const matches = [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)];
  return matches
    .map((m) => m[1].trim())
    .filter((target) => !target.startsWith("http://") && !target.startsWith("https://") && !target.startsWith("#"))
    .map((target) => target.split("#")[0])
    .filter((target) => target.endsWith(".md"));
}

test("SKILL.md frontmatter satisfies Touying 0.8.0 contract and size budget", () => {
  const fm = parseFrontmatter(skillMd);
  assert.equal(fm.name, "touying");
  assert.equal(fm.version, "2.0.0");
  assert.equal(fm.category, "docs-writing-publishing");
  assert.ok(fm.description && fm.description.length > 0, "description must be non-empty");
  assert.ok(!fm.description.includes("<") && !fm.description.includes(">"), "description must not contain angle brackets");
  assert.ok(fm.description.length <= 1024, `description too long: ${fm.description.length}`);
  const bytes = Buffer.byteLength(skillMd, "utf8");
  assert.ok(bytes <= 14000, `SKILL.md UTF-8 byte length ${bytes} exceeds 14000`);
});

test("description and evals cover all exclusion boundaries", () => {
  const fm = parseFrontmatter(skillMd);
  const description = fm.description || "";
  for (const item of exclusions) {
    assert.ok(description.includes(item), `description missing ${item}\n${description}`);
  }
  const assertions = [];
  for (const item of evals.evals) {
    assert.ok(Array.isArray(item.assertions));
    assertions.push(...item.assertions);
  }
  const named = assertions.filter((text) => exclusions.some((token) => text.includes(token)));
  assert.ok(named.length >= 2, `named assertions ${named.length}`);
  for (const item of exclusions) {
    assert.ok(assertions.some((text) => text.includes(item)), `assertions missing ${item}`);
  }
});

test("single root SKILL.md invariant and legacy docs removal", () => {
  const entrypoints = findAllSkillEntrypoints(skillRoot);
  assert.deepEqual(entrypoints, ["SKILL.md"]);
  assert.ok(!existsSync(path.join(skillRoot, "docs")), "legacy 0.6.1 docs/ directory must not exist");
});

test("every relative markdown link in SKILL.md resolves cleanly", () => {
  const links = relativeMarkdownLinks(skillMd);
  assert.ok(links.length >= 3, "SKILL.md must route to core references");
  for (const rel of links) {
    const resolved = path.join(skillRoot, rel);
    assert.ok(existsSync(resolved), `broken link in SKILL.md: ${rel}`);
  }
});

test("SKILL.md avoids legacy 0.5.0/0.6.1 defaults and deprecated recommendations", () => {
  assert.ok(!skillMd.includes("0.5.0"), "SKILL.md must not mention 0.5.0");
  assert.ok(!skillMd.includes("0.6.1"), "SKILL.md must not mention 0.6.1");
  assert.ok(!skillMd.includes("local docs cover metropolis"), "SKILL.md must not contain stale metropolis claim");
  assert.ok(!/cover:\s*utils\.semi-transparent-cover/.test(skillMd), "must not recommend semi-transparent-cover");
  assert.ok(!/#?touying-equation\s*\(/.test(skillMd), "must not recommend touying-equation");
  for (const deprecated of ["semi-transparent-cover", "touying-equation"]) {
    for (const line of skillMd.split(/\r?\n/)) {
      if (line.includes(deprecated)) {
        assert.match(line, /(instead of|替代|禁止|禁用|弃用|deprecated)/i, `unnegated deprecated mention: ${line}`);
      }
    }
  }
});
