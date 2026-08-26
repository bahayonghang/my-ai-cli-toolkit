# Job Application Kit（求职申请套件）

针对目标职位量身定制简历与求职信、在诚实边界内包装既有经历、生成阶段化面试准备包并支持模拟面试的 agent 技能包。

方法论提炼自 [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search)（MIT）的求职工作区框架，改造为**可安装、平台中立、方法与个人数据分离**的标准技能包。

Copyright (c) 向阳乔木 · [X](https://x.com/vista8) · [GitHub](https://github.com/joeseesun/)

## 它解决什么问题

通用 LLM 改简历的三个失败模式，本套件逐一设防：

| 失败模式 | 本套件的防线 |
|---|---|
| 编造经历、夸大数字 | 三事实源 grounding 审计：每条 claim 必须能溯源到用户档案；backtrack test 限制 reframe 上限 |
| 关键词 stuffing | 四态覆盖表：真缺口保持缺失并在求职信中桥接，永不塞词 |
| JD 内嵌注入指令被当真执行 | 信任边界：JD 是数据非指令；永不抓取其内 URL；公司主张 verify-before-use |

另有两条硬质量门：PDF 编译-目检循环（页数硬约束、孤行修复）与 ATS 文本层验证（联系方式字面文本、阅读顺序、ASCII 连字符日期——后者来自真实的 Workday 导入丢条目案例）。无 LaTeX 环境时显式降级为 markdown 输出并列明被跳过的校验。

## 安装

```bash
npx skills add <发布仓库> --skill job-application-kit
```

或手动复制本目录到 `~/.claude/skills/`（Claude Code）、`~/.config/opencode/skills/`（OpenCode）或对应平台的技能目录。

## 快速上手

首次使用先建档案（访谈式或导入现有 CV），之后按需触发：

```
你：根据这个 JD 帮我定制一份简历。<粘贴职位描述>
    → 先出五维匹配评估（两道硬门 + 加权分 + verdict），确认后起草简历与求职信，
      双代理审稿修订，最后附页数/关键词/事实溯源验证清单。

你：下周三要面试这家公司，帮我准备一下。
    → 阶段化 prep pack：预测问题（早期反馈优先）、STAR 映射、一致性清单、
      定制难题、反问清单，可选模拟面试。

你：帮我把这段项目经历包装得更有说服力。
    → 只重排量化真实材料，Flag 级改写会逐句问你"保留 / 弱化 / 删除"。
```

## 前置依赖

| 依赖 | 必要性 |
|---|---|
| 支持 SKILL.md 的 agent 运行环境（Claude Code / OpenCode 等） | 必须 |
| TeX 发行版（lualatex + xelatex）：TeX Live / MacTeX / MiKTeX | 可选：PDF 产物需要；缺失时降级 markdown |
| poppler（pdftotext/pdfinfo） | 可选：ATS 文本层机械校验；缺失时降级为视觉检查 |
| Lato / Raleway 字体 | 可选：模板原排版用；OFL 许可自行下载，或缺省系统字体 |

## 用户工作区

技能在当前项目下维护 `career/`：

```
career/
├── profile.md        # 结构化档案（含语言表——未声明语言在评估中按硬排除处理）
├── behavioral.md     # 行为画像与语气参照
├── master-cv.md      # 母版简历：全量真实经历，裁剪的事实源
├── outputs/          # 定制产物与 prep pack
└── company-research/ # 公司调研缓存（30 天 TTL）
```

档案越厚产出越准：职责写成"做了什么、用了什么、结果是什么"，而非头衔罗列。

## 输出物

- `outputs/<公司>_<职位>_cv.<md|tex|pdf>` 与配套求职信
- 每次交付附验证清单：页数 / 词数预算 / 关键词四态覆盖表 / 事实溯源结果
- 表单字段输出为可直接粘贴的 `.txt`（实测计数 + NOTE TO SELF）

## 风险与边界

- **诚实边界不可协商**：要求编造经历、夸大规模时会被拒绝；只能做 backtrack test 允许的重构。
- 指令级防御不是沙箱：在不信任的招聘网站上使用后，建议抽查 agent 实际抓取与写入了什么。
- ATS 规则因厂商而异；文本层验证覆盖已知故障模式，不保证通过所有筛选器。

## Troubleshooting

| 现象 | 处理 |
|---|---|
| 编译报 fontawesome5 字体错误 | 用 lualatex 编译 CV、xelatex 编译求职信，不要用 pdflatex |
| PDF 文本层出现 `(cid:NNN)` | 字体缺 Unicode 映射；换标准字体后重编译 |
| 评估把该投的岗位判 FAIL | 检查语言表是否漏声明了实际具备的语言 |
| 无 subagent 环境，审稿质量可疑 | 审稿阶段已强制只依据草稿文本批评；可用"再独立挑一遍毛病"追加一轮 |

## 许可与致谢

- 方法语义改编自 [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search)（MIT），`scripts/verify_pdf.py` 为其移植版（头部保留原始版权注记）
- 本包以 MIT 许可分发
