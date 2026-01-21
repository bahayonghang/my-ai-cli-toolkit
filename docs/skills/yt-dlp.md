# yt-dlp Video Downloader

Powerful video downloader supporting 1000+ websites including YouTube, Bilibili, Twitter, Instagram, TikTok, and more.

## Features

- **Smart Format Selection**: Automatically chooses the best quality
- **Subtitle Support**: Download and embed subtitles in multiple languages
- **Playlist Support**: Batch download with resume capability
- **Metadata Preservation**: Save title, upload date, description, thumbnails
- **Audio Extraction**: Extract audio to MP3/FLAC/OPUS formats
- **FFmpeg Integration**: Automatic video/audio merging and format conversion
- **Proxy Support**: HTTP/SOCKS proxy for bypassing regional restrictions
- **Cookie Support**: Download premium/restricted content

## Quick Start

```bash
# Install the skill
python install.py install yt-dlp

# Basic usage
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"

# Download 1080p video
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# Extract audio only
yt-dlp -x --audio-format mp3 "URL"

# Download with subtitles
yt-dlp --embed-subs --sub-langs en,zh "URL"
```

## Prerequisites

**Important**: FFmpeg is required for yt-dlp to work properly. The skill includes automatic FFmpeg detection.

Install FFmpeg:

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

## AI-Assisted Workflow

When you provide a video URL, the AI assistant will:

1. **Check FFmpeg**: Verify FFmpeg is installed
2. **Identify Needs**: Ask about quality, audio vs video, subtitles
3. **Build Command**: Generate optimized yt-dlp command
4. **Execute Download**: Download to your Downloads folder
5. **Verify Results**: Check file integrity

## Example Usage

### Download YouTube Video

```
User: "Help me download this video https://www.youtube.com/watch?v=dQw4w9WgXcQ"

AI: I'll help you download that video.

✅ FFmpeg is installed: ffmpeg version 6.0

Downloading best quality video...
Command: yt-dlp -f "bestvideo+bestaudio" -o "~/Downloads/%(title)s.%(ext)s" "URL"

Result: Downloads/Rick Astley - Never Gonna Give You Up.mp4
```

### Download Playlist Audio

```
User: "Download this playlist as audio files"

AI: I'll extract audio from the entire playlist.

Command: yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "~/Downloads/%(playlist_index)s-%(title)s.%(ext)s" \
  "PLAYLIST_URL"

This will download all videos as MP3 files with playlist index numbers.
```

## Common Scenarios

### High-Quality Video

```bash
# 1080p video
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# 4K video
yt-dlp -f "bestvideo[height<=2160]+bestaudio" "URL"
```

### Audio Extraction

```bash
# Best quality MP3
yt-dlp -x --audio-format mp3 --audio-quality 0 "URL"

# Batch download podcast
yt-dlp -x --audio-format mp3 \
  -o "%(playlist_index)s-%(title)s.%(ext)s" \
  "PLAYLIST_URL"
```

### Subtitle Download

```bash
# Download all available subtitles
yt-dlp --write-subs --sub-langs all --skip-download "URL"

# Embed subtitles in video
yt-dlp --embed-subs --sub-langs en,zh "URL"
```

### Advanced Options

```bash
# Use proxy
yt-dlp --proxy http://127.0.0.1:7890 "URL"

# Limit download speed
yt-dlp --limit-rate 1M "URL"

# Download with metadata
yt-dlp --write-info-json --write-description \
  --write-thumbnail --embed-subs "URL"

# Batch download from file
yt-dlp -a urls.txt
```

## Skill Structure

```
skills/yt-dlp/
├── SKILL.md                    # Main skill definition
├── README.md                   # Usage documentation
├── config/
│   └── yt-dlp.conf            # Configuration template
└── examples/
    ├── check-ffmpeg.py         # FFmpeg detection (Python)
    ├── check-ffmpeg.sh         # FFmpeg detection (Bash)
    ├── check-ffmpeg.ps1        # FFmpeg detection (PowerShell)
    ├── download-scripts.sh     # Linux/macOS scripts
    ├── download-scripts.bat    # Windows scripts
    └── urls.txt                # Batch download template
```

