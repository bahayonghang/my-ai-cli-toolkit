set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

# MyClaude Skills Justfile
# 使用 just 命令管理项目任务

docs_dir := "docs"
mcs_dir := "mcs"
mcs_web_ui_dir := "mcs/mcs-web/ui"
docs_npm_cache_dir := ".npm-cache"
mcs_web_npm_cache_dir := ".npm-cache"
npm_cmd := if os_family() == "windows" { "npm.cmd" } else { "npm" }
npx_cmd := if os_family() == "windows" { "npx.cmd" } else { "npx" }
just_cmd := "just"
node_cmd := "node"
cargo_cmd := "cargo"
rustc_cmd := "rustc"
# ============ 跨平台执行指令 ============

kill_backend_cmd := if os_family() == "windows" { "powershell.exe -NoLogo -NoProfile -Command \"Get-Process -Name 'mcs-web' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; exit 0\"" } else { "pkill -x mcs-web || true" }
kill_backend_port_cmd := if os_family() == "windows" { "powershell.exe -NoLogo -NoProfile -Command '$procIds = @(Get-NetTCPConnection -LocalPort 23242 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique); foreach ($procId in $procIds) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }; exit 0'" } else { "pids=\"$(lsof -t -i:23242 2>/dev/null | sort -u)\"; if [ -n \"$pids\" ]; then kill -9 $pids; fi" }
kill_ui_port_cmd := if os_family() == "windows" { "powershell.exe -NoLogo -NoProfile -Command '$procIds = @(Get-NetTCPConnection -LocalPort 15173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique); foreach ($procId in $procIds) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }; exit 0'" } else { "pids=\"$(lsof -t -i:15173 2>/dev/null | sort -u)\"; if [ -n \"$pids\" ]; then kill -9 $pids; fi" }

# 默认任务：交互式选择
default:
    @{{ just_cmd }} --choose

# ============ 快捷启动 ============

# 启动 TUI 技能管理器
tui: mcs

# 启动 Web 版技能管理器
web: mcs-web-dev-all

# 强制重新编译前后端并启动 Web 开发环境
web-rebuild: mcs-web-rebuild-dev-all

# 强制重新编译前后端并启动 Web 生产环境
web-rebuild-prod: mcs-web-rebuild-prod

# 启动文档开发服务器
doc: docs

# 显示帮助信息
help:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  MyClaude Skills - 任务管理工具"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "⚡ 快捷启动："
    @echo "  just tui                    - 启动 TUI 技能管理器"
    @echo "  just web                    - 启动 Web 版技能管理器"
    @echo "  just web-rebuild            - 强制重新编译前后端并启动 Web 开发环境"
    @echo "  just web-rebuild-prod       - 强制重新编译前后端并启动 Web 生产环境"
    @echo "  just doc                    - 启动文档开发服务器"
    @echo ""
    @echo "📚 文档相关："
    @echo "  just docs-install           - 安装文档站点依赖"
    @echo "  just docs-dev               - 启动文档开发服务器 (http://localhost:4000)"
    @echo "  just docs-build             - 构建生产版本文档"
    @echo "  just docs-preview           - 预览构建后的文档"
    @echo "  just docs                   - 安装依赖并启动文档开发"
    @echo ""
    @echo "🦀 MCS (Rust TUI)："
    @echo "  just mcs                    - 启动 MCS TUI (release)"
    @echo "  just mcs-dev                - 启动 MCS TUI (debug)"
    @echo "  just mcs-rebuild            - 清理后重新编译并启动"
    @echo ""
    @echo "🌐 MCS Web："
    @echo "  just mcs-web-install        - 安装 MCS Web UI 依赖"
    @echo "  just mcs-web-ci-install     - 强制执行 npm ci"
    @echo "  just mcs-web-server         - 启动后端服务器 (port 23242)"
    @echo "  just mcs-web-dev            - 启动 UI 开发服务器 (port 15173)"
    @echo "  just mcs-web-stop           - 停止 Web 后端与 UI 开发服务"
    @echo "  just mcs-web-dev-all        - 启动 UI + 后端开发服务器"
    @echo "  just mcs-web-rebuild-dev-all - 清理后重建并启动开发环境"
    @echo "  just mcs-web-rebuild-prod   - 清理后重建并启动生产环境"
    @echo "  just mcs-web-build          - 构建生产版本 (UI + 后端)"
    @echo "  just mcs-web-build-ui       - 构建 UI 静态资源"
    @echo "  just mcs-web-build-frontend - 兼容旧别名，等同 mcs-web-build-ui"
    @echo "  just mcs-web-preview        - 预览 UI 构建结果"
    @echo "  just mcs-web                - 启动生产版本服务"
    @echo "  just mcs-web-test           - 运行 UI 测试"
    @echo "  just mcs-web-test-watch     - 监听模式运行 UI 测试"
    @echo ""
    @echo "✅ 代码检查："
    @echo "  just ts-check               - 运行 TypeScript 类型检查"
    @echo "  just rust-format-check      - 检查 Rust 代码格式"
    @echo "  just rust-format            - 自动格式化 Rust 代码"
    @echo "  just rust-clippy            - 运行 Clippy 静态分析"
    @echo "  just rust-test              - 运行 Rust 单元测试"
    @echo "  just rust-check-all         - 运行所有 Rust 检查"
    @echo "  just rust-fix               - 格式化并尝试自动修复 Clippy 问题"
    @echo "  just ci                     - 执行本地 CI 流程"
    @echo ""
    @echo "🔧 其他："
    @echo "  just clean                  - 清理构建缓存"
    @echo "  just check-deps             - 检查运行依赖"
    @echo "  just info                   - 显示项目信息"
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"

