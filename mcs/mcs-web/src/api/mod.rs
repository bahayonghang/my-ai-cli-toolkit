use axum::Router;

use crate::state::AppState;

pub mod commands;
pub mod dashboard;
pub mod error;
pub mod platforms;
pub mod prompt;
pub mod skills;
pub mod skills_catalog;
pub mod sync;

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
            "/api/platforms/{id}/skills/external-install",
            axum::routing::post(skills::external_install),
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
}
