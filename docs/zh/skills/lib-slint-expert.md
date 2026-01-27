# lib-slint-expert

全面的 Slint GUI 开发专家指导。

## 概述

Lib-Slint-Expert 提供 Slint GUI 框架的专家级开发指导。Slint 是一个声明式的跨平台 GUI 工具包，支持 Rust、C++ 和 JavaScript。

## 核心概念

### Slint 语法

```qml
// 组件定义
component MyButton inherits Rectangle {
    in property <string> text: "按钮";
    callback clicked;

    background: blue;
    border-radius: 4px;

    Text {
        text: root.text;
        color: white;
    }

    TouchArea {
        clicked => { root.clicked(); }
    }
}
```

### Rust 集成

```rust
slint::include_modules!();

fn main() {
    let app = AppWindow::new().unwrap();

    // 设置属性
    app.set_counter(0);

    // 处理回调
    app.on_increment(move || {
        // 处理逻辑
    });

    app.run().unwrap();
}
```

## 项目结构

```
project/
├── Cargo.toml
├── build.rs         # Slint 编译配置
├── src/
│   ├── main.rs      # Rust 入口
│   └── logic.rs     # 业务逻辑
└── ui/
    ├── main.slint   # 主界面
    ├── components/  # 组件库
    └── styles/      # 样式定义
```

## 布局系统

### 垂直布局

```qml
VerticalLayout {
    spacing: 8px;
    padding: 16px;

    Text { text: "标题"; }
    Rectangle { height: 100px; }
    Button { text: "确定"; }
}
```

### 网格布局

```qml
GridLayout {
    Row {
        Text { text: "标签"; }
        LineEdit { }
    }
    Row {
        Text { text: "密码"; }
        LineEdit { input-type: password; }
    }
}
```

## 状态管理

```qml
export global AppState {
    in-out property <int> count: 0;
    in-out property <string> status: "";

    callback increment();
    callback decrement();
}
```

```rust
// Rust 端访问全局状态
let state = app.global::<AppState>();
state.set_count(10);
state.on_increment(|| { /* ... */ });
```

## 最佳实践

1. **组件化设计** - 创建可复用的 UI 组件
2. **类型安全** - 利用 Slint 的类型系统
3. **响应式布局** - 使用灵活的布局容器
4. **状态分离** - 业务逻辑与 UI 分离

## 平台支持

| 平台 | 支持状态 |
|------|----------|
| Windows | ✅ |
| macOS | ✅ |
| Linux | ✅ |
| WebAssembly | ✅ |
| 嵌入式 | ✅ |

## 相关技能

- [rust-cli-tui-developer](./rust-cli-tui-developer) - Rust CLI/TUI 开发
