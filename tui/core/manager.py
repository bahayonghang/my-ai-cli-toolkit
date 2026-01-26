"""
TUI Manager - 封装 SkillManager 的 TUI 专用管理器

提供 TUI 所需的所有业务逻辑接口。
Requirements: 14.3, 6.1, 6.2, 8.1, 8.2, 2.7, 6.6, 13.2, 13.4
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

# 添加项目根目录到 sys.path 以导入 install.py
_PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_PROJECT_ROOT))

from install import (
    SkillManager,
    SKILLS_SRC_DIR,
    COMMANDS_SRC_DIR,
)

from .models import ItemType, InstallStatus, ItemInfo, InstallResult


class SourceDirectoryError(Exception):
    """源目录不存在错误"""
    def __init__(self, directory: Path, message: str = ""):
        self.directory = directory
        self.message = message or f"Source directory not found: {directory}"
        super().__init__(self.message)


class TUIManager:
    """TUI 专用的管理器封装
    
    封装 install.py 的 SkillManager，提供 TUI 所需的接口。
    
    Attributes:
        platform: 目标平台 (claude, codex, gemini)
        project_path: 项目路径（可选）
    """
    
    def __init__(
        self, 
        platform: str,
        project_path: Optional[str] = None
    ):
        """初始化 TUIManager
        
        Args:
            platform: 目标平台名称
            project_path: 项目路径（可选）
        """
        self.platform = platform
        self.project_path = project_path
        self._manager = SkillManager(platform, project_path=project_path)
    
    @property
    def target_skills_dir(self) -> Path:
        """获取目标技能目录"""
        return self._manager.target_skills_dir
    
    @property
    def target_commands_dir(self) -> Path:
        """获取目标命令目录"""
        return self._manager.target_commands_dir
    
    def check_skills_source_exists(self) -> bool:
        """检查技能源目录是否存在
        
        Returns:
            源目录是否存在
        """
        return SKILLS_SRC_DIR.exists()
    
    def check_commands_source_exists(self) -> bool:
        """检查命令源目录是否存在
        
        Returns:
            源目录是否存在
        """
        if self.platform in ["gemini", "qwen"]:
            src_dir = COMMANDS_SRC_DIR / "gemini"
        elif self.platform == "trae":
            src_dir = COMMANDS_SRC_DIR / "trae"
            if not src_dir.exists():
                src_dir = COMMANDS_SRC_DIR / "claude"
        elif self.platform == "antigravity":
            src_dir = COMMANDS_SRC_DIR / "antigravity"
        elif self.platform == "windsurf":
            src_dir = COMMANDS_SRC_DIR / "windsurf"
        elif self.platform == "kiro":
            src_dir = COMMANDS_SRC_DIR / "kiro"
            if not src_dir.exists():
                src_dir = COMMANDS_SRC_DIR / "claude"
        else:
            src_dir = COMMANDS_SRC_DIR / "claude"
        return src_dir.exists()
    
    def get_skills_source_dir(self) -> Path:
        """获取技能源目录路径"""
        return SKILLS_SRC_DIR
    
    def get_commands_source_dir(self) -> Path:
        """获取命令源目录路径"""
        if self.platform in ["gemini", "qwen"]:
            return COMMANDS_SRC_DIR / "gemini"
        elif self.platform == "trae":
            trae_dir = COMMANDS_SRC_DIR / "trae"
            if trae_dir.exists():
                return trae_dir
        elif self.platform == "antigravity":
            return COMMANDS_SRC_DIR / "antigravity"
        elif self.platform == "windsurf":
            return COMMANDS_SRC_DIR / "windsurf"
        elif self.platform == "kiro":
            kiro_dir = COMMANDS_SRC_DIR / "kiro"
            if kiro_dir.exists():
                return kiro_dir
        return COMMANDS_SRC_DIR / "claude"
    
    def _get_file_mtime(self, path: Path) -> Optional[datetime]:
        """获取文件修改时间
        
        Args:
            path: 文件路径
            
        Returns:
            修改时间，如果文件不存在返回 None
        """
        try:
            if path.exists():
                return datetime.fromtimestamp(path.stat().st_mtime)
        except Exception:
            pass
        return None
    
    def _determine_install_status(
        self, 
        target_path: Path,
        source_mtime: Optional[datetime],
        target_mtime: Optional[datetime]
    ) -> InstallStatus:
        """判断安装状态
        
        Args:
            target_path: 目标路径
            source_mtime: 源文件修改时间
            target_mtime: 目标文件修改时间
            
        Returns:
            安装状态
        """
        if not target_path.exists():
            return InstallStatus.NOT_INSTALLED
        
        # 如果无法获取修改时间，默认为已安装
        if source_mtime is None or target_mtime is None:
            return InstallStatus.INSTALLED
        
        # 比较修改时间（源文件更新则标记为过期）
        if source_mtime > target_mtime:
            return InstallStatus.OUTDATED
        
        return InstallStatus.INSTALLED
    
    def get_skills(self) -> list[ItemInfo]:
        """获取所有技能列表

        Returns:
            技能信息列表

        Note:
            如果源目录不存在，返回空列表
        """
        skills = []
        if not SKILLS_SRC_DIR.exists():
            return skills

        for skill_dir in sorted(SKILLS_SRC_DIR.iterdir()):
            if skill_dir.is_dir():
                target_path = self._manager.target_skills_dir / skill_dir.name

                # 获取修改时间
                source_mtime = self._get_file_mtime(skill_dir)
                target_mtime = self._get_file_mtime(target_path)

                # 判断安装状态
                status = self._determine_install_status(
                    target_path, source_mtime, target_mtime
                )

                # Use frontmatter parser for rich metadata
                metadata = SkillManager.parse_skill_frontmatter(skill_dir)

                skills.append(ItemInfo(
                    name=skill_dir.name,
                    item_type=ItemType.SKILL,
                    description=metadata.get("description"),
                    status=status,
                    source_path=skill_dir,
                    target_path=target_path,
                    source_mtime=source_mtime,
                    target_mtime=target_mtime,
                    category=metadata.get("category"),
                    tags=metadata.get("tags", []),
                ))

        return skills

    def get_all_categories(self) -> list[str]:
        """获取所有可用的技能分类

        Returns:
            分类名称列表（去重并排序）
        """
        categories = set()
        for skill in self.get_skills():
            if skill.category:
                categories.add(skill.category)
        return sorted(categories)
    
    def get_commands(self) -> list[ItemInfo]:
        """获取所有命令列表（支持嵌套目录）
        
        根据平台返回对应的命令列表:
        - gemini/qwen: 从 commands/gemini/ 获取
        - antigravity: 从 commands/antigravity/ 获取
        - claude/codex: 从 commands/claude/ 获取
        
        Returns:
            命令信息列表
            
        Note:
            如果源目录不存在，返回空列表
            支持嵌套目录，如 zcf/git-commit.md
        """
        commands = []
        
        # 根据平台确定命令源目录
        if self.platform in ["gemini", "qwen"]:
            src_dir = COMMANDS_SRC_DIR / "gemini"
        elif self.platform == "trae":
            src_dir = COMMANDS_SRC_DIR / "trae"
            if not src_dir.exists():
                src_dir = COMMANDS_SRC_DIR / "claude"
        elif self.platform == "antigravity":
            src_dir = COMMANDS_SRC_DIR / "antigravity"
        elif self.platform == "windsurf":
            src_dir = COMMANDS_SRC_DIR / "windsurf"
        else:
            src_dir = COMMANDS_SRC_DIR / "claude"
        
        if not src_dir.exists():
            return commands
        
        # 递归遍历所有文件
        for cmd_file in sorted(src_dir.rglob("*")):
            if cmd_file.is_file():
                # 计算相对路径作为命令名（不含扩展名）
                rel_path = cmd_file.relative_to(src_dir)
                # 命令名：目录/文件名（不含扩展名）
                cmd_name = str(rel_path.with_suffix("")).replace("\\", "/")
                
                # 目标路径保持相同的目录结构
                target_file = self._manager.target_commands_dir / rel_path
                
                # 获取修改时间
                source_mtime = self._get_file_mtime(cmd_file)
                target_mtime = self._get_file_mtime(target_file)
                
                # 判断安装状态
                status = self._determine_install_status(
                    target_file, source_mtime, target_mtime
                )
                
                commands.append(ItemInfo(
                    name=cmd_name,
                    item_type=ItemType.COMMAND,
                    description=None,
                    status=status,
                    source_path=cmd_file,
                    target_path=target_file,
                    source_mtime=source_mtime,
                    target_mtime=target_mtime,
                ))
        
        return commands
    
    def install_skill(self, name: str) -> InstallResult:
        """安装单个技能
        
        Args:
            name: 技能名称
            
        Returns:
            安装结果
            
        Requirements: 6.1, 6.5, 6.6
        """
        # 检查源目录
        if not SKILLS_SRC_DIR.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Skills directory not found",
                error=f"Source directory does not exist: {SKILLS_SRC_DIR}",
            )
        
        # 检查技能是否存在
        skill_src = SKILLS_SRC_DIR / name
        if not skill_src.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Skill not found: {name}",
                error=f"Skill directory does not exist: {skill_src}",
            )
        
        try:
            success = self._manager.install_skill(name, quiet=True)
            if success:
                return InstallResult(
                    success=True,
                    item_name=name,
                    message=f"Successfully installed {name}",
                )
            else:
                return InstallResult(
                    success=False,
                    item_name=name,
                    message=f"Failed to install {name}",
                    error="Installation returned False",
                )
        except PermissionError as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Permission denied: {name}",
                error=str(e),
            )
        except Exception as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Failed to install {name}",
                error=str(e),
            )
    
    def install_command(self, name: str) -> InstallResult:
        """安装单个命令（支持嵌套目录）
        
        Args:
            name: 命令名称，可以包含路径如 "zcf/git-commit"
            
        Returns:
            安装结果
            
        Requirements: 6.2, 6.5, 6.6
        """
        import shutil
        
        # 根据平台确定命令源目录
        if self.platform in ["gemini", "qwen"]:
            src_dir = COMMANDS_SRC_DIR / "gemini"
        elif self.platform == "trae":
            src_dir = COMMANDS_SRC_DIR / "trae"
            if not src_dir.exists():
                src_dir = COMMANDS_SRC_DIR / "claude"
        elif self.platform == "antigravity":
            src_dir = COMMANDS_SRC_DIR / "antigravity"
        elif self.platform == "windsurf":
            src_dir = COMMANDS_SRC_DIR / "windsurf"
        else:
            src_dir = COMMANDS_SRC_DIR / "claude"
        
        # 检查源目录
        if not src_dir.exists():
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Commands directory not found",
                error=f"Source directory does not exist: {src_dir}",
            )
        
        try:
            # 查找命令文件（支持嵌套路径）
            src_file = None
            # 将命令名转换为路径格式
            name_path = Path(name.replace("/", os.sep))
            
            # 遍历所有文件查找匹配的命令
            for f in src_dir.rglob("*"):
                if f.is_file():
                    rel_path = f.relative_to(src_dir)
                    # 比较不含扩展名的路径
                    if rel_path.with_suffix("") == name_path:
                        src_file = f
                        break
            
            if src_file is None:
                return InstallResult(
                    success=False,
                    item_name=name,
                    message=f"Command not found: {name}",
                    error=f"No file matching '{name}' in {src_dir}",
                )
            
            # 确保目标目录存在
            self._manager.ensure_dirs()
            
            # 计算目标路径（保持目录结构）
            rel_path = src_file.relative_to(src_dir)
            target_file = self._manager.target_commands_dir / rel_path
            
            # 确保目标子目录存在
            target_file.parent.mkdir(parents=True, exist_ok=True)
            
            # 复制文件
            shutil.copy2(src_file, target_file)
            
            return InstallResult(
                success=True,
                item_name=name,
                message=f"Successfully installed {name}",
            )
        except PermissionError as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Permission denied: {name}",
                error=str(e),
            )
        except Exception as e:
            return InstallResult(
                success=False,
                item_name=name,
                message=f"Failed to install {name}",
                error=str(e),
            )
    
    def install_all_skills(
        self, 
        callback: Optional[Callable[[str, bool], None]] = None
    ) -> tuple[int, int, list[str]]:
        """安装所有技能
        
        Args:
            callback: 进度回调函数，接收 (skill_name, success) 参数
            
        Returns:
            (成功数, 失败数, 失败列表)
        """
        success_count = 0
        fail_count = 0
        failures: list[str] = []
        
        skills = self.get_skills()
        for skill in skills:
            result = self.install_skill(skill.name)
            if result.success:
                success_count += 1
            else:
                fail_count += 1
                failures.append(skill.name)
            
            if callback:
                callback(skill.name, result.success)
        
        return success_count, fail_count, failures
    
    def install_all_commands(
        self,
        callback: Optional[Callable[[str, bool], None]] = None
    ) -> tuple[int, int, list[str]]:
        """安装所有命令
        
        Args:
            callback: 进度回调函数，接收 (command_name, success) 参数
            
        Returns:
            (成功数, 失败数, 失败列表)
        """
        success_count = 0
        fail_count = 0
        failures: list[str] = []
        
        commands = self.get_commands()
        for cmd in commands:
            result = self.install_command(cmd.name)
            if result.success:
                success_count += 1
            else:
                fail_count += 1
                failures.append(cmd.name)
            
            if callback:
                callback(cmd.name, result.success)
        
        return success_count, fail_count, failures
