"""
External Skills TUI 数据模型

定义 TUI 使用的核心数据结构。

Requirements: 2.2, 3.2
"""

from dataclasses import dataclass, field


@dataclass
class ExternalSkillInfo:
    """外部技能信息

    存储从 registry.toml 加载的技能元数据。

    Attributes:
        name: 技能名称
        description: 技能描述
        skill_type: 类型 (npm-cli | npx | pip-cli | git)
        package: 包名或仓库地址
        requires: 依赖列表
        supported_targets: 支持的平台列表
        homepage: 主页链接
        license: 许可证
        is_supported: 是否支持当前平台
    """

    name: str
    description: str
    skill_type: str  # skills_cli
    package: str
    requires: list[str] = field(default_factory=list)
    supported_targets: list[str] = field(default_factory=list)
    homepage: str = ""
    license: str = ""
    is_supported: bool = True
    group: str = ""
    category: str = ""
    provider: str = ""
    tags: list[str] = field(default_factory=list)


@dataclass
class DependencyStatus:
    """单个依赖状态

    表示单个依赖的检查结果。

    Attributes:
        name: 依赖名称 (如 node, npm, python3, git)
        satisfied: 是否满足
    """

    name: str
    satisfied: bool


@dataclass
class DependencyCheckResult:
    """依赖检查结果

    表示技能所有依赖的检查结果。

    Attributes:
        all_satisfied: 是否所有依赖都满足
        dependencies: 各依赖的状态列表
    """

    all_satisfied: bool
    dependencies: list[DependencyStatus] = field(default_factory=list)


@dataclass
class InstallResult:
    """安装结果

    表示技能安装操作的结果。

    Attributes:
        success: 是否成功
        skill_name: 技能名称
        message: 结果消息
        error: 错误信息 (失败时)
    """

    success: bool
    skill_name: str
    message: str
    error: str | None = None
