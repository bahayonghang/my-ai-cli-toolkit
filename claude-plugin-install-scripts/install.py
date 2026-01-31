#!/usr/bin/env python3
"""
Claude Code Plugin Installer - 跨平台通用插件安装工具

Usage:
    python install.py list                      # 列出所有插件
    python install.py install --all             # 安装所有插件
    python install.py install plugin1 plugin2   # 安装指定插件
    python install.py install --category python # 按分类安装
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # Python < 3.11

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

app = typer.Typer(
    name="claude-plugin-installer",
    help="Claude Code 插件安装工具",
    add_completion=False,
)
console = Console()

# 配置文件路径
CONFIG_FILE = Path(__file__).parent / "plugins.toml"


@dataclass
class Marketplace:
    """插件市场"""
    name: str
    repo: str
    description: str = ""


@dataclass
class Plugin:
    """插件定义"""
    name: str
    marketplace: str
    description: str = ""
    category: str = "other"


@dataclass
class PluginConfig:
    """插件配置"""
    marketplaces: dict[str, Marketplace] = field(default_factory=dict)
    plugins: dict[str, Plugin] = field(default_factory=dict)


def load_config() -> PluginConfig:
    """加载 TOML 配置文件"""
    if not CONFIG_FILE.exists():
        rprint(f"[red]❌ 配置文件不存在: {CONFIG_FILE}[/red]")
        raise typer.Exit(1)

    with open(CONFIG_FILE, "rb") as f:
        data = tomllib.load(f)

    config = PluginConfig()

    # 解析 marketplaces
    for name, mp_data in data.get("marketplaces", {}).items():
        config.marketplaces[name] = Marketplace(
            name=name,
            repo=mp_data.get("repo", ""),
            description=mp_data.get("description", ""),
        )

    # 解析 plugins
    for name, p_data in data.get("plugins", {}).items():
        config.plugins[name] = Plugin(
            name=name,
            marketplace=p_data.get("marketplace", ""),
            description=p_data.get("description", ""),
            category=p_data.get("category", "other"),
        )

    return config


def get_install_commands(
    config: PluginConfig,
    plugin_names: list[str],
) -> tuple[list[str], list[str]]:
    """
    生成安装命令

    Returns:
        (marketplace_commands, plugin_commands)
    """
    mp_cmds: list[str] = []
    plugin_cmds: list[str] = []
    added_mps: set[str] = set()

    for p_name in plugin_names:
        plugin = config.plugins.get(p_name)
        if not plugin:
            rprint(f"[yellow]⚠️ 未知插件: {p_name}[/yellow]")
            continue

        # 添加 marketplace (如果还没添加)
        mp_name = plugin.marketplace
        if mp_name and mp_name not in added_mps:
            mp = config.marketplaces.get(mp_name)
            if mp:
                mp_cmds.append(f"/plugin marketplace add {mp.repo}")
                added_mps.add(mp_name)

        # 添加插件安装命令
        if mp_name:
            plugin_cmds.append(f"/plugin install {plugin.name}@{mp_name}")
        else:
            plugin_cmds.append(f"/plugin install {plugin.name}")

    return mp_cmds, plugin_cmds


@app.command("list")
def list_plugins(
    category: str | None = typer.Option(
        None, "--category", "-c", help="按分类筛选"
    ),
):
    """列出所有可用插件"""
    config = load_config()

    # Marketplaces 表格
    rprint("\n[bold cyan]📦 Marketplaces[/bold cyan]")
    mp_table = Table(show_header=True, header_style="bold magenta")
    mp_table.add_column("Name", style="cyan")
    mp_table.add_column("Repository")
    mp_table.add_column("Description")

    for mp in config.marketplaces.values():
        mp_table.add_row(mp.name, mp.repo, mp.description)

    console.print(mp_table)

    # Plugins 表格
    rprint("\n[bold cyan]🔌 Plugins[/bold cyan]")
    p_table = Table(show_header=True, header_style="bold magenta")
    p_table.add_column("Name", style="cyan")
    p_table.add_column("Category", style="green")
    p_table.add_column("Marketplace")
    p_table.add_column("Description")

    for plugin in config.plugins.values():
        if category and plugin.category != category:
            continue
        p_table.add_row(
            plugin.name,
            plugin.category,
            plugin.marketplace,
            plugin.description,
        )

    console.print(p_table)

    # 分类统计
    categories = {p.category for p in config.plugins.values()}
    rprint(f"\n[dim]分类: {', '.join(sorted(categories))}[/dim]")
    rprint(f"[dim]共 {len(config.plugins)} 个插件[/dim]")


@app.command("install")
def install_plugins(
    plugins: list[str] = typer.Argument(
        None, help="要安装的插件名称"
    ),
    all_plugins: bool = typer.Option(
        False, "--all", "-a", help="安装所有插件"
    ),
    category: str | None = typer.Option(
        None, "--category", "-c", help="按分类安装"
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", "-n", help="只显示命令，不执行"
    ),
):
    """安装插件"""
    config = load_config()

    # 确定要安装的插件列表
    target_plugins: list[str] = []

    if all_plugins:
        target_plugins = list(config.plugins.keys())
    elif category:
        target_plugins = [
            p.name for p in config.plugins.values()
            if p.category == category
        ]
    elif plugins:
        target_plugins = list(plugins)
    else:
        rprint("[yellow]请指定插件名称，或使用 --all / --category[/yellow]")
        raise typer.Exit(1)

    if not target_plugins:
        rprint("[yellow]没有找到匹配的插件[/yellow]")
        raise typer.Exit(1)

    # 生成命令
    mp_cmds, plugin_cmds = get_install_commands(config, target_plugins)

    # 输出
    rprint("\n[bold green]🚀 Claude Code 插件安装命令[/bold green]")
    rprint("[dim]请在 Claude Code 中依次执行以下命令:[/dim]\n")

    if mp_cmds:
        rprint("[bold cyan]# Step 1: 添加 Marketplace[/bold cyan]")
        for cmd in mp_cmds:
            rprint(f"  [white]{cmd}[/white]")
        rprint()

    if plugin_cmds:
        rprint("[bold cyan]# Step 2: 安装插件[/bold cyan]")
        for cmd in plugin_cmds:
            rprint(f"  [white]{cmd}[/white]")

    rprint(f"\n[dim]共 {len(plugin_cmds)} 个插件[/dim]")

    if dry_run:
        rprint("\n[yellow](dry-run 模式，未执行任何操作)[/yellow]")


@app.command("categories")
def list_categories():
    """列出所有分类"""
    config = load_config()

    categories: dict[str, list[str]] = {}
    for plugin in config.plugins.values():
        if plugin.category not in categories:
            categories[plugin.category] = []
        categories[plugin.category].append(plugin.name)

    rprint("\n[bold cyan]📂 插件分类[/bold cyan]\n")
    for cat, plugins in sorted(categories.items()):
        rprint(f"[green]{cat}[/green] ({len(plugins)})")
        for p in plugins:
            rprint(f"  • {p}")
        rprint()


if __name__ == "__main__":
    app()
