# Design — humanizer-paper 学术语体双模式改造

- Task: `.trellis/tasks/06-24-humanizer-paper-academic`
- 关联: `prd.md`、`research/academic-humanization-findings.md`
- 结构样板: `paper-workbench`(精简 SKILL.md + `references/` + 自定位 `scripts/`)

## 设计原则

**内核复用,语体重铸,重量下沉,机械兜底。** AI-tell 分类法(33 项)是有价值的内核,但它的"通用散文"
默认值与学术规范多处相反。改造 = 把内核**按语体/章节重新 gating** + 叠加两套规范包 + 用脚本兜住可量化项,
而非推倒重来,也非无差别套用。SKILL.md 只留路由与行为铁律,重内容进 `references/`。

## 一、规则重新 gating(通用 → 学术)

把既有规则分三档处理。**保留**=学术里同样是 AI 味,原样生效;**校准**=条件化,不再无差别套用;
**禁用**=该规则在学术语体里有害,关闭或反转。

| # | 通用规则 | 档位 | 学术语体下的新行为 |
|---|---|---|---|
| §24 | 删 hedging | **校准** | hedging 是学术认知立场。仅删**堆叠**("could possibly potentially");单层("may/suggests/表明可能")**保留**;AI 过度自信处反而**补** hedging |
| §13 | 被动改主动 | **校准** | 按章节门控:Methods/实验方法惯例被动、无施动者,**不强改**;Intro/Discussion 可适度主动 |
| PERSONALITY AND SOUL | 加观点/缩写/口头插话 | **禁用** | 期刊与博论是 formal/precise 语域。整段关闭,不注入第一人称随意化、缩写、"honestly"类口头语 |
| §14 | 硬删所有 em/en dash | **校准** | 改"随目标期刊/院校 style";**保留**数值区间与复合修饰的 en dash(dose–response、1990–2000);中文按 GB 标点处理 |
| §11 | 同义词轮换→重复 | **保留并升级** | 既是 AI 味又违反"术语全文统一(GB)"。升级为**硬规则**:同一概念全文同名 |
| §5 | 模糊出处删句 | **反转/校准** | 学术修法是**补真实 (作者,年份) 引用**,不是删;并新增 ghost citation 标记 |
| §25 | 砍空泛正向结论 | **校准** | 删"前景光明"式空话,但学术结论有**强制结构**:创新点 + 局限 + 展望(中文学位论文规范) |
| §17/§18/§15/§19 | 标题大小写/emoji/粗体/弯引号 | **保留** | 仍有效;标题大小写与引号**进一步随**目标 style/GB 规范 |

**保留(原样生效,学术里也是硬 AI 味)**:§1 意义膨胀(学术变体"makes a significant contribution /
plays a crucial role")、§3 -ing 伪深度、§10 三段式、§12 假区间、§23 填充语("it is important to note that"/
"值得注意的是")、§28 路标announcement、§31–33 金句/格言/口语开场、黏合词堆叠(Moreover/Furthermore/
Additionally;首先/其次/综上)。

## 二、新增学术专属 AI 痕迹(进 `ai-tells-academic.md`)

1. **Ghost citation** —— "studies show / research proves / 研究表明" 无作者-年份。修法:补具体引用或降断言强度。
2. **泛泛而谈** —— 无数据/文献支撑的空泛断言(国内 AIGC 检测核心命中)。修法:锚定具体数据/方法/文献。
3. **术语漂移** —— 同概念多名(违 GB 术语统一)。修法:定 canonical,全文统一。
4. **低 burstiness / 超长句** —— 句长异常均匀;中文平均句长 >28 字、"几字+逗号"短句堆叠。修法:变化句长与结构。
5. **模板化段落** —— 每段"主题句+三支撑+小结"同构。修法:打散同构,按论证需要组织。

## 三、双模式架构

```
SKILL.md (精简路由, ≤ ~200 行)
├─ frontmatter(改造后)
├─ 诚信边界  ← 行为铁律,留主干(不下沉)
├─ When to use / not(vs 通用散文打磨 · vs paper-workbench)
├─ <skill-dir> 占位符说明(因新增 scripts)
├─ 模式路由:target 判定(CJK 比例→ en-journal|zh-dissertation;歧义→AskUserQuestion)+ section
├─ 核心循环:classify → 载规范包 → 语体感知 draft → 机械 lint(脚本) → "仍像 AI"审计 → final
├─ 机械校验:polish_lint.py 调用(<skill-dir>)
├─ 输出契约:draft / 仍-AI 审计 bullets / final / 改动摘要(+ lint 报告)
└─ References 指针

references/
├─ ai-tells-academic.md   ← 重新 gating 的内核(一/二节)+ 各 pattern 学术 before/after
├─ en-journal.md          ← 英文期刊规范包
└─ zh-dissertation.md     ← 中文博论规范包
scripts/
└─ polish_lint.py         ← 机械校验(纯 stdlib, 自定位)
evals/
└─ evals.json             ← 触发 + routing-negative(推荐)
```

### 3.1 target 判定(默认)

- 显式 `--target` 优先。
- 否则按文本 CJK 字符比例推断(>~2% 或 CJK 计数高 → `zh-dissertation`,否则 `en-journal`),
  复用 `paper-workbench/scripts/normalize_paper.py: infer_language` 的思路。
- 仍歧义 → `AskUserQuestion` 二选一。section 同理:先自动推断(摘要/引言/方法/结果/讨论/结论),可 `--section` 覆盖。

### 3.2 规范包内容

