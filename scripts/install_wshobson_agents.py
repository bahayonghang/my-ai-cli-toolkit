#!/usr/bin/env python3
"""
wshobson/agents Plugin Installer

安装 wshobson/agents 插件市场及推荐插件到 Claude Code。

Usage:
    python install_wshobson_agents.py [--list] [--install PLUGIN] [--install-recommended]

Requirements:
    - Claude Code 已安装并可用
    - 网络连接（用于添加 marketplace）

Reference: https://github.com/wshobson/agents
"""

import subprocess
import sys
from dataclasses import dataclass
from typing import Optional


# Marketplace 配置
MARKETPLACE_URL = "https://github.com/wshobson/agents"
MARKETPLACE_NAME = "claude-code-workflows"

# 推荐安装的插件列表（按用途分类）
RECOMMENDED_PLUGINS = {
    "python": [
        "python-development",      # python-pro, django-pro, fastapi-pro
    ],
    "javascript": [
        "javascript-typescript",   # javascript-pro, typescript-pro
    ],
    "review": [
        "comprehensive-review",    # architect-review, code-reviewer, security-auditor
    ],
    "infrastructure": [
        "deployment",              # 部署相关
        "kubernetes",              # K8s 配置
    ],
    "security": [
        "security-scanning",       # 安全扫描
    ],
}

# 所有推荐插件的扁平列表
ALL_RECOMMENDED = [
    plugin 
    for plugins in RECOMMENDED_PLUGINS.values() 
    for plugin in plugins
]


@dataclass
class CommandResult:
    """命令执行结果"""
    success: bool
    output: str
    error: str = ""


def run_claude_command(args: list[str], timeout: int = 60) -> CommandResult:
    """
    执行 Claude Code CLI 命令
    
    Args:
        args: 命令参数列表
        timeout: 超时时间（秒）
    
    Returns:
        CommandResult 包含执行结果
    """
    cmd = ["claude"] + args
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=(sys.platform == "win32")
        )
        return CommandResult(
            success=result.returncode == 0,
            output=result.stdout.strip(),
            error=result.stderr.strip()
        )
    except subprocess.TimeoutExpired:
        return CommandResult(
            success=False,
            output="",
            error=f"Command timed out after {timeout}s"
        )
    except FileNotFoundError:
        return CommandResult(
            success=False,
            output="",
            error="Claude CLI not found. Please install Claude Code first."
        )
    except Exception as e:
        return CommandResult(
            success=False,
            output="",
            error=str(e)
        )


def check_claude_cli() -> bool:
    """检查 Claude CLI 是否可用"""
    result = run_claude_command(["--version"])
    if result.success:
        print(f"✓ Claude CLI found: {result.output}")
        return True
    else:
        print(f"✗ Claude CLI not available: {result.error}")
        return False


def add_marketplace() -> bool:
    """
    添加 wshobson/agents marketplace
    
    使用命令: /install-plugin-marketplace https://github.com/wshobson/agents
    """
    print(f"\n📦 Adding marketplace: {MARKETPLACE_NAME}")
    print(f"   URL: {MARKETPLACE_URL}")
    
    # Claude Code 的 marketplace 添加通常通过交互式命令
    # 这里提供手动指令
    print("\n" + "=" * 60)
    print("请在 Claude Code 中执行以下命令:")
    print("=" * 60)
    print(f"\n  /install-plugin-marketplace {MARKETPLACE_URL}\n")
    print("=" * 60)
    
    return True


def list_available_plugins() -> None:
    """列出可用的插件"""
    print("\n📋 Available plugins from wshobson/agents:")
    print("=" * 60)
    
    for category, plugins in RECOMMENDED_PLUGINS.items():
        print(f"\n[{category.upper()}]")
        for plugin in plugins:
            print(f"  • {plugin}")
    
    print("\n" + "=" * 60)
    print("Total recommended plugins:", len(ALL_RECOMMENDED))
    print("\nTo install, run in Claude Code:")
    print("  /install-plugin <plugin-name>")


def install_plugin(plugin_name: str) -> bool:
    """
    安装指定插件
    
    Args:
        plugin_name: 插件名称
    
    Returns:
        是否成功
    """
    print(f"\n🔧 Installing plugin: {plugin_name}")
    
    # 提供手动安装指令
    print("\n" + "-" * 40)
    print("请在 Claude Code 中执行:")
    print("-" * 40)
    print(f"\n  /install-plugin {plugin_name}\n")
    print("-" * 40)
    
    return True


def install_recommended() -> None:
    """安装所有推荐插件"""
    print("\n🚀 Installing all recommended plugins...")
    print("=" * 60)
    
    print("\n请在 Claude Code 中依次执行以下命令:\n")
    
    for i, plugin in enumerate(ALL_RECOMMENDED, 1):
        print(f"  {i}. /install-plugin {plugin}")
    
    print("\n" + "=" * 60)
    print(f"Total: {len(ALL_RECOMMENDED)} plugins")


def generate_batch_script() -> None:
    """生成批量安装的命令脚本"""
    print("\n📝 Batch installation commands:")
    print("=" * 60)
    print("\n# Step 1: Add marketplace")
    print(f"/install-plugin-marketplace {MARKETPLACE_URL}")
    print("\n# Step 2: Install plugins")
    for plugin in ALL_RECOMMENDED:
        print(f"/install-plugin {plugin}")
    print("\n" + "=" * 60)


def show_usage_examples() -> None:
    """显示使用示例"""
    print("\n📖 Usage Examples in Claude Code:")
    print("=" * 60)
    
    examples = [
        ("Python 开发", "@python-pro Create a FastAPI project with async patterns"),
        ("代码审查", "@code-reviewer Review this file for bugs and security issues"),
        ("架构设计", "@architect-review Analyze the architecture of this project"),
        ("安全扫描", "@security-auditor Scan for vulnerabilities"),
    ]
    
    for title, cmd in examples:
        print(f"\n[{title}]")
        print(f"  {cmd}")
    
    print("\n" + "=" * 60)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Install wshobson/agents plugins for Claude Code",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python install_wshobson_agents.py --list
  python install_wshobson_agents.py --install python-development
  python install_wshobson_agents.py --install-recommended
  python install_wshobson_agents.py --batch
        """
    )
    
    parser.add_argument(
        "--list", "-l",
        action="store_true",
        help="List available plugins"
    )
    parser.add_argument(
        "--install", "-i",
        type=str,
        metavar="PLUGIN",
        help="Install a specific plugin"
    )
    parser.add_argument(
        "--install-recommended", "-r",
        action="store_true",
        help="Install all recommended plugins"
    )
    parser.add_argument(
        "--batch", "-b",
        action="store_true",
        help="Generate batch installation commands"
    )
    parser.add_argument(
        "--examples", "-e",
        action="store_true",
        help="Show usage examples"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("  wshobson/agents Plugin Installer")
    print("  Claude Code Workflows & Skills")
    print("=" * 60)
    
    # 如果没有参数，显示帮助
    if not any([args.list, args.install, args.install_recommended, 
                args.batch, args.examples]):
        # 默认行为：显示 marketplace 添加指令和列表
        add_marketplace()
        list_available_plugins()
        show_usage_examples()
        return
    
    if args.list:
        list_available_plugins()
    
    if args.install:
        install_plugin(args.install)
    
    if args.install_recommended:
        add_marketplace()
        install_recommended()
    
    if args.batch:
        generate_batch_script()
    
    if args.examples:
        show_usage_examples()


if __name__ == "__main__":
    main()
