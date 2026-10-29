# design-atlas 技术设计

本文件规定跨子任务的契约。子任务的 `design.md` 只补充各自的细节，不得与本文冲突。

## 1. 包结构（改名与全部子任务完成后）

```
skills/development-workflows/design-atlas/
  SKILL.md                      # 路由 + Compact Workflow + Anti-slop Floor 摘要（目标 ≤ 180 行）
  README.md                     # 中英产品页，写明原名 design-md 与 hallmark 归属
  agents/interface.yaml
  evals/evals.json
  references/
    design-system-core.md       # 保留
    design-md-format.md         # 增加 §1 的 theme 格式
    implementation.md           # 增加“禁止编造数据”和 anti-slop 检查步骤
    brand-boundary.md           # 保留
    routing.md                  # 新增：信号、打分、决策规则（子任务 3）
    anti-slop.md                # 新增：分级 gate 表、豁免语法、判断清单（子任务 4）
    review-prompt.md            # 新增：新鲜上下文复核提示（子任务 4）
    texture.md                  # 新增：hallmark texture 配方，主题正文会引用（子任务 2）
  scripts/
    design_catalog.py           # list/search/show/apply + signals/route（子任务 3）
    build_catalog.py            # 新增第三个上游 hallmark（子任务 2）
    slop_check.mjs              # 新增：静态 anti-slop 检查（子任务 4）
  assets/catalog/
    index.json  categories.json
    brands/ styles/ scenes/ themes/          # themes/ 新增
    first-party/ (manifest.json, airy-glass.md, bi.md)
    overlays/dedup.json                      # 新增，first-party，重建时不删除
    overlays/routing.json                    # 新增，first-party，重建时不删除
    LICENSES/ (+ hallmark-LICENSE)
  tests/
    test_design_catalog.py  test_build_catalog.py  test_routing.py
    slop_check.test.mjs  fixtures/slop/...
  reports/skill-ir.json                      # 父任务整合时导出
```

## 2. 条目类型与索引 schema

在 `index.json` 每个 entry 上新增或扩展以下字段，旧字段不变：

| 字段 | 适用 | 说明 |
| --- | --- | --- |
| `kind` | 全部 | 增加 `theme`。id 前缀 `theme:` |
| `format` | 全部 | 增加 `theme`：stitch 式 YAML token，颜色允许 `oklch()`，正文按主题章节 |
| `source` | 全部 | 增加 `hallmark`；`index.json.sources` 增加 hallmark 的 repo URL、commit 和 license |
| `theme` | theme | `{genre, paper:{band,L,hue}, display:{class,face}, accent:{band,hue}, posture, photo, material, pictured}`，从上游头部原样转写 |
| `preview_url` | theme | `https://raw.githubusercontent.com/nutlope/hallmark/<commit>/skills/hallmark/references/themes/<slug>.jpg`。在线可选资源，不随包提供 |
| `superseded_by` | 被取代的旧条目 | 例如 `style:riso → theme:riso`。默认 list/search/route 隐藏，`--all` 显示；`show` / `apply` 仍可用，并打印提示 |
| `cluster` | 可路由条目 | 来自 `overlays/routing.json`，同 cluster 不会同时进入路由前 3 |

新增分类（`categories.json`，order 接在 19 之后，`scene-analytics` 顺延到最后）：

| id | en | zh |
| --- | --- | --- |
| `theme-editorial` | Editorial Themes | 主题·编辑出版 |
| `theme-modern-minimal` | Modern Minimal Themes | 主题·现代极简 |
| `theme-atmospheric` | Atmospheric Themes | 主题·氛围沉浸 |
| `theme-playful` | Playful Themes | 主题·活泼趣味 |

`design_catalog.py` 的 `--kind` 选项增加 `theme`。`claude` 这类跨类型重名的规则沿用：裸 slug 重名时必须写前缀（例如 `editorial` 同时是 style 和 theme）。

## 3. Theme 条目格式（构建时转换，不在 apply 时转换）

`build_catalog.py` 读取上游 `references/themes/<slug>.md`，写出 `assets/catalog/themes/<slug>.md`：

