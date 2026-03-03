mod api;
mod dto;
mod state;

use std::net::SocketAddr;

use axum::response::IntoResponse;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};
use tracing_subscriber::EnvFilter;

use mcs_core::config::paths::detect_project_root;
use mcs_core::config::platform::load_platforms;
use mcs_core::core::skill_migration::run_one_time_skill_migration;

use crate::state::AppState;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    // Detect project root
    let project_root = detect_project_root().unwrap_or_else(|| {
        tracing::error!("Could not detect project root (content/skills/ not found)");
        std::process::exit(1);
    });
    tracing::info!("Project root: {}", project_root.display());

    // Load platform configurations
    let platforms = load_platforms(&project_root);
    tracing::info!("Loaded {} platforms", platforms.len());
    match run_one_time_skill_migration(&project_root, &platforms) {
        Ok(summary) if summary.skipped => {
            tracing::info!(
                "Skill migration skipped: {}",
                summary.reason.unwrap_or_else(|| "already done".into())
            );
        }
        Ok(summary) => {
            tracing::info!(
                "Skill migration done: migrated={}, relinked={}, copy_fallbacks={}, errors={}",
                summary.migrated_skills,
                summary.relinked_targets,
                summary.copy_fallbacks,
                summary.errors.len()
            );
            if !summary.errors.is_empty() {
                for err in summary.errors.iter().take(3) {
                    tracing::warn!("Migration issue: {err}");
                }
            }
        }
        Err(err) => {
            tracing::error!("Skill migration failed: {err}");
        }
    }

    // Build shared state and pre-warm discovery cache
    let app_state = AppState::new(project_root, platforms);
    tracing::info!("Pre-warming discovery cache...");
    app_state.warm_cache().await;
    tracing::info!("Discovery cache ready");

    // CORS layer (permissive for dev — frontend on :5173)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Static file serving (frontend/dist/)
    let frontend_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("frontend")
        .join("dist");

    let app = if frontend_dir.exists() {
        // Production: serve frontend + SPA fallback to index.html
        let index_path = frontend_dir.join("index.html");
        let serve_dir = ServeDir::new(&frontend_dir).not_found_service(ServeFile::new(&index_path));

        api::router()
            .with_state(app_state)
            .layer(cors)
            .fallback_service(serve_dir)
    } else {
        // Dev: no frontend built, return helpful JSON on non-API routes
        api::router()
            .with_state(app_state)
            .layer(cors)
            .fallback(fallback_no_frontend)
    };

    // Start server
    let port: u16 = std::env::var("MCS_WEB_PORT")
        .unwrap_or_else(|_| "13242".to_string())
        .parse()
        .unwrap_or(13242);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| {
            tracing::error!("Failed to bind to {addr}: {e}");
            tracing::error!("Hint: is another mcs-web instance already running on port {port}?");
            std::process::exit(1);
        });
    tracing::info!("MCS Web server listening on http://{addr}");

    // Auto-open browser (only in production mode when frontend is built)
    if frontend_dir.exists() {
        let url = format!("http://{addr}");
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            if open::that(&url).is_err() {
                tracing::warn!("Failed to open browser automatically");
            }
        });
    } else {
        tracing::info!("Frontend not built (dev mode) - not opening browser automatically");
        tracing::info!("Please open http://localhost:5173/ manually to access the frontend");
    }

    axum::serve(listener, app).await.unwrap();
}

/// Fallback when frontend is not built yet
async fn fallback_no_frontend() -> impl IntoResponse {
    axum::response::Json(serde_json::json!({
        "message": "MCS Web API is running. Frontend not built yet.",
        "hint": "Run: cd mcs/mcs-web/frontend && npm install && npm run build",
        "api_docs": {
            "platforms": "GET /api/platforms",
            "dashboard": "GET /api/dashboard",
            "skills": "GET /api/platforms/{id}/skills",
            "commands": "GET /api/platforms/{id}/commands"
        }
    }))
}
