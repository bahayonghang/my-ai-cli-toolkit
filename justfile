set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

# MyClaude Skills Justfile
# 使用 just 命令管理仓库 content/ 下的内容校验流程
#
# 本仓库已移除 mcs/ Rust workspace 与 docs/ VitePress 站点，
# 现在只剩 content/ 一个工作区，对应的 just 入口也只保留下面这几个。

npm_cmd := if os_family() == "windows" { "npm.cmd" } else { "npm" }
npx_cmd := if os_family() == "windows" { "npx.cmd" } else { "npx" }
just_cmd := "just"
node_cmd := "node"
python_cmd := "python"

# 默认任务：交互式选择
default:
    @{{ just_cmd }} --choose

# 显示帮助信息
help:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  MyClaude Skills - 任务管理工具"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "✅ 内容校验："
    @echo "  just skills-check  - 校验 content/skills/ 元数据"
    @echo "  just python-check  - 编译检查 content/ 下的 Python 脚本"
    @echo "  just node-test     - 运行仓库内 Node.js 技能测试"
    @echo "  just lint          - skills-check + python-check"
    @echo "  just ci            - 完整本地 CI 流程"
    @echo ""
    @echo "🔧 其他："
    @echo "  just check-deps    - 检查运行依赖（just / node / npm / python）"
    @echo "  just info          - 显示项目信息"
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"

# ============ 内容校验 ============

# 校验 content/skills/ 元数据
skills-check:
    {{ python_cmd }} content/skills/check.py content/skills

# 编译检查 content/ 下的 Python 脚本；跳过 scaffold 模板
python-check:
    {{ python_cmd }} -c "from pathlib import Path; import py_compile; paths=[p for p in Path('content').rglob('*.py') if 'scaffolds' not in p.parts and 'node_modules' not in p.parts]; [py_compile.compile(str(p), doraise=True) for p in paths]; print(f'Checked {len(paths)} Python files')"

# 运行仓库内 Node.js 技能测试
node-test:
    {{ node_cmd }} --test content/skills/developer-tools-integrations/codex-companion/tests/*.mjs content/skills/developer-tools-integrations/skill-map/tests/*.mjs

# 运行仓库内容 lint
lint: skills-check python-check

# ============ CI ============
# 在本地执行完整 CI 流程
# 注意：本地流程无法完全复现 GitHub Actions 的多平台矩阵 (ubuntu/macOS/windows)
ci:
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  🚀 开始执行本地 CI 流程"
    @echo "════════════════════════════════════════════════════════════════"
    @echo ""
    @echo "🧩 步骤 1/4: 技能元数据校验..."
    {{ just_cmd }} skills-check
    @echo ""
    @echo "🐍 步骤 2/4: Python 脚本编译检查..."
    {{ just_cmd }} python-check
    @echo ""
    @echo "🧪 步骤 3/4: Node.js 技能测试..."
    {{ just_cmd }} node-test
    @echo ""
    @echo "🧹 步骤 4/4: Git 空白检查..."
    git diff --check
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"
    @echo "  ✅ 本地 CI 流程执行完成！"
    @echo "════════════════════════════════════════════════════════════════"

# ============ 工具 ============

# 检查运行依赖是否已安装
check-deps:
    @{{ just_cmd }} --version
    @{{ node_cmd }} --version
    @{{ npm_cmd }} --version
    @{{ python_cmd }} --version
    @echo "✓ 依赖检查完成"

# 显示项目信息
info:
    @echo "项目: MyClaude Skills"
    @echo "工作区: content/"
    @echo "技能源: content/skills/"
    @echo "第三方注册表: content/community-skills-registry/"
    @echo "平台映射: platforms.toml"
