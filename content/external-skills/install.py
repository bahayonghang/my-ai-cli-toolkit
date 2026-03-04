#!/usr/bin/env python3
"""
External Skills Installer - 外部技能安装工具

支持通过 npm/npx/pip/git/vercel 安装的外部技能

Usage:
    python install.py list                              # 列出所有外部技能
    python install.py agents                            # 列出检测到的 AI agents
    python install.py install <skill> --target claude   # 安装并初始化技能
    python install.py init <skill> --target claude      # 仅初始化（已安装的技能）
    python install.py check <skill>                     # 检查依赖
    python install.py info <skill>                      # 显示技能详情
"""

from __future__ import annotations

import os
import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore

import typer
from rich import print as rprint
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

app = typer.Typer(
    name="external-skills",
    help="外部技能安装工具 - 支持 npm/npx/pip/git/vercel 类型的技能",
    add_completion=False,
)
console = Console()

CONFIG_FILE = Path(__file__).parent / "registry.toml"
UNIVERSAL_SHARED_SKILLS_AGENTS = {
    "amp",
    "cline",
    "codex",
    "cursor",
    "gemini",
    "copilot",
    "kimi",
    "opencode",
}

# ASCII Art Banner
BANNER = r"""
███████╗██╗  ██╗████████╗███████╗██████╗ ███╗   ██╗ █████╗ ██╗
██╔════╝╚██╗██╔╝╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔══██╗██║
█████╗   ╚███╔╝    ██║   █████╗  ██████╔╝██╔██╗ ██║███████║██║
██╔══╝   ██╔██╗    ██║   ██╔══╝  ██╔══██╗██║╚██╗██║██╔══██║██║
███████╗██╔╝ ██╗   ██║   ███████╗██║  ██║██║ ╚████║██║  ██║███████╗
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝
"""


@dataclass
class RegistryConfig:
    """注册表全局配置"""

    default_install_method: str = "symlink"
    default_scope: str = "global"
    auto_detect_agents: bool = True
    known_agents: list[str] = field(default_factory=list)


@dataclass
class ExternalSkill:
    """外部技能定义"""

    name: str
    description: str = ""
    type: str = "npm-cli"  # npm-cli | npx | pip-cli | git | vercel
    package: str = ""
    repo: str = ""
    skill_name: str = ""  # Vercel 类型的技能名
    install_method: str = "symlink"  # symlink | copy
    scope: str = "global"  # global | project
    install_command: str = ""
    init_command: str = ""
    init_args: list[str] = field(default_factory=list)
    target_map: dict[str, str] = field(default_factory=dict)
    supported_targets: list[str] = field(default_factory=list)
    requires: list[str] = field(default_factory=list)
    branch: str = "main"
    dest: str = ""
    post_clone: str = ""
    homepage: str = ""
    license: str = ""
    recommended: bool = False


def load_registry() -> tuple[RegistryConfig, dict[str, ExternalSkill]]:
    """加载技能注册表"""
    if not CONFIG_FILE.exists():
        rprint(f"[red]❌ 配置文件不存在: {CONFIG_FILE}[/red]")
        raise typer.Exit(1)

    with open(CONFIG_FILE, "rb") as f:
        data = tomllib.load(f)

    # 加载全局配置
    config_data = data.get("config", {})
    config = RegistryConfig(
        default_install_method=config_data.get("default_install_method", "symlink"),
        default_scope=config_data.get("default_scope", "global"),
        auto_detect_agents=config_data.get("auto_detect_agents", True),
        known_agents=config_data.get("known_agents", []),
    )

    # 加载技能
    skills: dict[str, ExternalSkill] = {}
    for name, s_data in data.get("skills", {}).items():
        skills[name] = ExternalSkill(
            name=name,
            description=s_data.get("description", ""),
            type=s_data.get("type", "npm-cli"),
            package=s_data.get("package", ""),
            repo=s_data.get("repo", ""),
            skill_name=s_data.get("skill_name", ""),
            install_method=s_data.get("install_method", config.default_install_method),
            scope=s_data.get("scope", config.default_scope),
            install_command=s_data.get("install_command", ""),
            init_command=s_data.get("init_command", ""),
            init_args=s_data.get("init_args", []),
            target_map=s_data.get("target_map", {}),
            supported_targets=s_data.get("supported_targets", []),
            requires=s_data.get("requires", []),
            branch=s_data.get("branch", "main"),
            dest=s_data.get("dest", ""),
            post_clone=s_data.get("post_clone", ""),
            homepage=s_data.get("homepage", ""),
            license=s_data.get("license", ""),
            recommended=s_data.get("recommended", False),
        )

    return config, skills


