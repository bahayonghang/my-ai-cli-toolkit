# Change: AgentKit Desktop Application

## Why

当前 AI 编码工具生态中资源分散、安装复杂、管理困难、平台割裂，需要一个统一的桌面应用来管理 Skills、Commands 和 Agents 资源。

## What Changes

- **ADDED** 新建 AgentKit Desktop 应用项目（Tauri 2.0 + React + Rust）
- **ADDED** 核心数据模型：ResourceType、SyncStatus、Platform、ResourceItem 等
- **ADDED** Tauri Commands API：资源管理、平台检测、同步操作
- **ADDED** SQLite 数据库 Schema：resources、platforms、resource_platform_status 等表
- **ADDED** Sync Engine：支持 Symlink/Junction/Copy 三种链接策略
- **ADDED** Resource Managers：SkillManager、CommandManager、AgentManager
- **ADDED** 外部技能集成：支持 npm/pip/git/vercel 源
- **ADDED** 前端 UI：三栏布局、资源列表、详情面板、设置页面

## Impact

- **Affected specs**: `core` (新建)
- **Affected code**: 无（新项目）
- **Breaking changes**: 无

## Technical Approach

### 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| **桌面框架** | Tauri 2.0 | 轻量级、安全、跨平台 |
| **后端语言** | Rust | 高性能、内存安全、Tauri 原生支持 |
| **前端框架** | React + TypeScript | 生态成熟、类型安全 |
| **UI 样式** | TailwindCSS | 快速开发、主题定制 |
| **构建工具** | Vite | 快速热更新、优化的生产构建 |
| **数据存储** | SQLite | 轻量级、无需安装、Rust 原生支持 |
| **状态管理** | Zustand | 轻量级、React 友好 |

### 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                         AgentKit Desktop                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Frontend                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │ Skills   │ │ Commands │ │ Agents   │ │ Settings │   │    │
│  │  │  Panel   │ │  Panel   │ │  Panel   │ │  Panel   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │ Tauri IPC                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Rust Backend                         │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐  │    │
│  │  │ Core Managers  │ │  Sync Engine   │ │  Platform   │  │    │
│  │  │                │ │                │ │  Detection  │  │    │
│  │  └────────────────┘ └────────────────┘ └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Engineering Principles Review

### KISS (Keep It Simple, Stupid)
- ✅ MVP 专注核心功能，暂不考虑高级特性如版本回滚、冲突解决向导
- ✅ UI 使用成熟组件库，不造轮子

### YAGNI (You Aren't Gonna Need It)
- ✅ MVP 不包含：权限管理、团队协作、云同步
- ✅ 不实现自定义主题引擎，仅支持深色/浅色切换
- ✅ 不实现插件系统，功能内置

### DRY (Don't Repeat Yourself)
- ✅ 三类资源共享抽象的 `ResourceManager` trait
- ✅ 平台配置统一管理，避免硬编码路径
- ✅ 同步策略使用 Strategy 模式，各平台复用

### SOLID
- **S**: 每个 Manager 负责一类资源，SyncEngine 专注同步逻辑
- **O**: 通过 trait 支持新增外部源类型
- **L**: `LinkStrategy` trait 的实现可互相替换
- **I**: 前端只调用必要的 Tauri commands
- **D**: 核心逻辑依赖 trait，而非具体实现

## Risk Assessment

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| Rust 学习曲线 | 中 | 参考 skills-hub 实现，使用成熟库 |
| 符号链接权限问题 | 高 | Windows 提供开发者模式提示，降级为复制 |
| 跨平台兼容性 | 中 | Windows 优先，其他平台社区验证 |

## Success Metrics

- 支持 8+ 个 AI 编码工具平台
- 资源安装成功率 > 95%
- 应用启动时间 < 1s

## Open Questions

1. **数据迁移**：是否需要从现有 Python 工具导入配置？
2. **冲突处理**：本地修改和源更新冲突时的默认策略？
3. **离线支持**：是否需要离线安装能力？
