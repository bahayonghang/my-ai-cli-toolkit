import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(skillDir, ...parts), "utf8");
const readJson = (...parts) => JSON.parse(read(...parts));

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(fullPath);
    return entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

test("entrypoint stays lean and declares only reachable read-only tools", () => {
  const skill = read("SKILL.md").replace(/\r\n/g, "\n");
  assert.ok(Math.floor(skill.length / 4) <= 1000, "SKILL.md exceeds the Production budget");
  assert.match(skill, /Bash\(codex --version\)/);
  assert.match(skill, /Bash\(codex \* --help\)/);
  assert.match(skill, /Bash\(codex mcp list \*\)/);
  assert.match(skill, /Bash\(codex plugin list \*\)/);
  assert.match(skill, /Bash\(git status \*\)/);
  assert.match(skill, /Bash\(rg \*\)/);
  assert.doesNotMatch(skill, /Bash\(codex \*\)|Bash\(git \*\)/);
  assert.doesNotMatch(skill, /Bash\(Get-ChildItem \*\)|Bash\(Get-Content \*\)|Bash\(Select-String \*\)/);
});

test("active guidance uses current skill and native-agent roots", () => {
  const activeFiles = [path.join(skillDir, "SKILL.md"), ...markdownFiles(path.join(skillDir, "references"))];
  const activeText = activeFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(activeText, /(?:~\/)?\.codex\/skills/);
  assert.match(activeText, /\.agents\/skills/);
  assert.match(activeText, /\.codex\/agents/);
  assert.doesNotMatch(activeText, /nickname_candidates/);
});

test("interface and manifest define the Production read-only package", () => {
  const interfaceYaml = read("agents", "interface.yaml");
  for (const fragment of [
    "display_name:",
    "short_description:",
    "default_prompt:",
    'canonical_format: "agent-skills"',
    '- "openai"',
    '- "claude"',
    '- "generic"',
    'context: "inline"',
    'source_tier: "local"',
    'remote_inline_execution: "forbid"',
    "degradation:",
  ]) assert.ok(interfaceYaml.includes(fragment), `missing interface contract: ${fragment}`);

  const manifest = readJson("manifest.json");
  assert.equal(manifest.name, "codex-workflow-recommender");
  assert.equal(manifest.version, "1.1.0");
  assert.equal(manifest.owner, "lyh");
  assert.equal(manifest.review_cadence, "quarterly");
  assert.equal(manifest.maturity_tier, "production");
  assert.equal(manifest.context_budget_tier, "production");
  assert.deepEqual(manifest.target_platforms, ["openai", "claude", "generic"]);
  for (const component of ["agents", "evals", "references", "reports", "tests"])
    assert.ok(manifest.factory_components.includes(component), `missing component: ${component}`);
  assert.equal(manifest.contracts.input_files.classification, "file-backed fixture");
  assert.ok(manifest.contracts["output contract"]);
  assert.ok(manifest.contracts["rollback boundary"]);
});

test("routing and output evals are parseable and cover the approved boundaries", () => {
  const evals = readJson("evals", "evals.json");
  assert.equal(evals.skill_name, "codex-workflow-recommender");
  assert.ok(evals.evals.length >= 9);
  assert.ok(evals.evals.filter((item) => item.expected_output.startsWith("Do not trigger")).length >= 4);

  const cases = read("evals", "output", "cases.jsonl").split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(cases.length, 6);
  assert.ok(cases.every((item) => item.input_files.includes("fixtures/codex-workflow-scenarios.md")));
  assert.ok(cases.every((item) => item.metadata.input_class === "file-backed fixture"));
  assert.equal(cases.filter((item) => item.execution.holdout).length, 2);
  assert.ok(cases.every((item) => item.execution.mode === "recorded_fixture"));
  assert.ok(cases.every((item) => item.human_review.status === "pending"));

  for (const item of cases) {
    for (const assertion of item.assertions) {
      assert.ok(assertion.required.length >= 2, `${item.id}/${assertion.id} needs combined semantic anchors`);
      for (const anchor of assertion.required)
        assert.ok(anchor.trim().split(/\s+/).length <= 4, `${item.id}/${assertion.id} memorizes output wording: ${anchor}`);
    }
    assert.ok(item.assertions.some((assertion) => assertion.forbidden?.length), `${item.id} needs a material forbidden behavior`);
  }
});

test("decision and output contracts preserve no-change, provenance, and approval", () => {
  const skill = read("SKILL.md");
  for (const anchor of [
    "No change recommended",
    "built-in",
    "plugin-provided",
    "available-uninstalled",
    "missing evidence",
    "Observed evidence",
    "Existing capability/provenance",
    "Permission/data risk",
    "Verification",
    "Rollback",
    "Approval Options",
  ]) assert.ok(skill.includes(anchor), `missing decision/output anchor: ${anchor}`);
  assert.match(skill, /do not\s+(?:create|edit|install|remove|configure)/i);
  assert.match(skill, /Technology detection alone/i);
});

test("dated surface map separates products, trust, and provenance", () => {
  const surface = read("references", "codex-surface-map.md");
  assert.match(surface, /Last verified: 2026-07-23/);
  assert.match(surface, /https:\/\/learn\.chatgpt\.com\/docs\/build-skills\.md/);
  for (const anchor of [
    "CLI",
    "IDE",
    "desktop App",
    "ChatGPT web",
    "trusted project",
    "managed",
    "user-config",
    "project-config",
    "plugin-provided",
    "installed-enabled",
    "installed-disabled",
    "available-uninstalled",
    "unsupported",
    "missing evidence",
  ]) assert.ok(surface.includes(anchor), `missing surface anchor: ${anchor}`);
});

test("every routed reference and focused report exists", () => {
  const skill = read("SKILL.md");
  const links = [...skill.matchAll(/\((references\/[^)#]+\.md)\)/g)].map((match) => match[1]);
  assert.equal(links.length, 6);
  for (const link of links)
    assert.ok(fs.existsSync(path.join(skillDir, ...link.split("/"))), `missing reference: ${link}`);
  for (const report of ["output-risk-profile.md", "prompt-quality-profile.md", "output_quality_scorecard.md"])
    assert.ok(fs.existsSync(path.join(skillDir, "reports", report)), `missing report: ${report}`);
});
