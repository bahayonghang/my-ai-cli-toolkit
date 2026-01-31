#!/usr/bin/env python3
"""
命令行交互版本的技能管理器，使用typer实现
"""
import datetime

# 将 install.py 中的代码复制过来以保持功能一致
import shutil
import sys
from pathlib import Path

import typer


# --- Colors & Styles (Standard ANSI) ---
class Colors:
    HEADER = '\033[95m'
    INFO = '\033[94m'
    SUCCESS = '\033[92m'
    WARN = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log_info(msg): print(f"{Colors.INFO}[INFO] {Colors.ENDC} {msg}")
def log_success(msg): print(f"{Colors.SUCCESS}[SUCCESS] {Colors.ENDC} {msg}")
def log_warn(msg): print(f"{Colors.WARN}[WARN] {Colors.ENDC} {msg}")
def log_error(msg): print(f"{Colors.FAIL}[ERROR] {Colors.ENDC} {msg}")

# --- Error Messages Templates ---
ERROR_MESSAGES = {
    "path_not_exist": (
        "Project path does not exist: {path}\n"
        "Suggestion: Create the directory first or check the path."
    ),
    "path_not_dir": (
        "Path is not a directory: {path}\n"
        "Suggestion: Please provide a valid directory path."
    ),
    "permission_denied": (
        "Permission denied: Cannot write to {path}\n"
        "Suggestion: Check directory permissions or use a different path."
    ),
    "skill_not_found": (
        "Skill not found in repository: {skill}\n"
        "Available skills: {available}"
    ),
    "invalid_target": (
        "Invalid target platform: {target}\n"
        "Valid targets: claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae"
    ),
    "path_access_error": (
        "Cannot access path: {path}\n"
        "Error: {error}\n"
        "Suggestion: Check if the path is accessible and you have proper permissions."
    ),
    "source_dir_not_found": (
        "Source directory not found: {path}\n"
        "Suggestion: Ensure the repository is complete and not corrupted."
    ),
    "prompt_update_not_supported": (
        "prompt-update is only supported for 'claude' target.\n"
        "Current target: {target}\n"
        "Suggestion: Use --target claude or switch to claude platform."
    ),
    "prompt_file_not_found": (
        "Local CLAUDE.md not found: {path}\n"
        "Suggestion: Ensure the prompts directory exists and contains CLAUDE.md."
    ),
    "kiro_requires_project": (
        "Option --kiro requires --project for local installation.\n"
        "Usage: python install.py list-skills --project <PATH> --kiro\n"
        "Suggestion: Provide a project directory path to install into .kiro/."
    ),
}


def format_error(error_key: str, **kwargs) -> str:
    """格式化错误消息

    Args:
        error_key: ERROR_MESSAGES 中的键名
        **kwargs: 用于格式化消息的参数

    Returns:
        格式化后的错误消息

    Example:
        >>> format_error("path_not_exist", path="./nonexistent")
        'Project path does not exist: ./nonexistent\\nSuggestion: ...'
    """
    if error_key not in ERROR_MESSAGES:
        return f"Unknown error: {error_key}"

    try:
        return ERROR_MESSAGES[error_key].format(**kwargs)
    except KeyError as e:
        return f"Error formatting message '{error_key}': missing parameter {e}"

# --- Configuration ---
SCRIPT_DIR = Path(__file__).parent.absolute()
SKILLS_SRC_DIR = SCRIPT_DIR / "skills"
PROMPTS_SRC_DIR = SCRIPT_DIR / "prompts"
COMMANDS_SRC_DIR = SCRIPT_DIR / "commands"
HOME_DIR = Path.home()

