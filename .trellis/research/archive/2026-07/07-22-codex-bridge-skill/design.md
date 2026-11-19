# Design: 跨平台 codex-bridge skill

修订版：吸收 Codex 审阅报告（2026-07-22）8 项 finding；裁决记录见文末。

## 目录结构（目标）

```
skills/development-workflows/codex-bridge/
├── SKILL.md                 # 入口（≤1300 tokens）；frontmatter: name/description/category/tags/version
├── THIRD_PARTY_NOTICES.md   # 上游 MIT 归属（见 D0）
├── checklist.md             # bundle 前 self-audit（移植 + 修订）
├── conventions.md           # bundle 目录约定（移植 + 修订；含配置/运行时分离说明）
├── jsonl-guide.md           # 会话 JSONL 指南（补 Windows 路径）
├── models.json              # scenario → 模型配置（新增）
├── references/
│   └── workflow-detail.md   # 从 SKILL.md 下沉的长篇细节（角色分工论证、正反例、失败处理明细）
├── agents/
│   └── interface.yaml       # 参照 codex-dynamic-workflows 样式
├── evals/
│   └── evals.json           # 正向触发 + ≥2 near-neighbor 路由负例
├── scripts/
│   ├── create_bundle.py
│   ├── validate_bundle.py
│   └── run_bundle.py        # codex exec 跨平台执行器（新增）
├── templates/
│   ├── plan-review/         # request.md + response.schema.json + prompt-notes.md
│   ├── codify/
│   ├── review-iteration/
│   └── verification-round/
└── tests/
    └── bundle-scripts.test.mjs  # Node 驱动 Python 脚本（接入 just node-test）
```

## 关键设计决策

### D0 许可证归属（Codex #1）

上游 `ref/repo/codex-bridge` 为 MIT。`THIRD_PARTY_NOTICES.md` 记录：上游仓库 URL、参考提交 `f1a4dec7e5ccdc506bef257e64aefe80a098abb6`、派生文件清单（templates/ 四场景、checklist/conventions/jsonl-guide 的移植部分、SKILL.md 工作流结构）、完整 MIT 许可文本。

### D1 脚本语言：Python 标准库

理由：仓库已有 `just python-check`；jq 的所有用法（字段存在性、类型检查、enum 校验、unique 计数）用 `json` + 少量函数等价实现；无需 jsonschema 三方库——校验是手写定向检查。

Windows 编码：每个脚本入口 `sys.stdout/stderr.reconfigure(encoding="utf-8", errors="replace")`；所有 `open()` 显式 `encoding="utf-8"`；状态标记用 `[OK]` / `[FAIL]` / `[WARN]` 替代 ✓/✗/⚠。

### D2 模型配置：models.json + 三层覆盖 + sandbox 不可提升（Codex #2 #5）

```json
{
  "$comment": "scenario → codex exec 模型配置。模型名随 OpenAI 演进，过期时对照 https://developers.openai.com/codex/models 更新。",
  "defaults": { "reasoning_effort": "medium" },
  "scenarios": {
    "plan-review":        { "model": "gpt-5.6-sol",   "reasoning_effort": "high" },
    "codify":             { "model": "gpt-5.6-sol",   "reasoning_effort": "medium" },
    "review-iteration":   { "model": "gpt-5.6-terra", "reasoning_effort": "medium" },
    "verification-round": { "model": "gpt-5.6-sol",   "reasoning_effort": "medium" }
  }
}
```

- **sandbox 不在 models.json**：sandbox 由脚本内置常量 `SCENARIO_SANDBOX = {plan-review: read-only, codify: workspace-write, review-iteration: workspace-write, verification-round: read-only}` 决定，任何配置层都改不了——项目内容不能把 read-only 静默提升为 workspace-write（Codex #2）。
- **verification-round 默认 Sol**（与 PRD 对齐，Codex #5）：Terra/Luna 是否够用属 missing evidence，留待代表性输出 eval；models.json 的 $comment 注明。
- 覆盖优先级（高→低）：① `create_bundle.py --model X --effort Y`（当次 CLI）→ ② 项目级 `<project>/codex-bridge.models.json`（**只认 model / reasoning_effort 两键**，其余键忽略并 `[WARN]`）→ ③ skill 内置 models.json。
- **配置与运行时分离**（Codex #2）：项目配置放项目根 `codex-bridge.models.json`（可提交、可团队共享）；运行时产物在 `.codex-bridge/`（建议 gitignore）。清理 bundle 不会误删配置。
- 解析后的最终 model / reasoning_effort / sandbox 写入 bundle `manifest.json`。

