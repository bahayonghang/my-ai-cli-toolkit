//! External skill commands

use super::AppState;
use crate::error::CommandError;
use crate::external::ExternalSource;
use crate::models::{ExternalSkill, LinkMode, Platform, SyncResult};
use crate::sync::SyncEngine;
use tauri::State;
use tracing::{debug, error, info, warn};

/// Get external skills from registry
#[tauri::command]
pub fn get_external_skills() -> Vec<ExternalSkill> {
    debug!("Getting external skills from registry");
    vec![]
}

/// Install an external skill
#[tauri::command]
pub async fn install_external_skill(
    state: State<'_, AppState>,
    source_type: String,
    source: String,
    branch: Option<String>,
    platforms: Vec<Platform>,
) -> Result<Vec<SyncResult>, CommandError> {
    info!(source_type = %source_type, source = %source, platforms = ?platforms, "Installing external skill");

    let external_source = match source_type.as_str() {
        "npm" => ExternalSource::Npm {
            package: source.clone(),
        },
        "pip" => ExternalSource::Pip {
            package: source.clone(),
        },
        "git" => ExternalSource::Git {
            url: source.clone(),
            branch,
        },
        "vercel" => ExternalSource::Vercel {
            skill_name: source.clone(),
        },
        _ => {
            error!(source_type = %source_type, "Unknown source type");
            return Err(CommandError::Validation(format!(
                "Unknown source type: {}",
                source_type
            )));
        }
    };

    let name = match &external_source {
        ExternalSource::Npm { package } => package
            .split('/')
            .next_back()
            .unwrap_or(package)
            .to_string(),
        ExternalSource::Pip { package } => package.clone(),
        ExternalSource::Git { url, .. } => url
            .split('/')
            .next_back()
            .unwrap_or("repo")
            .trim_end_matches(".git")
            .to_string(),
        ExternalSource::Vercel { skill_name } => skill_name.clone(),
    };

    debug!(name = %name, "Generated skill name from source");

    // Validate derived name: must be non-empty and contain at least one alphanumeric char
    if name.is_empty() || !name.chars().any(|c| c.is_alphanumeric()) {
        error!(source = %source, derived_name = %name, "Invalid skill name derived from source");
        return Err(CommandError::Validation(format!(
            "Could not derive a valid skill name from source '{}'. Please provide a source with a recognizable name.",
            source
        )));
    }

    let installed_path = state
        .external_manager
        .install(&external_source, &name)
        .map_err(|e: anyhow::Error| {
            error!(name = %name, error = %e, "External skill installation failed");
            CommandError::External(e.to_string())
        })?;

    debug!(path = %installed_path.display(), "External skill installed to cache");

    let sync_engine = SyncEngine::new(LinkMode::default());
    let mut results = Vec::new();

    for platform in &platforms {
        let target_dir = platform.skills_path_full();

        if let Some(target_dir) = target_dir {
            let target_path = target_dir.join(&name);

            let result = sync_engine
                .sync(&installed_path, &target_path, None)
                .map(|_| {
                    debug!(name = %name, platform = ?platform, "Synced to platform");
                    SyncResult {
                        success: true,
                        platform: *platform,
                        resource_id: name.clone(),
                        error: None,
                    }
                })
                .unwrap_or_else(|e| {
                    warn!(name = %name, platform = ?platform, error = %e, "Sync to platform failed");
                    SyncResult {
                        success: false,
                        platform: *platform,
                        resource_id: name.clone(),
                        error: Some(e.to_string()),
                    }
                });

            results.push(result);
        } else {
            warn!(name = %name, platform = ?platform, "Platform skills path not found");
            results.push(SyncResult {
                success: false,
                platform: *platform,
                resource_id: name.clone(),
                error: Some("Platform skills path not found".to_string()),
            });
        }
    }

    let success_count = results.iter().filter(|r| r.success).count();
    info!(name = %name, success_count, total = results.len(), "External skill installation completed");
    Ok(results)
}

/// Check external handler prerequisites
#[tauri::command]
pub fn check_external_handlers(state: State<AppState>) -> Vec<(String, bool)> {
    debug!("Checking external handler prerequisites");
    let handlers = state.external_manager.list_handlers();
    info!(handlers = ?handlers, "External handlers status");
    handlers
}
