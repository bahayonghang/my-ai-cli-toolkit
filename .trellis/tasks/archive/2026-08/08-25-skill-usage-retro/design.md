# 技术设计：skill-session-review

## 边界

改动面：

- 新建 `skills/developer-tools-integrations/skill-session-review/`
- 根 `.gitignore` 增加 `reports/skill-session-review/`
- `skills/developer-tools-integrations/AGENTS.md` 的 suite 表补一行
- `just docs-sync` 生成的 `docs/` catalog 页

不改 qiaomu-meta、不改 `trellis-plan-review`、不改 Trellis runtime、不提交报告正文。

LLM 负责对照 `SKILL.md` 做使用情况裁决。Python helper 负责：仓库根解析、调用扫描、路径受限写入、gitignore 追加。

## 包布局

| 路径 | 职责 | AC |
| --- | --- | --- |
| `SKILL.md` | 触发、硬门、步骤、`` `<skill-dir>` ``、version `0.1.0` | AC8 AC9 AC10 AC12 AC17 |
| `agents/interface.yaml` | 中性 interface | AC14 |
| `references/invocation-signals.md` | 四平台判定：`available` / `loaded` / `invoked`；路径身份 | AC1 AC2 AC3 AC4 |
| `references/finding-contract.md` | `SSR-NN` 字段、四裁决、摘录上限、反通胀 | AC5 AC6 AC7 AC11 |
| `references/report-template.md` | 落盘 Markdown 骨架 | AC5 AC8 AC11 |
| `references/handoff-prompt.md` | 中英填空，读者为 qiaomu-meta | AC8 AC9 |
| `scripts/scan_invocations.py` | 调用扫描 | AC1 AC2 AC3 AC4 |
| `scripts/write_session_review.py` | 写报告 + 根 `.gitignore` 精确行 | AC8 AC15 AC16 |
| `tests/write-session-review.test.mjs` | 路径、覆盖、逃逸、根 gitignore 权威 | AC15 AC16 |
| `tests/scan-invocations.test.mjs` | 四平台、两 cwd、Grok 嵌套、load≠invoke | AC1 AC2 AC3 AC4 |
| `evals/evals.json` | 行为正负例；CI 不执行 | AC12 AC17 |
| `research/trigger-cases.json` | qiaomu trigger_eval cases（任务内） | AC13 |
| 根 `.gitignore` | 精确行 `reports/skill-session-review/` | AC16 |

## 数据流

```text
用户给出 skill 名或路径
  → 解析目标实例（路径精确匹配；名字多候选则列出并停止）
  → 解析当前仓库根（git rev-parse --show-toplevel 或 --repo-root）
  → scan_invocations.py --scope global|cwd 列出候选（available/loaded/invoked）
  → Agent 只对 invoked 对照 SKILL.md 填 SSR 表；loaded 可写入覆盖说明
  → write_session_review.py 写报告并确保根 .gitignore 含精确行
  → 对话：结论行 + 报告路径 + 交接 Prompt
```

目标 skill 目录全程只读。

## 调用扫描

```text
python "<skill-dir>/scripts/scan_invocations.py" --skill-name <name> [--skill-path <abs>] [--scope global|cwd] [--repo-root <abs>]
```

默认 `--scope global`。`--scope cwd` 才用当前 `--repo-root` 的编码目录过滤 Claude/Grok/Oh My Pi；Codex 用 session 内 `cwd` 字段等于该根。四平台同一 `--scope` 语义。

输出 JSON：候选列表（session id、platform、status=`available|loaded|invoked`、signal、file path、skill_path）、`coverage.<platform>`、`ambiguous_targets`（名字多实例时非空并退出码 1）。不把散文命中标为 `invoked`。stdout 不回显私聊正文。

| 平台 | 文件 glob | available | loaded | invoked |
| --- | --- | --- | --- | --- |
| claude | `~/.claude/projects/**/*.jsonl`（cwd 范围则仅当前 encoded-cwd） | skill 出现在 listing / 目录 | 注入完整 `SKILL.md` 但无 Skill 调用 | `Skill` tool 或 `attributionSkill` 指向该实例路径或 name+path |
| grok | `~/.grok/sessions/<encoded-cwd>/<session-id>/chat_history.jsonl` | 仅提及路径 | 注入 skill 正文但无 `<skills_referenced>` | `<skills_referenced>` 的 `path` 规范化后等于目标路径；无 path 时 name 匹配且 `--skill-path` 未指定 |
| codex | `~/.codex/sessions/**/rollout-*.jsonl` | `host_skills` 目录列出该 name | 工具读到该 `SKILL.md`，或 `base_instructions` 含该 skill | 在 loaded 之后，`response_item` 出现该 skill 工作流标记或输出合同；仅读文件不是 invoked |
| oh-my-pi | `~/.omp/agent/sessions/<encoded-cwd>/*.jsonl` | 无 | `read`/bash 打开该 `SKILL.md` | loaded 之后出现该 skill 工作流标记或输出合同。不扫 `~/.pi` |

路径输入：`--skill-path` 规范化后，只保留 `skill_path` 等于该路径的候选。名字输入：扫描本机常见 skill 根，多于一个 `SKILL.md` 则 `ambiguous_targets` 列出路径，不扫描会话。

