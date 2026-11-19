# design-md 技术设计

需求见 `prd.md`；上游事实见 `research/upstream-analysis.md`。

## 1. 包结构

```text
skills/development-workflows/design-md/
├── SKILL.md                      # 路由 + 精简工作流 + 命令；不复制规则正文
├── README.md                     # 面向人的产品页
├── agents/interface.yaml         # display_name / short_description / default_prompt
├── references/
│   ├── design-system-core.md     # 通用核心（R3）
│   ├── design-md-format.md       # DESIGN.md 结构规范与定制方法
│   ├── implementation.md         # 从 DESIGN.md 到代码：栈映射、状态、响应式、验证
│   └── brand-boundary.md         # 品牌/商标/专有字体边界（R11）
├── assets/catalog/
│   ├── index.json                # 生成；运行时唯一索引
│   ├── categories.json           # 手工维护；类别定义与风格映射（构建输入）
│   ├── brands/<slug>.md          # 84 个，生成
│   ├── styles/<slug>.md          # 67 个，生成
│   └── LICENSES/
│       ├── awesome-design-md.LICENSE
│       └── awesome-design-skills.LICENSE
├── scripts/
│   ├── design_catalog.py         # 运行时 CLI（R6、R7、R8）
│   └── build_catalog.py          # 维护时构建（R9）
├── tests/
│   ├── test_design_catalog.py
│   └── test_build_catalog.py     # 夹具在临时目录内生成，见 §8
└── evals/evals.json
```

不建 `reports/`。qiaomu 的 Skill IR、trigger_cases.json 与仓库现有 `evals/evals.json` schema 重复；仓库规则优先，只保留 `evals/evals.json`。

## 2. 数据模型

### 2.1 条目 id

`<kind>:<slug>`，`kind ∈ {brand, style}`，`slug` 沿用上游目录名（如 `linear.app`、`mistral.ai`）。文件名即 `<slug>.md`，点号在 Windows 文件名中合法。

### 2.2 `categories.json`（构建输入，手工维护）

```json
{
  "brand": {
    "readme_heading_map": { "AI & LLM Platforms": "brand-ai-llm", "...": "..." },
    "overrides": { "slack": "brand-productivity-saas" }
  },
  "style": { "style-minimal-clean": ["minimal", "clean", "..."] },
  "categories": [
    { "id": "brand-ai-llm", "kind": "brand", "en": "AI & LLM Platforms", "zh": "AI 与大模型平台", "order": 1 }
  ]
}
```

品牌类别（来自上游 README，按标题文本匹配；"Retro Web" 标题含特殊分隔符，按前缀 `Retro Web` 匹配）：

| id | en | zh | 数量 |
|---|---|---|---|
| brand-ai-llm | AI & LLM Platforms | AI 与大模型平台 | 13 |
| brand-devtools | Developer Tools & IDEs | 开发者工具与 IDE | 7 |
| brand-backend-devops | Backend, Database & DevOps | 后端、数据库与 DevOps | 9 |
| brand-productivity-saas | Productivity & SaaS | 效率工具与 SaaS | 9（含 slack） |
| brand-design-creative | Design & Creative Tools | 设计与创意工具 | 6 |
| brand-fintech-crypto | Fintech & Crypto | 金融科技与加密货币 | 9 |
| brand-ecommerce-retail | E-commerce & Retail | 电商与零售 | 6 |
| brand-media-consumer | Media & Consumer Tech | 媒体与消费科技 | 16 |
| brand-automotive | Automotive | 汽车 | 7 |
| brand-retro-web | Retro Web | 复古网页 | 2 |

风格类别（本任务定义；已脚本校验 67 个 slug 各出现一次）：

