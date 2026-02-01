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

1. 检查插件状态
```bash
claude --debug
# 或在 Claude Code 中
/plugin
```

2. 验证配置文件
```bash
# 检查 .lsp.json 语法
cat .lsp.json | python -m json.tool

# 检查 plugin.json
cat .claude-plugin/plugin.json | python -m json.tool
```

3. 测试服务器手动启动
```bash
<language-server> --version
<language-server> --stdio  # 测试 stdio 通信
```

4. 启用调试日志
```bash
claude --enable-lsp-logging --debug
tail -f ~/.claude/debug/*.log
```

### 3. 配置文件错误

**检查清单**:
- [ ] `command` 字段正确
- [ ] `extensionToLanguage` 映射正确
- [ ] JSON 语法无误
- [ ] 文件路径正确

### 4. 权限问题

**解决**:
```bash
# 确保脚本可执行
chmod +x scripts/*.sh
chmod +x scripts/*.py
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

### 验证配置
```bash
claude plugin validate
```

### 查看详细日志
```bash
claude --enable-lsp-logging
tail -f ~/.claude/debug/*.log
```

### 测试语言服务器
```bash
# 检查版本
<language-server> --version

# 测试通信
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | <language-server> --stdio
```
