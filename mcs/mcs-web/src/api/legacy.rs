use axum::Json;
use axum::extract::State;

use mcs_core::config::platform::detect_legacy_skill_dirs;

use crate::api::error::AppError;
use crate::dto::{ApiResponse, CleanupFailureDto, CleanupRequest, CleanupResultDto, LegacyDirDto};
use crate::state::AppState;

/// GET /api/system/legacy-dirs — list legacy skill directories
pub async fn list(State(state): State<AppState>) -> Json<ApiResponse<Vec<LegacyDirDto>>> {
    let platforms = state.platforms().await;
    let legacy_dirs = detect_legacy_skill_dirs(&platforms);

    let dtos: Vec<LegacyDirDto> = legacy_dirs
        .into_iter()
        .map(|d| LegacyDirDto {
            platform_id: d.platform_id,
            legacy_path: d.legacy_path.to_string_lossy().into_owned(),
            shared_path: d.shared_path.to_string_lossy().into_owned(),
        })
        .collect();

    Json(ApiResponse::ok(dtos))
}

/// POST /api/system/legacy-dirs/cleanup — remove selected legacy directories
pub async fn cleanup(
    Json(req): Json<CleanupRequest>,
) -> Result<Json<ApiResponse<CleanupResultDto>>, AppError> {
    let mut removed = Vec::new();
    let mut failed = Vec::new();

    for path_str in req.paths {
        let path = std::path::PathBuf::from(&path_str);
        if !path.exists() {
            removed.push(path_str); // already gone = success
            continue;
        }
        match std::fs::remove_dir_all(&path) {
            Ok(_) => removed.push(path_str),
            Err(e) => failed.push(CleanupFailureDto {
                path: path_str,
                error: e.to_string(),
            }),
        }
    }

    Ok(Json(ApiResponse::ok(CleanupResultDto { removed, failed })))
}
