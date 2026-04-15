---
name: word
description: Deep single-word English mastery skill. Unpacks one English word's semantic image, modern usage, confusion points, and memory hook. Use when the user wants to deeply understand one English word, asks for deeper meaning or usage rather than translation, or wants a memorable vocabulary breakdown. Prefer this over `plain` or `learn` for a single vocabulary item. Do not use it for phrases, sentence translation, or multiple words at once; route multi-word card workflows to `word-flow`.
category: research-learning-knowledge
tags: [english, vocabulary, semantics, language-learning, markdown]
version: "1.1.0"
---

## Usage

<example>
User: Deeply explain the word "Serendipity".
Assistant: [用固定的 8 段 Markdown 结构深解这个单词]
</example>

## Instructions

目标不是翻译，而是让用户真正掌握这个词的深层含义、常见用法和易错边界。

一次只处理一个英文单词。若用户给的是短语、整句或多个单词：

- 多个离散单词：建议拆成逐词分析；若还想做卡片，改用 `word-flow`
- 短语或概念：说明这个 skill 只处理单词级对象，必要时改用 `learn`

如果用户同时给了句子上下文，用上下文帮助判定义项；如果没有上下文，默认讲现代英语里最常见的主义项，并明确这是当前聚焦的义项。

直接在对话中用 Markdown 输出。不要写本地文件。

## 输出结构

### 1. 标题行

```md
## {Word} /{IPA}/ {中文短译}
```

- 默认把展示词形处理成首字母大写；若它明显是专有名词、缩写或有特殊大小写，保留原样。
- 若你不确定音标、词源或语义分化史，不要硬编，明确写不确定。

### 2. Surface Anchor

- 用 1-2 句说明这个词在现代英语里最常见的落点。
- 给一个短而准的中文锚点，不要把它压扁成单一义项。

### 3. Original Image

- 写出这个词最早、最物理、最可视的画面。
- 若词源本身有争议，就写最稳妥的解释，不要假装确定。

### 4. Core Semantic Formula

- 提炼成一个可记忆的公式，例如：`温暖 + 时间 + 保护 = 孕育`
- 公式必须真能支撑后面的用法解释，不能只是漂亮句子。

### 5. Deep Explanation

- 用几段高密度说明这个词怎样从原始画面长成现代意义。
- 把词源、语感、抽象义和典型场景连起来。
- 可以加粗关键词，但不要写成词典条目堆砌。

### 6. Usage Map

至少覆盖这些点：

- 它常出现在哪些语境里
- 常见搭配或句法动作是什么
- 语气、语域或情感色彩怎样
- 用户真正该怎么在句子里用它
- 给出 2-3 个短小、自然、可模仿的英文例句

### 7. Confusions and Traps

- 对比 1-2 个最容易混淆的近邻词，说明它像什么、又不是什么。
- 点出常见误译、误用或过度泛化。
- 如果这个词有多个彼此差异较大的义项，说明本次重点讲的是哪一个，其他义项只做简短提示。

### 8. One-Line Epiphany

用引用格式写一句中英双语收束句：

```md
> "English sentence. 中文收束句。"
```

## 关键约束

- 目标是 mastery，不是 dictionary lookup。
- 不要为了显得深刻而写空话。
- 不要把多义词压成一个死翻译。
- 不要跳过用法地图和易混对比；这两部分是硬要求。
- 例句要自然，不要写成词典腔或 AI 金句。
