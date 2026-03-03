use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use crate::config::platform::PlatformConfig;
use crate::core::skill_migration::run_one_time_skill_migration;
use crate::core::skill_store::{
    TEST_SERIAL_MUTEX, canonical_skill_path, set_force_symlink_failure, set_test_mcs_root,
};

struct TestEnv {
    root: PathBuf,
}

impl TestEnv {
    fn new(name: &str) -> Self {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let root = std::env::temp_dir().join(format!("mcs_migration_{name}_{nanos}"));
        fs::create_dir_all(&root).expect("create temp root");
        set_test_mcs_root(Some(root.join("home")));
        set_force_symlink_failure(false);
        Self { root }
    }

    fn project_root(&self) -> PathBuf {
        self.root.join("project")
    }

    fn platform(&self, id: &str) -> PlatformConfig {
        let base = self.root.join(format!("platform_{id}"));
        PlatformConfig {
            name: id.to_string(),
            base_dir: base.to_string_lossy().to_string(),
            skills_subdir: "skills".into(),
            commands_subdir: "commands".into(),
            prompt_file: None,
            commands_source: id.to_string(),
            fallback_commands_source: None,
        }
    }

    fn install_skill_copy(&self, platform: &PlatformConfig, name: &str, skill_body: &str) {
        let path = platform.skills_path().join(name);
        fs::create_dir_all(&path).expect("create skill dir");
        fs::write(path.join("SKILL.md"), skill_body).expect("write SKILL.md");
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
fn migration_moves_existing_skill_to_canonical_store() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("basic");
    let platform = env.platform("claude");
    env.install_skill_copy(&platform, "demo-skill", "name: demo-skill");

    let mut platforms = HashMap::new();
    platforms.insert("claude".to_string(), platform.clone());

    let summary = run_one_time_skill_migration(&env.project_root(), &platforms).expect("migrate");
    let canonical = canonical_skill_path("demo-skill");

    assert!(!summary.skipped);
    assert_eq!(summary.migrated_skills, 1);
    assert_eq!(summary.relinked_targets, 1);
    assert!(canonical.join("SKILL.md").is_file());
    assert!(
        platform
            .skills_path()
            .join("demo-skill")
            .join("SKILL.md")
            .is_file()
    );
}

#[test]
fn migration_is_executed_only_once() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("once");
    let platform = env.platform("codex");
    env.install_skill_copy(&platform, "demo-skill", "name: demo-skill");

    let mut platforms = HashMap::new();
    platforms.insert("codex".to_string(), platform);

    let first = run_one_time_skill_migration(&env.project_root(), &platforms).expect("first");
    let second = run_one_time_skill_migration(&env.project_root(), &platforms).expect("second");

    assert!(!first.skipped);
    assert!(second.skipped);
}

#[test]
fn migration_selects_newest_skill_copy_for_conflicts() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("conflict");
    let platform_a = env.platform("a");
    let platform_b = env.platform("b");

    env.install_skill_copy(&platform_a, "same-skill", "old");
    std::thread::sleep(Duration::from_millis(30));
    env.install_skill_copy(&platform_b, "same-skill", "new");

    let mut platforms = HashMap::new();
    platforms.insert("a".to_string(), platform_a);
    platforms.insert("b".to_string(), platform_b);

    let _summary = run_one_time_skill_migration(&env.project_root(), &platforms).expect("migrate");
    let canonical_body = fs::read_to_string(canonical_skill_path("same-skill").join("SKILL.md"))
        .expect("read canonical");
    assert_eq!(canonical_body, "new");
}

#[test]
fn migration_tracks_copy_fallback_when_symlink_fails() {
    let _guard = TEST_SERIAL_MUTEX
        .lock()
        .unwrap_or_else(|err| err.into_inner());
    let env = TestEnv::new("fallback");
    let platform = env.platform("claude");
    env.install_skill_copy(&platform, "fallback-skill", "fallback");
    set_force_symlink_failure(true);

    let mut platforms = HashMap::new();
    platforms.insert("claude".to_string(), platform.clone());

    let summary = run_one_time_skill_migration(&env.project_root(), &platforms).expect("migrate");
    assert_eq!(summary.copy_fallbacks, 1);
    assert!(
        platform
            .skills_path()
            .join("fallback-skill")
            .join("SKILL.md")
            .is_file()
    );
}
