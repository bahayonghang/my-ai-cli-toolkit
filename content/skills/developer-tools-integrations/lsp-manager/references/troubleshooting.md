# LSP 故障排查指南

## 常见问题

### 1. 可执行文件未找到

**错误**: `Executable not found in $PATH`

**原因**: 语言服务器未安装或不在 PATH 中

**解决**:
```bash
# 检查是否安装
which <language-server>

# 未安装则安装
npm install -g <language-server>  # 或其他包管理器
```

### 2. LSP 不工作

**诊断步骤**:

1. 检查编辑器的 LSP 日志输出（大多数编辑器在 Output 面板提供 LSP 日志通道）

2. 验证配置文件
```bash
# 检查 .lsp.json 语法
cat .lsp.json | python -m json.tool
```

3. 测试服务器手动启动
```bash
<language-server> --version
<language-server> --stdio  # 测试 stdio 通信
```

4. 检查编辑器 LSP 日志
   - VS Code: Output 面板 → 选择对应语言服务器通道
   - Neovim: `:LspLog` 或 `~/.local/state/nvim/lsp.log`
   - Emacs: `*lsp-log*` buffer

### 3. 配置文件错误

**检查清单**:
- [ ] `command` 字段正确
- [ ] `extensionToLanguage` 映射正确
- [ ] JSON 语法无误
- [ ] 文件路径正确

### 4. 权限问题

**解决**:
```bash
# 确保脚本可执行 (Unix/macOS)
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Windows 下确认 Python 可执行
python --version
```

### 5. 服务器启动超时

**配置调整**:
```json
{
  "startupTimeout": 10000,
  "shutdownTimeout": 5000
}
```

## 调试工具

### 测试语言服务器
```bash
# 检查版本
<language-server> --version

# 测试通信
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | <language-server> --stdio
```

### 使用 check_server.py 批量检查
```bash
python scripts/check_server.py
```
输出 JSON 格式的安装状态，方便自动化处理。
