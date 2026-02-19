# Slint Cross-Platform Template

A comprehensive template for building Slint applications that run across multiple platforms including desktop (Windows, macOS, Linux) and web (WebAssembly). This template demonstrates platform-specific configurations and optimizations.

## Features

- ✅ Cross-platform compatibility (Windows, macOS, Linux, Web)
- ✅ Platform-specific styling and theming
- ✅ WebAssembly (WASM) support
- ✅ Adaptive UI based on platform capabilities
- ✅ Platform feature detection
- ✅ Responsive design
- ✅ Build configurations for different targets

## Supported Platforms

### Desktop Platforms
- **Windows** - Native Win32 backend with Fluent style
- **macOS** - Native Cocoa backend with native style
- **Linux** - X11/Wayland with Material style

### Web Platform
- **WebAssembly** - WebGL backend with Material style
- **Browser Features** - Local storage, web APIs

## Project Structure

```
slint-cross-platform/
├── Cargo.toml              # Platform-specific dependencies
├── build.rs                # Platform-aware build configuration
├── index.html              # Web page for WASM build
├── README.md               # This file
└── src/
    └── main.rs             # Cross-platform application logic
    └── ui/
        └── main.slint      # Adaptive UI definition
```

## Quick Start

### Desktop Applications

1. **Build and run locally**:
   ```bash
   cargo run
   ```

2. **Build for release**:
   ```bash
   cargo build --release
   ```

### WebAssembly Application

1. **Install wasm-pack** (if not already installed):
   ```bash
   cargo install wasm-pack
   ```

2. **Build for WebAssembly**:
   ```bash
   wasm-pack build --target web --out-dir pkg
   ```

3. **Serve the application** (use a local web server):
   ```bash
   python3 -m http.server 8000
   # or use any other static file server
   ```

4. **Open in browser**:
   Navigate to `http://localhost:8000`

## Platform-Specific Configurations

### Windows

- **Style**: Fluent design system
- **Backend**: Win32 native backend
- **Features**: Native file dialogs, system tray, multiple windows
- **Build**: Windows subsystem configuration

### macOS

- **Style**: Native macOS design
- **Backend**: Cocoa native backend
- **Features**: Native menu bar, dock integration
- **Build**: macOS bundle configuration

### Linux

- **Style**: Material Design
- **Backend**: X11/Wayland backend
- **Features**: GTK integration, system themes
- **Build**: Linux desktop integration

### WebAssembly

- **Style**: Material Design for web
- **Backend**: WebGL canvas rendering
- **Features**: Browser storage, web APIs
- **Build**: WASM module generation

## Building for Different Platforms

### Local Development

```bash
# Run on current platform
cargo run

# Build release version
cargo build --release
```

### Cross-Compilation

#### Windows (from Linux/macOS)

```bash
# Add Windows target
rustup target add x86_64-pc-windows-gnu

# Build for Windows
cargo build --target x86_64-pc-windows-gnu --release
```

#### Linux (from Windows/macOS)

```bash
# Add Linux target
rustup target add x86_64-unknown-linux-gnu

# Build for Linux
cargo build --target x86_64-unknown-linux-gnu --release
```

#### WebAssembly

```bash
# Add WASM target
rustup target add wasm32-unknown-unknown

# Build for WASM
cargo build --target wasm32-unknown-unknown --release

# Package with wasm-pack
wasm-pack build --target web --out-dir pkg
```

## Platform Feature Detection

The template includes platform detection capabilities:

```rust
fn get_platform_info() -> &'static str {
    #[cfg(target_os = "windows")]
    return "Windows";

    #[cfg(target_os = "macos")]
    return "macOS";

    #[cfg(target_os = "linux")]
    return "Linux";

    #[cfg(target_arch = "wasm32")]
    return "WebAssembly";

    "Unknown"
}
```

### Available Features by Platform

| Feature | Windows | macOS | Linux | WebAssembly |
|---------|---------|-------|-------|-------------|
| File dialogs | ✅ | ✅ | ✅ | ❌ |
| Multiple windows | ✅ | ✅ | ✅ | ❌ |
| System tray | ✅ | ✅ | ✅ | ❌ |
| Native menus | ✅ | ✅ | ✅ | ❌ |
| Browser storage | ❌ | ❌ | ❌ | ✅ |
| Hardware acceleration | ✅ | ✅ | ✅ | ✅ |
| Multi-threading | ✅ | ✅ | ✅ | Limited |

## Adaptive UI Design

### Theme System

The template includes a light/dark theme system that adapts to platform preferences:

```slint
@colors := {
    light: {
        background: #ffffff,
        surface: #f8f9fa,
        text: #2c3e50,
        primary: #3498db
    },
    dark: {
        background: #1a1a1a,
        surface: #2d2d2d,
        text: #ecf0f1,
        primary: #3498db
    }
};

@theme := @colors[current-theme];
```

### Platform-Specific Styling

```rust
// build.rs
fn main() {
    let mut config = slint_build::CompilerConfiguration::new();

    #[cfg(target_os = "windows")]
    {
        config = config.with_style("fluent");
    }

    #[cfg(target_os = "macos")]
    {
        config = config.with_style("native");
    }

    #[cfg(target_arch = "wasm32")]
    {
        config = config.with_style("material");
    }

    slint_build::compile_with_config("ui/main.slint", config).unwrap();
}
```

## WebAssembly Integration

### Browser Setup

The template includes a ready-to-use HTML file for WebAssembly deployment:

```html
<canvas id="canvas"></canvas>
<script type="module">
    import init from './pkg/slint_cross_platform.js';

    async function run() {
        await init();
        const app = new slint.CrossPlatformApp();
        app.window().canvas_element = document.getElementById('canvas');
        app.run();
    }
    run();
</script>
```

