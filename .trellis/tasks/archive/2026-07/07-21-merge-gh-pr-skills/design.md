# Design — merge gh-address-comments + gh-fix-ci into gh-pr

## 合并形态

gh-pr 从 4 模式路由扩展为 6 模式:create / review / merge / respond / **address-comments** / **fix-ci**。两个旧技能主流程各自压缩为一个 references 分支;旧目录整体移除。不改变 gh-pr 既有架构(SKILL.md 路由 + references 细节 + scripts 确定性逻辑 + 双评测),新增分支复用共享前置(auth / PR 解析 / 不可信输入 / rtk / token 回退),旧技能步骤 1–3 的重复前置删除。

## 目标目录结构(gh-pr 增量)

```
skills/git-github-collaboration/gh-pr/
├── SKILL.md                        # 重写:6 模式路由 + 三层安全契约 + version 2.0.0
├── LICENSE-upstream.txt            # 新增:迁自旧技能的 Apache 2.0 原文副本
├── NOTICE-upstream.md              # 新增:上游来源与本仓库修改声明
├── references/
│   ├── create|review|merge|respond.md   # respond.md / merge.md 中对旧技能的转介改为内部路由
│   ├── address-comments.md         # 新增:承载 gh-address-comments 步骤 4–8
│   └── fix-ci.md                   # 新增:承载 gh-fix-ci 步骤 4–8 + 原 BACKGROUND.md 手动回退(并入,原文件不保留)
├── scripts/
│   ├── pr_review(.py)              # 已有
│   ├── fetch_comments.py           # 迁入并修复 fork 解析;文件头加 Apache 2.0 来源与修改声明
│   └── inspect_pr_checks.py        # 迁入并修复退出码/四态分流;同上加声明
├── tests/
│   ├── test_pr_review.py           # 已有
│   ├── test_fetch_comments.py      # 新增 focused unittest
│   └── test_inspect_pr_checks.py   # 新增 focused unittest
├── evals/evals.json                # 合并三份夹具
└── agents/interface.yaml           # 更新 short_description
```

## 许可证与资产处理(修订:不得删除许可证)

两个旧技能是上游改编技能,AGENTS.md 明确其保留 `LICENSE.txt` + `assets/` 是有意不对称。迁移其 Apache 2.0 脚本进 gh-pr 后:

- 两份 LICENSE.txt 均为 Apache 2.0 → 在 gh-pr 保留一份为 `LICENSE-upstream.txt`,保持许可证正文原样;另建 `NOTICE-upstream.md` 记录原属 gh-address-comments / gh-fix-ci 上游模板集及本仓库修改。
- 迁移的两个 .py 文件头加简短声明:Apache 2.0 授权、上游来源、"modified in this repository"(满足 §4b 修改声明)。
- assets/(github.png / github-small.svg)仅服务于旧技能的 interface.yaml icon;gh-pr 遵循无 icon 政策 → 不迁移,随目录删除(icon 非许可证必需物)。
- 更新 AGENTS.md 的 License/assets 与 icon 政策段落:gh-pr 变为"仓库许可 + 内嵌上游 Apache 2.0 组件"的混合归属,不再有携带 assets 的技能。

## 脚本合同修复(合并前已存在的失配,纳入本任务范围)

1. **inspect_pr_checks.py 退出码**:现在分析成功且存在失败检查时 `return 1`,而 SKILL 语义是"非零=脚本故障→手动回退"。改为:0=分析成功(无论检查结果),非零仅保留给真实故障;JSON 输出中显式携带 `status: all_green | pending | failures | external_only`,支撑 SKILL 的四分支分流(现脚本无法区分 pending 与全绿,需补)。
2. **fetch_comments.py fork 解析**:`resolve_pr_ref` 用 `headRepositoryOwner/headRepository`,fork PR 会查错仓库。改用 base repository(评审线程挂在 base 仓库)。
3. **回退命令**:`gh pr view --json reviewThreads,comments` 中 `reviewThreads` 在 gh 2.96.0 是无效字段。references 中的手动回退改为已验证可用的命令(实施时以本机 gh 实测为准,如 GraphQL 查询或 `gh api`)。
4. 每项修复配 focused unittest(mock gh 调用,模式参照 test_pr_review.py);不做网络真调用。

## 安全契约设计(核心变更点)

三层授权:

1. **inspect/draft(默认,免授权)**:读取评论/检查、生成摘要与修复计划。
2. **本地代码编辑(计划过目后批量授权)**:address-comments 按用户选定条目修复(>3 文件先确认);fix-ci 按已批准计划修复并本地复跑(max 2 retries)。本地编辑不推送。
3. **GitHub 写操作(维持现契约)**:push / create / approve / merge 逐项授权;回复与 resolve 沿用批量授权规则。

关键边界:address-comments 修完后的回复/resolve 走 respond 分支既有授权流;fix-ci 修完后的 push 是独立高风险授权,不隐式执行。

frontmatter `allowed-tools: Read, Edit, Bash`。

## description 设计

正面触发新增两组:triage/apply review feedback(处理评审意见并修复)与 debug/fix failing PR checks(修复 CI)。删除 gh-address-comments、gh-fix-ci 两条排除;保留 code-auditor / code-quality-review / git-commit / gh-bootstrap / fuck-my-shit-mountain 五条。新增措辞短语化,控制 description 与正文总量(见资源预算)。

## 资源预算(修订:预算门必超,预先定策)

gh-pr 初始加载实测 998/1000 tokens,新增内容后默认门必然失败。两步策略,写死在实施清单里:

1. **先压缩**:重写 SKILL.md 正文时同步压缩既有措辞(路由表合并、安全契约表述精简),目标 ≤1000。
2. **压不下则按 spec 走豁免**:如实记录默认门失败为 `missing evidence`,以书面兼容上限 **1300 tokens** 复跑 `resource_boundary_check.py --max-initial-tokens 1300` 证明资源连通性;豁免理由与数值记入任务 research/。不得把豁免结果表述为"通过默认门"。

## 双评测证据(修订:trigger_eval 不证明内部路由)

- **激活边界**:trigger_eval 只输出整体触发二分类。任务 research/ 下建 trigger_cases.json(should_trigger 合并三技能正例 ≥10 / should_not_trigger ≥8 / near_neighbor 覆盖上述五个近邻)+ semantic_config.json。
- **内部路由**:由 gh-pr `evals/evals.json` 行为夹具承担——每个新分支 ≥2 正例,断言路由到正确 references 分支与授权层;复合流程(如"修完 CI 然后合并")≥1 例。evals.json 不被 CI 执行,人工评审逐条核对并把记录写入任务 research/(可判定、留痕)。
- gh-bootstrap/evals/evals.json 中指向旧技能的断言同步更新。

## 波及面(grep 实测,live 文件)

| 文件 | 处理 |
|---|---|
| gh-pr SKILL.md / references/respond.md / merge.md / evals.json | 本任务主体修改 |
| skills/git-github-collaboration/AGENTS.md | 5→3 清单、allowed-tools 表、License/icon 段落 |
| gh-bootstrap/evals/evals.json | 更新对旧技能的断言 |
| .trellis/spec/guides/skill-authoring-conventions.md | 例证若指向旧技能则换例证(不改规范) |
| docs/ | 生成物,`just docs-sync` 收敛;先确认无未提交 docs 手改 |
| .trellis/tasks/**(含 archive 与本任务) | 历史记录,不改,不计入残留检查 |

## Yao 模式

维持 Production:validate_skill.py、resource_boundary_check.py(含上限策略)、trigger_eval.py;更新 reports/ 两份 profile 覆盖本地编辑风险;不扩展 Governed 资产。

## 任务拆分判断

单一任务,不建父子:description、路由、脚本迁移+修复、evals 合并、许可证迁移、旧目录删除共享同一可发布边界,任何一项单独完成都会留下坏状态(排除已删但旧技能还在 → 双触发;脚本已迁但许可证未随 → 合规缺口)。

## 回滚边界(修订:精确路径,不做宽范围 checkout)

- 旧目录删除 = `mv` 到仓库外备份(pre-bash hook 拦截 `rm -rf`),恢复 = mv 回原位。
- 回滚仅针对本任务触碰的精确清单:`skills/git-github-collaboration/gh-pr/`、`skills/git-github-collaboration/AGENTS.md`、`skills/git-github-collaboration/gh-bootstrap/evals/evals.json`、`.trellis/spec/guides/skill-authoring-conventions.md`。实施前保存逐文件基线补丁与仓库外目录备份;回滚时用反向补丁或 `apply_patch` 恢复本任务修改,不得使用宽范围 checkout。每次回滚前先 `git status -uall` 识别并绕开非本任务改动。
- docs/ 一律用 `just docs-sync` 重新收敛,不 checkout。
- gh-pr 2.0.0 版本号只在全部验收通过后落。