| id | en | zh | slug |
|---|---|---|---|
| style-minimal-clean | Minimal & Clean | 极简与留白 | minimal clean spacious sleek geometric square refined contemporary flat |
| style-editorial-print | Editorial & Print | 编辑与印刷 | editorial basic modern paper riso terracotta impeccable storytelling claude |
| style-product-systems | Product & Enterprise Systems | 产品与企业系统 | ant corporate enterprise professional stitch material shadcn roku levels agentic bento |
| style-bold-expressive | Bold & Expressive | 高对比与表现力 | bold artistic dramatic expressive colorful vibrant gradient pulse creative brutalism neobrutalism |
| style-tactile-depth | Tactile & Depth | 质感与空间深度 | glassmorphism claymorphism neumorphism skeumorphism perspective immersive |
| style-tech-dark | Tech & Dark | 科技与暗色 | cosmic futuristic neon matrix mono power premium codex |
| style-retro-game | Retro & Game | 复古与游戏 | retro vintage dithered pacman sega tetris fantasy |
| style-friendly-handdrawn | Friendly & Hand-drawn | 亲和与手绘 | friendly cafe doodle sketch fiction lingo |

合计 18 个类别，151 个条目。

### 2.3 `index.json`（生成，运行时读取）

```json
{
  "schema_version": 1,
  "sources": {
    "awesome-design-md": { "repo": "https://github.com/VoltAgent/awesome-design-md", "commit": "3b60532…", "license": "MIT", "license_file": "LICENSES/awesome-design-md.LICENSE" },
    "awesome-design-skills": { "repo": "https://github.com/bergside/awesome-design-skills", "commit": "f631a09…", "license": "MIT", "license_file": "LICENSES/awesome-design-skills.LICENSE" }
  },
  "categories": [ { "id": "...", "kind": "...", "en": "...", "zh": "...", "order": 1 } ],
  "entries": [
    {
      "id": "brand:linear.app", "kind": "brand", "slug": "linear.app", "name": "Linear",
      "category": "brand-productivity-saas",
      "description": "Project management for engineers. Ultra-minimal, precise, purple accent",
      "format": "stitch",
      "path": "brands/linear.app.md",
      "source": "awesome-design-md"
    }
  ]
}
```

- `name` / `description`：品牌取上游 README 条目的粗体名与破折号后描述；`slack` 取其 DESIGN.md frontmatter `description` 第一句。风格取上游 `SKILL.md` frontmatter 的 `description`（去引号）与 `index.json` 的 `name`。
- `format`：`stitch`（有 YAML frontmatter）或 `legacy`（10 个旧格式品牌）。SKILL.md 据此提示 agent：legacy 条目没有机器可读 token，映射时从正文表格读取。
- `index.json` 输出键顺序固定、`ensure_ascii=False`、`indent=2`、末尾换行，保证重复构建字节一致。

## 3. 构建流程（`build_catalog.py`）

```text
python build_catalog.py --design-md <path> --design-skills <path> --out <skill>/assets/catalog
```

