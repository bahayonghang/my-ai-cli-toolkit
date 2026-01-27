# Slint GUI Expert Skill

A comprehensive Claude Code skill for developing modern GUI applications using Slint with Rust. This skill provides expert guidance on Slint UI development, from basic concepts to advanced patterns and optimizations.

## What This Skill Covers

- **🏗️ Component Architecture** - Reusable component design and best practices
- **🎨 Styling & Themes** - Custom styling, theming, and responsive design
- **📊 Data Binding** - Property binding, state management, and data models
- **🎬 Animations** - Smooth transitions and complex animations
- **🔄 Layout Systems** - Responsive layouts with GridLayout, VerticalLayout, and more
- **🚀 Performance Optimization** - Memory management and rendering optimization
- **🌐 Cross-Platform** - Desktop, Web, and embedded deployment
- **⚙️ Rust Integration** - Seamless integration with Rust ecosystem
- **🧪 Testing** - Unit testing and debugging strategies

## How to Use

Simply ask Claude questions about Slint GUI development, and this skill will automatically activate when relevant:

### Example Questions

```
"How do I create a custom button component in Slint?"
"What's the best way to handle data binding between Rust and Slint?"
"How can I optimize my Slint application for embedded devices?"
"Show me how to implement animations in Slint"
"What's the recommended project structure for a Slint application?"
```

## Skill Structure

```
lib-slint-expert/
├── SKILL.md                    # Core skill documentation
├── README.md                   # This usage guide
├── SOURCE_STRUCTURE.md         # Mapping to official repository
├── source/                     # Official Slint repository (submodule)
│   ├── docs/                  # Official documentation
│   ├── examples/              # Official examples
│   ├── api/                   # API reference
│   └── ui-libraries/          # UI component libraries
├── docs/                       # Navigation guides for official docs
├── examples/                   # Guide to official examples
├── templates/                  # Project templates
│   ├── basic-app/            # Simple application template
│   ├── component-library/    # Reusable component library template
│   └── cross-platform/       # Cross-platform application template
└── .gitmodules                 # Git submodule configuration
```

## Quick Start Examples

### Basic Application

```rust
// Cargo.toml
[dependencies]
slint = "1.13"

// main.rs
slint::slint! {
    export component AppWindow inherits Window {
        Text {
            text: "Hello, Slint!";
            color: #3498db;
            horizontal-alignment: center;
        }
    }
}

fn main() -> Result<(), slint::PlatformError> {
    AppWindow::new()?.run()
}
```

### Custom Component

```slint
export component CustomButton inherits Rectangle {
    property <string> text: "Click me";
    property <color> background: #3498db;
    callback clicked;

    background: background;
    border-radius: 8px;

    Text {
        text: root.text;
        color: white;
        horizontal-alignment: center;
        vertical-alignment: center;
    }

    TouchArea {
        clicked => { root.clicked(); }
    }
}
```

### Rust Integration

```rust
slint::include_modules!();

fn main() -> Result<(), slint::PlatformError> {
    let app = MainWindow::new()?;

    let window_weak = app.as_weak();
    app.on_button_clicked(move || {
        let window = window_weak.unwrap();
        // Handle button click
        println!("Button clicked!");
    });

    app.run()
}
```

## Key Features

### 🎯 Focused Expertise
- Comprehensive coverage of Slint GUI development
- Rust-specific integration patterns and best practices
- Performance optimization techniques for different platforms

### 📚 Progressive Learning
- Start with basic concepts and gradually move to advanced topics
- Real-world examples and practical patterns
- Troubleshooting guidance and common pitfalls

### 🛠️ Ready-to-Use Templates
- Project scaffolding for different application types
- Component library structure for reusable UI elements
- Cross-platform configuration examples

### 🔄 Modern Development Patterns
- Component-based architecture
- Reactive data binding
- Responsive design principles
- Testing and debugging strategies

## Official Source Code Integration

This skill includes the official Slint repository as a git submodule in the `source/` directory, providing access to the most up-to-date documentation, examples, and API reference.

### Initialize Submodule

```bash
# Initialize and pull the official Slint repository
git submodule update --init --recursive

# Update to the latest version
git submodule update --remote source
```

### Documentation Structure

The skill's documentation directly references the official source code for maximum accuracy:

- **Official Documentation**: `@source/docs/` - Complete language reference and tutorials
- **Official Examples**: `@source/examples/` - Extensive working examples
- **API Documentation**: `@source/api/rs/slint/` - Rust API reference
- **UI Libraries**: `@source/ui-libraries/` - Material and Fluent component libraries

### Navigation Guides

- **[docs/README.md](docs/README.md)** - Complete guide to official documentation
- **[examples/README.md](examples/README.md)** - Learning paths and example guides
- **[SOURCE_STRUCTURE.md](SOURCE_STRUCTURE.md)** - Detailed mapping between skill and official repository

### Getting Started with Official Source

```bash
# Initialize the submodule (if not already done)
git submodule update --init --recursive

# Update to the latest version
git submodule update --remote source

# Browse official examples
ls @source/examples/

# View official documentation
ls @source/docs/
```

## Templates Overview

### Basic App Template
- Simple single-window application
- Basic styling and interactions
- Ideal for learning and small projects

### Component Library Template
- Structured for reusable components
- Documentation generation setup
- Testing framework integration
- Perfect for creating UI component libraries

### Cross-Platform Template
- Platform-specific configurations
- Build scripts for different targets
- WebAssembly and embedded support
- Optimized for deployment across platforms

## Examples and Learning Paths

This skill provides curated guides to the official Slint examples:

### Official Examples Available
- **Gallery Demo** (`@source/examples/gallery/`) - Complete UI component showcase
- **Printer Demo** (`@source/examples/printerdemo/`) - Complex real-world application
- **Todo App** (`@source/examples/todo/`) - Basic CRUD operations example
- **Memory Game** (`@source/examples/memory/`) - Game development patterns
- **Slide Puzzle** (`@source/examples/slide_puzzle/`) - Interactive game logic
- **Energy Monitor** (`@source/examples/energy_monitor/`) - Data visualization

### Learning Path Guidance
See [`examples/README.md`](examples/README.md) for:
- Recommended learning progression
- Example-specific highlights
- Best practice extraction from official code
- How to apply examples to your projects

## Best Practices Included

### Code Organization
- Recommended project structure
- Component design patterns
- Separation of concerns

### Performance
- Efficient rendering techniques
- Memory management strategies
- Optimization guidelines

### Testing
- Unit testing approaches
- UI testing strategies
- Debugging techniques

### Development Workflow
- Build configuration
- Development tools setup
- Deployment strategies

## Troubleshooting

If the skill doesn't activate when expected:

1. **Check your query** - Make sure you mention Slint, GUI development, or related terms
2. **Be specific** - Include details about what you're trying to accomplish
3. **Ask directly** - You can explicitly ask the skill for help: "Help me with Slint..."

## Contributing

To enhance this skill:

1. Add more examples to the `examples/` directory
2. Contribute documentation to `docs/` folders
3. Create additional templates for common use cases
4. Share your own patterns and best practices

## Dependencies

- **Claude Code** 1.0 or later
- **Rust** toolchain (for running examples)
- **Slint** crate (referenced in examples)

## License

This skill follows the same license terms as your Claude Code installation.

---

*Ready to build amazing GUI applications with Slint? Start asking questions about your Slint development needs!*