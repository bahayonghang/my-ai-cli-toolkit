//! Structured error types for Tauri commands
//!
//! Replaces ad-hoc `Result<T, String>` with typed errors that provide
//! structured JSON responses to the frontend.

use serde::Serialize;

/// Unified error type for all Tauri commands.
///
/// Implements `Serialize` so Tauri can return structured error data to the frontend.
/// Each variant maps to a specific failure domain.
#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    /// Database access or query failure
    #[error("Database error: {0}")]
    Database(String),

    /// Mutex poisoned (should be rare)
    #[error("Internal lock error: {0}")]
    Lock(String),

    /// Requested entity not found
    #[error("{entity} not found: {id}")]
    NotFound { entity: &'static str, id: String },

    /// Input validation failure
    #[error("Invalid input: {0}")]
    Validation(String),

    /// Network / API call failure
    #[error("Network error: {0}")]
    Network(String),

    /// Filesystem or sync operation failure
    #[error("IO error: {0}")]
    Io(String),

    /// Feature not yet implemented
    #[error("{0}")]
    NotImplemented(String),

    /// External tool or process failure
    #[error("External error: {0}")]
    External(String),
}

// Tauri requires command error types to implement `Serialize`.
// We serialize as a structured object so the frontend can pattern-match on `kind`.
impl Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;

        let kind = match self {
            CommandError::Database(_) => "database",
            CommandError::Lock(_) => "lock",
            CommandError::NotFound { .. } => "not_found",
            CommandError::Validation(_) => "validation",
            CommandError::Network(_) => "network",
            CommandError::Io(_) => "io",
            CommandError::NotImplemented(_) => "not_implemented",
            CommandError::External(_) => "external",
        };

        let mut state = serializer.serialize_struct("CommandError", 2)?;
        state.serialize_field("kind", kind)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

// Convenience conversions

impl From<rusqlite::Error> for CommandError {
    fn from(e: rusqlite::Error) -> Self {
        CommandError::Database(e.to_string())
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(e: anyhow::Error) -> Self {
        CommandError::External(e.to_string())
    }
}

impl From<std::io::Error> for CommandError {
    fn from(e: std::io::Error) -> Self {
        CommandError::Io(e.to_string())
    }
}

impl From<reqwest::Error> for CommandError {
    fn from(e: reqwest::Error) -> Self {
        CommandError::Network(e.to_string())
    }
}

/// Helper to convert a `PoisonError` from `Mutex::lock()` into `CommandError::Lock`.
impl<T> From<std::sync::PoisonError<T>> for CommandError {
    fn from(e: std::sync::PoisonError<T>) -> Self {
        CommandError::Lock(e.to_string())
    }
}
