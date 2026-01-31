# AgentKit Desktop

A cross-platform desktop application for managing AI coding tool resources (Skills, Commands, Agents).

## Features

- 📦 **Unified Resource Management**: Manage Skills, Commands, and Agents in one place
- 🔄 **Multi-Platform Sync**: Install resources to Claude Code, Codex CLI, Gemini CLI, and more
- 🔗 **Smart Linking**: Automatic symlink/junction/copy strategy selection
- 🌐 **External Skills**: Install from npm, pip, git, or Vercel registry
- 🎨 **Modern UI**: Dark/light theme, responsive design

## Supported Platforms

- Claude Code
- Codex CLI
- Gemini CLI
- Cursor
- Windsurf
- Antigravity
- Qwen Code
- Amp
- Cline
- Kiro
- Trae
- OpenCode

## Development

### Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (18+)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Project Structure

```
agentkit-desktop/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands.rs     # Tauri IPC commands
│   │   ├── models.rs       # Data models
│   │   ├── platform.rs     # Platform detection
│   │   ├── sync.rs         # Sync engine
│   │   ├── lib.rs          # Library exports
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
└── package.json            # Node.js dependencies
```

## License

MIT
