# 技术设计：git-commit skill 优化

对应 `prd.md` R1–R8。改动面：1 个 Python 脚本、SKILL.md、2 个 reference 文档、evals.json、新增 1 个 Node 测试文件、interface.yaml、版本号。无架构级变更，此文档只固定关键接口语义与取舍。

## D1 `--max-header-width`（R1）

- 签名：`--max-header-width <int>`，默认 `72`；`argparse type=int`，值 `< 20` 时报参数错误（防误传 0/负数使校验失效）。
- 语义不变量：**度量口径仍是 `display_width()` 显示列**（CJK/emoji=2），不是字符数。commitlint 的字符数上限与显示列不完全等价，SKILL.md 措辞用「将仓库上限作为 `--max-header-width` 传入」并注明口径差异——显示列口径永远 ≥ 字符数口径，因此用仓库字符上限做显示列上限是**偏严格**的安全方向，不会放行超仓库限制的 header。
- 报错文案模板：`Commit header is {W} display columns wide; limit is {N}. Tighten the summary, drop the scope, or pass --max-header-width if the repo allows longer headers.`

## D2 自定义 type（R2）

- 移除 `choices=`；新增 `--emoji <char>` 显式指定 header emoji（对内置 type 也允许覆盖，保持正交）。
- emoji 解析优先级：`--no-emoji` > `--emoji <char>` > `TYPE_EMOJIS[type]` > （未知 type）无 emoji + stderr 一行提示 `Unknown type '{t}' has no built-in emoji; pass --emoji or --no-emoji to silence this note.`（提示不影响退出码）。
- type 校验：仅约束为 `^[a-z][a-z0-9-]*$`（小写、无空格），拦截手滑传入整句的情况；不维护白名单。
- 兼容性：内置 11 type 不传新 flag 时输出逐字节不变（含 stderr 无新增输出）。

## D3 `--output` 文档化 + PowerShell 编码（R3）

- 脚本无改动（`--output` 已 UTF-8 写文件）。只改 SKILL.md：
  - §4 optional arguments 列表补 `--output`、`--max-header-width`、`--emoji`。
  - §5.3 改写为：compose 时直接传 `--output "$(git rev-parse --git-dir)/COMMIT_MSG_SKILL"`（PowerShell：`--output "$(git rev-parse --git-dir)\COMMIT_MSG_SKILL"`），并加一句禁令：PowerShell 下不得用 `>` 重定向捕获消息（PS 5.1 默认 UTF-16LE，会让 `git commit -F` 读入乱码）。

## D4 Assisted-by 适配（R4）——定夺：不加新 flag

PRD 留了 `--footer-line` 复用 vs 新增 `--assisted-by` 两个选项。**决定：复用 `--footer-line`，不加新 flag。**理由：

- `Assisted-by: Claude Opus 4.5` 只是一行标准 trailer，`--footer-line "Assisted-by: ..."` 已能精确表达且排序位置正确（用户自定义 footer 区）。
- 该分支仅在「目标仓库有明确 AI 署名政策」时启用，是低频路径；为低频路径加专用 flag 违反本仓库「Simplicity First」。
- 行为规则写进文档而非代码：Preflight §5 检测到仓库惯例（近 20 条 log 或 CONTRIBUTING/AI 政策文件出现 `Assisted-by:`/`Generated-by:`）→ Classify 阶段改用仓库惯例 trailer（经 `--footer-line` 注入），同时省略本 skill 私有 `Agent-*`/`Generated-By: agent` 组（两套并存会造成双重署名噪音）；`[AI]` header 标签保留与否跟随仓库 history 是否出现过。
- agent-workflow.md 新增小节「与社区 Assisted-by 惯例的关系」：给出映射表（`Agent-Model` ≈ `Assisted-by` 的 MODEL 段；`Generated-By: agent` ≈ Apache `Generated-by:` 的 provenance 用途）、保留私有方案的理由（可 grep 的任务/模型/验证三维审计）、以及 kernel 风格格式示例。
- 新增禁止项（message-rules.md 禁止项列表 + agent-workflow.md 边界表）：**不自行添加 `Signed-off-by`**；仓库要求 DCO 时提示用户自行 `git commit -s` 或确认后由用户名义签署——签署主体必须是人。

## D5 Node 测试（R5）

- 路径：`skills/git-github-collaboration/git-commit/tests/compose-commit-message.test.mjs`，`node:test` + `node:assert`，`spawnSync` 直接调 `python`/`py` 跑 `scripts/compose_commit_message.py`（探测顺序复刻 wrapper；CI 环境有 Python，探测失败则 `test.skip`，与 `just python-check` 的前提一致）。
- 用例清单（≥10）：
  1. 基线 feat：header/emoji/结构与金样一致
  2. `--ai` 无 `--agent-model` → exit 2
  3. `--require-why` + feat 缺 `--why` → exit 3
  4. 完整 trailer 排序（BREAKING → footer-line → Closes → Refs → Confidence → Scope-risk → Tested → Agent-Task → Agent-Model → Agent-Prompt-Ref → Generated-By）
  5. 中文 25 字 + `[AI]` + emoji 恰好 ≤72 通过；加长后 >72 → exit 1
  6. `--max-header-width 100`：78 列 header 通过；`--max-header-width 60`：61 列 → exit 1；不传 flag 时 73 列 → exit 1（默认回归）
  7. `--type hotfix --emoji 🚑` 成功；`--type hotfix`（无 emoji flag）→ 无 emoji 输出 + stderr 提示 + exit 0
  8. `--type "Bad Type"` → 参数校验失败非零退出
  9. `--output` 写文件：UTF-8 无 BOM、内容含中文与 emoji、结尾单个 `\n`
  10. `normalize_summary` 去尾部标点（`。`/`.`/`!`/`！`）；issue ref `128`→`#128`、`#130` 原样
- 注意（来自 memory）：PostToolUse formatter 会重排 Markdown 表格，但 .mjs 不受影响；金样断言写在 JS 字符串里，不依赖外部 fixture 文件。

## D6 evals 追加（R7）

- #24：仓库 commitlint 上限 100 → 85 列 header 被放行（断言提到向脚本传递放宽上限，而非缩短 subject）。
- #25：仓库 type-enum 含 `hotfix` → 采用 `hotfix` type 而非降级为 `fix`。
- #26：仓库 CONTRIBUTING 规定 `Assisted-by:` → 输出该 trailer 且不再附 `Agent-*` 私有组、不添加 `Signed-off-by`。

## 兼容与回滚

- 全部新能力 opt-in（新 flag / 新文档分支），默认路径零回归，由测试用例 6 的「不传 flag」分支锁定。
- 回滚边界：单 skill 目录 + evals + 测试文件，`git revert` 单提交即可整体回退；无跨 skill 依赖（interface.yaml 措辞变更随同回退）。
