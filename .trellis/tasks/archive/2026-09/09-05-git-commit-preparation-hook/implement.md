# 执行计划
1. 获准后核对当前 SKILL.md、references、evals 和作用域 AGENTS；保存原 index/status 作为比较证据。
2. 最小修订 §1 和 §6，核对 §5/§7 及 interface 不矛盾。
3. 扩展行为 eval：空 index+有改动、全干净、草稿、部分暂存、模糊分组、秘密/大文件、明确提交、hook 消息错误有/无修复授权、需产品修改有/无授权、formatter 范围外改动、成功/失败后 push/PR 交接。
4. 在临时仓库进行 index/HEAD 不变和 hook 不绕过的行为验证；不在用户工作区创建测试提交。模型未实际执行的场景标 missing evidence，人工检查期望不能替代行为运行。
5. 运行 node --test skills/git-github-collaboration/git-commit/tests/*.test.mjs；若修改脚本，补充针对回归原因的测试。
6. 元数据变化运行 just docs-sync；完成时 just ci。记录每个 G 条件的证据和未验证项。
7. 回滚仅撤回本任务源码修订；不 reset 用户 index，不撤销用户历史。提交/安装仍按后续授权处理。
