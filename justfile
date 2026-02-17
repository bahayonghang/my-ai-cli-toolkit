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
    @echo "  just tui               - 兼容旧入口（转发到 just mcs）"
    @echo ""
    @echo "🎯 技能管理命令："
    @echo "  just list              - 列出所有可用技能"
    @echo "  just install-all       - 安装所有技能到 Claude"
    @echo "  just install-all-codex - 安装所有技能到 Codex"
    @echo "  just install <技能名>  - 安装指定技能 (支持多个)"
    @echo "  just installed         - 列出已安装的技能"
    @echo "  just interactive       - 交互式选择并安装技能"
    @echo ""
    @echo "📝 提示词管理命令："
    @echo "  just prompt-update     - 更新全局 CLAUDE.md 提示词"
    @echo "  just prompt-diff       - 显示本地与全局提示词的差异"
    @echo ""
    @echo "🔍 代码质量检查 (Python)："
    @echo "  just ruff-check        - 运行 Ruff 代码检查"
    @echo "  just ruff-format-check - 检查代码格式是否符合规范"
    @echo "  just ruff-format       - 自动格式化代码"
    @echo "  just ruff-fix          - 自动修复可修复的问题"
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
    @echo "🧪 测试命令："
    @echo "  just test              - 运行所有测试"
    @echo "  just test-unit         - 仅运行单元测试"
    @echo "  just test-integration  - 仅运行集成测试"
    @echo "  just test-e2e          - 仅运行端到端测试"
    @echo "  just ci                - 在本地执行完整 CI 流程 (ruff + pyright + pytest + tsc + cargo)"
    @echo ""
    @echo "💡 使用示例："
    @echo "  just install drawio excalidraw  # 安装多个技能"
    @echo "  just docs                       # 快速启动文档开发"
    @echo "  just ruff-fix                   # 修复 Python 代码问题"
    @echo "  just rust-fix                   # 修复 Rust 代码格式"
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

# ============ 技能管理 ============

# 列出所有可用的技能及其描述
list:
    uv run python src/install.py list

# 安装所有技能到 Claude (~/.claude/skills/)
install-all:
    uv run python src/install.py install-all

# 安装所有技能到 Codex (~/.codex/skills/)
install-all-codex:
    uv run python src/install.py --target=codex install-all

# 安装指定的一个或多个技能
# 用法: just install drawio excalidraw
install +skills:
    uv run python src/install.py install {{skills}}

# 列出已安装的技能
installed:
    uv run python src/install.py installed

# 交互式选择并安装技能
interactive:
    uv run python src/install.py interactive

# 兼容旧入口（已迁移到 MCS）
tui:
    @echo "⚠️  `just tui` 已迁移为 `just mcs`，正在转发..."
    just mcs

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

# ============ 提示词管理 ============

# 将本地 CLAUDE.md 同步到全局配置 (~/.claude/CLAUDE.md)
prompt-update:
    uv run python src/install.py prompt-update

# 显示本地与全局 CLAUDE.md 的差异
prompt-diff:
    uv run python src/install.py prompt-diff

# ============ 代码质量检查 ============

# 运行 Ruff 进行代码静态检查
ruff-check:
    uvx ruff check .

# 检查代码格式是否符合 Ruff 规范
ruff-format-check:
    uvx ruff format --check .

# 自动格式化代码 (修改文件)
ruff-format:
    uvx ruff format .

# 自动修复可修复的 Ruff 检查问题
ruff-fix:
    uvx ruff check --fix .

# ============ Rust 代码检查 (AgentKit Desktop + MCS) ============

# 运行 Rust 格式检查 (不符则自动修复并报错)
rust-format-check:
    cd agentkit-desktop/src-tauri && cargo fmt --check || (cargo fmt && false)
    cd mcs && cargo fmt --check || (cargo fmt && false)

# 自动格式化 Rust 代码
rust-format:
    cd agentkit-desktop/src-tauri && cargo fmt
    cd mcs && cargo fmt

# 运行 Clippy 静态分析 (自动修复 + 严格模式)
rust-clippy:
    cd agentkit-desktop/src-tauri && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings

# 运行 Rust 单元测试
rust-test:
    cd agentkit-desktop/src-tauri && cargo test
    cd mcs && cargo test

