# 设计
所有权：skills/git-github-collaboration/git-commit/，重点 SKILL.md §1/§6 和 evals/evals.json；reference/interface 仅有契约漂移时同步。不改 composer 算法来机械化授权判断。

无暂存分支从“整个任务停止”改为“写操作被阻断，只读准备继续”。先安全读取必要 diff，不输出秘密内容；候选集合不等于获准集合。已有提交授权与暂存权限分别判断。

hook 分支统一为保留输出 → 诊断 → 精确修复提案 → 根据现行授权执行或等待 → 验证。formatter 分支保留可恢复性，但明确只重暂存已授权集合内 hook 改动。新增或语义变化的文件必须重新判断，不回退到 git add -A。

keep：§5 既有明确提交授权和 §7 交接、安全审查；adapt：无暂存和 hook 提前停止；reject：通用自动修复器、新模式、旁路 hook。保留署名和已有包接口。
