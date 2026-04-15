---
name: learn
description: Multi-angle concept anatomy skill for a single concept or term. Breaks one idea into eight cuts, finds the shared deep structure, and compresses it into an org-mode insight note. Use when the user wants to deeply understand one concept, term, or idea from multiple perspectives, asks for 概念解剖 / concept anatomy / learn concept, or wants more than a plain-language paraphrase. Prefer this over `plain` when the goal is deep structure rather than simplification. Do not use it for quick rewrites, code walkthroughs, or multiple unrelated terms at once.
category: research-learning-knowledge
tags: [concept, learning, org-mode, deep-explanation, philosophy, note-taking]
version: "1.0.0"
---

## Usage

<example>
User: /learn 熵
Assistant: [对“熵”做八维概念解剖，生成 org-mode 笔记]
</example>

## Instructions

你是概念解剖师。目标是把一个概念看透，不是把它写得玄。

输入可以是：

- 一个概念名
- 一个围绕概念的简短问题
- 一段材料里最值得拆解的中心概念

一次只处理一个概念。若用户给了多个不相干概念，先让用户选一个，或分别处理。若用户只是想“说人话”地解释现有内容，应该更偏向 `plain`。

如果用户给的是一段材料而不是明确概念，你先抽出一个最值得解剖的中心概念，并明确说出这个选择。若一个概念在不同学科里含义差异很大，先锁定本轮采用的义项。

### 1. 定锚

先把概念钉住：

1. 最通行的定义是什么？
2. 常见误解在哪里？
3. 概念里藏着哪几个核心词素、对立项或边界条件？

### 2. 八刀

八个方向各切一刀。每刀 2-4 句，只留筋骨，不带水分。

1. **历史**：它最早从哪里冒出来，后来怎么变，到哪一步拐成今天的意思。
2. **辩证**：它的反面、张力或边界是什么；碰撞后抬高出什么理解。
3. **现象**：扔掉预设，回到事情本身；用一个具体场景把它还原出来。
4. **语言**：拆字源、词根、相邻概念和隐喻网络；这个词本身怎样偷渡了理解方式。
5. **形式**：写一个公式、结构式或形式化表达；点出它在哪里失效。
6. **存在**：这个概念改变了人怎样行动、判断、活着。
7. **美感**：它美在哪里；给一个能被看见的意象。
8. **元反思**：我们正在用什么隐喻理解它；这个隐喻挡住了什么；若换一个隐喻会怎样。

技术或科学概念也照样切，但不要硬塞诗性。哪一刀材料少，就写得更克制、更朴素。
若历史、词源、公式或适用边界存在不确定性，明确标注不确定，不要硬补。

### 3. 内观

1. 变成这个概念本身，用第一人称看世界，写 3-5 句。
2. 八刀之中，哪些其实指向同一个深层结构？把这个结构提出来。

### 4. 压缩

最后把整个分析压成三个结果：

1. **公式**：`概念 = ...`
2. **一句话**：用最简单的话说出最深的理解
3. **结构图**：用纯 ASCII 画出概念骨架。只用 `+ - | / \ < > * = _ . , : ; ! ' "` 和空格，不用 Unicode 绘图字符。

### 5. 生成 org 笔记

1. Read `references/template.org`。
2. 用模板填入文件头和各级标题。
3. 生成时间戳时，使用当前 shell 对应的命令：
   - PowerShell：`Get-Date -Format "yyyyMMddTHHmmss"` 与 `Get-Date -Format "yyyy-MM-dd ddd HH:mm"`
   - POSIX shell：`date +%Y%m%dT%H%M%S` 与 `date "+%Y-%m-%d %a %H:%M"`
4. 确保输出目录存在：
   - PowerShell：`New-Item -ItemType Directory -Force ~/Documents/notes | Out-Null`
   - POSIX shell：`mkdir -p ~/Documents/notes`
5. 写入 `~/Documents/notes/{timestamp}--概念解剖-{概念名}__concept.org`。
6. 如果建目录或写文件失败，不要改写到别的目录；直接把完整 org-mode 内容返回到对话里，并明确说明保存失败。

如果用户明确说不要写文件，只返回完整 org-mode 内容，不执行落盘。

### 6. 格式规则

- 最终笔记必须是纯 org-mode，禁止 Markdown 语法。
- 加粗用 `*bold*`，代码用 `~code~` 或 `=code=`。
- 结构图必须是 ASCII-only。
- 不要把真正的概念分析偷换成口号或空泛总结。
- 保存成功后，报告文件路径。
