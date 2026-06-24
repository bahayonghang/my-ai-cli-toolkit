# Implement — humanizer-paper 学术语体双模式改造

- Task: `.trellis/tasks/06-24-humanizer-paper-academic`
- 关联: `prd.md`、`design.md`、`research/academic-humanization-findings.md`
- 前置: 本任务 `task.py start` 后方可执行(评审门禁过后)。

## 执行清单(有序)

### 阶段 A:基线与备份
1. [ ] 记录基线:`wc -l skills/research-learning-knowledge/humanizer-paper/SKILL.md`(应为 622)。
2. [ ] `git status --porcelain` 确认 `humanizer-paper/` 干净,便于回滚。
3. [ ] 通读现 SKILL.md,对照 `design.md` 一/二节标注每个 pattern 的去向(保留/校准/禁用/新增)。

### 阶段 B:建 references 骨架(下沉 + 重铸内核)
4. [ ] 新建 `references/ai-tells-academic.md`:迁入 33 pattern,逐条按 `design.md` 冲突表打"保留/校准/禁用"标签,
       并改写其 before/after 为**学术语境**(EN 期刊句 + 中文论文句各择要)。
5. [ ] 在 `ai-tells-academic.md` 追加"新增学术专属痕迹"5 项(ghost citation / 泛泛而谈 / 术语漂移 /
       低 burstiness / 模板化段落),每项给 before/after + 修法。
6. [ ] 新建 `references/en-journal.md`:正式语域、hedging 校准、Methods 被动、IMRaD/CARS、时态、引用风格、dash/Oxford comma。
7. [ ] 新建 `references/zh-dissertation.md`:学术语体、术语统一、GB/T 15834 标点、GB/T 15835 数字、法定计量单位、
       摘要(博士 ≤2000 字)、结论(创新+局限+展望)、标题 ≤20 字、致谢、AIGC 量化特征自查。
8. [ ] 验证:迁移零丢失(原 33 pattern 全部有去向),中英 before/after 真实可用。

### 阶段 C:精简 SKILL.md 主干(路由 + 行为铁律)
9. [ ] 重写 frontmatter 为 `design.md` 五节目标块(name=humanizer-paper、category、tags、version 3.0.0、
       去 compatibility、description 无尖括号 ≤1024)。
10. [ ] 写**诚信边界**段(行为铁律,留主干):定位为打磨作者自己的草稿,拒绝"纯过检测"用法。
11. [ ] 写 When to use / not(vs 通用散文打磨;vs `paper-workbench` 的边界)。
12. [ ] 写 `<skill-dir>` 占位符说明(同 paper-workbench 的提示块措辞)。
13. [ ] 写模式路由:target 判定(CJK 比例→ en-journal|zh-dissertation;歧义→AskUserQuestion)+ section 推断/覆盖。
14. [ ] 写核心循环(classify→载规范包→语体感知 draft→机械 lint→"仍像 AI"审计→final)+ 输出契约。
15. [ ] 各段保留"一句话职责 + 参见 references/<file>.md"指针,不再内联长表。
16. [ ] 验证:`wc -l SKILL.md` ≤ ~200;references 链接全部可达。

### 阶段 D:机械校验脚本
17. [ ] 新建 `scripts/polish_lint.py`(纯 stdlib、`Path(__file__)` 自定位、argparse、UTF-8、`--json`/`--save`、
        `main()->int`、退出码恒 0)。实现 surface / cadence / terms(glossary 可选)三组检查,按 `--target` 取舍规则。
18. [ ] SKILL.md"机械校验"段补 `python "<skill-dir>/scripts/polish_lint.py" --target <...> --file <...>` 调用示例。
19. [ ] (可选)新建 `tests/test_polish_lint.py`(pytest 烟测,本地/可选,不接 CI)。
20. [ ] 冒烟:对中英各一段含已知痕迹的样例跑脚本,确认命中正确、`--json` 可机读;贴报告到本文件"实现记录"。

