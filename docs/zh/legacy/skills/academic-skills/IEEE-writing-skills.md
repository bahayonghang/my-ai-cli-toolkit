# IEEE-writing-skills

IEEE 论文翻译、润色与验证技能。

## 概述

IEEE Writing Skills 提供 IEEE 学术论文的翻译、润色、重构和验证服务。专注于保持学术准确性的同时提升语言质量。

## 核心原则

1. **绝不修改** `\cite{}`、`\ref{}`、`\label{}` 和公式内容
2. **绝不捏造** 参考文献
3. **绝不擅改** 专业术语
4. **始终** 先以 diff 形式输出修改建议
5. **保持** 原文技术含义不变

## 功能模块

### 翻译 (Translation)

中英互译，保持学术风格：

```
将这段中文摘要翻译成 IEEE 风格的英文
```

| 原文风格 | 翻译要求 |
|----------|----------|
| 口语化 | 转为正式学术表达 |
| 被动语态 | 保持一致的语态 |
| 长句 | 适当拆分 |

### 润色 (Polish)

提升语言质量：

```
润色这段 Related Work 部分
```

改进点：
- 语法修正
- 时态一致性
- 学术表达规范
- 句式多样性

### 重构 (Restructure)

改善文章结构：

```
重构这段方法描述，使其更清晰
```

### 验证 (Validate)

检查常见问题：

```
验证这篇论文的格式和引用
```

检查项目：
- 引用格式
- 图表标注
- 数学符号
- 术语一致性

## 输出格式

### Diff 注释格式

```latex
% SUGGESTION (Line 23): 改善学术表达
% Before: We use machine learning to get better results.
% After: We employ machine learning techniques to achieve superior performance.
```

### 批量修改

```latex
% === CHANGES SUMMARY ===
% Line 23: 改善表达
% Line 45: 修正语法
% Line 67: 统一术语
% === END SUMMARY ===
```

## IEEE 风格指南

### 时态使用

| 部分 | 推荐时态 |
|------|----------|
| 摘要 | 过去时/现在时混合 |
| 引言 | 现在时（一般事实） |
| 方法 | 过去时 |
| 结果 | 过去时 |
| 讨论 | 现在时 |

### 常见替换

| 口语化 | 学术表达 |
|--------|----------|
| a lot of | numerous/substantial |
| get | obtain/achieve |
| show | demonstrate/illustrate |
| use | employ/utilize |
| big | significant/substantial |

## 最佳实践

1. **逐段处理** - 分段进行润色，便于审阅
2. **保留原意** - 确保技术含义不变
3. **多轮迭代** - 先整体后细节
4. **人工复核** - 最终由作者确认修改

## 相关技能

- [latex-paper-en](./latex-paper-en) - 英文论文 LaTeX 助手
- [typst-paper](./typst-paper) - Typst 论文助手
