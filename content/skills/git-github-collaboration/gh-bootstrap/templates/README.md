# Templates Directory

本目录存放 gh-bootstrap 的内置模板文件。

## When to Use

- **内置组件**：无需从外部仓库下载的组件模板
- **默认配置**：当外部模板下载失败时的回退方案
- **快速参考**：常用配置的标准格式

## 目录结构

```
templates/
├── README.md              # 本文件
├── workflows/             # GitHub Actions 工作流模板
├── issue-templates/       # Issue 模板
├── community/             # 社区文件模板
└── configs/               # 配置文件模板
```

## 使用原则

1. **优先使用外部模板**：template-catalog.md 中定义的外部仓库模板优先
2. **内置模板作为回退**：仅当外部下载失败时使用内置模板
3. **保持同步更新**：定期与上游模板同步

## 相关文档

- [specs/template-catalog.md](../specs/template-catalog.md) - 外部模板目录
- [specs/execution-rules.md](../specs/execution-rules.md) - 执行规则
- [phases/04-execution.md](../phases/04-execution.md) - 执行阶段
