# PRD: 跨平台 codex-bridge skill

## 背景

`ref/repo/codex-bridge`（约 2 个月前的第三方 skill）实现了 Claude Code → Codex CLI 的显式桥接：把对话上下文 / plan / 相关文件外化为 bundle 目录，调用 `codex exec`，用 JSON schema 参考 + 后处理校验读回结构化结果。工作流设计成熟（4 场景、角色分工、pattern extraction、验证轮），但有两个硬伤：

1. **不跨平台**：`scripts/create-bundle.sh`、`scripts/validate-bundle.sh` 是 bash 脚本且重度依赖 `jq`，Windows 原生环境无法使用。
2. **模型硬编码/过时**：完全不指定模型（用 CLI 默认），无法按场景选模型。源仓库时代的 gpt-5.2 / gpt-5.3-codex 在 Codex 中已弃用；当前（2026-07）Codex 模型为 **GPT-5.6 家族**：`gpt-5.6-sol`（深度/细节，官方默认推荐）、`gpt-5.6-terra`（日常主力）、`gpt-5.6-luna`（快速轻量），另有 `gpt-5.5` 仍可用。

## 目标

在 `skills/development-workflows/codex-bridge/` 创建本仓库自己的 codex-bridge skill：

1. **保留源 skill 的工作流精髓**：4 场景（plan-review / codify / review-iteration / verification-round）、bundle 外化、schema 校验、Claude Code 主导 + Codex 补盲的角色分工、2 轮迭代上限、pattern extraction。
2. **全部脚本改为 Python**（仓库已有 `just python-check` 基建），不依赖 bash / jq / GNU 工具；在 Windows（Git Bash / PowerShell / cmd）和 Unix 上行为一致。
3. **按场景可自定义模型**：提供 `models.json`（或等价配置）把 scenario 映射到 model + reasoning effort，脚本生成的 `codex exec` 命令自动带 `--model` / `-c model_reasoning_effort=...`；用户可按项目或按次覆盖。

## 需求

### R0 许可证与来源保留（P1，Codex 审阅新增）
- 上游为 MIT（`ref/repo/codex-bridge/LICENSE`），复制/派生模板与文档必须保留版权与许可文本。
- skill 目录内含 `THIRD_PARTY_NOTICES.md`：上游 URL、提交 `f1a4dec7e5ccdc506bef257e64aefe80a098abb6`、派生文件清单、完整 MIT 文本。

### R1 跨平台脚本
- `scripts/create_bundle.py`：等价复刻 create-bundle.sh 全部行为（scenario 校验、round 自动检测、防覆盖、manifest 初始化、模板复制），路径处理用 `pathlib`，JSON 用标准库。
- `scripts/validate_bundle.py`：等价复刻 validate-bundle.sh 全部检查项（文件存在性、JSON 合法性、manifest 字段、{{VAR}} 残留、files/ 非空、语义检查、verification-round 专用检查 F9–F13、response.json 完整校验），替代所有 jq 调用；支持 `--phase preflight|post-response` 两阶段——post-response 阶段 **必须** 存在 response.json、退出码与完成状态，缺失即 fail（吸收上游 R7 缺口，杜绝"没跑 codex 也校验通过"）。
- `scripts/run_bundle.py`（Codex 审阅新增）：用 `subprocess.run([...], shell=False)` 直接调用 codex exec（stdin 喂 request.md），跨 Git Bash / PowerShell / cmd 无差异；原子更新 manifest 的 `codex_command` / `codex_exit_code` / `status`（吸收上游 R5 缺口）。打印命令仅作 `--dry-run` 展示。
- 输出编码安全：Windows 下 GBK 控制台不乱码/不崩（仓库已知问题：需 PYTHONUTF8=1 或脚本内自行 reconfigure）。
- 不引入第三方依赖（仅 Python 标准库）。

### R2 模型自定义
- skill 内置 `models.json`：每个 scenario 一条默认配置（model + reasoning effort），默认值基于 GPT-5.6 家族；sandbox 不进入任何可覆盖配置，由脚本内置的 scenario 映射固定：
  - plan-review / verification-round（审阅类，read-only）→ `gpt-5.6-sol`
  - codify（编码，workspace-write）→ `gpt-5.6-sol`
  - review-iteration → `gpt-5.6-terra`
  - 场景映射未经输出 eval 验证，标记 missing evidence；Terra/Luna 在验证轮的质量/成本对比留作后续 eval。
