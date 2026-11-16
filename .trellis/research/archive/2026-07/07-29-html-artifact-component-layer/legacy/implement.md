# Implement: html-artifact 组件装配层

前置:阅读 `prd.md`、`design.md`、`research/component-layer-evidence.md`;参照物在 `ref/repo/zhijian-skills-main/skills/html-express/`(只读,不复制品牌 token 或虚构示例数据)。

## 执行清单

### 阶段 1:组件片段库(R1)

- [x] 通读 `assets/starter-template.html` 与 `assets/style-tokens.css`,列出既有类名与可用 token 变量清单(避免冲突、确认变量名)。
- [x] 创建固定的 9 个片段:`metric-card`、`comparison-table`、`data-table`、`timeline`、`checklist`、`quote-card`、`code-block`、`details`、`badge`;每个遵循 D1 格式契约(`ha-` 前缀、仅既有 token、仓库事实示例、无占位符)。
- [x] 薄封装类片段(comparison-table/data-table)确认引用的 starter 类名真实存在。

### 阶段 2:样张页(R3)

- [x] 创建 `assets/demo-all.html`:starter 骨架 + 内联全量 token + 全部组件逐节展示。
- [x] 运行 `PYTHONUTF8=1 python skills/development-workflows/html-artifact/scripts/check_html_artifact.py skills/development-workflows/html-artifact/assets/demo-all.html`,0 failure;有 warning 则修复或在任务笔记记录理由。
- [x] 在 CLI 中审查样张 DOM/CSS:宽桌面布局、`@media` 窄屏断点、表格/代码横向滚动、文本换行和 `:focus-visible`;本次不要求 in-app Browser 截图。

### 阶段 3:SKILL.md(R2/R4/R5)

- [x] 新增「Component snippets」小节:目录说明 + 信息形态 → 组件路由表 + 两层路由关系。
- [x] 新增「Fast path」小节:触发条件 + 三步流程 + 不可跳过项(输出契约、校验器)。
- [x] Output contract/Safety 追加内容诚实三条。
- [x] Progressive disclosure 节补充 `assets/components/` 与 `assets/demo-all.html` 条目。
- [x] frontmatter `version` → 0.4.0;核对新增行数 ≤ 60。
- [x] 运行 `just docs-sync`,审查生成的中英文技能目录差异,不手改生成页。
- [x] Markdown 表格被格式化钩子重排时只核对语义与渲染,不为字符对齐绕过仓库要求的编辑方式。

### 阶段 4:验证与收尾

- [x] `just skills-check`
- [x] `just node-test`
- [x] `just ci`
- [x] `git diff --check` 与 `git status --porcelain -uall`,确认仅包含本任务改动和明确排除的既有脏文件。
- [x] 逐条核对 prd.md 验收标准并勾选。
- [x] 更新 spec(已按 trellis-update-spec 复核;本次知识为 html-artifact 局部契约,无需修改仓库级 spec)。
- [x] 按 Trellis Phase 3.4 先展示提交分组并取得一次确认;工作提交为 `305fc46`,未 push。

## 验证命令汇总

```bash
PYTHONUTF8=1 python skills/development-workflows/html-artifact/scripts/check_html_artifact.py skills/development-workflows/html-artifact/assets/demo-all.html
just docs-sync
just skills-check
just node-test
just ci
```

## 回滚点

- 阶段 1-2 独立于 SKILL.md;回滚时只删除本任务新建且已确认路径的组件目录与样张页。
- 阶段 3 为 SKILL.md 纯增量;只反向应用本任务 hunks,不得整文件恢复或覆盖并存改动。生成目录通过 `just docs-sync` 重新同步。
