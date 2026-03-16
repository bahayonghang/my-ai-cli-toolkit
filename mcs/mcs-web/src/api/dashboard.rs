use std::cmp::Ordering;
use std::collections::HashMap;

use axum::Json;
use axum::extract::State;

use mcs_core::config::platform::platform_displays;
use mcs_core::core::discovery::SkillSource;
use mcs_core::model::{InstallStatus, ItemInfo, ItemType};

use crate::dto::{
    ApiResponse, DashboardDto, DashboardPlatformStats, DashboardSkillSpotlight, DashboardSummary,
    DashboardTopCategory, DashboardTopSkill, DashboardUpdateQueueItem,
};
use crate::state::AppState;

struct DashboardPlatformInput {
    id: String,
    name: String,
    icon: String,
    skills: Vec<ItemInfo>,
    commands: Vec<ItemInfo>,
}

/// GET /api/dashboard — cross-platform install statistics
pub async fn stats(State(state): State<AppState>) -> Json<ApiResponse<DashboardDto>> {
    let platforms = state.platforms().await;
    let skill_sources = state.skill_catalog().await;

    let mut dashboard_platforms = Vec::new();
    for display in platform_displays() {
        if !platforms.contains_key(display.id) {
            continue;
        }

        dashboard_platforms.push(DashboardPlatformInput {
            id: display.id.to_string(),
            name: display.name.to_string(),
            icon: display.icon.to_string(),
            skills: state.skills(display.id).await,
            commands: state.commands(display.id).await,
        });
    }

    Json(ApiResponse::ok(build_dashboard(
        dashboard_platforms,
        skill_sources,
    )))
}

fn build_dashboard(
    platforms: Vec<DashboardPlatformInput>,
    skill_sources: Vec<SkillSource>,
) -> DashboardDto {
    let mut platform_stats = Vec::with_capacity(platforms.len());
    let mut skill_status_by_platform: HashMap<String, HashMap<String, InstallStatus>> =
        HashMap::with_capacity(platforms.len());

    for platform in platforms {
        let skill_status = platform
            .skills
            .iter()
            .filter(|item| item.item_type == ItemType::Skill)
            .map(|item| (item.name.clone(), item.status))
            .collect::<HashMap<_, _>>();

        skill_status_by_platform.insert(platform.id.clone(), skill_status);
        platform_stats.push(to_platform_stats(&platform));
    }

    platform_stats.sort_by(compare_platform_stats);

    DashboardDto {
        summary: build_summary(&platform_stats),
        skill_spotlight: DashboardSkillSpotlight {
            top_skills: build_top_skills(&skill_sources, &skill_status_by_platform),
            top_categories: build_top_categories(&skill_sources, &skill_status_by_platform),
            update_queue: build_update_queue(&platform_stats),
        },
        platforms: platform_stats,
    }
}

fn to_platform_stats(platform: &DashboardPlatformInput) -> DashboardPlatformStats {
    let installed_skills = platform
        .skills
        .iter()
        .filter(|item| item.is_installed())
        .count();
    let outdated_skills = platform
        .skills
        .iter()
        .filter(|item| item.status == InstallStatus::Outdated)
        .count();
    let installed_commands = platform
        .commands
        .iter()
        .filter(|item| item.is_installed())
        .count();

    DashboardPlatformStats {
        id: platform.id.clone(),
        name: platform.name.clone(),
        icon: platform.icon.clone(),
        total_skills: platform.skills.len(),
        installed_skills,
        outdated_skills,
        total_commands: platform.commands.len(),
        installed_commands,
    }
}