- **en-journal.md**:正式语域(无缩写/口语)、hedging 认知化校准、被动语态按章节、IMRaD 与 CARS(intro 缺口→填补)、
  时态约定(方法/结果过去时、定论现在时)、引用风格随刊(author-year vs numeric)、em/en dash 与 Oxford comma 随刊、US/UK 拼写一致。
- **zh-dissertation.md**:学术语体(严谨客观书面化)、术语/符号全文统一、标点 GB/T 15834、数字 GB/T 15835、
  法定计量单位 GB 3100、摘要(目的-方法-结果-结论,独立自含,博士 ≤2000 字)、结论(创新+局限+展望)、
  标题 ≤20 字确切具体、致谢诚恳简短、AIGC 量化特征自查(并列结构/句长/可预测性)。

## 四、脚本设计(`scripts/polish_lint.py`)

样板纪律(同 `normalize_paper.py`):`#!/usr/bin/env python3`、`from __future__ import annotations`、纯标准库、
`argparse`、`Path(__file__)` 自定位、UTF-8 读写、默认人读 + `--json` 机读、`--save` 可选、`main()->int`。

- **CLI**:`--target {en-journal,zh-dissertation}`(选语种规则集)、`--file PATH | 读 stdin`、
  `--glossary PATH`(可选,术语一致性)、`--json`、`--save PATH`。
- **检查项(按 target 取舍)**:
  - `surface`:em dash `—` / en dash `–` / 双连字符 ` -- ` / 弯引号 `""''` / emoji / 标题 Title Case;
    AI 高频词命中(en 表 + zh 表);中文"首先,/其次,/综上,/总之,"等"几字+逗号"短句。
  - `cadence`:断句(en `.?!`;zh `。！？；`)→ 句数、均长(en 词 / zh 字)、stdev(burstiness)、
    超长句占比(zh >28 字),低 burstiness 提示。
  - `terms`(可选):有 `--glossary`(canonical 行表/`canonical: variant1, variant2`)则报告 variant 命中行;
    无则输出高频"术语样"多字词供人工核对漂移(**诚实标注**:非语义判定)。
- **输出**:`{ "target", "surface": {...}, "cadence": {...}, "terms": {...}, "summary": {...} }`,
  每条命中带 `line` + `excerpt`。退出码恒 0(报告器,不做门禁判定;判定交人 + 模型)。
- **定位**:脚本是**模型的副驾**——给可量化坐标地图,改写仍由模型按 references 完成;脚本不改写文本。

### 4.1 测试与 CI

- `py_compile`:`just python-check` 覆盖 `skills/**/*.py`,脚本必须可编译(硬门禁)。
- `tests/`:按 `paper-workbench` 先例可放 `pytest` 烟测(本地/可选,**不**接入 `just ci`,`pytest` 非保证依赖)。
  本期至少手跑 `polish_lint.py` 中英样例各一,贴报告到实现记录。
- `node-test` 跑 `tests/*.mjs`——本脚本是 Python,不走该通道。

## 五、frontmatter(目标)

```yaml
name: humanizer-paper
description: >
  Register-aware academic language polisher for English journal articles and
  Chinese doctoral dissertations. Removes AI-writing tells while keeping academic
  norms: calibrates hedging instead of deleting it, preserves section-appropriate
  passive voice, enforces terminology consistency, and fixes ghost citations,
  hollow generalities, uniform sentence cadence, and templated structure. Dual
  mode: en-journal and zh-dissertation. Scope boundary: polishes the author's own
  drafts for clarity and norm compliance, not evading AI-detection checks.
category: research-learning-knowledge
tags: [academic-writing, humanizer, ai-tells, journal, dissertation, zh, en, polishing]
version: "3.0.0"
argument-hint: "[text-or-file] [--target en-journal|zh-dissertation] [--section abstract|intro|methods|results|discussion|conclusion] [--style STYLE] [--check-only]"
license: MIT
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, Bash(python *)
```

- 去 `compatibility`(非允许键,告警);保留 `license: MIT`(上游署名,且为允许键)。
- description **无尖括号**、≤1024 字符(`check.py` 硬校验)。`argument-hint` 内方括号/竖线不受 description 校验约束。

## 六、文档同步(skill 自带维护契约)

- `README.md`:从"33 通用 pattern"叙事改为"学术双模式 + 重新 gating + 新痕迹 + 脚本";version history 加 `3.0.0`。
- `humanizer-paper/AGENTS.md`:更新"维护契约"——pattern 模型从"33 编号通用"变为"内核重新 gating + 学术新增",
  SKILL.md ↔ README ↔ references 三者同步项;`<skill-dir>` 脚本约定。
- 保持 SKILL/README/AGENTS 对 version 与结构的一致引用。

## 七、兼容性与回滚

- 改动集中在 `skills/research-learning-knowledge/humanizer-paper/` 一个目录 + 一次 `just docs-sync`
  生成的 `docs/.vitepress/generated/catalog.mjs`。回滚 = 还原该目录 + 重跑 `docs-sync`。
- **行为变更是预期的**(通用→学术),不保证与旧通用版输出一致;这是范围性 major 升级(3.0.0)。
- 风险点:① 脚本中文正则/读文件的编码 —— Windows 上以 `PYTHONUTF8=1` 跑并 UTF-8 显式读写;
  ② SKILL.md 拆分后 references 链接可达性;③ description 误带尖括号导致 `check.py` 失败。
- 新增资源文件夹(references/scripts/evals/tests)**必然**漂移 docs catalog → `just docs-sync` 后 `just ci`(docs-check)须绿。
