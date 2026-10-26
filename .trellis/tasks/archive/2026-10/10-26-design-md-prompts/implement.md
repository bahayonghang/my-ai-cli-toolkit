# 执行计划

Phase 2 只写本任务的研究文件，并回填 `design.md` 的「最终推荐」。不修改 `skills/development-workflows/design-md/`。

## 清单

1. 读 `.trellis/spec/guides/skill-authoring-conventions.md` 里与本任务有关的合同：frontmatter 1024 字、`agents/interface.yaml`、禁止嵌套 `SKILL.md`、first-party 目录重建、两套 eval、Windows 上的先例检索。
2. 读 `qiaomu-meta-skill` 的 `references/skill-engineering-method.md` 和 `references/resource-boundaries.md`。按 keep / adapt / reject / invent 归类，不另调 `skill-creator`。
3. 通读三份来源和技能现状：
   - `ref/design/instruct.md`
   - `ref/repo/ai-design-skills/README.md`
   - `ref/repo/ai-design-skills/LICENSE`
   - `ref/repo/ai-design-skills/skills/landing-page-design/SKILL.md`
   - `ref/repo/ai-design-skills/skills/design-to-motion/SKILL.md`（39622 字节，上下文注入在 32768 字节处截断，必须直接读文件）
   - `skills/development-workflows/design-md/SKILL.md`
   - `skills/development-workflows/design-md/agents/interface.yaml`
   - `skills/development-workflows/design-md/references/implementation.md`
   - `skills/development-workflows/design-md/references/design-system-core.md`
   - `skills/development-workflows/design-md/references/brand-boundary.md`
4. 写 `research/intent.md`。四句能力句：合并后的技能、默认工程规范、landing page、motion。
5. 写 `research/keep-adapt-reject.md`。三张表。采纳项写目标文件。重复的状态、对比度和 reduced-motion 规则标成 adapt 到现有 reference，不另起一套。
6. 写 `research/conflict-map.md`。逐项对应 PRD Requirements 3。每一项给出推荐方案下的胜出层。
7. 写 `research/license.md`。核对 LICENSE 原文。列出必须留下的署名。说明 `instruct.md` 按自有材料改编。
8. 可选：在 Git Bash 运行 `npx --yes skills find`，查询落地页设计和界面动效的近邻技能。失败或超时记 missing evidence。不把检索结果里的新技能加进采纳范围。不修改 `qiaomu-meta-skill`。
9. 写 `research/trigger-cases.json`。分组为应触发、不应触发、近邻。中文短语与拟写入 description 的词一致。文件留在任务目录。
10. 回填 `design.md`「最终推荐」。若推翻「不新增 scene 条目」或「导出流水线不进入常驻流程」，写明证据。
11. 对照 PRD 验收清单自检。确认技能包无 diff。

## 验证

```powershell
python ./.trellis/scripts/task.py validate .trellis/tasks/10-26-design-md-prompts
git diff -- skills/development-workflows/design-md
```

`git diff` 应无输出。`validate` 对超长来源文件可以给出体积警告，警告不视为失败。不运行 `just ci` 或 `just docs-sync`。

研究文件使用 UTF-8 和 LF。

## 风险文件

- `skills/development-workflows/design-md/**`：本任务的禁止写入区。
- `ref/**`：只读。gitignore 覆盖，不能当安装后的运行时来源。
- `assets/catalog/first-party/manifest.json`：本任务不改。误加条目会在下次 `build_catalog.py` 时复制到 `scenes/`。
- description：当前 832 字，上限 1024。最终推荐要附上拟用触发词和剩余字数。

## 开始前

`task.py start` 要等用户确认本规划摘要之后再执行。开始前 `implement.jsonl` 与 `check.jsonl` 已指向下面的规范和研究材料。
