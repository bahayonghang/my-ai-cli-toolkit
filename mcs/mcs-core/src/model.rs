use std::path::PathBuf;
use std::time::SystemTime;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ItemType {
    Skill,
    Command,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InstallStatus {
    Installed,
    NotInstalled,
    Outdated,
}

#[derive(Debug, Clone, Serialize)]
pub struct ItemInfo {
    pub name: String,
    pub item_type: ItemType,
    pub description: Option<String>,
    pub status: InstallStatus,
    pub source_path: PathBuf,
    pub target_path: PathBuf,
    #[serde(skip)]
    pub source_mtime: Option<SystemTime>,
    #[serde(skip)]
    pub target_mtime: Option<SystemTime>,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub is_default: bool,
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

#[derive(Debug, Serialize)]
pub struct InstallResult {
    pub success: bool,
    pub item_name: String,
    pub message: String,
    pub error: Option<String>,
}
