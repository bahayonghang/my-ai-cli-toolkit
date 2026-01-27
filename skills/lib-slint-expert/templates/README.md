# Slint 项目模板集合

基于官方示例创建的项目模板，帮助您快速启动不同类型的 Slint 应用开发。

## 📋 模板列表

### 1. basic-app/ - 基础应用模板
基于官方 `@source/examples/todo/` 和 `@source/examples/memory/`

适合场景：
- 第一次学习 Slint
- 简单的工具应用
- 概念验证项目

特性：
- 标准 Cargo 项目结构
- 基础组件和布局
- Rust 数据绑定示例
- 简单的状态管理

### 2. component-library/ - 组件库模板
基于官方 `@source/examples/gallery/` 和 `@source/ui-libraries/`

适合场景：
- 构建可复用组件库
- 大型应用的组件系统
- 设计系统实现

特性：
- 模块化组件架构
- 组件文档和示例
- 主题和样式系统
- 组件测试框架

### 3. cross-platform/ - 跨平台模板
基于官方 `@source/examples/printerdemo/` 和 WebAssembly 示例

适合场景：
- 需要多平台部署的应用
- Web 和桌面应用
- 嵌入式设备应用

特性：
- 多平台构建配置
- 平台特定优化
- WebAssembly 支持
- 嵌入式部署配置

### 4. game-development/ - 游戏开发模板
基于官方 `@source/examples/memory/` 和 `@source/examples/slide_puzzle/`

适合场景：
- 休闲游戏开发
- 交互式应用
- 教育软件

特性：
- 游戏循环架构
- 动画系统
- 状态机管理
- 用户交互处理

### 5. data-visualization/ - 数据可视化模板
基于官方 `@source/examples/iot-dashboard/` 和 `@source/examples/plotter/`

适合场景：
- 监控仪表板
- 数据分析应用
- 实时数据显示

特性：
- 图表组件库
- 实时数据更新
- 数据流处理
- 响应式布局

## 🚀 使用模板

### 快速开始
```bash
# 选择模板
cp -r templates/basic-app/ my-project/
cd my-project/

# 自定义项目
sed -i 's/basic-app/my-project/g' Cargo.toml
sed -i 's/Basic App/My Project/g' ui/main.slint

# 运行项目
cargo run
```

### 模板定制指南

#### 1. 基础应用定制
```bash
# 基于 basic-app/ 模板创建
# 参考 @source/docs/astro/src/content/docs/tutorial/getting_started.mdx
# 添加自定义组件和功能
```

#### 2. 组件库扩展
```bash
# 基于 component-library/ 模板创建
# 参考 @source/ui-libraries/ 官方组件库
# 实现自定义设计系统
```

#### 3. 跨平台配置
```bash
# 基于 cross-platform/ 模板创建
# 参考 @source/docs/astro/src/content/docs/tutorial/running_in_a_browser.mdx
# 配置目标平台构建
```

## 📚 模板与官方示例对应关系

| 模板 | 官方示例 | 用途 |
|------|----------|------|
| basic-app/ | todo/, memory/ | 学习和简单应用 |
| component-library/ | gallery/, ui-libraries/ | 组件开发和设计系统 |
| cross-platform/ | printerdemo/ | 企业级和跨平台应用 |
| game-development/ | memory/, slide_puzzle/ | 游戏和交互式应用 |
| data-visualization/ | iot-dashboard/, plotter/ | 数据密集型应用 |

## 🛠️ 模板维护

### 更新模板
```bash
# 定期从官方示例更新模板
git submodule update --remote source

# 检查官方示例变更
cd source/examples/
git log --oneline -10
```

### 贡献新模板
1. 基于官方示例创建新模板
2. 遵循官方最佳实践
3. 添加完整的文档和示例
4. 更新本 README 文件

## 📖 学习建议

### 新手路径
1. 从 `basic-app/` 开始
2. 完成官方教程
3. 实践修改模板
4. 创建自己的项目

### 进阶路径
1. 研究 `component-library/` 架构
2. 学习 `cross-platform/` 配置
3. 深入特定领域模板
4. 贡献模板改进

### 专家路径
1. 优化现有模板
2. 创建新领域模板
3. 参与官方社区
4. 分享最佳实践