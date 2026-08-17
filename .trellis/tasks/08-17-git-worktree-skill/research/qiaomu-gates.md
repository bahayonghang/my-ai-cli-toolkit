# Qiaomu 2.8.1 门禁摘录（本任务）

来源：`C:/Users/lyh/.skillsmanage/skills/qiaomu-meta/`（version 2.8.1）。对照副本：`C:/Users/lyh/.grok/skills/qiaomu-meta/`。

## 模式判定

Governed：公开发布、团队关键流程、账号/密钥/网络/**文件写入**/付费服务。需要 owner、review cadence、rollback boundary、trust boundary。缺 provider / 人工评审 / 真实安装 / telemetry 时写 `missing evidence`。

本 skill 会写 `.gitignore`、创建/删除工作区目录、执行仓库级 prune，因此是 Governed，不是 Production。

## 必做门

| 门 | 要求 | 本任务落点 |
|---|---|---|
| `validate_skill.py` | 所有 skill | 实施时运行；README/manifest 失败记为 suite schema deviation |
| `trigger_eval.py` | Production 以上 | 必跑。cases 放任务 `research/trigger-cases.json`，报告放 skill `reports/trigger-eval.json` |
| `export_skill_ir.py` | Production+/Library+/Governed | 必跑。输出 `reports/skill-ir.json` |
| permission / trust / rollback | Governed | `security/permission_policy.json` + `references/safety.md` |
| secret scan | Governed | 实施时跑本地扫描；工具不可用则 `missing evidence` |
| install proof | Governed | 本任务不发布，标 `missing evidence` |
| public claim guard | Governed | 禁止写「已验证 Production/Governed」除非对应报告存在 |
| owner / review cadence | Governed | SKILL.md `metadata.owner` / `metadata.review_cadence` |

## 明确不做的伪装

- 不把 suite 省略 README/manifest 说成 Qiaomu 包已通过。
- 不把 `evals/evals.json`（CI 不执行）说成 trigger eval 已通过。
- 不把计划中的门禁写成已经有证据。