1. YAML frontmatter：`version: alpha`、`name`、`description`（来自上游 `material`），以及从 `:root` 块按角色映射出的 token：
   - `colors`：`canvas←paper`、`surface←paper-2`、`surface-strong←paper-3`、`ink←ink`、`ink-muted←ink-2`、`muted←muted`、`rule←rule`、`primary←accent`、`on-primary←accent-ink`、`focus←focus`、`slot←slot`（存在时）。值保留原 `oklch()` 字符串。
   - `typography.display/body/outlier.fontFamily`、`typography.display.fontWeight←--display-weight`、`letterSpacing←--tracking-display`。
   - `rounded.card/pill`、`elevation.card`、`rule.hair`。
   - `x-theme`：上节 `theme` 字段的副本，供 agent 读取。
2. 正文章节映射，按 stitch 顺序排列：概述段 → `## Overview`；Tokens → `## Colors`（附原 `:root` CSS 块，供逐字复制到 token 层）；Type → `## Typography`；Range → `## Layout`（标注“材质的构图能力，不是页面结构”）；Surfaces → `## Elevation & Depth`；Controls → `## Components`；Motion、Voice → `## Motion`、`## Voice`；Do-nots → `## Do's and Don'ts`（只有 `### Don't`，`### Do` 由 Range 摘要生成，或写“见 Layout”）；Build hint → `## Implementation Hint`；附 `## Known Gaps`（字体授权、未提供的图片）。
3. 引用改写：`texture.md § N` → `references/texture.md § N`；gate 编号（`waive 38iii`、`(83)` 等）保留，因为 `anti-slop.md` 沿用 hallmark 编号；指向 `layout.md`、`craft.md`、`imagery.md`、`gates.md` 的引用，改写为 `anti-slop.md` 中对应 gate，或删除该从句。构建后由测试断言：主题文件中所有 `*.md` 引用都能在 skill 包内解析。
4. 输出 UTF-8、LF、无行尾空格，内容稳定（重复构建字节一致）。

## 4. 去重契约（`overlays/dedup.json`）

```json
{ "schema": 1,
  "verdicts": {
    "riso":   {"verdict": "supersede", "target": "style:riso", "reason": "..."},
    "arcade": {"verdict": "cluster", "cluster": "retro-pixel", "with": ["style:pacman","style:sega"], "reason": "..."},
    "almanac":{"verdict": "distinct", "reason": "..."}
  } }
```

- 50 个上游 slug 必须全部出现，缺一即构建失败。
- `supersede`：给 `target` 条目写 `superseded_by`。target 不存在则构建失败。
- reason ≥ 12 个字符，并且必须说明材质差异或相同点。

## 5. 路由契约（详见子任务 3）

- 命令：`signals --root <dir> [--prompt TEXT]` 输出 JSON；`route --prompt TEXT [--root DIR] [--n 3] [--reroll N] [--kind ...] [--include-brands] [--format text|json]`。
- 可路由集合：未被取代的 theme、style、scene；brand 仅在 `--include-brands` 时纳入（brand boundary：点名品牌走 `show` / `apply`，不走自动路由）。
- 确定性：同一 prompt、同一项目根、同一 reroll，结果字节一致。不使用日期或随机 salt。
- 输出：前 n 个条目，含分数分解（keyword、genre、scene、palette、penalty）和一行理由；以及 `confidence: high|low`（第 1 名与第 2 名分差 ≥ 2 为 high）。
- 退出码沿用：0 成功，1 无可路由结果，2 参数错误。

## 6. Anti-slop 契约（详见子任务 4）

- Gate id 沿用 hallmark 编号（`2a`、`54`、`67`、`38i`……），不重新编号，以便主题正文中的引用有效。
- 本 skill 的分级规则：
  - **Floor**：可访问性、正确性、诚实性（如 26a、27、34、40、41、46a、70、73、76）。不可豁免。
  - **House**：hallmark 中属于作者口味的 Floor，包括 54、58、63、67、19，以及它 Floor 第 11 条覆盖的 2a（紫蓝渐变）、4（卡中卡）、30a（emoji 图标）、47a（手绘窗口）。默认按 FAIL 处理；仅当 DESIGN.md 显式声明该材质时可豁免，例如 `style:gradient` 声明了渐变。
  - **Reflex**：可写理由豁免。
  - **Finish**：只报告。
