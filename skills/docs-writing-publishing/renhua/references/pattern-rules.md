# Renhua Pattern Rules

Use these rules when revising or auditing Chinese AI/tech public writing. The
goal is not to make every sentence casual; the goal is to preserve the author's
actual judgment and remove model-shaped shells.

## Binary Contrast Shells

Do not use:

- `不是 A，而是 B`
- `并非 A，而是 B`
- `不在于 A，而在于 B`
- `不只是 A，更是 B`
- `不仅 A，还/更 B`
- `与其 A，不如 B`
- `不是一两分钟，而是...`

Rewrite by stating the actual claim directly.

Bad:

> 去 AI 味不是把文章改口语，而是保住判断。

Better:

> 写 AI 技术文章时，我更关心判断有没有保住。

Bad:

> 这一步省掉的不是一两分钟，而是整套重复动作。

Better:

> 这一步能省掉来回翻网页、找入口、下载文件、再丢给 AI 的重复动作。

## Command-Template Openings

Avoid short imperative templates that sound like a generic tutorial hook:

- `别急着 X，先 Y`
- `先别 X，先 Y`
- `别 X，先 Y`
- `顺序别反了`
- `别搞反了`
- `记住这句话`

Rewrite by stating the concrete problem, failure, or observation directly.

Bad:

> 用 AI 分析 A 股，别急着问模型，先看数据接得稳不稳。

Better:

> 你让 AI 分析股票，最怕它一本正经地拿错数据。

Bad:

> 做 AI 投资分析，顺序别反了。

Better:

> 做 AI 投资分析时，数据入口不稳，后面的模型分析也会跟着歪。

## Fake Insight Markers

Avoid:

- `真正`
- `其实`
- `本质上`
- `核心在于`
- `关键在于`
- `说白了`
- `归根结底`
- `更重要的是`
- `结果有点出乎意料`
- `这说明`
- `这背后`

Rewrite by entering the claim or evidence directly.

Bad:

> 更重要的是保住三个东西：经验、判断、细节。

Better:

> 我会检查三件事：有没有真实经验，有没有模型判断，有没有工程细节。

## Lecture Colon

Avoid colon-led setup when it turns the sentence into a lesson.

Do not write:

- `我的结论是：`
- `原因很简单：`
- `重点是：`
- `分成三类：`
- `更重要的是：`

Use a plain sentence, or split the idea across paragraphs.

Allow a colon when it introduces a concrete inventory with a clear noun before
it.

Good:

> 这 10 个项目覆盖六类用途：中文改写、英文规则库、写作流水线、风格蒸馏、检测研究、前端审美。

Bad:

> 结果有点出乎意料：这 10 个项目混了几种东西。

## Vague Referents

Avoid vague placeholders when the reader needs a category.

- `东西`
- `这件事`
- `这些`
- `一类`
- `几个方向`

Replace them with the exact category: `用途`, `项目类型`, `规则`, `输出形态`,
`测试结果`, `写作流程`.

## Wrong Time Stance

Match verb tense to the actual work state.

- Use completed verbs when reporting finished tests: `我用了`, `我测了`,
  `我保留了`, `我拆出了`, `我最后合成了`.
- Use future verbs only for real next steps: `我接下来会`, `下一步我会`.
- Do not write `我会用 X` when the text is describing tools already tested or
  selected.

Bad:

> 我会先用这个 skill 处理中文语感。

Better:

> 这轮我保留了中文语感和场景边界处理规则。

## Vague Comparatives

Avoid generic `更适合`, `更像`, `更自然`, `更高级` unless the comparison names
the exact use.

Bad:

> 这套规则更像长期方案。

Better:

> 这套流程可以把选题、证据、审稿、去味和导出串成一条线。

## Abstract Pressure And Empty Focus Shifts

Avoid sentences that sound forceful but do not name a concrete consequence or
action.

Do not write:

- `差距会突然变得很难看`
- `差距会被迅速拉开`
- `会成为新的分水岭`
- `更值得盯的是个人`
- `更值得关注的是...`

Rewrite by naming the visible result, wasted cost, or changed behavior.

Bad:

> 等公司开始给每个人分 AI 额度，差距会突然变得很难看。

Better:

> 等公司开始给每个人分 AI 额度，同样一笔钱，有人只换来几段废话，有人能少开几场会、少返几遍工。

Bad:

> 更值得盯的是个人。

Better:

> 公司账单之外，还要看每个人把额度花到哪里。

## Metaphor And Slogan Endings

Avoid broad metaphors and quotable endings:

- `正确但无聊的模型作文`
- `上下文燃料`
- `能力飞轮`
- `时代分水岭`
- `作者痕迹`
- `把判断盖住`

Use the concrete loss instead.

Bad:

> 文章读起来再顺，也只像一篇正确但无聊的模型作文。

Better:

> 读者看不出作者测过什么、踩过什么坑、为什么得出这个判断。

## Final Scan

Before returning, scan for:

- `不是` near `而是`
- `不在于` near `在于`
- `不只是` or `不仅`
- `别急着`
- `先别`
- `顺序别反了`
- `别搞反了`
- `记住这句话`
- `真正`, `其实`, `本质上`, `核心在于`, `关键在于`
- `更重要的是`
- setup colon after abstract judgment
- vague `更适合` / `更像`
- abstract pressure such as `差距会突然变得很难看`
- empty focus shifts such as `更值得盯的是个人`
- metaphor ending that hides concrete information

If found in final copy, revise before answering. If found in audit mode, quote it
and name the pattern.
