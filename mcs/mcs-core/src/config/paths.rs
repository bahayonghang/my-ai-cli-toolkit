use std::env;
use std::path::{Path, PathBuf};

/// Auto-detect project root by searching for `content/skills/` directory.
/// Priority: --root arg (handled by caller) > binary location > CWD
pub fn detect_project_root() -> Option<PathBuf> {
    // Try from binary location
    if let Ok(exe) = env::current_exe()
        && let Some(root) = walk_up_for_content(&exe)
    {
        return Some(root);
    }
    // Try from CWD
    if let Ok(cwd) = env::current_dir()
        && let Some(root) = walk_up_for_content(&cwd)
    {
        return Some(root);
    }
    None
}

fn walk_up_for_content(start: &Path) -> Option<PathBuf> {
    let mut dir = if start.is_file() {
        start.parent()?.to_path_buf()
    } else {
        start.to_path_buf()
    };
    for _ in 0..10 {
        if dir.join("content").join("skills").is_dir() {
            return Some(dir);
        }
        dir = dir.parent()?.to_path_buf();
    }
    None
}

pub fn skills_src_dir(root: &Path) -> PathBuf {
    root.join("content").join("skills")
}

pub fn commands_src_dir(root: &Path) -> PathBuf {
    root.join("content").join("commands")
}

pub fn prompts_src_dir(root: &Path) -> PathBuf {
    root.join("content").join("prompts")
}

pub fn home_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("~"))
}
