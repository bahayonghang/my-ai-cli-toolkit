# 技能管理器 (Skill Manager)

搜索、浏览和安装来自 GitHub 的 31,767+ 社区技能。

## 概述

Skill Manager 是一个 Claude Code 技能管理工具，让你轻松发现和安装来自 GitHub 社区的技能。支持中英文双语搜索、一键安装和自动配置。

## 特性

- 🔍 **智能搜索** - 在 31,767 个技能中快速查找，支持加权评分
- 🌏 **双语支持** - 支持中英文搜索（99.95% 已翻译）
- 📥 **一键安装** - 从 GitHub 自动下载和安装
- 📊 **GitHub 统计** - 显示 stars、forks 等指标
- 📖 **使用指南** - 安装后自动显示配置说明

## 安装方式

技能会自动选择最佳可用方式：

| 方式 | 速度 | 下载文件 | 要求 |
|------|------|----------|------|
| **SVN 导出** | ⚡⚡⚡ 快 | 所有技能文件 | SVN 客户端 |
| **Git 稀疏检出** | ⚡⚡ 中等 | 所有技能文件 | Git |
| **仅 SKILL.md** | ⚡ 慢 | 仅 SKILL.md | 无 |

### 安装 SVN（推荐）

::: code-group
```bash [macOS]
brew install svn
```
```bash [Linux (Debian/Ubuntu)]
apt-get install subversion
```
```bash [Linux (RHEL/CentOS)]
yum install subversion
```
```powershell [Windows]
choco install svn
```
:::

## 使用方法

直接告诉 Claude 你需要什么：

```
我需要一个 Python 测试相关的技能
```

```
帮我找一个 Docker 相关的技能
```

```
搜索 API 开发相关的技能
```

Claude 会：
1. 搜索技能数据库
2. 显示匹配结果和评分
3. 让你选择一个
4. 自动下载完整的技能文件夹
5. 显示配置和使用指南

## 示例交互

**按主题搜索：**
```
用户: 我需要 Python 测试相关的帮助
助手: [搜索数据库并显示结果]
1. pytest-helper (by python-community)
   ⭐ 1,250 stars | 🔀 342 forks
   📝 帮助编写和运行 pytest 测试，支持 fixtures 和断言...
```

**安装技能：**
```
用户: 安装第一个
助手: [下载完整文件夹和所有脚本]
   ✓ 检测到 SVN - 使用高效文件夹下载
   ✓ 使用方式: SVN
   ✓ 已安装文件: SKILL.md, pytest_runner.py, fixtures.py, README.md
```

**中文搜索：**
```
用户: 帮我找 A股 相关的技能
助手: [显示中国股市相关技能]
```

## 搜索算法

智能加权评分：
- **名称匹配**: +10 分
- **描述匹配**: +5 分
- **作者匹配**: +3 分

结果按相关性和 GitHub stars 排序。

## 数据库统计

| 项目 | 数值 |
|------|------|
| 技能总数 | 31,767 |
| 中文翻译 | 31,752 (99.95%) |
| 数据库大小 | 30.33 MB |

## 系统要求

- Node.js >= 14.0.0
- 网络连接
- SVN 客户端（推荐）或 Git

## 注意事项

- 技能安装到 `~/.claude/skills/[skill-name]/`
- 安装后需重启 Claude Code 以加载新技能
- 数据库包含 GitHub 统计数据，可作为质量参考

## 致谢

- 作者: [buzhangsan@github](https://github.com/buzhangsan)
- 技能数据库来源于 skillsmp 社区