### D3 create_bundle.py

接口：`python create_bundle.py <scenario> [project_root] [round] [--model X] [--effort Y] [--skill-root P]`

行为对齐 create-bundle.sh：scenario 白名单校验（exit 2）、round 自动检测（**从 1 起找第一个空缺目录**，与上游 sh 语义一致——不是 max+1；Codex #8）、round 正整数校验（exit 1）、已存在目录拒绝（exit 3）、复制 schema + request.md 模板、manifest 初始化（含 model 三字段）。skill root 搜索顺序为显式 `--skill-root` → 脚本父目录 → `~/.claude/skills/codex-bridge` → `<project_root>/codex-bridge`，均无效时 exit 4；既保留上游 fallback，又为测试和非标准安装提供显式入口。stdout 只输出 bundle 路径；stderr 输出人话日志 + TODO（TODO 指向 `run_bundle.py`，不再给手拼 shell 命令）。

时间戳：`datetime.now().astimezone().isoformat()`。

### D4 validate_bundle.py：两阶段校验（Codex #4，吸收上游 R7）

接口：`python validate_bundle.py <bundle> [--phase preflight|post-response]`，默认 `preflight`。

- **preflight**（调 codex 前）：文件存在性、JSON 合法性、manifest 必需字段（含 model 字段，warn 级兼容手工 bundle）、`{{[A-Z_][A-Z_0-9]*}}` 残留、files/ 非空、语义检查（scenario / round / previous_rounds / max_rounds+purpose 豁免 / schema title 匹配）、verification-round F10–F13。
- **post-response**（codex 跑完后）：preflight 全部 + **强制要求** `response.json` 存在、`manifest.codex_exit_code` 非 null、`manifest.status ∈ {completed, failed}`，任一缺失即 fail——杜绝"没跑也通过"；response.json 按 scenario 分支做字段/类型/enum/4 维覆盖检查（对齐上游 sh 版逻辑，其中 4 维覆盖不足保持 warn 级）。

退出码 0/1/2 对齐 sh 版。实现骨架：`check(desc, fn)` 累积 FAILED；`jq -e 'has(x)'` → `x in obj`；`type=="array"` → `isinstance(v, list)`。

### D5 run_bundle.py：跨平台执行闭环（Codex #3，吸收上游 R5）

接口：`python run_bundle.py <bundle> [--dry-run] [--timeout SEC] [--output-schema]`

- 从 manifest 读 model / reasoning_effort / sandbox / project root，构造 argv 列表：
  `["codex", "exec", "--cd", project, "--model", model, "-c", f'model_reasoning_effort="{effort}"', "--sandbox", sandbox, "--skip-git-repo-check", "-o", str(bundle/"response.json")]`
- `subprocess.run(argv, stdin=open(request.md, "rb"), shell=False)` —— 路径/模型值/配置永不进入 shell 字符串，Git Bash / PowerShell / cmd 行为一致。
- 结束后**原子更新** manifest（写临时文件 + `os.replace`）：`codex_command`（argv 列表原样存档）、`codex_exit_code`、`status`（0 → completed，非 0 / 超时 / KeyboardInterrupt → failed）。
- `--dry-run`：只打印将执行的 argv（展示用），不执行、不改 manifest。
- **`--output-schema`（产品侧已确认）**：以官方 CLI 行为为主；默认**不传**（上游在 codexapi 代理下 502 的实证路径），此开关是显式兼容降级的反向出口——代理修复后用户可加 `--output-schema` 启用协议层校验。SKILL.md 注明这一决策及原因。

### D6 SKILL.md 改写要点（Codex #7）

- **入口预算 ≤1300 tokens**（上游约 2577）：SKILL.md 只保留 frontmatter、问题陈述（3 行）、4 场景表、触发条件、12 步工作流的精简版（step 2/9/10 分别指向三个脚本）、不做的事、模型演进小节；角色分工论证、正反例、隐式触发细则、失败处理明细、pattern extraction 完整纪律下沉 `references/workflow-detail.md`，SKILL.md 内链接。
- 脚本调用一律用 `<skill-dir>` 占位符（仓库规约：$SKILL_DIR 运行时不存在）。
- step 9 → `python <skill-dir>/scripts/run_bundle.py <bundle>`；step 10 → `python <skill-dir>/scripts/validate_bundle.py <bundle> --phase post-response`。
- frontmatter：`category: development-workflows`、tags、`version: 1.0.0`；按类目约定用逗号分隔字符串声明实际需要的 `allowed-tools`；description 覆盖中英触发语境并写清排除边界（见 D8）。
- 治理段：owner（lyh）、review cadence（随模型家族更新检查，至少季度）、output contract（bundle 目录 + 校验通过的 response.json + 综合后的修订产物）、rollback boundary（删 skill 目录 + `just docs-sync` 重新生成文档清单）；telemetry / benchmark 类证据标 `missing evidence`。

