# MyClaude Skills Justfile
# 使用 just 命令管理项目任务

# 默认任务：显示帮助信息
default:
    @just --choose

# ============ 快捷启动 ============

# 启动 TUI 技能管理器
tui: mcs

# 启动 Web 版技能管理器 (构建并启动 localhost:13142)
web: mcs-web

# 启动文档开发服务器
doc: docs

# 显示所有可用命令的帮助信息
help:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  MyClaude Skills - 任务管理工具"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "⚡ 快捷启动："
    @echo "  just tui               - 启动 TUI 技能管理器"
    @echo "  just web               - 启动 Web 版技能管理器 (localhost:13142)"
    @echo "  just doc               - 启动文档开发服务器"
    @echo ""
    @echo "📚 文档相关命令："
    @echo "  just docs-install      - 安装文档站点依赖"
    @echo "  just docs-dev          - 启动文档开发服务器 (http://localhost:4000)"
    @echo "  just docs-build        - 构建生产版本文档"
    @echo "  just docs-preview      - 预览构建后的文档"
    @echo "  just docs              - 一键安装依赖并启动开发服务器"
    @echo ""
    @echo "🦀 MCS (Rust TUI)："
    @echo "  just mcs               - 启动 MCS TUI (由 cargo 自动判定是否重编译)"
    @echo "  just mcs-dev           - 开发模式 (debug 编译，更快)"
    @echo "  just mcs-rebuild       - 强制重新编译并启动"
    @echo ""
    @echo "🌐 MCS Web（Web 版技能管理）："
    @echo "  just mcs-web-install   - 安装前端依赖"
    @echo "  just mcs-web-server    - 启动后端服务器 (port 13142)"
    @echo "  just mcs-web-dev       - 启动前端开发服务器 (port 5173)"
    @echo "  just mcs-web-build     - 构建生产版本 (前端+后端)"
    @echo "  just mcs-web           - 一键构建并启动生产版本"
    @echo ""
    @echo "🦀 代码质量检查 (Rust - MCS)："
    @echo "  just rust-format-check - 检查 Rust 代码格式"
    @echo "  just rust-format       - 自动格式化 Rust 代码"
    @echo "  just rust-clippy       - 运行 Clippy 静态分析"
    @echo "  just rust-test         - 运行 Rust 单元测试"
    @echo "  just rust-check-all    - 运行所有 Rust 检查"
    @echo "  just rust-fix          - 格式化并运行检查"
    @echo ""
    @echo "📘 代码质量检查 (TypeScript - MCS Web)："
    @echo "  just ts-check          - 运行 TypeScript 类型检查"
    @echo ""
    @echo "🔧 其他命令："
    @echo "  just ci                - 在本地执行完整 CI 流程 (tsc + cargo)"
    @echo "  just clean             - 清理构建缓存"
    @echo "  just check-deps        - 检查项目依赖"
    @echo "  just info              - 显示项目信息"
    @echo ""
    @echo "💡 使用示例："
    @echo "  just tui                            # 启动技能管理 TUI"
    @echo "  just web                            # 启动 Web 版技能管理"
    @echo "  just doc                            # 快速启动文档开发"
    @echo "  just rust-fix                       # 修复 Rust 代码格式"
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"

# ============ 文档相关 ============

# 安装文档站点的 npm 依赖包
docs-install:
    cd docs && npm install

# 启动文档开发服务器 (支持热重载)
docs-dev:
    cd docs && npm run dev

# 构建生产版本的文档站点
docs-build:
    cd docs && npm run build

# 预览已构建的文档站点
docs-preview:
    cd docs && npm run preview

# 一键启动文档开发 (安装依赖 + 启动服务器)
docs: docs-install docs-dev

# ============ MCS (Rust TUI) ============

# 启动 MCS TUI（由 cargo 自动决定是否重编译）
mcs:
    cd mcs && cargo run --release --bin mcs --

# 开发模式启动 MCS TUI（debug 编译，更快）
mcs-dev:
    cd mcs && cargo run --bin mcs --

