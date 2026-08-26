# PDF Pipeline（编译验收与降级路径）

W1/W2 的产物验收阶段执行。原则：**"源文件看着没问题"不算通过**——分页决策不可预测，必须编译并目检。

## 可用性探测与显式降级

开工前探测：`lualatex`、`xelatex`（模板编译）、`pdftotext`（poppler，ATS 检查用）。

| 环境 | 行为 |
|---|---|
| TeX 齐全 | 走完整管线：起草 → 编译 → 目检 → 迭代 → ATS 验证 |
| 有 pdftotext 无 TeX | 输出 **markdown 版本** + 跳过页数/孤行/文本层检查，交付时逐项列明被跳过的校验 |
| 全无 | markdown 版本 + 明确警告"未做任何机械校验"；建议安装 TeX Live/MiKTeX 后重跑 |

降级是**显式报告**，不是静默跳过——用户有权知道这份简历没经过页数与 ATS 验证。

## 模板

- `assets/templates/cv-main.tex`：moderncv banking 风格。编译用 `lualatex -interaction=nonstopmode <file>.tex`（pdflatex 在新版 MiKTeX 上常因 fontawesome5 字体扩展报错；lualatex 同源干净通过）
- `assets/templates/cover-letter.cls` + 配套 `.tex`：自定义求职信类。编译用 `xelatex`（依赖 fontspec）
- 字体 Lato / Raleway 不随包分发（OFL 许可，自行下载放入字体目录或改用系统字体）；缺字体时把 `\fontspec` 路径改为系统字体名即可
- 页数硬约束：**CV 恰好 2 页，求职信恰好 1 页**。任何其他页数都是失败，修完才准交付

## 布局目检项

CV：
- [ ] 恰好 2 页（不是 1 也不是 3）
- [ ] 无孤行条目标题——职位/学历标题绝不能单独留在页底而 bullet 掉到下页（最高频故障）
- [ ] 第 2 页顶部没有只剩一两行的孤立小节
- [ ] 无异常空白断层

求职信：
- [ ] 恰好 1 页；签名块完整可见
- [ ] bullet 字体与正文一致

## 常见修复

- **孤行条目**：导言区 `\usepackage{needspace}`，问题条目前加 `\needspace{5\baselineskip}`。只加在出问题的单个条目前，**不加在 `\section` 前**（会把整节推到下页，反而多出一页）
- **尾部小节溢出到第 3 页**：该节前加 `\enlargethispage{2-3\baselineskip}` 救回
- **第 3 页有实质内容**：relevance-weighted cutting 删内容，禁压边距行距
- **第 2 页过早结束显得单薄**：恢复之前删掉的最高相关度条目

## LaTeX 静默失败对照表

每个都真实发生过，逐条自查：

| 陷阱 | 症状 | 规避 |
|---|---|---|
| `%` 未转义 | **静默**：编译零报错，该符号后整行内容从 PDF 消失（量化成就正是高发位） | 正文所有 `%` 写 `\%` |
| `&` 未转义（`\cventry` 内） | 响亮失败：alignment-tab 报错 | 公司名写 `\&` |
| `\item [` 开头字面方括号 | 被解析为可选 label，渲染出左页缘且从文本层消失 | 写 `\item {[text]}` |
| itemize 放进 `\lettercontent{}` | 该宏给参数追加 `\\`，环境闭合后无行可断，编译失败无输出 | 先闭合 `\lettercontent{}`，列表包 Raleway `\fontspec` 包装放外部 |
| 日期写 `2016--2024` | 连字成 en-dash(U+2013)，部分 ATS 只按 ASCII 连字符切日期区间，导入丢教育条目（Workday 实例） | **日期参数用单连字符**；正文排版性范围可保留 `--` |
| 裸年份 `\cventry{2016}` | 解析器拿不到结束日期，短合同/实习导入残缺 | 显式区间，不足一年带月份 |

其余转义：`$`→`\$`、`#`→`\#`、`_`→`\_`、`~`→`\textasciitilde{}`、`^`→`\textasciicircum{}`。多语言 CV 时所有小节标题与 "References available upon request" 一并翻译——它们是模板里的字面英文，不会自动本地化。

## ATS 文本层验证（仅 CV）

ATS 读的是 PDF 内嵌文本层而非渲染页面。视觉通过的简历仍可能提取为乱码。

```bash
pdftotext -layout -enc UTF-8 <file>.pdf <file>.txt   # -enc UTF-8 必带，否则非 ASCII 全变替换符
```

逐项检查提取文本：
1. **能提取且无垃圾段**：无 `(cid:NNN)` 标记、无 `�` 替换符、PDF 上可见的文字没有整段缺失
2. **邮箱与电话以字面文本存在**：图标字形噪声无害，但联系方式只靠图标或超链接承载 = ATS 不可见
3. **阅读顺序与视觉一致**：单栏模板安全；多栏自定义布局是翻车点，真翻车要明确告知用户"在拿 ATS 兼容换美观"
4. **关键词覆盖表**（resume-writing.md 四态）对提取文本执行

失败属模板级问题的，改源后回到编译步重跑全链。

机械验收可用 `scripts/verify_pdf.py`（页数 / 最小可提取字符 / 包含串），用法 `python scripts/verify_pdf.py <pdf> --pages 2 --min-chars 500`。

## 收尾

删除中间产物（`.aux/.log/.out/.txt` 等），保留源文件与 PDF。
