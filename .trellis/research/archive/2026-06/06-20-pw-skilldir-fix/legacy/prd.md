# paper-workbench: 修复 $SKILL_DIR 运行时 bug 与 paper2code 悬空引用

- Date: 2026-06-20
- Status: Planning
- Parent: `.trellis/tasks/06-20-rlk-skills-optimization`
- 覆盖发现: F1（P0）、F3（P1）

## Goal

修掉 `skills/research-learning-knowledge/paper-workbench/SKILL.md` 里两个 linter 抓不到、
但会影响真实运行与路由的问题：脚本路径用了运行时为空的 `$SKILL_DIR`，以及指向不存在
skill 的悬空引用 `paper2code`。这是本批最高优先级——F1 会让该 skill 的脚本机制直接失效。

## Confirmed Facts

- F1：`SKILL.md:112` / `:139` / `:154` 三处形如
  `python "$SKILL_DIR/scripts/normalize_paper.py"`、`python "$SKILL_DIR/scripts/workbench_io.py" ...`。
- 仓库约定（强证据）：`skills/developer-tools-integrations/AGENTS.md:29`、
  `skills/development-workflows/AGENTS.md:29`、`skills/git-github-collaboration/AGENTS.md:12`
  均明确"不要用裸 `$SKILL_DIR`，运行时未设置会展开成损坏路径"。
- 正确写法是字面占位符 `<skill-dir>`，已有范例：`code-auditor/SKILL.md:77`、
  `archive-planning/SKILL.md:25,34`、`goal-meta-skill/SKILL.md:21,65`，并在用到处附一句
  "Substitute that literal path; it is not an environment variable" 的说明。
- F3：`SKILL.md:38` "Do not use this skill when the primary job is to implement a paper.
  In that case, route to `paper2code`." 全仓库 `find skills -type d -name paper2code` 无结果，
  唯一出现 `paper2code` 的文件就是该 SKILL.md 自身。
- `scripts/`、`tests/`、`evals/` 内的 Python 路径无需改（脚本自定位，仅 SKILL.md 文案需改）。

## Requirements

1. 将 `SKILL.md` 三处 `$SKILL_DIR` 替换为 `<skill-dir>`（保留 `python "<skill-dir>/scripts/..."`
   的引号与参数结构）。
2. 在"Normalize first"小节首次出现脚本路径处，补一句与 code-auditor 一致的说明：
   `<skill-dir>` 是本 skill 加载时声明的基目录，需替换为该字面路径，不是环境变量。
3. 处理 `SKILL.md:38` 的 `paper2code` 悬空引用，二选一（实现时定，见 Open Questions）：
   - (a) 改为通用边界语，如"本 skill 不做论文到代码的实现；如需实现，另行处理"，不点名具体 skill；
   - (b) 若确认仓库有等价实现目标，替换为真实存在的 skill 名。
4. 不改动该 skill 的行为、模式路由或脚本本身，仅修文案正确性。

## Acceptance Criteria

- [ ] `rg -n "\$SKILL_DIR" skills/research-learning-knowledge/paper-workbench` 无匹配。
- [ ] `rg -n "<skill-dir>" skills/research-learning-knowledge/paper-workbench/SKILL.md` 至少 3 处命中，且附有"字面路径，非环境变量"说明。
- [ ] `rg -n "paper2code" skills/research-learning-knowledge` 无匹配。
- [ ] `python scripts/check.py skills/research-learning-knowledge/paper-workbench` 通过（仍 `[OK]`）。
- [ ] 人工/试跑确认：按 SKILL.md 文案替换 `<skill-dir>` 为实际目录后，`normalize_paper.py --help` 可被定位执行。

## Out Of Scope

- F8（references/ vs resources/ 去重）——属 `06-20-pw-doc-dedup`。
- 改 evals 或新增测试——属 `06-20-rlk-conventions`。
- 任何脚本逻辑改动。

## Open Questions

- F3 采用 (a) 还是 (b)？默认倾向 (a) 通用边界语（与 geju 任务"不引用其他 skill"的先例一致），
  除非用户确认存在等价实现 skill。
