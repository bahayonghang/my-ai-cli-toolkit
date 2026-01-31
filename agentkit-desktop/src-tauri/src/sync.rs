//! Sync Engine Module
//!
//! Handles file synchronization between source and target directories
//! using different strategies (symlink, junction, copy).

use crate::models::{LinkMode, SyncStatus};
use std::fs;
use std::io;
use std::path::Path;
use thiserror::Error;
use tracing::{debug, error, info, warn};

/// Sync engine errors
#[derive(Debug, Error)]
pub enum SyncError {
    #[error("Source not found: {0}")]
    SourceNotFound(String),

    #[error("Target already exists: {0}")]
    TargetExists(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Strategy not supported on this platform")]
    NotSupported,
}

/// Link strategy trait for different sync methods
pub trait LinkStrategy: Send + Sync {
    /// Sync source to target
    fn sync(&self, source: &Path, target: &Path) -> Result<(), SyncError>;

    /// Remove target link/copy
    fn remove(&self, target: &Path) -> Result<(), SyncError>;

    /// Check if target is synced with source
    fn is_synced(&self, source: &Path, target: &Path) -> bool;

    /// Get strategy name
    fn name(&self) -> &'static str;
}

/// Symlink strategy (Unix/macOS, Windows with dev mode)
pub struct SymlinkStrategy;

impl LinkStrategy for SymlinkStrategy {
    fn sync(&self, source: &Path, target: &Path) -> Result<(), SyncError> {
        debug!(source = %source.display(), target = %target.display(), "Creating symlink");

        if !source.exists() {
            error!(source = %source.display(), "Source not found");
            return Err(SyncError::SourceNotFound(source.display().to_string()));
        }

        if target.exists() {
            warn!(target = %target.display(), "Target already exists");
            return Err(SyncError::TargetExists(target.display().to_string()));
        }

        // Ensure parent directory exists
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }

        #[cfg(unix)]
        {
            std::os::unix::fs::symlink(source, target)?;
        }

        #[cfg(windows)]
        {
            if source.is_dir() {
                std::os::windows::fs::symlink_dir(source, target)?;
            } else {
                std::os::windows::fs::symlink_file(source, target)?;
            }
        }

        debug!(target = %target.display(), "Symlink created successfully");
        Ok(())
    }

    fn remove(&self, target: &Path) -> Result<(), SyncError> {
        debug!(target = %target.display(), "Removing symlink");
        if target.is_symlink() {
            fs::remove_file(target)?;
        } else if target.is_dir() {
            fs::remove_dir_all(target)?;
        } else if target.exists() {
            fs::remove_file(target)?;
        }
        Ok(())
    }

    fn is_synced(&self, source: &Path, target: &Path) -> bool {
        if !target.is_symlink() {
            return false;
        }

        match fs::read_link(target) {
            Ok(link_target) => link_target == source,
            Err(_) => false,
        }
    }

    fn name(&self) -> &'static str {
        "symlink"
    }
}

/// Junction strategy (Windows only)
#[cfg(windows)]
pub struct JunctionStrategy;

#[cfg(windows)]
impl LinkStrategy for JunctionStrategy {
    fn sync(&self, source: &Path, target: &Path) -> Result<(), SyncError> {
        debug!(source = %source.display(), target = %target.display(), "Creating junction");

        if !source.exists() {
            error!(source = %source.display(), "Source not found");
            return Err(SyncError::SourceNotFound(source.display().to_string()));
        }

        if !source.is_dir() {
            warn!(source = %source.display(), "Junction requires directory source");
            return Err(SyncError::NotSupported);
        }

        if target.exists() {
            warn!(target = %target.display(), "Target already exists");
            return Err(SyncError::TargetExists(target.display().to_string()));
        }

        // Ensure parent directory exists
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }

        // Use junction crate or cmd /c mklink /J
        let output = std::process::Command::new("cmd")
            .args(["/C", "mklink", "/J"])
            .arg(target)
            .arg(source)
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            error!(target = %target.display(), error = %stderr, "Junction creation failed");
            return Err(SyncError::PermissionDenied(stderr));
        }

        debug!(target = %target.display(), "Junction created successfully");
        Ok(())
    }

    fn remove(&self, target: &Path) -> Result<(), SyncError> {
        debug!(target = %target.display(), "Removing junction");
        if target.exists() {
            fs::remove_dir(target)?;
        }
        Ok(())
    }

    fn is_synced(&self, source: &Path, target: &Path) -> bool {
        if !target.exists() {
            return false;
        }

        // Check if it's a junction by comparing canonical paths
        match (source.canonicalize(), target.canonicalize()) {
            (Ok(src), Ok(tgt)) => src == tgt,
            _ => false,
        }
    }

    fn name(&self) -> &'static str {
        "junction"
    }
}

/// Copy strategy (fallback for all platforms)
pub struct CopyStrategy;

