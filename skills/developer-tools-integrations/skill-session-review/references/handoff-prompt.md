# Handoff prompt

After the report is written, fill one language variant and put it in a single chat `text` fence. Do not paste SSR bodies. Do not write 见上一条消息 or "see the report above".

## Placeholders

| Token | Value |
| --- | --- |
| `{{target_path}}` | Absolute target `SKILL.md` |
| `{{report_path}}` | Absolute report path |
| `{{report_rel}}` | `reports/skill-session-review/<name>.md` |
| `{{skill_name}}` | Target skill name |

## Chinese

```text
请用 qiaomu-meta 根据使用情况反馈报告优化下面这个 skill。先读报告，再改目标 skill。不要扩大成新 skill，不要做调用次数统计。

定位
- 目标 skill：{{target_path}}
- 反馈报告（问题真源）：{{report_path}}
- 仓库内报告路径：{{report_rel}}
- skill 名：{{skill_name}}

必读顺序
1. 打开反馈报告全文。
2. 打开目标 SKILL.md 及其直接链接的 references。
3. 对每条 SSR，核对其 Evidence 再改。

处理规则
- 只处理裁决为 UPDATE SKILL 且进入「建议改 SKILL.md 的条款」的项。
- COMPLIANCE GAP 不要改 skill 文本。
- ONE-OFF 和 INCONCLUSIVE 不要升成核心规则。
- 报告文件缺失则停止，不要猜测内容。
```

## English

```text
Use qiaomu-meta to improve the target skill from the session-review report. Read the report first. Do not create a new skill. Do not count usage.

Location
- Target skill: {{target_path}}
- Feedback report (source of findings): {{report_path}}
- Report path in the repo: {{report_rel}}
- Skill name: {{skill_name}}

Read in this order
1. The full feedback report.
2. The target SKILL.md and its directly linked references.
3. For each SSR, the Evidence locator before editing.

Rules
- Edit only UPDATE SKILL items listed under suggested SKILL.md changes.
- Do not change skill text for COMPLIANCE GAP.
- Do not promote ONE-OFF or INCONCLUSIVE into core rules.
- If the report file is missing, stop. Do not guess its contents.
```
