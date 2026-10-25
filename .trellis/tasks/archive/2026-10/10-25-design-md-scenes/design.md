# 场景条目如何进入 design-md

## 边界

改动限于 `skills/development-workflows/design-md/`，以及 `just docs-sync` 生成的文档页。实现完成后，把场景目录的保留规则补进 `.trellis/spec/guides/skill-authoring-conventions.md` 的 design-md first-party 一节。

不改上游品牌和风格正文，不在仓库根写项目 `DESIGN.md`，不新增技能包。

## 数据流

```text
ref/design/BI
  -> normalize (CRLF to LF, rstrip, one trailing newline)
  -> assets/catalog/first-party/bi.md          权威源
  -> assets/catalog/scenes/analytics/bi.md     与权威源字节相同
  -> index.json entry scene:bi
  -> design_catalog.py apply scene:bi --root <project>
  -> <project>/DESIGN.md + first-party provenance
```

`ref/` 只在制作这一次复制时读取。运行时、测试和重建都不读它。

`build_catalog.py` 已从 `first-party/<slug>.md` 读源，再按条目 `path` 写回。`scene:bi` 的 `path` 使用 `scenes/analytics/bi.md`。`merge_first_party` 已接受 manifest 数组，不必另做一套合并器。

## 索引

`categories.json` 与 `index.json` 的 `categories` 增加：

```json
{"id": "scene-analytics", "kind": "scene", "en": "Analytics and BI", "zh": "分析与 BI", "order": 19}
```

`first-party/manifest.json` 从单个对象改为数组。第一项保持现在的 `style:airy-glass`。第二项为：

| 字段 | 值 |
| --- | --- |
| id | `scene:bi` |
| kind | `scene` |
| slug | `bi` |
| name | `企业级 BI 工作台` |
| category | `scene-analytics` |
| format | `legacy` |
| path | `scenes/analytics/bi.md` |
| source | `first-party` |
| upstream_path | `assets/catalog/first-party/bi.md` |
| description | `浅色、高信息密度的企业级 BI 工作台，用于经营分析和数据看板，覆盖 KPI、趋势、明细表和待办。` |

`index.json` 的 `entries` 追加同一对象。`sources` 不增加 `first-party`。

新 kind 在 `insert_entry` 中没有已有位置，重建后排在全部 brand 与 style 之后。

## CLI

`design_catalog.py`：

- `list` 与 `search` 的 `--kind` 增加 `scene`。
- 文本标题改为 `N entries (84 brand, 68 style, 1 scene)` 这种三项计数。不能再把非 brand 都算成 style。
- `apply` 的写入路径、退出码和 provenance 分支保持不变。`source == "first-party"` 已写出 `source=first-party; license=MIT`。

## 重建清理

`build_catalog.py` 的过期文件清理增加 `scenes/**/*.md`：相对路径不在本次 `files` 里就删除。继续只清理 `brands/*.md` 与 `styles/*.md` 的原有规则。不删除 `first-party/`。

临时目录没有 manifest 时，构建结果与现在相同。

## 技能说明

`SKILL.md` 版本 `0.2.0`。`description` 使用下面这一段，长度 832，无尖括号：

```text
Pick a design language from a categorized offline catalog of 153 entries (84 brands, 68 styles, 1 business scene), write it as DESIGN.md in the project root, then implement or restyle production UI from that file and verify it in a running page. Use when the user asks to list or compare design styles, build a page in the style of a known product (Linear, Vercel, Stripe, Claude, Apple), choose a look such as minimal, editorial, glassmorphism, airy glass, 轻盈毛玻璃, brutalism, or retro, build a BI, analytics, 经营分析, or 数据看板 workbench, create or update DESIGN.md, or implement UI from an existing DESIGN.md / 列出设计风格、按场景选设计、BI 工作台、生成 DESIGN.md、按 DESIGN.md 实施 UI. Not for HTML reports, plans, or slide-like artifacts (use html-artifact); not for recreating a screenshot or mockup (use image-to-ui-skill); not for backend or non-UI work.
```

选择步骤增加：

- 用户说出 BI、经营分析、数据看板或业务场景时，先 `search` 或 `list --kind scene`。
- 同时点名场景和品牌或风格时，给出这些候选项并等待选择。
- 选定后仍用 `apply` 写项目根 `DESIGN.md`。不手抄条目文件。

`references/design-md-format.md` 说明：`scene:*` 当前使用 `legacy`。BI 的 token 在「视觉设计系统」表格，不在 “2. Color Palette & Roles”。

`references/implementation.md` 增加场景阅读规则：从该表格建立 token；页面遵守信息架构四层、图表、表格、无障碍和第 12 节交付顺序。正文开头的角色说明不是另一套技能流程。

`references/brand-boundary.md` 加一句：`scene:*` 不复制品牌资产，也不必套用品牌禁令。只有同时选了 `brand:*` 时才走品牌边界。

`agents/interface.yaml` 的短描述和默认提示提到场景，并保持「一份 DESIGN.md」的写法。

`README.md` 的计数改为 153，分类表加「分析与 BI」一行，示例请求加一条 BI 工作台。

`evals/evals.json`：

- 第 1 条的 18 类改为 19 类，并区分 brand、style、scene。
- 新增一条：为经营分析或数据看板做 BI 工作台时，选择 `scene:bi`，用 `apply` 写 `DESIGN.md`，按规范实施 KPI、趋势和明细，并做运行时核对。

## 兼容与回退

- 品牌 84 与风格 68 的 id、路径、正文不变。
- 单对象 manifest 的测试继续有效。数组只是 manifest 的另一种已支持形状。
- 回退时恢复 manifest 单对象、删除 `first-party/bi.md` 与 `scenes/`，并从 `index.json` 去掉场景分类和 `scene:bi`。`apply` 的写入函数不用分叉，回退不涉及项目侧迁移。

## 取舍

场景文件保持中文 legacy 正文。实施质量取决于代理是否按新的阅读规则取 token。这要在实现后的页面核对里看，本任务不另做一套 stitch 副本。