# 运行所有 Rust 检查 (格式 + Clippy + 测试)
rust-check-all: rust-format-check rust-clippy rust-test

# 修复 Rust 代码格式并运行检查
rust-fix: rust-format rust-clippy

# ============ TypeScript 检查 (AgentKit Desktop) ============

# 运行 TypeScript 类型检查
ts-check:
    cd agentkit-desktop && npx tsc --noEmit

# ============ 测试相关 ============

# 运行所有测试套件
test:
    pytest

# 仅运行单元测试
test-unit:
    pytest tests/unit/

# 仅运行集成测试
test-integration:
    pytest tests/integration/

# 仅运行端到端测试
test-e2e:
    pytest tests/e2e/

# 运行测试并生成覆盖率报告
test-coverage:
    pytest --cov=. --cov-report=html --cov-report=term

# 在本地执行完整 CI 流程 (与 GitHub Actions 保持一致)
# 注意: 本地 CI 无法完全复现 GitHub Actions 的多平台矩阵 (ubuntu/macOS/windows)
# 使用 `just ci-cross` 可以额外检查跨平台常见问题
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "🔍 步骤 1/9: Ruff 代码检查..."
    uv run ruff check .
    @echo ""
    @echo "🔍 步骤 2/9: Ruff 格式检查..."
    uv run ruff format --check .
    @echo ""
    @echo "🔍 步骤 3/9: Pyright 类型检查..."
    uv run pyright
    @echo ""
    @echo "🧪 步骤 4/9: 运行测试 (pytest, NO_COLOR=1 模拟 CI 环境)..."
    NO_COLOR=1 uv run pytest
    @echo ""
    @echo "📘 步骤 5/9: AgentKit Desktop TypeScript 检查..."
    cd agentkit-desktop && npx tsc --noEmit
    @echo ""
    @echo "🦀 步骤 6/9: Rust 格式检查 + 自动修复..."
    cd agentkit-desktop/src-tauri && cargo fmt --check && echo "  ✓ agentkit-desktop 格式正确" || (echo "  ⚠️ agentkit-desktop 格式不符，自动修复中..." && cargo fmt && false)
    cd mcs && cargo fmt --check && echo "  ✓ mcs 格式正确" || (echo "  ⚠️ mcs 格式不符，自动修复中..." && cargo fmt && false)
    @echo ""
    @echo "🦀 步骤 7/9: Rust Clippy 静态分析 (自动修复 + 严格检查)..."
    cd agentkit-desktop/src-tauri && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    cd mcs && cargo clippy --fix --allow-dirty --allow-staged --all-targets --all-features 2>/dev/null; cargo clippy --all-targets --all-features -- -D warnings
    @echo ""
    @echo "🦀 步骤 8/9: Rust 单元测试..."
    cd agentkit-desktop/src-tauri && cargo test
    cd mcs && cargo test
    @echo ""
    @echo "🔎 步骤 9/9: Rust 跨平台 lint 检查..."
    just _rust-cross-lint
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"

# 跨平台 lint 检查: 检测 Rust 代码中未正确使用 #[cfg] 保护的 platform-specific 导入
# 原理: cargo clippy 只检查当前平台的 #[cfg] 路径，无法发现其他平台上的 unused imports
_rust-cross-lint:
    uv run python scripts/rust_cross_lint.py


# 清理临时文件和缓存
clean:
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    rm -rf .coverage htmlcov/ 2>/dev/null || true
    @echo "✓ 清理完成"

# 检查项目依赖是否已安装
check-deps:
    @echo "检查 Python 依赖..."
    @uv run python -c "import yaml" 2>/dev/null || echo "⚠️  缺少 PyYAML，请运行: uv add pyyaml"
    @uv run python -c "import pytest" 2>/dev/null || echo "⚠️  缺少 pytest，请运行: uv add pytest"
    @cargo --version >/dev/null 2>&1 || echo "⚠️  缺少 cargo，请安装 Rust 工具链 (rustup)"
    @echo "✓ 依赖检查完成"

# 显示项目信息
info:
    @echo "项目: MyClaude Skills"
    @echo "Python 版本: $(uv run python --version)"
    @echo "技能数量: $(uv run python src/install.py list | wc -l)"
    @echo "文档路径: docs/"
    @echo "技能路径: skills/"