某平台目录不存在：`coverage.<platform> = "missing-store"`，退出码 0（除非名字歧义）。

## 写入与 gitignore

```text
python "<skill-dir>/scripts/write_session_review.py" --repo-root <abs> --skill-name <name> [--skill-path <abs>] [--input <file>]
```

- 目的地：`<repo>/reports/skill-session-review/<skill-name>.md`
- `dest.resolve()` 必须位于 `(repo / "reports" / "skill-session-review").resolve()` 之下
- 拒绝 symlink / reparse、`..`、绝对名、空名
- 创建缺失目录；覆盖同名
- stdin：Windows 按 quality-guidelines 读 `sys.stdin.buffer` 再 UTF-8 解码；优先 `--input`
- 写出 `encoding="utf-8", newline="\n"`，同目录临时文件再替换
- stdout 一行 JSON：`path`、`bytes`、`sha256`、`gitignore_wrote`（bool）。不回显正文
- 退出码：0 成功；1 策略失败；2 参数/根不存在

gitignore：

- 权威：仓库根 `.gitignore` 是否含 strip 后精确等于 `reports/skill-session-review/` 的一行
- 未覆盖则追加该行（文件无结尾换行则先补换行）。不 `git add`
- `git check-ignore -v` 仅作追加后的旁证。来源为 `.git/info/exclude` 或 `core.excludesFile` 时仍视为未覆盖
- 测试必须包含：全局 exclude 已忽略该路径、但根 `.gitignore` 缺行 → 仍然追加
- 本仓库实现时把同一行写入根 `.gitignore`

不把报告写进 `skills/<target>/`。

## 报告与交接

报告编号 `SSR-NN`。骨架见 `report-template.md`：覆盖说明、调用清单（按 status 分栏）、问题清单、建议改 SKILL.md 的条款（建议，不是 diff.patch）、未能核实、可靠部分。

每条 SSR 必填：步骤偏差、用户纠正（无则「无」）、缺口、可复用建议、会话 id、平台、证据定位、裁决。摘录最多 2×200 字符。完整 `user_query` / 完整注入 `SKILL.md` 禁止。`sk-`、`ghp_`、`Bearer ` 写成 `[REDACTED]`。其余 PII 标 `UNVERIFIED`。

`invoked` 会话才进入必须建议。`loaded` 只进覆盖说明。同一模式不足两个 `invoked` 会话不得升为必须改 `SKILL.md`。

对话不贴完整 SSR 表。交接 Prompt 填 `handoff-prompt.md`：目标 skill 路径、报告路径、要求用 qiaomu-meta 按报告改 skill、禁止在未读报告时改。

## allowed-tools

`Read, Glob, Grep, Write, Bash(python *), Bash(py *), Bash(git rev-parse *), Bash(git check-ignore *)`

Write 仅报告、根 `.gitignore` 追加、helper `--input` 临时文件。`git check-ignore` 不得单独决定跳过追加。

Write 仅报告、`.gitignore` 追加、helper `--input` 临时文件。

## 测试

- writer：合法名写入；覆盖；拒绝 `..` / 绝对名 / 目标 skill 路径；根 `.gitignore` 缺行追加；已有精确行不重复；全局 exclude 命中但根缺行仍追加；UTF-8 LF；symlink/reparse 拒绝
- scan：Claude / Grok / Codex / Oh My Pi fixture；两个 cwd；Grok `<session-id>` 嵌套；Codex `host_skills` 与仅读 `SKILL.md` 为 `loaded`；Oh My Pi 仅 read 为 `loaded`；工作流标记才 `invoked`；名字歧义退出 1；缺目录 coverage
- 隐私 fixture：超长 user_query 被截断；`ghp_` 变为 `[REDACTED]`
- 真实只读 smoke（实施步骤，不进 CI）：对 `trellis-plan-review` 跑 scan `--scope global`，stdout 只含 id/platform/status/path，禁止打印消息正文。外部 JSONL schema 漂移标 `UNVERIFIED`

## 触发评估

任务内 `research/trigger-cases.json`：`recommended_threshold` 0.34，`should_trigger` / `should_not_trigger` / `near_neighbor`，概念表写在该 JSON。命令：

```text
python "C:\Users\lyh\.grok\skills\qiaomu-meta\scripts\trigger_eval.py" "<skill-dir>" --cases "<repo>/.trellis/tasks/08-25-skill-usage-retro/research/trigger-cases.json"
```

`--cases` 必须绝对路径。全部 case 通过才算 AC13。不把 `just ci` 当触发证明。该命令只验证本 skill 的 description，不改任何目标 skill。

## 风险

- Oh My Pi 与 Codex 的 `invoked` 依赖工作流标记，漏检标 `INCONCLUSIVE` / `missing evidence`，不把读文件当调用。
- `trellis mem` 可作召回，不能单独当调用判定。
- 历史 JSONL schema、截断行、超大文件、未列入模式的 PII、junction 的全部 Windows 形状：规划标 `UNVERIFIED`，测试覆盖已声明的 fixture 与 reparse 拒绝，不声称穷尽。
