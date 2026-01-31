# AgentKit Desktop - Developer Documentation

## Architecture Overview

AgentKit Desktop is a cross-platform desktop application built with:

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Rust + Tauri 2.0
- **Database**: SQLite (via rusqlite)
- **State Management**: Zustand

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentKit Desktop                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Stores    │  │ Components  │  │    Utils    │          │
│  │  (Zustand)  │  │   (React)   │  │  (Helpers)  │          │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘          │
│         │                │                                   │
│         └────────┬───────┘                                   │
│                  │ Tauri IPC                                 │
├──────────────────┼──────────────────────────────────────────┤
│  Backend (Rust)  │                                           │
│         ┌────────┴────────┐                                  │
│         │    Commands     │                                  │
│         └────────┬────────┘                                  │
│    ┌─────────────┼─────────────┐                            │
│    │             │             │                             │
│  ┌─┴──┐    ┌────┴────┐   ┌───┴───┐                         │
│  │Sync│    │ Manager │   │External│                         │
│  │Eng.│    │ (Skill/ │   │Handler │                         │
│  └────┘    │ Command)│   └────────┘                         │
│            └────┬────┘                                       │
│                 │                                            │
│         ┌───────┴───────┐                                    │
│         │  Repository   │                                    │
│         │   (SQLite)    │                                    │
│         └───────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
agentkit-desktop/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── ErrorBoundary.tsx     # Global error boundary
│   │   ├── ComponentErrorBoundary.tsx  # Component-level error boundary
│   │   ├── ExternalPanel.tsx     # External skills installation
│   │   ├── PlatformSelector.tsx  # Platform multi-select
│   │   ├── ResourceCard.tsx      # Resource list item
│   │   ├── ResourceDetail.tsx    # Resource detail panel
│   │   ├── StatusBadge.tsx       # Sync status badge
│   │   └── Toast.tsx             # Toast notifications
│   ├── stores/                   # Zustand state stores
│   │   ├── platformStore.ts      # Platform detection state
│   │   ├── resourceStore.ts      # Resources state
│   │   └── settingsStore.ts      # App settings state
│   ├── i18n/                     # Internationalization
│   │   ├── index.ts              # i18next config
│   │   └── locales/              # Translation files
│   │       ├── en.json
│   │       └── zh.json
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # Type definitions
│   ├── utils/                    # Utility functions
│   │   └── errorUtils.ts         # Error handling utilities
│   ├── test/                     # Test files
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands.rs           # Tauri IPC commands
│   │   ├── database.rs           # SQLite initialization
│   │   ├── external.rs           # External skill handlers
│   │   ├── manager.rs            # Resource managers
│   │   ├── models.rs             # Data models
│   │   ├── platform.rs           # Platform detection
│   │   ├── repository.rs         # Data access layer
│   │   ├── schema.sql            # Database schema
│   │   ├── sync.rs               # Sync engine (symlink/junction/copy)
│   │   ├── lib.rs                # Library exports
│   │   └── main.rs               # Application entry
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── justfile                      # Task runner commands
├── vitest.config.ts              # Test configuration
└── package.json                  # npm dependencies
```

## Key Modules

### Backend (Rust)

#### Models (`models.rs`)

Core data types:

```rust
pub enum ResourceType { Skill, Command, Agent }
pub enum SyncStatus { NotInstalled, Synced, Outdated, Conflict, NotSupported }
pub enum Platform { Claude, Codex, Gemini, Cursor, ... }
pub enum LinkMode { Symlink, Junction, Copy }

pub struct ResourceItem {
    pub id: String,
    pub name: String,
    pub resource_type: ResourceType,
    pub description: Option<String>,
    pub source: ResourceSource,
    pub platform_status: HashMap<Platform, SyncStatus>,
    // ...
}
```

#### Sync Engine (`sync.rs`)

Handles file synchronization with platform-specific strategies:

```rust
pub trait LinkStrategy {
    fn sync(&self, source: &Path, target: &Path) -> Result<()>;
    fn remove(&self, target: &Path) -> Result<()>;
    fn is_synced(&self, source: &Path, target: &Path) -> bool;
}

// Implementations:
// - SymlinkStrategy (Unix/macOS)
// - JunctionStrategy (Windows)
// - CopyStrategy (fallback)
```

#### External Handlers (`external.rs`)

Install skills from external sources:

```rust
pub trait ExternalHandler {
    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf>;
    fn check_prerequisites(&self) -> Result<()>;
}

