//! Commands Module
//!
//! Exposes backend functionality to the frontend via Tauri IPC.

use crate::database::Database;
use crate::external::ExternalSkillsManager;
use std::path::PathBuf;
use std::sync::Mutex;

pub mod external;
pub mod logging;
pub mod marketplace;
pub mod platform;
pub mod resource;
pub mod settings;

pub use external::*;
pub use logging::*;
pub use marketplace::*;
pub use platform::*;
pub use resource::*;
pub use settings::*;

/// Application state
pub struct AppState {
    /// SQLite database connection, protected by std::sync::Mutex.
    ///
    /// **Why std::sync::Mutex instead of tokio::sync::Mutex?**
    /// All DB operations are synchronous (rusqlite is blocking) and complete
    /// quickly. The MutexGuard is always dropped before any `.await` point,
    /// so holding a std::sync::Mutex across threads is safe and avoids the
    /// overhead of an async-aware mutex. If a future migration introduces
    /// async DB work, switch to `tokio::sync::Mutex`.
    pub db: Mutex<Database>,
    pub skills_source: PathBuf,
    pub commands_source: PathBuf,
    pub external_manager: ExternalSkillsManager,
}

impl AppState {
    pub fn new() -> anyhow::Result<Self> {
        let db_path = Database::default_path();
        let db = Database::new(db_path)?;

        let base_path = std::env::current_dir().unwrap_or_default();
        let skills_source = base_path.join("skills");
        let commands_source = base_path.join("commands");

        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| base_path.clone())
            .join("agentkit");

        Ok(Self {
            db: Mutex::new(db),
            skills_source,
            commands_source,
            external_manager: ExternalSkillsManager::new(cache_dir),
        })
    }

    pub fn with_paths(skills_source: PathBuf, commands_source: PathBuf) -> anyhow::Result<Self> {
        let db_path = Database::default_path();
        let db = Database::new(db_path)?;

        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_default())
            .join("agentkit");

        Ok(Self {
            db: Mutex::new(db),
            skills_source,
            commands_source,
            external_manager: ExternalSkillsManager::new(cache_dir),
        })
    }
}
