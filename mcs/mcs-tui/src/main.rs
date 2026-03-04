mod tui;

fn main() {
    if std::env::args().any(|a| a == "--version" || a == "-V") {
        println!("mcs {}", env!("CARGO_PKG_VERSION"));
        return;
    }

    let project_root = mcs_core::config::paths::detect_project_root().unwrap_or_else(|| {
        eprintln!("Error: Could not detect project root (no skills/ directory found).");
        eprintln!("Run this binary from within the my-claude-code-settings project.");
        std::process::exit(1);
    });
    let platforms = mcs_core::config::platform::load_platforms(&project_root);
    report_skill_migration(&project_root, &platforms);
    report_legacy_skill_dirs(&platforms);

    if let Err(e) = tui::run(project_root) {
        eprintln!("Error: {e}");
        std::process::exit(1);
    }
}

fn report_skill_migration(
    project_root: &std::path::Path,
    platforms: &std::collections::HashMap<String, mcs_core::config::platform::PlatformConfig>,
) {
    let summary =
        mcs_core::core::skill_migration::run_one_time_skill_migration(project_root, platforms);
    match summary {
        Ok(data) if data.skipped => {
            let reason = data.reason.unwrap_or_else(|| "already done".into());
            eprintln!("MCS: skill migration skipped ({reason})");
        }
        Ok(data) => {
            eprintln!(
                "MCS: skill migration done (migrated={}, relinked={}, copy_fallbacks={}, errors={})",
                data.migrated_skills,
                data.relinked_targets,
                data.copy_fallbacks,
                data.errors.len()
            );
        }
        Err(err) => eprintln!("MCS: skill migration failed: {err}"),
    }
}

fn report_legacy_skill_dirs(
    platforms: &std::collections::HashMap<String, mcs_core::config::platform::PlatformConfig>,
) {
    let legacy_dirs = mcs_core::config::platform::detect_legacy_skill_dirs(platforms);
    if legacy_dirs.is_empty() {
        return;
    }

    eprintln!(
        "MCS: detected {} legacy skill directory/directories. Manual migration is recommended:",
        legacy_dirs.len()
    );
    for item in legacy_dirs {
        eprintln!(
            "  - [{}] legacy: {}  -> shared: {}",
            item.platform_id,
            item.legacy_path.display(),
            item.shared_path.display()
        );
    }
    eprintln!(
        "  Tip: copy skill folders containing SKILL.md into the shared directory, then verify in MCS."
    );
}
