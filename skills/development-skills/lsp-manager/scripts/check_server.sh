#!/bin/bash
# 检查语言服务器是否已安装

check_server() {
    local server=$1
    if command -v "$server" &> /dev/null; then
        echo "✓ $server 已安装"
        $server --version 2>&1 | head -1 || echo "  (无法获取版本信息)"
        return 0
    else
        echo "✗ $server 未找到"
        return 1
    fi
}

# 检查常用语言服务器
echo "检查语言服务器安装状态..."
echo "-----------------------------------"

servers=(
    "pyright-langserver"
    "typescript-language-server"
    "gopls"
    "rust-analyzer"
    "clangd"
    "solargraph"
    "intelephense"
)

for server in "${servers[@]}"; do
    check_server "$server"
done

echo "-----------------------------------"
echo "检查完成"
