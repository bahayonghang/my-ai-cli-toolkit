use std::collections::HashMap;

use axum::Json;
use axum::extract::State;

use mcs_core::core::external_skills::ExternalSkillEntry;
use mcs_core::model::InstallStatus;

use crate::dto::{ApiResponse, ExternalSkillCatalogDto};
use crate::state::AppState;

/// GET /api/external-skills/catalog — list external skills from TOML registry with install status
pub async fn catalog(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<ExternalSkillCatalogDto>>> {
    let entries = state.external_skill_catalog().await;
    let platforms = state.platforms().await;

    // Collect the skill directory names we need to check.
    let skill_names: Vec<String> = entries
        .iter()
        .map(|e| e.skill_flag.clone().unwrap_or_else(|| e.name.clone()))
        .collect();

    // Check platform target directories directly for installed external skills.
    // state.skills() only enumerates skills from content/skills/ sources;
    // external installs bypass that catalog entirely.
    let platform_skills = tokio::task::spawn_blocking(move || {
        let mut result: HashMap<String, HashMap<String, InstallStatus>> = HashMap::new();
        for (platform_id, config) in &platforms {
            let skills_dir = config.skills_path();
            let mut status_map: HashMap<String, InstallStatus> = HashMap::new();
            for name in &skill_names {
                if skills_dir.join(name).is_dir() {
                    status_map.insert(name.clone(), InstallStatus::Installed);
                }
            }
            if !status_map.is_empty() {
                result.insert(platform_id.clone(), status_map);
            }
        }
        result
    })
    .await
    .unwrap_or_default();

    // Convert to DTOs and enrich with platform status
    let dtos: Vec<ExternalSkillCatalogDto> = entries.iter().map(to_catalog_dto).collect();
    let enriched = enrich_with_platform_status(dtos, &platform_skills);

    Json(ApiResponse::ok(enriched))
}

fn to_catalog_dto(entry: &ExternalSkillEntry) -> ExternalSkillCatalogDto {
    ExternalSkillCatalogDto {
        name: entry.name.clone(),
        repo: entry.repo.clone(),
        skill_flag: entry.skill_flag.clone(),
        method: entry.method.clone(),
        category: entry.category.clone(),
        description: entry.description.clone(),
        stars: entry.stars,
        project_only: entry.project_only,
        usage: entry.usage.clone(),
        platform_status: None,
    }
}

fn enrich_with_platform_status(
    entries: Vec<ExternalSkillCatalogDto>,
    platform_skills: &HashMap<String, HashMap<String, InstallStatus>>,
) -> Vec<ExternalSkillCatalogDto> {
    entries
        .into_iter()
        .map(|entry| {
            let skill_name = entry.skill_flag.clone().unwrap_or_else(|| entry.name.clone());
            let mut platform_status: HashMap<String, InstallStatus> = HashMap::new();

            for (platform_id, skills) in platform_skills {
                if let Some(status) = skills.get(&skill_name) {
                    platform_status.insert(platform_id.clone(), *status);
                }
            }

            ExternalSkillCatalogDto {
                platform_status: if platform_status.is_empty() {
                    None
                } else {
                    Some(platform_status)
                },
                ..entry
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(name: &str, skill_flag: Option<&str>) -> ExternalSkillCatalogDto {
        ExternalSkillCatalogDto {
            name: name.to_string(),
            repo: format!("https://github.com/test/{name}"),
            skill_flag: skill_flag.map(|s| s.to_string()),
            method: "vercel".to_string(),
            category: None,
            description: None,
            stars: None,
            project_only: false,
            usage: None,
            platform_status: None,
        }
    }

    #[test]
    fn enrich_empty_platforms_returns_none_status() {
        let entries = vec![entry("foo", None)];
        let platform_skills = HashMap::new();
        let result = enrich_with_platform_status(entries, &platform_skills);
        assert!(result[0].platform_status.is_none());
    }

    #[test]
    fn enrich_uses_name_when_no_skill_flag() {
        let entries = vec![entry("my-skill", None)];
        let mut platform_skills = HashMap::new();
        let mut claude_skills = HashMap::new();
        claude_skills.insert("my-skill".to_string(), InstallStatus::Installed);
        platform_skills.insert("claude".to_string(), claude_skills);

        let result = enrich_with_platform_status(entries, &platform_skills);
        let status = result[0].platform_status.as_ref().unwrap();
        assert_eq!(status.get("claude"), Some(&InstallStatus::Installed));
    }

    #[test]
    fn enrich_uses_skill_flag_over_name() {
        let entries = vec![entry("display-name", Some("real-skill"))];
        let mut platform_skills = HashMap::new();
        let mut claude_skills = HashMap::new();
        claude_skills.insert("display-name".to_string(), InstallStatus::NotInstalled);
        claude_skills.insert("real-skill".to_string(), InstallStatus::Installed);
        platform_skills.insert("claude".to_string(), claude_skills);

        let result = enrich_with_platform_status(entries, &platform_skills);
        let status = result[0].platform_status.as_ref().unwrap();
        assert_eq!(status.get("claude"), Some(&InstallStatus::Installed));
    }

    #[test]
    fn enrich_multiple_platforms() {
        let entries = vec![entry("skill-a", None)];
        let mut platform_skills = HashMap::new();

        let mut claude = HashMap::new();
        claude.insert("skill-a".to_string(), InstallStatus::Installed);
        platform_skills.insert("claude".to_string(), claude);

        let mut codex = HashMap::new();
        codex.insert("skill-a".to_string(), InstallStatus::Outdated);
        platform_skills.insert("codex".to_string(), codex);

        // gemini doesn't have skill-a
        platform_skills.insert("gemini".to_string(), HashMap::new());

        let result = enrich_with_platform_status(entries, &platform_skills);
        let status = result[0].platform_status.as_ref().unwrap();
        assert_eq!(status.len(), 2);
        assert_eq!(status.get("claude"), Some(&InstallStatus::Installed));
        assert_eq!(status.get("codex"), Some(&InstallStatus::Outdated));
    }

    #[test]
    fn enrich_no_match_returns_none() {
        let entries = vec![entry("nonexistent", None)];
        let mut platform_skills = HashMap::new();
        let mut claude = HashMap::new();
        claude.insert("other-skill".to_string(), InstallStatus::Installed);
        platform_skills.insert("claude".to_string(), claude);

        let result = enrich_with_platform_status(entries, &platform_skills);
        assert!(result[0].platform_status.is_none());
    }
}
