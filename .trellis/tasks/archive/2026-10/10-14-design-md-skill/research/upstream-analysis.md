# 上游仓库分析（2026-10-14）

## 来源快照

| 仓库                           | 本地路径                         | commit                                     | 日期       | 许可证                            |
| ------------------------------ | -------------------------------- | ------------------------------------------ | ---------- | --------------------------------- |
| bergside/awesome-design-skills | `ref/repo/awesome-design-skills` | `f631a09b4fcc0166f2e2c1a8c81906ef680c57e8` | 2026-06-28 | MIT, Copyright (c) 2026 Bergside  |
| VoltAgent/awesome-design-md    | `ref/repo/awesome-design-md`     | `3b605329240ce735b510037cca322f1831fdd7f8` | 2026-10-14 | MIT, Copyright (c) 2026 VoltAgent |

`ref/` 被 git 忽略。构建脚本只在维护时读取它，skill 运行时不依赖它。

## awesome-design-skills（typeui.sh）

- 67 个风格目录，每个目录有 `SKILL.md` 与 `DESIGN.md`。`skills/index.json` 列出全部 67 个 slug，与目录一致。
- 67 个 `SKILL.md` 的 `## ` 节完全相同：Mission、Brand、Style Foundations、Accessibility、Writing Tone、Rules: Do、Rules: Don't、Expected Behavior、Guideline Authoring Workflow、Required Output Structure、Component Rule Expectations、Quality Gates、Example Constraint Language。
- 按节统计不同正文数量（脚本统计，67 个文件）：

| 节                           | 不同正文数 | 结论                       |
| ---------------------------- | ---------- | -------------------------- |
| Expected Behavior            | 1          | 通用核心                   |
| Guideline Authoring Workflow | 1          | 通用核心                   |
| Component Rule Expectations  | 1          | 通用核心                   |
| Quality Gates                | 1          | 通用核心                   |
| Example Constraint Language  | 1          | 通用核心                   |
| Required Output Structure    | 2          | 通用核心（两个变体差异小） |
| Rules: Do                    | 7          | 少量模板变体               |
| Rules: Don't                 | 8          | 少量模板变体               |
| Accessibility                | 10         | 风格数据                   |
| Writing Tone                 | 13         | 风格数据                   |
| Brand                        | 57         | 风格数据                   |
| Mission / Style Foundations  | 67         | 风格数据                   |

- 每个风格的 `DESIGN.md` 很薄：YAML frontmatter（name、colors、typography、rounded、spacing）+ Overview + Style Foundations + Colors。可访问性、语气、Do/Don't 只存在于 `SKILL.md`。
- 4 个 Markdown 文件含行尾空格。复制进本仓库时必须去掉，否则 `git diff --check` 失败。
- `SKILL.md` frontmatter 的 description 是单行英文风格描述，可直接作为目录说明。

## awesome-design-md（getdesign.md）

- 84 个品牌目录，每个有 `DESIGN.md`（2.6 MB 合计，46710 行，最短 125 行，最长 882 行）和一个只含外链的 `README.md`。
- 74 个文件使用 Google Stitch DESIGN.md 新格式：YAML frontmatter（`version`、`name`、`description`、`colors`、`typography`、`rounded`、`spacing`、`components`）+ 节 Overview、Colors、Typography、Layout、Elevation & Depth、Shapes、Components、Do's and Don'ts、Responsive Behavior、Iteration Guide、Known Gaps。正文用 `{colors.primary}` 这类 token 引用。
- 10 个文件使用旧格式（无 frontmatter，编号节 "1. Visual Theme & Atmosphere" 等，含 "Agent Prompt Guide"）：kraken、lamborghini、lovable、mastercard、runwayml、sanity、spotify、starbucks、tesla、theverge。
- 根 README 把 83 个品牌分到 10 个类别；`slack` 目录未列入 README，需要手工补分类。
- 类别计数：Media & Consumer Tech 16、AI & LLM Platforms 13、Backend, Database & DevOps 9、Fintech & Crypto 9、Productivity & SaaS 8、Developer Tools & IDEs 7、Automotive 7、Design & Creative Tools 6、E-commerce & Retail 6、Retro Web 2。
- 无 CRLF，无行尾空格。
- README 声明：token 来自公开 CSS，不主张任何站点视觉身份的所有权。

## 两库的关系

- 两库都以 DESIGN.md 为交付物，frontmatter 键名兼容（colors / typography / rounded / spacing）。可合并为一个目录，统一按 `kind:slug` 编号。
- 同名条目：`claude` 同时存在于两库（风格 vs 品牌），编号 `style:claude` 与 `brand:claude` 区分。
- 通用核心（如何写设计系统规则、组件状态、质量门）只来自 awesome-design-skills；DESIGN.md 结构规范、token 引用、Iteration Guide、Known Gaps 的写法来自 awesome-design-md。

## 本仓库已有的相关资产

- `skills/development-workflows/html-artifact`：离线 HTML 报告/幻灯片，有 5 个 visual direction（editorial、dashboard、dossier、deck、workbench）和 `assets/style-tokens.css`。定位是工作产出物，不是生产 UI。
- `skills/developer-tools-integrations/image-to-ui-skill`：截图/设计稿复刻为可点击 demo。
- `.claude/skills/ui-ux-pro-max`：本地安装的第三方 skill，不是一方源码，新 skill 不能硬依赖它。

## 约束（来自仓库规则）

- 类别只能是 `scripts/check.py` 的 6 个 `CANONICAL_CATEGORY_SLUGS` 之一。
- frontmatter 顶层键：name、description、category、tags、version；description 不超过 1024 字符、不含尖括号。
- 脚本路径写成 `"<skill-dir>/scripts/x.py"`。
- evals 用 `evals/evals.json` 的 `assertions` schema，至少两个近邻路由反例。
- 每个一方 skill 至少有一个被 `just python-test` 或 `just node-test` 收集的测试。
- 改 frontmatter 后需 `just docs-sync`，最终 `just ci`。
