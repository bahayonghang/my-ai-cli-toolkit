use std::path::Path;

use crate::config::platform::PlatformConfig;
use crate::model::InstallResult;

pub fn supports_prompt(platform: &PlatformConfig) -> bool {
    crate::core::guidance::supports_guidance(platform)
}

pub fn prompt_diff(project_root: &Path, platform: &PlatformConfig) -> (bool, String) {
    crate::core::guidance::guidance_diff(project_root, platform)
}

pub fn prompt_update(project_root: &Path, platform: &PlatformConfig) -> InstallResult {
    crate::core::guidance::guidance_update(project_root, platform)
}
