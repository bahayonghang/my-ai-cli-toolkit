# Getting Started with Slint

Follow this guide to start building GUI applications with Slint using the official tutorial and our curated resources.

## 🎯 Quick Start (5 minutes)

### Step 1: Use Our Template
```bash
# Copy the basic template
cp -r templates/basic-app/ my-first-app/
cd my-first-app/

# Run immediately
cargo run
```

### Step 2: Explore the Code
- **UI Definition**: Open `ui/app.slint` to see the interface
- **Application Logic**: Open `src/main.rs` to see Rust integration
- **Build Configuration**: Check `build.rs` for Slint compilation

### Step 3: Make Your First Change
Edit `ui/app.slint` and change the welcome message:
```slint
property <string> message: "Welcome to My App!";
```

Run `cargo run` again to see your change!

## 🎓 Official Tutorial Path (2-3 hours)

The official tutorial teaches you Slint by building a memory game. Here's how to follow it with our skill:

### Tutorial Overview
**Reference**: `@source/docs/astro/src/content/docs/tutorial/quickstart.mdx`

The tutorial covers:
- Game board creation with tiles
- Memory game logic implementation
- Animations and visual feedback
- State management and user interaction

### Step-by-Step Learning

#### Chapter 1: Getting Started
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/getting_started.mdx`
**Example**: `@source/examples/memory/`

```bash
# Study the official memory game
cd @source/examples/memory/
cargo run

# Compare with our template
cd ../../templates/basic-app/
cargo run
```

#### Chapter 2: Creating the Memory Tile
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/memory_tile.mdx`

Learn:
- Custom component creation
- Property definitions
- Basic styling

#### Chapter 3: Creating the Tiles
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/creating_the_tiles.mdx`

Learn:
- Layout management
- Component composition
- Data structures

#### Chapter 4: Game Logic
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/game_logic.mdx`
**Example**: Study `@source/examples/memory/src/main.rs`

Learn:
- Rust-Slint integration
- Event handling
- State management

#### Chapter 5: Polishing
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/polishing_the_tile.mdx`

Learn:
- Animations and transitions
- Visual feedback
- User experience improvements

#### Chapter 6: Advanced Topics
**Tutorial**: `@source/docs/astro/src/content/docs/tutorial/from_one_to_multiple_tiles.mdx`
**Web Deployment**: `@source/docs/astro/src/content/docs/tutorial/running_in_a_browser.mdx`

## 📚 Learning Resources

### Essential Reading
1. **[Navigation Guide](docs/README.md)** - How to use official documentation
2. **[Examples Guide](examples/README.md)** - Curated learning paths
3. **[Template Collection](templates/README.md)** - Ready-to-use project templates

### Primary Sources
- **Official Tutorial**: `@source/docs/astro/src/content/docs/tutorial/`
- **Working Examples**: `@source/examples/`
- **Language Reference**: `@source/docs/astro/src/content/docs/guide/language/`

### Recommended Learning Order

#### 🟢 Absolute Beginner (Day 1)
1. Run our basic template
2. Follow official tutorial Chapters 1-2
3. Experiment with simple changes
4. Study `@source/examples/gallery/` for components

#### 🟡 Some Programming Experience (Day 2)
1. Complete official tutorial Chapters 3-4
2. Study `@source/examples/todo/` for data binding
3. Experiment with custom components
4. Read language reference sections

#### 🔴 GUI Development Experience (Day 3)
1. Complete tutorial Chapters 5-6
2. Study `@source/examples/printerdemo/` for architecture
3. Explore WebAssembly deployment
4. Read advanced documentation

## 🛠️ Practical Exercises

### Exercise 1: Modify the Template
Starting with `templates/basic-app/`:

1. Change the app to be a simple calculator
2. Add number buttons (0-9)
3. Add operation buttons (+, -, ×, ÷)
4. Display the calculation result

**Hints**:
- Use properties to store the current value
- Add callbacks for button clicks
- Use a Text component to display results

### Exercise 2: Build the Memory Game
Following the official tutorial:

1. Create a new project from the template
2. Follow each tutorial chapter
3. Compare your implementation with `@source/examples/memory/`
4. Add your own features (score tracking, timer, etc.)

### Exercise 3: Create a Component Library
Based on `@source/examples/gallery/`:

1. Extract 5 components you find useful
2. Create your own component library
3. Document each component
4. Use them in a new application

## 🔧 Development Environment Setup

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Update to latest stable
rustup update stable
rustup default stable
```

### IDE Setup
- **VS Code**: Install the official Slint extension
- **Other Editors**: Check `@source/editors/` for available extensions

### Build Tools
```bash
# For WebAssembly development
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# For embedded development
# Check @source/examples/mcu-board-support/ for specific requirements
```

## 🎯 Next Steps After Tutorial

### Build Your Own Project
Choose one of these ideas:

1. **Productivity App**: To-do list, note taker, or calendar
2. **Game**: Simple puzzle game, card game, or arcade game
3. **Utility App**: File browser, system monitor, or settings panel
4. **Creative App**: Drawing app, music player, or image viewer

### Advanced Topics to Explore
- **Cross-platform deployment**: Study `@source/examples/printerdemo/`
- **Game development**: Review `@source/examples/slide_puzzle/`
- **Data visualization**: Explore `@source/examples/iot-dashboard/`
- **Embedded systems**: Check `@source/examples/mcu-board-support/`

### Contribute to the Community
- Share your projects on GitHub
- Contribute to the official Slint repository
- Help improve documentation
- Create tutorials for others

## 🔍 Troubleshooting

### Common Issues

**"can't find crate slint"**
```bash
# Update Rust and try again
rustup update stable
cargo clean
cargo build
```

**"component not found" error**
- Check that `build.rs` points to the correct `.slint` file
- Verify your component names match between `.slint` and `rust` files

**WebAssembly build fails**
- Install wasm-pack: `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
- Uncomment WebAssembly sections in `Cargo.toml`

**UI doesn't update**
- Ensure you're using property bindings correctly
- Check that callback handlers are properly set up

### Getting Help

- **Official Documentation**: `@source/docs/`
- **Examples**: `@source/examples/`
- **Issues**: Check the official Slint repository
- **Community**: GitHub discussions and forums

## 📖 Additional Resources

### Alternative Learning Materials
- **Video Tutorials**: Check official Slint YouTube channel
- **Blog Posts**: `@source/docs/astro/src/content/blog/`
- **Community Projects**: GitHub showcases

### Reference Materials
- **API Documentation**: `@source/api/rs/slint/`
- **Component Library**: `@source/ui-libraries/`
- **Cookbook**: `@source/docs/astro/src/content/docs/cookbook/`

### Architecture Patterns
- **MVC/MVP**: Study `@source/examples/printerdemo/`
- **State Management**: Review `@source/examples/memory/`
- **Component Architecture**: Learn from `@source/examples/gallery/`

---

**🎉 Ready to start? Begin with the Quick Start above, then dive into the official tutorial. Happy coding with Slint!**