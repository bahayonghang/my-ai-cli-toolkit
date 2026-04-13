# Qwen Companion

当用户希望使用 **Qwen CLI 的 companion 式工作流**，并要求阶段明确、下一步受控、续接说明准确时，使用这个 skill。

它适合 Qwen 先做：

- 在执行前检查方向
- 定义多步骤任务中的下一步最小动作
- 在明确范围内继续之前的流程
- 作为结构化 companion，而不是随意的一次性命令

## 最适合

- review-first 的 Qwen 工作流
- 有边界的执行规划
- 多步骤任务的显式续接
- 针对边界条件和失败路径的第二轮推理

## 说明

- 保持范围克制且可验证。
- 除非环境真的支持，不要暗示 provider 原生持久线程。
- 如果需求是 Codex 风格 runtime 生命周期操作，应改用 `codex-companion`。
