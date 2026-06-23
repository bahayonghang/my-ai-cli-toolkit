# Design — image2_UI_skill 全面整改

## 0. 证据基线(整改前快照)

| 检查命令                                                          | 整改前结果                                          |
| ----------------------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| `rtk proxy git ls-tree HEAD skills/developer-tools-integrations/` | 含 7 兄弟 skill + AGENTS.md,**无 image2_UI_skill**  |
| `rtk proxy git ls-files <skill>`                                  | 0                                                   |
| `rtk proxy git ls-files --others --exclude-standard               | grep image2`                                        | `image2_UI_skill/`(单目录,未跟踪) |
| `rtk proxy git add --dry-run <skill>`                             | `warning: adding embedded git repository`           |
| `rtk proxy git check-ignore <skill>/SKILL.md`                     | exit 1(未忽略)                                      |
| `PYTHONUTF8=1 python scripts/check.py <skill> --json`             | `ok:true` + warning `Top-level category is missing` |
| SKILL.md                                                          | 419 行;`description` 472 字符                       |
| `<skill>/.git/config` remote                                      | `github.com/zhu-guli326/image2_UI_skill.git`        |

> 这些命令在 implement 完成后复跑,用作前后对照(`rollback boundary` 的判定基线)。

## 1. R1 去 vendor 化(核心,先做)

**问题本质**:目录内嵌 `.git` → 父 git 视其为 embedded repo → 既不入库也不在 `status` 暴露。

**方案**:删除 `<skill>/.git/`(以及多余的 `<skill>/.gitignore`、`.git`-only 配置评估后处理),让目录回归普通文件,再由父仓库 `git add` 跟踪。

- 决策:**不转 submodule**(用户已选去 vendor 化)。理由:本仓库所有 skill 均为 plain files,无一为 submodule;catalog 的语义是「自带一份」,submodule 会破坏 `clone` 即用的体验并使本地改动需回流上游。
- 上游溯源:在 README 顶部或 skill 内保留一行 upstream 出处与 commit(取自删除前的 `<skill>/.git` HEAD),保留可追溯性,而不用 git 机制承载。
- **rollback boundary**:删除 `.git` 前先记录其 `HEAD` commit 与 remote;若需回退,可凭该 commit 重新 `git clone` 还原 vendor 状态。本步骤一旦 `git commit` 进父仓库即不可经 `status` 简单回退,故作为独立提交。

**兼容性**:删除嵌套 `.git` 不影响 skill 运行时(skill 不依赖自身 git 历史)。`scripts/image2_asset.py` 用 `Path(__file__).parents[1]` 定位 skill root,与 git 无关,不受影响。

## 2. R2 fallback 依赖断裂

`_fallback_cli()`(`scripts/image2_asset.py:42-46`)解析顺序:`OPENROUTER_ICU_IMAGE_CLI` 环境变量 → 否则 `<skill>/../openrouter-icu-image/scripts/openrouter_icu_image.py`。本仓库无该兄弟目录。

**两条路线**:

- **路线 A(默认,低风险):诚实化 + 优雅失败。**
  - 保留脚本现有 `_fallback_ready()` 的「CLI not found」报错(已存在,准确),无需改逻辑。
  - 修订 SKILL.md / `references/image2-entrypoint.md`:把「必须自动备案、确保真实生成」降级为「备案通道需满足前置条件(已安装 `openrouter-icu-image` 或设置 `OPENROUTER_ICU_IMAGE_CLI`);不满足时脚本会明确报错,不得谎称已生图」。
  - 在 SKILL.md 增加一段「依赖与前置条件」,显式声明该外部依赖。
- **路线 B(可选,高自含):**把 `openrouter-icu-image` 作为新 skill 引入 catalog。范围更大、可能引入额外凭据/依赖,**默认不做**,留作 follow-up。

**决策**:实现阶段先走 A。A 的产出已让 AC3 可达;B 是增强,非合规必需。`missing evidence`:无 `OPENROUTER_ICU_API_KEY`,无法端到端验证 fallback 真生图,仅验证「缺依赖时报错正确」。

## 3. R3 元数据 + 命名

**frontmatter 目标形态**(对齐 `agent-skill-review` / `goal-meta-skill`):

```yaml
name: image-to-ui-skill
description: <收敛后的路由触发型描述,≤ ~300 字符>
category: developer-tools-integrations
tags: [image-to-ui, codex, frontend, prototype, image2]
version: 0.1.0
argument-hint: "[ui-reference-image]" # 可选
```

