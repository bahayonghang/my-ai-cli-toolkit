# 文档类型规范

按文档类型选择结构。不要把所有请求都写成一份笼统的“说明文”。

## README.md

**适用场景：**
项目首页、仓库入口、包管理器首页说明。

**推荐结构：**

1. 一句话说明项目是什么、解决什么问题
2. 特性或核心能力
3. 快速开始
4. 基本用法
5. 文档入口
6. 贡献方式
7. 许可证

**重点：**

- 让读者在 30 秒内理解项目价值。
- 安装和最小示例必须可以直接复制运行。
- 不要把 README 写成完整设计文档；复杂细节跳转到 `docs/`。

## API 文档

**适用场景：**
库、SDK、HTTP 服务、CLI 命令、配置接口。

**推荐结构：**

1. Overview
2. Authentication / Preconditions
3. Endpoints / Methods / Commands
4. Parameters / Flags / Fields
5. Returns / Response / Output
6. Examples
7. Errors / Failure Cases

**重点：**

- 字段、类型、默认值、必填项必须来自真实实现。
- 请求和响应示例要贴近真实形状，不要杜撰字段。
- 错误处理不能只写“可能失败”，要说明失败条件和处理建议。

## 架构文档

**适用场景：**
解释系统结构、模块职责、调用关系、关键设计决策。

**推荐结构：**

1. Overview
2. System Diagram (Mermaid)
3. Components
4. Data Flow / Request Flow
5. Key Decisions
6. Risks / Constraints / Follow-ups

**重点：**

- 先讲系统如何工作，再讲目录里有哪些文件。
- 图示应该帮助读者看懂调用关系，而不是装饰。
- 决策部分要写清楚背景、选择、理由和代价。

## 用户指南 / 运维指南

**适用场景：**
最终用户操作说明、部署指南、故障处理、FAQ。

**推荐结构：**

1. Getting Started
2. Prerequisites
3. Installation / Setup
4. First Task / First Run
5. Common Workflows
6. Troubleshooting
7. FAQ

**重点：**

- 按用户任务组织，而不是按内部实现组织。
- 排查步骤要能实际执行。
- 对高频错误给出“症状 -> 原因 -> 处理方式”。

## CONTRIBUTING / 维护文档

**适用场景：**
贡献指南、开发规范、发布流程、维护者说明。

**推荐结构：**

1. Repo Overview
2. Local Setup
3. Development Workflow
4. Testing / Validation
5. Style / Commit / PR Rules
6. Release or Maintenance Notes

**重点：**

- 基于仓库现有脚本、命令和流程。
- 不要发明仓库里没有的 CI、分支策略或发布步骤。
- 维护文档要服务协作，不要只罗列规范。

## 迁移说明 / 变更说明

**适用场景：**
版本升级、破坏性变更、配置迁移、接口替换。

**推荐结构：**

1. What Changed
2. Who Is Affected
3. Upgrade Steps
4. Breaking Changes
5. Compatibility Notes
6. Validation After Upgrade

**重点：**

- 明确旧行为、新行为和兼容边界。
- 升级步骤要按顺序可执行。
- 如果无法从仓库确认迁移细节，明确标注 `TODO:`。

## JSDoc / 代码注释

**适用场景：**
公开函数、类、模块、复杂逻辑、非显然约束。

**推荐结构：**

- 一句话说明做什么
- `@param` 描述输入约束或语义
- `@returns` 描述返回值语义
- `@throws` 描述可见错误条件
- 必要时补充副作用、前置条件、并发/缓存/权限约束

**重点：**

- 基于真实签名和实现，不要猜。
- 不要把代码逐行翻译成注释。
- 如果函数名已经足够直白，只补充名称表达不了的契约信息。

## 通用写作要求

- 直接：优先主动语态。
- 简洁：删除空话和重复解释。
- 专业：术语使用一致。
- 结构化：优先列表、表格、步骤和示例。
- 可验证：命令、路径、签名、字段都能在仓库里找到依据。
