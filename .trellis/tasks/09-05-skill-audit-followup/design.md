# 设计
父任务拥有需求映射和集成验收，不作为产品实施目标。两个子任务无执行依赖，可分别审阅批准；Goal 子任务内部严格按源链核验 → 增量比较 → 具体处置审阅 → 获准后变更 → 新会话验证排序。

审计是问题输入，不是当前事实。当前事实见 research/current-evidence.md；保留原始材料见 research/audit-input.md。已有归档任务仅作为回归基线，不复活或改写。

采用 qiaomu-meta 的意图/权限契约、样例泛化、trigger 与 output 分层证据；这是既有技能局部维护规划，不创建新技能或重大重构，外部 prior-art 搜索不适用。参考原技能及已归档修复，按 keep/adapt/reject 记录。沿用仓库包结构与所有权，不新增礼仪性 README、manifest、Skill IR 或品牌署名。

默认实施只涉及对应技能源码及必要 eval/interface/reference 同步。安装目录不是默认源码修改位置；发现语义变更单独形成可审阅清单。不得通过安装修复改变 Trellis。