TARGET_CONFIG = {
    "claude": {
        "base": HOME_DIR / ".claude",
        "skills": HOME_DIR / ".claude" / "skills",
        "commands": HOME_DIR / ".claude" / "commands",
        "prompt": HOME_DIR / ".claude" / "CLAUDE.md"
    },
    "codex": {
        "base": HOME_DIR / ".codex",
        "skills": HOME_DIR / ".codex" / "skills",
        "commands": HOME_DIR / ".codex" / "prompts",
        "prompt": None
    },
    "gemini": {
        "base": HOME_DIR / ".gemini",
        "skills": HOME_DIR / ".gemini" / "skills",
        "commands": HOME_DIR / ".gemini" / "commands",
        "prompt": None
    },
    "qwen": {
        "base": HOME_DIR / ".qwen",
        "skills": HOME_DIR / ".qwen" / "skills",
        "commands": HOME_DIR / ".qwen" / "commands",  # Qwen now uses Markdown format like Claude
        "prompt": None
    },
    "antigravity": {
        "base": HOME_DIR / ".gemini" / "antigravity",
        "skills": HOME_DIR / ".gemini" / "antigravity" / "skills",
        "commands": HOME_DIR / ".gemini" / "antigravity" / "workflows",
        "prompt": None
    },
    "windsurf": {
        "base": HOME_DIR / ".codeium" / "windsurf",
        "skills": HOME_DIR / ".codeium" / "windsurf" / "skills",
        "commands": HOME_DIR / ".codeium" / "windsurf" / "workflows",
        "prompt": None
    },
    "kiro": {
        "base": HOME_DIR / ".kiro",
        "skills": HOME_DIR / ".kiro" / "skills",
        "commands": HOME_DIR / ".kiro" / "steering",
        "prompt": None
    },
    "trae": {
        "base": HOME_DIR / ".trae",
        "skills": HOME_DIR / ".trae" / "skills",
        "commands": HOME_DIR / ".trae" / "commands",
        "prompt": None
    }
}

def validate_project_path(path: str) -> tuple[bool, str | None]:
    """验证项目路径

    Args:
        path: 项目路径（支持 ~, .., . 等）

    Returns:
        (是否有效, 错误消息)

    Note:
        - 自动处理 ~ 用户目录扩展
        - 自动解析相对路径 (.., .)
        - 自动解析符号链接
    """
    # 先规范化路径（处理 ~, .., ., 符号链接等）
    try:
        p = Path(path).expanduser().resolve()
    except Exception as e:
        return False, format_error("path_access_error", path=path, error=str(e))

    # 检查存在性
    if not p.exists():
        return False, format_error("path_not_exist", path=str(p))

    # 检查是否为目录
    if not p.is_dir():
        return False, format_error("path_not_dir", path=str(p))

    # 检查写权限
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
    """规范化项目路径

    Args:
        path: 原始路径（可能包含 ~, .., . 等）

    Returns:
        规范化后的绝对路径
    """
    return Path(path).expanduser().resolve()


def get_target_config(
    target: str,
    project_path: str | None = None,
    use_kiro: bool = False,
) -> dict:
    """生成目标平台配置

    Args:
        target: 平台名称 (claude, codex, gemini, qwen, antigravity, windsurf, kiro)
        project_path: 项目路径（可选）

    Returns:
        配置字典，包含 base, skills, commands, prompt 路径
    """
    if use_kiro and (project_path is None or str(project_path).strip() == "") and target != "kiro":
        raise ValueError(format_error("kiro_requires_project"))

    # 如果没有指定项目路径，返回全局配置
    if not project_path:
        return TARGET_CONFIG[target]

    # 项目级别配置
    base = Path(project_path).resolve()  # 转换为绝对路径

    # 根据平台决定子目录名和结构
    if target == "kiro" or use_kiro:
        platform_dir = ".kiro"
        cmd_dir = "steering"
    elif target == "trae":
        platform_dir = ".trae"
        cmd_dir = "commands"
    elif target == "antigravity":
        platform_dir = ".gemini/antigravity"
        cmd_dir = "workflows"
    elif target == "windsurf":
        platform_dir = ".codeium/windsurf"
        cmd_dir = "workflows"
    elif target == "codex":
        platform_dir = f".{target}"
        cmd_dir = "prompts"
    else:
        platform_dir = f".{target}"
        cmd_dir = "commands"

    base_dir = base / platform_dir

    # 只有 claude 平台且非 Kiro 结构时有 prompt 文件
    prompt_file = base_dir / "CLAUDE.md" if (target == "claude" and not use_kiro) else None

    return {
        "base": base_dir,
        "skills": base_dir / "skills",
        "commands": base_dir / cmd_dir,
        "prompt": prompt_file,
    }


