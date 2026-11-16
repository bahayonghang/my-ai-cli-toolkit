# 优化 image2_UI_skill:去 vendor 化并全面整改

## Goal

把 `skills/developer-tools-integrations/image2_UI_skill` 从「克隆进工作区、未被本仓库纳管的 embedded git repo」整改为「真正入库、符合本仓库规范、文档与能力一致」的 in-repo skill。修复策略 = **去 vendor 化**;范围 = **全面整改**。

本任务是工程化整改,不重写 skill 的方法论内容(规则、流程、案例质量本身已达标,需保留)。

## Background / 审计依据

三轮 git 交叉验证已确认(证据见 design.md):

- `git ls-tree HEAD skills/developer-tools-integrations/` 列出 7 个兄弟 skill + AGENTS.md,**唯独缺 `image2_UI_skill`** → 从未提交。
- 目录自带 `.git`(remote = `github.com/zhu-guli326/image2_UI_skill.git`),被 git 当作 **embedded repository**,`status` 折叠为单个未跟踪目录;rtk 的 `git status` 又过滤 `??`,叠加后彻底隐身,导致会话启动误报 "clean"。
- `scripts/image2_asset.py:46` 的 fallback 指向兄弟 skill `developer-tools-integrations/openrouter-icu-image/`,**该目录在本仓库不存在** → 文档承诺的「备案通道」断裂。
- frontmatter 仅 `name`+`description`,缺 `category/tags/version`;`check.py` 报 `Top-level category is missing`,与所有兄弟 skill 及仓库规范不符。

## Requirements

### R1 去 vendor 化纳管(关键 · 阻塞其余所有项)
- 移除嵌套 `.git`,使该目录成为父仓库的普通受跟踪内容。
- 整个 skill(SKILL.md、references、scripts、agents、assets、demo、validate.ps1)被父仓库 `git` 跟踪并提交。
- clone 父仓库的人能完整获得该 skill。

### R2 修复断裂的 fallback 依赖
- 让 `image2` 不可用时的「备案通道」行为**与文档一致**:要么真正可用,要么在缺依赖时给出准确、可操作的报错,且文档不再无条件宣称「自动备案成功」。
- 消除「文档承诺的能力 ≠ 本分发实际可用能力」的落差。

### R3 元数据与命名合规
- frontmatter 补齐 `category`(= `developer-tools-integrations`)、`tags`、`version`,对齐兄弟 skill 形态(可含 `argument-hint`/`allowed-tools`)。
- 目录命名与 frontmatter `name` 对齐为 kebab-case。

### R4 SKILL.md 瘦身(Yao Meta「SKILL.md 要瘦」)
- 把大段执行细则下沉到 `references/`,SKILL.md 保留路由 + 核心流程 + 指针。
- `description` 收敛为路由触发,不再承载完整行为规则。

### R5 资产 / 二进制瘦身
- 评估 `assets/`、`demo/` 内 `.mp4/.gif/.png/.jpg`,决定哪些进库、哪些外链或删除,避免父仓库历史膨胀。

### R6 验证接入 CI 与跨平台
- 让该 skill 的结构验证可被仓库统一流程覆盖(`just ci` / `check.py`),不依赖只在 Windows 跑的 `validate.ps1`。
- 清理孤儿文档(`fashion-shopping-app-case-study.md`、`museum-app-case-study.md` 未被引用)。

## Constraints

- 不改写 skill 的方法论正文语义,只做结构、合规、纳管层面的整改。
- Windows + bash 环境;git 经 rtk 代理,**未跟踪状态须用 `rtk proxy git ...` 取地面真相**(普通 `rtk git status` 会隐藏 `??`)。
- Python 校验须 `PYTHONUTF8=1` 前缀,避免 GBK 解码错误。
- 提交遵循 Conventional Commits,带 scope。

## Acceptance Criteria

- [x] **AC1**:`rtk proxy git ls-tree HEAD skills/developer-tools-integrations/` 输出包含该 skill 目录;`git ls-files <skill>` 返回 > 0 个文件;`git add --dry-run <skill>` **不再**出现 `embedded git repository` 警告。
- [x] **AC2**:`PYTHONUTF8=1 python scripts/check.py <skill> --json` 返回 `ok: true` 且**无 `Top-level category is missing` 警告**。
- [x] **AC3**:fallback 缺依赖场景下,`image2_asset.py` 报错信息准确可操作;SKILL.md / image2-entrypoint.md 对备案通道的描述与实际行为一致(无虚假「已自动备案」承诺)。
- [x] **AC4**:SKILL.md 行数较整改前显著下降,核心流程与路由保留,细则可在 `references/` 中找到对应落点。
- [x] **AC5**:目录名与 frontmatter `name` 一致(kebab-case);README 内对路径/安装的引用与新结构一致。
- [x] **AC6**:`just ci` 全绿;skill 的结构验证被 CI 覆盖(不再仅靠 `validate.ps1`)。
- [x] **AC7**:无孤儿引用文档;`validate.ps1` 列为必需的文件全部存在或同步更新。

## Out of Scope

- 重写 image-to-UI 方法论 / 提示词体系。
- 真正联网调用 image2 / OpenRouter 做端到端生图回归(无凭据,标记为 `missing evidence`)。
- 把 `openrouter-icu-image` 作为新 skill 完整引入(列为 R2 的可选分支,见 design.md)。
