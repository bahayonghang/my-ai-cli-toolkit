# Slint 官方示例学习指南

本指南帮助您基于官方示例学习 Slint 开发。所有示例都来自官方仓库的最新版本。

## 🎯 核心学习示例

### 1. 记忆游戏 (Memory Game) - 🏆 **教程重点**
**路径**: `@source/examples/memory/`

这是官方教程的完整实现，强烈推荐作为学习起点：

```bash
# 运行记忆游戏
cd @source/examples/memory
cargo run
```

**学习价值**:
- 完整的游戏逻辑实现
- 组件设计和状态管理
- 动画和用户交互
- 与官方教程完美对应

**对应教程章节**:
- `@source/docs/astro/src/content/docs/tutorial/memory_tile.mdx`
- `@source/docs/astro/src/content/docs/tutorial/game_logic.mdx`

### 2. 组件库展示 (Gallery) - 📚 **组件参考**
**路径**: `@source/examples/gallery/`

所有 UI 组件的完整展示：

```bash
# 查看所有可用组件
cd @source/examples/gallery
cargo run
```

**学习价值**:
- 了解所有内置组件的用法
- 学习布局和样式系统
- 参考组件设计模式
- 快速查找需要的组件实现

### 3. 待办事项 (Todo) - 📝 **基础应用**
**路径**: `@source/examples/todo/`

经典的 CRUD 应用示例：

```bash
# 运行待办事项应用
cd @source/examples/todo
cargo run
```

**学习价值**:
- 数据绑定和状态管理
- 列表操作和用户输入
- 基础的应用架构
- Rust 与 Slint 数据交互

## 🚀 进阶学习示例

### 4. 打印机演示 (Printer Demo) - 🖨️ **复杂应用**
**路径**: `@source/examples/printerdemo/`

大型应用的最佳实践：

```bash
# 运行打印机管理界面
cd @source/examples/printerdemo
cargo run
```

**学习价值**:
- 复杂应用架构设计
- 多窗口和对话框管理
- 高级状态管理
- 专业 UI 设计模式

### 5. IoT 仪表板 - 📊 **数据可视化**
**路径**: `@source/examples/iot-dashboard/`

实时数据展示：

```bash
# 运行 IoT 仪表板
cd @source/examples/iot-dashboard
cargo run
```

**学习价值**:
- 实时数据更新
- 图表和仪表设计
- 数据可视化技术
- 动态界面更新

### 6. 滑块拼图 (Slide Puzzle) - 🎮 **游戏开发**
**路径**: `@source/examples/slide_puzzle/`

游戏开发完整示例：

```bash
# 运行滑块拼图游戏
cd @source/examples/slide_puzzle
cargo run
```

**学习价值**:
- 游戏状态机设计
- 复杂用户交互处理
- 动画和过渡效果
- 游戏循环和计时器

## 🔧 特殊用途示例

### 嵌入式开发
- **MCU 板支持**: `@source/examples/mcu-board-support/`
- **MCU Embassy**: `@source/examples/mcu-embassy/`

### 多媒体和图形
- **OpenGL 纹理**: `@source/examples/opengl_texture/`
- **GStreamer 播放器**: `@source/examples/gstreamer-player/`
- **图片滤镜**: `@source/examples/imagefilter/`

### Web 和网络
- **地图**: `@source/examples/maps/`
- **FFmpeg**: `@source/examples/ffmpeg/`

## 📚 推荐学习路径

### 🟢 初学者路径 (2-3 天)
1. **第1天**: 记忆游戏教程 + `@source/examples/memory/`
   - 上午: 完成官方教程 1-4 章
   - 下午: 分析 memory 示例代码
2. **第2天**: 组件学习 + `@source/examples/gallery/`
   - 上午: 浏览所有组件类型
   - 下午: 实践自定义组件
3. **第3天**: 基础应用 + `@source/examples/todo/`
   - 上午: 学习数据绑定
   - 下午: 创建简单的 CRUD 应用

### 🟡 进阶开发者路径 (1 周)
1. **Day 1-2**: 深入记忆游戏 (`memory/`)
2. **Day 3-4**: 复杂应用分析 (`printerdemo/`)
3. **Day 5**: 数据可视化 (`iot-dashboard/`)
4. **Day 6-7**: 游戏开发 (`slide_puzzle/`)

### 🔴 专家路径 (按需学习)
根据项目需求选择特定示例深入研究：
- 嵌入式: `mcu-board-support/`
- 多媒体: `gstreamer-player/`, `opengl_texture/`
- Web 应用: WebAssembly 相关示例

## 🛠️ 实践练习建议

### 1. 代码复现练习
选择示例中的关键功能，独立重新实现：

```rust
// 示例：复现记忆游戏中的卡片翻转
// 参考 @source/examples/memory/ui/main.slint
// 实现自己的翻转动画和状态管理
```

### 2. 功能扩展练习
基于现有示例添加新功能：

```rust
// 示例：为 todo 应用添加分类功能
// 参考 @source/examples/todo/
// 添加新的数据模型和 UI 组件
```

### 3. 组件提取练习
从复杂示例中提取可复用组件：

```rust
// 示例：从 printerdemo 提取通用对话框组件
// 参考 @source/examples/printerdemo/
// 创建独立的对话框库
```

## 🔍 代码分析技巧

### 查看项目结构
```bash
# 分析示例的项目组织
tree @source/examples/memory/ -I target

# 查看依赖关系
cat @source/examples/memory/Cargo.toml
```

### 学习关键文件
```bash
# 每个 Slint 项目的核心文件
@source/examples/[name]/ui/main.slint    # UI 定义
@source/examples/[name]/src/main.rs      # Rust 逻辑
@source/examples/[name]/build.rs         # 构建配置
```

### 理解数据流
1. Slint 组件中的属性定义
2. Rust 中的回调处理
3. 数据模型和状态管理
4. 事件传递和更新机制

## 📖 与官方文档结合

每个示例都对应官方文档的特定章节：

- **Memory Game** → `@source/docs/astro/src/content/docs/tutorial/`
- **Gallery** → `@source/docs/astro/src/content/docs/guide/language/`
- **Todo** → 数据绑定相关文档
- **PrinterDemo** → 高级架构文档

学习时建议：
1. 先运行示例，了解功能
2. 阅读对应文档，理解概念
3. 分析代码，掌握实现
4. 动手实践，巩固知识