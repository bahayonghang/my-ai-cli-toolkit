# 端到端演练（2026-10-29）

Fixture 项目在 scratchpad：`package.json`（name `five-mile-brew`，description “精酿啤酒厂官网”，依赖 astro）和中文 README，没有 DESIGN.md。

1. `signals --root .`：读到项目描述、README、astro 框架；`notes: no CSS token layer found`。
2. `route --prompt "给我们的精酿啤酒厂做官网" --root .`：`confidence high · genre editorial (from: 酒厂, 精酿)`。
   - 第 1 名 `theme:hedgerow`（12.5 分：kw 10.5，genre 2），命中 精酿、啤酒、酒厂。
   - 备选 `theme:carnival`、`theme:newsprint`，都只靠 genre 得分。
3. `apply theme:hedgerow --root .`：写出 DESIGN.md，frontmatter 为 oklch token（canvas、ink、primary、on-primary、focus…），字体为 Prata、Manrope、IBM Plex Mono。
4. 写了一页故意带问题的 index.html（eyebrow、大写字距标签、`transition: all`、缺 `:active`），运行 `slop_check.mjs index.html`：
   - FAIL 10a、FAIL 54、FAIL 67、REFLEX 26b，exit 1。
5. 修复后重跑：`Floor 0 FAIL · House 0 FAIL · Reflex 0 REFLEX`，exit 0。

观察到的小问题：路由命中里出现了 `miles (project)`，是项目名 `five-mile-brew` 词干化后命中 hedgerow 的英文关键词。项目文本权重是 ×0.5，不影响结果，暂不处理。

未覆盖：运行页截图验证和新鲜上下文复核都是 agent 层的步骤，本次演练只验证了脚本链路。
