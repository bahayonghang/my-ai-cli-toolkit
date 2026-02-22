use axum::Json;
use axum::extract::{Path, Query, State};

use mcs_core::core::installer::{install_skill, uninstall_skill};

use crate::api::error::AppError;
use crate::dto::{
    ApiResponse, BatchResultDto, DiffDto, EditContentRequest, ExternalInstallMethod,
    ExternalInstallRequest, ExternalInstallResult, InstallRequest, ItemDetailDto, ItemDto,
    ItemQuery, SimpleSuccess,
};
use crate::state::AppState;

/// GET /api/platforms/:id/skills — list skills with optional filters
pub async fn list(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(query): Query<ItemQuery>,
) -> Result<Json<ApiResponse<Vec<ItemDto>>>, AppError> {
    // Validate platform exists
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let filtered = filter_items(skills, &query);

    Ok(Json(ApiResponse::ok(filtered)))
}

/// GET /api/platforms/:id/skills/:name — skill detail + SKILL.md content
pub async fn detail(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<ItemDetailDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let content = std::fs::read_to_string(item.source_path.join("SKILL.md")).ok();

    Ok(Json(ApiResponse::ok(ItemDetailDto {
        name: item.name,
        item_type: item.item_type,
        description: item.description,
        status: item.status,
        category: item.category,
        tags: item.tags,
        is_default: item.is_default,
        content,
    })))
}

/// GET /api/platforms/:id/skills/:name/diff — source vs installed diff
pub async fn diff(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
) -> Result<Json<ApiResponse<DiffDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    if !item.is_installed() {
        return Ok(Json(ApiResponse::ok(DiffDto {
            has_diff: false,
            diff_text: "Not installed".into(),
        })));
    }

    let diff_text = build_skill_diff(&item.source_path, &item.target_path);
    let has_diff = !diff_text.is_empty();

    Ok(Json(ApiResponse::ok(DiffDto {
        has_diff,
        diff_text,
    })))
}

/// POST /api/platforms/:id/skills/install — install skills by names
pub async fn install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }
    let root = state.project_root().await;
    let platform = state.platform(&id).await.unwrap();

    let mut results = Vec::new();
    for name in &body.names {
        results.push(install_skill(&root, &platform, name));
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache so next request reflects new install state
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

/// POST /api/platforms/:id/skills/uninstall — uninstall skills by names
pub async fn uninstall(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<InstallRequest>,
) -> Result<Json<ApiResponse<BatchResultDto>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }
    let platform = state.platform(&id).await.unwrap();

    let mut results = Vec::new();
    for name in &body.names {
        results.push(uninstall_skill(&platform, name));
    }

    let success_count = results.iter().filter(|r| r.success).count();
    let failure_count = results.len() - success_count;

    // Invalidate cache so next request reflects new uninstall state
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(BatchResultDto {
        results,
        success_count,
        failure_count,
    })))
}

// ── Helper functions ───────────────────────────────────────────────

fn filter_items(items: Vec<mcs_core::model::ItemInfo>, query: &ItemQuery) -> Vec<ItemDto> {
    items
        .into_iter()
        .filter(|item| {
            if let Some(ref search) = query.search {
                let s = search.to_lowercase();
                let name_match = item.name.to_lowercase().contains(&s);
                let desc_match = item
                    .description
                    .as_ref()
                    .is_some_and(|d| d.to_lowercase().contains(&s));
                if !name_match && !desc_match {
                    return false;
                }
            }
            if let Some(ref cat) = query.category
                && item.category.as_deref() != Some(cat.as_str())
            {
                return false;
            }
            if let Some(status) = query.status
                && item.status != status
            {
                return false;
            }
            true
        })
        .map(|item| ItemDto {
            name: item.name,
            item_type: item.item_type,
            description: item.description,
            status: item.status,
            category: item.category,
            tags: item.tags,
            is_default: item.is_default,
            source_path: item.source_path.to_string_lossy().into_owned(),
            target_path: item.target_path.to_string_lossy().into_owned(),
        })
        .collect()
}

fn build_skill_diff(source_dir: &std::path::Path, target_dir: &std::path::Path) -> String {
    use similar::TextDiff;

    let src_skill_md = std::fs::read_to_string(source_dir.join("SKILL.md")).unwrap_or_default();
    let tgt_skill_md = std::fs::read_to_string(target_dir.join("SKILL.md")).unwrap_or_default();
    TextDiff::from_lines(&tgt_skill_md, &src_skill_md)
        .unified_diff()
        .header("installed/SKILL.md", "source/SKILL.md")
        .to_string()
}

/// PUT /api/platforms/:id/skills/:name/content — overwrite SKILL.md content
pub async fn edit_content(
    State(state): State<AppState>,
    Path((id, name)): Path<(String, String)>,
    Json(body): Json<EditContentRequest>,
) -> Result<Json<ApiResponse<SimpleSuccess>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let skills = state.skills(&id).await;
    let item = skills
        .into_iter()
        .find(|s| s.name == name)
        .ok_or_else(|| AppError::NotFound(format!("Skill '{name}' not found")))?;

    let skill_md_path = item.source_path.join("SKILL.md");
    std::fs::write(&skill_md_path, &body.content)
        .map_err(|e| AppError::Internal(format!("Failed to write SKILL.md: {e}")))?;

    // Invalidate cache so next request reflects updated content
    state.invalidate_platform(&id).await;

    Ok(Json(ApiResponse::ok(SimpleSuccess { success: true })))
}

/// POST /api/platforms/:id/skills/external-install — install via npx CLI
pub async fn external_install(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<ExternalInstallRequest>,
) -> Result<Json<ApiResponse<ExternalInstallResult>>, AppError> {
    if state.platform(&id).await.is_none() {
        return Err(AppError::NotFound(format!("Platform '{id}' not found")));
    }

    let args: Vec<String> = match body.method {
        ExternalInstallMethod::Vercel => {
            vec![
                "skills".to_string(),
                "add".to_string(),
                body.skill_name.clone(),
            ]
        }
        ExternalInstallMethod::Playbooks => {
            vec![
                "playbooks".to_string(),
                "add".to_string(),
                "skill".to_string(),
                body.skill_name.clone(),
            ]
        }
    };

    let output = std::process::Command::new("npx")
        .args(&args)
        .output()
        .map_err(|e| AppError::Internal(format!("Failed to execute npx: {e}")))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let combined = if stderr.is_empty() {
        stdout
    } else {
        format!("{stdout}\n{stderr}")
    };
    let success = output.status.success();

    if success {
        state.invalidate_platform(&id).await;
    }

    Ok(Json(ApiResponse::ok(ExternalInstallResult {
        success,
        output: combined,
    })))
}
