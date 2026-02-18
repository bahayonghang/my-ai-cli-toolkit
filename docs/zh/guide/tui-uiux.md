# Textual TUI UI/UX 说明（Archived）

本文件记录的是历史上的 Python Textual TUI 视觉优化方案，当前已归档，不再作为主实现。

## 当前状态

- 主交互入口已切换为 Rust MCS：`just mcs`
- `uv run python src/install_tui.py` 保留为兼容壳，内部转发到 MCS

## 请参考

- 最新使用说明：[`docs/zh/guide/mcs.md`](./mcs.md)
- 命令入口：`just mcs` / `just mcs-rebuild`
