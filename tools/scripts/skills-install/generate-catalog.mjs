#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const skillsRoot = path.join(repoRoot, "content", "skills");
const outputPath = path.join(skillsRoot, "catalog.json");
const repository = "bahayonghang/my-claude-code-settings";

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function endsWithUnescapedQuote(value, quote) {
  if (!value.endsWith(quote)) {
    return false;
  }

  let slashCount = 0;
  for (let i = value.length - 2; i >= 0 && value[i] === "\\"; i -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 0;
}

function unescapeQuotedValue(value, quote) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(new RegExp(`\\\\${quote}`, "g"), quote)
    .replace(/\\\\/g, "\\");
}

function readFrontmatterDescription(skillFile) {
  const content = fs.readFileSync(skillFile, "utf8");
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) {
    return "";
  }

  const lines = frontmatterMatch[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^description\s*:\s*(.*)$/);
    if (!match) {
      i += 1;
      continue;
    }

    const rawValue = match[1].trim();
    if (!rawValue) {
      return "";
    }

    if (rawValue === ">-" || rawValue === ">" || rawValue === "|" || rawValue === "|-") {
      const parts = [];
      i += 1;
      while (i < lines.length) {
        const blockLine = lines[i];
        if (blockLine.trim() === "---") {
          break;
        }
        if (!/^[ \t]+/.test(blockLine) && blockLine.trim() !== "") {
          break;
        }
        parts.push(blockLine.replace(/^[ \t]+/, ""));
        i += 1;
      }
      return normalizeText(parts.join(" "));
    }

    if (rawValue.startsWith('"') || rawValue.startsWith("'")) {
      const quote = rawValue[0];

      if (endsWithUnescapedQuote(rawValue, quote) && rawValue.length > 1) {
        return normalizeText(unescapeQuotedValue(rawValue.slice(1, -1), quote));
      }

      let buffer = rawValue.slice(1);
      i += 1;
      while (i < lines.length) {
        const nextLine = lines[i].replace(/^[ \t]+/, "");
        buffer += `\n${nextLine}`;
        if (endsWithUnescapedQuote(nextLine, quote)) {
          break;
        }
        i += 1;
      }

      if (buffer.endsWith(quote)) {
        buffer = buffer.slice(0, -1);
      }

      return normalizeText(unescapeQuotedValue(buffer, quote));
    }

    const quoted = rawValue.match(/^"(.*)"$/) || rawValue.match(/^'(.*)'$/);
    return normalizeText(quoted ? quoted[1] : rawValue);
  }

  return "";
}

function buildCatalog() {
  const categories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "external-skills")
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const skills = [];
  for (const category of categories) {
    const categoryRoot = path.join(skillsRoot, category);
    const entries = fs
      .readdirSync(categoryRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const name of entries) {
      const skillFile = path.join(categoryRoot, name, "SKILL.md");
      if (!fs.existsSync(skillFile)) {
        continue;
      }

      skills.push({
        name,
        category,
        description: readFrontmatterDescription(skillFile),
        path: `content/skills/${category}/${name}`,
      });
    }
  }

  return {
    schema_version: 1,
    repository,
    source: `${repository}/content/skills`,
    skills,
  };
}

function renderCatalog(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

function build() {
  const output = renderCatalog(buildCatalog());
  fs.writeFileSync(outputPath, output, "utf8");
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputPath)}\n`);
}

function check() {
  const expected = renderCatalog(buildCatalog());
  const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";

  if (actual !== expected) {
    process.stderr.write(
      "content/skills/catalog.json is out of date. Run `node tools/scripts/skills-install/generate-catalog.mjs build`.\n"
    );
    process.exit(1);
  }

  process.stdout.write("content/skills/catalog.json is up to date.\n");
}

const command = process.argv[2] ?? "build";

if (command === "build") {
  build();
} else if (command === "check") {
  check();
} else {
  process.stderr.write("Usage: node tools/scripts/skills-install/generate-catalog.mjs [build|check]\n");
  process.exit(1);
}