# 强制重新编译并启动 MCS TUI
mcs-rebuild:
    cd mcs && cargo clean && cargo run --release --bin mcs --

# 强制重新编译并启动 MCS TUI (短别名)
mcs-re: mcs-rebuild

# ============ MCS Web ============

# 安装 MCS Web 前端依赖
mcs-web-install:
    cd mcs/mcs-web/frontend && npm install

# 启动 MCS Web 后端开发服务器 (port 13142)
mcs-web-server:
    -taskkill /F /IM mcs-web.exe 2>nul || true
    cd mcs && cargo run --bin mcs-web

# 启动 MCS Web 前端开发服务器 (port 5173, 代理到 13142)
mcs-web-dev: mcs-web-install
    cd mcs/mcs-web/frontend && npm run dev

# 构建 MCS Web 前端生产版本
mcs-web-build-frontend: mcs-web-install
    cd mcs/mcs-web/frontend && npm run build

# 构建 MCS Web 生产版本 (前端 + 后端)
mcs-web-build: mcs-web-build-frontend
    cd mcs && cargo build --release --bin mcs-web

# 启动 MCS Web 生产版本 (构建并启动，port 13142)
mcs-web: mcs-web-build
    -taskkill /F /IM mcs-web.exe 2>nul || true
    cd mcs && ./target/release/mcs-web

# ============ Rust 代码检查 (MCS) ============

# 运行 Rust 格式检查 (不符则自动修复并报错)
rust-format-check:
    cd mcs && cargo fmt --check || (cargo fmt && false)

# 自动格式化 Rust 代码
rust-format:
    cd mcs && cargo fmt

# 运行 Clippy 静态分析 (自动修复 + 严格模式)
rust-clippy:
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings

# 运行 Rust 单元测试
rust-test:
    cd mcs && cargo test

# 运行所有 Rust 检查 (格式 + Clippy + 测试)
rust-check-all: rust-format-check rust-clippy rust-test

# 修复 Rust 代码格式并运行检查
rust-fix: rust-format rust-clippy

# ============ TypeScript 检查 (MCS Web) ============

# 运行 TypeScript 类型检查
ts-check:
    cd mcs/mcs-web/frontend && npx tsc --noEmit

# ============ CI ============

# 在本地执行完整 CI 流程 (与 GitHub Actions 保持一致)
# 注意: 本地 CI 无法完全复现 GitHub Actions 的多平台矩阵 (ubuntu/macOS/windows)
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "📘 步骤 1/4: MCS Web Frontend TypeScript 检查..."
    cd mcs/mcs-web/frontend && npx tsc --noEmit
    @echo ""
    @echo "🦀 步骤 2/4: Rust 格式检查 + 自动修复..."
    cd mcs && cargo fmt --check && echo "  ✓ mcs 格式正确" || (echo "  ⚠️ mcs 格式不符，自动修复中..." && cargo fmt && false)
    @echo ""
    @echo "🦀 步骤 3/4: Rust Clippy 静态分析 (自动修复 + 严格检查)..."
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    @echo ""
    @echo "🦀 步骤 4/4: Rust 单元测试..."
    cd mcs && cargo test
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"

# ============ 工具 ============

# 清理构建缓存
clean:
    cd mcs && cargo clean 2>/dev/null || true
    @echo "✓ 清理完成"

# 检查项目依赖是否已安装
check-deps:
    @cargo --version >/dev/null 2>&1 || echo "⚠️  缺少 cargo，请安装 Rust 工具链 (rustup)"
    @node --version >/dev/null 2>&1 || echo "⚠️  缺少 node，请安装 Node.js"
    @echo "✓ 依赖检查完成"

# 显示项目信息
info:
    @echo "项目: MyClaude Skills"
    @echo "Rust 版本: $(rustc --version)"
    @echo "技能路径: content/skills/"
    @echo "文档路径: docs/"
    @echo "TUI: mcs/ (Rust + ratatui)"
