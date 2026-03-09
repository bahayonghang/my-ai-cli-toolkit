mod api;
mod dto;
mod state;

use std::net::SocketAddr;
use std::time::Duration;

use axum::extract::MatchedPath;
use axum::response::IntoResponse;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;

use mcs_core::config::paths::detect_project_root;
use mcs_core::config::platform::load_platforms;
use mcs_core::core::skill_migration::run_one_time_skill_migration;
use mcs_core::logging::{AppLogKind, init_logging};

use crate::state::AppState;

#[tokio::main]
async fn main() {
    // Initialize tracing
    init_logging(AppLogKind::Web).unwrap_or_else(|err| {
        eprintln!("Failed to initialize logging: {err}");
        std::process::exit(1);
    });

    // Detect project root
    let project_root = detect_project_root().unwrap_or_else(|| {
        tracing::error!("Could not detect project root (content/skills/ not found)");
        std::process::exit(1);
    });
    tracing::info!("Project root: {}", project_root.display());

    // Load platform configurations
    let platforms = load_platforms(&project_root);
    tracing::info!("Loaded {} platforms", platforms.len());
    report_legacy_skill_dirs(&platforms);
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

    // Build shared state
    let app_state = AppState::new(project_root, platforms);

    // CORS layer (permissive for dev UI on :5173)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    let trace = TraceLayer::new_for_http()
        .make_span_with(|request: &axum::http::Request<_>| {
            let matched_path = request
                .extensions()
                .get::<MatchedPath>()
                .map(MatchedPath::as_str);

            tracing::info_span!(
                "http_request",
                method = %request.method(),
                path = matched_path.unwrap_or(request.uri().path()),
            )
        })
        .on_response(
            |response: &axum::http::Response<_>, latency: Duration, _span: &tracing::Span| {
                tracing::info!(
                    status = response.status().as_u16(),
                    latency_ms = latency.as_millis()
                );
            },
        );

    // Static file serving (ui/dist/)
    let ui_dist_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("ui")
        .join("dist");

    let app = if ui_dist_dir.exists() {
        // Production: serve UI + SPA fallback to index.html
        let index_path = ui_dist_dir.join("index.html");
        let serve_dir = ServeDir::new(&ui_dist_dir).not_found_service(ServeFile::new(&index_path));

        api::router()
            .with_state(app_state.clone())
            .layer(cors)
            .layer(trace)
            .fallback_service(serve_dir)
    } else {
        // Dev: no UI built, return helpful JSON on non-API routes
        api::router()
            .with_state(app_state.clone())
            .layer(cors)
            .layer(trace)
            .fallback(fallback_no_ui)
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

    tracing::info!("Pre-warming discovery cache in background...");
    let warm_state = app_state.clone();
    tokio::spawn(async move {
        warm_state.warm_cache().await;
        tracing::info!("Discovery cache ready");
    });

    // Auto-open browser (only in production mode when UI is built)
    if ui_dist_dir.exists() {
        let url = format!("http://{addr}");
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            if open::that(&url).is_err() {
                tracing::warn!("Failed to open browser automatically");
            }
        });
    } else {
        tracing::info!("UI not built (dev mode) - not opening browser automatically");
        tracing::info!("Please open http://localhost:5173/ manually to access the UI");
    }

    axum::serve(listener, app).await.unwrap();
}

fn report_legacy_skill_dirs(
    platforms: &std::collections::HashMap<String, mcs_core::config::platform::PlatformConfig>,
) {
    let legacy_dirs = mcs_core::config::platform::detect_legacy_skill_dirs(platforms);
    if legacy_dirs.is_empty() {
        return;
    }

    tracing::warn!(
        "Detected {} legacy skill directory/directories. Manual migration is required.",
        legacy_dirs.len()
    );
    for item in legacy_dirs {
        tracing::warn!(
            "[{}] legacy={} -> shared={}",
            item.platform_id,
            item.legacy_path.display(),
            item.shared_path.display()
        );
    }
    tracing::warn!(
        "Copy skill folders containing SKILL.md to the shared directory and then re-open MCS."
    );
}

/// Fallback when UI is not built yet
async fn fallback_no_ui() -> impl IntoResponse {
    axum::response::Json(serde_json::json!({
        "message": "MCS Web API is running. UI not built yet.",
        "hint": "Run: cd mcs/mcs-web/ui && npm install && npm run build",
        "api_docs": {
            "platforms": "GET /api/platforms",
            "dashboard": "GET /api/dashboard",
            "skills": "GET /api/platforms/{id}/skills",
            "commands": "GET /api/platforms/{id}/commands"
        }
    }))
}
