set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

# MyClaude Skills Justfile
# 使用 just 命令管理仓库 content/ 下的内容校验流程
#
# 本仓库保留 content/ 作为运行内容工作区，并在 docs/ 提供独立 VitePress 文档站。

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
    @echo "📚 文档站："
    @echo "  just docs          - 启动 docs/ VitePress 文档站"
    @echo "  just docs-deps     - 重新安装 docs/ 依赖"
    @echo "  just docs-sync     - 生成 docs catalog 与 skill 详情页"
    @echo "  just docs-check    - 检查 docs catalog 漂移并构建文档站"
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
    @echo ""
    @echo "════════════════════════════════════════════════════════════════"


# ============ 文档站 ============

# 启动 docs/ VitePress 文档站
docs:
    {{ npm_cmd }} --prefix docs run dev

# 重新安装 docs/ VitePress 依赖
docs-deps:
    {{ npm_cmd }} --prefix docs ci

# 生成 docs catalog 与 skill 详情页
docs-sync:
    {{ python_cmd }} docs/scripts/sync_docs_catalog.py

# 检查 docs catalog 是否最新，并执行 VitePress build
docs-check:
    {{ python_cmd }} docs/scripts/sync_docs_catalog.py --check
    {{ python_cmd }} docs/scripts/ensure_docs_deps.py
    {{ npm_cmd }} --prefix docs run build

# ============ 内容校验 ============

# 校验 content/skills/ 元数据
skills-check:
    {{ python_cmd }} content/skills/check.py content/skills

# 编译检查 content/ 下的 Python 脚本；跳过 scaffold 模板
python-check:
    {{ python_cmd }} -c "from pathlib import Path; import py_compile; paths=[p for p in Path('content').rglob('*.py') if 'scaffolds' not in p.parts and 'node_modules' not in p.parts]; [py_compile.compile(str(p), doraise=True) for p in paths]; print(f'Checked {len(paths)} Python files')"

# 运行仓库内 Node.js 技能测试
node-test:
    {{ node_cmd }} -e "const fs = require('node:fs'); const path = require('node:path'); const { spawnSync } = require('node:child_process'); const files = []; const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const filePath = path.join(dir, entry.name); if (entry.isDirectory()) walk(filePath); else if (entry.isFile() && filePath.split(/[\\/]/).includes('tests') && entry.name.endsWith('.mjs')) files.push(filePath); } }; walk('content/skills'); if (files.length === 0) { console.log('No Node skill tests found'); process.exit(0); } const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' }); process.exit(result.status ?? 1);"

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
    @echo "📚 步骤 1/5: 文档 catalog 与站点构建校验..."
    {{ just_cmd }} docs-check
    @echo ""
    @echo "🧩 步骤 2/5: 技能元数据校验..."
    {{ just_cmd }} skills-check
    @echo ""
    @echo "🐍 步骤 3/5: Python 脚本编译检查..."
    {{ just_cmd }} python-check
    @echo ""
    @echo "🧪 步骤 4/5: Node.js 技能测试..."
    {{ just_cmd }} node-test
    @echo ""
    @echo "🧹 步骤 5/5: Git 空白检查..."
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
