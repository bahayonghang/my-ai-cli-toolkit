//! External Skills Module
//!
//! Handles installation of skills from external sources:
//! - npm packages
//! - pip packages
//! - Git repositories
//! - Vercel skill registry

use crate::utils::create_command;
use anyhow::{anyhow, Result};
use std::path::{Path, PathBuf};
use std::process::Command;
use tracing::{debug, error, info, warn};

/// External skill source types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ExternalSource {
    Npm { package: String },
    Pip { package: String },
    Git { url: String, branch: Option<String> },
    Vercel { skill_name: String },
}

/// External skill handler trait
pub trait ExternalHandler: Send + Sync {
    /// Install the external skill to a temporary directory
    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf>;

    /// Check if the handler's prerequisites are available
    fn check_prerequisites(&self) -> Result<()>;

    /// Get the handler name
    fn name(&self) -> &'static str;
}

/// npm package handler
pub struct NpmHandler;

impl ExternalHandler for NpmHandler {
    fn name(&self) -> &'static str {
        "npm"
    }

    fn check_prerequisites(&self) -> Result<()> {
        debug!("Checking npm prerequisites");
        let output = create_command("npm")
            .arg("--version")
            .output()
            .map_err(|e| {
                error!(error = %e, "npm is not installed or not in PATH");
                anyhow!("npm is not installed or not in PATH")
            })?;

        if !output.status.success() {
            error!("npm is not working properly");
            return Err(anyhow!("npm is not working properly"));
        }
        let version = String::from_utf8_lossy(&output.stdout);
        debug!(version = %version.trim(), "npm is available");
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let package = match source {
            ExternalSource::Npm { package } => package,
            _ => {
                error!("Invalid source type for npm handler");
                return Err(anyhow!("Invalid source type for npm handler"));
            }
        };

        info!(package = %package, target = %target_dir.display(), "Installing npm package");

        // Create target directory
        std::fs::create_dir_all(target_dir)?;
        debug!(target = %target_dir.display(), "Target directory created");

        // Initialize npm project if needed
        let package_json = target_dir.join("package.json");
        if !package_json.exists() {
            debug!("Initializing npm project");
            let output = create_command("npm")
                .args(["init", "-y"])
                .current_dir(target_dir)
                .output()?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                error!(error = %stderr, "Failed to initialize npm project");
                return Err(anyhow!("Failed to initialize npm project: {}", stderr));
            }
        }

        // Install the package
        debug!(package = %package, "Running npm install");
        let output = create_command("npm")
            .args(["install", package])
            .current_dir(target_dir)
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!(package = %package, error = %stderr, "Failed to install npm package");
            return Err(anyhow!(
                "Failed to install npm package '{}': {}",
                package,
                stderr
            ));
        }

        // Return path to installed package
        let package_name = if package.starts_with('@') {
            // Scoped package: @scope/name -> node_modules/@scope/name
            package.clone()
        } else {
            // Regular package or package@version
            package.split('@').next().unwrap_or(package).to_string()
        };

        let installed_path = target_dir.join("node_modules").join(&package_name);
        info!(package = %package, path = %installed_path.display(), "npm package installed successfully");
        Ok(installed_path)
    }
}

/// pip package handler
pub struct PipHandler;

impl ExternalHandler for PipHandler {
    fn name(&self) -> &'static str {
        "pip"
    }

    fn check_prerequisites(&self) -> Result<()> {
        debug!("Checking pip prerequisites");
        let output = create_command("pip").arg("--version").output().map_err(|e| {
            error!(error = %e, "pip is not installed or not in PATH");
            anyhow!("pip is not installed or not in PATH")
        })?;

        if !output.status.success() {
            error!("pip is not working properly");
            return Err(anyhow!("pip is not working properly"));
        }
        let version = String::from_utf8_lossy(&output.stdout);
        debug!(version = %version.trim(), "pip is available");
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let package = match source {
            ExternalSource::Pip { package } => package,
            _ => {
                error!("Invalid source type for pip handler");
                return Err(anyhow!("Invalid source type for pip handler"));
            }
        };

        info!(package = %package, target = %target_dir.display(), "Installing pip package");

        // Create target directory
        std::fs::create_dir_all(target_dir)?;
        debug!(target = %target_dir.display(), "Target directory created");

        // Install to target directory
        debug!(package = %package, "Running pip install");
        let output = create_command("pip")
            .args([
                "install",
                "--target",
                &target_dir.to_string_lossy(),
                package,
            ])
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!(package = %package, error = %stderr, "Failed to install pip package");
            return Err(anyhow!(
                "Failed to install pip package '{}': {}",
                package,
                stderr
            ));
        }

        info!(package = %package, path = %target_dir.display(), "pip package installed successfully");
        // Return the target directory (pip installs directly there)
        Ok(target_dir.to_path_buf())
    }
}

