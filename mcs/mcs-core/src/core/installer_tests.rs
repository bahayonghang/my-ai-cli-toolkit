use std::fs;
use std::path::PathBuf;

use crate::config::platform::PlatformConfig;
use crate::core::installer::{install_skill, uninstall_skill, validate_item_name};
use crate::core::skill_store::{
    TEST_SERIAL_MUTEX, canonical_skill_path, set_force_symlink_failure, set_test_mcs_root,
};
use crate::model::LinkMode;

struct TestEnv {
    root: PathBuf,
}

impl TestEnv {
    fn new(name: &str) -> Self {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let root = std::env::temp_dir().join(format!("mcs_installer_{name}_{nanos}"));
        fs::create_dir_all(&root).expect("create root");
        set_test_mcs_root(Some(root.join("home")));
        set_force_symlink_failure(false);
        Self { root }
    }

    fn project_root(&self) -> PathBuf {
        self.root.join("project")
    }

    fn platform(&self) -> PlatformConfig {
        let base = self.root.join("platform");
        PlatformConfig {
            name: "claude".into(),
            base_dir: base.to_string_lossy().to_string(),
            skills_subdir: "skills".into(),
            commands_subdir: "commands".into(),
            prompt_file: None,
            commands_source: "claude".into(),
            fallback_commands_source: None,
        }
    }

    fn add_source_skill(&self, name: &str, content: &str) {
        let skill_dir = self
            .project_root()
            .join("content")
            .join("skills")
            .join(name);
        fs::create_dir_all(&skill_dir).expect("create source skill");
        fs::write(skill_dir.join("SKILL.md"), content).expect("write source skill");
    }
}

impl Drop for TestEnv {
    fn drop(&mut self) {
        set_force_symlink_failure(false);
        set_test_mcs_root(None);
        let _ = fs::remove_dir_all(&self.root);
    }
}

#[test]
fn validate_item_name_rejects_parent_dir() {
    assert!(validate_item_name("../escape").is_err());
}

#[test]
fn validate_item_name_accepts_nested_relative_path() {
    assert!(validate_item_name("nested/command/name").is_ok());
}

#[test]
fn install_skill_uses_symlink_by_default() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("symlink");
    let platform = env.platform();
    env.add_source_skill("demo-skill", "demo");

    let result = install_skill(&env.project_root(), &platform, "demo-skill", LinkMode::Auto);

    assert!(result.success, "{result:?}");
    assert!(result.message.contains("(symlink)"));
    assert!(
        canonical_skill_path("demo-skill")
            .join("SKILL.md")
            .is_file()
    );
    assert!(platform.skills_path().join("demo-skill").exists());
}

#[test]
fn install_skill_falls_back_to_copy_when_symlink_unavailable() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("fallback");
    let platform = env.platform();
    env.add_source_skill("copy-skill", "copy");
    set_force_symlink_failure(true);

    let result = install_skill(&env.project_root(), &platform, "copy-skill", LinkMode::Auto);
    let installed = platform.skills_path().join("copy-skill").join("SKILL.md");

    assert!(result.success, "{result:?}");
    assert!(result.message.contains("copy fallback"));
    assert!(installed.is_file());
}

#[test]
fn uninstall_skill_removes_target_but_keeps_canonical_copy() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("uninstall");
    let platform = env.platform();
    env.add_source_skill("keep-canonical", "keep");
    let _ = install_skill(
        &env.project_root(),
        &platform,
        "keep-canonical",
        LinkMode::Auto,
    );

    let result = uninstall_skill(&platform, "keep-canonical");

    assert!(result.success, "{result:?}");
    assert!(
        canonical_skill_path("keep-canonical")
            .join("SKILL.md")
            .is_file()
    );
    assert!(!platform.skills_path().join("keep-canonical").exists());
}
