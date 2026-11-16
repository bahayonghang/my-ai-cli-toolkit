# humanizer-paper: 学术语体双模式改造(英文期刊 + 中文博论) + 机械校验脚本

- Date: 2026-06-24
- Status: Planning
- Parent: 无(独立任务)
- 复杂度: 复杂任务(含 `design.md` + `implement.md`)
- 决策来源: 用户三选确认 —— 原地改造 / 一个 skill 双模式 / 另加机械校验脚本

## Goal

把 `skills/research-learning-knowledge/humanizer-paper`(当前是通用版"说人话",源自
Wikipedia "Signs of AI writing")**原地改造**成面向**英文期刊论文**与**中文博士学位论文**的
**语体感知双模式**语言打磨器:既降 AI 味,又**符合对应学术规范**。保留其有价值的 AI-tell 分类法
内核,但按"语体/章节"**重新 gating**,叠加两套学术规范包,并新增机械校验脚本覆盖可量化痕迹。

## User Requirements(已确认)

1. **原地改造** `humanizer-paper`(不另建新 skill)。通用散文用途随之让位给学术双模式。
2. **一个 skill 双模式**:英文期刊 + 中文博论同收一个 skill,运行时按目标切换规范包。
3. **另加机械校验脚本**:在纯 prompt 之外,补模型易漏的机械项(em/en dash、句长/burstiness、
   术语一致性、GB 标点等)。
4. 既要"说人话降 AI 味",又要"符合对应规范"——二者**同时**满足,规范优先于盲目口语化。

## Confirmed Facts(现状与约束)

- 当前 `SKILL.md` 622 行,单体内联 33 个通用 pattern + 通用 humanize 流程。
- frontmatter 现为 `name: humanizer` / `version: 2.8.0`,含 `license: MIT`、`compatibility`、
  `allowed-tools`;**缺 `category` 与 `tags`**,`compatibility` 不在 `check.py` 允许键内(会告警)。
- 本品类 `AGENTS.md` 已立规:`paper-workbench` 是结构样板(精简 SKILL.md + `references/` +
  自带 `scripts/` + `tests/`);脚本路径用 `` `<skill-dir>` `` 占位符、脚本靠 `Path(__file__)` 自定位;
  `$SKILL_DIR` 运行时为空**禁用**;加/删资源文件夹后须 `just docs-sync` 重生成 catalog。
- `scripts/check.py` 强校验:`name`(小写+连字符,≤64)、`description`(**无尖括号** `<`/`>`,≤1024)、
  `category` 须等于目录类目 `research-learning-knowledge`、`tags` 为字符串数组;未知键仅告警不失败。
- skill 自带的 `humanizer-paper/AGENTS.md` 有"SKILL.md ↔ README 同步"维护契约(33 pattern 编号、
  version 双改)——改 pattern 模型须同步 README + 本地 AGENTS。
- 研究结论(见 `research/academic-humanization-findings.md`):通用规则有 7 条与学术规范冲突,
  需重新 gating;另有学术专属 AI 痕迹需新增;中文侧有 GB 国标与 AIGC 量化特征。

## Requirements

1. **语体感知重新 gating**:对既有通用规则按学术语体/章节调整(详见 `design.md` 冲突表):
   - hedging **校准**而非删除;被动语态按章节(Methods 保留);禁用"加观点/缩写/口头插话"的
     PERSONALITY 段;em/en dash 由"硬删"改为"随目标 style,数值区间/复合词保留 en dash";
     同义词轮换升级为**术语一致**硬规则;空泛结论改为"创新点+局限+展望"结构化结论;
     模糊出处改为"补真实 (作者,年份) 引用 + 标记 ghost citation"。
2. **新增学术专属 AI 痕迹**:ghost citation、泛泛而谈(无数据/文献支撑)、术语漂移、
   低 burstiness/超长句(中文 >28 字)、模板化段落。
3. **双模式 + 规范包**:运行时判定/询问 `target = en-journal | zh-dissertation`(默认按文本 CJK 比例
   推断,歧义则用 AskUserQuestion);可选 `section` 维度;加载对应规范包。
   - 英文期刊包:正式语体、hedging 校准、Methods 被动、IMRaD/CARS 与时态约定、引用风格随刊、dash 规则。
   - 中文博论包:学术语体、术语/符号全文统一、标点 GB/T 15834、数字 GB/T 15835、法定计量单位、
     摘要(目的-方法-结果-结论,博士 ≤2000 字)、结论(创新+局限+展望)、标题 ≤20 字、致谢简短。
4. **诚信边界**:SKILL.md 主干显式声明——定位是"打磨作者**自己**的草稿使其更清晰且合规",
   **不是**把生成稿伪装过 Turnitin/知网 AIGC 检测;被要求纯规避检测时按此边界拒绝或收口。
