# 实施与验证计划

状态：用户已于 2026-09-10 在最终方案后明确要求“开始实施”，任务已启动。本文件是执行清单，不是已通过证据。

## 顺序与所有权

1. 主会话：确认批准覆盖 design.md 中的包升级、旧报告退役、必要引用同步及既有删除派生的 docs 变化；重新检查 `git status --porcelain -uall`。保留 26 项既有删除和所有无关新增文件（本轮后续观察到根 `skills-lock.json` 未跟踪，起始简略 status 未显示，来源未定，不能删除）。
2. 主会话：`task.py validate` 和机械预检通过后，`task.py start .trellis/tasks/09-10-codex-context-improver`。原会话指向的旧任务属于 stale fallback，不修改旧任务。
3. `trellis-implement` 子代理独占：旧/新技能包目录及 design.md 枚举的包外名称引用。读取 implement.jsonl、prd、design、implement；主会话并行只负责 task/spec，不修改同一文件。移动前核对原/目标绝对路径位于 `skills/developer-tools-integrations`、目标不存在；用 apply_patch 手工编辑，保留当前 owner。
4. 实施者先改 description/身份并准备目标域 trigger smoke，确认正反边界，再扩展按需参考和输出样例；保留 1000-token 合约与共享 map fenced 原文。按 design 退役旧报告、生成新证据，不复制旧分数。
5. 实施者完成目标测试、IR/触发报告与研究交付材料后退出；不得自派重叠实现/检查代理。主会话更新 spec 旧名示例及经任务验证的必要约定；不能借此改全局行为规则。
6. 主会话分配 `trellis-check` 独立检查：读取 check.jsonl，检查 R/AC、来源、权限、链接和旧报告一致性；逐例执行/评估输出场景，写 output-review，区分 agent 实际输出、fixture、provider 和人工证据。检查代理可修复范围内缺陷，修改后仅重跑受影响检查。
7. 检查代理独占集成验证与 docs-sync；主会话不同时写生成页。完成后主会话做 diff 归属检查与最终摘要。本批准不含提交、归档、PR、push 或发布。

## 检查命令与判据

命令在仓库根执行；本项目 Windows 使用 `python -X utf8`。遵循当前 RTK 路由，可用 `rtk proxy` 包装支持的外部命令；PowerShell cmdlet 直接运行。以下变量为说明用本地变量，不修改环境全局配置。

```powershell
$contextSkill = 'skills/developer-tools-integrations/codex-context-improver'
$metaScripts = '.agents/skills/qiaomu-meta-skill/scripts'

node --test "$contextSkill/tests/contracts.test.mjs"
python -X utf8 "$metaScripts/export_skill_ir.py" "$contextSkill" --output reports/skill-ir.json
python -X utf8 "$metaScripts/trigger_eval.py" "$contextSkill" --cases evals/trigger_cases.json --output reports/trigger-eval.json
python -X utf8 "$metaScripts/validate_skill.py" "$contextSkill"
just skills-check
```

- 实施时每项命令顺序运行，不能用最后一个 exit code 掩盖前面失败。Node 与 metadata 必须成功；trigger `ok=true`、全部用例有结果。qiaomu validator 原始结果必须保存到任务验证记录，允许且仅允许 `missing required file: README.md` 的已知 schema 差异，绝不宣称该命令通过。额外 warnings 逐项确认，不扩大支持平台声明来消除提示。
- 不需给目标包新增脚本来适配工厂。触发 cases 的领域词表仅为 smoke；人工读取主 eval 断言和实际输出审查是独立验证面。
- 对包与现用引用范围搜索 `agents-md-improver`，只允许说明来源/历史版本的出现。检查目录原入口消失、新入口唯一。排除 archived tasks、journals、第三方研究记录，避免重写历史。
- 输出至少覆盖 PRD 的每项行为边界，报告给出对应 case id 和结果。若未获得实际输出，仅静态检查不能冒充场景通过，须记录对应未通过/未执行证据。

## 本地安装证据

先 `python -X utf8 scripts/install_projects.py --json` 证明 catalog 有新名称且无旧名称。随后用标准临时目录设施创建独占、带任务标识的绝对临时项目：

```powershell
python -X utf8 scripts/install_projects.py --project "$contextInstallProbe" --skill codex-context-improver
```

`$contextInstallProbe` 必须由此次临时目录创建操作返回，不能是用户项目或已有目录。核对 `.agents/skills/codex-context-improver/SKILL.md` 可读且链接目标是新包，记录实际路径/结果；不连接用户全局 skill roots，不改本仓库忽略的运行时链接。清理前核对绝对目录仍是本任务所拥有的临时路径；只清理该路径。

该验证只能证明本地 installer 链路，不能证明远端 `npx skills add` 或 Codex 新会话发现。后两项保留 `missing evidence`，本轮不执行发布 gate 的远端安装。

## 全仓验证与脏状态

```powershell
just docs-sync
just ci
git diff --check
git status --porcelain -uall
```

`just ci` 自带最后的 whitespace check，若 CI 已完整通过无需重复独立执行 `git diff --check`；仅作为失败定位或最终新 Markdown 改动检查。

生成器全量发现、没有过滤参数。同步过程中既有两个已删技能的详情页和 catalog 记录将被移除，计数随之变化；这是本计划明确列入的派生同步。不得将其列为本次主动删除源技能的成果。不手改生成目录、不引入 scoped generator。

本轮确认 `docs/node_modules/vitepress/bin/vitepress.js` 存在，`ensure_docs_deps.py` 此条件下跳过安装。若执行时依赖已缺失，在自动 npm ci 前报告差异，先完成无需安装的目标检查；新增依赖/超出批准范围操作另取授权，不默默安装。全量 CI 未完成时不能宣布完整实现验收通过。

既有失败单独归因。原参数场景检查通过后，只在新修改或未解决风险出现时重跑；不得为了“更完美”增加新的全仓审计。

## 交付与回滚

交付新技能路径、主要行为变化、源文献与参考技能取舍、已执行/失败/跳过检查及证据限制。任务保持未提交的实现状态，提交/归档由后续用户指令决定。

2026-09-10 后续用户已授权全部改动本地提交、弃用技能残留清理与当前任务归档。清理后完成 CI，按工作提交 → 归档 → 会话日志顺序收尾；最终核对归档 context 路径和完整 Git 状态，不推送。

回滚仅撤销本任务包与引用变化，并按当前源目录用生成器更新 docs；保留最初删除、无关文件和任何并发改动，不用 `git reset --hard`、`git clean` 或大范围 restore。
