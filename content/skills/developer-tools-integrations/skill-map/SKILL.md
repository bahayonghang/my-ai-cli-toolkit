---
name: skill-map
description: "Skill map viewer for locally installed skills. Scans the local installed skill roots (`~/.claude/skills` and `~/.agents/skills`) and renders a stable ASCII overview of installed names, versions, triggerability, and grouping. Use when the user asks what skills are installed on this machine, wants a local skill map, or says '技能地图', '本机 skills', '我装了哪些 skill', 'local skill list', or 'installed skills'. Do not use it for installable catalogs, registries, or recommendations."
version: "1.1.0"
category: developer-tools-integrations
---

# skill-map: 技能地图

扫描当前机器上的**已安装**技能目录，生成一目了然的 ASCII 地图。

只面向安装后的技能目录：
- 默认扫描目标：
  - `~/.claude/skills/*/SKILL.md`
  - `~/.agents/skills/*/SKILL.md`
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
node "$SKILL_DIR/scripts/skill-map.mjs" --json --root ~/.claude/skills --root ~/.agents/skills
```

JSON 数据字段：
- `name`
- `version`
- `invocable`
- `desc`
- `source_category`
- `group_key`
- `install_root`

其中：
- `source_category` 直接来自 top-level frontmatter `category`；缺失时输出空字符串
- `group_key` 仅基于 `name + desc` 的规则驱动推断，用于地图分组
- `desc` 兼容单行与多行 frontmatter `description`
- 缺失 `version` 时输出 `-`
- `user_invocable` 明确为真时输出 `true`，明确为假时输出 `false`，缺失时输出 `null`
- `install_root` 用于说明该 skill 来自哪个本地安装根

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
| 认知与分析 | ◆ | `cognitive-analysis` | `analy`, `research`, `read`, `paper`, `study`, `learn`, `summar`, `interpret` | 面向理解、分析、学习、信息提炼 |
| 文档与表达 | ▲ | `document-expression` | `write`, `card`, `slide`, `doc`, `screenshot`, `theme`, `format`, `present` | 面向文档生成、卡片化、展示与内容包装 |
| 开发与实现 | ■ | `development-implementation` | `code`, `build`, `debug`, `test`, `refactor`, `lint`, `api`, `tool`, `script` | 面向开发、调试、构建、工程执行 |
| 工作流与集成 | ● | `workflow-integration` | `workflow`, `sync`, `web`, `browser`, `fetch`, `search`, `agent`, `automation` | 面向联网、集成、自动化、协作流程 |
| 系统与维护 | ★ | `system-maintenance` | `setup`, `install`, `config`, `memory`, `skill`, `meta`, `manage`, `review` | 面向安装配置、技能管理、维护与元能力 |
| 未分类 | · | `uncategorized` | 无命中 | frontmatter 与规则都无法判定时的兜底分组 |

约束：
- 规则必须基于字段与关键词，不依赖特定 skill 名示例
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
- 分组内技能按 `name` 升序排序
- 名称列左对齐，`invocable = true` 时在技能名后追加 `/`
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

## 最小验证标准

满足以下条件才算完成：

1. `scripts/skill-map.mjs --json` 能输出合法 JSON 数组
2. JSON 中每条记录都包含 `group_key`、`source_category`、`install_root`
3. `group_key` 只基于 `name + desc` 规则推断，`source_category` 不覆盖它
4. `description` 同时兼容单行与多行 frontmatter，且不会串入其它 frontmatter 字段
5. `version` 缺失时为 `-`，`user_invocable` 缺失时为 `null`
6. 空目录与单技能场景下，地图渲染规则仍成立
7. 默认可跨 Windows、macOS、Linux 运行，不依赖 bash 专用实现
