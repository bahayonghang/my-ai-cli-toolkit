---
name: word-flow
description: Word-to-card workflow skill that runs `word` first and then `card -i` for one or more explicit English words. Use when the user wants both deep word analysis and a visual card, says 词卡 / word card / word flow, or provides a clear list of English vocabulary items to turn into cards. Do not use it for raw dictionary lookup, generic English sentences, or ambiguous word targets; if the target list is unclear, ask for the exact words.
category: research-learning-knowledge
tags: [english, vocabulary, workflow, card, png, language-learning]
version: "1.1.0"
---

# word-flow: 词卡

一条命令完成：解词 -> 铸卡。支持多词，但只处理明确指定的目标词。

## 依赖关系

这个 workflow 明确依赖两个 skill：

- `word`
- `card -i`

如果 `card` 不可用，不要假装完成卡片生成。此时仍可先完成 `word` 分析，并向用户明确说明卡片阶段被阻塞。

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

对每个单词，严格保持 `word -> card -i` 的顺序。

**步骤 A — 解词（word）**

- 调用 `word`
- 输入该单词
- 保留 Markdown 解析结果，作为后续卡片的唯一内容来源

**步骤 B — 铸信息图（card -i）**

- 以步骤 A 的完整解析内容为输入
- 调用 `card -i`
- 目标产物是 PNG 文件

### 3. 编排策略

- 若环境支持并行，可并行处理多个单词
- 若不支持并行，就顺序处理
- 无论是否并行，单个单词内部都不能打乱顺序

### 4. 失败处理

- 若 `word` 阶段失败：跳过该词的卡片阶段，记录失败原因，继续处理其他词
- 若 `card -i` 阶段失败：不要伪造路径；明确报告失败原因，继续处理其他词
- 若只有部分词成功：最后输出“部分完成”而不是“全部完成”

### 5. 汇总报告

最后输出每个单词的完成情况和卡片路径，例如：

```text
Word Flow Complete
- Obstacle: ~/Downloads/Obstacle.png
- Serendipity: ~/Downloads/Serendipity.png
- Entropy: card generation failed (dependency unavailable)
```

## 关键约束

- 先解词后铸卡，顺序不可逆
- 依赖的是 `word` 与 `card -i`，不是旧命名
- 信息图内容必须来自解词结果，不是字典释义
- 路径只在真实生成成功后才报告