def get_home_dir() -> Path:
    """获取用户主目录"""
    return Path.home()


def get_agent_base_dir(agent: str) -> Path:
    """获取 agent 根目录（用于检测和路径展示）"""
    home = get_home_dir()
    if agent == "opencode":
        return home / ".config" / "opencode"
    if agent == "antigravity":
        return home / ".gemini" / "antigravity"
    if agent == "windsurf":
        return home / ".codeium" / "windsurf"
    if agent == "gemini":
        return home / ".agents"
    return home / f".{agent}"


def detect_installed_agents(config: RegistryConfig) -> list[str]:
    """检测已安装的 AI agent 平台"""
    detected: list[str] = []

    for agent in config.known_agents:
        agent_dir = get_agent_base_dir(agent)
        if agent_dir.exists():
            detected.append(agent)

    return detected


def get_agent_skills_dir(agent: str, scope: str = "global") -> Path:
    """获取 agent 的 skills 目录"""
    if scope == "global":
        if agent in UNIVERSAL_SHARED_SKILLS_AGENTS:
            return get_home_dir() / ".agents" / "skills"
        return get_agent_base_dir(agent) / "skills"
    else:
        return Path.cwd() / f".{agent}" / "skills"


def count_installed_skills(skills_dir: Path) -> int:
    """统计技能数量（目录下包含 SKILL.md 的子目录）"""
    if not skills_dir.exists():
        return 0

    count = 0
    for child in skills_dir.iterdir():
        if child.is_dir() and (child / "SKILL.md").exists():
            count += 1
    return count


def check_command_exists(cmd: str) -> bool:
    """检查命令是否存在"""
    try:
        if sys.platform == "win32":
            result = subprocess.run(
                ["where", cmd],
                capture_output=True,
                text=True,
            )
        else:
            result = subprocess.run(
                ["which", cmd],
                capture_output=True,
                text=True,
            )
        return result.returncode == 0
    except Exception:
        return False


def check_dependencies(requires: list[str]) -> tuple[bool, list[str]]:
    """检查依赖是否满足"""
    missing: list[str] = []
    cmd_map = {
        "node": "node",
        "npm": "npm",
        "npx": "npx",
        "python3": "python3" if sys.platform != "win32" else "python",
        "python": "python",
        "pip": "pip",
        "git": "git",
        "claude": "claude",
    }

    for req in requires:
        cmd = cmd_map.get(req, req)
        if not check_command_exists(cmd):
            missing.append(req)

    return len(missing) == 0, missing


def _parse_command(cmd: str) -> list[str]:
    """Parse a command string into argument list safely.

    Args:
        cmd: Command string

    Returns:
        List of arguments
    """
    posix = sys.platform != "win32"
    return shlex.split(cmd, posix=posix)


def run_command(
    cmd: str | list[str],
    cwd: Path | None = None,
    dry_run: bool = False,
    capture: bool = False,
) -> tuple[bool, str]:
    """Execute command safely without shell injection.

    Always uses shell=False by parsing string commands with shlex.
    """
    if isinstance(cmd, list):
        cmd_list = cmd
    else:
        cmd_list = _parse_command(cmd)

    cmd_str = subprocess.list2cmdline(cmd_list)
    rprint(f"[cyan]$ {cmd_str}[/cyan]")

    if dry_run:
        rprint("[yellow](dry-run, 跳过执行)[/yellow]")
        return True, ""

    try:
        if capture:
            result = subprocess.run(
                cmd_list,
                shell=False,
                cwd=cwd,
                text=True,
                capture_output=True,
            )
            return result.returncode == 0, result.stdout
        else:
            result = subprocess.run(
                cmd_list,
                shell=False,
                cwd=cwd,
                text=True,
            )
            return result.returncode == 0, ""
    except Exception as e:
        rprint(f"[red]执行失败: {e}[/red]")
        return False, ""


def cmd_from_args(args: list[str]) -> str:
    """从参数列表构建命令字符串"""
    return subprocess.list2cmdline(args)


def build_init_command(skill: ExternalSkill, target: str) -> str:
    """构建初始化命令"""
    # 映射目标平台
    mapped_target = skill.target_map.get(target, target)

    # 替换参数中的 {target}
    args = [arg.replace("{target}", mapped_target) for arg in skill.init_args]

    return f"{skill.init_command} {' '.join(args)}"


def is_git_repo(path: Path) -> bool:
    """检查路径是否为 git 仓库"""
    return (path / ".git").exists()


