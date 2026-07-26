import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siblingTemplates = path.resolve(
  skillDir,
  "..",
  "claude-context-improver",
  "references",
  "templates.md",
);

const read = (...parts) =>
  fs.readFileSync(path.join(skillDir, ...parts), "utf8");
const readJson = (...parts) => JSON.parse(read(...parts));

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(fullPath);
    return entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function extractSharedBlock(markdown, kind) {
  const heading = new RegExp(`^## ${kind} .*code_map\\.md.*Template\\s*$`, "m");
  const headingMatch = markdown.match(heading);
  assert.ok(headingMatch, `${kind} code_map template heading is missing`);
  const tail = markdown.slice(headingMatch.index + headingMatch[0].length);
  const fenceStart = tail.indexOf("```markdown");
  assert.notEqual(fenceStart, -1, `${kind} code_map markdown fence is missing`);
  const bodyStart = fenceStart + "```markdown".length;
  const fenceEnd = tail.indexOf("```", bodyStart);
  assert.notEqual(fenceEnd, -1, `${kind} code_map markdown fence is unclosed`);
  return tail.slice(bodyStart, fenceEnd);
}

test("entrypoint stays within the Production initial-load budget", () => {
  const skill = read("SKILL.md");
  const interfaceYaml = read("agents", "interface.yaml");
  const frontmatter = skill.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  assert.ok(frontmatter, "SKILL.md frontmatter is malformed");
  const normalizedSkill = skill.replace(/\r\n/g, "\n");
  const normalizedInterfaceYaml = interfaceYaml.replace(/\r\n/g, "\n");
  const estimatedInitialTokens =
    Math.floor(normalizedSkill.length / 4) +
    Math.floor(normalizedInterfaceYaml.length / 4);
  assert.ok(
    estimatedInitialTokens <= 1000,
    `initial-load estimate ${estimatedInitialTokens} exceeds 1000 tokens`,
  );
  assert.match(skill, /Bash\(rg \*\)/);
  assert.doesNotMatch(skill, /Bash\(find \*\)|\bfind \. /);
});

test("active guidance uses current Codex roots and discovery semantics", () => {
  const activeFiles = [
    path.join(skillDir, "SKILL.md"),
    ...markdownFiles(path.join(skillDir, "references")),
  ];
  const activeText = activeFiles
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(activeText, /\.codex\/skills/);
  assert.match(activeText, /\.agents\/skills/);
  assert.match(activeText, /\.codex\/agents/);

  const discovery = read("references", "codex-agents-discovery.md");
  for (const anchor of [
    "AGENTS.override.md",
    "project_doc_fallback_filenames",
    "project_doc_max_bytes",
    "root-to-CWD",
    "missing evidence",
  ]) {
    assert.ok(
      discovery.includes(anchor),
      `missing discovery anchor: ${anchor}`,
    );
  }
  assert.match(discovery, /Last verified: 2026-07-23/);
  assert.match(
    discovery,
    /https:\/\/learn\.chatgpt\.com\/docs\/agent-configuration\/agents-md/,
  );
});

test("interface and manifest describe a Production inline package", () => {
  const interfaceYaml = read("agents", "interface.yaml");
  for (const fragment of [
    'canonical_format: "agent-skills"',
    '- "openai"',
    '- "claude"',
    '- "generic"',
    'mode: "implicit"',
    'context: "inline"',
    'source_tier: "local"',
    'remote_inline_execution: "forbid"',
    "degradation:",
  ]) {
    assert.ok(
      interfaceYaml.includes(fragment),
      `missing interface contract: ${fragment}`,
    );
  }

  const manifest = readJson("manifest.json");
  assert.equal(manifest.name, "agents-md-improver");
  assert.equal(manifest.version, "1.2.0");
  assert.equal(manifest.owner, "lyh");
  assert.equal(manifest.review_cadence, "quarterly");
  assert.equal(manifest.maturity_tier, "production");
  assert.equal(manifest.context_budget_tier, "production");
  assert.deepEqual(manifest.target_platforms, ["openai", "claude", "generic"]);
  for (const component of [
    "agents",
    "evals",
    "references",
    "reports",
    "tests",
  ]) {
    assert.ok(
      manifest.factory_components.includes(component),
      `missing component: ${component}`,
    );
  }
});

