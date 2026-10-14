# 新增 design-md 设计系统 skill

## Goal

新建一方 skill `design-md`，位置 `skills/development-workflows/design-md/`。该 skill 做三件事：

1. 提供一份通用设计系统核心规则（从 awesome-design-skills 67 个 SKILL.md 中完全相同的节提炼）。
2. 内置一个合并目录：awesome-design-md 的 84 个品牌 DESIGN.md + awesome-design-skills 的 67 个风格，按类别列出，可搜索、可查看。
3. 在用户目标项目的根目录写入 `DESIGN.md`，再按该文件实施或改造 UI，并做运行时验证。

上游事实与统计见 `research/upstream-analysis.md`。

## Users and triggers

- 用户在任意前端项目中说"列出可用的设计风格""用 Linear 风格做这个页面""给项目建一个 DESIGN.md""按 DESIGN.md 实施首页"等。
- 用户语言可能是中文或英文。

## Requirements

- R1：skill 根目录为 `skills/development-workflows/design-md/`，frontmatter 含 `name: design-md`、`description`、`category: development-workflows`、`tags`、`version: 0.1.0`、`allowed-tools`、`argument-hint`，通过 `just skills-check`。
- R2：description 同时含中英文触发词，覆盖"列出设计目录""写入 DESIGN.md""按 DESIGN.md 实施 UI"三个功能，并写明不适用场景（HTML 报告产出物、截图复刻、纯视觉润色无设计系统需求、非 UI 任务）。
- R3：通用核心规则写入 `references/`，内容来自 awesome-design-skills 中 67 个文件一致的 6 个节（Expected Behavior、Guideline Authoring Workflow、Required Output Structure、Component Rule Expectations、Quality Gates、Example Constraint Language），并与 awesome-design-md 的 DESIGN.md 结构规范（token 引用、Iteration Guide、Known Gaps、Do's and Don'ts）合并为一份规则，不逐字堆叠两份原文。
- R4：目录内置 151 个条目：84 个 `brand:<slug>` 与 67 个 `style:<slug>`。每个条目有一个可直接作为 `DESIGN.md` 的 Markdown 文件。风格条目由上游风格 `DESIGN.md` 与该风格 `SKILL.md` 中的风格专属节（Style Foundations、Accessibility、Writing Tone、Rules: Do、Rules: Don't）合并生成，不含通用模板节。
- R5：每个条目都属于且仅属于一个类别。品牌沿用上游 README 的 10 个类别，`slack` 补入 Productivity & SaaS。风格使用本任务定义的 8 个类别（映射表在 `design.md`）。类别带中英文名称。
- R6：提供 stdlib Python 脚本 `scripts/design_catalog.py`，子命令 `list`（按类别分组，可按 kind / category 过滤，支持 text 与 json 输出）、`search`（按名称、描述、类别匹配）、`show`（输出单个条目全文）、`apply`（写入目标根目录 `DESIGN.md`）。
- R7：`apply` 默认不覆盖已存在的设计文件。目标根目录存在任何大小写形式的 `design.md` 时，未加 `--force` 则非零退出并说明原因；加 `--force` 时先把原文件备份为带时间戳的副本再写入。写入使用 UTF-8 与 LF。
- R8：写入的 `DESIGN.md` 在 frontmatter 之后带一行 HTML 注释，记录条目 id、上游仓库、上游 commit 与许可证。
- R9：提供维护脚本 `scripts/build_catalog.py`，从两个上游 checkout 重新生成目录资产与 `index.json`，记录上游 commit；规范化行尾空格与换行；任何未分类条目使构建失败。skill 运行时不读取 `ref/`。
- R10：SKILL.md 的工作流覆盖：选型（列出/搜索/推荐 2–3 个候选并说明理由）→ 写入 `DESIGN.md` → 按需定制 token → 映射到项目技术栈（CSS 变量、Tailwind theme 等）→ 实施页面或组件 → 运行时验证（启动页面并截图或说明无法执行的具体检查）。
- R11：品牌边界：实施 UI 时不得复制品牌 logo、wordmark、品牌名或专有字体文件；专有字体使用条目 Known Gaps 或本 skill 规则给出的替代字体；产出界面描述为"受 X 启发"。
- R12：上游两份 MIT LICENSE 原文随资产一起保存，README 写明来源、commit 与许可证。
- R13：README.md 面向人，说明用途、安装、示例请求、目录类别概览、输出、限制。`agents/interface.yaml` 含 `display_name`、`short_description`、`default_prompt`。
- R14：`evals/evals.json` 使用仓库 `assertions` schema，至少 5 条正例与 2 条近邻路由反例（`html-artifact`、`image-to-ui-skill`），通过 `just evals-check`。
- R15：`tests/` 下有 Python unittest，被 `just python-test` 收集，覆盖目录完整性、各子命令与 `apply` 的覆盖保护。
- R16：运行 `just docs-sync` 更新生成文档，`just ci` 全部通过。

