#!/usr/bin/env python3
"""
CLI skill manager built with typer.
"""

import datetime
import shutil
import sys
from pathlib import Path

import typer

from core.config_loader import (
    ERROR_MSG_KIRO_REQUIRES_PROJECT,
    get_available_platform_names,
    get_commands_source_dir,
    resolve_install_paths,
)
from core.paths import COMMANDS_SRC_DIR, PROMPTS_SRC_DIR, SKILLS_SRC_DIR
from core.skill_meta import parse_skill_frontmatter


# --- Colors & Styles (Standard ANSI) ---
class Colors:
    HEADER = "\033[95m"
    INFO = "\033[94m"
    SUCCESS = "\033[92m"
    WARN = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def log_info(msg: str) -> None:
    print(f"{Colors.INFO}[INFO] {Colors.ENDC} {msg}")


def log_success(msg: str) -> None:
    print(f"{Colors.SUCCESS}[SUCCESS] {Colors.ENDC} {msg}")


def log_warn(msg: str) -> None:
    print(f"{Colors.WARN}[WARN] {Colors.ENDC} {msg}")


def log_error(msg: str) -> None:
    print(f"{Colors.FAIL}[ERROR] {Colors.ENDC} {msg}")


# --- Error Messages Templates ---
ERROR_MESSAGES = {
    "path_not_exist": ("Project path does not exist: {path}\nSuggestion: Create the directory first or check the path."),
    "path_not_dir": ("Path is not a directory: {path}\nSuggestion: Please provide a valid directory path."),
    "permission_denied": (
        "Permission denied: Cannot write to {path}\nSuggestion: Check directory permissions or use a different path."
    ),
    "skill_not_found": ("Skill not found in repository: {skill}\nAvailable skills: {available}"),
    "invalid_target": ("Invalid target platform: {target}\nValid targets: {available}"),
    "path_access_error": (
        "Cannot access path: {path}\n"
        "Error: {error}\n"
        "Suggestion: Check if the path is accessible and you have proper permissions."
    ),
    "source_dir_not_found": (
        "Source directory not found: {path}\nSuggestion: Ensure the repository is complete and not corrupted."
    ),
    "prompt_update_not_supported": (
        "prompt-update is only supported for 'claude' target.\n"
        "Current target: {target}\n"
        "Suggestion: Use --target claude or switch to claude platform."
    ),
    "prompt_file_not_found": (
        "Local CLAUDE.md not found: {path}\nSuggestion: Ensure the prompts directory exists and contains CLAUDE.md."
    ),
    "kiro_requires_project": ERROR_MSG_KIRO_REQUIRES_PROJECT,
}


def format_error(error_key: str, **kwargs) -> str:
    """Format an error message from the template registry.

    Args:
        error_key: ERROR_MESSAGES key
        **kwargs: Parameters for string formatting

    Returns:
        Formatted error message
    """
    if error_key not in ERROR_MESSAGES:
        return f"Unknown error: {error_key}"

    try:
        return ERROR_MESSAGES[error_key].format(**kwargs)
    except KeyError as e:
        return f"Error formatting message '{error_key}': missing parameter {e}"


def validate_project_path(path: str) -> tuple[bool, str | None]:
    """Validate a project path.

    Args:
        path: Project path (supports ~, .., . etc.)

    Returns:
        (is_valid, error_message)
    """
    try:
        p = Path(path).expanduser().resolve()
    except Exception as e:
        return False, format_error("path_access_error", path=path, error=str(e))

    if not p.exists():
        return False, format_error("path_not_exist", path=str(p))

    if not p.is_dir():
        return False, format_error("path_not_dir", path=str(p))

    test_file = p / ".myclaude_write_test"
    try:
        test_file.touch()
        test_file.unlink()
    except PermissionError:
        return False, format_error("permission_denied", path=str(p))
    except Exception as e:
        return False, format_error("path_access_error", path=str(p), error=str(e))

    return True, None


def normalize_project_path(path: str) -> Path:
    """Normalize a project path to an absolute path."""
    return Path(path).expanduser().resolve()


