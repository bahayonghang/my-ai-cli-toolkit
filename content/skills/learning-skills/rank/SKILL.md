---
name: rank
description: "Domain-reduction skill that finds the smallest set of independent generators behind a messy field and proves them with four tests: generativity, minimality, independence, and predictive power. Use when the user asks for 秩 / irreducible structure / what really holds a domain up, or wants to reduce many phenomena to a small hidden core. Do not use it for ordinary summaries or plain-language rewrites."
category: learning-skills
tags: [reduction, generators, structure, org-mode, note-taking, analysis]
version: "1.0.0"
---

# 降秩引擎

输入一个领域，输出它的秩。

## 秩是什么

秩不是"关键要素"，不是"核心原则"，不是"总结要点"。

秩是：这个领域里真正独立的生成器有几个？用它们能反向生成全部现象？能，才算找到。

如果用户没有给出现象清单，你先补一组足够代表性的现象，再开始降秩。

## 四个判据

这四条全过，秩才立。任何一条失败，推倒重来。

1. **生成性**——用生成器能把每个观察到的现象推回来。一个都不能漏。
2. **最小性**——关掉任何一个生成器，就有现象解释不了。没有冗余。
3. **独立性**——每对生成器能找到真实案例：一个变了另一个没变。
4. **预测力**——用生成器能推导出原始清单之外的现象，且现实中确实存在。

## 怎么写

写一篇散文。不是填一张表。

你的任务是带着读者走一段路：从"这个领域看着挺乱"走到"原来就这两三根线在牵"。这段路怎么走，你自己决定。没有规定的章节、没有规定的格式、没有规定的小标题。

唯一的要求是三条：
- **想一口气读完**——不了解这个领域的人也停不下来
- **记得住**——读完能转身跟朋友用一句话说清楚
- **有落差**——从混沌到极简的反差，就是降秩的美感

四个判据的验证必须做，融进文章里。验证本身就是叙事的一部分——"拆掉一个生成器世界会变成什么样"是好故事，"用生成器推出一个意想不到的现象"是好结尾。不要另设附录。

正文结束后，必须给一个极短的结论区，明确写出：

- `秩：{N}`，或在无法成立时写 `秩：未定`
- `一句话：{可复述的 takeaway}`

如果某个生成器过不了四个判据中的任何一条，就推倒重来。若最终仍无法满足四条，不要硬编结论；写 `秩：未定`，并说明是哪个判据卡住了。

## 输出

1. Read `references/template.org`。
2. 生成时间戳时，使用当前 shell 对应的命令：
   - PowerShell：`Get-Date -Format "yyyyMMddTHHmmss"` 与 `Get-Date -Format "yyyy-MM-dd ddd HH:mm"`
   - POSIX shell：`date +%Y%m%dT%H%M%S` 与 `date "+%Y-%m-%d %a %H:%M"`
3. 确保输出目录存在：
   - PowerShell：`New-Item -ItemType Directory -Force ~/Documents/notes | Out-Null`
   - POSIX shell：`mkdir -p ~/Documents/notes`
4. 写入 `~/Documents/notes/{时间戳}--{领域}的秩__rank.org`
5. 若建目录或写文件失败，不要改写到别的目录；直接把完整 org-mode 内容返回到对话里，并明确说明保存失败。
6. 保存成功后，报告文件路径给用户。
