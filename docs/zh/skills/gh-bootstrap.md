# gh-bootstrap

一站式 GitHub 仓库配置初始化工具。

## 概述

GH Bootstrap 是一个综合性的 GitHub 仓库初始化配置工具。它自动设置分支保护、Issue 模板、PR 模板、Actions 工作流等最佳实践配置。

## 功能特性

- 🔒 **分支保护** - 自动配置主分支保护规则
- 📋 **Issue 模板** - Bug 报告、功能请求模板
- 🔀 **PR 模板** - 标准化的 Pull Request 模板
- ⚙️ **GitHub Actions** - CI/CD 工作流模板
- 🏷️ **标签系统** - 预定义的 Issue 标签
- 📄 **文档模板** - README、CONTRIBUTING、CODE_OF_CONDUCT

## 使用方法

```
/gh-bootstrap
```

```
初始化 GitHub 仓库最佳实践配置
```

## 生成的文件

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── config.yml
├── PULL_REQUEST_TEMPLATE.md
├── workflows/
│   ├── ci.yml
│   ├── release.yml
│   └── dependabot.yml
├── CODEOWNERS
└── dependabot.yml

docs/
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md

README.md
LICENSE
```

## 分支保护规则

自动配置的保护规则：

| 规则 | 说明 |
|------|------|
| 需要 PR 审查 | 至少 1 人审批 |
| 需要状态检查 | CI 必须通过 |
| 需要线性历史 | 禁止合并提交 |
| 禁止强制推送 | 保护提交历史 |
| 禁止删除 | 保护主分支 |

## 工作流模板

### CI 工作流

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

### Release 工作流

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    # 自动发布配置
```

## 标签系统

| 标签 | 颜色 | 描述 |
|------|------|------|
| bug | 红色 | 问题/缺陷 |
| enhancement | 蓝色 | 新功能 |
| documentation | 绿色 | 文档相关 |
| good first issue | 紫色 | 适合新手 |
| help wanted | 黄色 | 需要帮助 |

## 最佳实践

1. **在新仓库创建后立即运行** - 建立标准化基础
2. **根据项目调整** - 修改模板适应项目需求
3. **保持更新** - 定期更新工作流版本
4. **团队协作** - 确保团队了解贡献流程