// Implementations:
// - NpmHandler
// - PipHandler
// - GitHandler
// - VercelHandler
```

#### Commands (`commands.rs`)

Tauri IPC commands exposed to frontend:

- `detect_platforms()` - Detect installed AI coding tools
- `get_resources()` - Get all resources
- `install_resource()` - Install resource to platforms
- `uninstall_resource()` - Remove resource from platforms
- `install_external_skill()` - Install from npm/pip/git/vercel
- `get_settings()` / `update_settings()` - App settings

### Frontend (React)

#### Stores (Zustand)

```typescript
// resourceStore.ts
interface ResourceState {
  resources: ResourceItem[];
  selectedResource: ResourceItem | null;
  fetchResources: () => Promise<void>;
  installResource: (id: string, platforms: Platform[]) => Promise<void>;
  // ...
}

// platformStore.ts
interface PlatformState {
  platforms: PlatformInfo[];
  fetchPlatforms: () => Promise<void>;
}

// settingsStore.ts
interface SettingsState {
  settings: Settings;
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
}
```

#### Components

| Component | Description |
|-----------|-------------|
| `App` | Main layout with sidebar, resource list, detail panel |
| `ResourceCard` | Resource item with status badges, multi-select support |
| `ResourceDetail` | Detail view with install/uninstall actions |
| `ExternalPanel` | Install from npm/pip/git/vercel |
| `PlatformSelector` | Multi-select platform picker |
| `Toast` | Notification system |
| `ErrorBoundary` | Global error handling |
| `ComponentErrorBoundary` | Component-level error handling |

## Development

### Prerequisites

- Node.js 20+
- Rust 1.70+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Commands (justfile)

```bash
just install    # Install all dependencies
just dev        # Start development server
just build      # Build release version
just test       # Run all tests
just ci         # Run full CI pipeline
just clippy     # Run Rust linter
just fmt        # Format code
```

### Testing

**Frontend Tests (Vitest)**:
```bash
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

**Backend Tests (Cargo)**:
```bash
cd src-tauri
cargo test                  # Run tests
cargo test -- --nocapture   # With output
```

## Adding New Features

### Adding a New Platform

1. Add to `Platform` enum in `models.rs`:
   ```rust
   pub enum Platform {
       // ...
       NewPlatform,
   }
   ```

2. Implement path methods:
   ```rust
   impl Platform {
       pub fn skills_path(&self) -> &'static str {
           match self {
               Platform::NewPlatform => ".newplatform/skills",
               // ...
           }
       }
   }
   ```

3. Add to frontend types in `types/index.ts`

4. Add display name in `PLATFORM_DISPLAY_NAMES`

### Adding a New External Handler

1. Create handler struct in `external.rs`:
   ```rust
   pub struct NewHandler;

   impl ExternalHandler for NewHandler {
       fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
           // Implementation
       }

       fn check_prerequisites(&self) -> Result<()> {
           // Check if tool is available
       }
   }
   ```

2. Add to `ExternalSkillsManager`

3. Update frontend `ExternalPanel` with new source type

## API Reference

### Tauri Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `detect_platforms` | - | `Vec<String>` | Get detected platform names |
| `get_platforms` | - | `Vec<PlatformInfo>` | Get all platform info |
| `get_resources` | - | `Vec<ResourceItem>` | Get all resources |
| `get_resource_by_id` | `id: String` | `Option<ResourceItem>` | Get single resource |
| `install_resource` | `id, platforms` | `Vec<SyncResult>` | Install to platforms |
| `uninstall_resource` | `id, platforms` | `()` | Remove from platforms |
| `install_external_skill` | `source_type, source, branch, platforms` | `Vec<SyncResult>` | Install external skill |
| `get_settings` | - | `Settings` | Get app settings |
| `update_settings` | `settings` | `()` | Update settings |
| `refresh_resources` | - | `Vec<ResourceItem>` | Re-scan filesystem |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `just ci` to verify
5. Submit a pull request

### Code Style

- **Rust**: Follow `rustfmt` and `clippy` recommendations
- **TypeScript**: ESLint + Prettier
- **Comments**: English only
- **Commits**: Conventional commits format

## License

MIT License - See LICENSE file for details.