class SkillManager:
    def __init__(
        self,
        target: str,
        project_path: str | None = None,
        use_kiro: bool = False,
    ):
        """Initialize SkillManager.

        Args:
            target: Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)
            project_path: Project path (optional)
            use_kiro: Whether to use Kiro structure
        """
        available_platforms = get_available_platform_names()
        if target not in available_platforms:
            raise ValueError(format_error("invalid_target", target=target, available=", ".join(available_platforms)))

        if use_kiro and not project_path and target != "kiro":
            raise ValueError(format_error("kiro_requires_project"))

        self.target = target
        self.project_path = project_path
        self.use_kiro = use_kiro

        self.config = resolve_install_paths(target, project_path, use_kiro=use_kiro)
        self.target_skills_dir = self.config["skills"]
        self.target_commands_dir = self.config["commands"]

    def get_install_location_info(self) -> str:
        """Get human-readable install location description."""
        if self.project_path:
            abs_path = Path(self.project_path).resolve()

            try:
                rel_path = abs_path.relative_to(Path.cwd())
            except ValueError:
                rel_path = abs_path

            if self.use_kiro:
                return f"Project: {rel_path} (Kiro structure)"
            else:
                return f"Project: {rel_path} (Target: {self.target})"
        else:
            return f"Global (Target: {self.target})"

    def ensure_dirs(self):
        self.config["base"].mkdir(parents=True, exist_ok=True)
        self.target_skills_dir.mkdir(parents=True, exist_ok=True)
        self.target_commands_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def parse_skill_frontmatter(skill_path: Path) -> dict:
        """Parse YAML frontmatter from SKILL.md file.

        Delegates to core.skill_meta.parse_skill_frontmatter for shared logic.
        Kept as static method for backward compatibility.
        """
        return parse_skill_frontmatter(skill_path)

    def get_skill_description(self, skill_path):
        """Get skill description using frontmatter parser."""
        metadata = parse_skill_frontmatter(skill_path)
        return metadata.get("description")

    def list_available(self):
        location_info = self.get_install_location_info()
        print(f"\n{Colors.HEADER}=== Available Skills ({location_info}) ==={Colors.ENDC}")
        if not SKILLS_SRC_DIR.exists():
            log_error(format_error("path_not_exist", path=str(SKILLS_SRC_DIR)))
            return

        skills = sorted([d for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()])
        for i, skill in enumerate(skills, 1):
            desc = self.get_skill_description(skill)
            status = (
                f"{Colors.SUCCESS}Installed{Colors.ENDC}"
                if (self.target_skills_dir / skill.name).exists()
                else f"{Colors.FAIL}Not installed{Colors.ENDC}"
            )
            print(f"\n[{i}] {Colors.BOLD}{skill.name}{Colors.ENDC}")
            if desc:
                print(f"    Description: {desc}")
            print(f"    Status: {status}")

    def list_installed(self):
        location_info = self.get_install_location_info()
        print(f"\n{Colors.HEADER}=== Installed Skills ({location_info}) ==={Colors.ENDC}")
        if not self.target_skills_dir.exists():
            log_warn("No skills directory found.")
            return

        installed = sorted([d for d in self.target_skills_dir.iterdir() if d.is_dir()])
        if not installed:
            log_warn("No skills installed.")
            return

        for skill in installed:
            source = "This repository" if (SKILLS_SRC_DIR / skill.name).exists() else "External"
            print(f" - {Colors.SUCCESS}{skill.name}{Colors.ENDC} ({source})")

    def install_skill(self, skill_name, quiet=False):
        if self.project_path:
            valid, error_msg = validate_project_path(self.project_path)
            if not valid:
                log_error(error_msg or "Validation failed")
                return False

            if not quiet:
                log_info(f"Installing to project: {self.get_install_location_info()}")

        src = SKILLS_SRC_DIR / skill_name
        dst = self.target_skills_dir / skill_name

        if not src.exists():
            alt_src = Path.cwd() / "tests" / "skills" / skill_name
            if alt_src.exists():
                src = alt_src

        if not src.exists():
            available_skills = ", ".join([d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()])
            log_error(format_error("skill_not_found", skill=skill_name, available=available_skills))
            return False

        self.ensure_dirs()
        if dst.exists():
            if not quiet:
                log_warn(f"Overwriting existing skill: {skill_name}")
            shutil.rmtree(dst)

        shutil.copytree(src, dst)
        if not quiet:
            log_success(f"Installed: {skill_name} -> {dst}")
        return True

    def install_commands(self):
        if self.project_path:
            valid, error_msg = validate_project_path(self.project_path)
            if not valid:
                log_error(error_msg or "Validation failed")
                return

            log_info(f"Installing commands to project: {self.get_install_location_info()}")

        log_info(f"Installing commands for {self.target}...")
        self.ensure_dirs()

        src_cmd_dir = get_commands_source_dir(self.target, COMMANDS_SRC_DIR)

        if not src_cmd_dir.exists():
            log_warn(f"No specific commands found for target {self.target} in {src_cmd_dir}")
            return

        try:
            if self.target_commands_dir.exists():
                log_warn(f"Overwriting existing commands directory: {self.target_commands_dir}")
                shutil.rmtree(self.target_commands_dir)

            shutil.copytree(src_cmd_dir, self.target_commands_dir)

            log_success(f"Installed commands to {self.target_commands_dir}")
            if self.target == "codex":
                log_info(f"Note: For Codex, commands are installed as prompts in {self.target_commands_dir}")
            elif self.target == "antigravity":
                log_info(f"Note: For Antigravity, commands are installed as workflows in {self.target_commands_dir}")
            elif self.target == "windsurf":
                log_info(f"Note: For Windsurf, commands are installed as workflows in {self.target_commands_dir}")
            elif self.target == "kiro" or self.use_kiro:
                log_info(f"Note: For Kiro, commands are installed as steering files in {self.target_commands_dir}")
        except Exception as e:
            log_error(format_error("path_access_error", path=str(self.target_commands_dir), error=str(e)))

    def install_all(self):
        log_info(f"Installing all skills to {self.target}...")
        skills = sorted([d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()])
        count = 0
        for name in skills:
            if self.install_skill(name, quiet=True):
                count += 1
        log_success(f"Finished! Installed {count} skills.")

        # Also install commands
        self.install_commands()

    def interactive(self):
        self.list_available()
        skills = sorted([d.name for d in SKILLS_SRC_DIR.iterdir() if d.is_dir()])
        try:
            val = input(f"\n{Colors.INFO}Select numbers to install (space-separated, or 'all'):{Colors.ENDC} ").strip()
        except EOFError:
            return

        if val.lower() == "all":
            self.install_all()
            return

        count = 0
        for idx_str in val.split():
            try:
                idx = int(idx_str) - 1
                if 0 <= idx < len(skills):
                    if self.install_skill(skills[idx]):
                        count += 1
                else:
                    log_warn(f"Invalid index: {idx_str}")
            except ValueError:
                log_warn(f"Skipping invalid input: {idx_str}")
        log_success(f"Finished! Installed {count} skills.")

    def prompt_update(self):
        if self.target != "claude" or self.use_kiro:
            log_error(format_error("prompt_update_not_supported", target=self.target))
            return

        local_md = PROMPTS_SRC_DIR / "CLAUDE.md"
        global_md = self.config["prompt"]

        if not local_md.exists():
            log_error(format_error("prompt_file_not_found", path=str(local_md)))
            return

        self.ensure_dirs()
        if global_md.exists():
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup = global_md.parent / f"CLAUDE.md.backup.{timestamp}"
            log_info(f"Backing up existing CLAUDE.md to {backup.name}")
            shutil.copy2(global_md, backup)

        shutil.copy2(local_md, global_md)
        log_success("Global CLAUDE.md updated successfully.")

    def prompt_diff(self):
        if self.target != "claude" or self.use_kiro:
            log_error(format_error("prompt_update_not_supported", target=self.target))
            return

        local_md = PROMPTS_SRC_DIR / "CLAUDE.md"
        global_md = self.config["prompt"]

        if not local_md.exists():
            log_error(format_error("prompt_file_not_found", path=str(local_md)))
            return

        if not global_md.exists():
            log_warn("Global CLAUDE.md does not exist.")
            return

        import difflib

        with open(local_md, encoding="utf-8") as f1, open(global_md, encoding="utf-8") as f2:
            diff = difflib.unified_diff(f2.readlines(), f1.readlines(), fromfile="Global CLAUDE.md", tofile="Local CLAUDE.md")
            for line in diff:
                sys.stdout.write(line)


