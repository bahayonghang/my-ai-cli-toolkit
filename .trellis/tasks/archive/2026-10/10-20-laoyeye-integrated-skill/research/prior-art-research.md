# Prior-Art Research

研究日期：2026-10-19（America/New_York）。使用 qiaomu-meta-skill 的内建方法，未安装任何候选技能，未运行其代码。查询：`critical thinking`、`socratic questioning`、`decision making`。

## 检索证据

三个 `npx --yes skills find "<query>"` 均成功。Windows 下使用直接 catalog 命令；没有修改 qiaomu 的全局脚本。SkillsMP 使用内建 runner 的 `--skip-skills-sh --timeout 8 --retries 0 --summary`，三查询成功，原始归一化结果见 `skillsmp-candidates.json`，共 27 个 family。该 JSON 的 `complete:false` 与 `skills_sh:not_run` 只描述那次 skip-skills-sh 运行，不能用它否定本轮另行成功的 skills.sh 检索，也不能手改原始报告凑成 complete。

工具 / 宿主默认日期是 2026-10-20，用户时区当天是 2026-10-19；本报告保留此差异，原始生成 JSON 不改日期。

skills.sh 的 installs 是目录显示的安装遥测；SkillsMP `repo_stars` 是目录采集的 GitHub 仓库关注量，可能滞后。用户评分 / 满意度证据不可得。下面两种指标不相加、不转成质量评分。`mattpocock/skills@research` 与 `@to-questionnaire` 虽占搜索顶部，工作合同不等同于本任务，不因此称“最佳候选”。

## 阅读后入围与取舍

| 候选 | 检索 / 信任线索 | 具体学习 | 本包落点与拒绝内容 |
| --- | --- | --- | --- |
| LearnPrompt/laoyeye | 用户指定；本地 HEAD 已固定；26 入口全读 | 可观察信号、拒绝硬路由、六场景、方法接力、显式长对话 | 保留 25 项合同与别名；拒绝全装 26 入口、原文全量预载、原文效果等价承诺 |
| mattpocock/skills 的 ask-matt、grilling、teach、diagnosing-bugs | laoyeye lock 固定 2026-08-22 的 commit；SkillsMP 本轮 grilling 的 repo_stars=292968，仅为目录值；ask-matt canonical 源另读 | 选择前读方法正文、依赖 frontier、教学工作区、红灯反馈环 | 首次命中只读方法文件；grill-me 合并别名；保留教学状态与复现合同，拒绝通用宿主命令和自动委托 |
| sammcj/agentic-coding 的 critical-thinking-logical-reasoning | skills.sh 本轮显示 2.4K installs；读了 canonical SKILL 和 LICENSE，后者 Apache-2.0 | 先准确理解论证、只指出影响结论的错误；逻辑不充分不等于结论必错 | fact-check / adversarial 的判断纪律；不引入它的英语拼写要求，不复制 Apache 内容或把其许可改称 MIT |
| tjboudreaux/cc-thinking-skills 的 thinking-socratic | skills.sh 本轮 589 installs；canonical SKILL + MIT LICENSE 已读 | 对明确任务停止盘问；事实自查；只问改变下一步的问题 | socratic 的停止条件和负例；拒绝该仓库的多入口 catalog 形态，不把 catalog 自称 eval-informed 当作本包质量证明 |

本地 `paper-workbench` 是结构参照：同类别、单根入口与按需 mode/reference 分层；不从它复制学术论文归一化工作流。它不是新发现的外部人气候选。

## keep / adapt / reject / invent

- keep：上游的行为差异、证据优先、拒绝不适配任务、用户决定与环境事实分工。
- adapt：子 skill 转为包内方法，显式启动限制转为运行时意图检查，教程状态放入明确教学工作区；平台能力由实际宿主提供。
- reject：26 个可发现入口、把所有方法拼在 SKILL.md、用六个巨型分类文件伪装渐进加载、统一多轮提问节奏、自动扩展权限或永久记忆，以及原文一字不改的发布承诺。
- invent：25→24 的可追踪覆盖账本、内部别名、按方法读取与接力上限、同口径上下文三场景比较、token 误索取与三方案误接二选一的回归案例。

## 来源

- 固定主输入：[LearnPrompt/laoyeye](https://github.com/LearnPrompt/laoyeye/tree/5af2b57ceb169d81b2da90cc902556a2cad11c0a)。其他 MIT 作者的 pinned commit 见该输入的 `vendor/vendor.lock.json`。
- [ask-matt source](https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/ask-matt/SKILL.md)：canonical `main` 的可变源，只作为机制研究；不搬其中的模型上下文数值。
- [critical-thinking source](https://raw.githubusercontent.com/sammcj/agentic-coding/main/Skills/critical-thinking-logical-reasoning/SKILL.md)、[LICENSE](https://raw.githubusercontent.com/sammcj/agentic-coding/main/LICENSE)、[skills.sh](https://skills.sh/sammcj/agentic-coding/critical-thinking-logical-reasoning)。注意路径中的大写 `Skills`；小写路径访问失败。
- [thinking-socratic source](https://raw.githubusercontent.com/tjboudreaux/cc-thinking-skills/main/skills/thinking-socratic/SKILL.md)、[LICENSE](https://raw.githubusercontent.com/tjboudreaux/cc-thinking-skills/main/LICENSE)、[skills.sh](https://skills.sh/tjboudreaux/cc-thinking-skills/thinking-socratic)。
- [Agent Skills specification](https://agentskills.io/specification)、[creator best practices](https://agentskills.io/skill-creation/best-practices)：支持 metadata / instructions / 按需资源分层；不能据此宣称任意宿主已实测使用同一成本。

## 优势标签与缺证据

- design advantage：单可发现入口、方法级加载、去重与完整覆盖能直接服务本次整体安装目标。
- validated advantage：本轮只验证了上游的计数、静态体积和结构问题；新包尚不存在，没有新包验证优势。
- hypothesis：更低的常驻 metadata、更少的路由上下文，预期可减少整体安装成本；输出质量是否保持、真实延迟和 token 节省仍是 `missing evidence`。

没有可用用户评分、没有候选公平输出对比；没有运行候选安装或功能。GitHub HTML 的部分路径读取失败后使用 canonical raw 源成功，不视为源码缺失；浮动 external source 的固定 SHA 与最新维护质量未全面审计，实施若采用实质内容应先固定 SHA 和许可。