1. 读取 `categories.json`；校验风格映射无重复 slug。
2. 品牌：遍历 `design-md/*/DESIGN.md`；用 README 解析 `slug → (name, description, heading)`；heading 经 `readme_heading_map` 或 `overrides` 得类别。缺类别 → 收集后统一报错，exit 1。
3. 风格：遍历 `skills/*/`；读 `DESIGN.md` 全文与 `SKILL.md`；从 SKILL.md 按 `## ` 切节，只取 `Brand`（非空且与 Overview 正文不同时，改名 `## Brand Character`）、`Style Foundations`（若 DESIGN.md 已有同名节则跳过）、`Accessibility`、`Writing Tone`、`Rules: Do`、`Rules: Don't`，追加到 DESIGN.md 正文末尾，节名改为 `## Accessibility`、`## Writing Tone`、`## Do's and Don'ts`（Do/Don't 合并为 `### Do` / `### Don't` 两个子节，对齐 Stitch 结构）。去掉 `<!-- TYPEUI_SH_MANAGED_* -->` 标记。
4. 所有输出：`\r\n → \n`，去行尾空格，文件以单个 `\n` 结尾，UTF-8 写入（`newline="\n"`）。
5. 复制两个上游 `LICENSE` 到 `LICENSES/`（同样规范化）。
6. 用 `git -C <path> rev-parse HEAD` 取 commit；取不到时 `--commit-design-md` / `--commit-design-skills` 参数必填，否则 exit 1。
7. 删除 `brands/`、`styles/` 中不再存在于上游的旧文件，并在 stdout 列出增删改计数。
8. 写 `index.json`。

构建只在维护时手动运行，CI 不运行（CI 没有 `ref/`）。测试在临时目录生成迷你上游树后运行构建。

## 4. 运行时 CLI（`design_catalog.py`）

只用标准库；通过 `Path(__file__)` 定位 `assets/catalog/index.json`；stdout 强制 UTF-8（`sys.stdout.reconfigure(encoding="utf-8")`），避开 Windows GBK。

| 子命令 | 参数 | 行为 | 退出码 |
|---|---|---|---|
| `list` | `--kind brand\|style`、`--category <id>`、`--format text\|json` | text：按 `order` 输出 `## 中文名 / English (n)`，每行 `id — name — description`；json：条目数组 | 0；未知类别 2 |
| `search` | `query`、`--kind`、`--format` | 对 id、name、description、类别中英文名做大小写不敏感子串匹配；空结果打印提示 | 0（有结果）/ 1（无结果） |
| `show` | `id` | 输出条目文件全文；`id` 可省略 kind 前缀，唯一时自动解析，歧义（如 `claude`）时列出候选 | 0 / 2 |
| `apply` | `id`、`--root <dir>`（默认 cwd）、`--force` | 见 4.1 | 0 / 2 / 3 |

### 4.1 `apply` 语义

1. 解析 id；不存在 → exit 2。
2. `--root` 必须是已存在目录 → 否则 exit 2。
3. 在 root 中按 `name.lower() == "design.md"` 查找已有文件。
   - 存在且无 `--force` → stderr 说明路径与 `--force` 用法，exit 3，不写任何文件。
   - 存在且有 `--force` → 重命名为 `<原文件名>.bak-YYYYMMDD-HHMMSS`，再写新文件。
4. 内容：若条目以 `---` frontmatter 开头，在第二个 `---` 行之后插入来源注释；否则插在文件首行。注释格式：
   `<!-- design-md: entry=brand:vercel; source=https://github.com/VoltAgent/awesome-design-md@3b60532; license=MIT -->`
5. 写入 `<root>/DESIGN.md`，`encoding="utf-8", newline="\n"`。stdout 打印写入路径与备份路径（若有）。

## 5. SKILL.md 工作流（精简版，规则正文放 references）

1. **确认场景**：用户要列目录、选风格、建 DESIGN.md、或按 DESIGN.md 实施。报告/幻灯片走 `html-artifact`；截图复刻走 `image-to-ui-skill`。
2. **检查现有设计源**：目标项目根已有 `DESIGN.md` → 默认按它实施，不重新选型；用户要求更换时才 `apply --force`。
3. **选型**：用户指定条目 → 直接 `show`。用户描述氛围/行业 → `search` + `list --category`，给出 2–3 个候选，每个附一句理由，等待用户选择。用户只说"随便/你定" → 选一个并说明理由后继续。
4. **写入**：`apply <id> --root <project-root>`。
5. **定制**（按需）：改品牌色、字体替代、暗色模式时按 `references/design-md-format.md` 修改 `DESIGN.md` 本身，保持 token 引用一致；不在代码里硬编码偏离 DESIGN.md 的值。
6. **实施**：按 `references/implementation.md`：识别技术栈 → 生成 token 层（CSS 自定义属性 / Tailwind theme / 设计 token 文件）→ 组件按 DESIGN.md Components 与核心规则补齐状态 → 实现页面。
7. **验证**：启动页面截图核对颜色、字体、间距、状态、响应式、对比度；无法运行时写明未执行的具体检查（对应全局规则 #15）。
8. **品牌边界**：始终适用 `references/brand-boundary.md`。

