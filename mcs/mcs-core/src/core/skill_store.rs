use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::config::paths::home_dir;
use crate::model::LinkMode;

const MCS_DIR: &str = ".mcs";
const SKILLS_DIR: &str = "skills";
const MIGRATIONS_DIR: &str = "migrations";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SkillInstallMode {
    Symlink,
    CopyFallback,
}

#[cfg(test)]
static TEST_MCS_ROOT: std::sync::Mutex<Option<PathBuf>> = std::sync::Mutex::new(None);
#[cfg(test)]
static FORCE_SYMLINK_FAILURE: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);
#[cfg(test)]
pub(crate) static TEST_SERIAL_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn mcs_root() -> PathBuf {
    #[cfg(test)]
    {
        if let Some(path) = TEST_MCS_ROOT.lock().ok().and_then(|g| g.clone()) {
            return path;
        }
    }
    home_dir().join(MCS_DIR)
}

pub fn canonical_skills_root() -> PathBuf {
    mcs_root().join(SKILLS_DIR)
}

pub fn canonical_meta_root() -> PathBuf {
    mcs_root().join(MIGRATIONS_DIR)
}

pub fn canonical_skill_path(name: &str) -> PathBuf {
    canonical_skills_root().join(name)
}

pub fn remove_path_any(path: &Path) -> io::Result<()> {
    let metadata = match fs::symlink_metadata(path) {
        Ok(meta) => meta,
        Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(e),
    };

    if metadata.file_type().is_symlink() {
        return remove_symlink(path);
    }
    if metadata.is_dir() {
        return fs::remove_dir_all(path);
    }
    fs::remove_file(path)
}

fn remove_symlink(path: &Path) -> io::Result<()> {
    if fs::remove_file(path).is_ok() {
        return Ok(());
    }
    if fs::remove_dir(path).is_ok() {
        return Ok(());
    }
    fs::remove_dir_all(path)
}

pub fn copy_dir_replace(src: &Path, dst: &Path) -> io::Result<()> {
    if !src.is_dir() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("Source directory does not exist: {}", src.display()),
        ));
    }

    remove_path_any(dst)?;
    let parent = parent_dir(dst)?;
    fs::create_dir_all(&parent)?;

    let opts = fs_extra::dir::CopyOptions::new();
    fs_extra::dir::copy(src, &parent, &opts).map_err(fs_extra_to_io)?;
    Ok(())
}

fn parent_dir(path: &Path) -> io::Result<PathBuf> {
    path.parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| io::Error::other(format!("Path has no parent: {}", path.display())))
}

fn fs_extra_to_io(err: fs_extra::error::Error) -> io::Error {
    io::Error::other(err.to_string())
}

pub fn try_symlink_dir(src: &Path, dst: &Path) -> io::Result<()> {
    #[cfg(test)]
    if FORCE_SYMLINK_FAILURE.load(std::sync::atomic::Ordering::Relaxed) {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "forced symlink failure",
        ));
    }

    let parent = parent_dir(dst)?;
    fs::create_dir_all(parent)?;
    symlink_dir(src, dst)
}

pub fn link_or_copy_dir(
    canonical: &Path,
    target: &Path,
    mode: LinkMode,
) -> io::Result<SkillInstallMode> {
    remove_path_any(target)?;
    match mode {
        LinkMode::Copy => {
            copy_dir_replace(canonical, target)?;
            Ok(SkillInstallMode::CopyFallback)
        }
        LinkMode::Symlink => {
            // Force symlink — propagate error directly, no silent fallback.
            try_symlink_dir(canonical, target)?;
            Ok(SkillInstallMode::Symlink)
        }
        LinkMode::Auto => match try_symlink_dir(canonical, target) {
            Ok(()) => Ok(SkillInstallMode::Symlink),
            Err(_) => {
                copy_dir_replace(canonical, target)?;
                Ok(SkillInstallMode::CopyFallback)
            }
        },
    }
}

#[cfg(unix)]
fn symlink_dir(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::unix::fs::symlink(src, dst)
}

#[cfg(windows)]
fn symlink_dir(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::windows::fs::symlink_dir(src, dst)
}

#[cfg(not(any(unix, windows)))]
fn symlink_dir(_: &Path, _: &Path) -> io::Result<()> {
    Err(io::Error::new(
        io::ErrorKind::Unsupported,
        "symlink is not supported on this platform",
    ))
}

#[cfg(test)]
pub(crate) fn set_test_mcs_root(path: Option<PathBuf>) {
    if let Ok(mut root) = TEST_MCS_ROOT.lock() {
        *root = path;
    }
}

#[cfg(test)]
pub(crate) fn set_force_symlink_failure(enabled: bool) {
    FORCE_SYMLINK_FAILURE.store(enabled, std::sync::atomic::Ordering::Relaxed);
}
