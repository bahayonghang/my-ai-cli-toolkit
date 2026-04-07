use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tokio::process::Command;

use crate::api::error::AppError;
use crate::dto::{
    InstallTargetDto, InstallTargetScopeDto, NpxSkillsCliConfigDto, NpxSkillsCliMode,
    NpxSkillsCliResult, NpxSkillsInstallItemRequest, NpxSkillsPackagePreviewDto,
    NpxSkillsPackagePreviewModeDto, NpxSkillsPackagePreviewSkillDto,
};

const NPX_SKILLS_TIMEOUT_SECS: u64 = 120;
const PACKAGE_PREVIEW_CACHE_TTL_MS: u64 = 10 * 60_000;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct PackagePreviewCacheKey {
    package_ref: String,
    install_target_scope: InstallTargetScopeDto,
    project_path: Option<String>,
    cli_mode: NpxSkillsCliMode,
}

#[derive(Clone, Debug)]
struct PackagePreviewCacheEntry {
    cached_at_ms: u64,
    preview: NpxSkillsPackagePreviewDto,
}

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

pub fn build_preview_args(package_ref: &str) -> Result<Vec<String>, AppError> {
    let package_ref = package_ref.trim();
    if package_ref.is_empty() {
        return Err(AppError::BadRequest("Package reference is required".into()));
    }

    Ok(vec![
        "add".to_string(),
        package_ref.to_string(),
        "--list".to_string(),
    ])
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

pub async fn preview_package_skills(
    package_ref: &str,
    config: &NpxSkillsCliConfigDto,
    install_target: &InstallTargetDto,
) -> Result<NpxSkillsPackagePreviewDto, AppError> {
    let cache_key = package_preview_cache_key(package_ref, install_target, config.cli_mode);
    let now_ms = unix_time_ms();
    if let Some(cached) = read_package_preview_cache(&cache_key, now_ms) {
        return Ok(cached);
    }

    let args = build_preview_args(package_ref)?;
    let result = execute_skills_command(&args, config, install_target).await?;
    let output = strip_ansi(&result.output);
    let source_ref = parse_source_ref(&output).unwrap_or_else(|| package_ref.trim().to_string());
    let preview = if result.success {
        let skills = parse_preview_skills(&output);
        if skills.is_empty() {
            NpxSkillsPackagePreviewDto {
                package_ref: package_ref.trim().to_string(),
                source_ref,
                mode: NpxSkillsPackagePreviewModeDto::PackageOnly,
                skills: vec![],
                fallback_reason: Some(
                    "The skills CLI did not return a parsable skill list; installing will target the package as a whole."
                        .into(),
                ),
            }
        } else {
            NpxSkillsPackagePreviewDto {
                package_ref: package_ref.trim().to_string(),
                source_ref,
                mode: NpxSkillsPackagePreviewModeDto::ListedSkills,
                skills,
                fallback_reason: None,
            }
        }
    } else {
        NpxSkillsPackagePreviewDto {
            package_ref: package_ref.trim().to_string(),
            source_ref,
            mode: NpxSkillsPackagePreviewModeDto::PackageOnly,
            skills: vec![],
            fallback_reason: Some(
                "Unable to enumerate skills from this package; you can still install the package directly."
                    .into(),
            ),
        }
    };

    write_package_preview_cache(cache_key, preview.clone(), now_ms);
    Ok(preview)
}

pub fn clear_package_preview_cache() {
    let mut cache = package_preview_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    cache.clear();
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

pub fn format_skills_command_preview(args: &[String]) -> String {
    format!("skills {}", args.join(" "))
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

fn parse_source_ref(output: &str) -> Option<String> {
    output.lines().find_map(|line| {
        line.find("Source:")
            .map(|index| line[index + "Source:".len()..].trim().to_string())
            .filter(|value| !value.is_empty())
    })
}

fn parse_preview_skills(output: &str) -> Vec<NpxSkillsPackagePreviewSkillDto> {
    let mut in_section = false;
    let mut parsed = Vec::<NpxSkillsPackagePreviewSkillDto>::new();
    let mut current_name: Option<String> = None;
    let mut current_description: Option<String> = None;

    let flush_current = |parsed: &mut Vec<NpxSkillsPackagePreviewSkillDto>,
                         current_name: &mut Option<String>,
                         current_description: &mut Option<String>| {
        if let Some(name) = current_name.take() {
            parsed.push(NpxSkillsPackagePreviewSkillDto {
                name,
                description: current_description.take(),
            });
        }
    };

    for raw_line in output.lines() {
        let trimmed = raw_line.trim();
        if !in_section {
            if trimmed.contains("Available Skills") {
                in_section = true;
            }
            continue;
        }

        let payload = trimmed.trim_start_matches('|').trim();
        if payload.is_empty() {
            continue;
        }
        if payload.starts_with('—') || payload.starts_with("Use --skill") {
            break;
        }

        if looks_like_skill_name(payload) {
            flush_current(&mut parsed, &mut current_name, &mut current_description);
            current_name = Some(payload.to_string());
            continue;
        }

        if let Some(description) = current_description.as_mut() {
            description.push(' ');
            description.push_str(payload);
        } else if current_name.is_some() {
            current_description = Some(payload.to_string());
        }
    }

    flush_current(&mut parsed, &mut current_name, &mut current_description);
    parsed
}

fn looks_like_skill_name(value: &str) -> bool {
    !value.is_empty()
        && !value.contains(' ')
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.' | '/' | ':'))
}

fn strip_ansi(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    let mut chars = input.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            if matches!(chars.peek(), Some('[')) {
                chars.next();
                for next in chars.by_ref() {
                    if next.is_ascii_alphabetic() {
                        break;
                    }
                }
            }
            continue;
        }
        result.push(ch);
    }
    result
}

fn package_preview_cache()
-> &'static Mutex<HashMap<PackagePreviewCacheKey, PackagePreviewCacheEntry>> {
    static PACKAGE_PREVIEW_CACHE: OnceLock<
        Mutex<HashMap<PackagePreviewCacheKey, PackagePreviewCacheEntry>>,
    > = OnceLock::new();
    PACKAGE_PREVIEW_CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn package_preview_cache_key(
    package_ref: &str,
    install_target: &InstallTargetDto,
    cli_mode: NpxSkillsCliMode,
) -> PackagePreviewCacheKey {
    PackagePreviewCacheKey {
        package_ref: package_ref.trim().to_string(),
        install_target_scope: install_target.scope,
        project_path: normalize_project_path(install_target.project_path.as_deref()),
        cli_mode,
    }
}

fn read_package_preview_cache(
    key: &PackagePreviewCacheKey,
    now_ms: u64,
) -> Option<NpxSkillsPackagePreviewDto> {
    let mut cache = package_preview_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    let (cached_at_ms, preview) = cache
        .get(key)
        .map(|entry| (entry.cached_at_ms, entry.preview.clone()))?;
    if now_ms.saturating_sub(cached_at_ms) > PACKAGE_PREVIEW_CACHE_TTL_MS {
        cache.remove(key);
        return None;
    }
    Some(preview)
}

fn write_package_preview_cache(
    key: PackagePreviewCacheKey,
    preview: NpxSkillsPackagePreviewDto,
    cached_at_ms: u64,
) {
    let mut cache = package_preview_cache()
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    cache.insert(
        key,
        PackagePreviewCacheEntry {
            cached_at_ms,
            preview,
        },
    );
}

fn normalize_project_path(project_path: Option<&str>) -> Option<String> {
    project_path
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
        .map(|path| path.canonicalize().unwrap_or(path))
        .map(|path| {
            let raw = path.to_string_lossy().replace('\\', "/");
            if cfg!(windows) {
                raw.to_lowercase()
            } else {
                raw
            }
        })
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
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

    #[test]
    fn build_preview_args_uses_list_mode() {
        let args = build_preview_args("vercel-labs/skills").expect("preview args");
        assert_eq!(args, vec!["add", "vercel-labs/skills", "--list"]);
    }

    #[test]
    fn parse_preview_skills_extracts_names_and_descriptions() {
        let parsed = parse_preview_skills(
            r#"
o  Available Skills
|    find-skills
|
|      Helps users discover skills.
|
|    review
|
|      Review code quickly.
|
—  Use --skill <name> to install specific skills
"#,
        );

        assert_eq!(parsed.len(), 2);
        assert_eq!(parsed[0].name, "find-skills");
        assert_eq!(
            parsed[0].description.as_deref(),
            Some("Helps users discover skills.")
        );
        assert_eq!(parsed[1].name, "review");
    }
}
