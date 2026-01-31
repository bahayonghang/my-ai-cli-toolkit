//! Database Module
//!
//! SQLite database initialization and migrations.

use rusqlite::{Connection, Result};
use std::path::PathBuf;

/// Database manager
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Create a new database connection
    pub fn new(path: Option<PathBuf>) -> Result<Self> {
        let conn = match path {
            Some(p) => {
                // Ensure parent directory exists
                if let Some(parent) = p.parent() {
                    std::fs::create_dir_all(parent).ok();
                }
                Connection::open(p)?
            }
            None => Connection::open_in_memory()?,
        };

        let db = Self { conn };
        db.init()?;
        Ok(db)
    }

    /// Get the default database path
    pub fn default_path() -> Option<PathBuf> {
        dirs::data_local_dir().map(|p| p.join("agentkit-desktop").join("agentkit.db"))
    }

    /// Initialize database schema
    fn init(&self) -> Result<()> {
        self.conn.execute_batch(include_str!("schema.sql"))?;
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
        let count: i32 = db.conn()
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='resources'",
                [],
                |row| row.get(0),
            )
            .expect("Failed to query");

        assert_eq!(count, 1);
    }
}
