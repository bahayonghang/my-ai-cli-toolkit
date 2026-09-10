import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const normalizeNewlines = (text) => text.replace(/\r\n/g, "\n");
const read = (...parts) => normalizeNewlines(fs.readFileSync(path.join(skillDir, ...parts), "utf8"));
const json = (...parts) => JSON.parse(read(...parts));
const outputCases = () => read("evals", "output", "cases.jsonl").trim().split(/\r?\n/).map(JSON.parse);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function sharedBlock(text, kind) {
  const heading = new RegExp("^## " + kind + " .*code_map\\.md.*Template\\s*$", "m");
  const match = text.match(heading);
  assert.ok(match, kind + " template heading missing");
  const tail = text.slice(match.index + match[0].length);
  const start = tail.indexOf("```markdown");
  assert.notEqual(start, -1);
  const bodyStart = start + "```markdown".length;
  const end = tail.indexOf("```", bodyStart);
  assert.notEqual(end, -1);
  return tail.slice(bodyStart, end);
}

test("single renamed identity and compact inline entrypoint", () => {
  const manifest = json("manifest.json");
  const skill = read("SKILL.md");
  const iface = read("agents", "interface.yaml");
  assert.equal(path.basename(skillDir), manifest.name);
  assert.equal(manifest.name, "codex-context-improver");
  assert.match(skill, new RegExp("^name: " + manifest.name + "$", "m"));
  assert.match(skill, new RegExp("^version: " + manifest.version.replaceAll(".", "\\.") + "$", "m"));
  assert.ok(iface.includes("$" + manifest.name));
  assert.equal(manifest.version, "2.0.0");
  assert.equal(manifest.owner, "lyh");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.maturity_tier, "production");
  assert.deepEqual(walk(skillDir).filter(p => path.basename(p) === "SKILL.md"), [path.join(skillDir, "SKILL.md")]);
  assert.ok(!fs.existsSync(path.join(skillDir, "..", "agents-md-improver")));
  const estimate = [skill, iface].reduce((sum, s) => sum + Math.floor(s.length / 4), 0);
  assert.ok(estimate <= 1000, "initial context estimate " + estimate);
  assert.doesNotMatch(skill, /Bash\(git \*\)|Bash\(find \*\)/);
});

test("discovery keeps source roots, effective config and scope distinctions", () => {
  const discovery = read("references", "codex-agents-discovery.md");
  for (const anchor of ["AGENTS.override.md", "project_doc_fallback_filenames", "project_doc_max_bytes", "root-to-CWD", "non-empty", "missing evidence", ".agents/skills", ".codex/agents"]) {
    assert.ok(discovery.includes(anchor), anchor);
  }
  assert.match(discovery, /https:\/\/learn\.chatgpt\.com\/docs\/agent-configuration\/agents-md/);
  assert.doesNotMatch(discovery, /\.codex\/skills/);
  const fixture = read("evals", "output", "fixtures", "context-scenarios.md");
  for (const anchor of ["32768", "14000", "10000", "12000", "Scenario N", "effective config"]) {
    assert.ok(fixture.includes(anchor), "discovery regression input missing " + anchor);
  }
});

test("main behavior oracle and output inputs have complete distinct coverage", () => {
  const main = json("evals", "evals.json");
  assert.equal(main.skill_name, json("manifest.json").name);
  const ids = new Set(main.evals.map(c => c.id));
  assert.equal(ids.size, main.evals.length);
  for (const c of main.evals) {
    assert.ok(c.prompt && c.expected_output && c.assertions.length >= 2);
    for (const file of c.files) assert.ok(fs.existsSync(path.resolve(skillDir, "evals", file)));
  }
  const cases = outputCases();
  assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
  assert.deepEqual(new Set(cases.flatMap(c => c.eval_ids)), ids);
  for (const c of cases) {
    assert.equal(c.execution.mode, "scenario_input");
    assert.equal(c.human_review.status, "pending");
    assert.ok(!("with_skill_output" in c), "input cannot masquerade as a generated output");
    assert.ok(c.assertions.length >= 2);
    for (const file of c.input_files) assert.ok(fs.existsSync(path.resolve(skillDir, "evals/output", file)));
  }
  for (const id of ["effective-instruction-chain", "navigation-only-subtree", "discovered-not-loaded", "loaded-prompt-conflict", "planning-only-approval", "existing-edit-authority", "real-approval-boundary", "reading-and-test-scope", "subagents-unavailable", "skill-identity-uncertainty", "unknown-config", "preserve-verified-constraints"]) {
    assert.ok(cases.some(c => c.id === id), "lost behavioral boundary " + id);
  }
});

