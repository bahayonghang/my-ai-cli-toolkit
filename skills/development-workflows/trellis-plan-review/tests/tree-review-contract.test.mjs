import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(skillRoot, relative), "utf8");
}

test("root and interface lock one recursive scope to one root report and one handoff", () => {
  const skill = read("SKILL.md");
  const interfaceYaml = read(path.join("agents", "interface.yaml"));

  assert.match(skill, /^version: 0\.5\.0$/m);
  assert.match(skill, /--include-descendants/);
  assert.match(skill, /exactly one combined report and one handoff Prompt/i);
  assert.match(skill, /\.trellis\/reviews\/<root-task-name>\.md/);
  assert.match(skill, /Never\s+create a report or Prompt per child/i);
  assert.match(interfaceYaml, /one selected Trellis task scope/i);
  assert.match(interfaceYaml, /write_review_report\.py exactly once/i);
  assert.match(interfaceYaml, /exactly one text-fenced scope-wide handoff prompt/i);
  assert.match(interfaceYaml, /do not create child reports or touch historical ones/i);
});

test("report and handoff templates carry task-qualified whole-scope fields", () => {
  const report = read(path.join("references", "report-template.md"));
  const handoff = read(path.join("references", "handoff-prompt.md"));

  for (const field of [
    "version: 0.5.0",
    "review_scope:",
    "task_count:",
    "task_members:",
    "task_statuses:",
    "Affected tasks:",
  ]) {
    assert.ok(report.includes(field), `report template missing ${field}`);
  }
  for (const placeholder of [
    "{{root_task_name}}",
    "{{review_scope}}",
    "{{task_count}}",
    "{{task_members}}",
    "{{task_statuses}}",
  ]) {
    assert.ok(handoff.includes(placeholder), `handoff missing ${placeholder}`);
  }
  assert.match(handoff, /Affected tasks.*Location/s);
  assert.match(handoff, /do not generate another report or handoff Prompt per child/i);
});

test("behavior fixture makes single-output and cross-task deduplication material", () => {
  const evals = JSON.parse(read(path.join("evals", "evals.json")));
  assert.deepEqual(evals.evals.map(({ id }) => id), Array.from({ length: 12 }, (_, index) => index + 1));
  const treeCase = evals.evals.find((item) => item.id === 10);
  const contract = [treeCase.expected_output, ...treeCase.assertions].join("\n");

  assert.match(treeCase.prompt, /父任务.*所有子任务/s);
  assert.match(contract, /one aggregate precheck result/i);
  assert.match(contract, /only \.trellis\/reviews\/08-26-intellectual-property-materials\.md/i);
  assert.match(contract, /exactly one text fence/i);
  assert.match(contract, /one cross-task root cause into one TPR/i);
  assert.match(contract, /Does not create, replace, delete, or migrate a report named after either child/i);
  assert.match(contract, /no per-child prompts/i);
});

test("handoff requires structured confirmation gate and still forbids start", () => {
  const skill = read("SKILL.md");
  const handoff = read(path.join("references", "handoff-prompt.md"));
  const gate = read(path.join("references", "revision-question-gate.md"));
  const evals = JSON.parse(read(path.join("evals", "evals.json")));

  assert.match(skill, /^version: 0\.5\.0$/m);
  assert.match(skill, /revision-question-gate/);
  assert.match(skill, /still does not ask, edit planning artifacts, or start the task/);
  assert.doesNotMatch(skill, /AskUserQuestion/);
  assert.doesNotMatch(skill, /allowed-tools:.*AskUserQuestion/);

  assert.match(gate, /AskUserQuestion/);
  assert.match(gate, /Dump-and-wait is forbidden/);
  assert.match(gate, /at most four questions/i);

  assert.match(handoff, /AskUserQuestion/);
  assert.match(handoff, /一次收口/);
  assert.match(handoff, /禁止把确认清单只写进聊天并等待用户提醒/);
  assert.match(handoff, /do not dump a confirmation list and wait/i);
  assert.match(handoff, /同一轮写入/);
  assert.match(handoff, /write the decided clauses in the same turn/i);
  assert.match(handoff, /仓库可回答事实/);
  assert.match(handoff, /普通实现细节/);
  assert.match(handoff, /repository-answerable facts/);
  assert.match(handoff, /ordinary implementation details/);
  assert.match(handoff, /后续实施请求/);
  assert.match(handoff, /later implementation request/);
  assert.match(handoff, /不要运行 task\.py start/);
  assert.match(handoff, /Do not run task\.py start/);
  assert.doesNotMatch(handoff, /批准规划并开工/);

  const screenshot = evals.evals.find((item) => item.id === 11);
  const neighbor = evals.evals.find((item) => item.id === 12);
  const screenshotContract = [screenshot.expected_output, ...screenshot.assertions].join("\n");
  const neighborContract = [neighbor.expected_output, ...neighbor.assertions].join("\n");
  assert.match(screenshot.prompt, /AskUserQuestion/i);
  assert.match(screenshotContract, /AskUserQuestion/);
  assert.match(screenshotContract, /not dump a confirmation list/i);
  assert.match(screenshotContract, /does not run task\.py start/i);
  assert.match(neighbor.prompt, /AskUserQuestion/);
  assert.match(neighborContract, /does not own|does not trigger|not a planning-artifact review/i);
});
