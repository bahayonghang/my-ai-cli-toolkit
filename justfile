# MyClaude Skills Justfile
# 使用 just 命令管理项目任务

# 默认任务：显示帮助信息
default:
    @just --choose

# 显示所有可用命令的帮助信息
help:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  MyClaude Skills - 任务管理工具"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "📚 文档相关命令："
    @echo "  just docs-install      - 安装文档站点依赖"
    @echo "  just docs-dev          - 启动文档开发服务器 (http://localhost:5173)"
    @echo "  just docs-build        - 构建生产版本文档"
    @echo "  just docs-preview      - 预览构建后的文档"
    @echo "  just docs              - 一键安装依赖并启动开发服务器"
    @echo ""
    @echo "🦀 MCS (Rust TUI)："
    @echo "  just mcs               - 启动 MCS TUI (由 cargo 自动判定是否重编译)"
    @echo "  just mcs-dev           - 开发模式 (debug 编译，更快)"
    @echo "  just mcs-rebuild       - 强制重新编译并启动"
    @echo ""
    @echo "🦀 代码质量检查 (Rust - AgentKit Desktop + MCS)："
    @echo "  just rust-format-check - 检查 Rust 代码格式"
    @echo "  just rust-format       - 自动格式化 Rust 代码"
    @echo "  just rust-clippy       - 运行 Clippy 静态分析"
    @echo "  just rust-test         - 运行 Rust 单元测试"
    @echo "  just rust-check-all    - 运行所有 Rust 检查"
    @echo "  just rust-fix          - 格式化并运行检查"
    @echo ""
    @echo "📘 代码质量检查 (TypeScript - AgentKit Desktop)："
    @echo "  just ts-check          - 运行 TypeScript 类型检查"
    @echo ""
    @echo "🔧 其他命令："
    @echo "  just ci                - 在本地执行完整 CI 流程 (tsc + cargo)"
    @echo "  just clean             - 清理构建缓存"
    @echo "  just check-deps        - 检查项目依赖"
    @echo "  just info              - 显示项目信息"
    @echo ""
    @echo "💡 使用示例："
    @echo "  just mcs                            # 启动技能管理 TUI"
    @echo "  just docs                           # 快速启动文档开发"
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

# ============ Rust 代码检查 (AgentKit Desktop + MCS) ============

# 运行 Rust 格式检查 (不符则自动修复并报错)
rust-format-check:
    cd tools/agentkit-desktop/src-tauri && cargo fmt --check || (cargo fmt && false)
    cd mcs && cargo fmt --check || (cargo fmt && false)

# 自动格式化 Rust 代码
rust-format:
    cd tools/agentkit-desktop/src-tauri && cargo fmt
    cd mcs && cargo fmt

# 运行 Clippy 静态分析 (自动修复 + 严格模式)
rust-clippy:
    cd tools/agentkit-desktop/src-tauri && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings

# 运行 Rust 单元测试
rust-test:
    cd tools/agentkit-desktop/src-tauri && cargo test
    cd mcs && cargo test

# 运行所有 Rust 检查 (格式 + Clippy + 测试)
rust-check-all: rust-format-check rust-clippy rust-test

# 修复 Rust 代码格式并运行检查
rust-fix: rust-format rust-clippy

# ============ TypeScript 检查 (AgentKit Desktop) ============

# 运行 TypeScript 类型检查
ts-check:
    cd tools/agentkit-desktop && npx tsc --noEmit

# ============ CI ============

# 在本地执行完整 CI 流程 (与 GitHub Actions 保持一致)
# 注意: 本地 CI 无法完全复现 GitHub Actions 的多平台矩阵 (ubuntu/macOS/windows)
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "📘 步骤 1/5: AgentKit Desktop TypeScript 检查..."
    cd tools/agentkit-desktop && npx tsc --noEmit
    @echo ""
    @echo "🦀 步骤 2/5: Rust 格式检查 + 自动修复..."
    cd tools/agentkit-desktop/src-tauri && cargo fmt --check && echo "  ✓ agentkit-desktop 格式正确" || (echo "  ⚠️ agentkit-desktop 格式不符，自动修复中..." && cargo fmt && false)
    cd mcs && cargo fmt --check && echo "  ✓ mcs 格式正确" || (echo "  ⚠️ mcs 格式不符，自动修复中..." && cargo fmt && false)
    @echo ""
    @echo "🦀 步骤 3/5: Rust Clippy 静态分析 (自动修复 + 严格检查)..."
    cd tools/agentkit-desktop/src-tauri && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    @echo ""
    @echo "🦀 步骤 4/5: Rust 单元测试..."
    cd tools/agentkit-desktop/src-tauri && cargo test
    cd mcs && cargo test
    @echo ""
    @echo "🔎 步骤 5/5: Rust 跨平台 lint 检查..."
    just _rust-cross-lint
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"

# 跨平台 lint 检查: 检测 Rust 代码中未正确使用 #[cfg] 保护的 platform-specific 导入
# 原理: cargo clippy 只检查当前平台的 #[cfg] 路径，无法发现其他平台上的 unused imports
_rust-cross-lint:
    python tools/rust_cross_lint.py

# ============ 工具 ============

# 清理构建缓存
clean:
    cd mcs && cargo clean 2>/dev/null || true
    cd tools/agentkit-desktop/src-tauri && cargo clean 2>/dev/null || true
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
