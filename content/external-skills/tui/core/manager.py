"""
External Skills TUI 管理器

封装 install.py 的核心业务逻辑，提供 TUI 所需的接口。

Requirements: 2.1, 4.2, 5.1, 10.1
"""

from __future__ import annotations

import shlex
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore

from .models import (
    DependencyCheckResult,
    DependencyStatus,
    ExternalSkillInfo,
    InstallResult,
)

# 默认配置文件路径
DEFAULT_REGISTRY_PATH = Path(__file__).parent.parent.parent / "registry.toml"


class ExternalSkillManager:
    """外部技能管理器

    封装 install.py 的业务逻辑，提供 TUI 所需的接口。

    Attributes:
        platform: 目标平台 (claude, codex, gemini, kiro, windsurf 等)
        registry_path: 配置文件路径
    """

    def __init__(
        self,
        platform: str,
        registry_path: Path | None = None,
    ) -> None:
        """初始化管理器

        Args:
            platform: 目标平台
            registry_path: 配置文件路径，默认为 registry.toml
        """
        self.platform = platform
        self.registry_path = registry_path or DEFAULT_REGISTRY_PATH
        self._skills_cache: dict[str, ExternalSkillInfo] | None = None

    def get_skills(self) -> list[ExternalSkillInfo]:
        """获取所有技能列表

        从 registry.toml 加载所有技能，并根据当前平台设置 is_supported 标志。

        Returns:
            技能信息列表

        Raises:
            FileNotFoundError: 配置文件不存在
            ValueError: 配置文件格式错误
        """
        skills_dict = self._load_registry()
        return list(skills_dict.values())

    def get_skill_detail(self, skill_name: str) -> ExternalSkillInfo | None:
        """获取技能详情

        Args:
            skill_name: 技能名称

        Returns:
            技能信息，如果不存在返回 None
        """
        skills_dict = self._load_registry()
        return skills_dict.get(skill_name)

    def check_dependencies(self, skill_name: str) -> DependencyCheckResult:
        """检查技能依赖

        Args:
            skill_name: 技能名称

        Returns:
            依赖检查结果

        Raises:
            ValueError: 技能不存在
        """
        skill = self.get_skill_detail(skill_name)
        if skill is None:
            raise ValueError(f"未知技能: {skill_name}")

        return self._check_dependencies_list(skill.requires)

    def install_skill(
        self,
        skill_name: str,
        project_dir: Path | None = None,
        on_output: Callable[[str], None] | None = None,
        skip_install: bool = False,
    ) -> InstallResult:
        """安装技能

        Args:
            skill_name: 技能名称
            project_dir: 项目目录，默认为当前目录
            on_output: 输出回调函数
            skip_install: 是否跳过全局安装

        Returns:
            安装结果
        """
        # 获取技能信息
        skill = self.get_skill_detail(skill_name)
        if skill is None:
            return InstallResult(
                success=False,
                skill_name=skill_name,
                message="安装失败",
                error=f"未知技能: {skill_name}",
            )

        # 检查平台支持
        if not skill.is_supported:
            return InstallResult(
                success=False,
                skill_name=skill_name,
                message="安装失败",
                error=f"技能 {skill_name} 不支持平台 {self.platform}",
            )

        # 检查依赖
        dep_result = self._check_dependencies_list(skill.requires)
        if not dep_result.all_satisfied:
            missing = [d.name for d in dep_result.dependencies if not d.satisfied]
            return InstallResult(
                success=False,
                skill_name=skill_name,
                message="安装失败",
                error=f"缺少依赖: {', '.join(missing)}",
            )

        # 确定项目目录
        cwd = project_dir or Path.cwd()

        # 获取原始技能数据用于安装命令
        raw_skill = self._get_raw_skill_data(skill_name)
        if raw_skill is None:
            return InstallResult(
                success=False,
                skill_name=skill_name,
                message="安装失败",
                error="无法获取技能配置",
            )

        # Step 1: 全局安装 (如果需要)
        install_command = raw_skill.get("install_command", "")
        if not skip_install and install_command:
            if on_output:
                on_output(f"[Step 1] 全局安装: {install_command}")

            success = self._run_command(install_command, on_output=on_output)
            if not success:
                return InstallResult(
                    success=False,
                    skill_name=skill_name,
                    message="安装失败",
                    error="全局安装命令执行失败",
                )

        # Step 2: 初始化
        init_command = raw_skill.get("init_command", "")
        if init_command:
            init_args = raw_skill.get("init_args", [])
            target_map = raw_skill.get("target_map", {})

            # 构建完整的初始化命令
            full_init_cmd = self._build_init_command(init_command, init_args, target_map)

            if on_output:
                on_output(f"[Step 2] 初始化项目: {full_init_cmd}")

            success = self._run_command(full_init_cmd, cwd=cwd, on_output=on_output)
            if not success:
                return InstallResult(
                    success=False,
                    skill_name=skill_name,
                    message="安装失败",
                    error="初始化命令执行失败",
                )

        return InstallResult(
            success=True,
            skill_name=skill_name,
            message=f"技能 {skill_name} 安装完成！",
        )

    def _load_registry(self) -> dict[str, ExternalSkillInfo]:
        """加载技能注册表

        Returns:
            技能名称到技能信息的映射

        Raises:
            FileNotFoundError: 配置文件不存在
            ValueError: 配置文件格式错误
        """
        if self._skills_cache is not None:
            return self._skills_cache

        if not self.registry_path.exists():
            raise FileNotFoundError(f"配置文件不存在: {self.registry_path}")

        try:
            with open(self.registry_path, "rb") as f:
                data = tomllib.load(f)
        except Exception as e:
            raise ValueError(f"配置文件格式错误: {e}") from e

        skills: dict[str, ExternalSkillInfo] = {}

        # 验证 skills 字段是否为字典类型
        skills_data = data.get("skills", {})
        if not isinstance(skills_data, dict):
            raise ValueError("配置文件格式错误: 'skills' 必须是一个表")

        for name, s_data in skills_data.items():
            # 验证每个技能配置是否为字典类型
            if not isinstance(s_data, dict):
                raise ValueError(f"配置文件格式错误: 技能 '{name}' 的配置必须是一个表")

            supported_targets = s_data.get("supported_targets", [])
            is_supported = self._is_platform_supported(supported_targets)

            skills[name] = ExternalSkillInfo(
                name=name,
                description=s_data.get("description", ""),
                skill_type=s_data.get("type", "npm-cli"),
                package=s_data.get("package", "") or s_data.get("repo", ""),
                requires=s_data.get("requires", []),
                supported_targets=supported_targets,
                homepage=s_data.get("homepage", ""),
                license=s_data.get("license", ""),
                is_supported=is_supported,
            )

        self._skills_cache = skills
        return skills

    def _get_raw_skill_data(self, skill_name: str) -> dict | None:
        """获取原始技能配置数据

        Args:
            skill_name: 技能名称

        Returns:
            原始配置字典，如果不存在返回 None
        """
        if not self.registry_path.exists():
            return None

        try:
            with open(self.registry_path, "rb") as f:
                data = tomllib.load(f)
            return data.get("skills", {}).get(skill_name)
        except Exception:
            return None

    def _is_platform_supported(self, supported_targets: list[str]) -> bool:
        """检查当前平台是否被支持

        Args:
            supported_targets: 支持的平台列表

        Returns:
            是否支持当前平台
        """
        if "all" in supported_targets:
            return True
        return self.platform in supported_targets

    def _check_dependencies_list(self, requires: list[str]) -> DependencyCheckResult:
        """检查依赖列表

        Args:
            requires: 依赖列表

        Returns:
            依赖检查结果
        """
        dependencies: list[DependencyStatus] = []
        all_satisfied = True

        for req in requires:
            satisfied = self._check_command_exists(req)
            dependencies.append(DependencyStatus(name=req, satisfied=satisfied))
            if not satisfied:
                all_satisfied = False

        return DependencyCheckResult(
            all_satisfied=all_satisfied,
            dependencies=dependencies,
        )

    def _check_command_exists(self, cmd: str) -> bool:
        """检查命令是否存在

        Args:
            cmd: 命令名称

        Returns:
            命令是否存在
        """
        # 命令映射
        cmd_map = {
            "node": "node",
            "npm": "npm",
            "npx": "npx",
            "python3": "python3" if sys.platform != "win32" else "python",
            "python": "python",
            "pip": "pip",
            "git": "git",
        }

        actual_cmd = cmd_map.get(cmd, cmd)

        try:
            if sys.platform == "win32":
                result = subprocess.run(
                    ["where", actual_cmd],
                    capture_output=True,
                    text=True,
                )
            else:
                result = subprocess.run(
                    ["which", actual_cmd],
                    capture_output=True,
                    text=True,
                )
            return result.returncode == 0
        except Exception:
            return False

    def _run_command(
        self,
        cmd: str,
        cwd: Path | None = None,
        on_output: Callable[[str], None] | None = None,
    ) -> bool:
        """Execute command safely without shell injection.

        Parses string commands with shlex and uses shell=False.

        Args:
            cmd: Command string
            cwd: Working directory
            on_output: Output callback function

        Returns:
            Whether command executed successfully
        """
        if on_output:
            on_output(f"$ {cmd}")

        try:
            posix = sys.platform != "win32"
            cmd_list = shlex.split(cmd, posix=posix)

            result = subprocess.run(
                cmd_list,
                shell=False,
                cwd=cwd,
                capture_output=True,
                text=True,
            )

            if on_output:
                if result.stdout:
                    on_output(result.stdout)
                if result.stderr:
                    on_output(result.stderr)

            return result.returncode == 0
        except Exception as e:
            if on_output:
                on_output(f"执行失败: {e}")
            return False

    def _build_init_command(
        self,
        init_command: str,
        init_args: list[str],
        target_map: dict[str, str],
    ) -> str:
        """构建初始化命令

        Args:
            init_command: 初始化命令
            init_args: 初始化参数
            target_map: 目标平台映射

        Returns:
            完整的初始化命令字符串
        """
        # 映射目标平台
        mapped_target = target_map.get(self.platform, self.platform)

        # 替换参数中的 {target}
        args = [arg.replace("{target}", mapped_target) for arg in init_args]

        return f"{init_command} {' '.join(args)}".strip()

    def clear_cache(self) -> None:
        """清除技能缓存

        用于在配置文件更新后重新加载。
        """
        self._skills_cache = None
