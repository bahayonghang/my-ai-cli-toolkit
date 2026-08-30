import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(testDir, "..");
const fixture = JSON.parse(fs.readFileSync(path.join(testDir, "valid-review.json"), "utf8"));

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

function render(kind, language) {
  const review = structuredClone(fixture);
  review.language = language;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ssr-language-"));
  const input = path.join(dir, "review.json");
  fs.writeFileSync(input, `${JSON.stringify(review)}\n`, "utf8");
  const moduleName = kind === "html" ? "render_review_html" : "write_session_review";
  const functionName = kind === "html" ? "render_page" : "render_markdown";
  const source = [
    "import pathlib, sys",
    `sys.path.insert(0, ${JSON.stringify(path.join(skillRoot, "scripts"))})`,
    "from review_contract import decode_review_json, validate_review",
    `from ${moduleName} import ${functionName}`,
    "p = pathlib.Path(sys.argv[1])",
    "_, review = decode_review_json(p.read_bytes())",
    "review = validate_review(review, review['skill_name'])",
    `sys.stdout.buffer.write(${functionName}(review).encode('utf-8'))`,
  ].join("; ");
  const result = spawnSync(python.command, [...python.prefix, "-c", source, input], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function normalizeHeadings(text, language) {
  const headings = language === "zh"
    ? ["量表得分", "覆盖说明", "调用清单", "问题清单", "建议条款", "未提项", "未能核实", "可靠部分"]
    : ["Scorecard", "Coverage", "Invocations", "Findings", "Suggestions", "Not filed", "Unverified", "Reliable"];
  let normalized = text;
  for (const heading of headings) normalized = normalized.replaceAll(heading, "__HEADING__");
  return normalized.replace(/Language:\s*`?(?:zh|en)`?/g, "Language: __LANGUAGE__");
}

for (const kind of ["markdown", "html"]) {
  test(`${kind} headings follow language while stable field names and content remain`, () => {
    const zh = render(kind, "zh");
    const en = render(kind, "en");
    for (const heading of ["量表得分", "覆盖说明", "调用清单", "问题清单", "建议条款", "未提项", "未能核实", "可靠部分"]) {
      assert.match(zh, new RegExp(heading), `${kind}: missing ${heading}`);
      assert.doesNotMatch(en, new RegExp(heading), `${kind}: leaked ${heading}`);
    }
    for (const heading of ["Scorecard", "Coverage", "Invocations", "Findings", "Suggestions", "Not filed", "Unverified", "Reliable"]) {
      assert.match(en, new RegExp(heading), `${kind}: missing ${heading}`);
    }
    for (const field of ["Session", "Platform", "Evidence"]) {
      assert.match(zh, new RegExp(field));
      assert.match(en, new RegExp(field));
    }
    assert.match(zh, /SSR-01/);
    assert.match(en, /SSR-01/);
    assert.match(zh, /Language:\s*`?zh`?/);
    assert.match(en, /Language:\s*`?en`?/);
    assert.equal(normalizeHeadings(zh, "zh"), normalizeHeadings(en, "en"));
  });
}

test("heading dictionary has one source definition and both renderers import it", () => {
  const scriptsDir = path.join(skillRoot, "scripts");
  const files = fs.readdirSync(scriptsDir).filter((name) => name.endsWith(".py"));
  const defining = files.filter((name) =>
    /\bHEADINGS\s*=/.test(fs.readFileSync(path.join(scriptsDir, name), "utf8")),
  );
  assert.deepEqual(defining, ["report_headings.py"]);
  for (const name of ["render_review_html.py", "write_session_review.py"]) {
    assert.match(fs.readFileSync(path.join(scriptsDir, name), "utf8"), /(?:from\s+report_headings\s+import|import\s+report_headings)/);
  }
});