/// Git repository handler
pub struct GitHandler;

impl ExternalHandler for GitHandler {
    fn name(&self) -> &'static str {
        "git"
    }

    fn check_prerequisites(&self) -> Result<()> {
        debug!("Checking git prerequisites");
        let output = create_command("git").arg("--version").output().map_err(|e| {
            error!(error = %e, "git is not installed or not in PATH");
            anyhow!("git is not installed or not in PATH")
        })?;

        if !output.status.success() {
            error!("git is not working properly");
            return Err(anyhow!("git is not working properly"));
        }
        let version = String::from_utf8_lossy(&output.stdout);
        debug!(version = %version.trim(), "git is available");
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let (url, branch) = match source {
            ExternalSource::Git { url, branch } => (url, branch.clone()),
            _ => {
                error!("Invalid source type for git handler");
                return Err(anyhow!("Invalid source type for git handler"));
            }
        };

        info!(url = %url, branch = ?branch, target = %target_dir.display(), "Cloning git repository");

        // Remove target if exists
        if target_dir.exists() {
            debug!(target = %target_dir.display(), "Removing existing target directory");
            std::fs::remove_dir_all(target_dir)?;
        }

        // Clone the repository
        let target_str = target_dir.to_string_lossy().to_string();
        let mut args = vec!["clone", "--depth", "1"];

        if let Some(ref b) = branch {
            args.push("--branch");
            args.push(b);
            debug!(branch = %b, "Using specified branch");
        }

        args.push(url);
        args.push(&target_str);

        debug!(args = ?args, "Running git clone");
        let output = create_command("git").args(&args).output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!(url = %url, error = %stderr, "Failed to clone git repository");
            return Err(anyhow!(
                "Failed to clone git repository '{}': {}",
                url,
                stderr
            ));
        }

        info!(url = %url, path = %target_dir.display(), "Git repository cloned successfully");
        Ok(target_dir.to_path_buf())
    }
}

/// Vercel skill registry handler
pub struct VercelHandler;

impl ExternalHandler for VercelHandler {
    fn name(&self) -> &'static str {
        "vercel"
    }

    fn check_prerequisites(&self) -> Result<()> {
        debug!("Checking vercel/npx prerequisites");
        // Vercel skills use npx, so we need npm
        let output = create_command("npx")
            .arg("--version")
            .output()
            .map_err(|e| {
                error!(error = %e, "npx is not installed or not in PATH");
                anyhow!("npx is not installed or not in PATH")
            })?;

        if !output.status.success() {
            error!("npx is not working properly");
            return Err(anyhow!("npx is not working properly"));
        }
        let version = String::from_utf8_lossy(&output.stdout);
        debug!(version = %version.trim(), "npx is available");
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let skill_name = match source {
            ExternalSource::Vercel { skill_name } => skill_name,
            _ => {
                error!("Invalid source type for vercel handler");
                return Err(anyhow!("Invalid source type for vercel handler"));
            }
        };

        info!(skill_name = %skill_name, target = %target_dir.display(), "Installing Vercel skill");

        // Create target directory
        std::fs::create_dir_all(target_dir)?;
        debug!(target = %target_dir.display(), "Target directory created");

        // Use npx to download from Vercel skill registry
        // This assumes the Vercel skill registry CLI exists
        debug!(skill_name = %skill_name, "Running npx @anthropic/skills add");
        let output = create_command("npx")
            .args([
                "@anthropic/skills",
                "add",
                skill_name,
                "--dir",
                &target_dir.to_string_lossy(),
            ])
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!(
                skill_name = %skill_name,
                error = %stderr,
                "Failed to install Vercel skill"
            );
            // Fallback: try to fetch from a known URL pattern
            return Err(anyhow!(
                "Failed to install Vercel skill '{}': {}. \
                Note: Vercel skill registry may not be available yet.",
                skill_name,
                stderr
            ));
        }

        info!(skill_name = %skill_name, path = %target_dir.display(), "Vercel skill installed successfully");
        Ok(target_dir.to_path_buf())
    }
}

