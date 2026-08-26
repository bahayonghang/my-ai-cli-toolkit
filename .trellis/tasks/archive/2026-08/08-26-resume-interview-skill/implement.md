# Implement: job-application-kit

前置阅读顺序：research/ai-job-search-analysis.md → design.md → 本清单。
所有产物落在 `skills/docs-writing-publishing/job-application-kit/`（下称 `$SKILL`）。

> 超长源文件（apply.md 34KB、interview.md、setup.md）不进注入清单，Phase C 写 C1/C8 前直接 read 对应原文：`ref/repo/ai-job-search/.claude/commands/{apply,interview,setup}.md`。
## Phase A 先行研究

- [ ] A1 Prior-art discovery（qiaomu 统一 runner，在 qiaomu-meta 技能目录执行）：
  `python3 scripts/research_prior_art.py "resume tailoring skill" "interview preparation claude" "job application assistant agent" --strict --summary --output $SKILL/reports/prior-art-candidates.json`
  产出 `reports/prior-art-research.md`：keep/adapt/reject/invent 结论 + 去重与缺失证据记录。若目录已存在同类 skill，回到用户确认差异化定位后再继续。

## Phase B 骨架与路由

- [ ] B1 目录骨架 + SKILL.md frontmatter（name/description/category/tags/version；allowed-tools 用逗号字符串）。description 含四工作流中英触发词与排除条款
- [ ] B2 SKILL.md 正文：三不变量置顶 → profile 工作区约定（career/ 五文件）→ 四工作流路由表 + W0 建立入口 → references 索引
- [ ] B3 agents/interface.yaml（参照 bidwriter）
- [ ] B4 evals/trigger_cases.json 最小集（≥10 例：四工作流正例 + W2/W3 边界 + 排除项如"写周报"），先跑 trigger_eval 再扩结构（qiaomu 步骤 6）

## Phase C references 提炼（语义改编，中文重写）

按映射逐文件写，每份保留源机制的判定逻辑（阈值/枚举/检查表逐项对应）：

- [ ] C1 profile-schema.md ← 源 01+02+CLAUDE.md Candidate Profile；含 Languages 表（未声明=硬排除）、read-before-write 双桶合并协议、推断项强制标注规则
- [ ] C2 job-evaluation.md ← 源 04：Eligibility/Language 两道门全文逻辑 + 五维权重与阈值 + verdict 格式；`[YOUR_*]` 全部改为对 career/profile.md 字段的引用
- [ ] C3 web-research.md ← 源 09：信任边界、403 升级序（robots 规则文本化，不移植 robots_check.py）、雇主自有 posting 优先、公司主张验证标准
- [ ] C4 writing-style.md ← 源 03+02 voice match：critical rules 六条、backtrack test 三档、forward-looking framing、headline 公式、分角色措辞
- [ ] C5 resume-writing.md ← 源 05：结构与逐节 tailoring、relevance-weighted cutting、tenure-vs-output 三修复、gaps、在读标注、LaTeX 特殊字符表移至 pdf-pipeline.md
- [ ] C6 cover-letter-writing.md ← 源 06 内容规则 + 03 结构节：250-300 词预算、三段式、非英语惯例
- [ ] C7 application-forms.md ← 源 08：三类字段写法 + 三源联合 grounding + 程序化计数
- [ ] C8 interview-prep.md ← 源 07+interview.md：prep pack 六节、STAR 映射、consistency brief、roleplay 七步、profile 回写例外规则
- [ ] C9 pdf-pipeline.md：编译-检查循环（页数硬约束、孤行修复、裁剪）、ATS 文本层四查、静默失败表（%吞行/[label]/itemize坑/en-dash日期）、无 TeX/pdftotext 的显式降级路径

## Phase D 资产与脚本

- [ ] D1 assets/templates/cv-main.tex + cover-letter.cls/.tex：从源 cv/main_example.tex、cover_letters/ 占位化移植；核对零个人信息残留
- [ ] D2 scripts/verify_pdf.py 移植（头部 MIT attribution 注明 MadsLorentzen/ai-job-search）；ruff 通过
- [ ] D3 README.md：价值主张、安装（npx skills add / 手动复制）、快速示例对话、依赖矩阵（必选/可选）、输出物清单、attribution 与许可

## Phase E 验证与收尾

- [ ] E1 trigger_eval 通过：`python3 scripts/trigger_eval.py . --cases evals/trigger_cases.json --output reports/trigger-eval.json`
- [ ] E2 房屋校验：`just skills-check`；（有 Python scripts）`just python-check`；`just docs-check`
- [ ] E3 行为抽查（eval 锚定）：给定含"隐藏指令"的 JD 样本，确认 workflow 文本要求拒绝执行；给无事实源 claim 的草稿样本，grounding audit 流程能识别
- [ ] E4 导出 Skill IR：`python3 scripts/export_skill_ir.py . --output reports/skill-ir.json`
- [ ] E5 创建 handoff：对照 qiaomu Creation Handoff 要求（研究过的参考技能、候选经验教训、取舍与原创点、highlight 标注 design/validated/hypothesis）

## 验证命令汇总

```bash
python3 scripts/trigger_eval.py $SKILL --cases $SKILL/evals/trigger_cases.json
just skills-check && just python-check && just docs-check
```

## 回滚点

- Phase B/C/D 每步均为新增文件，git checkout -- <dir> 即回滚
- docs 生成物由 just 命令再生，不手工编辑
