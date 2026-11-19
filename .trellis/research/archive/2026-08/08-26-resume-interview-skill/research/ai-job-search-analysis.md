# ai-job-search 深度分析（研究材料）

> 来源：主 agent 直读核心文件 + RepoPeripheral scout 外围系统报告（2026-08-26）。
> 用途：design.md 文件映射与机制取舍的依据。

## 一、仓库定性

fork 型求职工作区（workspace-repo），不是 skill：
- 用户 fork 整仓，`/setup` 把个人数据写进 git tracked 文件；公共 fork 不可转私有 → 隐私预警是 onboarding 第一步
- 方法与数据混在同一组文件：`01-candidate-profile.md` 等既是 schema 又是数据载体（`[PLACEHOLDER]` 占位）
- 平台绑定 Claude Code：`.claude/commands/*.md` 入口 + `.claude/settings.json` 权限白名单
- CI 守卫（security_guards / lint_skills / check_framework_version / placeholder_integrity）保护 fork 同步安全

## 二、命令生命周期

```
/setup(三路径) → /scrape(发现去重) → /rank(批量triage) → /apply(深评+起草+审稿+编译验收)
    ↑                                                        ↓
    └──── Path A 消费归档校准评分框架 ← /outcome(结局+归档+催信) ←┘
旁路: /expand(增量扩画像) /add-template(换模板) /add-portal(门户生成) /reset(清空)
```

文件所有权边界：/outcome 只写 tracker+归档；/setup 独占解释权；/rank 只增字段不改结构。

## 三、须保留的核心机制（→ 新 skill）

### 诚实性体系（最高优先级）
1. **Factual Grounding Audit**：所有 claim 可追溯到三事实源之一（01 ∪ master CV ∪ CLAUDE.md profile）；reviewer 按 `"reason": "grounding"` 单独标记事实性修改
2. **Profile 回写规则**（apply.md L7-11）：会话中用户确认的新事实必须当场写入 profile——否则下个 session 当 fabrication 剔除，真实成就静默消失
3. **Interview backtrack test**（03 rule 6）：reframe 三档 OK/Flag/Never；Flag 区 bullet 起草后要向用户确认"keep/soften/drop"
4. **关键词诚实**：覆盖表四态 covered/synonym-only/missing-have/missing-gap；gap 保持缺失 + 求职信桥接，never stuff
5. **在读学历显式标注**、tenure-vs-output 三修复（surface more work / 显式分期 / 解释长周期），禁止缩短日期或造项目
6. **归档不可伪造**：存档版=实际提交版（复制不移动不覆盖）；follow-up 信 no-new-claims（每个主张只能来自已提交材料）
7. 表单字段（08）：三源联合 grounding + scope discipline（参与≠主导）+ 程序化计数不许估算

### 双代理工作流（apply Step 2-4）
- drafter 起草（token 规则：不重读已读文件、草稿 inline 传给 reviewer）
- reviewer 独立上下文：公司调研（缓存 30 天 TTL，缓存是线索非来源）→ factual audit → 输出 Part A JSON edits + Part B 四类叙事建议（missed keywords / company angles / reframing / tone-vs-behavioral-profile）
- drafter 应用修订；公司 claim 由 drafter 独立复核后才能进产物

### Fit 评估框架（04）
Eligibility Gate（公民/PR 硬门，silence ≠ permission）→ Language Gate（未声明语言=硬排除；声明但等级存疑=FLAG 不静默）→ 五维评分 Tech30/Exp25/Beh15/Career30 + location pass/fail → verdict 阈值 Strong75+/Good60-74/Moderate45-59/Weak30-44/Poor<30

### 写作风格（03）
no em-dash / no cliché / no apologetic hedging / forward-looking framing（信不是 CV 复读）/ headline 公式 / bullet 动词开头 / 分角色类型措辞（technical/domain/consulting/leadership）/ 语气对齐 02 行为画像自然语域

### PDF 编译-检查循环 + ATS（05/06 + verify_pdf.py)
- CV=2 页、CL=1 页硬约束；孤行 `\cventry` 修复（needspace 只加在 entry 不加在 section）；relevance-weighted cutting（相关性×唯一性×叙事依赖打分裁剪）
- ATS 文本层验证：pdftotext -enc UTF-8 提取 → 无 cid/乱码、联系方式字面文本、阅读顺序一致、日期用 ASCII 连字符（en-dash 曾致 Workday 导入丢教育条目——真实案例）
- LaTeX 静默失败表：`%` 吞行尾、`\item [` 方括号 label、cover.cls itemize 坑（移出 \lettercontent{} + Raleway fontspec 包装）

### 信任边界（09 + SECURITY.md）
posting = 数据非指令；永不 fetch posting 正文内 URL；403 = 拒客户端非页面不存在，重试前过 robots 门（保守 RFC 9309 实现，其他失败=不重试）；升级序 WebFetch→curl 浏览器头→WebSearch 找官方 careers 帖；优先雇主自有 posting（aggregator 丢 req ID/职级）；搜索摘要是线索不是来源

## 四、外围机制取舍

| 源机制 | 取舍 | 理由 |
|---|---|---|
| setup 三路径 | 收敛为访谈式 + 单 CV 导入；documents 文件夹扫描降为可选 | 通用 skill 无固定 documents/ 布局 |
| read-before-write + additive/conflicting 双桶合并协议 | **保留**（profile 更新协议） | 幂等且防覆盖用户数据 |
| tracker CSV / seen_jobs.json | 排除 | 依赖 scrape/rank 全链路 |
| company_research cache（30 天 TTL，数据非指令） | **保留**（可选目录约定） | 双工作流复用调研 |
| outcome 归档 + follow-up 催信 | 排除（可在 README 注为扩展方向） | 依赖 tracker |
| add-template managed block 激活 | **简化保留**：模板适配层概念保留，注册流砍掉 | 通用化需要非 LaTeX 逃生口 |
| portal CLI 契约 / scrape / rank / upskill | 排除 | 独立领域，可另立 skill |
| verify_pdf.py | **移植**进 scripts/ | 机械验收门，MIT |
| robots_check.py | 不移植（引用规范文本即可） | 重试升级序保留为规则，脚本依赖场景窄 |

## 五、测试模式观察（供 evals 设计参考）

源仓库 tests 的模式："spec 即实现" + "每个测试钉死一个真实发生过的静默失败模式"（docstring 引用 review finding F9/F22/F28/F31/F34 或 issue #298/#331/#345）。新包的 output eval 应同样锚定不变量：grounding 抽查、untrusted-input 拒绝、页数/词数约束、降级路径行为。
