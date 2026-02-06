# Typst 论文技能

Typst 学术论文助手，支持中英文论文的模块化工作流。

## 概述

此技能为使用 Typst 撰写学术论文提供全面的工具包。Typst 是 LaTeX 的现代替代品，具有更快的编译速度和更简单的语法。它支持模块化工作流，包括编译、格式检查、语法分析、长句拆解、学术表达改进、翻译、参考文献管理、去 AI 化编辑和模板配置。

## 功能特性

- **快速编译**: 毫秒级编译速度（相比 LaTeX 的秒级）
- **模块化工作流**: 可独立触发的独立模块
- **多语言支持**: 英文和中文学术论文
- **格式检查**: 页边距、行间距、字体、标题、图表、引用
- **语法分析**: 主谓一致、冠词使用、时态一致性、Chinglish 检测
- **长句分析**: 检测并简化 >50 词（英文）或 >60 字（中文）的句子
- **学术表达**: 用学术替代词替换弱动词
- **翻译**: 中译英，支持领域特定术语
- **参考文献管理**: 支持 BibTeX 和 Hayagriva 格式，多种引用样式
- **去 AI 化编辑**: 在保持技术准确性的同时降低 AI 写作痕迹
- **模板支持**: IEEE、ACM、Springer、NeurIPS 和自定义模板

## 安装

```bash
# 安装技能
uv run python src/install.py install typst-paper

# 或安装所有技能
uv run python src/install.py install-all
```

## 前置要求

安装 Typst CLI：

```bash
# 使用 Cargo（Rust 包管理器）
cargo install typst-cli

# 使用 Homebrew（macOS）
brew install typst

# 使用包管理器（Linux）
# Arch Linux
sudo pacman -S typst

# 或从 https://github.com/typst/typst/releases 下载二进制文件
```

## 触发词

每个模块都可以使用特定的触发词独立调用：

| 模块 | 触发词 | 描述 |
|------|--------|------|
| 编译 | `compile`, `编译`, `typst compile` | 将 Typst 文件编译为 PDF |
| 格式检查 | `format`, `格式检查`, `lint` | 检查页边距、字体、间距 |
| 语法 | `grammar`, `语法`, `proofread` | 分析语法并修复错误 |
| 长句 | `long sentence`, `长句`, `simplify` | 检测并简化复杂句子 |
| 学术语气 | `academic tone`, `学术表达` | 改进学术写作风格 |
| 翻译 | `translate`, `翻译`, `中译英` | 中译英翻译 |
| 参考文献 | `bib`, `bibliography`, `参考文献` | 管理参考文献和引用 |
| 去 AI 化 | `deai`, `去AI化`, `humanize` | 降低 AI 写作痕迹 |
| 模板 | `template`, `模板`, `IEEE`, `ACM` | 配置论文模板 |

## 使用示例

### 1. 编译论文

```
将 main.typ 编译为 PDF
```

或

```
编译 main.typ
```

**Typst 编译命令**：

```bash
# 基础编译
typst compile main.typ

# 监视模式（文件更改时自动重新编译）
typst watch main.typ

# 指定输出文件
typst compile main.typ output.pdf

# 导出为 PNG
typst compile --format png main.typ

# 列出可用字体
typst fonts

# 使用自定义字体路径
typst compile --font-path ./fonts main.typ
```

### 2. 格式检查

```
检查我的论文格式
```

或

```
格式检查
```

检查项目：
- 页边距（通常为 1 英寸 / 2.54cm）
- 行间距（单倍/双倍）
- 字体（Times New Roman 10-12pt）
- 标题层次和编号
- 图表标题
- 引用格式一致性

### 3. 语法分析（英文）

```
检查引言部分的语法
```

或

```
语法检查
```

重点检查：
- 主谓一致
- 冠词使用（a/an/the）
- 时态一致性
- Chinglish 检测

### 4. 长句分析

```
简化方法部分的长句
```

或

```
长句拆解
```

检测句子：
- 英文：>50 词或 >3 个从句
- 中文：>60 字或 >3 个分句

### 5. 学术表达

```
改进结果部分的学术语气
```

或

```
学术表达
```

替换弱动词：
- use → employ, utilize, leverage
- get → obtain, achieve, acquire
- make → construct, develop, generate
- show → demonstrate, illustrate, indicate

