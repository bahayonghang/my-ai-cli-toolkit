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
    @echo "🦀 代码质量检查 (Rust - AgentKit Desktop)："
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
    @echo "  just ci                - 在本地执行完整 CI 流程 (ruff + pyright + tsc + pytest)"
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
    python3 install.py list

# 安装所有技能到 Claude (~/.claude/skills/)
install-all:
    python3 install.py install-all

# 安装所有技能到 Codex (~/.codex/skills/)
install-all-codex:
    python3 install.py --target=codex install-all

# 安装指定的一个或多个技能
# 用法: just install drawio excalidraw
install +skills:
    python3 install.py install {{skills}}

# 列出已安装的技能
installed:
    python3 install.py installed

# 交互式选择并安装技能
interactive:
    python3 install.py interactive

# 启动 TUI (终端用户界面) 进行技能管理
tui:
    python3 install_tui.py

# ============ 提示词管理 ============

# 将本地 CLAUDE.md 同步到全局配置 (~/.claude/CLAUDE.md)
prompt-update:
    python3 install.py prompt-update

# 显示本地与全局 CLAUDE.md 的差异
prompt-diff:
    python3 install.py prompt-diff

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

# ============ Rust 代码检查 (AgentKit Desktop) ============

# 运行 Rust 格式检查
rust-format-check:
    cd agentkit-desktop/src-tauri && cargo fmt --check

# 自动格式化 Rust 代码
rust-format:
    cd agentkit-desktop/src-tauri && cargo fmt

# 运行 Clippy 静态分析 (严格模式)
rust-clippy:
    cd agentkit-desktop/src-tauri && cargo clippy --all-targets --all-features -- -D warnings

# 运行 Rust 单元测试
rust-test:
    cd agentkit-desktop/src-tauri && cargo test

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

# 在本地执行完整 CI 流程
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "🔍 步骤 1/4: Ruff 代码检查..."
    uv run ruff check .
    @echo ""
    @echo "🔍 步骤 2/4: Pyright 类型检查..."
    uv run pyright
    @echo ""
    @echo "🔍 步骤 3/4: AgentKit Desktop TypeScript 检查..."
    cd agentkit-desktop && npx tsc --noEmit
    @echo ""
    @echo "🧪 步骤 4/4: 运行测试 (pytest)..."
    uv run pytest
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"


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
    @python3 -c "import yaml" 2>/dev/null || echo "⚠️  缺少 PyYAML，请运行: pip install pyyaml"
    @python3 -c "import pytest" 2>/dev/null || echo "⚠️  缺少 pytest，请运行: pip install pytest"
    @python3 -c "import textual" 2>/dev/null || echo "⚠️  缺少 textual，请运行: pip install textual"
    @echo "✓ 依赖检查完成"

# 显示项目信息
info:
    @echo "项目: MyClaude Skills"
    @echo "Python 版本: $(python3 --version)"
    @echo "技能数量: $(python3 install.py list | wc -l)"
    @echo "文档路径: docs/"
    @echo "技能路径: skills/"
