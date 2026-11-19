# deep-research-pro: 清除 vendored 残留并对齐文档与版本

- Date: 2026-06-20
- Status: Planning
- Parent: `.trellis/tasks/06-20-rlk-skills-optimization`
- 覆盖发现: F2（P0 文档脱节）、F6（P2 残留与版本漂移）

## Goal

`deep-research-pro` 是从外部市场（OpenClaw/Clawdbot 生态）vendored 进来的 skill，剥离脚本后
留下一批与本仓库约定不符、且与实际实现脱节的元数据与文档。本任务把它收敛成符合本仓库
约定的纯 prompt 技能：SKILL.md frontmatter 为唯一事实源，文档不再描述不存在的工具。

## Confirmed Facts

- 实际形态：纯 prompt skill，`SKILL.md` 用"the current environment's available web tools"，
  **无 `scripts/` 目录**（`find` 确认）。
- F2 文档脱节：
  - `README.md` 详述 `scripts/research --full/--news/--fetch`、`uv` 自动装依赖、DuckDuckGo、
    `clawdhub install`、`git clone github.com/parags/deep-research-pro.git`——全部指向不存在的脚本实现。
  - `package.json:8` `"files": ["SKILL.md", "scripts/research", "package.json"]` 列了不存在的 `scripts/research`。
- F6 残留与漂移：
  - `_meta.json`：`ownerId`、`slug`、`publishedAt`、`version: "1.0.2"`——外部市场发布元数据，本仓库工具链不读。
  - `package.json`：`author: "AstralSage"`、`version: "1.0.0"`、`keywords` 含 `duckduckgo`——与 SKILL.md 不一致。
  - frontmatter `metadata` 块含 `version`（与顶层 `version` 重复）、`homepage`（paragshah）、`clawdbot_emoji`、`clawdbot_category`。
  - **三方版本漂移**：SKILL.md 顶层 `1.0.0` / `_meta.json` `1.0.2` / `package.json` `1.0.0`。
- 仓库约定：skill 以 `SKILL.md` 为入口，可选 evals；`check.py` 的 `ALLOWED_FRONTMATTER_KEYS`
  允许 `metadata`，但不读 `package.json`/`_meta.json`。`metadata.version` 等嵌套字段不被校验。

## Requirements

1. 删除本仓库工具链不使用、且携带虚假/外部信息的市场元数据文件：`_meta.json`、`package.json`。
2. 处理 `README.md`（实现时二选一，见 Open Questions）：
   - (a) 重写为如实描述当前 prompt-only skill（删掉 scripts/research、clawdhub、uv、DuckDuckGo 等不实内容）；
   - (b) 直接删除 README.md，依赖 SKILL.md 自述。
3. 清理 frontmatter `metadata` 块：移除 `clawdbot_emoji`、`clawdbot_category`、重复的 `version`；
   `homepage` 视来源真实性保留或删除。
4. 版本收敛为单一事实源（SKILL.md 顶层 `version`），消除三方漂移。
5. 不改 skill 的触发/工作流/输出结构等行为内容。

## Acceptance Criteria

- [ ] `ls skills/research-learning-knowledge/deep-research-pro` 不再含 `_meta.json`、`package.json`（若按 2(b) 也不含 `README.md`）。
- [ ] `rg -n "scripts/research|clawdhub|duckduckgo|DuckDuckGo|clawdbot" skills/research-learning-knowledge/deep-research-pro` 无匹配（README 若保留则不得再提不存在的脚本/工具）。
- [ ] 全 skill 仅一处 `version`，无三方不一致。
- [ ] `python scripts/check.py skills/research-learning-knowledge/deep-research-pro` 仍 `[OK]`，且无新增 unexpected-key 警告。
- [ ] 触发与工作流内容（When to use / Workflow / Quality rules / Example prompts）保持不变。

## Out Of Scope

- 反向补全 `scripts/research` 脚本实现（本 skill 定位为 prompt-only，不补脚本）。
- evals 约定统一——属 `06-20-rlk-conventions`。

## Open Questions

- README 采用重写 (a) 还是删除 (b)？默认倾向 (a) 重写，保留一份如实的使用说明；若用户认为
  SKILL.md 已足够自述，则 (b) 删除更干净。
- `metadata.homepage`（github.com/paragshah/deep-research-pro）是否保留为来源标注？默认保留，仅删 clawdbot 专有字段。