# --- Public CLI options ---
ProjectOption = typer.Option(None, "--project", "-p", help="Project path for local installation (relative or absolute)")

KiroFlag = typer.Option(False, "--kiro", help="Use Kiro structure (.kiro/skills/ and .kiro/steering/)")

app = typer.Typer(name="skill-installer", help="Unified Skills & Config Manager", epilog="Built with typer")


@app.command()
def list_skills(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """List available skills."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.list_available()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def installed(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """List installed skills."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.list_installed()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def install(
    skills: list[str] = typer.Argument(..., help="Skill names to install"),
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Install specific skills."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        log_info(f"Installing to: {mgr.get_install_location_info()}")

        for skill in skills:
            mgr.install_skill(skill)
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def install_all(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Install all skills."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        log_info(f"Installing to: {mgr.get_install_location_info()}")
        mgr.install_all()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def install_commands(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Install commands."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        log_info(f"Installing to: {mgr.get_install_location_info()}")
        mgr.install_commands()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def interactive(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Interactive installation."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.interactive()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def prompt_update(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Update CLAUDE.md prompt file."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.prompt_update()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


@app.command()
def prompt_diff(
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="Target platform (claude, codex, gemini, qwen, qoder, antigravity, windsurf, kiro, trae, trae-cn, opencode, iflow)",
    ),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag,
):
    """Compare local and global CLAUDE.md prompt files."""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.prompt_diff()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)


if __name__ == "__main__":
    try:
        app()
    except KeyboardInterrupt:
        print("\nAborted by user.")
        sys.exit(0)
