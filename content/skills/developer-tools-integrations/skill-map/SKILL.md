---
name: skill-map
description: "Skill map viewer for locally installed skills. Detects the current CLI, resolves that platform's installed-skills root, and renders a stable ASCII overview of installed names, versions, triggerability, and grouping. Use when the user asks what skills are installed on this machine, wants a local skill map, or says '技能地图', '本机 skills', '我装了哪些 skill', 'local skill list', or 'installed skills'. Also use this skill to surface overlap and consolidation suggestions across installed skills — trigger on '哪些 skill 重复', '相似 skill', 'skill 整理', 'skill 去重', '技能瘦身', 'consolidate skills', 'duplicate skills', 'deduplicate skills', or 'similar installed skills'. Do not use it for installable catalogs, registries, or recommendations."
version: "1.3.0"
category: developer-tools-integrations
---

# skill-map: 技能地图

扫描当前机器上的**已安装**技能目录，生成一目了然的 ASCII 地图。

只面向安装后的技能目录：
- 默认扫描目标：
  - 先检测当前 CLI（Claude / Codex / Antigravity / Qwen / Kiro / Trae / OpenCode 等）
  - 再使用该平台对应的 installed-skills 根目录
  - 若检测失败，兜底到共享安装根（通常是 `~/.agents/skills`）
- builtin/system skills（例如 `~/.codex/skills`）不进入默认地图
- 不扫描仓库源码目录（如 `content/skills/`）
- 不把 registry 目录（如 `content/community-skills-registry/`）当作 installable skill
- 不用于“帮我找可安装 skill / registry / catalog”这类请求

## 执行

### 1. 扫描

运行 Node CLI：

```bash
node "$SKILL_DIR/scripts/skill-map.mjs"
```

调试或测试时可用结构化 JSON：

```bash
node "$SKILL_DIR/scripts/skill-map.mjs" --json
node "$SKILL_DIR/scripts/skill-map.mjs" --platform codex
node "$SKILL_DIR/scripts/skill-map.mjs" --json --root ~/.claude/skills --root ~/.agents/skills
```

JSON 数据字段：
- `instance_id`
- `name`
- `version`
- `invocable`
- `desc`
- `source_category`
- `group_key`
- `install_root`

其中：
- `instance_id` 是稳定实例标识，用来区分跨根目录的同名 skill
- `source_category` 直接来自 top-level frontmatter `category`；缺失时输出空字符串
- `group_key` 仅基于 `name + desc` 的 token-aware 规则推断，用于地图分组
- `desc` 兼容单行与多行 frontmatter `description`
- 缺失 `version` 时输出 `-`
- `user_invocable` 明确为真时输出 `true`，明确为假时输出 `false`，缺失时输出 `null`
- `install_root` 用于说明该 skill 来自哪个本地安装根
- `--platform <id>` 用于显式覆盖当前 CLI 检测

### 2. 分类

地图分组固定使用 `group_key`，不直接使用 frontmatter `category`。

目的：
- frontmatter `category` 表示技能来源元数据，如仓库目录分类
- `group_key` 表示地图里的展示语义分组
- 两者必须拆开，避免把 `developer-tools-integrations` 这类来源分类误当成展示分类

分组顺序固定如下：
1. `◆ 认知与分析`
2. `▲ 文档与表达`
3. `■ 开发与实现`
4. `● 工作流与集成`
5. `★ 系统与维护`
6. `· 未分类`

#### 规则驱动表

| 分组 | 图标 | 建议分组键 | 命中关键词示例 | 说明 |
|------|------|------------|----------------|------|
| 认知与分析 | ◆ | `cognitive-analysis` | `analysis`, `research`, `reading`, `paper`, `study`, `learn`, `summary`, `interpret` | 面向理解、分析、学习、信息提炼 |
| 文档与表达 | ▲ | `document-expression` | `write`, `document`, `card`, `slide`, `screenshot`, `theme`, `format`, `presentation` | 面向文档生成、卡片化、展示与内容包装 |
| 开发与实现 | ■ | `development-implementation` | `code`, `build`, `debug`, `test`, `refactor`, `lint`, `api`, `script`, `git` | 面向开发、调试、构建、工程执行 |
| 工作流与集成 | ● | `workflow-integration` | `workflow`, `sync`, `web`, `browser`, `fetch`, `search`, `automation`, `integration` | 面向联网、集成、自动化、协作流程 |
| 系统与维护 | ★ | `system-maintenance` | `setup`, `install`, `installed`, `config`, `memory`, `inventory`, `map`, `deduplicate`, `cleanup` | 面向安装配置、技能管理、维护与元能力 |
| 未分类 | · | `uncategorized` | 无命中 | frontmatter 与规则都无法判定时的兜底分组 |

约束：
- 规则必须基于 token 归一化与关键词命中，不依赖路径片段或宽松子串误伤
- 无法判定时统一归入 `未分类`
- `source_category` 需要保留原值，但不得覆盖 `group_key`

### 3. 渲染

用 ASCII 方框图呈现，保持稳定、可重复的布局。

```text
╔══════════════════════════════════════════════════════════╗
║              SKILL MAP  ·  {N} skills installed         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ◆ 认知与分析                                            ║
║  +----------------------+-----------------------------+  ║
║  | paper/ v4.3.0        | 论文阅读与分析              |  ║
║  | plain  v4.0          | 好问题与类比解释            |  ║
║  +----------------------+-----------------------------+  ║
║                                                          ║
║  · 未分类                                                ║
║  +----------------------+-----------------------------+  ║
║  | mystery -            | 无法根据元数据判断用途      |  ║
║  +----------------------+-----------------------------+  ║
╠══════════════════════════════════════════════════════════╣
║ Total: 12  Invocable: 7  Groups: 5                      ║
╚══════════════════════════════════════════════════════════╝
```

