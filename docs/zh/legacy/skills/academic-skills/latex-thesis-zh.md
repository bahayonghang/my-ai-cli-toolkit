# latex-thesis-zh

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

中文学位论文 LaTeX 助手，支持博士/硕士论文写作。

## 概述

LaTeX Thesis ZH 是中文博士/硕士学位论文的 LaTeX 写作助手。提供结构完整性检查、GB/T 7714 格式验证、编译（xelatex/lualatex）、中文学术表达规范和术语一致性分析。

## 核心原则

1. **绝不修改** `\cite{}`、`\ref{}`、`\label{}` 和公式环境内容
2. **绝不捏造** 参考文献条目
3. **绝不擅改** 专业术语
4. **始终** 先以 diff 格式输出修改建议
5. **必须** 先运行结构映射再开始分析
6. **中文文档必须** 使用 XeLaTeX 或 LuaLaTeX 编译

## 快速开始

### 编译文档

```bash
# 自动检测（中文用 XeLaTeX）
python scripts/compile.py main.tex

# 指定编译器
python scripts/compile.py main.tex --compiler xelatex

# 使用编译配方（推荐）
python scripts/compile.py main.tex --recipe xelatex-biber
```

### 结构映射

```bash
python scripts/map_structure.py main.tex  # 必须首先运行
```

## 五层工作流

### Layer 0: 结构映射（必须）

映射论文结构，检测模板类型，确定处理顺序。

### Layer 1: 结构完整性检查

- **前置部分**: 封面、声明、摘要（中英文）、目录
- **正文部分**: 绪论 → 相关工作 → 核心内容 → 结论
- **后置部分**: 参考文献、致谢、发表论文目录

### Layer 2: GB/T 7714 格式检查

- 参考文献格式 (biblatex-gb7714-2015)
- 图表标题格式（宋体五号）
- 公式编号（如 (3.1)）

### Layer 3: 中文学术表达

| 口语化 | 学术表达 |
|--------|----------|
| 很多研究表明 | 大量研究表明 |
| 效果很好 | 具有显著优势 |
| 显然、毫无疑问 | 研究表明、实验结果显示 |
| 我们用了 | 本文采用 |

### Layer 4: 长句分解

触发条件：>60 字符或 >3 个分句

### Layer 5: 表达重构

```latex
% 修改建议（第23行）
% 原文：我们使用了ResNet模型。
% 修改后：本文采用ResNet模型作为特征提取器。
```

## 支持的模板

| 模板 | 院校 |
|------|------|
| thuthesis | 清华大学 |
| pkuthss | 北京大学 |
| ustcthesis | 中国科学技术大学 |
| fduthesis | 复旦大学 |
| generic | 通用 GB/T 规范 |

## 常见问题

### 编译错误

```bash
# 清理辅助文件
latexmk -c

# 完全清理
latexmk -C
```

### 字体问题

确保安装中文字体：
- 宋体 (SimSun)
- 黑体 (SimHei)
- 楷体 (KaiTi)
- 仿宋 (FangSong)

## 相关技能

- [latex-paper-en](./latex-paper-en) - 英文论文 LaTeX 助手
- [typst-paper](./typst-paper) - Typst 论文助手
