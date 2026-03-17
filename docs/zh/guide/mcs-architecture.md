# MCS 架构

## Workspace 结构

`mcs/` 当前是一个包含三个 crate 的 Rust workspace：

| Crate | 类型 | 职责 |
|-------|------|------|
| `mcs-core` | library | discovery、metadata parsing、install logic、path resolution、migration、共享模型 |
| `mcs-tui` | binary | 基于 ratatui/crossterm 的终端界面 |
| `mcs-web` | binary | Axum API 服务，以及 React UI 的静态资源托管 |

## Source-of-truth 路径

`mcs-core` 把当前仓库视为 `content/` 驱动的项目：

- skills：`content/skills/`
- commands：`content/commands/`
- prompts 辅助路径在代码里仍有封装，但当前仓库的 runtime 文件体系还包括 `content/hooks/` 和 `content/memorys/`

只要向上找到 `content/skills/`，项目根检测就会成功。

## `mcs-core` 的关键模块

### Config

- `config/paths.rs`：仓库根检测与 source-dir helper
- `config/platform.rs`：内置平台配置、项目覆盖、用户覆盖、安装路径格式化

### 内容发现

- `core/discovery.rs`：遍历 skills / commands 源目录，计算安装状态，读取 metadata
- `core/skill_meta.rs`：解析 MCS 当前使用的顶层 skill frontmatter 字段
- `core/external_skills.rs`：从 `content/skills/external-skills.toml` 加载 external-skills 注册表

### 安装流水线

- `core/installer.rs`：skills / commands 的安装与卸载
- `core/install_target.rs`：全局安装与项目级安装目标
- `core/skill_store.rs`：`~/.mcs/skills/` 下的 canonical local store
- `core/skill_migration.rs`：迁移到 canonical store + symlink 模型的一次性流程
- `core/prompt.rs`：为定义了 prompt file 的平台提供 prompt diff / update

## TUI 流程

`mcs-tui` 负责：

- screen state
- 键盘输入处理
- popup 与 dialog
- 渲染 widgets

具体的 discovery、diff、prompt update、install、uninstall、sync 逻辑都调用 `mcs-core`。

## Web 流程

`mcs-web` 负责：

- 异步 app state
- REST API handlers
- 基于外部注册表的安装任务与流式状态
- 构建后 UI 资源托管

React UI 只与 Axum API 对话，业务规则继续放在 `mcs-core`。

## 为什么要这样拆分

- 内容语义和路径规则只在 `mcs-core` 维护一次
- 终端和浏览器两种 UX 可以独立演进
- 各平台路径逻辑在 TUI 和 Web 之间保持一致
- 因此文档也必须把它描述为“三部分系统”，而不是旧的“单一 TUI 工具”
