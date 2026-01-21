# TUI (终端用户界面) 指南

TUI 提供了一个现代化的可视化界面，用于管理 MyClaude Skills 和 Commands，具有直观的表格布局和实时更新检测功能。

## 快速开始

启动 TUI：

```bash
python install_tui.py
```

## 功能概览

### 🎯 可视化平台选择
- Claude Code
- Codex CLI
- Gemini CLI
- Qwen Code
- Google Antigravity
- Windsurf

### 📊 表格布局

TUI 以清晰对齐的表格格式显示项目：

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ✓ article-cover            Generate professional article cover images as SV 01-02 15:43 01-02 15:43
  ☑ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
  ☐ ○ paper-check              学术论文全流程检查工具，支持格式检查和内容分析（ 01-19 22:34 N/A        
```

### 列定义

| 列名 | 符号 | 宽度 | 说明 |
|------|------|------|------|
| (箭头) | ▶/空格 | 1 | 高亮指示（▶ 表示当前行）|
| ☐ | ☐/☑ | 1 | 选择状态（☐ 未选中 / ☑ 已选中）|
| ✓ | ✓/⚠/○ | 1 | 安装状态（✓ 已安装 / ⚠ 需要更新 / ○ 未安装）|
| Name | - | 24 | 项目名称（支持中文字符）|
| Description | - | 48 | 项目描述（支持中文字符）|
| Src Time | - | 11 | 源文件修改时间 |
| Tgt Time | - | 11 | 目标文件修改时间 |

### 🔄 更新检测

TUI 通过比较文件修改时间自动检测已安装项目是否需要更新：

- **✓ (绿色勾号)**: 已安装且最新（源时间 = 目标时间）
- **⚠ (黄色警告)**: 已安装但过期（源时间 > 目标时间）
- **○ (空心圆)**: 未安装（目标文件不存在）

### 📋 标签页界面

在两个标签页之间切换：
- **Skills**: 所有可用的技能
- **Commands/Workflows**: 平台特定的命令或工作流

### 🌏 中文字符支持

TUI 完全支持中文字符，具有正确的宽度计算：
- 中文字符：2 个显示宽度
- 英文字符：1 个显示宽度
- 自动截断和填充以保持列对齐

## 键盘快捷键

### 导航

| 按键 | 操作 |
|-----|--------|
| `↑` / `k` | 向上移动 |
| `↓` / `j` | 向下移动 |
| `Tab` | 在 Skills/Commands 标签页之间切换 |
| `Esc` | 清除搜索 / 返回平台选择 |

### 选择

| 按键 | 操作 |
|-----|--------|
| `Space` | 切换当前项的选择状态 |
| `a` | 选择当前标签页的所有项目 |

### 安装

| 按键 | 操作 |
|-----|--------|
| `Enter` | 安装当前聚焦的项目 |
| `i` | 批量安装所有选中的项目 |

### 搜索

| 按键 | 操作 |
|-----|--------|
| `/` | 打开搜索框 |
| `Esc` | 关闭搜索框 |

### 其他

| 按键 | 操作 |
|-----|--------|
| `q` | 退出应用 |

## 使用流程

### 1. 检查更新

1. 启动 TUI：`python install_tui.py`
2. 选择你的平台（例如 Claude）
3. 查看 **St** 列中带有 ⚠ 状态的项目
4. 对比 **Src Time** 和 **Tgt Time** 列
5. 底部状态栏显示：`⚠ X need update`

### 2. 批量更新过期项目

1. 使用 `Space` 键选择所有带 ⚠ 状态的项目
2. 按 `i` 键安装选中的项目
3. 等待安装完成
4. 状态栏显示进度：`Installing X/Y items`

### 3. 安装新项目

1. 查找带 ○ 状态的项目（未安装）
2. 使用 `Space` 键选择需要的项目
3. 按 `i` 键安装
4. **Tgt Time** 将从 `N/A` 变为实际时间

### 4. 搜索特定项目

1. 按 `/` 打开搜索框
2. 输入项目名称（支持部分匹配）
3. 列表实时过滤
4. 按 `Esc` 清除搜索

## 状态栏信息

底部状态栏显示：

```
✓ Installed 25/27  ⚠ 2 need update
```

- **已安装数量**: 已安装项目数 / 总项目数
- **更新警告**: 需要更新的项目数量（如果有）
- **选择数量**: 选中的项目数量（选择时显示）

## 示例

### 示例 1: 检查更新状态

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ✓ article-cover            Generate professional article cover images       01-02 15:43 01-02 15:43
```

- **✓**: 已安装
- **Src Time** = **Tgt Time**: 最新版本，无需更新

### 示例 2: 需要更新

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
```

- **⚠**: 需要更新
- **Src Time** (01-21) > **Tgt Time** (01-07): 源文件已更新，需要重新安装

### 示例 3: 未安装

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ○ skill-manager            A Claude Code skill that allows you to search    01-16 15:01 N/A        
```

- **○**: 未安装
- **Tgt Time**: N/A（目标文件不存在）

### 示例 4: 已选中项目

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☑ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
```

- **☑**: 已选中
- 按 `i` 键安装此项目

## 技术细节

### 显示宽度计算

TUI 使用智能宽度计算以实现正确对齐：

```python
# 中文字符 = 2 宽度，英文 = 1 宽度
get_display_width("Hello")      # 返回: 5
get_display_width("你好")        # 返回: 4
get_display_width("Hello世界")  # 返回: 9
```

### 截断和填充

文本自动截断和填充以保持列宽：

```python
truncate_to_width("学术论文全流程检查工具，支持格式检查", 48)
# 返回: "学术论文全流程检查工具，支持格式检查和内容分析（"

pad_to_width("Hello", 48)
# 返回: "Hello                                           "
```

### 文件修改时间

TUI 比较文件修改时间以确定更新状态：

1. 获取源文件修改时间：`datetime.fromtimestamp(source_path.stat().st_mtime)`
2. 获取目标文件修改时间：`datetime.fromtimestamp(target_path.stat().st_mtime)`
3. 比较：如果源 > 目标，状态 = OUTDATED

## 系统要求

- Python 3.10+
- Textual 库

安装依赖：

```bash
pip install textual
```

## 故障排除

### TUI 无法启动

**问题**: `ModuleNotFoundError: No module named 'textual'`

**解决方案**: 安装 Textual 库
```bash
pip install textual
```

### 中文字符错位

**问题**: 中文文本导致列错位

**解决方案**: 这在最新版本中应该已修复。如果仍有问题，请报告并提供：
- 终端模拟器名称和版本
- 使用的字体
- 问题截图

### 更新检测不工作

**问题**: 项目显示 ✓ 但应该显示 ⚠

**解决方案**: 
1. 检查源文件是否真的被修改了
2. 验证文件修改时间：`ls -l skills/skill-name/`
3. 尝试手动重新安装项目

## 高级用法

### 项目特定安装

安装到特定项目目录：

```bash
python install_tui.py
# 选择平台
# 选择"项目特定安装"
# 输入项目路径
```

### Kiro 结构支持

对于基于 Kiro 的项目：

```bash
python install_tui.py
# 选择平台
# 启用"使用 Kiro 结构"
```

## 相关文档

- [安装指南](./installation.md)
- [创建技能](./creating-skills.md)
- [命令指南](./commands.md)
