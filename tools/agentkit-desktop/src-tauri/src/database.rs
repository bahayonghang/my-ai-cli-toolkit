//! Database Module
//!
//! SQLite database initialization and versioned migrations.

use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tracing::{debug, error, info, warn};

/// Current schema version. Bump this when adding new migrations.
const SCHEMA_VERSION: u32 = 2;

/// A single migration step.
struct Migration {
    version: u32,
    description: &'static str,
    sql: &'static str,
}

/// All migrations, ordered by version. Each migration brings the schema
/// from `version - 1` to `version`.
///
/// **Rules for adding migrations:**
/// 1. Append a new `Migration` with `version = SCHEMA_VERSION` (after bumping the const).
/// 2. Never modify or remove existing migrations.
/// 3. Use `IF NOT EXISTS` / `IF EXISTS` guards so migrations are idempotent.
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Initial schema (baseline)",
            sql: include_str!("schema.sql"),
        },
        Migration {
            version: 2,
            description: "Replace update_resources_timestamp trigger with WHEN-guarded version",
            sql: "DROP TRIGGER IF EXISTS update_resources_timestamp;
CREATE TRIGGER IF NOT EXISTS update_resources_timestamp
AFTER UPDATE ON resources
FOR EACH ROW
WHEN OLD.name != NEW.name
  OR OLD.type != NEW.type
  OR OLD.description IS NOT NEW.description
  OR OLD.source_type != NEW.source_type
  OR OLD.source_path IS NOT NEW.source_path
  OR OLD.source_url IS NOT NEW.source_url
  OR OLD.source_branch IS NOT NEW.source_branch
  OR OLD.source_package IS NOT NEW.source_package
BEGIN
    UPDATE resources SET updated_at = datetime('now') WHERE id = NEW.id;
END;",
        },
    ]
}

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

        // PRAGMA foreign_keys is per-connection and must be set before any queries.
        // Setting it in schema.sql is insufficient since it resets on each new connection.
        db.conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        db.run_migrations()?;

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

    /// Get the current schema version from the database.
    /// Returns 0 if the version table does not exist (fresh database).
    fn current_version(&self) -> Result<u32> {
        // Check if schema_version table exists
        let table_exists: bool = self.conn.query_row(
            "SELECT COUNT(*) > 0 FROM sqlite_master WHERE type='table' AND name='schema_version'",
            [],
            |row| row.get(0),
        )?;

        if !table_exists {
            return Ok(0);
        }

        let version: u32 = self.conn.query_row(
            "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1",
            [],
            |row| row.get(0),
        )?;

        Ok(version)
    }

    /// Run all pending migrations in a transaction.
    fn run_migrations(&self) -> Result<()> {
        let current = self.current_version()?;
        debug!(
            current_version = current,
            target_version = SCHEMA_VERSION,
            "Checking migrations"
        );

        if current >= SCHEMA_VERSION {
            debug!("Database schema is up to date");
            return Ok(());
        }

        // Ensure schema_version table exists
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                description TEXT NOT NULL,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            );",
        )?;

        let all_migrations = migrations();

        for migration in &all_migrations {
            if migration.version <= current {
                continue;
            }

            info!(
                version = migration.version,
                description = migration.description,
                "Applying migration"
            );

            // Run each migration in its own transaction
            self.conn.execute_batch("BEGIN;")?;

            match self.conn.execute_batch(migration.sql) {
                Ok(()) => {
                    self.conn.execute(
                        "INSERT OR REPLACE INTO schema_version (version, description) VALUES (?1, ?2)",
                        rusqlite::params![migration.version, migration.description],
                    )?;
                    self.conn.execute_batch("COMMIT;")?;
                    info!(
                        version = migration.version,
                        "Migration applied successfully"
                    );
                }
                Err(e) => {
                    warn!(version = migration.version, error = %e, "Migration failed, rolling back");
                    self.conn.execute_batch("ROLLBACK;")?;
                    return Err(e);
                }
            }
        }

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

    #[test]
    fn test_schema_version_tracked() {
        let db = Database::new(None).expect("Failed to create database");

        let version = db.current_version().expect("Failed to get version");
        assert_eq!(version, SCHEMA_VERSION);
    }

    #[test]
    fn test_migrations_idempotent() {
        let db = Database::new(None).expect("Failed to create database");

        // Running migrations again should be a no-op
        db.run_migrations()
            .expect("Re-running migrations should succeed");

        let version = db.current_version().expect("Failed to get version");
        assert_eq!(version, SCHEMA_VERSION);
    }
}
