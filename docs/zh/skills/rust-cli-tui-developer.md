# rust-cli-tui-developer

Rust CLI 和 TUI 开发专家指导。

## 概述

Rust CLI/TUI Developer 是一个专家级技能，提供 Rust 命令行和终端用户界面开发的全面指导。涵盖 clap、inquire、ratatui 等核心库的最佳实践。

## 核心库

### 参数解析 - clap

```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "应用描述")]
struct Cli {
    /// 输入文件路径
    #[arg(short, long)]
    input: PathBuf,

    /// 详细输出
    #[arg(short, long, default_value_t = false)]
    verbose: bool,
}
```

### 交互提示 - inquire

```rust
use inquire::{Select, Text, Confirm};

// 文本输入
let name = Text::new("你的名字?").prompt()?;

// 选择菜单
let options = vec!["选项1", "选项2", "选项3"];
let choice = Select::new("选择一个:", options).prompt()?;

// 确认对话框
let confirm = Confirm::new("继续?").prompt()?;
```

### TUI 框架 - ratatui

```rust
use ratatui::{
    prelude::*,
    widgets::{Block, Borders, Paragraph},
};

fn ui(frame: &mut Frame) {
    let block = Block::default()
        .title("标题")
        .borders(Borders::ALL);

    let paragraph = Paragraph::new("内容")
        .block(block);

    frame.render_widget(paragraph, frame.size());
}
```

## 项目结构

```
src/
├── main.rs         # 入口点
├── cli.rs          # 命令行定义 (clap)
├── app.rs          # 应用状态
├── ui/
│   ├── mod.rs      # UI 模块
│   ├── layout.rs   # 布局定义
│   └── widgets.rs  # 自定义组件
├── handlers/
│   ├── mod.rs      # 事件处理
│   └── input.rs    # 输入处理
└── tui.rs          # 终端设置
```

## 最佳实践

### CLI 设计

1. **遵循 POSIX 约定** - 短选项用 `-x`，长选项用 `--xxx`
2. **提供帮助信息** - 每个参数都有描述
3. **合理默认值** - 减少必需参数
4. **错误处理友好** - 清晰的错误消息

### TUI 设计

1. **响应式布局** - 适应终端大小变化
2. **键盘导航** - 支持 vim 风格快捷键
3. **状态管理** - 清晰的应用状态模型
4. **优雅退出** - 恢复终端状态

## 常用 Crates

| Crate | 用途 |
|-------|------|
| clap | 参数解析 |
| inquire | 交互提示 |
| ratatui | TUI 框架 |
| crossterm | 终端抽象 |
| tokio | 异步运行时 |
| anyhow | 错误处理 |
| tracing | 日志记录 |
| indicatif | 进度条 |

## 相关技能

- [lib-slint-expert](./lib-slint-expert) - Slint GUI 开发
