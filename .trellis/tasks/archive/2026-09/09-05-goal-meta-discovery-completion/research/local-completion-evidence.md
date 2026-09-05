# 本地完成语义实施证据

日期：2026-09-05。范围：仓库 Goal 包非 Trellis 契约、普通样例及回归；全局安装、Linux 处置和新会话发现由主线程核验。

## 实际漂移与修订

- `references/goal-command-playbook.md` 双语普通 MVP 样例原有“检查通过或明确说明缺少配置”/`checks pass or missing checks are explicitly reported`，与根 SKILL 的合取要求矛盾，已修正。
- `references/persistent-goal-contract.md` schema 完成节原有 `Required checks pass or an explicit pause condition is reached`，已拆成四项同时满足；暂停、缺必需证据和轮数耗尽仅是未完成退出。
- 普通 bug/UI/skill/dashboard 示例和 `default-goal-strategy.md` discovery-first 示例补齐具名入口及 diff/status 证据。Claude 普通简写保留 transcript/轮数要求并补齐范围证据。
- 现有普通测试输入也带有“检查通过或缺配置”，已同步；不新增完成语义硬编码通用校验器。
- 包版本更新为 0.8.1，并同步现有 Generated-by 精确校验、Skill IR、schema 与测试元数据。description/interface 未改，trigger gate 不适用。

## 验证

1. `node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs`：初次 64/64 PASS。
2. patch 版本同步后发现旧版本正则断言，修正该断言后以 `node --test --test-reporter=dot` 重跑两组：64/64 PASS、exit 0。
3. `python -m py_compile` 两个既有 helper：exit 0。
4. 新增包回归实际抽取两份公开普通双语示例，断言四项完成门、不允许旧 disjunction，并分别调用既有 linter；还检查公开持久 schema 的四项门。
5. 既有真实临时目录写入回归继续覆盖 create-only、既有文件拒绝、正确/过期 SHA-256、编码、秘密、路径/链接拒绝、五平台及非 Git 同轮保存。

没有 Goal API、payload 执行、安装写入、提交、发布或远端修改。Trellis adapter、Trellis 示例、review-remediation 规则和原有暂停类别均未修改。

## 独立检查与主线程补充

check_goal 补齐 Claude checkout 变体和两处中文模板的四项完成门，扩展现有测试后 64/64 再次通过；详见 check-report.md。主线程已完成远端完整历史比对及九场景隔离模型仿真，分别见 remote-package-comparison.md 与父任务 research/behavior-smoke.md；不能把仿真拟执行动作当成真实工具执行或安装后发现证据。

## 验收状态与证据限制

| 条件 | 当前结论 |
| --- | --- |
| O4 本地 canonical/普通样例 | 已修复真实漂移，公开样例和 schema 本地回归通过；旧远端增量的完整一致性由主线程另记 |
| O5 权限及保存保护 | 现有 package gate 和文件写入测试通过；root 只修改版本，helper 写入行为未改 |
| O6 普通 Goal/旧示例/三轮耗尽/缺必需访问或检查/全部通过/显式生成启动/既有文件 | `evals/evals.json` 新增 50–56，分别定义正向要求及禁止行为；这是设计用例，尚无 provider transcript，不能声称行为执行通过 |
| O1/O2/O3 | 不由本报告验收；主线程维护源链、远端只读比较和安装/新会话证据 |

`evals/evals.json` 不由 CI 自动运行。本次本地测试只能证明包中的确定性契约和写入实现，不能证明模型遵从、人工盲评、新会话发现或遥测效果。O6 的 provider 行为证据仍为 `missing evidence`，本子任务不能仅凭本地测试宣称全部完成。

Qiaomu 取舍：keep 0.8.0 的合取意图、文本不启动及保存边界；adapt 有证据的普通样例和 schema 漂移；reject 新权限、暂停类别放宽、远端直接覆盖及通用规则引擎。此次为局部维护，不做无收益的外部 prior-art 搜索或新包脚手架。优势仅为本地回归证明的样例一致性，模型行为改善仍待实测。
