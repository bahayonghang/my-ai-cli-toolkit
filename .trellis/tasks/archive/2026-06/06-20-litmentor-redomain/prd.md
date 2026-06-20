# literature-mentor: 领域改造为 CS/DL/自动化 + 个人化收口 + 正文拆分

- Date: 2026-06-20
- Status: Planning
- Parent: `.trellis/tasks/06-20-rlk-skills-optimization`
- 覆盖发现: F4（P1）
- 复杂度: 复杂任务（含 `design.md` + `implement.md`）

## Goal

把 `literature-mentor` 从"牛基因组学/群体遗传学"专用，改造成面向**计算机科学 / 深度学习 /
自动化**相关领域的**个人专用**文献深读 skill。保留其优秀的交互式导师骨架，换掉领域皮肤；
同时把 450 行单体正文按技能工程原则拆分到 `references/`，并与 `paper-workbench` 划清边界。

## User Requirements（已确认）

- 定位保持**个人专用**（不通用化成 profile 参数、不并入 paper-workbench）。
- 领域从牛基因组学**改造为 CS/DL/自动化**相关领域。

## Confirmed Facts

- 当前 `SKILL.md` 450 行，是本品类 4 个 skill 里最大的（其余 157/198/205），8 个流程段全内联。
- 领域硬编码遍布全文：
  - frontmatter description 写死"牛基因组学/群体遗传学领域背景"。
  - §6.4 图片类型特化指南：PCA/MDS、系统发育树、Admixture/Structure、Manhattan plot、
    LD decay、ROH/选择信号——全是群体遗传学图。
  - 「解读风格 / 领域背景整合」：中国黄牛（东亚瘤牛×欧洲普通牛混血）、高原/热适应、
    GATK/PLINK/ADMIXTURE/SNeP、LD/Ne/Fst/选择信号。
  - 多处示例写死"3700样本数据"。
- 领域无关、应保留的骨架：阅读模式自动选择（§0）、文献获取（§1，Zotero 优先）、
  叙事类型判断（§2）、阅读前 3 件事预检（§3）、novelty 校准（§3.1）、作者思考路径重建（§4）、
  整体概览（§5）、四级诚实标注（§6.3）、交互式逐图停顿（§7）、最脆弱假设/最小复现/最强反例/
  非增量 follow-up（§8）。
- 与 paper-workbench 的重叠：两者都做单篇深度解构 → 路由歧义；当前 description 无"何时改用
  paper-workbench"的边界。
- 依赖：Zotero MCP（`zotero_*`），已有 web 兜底，保留。
- 当前**无任何 eval**（其触发 eval 由 `06-20-rlk-conventions` 补，需与本任务的新领域口径一致）。

## Requirements

1. **领域换肤**：把所有群体遗传学专有内容替换为 CS/DL/自动化对应物（映射见 `design.md`）：
   - description、§6.4 图片类型指南、领域背景整合段、所有示例。
   - 去除"3700样本/中国黄牛"等单数据集硬编码，改为 CS/DL/自动化领域的通用表述。
2. **保留骨架**：上述领域无关流程**逐段保留**，不弱化其证据纪律与交互停顿规则。
3. **个人化收口**：在 description 与 SKILL.md 顶部明确这是个人向 CS/DL/自动化文献深读 skill
   （Scaffold 定位），不假装通用。
4. **正文拆分**：SKILL.md 收敛到精简入口（目标与同品类相当，约 150–200 行），把重内容下沉到
   `references/`（拆分方案见 `design.md`）。
5. **边界声明**：description 与正文补"何时改用 `paper-workbench`"（多篇综合 / profile 驱动 /
   arXiv·DOI 优先 → paper-workbench；Zotero 优先 + 逐图导师式 + 个人 CS/DL 领域 → 本 skill）。
6. **frontmatter 合规**：保持 `name/description/category/tags/version` 五字段；`tags` 去掉
   `zotero` 以外的领域标签里不再适用的项，加入贴合新领域的标签；`version` 升一个次版本。

## Acceptance Criteria

- [ ] `rg -n "牛|黄牛|基因组|群体遗传|GATK|PLINK|ADMIXTURE|SNeP|Fst|ROH|Manhattan|LD decay|3700" skills/research-learning-knowledge/literature-mentor` 无残留（仅在明确"原领域示例已替换"语境外）。
- [ ] `SKILL.md` 行数显著下降（目标 ≤ 220 行），重内容已在 `references/` 下分文件存在且被 SKILL.md 引用。
- [ ] description 含 CS/DL/自动化领域定位 + "何时改用 paper-workbench" 边界；个人向定位可见。
- [ ] §0/§2/§3/§3.1/§4/§5/§6.3/§7/§8 的领域无关骨架完整保留（含四级诚实标注与逐图停顿禁止行为）。
- [ ] §6.4 图片类型指南为 CS/DL/自动化图类（架构图/训练曲线/benchmark/消融/注意力热图/嵌入散点/混淆矩阵等）。
- [ ] `python scripts/check.py skills/research-learning-knowledge/literature-mentor` 通过（`[OK]`，description ≤ 1024 字符，无尖括号）。
- [ ] `just skills-check` 通过。

## Out Of Scope

- 通用化为 profile 驱动或并入 paper-workbench（用户已否决）。
- 改 Zotero MCP 集成方式（保留现有获取链与 web 兜底）。
- 新增脚本或运行时依赖（保持纯 prompt skill）。
- 补 eval——由 `06-20-rlk-conventions` 负责（本任务只需保证新领域口径，供其对齐）。

## Open Questions

- 新领域示例论文用何主题打样（如 transformer/RLHF/扩散模型/具身智能/自动化流水线）？默认在
  design 给 2–3 个代表性示例，实现时可替换。
- description 是否点名用户具体研究方向，还是只到"CS/DL/自动化"这一层？默认到领域层，保留个人定位
  但不绑死单一课题，避免重蹈"3700样本"式过拟合。