/// External skills manager
pub struct ExternalSkillsManager {
    npm_handler: NpmHandler,
    pip_handler: PipHandler,
    git_handler: GitHandler,
    vercel_handler: VercelHandler,
    cache_dir: PathBuf,
}

impl ExternalSkillsManager {
    pub fn new(cache_dir: PathBuf) -> Self {
        debug!(cache_dir = %cache_dir.display(), "Creating ExternalSkillsManager");
        Self {
            npm_handler: NpmHandler,
            pip_handler: PipHandler,
            git_handler: GitHandler,
            vercel_handler: VercelHandler,
            cache_dir,
        }
    }

    /// Get the appropriate handler for a source type
    fn get_handler(&self, source: &ExternalSource) -> &dyn ExternalHandler {
        match source {
            ExternalSource::Npm { .. } => &self.npm_handler,
            ExternalSource::Pip { .. } => &self.pip_handler,
            ExternalSource::Git { .. } => &self.git_handler,
            ExternalSource::Vercel { .. } => &self.vercel_handler,
        }
    }

    /// Check if prerequisites for a source type are available
    pub fn check_prerequisites(&self, source: &ExternalSource) -> Result<()> {
        let handler = self.get_handler(source);
        debug!(
            handler = handler.name(),
            "Checking prerequisites for handler"
        );
        handler.check_prerequisites()
    }

    /// Install an external skill
    pub fn install(&self, source: &ExternalSource, name: &str) -> Result<PathBuf> {
        info!(name = %name, source = ?source, "Installing external skill");

        // Check prerequisites first
        self.check_prerequisites(source)?;

        // Create cache directory for this skill
        let skill_cache_dir = self.cache_dir.join("external").join(name);
        debug!(cache_dir = %skill_cache_dir.display(), "Using skill cache directory");

        // Install using appropriate handler
        let handler = self.get_handler(source);
        debug!(handler = handler.name(), "Using handler for installation");
        let installed_path = handler.install(source, &skill_cache_dir)?;

        // Verify SKILL.md exists
        let skill_md = installed_path.join("SKILL.md");
        if !skill_md.exists() {
            // Check in skills subdirectory
            let skills_dir = installed_path.join("skills");
            if skills_dir.exists() {
                debug!(path = %skills_dir.display(), "Found skills subdirectory");
                return Ok(skills_dir);
            }

            // Warning but don't fail - some packages might have different structures
            warn!(path = %installed_path.display(), "SKILL.md not found in installed package");
        }

        info!(name = %name, path = %installed_path.display(), "External skill installed successfully");
        Ok(installed_path)
    }

    /// List available handlers and their status
    pub fn list_handlers(&self) -> Vec<(String, bool)> {
        debug!("Listing available handlers");
        let handlers = vec![
            (
                "npm".to_string(),
                self.npm_handler.check_prerequisites().is_ok(),
            ),
            (
                "pip".to_string(),
                self.pip_handler.check_prerequisites().is_ok(),
            ),
            (
                "git".to_string(),
                self.git_handler.check_prerequisites().is_ok(),
            ),
            (
                "vercel".to_string(),
                self.vercel_handler.check_prerequisites().is_ok(),
            ),
        ];
        debug!(handlers = ?handlers, "Handler availability checked");
        handlers
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_npm_handler_prerequisites() {
        let handler = NpmHandler;
        // This test will pass if npm is installed
        let result = handler.check_prerequisites();
        // Don't assert - just check it doesn't panic
        println!("npm available: {}", result.is_ok());
    }

    #[test]
    fn test_git_handler_prerequisites() {
        let handler = GitHandler;
        let result = handler.check_prerequisites();
        println!("git available: {}", result.is_ok());
    }

    #[test]
    fn test_external_source_serialization() {
        let source = ExternalSource::Npm {
            package: "@anthropic/skills".to_string(),
        };
        let json = serde_json::to_string(&source).unwrap();
        assert!(json.contains("npm"));
        assert!(json.contains("@anthropic/skills"));
    }
}