fn build_summary(platforms: &[DashboardPlatformStats]) -> DashboardSummary {
    let total_skills = platforms
        .iter()
        .map(|platform| platform.total_skills)
        .sum::<usize>();
    let installed_skills = platforms
        .iter()
        .map(|platform| platform.installed_skills)
        .sum::<usize>();
    let total_commands = platforms
        .iter()
        .map(|platform| platform.total_commands)
        .sum::<usize>();
    let installed_commands = platforms
        .iter()
        .map(|platform| platform.installed_commands)
        .sum::<usize>();
    let outdated_skills = platforms
        .iter()
        .map(|platform| platform.outdated_skills)
        .sum::<usize>();
    let active_platforms = platforms
        .iter()
        .filter(|platform| is_active_platform(platform))
        .count();

    DashboardSummary {
        active_platforms,
        total_platforms: platforms.len(),
        installed_skills,
        total_skills,
        installed_commands,
        total_commands,
        outdated_skills,
        skill_coverage: percentage(installed_skills, total_skills),
        command_coverage: percentage(installed_commands, total_commands),
    }
}

fn build_top_skills(
    skill_sources: &[SkillSource],
    skill_status_by_platform: &HashMap<String, HashMap<String, InstallStatus>>,
) -> Vec<DashboardTopSkill> {
    let mut top_skills = skill_sources
        .iter()
        .filter_map(|source| {
            let installed_on = skill_status_by_platform
                .values()
                .filter(|skills| {
                    skills
                        .get(&source.name)
                        .is_some_and(|status| is_installed(*status))
                })
                .count();
            if installed_on == 0 {
                return None;
            }

            let outdated_on = skill_status_by_platform
                .values()
                .filter(|skills| skills.get(&source.name) == Some(&InstallStatus::Outdated))
                .count();

            Some(DashboardTopSkill {
                name: source.name.clone(),
                installed_on,
                outdated_on,
                category: normalized_category(source.category.as_deref()),
            })
        })
        .collect::<Vec<_>>();

    top_skills.sort_by(|a, b| {
        b.installed_on
            .cmp(&a.installed_on)
            .then_with(|| b.outdated_on.cmp(&a.outdated_on))
            .then_with(|| a.name.cmp(&b.name))
    });
    top_skills.truncate(6);
    top_skills
}

fn build_top_categories(
    skill_sources: &[SkillSource],
    skill_status_by_platform: &HashMap<String, HashMap<String, InstallStatus>>,
) -> Vec<DashboardTopCategory> {
    let mut categories: HashMap<String, DashboardTopCategory> = HashMap::new();

    for source in skill_sources {
        let Some(category) = normalized_category(source.category.as_deref()) else {
            continue;
        };

        let installed = skill_status_by_platform.values().any(|skills| {
            skills
                .get(&source.name)
                .is_some_and(|status| is_installed(*status))
        });

        let entry = categories
            .entry(category.clone())
            .or_insert_with(|| DashboardTopCategory {
                name: category.clone(),
                installed: 0,
                total: 0,
            });
        entry.total += 1;
        if installed {
            entry.installed += 1;
        }
    }

    let mut top_categories = categories
        .into_values()
        .filter(|category| category.installed > 0)
        .collect::<Vec<_>>();

    top_categories.sort_by(|a, b| {
        b.installed
            .cmp(&a.installed)
            .then_with(|| b.total.cmp(&a.total))
            .then_with(|| a.name.cmp(&b.name))
    });
    top_categories.truncate(4);
    top_categories
}

fn build_update_queue(platforms: &[DashboardPlatformStats]) -> Vec<DashboardUpdateQueueItem> {
    let mut update_queue = platforms
        .iter()
        .filter(|platform| platform.outdated_skills > 0)
        .map(|platform| DashboardUpdateQueueItem {
            platform_id: platform.id.clone(),
            platform_name: platform.name.clone(),
            platform_icon: platform.icon.clone(),
            outdated_skills: platform.outdated_skills,
            installed_skills: platform.installed_skills,
            total_skills: platform.total_skills,
        })
        .collect::<Vec<_>>();

    update_queue.sort_by(|a, b| {
        b.outdated_skills
            .cmp(&a.outdated_skills)
            .then_with(|| b.installed_skills.cmp(&a.installed_skills))
            .then_with(|| a.platform_name.cmp(&b.platform_name))
    });
    update_queue.truncate(5);
    update_queue
}

