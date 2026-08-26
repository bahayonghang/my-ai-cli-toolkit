# Prior-Art Research: job-application-kit

日期：2026-08-26。方法：qiaomu-meta 统一 runner 的底层目录调用（runner 脚本在 Windows 下无法从 Python subprocess 解析 `npx.cmd`，改为 bash 直接执行同等命令；SkillsMP 目录超时，记为缺失证据）。

## 查询与来源

| 查询 | 渠道 | 结果 |
|---|---|---|
| resume tailoring skill | skills.sh (npx skills find) | 命中 |
| interview preparation skill | skills.sh | 命中 |
| job application assistant | skills.sh | 命中 |
| cover letter writing | skills.sh | 命中 |
| resume interview | SkillsMP (search_skillsmp.py) | **超时，missing evidence** |

## 候选清单（按 canonical repo 去重）

| 候选 | 安装量（skills.sh，2026-08-26） | Stars | 定位 |
|---|---|---|---|
| paramchoudhary/resumeskills@resume-tailor | 7.1K | 1.8K | 单职责简历定制；配套 cover-letter-generator(6.8K)、resume-version-manager(6.3K)，套件式多技能 |
| claude-office-skills/skills@resume-tailor | 4.5K | — | 同名不同仓，未深查（采用量次高但机制预期重叠） |
| onewave-ai/claude-skills@job-application-optimizer | 589 | 272 | 单 skill + references/ 分产物（resume/cover-letter/interview-prep），任务类型路由 |
| madslorentzen/ai-job-search@job-application-assistant | 130 | — | 即本次源仓库：fork 工作区模型，不可独立安装 |
| jamditis/claude-skills-journalism@interview-prep | 171 | — | 新闻业垂直面试准备 |
| curiositech/some_claude_skills@interview-loop-strategist / values-behavioral-interview | 125/116 | — | 面试轮次策略细分 |

指标说明：安装量为 skills.sh 采用度，非质量评分；Stars 属源仓库。三个头部候选均通过 skills.sh 页面展示的 Gen Agent Trust Hub / Socket / Snyk 安全审计（Pass），未执行任何候选代码。

## 已研究的机制（读自 skills.sh 页面渲染的 SKILL.md）

### paramchoudhary/resumeskills（resume-tailor）
- 明确的触发词列表 + "Use AFTER job-description-analyzer" 的流水线顺序声明
- 套件拆分：每个产物一个独立 skill，通过顺序引用组合

### onewave-ai job-application-optimizer
- 入口先做任务类型分派（resume tailoring / cover letter / interview prep / skills gap / strategy）
- 先收集输入（现有简历、JD、LinkedIn、约束）再产出
- 判断性内容全部放 references/*.md（每产物一份），根 SKILL.md 只做路由

## 综合结论：keep / adapt / reject / invent

**keep（语义采纳）**
- 任务类型入口路由（两家共识）→ 本包 W0-W5 路由表
- references/ 按产物拆分、根文件保持精简（onewave 验证的结构）→ 已采用
- 起草前显式收集输入与约束 → 并入 W0/W1

**adapt（改造后采纳）**
- paramchoudhary 的"流水线顺序声明"→ 不拆多包，改为包内工作流间的依赖说明（W1 内部步骤序）

**reject（明确拒绝）**
- 多 skill 套件拆分：v1 保持单包；若后续体积失控再拆（记录为演进选项）
- resume-version-manager 式版本管理：超出本包范围

**invent（相对候选的原创差异，均源自 ai-job-search 提炼，候选普遍缺失）**
1. 诚实性不变量体系：三事实源 grounding 审计、backtrack test 三档、关键词四态覆盖 never-stuffing——候选均为"优化话术"导向，无防编造机制
2. JD 信任边界（数据非指令、不 fetch 内嵌 URL、公司 claim verify-before-use）
3. PDF 编译-检查循环 + ATS 文本层验证 + 显式降级路径
4. 双代理 drafter-reviewer 审稿协议（含无 subagent 环境的弱隔离降级）
5. Fit 评估硬门（eligibility/language gate）先行于起草

## 缺失证据

- SkillsMP 目录超时：未能交叉验证 star 指标；claims 仅基于 skills.sh 与 GitHub 页面
- claude-office-skills/skills@resume-tailor 未深查源码：如后续发现机制冲突再补
