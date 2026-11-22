# Prompt Contract

所有由 `matt-implement-prompt` 编译的新会话实施 Prompt 必须严格满足以下六节结构、指针规范与安全门禁。

## 1. 六节结构契约

1. **任务目标与分支锚点**
   - 明确目标仓库（`<owner>/<repo>` 或项目名，禁止写本机系统用户绝对路径）、基线分支（如 `dev` / `main`），以及建议的集成分支策略（`/implement-spec` 单一集成分支 vs `/implement` 逐票分支）。
   - 明确指出：**先按真源指针实时读取文档与 Issue，不在首回合凭记忆或本 Prompt 猜测需求细节**。

2. **真源指针与依赖波前（Task Graph）**
   - 列出父 Spec 编号/路径及全部子 Ticket 的波次拓扑（Wave 1 无阻塞 → Wave 2 并行集合 → 终审收口票），写清每张票的真实 `blocked_by` 依赖。
   - 对 GitHub Issues 给出精确 `gh issue view <n> --json number,title,body,labels,comments` 与 `gh api repos/<owner>/<repo>/issues/<spec>/sub_issues` 查询方式；对本地追踪器给出 `.scratch/<feature>/issues/` 目录及文件顺序。
   - **严禁把整篇 Issue 正文或源码片段复制粘贴进 Prompt**。

3. **必读顺序**
   - 按「仓库规则（`AGENTS.md`、`code_map.md`、`docs/agents/*`） → 流程技能（`implement-spec`、`implement`、`tdd`、`code-review`、`git-commit` 等） → 实时拉取 Issue 真源」列出明确读取顺序，且只引用当前仓库实测存在的路径。

4. **执行、环境与验证纪律**
   - **波前与隔离**：独立可并行的子票使用独立 worktree/上下文窗口实施并合入集成分支；有依赖的子票必须在前置依赖合入并关单后再启动。
   - **测试驱动与实测门禁**：按 `/tdd` 先写测试与正反例夹具；列出项目真实存在的构建/测试/CI 命令（如 `just ci`、`npm test`、`pytest`），并写明当前会话已观测到的环境前提或避坑方法（例如本机 Python 解释器探测或所需 CLI 版本检查）。
   - **本地提交规范**：只允许使用本地 `git commit -F`（遵循仓库提交语言、trailer 与禁用 `Co-authored-by` / `Made-with` / `Committed via` 规则）。
   - **整支评审**：所有子票合入集成分支后，针对相对基线分支的完整 diff 跑 `/code-review`（Standards + Spec 双轴评审），修完再复跑全量测试。

5. **外部副作用授权与关单协议**
   - 显式声明**已授权**动作清单与前置条件：
     - **远程直接关单（`remote-close`）**：必须在每张子票完成验收与集成分支合入、且 `blocked_by == 0` 后，严格按两步执行：① 使用 UTF-8 临时文件执行 `gh issue comment <n> --body-file <file>`（记录提交 SHA、验证命令与实测结果）；② 再执行 `gh issue close <n>`（不在已关闭单据上用 `close --comment`）。关闭父 Spec 前必须再次核实全部子票均为 `closed`。
     - **PR 自动关单（`pr-close`）**：改为在最终 PR 正文中关联 `Closes #<n>`，不提前手工关闭远程 Issue。
     - **无远程关单（`no-close` / 本地 `.scratch`）**：更新本地票据状态与勾选框，禁止调用 `gh issue close`。

6. **禁止边界与收尾回报**
   - 明确声明默认禁止项（除非用户在后续对话另有明确指令）：禁止 `git push`、禁止擅自合并回主干/开发分支、禁止自动开 PR 或推往外部仓库。
   - 明确交付回报要素：集成分支名、提交历史、测试/CI/评审实测结果、以及各个 Issue/票据的最终状态与链接。

## 2. 强制负向约束

- **零未解析占位符**：不得残留 `{{...}}`、`TODO`、`TBD`、`FIXME` 或未替换的 `<issue-number>` 等尖括号占位符。
- **零脆弱回指**：严禁出现「见上一条消息」「见上方」「如前所述」「see above」「see the previous message」等依赖当前对话历史的表述；新会话拿到的是一份完全独立的上下文。
- **零个人隐私路径**：禁止写入 `C:\Users\<name>\...`、`/Users/<name>/...` 或 `/home/<name>/...`。
