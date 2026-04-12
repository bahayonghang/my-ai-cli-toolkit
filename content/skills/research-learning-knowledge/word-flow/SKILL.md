---
name: word-flow
description: Word-to-card workflow skill that runs `word` first and then `card -i` for one or more explicit English words. Use when the user wants both deep word analysis and a visual card, says 词卡 / word card / word flow, or provides a clear list of English vocabulary items to turn into cards. Do not use it for raw dictionary lookup, generic English sentences, or ambiguous word targets; if the target list is unclear, ask for the exact words.
category: research-learning-knowledge
tags: [english, vocabulary, workflow, card, png, language-learning]
version: "1.1.0"
---

# word-flow: 词卡

一条命令完成：解词 -> 铸信息图。支持多词，但只处理明确指定的目标词。

## 参数

直接传入一个或多个英文单词，空格分隔。

```text
/word-flow Obstacle
/word-flow Serendipity Resilience Entropy
```

## 执行

### 1. 收集目标词

只接受“明确指定”的目标词：

- `/word-flow` 后直接跟着的词
- 引号里的词
- 逗号、换行或列表里清楚列出的词

不要把一整句英文里的所有 token 都当成目标词。若候选词不明确，先让用户给出准确词表。

收集后做两件事：

1. 按大小写不敏感去重
2. 保留用户原本想展示的词形

### 2. 处理每个单词

对每个单词，严格串行执行两步：

**步骤 A — 解词（word）：**

调用 Skill tool 执行 `word`，传入该单词。把 Markdown 解析结果留在对话中。

**步骤 B — 铸信息图（card -i）：**

以步骤 A 的完整解析内容为输入，调用 Skill tool 执行 `card -i`。生成 PNG 文件到 `~/Downloads/`。

### 3. 编排

- 若支持 subagent，可把多个单词并行处理。
- 若不支持 subagent，就顺序处理。
- 无论是否并行，单个单词内部都必须保持 `word -> card -i` 的顺序。

### 4. 汇总报告

最后输出每个单词的完成情况和 PNG 路径，例如：

```text
Word Flow Complete
- Obstacle: ~/Downloads/Obstacle.png
- Serendipity: ~/Downloads/Serendipity.png
```

## 关键约束

- 先解词后铸卡，顺序不可逆。
- 明确依赖的是 `word` 与 `card -i`，不是旧的 `ljg-*` 名称。
- 信息图内容必须来自解词结果，不是字典释义。
- 若某个词的卡片生成失败，不要伪造路径；明确报告该词失败原因，并继续处理其他词。
