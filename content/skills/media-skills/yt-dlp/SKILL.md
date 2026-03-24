---
name: yt-dlp
description: "Download videos via yt-dlp from YouTube, Bilibili, Twitter/X, TikTok, and 1000+ sites. Use when downloading video, extracting audio/music, grabbing subtitles/captions, or saving any online media. Trigger this skill whenever the user wants to download, save, rip, or extract media from a URL — even if they don't mention yt-dlp by name."
version: 1.0.0
license: MIT
category: media-processing
tags: [video-download, youtube, bilibili, subtitle, media, audio, music, tiktok, twitter]
argument-hint: [video-url]
allowed-tools: Read, Bash(yt-dlp *, ffmpeg -version)
---

# yt-dlp Video Downloader

1. Check if `$ARGUMENTS` provides a URL. If empty, ask the user for a video URL.
2. Check if FFmpeg is installed by running `ffmpeg -version`. If not installed, prompt the user with OS-specific installation commands and wait for confirmation. Do NOT run yt-dlp without FFmpeg.
3. Determine the user's requirements (video vs audio, target quality, subtitles, metadata).
4. Read `$SKILL_DIR/references/COMMANDS.md` for format selection syntax and command templates.
5. Read `$SKILL_DIR/references/TROUBLESHOOTING.md` for site-specific rules (e.g., requiring cookies or proxies).
6. Execute the `yt-dlp` command in the user's downloads folder (e.g., `~/Downloads` or `%USERPROFILE%/Downloads`).
7. Verify that the output file downloaded successfully.
8. If the download fails, read `$SKILL_DIR/references/TROUBLESHOOTING.md` and match the error type (e.g., HTTP 403, slow speed, missing subtitles) to the corresponding troubleshooting section. Apply the suggested fix and retry once. If the retry also fails, report the error details to the user.

## Output

- The executed command
- Brief explanation of the parameters used
- Location of the downloaded file
