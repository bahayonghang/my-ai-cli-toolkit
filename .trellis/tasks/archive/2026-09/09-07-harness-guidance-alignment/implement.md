# Implementation plan

## Preconditions

仅在最终计划获批后实施。读取根、docs 与 skills/platform scoped guidance；从父任务研究资料开始，不用旧 memory 代替当前产品文档。

## Steps and gates

1. 强模型核五工具 identity/加载/权限边界，编写事实表及等义译本（R2）。
2. 将 CLAUDE 收敛为 AGENTS 引用入口；修正 README/首页及导航（R1/R3）。
3. 在 hook 子项和验证子项完成后，按最终目录与 justfile 更新生成器文字，执行 `just docs-sync`（R4）。
4. 逐一检查表格五行的来源可达、声称内容与来源一致；AGENTS→CLAUDE、README→harnesses、中文→英文导航均可解析。这个检查是人工语义审查，不是宿主已加载证明。
5. 运行 `just docs-check` 和 `git diff --check`；父任务协调最终 `just ci`。
6. 强模型独立审查入口冲突和“支持”措辞，记录 AC1—AC4。runtime 无实证保留 UNVERIFIED。

## Model and harness routing

Claude Code 强模型审查 import/叠加语义；Codex 强模型审查共享 AGENTS 与源生成关系；Grok Build、Kimi Code、OMP 的原生规则用各自可用强模型做对照审查，能力未知则采用官方源码只读核验。便宜模型只执行已批准的文案调整、双语同步、链接和生成器有限编辑；生成命令直接运行即可。

## Delivery

本项不发布站点、不安装客户端。已批准规则在仓库正式说明回写；知识子项负责复用流程，避免重复事实表。