def create_symlink(source: Path, target: Path) -> bool:
    """创建符号链接"""
    try:
        if target.exists() or target.is_symlink():
            target.unlink()

        target.parent.mkdir(parents=True, exist_ok=True)

        if sys.platform == "win32":
            # Windows 需要管理员权限或开发者模式
            import ctypes

            if ctypes.windll.shell32.IsUserAnAdmin():
                target.symlink_to(source, target_is_directory=source.is_dir())
            else:
                # 降级为复制
                rprint("[yellow]⚠️  Windows 需要管理员权限创建符号链接，降级为复制模式[/yellow]")
                if source.is_dir():
                    shutil.copytree(source, target, dirs_exist_ok=True)
                else:
                    shutil.copy2(source, target)
        else:
            target.symlink_to(source)

        return True
    except Exception as e:
        rprint(f"[red]创建符号链接失败: {e}[/red]")
        return False


def show_banner():
    """显示 Banner"""
    console.print(BANNER, style="bold cyan")
    console.print("External Skills Installer", style="bold", justify="center")
    console.print("", justify="center")


@app.command("list")
def list_skills(
    show_banner_flag: bool = typer.Option(True, "--banner/--no-banner", help="是否显示 Banner"),
):
    """列出所有外部技能"""
    config, skills = load_registry()

    if show_banner_flag:
        show_banner()
    else:
        rprint("\n[bold cyan]📦 External Skills Registry[/bold cyan]\n")

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Name", style="cyan")
    table.add_column("Type", style="green")
    table.add_column("Method", style="yellow")
    table.add_column("Scope")
    table.add_column("Targets")
    table.add_column("Description")

    for skill in skills.values():
        method_icon = "🔗" if skill.install_method == "symlink" else "📋"
        scope_icon = "🌍" if skill.scope == "global" else "📁"
        targets_str = ", ".join(skill.supported_targets[:3])
        if len(skill.supported_targets) > 3:
            targets_str += f" (+{len(skill.supported_targets) - 3})"

        table.add_row(
            f"{'⭐ ' if skill.recommended else ''}{skill.name}",
            skill.type,
            f"{method_icon} {skill.install_method}",
            f"{scope_icon} {skill.scope}",
            targets_str,
            skill.description[:40] + "..." if len(skill.description) > 40 else skill.description,
        )

    console.print(table)
    rprint(f"\n[dim]共 {len(skills)} 个外部技能[/dim]")
    rprint("[dim]⭐ = 推荐安装[/dim]")


@app.command("agents")
def list_agents():
    """列出检测到的 AI agent 平台"""
    config, _ = load_registry()
    detected = detect_installed_agents(config)

    rprint(f"\n[bold cyan]🤖 检测到 {len(detected)} 个已安装的 AI Agent:[/bold cyan]\n")

    tree = Tree("AI Agents")
    universal_agents = sorted([a for a in detected if a in UNIVERSAL_SHARED_SKILLS_AGENTS])
    standalone_agents = sorted([a for a in detected if a not in UNIVERSAL_SHARED_SKILLS_AGENTS])

    if universal_agents:
        shared_dir = get_home_dir() / ".agents" / "skills"
        shared_count = count_installed_skills(shared_dir)
        group = tree.add(
            f"[bold magenta]Universal[/bold magenta] - {shared_count} skills @ {shared_dir}"
        )
        for agent in universal_agents:
            group.add(f"[cyan]{agent}[/cyan] - uses shared skills directory")

    for agent in standalone_agents:
        skills_dir = get_agent_skills_dir(agent)
        skill_count = count_installed_skills(skills_dir)
        tree.add(f"[cyan]{agent}[/cyan] - {skill_count} skills installed @ {skills_dir}")

    if not detected:
        rprint("[yellow]未检测到任何已安装的 AI agent[/yellow]")
        rprint(f"[dim]支持检测的 agents: {', '.join(config.known_agents[:10])}...[/dim]")
    else:
        console.print(tree)