### D7 测试：.mjs 驱动 Python（Codex #6）

放弃纯 Python unittest（进不了 CI）。参照 `codex-dynamic-workflows/tests/workflow-scripts.test.mjs` 现成范式：`tests/bundle-scripts.test.mjs` 用 `spawnSync` 调 python 跑三个脚本，`node:test` 断言。

用例矩阵：
- create：正常创建（plan-review）、round 空缺检测、重复目录 exit 3、非法 scenario exit 2、`--model` 覆盖生效；
- 配置层：项目级 `codex-bridge.models.json` 覆盖 model/effort 生效、**含 sandbox 键时被忽略并 WARN**（提升被拒断言）、非法 JSON 配置报错；
- validate preflight：合法骨架填充后 pass；负例 ≥4（缺 conversation.md、{{VAR}} 残留、非法 scenario、files/ 空）；
- validate post-response：无 response.json fail、exit_code null fail、非法 response.json（缺 required / dimension 越界）fail、合法 verification-round response pass；
- run --dry-run：argv 含 `--model` 与正确 sandbox；
- 路径鲁棒性：项目根含空格与非 ASCII（中文）字符的临时目录全流程通过。

### D8 路由边界与 evals（Codex #7）

`evals/evals.json`（git-commit schema，`assertions` 键）：
- 正例：'让 Codex 审一下这个 plan'、'交给 Codex 实现'（→ 本 skill）；
- near-neighbor 负例 ≥2：'帮我编排一个多步 codex 工作流'（→ codex-dynamic-workflows）、'review 一下这段代码的质量'（无 Codex 桥接诉求 → code-quality-review）、'把当前会话交接给下一个 session'（→ handoff）。

description 中显式写排除：不用于通用代码审查、不用于 Claude 内部工作流编排、仅在用户显式要求 Codex 参与时触发。

### D9 上游 R1–R8 处置（Codex #8）

| 上游缺口 | 处置 |
|---|---|
| R1 claude_session_jsonl required 检查 | 吸收：preflight warn 级（兼容手工 bundle） |
| R2 previous_rounds 绝对路径+存在性 | 吸收：preflight 检查 |
| R4 codify uniqueItems 后处理校验 | 吸收：post-response 检查 files_changed 数组去重 |
| R5 codex_command/exit_code 完成后必更新 | 吸收：run_bundle.py 原子更新（D5） |
| R6 files_changed 禁用路径规则 | 吸收：post-response 检查（.codex-bridge/ .git/ node_modules/） |
| R7 --post-response 模式 | 吸收：D4 两阶段 |
| R8 Claude decision log | 延期：属工作流文档约定，v1.1 再议 |
| 真实 codify 端到端测试 | 延期并明示：CI 不调真实 codex；实施完成后手工 smoke 一次，结果记入任务 summary，缺项标 missing evidence |

追踪矩阵：实施 step 5 建 `tests/traceability.md`（上游 sh 检查项 → 本仓库测试用例 ID 一一对应），作为审查门材料。

## 兼容与风险

- **模型名过期**：models.json $comment + SKILL.md 模型演进小节（查官方 models 页更新）。
- **PostToolUse formatter 重排表格**：templates 内容如对齐敏感，写入用 Bash（仓库已知问题）。
- **回滚**（Codex #8 修订）：删除 `skills/development-workflows/codex-bridge/` 目录 **+ 重跑 `just docs-sync`**（同步移除生成的 docs/ 页面与目录清单条目），两步合为 rollback boundary。

## Codex 审阅裁决记录（2026-07-22）

#1 采纳（D0）；#2 采纳（D2：配置/运行时分离 + sandbox 不可覆盖）；#3 采纳（D5 run_bundle.py）；#4 采纳（D4 两阶段）；#5 采纳（verification-round 回归 Sol，Luna 对比标 missing evidence）；#6 采纳（D7 .mjs 驱动）；#7 采纳核心（D6/D8：evals、interface.yaml、1300 token 预算、治理段、yao-meta 四脚本进实施清单）；#8 采纳（round 语义修正、docs-sync 入回滚、D9 处置表）。`--output-schema` 产品决策：官方行为为主、默认不传、显式兼容降级可开关（D5）。
