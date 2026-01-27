# Slint 官方文档导航指南

本指南帮助您快速找到 Slint 官方仓库中的相关文档和教程。

## 官方文档结构

### 📚 教程 (Tutorials)
**路径**: `@source/docs/astro/src/content/docs/tutorial/`

官方教程通过实现一个记忆游戏来介绍 Slint 框架：

1. **[quickstart.mdx](@source/docs/astro/src/content/docs/tutorial/quickstart.mdx)** - 教程介绍和游戏预览
2. **[getting_started.mdx](@source/docs/astro/src/content/docs/tutorial/getting_started.mdx)** - 项目设置和基础配置
3. **[memory_tile.mdx](@source/docs/astro/src/content/docs/tutorial/memory_tile.mdx)** - 创建记忆卡片组件
4. **[creating_the_tiles.mdx](@source/docs/astro/src/content/docs/tutorial/creating_the_tiles.mdx)** - 实现游戏网格布局
5. **[game_logic.mdx](@source/docs/astro/src/content/docs/tutorial/game_logic.mdx)** - 添加游戏逻辑和状态管理
6. **[polishing_the_tile.mdx](@source/docs/astro/src/content/docs/tutorial/polishing_the_tile.mdx)** - 美化界面和添加动画
7. **[from_one_to_multiple_tiles.mdx](@source/docs/astro/src/content/docs/tutorial/from_one_to_multiple_tiles.mdx)** - 扩展到多个卡片
8. **[running_in_a_browser.mdx](@source/docs/astro/src/content/docs/tutorial/running_in_a_browser.mdx)** - 部署到 WebAssembly

### 📖 语言参考 (Language Reference)
**路径**: `@source/docs/astro/src/content/docs/guide/language/`

- **concepts/** - 核心概念和设计原理
- **coding/** - 语法详细说明和代码示例

### 🔌 集成指南 (Integrations)
**路径**: `@source/docs/astro/src/content/docs/language-integrations/`

- Rust 集成指南
- C++ 集成指南
- NodeJS 集成指南
- Python 集成指南

## 📝 官方示例项目

### 主要示例 (位于 @source/examples/)
1. **[gallery](@source/examples/gallery/)** - 基础组件展示
2. **[memory](@source/examples/memory/)** - 完整的记忆游戏实现
3. **[todo](@source/examples/todo/)** - 待办事项应用
4. **[printerdemo](@source/examples/printerdemo/)** - 打印机管理界面

### 特性示例
- **[iot-dashboard](@source/examples/iot-dashboard/)** - IoT 仪表板
- **[plotter](@source/examples/plotter/)** - 数据可视化
- **[mcu-board-support](@source/examples/mcu-board-support/)** - 嵌入式开发

## 🚀 学习路径建议

### 🟢 初学者路径 (推荐)
```bash
1. 官方教程: @source/docs/astro/src/content/docs/tutorial/quickstart.mdx
2. 基础示例: @source/examples/gallery/
3. 完整项目: @source/examples/memory/
4. 语言参考: @source/docs/astro/src/content/docs/guide/language/
```

### 🟡 进阶开发者路径
```bash
1. 语言参考: @source/docs/astro/src/content/docs/guide/language/
2. 集成指南: @source/docs/astro/src/content/docs/language-integrations/
3. 高级示例: @source/examples/iot-dashboard/
4. 性能优化: 参考 @source/examples/ 中的大型项目
```

### 🔴 专家路径
```bash
1. 嵌入式开发: @source/examples/mcu-board-support/
2. 高级组件: @source/ui-libraries/
3. 内部实现: @source/api/
4. 构建系统: @source/tools/
```

## 🎯 基于官方教程的实践项目

### 记忆游戏教程实现
跟随官方教程实现记忆游戏：

```rust
// 基础项目结构
my-memory-game/
├── Cargo.toml
├── build.rs
└── src/
    ├── main.rs
    └── ui/
        └── main.slint
```

**对应教程章节**:
- 设置项目: `getting_started.mdx`
- 创建卡片: `memory_tile.mdx`
- 实现逻辑: `game_logic.mdx`
- 添加动画: `polishing_the_tile.mdx`

### 组件库开发
基于官方组件库创建自定义组件：

```bash
# 参考官方组件库
@source/ui-libraries/material/    # Material Design 组件
@source/ui-libraries/fluent/      # Fluent Design 组件
```

## 📋 快速参考指南

### 常用文档路径
- **快速开始**: `@source/docs/astro/src/content/docs/tutorial/quickstart.mdx`
- **API 参考**: `@source/api/rs/slint/`
- **内置组件**: `@source/api/rs/slint/builtin/`
- **构建配置**: `@source/docs/building.md`
- **部署指南**: `@source/docs/astro/src/content/docs/tutorial/running_in_a_browser.mdx`

### 示例代码查找
```bash
# 查找特定组件示例
find @source/examples -name "*button*" -type f

# 查找所有 Rust 主文件
find @source/examples -name "main.rs" -type f

# 查找所有 Slint 文件
find @source/examples -name "*.slint" -type f
```

## 🔧 开发工具和资源

### 官方工具
- **LSP 支持**: `@source/editors/vscode-slint/`
- **语法高亮**: `@source/editors/tree-sitter-slint/`
- **构建工具**: `@source/xtask/`

### 测试和调试
- **测试框架**: `@source/tests/`
- **性能分析**: `@source/tools/`
- **调试工具**: 参考 `@source/docs/development.md`

## 📖 文档使用建议

### 1. 结合官方示例学习
每学习一个概念，立即在 `@source/examples/` 中找到对应示例

### 2. 跟随教程实践
严格按照 `@source/docs/astro/src/content/docs/tutorial/` 中的步骤实践

### 3. 参考官方实现
遇到问题时，查看 `@source/examples/memory/` 等完整项目的实现

### 4. 保持更新
定期更新官方源码以获取最新功能：
```bash
git submodule update --remote source
```