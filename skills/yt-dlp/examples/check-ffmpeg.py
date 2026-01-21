#!/usr/bin/env python3
"""
FFmpeg 检测脚本
检测 FFmpeg 是否已安装，如未安装则提供安装指引

使用方法:
    python check-ffmpeg.py
"""

import subprocess
import sys
import platform
import shutil


def run_command(cmd):
    """执行命令并返回输出"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)


def check_ffmpeg():
    """检测 FFmpeg 是否已安装"""
    success, stdout, stderr = run_command("ffmpeg -version")

    if success:
        # 提取版本信息
        first_line = stdout.split('\n')[0]
        return True, first_line
    else:
        return False, None


def get_install_instructions():
    """根据操作系统返回安装指令"""
    system = platform.system()
    os_version = platform.version()

    instructions = {
        "Windows": [
            ("Scoop (推荐)", "scoop install ffmpeg"),
            ("Chocolatey", "choco install ffmpeg"),
            ("winget", "winget install ffmpeg"),
            ("手动下载", "访问 https://ffmpeg.org/download.html#build-windows"),
        ],
        "Darwin": [  # macOS
            ("Homebrew (推荐)", "brew install ffmpeg"),
            ("MacPorts", "sudo port install ffmpeg"),
        ],
        "Linux": [
            ("Ubuntu/Debian", "sudo apt update && sudo apt install ffmpeg"),
            ("Arch/Manjaro", "sudo pacman -S ffmpeg"),
            ("Fedora", "sudo dnf install ffmpeg"),
            ("openSUSE", "sudo zypper install ffmpeg"),
        ]
    }

    # Linux 特殊处理：检测发行版
    if system == "Linux":
        try:
            # 尝试检测具体的 Linux 发行版
            with open("/etc/os-release", "r") as f:
                os_release = f.read().lower()
                if "ubuntu" in os_release or "debian" in os_release:
                    return instructions["Linux"][:1]
                elif "arch" in os_release:
                    return instructions["Linux"][1:2]
                elif "fedora" in os_release:
                    return instructions["Linux"][2:3]
        except:
            pass

    return instructions.get(system, [
        ("通用", "请访问 https://ffmpeg.org/download.html 获取安装指引")
    ])


def main():
    """主函数"""
    print("=" * 60)
    print("FFmpeg 依赖检测工具")
    print("=" * 60)
    print()

    # 检测 FFmpeg
    print("正在检测 FFmpeg...")
    installed, version_info = check_ffmpeg()

    if installed:
        print("✅ FFmpeg 已安装!")
        print(f"   版本信息: {version_info}")
        print()
        print("可以继续使用 yt-dlp 下载视频了喵~")
        return 0
    else:
        print("❌ FFmpeg 未安装!")
        print()
        print("FFmpeg 是 yt-dlp 的必需依赖，用于:")
        print("  • 视频和音频合并")
        print("  • 格式转换")
        print("  • 字幕嵌入")
        print()
        print("请根据您的操作系统安装 FFmpeg:")
        print()

        system = platform.system()
        instructions = get_install_instructions()

        for i, (method, command) in enumerate(instructions, 1):
            print(f"{i}. {method}")
            print(f"   命令: {command}")
            print()

        print("安装完成后，请重新运行此脚本验证:")
        print(f"   python {sys.argv[0]}")
        print()
        print("或者手动验证:")
        print("   ffmpeg -version")
        print()
        return 1


if __name__ == "__main__":
    sys.exit(main())
