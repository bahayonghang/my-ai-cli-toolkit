# FFmpeg 检测脚本 (Windows PowerShell)
# 检测 FFmpeg 是否已安装，如未安装则提供安装指引

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "FFmpeg 依赖检测工具" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检测 FFmpeg
Write-Host "正在检测 FFmpeg..." -ForegroundColor Yellow

try {
    $ffmpegOutput = ffmpeg -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $versionLine = $ffmpegOutput[0]
        Write-Host "✅ FFmpeg 已安装!" -ForegroundColor Green
        Write-Host "   版本信息: $versionLine"
        Write-Host ""
        Write-Host "可以继续使用 yt-dlp 下载视频了喵~"
        exit 0
    }
} catch {
    # FFmpeg 未找到
}

Write-Host "❌ FFmpeg 未安装!" -ForegroundColor Red
Write-Host ""
Write-Host "FFmpeg 是 yt-dlp 的必需依赖，用于:"
Write-Host "  • 视频和音频合并"
Write-Host "  • 格式转换"
Write-Host "  • 字幕嵌入"
Write-Host ""

# 检测包管理器
Write-Host "请选择安装方式:" -ForegroundColor Cyan
Write-Host ""

# 检测 Scoop
if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "1. Scoop (已安装，推荐)" -ForegroundColor Green
    Write-Host "   scoop install ffmpeg"
    Write-Host ""
} else {
    Write-Host "1. Scoop (推荐)"
    Write-Host "   安装 Scoop: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    Write-Host "               Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression"
    Write-Host "   安装 FFmpeg: scoop install ffmpeg"
    Write-Host ""
}

# 检测 Chocolatey
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "2. Chocolatey (已安装)" -ForegroundColor Green
    Write-Host "   choco install ffmpeg"
    Write-Host ""
} else {
    Write-Host "2. Chocolatey"
    Write-Host "   安装 Chocolatey（需管理员权限）:"
    Write-Host "   Set-ExecutionPolicy Bypass -Scope Process -Force"
    Write-Host "   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072"
    Write-Host "   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    Write-Host "   安装 FFmpeg: choco install ffmpeg"
    Write-Host ""
}

# 检测 winget
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "3. winget (已安装)" -ForegroundColor Green
    Write-Host "   winget install ffmpeg"
    Write-Host ""
} else {
    Write-Host "3. winget (Windows 10/11 内置)"
    Write-Host "   winget install ffmpeg"
    Write-Host ""
}

Write-Host "4. 手动下载"
Write-Host "   访问 https://ffmpeg.org/download.html#build-windows"
Write-Host "   下载并添加到系统 PATH"
Write-Host ""

Write-Host "安装完成后，请重新运行此脚本验证:" -ForegroundColor Cyan
Write-Host "   powershell -ExecutionPolicy Bypass -File $PSCommandPath"
Write-Host ""
Write-Host "或者手动验证:"
Write-Host "   ffmpeg -version"
Write-Host ""

exit 1