- 声明材质自动豁免：DESIGN.md 的 token 或正文显式包含 gate 针对的材质时（例如 `x-theme.display.class: mono` 对应 64；frontmatter 字体为 Inter 对应 1；奶油纸 + 衬线 + 赤陶对应 65），检查器报 `WAIVED (declared)`，不报 REFLEX。
- 手写豁免位置：DESIGN.md 中的 `## Anti-slop Waivers` 章节，每行 `- waive <gate> · <evidence> · <reason>`。不要求 CSS 戳。
- 检查器：`node "<skill-dir>/scripts/slop_check.mjs" <paths...> [--design <DESIGN.md>] [--scope page|component|app] [--json]`。exit 0 表示没有未处理的 FAIL/REFLEX；1 表示有；2 表示参数错误。
- token 层识别不依赖命名：`:root`、`[data-theme]`、`.dark` 等选择器中的自定义属性声明，以及 Tailwind config 的 theme 块，都视为 token 层。

## 7. SKILL.md Compact Workflow（目标形态）

1. 判定分支：仅列出、仅审计（`audit <path>`）、实施 UI。
2. 已有 DESIGN.md：直接实施；只有用户要求更换时才重新选。
3. 选条目：
   - 点名品牌、风格、主题或场景 → `show`。
   - 场景 + 品牌/风格同时点名 → 列候选并等待。
   - 要求比较 → `route --n 3` 后等待。
   - 其他情况 → `signals` + `route`，**自动取第 1 名**，输出 Picks 块（选中项、理由、2 个备选、“说‘换成 N’即可切换”），然后继续。
4. `apply` 写入 DESIGN.md。
5. 定制（可选）。
6. 实施：token 层、组件全状态、页面；遵守 Anti-slop Floor；不编造数据。
7. 检查：`slop_check.mjs` 修到 0 FAIL；处理每个 REFLEX；按 `anti-slop.md` 判断清单逐项检查；运行页截图验证；用新鲜上下文复核（有子代理就派子代理，没有就按 `review-prompt.md` 自检并注明）。
8. brand boundary（brand 条目）。
9. 报告：条目及理由、Picks、DESIGN.md 路径、检查结果（FAIL/REFLEX/WAIVED 计数）、截图、遗留问题。

“仅审计”分支：对目标运行 `slop_check.mjs`，再按判断清单检查，只出报告，不改文件。

## 8. Description 与触发边界

- 保留现有触发词：DESIGN.md、品牌名、风格名、BI/经营分析/数据看板。
- 新增：theme 名示例（riso、newsprint、terminal）、“自动选主题 / pick a theme for my project”、“UI 去 AI 味 / anti-AI-slop UI / AI slop audit / 页面看起来像 AI 生成”。
- 反例写进 description 和 evals：文字润色、文案去 AI 味 → `write`；HTML 报告、幻灯片 → `html-artifact`；截图复刻 → `image-to-ui-skill`；后端 → 无。
- 字数上限 1024，由 `scripts/check.py` 强制。

## 9. 兼容与回滚

- 旧条目 id 全部保留。被取代的条目仍能 `apply`，所以已有项目 DESIGN.md 中的 provenance 依旧有效。
- 用 `npx skills add ... --skill design-md` 安装的旧方式会失效。README 写迁移说明。仓库内没有别名机制，不创建软链。
- 回滚点：每个子任务一个提交。父任务整合提交之前，任意子任务都可单独 revert。

## 10. 权衡记录

- **不 vendor sloplint**：它与 hallmark 戳、token 命名、渲染层强耦合（见 research §3），原样引入会在非 hallmark 项目上产生假 FAIL。改为移植约 25 个与 token 命名无关的 M 类检查，保留来源注释。
- **主题预览图不入库**：50 张约 5.5 MB。路由按元数据打分，不需要图片；agent 需要时通过 `preview_url` 在线查看。
- **构建时转换主题**：`show` / `apply` 路径保持统一，转换逻辑集中在一处，可测试。
- **自动选第 1 名而非等待**：这是用户的明确要求。备选与切换方式在 Picks 块中给出，保留纠正的机会。
- **不做日期 salt 多样性**：DESIGN.md 本来就锁定单项目单系统，结果确定可复现更重要。
