# matt-implement-prompt

将 Matt Pocock 工作流产出的 Spec 与 Ticket 任务图（GitHub Issues 或本地 `.scratch/` 票据），编译为可直接在全新对话中端到端实施、验证并按两步协议安全关闭远程 Issue 的自包含执行 Prompt。

## 安装

使用 Skills CLI 从本仓库安装：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill matt-implement-prompt
```

或在仓库本地通过项目安装器 live-link 到当前项目：

```bash
just install-projects --skill matt-implement-prompt
```

## 你可以直接这样说

- 「基于 `#55` 和子票 `#56`–`#60`，帮我写一份放到新对话里全自动实施并关闭远程 issue 的 Prompt。」
- 「我已经用 `/to-tickets` 拆好了 `.scratch/auth-flow/issues/`，帮我生成给新会话逐票 `/implement` 的交接提示词。」
- 「帮我生成一个 `matt implement prompt`（或 `matt implement promt`），用 `/implement-spec` 编排这个 spec 的任务图，跑完 CI 和 code-review 再关单。」
- "Compile a self-contained fresh-session prompt to execute Spec `#55` and close remote issues `#56`–`#60` after TDD, code-review, and `just ci` pass."

## 前置依赖

- `git`（只读探测仓库根、当前分支与工作区状态）
- `python` >= 3.10（运行内置零依赖 `scripts/lint_implement_prompt.py`；仅标准库，无需第三方包）
- 可选：`gh` CLI（当项目使用 GitHub Issues 作为追踪器时用于只读拉取父子 Issue 与 `blocked_by` 依赖状态）

## 输出契约与权限边界

- **工作流**：`S0 路由锁 → S1 只读侦察 → S2 最小缺失确认 → S3 编译指针驱动 Prompt → S4 确定性 lint 清零 → S5 单一 text 围栏输出并停止`
- **权威隔离（Payload-not-Execution）**：在当前编译会话内严格只读——**不修改业务代码、不创建/切换分支、不提交代码、不关闭任何远程 Issue**。
- **默认禁止副作用**：生成的 Prompt 默认显式禁止 `git push`、擅自合并主干与自动创建远端 PR，除非用户在当前请求中另有授权；远程关单严格要求「先核对 `blocked_by == 0` → 先 `gh issue comment` 附实测证据与提交 SHA → 再 `gh issue close`」。

## 验证命令

```bash
# 校验生成的 Prompt（stdin 读取 UTF-8）
python skills/development-workflows/matt-implement-prompt/scripts/lint_implement_prompt.py --tracker github --close-mode remote-close -

# 运行包内单元测试
python -m unittest discover -s skills/development-workflows/matt-implement-prompt/tests -v

# 运行 Qiaomu Meta Skill 包门禁与触发评测
python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py skills/development-workflows/matt-implement-prompt
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/development-workflows/matt-implement-prompt --cases evals/trigger_cases.json
python .agents/skills/qiaomu-meta-skill/scripts/release_check.py skills/development-workflows/matt-implement-prompt --phase local --run-tests

# 仓库全量 CI
just ci
```

## Troubleshooting

| 现象 | 原因 | 解决方法 |
| --- | --- | --- |
| `gh issue view` / `gh api` 报错或未登录 | 本机未配置 `gh` 登录态或仓库无网络 | 先执行 `gh auth status` 排查，或按用户显式提供的票据范围降级并明确标注未核实的远程依赖 |
| `lint_implement_prompt.py` 报 `unresolved_placeholder` | 输出中残留 `{{...}}`、`TODO`/`TBD` 或尖括号占位符 | 将所有仓库名、分支名、票号和验证命令替换为实际侦察值后重新校验 |
| `lint_implement_prompt.py` 报 `back_reference` | 正文出现「见上一条消息」「如前所述」「see above」等脆弱回指 | 将关键指向改写为具体的 Issue 编号、文件路径或读取命令 |
| 默认 `python` 执行仓库 `just ci` 报缺少 `yaml.safe_load` | 系统默认 `python` 缺少完整 `PyYAML` 安装 | 探测本机其他含 `PyYAML` 的解释器（如 `py -3.14`）并在当前命令会话的 `PATH` 中临时前置使用，不要强改全局环境 |
| 波前所有子票 `blocked_by > 0` | 存在环状依赖或前置票尚未关闭 | 暂停编译并把真实阻塞链反馈给用户，先理清前沿可开工票据 |
