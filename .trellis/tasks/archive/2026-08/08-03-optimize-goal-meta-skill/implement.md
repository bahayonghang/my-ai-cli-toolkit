# implement.md — 执行计划

前置(未满足不得 `task.py start`):

- [x] 用户确认 Open Decision 1(README 删除 + 致谢迁移)与 2(无副作用契约)——2026-08-03 已确认。
- [x] `implement.jsonl` / `check.jsonl` 已有真实条目(本次规划已填)。
- [x] 工作区无关 WIP(`.trellis/` 模板改动等)先提交或 stash,
      防 docs-sync/格式化钩子波及(house 陷阱)。

## 步骤(按序,每步含验证)

1. **facts 层修正**(design D5;依据 research 文件)
   - 改 `references/platform-goal-facts.md`:三处修正 + 增补 + `Last verified` 行
     - community-observed 小节。
   - 验证:逐条对照 research 文件;无一处 community 内容写成官方语气。
2. **SKILL.md 重构**(D1/D2/D3/D6)
   - 工作流改为状态机主干(细节下沉 references);frontmatter 更新
     allowed-tools 与 version 0.3.0;正文示例命令不越出授权面;
     无副作用契约明文化;description 若调整则记录前后版本。
   - 验证:`just skills-check` 无 error/warning;正文净增 ≤ ~15 行。
3. **references 四文件更新**(D1/D2/D4/D5/D6)
   - default-goal-strategy:侦察清单+排除规则+降级路径;interview-checklist:
     两阶段协议+闸门;goal-command-playbook:验证锚点规则、read-first/
     checkpoint 模式、预算软条款文案、合同文件两段式模板、`/goal edit` 管理答复。
   - 验证:含 ``` 的示例块外层 4 反引号;交叉引用一致(facts 文件优先)。
4. **linter + 测试**(D7/D3)
   - lint_goal_command.py 新增 3 检查(2 warning + 1 error);
     tests/lint-goal-command.test.mjs 补正反例 + allowed-tools 契约测试。
   - 验证:`just node-test` 全绿;`just python-check` 通过;
     旧 fixture 输出零回退(样例 goal 重跑对比)。
5. **评测双轨**(D8)
   - evals.json 新增 ≥4 条(分阶段输入);`research/trigger_cases.json` +
     `research/semantic_config.json` 编写。
   - 验证:`PYTHONUTF8=1 python "$USERPROFILE/.claude/skills/yao-meta/scripts/trigger_eval.py" --description-file skills/developer-tools-integrations/goal-meta-skill/SKILL.md --cases .trellis/tasks/08-03-optimize-goal-meta-skill/research/trigger_cases.json --semantic-config .trellis/tasks/08-03-optimize-goal-meta-skill/research/semantic_config.json`
     通过(阈值用默认;若调 `--threshold` 记录理由)。
6. **样例自检**(PRD 验收"样例 goal 通过自 lint")
   - 生成 codex/claude 各一份样例终稿存临时文件,跑
     `python "<skill-dir>/scripts/lint_goal_command.py" --platform <p> --require-chinese-companion <file>`;
     退出码 0。
7. **接口与套件同步**(D3)
   - agents/interface.yaml default_prompt 更新;套件 `AGENTS.md`
     allowed-tools 表行同步;README 决策落地(删除则致谢迁入 SKILL.md 尾部)。
   - 验证:表格与 frontmatter 逐词一致;`grep -rn "向阳乔木" <skill-dir>` 非空。
8. **体量门 + 收尾**(D9)
   - yao-meta `resource_boundary_check.py` 跑默认预算;超限则按 house 规则记
     missing evidence 并显式 ceiling 复跑,结论写入任务 notes。
   - `just docs-sync` → `just ci` 全绿;`git status --porcelain -uall` 复核
     无意外文件;单 commit(Conventional Commits,scope `skills`)。

## 执行证据(2026-08-03)

- `PYTHONUTF8=1 just ci`:exit 0;docs catalog 33 skills/73 generated files,
  VitePress build、skills-check、42 个 Python 文件、Node 167 tests
  (165 pass、2 skip、0 fail)与 `git diff --check` 全部通过。
- 聚焦 `node --test <skill-dir>/tests/lint-goal-command.test.mjs`:16/16
  通过,其中既有 10 项零回退;新增 2 个 warning、1 个 budget
  misrepresentation error 与只读 allowed-tools 契约覆盖。
- `evals/evals.json`:14 条,新增分阶段侦察/访谈、快路径、硬闸门与
  warn-and-proceed 用例;该文件是人工审阅 fixture,CI 不执行,不宣称模型证据。
- `trigger_eval.py --description-file ... --cases ... --semantic-config ...`:
  默认阈值 0.48,15/15(6 positive、4 negative、5 near-neighbor),FP/FN=0,
  precision/recall=1.0,无阈值覆盖。
- Codex 与 Claude 临时样例分别以对应的 `--platform codex|claude` 和
  `--require-chinese-companion` 运行:self lint 均 exit 0,输出
  `Goal command lint passed.`,无 warning/error;临时文件已清理。
- `resource_boundary_check.py` 默认 1000-token gate:exit 2,
  initial load 3890 > 1000,按规范记录为 `missing evidence`;
  `--max-initial-tokens 4000`:exit 0、0 warning,SKILL body 3383 tokens。
- facts 逐条与 `research/official-goal-facts-2026-08-03.md` 对照通过;
  `community-observed` 标签无漂移,SKILL.md 相对基线净增 5 行。
- `git status --porcelain -uall`:提交前仅有 16 个预期 tracked 路径与
  9 个 task-local untracked 资产;无 staged/临时残留。无关 `.trellis` WIP
  保存在 `stash@{0}` 且未恢复。

## 评审门

- 步骤 1-3 完成后暂停:输出 facts diff + SKILL.md 工作流 diff 摘要供人审
  (行为契约变更集中于此)。
- 步骤 8 前:AC 清单逐项打勾并附命令输出证据。

## 回滚点

- 全部改动单 commit → `git revert` 整体回退。
- 中途放弃:`git checkout -- skills/developer-tools-integrations/goal-meta-skill docs/`
  (README 删除态属会话前已有状态,回滚时保持原样,不误恢复)。
- research/ 下评测资产随任务归档,不入 skill 目录,无需回滚。
