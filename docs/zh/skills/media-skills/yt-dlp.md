# yt-dlp 视频下载

强大的视频下载工具，支持 1000+ 网站，包括 YouTube、Bilibili、Twitter、Instagram、TikTok 等。

## 功能特性

- **智能格式选择**: 自动选择最佳质量
- **字幕支持**: 下载并嵌入多语言字幕
- **播放列表支持**: 批量下载，支持断点续传
- **元数据保留**: 保存标题、上传日期、描述、缩略图
- **音频提取**: 提取音频为 MP3/FLAC/OPUS 格式
- **FFmpeg 集成**: 自动合并视频/音频和格式转换
- **代理支持**: HTTP/SOCKS 代理绕过地区限制
- **Cookie 支持**: 下载会员/受限内容

## 快速开始

```bash
# 安装技能
uv run python src/install.py install yt-dlp

# 基础用法
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"

# 下载 1080p 视频
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# 仅提取音频
yt-dlp -x --audio-format mp3 "URL"

# 下载带字幕视频
yt-dlp --embed-subs --sub-langs zh,en "URL"
```

## 前置要求

**重要**: yt-dlp 需要 FFmpeg 才能正常工作。技能包含自动 FFmpeg 检测功能。

安装 FFmpeg：

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (Scoop)
scoop install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```

## AI 辅助工作流

当您提供视频链接时，AI 助手会：

1. **检查 FFmpeg**: 验证 FFmpeg 是否已安装
2. **识别需求**: 询问质量、音频还是视频、字幕需求
3. **构建命令**: 生成优化的 yt-dlp 命令
4. **执行下载**: 下载到您的下载文件夹
5. **验证结果**: 检查文件完整性

## 使用示例

### 下载 YouTube 视频

```
用户: "帮我下载这个视频 https://www.youtube.com/watch?v=dQw4w9WgXcQ"

AI: 我来帮您下载该视频。

✅ FFmpeg 已安装: ffmpeg version 6.0

正在下载最佳质量视频...
命令: yt-dlp -f "bestvideo+bestaudio" -o "~/Downloads/%(title)s.%(ext)s" "URL"

结果: Downloads/Rick Astley - Never Gonna Give You Up.mp4
```

### 下载播放列表音频

```
用户: "把这个播放列表下载为音频文件"

AI: 我将把整个播放列表提取为音频。

命令: yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "~/Downloads/%(playlist_index)s-%(title)s.%(ext)s" \
  "PLAYLIST_URL"

这将把所有视频下载为带序号的 MP3 文件。
```

## 常见场景

### 高清视频下载

```bash
# 1080p ���频
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# 4K 视频
yt-dlp -f "bestvideo[height<=2160]+bestaudio" "URL"
```

### 音频提取

```bash
# 最佳质量 MP3
yt-dlp -x --audio-format mp3 --audio-quality 0 "URL"

# 批量下载播客
yt-dlp -x --audio-format mp3 \
  -o "%(playlist_index)s-%(title)s.%(ext)s" \
  "PLAYLIST_URL"
```

### 字幕下载

```bash
# 下载所有可用字幕
yt-dlp --write-subs --sub-langs all --skip-download "URL"

# 嵌入字幕到视频
yt-dlp --embed-subs --sub-langs zh,en "URL"
```

### 高级选项

```bash
# 使用代理
yt-dlp --proxy http://127.0.0.1:7890 "URL"

# 限制下载速度
yt-dlp --limit-rate 1M "URL"

# 下载并保存元数据
yt-dlp --write-info-json --write-description \
  --write-thumbnail --embed-subs "URL"

# 从文件批量下载
yt-dlp -a urls.txt
```

## 技能结构

```
skills/yt-dlp/
├── SKILL.md                    # 主技能定义
├── README.md                   # 使用文档
├── config/
│   └── yt-dlp.conf            # 配置模板
└── examples/
    ├── check-ffmpeg.py         # FFmpeg 检测（Python）
    ├── check-ffmpeg.sh         # FFmpeg 检测（Bash）
    ├── check-ffmpeg.ps1        # FFmpeg 检测（PowerShell）
    ├── download-scripts.sh     # Linux/macOS 脚本
    ├── download-scripts.bat    # Windows 脚本
    └── urls.txt                # 批量下载模板