### WASM-Specific Features

- **Canvas Rendering**: High-performance WebGL rendering
- **Browser Storage**: localStorage and sessionStorage integration
- **Web APIs**: Access to browser-specific functionality
- **Responsive Design**: Adapts to different screen sizes

## Advanced Configuration

### Conditional Compilation

Use Rust's conditional compilation for platform-specific code:

```rust
#[cfg(target_os = "windows")]
{
    // Windows-specific code
    use std::os::windows::ffi::OsStrExt;
}

#[cfg(target_arch = "wasm32")]
{
    // WebAssembly-specific code
    use wasm_bindgen::prelude::*;
}

#[cfg(not(target_arch = "wasm32"))]
{
    // Desktop-only code
    use std::fs;
}
```

### Platform-Specific Dependencies

```toml
[dependencies]
slint = { version = "1.13", features = ["backend-default"] }

[target.'cfg(target_arch = "wasm32")'.dependencies]
wasm-bindgen = { version = "0.2" }
getrandom = { version = "0.2.2", features = ["js"] }
console_error_panic_hook = "0.1"
```

### Build Scripts

Platform-aware build configuration in `build.rs`:

```rust
fn main() {
    let mut config = slint_build::CompilerConfiguration::new();

    // Platform-specific configuration
    #[cfg(target_os = "windows")]
    {
        config = config.with_style("fluent");
    }

    // Compile with platform configuration
    slint_build::compile_with_config("ui/main.slint", config).unwrap();
}
```

## Deployment

### Desktop Applications

#### Windows

```bash
# Create installer (using cargo-wix)
cargo install cargo-wix
cargo wix
```

#### macOS

```bash
# Create app bundle (using cargo-bundle)
cargo install cargo-bundle
cargo bundle --format osx
```

#### Linux

```bash
# Create AppImage or deb package
cargo install cargo-appimage
cargo appimage
```

### Web Applications

#### Static Hosting

1. Build the WASM package
2. Upload `pkg/` directory and `index.html` to web server
3. Ensure proper MIME types are configured:
   - `.wasm` → `application/wasm`
   - `.js` → `application/javascript`

#### CDN Deployment

Upload to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3

## Testing

### Unit Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_detection() {
        let platform = get_platform_info();
        assert!(!platform.is_empty());
    }

    #[test]
    fn test_feature_availability() {
        let features = get_available_features();
        assert!(!features.is_empty());
    }
}
```

### Integration Testing

Test platform-specific functionality:

```rust
#[test]
#[cfg(not(target_arch = "wasm32"))]
fn test_file_operations() {
    // Test file system operations on desktop platforms
}

#[test]
#[cfg(target_arch = "wasm32")]
fn test_browser_storage() {
    // Test browser storage on web platform
}
```

## Performance Optimization

### Desktop Optimization

- Use native backends for best performance
- Enable hardware acceleration
- Optimize for specific platform characteristics

### WebAssembly Optimization

- Minimize WASM binary size
- Use streaming compilation for faster loading
- Optimize assets for web delivery
- Implement lazy loading for large components

### Memory Management

```rust
// Use weak references to avoid circular references
let app_weak = app.as_weak();

// Clean up resources when appropriate
#[cfg(target_arch = "wasm32")]
fn cleanup_resources() {
    // WASM-specific cleanup
}
```

## Troubleshooting

### Common Issues

**Build Errors**:
- Ensure target architecture is installed: `rustup target add <target>`
- Check platform-specific dependencies in Cargo.toml
- Verify build script configuration

**Runtime Issues**:
- Check platform-specific backend availability
- Verify style compatibility with target platform
- Test on actual target platforms

**WASM Issues**:
- Ensure proper MIME types on web server
- Check browser console for errors
- Verify CORS configuration if needed

### Debugging

Enable debug logging:

```rust
#[cfg(debug_assertions)]
{
    console_log::init().expect("Failed to initialize logger");
}
```

Platform-specific debugging:

```rust
fn debug_platform_info() {
    eprintln!("Platform: {}", get_platform_info());
    eprintln!("Backend: {}", get_backend_info());
    eprintln!("Features: {:?}", get_available_features());
}
```

## Best Practices

### Cross-Platform Development

1. **Test Early**: Test on all target platforms early in development
2. **Platform Detection**: Use runtime platform detection for adaptive behavior
3. **Graceful Degradation**: Provide fallbacks for unsupported features
4. **Consistent UI**: Maintain consistent UX across platforms while respecting platform conventions
5. **Performance**: Optimize for each platform's characteristics

### Code Organization

1. **Separate Concerns**: Keep platform-specific code isolated
2. **Feature Flags**: Use feature flags for conditional compilation
3. **Abstraction**: Create abstractions for platform differences
4. **Testing**: Test on all target platforms
5. **Documentation**: Document platform-specific behavior

### WebAssembly Optimization

1. **Binary Size**: Keep WASM binary size minimal
2. **Loading**: Implement proper loading states
3. **Error Handling**: Handle browser-specific errors
4. **Performance**: Use browser performance APIs
5. **Compatibility**: Ensure browser compatibility

## Next Steps

- 🚀 **Deploy to production**: Build and deploy to your target platforms
- 🧪 **Add comprehensive tests**: Test platform-specific features
- 📱 **Add responsive design**: Adapt to different screen sizes
- 🔧 **Platform-specific features**: Add platform-exclusive functionality
- 📊 **Performance monitoring**: Monitor performance on different platforms

---

*Ready to build cross-platform Slint applications? Start customizing this template for your specific needs!*