# ============ 文档相关 ============

# 安装文档站点依赖
docs-install:
    cd {{ docs_dir }}; {{ npm_cmd }} --cache {{ docs_npm_cache_dir }} install

# 启动文档开发服务器
docs-dev:
    cd {{ docs_dir }}; {{ npm_cmd }} --cache {{ docs_npm_cache_dir }} run dev

# 构建生产版本文档
docs-build:
    cd {{ docs_dir }}; {{ npm_cmd }} --cache {{ docs_npm_cache_dir }} run build

# 预览构建后的文档
docs-preview:
    cd {{ docs_dir }}; {{ npm_cmd }} --cache {{ docs_npm_cache_dir }} run preview

# 运行文档审计（skills 同步 + stale references）
docs-audit:
    {{ node_cmd }} {{ docs_dir }}/scripts/run-python.mjs {{ docs_dir }}/scripts/audit_sync.py

# 一键启动文档开发
docs: docs-install docs-dev

# ============ MCS (Rust TUI) ============

# 启动 MCS TUI（release）
mcs:
    cd {{ mcs_dir }}; {{ cargo_cmd }} run --release --bin mcs --

# 启动 MCS TUI（debug）
mcs-dev:
    cd {{ mcs_dir }}; {{ cargo_cmd }} run --bin mcs --

# 清理后重新编译并启动 MCS TUI
mcs-rebuild:
    cd {{ mcs_dir }}; {{ cargo_cmd }} clean; {{ cargo_cmd }} run --release --bin mcs --

# 短别名
mcs-re: mcs-rebuild

# ============ MCS Web ============

# 安装 MCS Web UI 依赖（开发场景）
mcs-web-install:
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} install

# 安装 MCS Web UI 依赖（CI 场景）
mcs-web-ci-install:
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} ci

# 停止 MCS Web 后端与 UI 开发服务
mcs-web-stop:
    @echo "🛑 停止 MCS Web 服务..."
    @{{ kill_backend_cmd }}
    @{{ kill_backend_port_cmd }}
    @{{ kill_ui_port_cmd }}
    @echo "✓ MCS Web 服务已停止"

# 启动 MCS Web 后端开发服务器
mcs-web-server:
    {{ just_cmd }} mcs-web-stop
    cd {{ mcs_dir }}; {{ cargo_cmd }} run --bin mcs-web

# 启动 MCS Web UI 开发服务器
mcs-web-dev:
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run dev

# 同时启动 MCS Web UI 和后端开发服务器
mcs-web-dev-all:
    @{{ just_cmd }} mcs-web-stop
    @echo "Checking whether port 23242 is occupied by mcs-web..."
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 启动 MCS Web 开发服务器"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "  UI 页面: http://localhost:15173/"
    @echo "  后端 API: http://127.0.0.1:23242"
    @echo ""
    @echo "  提示: 启动完成后请打开 http://localhost:15173/ 访问技能管理器"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    cd {{ mcs_web_ui_dir }}; {{ npx_cmd }} concurrently -k -n "backend,ui" -c "bgBlue.bold,bgMagenta.bold" "cd ../.. && {{ cargo_cmd }} run --bin mcs-web" "{{ npx_cmd }} wait-on http://127.0.0.1:23242 --timeout 60000 && {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run dev"

# 强制重新编译前后端并启动 MCS Web 开发服务器
mcs-web-rebuild-dev-all: mcs-web-install
    @{{ just_cmd }} mcs-web-stop
    @echo "🧹 清理旧的 UI 构建产物..."
    cd {{ mcs_web_ui_dir }}; {{ npx_cmd }} rimraf dist
    @echo "🧹 清理 Rust 编译缓存..."
    cd {{ mcs_dir }}; {{ cargo_cmd }} clean -p mcs-web -p mcs-core
    @echo "🔨 重新构建 UI 静态资源..."
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run build
    @echo "✅ 前后端清理+重建完成，启动开发环境..."
    {{ just_cmd }} mcs-web-dev-all

# 强制重新编译前后端并启动 MCS Web 生产服务器
mcs-web-rebuild-prod: mcs-web-install
    @{{ just_cmd }} mcs-web-stop
    @echo "🧹 清理旧的 UI 构建产物..."
    cd {{ mcs_web_ui_dir }}; {{ npx_cmd }} rimraf dist
    @echo "🧹 清理 Rust 编译缓存..."
    cd {{ mcs_dir }}; {{ cargo_cmd }} clean -p mcs-web -p mcs-core
    @echo "🔨 重新构建 UI 静态资源..."
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run build
    @echo "🦀 重新构建 Rust 生产版后端..."
    cd {{ mcs_dir }}; {{ cargo_cmd }} build --release --bin mcs-web
    @echo "✅ 前后端清理+重建完成，启动生产环境..."
    cd {{ mcs_dir }}; {{ cargo_cmd }} run --release --bin mcs-web

