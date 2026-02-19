//! Skill Installer Module
//!
//! Handles skill installation via npx skills CLI.

use crate::utils::create_command;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info, warn};

/// Installation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallResult {
    pub success: bool,
    pub skill_id: String,
    pub message: Option<String>,
    pub error: Option<String>,
}

/// Skill installer using npx skills CLI
pub struct SkillInstaller;

impl SkillInstaller {
    fn build_marketplace_install_args(github_ref: &str, skill: &str) -> Vec<String> {
        vec![
            "skills".to_string(),
            "add".to_string(),
            github_ref.to_string(),
            "--skill".to_string(),
            skill.to_string(),
            "-y".to_string(),
        ]
    }

    fn build_marketplace_uninstall_args(skill: &str) -> Vec<String> {
        vec![
            "skills".to_string(),
            "remove".to_string(),
            "--skill".to_string(),
            skill.to_string(),
            "-y".to_string(),
        ]
    }

    /// Create a new skill installer
    pub fn new() -> Self {
        debug!("Creating SkillInstaller");
        Self
    }

    /// Check if Node.js/npx is available
    pub fn check_nodejs_available() -> Result<bool> {
        debug!("Checking Node.js/npx availability");
        // Try npx first (using create_command for Windows compatibility)
        let npx_result = create_command("npx").arg("--version").output();

        if let Ok(output) = npx_result {
            if output.status.success() {
                let version = String::from_utf8_lossy(&output.stdout);
                debug!(version = %version.trim(), "npx is available");
                return Ok(true);
            }
        }

        // Try node as fallback check
        let node_result = create_command("node").arg("--version").output();

        if let Ok(output) = node_result {
            if output.status.success() {
                let version = String::from_utf8_lossy(&output.stdout);
                debug!(version = %version.trim(), "node is available");
                return Ok(true);
            }
        }

        warn!("Neither npx nor node is available");
        Ok(false)
    }

    /// Get Node.js version if available
    pub fn get_nodejs_version() -> Option<String> {
        debug!("Getting Node.js version");
        let output = create_command("node").arg("--version").output().ok()?;

        if output.status.success() {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            debug!(version = %version, "Node.js version detected");
            Some(version)
        } else {
            warn!("Failed to get Node.js version");
            None
        }
    }

