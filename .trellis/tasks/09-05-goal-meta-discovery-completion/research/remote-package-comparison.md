# Linux 旧包完整比较

日期：2026-09-05。只读 scout 在用户指定 lyh@192.168.31.17 通过 SSH 比较；本地参考是仓库历史 d15f4354 下 skills/developer-tools-integrations/goal-meta-skill。目标技能/项目/安装入口没有变更。

## 实证结论
旧包的全部 9 个文件（SKILL.md、agents/interface.yaml、evals/evals.json、4 个 references、linter、test）与本仓库历史 d15f4354 对应文件逐字比较，9/9 内容与长度一致。旧包没有 industrytslib 项目定制，没有 Trellis 或 .trellis token。因此没有需要迁回 canonical 的独特非 Trellis 项目规则；不能因为“旧版”就假定它是当前配置可直接删除的冗余物。

项目存在三份相同的 0.3.0 独立副本：
| 路径 | 忽略来源 |
| --- | --- |
| /mnt/data/lyh/industrytslib/.agents/skills/goal-meta-skill | .gitignore:301 |
| /mnt/data/lyh/industrytslib/.claude/skills/goal-meta-skill | .gitignore:190 |
| /mnt/data/lyh/industrytslib/.grok/skills/goal-meta-skill | .gitignore:212 |

三个 SKILL.md SHA-256 均为 c9c0ada35c22c55098cad6ea58cd084de184b478cb8c38ac4fa56f5dc6dd7c8e。只处置 .agents 一处不能证明消除项目旧版本。

## keep / adapt / reject
| 旧规则或机制 | 处置 |
| --- | --- |
| 只读侦察、项目证据、双语输出、平台区分、有限迭代 | keep：当前 canonical 已有对应机制，不复制旧措辞 |
| 普通样例“checks pass or missing checks reported” | adapt：修 canonical 普通样例的残留；远端旧副本不在本轮默认写范围 |
| 旧 .planning 长合同、有限平台集合、允许显式执行的措辞 | reject 作为回迁增量：是历史全局机制，非项目定制；当前受控 GOAL.md/不启动契约保持 |
| 宽泛类别暂停 | keep 当前边界；计划排除默认放宽，不能借迁移偷偷取消 |
| 项目特有非 Trellis 行为 | 无：9/9 与历史上游相同 |
| 用 0.8 替代 0.3 的 Trellis 效果 | UNRESOLVED：会引入旧包不存在的 Trellis adapter，禁止默认迁移 |

## 具体冲突与当前处置
全局 0.8.0 含 references/trellis-goal-cadence.md，带默认 subagents、commit/archive、review-remediation 等契约。删除/改名全部项目 0.3.0 副本或改成指向全局，即使没有项目独特增量，也可能使新全局 Trellis 触发和生成语义开始影响该项目。这触及当前计划“不更改任何 Trellis 规则”的排除项；不同宿主发现优先级尚未经新会话验证，不能假定删除单入口即可安全继承。

当前只记录来源与差异，保留三个项目目录。没有可在当前边界内默认执行的删除/改名清单。后续如需处置，必须单独评审逐平台作用域与 Trellis 语义，并获得具名路径授权，再保存精确旧包/链接的回滚材料、处置及新会话核验。

## 证据边界及副作用
- O2 已有完整历史比对，非 Trellis 独特增量结论得到现场内容支持。
- O3 未完成：三个旧副本仍存在，未做新会话发现验证，不能报告冲突已消除。
- 远端 AGENTS.md/CLAUDE.md 原有 dirty 保留。
- Scout 报告一次比较命令在远端 /tmp 创建了两份文件清单并在同一命令末尾删除。这违反本轮严格只读约束，已向用户披露并要求后续零写入；目标包、项目、入口未写入。此处不将整个远端过程描述为“无任何副作用”。
