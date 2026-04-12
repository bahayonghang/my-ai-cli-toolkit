# yt-dlp 支持、故障排除与最佳实践

## 常见网站支持

| 网站 | 支持情况 | 特殊说明 |
|------|---------|---------|
| YouTube | ✅ 完全支持 | 需要代理（某些地区） |
| Bilibili | ✅ 支持 | 需要 cookie |
| Twitter/X | ✅ 支持 | - |
| Instagram | ✅ 支持 | - |
| TikTok | ✅ 支持 | - |
| Vimeo | ✅ 支持 | - |
| Twitch | ✅ 支持 | - |
| Coursera | ✅ 支持 | 需要登录 |
| Netflix | ❌ 不支持（DRM 保护） | 见下方说明 |

> **关于 DRM 保护内容：** Netflix、Disney+、Amazon Prime Video 等平台的内容受 DRM（数字版权管理）保护，无法通过 yt-dlp 下载。yt-dlp 仅支持无 DRM 保护的公开或登录可访问内容。

## 最佳实践

### 1. 网络稳定性

```bash
# 使用 aria2 作为下载器（支持断点续传）
yt-dlp --external-downloader aria2 \
  --external-downloader-args "-x 8 -k 1M" "URL"

# 重试机制
yt-dlp --retries 10 --fragment-retries 10 "URL"
```

### 2. 避免被封

```bash
# 限制速度
yt-dlp --limit-rate 1M "URL"

# 使用代理池
yt-dlp --proxy socks5://127.0.0.1:1080 "URL"

# 模拟浏览器
yt-dlp --user-agent "Mozilla/5.0..." "URL"
```

### 3. 元数据保留

```bash
# 保存所有元数据
yt-dlp --write-info-json --write-description \
  --write-thumbnail --embed-subs "URL"

# 下载为 mkv（支持所有元数据）
yt-dlp --merge-output-format mkv "URL"
```

### 4. 批量处理

```bash
# 从文件读取 URL (如示例文件 urls.txt)
yt-dlp -a urls.txt -o "%(title)s.%(ext)s"

# 批量下载播放列表（断点续传）
yt-dlp --download-archive archive.txt \
  -o "%(title)s.%(ext)s" "PLAYLIST_URL"
```

## 常见问题故障排除

### Q: 下载速度慢？

A: 尝试以下方法：
- 使用 `--limit-rate` 限制速度
- 使用代理 `--proxy`
- 切换格式选择（避免需要合并）
- 使用 `--concurrent-fragments` 增加并发

### Q: 视频和音频分离？

A: 使用以下任一方法：
```bash
# 方法1：指定合并格式
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 "URL"

# 方法2：使用 FFmpeg 合并
yt-dlp -f bestvideo+bestaudio --keep-video "URL"
ffmpeg -i video.mp4 -i audio.m4v -c copy output.mp4
```

### Q: 如何下载付费/会员内容？

A: 需要 cookie：
1. 使用浏览器插件导出 cookie（如 "Get cookies.txt"）
2. 使用 `--cookies cookies.txt` 参数
3. 注意：cookie 会过期，需要定期更新

### Q: Bilibili 下载失败？

A: 常见解决方案：
```bash
# 使用 cookie
yt-dlp --cookies cookies.txt "URL"

# 使用 CNCore 提取器
yt-dlp --extractor-args "bilivideo:session_data=..." "URL"
```

### Q: 如何下载直播？

A:
```bash
# 从当前开始下载
yt-dlp "URL"

# 从直播开始时下载（需要录制）
yt-dlp --live-from-start "URL"

# 等待直播开始
yt-dlp --wait-for-video "URL"
```

### 问题: HTTP Error 403

**尝试**:
1. 使用 cookie: `--cookies cookies.txt`
2. 使用代理: `--proxy`
3. 更换 user-agent: `--user-agent`

### 问题: 字幕下载失败

**可能原因**:
- 视频没有字幕
- 字幕语言不可用
- 需要登录（使用 cookie）

**验证方法**:
```bash
# 查看可用字幕
yt-dlp --list-subs "URL"
```

## 进阶技巧

### 自定义提取器

```bash
# 使用特定提取器
yt-dlp --extractor-args "youtube:player_client=android" "URL"

# 跳过年龄验证
yt-dlp --extractor-args "youtube:player_client=ios" "URL"
```

### 播放列表过滤

```bash
# 仅下载前 10 个
yt-dlp --playlist-end 10 "PLAYLIST_URL"

# 下载特定范围
yt-dlp --playlist-start 5 --playlist-end 15 "PLAYLIST_URL"

# 反向播放列表
yt-dlp --playlist-reverse "PLAYLIST_URL"

# 随机顺序
yt-dlp --playlist-random "PLAYLIST_URL"
```

### 信息提取

```bash
# 仅查看可用格式（不下载）
yt-dlp --list-formats "URL"

# 查看 JSON 信息
yt-dlp --dump-json "URL"

# 查看播放列表信息
yt-dlp --flat-playlist --print "%(title)s" "PLAYLIST_URL"
```

## 技术细节与安装

### 依赖项

- **FFmpeg**: 必需（用于视频/音频合并、格式转换）
- **Python 3.8+**: 运行环境
- **RAR** (可选): 用于某些网站的下载

### 安装命令

```bash
# pip 安装
pip install yt-dlp

# 包管理器（推荐）
# macOS
brew install yt-dlp

# Linux (Arch)
pacman -S yt-dlp

# Windows (Scoop)
scoop install yt-dlp

# 更新
yt-dlp --update
```
