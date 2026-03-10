use std::collections::HashMap;

use axum::Json;
use axum::extract::State;

use mcs_core::model::InstallStatus;

use crate::dto::{ApiResponse, SkillCatalogDto};
use crate::state::AppState;

/// GET /api/skills/catalog — list source skill catalog with per-platform install status
pub async fn catalog(State(state): State<AppState>) -> Json<ApiResponse<Vec<SkillCatalogDto>>> {
    let sources = state.skill_catalog().await;
    let platforms = state.platforms().await;

    // Collect install status for each platform
    let mut platform_skills: HashMap<String, HashMap<String, InstallStatus>> = HashMap::new();
    for (platform_id, _) in &platforms {
        let skills = state.skills(platform_id).await;
        let skill_status: HashMap<String, InstallStatus> = skills
            .into_iter()
            .map(|item| (item.name, item.status))
            .collect();
        platform_skills.insert(platform_id.clone(), skill_status);
    }

    Json(ApiResponse::ok(to_skill_catalog_dtos(sources, &platform_skills)))
}

fn to_skill_catalog_dtos(
    sources: Vec<mcs_core::core::discovery::SkillSource>,
    platform_skills: &HashMap<String, HashMap<String, InstallStatus>>,
) -> Vec<SkillCatalogDto> {
    let mut catalog: Vec<SkillCatalogDto> = sources
        .into_iter()
        .map(|source| {
            // Build platform status map for this skill
            let platform_status: HashMap<String, InstallStatus> = platform_skills
                .iter()
                .filter_map(|(platform_id, skills)| {
                    skills.get(&source.name).map(|status| (platform_id.clone(), *status))
                })
                .collect();

            SkillCatalogDto {
                name: source.name,
                description: source.description,
                category: source.category,
                tags: source.tags,
                is_default: source.is_default,
                platform_status: if platform_status.is_empty() {
                    None
                } else {
                    Some(platform_status)
                },
            }
        })
        .collect();
    catalog.sort_by(|a, b| a.name.cmp(&b.name));
    catalog
}

#[cfg(test)]
mod tests {
    use super::to_skill_catalog_dtos;
    use mcs_core::core::discovery::SkillSource;
    use mcs_core::model::InstallStatus;
    use std::collections::HashMap;
    use std::path::PathBuf;

    fn source(name: &str, category: Option<&str>, is_default: bool) -> SkillSource {
        SkillSource {
            name: name.to_string(),
            source_path: PathBuf::from(format!("content/skills/{name}")),
            src_mtime: None,
            src_sig: None,
            description: Some(format!("desc-{name}")),
            category: category.map(|c| c.to_string()),
            tags: vec!["tag-a".to_string(), "tag-b".to_string()],
            is_default,
        }
    }

    #[test]
    fn to_skill_catalog_dtos_sorts_by_name() {
        let platform_skills = HashMap::new();
        let input = vec![
            source("z-last", Some("z"), false),
            source("a-first", Some("a"), true),
        ];
        let output = to_skill_catalog_dtos(input, &platform_skills);

        assert_eq!(output.len(), 2);
        assert_eq!(output[0].name, "a-first");
        assert_eq!(output[1].name, "z-last");
    }

    #[test]
    fn to_skill_catalog_dtos_maps_fields() {
        let platform_skills = HashMap::new();
        let output = to_skill_catalog_dtos(vec![source("demo", Some("core"), true)], &platform_skills);
        let skill = &output[0];

        assert_eq!(skill.name, "demo");
        assert_eq!(skill.description.as_deref(), Some("desc-demo"));
        assert_eq!(skill.category.as_deref(), Some("core"));
        assert_eq!(skill.tags, vec!["tag-a".to_string(), "tag-b".to_string()]);
        assert!(skill.is_default);
        assert!(skill.platform_status.is_none());
    }

    #[test]
    fn to_skill_catalog_dtos_includes_platform_status() {
        let mut platform_skills: HashMap<String, HashMap<String, InstallStatus>> = HashMap::new();
        let mut claude_skills = HashMap::new();
        claude_skills.insert("demo".to_string(), InstallStatus::Installed);
        platform_skills.insert("claude".to_string(), claude_skills);

        let output = to_skill_catalog_dtos(vec![source("demo", Some("core"), true)], &platform_skills);
        let skill = &output[0];

        assert!(skill.platform_status.is_some());
        let status = skill.platform_status.as_ref().unwrap();
        assert_eq!(status.get("claude"), Some(&InstallStatus::Installed));
    }
}
