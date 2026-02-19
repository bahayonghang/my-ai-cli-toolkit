#!/bin/bash
# yt-dlp 常用脚本示例
# 使用方法: chmod +x download-scripts.sh && ./download-scripts.sh

# ==================== 依赖检测 ====================

# FFmpeg 检测函数
check_ffmpeg() {
    if ! command -v ffmpeg &> /dev/null; then
        echo "❌ 错误: FFmpeg 未安装!"
        echo
        echo "yt-dlp 需要 FFmpeg 来合并视频和音频。"
        echo
        echo "请先安装 FFmpeg:"
        echo "  macOS: brew install ffmpeg"
        echo "  Ubuntu/Debian: sudo apt install ffmpeg"
        echo "  Arch: sudo pacman -S ffmpeg"
        echo
        echo "或运行检测脚本获取详细指引:"
        echo "  bash examples/check-ffmpeg.sh"
        echo
        return 1
    fi
    return 0
}

# ==================== 基础下载 ====================

# 下载单个视频（最佳质量）
download_best() {
    check_ffmpeg || return 1
    yt-dlp -o "~/Downloads/%(title)s.%(ext)s" "$1"
}

# 下载 1080p 视频
download_1080p() {
    check_ffmpeg || return 1
    yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# 仅下载音频（MP3）
download_audio() {
    check_ffmpeg || return 1
    yt-dlp -x --audio-format mp3 --audio-quality 0 \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# ==================== 播放列表下载 ====================

# 下载播放列表（带序号）
download_playlist() {
    check_ffmpeg || return 1
    yt-dlp -f "bestvideo+bestaudio/best" \
        -o "~/Downloads/%(playlist_index)s-%(title)s.%(ext)s" \
        "$1"
}

# 下载播放列表（限制数量）
download_playlist_limited() {
    check_ffmpeg || return 1
    yt-dlp --playlist-end 10 \
        -o "~/Downloads/%(playlist_index)s-%(title)s.%(ext)s" \
        "$1"
}

# ==================== 字幕下载 ====================

# 下载所有字幕
download_subs() {
    yt-dlp --write-subs --sub-langs all --skip-download "$1"
}

# 下载带内嵌字幕的视频
download_embed_subs() {
    check_ffmpeg || return 1
    yt-dlp --embed-subs --sub-langs en,zh \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# ==================== 批量下载 ====================

# 从文件批量下载
batch_download() {
    check_ffmpeg || return 1
    yt-dlp -a urls.txt \
        -o "~/Downloads/%(title)s.%(ext)s"
}

# 批量下载音频
batch_download_audio() {
    check_ffmpeg || return 1
    yt-dlp -a urls.txt \
        -x --audio-format mp3 \
        -o "~/Downloads/%(title)s.%(ext)s"
}

# ==================== 高级用法 ====================

# 使用代理下载
download_with_proxy() {
    check_ffmpeg || return 1
    yt-dlp --proxy http://127.0.0.1:7890 \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# 使用 cookie 下载（Bilibili 会员等）
download_with_cookie() {
    check_ffmpeg || return 1
    yt-dlp --cookies cookies.txt \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# 下载并保存完整元数据
download_metadata() {
    check_ffmpeg || return 1
    yt-dlp --write-info-json --write-description --write-thumbnail \
        --embed-thumbnail --embed-subs \
        -o "~/Downloads/%(title)s.%(ext)s" \
        "$1"
}

# ==================== 维护相关 ====================

# 更新 yt-dlp
update_ytdlp() {
    yt-dlp --update
}

# 查看可用格式
list_formats() {
    yt-dlp --list-formats "$1"
}

# 查看视频信息
show_info() {
    yt-dlp --dump-json "$1" | jq '.'
}

# ==================== 使用示例 ====================

# 示例：下载 YouTube 视频
# download_best "https://www.youtube.com/watch?v=VIDEO_ID"

# 示例：下载 Bilibili 视频（需要 cookie）
# download_with_cookie "https://www.bilibili.com/video/BVxxxxxx"

# 示例：批量下载
# batch_download

# 示例：查看可用格式
# list_formats "https://www.youtube.com/watch?v=VIDEO_ID"
