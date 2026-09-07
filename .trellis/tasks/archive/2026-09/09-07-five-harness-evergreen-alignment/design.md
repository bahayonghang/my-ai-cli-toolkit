# Design

## Goal and boundaries

审查结论与改造实现分开。用户本轮授权的写入范围只有本任务树及独立计划审查报告；正式源、规则、spec 修改须后续批准。所有任务用 --no-start 创建，保留旧 runtime。

## Task map and ownership

| ID | 子任务 | 独占主要文件 | 承接父需求 |
| --- | --- | --- | --- |
| C1 | 09-07-claude-hook-runtime-contract | platforms/claude/hooks 与 Claude code_map | R2、R3、R5 |
| C2 | 09-07-harness-guidance-alignment | 根说明、docs authored与生成器/产物 | R1、R3、R5、R6 |
| C3 | 09-07-harness-verification-coverage | justfile、installer tests；必要时workflow | R2、R5 |
| C4 | 09-07-harness-model-routing-knowledge | 项目 spec 与唯一验收 ledger | R4、R6 |

依赖：C1 先产生 hook tests；C3 将其与 PR unittest 接入 CI；C2 草稿可并行，最终文档/生成依赖 C1+C3 的代码和定向测试结果；C4 在前三项集成验证后回写。依赖的是实现就绪，不是 task completed 或 archive。

分两层收尾：C1/C3 定向检查通过后仍保持 in_progress，交接给下游；C1 删除 no-op 会使旧生成文档暂时漂移，不能提前宣称全库通过。C2 完成生成同步后运行一次集成 just ci，C4 回写后最终核对全部门。父任务满足整体验收后才集中完成/归档子项，因此 C1/C3 的最终 CI 验收由父项记录回填，不需要等待自身完成才能开展 C2，也不增加新状态字段。

## Evidence flow

现有代码/官方来源/实际命令 → research/test-baseline、harness-capabilities → research/audit-report → 子项 requirements/design/checks → 用户批准 → 实施 → acceptance-ledger → 项目说明/spec。

五工具能力表只在 C2 authored docs 维护一套中文事实源与等义英文。Goal 专属生命周期继续由既有 skill facts 所有；模型职责只写角色指导，不增加动态路由服务或钉死新型号。

## Key decisions

1. 已通过的历史错误不重复修复；当前故障以安全 stdin/日志探针证据立项。
2. Hook 使用标准库回归，不新增依赖；现有可选 pytest 不在本轮强制提升为必过门。
3. 新增 Python test recipe 直接调用两个 unittest 套件，无泛化测试框架。
4. 安装器五工具 tests 证明布局；真实 provider verification 另列。
5. 项目文档说明五工具支持边界，不建立五个空资产目录、不强制扩所有 skills。
6. 知识回写落本项目 spec，当前不向外部团队库或全局配置写入。

## Acceptance mapping

父 AC1 → baseline/audit报告；AC2 → capabilities及分工表；AC3 → 四任务工件/manifest/独立审查；AC4 → 全树planning与授权文件差异；AC5 → 后续C1—C4证据和知识落点。

## Validation and rollback

本轮：验证各 task manifests、树关系、无模板残留、行号引文、工作树写入边界；现有 just ci 已运行一次，不因仅规划文档而重复长测试。父子计划独立强模型审查通过后交用户。
实施：定向门后运行一次最终 just ci；generated docs只由生成器更新。只回退自己拥有的文件，runtime/安装/全局规则不触碰。提交/发布不包含在当前授权。
