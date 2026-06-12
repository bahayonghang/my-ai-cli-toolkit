import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