- `check.py` 校验:`name` 必须 kebab(现 `image-to-ui-skill` 已合规);`category` 必须 ∈ 规范集且与目录分类一致;`tags` 为字符串列表;`description` 无尖括号、≤1024。
- **目录改名**:`image2_UI_skill` → `image-to-ui-skill`,与 `name` 一致、统一 kebab。
  - 影响面:README 的 clone 路径、`validate.ps1` 的相对断言(用 `$MyInvocation` 取自身目录,改名不影响)、本仓库可能存在的 catalog 索引。
  - 用 `git mv`(在去 vendor 化、文件已跟踪后执行),保留改名历史。
- **决策(改名 vs 保留)**:全面整改下选择改名;若后续发现外部硬编码引用过多,可回退为「保留目录名 + 文档说明」,在 implement 步骤设为可回退点。

## 4. R4 SKILL.md 瘦身

**保留在 SKILL.md**:frontmatter、一句话定位、`核心流程`(12 步精简)、各大块的**一句话规则 + 指向 references 的指针**、`真实生图验真` 的硬性禁止项(高风险,留正文)。

**下沉到 references**(新增/合并文件):

- `常见风险与防护`、`页面级审查`、`原图差距核对与迭代` → `references/review-and-gap-check.md`。
- `字体识别与加载`、`尺寸规划`、`抠图与去背景`、`集成规则`、`交互与跳转` → `references/integration-rules.md`。
- `App 形式触发规则`、`网页交付默认规则` → `references/delivery-app-and-web.md`。

**description 收敛**:仅保留触发词与边界(image to UI / 截图转代码 / iOS 可点击 demo / 必须走 image2、失败走登记的备案通道、勿用 imagegen 替代),行为细则移正文与 references。

**风险**:下沉过程不得丢规则;每条搬走的规则在 SKILL.md 要留指针。用「整改前 SKILL.md 规则清单」做 diff 核对(防止语义丢失)。

## 5. R5 资产瘦身

- 盘点体积:`assets/*.mp4`(demo + 3 案例)、`*.gif`、`*.png/.jpg`、`demo/*/screenshots/*`。
- 决策矩阵:
  - 文档说明必需的小图(case 截图、参考图)→ 进库。
  - `*.mp4` 教学视频体积大且非运行必需 → 优先**外链**(README 已有抖音链接)或移出,避免父仓库历史膨胀;若用户坚持随仓库分发,评估 Git LFS。
  - `demo/` 两个示例可保留(体现能力),但其 `screenshots/validate-*.png` 已被 skill 内 `.gitignore` 排除,去 vendor 化后改由父仓库统一忽略策略覆盖。
- 此项需在 implement 时给出体积数字再定档,避免拍脑袋。

## 6. R6 验证接入 CI + 跨平台 + 孤儿清理

- **CI**:`just ci` 已含 `check.py`(覆盖 frontmatter)、`python-check`(编译 `scripts/*.py`)、`node-test`(本 skill 无 node 测试)。整改后 `check.py` 自动覆盖本 skill;`image2_asset.py` 纳入 `python-check`。
- `validate.ps1`:保留为 Windows 本地深度校验,但**不作为 CI 唯一依赖**;同步其「必需文件」断言到改名/下沉后的新结构(否则会断言失败)。
- **孤儿文档**:`references/fashion-shopping-app-case-study.md`、`museum-app-case-study.md` 未被任何处链接 → 要么在 SKILL.md/README 加引用,要么删除。默认:加引用(内容有价值,与现有 case 一致)。

## 7. 跨切关注点

- 每一步后用 `rtk proxy git status --short` + `rtk proxy git ls-files <skill> | wc -l` 验证跟踪态(普通 `git status` 不可信)。
- 所有 python 调用加 `PYTHONUTF8=1`。
- 改动分组提交(见 implement.md 提交点),保证每个提交可独立回退。

## 8. 风险与回退

| 风险                     | 缓解                               | 回退边界                |
| ------------------------ | ---------------------------------- | ----------------------- |
| 删 `.git` 后丢上游可追溯 | 删除前记录 HEAD/remote 写入 README | 凭记录重新 clone        |
| 改名破坏外部引用         | 先全仓 grep 引用再 `git mv`        | 还原 `git mv`           |
| SKILL.md 下沉丢规则      | 规则清单 diff 核对 + 指针          | 单独提交,可 revert      |
| mp4 已进父历史再想移除   | **进库前**先定外链/LFS             | 进库前决策,避免事后清史 |