#### ASCII 输出契约

- 分组按固定顺序输出；空分组可省略，但相对顺序不得变化
- 分组内技能按 `name → install_root → instance_id` 稳定排序
- 名称列左对齐，`invocable = true` 时在技能名后追加 `/`
- 当同名 skill 来自不同安装根时，在名称列追加根目录标签，避免被误读成同一个实例
- 版本紧随名称展示；缺失显示 `-`
- 描述仅保留单行摘要；超长时截断，避免破坏边界
- `desc` 为空时显示 `无描述`
- 若没有扫描到任何技能，仍输出完整边框，并在正文显示 `No installed skills found under configured skill roots`
- 若仅有一个技能，仍使用相同模板，不切换为其它格式
- 底部统计行至少包含：`Total`、`Invocable`、`Unknown`、`Groups`

### 4. 输出

直接输出脚本生成的 ASCII 地图：
- 不生成文件
- 不写入磁盘
- 不省略统计信息
- 不把原始 JSON 直接贴给用户，除非用户明确要求
- 不把“本机已安装 skill”误说成“可安装 catalog”

### 5. 相似度分析（--analyze）

当用户想要**清理重复 / 整理技能组合**时启用。脚本只生成建议，**不删除、不移动、不归档**任何文件。

```bash
node "$SKILL_DIR/scripts/skill-map.mjs" --analyze
node "$SKILL_DIR/scripts/skill-map.mjs" --analyze --json
node "$SKILL_DIR/scripts/skill-map.mjs" --analyze --min-score 0.4
```

数据流：

1. 按 `--json` 模式一样扫描本地 skill 根目录
2. 对每个 skill 的 `name + desc (+ tags)` 做 CJK-aware 分词、去停用词
3. 两两计算 Jaccard 相似度 `|A ∩ B| / |A ∪ B|`
4. `--min-score`（默认 0.30）之下的 pair 被过滤
5. 用连通分量把高相似度 pair 合并成簇（至少 2 个成员）
6. 根据簇内最高分给出建议动作：
   - `likely-duplicate`（≥ 0.75）— 疑似重复
   - `consider-merge`（≥ 0.50）— 建议合并
   - `review`（≥ 0.30）— 人工复查

JSON 输出契约：

| 字段 | 类型 | 说明 |
|------|------|------|
| `generated_at` | ISO-8601 UTC | 生成时间 |
| `threshold` | number | 实际使用的阈值 |
| `summary.total_skills` | number | 扫描到的 skill 总数 |
| `summary.clusters` | number | 输出簇数量 |
| `summary.skills_in_clusters` | number | 进入簇的 skill 数 |
| `summary.likely_duplicates` / `consider_merge` / `review` | number | 各分档簇数 |
| `clusters[].id` | string | 稳定的簇 ID（例如 `c1`） |
| `clusters[].action` | enum | `likely-duplicate` / `consider-merge` / `review` |
| `clusters[].max_score` | number | 簇内最高 Jaccard 分数 |
| `clusters[].members[]` | object | `instance_id / name / display_name / install_root / group_key` |
| `clusters[].shared_tokens` | string[] | 最多 8 个共享 token，按频率排序 |
| `clusters[].group_keys` | string[] | 成员涉及的展示分组键（去重后） |
| `clusters[].rationale` | string | 同组 / 跨组 / 单 token 重合的解释语 |
| `pairs[]` | object[] | 全部通过阈值的 pair，包含左右实例 id / display name 及共享 token |

ASCII 报告输出契约：

- 复用主地图的 `╔╠╚` 边框风格
- 按 `likely-duplicate → consider-merge → review` 顺序输出非空段
- 每个簇的首行展示一个成员 + 分数，次行展示第二个成员 + 共享 token 摘要，额外成员逐行列出
- 无相似对时显示 `No similar skills detected above threshold <n>`
- 底部统计行后追加一行 `Suggestions only — this tool never deletes, moves, or archives files.`

使用合约（**交给 Claude 的部分**）：

1. 把脚本输出视为证据，而不是结论
2. 针对每个簇向用户解释：**共享了什么 / 为什么判定相似 / 建议做什么（保留 / 合并 / 归档）**
3. 只有当用户明确同意后才可以进一步操作；本 skill 永远不主动触发删除
4. 如果用户询问"哪个该删"，把判断权留给用户：提供比较依据（版本、user_invocable、install_root、所属 group_key），让用户决定

## 最小验证标准

满足以下条件才算完成：

1. `scripts/skill-map.mjs --json` 能输出合法 JSON 数组
2. JSON 中每条记录都包含 `group_key`、`source_category`、`install_root`
3. JSON 中每条记录都包含稳定的 `instance_id`
4. 默认根目录由当前 CLI 检测或共享根兜底决定，而不是固定写死两条路径
5. `group_key` 只基于 `name + desc` 的 token-aware 规则推断，`source_category` 不覆盖它
6. `description` 同时兼容单行与多行 frontmatter，且不会串入其它 frontmatter 字段
7. `version` 缺失时为 `-`，`user_invocable` 缺失时为 `null`
8. 空目录与单技能场景下，地图渲染规则仍成立
9. 默认可跨 Windows、macOS、Linux 运行，不依赖 bash 专用实现
10. 同名 skill 跨根目录共存时，不会在扫描阶段被吞掉
11. `scripts/skill-map.mjs --analyze --json` 输出 `generated_at / threshold / summary / clusters / pairs` 字段
12. `--analyze` 下的每个簇都必须包含 `id / action / max_score / members / shared_tokens / group_keys / rationale`
13. 无相似对时 `--analyze` 仍输出完整边框，并显示 `No similar skills detected above threshold <n>` 与不删除承诺
