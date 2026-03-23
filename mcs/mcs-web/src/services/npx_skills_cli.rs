use std::time::Duration;

use tokio::process::Command;

use crate::api::error::AppError;
use crate::dto::{
    InstallTargetDto, InstallTargetScopeDto, NpxSkillsCliConfigDto, NpxSkillsCliMode,
    NpxSkillsCliResult, NpxSkillsInstallItemRequest,
};

const NPX_SKILLS_TIMEOUT_SECS: u64 = 120;

pub fn build_install_args(
    item: &NpxSkillsInstallItemRequest,
    config: &NpxSkillsCliConfigDto,
    is_global: bool,
) -> Result<Vec<String>, AppError> {
    let package_ref = item.package_ref.trim();
    if package_ref.is_empty() {
        return Err(AppError::BadRequest("Package reference is required".into()));
    }

    let mut args = vec!["add".to_string(), package_ref.to_string()];
    for skill_flag in item.skill_flags.iter().map(|flag| flag.trim()) {
        if skill_flag.is_empty() {
            continue;
        }
        args.push("--skill".to_string());
        args.push(skill_flag.to_string());
    }

    for agent in config.agents.iter().map(|agent| agent.trim()) {
        if agent.is_empty() {
            continue;
        }
        args.push("--agent".to_string());
        args.push(agent.to_string());
    }

    if is_global {
        args.push("-g".to_string());
    }

    if !args.iter().any(|arg| arg == "-y" || arg == "--yes") {
        args.push("-y".to_string());
    }

    Ok(args)
}

pub fn build_remove_args(name: &str, is_global: bool) -> Result<Vec<String>, AppError> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err(AppError::BadRequest("Skill name is required".into()));
    }

    let mut args = vec!["remove".to_string(), trimmed.to_string()];
    if is_global {
        args.push("-g".to_string());
    }
    if !args.iter().any(|arg| arg == "-y" || arg == "--yes") {
        args.push("-y".to_string());
    }

    Ok(args)
}

pub fn build_check_args(is_global: bool) -> Vec<String> {
    let mut args = vec!["check".to_string()];
    if is_global {
        args.push("-g".to_string());
    }
    args
}

pub fn build_list_args(is_global: bool) -> Vec<String> {
    let mut args = vec!["list".to_string(), "--json".to_string()];
    if is_global {
        args.push("-g".to_string());
    }
    args
}

pub fn build_update_args(is_global: bool) -> Vec<String> {
    let mut args = vec!["update".to_string()];
    if is_global {
        args.push("-g".to_string());
    }
    args
}

pub async fn execute_skills_command(
    args: &[String],
    config: &NpxSkillsCliConfigDto,
    install_target: &InstallTargetDto,
) -> Result<NpxSkillsCliResult, AppError> {
    let (program, prefix_args) = resolve_cli_program(config.cli_mode);

    let mut command = Command::new(&program);
    command.args(&prefix_args).args(args);
    command.kill_on_drop(true);

    if let (InstallTargetScopeDto::Project, Some(path)) =
        (&install_target.scope, &install_target.project_path)
    {
        command.current_dir(path);
    }

    let output = tokio::time::timeout(
        Duration::from_secs(NPX_SKILLS_TIMEOUT_SECS),
        command.output(),
    )
    .await
    .map_err(|_| {
        AppError::Internal(format!(
            "npx skills command timed out after {NPX_SKILLS_TIMEOUT_SECS}s"
        ))
    })?
    .map_err(|error| AppError::Internal(format!("Failed to execute {program}: {error}")))?;

    let success = output.status.success();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let output = if stderr.is_empty() {
        stdout
    } else if stdout.is_empty() {
        stderr
    } else {
        format!("{stdout}\n{stderr}")
    };

    Ok(NpxSkillsCliResult { success, output })
}

fn resolve_cli_program(cli_mode: NpxSkillsCliMode) -> (String, Vec<String>) {
    match cli_mode {
        NpxSkillsCliMode::Npx => {
            let npx = if cfg!(windows) { "npx.cmd" } else { "npx" };
            (
                npx.to_string(),
                vec!["-y".to_string(), "skills".to_string()],
            )
        }
        NpxSkillsCliMode::Auto => {
            let local_cmd = if cfg!(windows) {
                "skills.cmd"
            } else {
                "skills"
            };
            if which_exists(local_cmd) {
                (local_cmd.to_string(), vec![])
            } else {
                let npx = if cfg!(windows) { "npx.cmd" } else { "npx" };
                (
                    npx.to_string(),
                    vec!["-y".to_string(), "skills".to_string()],
                )
            }
        }
    }
}

fn which_exists(cmd: &str) -> bool {
    let checker = if cfg!(windows) { "where" } else { "which" };
    std::process::Command::new(checker)
        .arg(cmd)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dto::NpxSkillsCliMode;

    #[test]
    fn build_install_args_supports_flags_agents_and_global() {
        let args = build_install_args(
            &NpxSkillsInstallItemRequest {
                package_ref: "vercel-labs/agent-skills".into(),
                skill_flags: vec!["find-skills".into(), "review".into()],
                catalog_entry_id: Some("catalog-find-skills".into()),
            },
            &NpxSkillsCliConfigDto {
                agents: vec!["codex".into(), "claude-code".into()],
                cli_mode: NpxSkillsCliMode::Auto,
            },
            true,
        )
        .expect("install args");

        assert_eq!(
            args,
            vec![
                "add",
                "vercel-labs/agent-skills",
                "--skill",
                "find-skills",
                "--skill",
                "review",
                "--agent",
                "codex",
                "--agent",
                "claude-code",
                "-g",
                "-y",
            ]
        );
    }

    #[test]
    fn build_remove_args_supports_global() {
        let args = build_remove_args("find-skills", true).expect("remove args");
        assert_eq!(args, vec!["remove", "find-skills", "-g", "-y"]);
    }

    #[test]
    fn build_check_and_update_args_match_cli_shape() {
        assert_eq!(build_check_args(false), vec!["check"]);
        assert_eq!(build_update_args(true), vec!["update", "-g"]);
    }

    #[test]
    fn build_install_args_rejects_empty_package_ref() {
        let result = build_install_args(
            &NpxSkillsInstallItemRequest {
                package_ref: "   ".into(),
                skill_flags: vec![],
                catalog_entry_id: None,
            },
            &NpxSkillsCliConfigDto::default(),
            true,
        );
        assert!(result.is_err());
    }
}
