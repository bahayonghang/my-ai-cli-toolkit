# Design

## File ownership

编辑：`AGENTS.md`、`CLAUDE.md`、`code_map.md`、`README.md`、`README_CN.md`、`docs/index.md`、`docs/en/index.md`、`docs/code_map.md`、`docs/.vitepress/config.mts`、`docs/scripts/sync_docs_catalog.py`。
新增：`docs/harnesses.md` 和 `docs/en/harnesses.md`。
生成：仅通过 docs-sync 更新其拥有的 `docs/commands.md`、`docs/en/commands.md`、`docs/hooks.md`、`docs/en/hooks.md`、`docs/.vitepress/generated/catalog.mjs` 等实际变动产物；无手工修改。

## Mechanisms

R1：CLAUDE 使用文档支持的 `@AGENTS.md`，仅保留 Claude 专用入口说明。AGENTS 描述适用范围、通用权限、必过门与导航，原生加载细节链接事实表；不引入机器私有绝对路径。

R2：docs/harnesses.md 是人工维护中文事实源，en 是等义译本。按五工具逐列填写 native instruction/skill roots、hook 或 extension API、delegation、permission/sandbox、Goal 与验证约束；分开标记 official、repo contract、local probe 和 UNVERIFIED。Goal 命令细节链接现有 skill 的 platform-goal-facts，避免复制 lifecycle 表。第三方资料或其他产品只能标独立参考，不能填为目标产品事实。

R3：入口引用同一事实表。平台 source catalog、安装器 targets、实际 runtime 三层分别说明，静态目录映射不等于 discovery 验证。更正本 repo Claude agents/hooks 目录及 Codex agents-only 事实；完整 CI 从当前 justfile核对。第三方 npx 示例仅表达已给出的用法，不推断可用目标。

R4：生成器改用实际存在的通用 skill 示例，或直接删除不必要的过时例子；去除无效 no-op/session review 说明。源事实改变后 docs-sync→docs-check。文案走读即可，不添加机械句子镜像测试或新 capability schema。

## Traceability

R1→兼容转发/共用规则→AC1；R2→逐工具证据表→AC2；R3→导航/源目录/CI同步→AC3；R4→生成器更新→AC4。

## Rollback

逐文件回退本次 authored 修改并从恢复后的源再生成。保持本地 activation、全局配置和其他任务原样。
