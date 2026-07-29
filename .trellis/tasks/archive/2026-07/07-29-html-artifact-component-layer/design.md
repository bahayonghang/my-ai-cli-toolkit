# Design: html-artifact 组件装配层

## 总体结构

新增一个「组件装配层」,位于既有两层之间:

```
页面级:模板路由(不动)      → 决定页面骨架与叙事结构
节级:  信息形态 → 组件路由(新增) → 决定每个 section 用什么组件
底层:  style-tokens.css + starter-template primitives(不动)
```

## D1 组件片段格式契约

每个 `assets/components/<name>.html` 遵循统一格式(参照 html-express,适配本仓库 token):

```html
<!-- <name>:一句话用途。适用:<信息形态>。<用量建议> -->
<style>
  /* 作用域前缀 .ha-<name>,只引用 style-tokens.css 变量 */
</style>
<div class="ha-<name>">…含真实示例内容的标记…</div>
```

要点:

- 类名前缀 `ha-`(html-artifact),避免与 starter-template 既有类(`hero--*`、`grid-*`、`table--*`)冲突。
- 片段自带 `<style>`,拷贝进产物 `<head>` 或就地内联均可用;装配前必须先内联 `style-tokens.css`,片段不为缺失 token 内置硬编码回退。
- 示例内容只使用仓库可核验事实或非数值流程说明,不用虚构客户、统计、Lorem 或占位符(与 R5 一致)。

## D2 首批组件取舍

以 html-express 的 10 个组件为候选,与 starter-template 既有 primitives 去重:

| 候选 | 决定 | 理由 |
|---|---|---|
| metric-card | 收入 | starter 无对应;高频 |
| comparison-table | 收入(薄封装) | 基于既有 `table--matrix`/`table--decision` 类,片段只提供组装示例 |
| data-table | 收入(薄封装) | 同上,基于 `table--evidence` |
| timeline | 收入 | cookbook 有描述但无即拷片段 |
| checklist | 收入 | starter 无对应;高频 |
| quote-card | 收入 | starter 无对应 |
| code-block | 收入 | 报告类产物高频 |
| details 折叠 | 收入 | 零 JS,配合尺寸压缩策略 |
| badge | 收入 | 状态标签高频;须"颜色 + 文字"双通道(无障碍契约) |
| columns | 不收 | `grid-2/3/4` 已覆盖,片段内直接引用即可 |

首批固定为上述 9 个组件;实现中不得再合并或扩项。`columns` 通过路由表指向既有 `grid-2/3/4`,不新增片段。

## D3 demo-all.html

- 以 starter-template 为骨架,按组件逐节展示,节标题 = 组件文件名。
- 自包含:内联 style-tokens.css 全量内容 + 所有组件 CSS。
- 示例内容取自 html-artifact 自身可核验事实(组件数、装配步骤、离线约束、校验流程),避免用虚构业务数据演示组件。
- 必须过校验器(0 failure),兼作组件层的回归样张:改任一组件后重跑校验 + 目检此页。
- 当前任务为 CLI 执行,不依赖 in-app Browser;通过 DOM/CSS 结构审查确认宽桌面布局、窄屏断点、横向滚动容器、文本换行和 focus 状态。真实浏览器目检不作为本次交付门槛。

## D4 SKILL.md 改动面

集中三处,总增量 ≤ 60 行:

1. 「Layout primitives」节后新增「Component snippets」小节:目录说明 + 信息形态 → 组件路由表 + 与模板路由的两层关系(一张表 + 2-3 句)。
2. 「Creation workflow」前新增「Fast path」小节:触发条件(单页/预估 <900 KB/非高密度评审/无拆分诉求)与三步流程(starter-template → 组件片段 → 校验器);明确快路径仍受输出契约与校验约束。
3. 「Output contract」或「Safety」追加内容诚实三条(R5)。
4. frontmatter `version` 0.3.0 → 0.4.0。
5. 运行 `just docs-sync`,仅通过生成器同步技能目录页。

## D5 兼容与回滚

- 纯增量:不删改既有模板、cookbook、校验器语义;cookbook 仅允许加一行交叉引用。
- 回滚边界:删除 `assets/components/`、`assets/demo-all.html`,还原 SKILL.md 三处小节即可,无其他耦合。
- 测试:`tests/check-html-artifact.test.mjs` 不需改(校验器无语义变化);demo-all.html 作为校验器的真实输入冒烟样本。

## 已拒绝的替代方案

- **把组件 CSS 并入 style-tokens.css / starter-template**:会让所有产物携带未使用组件的 CSS,违背按需装配;拒绝。
- **引入 html-express 品牌色板**:本仓库 token 体系已有明暗模式与语义色,换色板属品牌决策,超出本次范围;拒绝。
- **为组件片段新增校验维度**:先靠 demo-all.html + 人工检查,等出现真实回归再议;避免过度工程。
