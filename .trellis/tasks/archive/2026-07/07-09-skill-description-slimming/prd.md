# PRD: 精简 skills 目录全部 SKILL.md description 的 token 占用

## 背景

`skills/` 下 39 个 skill 的 frontmatter `description` 会被安装方（Claude Code / Codex）整体注入系统提示的 available-skills 列表，属于每个会话的常驻 token 开销。

**现状基线（2026-07-09 统计）：**

- 39 个 skill，description 总计 **≈ 21,270 字符**（中英混排，粗估 6,000–7,000 tokens 常驻）
- 平均 545 字符/skill；最长 953（paper-plot），最短 190（gh-fix-ci）
- **13 个 skill 超过 600 字符**，贡献了总量的近一半

### 超长 Top 13（chars）

| Skill | Chars | 主要膨胀原因 |
|---|---|---|
| research-learning-knowledge/paper-plot | 953 | 把 8 个风格目录名（bar_paired_delta 等）全部枚举进 description；三重反向路由句 |
| development-workflows/unknowns-first | 887 | 把方法论内容（四类未知、任务层级）写进 description；3 条 Do-NOT 路由句 |
| development-workflows/handoff | 855 | 描述了输出文档的完整结构（属于 body 的 output contract）；中英触发词双份 |
| academic-research-tools/academic-figure | 815 | 期刊 preset 枚举 + industrytslib 特例说明 + 双向反向路由 |
| docs-writing-publishing/archify | 815 | 图表类型近 20 个同义枚举（architecture/infrastructure/cloud/security/network…） |
| development-workflows/html-artifact | 813 | 使用场景枚举 12+ 项；正反两段路由 |
| development-workflows/implementation-notes | 809 | 把 notes 文件的四类记录内容写进 description |
| git-github-collaboration/git-commit | 801 | 语言自动检测规则、`[AI]` tag、Why line、wip 模式等行为细节全在 description |
| developer-tools-integrations/windows-dev-process-cleanup | 775 | 进程名逐个枚举两遍（英文一遍 + 中文触发一遍） |
| research-learning-knowledge/humanizer-paper | 758 | 润色策略细节（hedging/passive voice/terminology）属于 body |
| developer-tools-integrations/claude-md-improver | 696 | 机制术语枚举（additive loading、@import chains、claudeMdExcludes…） |
| developer-tools-integrations/ripgrep | 647 | flag/场景枚举 + 与 ast-grep/LSP 的双路由说明 |
| docs-writing-publishing/document-writer | 604 | 文档类型枚举 + 一整句排除说明 |

### 共性膨胀模式（按可压缩收益排序）

1. **行为/输出细节写进了 description**（git-commit、handoff、implementation-notes、humanizer-paper、spark）— description 只需回答"何时触发"，"做什么、怎么做"属于 SKILL.md body。
2. **同义触发词过度枚举**（archify、html-artifact、bidwriter）— 模型泛化能力足够，保留 3–6 个区分度最高的触发词即可。
3. **中英触发词全量双份**（windows-dev-process-cleanup、handoff、cold-shower）— 保留中文特有短语 + 少量英文关键词，删除互为直译的重复。
4. **目录/preset 名称枚举**（paper-plot 的 8 个风格名、academic-figure 的期刊 preset）— 目录属于 body 或 references，description 只说"内置论文风格目录"。
5. **反向路由句过重**（paper-plot ↔ academic-figure ↔ paper-workbench ↔ literature-mentor 四者互指，每边都是完整句子）— 每个易混对保留单向、单短语的路由提示即可。

## 目标

将 description 总字符量从 ≈21,270 压到 **≤ 13,000 字符（降约 40%）**，同时不降低触发准确率。

## 需求

1. 为每个 skill 设定 description 预算：
   - 常规 skill：**≤ 400 字符**
   - 高歧义路由 skill（paper 系四件套、code review 系、geju/goudi/cold-shower 系）：**≤ 550 字符**
2. 每条 description 保留三要素、删除其余：
   - 一句"做什么"（≤1 子句）
   - 触发条件：3–6 个最具区分度的触发短语（中文特有短语优先保留）
   - 反触发：仅当存在真实误路由风险时保留 **1** 条最短排除句
3. 从 description 移出、并确认已存在于 SKILL.md body（不存在则搬运过去，不得丢信息）：
   - 行为规则、输出格式、模式选择逻辑、preset/风格目录、工具链细节
4. 易混 skill 对的路由提示改为单向短语（如 paper-plot 保留"期刊投稿合规图 → academic-figure"一处，academic-figure 侧删除对称长句）。
5. 修改仅限 frontmatter `description` 与必要的 body 增补；不改 `name`、`category`、`tags` 语义（`version` 按仓库惯例递增可选）。

## 验收标准

- [x] 39 个 skill description 总字符 ≤ 13,000（最终 12,993，21,270 → 12,993，降 38.9%）；预算档唯一豁免：spark 406 > 400，因其 tests/spec-html-contract.test.mjs 将三个短语（chat-only final plan / approval exits Plan mode / .plannings/YYYY-MM-DD-feature-slug.md）锁定为 frontmatter 契约
- [x] `just skills-check` 通过（frontmatter 元数据合法）
- [x] `just ci` 通过（exit 0；含 docs-check/docs build/node-test，docs 已 `just docs-sync` 再生成）
- [x] 触发回归：已安装 yao-meta 未附带 `trigger_eval.py`（引用未分发），按备选方案完成等价触发用例清单评测，见 `trigger-regression.md`；评测中发现并修复 1 例真实回归（touying 主题名），2 例带备注的可接受泛化（cold-shower、claude-md-improver）
- [x] 从 description 删除的信息已逐 skill 核对：或已存在于 body（paper-plot 目录表、git-commit §0 语言规则、handoff/implementation-notes 四节结构、literature-mentor 模式表等），或已搬入 body（unknowns-first 路由行、touying 主题清单、archive-planning deprecated 句）
- [x] 前后对比表见 `before-after.md`（34 个 skill 被修改，20,019 → 11,815，节省 8,204 字符）

## 排除范围

- 不重写 SKILL.md body 的正文内容（仅允许承接从 description 搬入的信息）
- 不合并、拆分或删除任何 skill
- 不动 `platforms/` 下的派生资产（如有生成机制，另行同步）
