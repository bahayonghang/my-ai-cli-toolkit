# Creation Handoff: job-application-kit v1.0.0

日期：2026-08-26。模式：Qiaomu Production。任务：`.trellis/tasks/08-26-resume-interview-skill/`。

## 研究过的参考技能（prior-art）

见 `reports/prior-art-research.md`。核心候选：

| 候选 | 借鉴 |
|---|---|
| paramchoudhary/resumeskills@resume-tailor（7.1K installs） | 触发词显式列表、流水线顺序声明（adapt 为包内工作流依赖说明，拒绝拆多包） |
| onewave-ai@job-application-optimizer（589 installs） | 任务类型入口路由、references 按产物拆分、起草前收集输入 |
| madslorentzen/ai-job-search@job-application-assistant（源仓库，130 installs） | 全部方法论来源；fork 工作区模型被拒绝，改为安装型 skill |

SkillsMP 目录超时未交叉验证 star 指标：missing evidence。

## 候选特定经验教训

1. 头部候选全部是"话术优化"导向，无一具备防编造机制——诚实性体系是本包的差异化主轴，而非附加功能。
2. onewave 验证了"根文件只路由、判断放 references"的结构在真实采用中可行。
3. paramchoudhary 的多 skill 套件拆分在 7K 安装量下成立，但 v1 单包更利于安装与触发收敛。

## 取舍与原创贡献

- **采纳**：入口路由、references 分产物结构、输入先行。
- **拒绝**：套件拆分、版本管理器特性、fork 工作区模型（数据写入技能文件不可复用）、丹麦 portal CLI / tracker / Notion/Gmail 同步（范围外）。
- **原创**（源自 ai-job-search 提炼，候选普遍缺失）：三事实源 grounding 审计 + 会话事实回写规则；JD 信任边界与升级序；PDF 编译目检循环 + ATS 文本层验证 + 静默失败对照表；双代理审稿协议含无 subagent 弱隔离降级；Eligibility/Language 两道硬门先于起草。

## Highlight 标注

- **validated advantage**：trigger eval 15/15（reports/trigger-eval.json）；`just skills-check` / `python-check` / `docs-check` 全过；模板零个人信息抽查通过。
- **design advantage**：不变量置顶 + 各工作流引用结构；relevance-weighted cutting 与四态关键词表贯通 W1/W2/W3。
- **hypothesis**：无 subagent 环境的弱隔离审稿是否足够防自夸；markdown 降级产物在实际求职中的可用率。

## 缺失证据（不声明的能力）

- 未做真实端到端求职案例的人工评审（需要真实用户档案）
- 未发布到 skills 目录，无安装量证据
- ATS 兼容性覆盖已知故障模式，未经多厂商筛选器实测