### 6. 翻译（中译英）

```
将这段中文翻译成英文
```

或

```
翻译这段中文
```

工作流程：
1. 领域识别（深度学习、时间序列、工业控制）
2. 术语确认
3. 带注释的翻译
4. Chinglish 检查

### 7. 参考文献管理

```
检查我的参考文献是否有缺失字段
```

或

```
参考文献检查
```

支持的引用样式：
- `ieee` - IEEE 数字引用
- `apa` - APA 作者-年份
- `chicago-author-date` - 芝加哥作者-年份
- `mla` - MLA 人文学科
- `gb-7714-2015` - 中国国家标准

### 8. 去 AI 化编辑

```
降低摘要中的 AI 痕迹
```

或

```
去AI化编辑
```

检测并删除：
- 空话（significant, comprehensive, effective）
- 过度确定（obviously, necessarily, completely）
- 机械排比
- 模板表达（in recent years, more and more）

### 9. 模板配置

```
为我的论文设置 IEEE 模板
```

或

```
配置 IEEE 模板
```

支持：
- IEEE 双栏格式
- ACM 格式
- 通用学术论文模板
- 中文论文模板

## 模块化工作流

### 完整英文论文审查

1. 格式检查 → 修复格式问题
2. 语法分析 → 修复语法错误
3. 去 AI 化编辑 → 降低 AI 写作痕迹
4. 长句分析 → 简化复杂句子
5. 学术表达 → 改进学术语气

### 完整中文论文审查

1. 格式检查 → 修复格式问题
2. 去 AI 化编辑 → 降低 AI 写作痕迹
3. 学术表达 → 改进表达
4. 长句分析 → 简化复杂句子
5. 参考文献 → 验证引用

## 输出协议

所有建议遵循统一格式：

```typst
// <模块>（第 <N> 行）[Severity: <Critical|Major|Minor>] [Priority: <P0|P1|P2>]: <问题>
// 原文：...
// 修改后：...
// 理由：...
// ⚠️ 【待补证】：<需要证据/数据时>
```

## Typst vs LaTeX

| 特性 | Typst | LaTeX |
|------|-------|-------|
| 编译速度 | 毫秒级 | 秒级 |
| 语法 | 简洁直观 | 复杂冗长 |
| 错误提示 | 清晰友好 | 晦涩难懂 |
| 学习曲线 | 平缓 | 陡峭 |
| 实时预览 | 原生支持 | 需要额外工具 |

## 最佳实践

1. **使用监视模式**: `typst watch main.typ` 实现实时预览
2. **模块化方法**: 根据需要调用特定模块，而不是完整审查
3. **增量编译**: Typst 只重新编译更改的部分
4. **字体管理**: 使用 `typst fonts` 检查可用字体
5. **版本控制**: Typst 文件是纯文本，非常适合 Git

## 模板

### IEEE 模板

```typst
#import "@preview/charged-ieee:0.1.0": ieee

#show: ieee.with(
  title: [论文标题],
  authors: (
    (
      name: "作者姓名",
      department: [系别],
      organization: [大学],
      location: [城市, 国家],
      email: "author@email.com"
    ),
  ),
  abstract: [摘要内容...],
  index-terms: ("机器学习", "深度学习"),
  bibliography: bibliography("references.bib"),
)
```

### 通用学术论文

```typst
#set page(paper: "a4", margin: (x: 2.5cm, y: 2.5cm))
#set text(font: "Times New Roman", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em, first-line-indent: 1.5em)
#set heading(numbering: "1.1")
```

### 中文论文

```typst
#set page(paper: "a4", margin: (x: 3.17cm, y: 2.54cm))
#set text(
  font: ("Source Han Serif", "Noto Serif CJK SC"),
  size: 12pt,
  lang: "zh",
  region: "cn"
)
#set par(justify: true, leading: 1em, first-line-indent: 2em)
#set heading(numbering: "1.1")
```

## 支持的领域

- 深度学习
- 时间序列分析
- 工业控制
- 计算机科学

## 链接

- [Typst 官方网站](https://typst.app/)
- [Typst 文档](https://typst.app/docs/)
- [Typst Universe](https://typst.app/universe/) - 模板和包

## 许可证

MIT