    /// Install all skills in a repository.
    /// Prefer `install_skill_by_name` for skill-granular installs.
    pub fn install_skill(&self, owner: &str, repo: &str) -> Result<InstallResult> {
        crate::utils::sanitize_name(owner).map_err(|e| anyhow!("Invalid owner: {}", e))?;
        crate::utils::sanitize_name(repo).map_err(|e| anyhow!("Invalid repo: {}", e))?;
        let skill_ref = format!("{}/{}", owner, repo);
        info!(skill = %skill_ref, "Installing skill");

        // Check prerequisites
        if !Self::check_nodejs_available()? {
            error!(skill = %skill_ref, "Node.js is not available");
            return Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some("Node.js is not installed or not in PATH".to_string()),
            });
        }

        // Run npx skills add owner/repo -y
        debug!(skill = %skill_ref, "Running npx skills add");
        let output = create_command("npx")
            .args(["skills", "add", &skill_ref, "-y"])
            .output()
            .map_err(|e| {
                error!(error = %e, "Failed to execute npx skills");
                anyhow!("Failed to execute npx skills: {}", e)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if output.status.success() {
            info!(skill = %skill_ref, "Skill installed successfully");
            Ok(InstallResult {
                success: true,
                skill_id: skill_ref,
                message: Some(if stdout.is_empty() {
                    "Skill installed successfully".to_string()
                } else {
                    stdout
                }),
                error: None,
            })
        } else {
            error!(skill = %skill_ref, error = %stderr, "Skill installation failed");
            Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some(if stderr.is_empty() {
                    "Installation failed with unknown error".to_string()
                } else {
                    stderr
                }),
            })
        }
    }

    /// Install one specific skill from a repository:
    /// npx skills add https://github.com/{owner}/{repo} --skill {skill} -y
    pub fn install_skill_by_name(
        &self,
        owner: &str,
        repo: &str,
        skill: &str,
    ) -> Result<InstallResult> {
        crate::utils::sanitize_name(owner).map_err(|e| anyhow!("Invalid owner: {}", e))?;
        crate::utils::sanitize_name(repo).map_err(|e| anyhow!("Invalid repo: {}", e))?;
        crate::utils::sanitize_name(skill).map_err(|e| anyhow!("Invalid skill: {}", e))?;

        let github_ref = format!("https://github.com/{}/{}", owner, repo);
        let skill_ref = format!("{}/{}/{}", owner, repo, skill);
        info!(skill = %skill_ref, "Installing marketplace skill by name");

        if !Self::check_nodejs_available()? {
            error!(skill = %skill_ref, "Node.js is not available");
            return Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some("Node.js is not installed or not in PATH".to_string()),
            });
        }

        debug!(repo = %github_ref, skill = %skill, "Running npx skills add with --skill");
        let args = Self::build_marketplace_install_args(&github_ref, skill);
        let output = create_command("npx")
            .args(args.iter().map(String::as_str))
            .output()
            .map_err(|e| {
                error!(error = %e, "Failed to execute npx skills");
                anyhow!("Failed to execute npx skills: {}", e)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if output.status.success() {
            info!(skill = %skill_ref, "Marketplace skill installed successfully");
            Ok(InstallResult {
                success: true,
                skill_id: skill_ref,
                message: Some(if stdout.is_empty() {
                    "Skill installed successfully".to_string()
                } else {
                    stdout
                }),
                error: None,
            })
        } else {
            error!(skill = %skill_ref, error = %stderr, "Marketplace skill installation failed");
            Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some(if stderr.is_empty() {
                    "Installation failed with unknown error".to_string()
                } else {
                    stderr
                }),
            })
        }
    }

    /// Install skill to a specific directory
    pub fn install_skill_to_dir(
        &self,
        owner: &str,
        repo: &str,
        target_dir: &std::path::Path,
    ) -> Result<InstallResult> {
        let skill_ref = format!("{}/{}", owner, repo);
        info!(skill = %skill_ref, target = %target_dir.display(), "Installing skill to directory");

        // Check prerequisites
        if !Self::check_nodejs_available()? {
            error!(skill = %skill_ref, "Node.js is not available");
            return Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some("Node.js is not installed or not in PATH".to_string()),
            });
        }

        // Ensure target directory exists
        debug!(target = %target_dir.display(), "Creating target directory");
        std::fs::create_dir_all(target_dir)?;

        // Run npx skills add owner/repo --dir target_dir -y
        debug!(skill = %skill_ref, target = %target_dir.display(), "Running npx skills add with --dir");
        let output = create_command("npx")
            .args([
                "skills",
                "add",
                &skill_ref,
                "--dir",
                &target_dir.to_string_lossy(),
                "-y",
            ])
            .output()
            .map_err(|e| {
                error!(error = %e, "Failed to execute npx skills");
                anyhow!("Failed to execute npx skills: {}", e)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if output.status.success() {
            info!(skill = %skill_ref, target = %target_dir.display(), "Skill installed to directory successfully");
            Ok(InstallResult {
                success: true,
                skill_id: skill_ref,
                message: Some(if stdout.is_empty() {
                    format!("Skill installed to {}", target_dir.display())
                } else {
                    stdout
                }),
                error: None,
            })
        } else {
            error!(skill = %skill_ref, error = %stderr, "Skill installation to directory failed");
            Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some(if stderr.is_empty() {
                    "Installation failed with unknown error".to_string()
                } else {
                    stderr
                }),
            })
        }
    }

    /// Check if a skill is installed (by checking common paths)
    pub fn check_skill_installed(&self, owner: &str, repo: &str) -> bool {
        debug!(owner = %owner, repo = %repo, "Checking if skill is installed");
        // Check in common skill directories
        let skill_name = repo;

        // Check Claude skills directory
        if let Some(home) = dirs::home_dir() {
            let claude_path = home.join(".claude").join("skills").join(skill_name);
            if claude_path.exists() {
                debug!(path = %claude_path.display(), "Skill found in Claude directory");
                return true;
            }

            // Check Codex skills directory
            let codex_path = home.join(".codex").join("skills").join(skill_name);
            if codex_path.exists() {
                debug!(path = %codex_path.display(), "Skill found in Codex directory");
                return true;
            }

            // Check with owner/repo format
            let claude_path_full = home
                .join(".claude")
                .join("skills")
                .join(format!("{}-{}", owner, repo));
            if claude_path_full.exists() {
                debug!(path = %claude_path_full.display(), "Skill found with owner-repo format");
                return true;
            }
        }

        debug!(owner = %owner, repo = %repo, "Skill not found");
        false
    }

    /// Uninstall all skills in a repository.
    /// Prefer `uninstall_skill_by_name` for skill-granular uninstalls.
    pub fn uninstall_skill(&self, owner: &str, repo: &str) -> Result<InstallResult> {
        let skill_ref = format!("{}/{}", owner, repo);
        info!(skill = %skill_ref, "Uninstalling skill");

        // Check prerequisites
        if !Self::check_nodejs_available()? {
            error!(skill = %skill_ref, "Node.js is not available");
            return Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some("Node.js is not installed or not in PATH".to_string()),
            });
        }

        // Run npx skills remove owner/repo -y
        debug!(skill = %skill_ref, "Running npx skills remove");
        let output = create_command("npx")
            .args(["skills", "remove", &skill_ref, "-y"])
            .output()
            .map_err(|e| {
                error!(error = %e, "Failed to execute npx skills");
                anyhow!("Failed to execute npx skills: {}", e)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if output.status.success() {
            info!(skill = %skill_ref, "Skill uninstalled successfully");
            Ok(InstallResult {
                success: true,
                skill_id: skill_ref,
                message: Some(if stdout.is_empty() {
                    "Skill uninstalled successfully".to_string()
                } else {
                    stdout
                }),
                error: None,
            })
        } else {
            error!(skill = %skill_ref, error = %stderr, "Skill uninstallation failed");
            Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some(if stderr.is_empty() {
                    "Uninstallation failed with unknown error".to_string()
                } else {
                    stderr
                }),
            })
        }
    }

    /// Uninstall one specific skill:
    /// npx skills remove --skill {skill} -y
    pub fn uninstall_skill_by_name(
        &self,
        owner: &str,
        repo: &str,
        skill: &str,
    ) -> Result<InstallResult> {
        crate::utils::sanitize_name(owner).map_err(|e| anyhow!("Invalid owner: {}", e))?;
        crate::utils::sanitize_name(repo).map_err(|e| anyhow!("Invalid repo: {}", e))?;
        crate::utils::sanitize_name(skill).map_err(|e| anyhow!("Invalid skill: {}", e))?;

        let skill_ref = format!("{}/{}/{}", owner, repo, skill);
        info!(skill = %skill_ref, "Uninstalling marketplace skill by name");

        if !Self::check_nodejs_available()? {
            error!(skill = %skill_ref, "Node.js is not available");
            return Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some("Node.js is not installed or not in PATH".to_string()),
            });
        }

        let args = Self::build_marketplace_uninstall_args(skill);
        let output = create_command("npx")
            .args(args.iter().map(String::as_str))
            .output()
            .map_err(|e| {
                error!(error = %e, "Failed to execute npx skills");
                anyhow!("Failed to execute npx skills: {}", e)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if output.status.success() {
            info!(skill = %skill_ref, "Marketplace skill uninstalled successfully");
            Ok(InstallResult {
                success: true,
                skill_id: skill_ref,
                message: Some(if stdout.is_empty() {
                    "Skill uninstalled successfully".to_string()
                } else {
                    stdout
                }),
                error: None,
            })
        } else {
            error!(skill = %skill_ref, error = %stderr, "Marketplace skill uninstall failed");
            Ok(InstallResult {
                success: false,
                skill_id: skill_ref,
                message: None,
                error: Some(if stderr.is_empty() {
                    "Uninstallation failed with unknown error".to_string()
                } else {
                    stderr
                }),
            })
        }
    }
}

