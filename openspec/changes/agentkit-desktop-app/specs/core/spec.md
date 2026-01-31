# Core Application Specification - Delta

## ADDED Requirements

### Requirement: Application Architecture
AgentKit Desktop SHALL adopt a Tauri 2.0 hybrid architecture with a React + TypeScript frontend and a Rust backend, communicating via Tauri IPC commands.

#### Scenario: Application startup
- **WHEN** user launches AgentKit Desktop
- **THEN** the application window opens within 1 second
- **AND** platform detection runs automatically in the background

#### Scenario: Frontend-backend communication
- **WHEN** frontend invokes a Tauri command
- **THEN** the Rust backend processes the request
- **AND** returns a typed response via IPC

---

### Requirement: Resource Type Classification
The system SHALL classify all managed resources into three types: Skill, Command, and Agent.

#### Scenario: Skill resource identification
- **WHEN** a resource contains a `SKILL.md` file with valid frontmatter
- **THEN** it is classified as ResourceType::Skill

#### Scenario: Command resource identification
- **WHEN** a resource is a markdown or TOML file in a commands directory
- **THEN** it is classified as ResourceType::Command

#### Scenario: Agent resource identification
- **WHEN** a resource contains agent configuration files
- **THEN** it is classified as ResourceType::Agent

---

### Requirement: Sync Status Tracking
The system SHALL track the synchronization status of each resource per platform using the following states: NotInstalled, Synced, Outdated, Conflict, NotSupported.

#### Scenario: Resource not installed
- **WHEN** a resource has no corresponding file in the platform's target directory
- **THEN** its status is SyncStatus::NotInstalled

#### Scenario: Resource synced
- **WHEN** a resource's target file matches the source (via symlink or identical content)
- **THEN** its status is SyncStatus::Synced

#### Scenario: Resource outdated
- **WHEN** the source file has been modified after the last sync
- **THEN** its status is SyncStatus::Outdated

#### Scenario: Resource conflict
- **WHEN** both source and target have been modified independently
- **THEN** its status is SyncStatus::Conflict

#### Scenario: Platform not supported
- **WHEN** a resource type is not supported by a specific platform
- **THEN** its status is SyncStatus::NotSupported

---

### Requirement: Multi-Platform Support
The system SHALL support the following AI coding tool platforms: Claude, Codex, Gemini, Cursor, Windsurf, Antigravity, Qwen, Amp, Cline, Kiro, Trae, OpenCode.

#### Scenario: Platform path resolution
- **WHEN** a platform is selected for installation
- **THEN** the system resolves the correct skills and commands paths relative to user home directory

#### Scenario: Claude platform paths
- **GIVEN** Platform::Claude is selected
- **WHEN** resolving paths
- **THEN** skills_path is `~/.claude/skills` and commands_path is `~/.claude/commands`

#### Scenario: Codex platform paths
- **GIVEN** Platform::Codex is selected
- **WHEN** resolving paths
- **THEN** skills_path is `~/.codex/skills` and commands_path is `~/.codex/prompts`

---

### Requirement: Link Strategy Selection
The system SHALL support three file synchronization strategies: Symlink (Unix), Junction (Windows), and Copy (fallback), with automatic selection based on platform capabilities.

#### Scenario: Symlink strategy on Unix
- **GIVEN** the operating system is macOS or Linux
- **WHEN** installing a resource
- **THEN** the system creates a symbolic link from target to source

#### Scenario: Junction strategy on Windows
- **GIVEN** the operating system is Windows
- **AND** developer mode is enabled or admin privileges are available
- **WHEN** installing a directory resource
- **THEN** the system creates a directory junction

#### Scenario: Copy strategy fallback
- **GIVEN** symlink or junction creation fails due to permissions
- **WHEN** installing a resource
- **THEN** the system falls back to copying files
- **AND** logs a warning about the fallback

---

### Requirement: Platform Detection
The system SHALL automatically detect installed AI coding tools by checking for platform-specific directories and CLI commands.

#### Scenario: Directory-based detection
- **WHEN** the platform's base directory exists (e.g., `~/.claude`)
- **THEN** the platform is marked as detected

#### Scenario: CLI-based detection
- **WHEN** the platform's CLI command is available in PATH (e.g., `claude --version`)
- **THEN** the platform is marked as detected with CLI support

#### Scenario: Combined detection result
- **WHEN** platform detection completes
- **THEN** the system returns a list of PlatformInfo with detected status and available paths

---

### Requirement: Resource Discovery
The system SHALL discover local resources by scanning configured source directories and parsing resource metadata.

