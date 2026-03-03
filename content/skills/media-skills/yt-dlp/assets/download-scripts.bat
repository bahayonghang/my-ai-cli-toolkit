@echo off
REM yt-dlp 常用脚本示例 (Windows)
REM 使用方法: 双击运行或在命令行执行

setlocal

REM ==================== 依赖检测 ====================

:check_ffmpeg
REM FFmpeg 检测函数
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: FFmpeg 未安装!
    echo.
    echo yt-dlp 需要 FFmpeg 来合并视频和音频。
    echo.
    echo 请先安装 FFmpeg:
    echo   Scoop:     scoop install ffmpeg
    echo   Chocolatey: choco install ffmpeg
    echo   winget:    winget install ffmpeg
    echo.
    echo 或运行检测脚本获取详细指引:
    echo   powershell -File examples\check-ffmpeg.ps1
    echo.
    exit /b 1
)
goto :eof

REM ==================== 配置区域 ====================
REM 设置默认下载目录（根据需要修改）
set DOWNLOAD_DIR=C:\Users\%USERNAME%\Downloads

REM ==================== 基础下载 ====================

:download_best
REM 下载单个视频（最佳质量）
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

:download_1080p
REM 下载 1080p 视频
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

:download_audio
REM 仅下载音频（MP3）
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

REM ==================== 播放列表下载 ====================

:download_playlist
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
REM 下载播放列表（带序号）
yt-dlp -f "bestvideo+bestaudio/best" -o "%DOWNLOAD_DIR%\%%(playlist_index)s-%%(title)s.%%(ext)s" %1
goto :eof

:download_playlist_limited
REM 下载播放列表（限制数量）
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp --playlist-end 10 -o "%DOWNLOAD_DIR%\%%(playlist_index)s-%%(title)s.%%(ext)s" %1
goto :eof

REM ==================== 字幕下载 ====================

:download_subs
REM 下载所有字幕
yt-dlp --write-subs --sub-langs all --skip-download %1
goto :eof

:download_embed_subs
REM 下载带内嵌字幕的视频
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp --embed-subs --sub-langs en,zh -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

REM ==================== 批量下载 ====================

:batch_download
REM 从文件批量下载
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp -a urls.txt -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s"
goto :eof

:batch_download_audio
REM 批量下载音频
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp -a urls.txt -x --audio-format mp3 -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s"
goto :eof

REM ==================== 高级用法 ====================

:download_with_proxy
REM 使用代理下载
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp --proxy http://127.0.0.1:7890 -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

:download_with_cookie
REM 使用 cookie 下载
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp --cookies cookies.txt -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

:download_metadata
REM 下载并保存完整元数据
call :check_ffmpeg
if %errorlevel% neq 0 exit /b 1
yt-dlp --write-info-json --write-description --write-thumbnail --embed-thumbnail --embed-subs -o "%DOWNLOAD_DIR%\%%(title)s.%%(ext)s" %1
goto :eof

REM ==================== 维护相关 ====================

:update_ytdlp
REM 更新 yt-dlp
yt-dlp --update
goto :eof

:list_formats
REM 查看可用格式
yt-dlp --list-formats %1
goto :eof

:show_info
REM 查看视频信息
yt-dlp --dump-json %1
goto :eof

REM ==================== 主菜单 ====================

:menu
echo ============================================
echo yt-dlp 常用功能菜单
echo ============================================
echo.
echo 1. 下载最佳质量视频
echo 2. 下载 1080p 视频
echo 3. 仅下载音频（MP3）
echo 4. 下载播放列表
echo 5. 下载所有字幕
echo 6. 批量下载（从 urls.txt）
echo 7. 查看可用格式
echo 8. 更新 yt-dlp
echo 9. 退出
echo.
set /p choice=请选择功能 (1-9):

if "%choice%"=="1" (
    set /p url=请输入视频 URL:
    call :download_best %url%
)
if "%choice%"=="2" (
    set /p url=请输入视频 URL:
    call :download_1080p %url%
)
if "%choice%"=="3" (
    set /p url=请输入视频 URL:
    call :download_audio %url%
)
if "%choice%"=="4" (
    set /p url=请输入播放列表 URL:
    call :download_playlist %url%
)
if "%choice%"=="5" (
    set /p url=请输入视频 URL:
    call :download_subs %url%
)
if "%choice%"=="6" (
    call :batch_download
)
if "%choice%"=="7" (
    set /p url=请输入视频 URL:
    call :list_formats %url%
)
if "%choice%"=="8" (
    call :update_ytdlp
)
if "%choice%"=="9" (
    goto :end
)

pause
goto :menu

:end
endlocal
