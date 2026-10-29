# 项目感知的自动路由

父任务：`10-28-design-atlas-upgrade`。依赖：`10-28-design-atlas-themes` 已完成，需要 theme 元数据与 dedup cluster。契约见父任务 `design.md` §5、§7。

## Goal

项目没有 DESIGN.md，且用户也没有点名设计时，skill 读取项目需求，从主题仓库中自动、确定性地选出最合适的条目并继续执行。

## Requirements

- **路由元数据** `assets/catalog/overlays/routing.json`（first-party，重建时不删除）：
  - 为所有可路由条目提供：68 个 style（被取代的除外）、scene、50 个 theme。
  - 每条字段：`genre`（editorial / modern-minimal / atmospheric / playful）、`keywords_en`（theme 直接沿用上游，style/scene 新写，10–25 个）、`keywords_zh`（全部新写，6–20 个，使用真实需求中会出现的词，如“精酿”“看板”“诊所”“作品集”）、`paper`、`display`、`accent`（theme 沿用上游；style 从 stitch token 推断，可写 `unknown`）、`cluster`（与 dedup.json 一致）。
  - brand 条目不进入 overlay。
- **`signals` 命令**：只读，不写文件。读取以下内容：
  - `package.json`：name、description、keywords，以及 dependencies 映射出的线索，例如 chart 库 → dashboard、电商 SDK → buy、docs 框架 → docs、next/vite/astro → framework。
  - `pyproject.toml`、`Cargo.toml` 的描述字段。
  - README 前 4 KB。
  - 已有 CSS 的 `:root` 颜色（推断 paper 亮度带与强调色相）和字体。
  - Tailwind 配置是否存在。
  - DESIGN.md 是否存在。
  - 文件不存在或解析失败时静默跳过，并在 JSON 的 `notes` 中记录。
- **`route` 命令**：按父 design §5 输出前 n 个条目，带分数分解、理由、置信度。打分规则在 design.md 中定义。
- **`references/routing.md`**：给 agent 看的路由说明，包括什么时候自动选、什么时候等待、Picks 块格式、如何切换、低置信度时如何表述。
- **SKILL.md 工作流第 3 步**：改为父 design §7 中定义的分支。原“提供 2–3 个候选并等待”只保留给“用户要求比较”的情况。
- **evals**：新增自动路由用例，中文、英文各至少 1 条，并断言“未等待用户选择、输出 Picks 块、写出 DESIGN.md”。新增“要求比较”用例，断言等待。

## Acceptance Criteria

- [ ] `tests/test_routing.py` 包含至少 24 条 fixture 路由用例，其中一半为中文；每条断言第 1 名属于一个可接受集合。例如：
  - “经营分析 BI 看板” → `scene:bi`
  - “CLI 工具官网” → `{theme:terminal, theme:cobalt, style:mono}` 中之一
  - “精酿啤酒厂官网” → `{theme:hedgerow, theme:vellum, theme:solstice}` 中之一
  - “儿童编程夏令营报名” → `{theme:werkstatt, theme:hum, style:friendly}` 中之一
  - “律所官网” → 编辑类或现代极简类
  - “AI 语音合成 API” → `{theme:lumen, theme:cobalt, …}`
- [ ] 确定性测试：同一输入运行两次，JSON 输出一致；`--reroll 1` 的第 1 名与 `--reroll 0` 不同。
- [ ] 多样性测试：前 3 名的 cluster 两两不同。
- [ ] 项目信号测试：fixture 项目已有暗色 `:root` token 时，同一 prompt 下暗色条目得分上升；有 recharts 依赖时，prompt 为空也能路由到 dashboard 类条目。
- [ ] overlay 校验测试：每个可路由条目都有 overlay，字段合法，关键词数量在范围内，cluster 与 dedup.json 一致。
- [ ] `route` 在没有任何命中时，仍按 genre 回退给出结果，标为 `confidence: low`，exit 0。只有可路由集合为空时才 exit 1。
- [ ] `just python-test` 全绿；`routing.md` 由 SKILL.md 引用。
