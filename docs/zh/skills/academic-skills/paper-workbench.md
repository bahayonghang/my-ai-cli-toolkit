# Paper Workbench

统一论文检索、归一化、解释与 x-ray 式拆解的主入口技能。

## 概览

`paper-workbench` 现在是这一组论文技能的主入口。
它把过去分散在论文检索、PDF 归一化、面向理解的解读、以及深度拆解之间的入口统一到了一个技能表面。

## 主要模式

| 模式 | 作用 |
|------|------|
| 默认 arXiv 兼容入口 | 面向 arXiv / AlphaXiv 的论文检索与接入 |
| `--mode interpret` | 面向理解与迁移的论文讲解 |
| `--mode xray` | 面向逻辑模型、增量与批判的论文拆解 |

## 适用场景

- 用户给出 arXiv URL、AlphaXiv URL、论文页面、PDF 或论文 ID
- 需要先拿到一份规范化的机器可读论文记录
- 需要把论文讲明白，帮助理解与复用
- 需要更偏 reviewer-style 的深度拆解
- 你在设计新的论文分析工作流，需要一个规范主入口

## 核心流程

1. 解析论文来源
2. 通过共享论文接入路径完成归一化
3. 按所需模式选择解释或拆解路径
4. 返回结构化论文数据，或模式对应的分析结果

## 支持的输入类型

`paper-workbench` 设计上接受：

- arXiv ID
- arXiv URL
- AlphaXiv URL
- 本地 PDF
- 本地文本文件
- 论文落地页 URL
- 已归一化的 `paper-record` JSON 记录
- 在所选模式支持时，直接分析用户粘贴的论文文本

## 说明

- `paper-workbench` 现在直接内置规范化、解释和 x-ray 所需资产。
- 介绍当前论文工作流时，应优先写 `paper-workbench`。
