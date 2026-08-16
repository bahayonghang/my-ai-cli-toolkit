# Implement — academic-figure v1.1.0

执行前提：`task.py start` 已执行（状态 in_progress）。上下文按 `implement.jsonl` 注入。
所有实施细节以 `design.md` 的能力→落点映射与文件清单为准；来源事实以 `research/*.md` 为准。

## 硬约束（每个批次都适用）

1. 只改 `skills/academic-research-tools/academic-figure/` 内文件；不动 `ref/`、不动其他 skill。
2. figures4papers 内容一律自行改写，不复制其代码/文本/图片（无 LICENSE）。
3. 移植脚本保留上游版权头：`visual_qa.py`（MIT, Haojae/scipilot-figure-skill）、
   `audit_pdf_text.py`（Apache-2.0, Yuan1z0825/nature-skills）；文件头注明来源仓库与许可证。
4. SKILL.md 引用脚本一律 `python "<skill-dir>/scripts/xxx.py"` 占位符形式。
5. Markdown 内嵌含 ``` 的示例块时外层用 4 反引号围栏（格式化钩子约束）。
6. 中文遵守全局 CLAUDE.md 中文文风；英文遵守 ASD-STE100。
7. 新 reference 文件头/尾标注来源仓库、许可证、查阅日期（沿用 figure-contract.md 的
   "Adapted from ..." 句式）；细节以 research 记录第 5 节为准。
8. Windows：Python 命令带 `PYTHONUTF8=1`；脚本自身用 UTF-8 写文件。

## 批次划分（A/B/C 文件互斥，可并行；D 在 A–C 之后；E 收尾检查）

### Batch A — SciPilot 顾问与视觉自检（trellis-implement）

- 新增 `references/modes/advise.md`：入口意图、行内 pandas 画像协议、论证目标确认、
  推荐输出（推荐+理由+1–2 备选）、拦截检查、交接规则（默认 journal-spec；命中目录
  风格转 from-data）。
- 新增 `references/chart-selection.md`：决策三轴、数据形态速查表、样本量阈值表、
  同数据不同论点示例（压缩）、五条拆图判据、图型语义边界；与 chart-recipes.md 分工
  说明（选什么图 vs 怎么画）。
- 新增 `references/viz-pitfalls.md`：P1–P18（错误→审稿人视角后果→替代方案）+
  K-Dense 误导性编码条目并入去重（对数轴、分箱平滑、归一化、图像调整等）+
  四步拦截协议与话术模板。
- 新增 `references/visual-review.md`：闭环协议、程序自检与 AI 读图分工表、
  8 项读图清单、读图发现→回改动作表、每轮重渲、3 轮上限判定。
- 移植 `scripts/visual_qa.py`：以上游为底本，保留 `render_preview` 与 `audit_layout`
  能力；MIT 头注；仅依赖 matplotlib；`PYTHONUTF8` 兼容；输出 ASCII 安全。
- 新增 `tests/visual-qa.test.mjs`：镜像 tests/pref-script.test.mjs 的解释器探测与
  skip 模式；无 matplotlib 时 skip；至少覆盖：--help/直接调用返回 0、对一个含
  正常文本的临时 figure 脚本产出预览并 exit 0（或以 `python -c` 内联构造 fig 调用
  audit_layout 返回结构）。
- 修改 `references/modes/journal-spec.md`：第 1 步后插入"选图（不确定图型时读
  chart-selection.md，命中拦截读 viz-pitfalls.md）"；第 6 步引用 visual-review.md
  闭环与 audit_pdf_text（B 批产物，仅引用文件名）。
- 修改 `references/qa-checklist.md`：新增小节 —— 视觉自检闭环（指向 visual-review.md）、
  导出后机器检查表（K-Dense 口径：格式/有效 DPI/最终宽高 mm/色彩模式/透明度/文件大小，
  四态 pass/fail/review/unknown，附 PIL/pypdf 行内命令与
  `python "<skill-dir>/scripts/audit_pdf_text.py" figure.pdf --min-pt 5` 用法）、
  逐 Panel 审计表 + 遮板测试、字形地板（渲染后每字形 ≥5pt，mathtext 0.7 倍缩放风险）、
  不确定度跨面板一致性、灰度预览产物要求、按最终尺寸导出不二次缩放。
- 修改 `references/matplotlib-recipes.md`：CJK 字体链扩充（10 sans + 7 serif 混排 +
  三平台安装提示）、"精确物理尺寸时不用 bbox_inches=tight"取舍、临时 style 上下文
  （style_context 思想）、展示尺度两档字号指针（指向 design-theory.md，B 批产物）。

### Batch B — nature-skills / K-Dense / figures4papers 增量（trellis-implement）

- 新增 `references/panel-layout-patterns.md`：nature-figure 16 模式中现有 Cross-cutting
  未覆盖的增量（hero panel、专用图例面板、非对称布局、组中组分组条、深色影像板、
  条内文字亮度自适应、事件标注趋势线等）+ figures4papers 超宽面板比例规则（3–4×）与
  隐藏 x 刻度标签（自行改写）+ 子图标签统一对齐配方（axes fraction 锚点 + 统一 points
  偏移，SciPilot layout_tools 思想，代码示例自写）。
- 新增 `references/figure-legend-conventions.md`：图注骨架、时态、自洽性、显示名
  大小写、长度门、中文图注要点（Apache-2.0 改写 + 出处）。
- 新增 `references/design-theory.md`：语义调色板角色（蓝=提出方法/绿=改进/红=基线/
  灰=背景/金=单点强调，与 Okabe-Ito 色盲安全表的取舍关系）、两档字号线宽体系
  （24pt+lw3 展示 / 15–16pt+lw2 紧凑，显式标注不适用期刊单栏）、统一导出契约思想
  （多格式一次导出、自动建父目录、格式白名单）。全部自行改写，标注
  「来源 ChenLiu-1996/figures4papers，无 LICENSE，仅参考设计规则，未复制代码」。
- 移植 `scripts/audit_pdf_text.py`：零依赖 PDF `Tf` 字号扫描，`--min-pt 5`；
  Apache-2.0 头注 + 修改说明。
- 新增 `tests/audit-pdf-text.test.mjs`：镜像 pref-script 模式；用例：不存在的文件
  非零退出；对一个最小合成 PDF（测试内用 python 标准库或字节串写最小 PDF 固定文本
  流）运行返回结构合理。若合成 PDF 不可行，退化为 --help 与错误路径两用例。
- 修改 `references/figure-contract.md`：Core conclusion rules 补"按科学论点归组数据表
  （不做一表一图）"；Reviewer-risk prompts 补配对差值检查。
- 修改 `references/journal-specs.md`：开头补投稿阶段维度（initial/revised/final）与
  「不推断期刊要求，投稿前核对官方现行作者指南」约束；Extensions 增 Science
  （单栏 55 mm / 双栏 175 mm）与 Cell（单栏 85 mm / 双栏 178 mm）短卡片（标注
  K-Dense 快照来源与日期，数值保守）；各卡片按 line-art/photo/combination 补 DPI
  区分（已有 Elsevier 三类口径的沿用其格式）。
- 修改 `references/chart-recipes.md`：Cross-cutting 节尾加一行指针到
  panel-layout-patterns.md（不搬内容）。
- 修改 `references/plotly-recipes.md`：kaleido v1 需 Chrome/Chromium、`scale=3`
  不等于精确 300 DPI 两条差异校对后补入（若已有等价表述则不重复）。

### Batch C — 集成指引与署名修复（trellis-implement）

- 新增 `references/agent-figure-gallery-integration.md`（结构仿
  industrytslib-integration.md）：检测条件（CLI `agentfiguregallery` 可用或
  `AGENT_FIGURE_GALLERY_ROOT`/`DRAWING_KB_ROOT` 已设）→ 六步工作流
  （query → gallery --serve → 人工 like/reject/select → prefer → bundle → 读
  bundle 后再写码）→ 偏好语义表（like/reject/select/global_*，plot_type 作用域）→
  稳定 ID 与 session 短 ID 区分 → bundle 字段清单（兼作手工整理参考材料的 checklist）→
  降级（未安装则跳过此路径；无人值守会话无法完成人工筛选环节，需向用户说明）。
  MIT 出处标注。
- 新增 `references/pubfig-integration.md`（结构仿 industrytslib-integration.md）：
  检测（显式点名或依赖/导入含 pubfig）→ 两路径（41 kind 命中表 → `pf.<kind>` +
  `save_figure`；未命中 → 原生 matplotlib）→ JSON spec 契约（schema_version=1、
  顶层键、$load、三种 export mode、先 validate-spec 后 render）→ `save_figure`
  行为注意（显式后缀、vector_formats/raster_formats 抛 ValueError、多格式用
  batch_export）→ 期刊覆盖差异（仅 nature/science/cell 三档 spec；IEEE/Elsevier/
  中文学位论文回落本 skill journal-specs.md 数值）→ 调色板出处澄清（NATURE/SCIENCE/
  LANCET/JAMA 为 ggsci 衍生社区调色板，非官方规范）。MIT 出处 + 版本 0.3.0。
  41 kind 表从 `ref/repo/plot_ref/pubfig/src/pubfig/plot_registry.py` 逐一核对后列出。
- 新增 `references/attribution.md`：7 个来源仓库的名称、URL、commit/日期、许可证、
  吸收内容与吸收方式（复制/移植/改写/仅思想）总表；含既有 paper-plot-skills 内容的
  补记（8 风格文档、9 脚本、10 原图的来源与两项改写）与原图版权归各论文作者的说明。
- 修改 `references/styles/`：为 line_training_curve（DAPO）、line_loss_with_inset
  （SiameseNorm）、scatter_tsne_cluster（MemGen）、scatter_broken_axis（Meta-Harness）、
  radar_dual_series（DoRA）补 `**来源论文**：` 行（口径与已有三份一致）；修
  bar_paired_delta / bar_grouped_hatch / line_confidence_band 中失效的
  `**原图**：image*.png` 指针为 `<skill-dir>/assets/originals/<对应文件名>.png`
  （对照 assets/originals/ 实际文件名）。
- 修改 `references/modes/from-data.md`：新增"模板复用阶梯"短节（Exact reuse /
  Structural adaptation / Style-only inheritance / Build anew + 变换守卫要点，
  Apache-2.0 改写出处）。
- 修改 `references/modes/from-image.md`：新增"参考优先"规则（写码前先取参考；
  有源脚本/模板时查看源码而非只据截图推断，AgentFigureGallery 思想 + 出处）；
  交叉引用 from-data 的模板复用阶梯；第 56 行"7 papers"改为按实际可核对数量的表述
  （8 篇具名论文 + 1 张用户截图，10 张原图）。

### Batch D — 入口与评测（A–C 完成后，trellis-implement）

- 修改 `SKILL.md`：
  - Pick a mode 表加 advise 行（输入意图：有数据但图型未定/请求选图建议）；
  - Resolve conflicts 补：图型未定且无风格/图片参考时先走 advise；
  - Output contracts 表加 advise 行（产出推荐意见并交接，不直接产图）;
  - Route elsewhere 表补：纯探索性 EDA（无发表目标）不属本 skill；
  - Resources 节登记全部新增文件（含 integrations 与两个脚本、attribution.md）；
  - description 重写（双语触发短语覆盖：选图建议/不知道用什么图、投稿前审计、
    参考图筛选、pubfig；保留原有全部触发语；无尖括号；≤1024 字符）；
  - tags 增补（chart-advisor、figure-audit、visual-qa、pubfig 等）；
  - version → 1.1.0。
- 新增 `agents/interface.yaml`：仿 idea-bib-review 样式（interface +
  compatibility；execution.context: inline、portable-python；permissions 按实际）。
- 修改 `evals/evals.json`：追加 6 条（id 18–23）：advise 路由（"这份 CSV 不知道
  用什么图"）、拦截（n=5 均值柱 → 指出 P1 并给替代）、投稿前文件审计（含
  audit_pdf_text 用法断言）、pubfig 项目请求（读 pubfig-integration.md、显式后缀）、
  已装 AgentFigureGallery 时先取参考再写码、负例（探索性 EDA 无发表目标不路由本
  skill）。既有 17 条不改。

### Batch E — 检查与修复（trellis-check）

1. `just skills-check`（frontmatter 全仓校验）。
2. `PYTHONUTF8=1 just python-check`（新脚本编译）。
3. `just node-test`（3 个测试文件全部通过或合理 skip）。
4. qiaomu 辅助：`PYTHONUTF8=1 python "C:/Users/lyh/.claude/skills/qiaomu-meta/scripts/validate_skill.py" skills/academic-research-tools/academic-figure`。
5. 触发边界：在任务 `research/trigger-cases.json` 编写 should_trigger /
   should_not_trigger / near_neighbor 用例并运行 qiaomu-meta trigger_eval.py；
   语义配置不适配则记 missing evidence。
6. 一致性核查：SKILL.md Resources 与实际文件一一对应；所有新 reference 有出处标注；
   `<skill-dir>` 占位符无遗漏；描述无尖括号；孤儿资源为零。
7. `just docs-sync`（frontmatter 变更后必须）并确认 docs/ 页再生成。
8. `just ci` 全绿。

## 提交与收尾（Phase 3）

- 提交拆分：skill 变更 + docs 再生成页一并（feat(skills): ...）；任务目录变更按
  Trellis 常规（chore(task) / chore: record journal）。
- 更新 spec：若实施中发现新的可执行约定，按 trellis-update-spec 评估写入
  `.trellis/spec/guides/skill-authoring-conventions.md`。
- qiaomu 创作交接（creation handoff）写入任务目录 `reports/creation-handoff.md`：
  参考技能清单、逐来源经验、有意放弃项、原创贡献、每个亮点标注
  design advantage / validated advantage / hypothesis；missing evidence 显式列出。

## 回滚点

- A–C 任一批失败：该批文件独立，可单独还原（git checkout -- 对应路径）。
- D 依赖 A–C 的文件存在性；E 失败回到对应批次修复后重跑 E。
