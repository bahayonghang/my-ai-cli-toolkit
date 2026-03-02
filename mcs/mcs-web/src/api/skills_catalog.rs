use axum::Json;
use axum::extract::State;

use crate::dto::{ApiResponse, SkillCatalogDto};
use crate::state::AppState;

/// GET /api/skills/catalog — list source skill catalog (platform-independent)
pub async fn catalog(State(state): State<AppState>) -> Json<ApiResponse<Vec<SkillCatalogDto>>> {
    let sources = state.skill_catalog().await;
    Json(ApiResponse::ok(to_skill_catalog_dtos(sources)))
}

fn to_skill_catalog_dtos(
    sources: Vec<mcs_core::core::discovery::SkillSource>,
) -> Vec<SkillCatalogDto> {
    let mut catalog: Vec<SkillCatalogDto> = sources
        .into_iter()
        .map(|source| SkillCatalogDto {
            name: source.name,
            description: source.description,
            category: source.category,
            tags: source.tags,
            is_default: source.is_default,
        })
        .collect();
    catalog.sort_by(|a, b| a.name.cmp(&b.name));
    catalog
}

#[cfg(test)]
mod tests {
    use super::to_skill_catalog_dtos;
    use mcs_core::core::discovery::SkillSource;
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
        let input = vec![
            source("z-last", Some("z"), false),
            source("a-first", Some("a"), true),
        ];
        let output = to_skill_catalog_dtos(input);

        assert_eq!(output.len(), 2);
        assert_eq!(output[0].name, "a-first");
        assert_eq!(output[1].name, "z-last");
    }

    #[test]
    fn to_skill_catalog_dtos_maps_fields() {
        let output = to_skill_catalog_dtos(vec![source("demo", Some("core"), true)]);
        let skill = &output[0];

        assert_eq!(skill.name, "demo");
        assert_eq!(skill.description.as_deref(), Some("desc-demo"));
        assert_eq!(skill.category.as_deref(), Some("core"));
        assert_eq!(skill.tags, vec!["tag-a".to_string(), "tag-b".to_string()]);
        assert!(skill.is_default);
    }
}
