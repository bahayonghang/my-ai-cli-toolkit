//! Database Module
//!
//! SQLite database initialization and migrations.

use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tracing::{debug, error, info};

/// Database manager
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Create a new database connection
    pub fn new(path: Option<PathBuf>) -> Result<Self> {
        let conn = match path {
            Some(ref p) => {
                debug!(path = %p.display(), "Opening database file");
                // Ensure parent directory exists
                if let Some(parent) = p.parent() {
                    if let Err(e) = std::fs::create_dir_all(parent) {
                        error!(path = %parent.display(), error = %e, "Failed to create database directory");
                    }
                }
                Connection::open(p)?
            }
            None => {
                debug!("Opening in-memory database");
                Connection::open_in_memory()?
            }
        };

        let db = Self { conn };
        db.init()?;

        if let Some(ref p) = path {
            info!(path = %p.display(), "Database initialized successfully");
        } else {
            info!("In-memory database initialized successfully");
        }

        Ok(db)
    }

    /// Get the default database path
    pub fn default_path() -> Option<PathBuf> {
        let path = dirs::data_local_dir().map(|p| p.join("agentkit-desktop").join("agentkit.db"));
        if let Some(ref p) = path {
            debug!(path = %p.display(), "Default database path");
        }
        path
    }

    /// Initialize database schema
    fn init(&self) -> Result<()> {
        debug!("Initializing database schema");
        self.conn.execute_batch(include_str!("schema.sql"))?;
        debug!("Database schema initialized");
        Ok(())
    }

    /// Get a reference to the connection
    pub fn conn(&self) -> &Connection {
        &self.conn
    }

    /// Get a mutable reference to the connection
    pub fn conn_mut(&mut self) -> &mut Connection {
        &mut self.conn
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_creation() {
        let db = Database::new(None).expect("Failed to create in-memory database");
        assert!(db.conn().is_autocommit());
    }

    #[test]
    fn test_schema_initialization() {
        let db = Database::new(None).expect("Failed to create database");

        // Check that tables exist
        let count: i32 = db
            .conn()
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='resources'",
                [],
                |row| row.get(0),
            )
            .expect("Failed to query");

        assert_eq!(count, 1);
    }
}
