# Slint 源码结构指南

## 官方源码 Submodule

本技能包含 Slint 官方仓库作为 `git submodule`，位于 `source/` 目录下。

### 初始化和更新

```bash
# 初始化 submodule
git submodule update --init --recursive

# 更新到最新版本
git submodule update --remote source

# 查看当前版本
cd source && git log -1
```

### 官方源码目录结构

```
source/
├── LICENSE                   # 许可证文件
├── README.md                 # 项目说明
├── Cargo.toml               # 主项目配置
├── api/                     # API 实现
│   ├── cpp/                 # C++ API
│   ├── rs/                  # Rust API
│   └── python/              # Python API
├── docs/                    # 官方文档
│   ├── cookbooks/           # 实用示例
│   ├── tutorials/           # 教程
│   ├── blog/                # 博客文章
│   └── language/            # 语言参考
├── examples/                # 官方示例
│   ├── gallery/             # 图库示例
│   ├── memory/              # 记忆游戏
│   ├── todo/                # 待办事项
│   ├── printerdemo/         # 打印机演示
│   └── ...                  # 更多示例
├── editors/                 # 编辑器支持
│   ├── tree-sitter-slint    # Tree-sitter 语法支持
│   ├── vscode-slint         # VS Code 扩展
│   └── ...                  # 其他编辑器
├── tools/                   # 工具
│   ├── lsp/                 # LSP 服务器
│   ├── slint-lsp/           # LSP 实现
│   └── ...                  # 其他工具
├── ui-libraries/            # UI 组件库
│   ├── material/            # Material Design 组件
│   ├── fluent/              # Fluent Design 组件
│   └── ...                  # 其他组件库
├── tests/                   # 测试
├── demos/                   # 演示应用
└── internal/                # 内部实现
```

## 重要参考路径

### 文档参考
- **语言参考**: `source/docs/language/`
- **教程**: `source/docs/tutorials/`
- **实用示例**: `source/docs/cookbooks/`
- **API 文档**: `source/api/rs/slint/README.md`

### 示例代码
- **基础示例**: `source/examples/gallery/`
- **完整应用**: `source/examples/memory/`, `source/examples/todo/`
- **高级特性**: `source/examples/custom_widgets/`
- **跨平台**: `source/demos/`

### 组件库
- **Material 组件**: `source/ui-libraries/material/`
- **Fluent 组件**: `source/ui-libraries/fluent/`
- **内置组件**: `source/api/rs/slint/builtin/

## 技能文档与官方源码的对应关系

### 技能的 docs/ 目录
```
docs/
├── language/          → source/docs/language/
├── builtin/           → source/api/rs/slint/builtin/
├── tutorials/         → source/docs/tutorials/
├── cookbook/          → source/docs/cookbooks/
└── integration/       → source/api/rs/slint/
```

### 技能的 examples/ 目录
```
examples/
├── widgets/           → source/examples/gallery/
├── layouts/           → source/examples/gallery/
├── animations/        → source/examples/gallery/
└── advanced/          → source/examples/custom_widgets/
```

### 技能的 templates/ 目录
基于官方示例创建：
- `templates/basic-app/` → 基于 `source/examples/gallery/`
- `templates/component-library/` → 基于 `source/ui-libraries/`
- `templates/cross-platform/` → 基于 `source/demos/printerdemo/`

## 使用官方源码的指导原则

### 1. 优先参考官方示例
当需要实现某个功能时，首先查看 `source/examples/` 中是否有相关示例。

### 2. 参考官方文档
- 语言语法：查看 `source/docs/language/`
- API 使用：查看 `source/api/rs/slint/`
- 最佳实践：查看 `source/docs/cookbooks/`

### 3. 使用官方组件库
优先使用 `source/ui-libraries/` 中的官方组件，而不是重新实现。

### 4. 跟随最新更新
定期更新 submodule 以获取最新的功能和修复：

```bash
git submodule update --remote source
```

## 贡献指南

### 添加新内容时
1. 首先检查官方源码是否已有相关内容
2. 如果有，直接引用官方文档和示例
3. 如果没有，基于官方最佳实践创建新内容

### 更新内容时
1. 检查官方源码是否有更新
2. 确保示例代码与官方 API 保持一致
3. 更新文档以反映最新的功能

## 常用路径速查

### 快速查找示例
```bash
# 查找所有 Rust 示例
find source/examples -name "*.rs" -type f

# 查找所有 .slint 文件
find source/examples -name "*.slint" -type f

# 查找特定组件的示例
find source/examples -name "*button*" -type f
```

### 查看文档
```bash
# 语言参考
ls source/docs/language/

# 教程
ls source/docs/tutorials/

# API 文档
ls source/api/rs/slint/
```