### 阶段 E:文档同步 + suite 约定
21. [ ] 更新 `README.md`:改"学术双模式"叙事 + 安装/用法 + version history 加 3.0.0。
22. [ ] 更新 skill 内 `AGENTS.md`:维护契约改为"内核重新 gating + 学术新增 + SKILL/README/references 三同步 + `<skill-dir>`"。
23. [ ] (推荐)新建 `evals/evals.json`(git-commit schema),含 ≥2 routing-negative(vs 通用散文打磨、vs paper-workbench)+ 触发正例。

### 阶段 F:验证与门禁
24. [ ] `python scripts/check.py skills/research-learning-knowledge/humanizer-paper` → `[OK]`,无 compatibility 告警。
25. [ ] `just python-check` 通过(脚本 py_compile)。
26. [ ] `just docs-sync` 重生成 catalog;`just skills-check`、`just node-test` 通过。
27. [ ] `just ci` 全绿(含 docs-check、git diff --check)。
28. [ ] 人工复核 `prd.md` 全部 Acceptance Criteria 逐条勾选。

## 验证命令汇总

```bash
# 行数与结构
wc -l skills/research-learning-knowledge/humanizer-paper/SKILL.md
ls skills/research-learning-knowledge/humanizer-paper/references/
ls skills/research-learning-knowledge/humanizer-paper/scripts/

# 脚本冒烟(Windows 上以 UTF-8 跑)
PYTHONUTF8=1 python skills/research-learning-knowledge/humanizer-paper/scripts/polish_lint.py \
  --target zh-dissertation --file <zh-sample> --json
PYTHONUTF8=1 python skills/research-learning-knowledge/humanizer-paper/scripts/polish_lint.py \
  --target en-journal --file <en-sample> --json

# 元数据 + 全量门禁
python scripts/check.py skills/research-learning-knowledge/humanizer-paper
just python-check
just docs-sync
just ci
```

## 评审门禁(Review Gates)

- **G1(阶段 B 后)**:references 三件成形、33 pattern 零丢失且打好档位标签、中英 before/after 可用 → 再精简主干。
- **G2(阶段 C 后)**:SKILL.md ≤ ~200 行、诚信边界 + 双模式路由 + 链接可达 → 再写脚本。
- **G3(阶段 D 后)**:脚本中英冒烟通过、`--json` 可机读、`py_compile` 绿 → 再做文档同步。
- **G4(阶段 F)**:`just ci` 全绿 + Acceptance Criteria 逐条过 → 进入 Phase 3(spec 更新 / commit)。

## 回滚点

- 任一阶段失败:`git checkout -- skills/research-learning-knowledge/humanizer-paper`
  并重跑 `just docs-sync` 还原 catalog(纯文档 + 单脚本,回滚无副作用)。
- 若拆分导致行为铁律漂移(诚信边界被弱化、规范包与重新 gating 自相矛盾),回 G1 重排,不在主干外打补丁。

## 实现记录(执行时填写)

- 基线行数: SKILL.md 改造前 **621 行**(`wc -l` 实测;implement.md 预估 622,差 1 为末行无换行);
  改造前目录仅 `SKILL.md`/`README.md`/`AGENTS.md`,无 `references/`;`git status --porcelain` 干净。
- Phase A/B/C 完成(本次 dispatch 范围):
  - SKILL.md 改造后 **173 行**(≤200 目标达成);frontmatter `name=humanizer-paper`、
    `category=research-learning-knowledge`、`tags` 为数组、`version "3.0.0"`、已去 `compatibility`;
    `description` 756 字符、无尖括号。`python scripts/check.py …` → `[OK]` 无告警。
  - 新建 `references/ai-tells-academic.md`(33 pattern 全迁移 + 保留/校准/禁用档位 + 5 项学术新痕迹,
    中英 before/after)、`references/en-journal.md`、`references/zh-dissertation.md`,均被 SKILL.md 引用。
