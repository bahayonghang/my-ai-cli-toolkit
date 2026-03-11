use axum::Router;

use crate::state::AppState;

pub mod commands;
pub mod dashboard;
pub mod error;
pub mod legacy;
pub mod npx_skills;
pub mod platforms;
pub mod prompt;
pub mod skills;
pub mod skills_catalog;
pub mod sync;
pub mod system;

/// Assemble the complete API router
pub fn router() -> Router<AppState> {
    Router::new()
        // Global skills catalog
        .route(
            "/api/skills/catalog",
            axum::routing::get(skills_catalog::catalog),
        )
        // Platform routes
        .route("/api/platforms", axum::routing::get(platforms::list))
        .route("/api/refresh", axum::routing::post(platforms::refresh))
        .route("/api/platforms/{id}", axum::routing::get(platforms::get))
        .route(
            "/api/platforms/{id}/install-target/resolve",
            axum::routing::post(platforms::resolve_install_target),
        )
        .route(
            "/api/platforms/{id}/categories",
            axum::routing::get(platforms::categories),
        )
        // Dashboard
        .route("/api/dashboard", axum::routing::get(dashboard::stats))
        // Skills
        .route(
            "/api/platforms/{id}/skills",
            axum::routing::get(skills::list),
        )
        .route(
            "/api/platforms/{id}/skills/{name}",
            axum::routing::get(skills::detail),
        )
        .route(
            "/api/platforms/{id}/skills/{name}/diff",
            axum::routing::get(skills::diff),
        )
        .route(
            "/api/platforms/{id}/skills/install",
            axum::routing::post(skills::install),
        )
        .route(
            "/api/platforms/{id}/skills/uninstall",
            axum::routing::post(skills::uninstall),
        )
        .route(
            "/api/platforms/{id}/skills/{name}/content",
            axum::routing::put(skills::edit_content),
        )
        .route(
            "/api/platforms/{id}/npx-skills/catalog",
            axum::routing::get(npx_skills::catalog),
        )
        .route(
            "/api/platforms/{id}/npx-skills/installed",
            axum::routing::get(npx_skills::installed),
        )
        .route(
            "/api/platforms/{id}/npx-skills/install/jobs",
            axum::routing::post(npx_skills::install_jobs_start),
        )
        .route(
            "/api/platforms/{id}/npx-skills/remove/jobs",
            axum::routing::post(npx_skills::remove_jobs_start),
        )
        .route(
            "/api/platforms/{id}/npx-skills/check/jobs",
            axum::routing::post(npx_skills::check_jobs_start),
        )
        .route(
            "/api/platforms/{id}/npx-skills/update/jobs",
            axum::routing::post(npx_skills::update_jobs_start),
        )
        .route(
            "/api/platforms/{id}/npx-skills/jobs/{job_id}/stream",
            axum::routing::get(npx_skills::jobs_stream),
        )
        // Commands
        .route(
            "/api/platforms/{id}/commands",
            axum::routing::get(commands::list),
        )
        .route(
            "/api/platforms/{id}/commands/{name}/diff",
            axum::routing::get(commands::diff),
        )
        .route(
            "/api/platforms/{id}/commands/install",
            axum::routing::post(commands::install),
        )
        .route(
            "/api/platforms/{id}/commands/uninstall",
            axum::routing::post(commands::uninstall),
        )
        // Prompt
        .route(
            "/api/platforms/{id}/prompt/diff",
            axum::routing::get(prompt::diff),
        )
        .route(
            "/api/platforms/{id}/prompt/update",
            axum::routing::post(prompt::update),
        )
        // Multi-platform sync
        .route("/api/sync", axum::routing::post(sync::multi_sync))
        // System operations
        .route(
            "/api/system/pick-folder",
            axum::routing::get(system::pick_folder),
        )
        .route("/api/system/legacy-dirs", axum::routing::get(legacy::list))
        .route(
            "/api/system/legacy-dirs/cleanup",
            axum::routing::post(legacy::cleanup),
        )
}
