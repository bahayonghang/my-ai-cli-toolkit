# Implement: 跨平台 codex-bridge skill

前置：设计见 `design.md`（含 Codex 审阅裁决）；源参考 `ref/repo/codex-bridge/`（只读）。所有新文件落在 `skills/development-workflows/codex-bridge/`。

## 执行清单

1. [x] **脚手架 + 模板移植 + 许可证**
   - 建目录结构（design.md）；从上游复制 4 场景模板（request.md / response.schema.json / prompt-notes.md），修订提及 bash 脚本、jq、`--output-schema` 的段落。
   - 写 `THIRD_PARTY_NOTICES.md`（上游 URL、提交 f1a4dec7e5ccdc506bef257e64aefe80a098abb6、派生文件清单、完整 MIT 文本）。
   - 验证：结构齐全；grep 无 `create-bundle.sh` / `validate-bundle.sh` / 裸 jq 指引残留；NOTICES 覆盖全部派生文件。

2. [x] **models.json**（design.md D2）
   - sandbox 不入配置；verification-round 默认 `gpt-5.6-sol`；$comment 含更新指引与 missing evidence 标注。
   - 验证：`json.load` 合法；4 scenario 全覆盖。

3. [x] **scripts/create_bundle.py**（design.md D3）
   - round 检测 = 第一个空缺目录（对齐上游 sh 语义）；manifest 含 model / reasoning_effort / sandbox；stderr TODO 指向 run_bundle.py。
   - 验证：临时目录跑 plan-review 成功；重复 round exit 3；非法 scenario exit 2；`--model` 覆盖生效；项目级 `codex-bridge.models.json` 只认 model/effort、含 sandbox 键 WARN 忽略。

4. [x] **scripts/validate_bundle.py**（design.md D4 + D9 吸收项 R1/R2/R4/R6）
   - `--phase preflight|post-response`；post-response 强制 response.json + exit_code + status。
   - 验证：对 step 3 骨架 preflight 应 fail（{{VAR}}、files/ 空、缺 conversation.md）；补齐后 pass；post-response 在无 response 时 fail。

5. [x] **scripts/run_bundle.py**（design.md D5）+ **tests/traceability.md**
   - subprocess shell=False；manifest 原子更新；`--dry-run`；`--output-schema` 默认关。
   - 建追踪矩阵：上游 sh 检查项 → 测试用例 ID。
   - 验证：`--dry-run` argv 含正确 model/sandbox；伪 codex 可执行文件（PATH 注入的 python 假脚本）驱动下 exit_code / status 正确落盘。

6. [x] **tests/bundle-scripts.test.mjs**（design.md D7 用例矩阵）
   - 参照 codex-dynamic-workflows 范式；覆盖正例、≥4 负例、sandbox 提升被拒、post-response 缺响应、空格/非 ASCII 路径。
   - 验证：`just node-test` 全绿（Windows 本机实跑）。

7. [x] **SKILL.md + 文档 + 路由治理**（design.md D6 / D8）
   - SKILL.md ≤1300 tokens，细节下沉 references/workflow-detail.md；`<skill-dir>` 占位符；治理段（owner / cadence / output contract / rollback boundary / missing evidence）。
   - 移植修订 checklist.md / conventions.md（配置-运行时分离说明）/ jsonl-guide.md（Windows 路径）。
   - 写 `evals/evals.json`（≥2 near-neighbor 负例）、`agents/interface.yaml`。
   - 验证：`just skills-check` 通过；yao-meta 四脚本：
     ```
     python <yao-meta-dir>/scripts/validate_skill.py <skill-dir>
     python <yao-meta-dir>/scripts/resource_boundary_check.py <skill-dir> --max-initial-tokens 1300
     python <yao-meta-dir>/scripts/trigger_eval.py --description-file ... --cases ...
     python <yao-meta-dir>/scripts/trust_check.py <skill-dir>
     ```
     不通过项修复或书面豁免。

8. [x] **全量验证**
   - `just docs-sync`（注意：会重生成 docs/，先确认无未提交的 docs 手改）→ `just ci` 通过。
   - 手工 smoke：本仓库根 create → 填最小内容 → preflight pass → run --dry-run → 伪造 response 后 post-response pass。真实 codify 端到端另行手工跑一次，结果记入任务 summary（缺项标 missing evidence）。

## 验证结果（2026-07-22）

- 新增定向测试 18/18 通过；全仓 `just node-test` 134 项中 132 通过、2 项按既有浏览器条件跳过。
- yao-meta：validate/resource/trigger/trust 全部通过；trigger precision/recall 均为 1.0；trust 仅保留“零依赖包无 lockfile”的预期 warning。
- `just docs-sync` 与 `just ci` 通过；VitePress 构建、skill metadata、43 个 Python 文件编译和空白检查均通过。
- 临时目录手工 smoke 的 create → preflight → dry-run → post-response 全链路通过，并确认 Windows 解析到 `codex.CMD`。
- 真实 Codex `codify` 端到端输出质量、成本与延迟仍为 `missing evidence`；未在本任务中发起外部付费调用。

## 回滚点

- 每步独立可回滚；整体回滚 = 删除 skill 目录 **+ 重跑 `just docs-sync`**（清除生成的 docs 条目）。

## 审查门

- step 4/5 完成后：对照上游 validate-bundle.sh 逐检查项核对 traceability.md 无遗漏（尤其 purpose 豁免与 F10–F13）；D9 表 R1–R8 逐项状态确认。
- step 7 完成后：SKILL.md 无 jq/bash 调用指引残留；token 预算实测 ≤1300；description 排除边界与 evals 负例一致。
