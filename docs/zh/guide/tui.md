# MCS TUI 指南

项目已统一使用 Rust 实现的 **MCS** TUI（`mcs/`）作为主交互入口。

## 快速开始

```bash
just mcs
```

兼容旧命令：

```bash
uv run python src/install_tui.py
```

`install_tui.py` 现在仅作为迁移兼容壳，会自动转发到 MCS。

## 界面说明

## 1. 平台选择页

- `↑/↓`, `j/k`：移动
- `Enter`：进入所选平台
- `d`：进入 Dashboard
- `q` 或 `Esc`：退出

## 2. 主界面

- 左侧栏 + 右侧列表双栏布局
- 侧栏支持 Skills / Commands 切换（`1` / `2`）
- 支持分类过滤、状态过滤、搜索、批量操作

### 主界面快捷键

- `Tab`：在侧栏与列表之间切换焦点
- `↑/↓`, `j/k`：移动
- `Space`：切换选中状态
- `a`：全选/清空（当前过滤结果）
- `i`：安装已选项目
- `Enter`：安装当前聚焦项目
- `u`：卸载当前聚焦项目
- `x`：批量卸载已选项目
- `U`：更新当前标签页所有过期项目
- `d`：打开详情弹窗
- `D`：打开 Diff 弹窗
- `/`：搜索
- `s`：循环状态过滤（全部 -> 已安装 -> 过期 -> 未安装 -> 全部）
- `p`：提示词 diff/更新（仅 Claude）
- `P`：平台配置弹窗
- `S`：多平台同步弹窗
- `Esc`：返回平台选择页
- `q`：退出

## 3. Dashboard

- `Esc`：返回平台选择页
- `q`：退出程序

## 弹窗交互

- Detail / Diff / Prompt 弹窗支持：
  - `j/k` 或 `↑/↓`：滚动
  - `PgUp/PgDn`：翻页滚动
  - `Esc`：关闭
- Multi-Sync 弹窗：
  - `↑/↓`：选择平台
  - `Space`：切换平台勾选
  - `Enter`：执行同步
  - `Esc`：取消

## 行为说明

- Skill 的过期检测已支持目录递归（文件签名 + mtime），不再只看目录 mtime。
- 批量安装/卸载/多平台同步统一走动作队列，支持进度与结果通知。
- 底部提示与状态消息会根据当前上下文动态变化。

## UI Style System

- MCS 已引入语义化样式层（`StyleRole`），替代分散的硬编码颜色。
- 当前内置主题保持为 Catppuccin Mocha，扩展入口保留在 `mcs/src/tui/theme.rs`。
- 密度策略固定为 `Balanced`（`UiDensity`），布局尺寸统一由 `LayoutMetrics` 输出。
- 状态信息统一采用“双通道表达”（颜色 + 文本/符号），避免仅靠颜色区分。

### 语义角色

- `ScreenBg`、`PanelBg`、`PanelBorder`、`PanelBorderFocus`
- `TextPrimary`、`TextMuted`、`TextOnAccent`、`BadgeAccent`
- `StatusSuccess`、`StatusWarning`、`StatusError`、`SelectionBg`
- `HintKey`、`HintText`、`NotificationInfo`、`NotificationSuccess`、`NotificationWarning`、`NotificationError`

### ASCII 回退

- 对 Unicode 宽度支持不稳定的终端，可设置 `MCS_ASCII=1` 强制 ASCII 图标。
- 示例：

```bash
MCS_ASCII=1 just mcs
```

### 终端尺寸建议

- 最小支持尺寸：`80x24`
- 推荐尺寸：`100x30` 及以上

## 故障排查

### `just mcs` 报错 `cargo not found`

请先安装 Rust 工具链：

```bash
rustup --version
```

### 强制干净重编译

```bash
just mcs-rebuild
```
