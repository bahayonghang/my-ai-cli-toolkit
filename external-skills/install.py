#!/usr/bin/env python3
"""
External Skills Installer - 外部技能安装工具

支持通过 npm/npx/pip/git 安装的外部技能

Usage:
    python install.py list                              # 列出所有外部技能
    python install.py install <skill> --target claude   # 安装并初始化技能
    python install.py init <skill> --target claude      # 仅初始化（已安装的技能）
    python install.py check <skill>                     # 检查依赖
"""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

app = typer.Typer(
    name="external-skills",
    help="外部技能安装工具 - 支持 npm/npx/pip/git 类型的技能",
    add_completion=False,
)
console = Console()

CONFIG_FILE = Path(__file__).parent / "registry.toml"


@dataclass
class ExternalSkill:
    """外部技能定义"""
    name: str
    description: str = ""
    type: str = "npm-cli"  # npm-cli | npx | pip-cli | git
    package: str = ""
    install_command: str = ""
    init_command: str = ""
    init_args: list[str] = field(default_factory=list)
    target_map: dict[str, str] = field(default_factory=dict)
    supported_targets: list[str] = field(default_factory=list)
    requires: list[str] = field(default_factory=list)
    repo: str = ""
    branch: str = "main"
    post_clone: str = ""
    homepage: str = ""
    license: str = ""


def load_registry() -> dict[str, ExternalSkill]:
    """加载技能注册表"""
    if not CONFIG_FILE.exists():
        rprint(f"[red]❌ 配置文件不存在: {CONFIG_FILE}[/red]")
        raise typer.Exit(1)

    with open(CONFIG_FILE, "rb") as f:
        data = tomllib.load(f)

    skills: dict[str, ExternalSkill] = {}
    for name, s_data in data.get("skills", {}).items():
        skills[name] = ExternalSkill(
            name=name,
            description=s_data.get("description", ""),
            type=s_data.get("type", "npm-cli"),
            package=s_data.get("package", ""),
            install_command=s_data.get("install_command", ""),
            init_command=s_data.get("init_command", ""),
            init_args=s_data.get("init_args", []),
            target_map=s_data.get("target_map", {}),
            supported_targets=s_data.get("supported_targets", []),
            requires=s_data.get("requires", []),
            repo=s_data.get("repo", ""),
            branch=s_data.get("branch", "main"),
            post_clone=s_data.get("post_clone", ""),
            homepage=s_data.get("homepage", ""),
            license=s_data.get("license", ""),
        )

    return skills


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
    }

    for req in requires:
        cmd = cmd_map.get(req, req)
        if not check_command_exists(cmd):
            missing.append(req)

    return len(missing) == 0, missing


def run_command(cmd: str, cwd: Optional[Path] = None, dry_run: bool = False) -> bool:
    """执行命令"""
    rprint(f"[cyan]$ {cmd}[/cyan]")

    if dry_run:
        rprint("[yellow](dry-run, 跳过执行)[/yellow]")
        return True

    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            text=True,
        )
        return result.returncode == 0
    except Exception as e:
        rprint(f"[red]执行失败: {e}[/red]")
        return False


def build_init_command(skill: ExternalSkill, target: str) -> str:
    """构建初始化命令"""
    # 映射目标平台
    mapped_target = skill.target_map.get(target, target)

    # 替换参数中的 {target}
    args = [
        arg.replace("{target}", mapped_target)
        for arg in skill.init_args
    ]

    return f"{skill.init_command} {' '.join(args)}"


@app.command("list")
def list_skills():
    """列出所有外部技能"""
    skills = load_registry()

    rprint("\n[bold cyan]📦 External Skills Registry[/bold cyan]\n")

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Name", style="cyan")
    table.add_column("Type", style="green")
    table.add_column("Package")
    table.add_column("Targets")
    table.add_column("Description")

    for skill in skills.values():
        targets_str = ", ".join(skill.supported_targets[:3])
        if len(skill.supported_targets) > 3:
            targets_str += f" (+{len(skill.supported_targets) - 3})"

        table.add_row(
            skill.name,
            skill.type,
            skill.package or skill.repo or "-",
            targets_str,
            skill.description[:50] + "..." if len(skill.description) > 50 else skill.description,
        )

    console.print(table)
    rprint(f"\n[dim]共 {len(skills)} 个外部技能[/dim]")


