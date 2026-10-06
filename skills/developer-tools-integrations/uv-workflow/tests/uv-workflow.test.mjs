import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skillMd = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
const evals = JSON.parse(readFileSync(new URL("../evals/evals.json", import.meta.url), "utf8"));
const exclusions = ["python3"];

function descriptionOf(markdown) {
  const fence = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) {
    throw new Error("missing frontmatter");
  }
  const lines = fence[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^description:\s*(.*)$/);
    if (!match) {
      continue;
    }
    const rest = match[1].trim();
    if (rest === ">" || rest === ">-" || rest === "|" || rest === "|-") {
      const parts = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (!/^\s/.test(lines[cursor])) {
          break;
        }
        parts.push(lines[cursor].trim());
      }
      return parts.join(" ").replace(/\s+/g, " ").trim();
    }
    if (
      (rest.startsWith('"') && rest.endsWith('"')) ||
      (rest.startsWith("'") && rest.endsWith("'"))
    ) {
      return rest.slice(1, -1);
    }
    return rest;
  }
  throw new Error("missing description");
}

test("description and evals name exclusions", () => {
  const description = descriptionOf(skillMd);
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
