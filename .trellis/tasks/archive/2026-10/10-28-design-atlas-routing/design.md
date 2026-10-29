# 设计：自动路由

以 hallmark `theme.mjs deal` 为起点（research §5），扩展三点：中文支持、读取项目信号、结果确定。

## 1. 文本归一

- 英文：小写；按非字母数字切分；去掉停用词（hallmark ASK 表，再加 `app`、`ui`、`website`）；词干化，移植 hallmark 的 `stem`：去 `ing`/`ed`，去尾 `s`，`ss` 保留。
- 中文：不分词。对每个 `keywords_zh` 做子串匹配，大小写无关。关键词长度 ≥ 2 个汉字，避免单字误命中。
- 需求文本 = 用户 prompt + signals 中的项目描述（name、description、keywords、README 摘要）。项目描述部分的命中权重乘 0.5，用户原话优先。

## 2. 打分

对每个可路由条目 e：

```
kw     = Σ 命中关键词的 idf 权重
           英文关键词：所有词干都在需求词集中才算命中
           中文关键词：子串命中
         idf 权重：df ≤ 2 → 3，df ≤ 4 → 2，其他 → 1（df 在全体可路由条目上统计，中英文分开）
genre  = +2 当 e.genre == 推断 genre；否则 −1；未能推断 genre 时为 0
scene  = +4 当 e.kind == scene 且 kw ≥ 3（场景条目专门性最强，命中就优先）
palette= +1 当项目已有 token 的 paper 亮度带 == e.paper.band（signals 能推断时）
deps   = +1 当依赖线索（dashboard / docs / buy …）与 e 的关键词交集非空
score  = kw + genre + scene + palette + deps
```

genre 推断：沿用 hallmark 的英文词表，并补中文同义词。例如 AI、生成式、音乐、视频、语音、沉浸 → atmospheric；SaaS、企业、API、平台、开发者、B2B、后台 → modern-minimal；可爱、儿童、游戏、社区、趣味 → playful。其余默认 editorial。多个 genre 命中时取命中词最多的；平手时取需求文本中最先出现的。

## 3. 选取与多样性

- 排序：score 降序；平手时比较 `sha256(prompt_norm + "|" + root_basename + "|" + id)`，保证确定。
- 取 n 个：移植 hallmark 的 `pickFrom`。第 1 名直接取；第 2 名优先选 paper 带不同、score ≥ 第 1 名 − 2、cluster 不同的条目；之后每一名都要求 cluster 两两不同。
- `--reroll k`：依次排除前 k 轮已选出的条目后再选取，沿用 hallmark 逻辑。
- 置信度：第 1 名 kw > 0，且（第 1 名 − 第 2 名）≥ 2 → `high`；否则为 `low`。

## 4. 输出

文本：

```
route: confidence high · genre editorial (from: 啤酒, 酒厂)
1. theme:hedgerow · Hedgerow · score 9 (kw 6, genre 2, palette 1) · fits: brewery, 精酿, distillery
2. theme:vellum · ...
3. style:... · ...
next: apply theme:hedgerow --root <root>
```

JSON：`{confidence, genre, genre_hits, picks:[{id, name, score, parts:{kw,genre,scene,palette,deps}, hits:[...], cluster}], signals_used:[...]}`。

## 5. Agent 决策规则（写入 routing.md）

- 默认：取第 1 名，直接 `apply`，在回复开头输出 Picks 块：选中项与一句理由、2 个备选、“说‘换成 2’或点名任意条目即可切换”。
- `confidence: low`：仍然自动取第 1 名（这是用户要求），但 Picks 块明确写“匹配度低，建议确认”，并列出用到的信号。
- 用户要求比较或推荐几个：输出前 3 名后等待选择。
- 场景与品牌/风格同时点名：沿用原规则，列候选并等待。
- 无头或批处理运行：取第 1 名，不提问。

## 6. 数据维护

- `routing.json` 由人工（agent 起草、维护者审阅）编写，不是构建产物。
- theme 的 `keywords_en`、axes 在构建时从上游头部注入 index。overlay 中的 theme 条目只写 `keywords_zh` 和 `cluster`。两处的合并由 `design_catalog.py` 在加载时完成，构建脚本不改写 overlay。
- 校验测试保证 overlay 与 index、dedup 的一致性。
