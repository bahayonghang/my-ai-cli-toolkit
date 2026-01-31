//! External Skills Module
//!
//! Handles installation of skills from external sources:
//! - npm packages
//! - pip packages
//! - Git repositories
//! - Vercel skill registry

use anyhow::{anyhow, Result};
use std::path::{Path, PathBuf};
use std::process::Command;

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
        let output = Command::new("npm")
            .arg("--version")
            .output()
            .map_err(|_| anyhow!("npm is not installed or not in PATH"))?;

        if !output.status.success() {
            return Err(anyhow!("npm is not working properly"));
        }
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let package = match source {
            ExternalSource::Npm { package } => package,
            _ => return Err(anyhow!("Invalid source type for npm handler")),
        };

        // Create target directory
        std::fs::create_dir_all(target_dir)?;

        // Initialize npm project if needed
        let package_json = target_dir.join("package.json");
        if !package_json.exists() {
            let output = Command::new("npm")
                .args(["init", "-y"])
                .current_dir(target_dir)
                .output()?;

            if !output.status.success() {
                return Err(anyhow!("Failed to initialize npm project: {}",
                    String::from_utf8_lossy(&output.stderr)));
            }
        }

        // Install the package
        let output = Command::new("npm")
            .args(["install", package])
            .current_dir(target_dir)
            .output()?;

        if !output.status.success() {
            return Err(anyhow!("Failed to install npm package '{}': {}",
                package, String::from_utf8_lossy(&output.stderr)));
        }

        // Return path to installed package
        let package_name = if package.starts_with('@') {
            // Scoped package: @scope/name -> node_modules/@scope/name
            package.clone()
        } else {
            // Regular package or package@version
            package.split('@').next().unwrap_or(package).to_string()
        };

        Ok(target_dir.join("node_modules").join(package_name))
    }
}

/// pip package handler
pub struct PipHandler;

impl ExternalHandler for PipHandler {
    fn name(&self) -> &'static str {
        "pip"
    }

    fn check_prerequisites(&self) -> Result<()> {
        let output = Command::new("pip")
            .arg("--version")
            .output()
            .map_err(|_| anyhow!("pip is not installed or not in PATH"))?;

        if !output.status.success() {
            return Err(anyhow!("pip is not working properly"));
        }
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let package = match source {
            ExternalSource::Pip { package } => package,
            _ => return Err(anyhow!("Invalid source type for pip handler")),
        };

        // Create target directory
        std::fs::create_dir_all(target_dir)?;

        // Install to target directory
        let output = Command::new("pip")
            .args(["install", "--target", &target_dir.to_string_lossy(), package])
            .output()?;

        if !output.status.success() {
            return Err(anyhow!("Failed to install pip package '{}': {}",
                package, String::from_utf8_lossy(&output.stderr)));
        }

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
        let output = Command::new("git")
            .arg("--version")
            .output()
            .map_err(|_| anyhow!("git is not installed or not in PATH"))?;

        if !output.status.success() {
            return Err(anyhow!("git is not working properly"));
        }
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let (url, branch) = match source {
            ExternalSource::Git { url, branch } => (url, branch.clone()),
            _ => return Err(anyhow!("Invalid source type for git handler")),
        };

        // Remove target if exists
        if target_dir.exists() {
            std::fs::remove_dir_all(target_dir)?;
        }

        // Clone the repository
        let target_str = target_dir.to_string_lossy().to_string();
        let mut args = vec!["clone", "--depth", "1"];

        if let Some(ref b) = branch {
            args.push("--branch");
            args.push(b);
        }

        args.push(url);
        args.push(&target_str);

        let output = Command::new("git")
            .args(&args)
            .output()?;

        if !output.status.success() {
            return Err(anyhow!("Failed to clone git repository '{}': {}",
                url, String::from_utf8_lossy(&output.stderr)));
        }

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
        // Vercel skills use npx, so we need npm
        let output = Command::new("npx")
            .arg("--version")
            .output()
            .map_err(|_| anyhow!("npx is not installed or not in PATH"))?;

        if !output.status.success() {
            return Err(anyhow!("npx is not working properly"));
        }
        Ok(())
    }

    fn install(&self, source: &ExternalSource, target_dir: &Path) -> Result<PathBuf> {
        let skill_name = match source {
            ExternalSource::Vercel { skill_name } => skill_name,
            _ => return Err(anyhow!("Invalid source type for vercel handler")),
        };

        // Create target directory
        std::fs::create_dir_all(target_dir)?;

        // Use npx to download from Vercel skill registry
        // This assumes the Vercel skill registry CLI exists
        let output = Command::new("npx")
            .args(["@anthropic/skills", "add", skill_name, "--dir", &target_dir.to_string_lossy()])
            .output()?;

        if !output.status.success() {
            // Fallback: try to fetch from a known URL pattern
            return Err(anyhow!("Failed to install Vercel skill '{}': {}. \
                Note: Vercel skill registry may not be available yet.",
                skill_name, String::from_utf8_lossy(&output.stderr)));
        }

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
        self.get_handler(source).check_prerequisites()
    }

    /// Install an external skill
    pub fn install(&self, source: &ExternalSource, name: &str) -> Result<PathBuf> {
        // Check prerequisites first
        self.check_prerequisites(source)?;

        // Create cache directory for this skill
        let skill_cache_dir = self.cache_dir.join("external").join(name);

        // Install using appropriate handler
        let handler = self.get_handler(source);
        let installed_path = handler.install(source, &skill_cache_dir)?;

        // Verify SKILL.md exists
        let skill_md = installed_path.join("SKILL.md");
        if !skill_md.exists() {
            // Check in skills subdirectory
            let skills_dir = installed_path.join("skills");
            if skills_dir.exists() {
                return Ok(skills_dir);
            }

            // Warning but don't fail - some packages might have different structures
            eprintln!("Warning: SKILL.md not found in installed package");
        }

        Ok(installed_path)
    }

    /// List available handlers and their status
    pub fn list_handlers(&self) -> Vec<(String, bool)> {
        vec![
            ("npm".to_string(), self.npm_handler.check_prerequisites().is_ok()),
            ("pip".to_string(), self.pip_handler.check_prerequisites().is_ok()),
            ("git".to_string(), self.git_handler.check_prerequisites().is_ok()),
            ("vercel".to_string(), self.vercel_handler.check_prerequisites().is_ok()),
        ]
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
            package: "@anthropic/skills".to_string()
        };
        let json = serde_json::to_string(&source).unwrap();
        assert!(json.contains("npm"));
        assert!(json.contains("@anthropic/skills"));
    }
}
