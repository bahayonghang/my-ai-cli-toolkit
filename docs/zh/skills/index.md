# 技能概览

MyClaude Skills 提供一系列专门的 AI 技能，用于不同的开发任务。

## 可用技能

| 技能 | 分类 | 描述 |
|------|------|------|
| [article-cover](./article-cover) | 设计 | 生成专业的 SVG 封面图 |
| [codex](./codex) | 开发 | 通过 Codex CLI 进行代码分析和网络搜索 |
| [excalidraw](./excalidraw) | 设计 | 创建手绘风格图表 |
| [frontend-design](./frontend-design) | 设计 | 构建独特的前端界面 |
| [gemini-image](./gemini-image) | 设计 | 通过 Gemini API 生成图像 |
| [paper-replication](./paper-replication) | 开发 | 将深度学习论文复现为 PyTorch 代码 |
| [research](./research) | 研究 | 技术研究，支持引用 |
| [spec-interview](./spec-interview) | 规划 | 通过系统性提问完善规格说明 |
| [tech-blog](./tech-blog) | 文档 | 撰写技术博客 |
| [tech-design-doc](./tech-design-doc) | 文档 | 生成技术设计文档 |
| [skill-manager](./skill-manager) | 开发 | 搜索和安装 31,767+ 社区技能 |
| [yt-dlp](./yt-dlp) | 实用工具 | YouTube、Bilibili 等 1000+ 网站的视频下载器 |

### OMO Agents (多代理系统)

| 技能 | 角色 | 描述 |
|------|------|------|
| [omo-agents](./omo-agents) | 概览 | 多代理编排系统使用指南 |
| [sisyphus](./sisyphus) | 编排者 | 复杂任务规划和并行执行 |
| [oracle](./oracle) | 架构师 | 设计决策、代码审查、调试 |
| [explore](./explore) | 侦察兵 | 快速代码搜索和依赖追踪 |
| [librarian](./librarian) | 研究员 | 外部文档和最佳实践 |
| [frontend-engineer](./frontend-engineer) | UI 专家 | 精美、精致的界面 |
| [document-writer](./document-writer) | 写手 | README、API 文档、架构文档 |
| [multimodal-looker](./multimodal-looker) | 分析师 | 图片、PDF、图表分析 |

## 技能分类

### 设计类技能
用于创建视觉资产和界面：
- **article-cover** - 文章 SVG 封面图
- **excalidraw** - 手绘风格图表
- **frontend-design** - 生产级 UI
- **gemini-image** - AI 生成图像

### 开发类技能
用于代码分析和生成：
- **codex** - 使用 Codex CLI 进行深度代码分析
- **paper-replication** - 深度学习论文复现为 PyTorch 代码

### 研究类技能
用于收集和组织信息：
- **research** - 带引用的网络研究

### 文档类技能
用于创建技术文档：
- **tech-blog** - 技术博客文章
- **tech-design-doc** - 设计文档
- **spec-interview** - 规格说明完善

### 技能开发类
用于创建和管理技能：
- **skill-manager** - 搜索和安装 31,767+ 社区技能

### 实用工具

实用工具和辅助功能：
- **yt-dlp** - YouTube、Bilibili 等 1000+ 网站的视频下载器，自动 FFmpeg 检测

### OMO Agents (多代理系统)

受 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 启发，这些技能实现多代理协作，让专业代理协同处理复杂任务。

**核心理念**: 不再是单个 AI 处理所有事情，而是让专业代理协同工作——各自发挥所长——交付更好的结果。

- **sisyphus** - 主编排代理，规划、委派和执行复杂任务
- **oracle** - 专家架构师，负责设计决策和代码审查
- **explore** - 快速代码搜索，定位代码和追踪依赖
- **librarian** - 文档研究员，查找外部文档和最佳实践
- **frontend-engineer** - UI/UX 专家，创建精美界面
- **document-writer** - 技术写手，撰写 README 和 API 文档
- **multimodal-looker** - 视觉分析师，分析图片、PDF 和图表

**快速开始**:
```
@sisyphus 给这个项目添加用户认证功能
```

Sisyphus 会自动协调其他代理完成任务。

## 安装

安装所有技能：

::: code-group
```bash [Linux/macOS]
./install.sh install-all
```
```powershell [Windows]
.\install.ps1 install-all
```
:::

安装指定技能：

::: code-group
```bash [Linux/macOS]
./install.sh install frontend-design excalidraw
```
```powershell [Windows]
.\install.ps1 install frontend-design excalidraw
```
:::
