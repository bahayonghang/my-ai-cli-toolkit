"""Platform configuration loader module.

This module provides TOML-based platform configuration loading with support for:
- Built-in default configurations
- Project-level configuration (platforms.toml)
- User-level configuration override (~/.config/myclaude/platforms.toml)

Configuration priority (lowest to highest):
1. Built-in defaults (DEFAULT_PLATFORMS)
2. Project configuration (platforms.toml)
3. User configuration (~/.config/myclaude/platforms.toml)
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import rtoml

from core.paths import PROJECT_ROOT

# ============================================================================
# Constants
# ============================================================================

# Use unified PROJECT_ROOT from core.paths (was: Path(__file__).parent.parent)
_PROJECT_ROOT = PROJECT_ROOT

# User configuration directory
_USER_CONFIG_DIR = Path.home() / ".config" / "myclaude"

# Configuration file name
_CONFIG_FILENAME = "platforms.toml"

# Error message templates (can be imported by install.py for consistency)
ERROR_MSG_KIRO_REQUIRES_PROJECT = (
    "Option --kiro requires --project for local installation.\n"
    "Usage: python install.py list-skills --project <PATH> --kiro\n"
    "Suggestion: Provide a project directory path to install into .kiro/."
)


# ============================================================================
# Data Classes
# ============================================================================


@dataclass
class PlatformConfig:
    """Platform configuration data class."""

    name: str
    type: Literal["cli", "app"]
    base_dir: str  # Raw config value, e.g., "~/.claude"
    skills_subdir: str
    commands_subdir: str
    prompt_file: str | None
    commands_source: str
    fallback_commands_source: str | None

    def get_base_path(self) -> Path:
        """Resolve base_dir to an absolute Path."""
        return Path(self.base_dir).expanduser()

    def get_skills_path(self) -> Path:
        """Get the skills directory path."""
        return self.get_base_path() / self.skills_subdir

    def get_commands_path(self) -> Path:
        """Get the commands directory path."""
        return self.get_base_path() / self.commands_subdir

    def get_prompt_path(self) -> Path | None:
        """Get the prompt file path, or None if not configured."""
        if self.prompt_file:
            return self.get_base_path() / self.prompt_file
        return None


@dataclass
class ProjectInstallOverride:
    """Project-level installation override configuration."""

    platform_dir: str
    commands_subdir: str


# ============================================================================
# Built-in Default Configurations
# ============================================================================

DEFAULT_PLATFORMS: dict[str, PlatformConfig] = {
    "claude": PlatformConfig(
        name="claude",
        type="cli",
        base_dir="~/.claude",
        skills_subdir="skills",
        commands_subdir="commands",
        prompt_file="CLAUDE.md",
        commands_source="claude",
        fallback_commands_source=None,
    ),
    "codex": PlatformConfig(
        name="codex",
        type="cli",
        base_dir="~/.codex",
        skills_subdir="skills",
        commands_subdir="prompts",
        prompt_file=None,
        commands_source="codex",
        fallback_commands_source="claude",
    ),
    "gemini": PlatformConfig(
        name="gemini",
        type="cli",
        base_dir="~/.gemini",
        skills_subdir="skills",
        commands_subdir="commands",
        prompt_file=None,
        commands_source="gemini",
        fallback_commands_source=None,
    ),
    "qwen": PlatformConfig(
        name="qwen",
        type="cli",
        base_dir="~/.qwen",
        skills_subdir="skills",
        commands_subdir="commands",
        prompt_file=None,
        commands_source="qwen",
        fallback_commands_source="claude",
    ),
    "kiro": PlatformConfig(
        name="kiro",
        type="cli",
        base_dir="~/.kiro",
        skills_subdir="skills",
        commands_subdir="steering",
        prompt_file=None,
        commands_source="kiro",
        fallback_commands_source="claude",
    ),
    "trae": PlatformConfig(
        name="trae",
        type="cli",
        base_dir="~/.trae",
        skills_subdir="skills",
        commands_subdir="commands",
        prompt_file=None,
        commands_source="trae",
        fallback_commands_source="claude",
    ),
    "opencode": PlatformConfig(
        name="opencode",
        type="cli",
        base_dir="~/.config/opencode",
        skills_subdir="skills",
        commands_subdir="commands",
        prompt_file=None,
        commands_source="opencode",
        fallback_commands_source="claude",
    ),
    "antigravity": PlatformConfig(
        name="antigravity",
        type="app",
        base_dir="~/.gemini/antigravity",
        skills_subdir="skills",
        commands_subdir="workflows",
        prompt_file=None,
        commands_source="antigravity",
        fallback_commands_source=None,
    ),
    "windsurf": PlatformConfig(
        name="windsurf",
        type="app",
        base_dir="~/.codeium/windsurf",
        skills_subdir="skills",
        commands_subdir="workflows",
        prompt_file=None,
        commands_source="windsurf",
        fallback_commands_source=None,
    ),
}

DEFAULT_PROJECT_OVERRIDES: dict[str, ProjectInstallOverride] = {
    "kiro": ProjectInstallOverride(platform_dir=".kiro", commands_subdir="steering"),
    "trae": ProjectInstallOverride(platform_dir=".trae", commands_subdir="commands"),
    "antigravity": ProjectInstallOverride(platform_dir=".gemini/antigravity", commands_subdir="workflows"),
    "windsurf": ProjectInstallOverride(platform_dir=".codeium/windsurf", commands_subdir="workflows"),
    "codex": ProjectInstallOverride(platform_dir=".codex", commands_subdir="prompts"),
    "opencode": ProjectInstallOverride(platform_dir=".opencode", commands_subdir="commands"),
}


# ============================================================================
# Configuration Loading Functions
# ============================================================================


def _load_toml_file(path: Path) -> dict | None:
    """Load a TOML file, returning None if it doesn't exist.

    Args:
        path: Path to the TOML file

    Returns:
        Parsed TOML data as dict, or None if file doesn't exist

    Raises:
        ValueError: If the file exists but contains invalid TOML
    """
    if not path.exists():
        return None

    try:
        return rtoml.load(path)
    except Exception as e:
        raise ValueError(f"Failed to parse TOML file '{path}': {e}") from e


def _parse_platform_config(name: str, data: dict) -> PlatformConfig:
    """Parse a platform configuration from TOML data.

    Args:
        name: Platform name
        data: Platform configuration dict from TOML

    Returns:
        PlatformConfig instance
    """
    return PlatformConfig(
        name=name,
        type=data.get("type", "cli"),
        base_dir=data.get("base_dir", f"~/.{name}"),
        skills_subdir=data.get("skills_subdir", "skills"),
        commands_subdir=data.get("commands_subdir", "commands"),
        prompt_file=data.get("prompt_file"),
        commands_source=data.get("commands_source", name),
        fallback_commands_source=data.get("fallback_commands_source"),
    )


def _parse_project_override(data: dict) -> ProjectInstallOverride:
    """Parse a project install override from TOML data.

    Args:
        data: Override configuration dict from TOML

    Returns:
        ProjectInstallOverride instance
    """
    return ProjectInstallOverride(
        platform_dir=data.get("platform_dir", ""),
        commands_subdir=data.get("commands_subdir", "commands"),
    )


def load_platforms_config(
    project_config_path: Path | None = None,
    user_config_path: Path | None = None,
) -> dict[str, PlatformConfig]:
    """Load platform configurations with fallback and override support.

    Configuration priority (lowest to highest):
    1. Built-in defaults (DEFAULT_PLATFORMS)
    2. Project configuration (platforms.toml)
    3. User configuration (~/.config/myclaude/platforms.toml)

    Args:
        project_config_path: Override path for project config (for testing)
        user_config_path: Override path for user config (for testing)

    Returns:
        Dict mapping platform names to PlatformConfig instances
    """
    # Start with built-in defaults
    platforms = DEFAULT_PLATFORMS.copy()

    # Load project configuration
    project_path = project_config_path or (_PROJECT_ROOT / _CONFIG_FILENAME)
    project_data = _load_toml_file(project_path)
    if project_data and "platforms" in project_data:
        for name, data in project_data["platforms"].items():
            platforms[name] = _parse_platform_config(name, data)

    # Load user configuration (highest priority)
    user_path = user_config_path or (_USER_CONFIG_DIR / _CONFIG_FILENAME)
    user_data = _load_toml_file(user_path)
    if user_data and "platforms" in user_data:
        for name, data in user_data["platforms"].items():
            platforms[name] = _parse_platform_config(name, data)

    return platforms


def load_project_overrides(
    project_config_path: Path | None = None,
    user_config_path: Path | None = None,
) -> dict[str, ProjectInstallOverride]:
    """Load project install overrides with fallback and override support.

    Args:
        project_config_path: Override path for project config (for testing)
        user_config_path: Override path for user config (for testing)

    Returns:
        Dict mapping platform names to ProjectInstallOverride instances
    """
    # Start with built-in defaults
    overrides = DEFAULT_PROJECT_OVERRIDES.copy()

    # Load project configuration
    project_path = project_config_path or (_PROJECT_ROOT / _CONFIG_FILENAME)
    project_data = _load_toml_file(project_path)
    if project_data:
        project_install = project_data.get("project_install", {})
        override_data = project_install.get("overrides", {})
        for name, data in override_data.items():
            overrides[name] = _parse_project_override(data)

    # Load user configuration (highest priority)
    user_path = user_config_path or (_USER_CONFIG_DIR / _CONFIG_FILENAME)
    user_data = _load_toml_file(user_path)
    if user_data:
        project_install = user_data.get("project_install", {})
        override_data = project_install.get("overrides", {})
        for name, data in override_data.items():
            overrides[name] = _parse_project_override(data)

    return overrides


# ============================================================================
# Public API Functions
# ============================================================================

# Cached configurations (loaded once)
_platforms_cache: dict[str, PlatformConfig] | None = None
_overrides_cache: dict[str, ProjectInstallOverride] | None = None


def get_all_platforms() -> dict[str, PlatformConfig]:
    """Get all platform configurations.

    Returns:
        Dict mapping platform names to PlatformConfig instances
    """
    global _platforms_cache
    if _platforms_cache is None:
        _platforms_cache = load_platforms_config()
    return _platforms_cache


def get_platform_config(name: str) -> PlatformConfig:
    """Get configuration for a specific platform.

    Args:
        name: Platform name (e.g., "claude", "codex")

    Returns:
        PlatformConfig instance

    Raises:
        ValueError: If platform name is unknown
    """
    platforms = get_all_platforms()
    if name not in platforms:
        available = ", ".join(sorted(platforms.keys()))
        raise ValueError(f"Unknown platform '{name}'. Available platforms: {available}")
    return platforms[name]


def get_available_platform_names() -> list[str]:
    """Get list of available platform names.

    Returns:
        Sorted list of platform names
    """
    return sorted(get_all_platforms().keys())


def get_project_override(name: str) -> ProjectInstallOverride | None:
    """Get project install override for a specific platform.

    Args:
        name: Platform name

    Returns:
        ProjectInstallOverride instance, or None if no override exists
    """
    global _overrides_cache
    if _overrides_cache is None:
        _overrides_cache = load_project_overrides()
    return _overrides_cache.get(name)


def resolve_install_paths(
    platform: str,
    project_path: str | None = None,
    use_kiro: bool = False,
) -> dict:
    """Resolve installation paths for a platform.

    This function replaces the old get_target_config() function.

    Args:
        platform: Platform name (e.g., "claude", "codex")
        project_path: Project path for project-level installation (optional)
        use_kiro: Whether to use Kiro structure for project installation

    Returns:
        Dict with keys: base, skills, commands, prompt (Path objects)

    Raises:
        ValueError: If platform is unknown or kiro mode requires project_path
    """
    # Normalize project_path: treat whitespace-only strings as None
    if project_path is not None:
        project_path = project_path.strip() or None

    if use_kiro and not project_path and platform != "kiro":
        raise ValueError(ERROR_MSG_KIRO_REQUIRES_PROJECT)

    config = get_platform_config(platform)

    # Global installation (no project path)
    if not project_path:
        return {
            "base": config.get_base_path(),
            "skills": config.get_skills_path(),
            "commands": config.get_commands_path(),
            "prompt": config.get_prompt_path(),
        }

    # Project-level installation
    base = Path(project_path).resolve()

    # Determine platform directory and commands subdirectory
    if use_kiro or platform == "kiro":
        platform_dir = ".kiro"
        cmd_subdir = "steering"
    else:
        # Check for platform-specific override
        override = get_project_override(platform)
        if override:
            platform_dir = override.platform_dir
            cmd_subdir = override.commands_subdir
        else:
            # Default pattern
            platform_dir = f".{platform}"
            cmd_subdir = "commands"

    base_dir = base / platform_dir

    # Only claude platform (non-kiro) has prompt file
    prompt_file = base_dir / "CLAUDE.md" if (platform == "claude" and not use_kiro) else None

    return {
        "base": base_dir,
        "skills": base_dir / "skills",
        "commands": base_dir / cmd_subdir,
        "prompt": prompt_file,
    }


def get_commands_source_dir(platform: str, commands_src_base: Path) -> Path:
    """Get the commands source directory for a platform.

    This handles fallback logic: if the platform's commands directory doesn't exist,
    fall back to the fallback_commands_source if configured.

    Args:
        platform: Platform name
        commands_src_base: Base directory for commands sources (e.g., commands/)

    Returns:
        Path to the commands source directory
    """
    config = get_platform_config(platform)

    # Try primary commands source
    primary_dir = commands_src_base / config.commands_source
    if primary_dir.exists():
        return primary_dir

    # Try fallback if configured
    if config.fallback_commands_source:
        fallback_dir = commands_src_base / config.fallback_commands_source
        if fallback_dir.exists():
            return fallback_dir

    # Return primary even if it doesn't exist (caller will handle)
    return primary_dir


def clear_config_cache() -> None:
    """Clear the configuration cache.

    Call this if you need to reload configurations (e.g., after modifying config files).
    """
    global _platforms_cache, _overrides_cache
    _platforms_cache = None
    _overrides_cache = None


def set_test_config(
    platforms: dict[str, PlatformConfig] | None = None,
    overrides: dict[str, ProjectInstallOverride] | None = None,
) -> tuple[dict[str, PlatformConfig] | None, dict[str, ProjectInstallOverride] | None]:
    """Set test configuration and return original values for restoration.

    This is a public API for tests to mock configuration without directly
    accessing private cache variables.

    Args:
        platforms: Platform configurations to set (None to keep current)
        overrides: Project install overrides to set (None to keep current)

    Returns:
        Tuple of (original_platforms, original_overrides) for restoration

    Example:
        >>> # Save original and set test config
        >>> original = set_test_config(platforms={"claude": test_config})
        >>> try:
        ...     # Run tests
        ...     pass
        >>> finally:
        ...     # Restore original config
        ...     set_test_config(platforms=original[0], overrides=original[1])
    """
    global _platforms_cache, _overrides_cache

    # Save original values
    original_platforms = _platforms_cache
    original_overrides = _overrides_cache

    # Set new values if provided
    if platforms is not None:
        _platforms_cache = platforms
    if overrides is not None:
        _overrides_cache = overrides

    return (original_platforms, original_overrides)
