---
name: yt-dlp
description: "Download videos via yt-dlp from YouTube, Bilibili, Twitter/X, TikTok, and 1000+ sites. Use when downloading video, extracting audio/music, grabbing subtitles/captions, or saving any online media. Trigger this skill whenever the user wants to download, save, rip, or extract media from a URL — even if they don't mention yt-dlp by name."
version: 1.1.0
license: MIT
category: visual-media-design
tags: [video-download, youtube, bilibili, subtitle, media, audio, music, tiktok, twitter]
argument-hint: [video-url]
allowed-tools: Read, Bash(yt-dlp *, ffmpeg -version)
---

# yt-dlp Video Downloader

## When To Use

- Downloading a public video or audio asset from a supported site
- Extracting audio, subtitles, or metadata from a media URL
- Saving media locally when the user provides a concrete URL

## Do Not Use

- DRM-protected streams you cannot legally or technically access
- Private content that requires credentials the user did not provide
- Browser automation tasks that need site interaction beyond yt-dlp

## Workflow

1. Check if `$ARGUMENTS` provides a URL. If empty, ask the user for a video URL.
2. Determine the user's requirements:
   - video vs audio
   - target quality / format
   - subtitles or metadata needs
   - output directory if the user gave one
3. Check whether FFmpeg is installed by running `ffmpeg -version`.
   - If FFmpeg is missing, stop and show installation guidance instead of starting a partial download flow.
4. Read `$SKILL_DIR/references/COMMANDS.md` for format selection syntax and command templates.
5. Read `$SKILL_DIR/references/TROUBLESHOOTING.md` for site-specific rules such as cookies, rate limits, or proxy requirements.
6. Resolve the output location:
   - use the user-provided path when present
   - otherwise default to the user's downloads folder (`~/Downloads` or `%USERPROFILE%/Downloads`)
7. Execute the `yt-dlp` command with a clear output template in the resolved directory.
8. Verify that the expected file exists locally after download.
9. If the command fails, match the error against `TROUBLESHOOTING.md`, apply one targeted retry, and stop after that if it still fails.

## Output

- The executed command
- Brief explanation of the parameters used
- Location of the downloaded file

## Failure Handling

- If the site requires cookies or login, say so explicitly and point to the troubleshooting reference.
- If subtitles are unavailable, report that clearly instead of implying a partial success was complete.
- If only audio was requested, say what container/codec was produced.
- If the retry also fails, include the error category and the next likely fix.

## Final Checklist

- URL and requested mode match the executed command
- Output path is explicit
- Download result was actually verified on disk
