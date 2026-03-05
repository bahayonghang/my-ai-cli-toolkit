use axum::Json;

use crate::api::error::AppError;
use crate::dto::{ApiResponse, PickedFolderDto};

/// GET /api/system/pick-folder — open native folder picker
pub async fn pick_folder() -> Result<Json<ApiResponse<PickedFolderDto>>, AppError> {
    let path = tokio::task::spawn_blocking(|| {
        rfd::FileDialog::new()
            .set_title("Select Project Directory")
            .pick_folder()
    })
    .await
    .map_err(|e| AppError::Internal(format!("Failed to spawn blocking task: {}", e)))?;

    let path_str = path.map(|p| p.to_string_lossy().into_owned());

    Ok(Json(ApiResponse::ok(PickedFolderDto { path: path_str })))
}