- 覆盖机制（优先级从高到低）：用户当次口头指定 > 项目级配置 > skill 默认 `models.json`。
- **安全边界**：项目级与当次覆盖只允许改 `model` / `reasoning_effort`；`sandbox` 永远取自 skill 内置的 scenario 默认值，不可被项目内容静默提升（防止仓库内容把 read-only 升为 workspace-write）。
- 项目级配置文件与运行时 bundle 目录分离：配置放 `<project>/codex-bridge.models.json`（可提交），运行时产物仍在 `<project>/.codex-bridge/`（建议 gitignore），互不影响清理与共享。
- SKILL.md 说明模型名会随时间演进、如何查询当前可用模型并更新 models.json。

### R3 SKILL.md 与文档
- 符合本仓库 skill 规范：顶层 frontmatter `name` / `description` / `category` / `tags` / `version`；`SKILL.md` 为入口。
- 校验步骤（原 SKILL.md step 10 的一串 jq 命令）全部改为调用 `validate_bundle.py`，不再让 Claude Code 手写 jq。
- codex exec 调用统一走 `run_bundle.py`（跨平台闭环）；SKILL.md 不再指导手拼 shell 命令。
- 保留 checklist.md、conventions.md、templates/ 四场景（request.md + response.schema.json + prompt-notes.md），内容按新脚本/模型机制同步修订。
- jsonl-guide.md 中的会话 JSONL 路径说明适配 Windows 路径。
- **`--output-schema` 决策**（产品侧已确认）：以官方 Codex CLI 行为为主；默认不传 `--output-schema`（上游在 codexapi 代理下 502 的实证路径），在 run_bundle.py 提供开关并在文档中写明这是显式兼容降级，未来代理修复后可默认开启。

### R4 路由与治理（P1，Codex 审阅新增）
- `evals/evals.json`（git-commit schema，键用 `assertions`）：正向触发用例 + 至少 2 个 near-neighbor 路由负例（应路由到 `codex-dynamic-workflows`、`code-quality-review` / `code-auditor`、`handoff` 等的请求）。
- `agents/interface.yaml`（参照 codex-dynamic-workflows 现有样式）。
- SKILL.md 入口预算 ≤ 1300 tokens（上游约 2577，需真裁剪：细节下沉到 references/ 或既有文档文件）。
- 治理项（skill 处理源码与会话文件、可启动 workspace-write）：SKILL.md 或随附文档写明 owner（lyh）、review cadence、output contract、rollback boundary；实施期跑 yao-meta 的 validate_skill / resource_boundary_check / trigger_eval / trust_check；telemetry / benchmark 等不可得证据一律标 `missing evidence`，不得编造。

## 明确不做

- 不做 install.sh 的对应物（本仓库 skill 由自身安装机制处理）。
- 不改源 `ref/repo/codex-bridge`（只读参考）。
- 不实现 MCP 封装、不做异步 polling（与源 skill 一致）。
- 不为已弃用模型（gpt-5.2 / gpt-5.3-codex）做兼容。

## 验收标准

- [x] `THIRD_PARTY_NOTICES.md` 含上游 URL、提交 hash、派生文件清单与完整 MIT 文本。
- [x] `python scripts/create_bundle.py plan-review <tmpdir>` 在 Windows 上成功创建 bundle 骨架，manifest.json 合法且含解析后的 model / reasoning_effort / sandbox。
- [x] `python scripts/validate_bundle.py <bundle> --phase preflight` 对合法骨架（填充后）返回 0；`--phase post-response` 在缺 response.json / 缺退出码时返回非 0；负例（缺文件 / 残留 {{VAR}} / 非法 scenario / 非法 response.json）均返回非 0 并列出具体失败项。
- [x] `run_bundle.py --dry-run` 输出的命令包含 `--model <scenario 对应模型>`；改项目级 `codex-bridge.models.json` 后 model/effort 随之变化，但 sandbox 不受项目配置影响（含测试断言）。
- [x] 测试以 `tests/*.mjs` 形式接入 `just node-test`（参照 codex-dynamic-workflows），覆盖：正例、≥4 负例、含空格与非 ASCII 的路径、非法配置、sandbox 提升被拒、post-response 缺响应。
- [x] `evals/evals.json` 含 ≥2 个 near-neighbor 路由负例；`agents/interface.yaml` 存在。
- [x] yao-meta 四脚本（validate_skill / resource_boundary_check --max-initial-tokens 1300 / trigger_eval / trust_check）通过或差异有书面豁免。
- [x] `just docs-sync` 后再 `just ci` 通过。
- [x] 全套脚本零第三方依赖、零 shell 脚本。
- [x] design.md 的上游检查项→测试用例追踪矩阵完成，上游 R1–R8 逐项标注"已吸收/延期"。
