#!/bin/bash
# FFmpeg 检测脚本 (macOS/Linux)
# 检测 FFmpeg 是否已安装，如未安装则提供安装指引

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "FFmpeg 依赖检测工具"
echo "=========================================="
echo

# 检测 FFmpeg
echo -e "正在检测 FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    # 获取版本信息
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n 1)
    echo -e "${GREEN}✅ FFmpeg 已安装!${NC}"
    echo "   版本信息: $FFMPEG_VERSION"
    echo
    echo "可以继续使用 yt-dlp 下载视频了喵~"
    exit 0
else
    echo -e "${RED}❌ FFmpeg 未安装!${NC}"
    echo
    echo "FFmpeg 是 yt-dlp 的必需依赖，用于:"
    echo "  • 视频和音频合并"
    echo "  • 格式转换"
    echo "  • 字幕嵌入"
    echo

    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "检测到 macOS 系统，请选择安装方式:"
        echo
        echo "1. Homebrew (推荐)"
        echo "   brew install ffmpeg"
        echo
        echo "2. MacPorts"
        echo "   sudo port install ffmpeg"
        echo
    elif [[ -f /etc/os-release ]]; then
        # Linux 发行版检测
        . /etc/os-release
        echo "检测到 Linux 系统: $NAME"
        echo
        case "$ID" in
            ubuntu|debian)
                echo "安装命令:"
                echo "   sudo apt update"
                echo "   sudo apt install ffmpeg"
                ;;
            arch|manjaro)
                echo "安装命令:"
                echo "   sudo pacman -S ffmpeg"
                ;;
            fedora|rhel|centos)
                echo "安装命令:"
                echo "   sudo dnf install ffmpeg"
                ;;
            opensuse*)
                echo "安装命令:"
                echo "   sudo zypper install ffmpeg"
                ;;
            *)
                echo "请访问 https://ffmpeg.org/download.html 获取安装指引"
                ;;
        esac
        echo
    else
        echo "请访问 https://ffmpeg.org/download.html 获取安装指引"
        echo
    fi

    echo "安装完成后，请重新运行此脚本验证:"
    echo "   bash $0"
    echo
    echo "或者手动验证:"
    echo "   ffmpeg -version"
    echo
    exit 1
fi
