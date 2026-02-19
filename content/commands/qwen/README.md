# Qwen CLI Commands

这个目录用于存放 Qwen CLI 特定的命令文件。

## 格式说明

从 2025 年开始，Qwen CLI 已经采用 **Markdown 格式**的命令文件（与 Claude Code 一致）。

命令文件格式：
- 文件扩展名：`.md`
- 可选的 YAML frontmatter（用于描述等元数据）
- Markdown 格式的提示内容

## 目录结构

```
commands/qwen/
├── README.md          # 本说明文件
└── <command>.md       # 命令文件（Markdown 格式）
```

## Fallback 机制

如果本目录为空或不存在特定命令，安装脚本会自动 fallback 到 `commands/claude/` 目录，因为两者使用相同的 Markdown 格式。

## 参考文档

- [Qwen Code 官方文档 - Commands](https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/)
- Qwen CLI 命令存储位置：`~/.qwen/commands/` 或 `<project>/.qwen/commands/`

## 注意事项

⚠️ **已废弃的 TOML 格式**：Qwen CLI 之前使用 TOML 格式，但现在已经废弃。请使用 Markdown 格式。
