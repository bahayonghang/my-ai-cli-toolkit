# PRD: 优化 html-artifact——借鉴 html-express 的组件装配层

## 背景

对比参考实现 `ref/repo/zhijian-skills-main/skills/html-express`(89 行 SKILL.md,组件库驱动)与本仓库 `skills/development-workflows/html-artifact`(219 行 SKILL.md,模板/治理驱动),发现两者互补:

- **html-artifact 已有优势**(保留,不动):校验器 `scripts/check_html_artifact.py`、尺寸/拆分门、无障碍与安全契约、10 个页面级模板、5 本 cookbook、设计升级(design escalation)流程。
- **html-express 的优势**(html-artifact 缺失,本次借鉴):
  1. **即拷即用组件片段**:`assets/components/*.html` 每个文件 = 用途注释 + 作用域 CSS + 示例标记,直接复制粘贴;html-artifact 的 cookbook 是 Markdown 描述,每次都要现场生成 CSS/HTML,输出方差大、token 成本高。
  2. **信息形态 → 组件路由表**:按"对比/指标/时间线/清单/引用"等信息形态做节(section)级路由;html-artifact 只有页面级模板路由,缺节级快速决策。
  3. **demo-all.html 组件样张**:单文件双击预览全部组件,人可视检、AI 可对照;html-artifact 无任何可视化样张。
  4. **轻量快路径**:html-express 面向"日常轻量 HTML 表达";html-artifact 的 11 步流程(尺寸门、设计升级、模板选择)对简单信息页过重。
  5. **内容诚实规则**:明令禁止占位符残留与编造数据,缺数据标 `[数据待补:说明]`;html-artifact 输出契约中无此条。

## 目标

在不破坏 html-artifact 现有治理体系的前提下,加入组件装配层与轻量快路径,降低简单产物的生成成本与输出方差。

## 需求(In Scope)

### R1 组件片段库

新增 `assets/components/` 目录,提供 9 个即拷即用组件片段:`metric-card`、`comparison-table`、`data-table`、`timeline`、`checklist`、`quote-card`、`code-block`、`details`、`badge`。每个 `.html` 含用途注释 + `ha-` 前缀作用域 CSS + 示例标记;组件 CSS 依赖已装配的 `style-tokens.css`,颜色、字号、间距、圆角和阴影只引用既有 token,不内置硬编码回退。`columns` 不重复实现,直接使用 starter-template 已有 `grid-2/3/4`。

### R2 节级路由表

SKILL.md 增加「信息形态 → 组件」路由表(节级),与既有「用户目标 → 模板」路由表(页面级)并存,并说明两层路由关系:先选模板定页面骨架,再按信息形态选组件填充。

### R3 组件样张页

新增 `assets/demo-all.html`:单文件、自包含、双击可开,展示全部 9 个组件效果;示例内容只陈述本技能/组件库可核验的事实,不使用虚构客户、统计或来源。须通过 `check_html_artifact.py` 校验。当前任务通过 CLI 执行,不要求 in-app Browser 目检;改用 DOM、响应式断点、横向溢出保护和 focus 样式的结构化审查。

### R4 轻量快路径

SKILL.md 定义 fast path:当产物为简单信息页(单页、无图表拆分诉求、预估 < 900 KB、非高密度评审场景)时,允许跳过设计升级与详细尺寸计划,直接走「starter-template + 组件片段 + 校验器」三步流程。快路径不得跳过输出契约(自包含、语义、无障碍)与校验器。

### R5 内容诚实规则

输出契约(或 Safety 节)新增:禁止占位符残留(`[填这里]`、Lorem、TBD);禁止编造数据/统计;缺数据以 `[数据待补:说明]` 显式标注。

## 非目标(Out of Scope)

- 不引入 html-express 的智见品牌色板(暖纸/陶土/墨蓝)——html-artifact 保持自身 token 体系。
- 不修改校验器的现有校验规则语义(允许为样张页跑校验,但不为组件库新增校验维度,除非实现中发现必要且单独评审)。
- 不改动 10 个页面模板与 5 本 cookbook 的内容结构(仅允许在其中加入指向组件片段的交叉引用)。
- 不处理 kami/hyperframes 式的技能间路由(本仓库无对应技能)。

## 验收标准

- [x] `assets/components/` 存在且恰含上述 9 个片段;每个片段含用途注释、使用 `ha-` 前缀、颜色/字号/间距/圆角/阴影仅用 token、无占位符残留、无远程依赖。
- [x] `assets/demo-all.html` 展示全部 9 个组件,通过 `python skills/development-workflows/html-artifact/scripts/check_html_artifact.py` 校验(0 failure),并通过 CLI 结构审查确认移动断点、表格/代码横向滚动、文本换行和 focus 状态存在。
- [x] SKILL.md 含节级路由表、快路径定义、内容诚实规则;frontmatter 仍符合仓库规范(`name`/`description`/`category`/`tags`/`version`,version 递增)。
- [x] `just docs-sync` 生成的中英文技能目录与 0.4.0 元数据一致;`just skills-check`、`just node-test`(`tests/check-html-artifact.test.mjs`)、`just ci` 全绿。
- [x] SKILL.md 增量控制:新增内容合计不超过约 60 行,细节下沉到 references/assets(渐进披露原则)。

## 约束

- 遵守仓库规则:skills 顶层 frontmatter 字段规范;Conventional Commits(`feat(skills):` 或 `refactor(skills):`)。
- SKILL.md frontmatter 变更后必须通过 `just docs-sync` 更新生成目录,不得手改生成页。
- Markdown 表格允许由格式化钩子重排;不为视觉对齐绕过仓库要求的编辑方式。
- Windows 环境跑 Python 脚本时加 `PYTHONUTF8=1` 前缀,避免 GBK 解码错误。
