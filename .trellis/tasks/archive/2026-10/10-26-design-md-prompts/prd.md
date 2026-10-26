# 分析 design-md 的默认工程规范与场景接入

## Goal

用 `qiaomu-meta-skill` 的技能设计方法，给出一份可执行的接入方案：把 `ref/design/instruct.md` 写成 `skills/development-workflows/design-md` 的默认工程规范，并把 `ref/repo/ai-design-skills` 里的 landing page 与 motion 写成按请求读取的场景参考。本任务交付方案，不改技能包。

## Background

- 目标包是 `skills/development-workflows/design-md/`，版本 `0.2.0`。根 `SKILL.md` 的流程是：选目录条目，写成项目根 `DESIGN.md`，再按 `references/implementation.md` 探测技术栈并实施 UI。`description` 现为 832 字，上限 1024。
- `agents/interface.yaml` 的 `default_prompt` 是一段目录选择与实施指令。它指定已有 `DESIGN.md` 时直接实施，点名 BI / 经营分析 / 数据看板时先查 `scene`，场景与品牌或风格同时出现时等待选择。
- 目录现有 153 条：brand 84、style 68、scene 1（`scene:bi`）。`scene:bi` 的正文是设计源，由 `apply` 写成 `DESIGN.md`。`scripts/build_catalog.py` 会删除未进入清单的 `scenes/**/*.md`。自有条目走 `assets/catalog/first-party/manifest.json`。
- `ref/` 被 gitignore。安装后的技能读不到 `ref/`。运行时需要的文字必须放进技能包。包内除根目录外不能再出现名为 `SKILL.md` 的文件。
- `ref/design/instruct.md` 是 641 行 LF 的中文前端工程规范。它规定先检查再复用、组件状态、无障碍、依赖治理和验证。新项目的默认选型是 React、TypeScript、Tailwind、shadcn/ui Nova、Lucide、Motion。已有项目必须沿用现有技术栈。文件没有许可证头。
- `ref/repo/ai-design-skills` 的 README 声明 MIT。`skills/landing-page-design/SKILL.md` 431 行 CRLF，覆盖落地页结构、转化文案和一套固定视觉值。`skills/design-to-motion/SKILL.md` 513 行 CRLF，覆盖像素级还原、故事循环，以及 MP4 / GIF 导出。两份文件都写明：与框架默认冲突时该文件优先，与用户明确提示冲突时用户优先。
- 已归档任务 `10-25-design-md-scenes` 把 BI 规范登记为 `scene:bi`。那条通道适合作为 `DESIGN.md` 正文的设计源。这三份材料是流程和工程规则，分析必须单独判断它们是否适合同一条通道。
- 仓库技能合同在 `.trellis/spec/guides/skill-authoring-conventions.md`。`qiaomu-meta-skill` 要求只借机制、用 keep / adapt / reject / invent 归类，长判断放 `references/`，根 `SKILL.md` 只保留触发、主流程和输出约束。

## Requirements

1. 为合并后的 `design-md`，以及默认工程规范、landing page、motion 三种读取模式，各写一句乔木能力句：接收什么、完成什么重复工作、交付什么、不处理什么相邻请求。
2. 对三份来源分别做 keep / adapt / reject / invent。每条采纳项写明落到技能包的哪个文件，以及它服务哪条能力句。
3. 画出冲突图。至少覆盖：`DESIGN.md` 的视觉权威、`implementation.md` 的技术栈探测、`scene:bi` 与目录重建、`brand-boundary.md`、`default_prompt`、现有分流（`html-artifact`、`image-to-ui-skill`）、description 剩余约 192 字、包内禁止嵌套 `SKILL.md`。
4. 给出唯一推荐的包内形状，并说明「默认启用」在根 `SKILL.md` 和 `agents/interface.yaml` 的 `default_prompt` 里如何体现。默认启用指实施 UI 时读取工程规范。列目录、只比较风格、不写界面时不加载这三份长参考。
5. 推荐必须写清五层先后：用户当次明确要求、已有项目技术栈、项目根 `DESIGN.md`、默认工程规范、按请求加载的 landing page 或 motion。
6. 起草触发用例，放在本任务 `research/trigger-cases.json`。覆盖应触发、不应触发、近邻。中文触发短语按原词写入。本任务不把用例装进技能包，也不跑会改包的校验器。
7. 记录许可证与归属。确认 `ref/repo/ai-design-skills/LICENSE`。上游句子若被保留，归属随改编后的参考文件留下。`instruct.md` 按本仓库自有材料处理。
8. 工作假设写在 `design.md`。研究若推翻它，在同一文件改成最终推荐，并写明推翻理由。最终 `design.md` 要让后续实现任务不必再决定文件落点和权威顺序。

## Acceptance Criteria

- [ ] `research/intent.md` 含四句能力句：合并后的技能、默认工程规范、landing page、motion。
- [ ] `research/keep-adapt-reject.md` 对三份来源各有一张表，采纳项带目标文件。
- [ ] `research/conflict-map.md` 覆盖 Requirements 3 的每一项，并给出推荐下的胜出层。
- [ ] `research/license.md` 记录 LICENSE 结论、需要保留的署名，以及 `instruct.md` 的自有材料处理。
- [ ] `research/trigger-cases.json` 含应触发、不应触发、近邻，且中文短语与推荐 description 用词一致。
- [ ] `design.md` 的「最终推荐」写明文件清单、默认启用的读取点、五层先后，以及是否新增 `scene:*` 条目。
- [ ] `git diff -- skills/development-workflows/design-md` 为空。`assets/catalog/` 无新增条目。

## Out of Scope

- 修改 `skills/development-workflows/design-md/` 下的任何文件，含 `SKILL.md`、`interface.yaml`、`evals/evals.json`、目录和脚本。
- 把三份来源整篇复制进技能包，或在包内新增名为 `SKILL.md` 的文件。
- 新建另一个技能，或把 `design-md` 改名为乔木技能。
- 发布、安装验证、`just docs-sync`、`just ci`。这些属于后续实现任务。
- 在本仓库根目录生成项目用的 `DESIGN.md`。
- 实现 Figma 导出、ffmpeg 编码或像素级 PSNR 流水线。方案只需决定这些能力是 adapt、延后，还是 reject。

## Technical Notes

- 规划阶段的工作假设：工程规范进入 `references/` 并在实施 UI 时默认读取；landing page 与 motion 也进入 `references/`，仅在请求匹配时读取；二者都不登记为 `scene:*`。`scene:*` 继续表示可被 `apply` 写成 `DESIGN.md` 的设计源。
- 已有项目的技术栈探测保持有效。`instruct.md` 第 2 节已要求已有项目沿用现有栈。
- 用户未点名风格时，仍走现有目录选择。shadcn Nova 不替代目录选择。
- `qiaomu-meta-skill` 是本任务的技能设计权威。不另调 `skill-creator`。
- Windows 上 `research_prior_art.py` 调用 `npx` 会失败。先例检索若要做，直接在 Git Bash 跑 `npx --yes skills find`，失败则记 missing evidence，不为此改乔木技能。
- 指定来源已经给出。先例检索只用于发现必须避开的近邻技能，不扩大采纳范围。
