# yt-dlp 常用命令及用法参考

## 基础用法

```bash
# 直接下载视频（最佳质量）
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"

# 下载到指定目录
yt-dlp -o "Downloads/%(title)s.%(ext)s" "URL"

# 仅下载音频（最佳质量 MP3）
yt-dlp -x --audio-format mp3 "URL"

# 下载字幕
yt-dlp --write-subs --sub-langs all "URL"
```

## 高级选项

```bash
# 选择特定质量
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" "URL"

# 下载播放列表
yt-dlp -o "%(playlist_index)s-%(title)s.%(ext)s" "PLAYLIST_URL"

# 批量下载（从文件读取 URL）
# 参考 $SKILL_DIR/assets/urls.txt 获取 URL 列表格式示例
yt-dlp -a urls.txt

# 限制下载速度（避免被封）
yt-dlp --limit-rate 1M "URL"

# 使用代理
yt-dlp --proxy http://127.0.0.1:7890 "URL"

# 下载后不合并（保留分离的视频/音频）
yt-dlp --keep-video "URL"
```

## 常用输出模板

```bash
# 保留原视频标题
-o "%(title)s.%(ext)s"

# 包含上传者信息
-o "%(uploader)s/%(title)s.%(ext)s"

# 包含上传日期
-o "%(upload_date)s-%(title)s.%(ext)s"

# 播放列表序号
-o "%(playlist_index)s-%(title)s.%(ext)s"

# 完整元数据（用于整理）
-o "%(uploader)s/%(upload_date)s-%(title)s-[%(id)s].%(ext)s"
```

## 常用场景命令

### YouTube 高清视频

```bash
# 1080p 视频 + 音频
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" \
  -o "%(title)s.%(ext)s" "URL"

# 4K 视频
yt-dlp -f "bestvideo[height<=2160]+bestaudio/best[height<=2160]" \
  -o "%(title)s.%(ext)s" "URL"
```

### Bilibili 视频

```bash
# 需要 cookie（登录后导出）
yt-dlp --cookies cookies.txt \
  -o "%(title)s.%(ext)s" "URL"

# 下载弹幕（需要专用脚本）
yt-dlp --write-info-json "URL"
```

### 播客/音频提取

```bash
# 最佳质量 MP3
yt-dlp -x --audio-format mp3 \
  --audio-quality 0 \
  -o "%(title)s.%(ext)s" "URL"

# 批量下载播客列表
yt-dlp -x --audio-format mp3 \
  -o "%(playlist_index)s-%(title)s.%(ext)s" \
  "PLAYLIST_URL"
```

### 字幕下载

```bash
# 下载所有可用字幕
yt-dlp --write-subs --sub-langs all \
  --skip-download "URL"

# 下载内嵌字幕视频
yt-dlp --embed-subs --sub-langs en,zh "URL"

# 仅字幕（不下载视频）
yt-dlp --write-subs --skip-download "URL"
```

## 格式选择语法

```bash
# 格式选择代码
bestvideo+bestaudio    # 最佳视频+音频（分别下载后合并）
best                   # 最佳单文件（已合并）
worst                  # 最差质量（用于测试）

# 过滤器
bestvideo[height<=1080]      # 最高 1080p
bestvideo[fps<=30]           # 最高 30fps
bestvideo[filesize<500M]     # 小于 500MB
bestvideo[acodec=opus]       # 指定音频编码

# 组合
bestvideo[height<=1080]+bestaudio/best[height<=1080]

# 备选方案（从前到后尝试）
bestvideo+bestaudio/best
```

## 配置文件

参考 `$SKILL_DIR/assets/config/yt-dlp.conf`。全局配置位置：
- macOS/Linux: `~/.config/yt-dlp/config`
- Windows: `%APPDATA%\yt-dlp\config.txt`
