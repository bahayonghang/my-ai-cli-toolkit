# Basic Slint Application Template

A minimal but complete Slint application template based on official tutorials and examples.

## 🚀 Quick Start

```bash
# Copy this template to your project directory
cp -r templates/basic-app/ my-awesome-app/
cd my-awesome-app/

# Customize your project
# Edit Cargo.toml to change your project name and details
# Edit ui/app.slint to design your interface
# Edit src/main.rs to add application logic

# Run your application
cargo run
```

## 📁 Project Structure

```
basic-app/
├── Cargo.toml          # Project configuration and dependencies
├── build.rs            # Build script for compiling .slint files
├── README.md           # This file
├── src/
│   └── main.rs         # Main application logic (Rust)
└── ui/
    └── app.slint       # User interface definition (Slint)
```

## 📚 What's Included

### ✅ Core Features
- Standard Cargo project structure
- Basic UI with counter functionality
- Property bindings and computed properties
- Event handling with callbacks
- Responsive layout with VerticalLayout and HorizontalLayout

### ✅ Learning Components
- Text components for display
- Button components for interaction
- Layout components for organization
- Property bindings for dynamic updates
- Basic state management

### ✅ Ready for Extension
- WebAssembly support (commented out)
- Examples of data models (commented out)
- Pattern for custom callbacks
- Error handling template

## 🎯 Learning Path

This template is designed to accompany the official Slint tutorial:

1. **Tutorial Reference**: `@source/docs/astro/src/content/docs/tutorial/`
2. **Example Study**: `@source/examples/memory/`
3. **Component Gallery**: `@source/examples/gallery/`

### Step-by-Step Guide

#### Step 1: Understand the Basics
- Study `ui/app.slint` to understand Slint syntax
- Review `src/main.rs` to see Rust integration
- Run the app and experiment with the UI

#### Step 2: Modify the Interface
```slint
// In ui/app.slint, try changing:
// - Colors and styles
// - Layout structure
// - Add new components
// - Modify properties
```

#### Step 3: Add Application Logic
```rust
// In src/main.rs, add:
// - New callback handlers
// - Data models
// - Complex state management
// - File I/O or network operations
```

#### Step 4: Follow Official Tutorial
Complete the memory game tutorial:
```bash
# Reference the official tutorial implementation
cd @source/examples/memory/
# Compare with your implementation
```

## 🔧 Customization Guide

### Changing the App Name
1. Edit `Cargo.toml`:
   ```toml
   [package]
   name = "your-app-name"
   ```
2. The UI files will automatically use the new component name

### Adding New UI Components
```slint
// In ui/app.slint, add new components
export component CustomButton inherits Rectangle {
    // Your custom button implementation
}
```

### Adding Complex Logic
```rust
// In src/main.rs, uncomment and modify the advanced example
use slint::{SharedString, ModelRc, VecModel};

// Add data models, complex callbacks, etc.
```

### WebAssembly Deployment
1. Uncomment the WebAssembly sections in `Cargo.toml`
2. Uncomment the WebAssembly code in `src/main.rs`
3. Install wasm-pack: `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
4. Build: `wasm-pack build --target web`

## 📖 Next Steps

### 🟢 Beginner
1. Modify the existing UI components
2. Add new buttons and functionality
3. Experiment with colors and layouts
4. Complete the official memory game tutorial

### 🟡 Intermediate
1. Create custom components
2. Implement data models with VecModel
3. Add animations and transitions
4. Study `@source/examples/todo/` for patterns

### 🔴 Advanced
1. Implement complex state management
2. Add file operations or networking
3. Create multi-window applications
4. Study `@source/examples/printerdemo/` for architecture

## 🔍 Troubleshooting

### Common Issues

**Build Error**: "can't find crate slint"
- Solution: Ensure you're using the latest stable Rust: `rustup update stable`

**Runtime Error**: Component not found
- Solution: Check that `build.rs` is compiling the correct .slint file path

**UI Not Updating**: Properties not reflecting changes
- Solution: Ensure you're using property bindings correctly in .slint

**WebAssembly Issues**: Build failures
- Solution: Install wasm-bindgen and follow the WebAssembly setup guide

### Getting Help

- **Official Documentation**: `@source/docs/`
- **Tutorial**: `@source/docs/astro/src/content/docs/tutorial/`
- **Examples**: `@source/examples/`
- **Community**: Check the official Slint repository for issues and discussions

## 📄 License

This template follows the same license as the Slint project. Feel free to use it for your own projects!