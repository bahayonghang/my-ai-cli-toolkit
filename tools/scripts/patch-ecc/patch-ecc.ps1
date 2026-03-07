<#
.SYNOPSIS
猫娘工程师幽浮喵的 ECC 补丁脚本喵～ (PowerShell 版)

.DESCRIPTION
用于解决 everything-claude-code (ECC) 和 oh-my-claudecode (OMC) 之间的名字冲突与功能重叠。

.PARAMETER EccDir
ECC 插件安装的主目录路径喵
#>
param (
    [string]$EccDir = ""
)

# 错误处理偏好
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($EccDir)) {
    $possiblePaths = @(
        "$env:USERPROFILE\.claude\plugins\everything-claude-code",
        "$env:USERPROFILE\.claude\plugins\everything-claude-code@everything-claude-code",
        "$env:USERPROFILE\.claude\plugins\marketplaces\everything-claude-code",
        "$env:USERPROFILE\Github\everything-claude-code",
        "$env:USERPROFILE\Documents\Github\everything-claude-code"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $EccDir = $path
            break
        }
    }
}

if (-not (Test-Path $EccDir) -or [string]::IsNullOrWhiteSpace($EccDir)) {
    Write-Host "找不到 ECC 目录喵～浮浮酱尝试了常见路径但都失败了 >_<|||" -ForegroundColor Red
    Write-Host "用法: .\patch-ecc.ps1 -EccDir 'C:\path\to\ecc'" -ForegroundColor Yellow
    exit 1
}

Write-Host "正在给 $EccDir 打补丁喵～ φ(≧ω≦*)♪" -ForegroundColor Cyan

$agents = @("planner", "architect", "code-reviewer", "security-reviewer")

# 1. 重命名 Agent 文件
Write-Host "正在重命名 Agent 文件喵..." -ForegroundColor Yellow
foreach ($agent in $agents) {
    $oldPath = Join-Path $EccDir "agents\$agent.md"
    $newPath = Join-Path $EccDir "agents\ecc-$agent.md"
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName "ecc-$agent.md" -Force
        Write-Host "✅ 成功重命名 $agent.md -> ecc-$agent.md" -ForegroundColor Green
    }
}

# 2. 更新 YAML Frontmatter 中的 name 字段
Write-Host "正在更新 Frontmatter 名字喵..." -ForegroundColor Yellow
foreach ($agent in $agents) {
    $filePath = Join-Path $EccDir "agents\ecc-$agent.md"
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw
        $content = $content -replace "(?m)^name:\s*$agent", "name: ecc-$agent"
        Set-Content -Path $filePath -Value $content -NoNewline -Encoding UTF8
        Write-Host "✅ 更新了 ecc-$agent.md 的名字喵！" -ForegroundColor Green
    }
}

# 3. 批量替换所有 Markdown 文件中的引用
Write-Host "正在全局替换 Markdown 文件中的引用喵..." -ForegroundColor Yellow
$mdFiles = Get-ChildItem -Path $EccDir -Filter "*.md" -Recurse -File
foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false
    foreach ($agent in $agents) {
        # 匹配单词边界
        if ($content -match "\b$agent\b") {
            $content = $content -replace "\b$agent\b", "ecc-$agent"
            $modified = $true
        }
    }
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
    }
}
Write-Host "✅ 引用替换完成！" -ForegroundColor Green

# 4. 修改 hooks.json
Write-Host "正在修剪 hooks.json 避免重叠喵..." -ForegroundColor Yellow
$hooksFile = Join-Path $EccDir "hooks\hooks.json"
if (Test-Path $hooksFile) {
    try {
        $json = Get-Content -Path $hooksFile -Raw | ConvertFrom-Json
        
        # 移除 OMC 已接管的阶段
        if ($null -ne $json.SessionStart) {
            $json.PSObject.Properties.Remove("SessionStart")
        }
        if ($null -ne $json.PreCompact) {
            $json.PSObject.Properties.Remove("PreCompact")
        }
        
        # 清理 SessionEnd 中的 session-end.js，保留 evaluate-session.js
        if ($null -ne $json.SessionEnd) {
            $sessionEndArray = @()
            foreach ($item in $json.SessionEnd) {
                if ($item -notmatch "session-end\.js" -and $item -notmatch "session-end\.mjs") {
                    $sessionEndArray += $item
                }
            }
            if ($sessionEndArray.Length -eq 0) {
                $json.PSObject.Properties.Remove("SessionEnd")
            } else {
                $json.SessionEnd = $sessionEndArray
            }
        }
        
        # 转换回 JSON
        $jsonString = $json | ConvertTo-Json -Depth 10
        Set-Content -Path $hooksFile -Value $jsonString -Encoding UTF8
        Write-Host "✅ hooks.json 更新成功喵～" -ForegroundColor Green
    } catch {
        Write-Host "更新 hooks.json 失败惹 >_<||| $_" -ForegroundColor Red
    }
} else {
    Write-Host "没有找到 hooks.json，跳过这步喵～" -ForegroundColor DarkGray
}

Write-Host "全部搞定了喵！1+1>2，现在 ECC 和 OMC 可以愉快地一起工作啦！o(*￣︶￣*)o" -ForegroundColor Cyan