fn compare_platform_stats(a: &DashboardPlatformStats, b: &DashboardPlatformStats) -> Ordering {
    is_active_platform(b)
        .cmp(&is_active_platform(a))
        .then_with(|| b.outdated_skills.cmp(&a.outdated_skills))
        .then_with(|| b.installed_skills.cmp(&a.installed_skills))
        .then_with(|| a.name.cmp(&b.name))
}

fn is_active_platform(platform: &DashboardPlatformStats) -> bool {
    platform.installed_skills > 0 || platform.installed_commands > 0
}

fn is_installed(status: InstallStatus) -> bool {
    matches!(status, InstallStatus::Installed | InstallStatus::Outdated)
}

fn percentage(part: usize, total: usize) -> usize {
    if total == 0 {
        return 0;
    }
    ((part as f64 / total as f64) * 100.0).round() as usize
}

fn normalized_category(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use mcs_core::core::discovery::SkillSource;

    use super::{DashboardPlatformInput, build_dashboard};
    use mcs_core::model::{InstallStatus, ItemInfo, ItemType};

    fn source(name: &str, category: Option<&str>) -> SkillSource {
        SkillSource {
            name: name.to_string(),
            source_path: PathBuf::from(format!("content/skills/{name}")),
            src_mtime: None,
            src_sig: None,
            description: Some(format!("desc-{name}")),
            category: category.map(str::to_string),
            tags: vec![],
            is_default: false,
        }
    }

    fn skill(name: &str, status: InstallStatus, category: Option<&str>) -> ItemInfo {
        item(name, ItemType::Skill, status, category)
    }

    fn command(name: &str, status: InstallStatus) -> ItemInfo {
        item(name, ItemType::Command, status, None)
    }

    fn item(
        name: &str,
        item_type: ItemType,
        status: InstallStatus,
        category: Option<&str>,
    ) -> ItemInfo {
        ItemInfo {
            name: name.to_string(),
            item_type,
            description: Some(format!("desc-{name}")),
            status,
            source_path: PathBuf::from(format!("content/{name}")),
            target_path: PathBuf::from(format!(".tmp/{name}")),
            source_mtime: None,
            target_mtime: None,
            source_mtime_ms: None,
            target_mtime_ms: None,
            category: category.map(str::to_string),
            tags: vec![],
            is_default: false,
        }
    }

    fn platform(
        id: &str,
        name: &str,
        icon: &str,
        skills: Vec<ItemInfo>,
        commands: Vec<ItemInfo>,
    ) -> DashboardPlatformInput {
        DashboardPlatformInput {
            id: id.to_string(),
            name: name.to_string(),
            icon: icon.to_string(),
            skills,
            commands,
        }
    }

    #[test]
    fn build_dashboard_aggregates_summary_and_spotlight() {
        let skill_sources = vec![
            source("alpha", Some("Core")),
            source("beta", Some("Core")),
            source("gamma", Some("Automation")),
            source("delta", Some("Automation")),
            source("epsilon", Some("Reference")),
        ];

        let dashboard = build_dashboard(
            vec![
                platform(
                    "claude",
                    "Claude",
                    "C",
                    vec![
                        skill("alpha", InstallStatus::Installed, Some("Core")),
                        skill("beta", InstallStatus::Outdated, Some("Core")),
                        skill("gamma", InstallStatus::NotInstalled, Some("Automation")),
                        skill("delta", InstallStatus::Installed, Some("Automation")),
                        skill("epsilon", InstallStatus::NotInstalled, Some("Reference")),
                    ],
                    vec![
                        command("cmd-a", InstallStatus::Installed),
                        command("cmd-b", InstallStatus::NotInstalled),
                    ],
                ),
                platform(
                    "codex",
                    "Codex",
                    "X",
                    vec![
                        skill("alpha", InstallStatus::Installed, Some("Core")),
                        skill("beta", InstallStatus::NotInstalled, Some("Core")),
                        skill("gamma", InstallStatus::Installed, Some("Automation")),
                        skill("delta", InstallStatus::NotInstalled, Some("Automation")),
                        skill("epsilon", InstallStatus::NotInstalled, Some("Reference")),
                    ],
                    vec![command("cmd-a", InstallStatus::Installed)],
                ),
                platform(
                    "gemini",
                    "Gemini",
                    "G",
                    vec![
                        skill("alpha", InstallStatus::NotInstalled, Some("Core")),
                        skill("beta", InstallStatus::Outdated, Some("Core")),
                        skill("gamma", InstallStatus::NotInstalled, Some("Automation")),
                        skill("delta", InstallStatus::NotInstalled, Some("Automation")),
                        skill("epsilon", InstallStatus::NotInstalled, Some("Reference")),
                    ],
                    vec![command("cmd-a", InstallStatus::NotInstalled)],
                ),
            ],
            skill_sources,
        );

        assert_eq!(dashboard.summary.active_platforms, 3);
        assert_eq!(dashboard.summary.total_platforms, 3);
        assert_eq!(dashboard.summary.installed_skills, 6);
        assert_eq!(dashboard.summary.total_skills, 15);
        assert_eq!(dashboard.summary.outdated_skills, 2);
        assert_eq!(dashboard.summary.skill_coverage, 40);
        assert_eq!(dashboard.summary.installed_commands, 2);
        assert_eq!(dashboard.summary.total_commands, 4);
        assert_eq!(dashboard.summary.command_coverage, 50);

        assert_eq!(dashboard.skill_spotlight.top_skills.len(), 4);
        assert_eq!(dashboard.skill_spotlight.top_skills[0].name, "beta");
        assert_eq!(dashboard.skill_spotlight.top_skills[0].installed_on, 2);
        assert_eq!(dashboard.skill_spotlight.top_skills[0].outdated_on, 2);
        assert_eq!(dashboard.skill_spotlight.top_skills[1].name, "alpha");

        assert_eq!(dashboard.skill_spotlight.top_categories.len(), 2);
        assert_eq!(
            dashboard.skill_spotlight.top_categories[0].name,
            "Automation"
        );
        assert_eq!(dashboard.skill_spotlight.top_categories[0].installed, 2);
        assert_eq!(dashboard.skill_spotlight.top_categories[0].total, 2);
        assert_eq!(dashboard.skill_spotlight.top_categories[1].name, "Core");

        assert_eq!(dashboard.skill_spotlight.update_queue.len(), 2);
        assert_eq!(
            dashboard.skill_spotlight.update_queue[0].platform_name,
            "Claude"
        );
        assert_eq!(
            dashboard.skill_spotlight.update_queue[1].platform_name,
            "Gemini"
        );

        assert_eq!(dashboard.platforms[0].name, "Claude");
        assert_eq!(dashboard.platforms[1].name, "Gemini");
        assert_eq!(dashboard.platforms[2].name, "Codex");
    }

    #[test]
    fn build_dashboard_handles_empty_and_zero_command_totals() {
        let dashboard = build_dashboard(
            vec![platform(
                "empty",
                "Empty",
                "E",
                vec![
                    skill("alpha", InstallStatus::NotInstalled, Some("Core")),
                    skill("beta", InstallStatus::NotInstalled, Some("Core")),
                ],
                vec![],
            )],
            vec![source("alpha", Some("Core")), source("beta", Some("Core"))],
        );

        assert_eq!(dashboard.summary.active_platforms, 0);
        assert_eq!(dashboard.summary.installed_skills, 0);
        assert_eq!(dashboard.summary.total_skills, 2);
        assert_eq!(dashboard.summary.skill_coverage, 0);
        assert_eq!(dashboard.summary.command_coverage, 0);
        assert!(dashboard.skill_spotlight.top_skills.is_empty());
        assert!(dashboard.skill_spotlight.top_categories.is_empty());
        assert!(dashboard.skill_spotlight.update_queue.is_empty());
        assert_eq!(dashboard.platforms[0].name, "Empty");
    }
}
