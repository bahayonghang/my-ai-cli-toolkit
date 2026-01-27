# Slint GUI Expert

Comprehensive Slint GUI development expert based on official source code.

## Overview

Slint GUI Expert provides comprehensive guidance for developing modern GUI applications using Slint with Rust. Built directly from the official Slint repository, it covers everything from basic component creation to advanced performance optimization and cross-platform deployment.

## Features

- 🎨 **Component Design** - Create reusable UI components
- 📐 **Layouts** - Flexible layout systems (HorizontalBox, VerticalBox, GridLayout)
- 🎭 **Styling** - Colors, fonts, animations, and themes
- 🔄 **State Management** - Properties, callbacks, and data binding
- 🚀 **Performance** - Optimization techniques and best practices
- 📱 **Cross-Platform** - Desktop, mobile, and embedded targets
- 🦀 **Rust Integration** - Seamless Rust backend integration

## Slint Language Basics

Slint uses a declarative markup language for UI definition:

```qml
component MyButton inherits Rectangle {
    in property <string> text;
    callback clicked;
    
    background: blue;
    border-radius: 5px;
    
    Text {
        text: root.text;
        color: white;
    }
    
    TouchArea {
        clicked => { root.clicked(); }
    }
}
```

## Core Concepts

### Components
- Built-in widgets (Button, Text, Image, etc.)
- Custom components
- Component composition
- Property inheritance

### Layouts
- HorizontalBox / VerticalBox
- GridLayout
- Alignment and spacing
- Responsive design

### Properties
- Input properties (`in property`)
- Output properties (`out property`)
- Two-way binding (`in-out property`)
- Property animations

### Callbacks
- Event handling
- Custom callbacks
- Callback parameters
- Rust integration

## Usage

Ask for guidance on any Slint topic:

```
How do I create a custom button component in Slint?
```

```
Show me how to integrate Slint with Rust
```

```
I need to create a responsive layout with GridLayout
```

## Rust Integration

### Basic Setup

```rust
slint::slint! {
    export component MainWindow inherits Window {
        // UI definition
    }
}

fn main() {
    let ui = MainWindow::new().unwrap();
    ui.run().unwrap();
}
```

### Callbacks and Properties

```rust
let ui = MainWindow::new().unwrap();

// Set property
ui.set_counter(42);

// Connect callback
ui.on_button_clicked(|| {
    println!("Button clicked!");
});
```

## Platform Support

- **Desktop**: Windows, macOS, Linux
- **Mobile**: Android, iOS
- **Embedded**: Microcontrollers with displays
- **Web**: WebAssembly (experimental)

## Best Practices

- Keep components small and focused
- Use properties for component communication
- Leverage built-in widgets when possible
- Optimize animations for performance
- Test on target platforms early

## Requirements

- Rust 1.70+
- Slint 1.0+

## Getting Started

Add to your `Cargo.toml`:

```toml
[dependencies]
slint = "1.0"

[build-dependencies]
slint-build = "1.0"
```

## Resources

- Official Slint documentation
- Example gallery
- Component library

## License

MIT
