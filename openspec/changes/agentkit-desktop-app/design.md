# AgentKit Desktop Application - Design Document

## Context

### Background
当前 AI 编码工具生态中，Skills、Commands、Agents 等资源分散在不同仓库和工具中，用户需要手动管理安装和更新。现有的 Python CLI 工具 (`install.py`) 功能有限，缺乏可视化界面和跨平台一致性。

### Constraints
- Windows 优先验证，需支持 macOS/Linux
- 符号链接在 Windows 上需要开发者模式或管理员权限
- 需要兼容现有的 SKILL.md 格式和目录结构
- 目标用户为开源社区开发者，需要低门槛

### Stakeholders
- 主要用户：使用多个 AI 编码工具的开发者
- 维护者：my-claude-code-settings 项目贡献者

## Goals / Non-Goals

### Goals
- 提供统一的 GUI 界面管理 Skills、Commands、Agents
- 支持 8+ 个 AI 编码工具平台
- 实现可靠的跨平台文件同步（符号链接/复制）
- 集成外部技能源（npm/pip/git/vercel）

### Non-Goals
- 不实现云同步或团队协作功能
- 不实现自定义主题引擎（仅深色/浅色）
- 不实现插件系统
- 不实现版本回滚或复杂的冲突解决向导

## Decisions

### Decision 1: Desktop Framework - Tauri 2.0

**选择**: Tauri 2.0 (Rust + WebView)

**理由**:
- 相比 Electron，打包体积小 (~10MB vs ~150MB)
- Rust 后端提供内存安全和高性能
- 原生支持跨平台文件系统操作
- 安全模型更严格，适合文件操作场景

**Alternatives considered**:
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Electron | 生态成熟，开发快 | 体积大，内存占用高 | ❌ 不适合轻量工具 |
| Flutter Desktop | 跨平台 UI 一致 | Dart 生态较小，文件操作不便 | ❌ 不适合 |
| Native (Qt/GTK) | 性能最优 | 开发成本高，跨平台复杂 | ❌ 维护成本高 |
| **Tauri 2.0** | 轻量、安全、Rust 生态 | 学习曲线 | ✅ 最佳平衡 |

### Decision 2: Sync Strategy Pattern

**选择**: Strategy 模式实现多种链接策略

**理由**:
- Windows/Unix 文件系统差异大
- 需要优雅降级：Symlink → Junction → Copy
- 便于测试和扩展新策略

**实现**:
```
LinkStrategy (trait)
├── SymlinkStrategy (Unix/macOS)
├── JunctionStrategy (Windows)
└── CopyStrategy (Fallback)
```

### Decision 3: Data Storage - SQLite

**选择**: SQLite 嵌入式数据库

**理由**:
- 无需安装额外服务
- Rust 原生支持 (rusqlite/sqlx)
- 适合单用户桌面应用
- 支持复杂查询（分类、标签、状态）

**Alternatives considered**:
- JSON 文件：查询能力弱，大数据量性能差
- IndexedDB：仅前端可用，Rust 无法直接访问

### Decision 4: State Management - Zustand

**选择**: Zustand (轻量级状态管理)

**理由**:
- 比 Redux 更简洁，无 boilerplate
- 与 React 集成良好
- 支持 TypeScript
- 适合中小型应用

## Risks / Trade-offs

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Rust 学习曲线 | 开发速度慢 | 中 | 参考 skills-hub 实现，使用成熟库 |
| Windows 符号链接权限 | 用户体验差 | 高 | 检测开发者模式，提供启用指引，降级为复制 |
| Tauri 2.0 稳定性 | 潜在 bug | 低 | 锁定版本，关注 release notes |
| 外部技能源变化 | 安装失败 | 中 | 错误处理，用户反馈机制 |

## Migration Plan

### From Python CLI (install.py)

1. **Phase 1**: AgentKit 独立运行，不影响现有 CLI
2. **Phase 2**: 提供导入功能，读取现有配置
3. **Phase 3**: 用户自行选择迁移时机
4. **Rollback**: 保留 Python CLI，用户可随时切换

### Data Migration

- 首次启动时扫描现有 skills/commands 目录
- 自动发现已安装资源并导入数据库
- 不修改现有文件结构

## Open Questions

1. **Q**: 是否需要支持从 Python CLI 导入已有配置？
   - **建议**: Phase 2 实现，非 MVP 必需

2. **Q**: 本地修改和源更新冲突时的默认策略？
   - **建议**: MVP 阶段提示用户手动处理，后续迭代添加向导

3. **Q**: 是否需要离线安装能力？
   - **建议**: 本地资源默认支持离线，外部源需要网络
