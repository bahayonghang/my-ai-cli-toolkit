# bidwriter 通用化优化 · 实现计划

- Date: 2026-06-26
- Status: Draft for review

## Preconditions

- 用户已评审通过 `prd.md`、`design.md`、`implement.md`。
- 任务已启动：

```bash
python ./.trellis/scripts/task.py start .trellis/tasks/06-26-optimize-bidwriter-skill
```

未启动前不得实现。

## Implementation Checklist

1. 快照工作区状态。
   - 命令：`git status --porcelain`
   - 验证：确认 image-to-ui-skill 等既有无关改动，编辑时不触碰。

2. 重写 `SKILL.md` frontmatter（重点）。
   - 按 design.md 定稿更新 `description`（通用招投标定位 + 补触发词 + 锐化排除）、`tags`（增 `procurement/rfp/招投标/政府采购`）、`version` → `1.1.0`。
   - 验证：`python scripts/check.py skills/docs-writing-publishing/bidwriter` 无 error；人工确认 `description` 无 `<`/`>` 且含新触发词与新排除项。

3. 改写 `SKILL.md` 正文。
   - 角色定义改为按领域适配的资深招投标顾问，保留工程深度强项表述。
   - 新增 OCR 前置规则（坑①）。
   - 关键规则新增"报价不由 AI 拍板"（坑②）与"关键数字/名称/金额人工逐条复核、AI 完成约 80%"（坑⑤）。
   - 加入技术指标"满足/优于/偏离"超配响应说明，详细指向 SCORING_GUIDE。
   - 投标类型与速查表新增 IT/信息化、软件开发、货物采购、服务采购。
   - 验证：`rg -n "OCR|逐条复核|满足/优于/偏离|货物采购|服务采购" skills/docs-writing-publishing/bidwriter/SKILL.md` 命中预期；`<skill-dir>` 占位引用保持字面。

4. 扩充 `references/CHAPTER_TEMPLATES.md`。
   - 在工程三类补充之后并列新增 IT/信息化、货物采购、服务采购三段章节补充模板。
   - 验证：三段标题与要点存在；既有八大通用章节与工程三类补充未被删改。

5. 扩充 `references/SCORING_GUIDE.md`。
   - 新增"技术指标点对点响应表（满足/优于/偏离 + 超配响应 + 偏离表）"小节。
   - 补货物/服务类评分维度差异。
   - 验证：新小节存在；既有评标方法 / 逐条响应 / 亮点 / 扣分项 / 自评清单保留。

6. 扩充 `references/TERMINOLOGY.md`。
   - 新增"IT 与信息化术语"与"政府采购术语"补充（SLA/等保/信创/RFP/POC/政府采购/竞争性磋商 等），沿用"术语/英文/释义"表头。
   - 验证：新段存在；既有四段保留。

7. 扩充 `references/STANDARDS.md`。
   - 新增"政府采购法规"（《政府采购法》、财政部令第 87 号、政府采购法实施条例）与"信息化/信息安全标准"（等保 2.0 GB/T 22239、ITSS 等），沿用"编号/名称/适用场景"表头。
   - 在引用规范处提示工程建设与政府采购两套法律体系的区分。
   - 验证：新段存在并标注编号；既有规范段保留。

8. 新增 `agents/interface.yaml`。
   - 按 design.md schema 写 `display_name`/`short_description`/`default_prompt`，措辞体现通用招投标。
   - 验证：`python -c "import yaml; yaml.safe_load(open('skills/docs-writing-publishing/bidwriter/agents/interface.yaml',encoding='utf-8'))"` 无异常。

9. 扩充 `evals/evals.json`。
   - 保留 eval 1/2/3（按需微调 assertions），新增 IT/政务云 与 货物/服务采购 正向各≥1，保留并可加强负向（年会致辞+营销软文，可加学术论文负向）。
   - 验证：`python -c "import json; json.load(open('skills/docs-writing-publishing/bidwriter/evals/evals.json',encoding='utf-8'))"` 通过；人工确认 assertions 与新行为一致。

10. 技能元数据校验。
    - 命令：`just skills-check`
    - 验证：通过（bidwriter 无 error）。

11. 重新生成文档。
    - 命令：`just docs-sync`
    - 验证：`docs/skills/docs-writing-publishing/bidwriter.md` 与 `docs/en/skills/docs-writing-publishing/bidwriter.md` 反映新描述。

12. 文档漂移与站点校验。
    - 命令：`just docs-check`
    - 验证：catalog 同步检查通过、VitePress build 通过。

13. 收尾门禁（条件允许时）。
    - 命令：`just ci`
    - 验证：全流程通过；若 docs 依赖等导致不可行，记录确切失败 / 跳过原因，不隐藏。

14. 复核最终 diff。
    - 命令：
      `git diff -- skills/docs-writing-publishing/bidwriter docs/skills/docs-writing-publishing/bidwriter.md docs/en/skills/docs-writing-publishing/bidwriter.md`
      `git diff --check`
    - 验证：改动仅限 bidwriter 技能包与其生成文档 + catalog；未触碰 image-to-ui-skill 等无关文件。

## Files Expected To Change

- `skills/docs-writing-publishing/bidwriter/SKILL.md`
- `skills/docs-writing-publishing/bidwriter/references/CHAPTER_TEMPLATES.md`
- `skills/docs-writing-publishing/bidwriter/references/SCORING_GUIDE.md`
- `skills/docs-writing-publishing/bidwriter/references/TERMINOLOGY.md`
- `skills/docs-writing-publishing/bidwriter/references/STANDARDS.md`
- `skills/docs-writing-publishing/bidwriter/evals/evals.json`
- `skills/docs-writing-publishing/bidwriter/agents/interface.yaml`（新增）
- `docs/skills/docs-writing-publishing/bidwriter.md`（生成）
- `docs/en/skills/docs-writing-publishing/bidwriter.md`（生成）
- 可能的 catalog 生成文件（`docs/.vitepress/generated/*`、`docs/skills.md`、`docs/en/skills.md`）由 `docs-sync` 决定

## Files Not Expected To Change

- 其他技能包
- 平台 hook / 模板、`justfile`、`scripts/check.py` 等校验脚本
- Trellis specs
- `docs/skills/developer-tools-integrations/image-to-ui-skill.md` 及其英文版（既有无关改动）

## Review Points

- 路由召回：新 `description` 是否覆盖"废标检查 / 评分提取 / 合规 / 政务云 IT / 货物服务"等说法？
- 负向边界：是否仍能挡住"年会致辞 + 营销软文"（eval 4）与纯学术论文？
- 领域连贯：description 扩域是否与正文投标类型、references 模板、STANDARDS 法规体系一致，无自相矛盾？
- 避坑落地：OCR 前置、报价不由 AI 拍板、人工复核、技术指标超配响应是否都在正文 / references 有落点？
- 工程不退化：工程三类既有内容是否完整保留？

## Rollback Points

- 步骤 2 后：若 `check.py` 报错或 description 路由变差，仅还原 frontmatter。
- 步骤 4–7 任一后：reference 改动相互独立，可单文件还原。
- 步骤 11 后：若 docs 生成出现异常广面漂移，先检查 catalog 生成差异再决定继续或还原。
- 收尾前：若 `just ci` 因既有无关原因失败，留存证据，不掩盖。