@app.command("info")
def show_info(
    skill_name: str = typer.Argument(..., help="技能名称"),
):
    """显示技能详细信息"""
    _, skills = load_registry()

    if skill_name not in skills:
        rprint(f"[red]❌ 未知技能: {skill_name}[/red]")
        raise typer.Exit(1)

    skill = skills[skill_name]

    panel_content = f"""
[dim]Description:[/dim] {skill.description}
[dim]Type:[/dim] {skill.type}
[dim]Install Method:[/dim] {"🔗 " if skill.install_method == "symlink" else "📋 "}{skill.install_method}
[dim]Scope:[/dim] {"🌍 " if skill.scope == "global" else "📁 "}{skill.scope}
[dim]Package:[/dim] {skill.package or skill.repo or "-"}
[dim]License:[/dim] {skill.license or "-"}
[dim]Homepage:[/dim] {skill.homepage or "-"}
[dim]Requires:[/dim] {", ".join(skill.requires) or "-"}
[dim]Supported Targets:[/dim] {", ".join(skill.supported_targets[:8])}{"..." if len(skill.supported_targets) > 8 else ""}
"""

    if skill.install_command:
        panel_content += f"\n[dim]Install Command:[/dim]\n  {skill.install_command}"
    if skill.init_command:
        panel_content += f"\n[dim]Init Command:[/dim]\n  {skill.init_command} {' '.join(skill.init_args)}"

    console.print(Panel(panel_content, title=f"📦 {skill.name}", border_style="cyan"))


@app.command("check")
def check_skill(
    skill_name: str = typer.Argument(..., help="技能名称"),
):
    """检查技能依赖"""
    _, skills = load_registry()

    if skill_name not in skills:
        rprint(f"[red]❌ 未知技能: {skill_name}[/red]")
        raise typer.Exit(1)

    skill = skills[skill_name]

    rprint(f"\n[bold cyan]🔍 检查依赖: {skill.name}[/bold cyan]\n")

    ok, missing = check_dependencies(skill.requires)

    for req in skill.requires:
        if req in missing:
            rprint(f"  [red]✗[/red] {req}")
        else:
            rprint(f"  [green]✓[/green] {req}")

    if ok:
        rprint("\n[green]✓ 所有依赖已满足[/green]")
    else:
        rprint(f"\n[red]✗ 缺少依赖: {', '.join(missing)}[/red]")
        raise typer.Exit(1)


