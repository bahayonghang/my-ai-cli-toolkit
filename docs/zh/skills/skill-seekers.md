# Skill Seekers

从文档、代码库和 GitHub 仓库生成 LLM 技能，支持 AI 增强分析。

## 概述

Skill Seekers 是一个强大的工具，可以从多种来源自动生成全面的 AI 技能。它分析代码结构、提取文档、识别设计模式，并创建测试示例，为 LLM 代理构建生产级技能。

## 特性

- 📁 **多源支持** - 分析本地代码库、文档 URL、GitHub 仓库和 PDF
- 🎯 **深度分析** - 提取 API 参考、依赖关系图和设计模式
- 🧪 **测试提取** - 自动从测试文件中提取高质量代码示例
- ⚙️ **配置检测** - 识别并记录配置模式
- 🤖 **AI 增强** - 可选 AI 模式提高分析质量
- 📦 **即用打包** - 输出结构化技能，可直接用于 Claude Code

## 安装

```bash
pip install skill-seekers
# 或: uv pip install skill-seekers
```

## 快速开始

### 分析本地代码库

```bash
# 基础分析
skill-seekers-codebase --directory ./path/to/project --output output/my-skill/

# 深度分析 + AI 增强
skill-seekers-codebase --directory ./path/to/project --depth deep --ai-mode api --output output/my-skill/

# 打包为 Claude Code 技能
yes | skill-seekers package output/my-skill/ --no-open
```

### 抓取文档

```bash
skill-seekers scrape --url https://docs.example.com --output output/docs-skill/
```

### 分析 GitHub 仓库

```bash
skill-seekers github --repo owner/repo --output output/repo-skill/
```

### 处理 PDF 文档

```bash
skill-seekers pdf --file documentation.pdf --output output/pdf-skill/
```

## 命令

| 来源 | 命令 | 说明 |
|------|------|------|
| **本地代码** | `skill-seekers-codebase --directory ./path` | 分析本地代码库 |
| **文档 URL** | `skill-seekers scrape --url https://...` | 抓取网页文档 |
| **GitHub** | `skill-seekers github --repo owner/repo` | 分析 GitHub 仓库 |
| **PDF** | `skill-seekers pdf --file doc.pdf` | 从 PDF 文档提取 |

## 选项

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `--depth` | 分析深度级别 | `surface`, `deep`, `full` |
| `--skip-patterns` | 跳过设计模式检测 | - |
| `--skip-test-examples` | 跳过测试示例提取 | - |
| `--ai-mode` | AI 增强模式 | `none`, `api`, `local` |

## 分析输出

Skill Seekers 生成全面的技能文档：

### 📊 代码库统计

- **检测到的语言**及文件数量
- 每个模块的**分析覆盖率**
- 识别的**设计模��**（工厂、策略、观察者等）
- 提取的**配置模式**

### 🎨 设计模式

自动检测常见设计模式：
- 工厂模式 (Factory)
- 策略模式 (Strategy)
- 观察者模式 (Observer)
- 建造者模式 (Builder)
- 命令模式 (Command)

### 📝 代码示例

从测试文件中提取高质量示例：
- 功能演示
- 配置示例
- 边缘情况处理
- 最佳实践

### ⚙️ 配置模式

分析配置文件以记录：
- 可用设置
- 默认值
- 环境特定配置
- 模式用法

## 输出结构

```
output/my-skill/
├── SKILL.md                 # 主技能定义
├── api_reference/           # 提取的 API 文档
├── dependencies/            # 依赖关系图
├── patterns/                # 设计模式分析
├── test_examples/           # 来自测试的代码示例
├── config_patterns/         # 配置文档
└── code_analysis.json       # 完整分析数据
```

## 使用场景

### 1. 从现有项目创建技能

将代码库转化为 AI 助手：

```bash
skill-seekers-codebase --directory ./my-project --output ./my-project-skill/
skill-seekers package ./my-project-skill/
```

### 2. 记录外部库

从公共文档生成技能：

```bash
skill-seekers scrape --url https://library.docs.com --output ./library-skill/
```

### 3. 打包 GitHub 仓库

将任何 GitHub 仓库转换为技能：

```bash
skill-seekers github --repo facebook/react --output ./react-skill/
```

## 分析深度级别

| 级别 | 说明 | 使用场景 |
|------|------|----------|
| **surface** | 快速概览，基础结构 | 初步探索 |
| **deep** | 完整分析，模式、测试 | **推荐用于技能** |
| **full** | 最大细节，所有附加项 | 全面文档 |

## AI 增强模式

| 模式 | 说明 | 要求 |
|------|------|------|
| **none** | 纯静态分析 | 无（最快） |
| **api** | 云 API 增强 | 已配置 API 密钥 |
| **local** | 本地 AI 模型 | 本地 LLM 设置 |

## 最佳实践

1. **使用 `deep` 分析**创建生产级技能
2. **启用 AI 模式**获得更高质量的结果
3. **打包前检查生成的 SKILL.md**
4. **安装后测试技能**
5. **保持技能专注**于特定领域

## 示例工作流

```bash
# 1. 分析代码库
skill-seekers-codebase \
  --directory ./my-project \
  --depth deep \
  --ai-mode api \
  --output ./skills/my-project-skill/

# 2. 检查生成的技能
cat ./skills/my-project-skill/SKILL.md

# 3. 打包为 Claude Code 技能
skill-seekers package ./skills/my-project-skill/

# 4. 安装到 Claude
cp -r ./skills/my-project-skill ~/.claude/skills/
```

## 系统要求

- Python 3.8+
- 网络连接（用于网页抓取和 GitHub）
- （可选）AI API 凭证以增强分析

## 注意事项

- 生成的技能遵循标准 SKILL.md 格式
- 测试示例从实际测试文件中提取
- 设计模式检测使用置信度评分（> 0.7）
- 配置分析支持多种文件格式

## 致谢

- 工具：Skill Seekers
- 生成的技能使用 C3.x 分析方法论