## 6. references 内容来源

| 文件 | 来源 | 处理方式 |
|---|---|---|
| design-system-core.md | typeui 6 个一致节 | 改写合并：意图一句话 → token 先行 → 组件 anatomy/状态/变体 → 可测可访问性 → 文案语气 → 反模式与迁移 → QA 清单；保留 must/should 约束语言；注明出处 |
| design-md-format.md | awesome-design-md 的 Stitch 结构 | frontmatter 键说明、节顺序、`{colors.x}` 引用、Iteration Guide 与 Known Gaps 写法、legacy 格式读法、定制步骤 |
| implementation.md | 两库 + 本任务 | 栈识别与映射示例（CSS 变量、Tailwind v3/v4）、状态矩阵、响应式断点、对比度检查、验证清单 |
| brand-boundary.md | awesome-design-md README 声明 + R11 | 不复制 logo/wordmark/品牌名/专有字体；Known Gaps 的替代字体；"inspired by" 措辞 |

## 7. 路由与自包含

- description 的不适用项点名同仓库 skill：`html-artifact`、`image-to-ui-skill`。
- 不依赖 `.claude/skills/ui-ux-pro-max`、Waza `ui` 或 `frontend-design`；需要额外审美判断时用通用措辞（"如环境中有前端设计类 skill 可参考"）。

## 8. 测试设计

`tests/test_design_catalog.py`（针对已提交的真实资产）：

- index 条目数 151、品牌 84、风格 67；每个条目 `path` 文件存在；每个 `category` 在 categories 中；18 个类别。
- 风格文件含 `## Accessibility` 与 `### Do`，不含 `Guideline Authoring Workflow`、`TYPEUI_SH_MANAGED`。
- 所有资产文件无 `\r`、无行尾空格（与 `git diff --check` 一致）。
- CLI（`subprocess` 调用 `sys.executable`）：`list` 文本含 18 个分组；`list --kind brand --format json` 长度 84；`search linear` 含 `brand:linear.app`；`show claude` 退出码 2 且列出两个候选；`apply` 到 `tempfile.TemporaryDirectory`：写入、注释位置、无 `\r`、小写 `design.md` 存在时的 exit 3 与 `--force` 备份。

`tests/test_build_catalog.py`：在 `tempfile.TemporaryDirectory` 中生成迷你上游树（2 品牌 + 2 风格 + 1 个未分类品牌）。不在仓库中提交名为 `SKILL.md` 的夹具，因为 `docs/scripts/sync_docs_catalog.py` 的 `discover_skills()` 与 `scripts/check.py` 会递归收集所有 `SKILL.md`。测试项：正常构建产物与预期一致；缺分类 exit 1；SKILL.md 通用节被剔除；行尾空格被规范化；重复构建字节一致。

## 9. 兼容性与回滚

- 新增目录，不改已有 skill；回滚 = 删除 `skills/development-workflows/design-md/` 并重新 `just docs-sync`。
- 资产约 3 MB 文本；`skills/` 当前 35 MB。
- 上游更新：重新运行 `build_catalog.py` 后提交 diff；`index.json` 记录 commit 便于追溯。

## 10. 风险

| 风险 | 处理 |
|---|---|
| `docs-sync` 处理资产 | 已核对：`collect_resources()` 只统计顶层子目录的文件数，不复制内容。`discover_skills()` 递归收集 `SKILL.md`，所以资产与夹具都不得使用该文件名 |
| 风格类别划分有主观性 | 映射集中在 `categories.json`，改动不影响代码；测试只校验完整性与唯一性 |
| 品牌 DESIGN.md 内含品牌名与专有字体名 | 条目原文保留（研究用途、上游已声明）；实施阶段受 brand-boundary 约束 |
| Windows 控制台编码 | CLI 自行 reconfigure stdout；测试用 `encoding="utf-8"` 读取子进程输出 |