## Out of scope

- 不从网络实时拉取 getdesign.md 或 typeui.sh；目录完全离线。
- 不提供把两个条目自动混合成一个 DESIGN.md 的命令。用户要混合时，SKILL.md 指导 agent 从最接近的条目出发手工改 token。
- 不内置上游的预览图（`registry-examples/*.png`）与预览 HTML。
- 不修改 `html-artifact`、`image-to-ui-skill` 或其他已有 skill。
- 不在本仓库根目录放 `DESIGN.md`；`DESIGN.md` 只写入用户的目标项目。

## Acceptance Criteria

- [ ] `python "<skill-dir>/scripts/design_catalog.py" list` 输出 18 个类别分组，条目总数 151（品牌 84、风格 67）。
- [ ] `list --kind brand --format json` 返回 84 个对象，每个对象含 `id`、`kind`、`slug`、`name`、`category`、`category_zh`、`description`、`source`。
- [ ] `search linear` 命中 `brand:linear.app`；`search 极简` 或 `search minimal` 命中 `style:minimal`。
- [ ] `show brand:claude` 与 `show style:claude` 输出不同内容。
- [ ] 在临时目录执行 `apply brand:vercel --root <tmp>` 生成 `<tmp>/DESIGN.md`，首个 frontmatter 之后有来源注释，字节中无 `\r`。
- [ ] 目标已有 `design.md`（小写）时，`apply` 不带 `--force` 返回非零且原文件未变；带 `--force` 时产生备份文件且新内容写入。
- [ ] 每个风格条目文件含 Accessibility 与 Do/Don't 内容，且不含 "Guideline Authoring Workflow" 等通用模板节标题。
- [ ] `build_catalog.py` 对测试夹具中缺分类的条目返回非零。
- [ ] 目录资产与上游 LICENSE 原文都在 skill 目录内；README 列出两个上游仓库、commit 与 MIT 许可。
- [ ] `just skills-check`、`just python-check`、`just python-test`、`just evals-check`、`just docs-check` 与 `just ci` 通过。

## Assumptions (confirmed by user 2026-10-14)

- A1：用户原话"本来已有的风格"按 awesome-design-skills 已有的 67 个风格理解。本仓库 `html-artifact` 的 5 个 visual direction 是报告版式，不并入目录，只在路由中区分。
- A2：用户原话 `design.md` 按 Google Stitch 约定写成 `DESIGN.md`；Windows 文件系统大小写不敏感，两者指向同一文件，覆盖保护按大小写不敏感处理。
- A3：skill 名使用仓库现有命名习惯（无 `qiaomu-` 前缀的 kebab-case），定为 `design-md`。
- A4：类别放 `development-workflows`（与 `html-artifact` 同类，属于"产出并实施"的开发流程）。备选 `developer-tools-integrations`（`image-to-ui-skill` 所在）。