#### Scenario: Skill discovery
- **WHEN** scanning the skills source directory
- **THEN** the system finds all subdirectories containing valid SKILL.md files
- **AND** parses frontmatter for name, description, and tags

#### Scenario: Command discovery
- **WHEN** scanning the commands source directory
- **THEN** the system finds all .md and .toml files
- **AND** organizes them by platform subdirectory

---

### Requirement: Resource Installation
The system SHALL install resources to selected platforms using the configured link strategy.

#### Scenario: Single platform installation
- **GIVEN** a resource and a target platform
- **WHEN** user triggers installation
- **THEN** the system syncs the resource to the platform's target directory
- **AND** updates the resource's platform status to Synced

#### Scenario: Multi-platform installation
- **GIVEN** a resource and multiple target platforms
- **WHEN** user triggers batch installation
- **THEN** the system installs to all selected platforms
- **AND** returns individual results per platform

#### Scenario: Installation failure handling
- **GIVEN** an installation operation fails
- **WHEN** the error is caught
- **THEN** the system returns an error message with details
- **AND** does not modify the resource's status

---

### Requirement: Resource Uninstallation
The system SHALL remove installed resources from selected platforms by removing links or copied files.

#### Scenario: Uninstall symlinked resource
- **GIVEN** a resource installed via symlink
- **WHEN** user triggers uninstallation
- **THEN** the system removes the symlink
- **AND** updates status to NotInstalled

#### Scenario: Uninstall copied resource
- **GIVEN** a resource installed via copy
- **WHEN** user triggers uninstallation
- **THEN** the system deletes the copied files
- **AND** updates status to NotInstalled

---

### Requirement: External Skill Integration
The system SHALL support installing skills from external sources: Git repositories, npm packages, pip packages, and Vercel skill registry.

#### Scenario: Git source installation
- **GIVEN** an external skill with Git source
- **WHEN** user triggers installation
- **THEN** the system clones the repository
- **AND** executes the init command if specified

#### Scenario: npm source installation
- **GIVEN** an external skill with npm source
- **WHEN** user triggers installation
- **THEN** the system executes `npm install -g <package>`
- **AND** runs the init command

#### Scenario: Vercel source installation
- **GIVEN** an external skill from Vercel registry
- **WHEN** user triggers installation
- **THEN** the system executes `npx skills add <skill-name>`

---

### Requirement: SQLite Data Persistence
The system SHALL persist all resource metadata, platform configurations, and sync status in a local SQLite database.

#### Scenario: Database initialization
- **WHEN** the application starts for the first time
- **THEN** the system creates the SQLite database with required schema
- **AND** runs any pending migrations

#### Scenario: Resource CRUD operations
- **WHEN** resources are discovered, installed, or updated
- **THEN** the system persists changes to the database
- **AND** maintains referential integrity

---

### Requirement: Tauri Commands API
The system SHALL expose the following Tauri commands for frontend-backend communication: get_resources, get_platforms, detect_platforms, install_resource, uninstall_resource, update_resource, get_external_skills, install_external_skill, get_settings, update_settings, sync_resource.

#### Scenario: Get resources command
- **WHEN** frontend calls `get_resources()`
- **THEN** backend returns a list of all ResourceItem with current platform status

#### Scenario: Install resource command
- **WHEN** frontend calls `install_resource(id, platforms)`
- **THEN** backend installs the resource to specified platforms
- **AND** returns success or error result

#### Scenario: Detect platforms command
- **WHEN** frontend calls `detect_platforms()`
- **THEN** backend scans for installed AI tools
- **AND** returns a list of PlatformInfo

---

### Requirement: Settings Management
The system SHALL allow users to configure: default link mode, UI theme (Dark/Light/System), language (English/Chinese), and auto-detect platforms option.

#### Scenario: Update default link mode
- **WHEN** user changes default link mode in settings
- **THEN** the system persists the preference
- **AND** uses it for future installations

#### Scenario: Theme switching
- **WHEN** user selects a theme option
- **THEN** the UI updates immediately
- **AND** the preference is persisted

---

### Requirement: Frontend Type Safety
The system SHALL maintain TypeScript type definitions that mirror the Rust data models, ensuring type-safe communication between frontend and backend.

#### Scenario: Type synchronization
- **GIVEN** Rust defines ResourceItem struct
- **WHEN** frontend receives data from Tauri command
- **THEN** the data conforms to the TypeScript ResourceItem interface

#### Scenario: Enum consistency
- **GIVEN** Rust defines Platform enum with 12 variants
- **WHEN** TypeScript Platform enum is defined
- **THEN** it contains the same 12 variants with matching string values
