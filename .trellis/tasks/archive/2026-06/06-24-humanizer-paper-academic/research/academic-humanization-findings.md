# 研究记录：学术语体下的「降 AI 味 + 合规」

- Task: `.trellis/tasks/06-24-humanizer-paper-academic`
- 日期: 2026-06-24
- 方法: 4 组网络检索（英文期刊侧 2 + 中文博论侧 2），交叉验证。

## 核心结论（驱动设计）

通用版 `humanizer-paper`（源自 Wikipedia "Signs of AI writing"）是为**通用散文/百科**写的。
学术语体（英文期刊 + 中文学位论文）与通用散文在多处**规范相反**，naive 套用会把合格的
学术语言改坏。优化的本质不是「多加 pattern」，而是**按语体/章节重新 gating 既有规则 + 叠加两套学术规范包**。

## 一、英文期刊侧

### 1.1 通用规则与学术规范的冲突（最关键发现）

- **Hedging（模糊限制语）是学术认知立场的核心**，不是要删的赘语。通用工具会把
  "suggests / may indicate / appears to" 删成过度自信的断言，这在论文里是**反向错误**。
  正确做法：**校准**——AI 过度自信处补 hedging，作者确有把握处去冗余 hedging，而非一律删。
- **正式语体必须保留**：通用 humanizer 会"口语化"（加缩写、口头语、第一人称插话），
  论文里 "basically / a ton of research shows" 会显眼出错。学术是 formal/precise/hedged 语域。
- **引用是非协商项**：任何含 citation 的句子要谨慎改写，激进 paraphrase 会扭曲源义或让论点脱离支撑。
- **句长/节奏变化**是被反复强调的头号技巧：AI 文本句长异常均匀、过渡词可预测、倾向"陈述结论"而非"论证到结论"。

### 1.2 期刊编辑/审稿人识别的 AI 痕迹（2025）

- **Ghost citation**："studies show / data proves" 而不点名作者-年份——编辑最强信号之一。
- 过度解释 / 重复 / 把刚说的再总结一遍。
- 术语误用、术语不一致。
- **黏合词**可预测堆叠：连续句以 Moreover / Furthermore / Consequently 开头；"it is important to note that"。
- 非中性/推销腔（even in encyclopedic prompts，LLM 仍偏向溢美）。
- 痕迹是**移动靶**：'delve' 2025 退潮、GPT-5.1 后 em dash 下降；单一特征不可定罪，要看**簇**。
- 检测研究（CMU 1.2 万文本对比；biomedical Pangram 研究）：AI 文本多为**局部**嵌入人写稿，
  说明"逐段定位 + 局部修"比整篇判定更贴近真实工作流。

### 1.3 诚信边界（强调）

大量"AI humanizer"服务以**绕过 Turnitin/检测**为卖点，属学术诚信问题。可迁移的**正当**技巧
（变化节奏、校准 hedging、收紧论证、保护引用）只应用于**作者自己写/实质参与**的稿件，
而非把生成稿伪装成原创。→ skill 必须显式写明：定位是"打磨作者自己的草稿使其更清晰且合规"。

## 二、中文博士学位论文侧

### 2.1 学位论文语言/语体规范（高校撰写规范汇总）

- 学术质量：立论正确、**推理严谨**、数据可靠、层次分明、文字通畅。
- **语言文字执行国标**：汉字规范（不用废繁体/异体）；标点 GB/T 15834-1995；
  数字用法 GB/T 15835-1995；法定计量单位 GB 3100~3102。
- **术语/符号/代号全文统一**并规范化（≠ 通用 humanizer 的"同义词轮换"——此处轮换既是 AI 味又**违规**）。
- 标题：确切、具体、题文一致，一般 ≤20 字，过长用副标题。
- 摘要：目的/方法/结果/结论，独立性与自含性，突出创新；**博士建议 ≤2000 字**。
- 结论：明确、精练、完整、准确；含创新性工作 + 研究**局限** + 未来建议（≠ 通用的"砍空泛结论"，
  学术结论有强制结构）。
- 致谢：诚恳、恰当、简短。注释：社科较多，控制数量。

### 2.2 中文"AI 味"的可量化特征 + 降 AIGC 率方法（国内语境）

- 检测器（知网 AIGC / Turnitin / Copyleaks）盯：**高频并列结构、平均句长 > 28 字、上下文语义可预测性高**。
- 典型问题：**泛泛而谈**、无真实数据/文献支撑、只会概括性总结、缺深度学术分析。
- 句式技巧：避免"首先,""综上,"等"几字+逗号"短句堆叠；拆解高频并列；适度调整句长与语序。
- **根本方法**：补真实数据/文献、深化分析、加入个人见解，让内容真有支撑（而非机械改写规避检测）。
- 红线：多平台把高 AIGC 率（常见阈值 >30%）视为学术不端依据 → 仍以提升真实原创性为目的。

## 三、对设计的直接影响

1. 既有规则**重新 gating**（保留/校准/禁用），不是无差别套用 —— 见 design.md 冲突表。
2. 新增**学术专属 AI 痕迹**：ghost citation、泛泛而谈、术语漂移、低 burstiness/超长句、模板化段落。
3. 两套**规范包**（en-journal / zh-dissertation）作为可切换模块。
4. **诚信边界**写进 SKILL.md 主干（行为铁律，不下沉 references）。
5. **机械校验脚本**正好覆盖可量化项：em/en dash、curly quote、AI 高频词、"首先/综上"逗号短句、
   句长/burstiness（中文 >28 字占比）、术语一致性（glossary 驱动）。

## 来源（节选）

- Sage Perspectives — AI detection red flags for peer reviewers (2025)
- PMC — Defining boundaries of AI use in scientific writing; AI-written scientific manuscripts
- arXiv 2512.06705 — journals' AI policies vs surge in AI-assisted writing
- Wikipedia: Signs of AI writing（现有 skill 的上游）
- 上海交通大学 / 北航(2025) / 兰州大学 / 郑州大学 学位论文撰写规范
- 知乎 / CSDN / 腾讯云 等降 AIGC 率实战教程（去重需批判看待，取其可量化特征）
