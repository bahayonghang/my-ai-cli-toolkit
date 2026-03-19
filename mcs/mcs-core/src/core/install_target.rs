use std::fs::OpenOptions;
use std::path::{Path, PathBuf};

use crate::config::platform::PlatformConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum InstallTargetScope {
    #[default]
    Global,
    Project,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstallTargetAccessMode {
    Read,
    Write,
}

#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct InstallTarget {
    pub scope: InstallTargetScope,
    pub project_path: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ResolvedInstallTarget {
    pub platform: PlatformConfig,
    pub scope: InstallTargetScope,
    pub normalized_project_path: Option<PathBuf>,
}

pub fn resolve_target_platform(
    platform: &PlatformConfig,
    target: &InstallTarget,
    access_mode: InstallTargetAccessMode,
) -> Result<ResolvedInstallTarget, String> {
    match target.scope {
        InstallTargetScope::Global => Ok(ResolvedInstallTarget {
            platform: platform.clone(),
            scope: InstallTargetScope::Global,
            normalized_project_path: None,
        }),
        InstallTargetScope::Project => {
            let project_path =
                normalize_project_path(target.project_path.as_deref().unwrap_or(""), access_mode)?;
            let project_platform = project_platform_for_directory(platform, &project_path);
            Ok(ResolvedInstallTarget {
                platform: project_platform,
                scope: InstallTargetScope::Project,
                normalized_project_path: Some(project_path),
            })
        }
    }
}

pub fn normalize_project_path(
    raw_path: &str,
    access_mode: InstallTargetAccessMode,
) -> Result<PathBuf, String> {
    let trimmed = raw_path.trim();
    if trimmed.is_empty() {
        return Err("Project path is required in project install mode".into());
    }

    let input = PathBuf::from(trimmed);
    let abs_path = if input.is_absolute() {
        input
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Cannot resolve current directory: {e}"))?
            .join(input)
    };

    let normalized = abs_path.canonicalize().unwrap_or(abs_path);
    if !normalized.exists() {
        return Err(format!(
            "Project path does not exist: {}",
            normalized.display()
        ));
    }
    if !normalized.is_dir() {
        return Err(format!(
            "Project path is not a directory: {}",
            normalized.display()
        ));
    }

    if matches!(access_mode, InstallTargetAccessMode::Write) {
        ensure_writable_dir(&normalized)?;
    }

    Ok(normalized)
}

pub fn project_platform_for_directory(
    platform: &PlatformConfig,
    project_path: &Path,
) -> PlatformConfig {
    let mut project_platform = platform.clone();
    let platform_dir = project_platform_dir(&platform.name);
    let base_dir = project_path.join(platform_dir);
    project_platform.base_dir = base_dir.to_string_lossy().to_string();
    project_platform.skills_base_dir = None;
    project_platform
}

pub fn project_platform_dir(platform_name: &str) -> String {
    match platform_name {
        "opencode" => ".opencode".to_string(),
        "antigravity" => ".gemini/antigravity".to_string(),
        "windsurf" => ".codeium/windsurf".to_string(),
        _ => format!(".{platform_name}"),
    }
}

fn ensure_writable_dir(path: &Path) -> Result<(), String> {
    let probe_name = format!(
        ".mcs_write_probe_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_micros())
            .unwrap_or_default()
    );
    let probe = path.join(probe_name);
    match OpenOptions::new().create_new(true).write(true).open(&probe) {
        Ok(_) => {
            let _ = std::fs::remove_file(probe);
            Ok(())
        }
        Err(e) => Err(format!(
            "Project path is not writable: {} ({e})",
            path.display()
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::platform::PlatformConfig;

    fn mk_platform(name: &str) -> PlatformConfig {
        PlatformConfig {
            name: name.to_string(),
            base_dir: format!("/tmp/{name}"),
            skills_base_dir: None,
            skills_subdir: "skills".to_string(),
            commands_subdir: "commands".to_string(),
            commands_source: "claude".to_string(),
            fallback_commands_source: None,
            agents_subdir: "agents".to_string(),
            agents_source: "claude".to_string(),
            fallback_agents_source: None,
            guidance_file: None,
            guidance_source: String::new(),
            fallback_guidance_source: None,
        }
    }

    fn temp_dir(prefix: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "mcs_install_target_{}_{}_{}",
            prefix,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ));
        std::fs::create_dir_all(&path).expect("create temp dir");
        path
    }

    #[test]
    fn resolve_global_returns_original_platform() {
        let platform = mk_platform("claude");
        let resolved = resolve_target_platform(
            &platform,
            &InstallTarget {
                scope: InstallTargetScope::Global,
                project_path: None,
            },
            InstallTargetAccessMode::Read,
        )
        .expect("resolve global");

        assert_eq!(resolved.scope, InstallTargetScope::Global);
        assert_eq!(resolved.platform.base_dir, platform.base_dir);
        assert!(resolved.normalized_project_path.is_none());
    }

    #[test]
    fn normalize_relative_project_path_to_absolute() {
        let path = normalize_project_path(".", InstallTargetAccessMode::Read).expect("normalize");
        assert!(path.is_absolute());
    }

    #[test]
    fn missing_project_path_returns_error() {
        let err = normalize_project_path("", InstallTargetAccessMode::Read)
            .expect_err("missing project path should fail");
        assert!(err.contains("Project path is required"));
    }

    #[test]
    fn non_existing_project_path_returns_error() {
        let path = std::env::temp_dir().join(format!(
            "mcs_missing_{}_{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or_default()
        ));
        let err = normalize_project_path(&path.to_string_lossy(), InstallTargetAccessMode::Read)
            .expect_err("missing path should fail");
        assert!(err.contains("does not exist"));
    }

    #[test]
    fn non_directory_project_path_returns_error() {
        let root = temp_dir("file");
        let file = root.join("not-a-dir.txt");
        std::fs::write(&file, "test").expect("write file");
        let err = normalize_project_path(&file.to_string_lossy(), InstallTargetAccessMode::Read)
            .expect_err("file path should fail");
        assert!(err.contains("not a directory"));
    }

    #[test]
    fn project_platform_dir_special_mapping() {
        assert_eq!(project_platform_dir("opencode"), ".opencode");
        assert_eq!(project_platform_dir("antigravity"), ".gemini/antigravity");
        assert_eq!(project_platform_dir("windsurf"), ".codeium/windsurf");
        assert_eq!(project_platform_dir("claude"), ".claude");
    }

    #[test]
    fn resolve_project_applies_platform_directory_mapping() {
        let platform = mk_platform("opencode");
        let project_root = temp_dir("project");

        let resolved = resolve_target_platform(
            &platform,
            &InstallTarget {
                scope: InstallTargetScope::Project,
                project_path: Some(project_root.to_string_lossy().to_string()),
            },
            InstallTargetAccessMode::Write,
        )
        .expect("resolve project");

        let normalized_project = resolved
            .normalized_project_path
            .as_ref()
            .expect("normalized project path");
        assert_eq!(resolved.scope, InstallTargetScope::Project);
        assert_eq!(
            resolved.platform.base_path(),
            normalized_project.join(".opencode")
        );
        assert_eq!(
            resolved.platform.skills_path(),
            normalized_project.join(".opencode/skills")
        );
        assert_eq!(
            resolved.platform.commands_path(),
            normalized_project.join(".opencode/commands")
        );
    }
}