class SkillManager:
    def __init__(
        self,
        target: str,
        project_path: str | None = None,
        use_kiro: bool = False,
    ):
        """初始化 SkillManager

        Args:
            target: 目标平台 (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)
            project_path: 项目路径（可选）
        """
        if target not in TARGET_CONFIG:
            raise ValueError(format_error("invalid_target", target=target))

        if use_kiro and not project_path and target != "kiro":
            raise ValueError(format_error("kiro_requires_project"))

        self.target = target
        self.project_path = project_path
        self.use_kiro = use_kiro

        # 使用 get_target_config() 生成配置
        self.config = get_target_config(target, project_path, use_kiro=use_kiro)
        self.target_skills_dir = self.config["skills"]
        self.target_commands_dir = self.config["commands"]

    def get_install_location_info(self) -> str:
        """获取安装位置描述信息

        Returns:
            人类可读的安装位置描述
        """
        if self.project_path:
            # 将 project_path 转换为 Path 对象并解析为绝对路径
            abs_path = Path(self.project_path).resolve()

            try:
                # 尝试获取相对于当前工作目录的相对路径
                rel_path = abs_path.relative_to(Path.cwd())
            except ValueError:
                # 如果无法计算相对路径（例如在不同驱动器），使用绝对路径
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

        Extracts metadata fields: name, description, category, tags, version.
        Handles both inline `tags: [a, b]` and multiline list formats.

        Args:
            skill_path: Path to the skill directory containing SKILL.md

        Returns:
            dict with keys: name, description, category, tags, version
            Missing fields default to None/[]
        """
        result = {
            "name": skill_path.name,  # fallback to directory name
            "description": None,
            "category": None,
            "tags": [],
            "version": None,
        }

        skill_md = skill_path / "SKILL.md"
        if not skill_md.exists():
            return result

        try:
            with open(skill_md, encoding='utf-8') as f:
                content = f.read()
        except OSError:
            return result

        # Check for YAML frontmatter (--- delimited)
        if not content.startswith('---'):
            # Legacy fallback: search for description line
            for line in content.split('\n'):
                if line.startswith("description:"):
                    result["description"] = line.replace("description:", "").strip()
                    break
            return result

        # Parse YAML frontmatter
        parts = content.split('---', 2)
        if len(parts) < 3:
            return result

        frontmatter = parts[1].strip()

        # Simple YAML parsing (avoid external dependency)
        current_key = None
        multiline_value = []
        in_multiline = False

        for line in frontmatter.split('\n'):
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                if in_multiline and current_key == "description":
                    multiline_value.append("")
                continue

            # Check for key: value pattern
            if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
                # Save previous multiline value
                if in_multiline and current_key:
                    if current_key == "description":
                        result["description"] = '\n'.join(multiline_value).strip()
                    in_multiline = False
                    multiline_value = []

                colon_idx = line.index(':')
                key = line[:colon_idx].strip()
                value = line[colon_idx + 1:].strip()

                if key == "name":
                    result["name"] = value if value else skill_path.name
                elif key == "description":
                    if value.startswith('|'):
                        # Multiline description
                        in_multiline = True
                        current_key = "description"
                        multiline_value = []
                    else:
                        result["description"] = value
                elif key == "category":
                    result["category"] = value if value else None
                elif key == "version":
                    result["version"] = value if value else None
                elif key == "tags":
                    # Handle inline array format: tags: [a, b, c]
                    if value.startswith('[') and value.endswith(']'):
                        tags_str = value[1:-1]
                        result["tags"] = [t.strip() for t in tags_str.split(',') if t.strip()]
                    elif value:
                        # Single tag on same line
                        result["tags"] = [value]
                    else:
                        # Multiline tags list
                        in_multiline = True
                        current_key = "tags"
                        multiline_value = []
            elif in_multiline:
                # Handle multiline content
                if line.startswith('  ') or line.startswith('\t'):
                    content_line = line.strip()
                    if current_key == "tags" and content_line.startswith('- '):
                        multiline_value.append(content_line[2:].strip())
                    elif current_key == "description":
                        multiline_value.append(content_line)
                else:
                    # End of multiline
                    if current_key == "description":
                        result["description"] = '\n'.join(multiline_value).strip()
                    elif current_key == "tags":
                        result["tags"] = multiline_value
                    in_multiline = False
                    multiline_value = []

        # Handle trailing multiline value
        if in_multiline and current_key:
            if current_key == "description":
                result["description"] = '\n'.join(multiline_value).strip()
            elif current_key == "tags":
                result["tags"] = multiline_value

        return result

    def get_skill_description(self, skill_path):
        """Get skill description using frontmatter parser."""
        metadata = self.parse_skill_frontmatter(skill_path)
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
            status = f"{Colors.SUCCESS}Installed{Colors.ENDC}" if (self.target_skills_dir / skill.name).exists() else f"{Colors.FAIL}Not installed{Colors.ENDC}"
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
        # 如果是项目模式，验证路径有效性
        if self.project_path:
            valid, error_msg = validate_project_path(self.project_path)
            if not valid:
                log_error(error_msg)
                return False

            # 记录项目路径信息
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
        # 如果是项目模式，验证路径有效性
        if self.project_path:
            valid, error_msg = validate_project_path(self.project_path)
            if not valid:
                log_error(error_msg)
                return

            # 记录项目路径信息
            log_info(f"Installing commands to project: {self.get_install_location_info()}")

        log_info(f"Installing commands for {self.target}...")
        self.ensure_dirs()

        # Determine source directory based on target
        if self.target == "gemini":
            src_cmd_dir = COMMANDS_SRC_DIR / "gemini"
        elif self.target == "qwen":
            # Qwen now uses Markdown format like Claude (as of 2025)
            src_cmd_dir = COMMANDS_SRC_DIR / "qwen"
            if not src_cmd_dir.exists():
                src_cmd_dir = COMMANDS_SRC_DIR / "claude"
        elif self.target == "trae":
            src_cmd_dir = COMMANDS_SRC_DIR / "trae"
            if not src_cmd_dir.exists():
                src_cmd_dir = COMMANDS_SRC_DIR / "claude"
        elif self.target == "antigravity":
            src_cmd_dir = COMMANDS_SRC_DIR / "antigravity"
        elif self.target == "windsurf":
            src_cmd_dir = COMMANDS_SRC_DIR / "windsurf"
        elif self.target == "kiro":
            src_cmd_dir = COMMANDS_SRC_DIR / "kiro"
            if not src_cmd_dir.exists():
                src_cmd_dir = COMMANDS_SRC_DIR / "claude"
        else:
            # Claude and Codex share commands from 'claude' folder
            src_cmd_dir = COMMANDS_SRC_DIR / "claude"

        if not src_cmd_dir.exists():
            log_warn(f"No specific commands found for target {self.target} in {src_cmd_dir}")
            return

        # Copy contents to target_commands_dir with force overwrite
        try:
            # Force overwrite: remove existing directory first
            if self.target_commands_dir.exists():
                log_warn(f"Overwriting existing commands directory: {self.target_commands_dir}")
                shutil.rmtree(self.target_commands_dir)

            # Copy fresh content
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

        if val.lower() == 'all':
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
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
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
        with open(local_md, encoding='utf-8') as f1, open(global_md, encoding='utf-8') as f2:
            diff = difflib.unified_diff(
                f2.readlines(), f1.readlines(),
                fromfile='Global CLAUDE.md', tofile='Local CLAUDE.md'
            )
            for line in diff:
                sys.stdout.write(line)

# --- 公共 CLI 参数定义 ---
ProjectOption = typer.Option(
    None,
    "--project", "-p",
    help="Project path for local installation (relative or absolute)"
)

KiroFlag = typer.Option(
    False,
    "--kiro",
    help="Use Kiro structure (.kiro/skills/ and .kiro/steering/)"
)

# 创建 typer 应用
app = typer.Typer(
    name="skill-installer",
    help="Unified Skills & Config Manager - 命令行交互版本",
    epilog="使用 typer 构建的技能管理工具"
)

@app.command()
def list_skills(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """列出可用的技能"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.list_available()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def installed(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """列出已安装的技能"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.list_installed()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def install(
    skills: list[str] = typer.Argument(..., help="要安装的技能名称"),
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """安装指定的技能"""
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
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """安装所有技能"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        log_info(f"Installing to: {mgr.get_install_location_info()}")
        mgr.install_all()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def install_commands(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """安装命令"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        log_info(f"Installing to: {mgr.get_install_location_info()}")
        mgr.install_commands()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def interactive(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """交互式安装"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.interactive()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def prompt_update(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """更新 CLAUDE.md 提示文件"""
    try:
        mgr = SkillManager(target, project_path=project, use_kiro=kiro)
        mgr.prompt_update()
    except ValueError as e:
        log_error(str(e))
        sys.exit(1)

@app.command()
def prompt_diff(
    target: str = typer.Option("claude", "--target", "-t", help="Target platform (claude, codex, gemini, qwen, antigravity, windsurf, kiro, trae)"),
    project: str | None = ProjectOption,
    kiro: bool = KiroFlag
):
    """比较本地和全局 CLAUDE.md 提示文件"""
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