impl Default for SkillInstaller {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_nodejs() {
        // This test will pass/fail based on environment
        let result = SkillInstaller::check_nodejs_available();
        assert!(result.is_ok());
        println!("Node.js available: {}", result.unwrap());
    }

    #[test]
    fn test_get_nodejs_version() {
        let version = SkillInstaller::get_nodejs_version();
        println!("Node.js version: {:?}", version);
    }

    #[test]
    fn test_install_result_serialization() {
        let result = InstallResult {
            success: true,
            skill_id: "owner/repo".to_string(),
            message: Some("Installed".to_string()),
            error: None,
        };

        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("owner/repo"));
        assert!(json.contains("true"));
    }

    #[test]
    fn test_marketplace_install_args_contains_skill_flag() {
        let args = SkillInstaller::build_marketplace_install_args(
            "https://github.com/vercel-labs/skills",
            "find-skills",
        );
        assert_eq!(
            args,
            vec![
                "skills".to_string(),
                "add".to_string(),
                "https://github.com/vercel-labs/skills".to_string(),
                "--skill".to_string(),
                "find-skills".to_string(),
                "-y".to_string(),
            ]
        );
    }

    #[test]
    fn test_marketplace_uninstall_args_contains_skill_flag() {
        let args = SkillInstaller::build_marketplace_uninstall_args("find-skills");
        assert_eq!(
            args,
            vec![
                "skills".to_string(),
                "remove".to_string(),
                "--skill".to_string(),
                "find-skills".to_string(),
                "-y".to_string(),
            ]
        );
    }
}