5. **机械校验脚本**:新增 `scripts/polish_lint.py`(纯 stdlib、`Path(__file__)` 自定位、argparse、
   `--json`/`--save`),`--target` 选语种规则,产出可量化痕迹报告(em/en dash、curly quote、
   AI 高频词、中文"首先/综上"逗号短句、句长/burstiness、术语一致性 glossary 驱动)。SKILL.md 用
   `` `<skill-dir>` `` 占位符调用。
6. **正文拆分**:SKILL.md 收敛为精简路由入口(目标 ≤ ~200 行),重内容下沉 `references/`:
   `ai-tells-academic.md`(重新 gating 的核心 + 新痕迹)、`en-journal.md`、`zh-dissertation.md`。
7. **frontmatter 合规**:补 `category: research-learning-knowledge` 与 `tags`;`name` 对齐目录为
   `humanizer-paper`;去掉告警键 `compatibility`;`version` 升 **3.0.0**(范围性变更);description 无尖括号、≤1024。
8. **文档同步**:更新 `README.md` 与 skill 内 `AGENTS.md`(维护契约),记录 3.0.0 范围变更与新结构。
9. **suite 约定(本期落)**:新增 `evals/evals.json`(git-commit schema),含触发正例 + ≥2 条
   routing-negative(vs 通用散文打磨、vs `paper-workbench`)。用户已确认本期交付。
10. **catalog 同步**:结构变更后跑 `just docs-sync`,`just ci` 全绿。

## Acceptance Criteria

- [ ] `python scripts/check.py skills/research-learning-knowledge/humanizer-paper` → `[OK]`:
      `name=humanizer-paper`、`category=research-learning-knowledge`、`tags` 为数组、description 无尖括号且 ≤1024、无 `compatibility` 告警。
- [ ] `wc -l skills/research-learning-knowledge/humanizer-paper/SKILL.md` 显著下降(目标 ≤ ~200 行);
      `references/` 下存在 `ai-tells-academic.md`、`en-journal.md`、`zh-dissertation.md` 且被 SKILL.md 引用。
- [ ] SKILL.md 含**诚信边界**段与**双模式路由**(target 判定 + section);冲突表 7 条重新 gating 在
      `references/ai-tells-academic.md` 可查(hedging 校准 / Methods 被动 / 禁 PERSONALITY / dash 随 style /
      术语一致 / 结构化结论 / 补引用)。
- [ ] 两套规范包内容到位:`en-journal.md`(正式语体/hedging/Methods 被动/IMRaD/时态/引用/dash)、
      `zh-dissertation.md`(术语统一/GB 标点/GB 数字/法定计量单位/摘要/结论/标题/致谢/AIGC 量化特征)。
- [ ] `scripts/polish_lint.py` 存在且 `python skills/.../humanizer-paper/scripts/polish_lint.py --target zh-dissertation --file <样例>`
      与 `--target en-journal --file <样例>` 均跑通、产出 JSON(surface tells + cadence 统计 + 可选 term drift);`--json` 可机读。
- [ ] `just python-check` 通过(脚本 `py_compile` 成功)。
- [ ] `README.md` 与 skill 内 `AGENTS.md` 与 SKILL.md 同步;version 在 frontmatter 与 README 历史均为 `3.0.0`。
- [ ] `just docs-sync` 已跑;`just ci` 全绿(skills-check / python-check / node-test / git diff --check / docs-check)。
- [ ] `evals/evals.json` 存在且含触发正例 + ≥2 条 routing-negative 用例(本期必交)。

## Out Of Scope

- 不保留独立的"通用散文 humanize"模式(用户选原地改造为学术双模式;通用内核被复用并重新 gating,
  纯非学术散文不再是本 skill 职责;如需通用版可另用上游 blader/humanizer)。
- **不**做 AIGC 检测器或"过检测"工具;诚信边界禁止把 skill 定位成规避检测。
- 脚本**不**引入第三方 NLP 依赖(纯 stdlib);**不**把 `pytest` 接入 `just ci`(非保证依赖)。
- 不改本品类其它 skill(`paper-workbench` / `literature-mentor` / `deep-research-pro` / `roundtable`)。
- 不实现真正的语义级"术语漂移"自动判定;术语一致性脚本为 glossary 驱动 + 候选词频提示(诚实标注其局限)。

## Open Questions(附建议默认值,实现时可调)

- **target 歧义**(无 `--target` 且语言难判)→ 默认按 CJK 字符比例推断(复用 `normalize_paper.infer_language`
  思路),仍歧义则 `AskUserQuestion` 二选一。
- **section 维度**:默认从标题/结构自动推断,允许 `--section` 覆盖;无法判定时按"通用学术正文"处理。
- **期刊 style 粒度**:是否内置 APA/IEEE/Nature/Elsevier 具体条目?默认 `en-journal.md` 给少量常见 style 提示,
  `--style` 可指定,缺省走"通用正式学术"。
- ~~evals 是否本期落~~:**已确认本期落**(最小集:触发正例 + ≥2 routing-negative)。