@app.command("install")
def install_skill(
    skill_name: str = typer.Argument(..., help="技能名称"),
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="目标平台 (claude, codex, gemini, windsurf, kiro, etc.)",
    ),
    project_dir: Path | None = typer.Option(
        None,
        "--project",
        "-p",
        help="项目目录 (默认: 当前目录)",
    ),
    skip_install: bool = typer.Option(
        False,
        "--skip-install",
        "-s",
        help="跳过全局安装，仅执行初始化",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        "-n",
        help="只显示命令，不执行",
    ),
):
    """安装并初始化外部技能"""
    _, skills = load_registry()

    if skill_name not in skills:
        rprint(f"[red]❌ 未知技能: {skill_name}[/red]")
        raise typer.Exit(1)

    skill = skills[skill_name]

    # 检查目标平台
    if target not in skill.supported_targets and "all" not in skill.supported_targets:
        rprint(f"[red]❌ 不支持的目标平台: {target}[/red]")
        rprint(f"[dim]支持的平台: {', '.join(skill.supported_targets)}[/dim]")
        raise typer.Exit(1)

    # 检查依赖
    rprint("\n[bold cyan]🔍 检查依赖...[/bold cyan]")
    ok, missing = check_dependencies(skill.requires)
    if not ok:
        rprint(f"[red]❌ 缺少依赖: {', '.join(missing)}[/red]")
        rprint("[dim]请先安装缺少的依赖[/dim]")
        raise typer.Exit(1)
    rprint("[green]✓ 依赖检查通过[/green]")

    # 确定项目目录
    cwd = project_dir or Path.cwd()

    rprint(f"\n[bold cyan]📦 安装技能: {skill.name}[/bold cyan]")
    rprint(f"[dim]目标平台: {target}[/dim]")
    rprint(f"[dim]项目目录: {cwd}[/dim]")
    rprint(f"[dim]安装方式: {'🔗 ' if skill.install_method == 'symlink' else '📋 '}{skill.install_method}[/dim]\n")

    # Vercel Skills 类型处理
    if skill.type == "vercel":
        rprint("[bold]Step 1: 使用 npx skills 安装[/bold]")
        install_cmd = f"npx skills add {skill.skill_name or skill.name}"
        success, _ = run_command(install_cmd, cwd=cwd, dry_run=dry_run)
        if not success:
            rprint("[red]❌ Vercel Skills 安装失败[/red]")
            raise typer.Exit(1)
        rprint(f"\n[green]✓ 技能 {skill.name} 安装完成！[/green]")
        return

    # Git 类型处理
    if skill.type == "git":
        if not skill.repo:
            rprint(f"[red]❌ git 类型技能缺少 repo 字段: {skill.name}[/red]")
            raise typer.Exit(1)

        dest_value = skill.dest or os.path.join(".claude", "plugins", skill.name)
        dest = cwd / dest_value
        # Validate against path traversal
        resolved_dest = dest.resolve()
        if not resolved_dest.is_relative_to(cwd.resolve()):
            rprint(f"[red]❌ Path traversal detected in dest: {dest_value}[/red]")
            raise typer.Exit(1)
        dest_parent = dest.parent
        if not dest_parent.exists() and not dry_run:
            dest_parent.mkdir(parents=True, exist_ok=True)

        rprint("[bold]Step 1: 拉取/克隆仓库[/bold]")
        if dest.exists():
            if not is_git_repo(dest):
                rprint(f"[red]❌ 目标目录已存在但不是 git 仓库: {dest}[/red]")
                raise typer.Exit(1)

            pull_cmd = cmd_from_args(["git", "-C", str(dest), "pull", "origin", skill.branch])
            success, _ = run_command(pull_cmd, dry_run=dry_run)
            if not success:
                rprint("[red]❌ 更新失败[/red]")
                raise typer.Exit(1)
        else:
            clone_cmd = cmd_from_args(["git", "clone", "--branch", skill.branch, skill.repo, str(dest)])
            success, _ = run_command(clone_cmd, dry_run=dry_run)
            if not success:
                rprint("[red]❌ 克隆失败[/red]")
                raise typer.Exit(1)

        if skill.post_clone:
            rprint("\n[bold]Step 2: 克隆后处理[/bold]")
            success, _ = run_command(skill.post_clone, cwd=dest, dry_run=dry_run)
            if not success:
                rprint("[red]❌ 克隆后处理失败[/red]")
                raise typer.Exit(1)

        if skill.init_command:
            rprint("\n[bold]Step 3: 初始化项目[/bold]")
            init_cmd = build_init_command(skill, target)
            success, _ = run_command(init_cmd, cwd=cwd, dry_run=dry_run)
            if not success:
                rprint("[red]❌ 初始化失败[/red]")
                raise typer.Exit(1)

        rprint(f"\n[green]✓ 技能 {skill.name} 安装完成！[/green]")
        return

    # npm-cli / npx / pip-cli 类型处理
    # Step 1: 全局安装 (如果需要)
    if not skip_install and skill.install_command:
        rprint("[bold]Step 1: 全局安装[/bold]")
        success, _ = run_command(skill.install_command, dry_run=dry_run)
        if not success:
            rprint("[red]❌ 安装失败[/red]")
            raise typer.Exit(1)
        rprint()

    # Step 2: 初始化
    if skill.init_command:
        rprint("[bold]Step 2: 初始化项目[/bold]")
        init_cmd = build_init_command(skill, target)
        success, _ = run_command(init_cmd, cwd=cwd, dry_run=dry_run)
        if not success:
            rprint("[red]❌ 初始化失败[/red]")
            raise typer.Exit(1)

    rprint(f"\n[green]✓ 技能 {skill.name} 安装完成！[/green]")


@app.command("init")
def init_skill(
    skill_name: str = typer.Argument(..., help="技能名称"),
    target: str = typer.Option(
        "claude",
        "--target",
        "-t",
        help="目标平台",
    ),
    project_dir: Path | None = typer.Option(
        None,
        "--project",
        "-p",
        help="项目目录 (默认: 当前目录)",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        "-n",
        help="只显示命令，不执行",
    ),
):
    """仅初始化技能（假设已全局安装）"""
    _, skills = load_registry()

    if skill_name not in skills:
        rprint(f"[red]❌ 未知技能: {skill_name}[/red]")
        raise typer.Exit(1)

    skill = skills[skill_name]
    cwd = project_dir or Path.cwd()

    if not skill.init_command:
        rprint(f"[yellow]⚠️ 技能 {skill_name} 没有初始化命令[/yellow]")
        raise typer.Exit(1)

    rprint(f"\n[bold cyan]🚀 初始化技能: {skill.name}[/bold cyan]")
    rprint(f"[dim]目标平台: {target}[/dim]")
    rprint(f"[dim]项目目录: {cwd}[/dim]\n")

    init_cmd = build_init_command(skill, target)
    success, _ = run_command(init_cmd, cwd=cwd, dry_run=dry_run)
    if not success:
        rprint("[red]❌ 初始化失败[/red]")
        raise typer.Exit(1)

    rprint("\n[green]✓ 初始化完成！[/green]")


if __name__ == "__main__":
    app()
