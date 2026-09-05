# 当前证据与 qiaomu 方法取舍

规划基线核验日期：2026-09-05。仓库基线 HEAD b2a9d21d，dev 分支，创建规划前工作树干净。下表保留规划时证据状态。用户后续批准实施并提供 SSH 主机后，已核实远端路径；更新证据见 ../../09-05-goal-meta-discovery-completion/research/discovery-chain.md，未进行安装写入。

## 当前证据
| 项 | 证据 | 判定与计划影响 |
| --- | --- | --- |
| 无暂存即停 | skills/git-github-collaboration/git-commit/SKILL.md:42、157 | 当前仍存在；G1 修改准备分支并同步最终阻点表述 |
| hook 非零即停 | 同文件 :143；formatter 重暂存 :144 | 当前仍存在；G2/G3 诊断并约束修复集合 |
| 后续交接 | 同文件 :160-166；evals/evals.json 29—32 号用例 | 已由归档 09-05-commit-workflow-handoff / a959b7ab 完成；G5 回归保护 |
| Goal 同轮保存 | skills/developer-tools-integrations/goal-meta-skill/SKILL.md:25、31、36-39、64-65 | 已由归档 09-05-goal-save-same-turn / a959b7ab 完成；禁止回退 |
| Goal 完成语义 | 同文件 :98、100 | 当前已有合取门；O4 重点是非 Trellis 样例与旧副本一致性，不将旧版缺陷冒充当前缺陷 |
| Goal 不启动与覆盖 | 同文件 :31-40 | 当前护栏保留；O5 |
| Windows 源链 | .agents/skills/{skill} junction → .claude/skills/{skill} symlink → .skillsmanage/skills/{skill} | git-commit 1.12.0、goal-meta-skill 0.8.0；两包仓库源与管理副本文本按忽略行尾空白比较无差异。链接关系不证明同步工具或宿主发现缓存行为 |
| Linux 旧版 | 用户材料 /home/lyh/.agents/... 与 /mnt/data/lyh/industrytslib/.agents/... | 本轮未连接，版本 0.3.0 和重复发现均是用户审计记录，非现场事实；O2/O3 missing evidence |

Windows 入口核验由只读 portfolio_scout 完成；未把 __pycache__ 等运行状态纳入比较或写入范围。实际安装/同步机制、Linux 文件内容、全局工具缓存及新会话选择器结果仍需现场证据。

## 审计冲突裁决
原材料同时写“空 staged 停止”应保留和“空 staged 继续准备”。解释为停止未经授权的暂存/提交，继续已授权只读准备；不删除 staged-only 护栏。所有可选扩权保留为 excluded，任务创建不构成批准。

## Qiaomu 方法
采用用户指定 C:/Users/lyh/.skillsmanage/skills/qiaomu-meta/SKILL.md v2.8.1 与 references/gate-selection.md。此次是两项已有技能局部维护的规划，不是新包或重大重构，因此外部 prior-art discovery 不适用；若实施转为重大重构，须重新研究并审阅范围。

| 参考 | keep / adapt / reject | 证据结论 |
| --- | --- | --- |
| git-commit 1.12.0 | keep 提交边界/交接；adapt 早停诊断；reject scoped-changes 和自动消息修复权限 | 设计优势：权限和准备连续性分别表达；尚未验证行为改善 |
| goal-meta-skill 0.8.0 | keep 合取/不启动/安全保存；adapt 旧副本非 Trellis 增量；reject 直接覆盖和启动 API | 设计优势：以真实来源和差异决定处置；远端效果是假设 |
| qiaomu-meta-skill 2.8.1 | keep 意图契约/泛化/分层 eval；不新增无收益资源或署名 | 当前只交付计划，不宣称 Production/Governed 新包通过 |

## 后续评估层
1. 结构：仓库技能规范及 task validate。
2. trigger：若 description/interface 变化，用 qiaomu trigger_eval 和技能专属自然语言正/负/近邻用例；不变时记录不适用理由。
3. output：按子任务 G/O 条件补充行为用例并实际审阅/运行。现有 evals/evals.json 不是 just ci 自动执行的测试。
4. runtime：临时仓库 hook/index 以及真实新会话发现是独立证据；静态断言、fixture 和本地 CI 不能替代。
5. 无模型 transcript、远端访问或新会话实测时写 missing evidence；不能据此通过所依赖的验收项。

不增加通用扫描器或为本任务创建新的权限规则引擎；复用现有包结构、测试和仓库门。
