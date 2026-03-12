# Issue 管理命令

GitHub Issue 发现、规划和执行流水线，支持多代理编排。

## 命令

### `discover`

**描述**: 多视角 Issue 发现，扫描代码模块以查找潜在缺陷、UX 问题、测试缺口、安全漏洞等。
**用法**: `/issue:discover <path-pattern> [--perspectives=bug,ux,...] [--external]`

#### 视角

| 视角 | 关注点 | Exa 研究 |
|------|--------|:--------:|
| `bug` | 边界情况、空值检查、资源泄漏、竞态条件 | - |
| `ux` | 错误信息、加载状态、无障碍、交互 | - |
| `test` | 缺失测试、覆盖缺口、断言质量 | - |
| `quality` | 复杂度、重复、命名、代码异味 | - |
| `security` | 注入、认证、加密、输入验证 | 是 |
| `performance` | N+1 查询、内存使用、缓存、阻塞操作 | - |
| `maintainability` | 耦合、内聚、技术债务、模块边界 | - |
| `best-practices` | 约定、反模式、框架使用 | 是 |

未提供 `--perspectives` 标志时，交互式提示提供预设组合（快速扫描、全面分析、安全审计）。

#### 工作流程

1. 解析目标模式并解析文件
2. 交互式视角选择（或使用 `--perspectives`）
3. 并行启动代理（每个视角一个）进行分析
4. 聚合发现、去重并计算优先级分数
5. 生成候选 Issue 和摘要
6. 提示用户下一步操作（导出为 Issue、打开仪表板或跳过）

输出存储在 `.workflow/issues/discoveries/{discovery-id}/`。

### `discover-by-prompt`

**描述**: 基于提示的 Issue 发现，使用 Gemini 规划的迭代多代理探索和跨模块比较。
**用法**: `/issue:discover-by-prompt <prompt> [--scope=src/**] [--depth=standard|deep] [--max-iterations=5]`

与 `discover`（固定视角）不同，此命令使用自然语言提示，通过 Gemini 规划动态生成探索维度。支持跨模块比较（如前端与后端 API 契约）。

#### 选项

| 标志 | 默认值 | 描述 |
|------|--------|------|
| `--scope` | `**/*` | 探索的文件模式 |
| `--depth` | `standard` | `standard`（3 次迭代）或 `deep`（5+ 次） |
| `--max-iterations` | 5 | 最大探索迭代次数 |
| `--plan-only` | `false` | 规划阶段后停止以供审查 |

### `execute`

**描述**: 使用基于 DAG 的并行编排执行已排队 Issue 的实施计划。
**用法**: `/issue:execute --queue <queue-id> [--worktree [<existing-path>]]`

将解决方案 ID 分派给执行器（Codex、Gemini 或 Claude 代理）。每个执行器接收包含所有任务的完整解决方案，按顺序实施，每个解决方案提交一次。

- 队列 ID 为必填项（未提供时交互式选择）
- 并行度由任务依赖 DAG 自动确定
- 可选的 worktree 隔离，用于整个队列执行

### `new`

**描述**: 从 GitHub URL 或文本描述创建新的结构化 Issue。
**用法**: `/issue:new <github-url | 文本描述> [--priority 1-5]`

支持三种输入类型：
- **GitHub URL**（清晰度 3）：通过 `gh` CLI 直接获取和解析
- **结构化文本**（清晰度 1-2）：解析 `expected:`、`actual:`、`affects:` 等字段
- **模糊描述**（清晰度 0）：询问一个澄清问题

非 GitHub 来源的 Issue 可选择发布到 GitHub 并自动关联。

### `plan`

**描述**: 使用统一的探索+规划代理批量规划 Issue 解决方案。
**用法**: `/issue:plan [<issue-id>[,<issue-id>,...]] [--all-pending] [--batch-size 3]`

通过 Gemini 按语义相似性分组相似 Issue，然后并行启动代理执行代码库探索（ACE 语义搜索）和解决方案生成（含任务分解）。单一解决方案自动绑定；多个候选方案呈现给用户选择。

未提供 Issue ID 时默认使用 `--all-pending`。

### `queue`

**描述**: 从已绑定的解决方案构建执行队列，包含冲突分析和依赖排序。
**用法**: `/issue:queue [--queues <n>] [--issue <id>] [--append <id>]`

分析所有已绑定的解决方案，解决解决方案间的冲突（文件、API、数据、依赖、架构），构建依赖 DAG，并在解决方案级别创建有序执行队列。

| 标志 | 描述 |
|------|------|
| `--queues <n>` | 并行队列数量（默认：1） |
| `--issue <id>` | 仅为特定 Issue 构建队列 |
| `--append <id>` | 将 Issue 追加到活跃队列 |
| `--force` | 跳过活跃队列检查 |

## 示例

```bash
# 使用快速扫描发现 auth 模块中的问题
/issue:discover src/auth/** --perspectives=bug,test,quality

# 基于提示发现 API 契约不匹配
/issue:discover-by-prompt "检查前端 API 调用是否与后端实现匹配"

# 从 GitHub 创建 Issue
/issue:new https://github.com/org/repo/issues/42

# 从文本创建 Issue
/issue:new "登录时特殊字符导致失败。预期：成功。实际：500 错误"

# 规划所有待处理的 Issue
/issue:plan

# 规划特定 Issue
/issue:plan GH-123,GH-124

# 构建执行队列
/issue:queue

# 在 worktree 中执行队列
/issue:execute --queue QUE-xxx --worktree
```

## 注意事项

- 完整流水线为：`new` -> `plan` -> `queue` -> `execute`
- 所有数据存储在 `.workflow/issues/` 下（issues.jsonl、solutions/、queues/、discoveries/）
- 使用 CLI 命令（`ccw issue ...`）进行 CRUD 操作；切勿直接读取大型 JSONL 文件
- `discover` 和 `discover-by-prompt` 是独立的发现工具，可通过导出接入流水线
