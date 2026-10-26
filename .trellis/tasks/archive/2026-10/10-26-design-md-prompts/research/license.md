# 许可证与归属

本任务只核对指定来源。采纳集合只有这三份：`ref/design/instruct.md`、`ref/repo/ai-design-skills/skills/landing-page-design/SKILL.md`、`ref/repo/ai-design-skills/skills/design-to-motion/SKILL.md`。不新增上游技能。

## 已核对的 LICENSE

打开并通读 `ref/repo/ai-design-skills/LICENSE`。文件是 CRLF，共 21 行。原文事实如下：

```text
MIT License

Copyright (c) 2026 Elaya
```

许可条件的原句是：

```text
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

因此，若以后把该软件的实质段落抄进技能包，MIT 声明和 Elaya 的版权行必须留在那份文件上。本方案不抄实质段落，所以不把整份 LICENSE 再贴进 `references/`。

## README 与 Credits

`ref/repo/ai-design-skills/README.md` 是 CRLF。Credits 写明：

- `landing-page-design` adapts content from Leonxlnx/taste-skill by Leon Lin, MIT。落地页 SKILL 文末 Credits 同时嵌入 taste-skill 的 MIT 文本，版权行是 `Copyright (c) 2026 Leonxlnx`。
- `design-to-motion` adapts a few general motion rules from emilkowalski/skills、Owl-Listener/designer-skills、dylantarre/animation-principles, all MIT。motion SKILL 的 Credits 把三者分别对应到：只动画廉价属性、控制模糊、不要从零放大、reduced motion；骨架与内容同形、错落入场；错开并列循环、首尾相接。

这三份动效上游的 LICENSE 文件本任务没有另开。MIT 身份按集合 README 和 motion Credits 记录，不把未打开的许可证正文写进技能包。

README 末行写 “No attribution needed”。这句与 LICENSE 对实质副本的 notice 要求不一致。后续改编以 LICENSE 为准：不构成实质副本时不粘贴整份声明；改编后的参考文件仍保留短署名，因为本任务要求归属留在参考上，也因为 README Credits 点名了更上游的作者。

## instruct.md

通读 `ref/design/instruct.md`。文件是 LF（641 个 LF，无 CR），开头是标题「高质量前端工程与 UI/UX 开发规范」，没有许可证头，正文也没有版权行。它在 gitignore 的 `ref/design/` 里，与 `ref/design/BI` 一样视为本仓库材料。改编进技能包后不得再依赖 `ref/`。

## 改编规则

- 只借语义机制，用自己的话写入以后的参考文件。
- 不把上游 `SKILL.md` 整篇或成段粘贴进技能包。包内除根目录外不能再出现名为 `SKILL.md` 的文件。
- 署名写在被改编的那份参考末尾，不写进根 `SKILL.md`。
- `references/landing-page.md` 的署名至少包括：elayadesign/ai-design-skills，MIT，Copyright (c) 2026 Elaya；以及 Leonxlnx/taste-skill，Leon Lin，MIT，Copyright (c) 2026 Leonxlnx。
- `references/design-motion.md` 的署名至少包括：同一 Elaya 集合的 MIT；以及 emilkowalski/skills、Owl-Listener/designer-skills、dylantarre/animation-principles，按 Credits 所称均为 MIT。
- `references/engineering-baseline.md` 不署上游设计技能。它改编自本仓库 `instruct.md`。
- 若以后破例复制了实质段落，该文件必须带上对应的版权行和 MIT 许可声明。当前推荐是不要复制。

## 换行

落地页 SKILL 431 行、motion SKILL 513 行、集合 LICENSE 与 README 都是 CRLF。抽查这三份 Markdown 没有行尾空白，但后续摘录仍必须先转成 UTF-8 LF、去掉行尾空白、文件以一个换行结束。`git diff --check` 会拒绝 CR 和行尾空白。`instruct.md` 已是 LF。

## 先例目录

本任务没有运行 `research_prior_art.py`，也没有跑 skills.sh 或 SkillsMP 的现场检索。Windows 上该脚本会因 `npx` 解析失败，这是已知限制，本任务不改乔木技能。现场目录近邻记为 missing evidence。采纳范围不因此扩大，也不因此缩小上述三份指定来源。
