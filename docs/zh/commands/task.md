# 任务管理命令

> 历史 / 已下线说明：本页记录的是已经移除的命令家族。当前 `content/platforms/*/commands/` 中没有对应源树，因此本页只作为兼容参考保留，不进入 live sidebar。


任务生命周期管理，提供从创建、分解、执行到重新规划的完整工作流。任务以 JSON 文件存储，使用 `IMPL-N` 格式 ID，支持最多两级层次结构（`IMPL-N.M`）。

## 命令

### `create`

**描述**: 从自然语言描述生成任务 JSON，自动完成文件模式检测、范围推断和依赖分析。
**用法**: `/task:create "任务标题"`

#### 自动行为

- ID 生成：自动递增 `IMPL-N` 格式
- 上下文继承：从活跃工作流会话继承需求和范围
- Agent 分配：根据任务类型和标题关键词自动建议
- 状态设置：初始状态为 `pending`
- 文件创建：保存至 `.task/IMPL-[N].json`

#### 任务类型

| 类型 | 描述 |
|------|------|
| `feature` | 新功能（默认） |
| `bugfix` | 缺陷修复 |
| `refactor` | 代码重构 |
| `test` | 测试实现 |
| `docs` | 文档编写 |

#### Agent 分配规则

| 关键词 | Agent |
|--------|-------|
| Build / Implement | `@code-developer` |
| Design / Plan | `@planning-agent` |
| Write tests / Generate tests | `@code-developer`（type: `test-gen`） |
| Execute tests / Fix tests | `@test-fix-agent`（type: `test-fix`） |
| Review / Audit | `@universal-executor`（仅在明确请求时） |

#### 上下文继承

任务从以下来源继承上下文：

1. 活跃会话 — `workflow-session.json` 中的需求和范围
2. 规划文档 — `IMPL_PLAN.md` 中的上下文
3. 父任务 — 子任务（`IMPL-N.M` 格式）继承父任务上下文

---

### `breakdown`

**描述**: 将复杂任务分解为可执行的子任务，支持依赖映射、文件冲突检测和功能重叠警告。
**用法**: `/task:breakdown <task-id>`

#### 核心规则

- 仅 `pending` 状态的任务可被分解
- 仅支持手动分解（自动分解已禁用）
- 父任务变为 `container` 状态（不可直接执行）
- 子任务使用 `IMPL-N.M` 格式（最多两级）
- 总任务数不得超过 10 个

#### 分解流程

1. 会话检查：验证活跃会话包含父任务
2. 任务验证：确认父任务为 `pending` 状态
3. 10 任务限制检查：验证分解后不超限
4. 手动分解：用户定义子任务并实时验证
5. 文件冲突检测：同一文件不可分布在多个子任务中
6. 功能重叠警告：提示标题相似的子任务合并
7. 上下文分发：继承父任务需求和范围
8. Agent 分配：根据子任务类型自动分配
9. TODO_LIST 更新：重新生成层次结构

#### 安全控制

| 控制项 | 说明 |
|--------|------|
| 文件冲突检测 | 扫描 `focus_paths`，阻止同一文件跨子任务分布 |
| 功能重叠检测 | 分析子任务标题关键词，建议合并相关功能 |
| 10 任务限制 | 计算当前总数 + 新子任务数，超限则拒绝 |
| 手动控制 | 用户必须逐一定义子任务，执行前需确认 |

---

### `execute`

**描述**: 使用智能 Agent 选择、上下文准备和进度跟踪执行任务。
**用法**: `/task:execute <task-id>`

#### 执行模式

| 模式 | 说明 |
|------|------|
| `auto`（默认） | 全自动执行，自动选择 Agent，在检查点提供进度更新 |
| `guided` | 逐步执行，每个检查点需用户确认，支持动态调整 |
| `review` | 使用 `@universal-executor` 进行可选的手动审查 |

#### Agent 选择逻辑

