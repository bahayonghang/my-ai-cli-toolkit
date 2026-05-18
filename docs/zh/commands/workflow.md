# workflow

> 历史 / 已下线说明：本页记录的是已经移除的命令家族。当前 `content/platforms/*/commands/` 中没有对应源树，因此本页只作为兼容参考保留，不进入 live sidebar。


开发工作流命令家族，提供从规划、执行、调试、测试到评审的完整开发生命周期支持。

## 概述

`workflow` 是最大的命令家族，包含约 30 个命令，按功能分为六个子族：

| 子族 | 命令数 | 用途 |
|------|--------|------|
| [核心工作流](#核心工作流) | 14 | 规划、执行、调试、评审、测试等主流程 |
| [TDD](#tdd-测试驱动开发) | 2 | 测试驱动开发的规划与验证 |
| [brainstorm](#brainstorm-头脑风暴) | 12 | 多角色并行头脑风暴与需求澄清 |
| [session](#session-会话管理) | 5 | 工作流会话的生命周期管理 |
| [tools](#tools-工具命令) | 8 | 上下文收集、任务生成等辅助工具 |
| [ui-design](#ui-design-界面设计) | 10 | 设计系统提取、原型生成与同步 |

---

## 核心工作流

### 规划与执行

| 命令 | 描述 |
|------|------|
| `init` | 初始化项目级状态，使用 `cli-explore-agent` 进行智能项目分析 |
| `plan` | 五阶段规划工作流，生成 `IMPL_PLAN.md` 和任务 JSON |
| `lite-plan` | 轻量交互式规划，内存中规划后交由 `lite-execute` 执行 |
| `multi-cli-plan` | 多 CLI 协作规划，使用 Gemini + Codex + Claude 交叉验证收敛最优方案 |
| `replan` | 交互式重新规划，更新会话级产物并澄清边界 |
| `execute` | 协调代理执行工作流任务，支持自动会话发现、并行处理和状态跟踪 |
| `lite-execute` | 基于内存计划、提示描述或文件内容执行任务 |
| `lite-lite-lite` | 超轻量分析与直接执行，简单任务无产物，复杂任务自动创建规划文档 |
| `action-plan-verify` | 非破坏性交叉一致性分析，验证 `IMPL_PLAN.md` 与任务 JSON 的质量门禁 |

### 调试

| 命令 | 描述 |
|------|------|
| `debug` | 交互式假设驱动调试，NDJSON 日志记录，迭代直至解决 |
| `debug-with-file` | 带文档记录的交互式调试，支持理解演进和 Gemini 辅助纠正 |

### 代码清理

| 命令 | 描述 |
|------|------|
| `clean` | 智能代码清理，主线检测、过期产物发现与安全执行 |

### 评审

| 命令 | 描述 |
|------|------|
| `review` | 实现后评审，支持安全/架构/待办/质量等专项类型 |
| `review-fix` | 自动修复代码评审发现，AI 驱动规划与协调执行 |
| `review-module-cycle` | 独立的多维度模块代码评审，跨 7 个维度分析指定代码路径 |
| `review-session-cycle` | 基于会话的综合多维度评审，分析 Git 变更并循环深挖直至质量门禁通过 |

### 测试

| 命令 | 描述 |
|------|------|
| `test-gen` | 从已完成的实现会话创建独立测试工作流，分析代码生成测试任务 |
| `test-fix-gen` | 从会话 ID、描述或文件路径创建测试修复工作流 |
| `test-cycle-execute` | 执行测试修复循环，动态生成任务并迭代直至通过率 >= 95% |
| `lite-fix` | 轻量 bug 诊断与修复，智能严重度评估，可选热修复模式 |

---

## TDD 测试驱动开发

遵循 Red-Green-Refactor 循环的测试驱动开发工作流。

| 命令 | 描述 |
|------|------|
| `tdd-plan` | TDD 工作流规划，生成 Red-Green-Refactor 任务链与周期跟踪 |
| `tdd-verify` | 验证 TDD 合规性，生成周期质量报告与覆盖率分析 |

### 使用方法

```bash
/workflow:tdd-plan "实现速率限制中间件"     # 生成 TDD 任务链
/workflow:tdd-verify                        # 验证 TDD 周期合规性
```

---

## brainstorm 头脑风暴

基于角色的多视角并行头脑风暴系统。每个角色针对指导规范的讨论要点生成 `analysis.md` 分析文档。

### 协调命令

| 命令 | 描述 |
|------|------|
| `artifacts` | 交互式澄清，通过角色分析和综合生成确认的指导规范 |
| `auto-parallel` | 动态角色选择与并发执行的并行头脑风暴自动化 |
| `synthesis` | 通过智能问答和定向更新澄清与完善角色分析 |

### 角色专项视角

每个角色生成或更新其领域视角的 `{role}/analysis.md`：

| 命令 | 视角 |
|------|------|
| `api-designer` | API 设计 |
| `data-architect` | 数据架构 |
| `product-manager` | 产品管理 |
| `product-owner` | 产品所有权 |
| `scrum-master` | 敏捷流程 |
| `subject-matter-expert` | 领域专业知识 |
| `system-architect` | 系统架构 |
| `ui-designer` | UI 设计 |
| `ux-expert` | 用户体验 |

**用法**：`/workflow:brainstorm:{role} "可选主题"`

---

## session 会话管理

工作流会话的生命周期管理。会话 ID 遵循 `WFS-{type}-{timestamp}` 命名规范。

| 命令 | 描述 |
|------|------|
| `start` | 发现现有会话或启动新工作流会话，支持冲突检测 |
| `list` | 列出所有工作流会话，支持状态过滤和进度信息 |
| `resume` | 恢复最近暂停的工作流会话 |
| `complete` | 标记活跃会话为完成，归档并记录经验教训 |
| `solidify` | 将会话学习和用户定义的约束固化为永久项目指南 |

### 使用方法

```bash
/workflow:session:start --type workflow --new "实现搜索功能"
/workflow:session:list
/workflow:session:resume
/workflow:session:complete
/workflow:session:solidify --type convention "所有 API 端点必须返回标准错误格式"
```

---

## tools 工具命令

供其他工作流命令内部调用的辅助工具，通常不由用户直接使用。

| 命令 | 描述 |
|------|------|
| `context-gather` | 使用 context-search-agent 收集项目上下文，打包为标准化 JSON |
| `test-context-gather` | 收集测试覆盖率上下文，打包为标准化 test-context JSON |
| `task-generate-agent` | 生成实现计划文档（`IMPL_PLAN.md`、任务 JSON、`TODO_LIST.md`） |
| `task-generate-tdd` | 自主 TDD 任务生成，含 Red-Green-Refactor 循环与验证 |
| `test-task-generate` | 生成测试规划文档（`IMPL_PLAN.md`、测试任务 JSON、`TODO_LIST.md`） |
| `test-concept-enhanced` | 协调测试分析工作流，通过 Gemini 生成测试策略 |
| `tdd-coverage-analysis` | 分析测试覆盖率和 TDD 循环执行，验证 Red-Green-Refactor 合规性 |
| `conflict-resolution` | 使用 CLI 驱动分析检测和解决计划与现有代码库之间的冲突 |

---

## ui-design 界面设计

设计系统提取、原型生成和设计到代码的工作流。

### 设计提取

| 命令 | 描述 |
|------|------|
| `style-extract` | 从参考图片或文本提示提取设计风格，支持变体生成 |
| `layout-extract` | 从参考图片或文本提示提取结构布局信息 |
| `animation-extract` | 从提示推断和图片参考中提取动画与过渡模式 |
| `import-from-code` | 从代码文件（CSS/JS/HTML/SCSS）导入设计系统，自动文件发现 |

### 原型生成

| 命令 | 描述 |
|------|------|
| `generate` | 组合布局模板和设计令牌组装 UI 原型（默认支持动画） |
| `explore-auto` | 交互式探索性 UI 设计，风格批量生成与并行执行 |
| `imitate-auto` | 从代码/图片输入提取设计令牌并生成原型 |

### 同步与输出

| 命令 | 描述 |
|------|------|
| `codify-style` | 从代码提取样式并生成可共享的参考包与预览 |
| `design-sync` | 将最终设计系统参考同步到头脑风暴产物，为 `/workflow:plan` 做准备 |
| `reference-page-generator` | 从设计运行提取生成多组件参考页面和文档 |

---

## 示例

```bash
# 完整工作流：规划 -> 执行 -> 评审
/workflow:plan "添加 JWT 用户认证"
/workflow:execute
/workflow:review --type=security

# 简单任务的轻量级流程
/workflow:lite-plan "修复用户列表分页 bug"
/workflow:lite-execute --in-memory

# TDD 工作流
/workflow:tdd-plan "实现速率限制中间件"
/workflow:execute
/workflow:tdd-verify

# 多视角头脑风暴
/workflow:brainstorm:auto-parallel "实时通知系统" --count 5

# 会话管理
/workflow:session:start --type workflow --new "实现搜索功能"
/workflow:session:complete

# UI 设计探索
/workflow:ui-design:explore-auto --input "现代仪表盘" --targets "dashboard,settings"
```

## 注意事项

- 工作流会话存储在 `.workflow/active/`（活跃）和 `.workflow/archived/`（已完成）
- `tools` 子族命令通常由其他工作流命令内部调用，而非用户直接使用
- 评审维度包括：安全、架构、性能、可维护性、测试、错误处理和代码质量
- UI 设计命令将产物存储在 `.workflow/ui-design/` 的设计运行目录中

## 相关链接

- [命令目录](/zh/commands/catalog)
- [命令概览](/zh/commands/)
