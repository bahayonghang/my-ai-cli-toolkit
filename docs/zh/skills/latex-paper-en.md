# latex-paper-en

英文学术论文 LaTeX 助手，支持格式检查、编译、语法分析和表达优化。

## 概述

LaTeX Paper EN 是英文会议/期刊论文的 LaTeX 写作助手。提供格式检查（chktex）、编译、语法分析、长句分解和表达重构功能。

## 核心原则

1. **绝不修改** `\cite{}`、`\ref{}`、`\label{}` 和数学环境内容
2. **绝不捏造** 参考文献条目
3. **绝不擅改** 领域专业术语
4. **始终** 先以 diff 格式输出修改建议
5. **必须** 先运行格式检查再分析文本内容

## 快速开始

### 编译文档

```bash
# 自动检测并编译（推荐）
python scripts/compile.py main.tex

# 指定编译器
python scripts/compile.py main.tex --compiler pdflatex
python scripts/compile.py main.tex --compiler xelatex

# 使用编译配方
python scripts/compile.py main.tex --recipe pdflatex-bibtex
python scripts/compile.py main.tex --recipe xelatex-biber
```

### 格式检查

```bash
python scripts/check_format.py main.tex
python scripts/check_format.py main.tex --strict
```

## 四层工作流

### Layer 0: 预检查（必须）

```bash
python scripts/check_format.py main.tex
python scripts/verify_bib.py references.bib
```

### Layer 1: 语法与风格分析

- 主谓一致、冠词用法
- 时态一致性（方法用过去时，结果用现在时）
- 中式英语检测
- 弱动词替换：make→construct, do→perform, get→obtain

### Layer 2: 长句分解

触发条件：句子 >50 词或 >3 个从句

```latex
% LONG SENTENCE DETECTED (Line 45, 67 words)
% Core Clause: [主语 + 谓语 + 宾语]
% Suggested Rewrite: [简化版本]
```

### Layer 3: 表达重构

```latex
% SUGGESTION (Line 23): 提升学术语调
% Before: We use machine learning to get better results.
% After: We employ machine learning techniques to achieve superior performance.
```

## 期刊/会议规范

| 期刊/会议 | 主要规范 |
|-----------|----------|
| IEEE | 贡献用主动语态，方法用过去时 |
| ACM | 一般事实用现在时，结构化摘要 |
| Springer | 图标题在下，表标题在上 |
| NeurIPS/ICML | 简洁（8页），特定格式 |

## 常见问题

### 弱动词替换

| 原词 | 建议 |
|------|------|
| make | construct, develop |
| do | perform, conduct |
| get | obtain, achieve |
| show | demonstrate, illustrate |

## 相关技能

- [IEEE-writing-skills](./IEEE-writing-skills) - IEEE 论文翻译润色
- [latex-thesis-zh](./latex-thesis-zh) - 中文论文 LaTeX 助手
- [typst-paper](./typst-paper) - Typst 论文助手
