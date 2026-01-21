# yt-dlp 技能目录结构说明

## 文件结构

```
skills/yt-dlp/
├── SKILL.md                    # 主技能定义文件（AI 助手读取）
├── README.md                   # 本文件（使用说明）
├── config/                     # 配置文件目录
│   └── yt-dlp.conf            # yt-dlp 配置示例
└── examples/                   # 示例文件目录
    ├── urls.txt               # 批量下载 URL 列表示例
    ├── download-scripts.sh    # Linux/macOS 脚本示例
    └── download-scripts.bat   # Windows 批处理脚本示例
```

## 快速开始

### 1. 安装 yt-dlp

```bash
# 使用 pip 安装
pip install yt-dlp

# 或使用包管理器
# macOS
brew install yt-dlp

# Linux (Arch)
pacman -S yt-dlp

# Windows (Scoop)
scoop install yt-dlp
```

### 2. 安装 FFmpeg（必需）

```bash
# macOS
brew install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt install ffmpeg

# Linux (Arch)
sudo pacman -S ffmpeg

# Windows (Scoop)
scoop install ffmpeg

# 或从官网下载: https://ffmpeg.org/download.html
```

### 3. 配置（可选）

复制 `config/yt-dlp.conf` 到系统配置目录：

- **Linux/macOS**: `~/.config/yt-dlp/config`
- **Windows**: `%APPDATA%\yt-dlp\config.txt`

然后编辑配置文件，设置默认参数。

### 4. 使用技能

安装技能到 Claude Code：

```bash
# 在项目根目录执行
python install.py install yt-dlp
```

然后就可以直接跟 AI 说：
- "帮我下载这个视频：https://www.youtube.com/watch?v=xxx"
- "下载这个 YouTube 播放列表的音频版"
- "下载这个视频的中文字幕"

## 文件说明

### SKILL.md

这是核心技能文件，包含：
- 完整的功能说明
- 使用场景和工作流
- 命令示例和最佳实践
- AI 辅助检查清单
- 常见问题解答

AI 助手会读取这个文件来理解如何使用 yt-dlp。

### config/yt-dlp.conf

配置文件示例，包含：
- 输出目录设置
- 格式选择偏好
- 字幕下载设置
- 性能和代理配置
- 高级选项

**注意**: 配置文件中的默认路径需要根据你的系统修改。

### examples/urls.txt

批量下载 URL 列表示例。

使用方法：
```bash
# 编辑 urls.txt，添加你要下载的链接
yt-dlp -a examples/urls.txt
```

### examples/download-scripts.sh

Linux/macOS 脚本集合，包含常用功能的封装函数。

使用方法：
```bash
# 赋予执行权限
chmod +x examples/download-scripts.sh

# 查看可用函数
cat examples/download-scripts.sh

# 在脚本中调用
source examples/download-scripts.sh
download_1080p "https://www.youtube.com/watch?v=xxx"
```

### examples/download-scripts.bat

Windows 批处理脚本，提供交互式菜单。

使用方法：
```bash
# 双击运行或在命令行执行
examples\download-scripts.bat

# 或直接调用特定功能
examples\download-scripts.bat download_best "https://www.youtube.com/watch?v=xxx"
```

## 常见使用场景

### 场景 1: 下载 YouTube 视频

```
用户: "帮我下载这个视频 https://www.youtube.com/watch?v=dQw4w9WgXcQ"

AI 应该:
1. 识别这是 YouTube 视频
2. 生成下载命令（默认最佳质量）
3. 说明文件保存位置
4. 提供质量选择选项（如果需要）
```

### 场景 2: 下载播放列表音频

```
用户: "下载这个播放列表的音频版 https://www.youtube.com/playlist?list=xxx"

AI 应该:
1. 识别这是播放列表
2. 使用音频提取参数
3. 设置文件名模板（带序号）
4. 提供批量下载进度提示
```

### 场景 3: 下载 Bilibili 会员视频

```
用户: "下载这个 B 站视频 https://www.bilibili.com/video/BVxxx"

AI 应该:
1. 识别这是 Bilibili 视频
2. 提示需要 cookie
3. 说明如何获取 cookie
4. 生成带 cookie 的下载命令
```

## 技巧和注意事项

### 提高成功率

1. **使用代理**: 某些网站需要代理访问
   ```bash
   yt-dlp --proxy http://127.0.0.1:7890 "URL"
   ```

2. **限制速度**: 避免被限流
   ```bash
   yt-dlp --limit-rate 1M "URL"
   ```

3. **使用 cookie**: 下载会员内容
   ```bash
   yt-dlp --cookies cookies.txt "URL"
   ```

4. **重试机制**: 网络不稳定时
   ```bash
   yt-dlp --retries 10 --fragment-retries 10 "URL"
   ```

### 格式选择技巧

1. **查看可用格式**:
   ```bash
   yt-dlp --list-formats "URL"
   ```

2. **指定质量**:
   ```bash
   # 最高 1080p
   yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

   # 最高 4K
   yt-dlp -f "bestvideo[height<=2160]+bestaudio" "URL"
   ```

3. **选择特定编码**:
   ```bash
   # H.264 编码（兼容性好）
   yt-dlp -f "bestvideo[vcodec^=avc1]+bestaudio" "URL"

   # VP9 编码（更好压缩）
   yt-dlp -f "bestvideo[vcodec^=vp9]+bestaudio" "URL"
   ```

### 文件管理

1. **使用下载存档**（避免重复下载）:
   ```bash
   yt-dlp --download-archive archive.txt "PLAYLIST_URL"
   ```

2. **模板化命名**:
   ```bash
   # 按上传者分类
   -o "%(uploader)s/%(title)s.%(ext)s"

   # 包含日期
   -o "%(upload_date)s-%(title)s.%(ext)s"

   # 完整元数据
   -o "%(uploader)s/%(upload_date)s-%(title)s-[%(id)s].%(ext)s"
   ```

3. **保留元数据**:
   ```bash
   yt-dlp --write-info-json --write-description \
     --write-thumbnail --embed-subs "URL"
   ```

## 故障排除

### 问题: FFmpeg not found

**解决方案**: 安装 FFmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
scoop install ffmpeg
```

### 问题: 下载速度慢

**尝试**:
1. 使用代理: `--proxy`
2. 限制速度: `--limit-rate 1M`
3. 增加并发: `--concurrent-fragments 8`
4. 使用 aria2: `--external-downloader aria2`

### 问题: 视频和音频分离

**解决方案**: 指定合并格式
```bash
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 "URL"
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

## 相关资源

- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [yt-dlp Wiki](https://github.com/yt-dlp/yt-dlp/wiki)
- [支持网站列表](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- [格式选择语法](https://github.com/yt-dlp/yt-dlp#format-selection)
- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)

## 贡献

如果你有改进建议或发现了问题，欢迎提交 Issue 或 Pull Request！

## 许可证

MIT License - 与 yt-dlp 项目保持一致