- Phase D 完成(本次 dispatch):新建 `scripts/polish_lint.py`(纯 stdlib、`Path(__file__)`
  自定位、argparse、UTF-8 显式读写、`main()->int`、退出码恒 0)。CLI 契约与 SKILL.md 一致:
  `--target {en-journal,zh-dissertation} --file PATH(省略读 stdin) --glossary PATH --json --save PATH`。
  实现 surface(em/en dash、双连字符、弯引号、emoji、Title Case 标题、AI 高频词 EN/ZH 双表、
  ghost citation、中文"几字+逗号"短句)/ cadence(断句、句数、均长、stdev burstiness、中文 >28 字
  超长句占比、low-burstiness 旗标)/ terms(glossary 驱动 variant 命中;无 glossary 输出高频候选词
  并诚实标注非语义)三组检查,按 target 取舍。`py_compile` 通过(`tests/test_polish_lint.py` 一并通过)。
  pytest 本机未安装(符合 suite 约定:本地/可选,不接 CI)。`python scripts/check.py …` 仍 `[OK]` 无告警。
- 脚本英文样例报告(`--target en-journal --json`,Windows `PYTHONUTF8=1`,JSON 可机读):
  样例含 Title Case 标题 + em dash aside + 弯引号 + delve/intricate/leveraging/robust + "Studies show" ghost cite
  + 一段 6 句均匀长度的 "The model …" run。命中:`em_dash` 1、`curly_quotes` 2、`title_case_headings` 1、
  `ai_words` 5(delve/intricate/interplay/leveraging/robust)、`ghost_citations` 1(Studies show);
  cadence:`sentence_count` 7、`mean_length` 10.29、`stdev_length` 3.95、`low_burstiness` true(均匀 run 命中);
  `summary.surface_hit_total` 10。全部命中正确。
- 脚本中文样例报告(`--target zh-dissertation --json`,`PYTHONUTF8=1`,JSON 可机读):
  样例含"首先，…；其次，…；再次，…；最后，…；综上，…"短句堆叠 + "研究表明"ghost cite + 一句 48 字超长句
  + 全角弯引号 + "赋能"。命中:`zh_short_connectors` 5(首先/其次/再次/最后/综上)、`ghost_citations` 1(研究表明)、
  `curly_quotes` 2、`ai_words` 1(赋能);cadence:`sentence_count` 7、`mean_length` 18.14、`over_long_threshold` 28、
  `over_long_count` 1、`over_long_ratio` 0.143(48 字句命中);`summary.surface_hit_total` 9。全部命中正确。
  另测:`--glossary`(`canonical: 变体…`)正确报告 2 条 variant 命中(深度网络/卷积模型→卷积神经网络);
  stdin 模式与人读输出正常;`--save` 写出报告;缺失文件仍退出码 0(报告器契约,stderr 提示)。
- Phase E 完成(本次 dispatch):
  - `README.md`:从"33 通用 pattern"叙事改为学术双模式故事(语体重新 gating + 2 套规范包 + 5 项新痕迹 +
    机械 linter + 诚信边界 + 结构表 + 安装/用法),Version History 顶部加 **3.0.0** 范围变更条目(旧条目保留)。
  - skill 内 `AGENTS.md`:维护契约从"33 编号通用 pattern"改为"re-gated kernel(keep/calibrate/disable)+ 学术新增";
    同步集声明为 SKILL.md ↔ README.md ↔ references/;记录 `<skill-dir>` 占位符与脚本纯 stdlib 自定位/退出码 0 约定。
  - `evals/evals.json`(git-commit schema,`skill_name: humanizer-paper`,7 条):触发正例 4(EN Discussion 润色 #1、
    ZH 学位论文降AI味 #2、ZH 摘要 check-only #3、EN Methods 保留被动 #4)+ 诚信边界拒绝 #5 +
    **2 条 routing-negative**(#6 通用散文→通用 humanizer;#7 精读/找空白/normalize DOI→paper-workbench)。
    JSON 解析通过,id 唯一有序,assertions/expected_output 为英文,prompt 自然语言。
- Phase F 完成(主会话):`just docs-sync` 重生成 catalog(64 detail pages / 71 files);
  `just ci` → **EXIT 0 全绿**(docs-check 32 skills up to date、vitepress build OK、skills-check 全 [OK]、
  python-check、node-test、git diff --check 通过)。主代理另复核脚本 `--help`/`--json`/`--glossary`/stdin/exit-0。
- 注:`humanizer-paper/` 在改造前从未被 git 跟踪(`git ls-files` 为空),本次作为新文件提交;
  `docs/.../image-to-ui-skill.md` 的 M 为纯换行符(LF→CRLF)漂移,与本任务无关,不纳入提交。
