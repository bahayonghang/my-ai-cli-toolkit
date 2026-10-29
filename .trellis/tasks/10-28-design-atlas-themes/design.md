# 设计：主题导入

本文件补充父任务 `design.md` §2–§4，与父文件冲突时以父文件为准。

## 上游头部解析

hallmark 主题文件头格式（见 `ref/repo/hallmark/skills/hallmark/references/themes/README.md`）：

```
paper: <band> <L> <hue>       → {"band","L","hue"}
display: <class> <face...>    → {"class","face"}
accent: <band> <hue>          → {"band","hue"}
keywords: a, b, c             → list
photo: <treatment...>         → 原样字符串
pictured: <shape>, <hero>     → 原样字符串
```

直接用 Python 移植 `theme.mjs` 的 `parseHeader`，不调用 Node。上游 `index.json` 只用于交叉校验：两边对同一 slug 解析出的字段必须一致，否则构建报错。

## `:root` token 抽取

- 从 `## Tokens` 下第一个 ```css 块中解析 `--name: value;`。token 块里没有注释，见上游 README。
- 按父 design §3 的角色表映射到 YAML。表中没有的 token（如 `--texture-opacity`）放进 `x-theme.tokens` 原样保留，不丢弃。
- “colourways” 表（部分主题有替代配色）保留在 `## Colors` 正文中，不进 frontmatter。

## 引用改写规则

用一张有序的 `(regex, replacement)` 表实现，放在 `build_catalog.py` 顶部常量中：

1. `` `texture.md` § N `` / `texture.md § N` → `references/texture.md § N`。
2. `` `layout.md` § N `` 等指向未随包提供文件的引用：如果在括号里，删除整个括号；如果是从句，替换成“the shared layout rules”。目标文件清单写成常量。
3. 裸 gate 编号 `(83)`、`waive 38iii` 保持不变。
4. 改写后再扫描一遍。凡是仍匹配 `\b[a-z-]+\.md\b` 但不在允许清单（`texture.md`、`anti-slop.md`、`design-system-core.md`）里的，都记为构建错误。

## 隐藏被取代条目

- `enrich()` 后过滤 `superseded_by`。`--all` 关闭过滤。
- `resolve()` 不过滤，保证旧 id 可解析。
- 文本输出中被取代的条目带 `[superseded → theme:x]` 后缀。

## 重建模式

- `--hallmark` 未给：只更新 brand 和 style，`themes/` 及 index 中的 theme 条目从现有 `index.json` 原样保留，并打印 `themes: kept (no --hallmark)`。这样维护者只更新 VoltAgent/bergside 时不必同时 checkout hallmark。
- `--hallmark` 已给：完整重建 themes，并清理过期文件。
- `--themes-only --hallmark <dir>`：不需要 `--design-md` / `--design-skills`。brand、style、scene 条目及其文件从现有 `index.json` 原样保留，只重建 themes、dedup 字段与 sources.hallmark。本次导入用这个模式，避免依赖另外两个上游的本地 checkout。测试需覆盖：该模式下旧条目字节不变。

## 风险

- 上游主题以后可能新增或删除：dedup.json 缺 slug 时构建失败，强制人工判定。dedup.json 中有多余 slug 时只警告。
- oklch 在旧浏览器不受支持：在 `design-md-format.md` 中说明。实现时如需兼容，由 agent 生成 hex 回退；不在构建期转换。
