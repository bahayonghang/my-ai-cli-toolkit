# 设计
所有权：skills/developer-tools-integrations/goal-meta-skill/ 的非 Trellis 契约、样例及对应 eval；实际源码是否需改以逐项核验为准。当前已满足的完成/不启动契约保持，仅補必要回归。禁止修改 references/trellis-goal-cadence.md、生成 Trellis 流程、平台调用语义或新增权限。

源链按物理路径与文件哈希核实，仓库为受版本管理源的候选；.skillsmanage 是管理副本候选，.agents 是发现入口，不能仅凭名字指定 canonical。记录生成/同步工具证据；不猜缓存清理命令，不递归清理目录。

旧项目副本分支：无独特行为时提议删除；有非 Trellis 独特行为时提议合入源或唯一项目命名；涉及 Trellis 增量时仅报告。每个方案先展示具体 diff、来源、未迁移项与回滚内容，再按目标授权实施。

keep：0.8.0 合取条件、受控覆盖、不启动及已完成同轮保存；adapt：有证据的旧非 Trellis 样例和发现处置；reject：直接覆盖、静默改路由、用缺检查/轮数判完成。新会话证据是安装结果门，不以静态单入口检查替代。