impl LinkStrategy for CopyStrategy {
    fn sync(&self, source: &Path, target: &Path) -> Result<(), SyncError> {
        debug!(source = %source.display(), target = %target.display(), "Copying files");

        if !source.exists() {
            error!(source = %source.display(), "Source not found");
            return Err(SyncError::SourceNotFound(source.display().to_string()));
        }

        if target.exists() {
            warn!(target = %target.display(), "Target already exists");
            return Err(SyncError::TargetExists(target.display().to_string()));
        }

        // Ensure parent directory exists
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }

        if source.is_dir() {
            copy_dir_recursive(source, target)?;
        } else {
            fs::copy(source, target)?;
        }

        debug!(target = %target.display(), "Copy completed successfully");
        Ok(())
    }

    fn remove(&self, target: &Path) -> Result<(), SyncError> {
        debug!(target = %target.display(), "Removing copied files");
        if target.is_dir() {
            fs::remove_dir_all(target)?;
        } else if target.exists() {
            fs::remove_file(target)?;
        }
        Ok(())
    }

    fn is_synced(&self, source: &Path, target: &Path) -> bool {
        if !target.exists() {
            return false;
        }

        // For copy strategy, we compare modification times
        match (source.metadata(), target.metadata()) {
            (Ok(src_meta), Ok(tgt_meta)) => match (src_meta.modified(), tgt_meta.modified()) {
                (Ok(src_time), Ok(tgt_time)) => tgt_time >= src_time,
                _ => false,
            },
            _ => false,
        }
    }

    fn name(&self) -> &'static str {
        "copy"
    }
}

/// Recursively copy a directory
fn copy_dir_recursive(src: &Path, dst: &Path) -> io::Result<()> {
    fs::create_dir_all(dst)?;

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

/// Sync engine that manages different strategies
pub struct SyncEngine {
    default_mode: LinkMode,
}

impl SyncEngine {
    pub fn new(default_mode: LinkMode) -> Self {
        debug!(mode = ?default_mode, "Creating sync engine");
        Self { default_mode }
    }

    /// Get the appropriate strategy for the given mode
    fn get_strategy(&self, mode: &LinkMode) -> Box<dyn LinkStrategy> {
        match mode {
            LinkMode::Symlink => Box::new(SymlinkStrategy),
            #[cfg(windows)]
            LinkMode::Junction => Box::new(JunctionStrategy),
            #[cfg(not(windows))]
            LinkMode::Junction => Box::new(SymlinkStrategy), // Fallback to symlink on non-Windows
            LinkMode::Copy => Box::new(CopyStrategy),
        }
    }

    /// Sync source to target using the specified mode
    pub fn sync(
        &self,
        source: &Path,
        target: &Path,
        mode: Option<LinkMode>,
    ) -> Result<(), SyncError> {
        let mode = mode.unwrap_or(self.default_mode);
        let strategy = self.get_strategy(&mode);

        info!(
            source = %source.display(),
            target = %target.display(),
            strategy = strategy.name(),
            "Syncing resource"
        );

        // Try the requested strategy, fall back to copy if it fails
        match strategy.sync(source, target) {
            Ok(()) => {
                info!(target = %target.display(), strategy = strategy.name(), "Sync completed");
                Ok(())
            }
            Err(SyncError::PermissionDenied(_)) | Err(SyncError::NotSupported) => {
                // Fall back to copy strategy
                warn!(
                    strategy = strategy.name(),
                    "Strategy failed, falling back to copy"
                );
                let copy_strategy = CopyStrategy;
                copy_strategy.sync(source, target)
            }
            Err(e) => {
                error!(error = %e, "Sync failed");
                Err(e)
            }
        }
    }

    /// Remove a synced target
    pub fn remove(&self, target: &Path) -> Result<(), SyncError> {
        info!(target = %target.display(), "Removing synced resource");

        // Determine what kind of link/file it is and remove appropriately
        if target.is_symlink() {
            SymlinkStrategy.remove(target)
        } else if target.is_dir() {
            CopyStrategy.remove(target)
        } else if target.exists() {
            fs::remove_file(target)?;
            Ok(())
        } else {
            debug!(target = %target.display(), "Target does not exist, nothing to remove");
            Ok(())
        }
    }

    /// Check sync status
    pub fn check_status(&self, source: &Path, target: &Path) -> SyncStatus {
        if !target.exists() && !target.is_symlink() {
            return SyncStatus::NotInstalled;
        }

        // Check if it's a symlink pointing to source
        if target.is_symlink() {
            if SymlinkStrategy.is_synced(source, target) {
                return SyncStatus::Synced;
            } else {
                return SyncStatus::Conflict;
            }
        }

        // Check if it's a copy that's up to date
        if CopyStrategy.is_synced(source, target) {
            SyncStatus::Synced
        } else {
            SyncStatus::Outdated
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sync_engine_creation() {
        let engine = SyncEngine::new(LinkMode::Symlink);
        assert_eq!(engine.default_mode, LinkMode::Symlink);
    }
}
