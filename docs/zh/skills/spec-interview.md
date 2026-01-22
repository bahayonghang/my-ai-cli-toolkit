# spec-interview

通过系统性访谈完善技术规格，集成 OpenSpec 实现规范驱动开发。

## 概述

通过深入的苏格拉底式访谈，将草稿规格说明转化为完整、可执行的技术文档。访谈完成后自动创建 OpenSpec proposal，在编写代码前锁定需求。

## 使用场景

- 完善 `plan.md` 或其他规格文档
- 通过系统性提问细化需求
- 生成 OpenSpec proposal 实现规范驱动开发
- 涵盖技术实现、UI/UX、边缘情况、风险评估
- 应用工程原则（KISS、YAGNI、DRY、SOLID）

## 触发词

- "帮我完善这个 plan"
- "对这个项目进行访谈"
- "创建规格提案"
- "规范驱动开发"
- 草稿规格需要全面细化时

## 工作流程

### 1. 文档分析

读取 `plan.md` 或用户指定的文档，分析：
- 核心业务目标和价值主张
- 现有技术方案的完整性
- 模糊或缺失的关键信息
- 潜在的技术债务和风险点

### 2. 系统性访谈

使用 `AskUserQuestionTool` 进行多维度深度访谈：

**A. 工程原则审查（必须）**
- KISS & YAGNI：该功能是否为 MVP 必需？是否可以简化？
- DRY：识别可抽象的模式
- SOLID：单一职责、可扩展接口、依赖管理

**B. 技术实现细节**
- 技术栈选型及理由
- 数据结构与算法
- 性能瓶颈与优化
- 第三方依赖与风险
- 测试策略

**C. API 设计（如适用）**
- API 清晰性与逻辑分组
- 请求/响应模型
- 认证与授权
- 错误处理与状态码
- 版本控制策略

**D. UI/UX 设计（如适用）**
- 用户交互流程
- 边界情况 UI 反馈
- 响应式设计与可访问性
- 国际化

**E. 风险评估**
- 技术债务容忍度
- 安全性考量
- 可维护性 vs 速度权衡
- 成本估算

**F. 边缘情况与异常处理**
- 网络故障、超时、重试
- 并发冲突
- 降级策略
- 日志与监控

### 3. 高风险操作检测

主动警告以下操作：
- 文件删除
- Git 强制推送
- 环境变量修改
- 数据库结构变更
- 批量依赖更新

### 4. 创建 OpenSpec Proposal

访谈完成后，自动创建 OpenSpec proposal：

**不同平台的命令：**
- Claude Code / Codex / Qoder / RooCode：`/openspec:proposal`
- Cursor / Continue / GitHub Copilot / Windsurf：`/openspec-proposal`
- 其他工具（AGENTS.md 兼容）："创建 OpenSpec proposal"

**生成的结构：**
```
openspec/
├── changes/
│   └── <change-name>/
│       ├── proposal.md          # 变更提案
│       ├── tasks.md             # 任务清单
│       └── specs/               # 规格差异
│           └── <spec-name>/
│               └── spec.md      # 规格变更
└── specs/                       # 当前规格（归档后更新）
    └── <spec-name>/
        └── spec.md
```

**生成的文件：**

1. **Proposal**（`openspec/changes/<change-name>/proposal.md`）
   - 变更概述与业务价值
   - 技术方案与架构决策
   - 工程原则审查结果
   - 风险评估与缓解措施
   - 成功标准

2. **Tasks**（`openspec/changes/<change-name>/tasks.md`）
   - 实施任务清单
   - 优先级排序（高/中/低）
   - 任务依赖关系
   - 工作量估算

3. **Spec Deltas**（`openspec/changes/<change-name>/specs/*/spec.md`）
   - 使用 delta 格式的规格变更：
     ```markdown
     ## 新增功能
     +++ 新增内容描述
     
     ## 修改功能
     --- 删除的旧内容
     +++ 新增的替代内容
     
     ## 删除功能
     --- 删除的内容
     ```

### 5. 后续工作流

创建 proposal 后：

1. **审查与细化**
   - 检查生成的 proposal 和 specs
   - 根据需要进行调整和补充

2. **实施变更**
   - 使用 `/openspec:apply` 或 `/openspec-apply`
   - 系统根据 tasks.md 逐步实施

3. **归档变更**
   - 实施完成后使用 `/openspec:archive` 或 `/openspec-archive`
   - 将 spec deltas 合并到 `openspec/specs/` 中

## 提问原则

1. **深度优先**：避免显而易见的问题，挖掘隐藏假设与风险
2. **结构化**：按工程原则 → 技术细节 → 风险权衡的顺序提问
3. **引导式**：帮助用户思考"为什么"而非仅仅"是什么"
4. **务实性**：关注可落地性，避免过度理论化
5. **上下文感知**：根据项目类型调整访谈重点（API/CLI/库/应用）

## OpenSpec 集成优势

1. **需求锁定**：访谈结果固化为 proposal，避免需求在聊天历史中丢失
2. **可追溯性**：所有决策和权衡都记录在 proposal 中
3. **可审查性**：团队成员可以审查 proposal 而无需阅读代码
4. **增量开发**：通过 spec deltas 清晰展示每次变更的影响范围
5. **文档同步**：归档后自动更新 living specs，保持文档与代码一致

## 示例对话

**步骤 1：启动访谈**

> **用户**：帮我完善这个 plan
> 
> **系统**：已读取 `plan.md`。该项目计划构建一个用户管理 API。在开始访谈前，请确认：这是一个面向公网的 API 还是内部服务？

**步骤 2：深度提问**

> **用户**：内部服务
> 
> **系统**：明白。关于认证机制，内部服务通常有几种选择：
> 1. 服务间共享密钥（简单但安全性较低）
> 2. mTLS（高安全性但配置复杂）
> 3. 内部 OAuth 2.0（灵活但需要额外基础设施）
> 
> 考虑到您的团队规模和运维能力，倾向于哪种方案？或者是否已有统一的内部认证标准？

**步骤 3：工程原则审查**

> **系统**：关于用户角色管理，计划支持多少种角色？这是 MVP 必需的功能吗？
> 
> 根据 YAGNI 原则，如果初期只需要管理员和普通用户两种角色，建议先实现简单的二元权限模型，后续再扩展为 RBAC。这样可以减少 30-40% 的开发时间。您的看法如何？

**步骤 4：创建 OpenSpec Proposal**

> **系统**：访谈完成！现在为您创建 OpenSpec proposal...
> 
> [调用 /openspec:proposal 或等效命令]
> 
> ✅ 已创建 proposal：`openspec/changes/user-management-api/`
> 
> 后续步骤：
> 1. 审查 `proposal.md` 和 `tasks.md`
> 2. 使用 `/openspec:apply` 开始实施
> 3. 完成后使用 `/openspec:archive` 归档

## 最佳实践

- **准备充分**：在访谈前准备好业务上下文和约束条件
- **诚实回答**：对不确定的问题，可以要求提供多个选项及其权衡分析
- **迭代细化**：proposal 创建后可以继续访谈进行细化
- **团队协作**：将 proposal 分享给团队成员进行 review
- **持续归档**：完成的变更及时归档，保持 specs 目录的准确性

## 参考资源

- [OpenSpec 官方文档](https://github.com/Fission-AI/OpenSpec)
- [OpenSpec 网站](https://openspec.dev/)
- [规范驱动开发指南](https://redreamality.com/garden/notes/openspec-guide)
