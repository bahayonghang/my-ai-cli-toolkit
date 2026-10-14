# 先行研究（2026-10-14）

## 方法

- 工具：`.claude/skills/qiaomu-meta-skill/scripts/search_skillsmp.py`，`--limit 8 --sort stars`。
- 未使用 `npx skills find`：Windows 下 Python 子进程直接调用 `npx` 报 WinError 2。skills.sh 安装量指标为 `missing evidence`。
- 查询：`DESIGN.md design system`、`design style catalog frontend`、`brand inspired design tokens`。
- 指标说明：`repo_stars` 是所在仓库的星数，不是 skill 的安装量或质量评分。

## 结果

按星数排序时，前排结果多为与设计目录无关的大仓库 skill（openclaw `oracle`、mattpocock `codebase-design` / `grill-me`、affaan-m `brand-voice`）。去重后与本任务相关的候选：

| 候选 | 仓库星数 | 相关性 | 结论 |
|---|---|---|---|
| affaan-m/ecc `design-system` | 276549 | 从现有代码库提取 token 或审计视觉一致性 | adapt：借鉴"已有设计源优先"的思路，即目标项目已有 DESIGN.md 时按它实施，不重新选型 |
| affaan-m/ecc `brand-discovery` | 276549 | 品牌身份访谈，产出 brandbook | reject：范围是品牌策略，不是 UI 设计系统 |
| bergside/awesome-design-skills | 本地 checkout | 67 个风格 skill，通用模板节完全相同 | keep：通用核心 + 风格 token |
| VoltAgent/awesome-design-md | 本地 checkout | 84 个品牌 DESIGN.md（Stitch 格式） | keep：品牌目录 + DESIGN.md 结构规范 |

## 未取得的证据

- 候选 `design-system` 的 SKILL.md 正文、许可证与维护状态未逐个打开核对：`missing evidence`。
- skills.sh 安装量：`missing evidence`。

## 原创部分

- 两个上游目录合并为一个离线目录，带中英文类别、搜索与 `apply` 覆盖保护。
- 风格条目把上游分散在 SKILL.md 中的可访问性、语气、Do/Don't 合并回 DESIGN.md，使每个条目都能单独作为项目根 DESIGN.md 使用。
- 品牌边界规则：实施时不复制 logo、wordmark、品牌名或专有字体。
