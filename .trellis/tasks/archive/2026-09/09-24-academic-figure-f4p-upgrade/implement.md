# Implement：父任务集成计划

父任务不直接实现子任务内容。按 `design.md` 第 2 节的顺序启动子任务，全部子任务
提交后执行下列集成步骤。

## 子任务启动顺序

1. `task.py start .trellis/tasks/09-24-af-defect-fixes`；与之并行可启动
   `09-24-af-figstyle-module`。
2. `af-defect-fixes` 提交后启动 `09-24-af-f4p-port`。
3. `af-figstyle-module` 提交后启动 `09-24-af-recipes-evals`。
4. 每个子任务完成 check、提交、归档后，再进入下一步集成。

## 集成步骤

1. 读取四个子任务的 `prd.md` 与提交记录，列出新增文件与新增路由。
2. 写 `skills/academic-research-tools/academic-figure/README.md`：用途、四个模式、
   展示级分支、安装（`npx skills add` 与 `just install-projects`）、自然语言示例、
   依赖（matplotlib 必需；scipy、seaborn、LaTeX、plotly、kaleido 可选）、输出、
   故障排查、致谢与许可证（figures4papers CC BY-NC 4.0 与其余上游仓库）。
3. 更新 `SKILL.md`：模式表加入展示级分支；Resources 列出 `scripts/figstyle.py`、
   `scripts/figures4papers/`、`references/styles/f4p_*.md`、
   `assets/originals/figures4papers/`；`description` 加入海报、幻灯片图触发词，
   保持少于 1024 字符且不含尖括号；`version: 1.3.0`。
4. 更新 `agents/interface.yaml` 的 `default_prompt` 与 `degradation`（无 scipy、
   无 seaborn 时的行为）。
5. 更新 `skills/academic-research-tools/AGENTS.md`：模式数量改为四个，列出
   `advise`；Evals 节要求覆盖四个模式与展示级分支。
6. 运行 `PYTHONUTF8=1 just docs-sync`（先确认工作区只含本任务改动），检查
   `docs/` 的差异只涉及 academic-figure 条目。

## 验证

```bash
PYTHONUTF8=1 just skills-check
PYTHONUTF8=1 just python-check
PYTHONUTF8=1 just node-test
PYTHONUTF8=1 just docs-check
PYTHONUTF8=1 just ci
```

- 检查 `SKILL.md` 中每个 `references/`、`scripts/`、`assets/` 路径均存在。
- `grep -rn "no LICENSE\|无许可证\|License.*None" skills/academic-research-tools/academic-figure`
  只能命中 paper-plot-skills 的记录。

## 回滚点

- 集成提交单独成一个 commit；回滚时先 `git revert` 该提交，再按逆序撤销子任务提交。
- `just docs-sync` 覆盖了无关文档时，`git checkout -- docs/` 后先提交或暂存无关改动再重跑。