```

## 检测脚本

技能包含跨平台 FFmpeg 检测：

```bash
# Python（推荐）
python examples/check-ffmpeg.py

# Bash（macOS/Linux）
bash examples/check-ffmpeg.sh

# PowerShell（Windows）
powershell -ExecutionPolicy Bypass -File examples/check-ffmpeg.ps1
```

每个脚本会：
- 检测 FFmpeg 是否已安装
- 显示版本信息（如可用）
- 为您的操作系统提供安装指引
- 未安装时返回错误代码

## 支持的网站

常用支持网站包括：
- YouTube
- Bilibili
- Twitter/X
- Instagram
- 抖音（TikTok）
- Vimeo
- Twitch
- Coursera
- 以及 1000+ 更多网站

[查看完整列表](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 配置文件

### 全局配置

创建 `~/.config/yt-dlp/config`（Linux/macOS）或 `%APPDATA%\yt-dlp\config.txt`（Windows）：

```ini
# 默认输出目录
-o ~/Downloads/%(title)s.%(ext)s

# 默认格式
-f bestvideo+bestaudio/best

# 下载字幕
--write-subs
--sub-langs zh,en

# 限制速度
--limit-rate 2M
```

### 项目配置

在项目目录创建 `yt-dlp.conf`：

```ini
-o ./videos/%(title)s.%(ext)s
--cookies cookies.txt
--download-archive downloaded.txt
```

## 格式选择

yt-dlp 使用强大的格式选择语法：

```bash
# 最佳视频 + 音频（合并）
bestvideo+bestaudio

# 单文件（已合并）
best

# 带过滤器
bestvideo[height<=1080]+bestaudio    # 最高 1080p
bestvideo[fps<=30]+bestaudio         # 最高 30fps
bestvideo[filesize<500M]+bestaudio   # 小于 500MB

# 备选方案
bestvideo+bestaudio/best  # 先尝试合并，后尝试单文件
```

## 故障排除

### FFmpeg 未找到

```bash
# 检查安装
ffmpeg -version

# 如需重新安装
brew install ffmpeg         # macOS
sudo apt install ffmpeg    # Ubuntu
scoop install ffmpeg       # Windows
```

### 视频和音频分离

yt-dlp 会分别下载高质量视频和音频，然后用 FFmpeg 合并。

```bash
# 确保 FFmpeg 已安装
ffmpeg -version

# 强制指定格式
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 "URL"
```

### 下载速度慢

```bash
# 限制速度以避免被限流
yt-dlp --limit-rate 1M "URL"

# 使用代理
yt-dlp --proxy http://127.0.0.1:7890 "URL"

# 增加并发片段数
yt-dlp --concurrent-fragments 8 "URL"
```

### Bilibili 会员内容

Bilibili 需要 cookie 才能下载会员视频：

```bash
# 使用浏览器扩展导出 cookie
yt-dlp --cookies cookies.txt "URL"
```

## 高级功能

### 下载存档

避免重复下载：

```bash
yt-dlp --download-archive archive.txt "PLAYLIST_URL"
```

### 模板化命名

```bash
# 包含上传者
-o "%(uploader)s/%(title)s.%(ext)s"

# 包含日期
-o "%(upload_date)s-%(title)s.%(ext)s"

# 完整元数据
-o "%(uploader)s/%(upload_date)s-%(title)s-[%(id)s].%(ext)s"
```

### 批量下载

```bash
# 创建 URLs 文件
cat > urls.txt << EOF
https://www.youtube.com/watch?v=VIDEO1
https://www.youtube.com/watch?v=VIDEO2
EOF

# 批量下载
yt-dlp -a urls.txt
```

## 参考资源

- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [官方文档](https://github.com/yt-dlp/yt-dlp#readme)
- [格式选择语法](https://github.com/yt-dlp/yt-dlp#format-selection)
- [支持网站列表](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)

## 许可证

MIT License - 与 yt-dlp 项目保持一致

---

**注意**: 请遵守网站服务条款和版权法律。仅下载您有权访问的内容。