## Detection Scripts

The skill includes cross-platform FFmpeg detection:

```bash
# Python (recommended)
python examples/check-ffmpeg.py

# Bash (macOS/Linux)
bash examples/check-ffmpeg.sh

# PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File examples/check-ffmpeg.ps1
```

Each script will:
- Detect if FFmpeg is installed
- Show version if available
- Provide installation instructions for your OS
- Exit with error code if not installed

## Supported Sites

Popular supported sites include:
- YouTube
- Bilibili
- Twitter/X
- Instagram
- TikTok
- Vimeo
- Twitch
- Coursera
- And 1000+ more

[View full list](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## Configuration

### Global Config

Create `~/.config/yt-dlp/config` (Linux/macOS) or `%APPDATA%\yt-dlp\config.txt` (Windows):

```ini
# Default output directory
-o ~/Downloads/%(title)s.%(ext)s

# Default format
-f bestvideo+bestaudio/best

# Download subtitles
--write-subs
--sub-langs en,zh

# Limit speed
--limit-rate 2M
```

### Project Config

Create `yt-dlp.conf` in your project directory:

```ini
-o ./videos/%(title)s.%(ext)s
--cookies cookies.txt
--download-archive downloaded.txt
```

## Format Selection

yt-dlp uses a powerful format selection syntax:

```bash
# Best video + audio (merge)
bestvideo+bestaudio

# Single file (already merged)
best

# With filters
bestvideo[height<=1080]+bestaudio    # Max 1080p
bestvideo[fps<=30]+bestaudio         # Max 30fps
bestvideo[filesize<500M]+bestaudio   # Under 500MB

# Fallback
bestvideo+bestaudio/best  # Try merged, then single file
```

## Troubleshooting

### FFmpeg Not Found

```bash
# Check installation
ffmpeg -version

# Reinstall if needed
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu
scoop install ffmpeg  # Windows
```

### Video/Audio Separate

yt-dlp downloads high-quality video and audio separately, then merges them with FFmpeg.

```bash
# Ensure FFmpeg is installed
ffmpeg -version

# Force specific format
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 "URL"
```

### Download Slow

```bash
# Limit speed to avoid throttling
yt-dlp --limit-rate 1M "URL"

# Use proxy
yt-dlp --proxy http://127.0.0.1:7890 "URL"

# Increase concurrent fragments
yt-dlp --concurrent-fragments 8 "URL"
```

### Bilibili Premium

Bilibili requires cookies for member content:

```bash
# Export cookies using browser extension
yt-dlp --cookies cookies.txt "URL"
```

## Advanced Features

### Download Archive

Avoid re-downloading:

```bash
yt-dlp --download-archive archive.txt "PLAYLIST_URL"
```

### Template Naming

```bash
# Include uploader
-o "%(uploader)s/%(title)s.%(ext)s"

# Include date
-o "%(upload_date)s-%(title)s.%(ext)s"

# Full metadata
-o "%(uploader)s/%(upload_date)s-%(title)s-[%(id)s].%(ext)s"
```

### Batch Download

```bash
# Create URLs file
cat > urls.txt << EOF
https://www.youtube.com/watch?v=VIDEO1
https://www.youtube.com/watch?v=VIDEO2
EOF

# Download all
yt-dlp -a urls.txt
```

## References

- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [Official Documentation](https://github.com/yt-dlp/yt-dlp#readme)
- [Format Selection](https://github.com/yt-dlp/yt-dlp#format-selection)
- [Supported Sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## License

MIT License - Same as yt-dlp project

---

**Note**: Please comply with website terms of service and copyright laws. Only download content you have the right to access.