@app.command("info")
def show_info(
    skill_name: str = typer.Argument(..., help="技能名称"),
):
    """显示技能详细信息"""
    skills = load_registry()

    if skill_name not in skills:
        rprint(f"[red]❌ 未知技能: {skill_name}[/red]")
        raise typer.Exit(1)

    skill = skills[skill_name]

    rprint(f"\n[bold cyan]📦 {skill.name}[/bold cyan]\n")
    rprint(f"[dim]Description:[/dim] {skill.description}")
    rprint(f"[dim]Type:[/dim] {skill.type}")
    rprint(f"[dim]Package:[/dim] {skill.package or skill.repo or '-'}")
    rprint(f"[dim]License:[/dim] {skill.license or '-'}")
    rprint(f"[dim]Homepage:[/dim] {skill.homepage or '-'}")
    rprint(f"[dim]Requires:[/dim] {', '.join(skill.requires) or '-'}")
    rprint(f"[dim]Supported Targets:[/dim] {', '.join(skill.supported_targets)}")

    if skill.install_command:
        rprint(f"\n[dim]Install Command:[/dim]\n  {skill.install_command}")
    if skill.init_command:
        rprint(f"\n[dim]Init Command:[/dim]\n  {skill.init_command} {' '.join(skill.init_args)}")


@app.command("check")
def check_skill(
    skill_name: str = typer.Argument(..., help="技能名称"),
):
    """检查技能依赖"""
    skills = load_registry()

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
        "claude", "--target", "-t",
        help="目标平台 (claude, codex, gemini, windsurf, kiro, etc.)",
    ),
    project_dir: Optional[Path] = typer.Option(
        None, "--project", "-p",
        help="项目目录 (默认: 当前目录)",
    ),
    skip_install: bool = typer.Option(
        False, "--skip-install", "-s",
        help="跳过全局安装，仅执行初始化",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", "-n",
        help="只显示命令，不执行",
    ),
):
    """安装并初始化外部技能"""
    skills = load_registry()

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
    rprint(f"\n[bold cyan]🔍 检查依赖...[/bold cyan]")
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
    rprint(f"[dim]项目目录: {cwd}[/dim]\n")

    # Step 1: 全局安装 (如果需要)
    if not skip_install and skill.install_command:
        rprint("[bold]Step 1: 全局安装[/bold]")
        if not run_command(skill.install_command, dry_run=dry_run):
            rprint("[red]❌ 安装失败[/red]")
            raise typer.Exit(1)
        rprint()

    # Step 2: 初始化
    if skill.init_command:
        rprint("[bold]Step 2: 初始化项目[/bold]")
        init_cmd = build_init_command(skill, target)
        if not run_command(init_cmd, cwd=cwd, dry_run=dry_run):
            rprint("[red]❌ 初始化失败[/red]")
            raise typer.Exit(1)

    rprint(f"\n[green]✓ 技能 {skill.name} 安装完成！[/green]")


@app.command("init")
def init_skill(
    skill_name: str = typer.Argument(..., help="技能名称"),
    target: str = typer.Option(
        "claude", "--target", "-t",
        help="目标平台",
    ),
    project_dir: Optional[Path] = typer.Option(
        None, "--project", "-p",
        help="项目目录 (默认: 当前目录)",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", "-n",
        help="只显示命令，不执行",
    ),
):
    """仅初始化技能（假设已全局安装）"""
    skills = load_registry()

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
    if not run_command(init_cmd, cwd=cwd, dry_run=dry_run):
        rprint("[red]❌ 初始化失败[/red]")
        raise typer.Exit(1)

    rprint(f"\n[green]✓ 初始化完成！[/green]")


if __name__ == "__main__":
    app()