test("trigger smoke projects real main prompts and current generated results", () => {
  const main = json("evals", "evals.json");
  const trigger = json("evals", "trigger_cases.json");
  const report = json("reports", "trigger-eval.json");
  assert.equal(trigger.skill_name, main.skill_name);
  assert.ok(trigger.positive_concepts.codex_context);
  assert.ok(!trigger.positive_concepts.authoring_action);
  let count = 0;
  for (const bucket of ["should_trigger", "should_not_trigger", "near_neighbor"]) {
    assert.ok(trigger[bucket].length > 0);
    assert.equal(report.results[bucket].length, trigger[bucket].length);
    trigger[bucket].forEach((c, i) => {
      const original = main.evals.find(e => e.id === c.id);
      assert.ok(original);
      assert.equal(c.text, original.prompt, "smoke prompt drift");
      assert.equal(c.family, "eval-" + c.id);
      assert.equal(report.results[bucket][i].prompt, c.text, "stale generated report");
      assert.equal(report.results[bucket][i].family, c.family);
      assert.equal(report.results[bucket][i].passed, true);
    });
    count += trigger[bucket].length;
  }
  assert.equal(report.ok, true);
  assert.equal(report.summary.total, count);
  assert.equal(report.summary.passed, count);
});

test("current IR and evidence replace obsolete score reports", () => {
  const manifest = json("manifest.json");
  const ir = json("reports", "skill-ir.json");
  assert.equal(ir.package.name, manifest.name);
  assert.equal(ir.package.version, manifest.version);
  assert.ok(ir.workflow.compact_workflow.length >= 5);
  for (const report of ["prior-art-research.md", "creation-handoff.md", "output-review.md"]) {
    const text = read("reports", report);
    assert.ok(text.includes("missing evidence"));
  }
  const review = read("reports", "output-review.md");
  assert.ok(review.includes(manifest.name + " " + manifest.version));
  assert.ok(normalizeNewlines("## effective-instruction-chain\r\n").includes("## effective-instruction-chain\n"));
  for (const c of outputCases()) assert.ok(review.includes("## " + c.id + "\n"), "missing output review: " + c.id);
  const retired = /^(output_quality_scorecard|output_blind_|output-risk-profile|artifact-design-profile|prompt-quality-profile)/;
  assert.ok(!fs.readdirSync(path.join(skillDir, "reports")).some(name => retired.test(name)));
  for (const file of manifest.contracts.input_files.paths) assert.ok(fs.existsSync(path.join(skillDir, file)));
});

test("local reference links resolve and report keeps conditional evidence", () => {
  const files = [path.join(skillDir, "SKILL.md"), ...walk(path.join(skillDir, "references")).filter(p => p.endsWith(".md"))];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/\]\(([^)#]+\.md)(?:#[^)]*)?\)/g)) {
      if (/^https?:/.test(match[1]) || match[1].includes("<")) continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(file), match[1])), file + ": " + match[1]);
    }
  }
  const report = read("references", "report-format.md");
  assert.match(report, /````markdown[\s\S]*?```diff[\s\S]*?````/);
  for (const anchor of ["Relevant Context Sources", "Effective Instruction Chain", "Shadowed Candidates", "AGENTS decision", "code_map decision", "passed", "failed", "skipped", "missing evidence"]) {
    assert.ok(report.includes(anchor), anchor);
  }
});

test("shared root and nested map fences remain identical", () => {
  const sibling = normalizeNewlines(fs.readFileSync(path.resolve(skillDir, "../claude-context-improver/references/templates.md"), "utf8"));
  const target = read("references", "templates.md");
  for (const kind of ["Root", "Nested"]) assert.equal(sharedBlock(target, kind), sharedBlock(sibling, kind));
});