根据任务标题关键词自动选择：

| 关键词 | Agent |
|--------|-------|
| Build API / Implement | `@code-developer` |
| Design schema / Plan | `@planning-agent` |
| Write tests / Generate tests | `@code-developer`（test-gen） |
| Execute tests / Fix tests | `@test-fix-agent`（test-fix） |
| Review code | `@universal-executor` |
| 其他 | `@code-developer`（默认） |

支持 `--agent=<agent-type>` 手动覆盖。

#### 执行协议

1. 预执行：验证任务和依赖 → 准备执行上下文 → 协调 TodoWrite
2. 执行：Agent 根据上下文执行任务
3. 后执行：更新任务状态 → 生成摘要 → 保存产物 → 同步进度 → 验证文件完整性

#### 任务与子任务处理

- 父任务：自动执行其子任务
- 通配符（`IMPL-1.*`）：查找匹配任务，支持并行执行
- 单任务：直接执行

#### 错误恢复

执行失败时提供以下选项：
- 从检查点重试
- 从头重试
- 切换到 `guided` 模式
- 中止执行

---

### `replan`

**描述**: 更新任务 JSON 的需求或从验证报告批量更新多个任务，支持变更跟踪和版本回滚。
**用法**: `/task:replan <task-id> ["文本"|file.md] | --batch [verification-report.md]`

> 此命令已建议迁移至 `/workflow:replan`，后者提供会话级重新规划和更完善的工件更新。

#### 操作模式

| 模式 | 用法 | 说明 |
|------|------|------|
| 直接文本 | `/task:replan IMPL-1 "添加 OAuth2 支持"` | 以文本描述变更 |
| 文件输入 | `/task:replan IMPL-1 specs.md` | 从文件加载变更（支持 .md/.txt/.json/.yaml） |
| 交互模式 | `/task:replan IMPL-1 --interactive` | 引导式逐步修改 |
| 批量模式 | `/task:replan --batch report.md` | 从验证报告批量处理 |

#### 重新规划流程

**单任务**：加载验证 → 解析输入 → 创建备份 → 更新 JSON → 保存并递增版本 → 更新会话

**批量模式**：解析验证报告 → 初始化 TodoWrite 跟踪 → 逐任务处理（备份 → 应用变更 → 标记完成） → 生成汇总报告

#### 备份管理

- 自动备份至 `.task/backup/{task-id}-v{version}.json`
- 任务 JSON 中记录完整的 `replan_history`
- 支持版本回滚：`/task:replan IMPL-1 --rollback v1.1`

#### 批量模式集成

- 自动检测包含 "Action Plan Verification Report" 的文件并进入批量模式
- 按优先级（HIGH → MEDIUM → LOW）顺序处理
- 通过 TodoWrite 跟踪进度
- 支持 `--auto-confirm` 跳过逐任务确认

## 示例

```bash
# 创建新任务
/task:create "实现用户认证模块"

# 分解复杂任务
/task:breakdown IMPL-1

# 自动执行任务
/task:execute IMPL-1

# 引导模式执行
/task:execute IMPL-1 --mode=guided

# 重新规划单个任务
/task:replan IMPL-1 "添加 OAuth2 认证支持"

# 从验证报告批量重新规划
/task:replan --batch ACTION_PLAN_VERIFICATION.md

# 回滚到之前版本
/task:replan IMPL-1 --rollback v1.1
```

## 注意事项

- 任务以 JSON 文件存储在 `.task/` 目录下，使用 `IMPL-N` 格式 ID
- 最多支持两级层次结构（`IMPL-N.M`），总任务数不超过 10 个
- 分解仅支持手动模式，自动分解已禁用以防止文件冲突
- `execute` 一次执行一个任务，父任务自动转为执行其子任务
- `replan` 建议迁移至 `/workflow:replan` 以获得更完善的会话级支持
- 所有重新规划操作自动创建备份，支持版本回滚