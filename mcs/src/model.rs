use std::path::PathBuf;
use std::time::SystemTime;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ItemType {
    Skill,
    Command,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstallStatus {
    Installed,
    NotInstalled,
    Outdated,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct ItemInfo {
    pub name: String,
    pub item_type: ItemType,
    pub description: Option<String>,
    pub status: InstallStatus,
    pub source_path: PathBuf,
    pub target_path: PathBuf,
    pub source_mtime: Option<SystemTime>,
    pub target_mtime: Option<SystemTime>,
    pub category: Option<String>,
    pub tags: Vec<String>,
}

impl ItemInfo {
    pub fn is_installed(&self) -> bool {
        matches!(
            self.status,
            InstallStatus::Installed | InstallStatus::Outdated
        )
    }

    pub fn needs_update(&self) -> bool {
        self.status == InstallStatus::Outdated
    }
}

#[derive(Debug)]
#[allow(dead_code)]
pub struct InstallResult {
    pub success: bool,
    pub item_name: String,
    pub message: String,
    pub error: Option<String>,
}
