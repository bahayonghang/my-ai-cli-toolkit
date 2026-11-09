# Implement: design-atlas 0.4.0

前置（2026-11-09 已满足）：范围选项 B；gate 19 中文命中与英文同级。合同见 `design.md`。所有路径相对 `skills/development-workflows/design-atlas/`。

## Phase 1：门禁（可独立回滚）

1. `scripts/slop_check.mjs`：在 `TIERS` 与 `CLASSES` 中登记 `DA1`–`DA8`（tier 按 `design.md` §2，class `J`）。
2. `references/anti-slop.md`：§3 gate 表加 8 行；新增 Keep list 节；§6 判断清单加 8 项并扩写 gate 3、54、63 的中文示例；§1 说明 `DA*` 是一方编号。
3. 跑 `node --test tests/slop_check.test.mjs`，表格同步测试必须通过。
4. gate 19 中文：新增 `BUZZ19_CJK` 与 `了解更多`；新增 `tests/fixtures/slop/cjk-copy-fail/`、`cjk-copy-pass/`，在测试中加 bad/good 用例。
5. 新增 `tests/fixtures/slop/da-waiver/`（`DESIGN.md` 含 `waive DA3` 与 `waive DA2` 两行），断言前者接受、后者 NOTE 拒绝。
6. 核对：在一个中文页面 fixture 上，英文大写眉题是否由 54 或 67 报告；结果写入 `research/humanizer-analysis.md` §4.1 第 2 行备注，不扩写检测。
7. `just node-test`。

回滚点 A：Phase 1 单独提交。中文检测出问题时只回退第 4 步。

## Phase 2：流程与参考

8. 新建 `references/restyle.md`（英文，按 `design.md` §3 大纲，不出现 humanizer 原句）。
9. `SKILL.md`：按 `design.md` §4 改 Workflow 第 1 步、新增 Restyle branch、Audit 报告 Keep 段、输入即材料、Scope 出口与参考图分流、References 表、`version: 0.4.0`。
10. description：按草案修改，用 `python scripts/check.py` 或 `just skills-check` 确认 ≤1024 且无尖括号。
11. `references/implementation.md` §4：主首屏优先（不等待）、嵌入媒体一句并指向 restyle.md、Motion spec（trigger、object、property or path、duration and easing token、end state、repeat、touch alternative to hover、reduced-motion result；scroll-triggered 与 scroll-linked 的区别）。
12. `references/design-system-core.md` §4：Icons 规则（单一图标集、统一 viewBox/stroke/caps、单色 `currentColor`、优化时保留被引用的 id/class/defs、按渲染尺寸检查、装饰图标 `aria-hidden`、纯图标按钮需可访问名称）。§7 QA 清单加一项指向 DA8。
13. `references/review-prompt.md`：加一题检查必要信息是否被删；保持「最多五条问题」不变。
14. `agents/interface.yaml`：`default_prompt` 在 audit 句前加一句 Restyle 分支说明。

## Phase 3：评测、文档、测试

15. `evals/evals.json`：按 `design.md` §5 新增 16–21，`assertions` 用英文。
16. Python 测试：新增「references 均已在 SKILL.md 登记」断言。
17. `README.md`：适用场景加改稿；Anti-AI-slop 节写 `DA*` 与中文套话；来源表或致谢加 `LearnPrompt/vibecoding-humanizer` `51f8b09`，注明「思路参考；上游未附许可证，未复制文本」；限制节写明 3D / SVG 资产 / 代码动画不在范围。
18. 原文抽查：对 humanizer 13 条标题与 P1–P14 各取一个中文短语，`rg` design-atlas 目录应 0 命中（`README.md` 致谢里的仓库名除外）。
19. `just docs-sync`。

## 验证命令

```bash
just skills-check
just python-check
just python-test
just node-test
just evals-check
just docs-check
just ci
```

## Review gates

- Phase 1 后：`trellis-check` 复核 gate 表与脚本同步、中文词表误报面。
- Phase 3 后：全量 `trellis-check`，再跑 `just ci`。

## 回滚

- 回滚点 A：Phase 1 提交。
- 回滚点 B：Phase 2 + 3 提交。若 description 超长或 evals 结构失败，只回退该提交。
