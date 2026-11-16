# paper-workbench: 文档目录去重 references 与 resources

- Date: 2026-06-20
- Status: Planning
- Parent: `.trellis/tasks/06-20-rlk-skills-optimization`
- 覆盖发现: F8（P2）

## Goal

消除 `paper-workbench` 下 `references/` 与 `resources/` 两个平行文档目录造成的结构混乱：
模板文件重复、`resources/` 被模式文件引用却未在 SKILL.md 声明。收敛到单一、被显式声明的
文档组织方式。

## Confirmed Facts

- 并存的两套文档目录：
  - `references/`：`routing.md`、`schema.md`、`artifacts.md`、`migration.md`、`template.org`、`modes/*.md`（9 个）。
  - `resources/`：`ANALYSIS_FRAMEWORK.md`、`TEMPLATE.org`。
- 模板疑似重复：`references/template.org`（43 行）与 `resources/TEMPLATE.org`（61 行）并存；
  需逐字比对确认是否同源/可合并（初次 `diff` 结果与行数统计不一致，须以实际比对为准）。
- 引用不一致：
  - `references/modes/xray.md:25` 引用 `resources/ANALYSIS_FRAMEWORK.md`。
  - `SKILL.md` 的 "References" 小节（`:185-198`）只列 `references/*`，**从未提及 `resources/`**。
- `SKILL.md` 内对脚本/模板的路径引用需与 `06-20-pw-skilldir-fix` 的 `<skill-dir>` 改动保持一致（避免冲突）。

## Requirements

1. 逐字比对 `references/template.org` 与 `resources/TEMPLATE.org`：
   - 若内容等价 → 保留一份，删另一份，更新所有引用；
   - 若有实质差异 → 明确各自用途，要么合并、要么重命名以消除歧义。
2. 将 `resources/` 收敛进统一文档结构（建议并入 `references/`，与该 skill 既有的 references 分层一致），
   或在 SKILL.md 显式声明 `resources/` 的存在与用途。
3. 更新所有内部引用（至少 `references/modes/xray.md:25`）指向收敛后的真实路径。
4. 在 `SKILL.md` "References" 清单中补全收敛后仍存在的全部文档文件，使声明与磁盘一致。
5. 不改 skill 行为与模式逻辑，仅做文档结构整理与引用修正。

## Acceptance Criteria

- [ ] `paper-workbench` 下不再有内容重复的 `template.org` / `TEMPLATE.org` 两份模板。
- [ ] `rg -n "resources/" skills/research-learning-knowledge/paper-workbench` 的每个引用都指向真实存在的文件。
- [ ] SKILL.md "References" 清单与实际文档文件一一对应，无遗漏、无悬空。
- [ ] `python scripts/check.py skills/research-learning-knowledge/paper-workbench` 仍 `[OK]`。
- [ ] 该 skill 的模式行为与输出契约无改动。

## Out Of Scope

- F1/F3（`$SKILL_DIR`、paper2code）——属 `06-20-pw-skilldir-fix`，本任务仅做文档目录整理。
- 改写模板/框架文档的实质内容（仅去重与修引用，不重写）。

## 依赖与顺序

- 与 `06-20-pw-skilldir-fix` 都会动 `paper-workbench/SKILL.md`：建议在 `pw-skilldir-fix`
  之后进行，或实现时先 rebase 其改动，避免对同一文件的冲突编辑。
