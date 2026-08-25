import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const skillRoot = path.resolve('skills/developer-tools-integrations/goal-meta-skill');
const linter = path.join(skillRoot, 'scripts', 'lint_goal_command.py');

function runPython(args) {
  const python = process.env.PYTHON ?? 'python';
  const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
  const result = spawnSync(python, args, { encoding: 'utf8', env });
  if (result.error && python === 'python' && process.platform === 'win32') {
    return spawnSync('py', ['-3', ...args], { encoding: 'utf8', env });
  }
  return result;
}

function lintText(text, extraArgs = []) {
  const dir = mkdtempSync(path.join(tmpdir(), 'goal-meta-lint-'));
  const file = path.join(dir, 'goal.txt');
  writeFileSync(file, text, 'utf8');
  try {
    return runPython([linter, ...extraArgs, file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const validChineseCompanion = `
推荐执行版（中文，可直接复制）
/goal 为现有仪表盘修复筛选状态丢失问题，先读取项目脚本和相关状态管理代码，再实现最小修复并保持无关功能不变。
验证：运行项目提供的最小相关测试和类型检查，打开本地页面完整执行一次筛选、刷新、返回流程，并保存命令输出或截图作为证据。
约束：不改变公开路由、筛选字段含义、现有数据源、鉴权流程或无关文案。
边界：只修改筛选状态、URL 同步、直接相关组件和回归测试，不触碰后端接口或部署配置。
迭代策略：一次做一个聚焦改动，每次改动后重跑失败检查，连续失败两次后先读日志和现有测试再换方案。
完成条件：回归测试通过，本地页面证明筛选状态不再丢失，相关检查通过或明确说明缺少配置。
暂停条件：需要生产数据、账号凭证、接口契约变更、破坏性迁移或产品规则决策时暂停。

默认选择理由：先修复最小状态同步切片，因为它能最快证明问题消失，同时避免扩大到无关筛选重构。

可选调整
1. 范围：A 只修当前筛选（默认） / B 顺手整理全部筛选 / C 先写诊断报告
2. 验证：A 本地测试和页面复现（默认） / B 加端到端测试 / C 只做代码审查

你可以直接回复：按默认，或回复类似 1A 2B。

Goal Draft (English-compatible)
/goal Fix the dashboard filter state loss in the existing app by first inspecting project scripts and related state-management code, then applying the smallest focused fix while leaving unrelated behavior unchanged.
Verification: run the smallest relevant tests and typecheck exposed by the project, open the local page, complete the filter-refresh-back workflow once, and keep command output or screenshots as evidence.
Constraints: do not change public routes, filter field semantics, existing data sources, auth flow, or unrelated copy.
Boundaries: edit only filter state, URL synchronization, directly related components, and regression tests; do not touch backend APIs or deployment config.
Iteration policy: make one focused change at a time, rerun the failing check after each change, and inspect logs and existing tests before changing strategy after two repeated failures.
Stop when: the regression test passes, the local page proves filter state no longer disappears, and relevant checks pass or missing configuration is reported.
Pause if: production data, credentials, API contract changes, destructive migrations, or product-rule decisions are required.
`;

const baseGoalOnly = `
/goal 为现有仪表盘修复筛选状态丢失问题，先读取项目脚本和相关状态管理代码，再实现最小修复并保持无关功能不变。
验证：运行项目提供的最小相关测试和类型检查，打开本地页面完整执行一次筛选、刷新、返回流程，并保存命令输出或截图作为证据。
约束：不改变公开路由、筛选字段含义、现有数据源、鉴权流程或无关文案。
边界：只修改筛选状态、URL 同步、直接相关组件和回归测试，不触碰后端接口或部署配置。
迭代策略：一次做一个聚焦改动，每次改动后重跑失败检查，连续失败两次后先读日志和现有测试再换方案。
完成条件：回归测试通过，本地页面证明筛选状态不再丢失，相关检查通过或明确说明缺少配置。
暂停条件：需要生产数据、账号凭证、接口契约变更、破坏性迁移或产品规则决策时暂停。
`;

test('valid Chinese companion output passes strict contract lint', () => {
  const result = lintText(validChineseCompanion, ['--require-chinese-companion']);
  assert.equal(result.status, 0, result.stderr);
});

test('base goal can pass normal lint without companion sections', () => {
  const result = lintText(baseGoalOnly);
  assert.equal(result.status, 0, result.stderr);
});

test('strict contract rejects valid base goal missing Chinese companion sections', () => {
  const result = lintText(baseGoalOnly, ['--require-chinese-companion']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing Chinese-first companion section `推荐执行版/);
  assert.match(result.stderr, /Goal Draft \(English-compatible\)/);
});

test('linter rejects non-executable Chinese slash command alias', () => {
  const result = lintText(baseGoalOnly.replace('/goal', '/目标'));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /use `\/goal`, not `\/目标`/);
});

test('linter rejects unresolved placeholders and vague verification', () => {
  const output = `
/goal [Outcome]
Verification: make sure it works
Constraints: keep public API stable and leave unrelated behavior unchanged.
Boundaries: edit only directly related source files and tests.
Iteration policy: make one focused change and rerun checks after each update.
Stop when: tests pass and command output proves the requested behavior.
Pause if: credentials, production data, destructive changes, or product decisions are required.
`;
  const result = lintText(output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unresolved placeholder/);
  assert.match(result.stderr, /dangerous vague instruction/);
});

const claudeConditionGoal = `
/goal 现有仪表盘的筛选状态丢失问题被修复：回归测试通过，本地页面完整执行一次筛选、刷新、返回流程后筛选状态保留，否则在 20 轮后停止并总结剩余问题。
验证：运行项目提供的最小相关测试和类型检查并展示命令退出码，执行 git status 确认只有相关文件改动，把测试输出粘贴到对话中作为证据。
约束：不改变公开路由、筛选字段含义、现有数据源、鉴权流程或无关文案。
边界：只修改筛选状态、URL 同步、直接相关组件和回归测试，不触碰后端接口或部署配置。
迭代策略：一次做一个聚焦改动，每次改动后重跑失败检查，连续失败两次后先读日志和现有测试再换方案。
完成条件：回归测试通过且命令输出出现在对话记录中，相关检查通过或明确说明缺少配置。
暂停条件：需要生产数据、账号凭证、接口契约变更、破坏性迁移或产品规则决策时，停止并报告，等待人工决定。
`;

test('claude platform accepts condition-style goal with bounding clause', () => {
  const result = lintText(claudeConditionGoal, ['--platform', 'claude']);
  assert.equal(result.status, 0, result.stderr);
});

test('claude platform rejects /goal pause advice', () => {
  const withPause = `${claudeConditionGoal}\n如需暂停，可以使用 /goal pause 再用 /goal resume 恢复。\n`;
  const result = lintText(withPause, ['--platform', 'claude']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Claude Code has no pause\/resume/);
});

test('claude platform rejects goal without a turn or time bounding clause', () => {
  const result = lintText(baseGoalOnly, ['--platform', 'claude']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /bounding clause/);
});

test('codex platform keeps base behavior for goals without bounding clause', () => {
  const result = lintText(baseGoalOnly, ['--platform', 'codex']);
  assert.equal(result.status, 0, result.stderr);
});

test('grok and omp use the skill-owned portability limit wording', () => {
  const oversized = baseGoalOnly.replace(
    '/goal 为现有仪表盘修复筛选状态丢失问题，',
    `/goal 为现有仪表盘修复筛选状态丢失问题，${'补充说明。'.repeat(850)}`,
  );
  for (const platform of ['grok', 'omp']) {
    const result = lintText(oversized, ['--platform', platform]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /goal-meta portability limit is 4000/);
    assert.doesNotMatch(result.stderr, /Grok|Oh My Pi.*official.*cap/i);
  }
});

test('platform-specific management commands cannot be borrowed', () => {
  const cases = [
    ['codex', '/goal drop'],
    ['claude', '/goal pause'],
    ['grok', '/goal next continue-later'],
    ['omp', '/goal clear'],
    ['kimi', '/goal budget 1000'],
  ];
  for (const [platform, command] of cases) {
    const result = lintText(`${baseGoalOnly}\nManagement: ${command}\n`, [
      '--platform',
      platform,
    ]);
    assert.notEqual(result.status, 0, `${platform} accepted ${command}`);
    assert.match(result.stderr, new RegExp(`not valid for ${platform}`, 'i'));
  }
});

test('both remains Codex plus Claude and all five platform values parse', () => {
  for (const platform of ['codex', 'claude', 'grok', 'omp', 'kimi', 'both', 'all']) {
    const text = platform === 'claude' ? claudeConditionGoal : baseGoalOnly;
    const result = lintText(text, ['--platform', platform]);
    assert.equal(result.status, 0, `${platform}: ${result.stderr}`);
  }
});

test('linter rejects /goal blocks beyond the 4,000 character platform limit', () => {
  const oversized = baseGoalOnly.replace(
    '/goal 为现有仪表盘修复筛选状态丢失问题，',
    `/goal 为现有仪表盘修复筛选状态丢失问题，${'补充说明。'.repeat(850)}`,
  );
  const result = lintText(oversized);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cap objectives\/conditions at 4000/);
});

test('unanchored completion quantifiers produce a warning without failing', () => {
  const output = baseGoalOnly.replace(
    /完成条件：.*\n/,
    '完成条件：清理所有问题并确保全部内容完成。\n',
  );
  const result = lintText(output);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /warning: .*broad completion quantifier lacks/);
});

test('authoritative test suite anchor avoids the broad-quantifier warning', () => {
  const output = baseGoalOnly.replace(
    /完成条件：.*\n/,
    '完成条件：1. test\/auth 中所有测试的命令退出码为 0。\n',
  );
  const result = lintText(output);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /broad completion quantifier lacks/);
  assert.doesNotMatch(result.stderr, /completion conditions are easier to verify/);
});

test('unnumbered completion conditions produce a recommendation warning', () => {
  const result = lintText(baseGoalOnly);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /completion conditions are easier to verify when numbered/);
});

test('linter rejects claims that goal text configures runtime budget', () => {
  const output = `${baseGoalOnly}\n说明：Goal text configures the runtime token budget to 8000 tokens.\n`;
  const result = lintText(output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /goal text cannot set or enforce a platform runtime budget/);
});

test('linter accepts an explicit soft-stop budget disclaimer', () => {
  const output = `${baseGoalOnly}\n说明：Goal text does not configure the platform runtime budget; treat 20 turns only as a soft stop clause.\n`;
  const result = lintText(output);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /goal text cannot set or enforce a platform runtime budget/);
});

test('skill allowed-tools stay exact and narrow while the named helper owns the governed write', () => {
  const skillText = readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const allowedTools = skillText.match(/^allowed-tools:\s*(.+)$/m)?.[1];
  assert.equal(
    allowedTools,
    'Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)',
  );
  assert.doesNotMatch(allowedTools, /\bWrite\b|Bash\(git \*\)|Bash\(codex \*\)/);
  assert.doesNotMatch(
    allowedTools,
    /git\s+(?:add|commit|push|pull|checkout|reset|clean|restore|switch|merge|rebase|stash|tag)\b/,
  );

  const body = skillText.replace(/^---[\s\S]*?---\s*/m, '');
  const gitCommands = [...body.matchAll(/`(git\s+[^`]+)`/g)].map((match) => match[1]);
  assert.ok(gitCommands.length > 0, 'expected documented read-only git commands');
  for (const command of gitCommands) {
    assert.match(command, /^git\s+(?:status|branch|rev-parse)\b/);
  }
  assert.doesNotMatch(body, /`codex\s+[^`]+`/);
  assert.match(body, /persist_goal_contract\.py/);
  assert.match(body, /explicit|明确/i);
});

test('package metadata, platform registry, and behavior eval history stay synchronized', () => {
  const skillText = readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  assert.match(skillText, /^version:\s*0\.6\.0$/m);
  for (const platform of ['Claude Code', 'Codex', 'Grok Build', 'Oh My Pi', 'Kimi Code']) {
    assert.match(skillText, new RegExp(platform));
  }

  const interfaceText = readFileSync(path.join(skillRoot, 'agents', 'interface.yaml'), 'utf8');
  for (const adapter of ['openai', 'claude', 'grok-build', 'oh-my-pi', 'kimi-code']) {
    assert.match(interfaceText, new RegExp(`- "${adapter}"`));
  }

  const facts = readFileSync(path.join(skillRoot, 'references', 'platform-goal-facts.md'), 'utf8');
  assert.match(facts, /Last verified: 2026-08-23/);
  for (const heading of ['## Codex', '## Claude Code', '## Grok Build', '## Oh My Pi', '## Kimi Code']) {
    assert.match(facts, new RegExp(`^${heading}`, 'm'));
  }
  assert.match(facts, /07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/);
  assert.match(facts, /160ed439ac0df594347e7d7018b813a7ffdb5e81/);
  assert.match(facts, /368b4b7400228028006c9b0d5789fcced85f75aa/);

  const cadence = readFileSync(
    path.join(skillRoot, 'references', 'trellis-goal-cadence.md'),
    'utf8',
  );
  assert.match(cadence, /Last verified: 2026-08-25/);
  const dispatchSection = cadence.split('## Sub-agent dispatch')[1]?.split('## Commit then archive')[0] ?? '';
  const tableRows = (dispatchSection.match(/^\|.*\|$/gm) ?? []).filter(
    (row) => !/^\|\s*-+/.test(row) && !/^\|\s*Platform\s*\|/i.test(row),
  );
  assert.equal(tableRows.length, 5);
  for (const platform of ['Claude Code', 'Codex', 'Oh My Pi', 'Grok Build', 'Kimi Code']) {
    assert.ok(tableRows.some((row) => row.includes(platform)), platform);
  }
  assert.doesNotMatch(tableRows.join('\n'), /official/i);
  assert.match(cadence, /trellis-implement/);

  const evals = JSON.parse(
    readFileSync(path.join(skillRoot, 'evals', 'evals.json'), 'utf8'),
  ).evals;
  assert.deepEqual(evals.map(({ id }) => id), Array.from({ length: 35 }, (_, i) => i + 1));
  for (const fixture of evals) {
    assert.ok(Array.isArray(fixture.assertions) && fixture.assertions.length > 0);
    assert.equal('expectations' in fixture, false);
  }
});

const contractLauncher =
  '/goal First read and follow ./GOAL.md as the approved execution contract. Restate its objective, constraints, verification, completion, and pause conditions before editing; then work until every completion gate is evidenced or a pause condition is reached.';

function validContract({
  iteration = 'Make one focused change, rerun the smallest failing check, inspect new evidence before retrying, and stop after three evidence-driven repair rounds.',
  completion = '1. The blank-row regression test passes.\n2. just test-parser exits zero and the current diff remains inside the approved boundary.',
  reading = '- Read AGENTS.md, src/parser/, tests/parser/, and the project command source before editing.',
} = {}) {
  return `# Goal Contract: Parser recovery

## Contract metadata
- Status: approved
- Target platform: codex
- Generated by: goal-meta-skill 0.6.0
- Project root: .
- Contract path: GOAL.md
- Baseline: main @ 0123456789abcdef0123456789abcdef01234567; dirty paths: clean
- Generated at: 2026-08-23T12:00:00+08:00

## Authority and startup
Follow system and user instructions, scoped AGENTS.md or CLAUDE.md rules, and authoritative project or Trellis task specifications before this contract. Recheck the baseline and stop to report any drift or conflict before risky edits.

## Objective
Repair the parser so blank CSV rows no longer crash the local command while preserving current output for nonblank rows.

## Required reading and current context
${reading}
- The current failure is local and contains no credential or private-data context.

## Scope and boundaries
- Write only under src/parser/ and tests/parser/; preserve unrelated dirty files and generated output.

## Constraints
- Add no dependency, remote action, production mutation, destructive operation, credential, or paid service.

## Verification
- VERIFIED baseline command: run just test-parser and retain its exit code and output.
- UNVERIFIED runtime evidence: exercise one blank-row input after implementation and report the result.

## Iteration policy
${iteration}

## Completion conditions
${completion}

## Pause / stop conditions
Pause or stop and report when authority conflicts, baseline drift, credentials, production data, destructive actions, or a fourth failed repair round is reached; budget exhaustion is not completion.

## Launch commands
- Codex: \`${contractLauncher}\`
`;
}

const trellisTask = '.trellis/tasks/08-23-parser';
const trellisReading = `- Read AGENTS.md, ${trellisTask}/prd.md, ${trellisTask}/design.md, ${trellisTask}/implement.md, and applicable specs before editing.`;
const trellisIteration = `Make one focused change, rerun the smallest failing check, then commit only this task's product changes before running python ./.trellis/scripts/task.py archive ${trellisTask}.`;
const trellisCompletion = `1. The blank-row regression test passes.
2. just test-parser exits zero and the current diff remains inside the approved boundary.
3. The task is archived only after its product commit; any parent waits for the named release gate.`;

const trellisInlineMissingDispatch = `
/goal 实施 Trellis 子任务 .trellis/tasks/08-22-checkout-discount：先读该任务 prd.md、design.md 与根 AGENTS.md，按任务边界修复结账百分比优惠重复应用，每完成一个可独立验收的任务先提交该任务相关产品改动，再运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount。
验证：运行 just test-checkout 与 just ci，保存退出码和输出；用 git status --porcelain -uall 确认产品提交只含 src/checkout/ 与 tests/checkout/。
约束：不 push、不 amend；禁止 git add -f .trellis/；产品改动不得进入归档提交；不修改 .trellis/scripts/；父任务 .trellis/tasks/08-22-checkout 在发布门 just ci 通过前不归档，以免把未归档子任务的 parent 写成 null。
边界：只修改 src/checkout/、tests/checkout/ 和当前任务直接需要的文件；不改无关脏文件。
迭代策略：一次完成一个可独立验收的 Trellis 任务；用 Conventional Commits 提交该任务相关产品文件；然后运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount；再处理下一个子任务。
完成条件：1. 子任务在产品提交之后已由 python ./.trellis/scripts/task.py archive 归档。2. 发布门 just ci 退出码为 0。3. 父任务在发布门通过前保持未归档。
暂停条件：任务范围外出现脏文件；归档自动提交失败；父任务仍有未归档子任务却被要求归档；出现 git add -f .trellis/ 请求；需要凭证、生产数据或破坏性操作。
`;

test('contract Trellis text missing dispatch is an error', () => {
  const result = lintText(
    validContract({
      reading: trellisReading,
      iteration: trellisIteration,
      completion: trellisCompletion,
    }),
    ['--contract'],
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /trellis-implement/);
  assert.doesNotMatch(result.stderr, /^warning:.*trellis-implement/m);
});

test('contract Trellis text with dispatch passes', () => {
  const result = lintText(
    validContract({
      reading: trellisReading,
      iteration: `Dispatch trellis-implement for code and trellis-check for verification. ${trellisIteration}`,
      completion: trellisCompletion,
    }),
    ['--contract'],
  );
  assert.equal(result.status, 0, result.stderr);
});

test('contract Trellis text in inline mode may omit dispatch', () => {
  const result = lintText(
    validContract({
      reading: trellisReading,
      iteration: `This project uses dispatch_mode: inline. ${trellisIteration}`,
      completion: trellisCompletion,
    }),
    ['--contract'],
  );
  assert.equal(result.status, 0, result.stderr);
});

test('non-Trellis contract may omit dispatch', () => {
  const result = lintText(validContract(), ['--contract']);
  assert.equal(result.status, 0, result.stderr);
});

test('inline Trellis /goal missing dispatch is an error', () => {
  const result = lintText(trellisInlineMissingDispatch);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /trellis-implement/);
  assert.doesNotMatch(result.stderr, /^warning:.*trellis-implement/m);
});

test('inline Trellis /goal with dispatch passes', () => {
  const result = lintText(
    trellisInlineMissingDispatch.replace(
      '迭代策略：一次完成一个可独立验收的 Trellis 任务',
      '迭代策略：先读 .trellis/workflow.md 的 Phase 2.1 / 2.2 确认本项目派发协议与 agent 名；代码实施派发 trellis-implement、验证派发 trellis-check；一次完成一个可独立验收的 Trellis 任务',
    ),
  );
  assert.equal(result.status, 0, result.stderr);
});

test('inline Trellis /goal in inline mode may omit dispatch', () => {
  const result = lintText(
    trellisInlineMissingDispatch.replace(
      '迭代策略：一次完成一个可独立验收的 Trellis 任务',
      '迭代策略：本项目 Codex dispatch_mode 为 inline，按 trellis-before-dev 内联模式实施；一次完成一个可独立验收的 Trellis 任务',
    ),
  );
  assert.equal(result.status, 0, result.stderr);
});

test('non-Trellis inline /goal may omit dispatch', () => {
  const result = lintText(baseGoalOnly);
  assert.equal(result.status, 0, result.stderr);
});
