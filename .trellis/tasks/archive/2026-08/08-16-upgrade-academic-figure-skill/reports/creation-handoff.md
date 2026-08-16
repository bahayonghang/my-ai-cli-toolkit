# Creation Handoff — academic-figure 1.0.0 → 1.1.0

按 qiaomu-meta 创作交接要求编写。日期 2026-08-16。改造动作：improve（未发布）。

## 研究过的参考技能（7 个，均本地 shallow clone 于 ref/repo/plot_ref/）

| 来源 | 采纳的机制（语义改写，非镜像） | 逐来源结论 |
| --- | --- | --- |
| Haojae/scipilot-figure-skill (MIT) | advise 模式（决策三轴、样本量阈值、拆图判据）、P1–P18 拦截清单与四步拦截协议、视觉自检闭环、visual_qa.py 移植、CJK 字体回退链 | 与现有能力零重叠的最大增量来源；"先思考后绘制"作为第 4 模式并入而非改写既有模式 |
| Yuan1z0825/nature-skills · nature-figure (Apache-2.0) | 逐 Panel 审计表、5 pt 字形地板（mathtext 缩放）、不确定度跨面板一致性、audit_pdf_text.py 移植、布局模式增量、图注规范、素材复用四级阶梯 | 图形契约主体在 v1.0.0 已吸收；本次增量集中在 QA 侧与图注 |
| K-Dense-AI/claude-scientific-skills · scientific-visualization (MIT) | 导出后机器检查表（四态判定）、投稿阶段维度、Science/Cell 卡片、误导性编码条目（并入 viz-pitfalls 的 M1–M7）、bbox_inches 取舍 | 采纳口径与检查项，不搬其 3062 行脚本（其研究记录亦建议如此） |
| ChenLiu-1996/figures4papers（无 LICENSE） | 语义调色板角色、两档字号线宽体系、导出契约思想、超宽面板比例（全部自行改写） | 无许可证仓库：仅参考事实性设计规则，未复制任何代码/文本/图片 |
| Dsadd4/AgentFigureGallery (MIT) | "先取参考、看源码不只看截图"规则；集成指引（检测双条件、六步工作流、偏好语义、bundle 契约、降级） | 检索/浏览器筛选必须本机安装，故走集成指引；无人值守会话把人工筛选环节交还用户 |
| Galaxy-Dawn/pubfig 0.3.0 (MIT) | 可选后端集成指引：两路径判定、41 kind 命中表（逐名对照源码核实）、JSON spec 契约、期刊覆盖回落、ggsci 调色板出处澄清 | 库形态项目以集成指引接入，与 industrytslib 先例同构 |
| Trae1ounG/paper-plot-skills（无 LICENSE） | 差异校对：上游 HEAD 无新增；补 5 处来源论文标注、修 3 处失效原图指针、校正数量表述 | 内容在既有提交已入库；本次补署名与修复，未新增复制 |

## 有意放弃项（代表性）

- profile_data.py / setup_style.py / export_figure.py / check_figure.py（SciPilot）：引入 pandas/scipy 依赖或与既有期刊卡片形成双数据源；advise 模式用行内 pandas 协议替代。
- validate_figure.py（nature-figure，752 行）：裁剪成本高，本轮不移植；audit_pdf_text.py 已覆盖字形地板的落地审计。
- publisher_profiles.json / mplstyle 资产（K-Dense）：与 journal-specs.md 卡片重复，双源需同步维护。
- figures4papers 的 make_* API 全套：上游未实现，与"复制脚本+替换数据区"路线冲突。
- R 栈、Figma 工作流、AI 图形摘要路由、参考图库资产 vendor：超出边界或体积约束。

## 原创贡献

- 四模式路由的冲突序（advise 作为前置模式经交接进入产图模式，期刊目标优先级不变）。
- viz-pitfalls 的 P/M 双层去重结构（SciPilot 语义层 + K-Dense 编码层）。
- attribution.md 来源总登记（含对既有无署名复制内容的补记）。
- 触发边界域配置（7 概念族 + 负向词 + 必需族），复用 qiaomu trigger_eval 引擎。

## 亮点标注

- 触发边界 24/24 通过（12 正/7 负/5 近邻，report: research/trigger-eval-report.json）——**validated advantage**。
- 新增 2 脚本 11 项 node 测试全过（含合成 PDF 字形地板用例与 matplotlib 实渲染用例）——**validated advantage**。
- advise/audit/gallery/pubfig 能力使 skill 覆盖文章归纳的 6 个环节（选图→参考→契约→绘制→自检→审计）——**design advantage**。
- 视觉自检闭环在真实绘图任务中降低返工次数——**hypothesis**（无使用遥测）。

## 证据边界（missing evidence / 有意偏离）

- qiaomu validate_skill.py 报缺 README.md 与 manifest.json：本仓库 skill 规范以 scripts/check.py 与 docs 目录页为权威，不设每技能 README/manifest；记录为模式差异的有意偏离，非缺陷。
- 9 个既有风格脚本无 argparse help 的 warning：模板脚本按"复制+改数据区"设计，超出本轮范围。
- npx skills.sh 目录检索在 Windows subprocess 下不可用（WinError 2）：改用 SkillsMP 双查询落盘（research/prior-art-skillsmp-*.json）；skills.sh 采用度信号缺失记 missing evidence。
- evals/evals.json 为人审 fixture，CI 不执行；23 条中新增 6 条未经人工盲审——missing evidence。
- 上游脚本移植后的行为等价性以测试为证（11 项），未与上游逐输出比对——recorded_fixture 级证据。