test("repo and output eval fixtures are parseable and cover boundaries", () => {
  const evals = readJson("evals", "evals.json");
  assert.equal(evals.skill_name, "agents-md-improver");
  assert.ok(evals.evals.length >= 10);
  assert.ok(
    evals.evals.filter((item) =>
      /Route|Do not trigger/.test(item.expected_output),
    ).length >= 4,
  );

  const lines = read("evals", "output", "cases.jsonl")
    .split(/\r?\n/)
    .filter(Boolean);
  const cases = lines.map((line) => JSON.parse(line));
  assert.equal(cases.length, 5);
  assert.ok(
    cases.every((item) =>
      item.input_files?.includes("fixtures/agents-md-scenarios.md"),
    ),
  );
  assert.ok(
    cases.filter((item) => item.execution?.holdout === true).length >= 2,
  );
  assert.ok(cases.every((item) => item.human_review?.status === "pending"));
  assert.ok(
    fs.existsSync(
      path.join(
        skillDir,
        "evals",
        "output",
        "fixtures",
        "agents-md-scenarios.md",
      ),
    ),
  );
});

test("report contract is evidence-first and honest about verification", () => {
  const report = read("references", "report-format.md");
  assert.match(
    report,
    /````markdown[\s\S]*?```diff[\s\S]*?````/,
    "nested diff example must use a four-backtick outer fence",
  );
  for (const anchor of [
    "Prioritized Findings",
    "Severity",
    "Evidence",
    "Impact",
    "Proposed change",
    "Confidence",
    "Effective Instruction Chain",
    "Shadowed Candidates",
    "AGENTS decision",
    "code_map decision",
    "Proposed Diff",
    "passed",
    "failed",
    "skipped",
    "missing evidence",
  ]) {
    assert.ok(report.includes(anchor), `missing report contract: ${anchor}`);
  }
});

test("every linked reference exists and focused quality evidence is present", () => {
  const skill = read("SKILL.md");
  const links = [...skill.matchAll(/\((references\/[^)#]+\.md)\)/g)].map(
    (match) => match[1],
  );
  assert.ok(links.length >= 5);
  for (const link of links) {
    assert.ok(
      fs.existsSync(path.join(skillDir, ...link.split("/"))),
      `missing reference: ${link}`,
    );
  }

  for (const report of [
    "output-risk-profile.md",
    "artifact-design-profile.md",
    "prompt-quality-profile.md",
    "output_quality_scorecard.md",
  ]) {
    assert.ok(
      fs.existsSync(path.join(skillDir, "reports", report)),
      `missing report: ${report}`,
    );
  }
  const scorecard = read("reports", "output_quality_scorecard.md");
  const scorecardJson = readJson("reports", "output_quality_scorecard.json");
  assert.match(scorecard, /recorded fixture/i);
  assert.match(scorecard, /missing evidence/i);
  assert.match(scorecard, /Holdout cases: `2`/);
  assert.match(scorecard, /Boundary cases: `1`/);
  assert.equal(scorecardJson.cases, "evals/output/cases.jsonl");
  assert.equal(
    scorecardJson.blind_review.pack,
    "reports/output_blind_review_pack.json",
  );
  assert.equal(
    scorecardJson.artifacts.json,
    "reports/output_quality_scorecard.json",
  );
  assert.ok(
    Object.values(scorecardJson.artifacts).every((value) =>
      value.startsWith("reports/"),
    ),
    "scorecard artifact paths must remain package-relative",
  );
});

test("shared root and nested code_map templates remain byte-identical", () => {
  const target = read("references", "templates.md");
  const sibling = fs.readFileSync(siblingTemplates, "utf8");
  assert.equal(
    extractSharedBlock(target, "Root"),
    extractSharedBlock(sibling, "Root"),
  );
  assert.equal(
    extractSharedBlock(target, "Nested"),
    extractSharedBlock(sibling, "Nested"),
  );
});