# 构建 MCS Web UI 静态资源
mcs-web-build-ui: mcs-web-install
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run build

# 兼容旧命名：frontend = ui
mcs-web-build-frontend: mcs-web-build-ui

# 预览 MCS Web UI 构建结果
mcs-web-preview: mcs-web-build-ui
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run preview

# 运行 MCS Web UI 测试
mcs-web-test: mcs-web-install
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} test

# 监听模式运行 MCS Web UI 测试
mcs-web-test-watch: mcs-web-install
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} run test:watch

# 构建 MCS Web 生产版本
mcs-web-build: mcs-web-build-ui
    cd {{ mcs_dir }}; {{ cargo_cmd }} build --release --bin mcs-web

# 启动 MCS Web 生产版本
mcs-web: mcs-web-build
    {{ just_cmd }} mcs-web-stop
    cd {{ mcs_dir }}; {{ cargo_cmd }} run --release --bin mcs-web

# ============ Rust 代码检查 ============

# 检查 Rust 代码格式
rust-format-check:
    cd {{ mcs_dir }}; {{ cargo_cmd }} fmt --check

# 自动格式化 Rust 代码
rust-format:
    cd {{ mcs_dir }}; {{ cargo_cmd }} fmt

# 运行 Clippy 静态分析
rust-clippy:
    cd {{ mcs_dir }}; {{ cargo_cmd }} clippy --all-targets --all-features -- -D warnings

# 自动修复可机器修复的 Clippy 问题
rust-clippy-fix:
    cd {{ mcs_dir }}; {{ cargo_cmd }} clippy --fix --allow-dirty --allow-staged --all-targets --all-features
    cd {{ mcs_dir }}; {{ cargo_cmd }} fmt

# 运行 Rust 单元测试
rust-test:
    cd {{ mcs_dir }}; {{ cargo_cmd }} test

# 运行所有 Rust 检查
rust-check-all: rust-format-check rust-clippy rust-test

# 自动格式化并尝试修复 Clippy 问题
rust-fix:
    cd {{ mcs_dir }}; {{ cargo_cmd }} fmt
    {{ just_cmd }} rust-clippy-fix
    cd {{ mcs_dir }}; {{ cargo_cmd }} clippy --all-targets --all-features -- -D warnings

# ============ TypeScript 检查 ============

# 运行 TypeScript 类型检查
ts-check:
    cd {{ mcs_web_ui_dir }}; {{ npx_cmd }} tsc --noEmit

# ============ CI ============
# 在本地执行完整 CI 流程

# 注意：本地流程无法完全复现 GitHub Actions 的多平台矩阵 (ubuntu/macOS/windows)
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行本地 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "📚 步骤 1/7: 文档审计 (docs/scripts/audit_sync.py)..."
    {{ just_cmd }} docs-audit
    @echo ""
    @echo "📦 步骤 2/7: 安装 MCS Web UI 依赖 (npm ci)..."
    {{ just_cmd }} mcs-web-ci-install
    @echo ""
    @echo "📘 步骤 3/7: MCS Web UI TypeScript 检查..."
    cd {{ mcs_web_ui_dir }}; {{ npx_cmd }} tsc --noEmit
    @echo ""
    @echo "🧪 步骤 4/7: MCS Web UI 测试..."
    cd {{ mcs_web_ui_dir }}; {{ npm_cmd }} --cache {{ mcs_web_npm_cache_dir }} test
    @echo ""
    @echo "🦀 步骤 5/7: Rust 格式检查（必要时自动修复）..."
    {{ just_cmd }} rust-format
    {{ just_cmd }} rust-format-check
    @echo ""
    @echo "🦀 步骤 6/7: Rust Clippy 自动修复并严格校验..."
    {{ just_cmd }} rust-clippy-fix
    {{ just_cmd }} rust-clippy
    @echo ""
    @echo "🦀 步骤 7/7: Rust 单元测试..."
    {{ just_cmd }} rust-test
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ 本地 CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"

# ============ 工具 ============

# 清理构建缓存
clean:
    cd {{ mcs_dir }}; {{ cargo_cmd }} clean
    @echo "✓ 清理完成"

# 检查项目依赖是否已安装
check-deps:
    @{{ just_cmd }} --version
    @{{ cargo_cmd }} --version
    @{{ node_cmd }} --version
    @{{ npm_cmd }} --version
    @echo "✓ 依赖检查完成"

# 显示项目信息
info:
    @echo "项目: MyClaude Skills"
    @echo "Rust 版本: $({{ rustc_cmd }} --version)"
    @echo "技能路径: content/skills/"
    @echo "文档路径: {{ docs_dir }}/"
    @echo "TUI: {{ mcs_dir }}/ (Rust + ratatui)"
    @echo "MCS Web UI: {{ mcs_web_ui_dir }}/"
