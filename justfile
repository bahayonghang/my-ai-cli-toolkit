# MyClaude Skills Justfile

# 默认任务：显示帮助
default:
    @just --list

# ============ 文档相关 ============

# 安装文档依赖
docs-install:
    cd docs && npm install

# 启动文档开发服务器
docs-dev:
    cd docs && npm run dev

# 构建文档
docs-build:
    cd docs && npm run build

# 预览构建后的文档
docs-preview:
    cd docs && npm run preview

# 一键启动文档（安装依赖 + 启动开发服务器）
docs: docs-install docs-dev

# ============ 技能管理 ============

# 列出所有可用技能
list:
    ./install.sh list

# 安装所有技能到 Claude
install-all:
    ./install.sh install-all

# 安装所有技能到 Codex
install-all-codex:
    ./install.sh --target=codex install-all

# 安装指定技能 (用法: just install skill1 skill2)
install +skills:
    ./install.sh install {{skills}}

# 列出已安装的技能
installed:
    ./install.sh installed

# 交互式安装
interactive:
    ./install.sh interactive

# ============ 提示词管理 ============

# 更新全局 CLAUDE.md
prompt-update:
    ./install.sh prompt-update

# 显示提示词差异
prompt-diff:
    ./install.sh prompt-diff

ruff-check:
    uvx ruff check .

ruff-format-check:
    uvx ruff format --check .
