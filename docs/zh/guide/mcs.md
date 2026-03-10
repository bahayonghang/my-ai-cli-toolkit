# MCS TUI

## 它是什么

`MCS` 是 `mcs/` Rust workspace 提供的终端界面二进制。TUI 由两部分配合完成：

- `mcs-core`：负责 discovery、install、diff、metadata parsing、migration、platform resolution
- `mcs-tui`：负责 ratatui/crossterm 终端界面

## 运行方式

```bash
just mcs
```

或：

```bash
cd mcs
cargo run --release --bin mcs --
```

## 仓库根检测

当前实现会向上查找，直到发现 `content/skills/`，再把该目录识别为项目根目录。

所以当前仓库模型是：

- 仓库根下有 `content/`
- skills 在 `content/skills/`
- commands 在 `content/commands/`

如果看不到这套结构，TUI 会直接退出。

## 主要界面

### 平台选择

- 选择目标平台
- 打开 dashboard
- 退出

### 主视图

- `1`：skills
- `2`：commands
- `Tab`：在侧栏、列表和搜索框之间切换
- `/`：聚焦搜索
- `d`：打开详情
- `D`：打开 diff
- `P`：查看平台配置
- `S`：多平台同步

### 安装状态

- `✓` 已安装且最新
- `⚠` 已过期或有 drift
- `○` 未安装

## 存储与安装模型

MCS 会把技能 canonical 副本保存在 `~/.mcs/skills/`，然后向平台目标目录安装：

- 优先 symlink
- 无法创建 symlink 时自动回退 copy

这也是为什么一次性迁移标记会出现在 `~/.mcs/migrations/` 下。

## Prompt 更新行为

默认平台配置里只有 Claude 带有 `prompt_file = "CLAUDE.md"`，因此 TUI 中的 prompt diff / update 流程也是围绕 Claude 设计的。

如果你要扩展 prompt 行为，还应同时查看：

- `mcs/mcs-core/src/core/prompt.rs`
- `platforms.toml`
- [运行时文件](/zh/guide/runtime-files) 中记录的 runtime 资源

## 故障排除

### 无法识别项目根目录

请在仓库根目录运行，确保能看到 `content/skills/`：

```bash
just mcs
```

### 没有 Rust 工具链

通过 [rustup](https://rustup.rs) 安装 Rust。

### 旧终端中显示异常

可使用 ASCII 模式：

```bash
MCS_ASCII=1 just mcs
```

## 相关页面

- [MCS Web](/zh/guide/mcs-web)
- [MCS 架构](/zh/guide/mcs-architecture)
- [安装](/zh/guide/installation)
