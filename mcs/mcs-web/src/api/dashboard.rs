use axum::Json;
use axum::extract::State;

use mcs_core::config::platform::platform_displays;
use mcs_core::model::InstallStatus;

use crate::dto::{ApiResponse, DashboardDto, DashboardPlatformStats};
use crate::state::AppState;

/// GET /api/dashboard — cross-platform install statistics
pub async fn stats(State(state): State<AppState>) -> Json<ApiResponse<DashboardDto>> {
    let platforms = state.platforms().await;
    let displays = platform_displays();

    let mut stats = Vec::new();
    for display in displays {
        let Some(_platform) = platforms.get(display.id) else {
            continue;
        };

        let skills = state.skills(display.id).await;
        let commands = state.commands(display.id).await;

        let installed_skills = skills.iter().filter(|s| s.is_installed()).count();
        let outdated_skills = skills
            .iter()
            .filter(|s| s.status == InstallStatus::Outdated)
            .count();
        let installed_commands = commands.iter().filter(|c| c.is_installed()).count();

        stats.push(DashboardPlatformStats {
            id: display.id.to_string(),
            name: display.name.to_string(),
            icon: display.icon.to_string(),
            total_skills: skills.len(),
            installed_skills,
            outdated_skills,
            total_commands: commands.len(),
            installed_commands,
        });
    }

    Json(ApiResponse::ok(DashboardDto { platforms: stats }))
}
