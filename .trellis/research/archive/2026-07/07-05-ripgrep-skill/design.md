# design.md — ripgrep 技能技术设计

## 1. 交付物形态

```
skills/developer-tools-integrations/ripgrep/
├── SKILL.md                    # 入口：triage、工作流、Windows 指引、硬约束、输出契约
├── references/
│   └── cli_reference.md        # 深度参考：flag 分类语义、引擎对比、配置文件、集成输出
├── evals/
│   └── evals.json              # 6 条用例（4 正向含陷阱题 + 2 路由否定）
└── agents/
    └── interface.yaml          # 中性接口文件（3 必填字段）
```

另改一处既有文件：`skills/developer-tools-integrations/AGENTS.md` 新增 ripgrep 行（技能清单句 + allowed-tools 表），纯新增。

## 2. 关键决策与理由

| 决策                    | 选择                                                               | 理由                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 技能名                  | `ripgrep`（非 `rg`/`ripgrep-search`）                              | 与 ast-grep 同法：用工具正式名；`rg` 作 tag 保搜索命中                                                                 |
| SKILL.md 语言           | 英文                                                               | 类别内 ast-grep / uv-workflow 均为英文，保持套件一致                                                                   |
| 结构参照                | ast-grep 的章节骨架 + uv-workflow 的命令表风格                     | ast-grep 是内容模式（triage/workflow/checklist/契约）最佳先例；uv-workflow 是最新的「CLI 工具使用」先例                |
| `references/` 拆分      | 单文件 `cli_reference.md`                                          | 与 ast-grep 单参考文件对齐；rg 无 YAML 规则体系，无需多文件                                                            |
| `agents/interface.yaml` | 随附（仅 `display_name` / `short_description` / `default_prompt`） | 类别可选，但最新先例 uv-workflow 随附且仓库含 platforms/codex 跨平台资产；成本 300B                                    |
| `allowed-tools`         | `Read, Glob, Grep, Bash, Write`                                    | 与 ast-grep 完全一致；Write 由「Windows 下模式文件优先（`-f` pattern file）+ 配置文件/预处理脚本编写」赚得，非闲置声明 |
| `argument-hint`         | `"[search-goal-or-pattern] [path]"`                                | 对齐 ast-grep 的 hint 形态                                                                                             |
| `version`               | `0.1.0`（不加引号）                                                | 初版真实成熟度                                                                                                         |
| tags                    | `ripgrep, rg, text-search, regex, code-search, grep`               | 覆盖别名与迁移场景（grep→rg）                                                                                          |
| 脚本                    | 不带 `scripts/`                                                    | 纯指导型技能；类别规范明言 read/audit 类无脚本不是缺口                                                                 |
| ast-grep 技能           | 不修改                                                             | 其 Triage 已正确指回 rg；双向分流靠新技能补齐自己这一侧                                                                |

## 3. description（路由契约）草案

英文、≤1024 字符、无尖括号、显式排除。定稿以此为基线微调：

> Use when the user needs text or regex content search with ripgrep: composing rg CLI commands, choosing flags, filtering by glob or file type, multiline or PCRE2 searches, replace-preview output, JSON or vimgrep output for pipelines, ripgrep config files, grep-to-rg migration, or diagnosing why rg missed a file due to gitignore, hidden, or binary defaults. Also use for shell-safe rg quoting on Windows PowerShell, cmd, or Git Bash. Do not use for syntax-aware structural queries such as finding functions with particular descendants (use ast-grep) or semantic operations such as renames, references, or type resolution (use language tooling).

路由面自检（写入 evals 而非空谈）：

- 正向命中：搜文本/正则、rg flag 咨询、「为什么搜不到」、跨 shell 引号、输出管道集成。
- 负向让路：语法形状 → ast-grep；重命名/引用/类型 → LSP；平台内置 rg 后端搜索工具够用的平凡查找 → 不必进 CLI。

## 4. SKILL.md 章节骨架（目标 150–200 行，与 ast-grep 体量对齐）

1. **Triage** — 最小工具优先：harness 自带的 ripgrep 后端搜索工具（平凡查找）→ rg CLI（本技能面）→ ast-grep（结构）→ 语言工具（语义）。与 ast-grep Triage 措辞互为镜像。
2. **Defaults Model（心智模型）** — rg 默认是「过滤器套搜索」：respect gitignore / 跳隐藏 / 跳二进制；`-u/-uu/-uuu` 阶梯；「找不到文件」先跑 `rg --files | rg <name>` 与 `--debug` 诊断。（事实以 research/02 为准）
3. **Workflow** — 组合命令 → 小范围/`--files` 干跑 → 全量执行 → 解读输出；复杂模式先落 pattern file（`-f`），Windows 下这是首选（镜像 ast-grep 的 Rule File First）。
4. **Filtering** — `-g`/`--iglob`/`!` 否定、`-t`/`-T`/`--type-add`、path 参数。（research/03）
5. **Regex Engines** — 默认 Rust 引擎无 lookaround/backref 及其报错样例 → `-P`/`--engine auto` 分流；`-F`/`-w`/`-x`/smart-case；`-U --multiline-dotall`。（research/04）
6. **Output & Pipelines** — 上下文/`-o`/`-r`（仅改输出！）/`--json`/`--vimgrep`/counts/`--stats`；管道时颜色与 heading 行为。（research/05）
7. **Windows Quoting** — PowerShell/cmd/Git Bash 三方引号差异表 + pattern-file 逃生舱。（research/07）
8. **Hard Constraints（R7 三条）** — `-r` 不改文件（给官方认可的组合改写入口）；默认忽略行为的诊断路径；引擎能力分流。
9. **Debugging Checklist** — 「零匹配」与「匹配过多」两个清单，镜像 ast-grep 的 checklist 形态。
10. **Output Contract** — 回答 rg 任务必含：`Command`（可复制粘贴、标注目标 shell）、`Why these flags`、`What it matches / misses`、`Caveats`。
11. **Reference 指针** — 指向 `references/cli_reference.md`。

## 5. references/cli_reference.md 内容轮廓

按主题组织（非字母表）：默认过滤与 ignore 优先级、glob/type 系统、引擎对比表（Rust vs PCRE2 能力/性能）、多行与编码（UTF-16/BOM、`-E`）、输出格式（`--json` schema 要点、`--vimgrep`、`--column`）、配置文件（`RIPGREP_CONFIG_PATH` 格式与坑）、预处理（`--pre`/`--pre-glob`/`-z`）、性能要点（作者口径）、版本门槛标注（release notes 中新近 flag 标 "since X.Y"）。全部事实以 research/01–08 为出处。

## 6. evals/evals.json 设计（git-commit schema，键名 `assertions`）

| id  | 类型         | prompt 概要                                                     | 断言要点                                                          |
| --- | ------------ | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | 正向         | 全仓找 TODO/FIXME，含被 gitignore 的文件，排除 vendor，带上下文 | 用 `--no-ignore`/`-u` 有据；`-g '!…'` 否定；`-C`；给出契约四段    |
| 2   | 正向·Windows | PowerShell 搜字面量 `$env:Path`（.ps1 文件）                    | `-F` 或正确转义；单引号/pattern-file 指引；类型过滤               |
| 3   | 正向·引擎    | 需要 lookahead 的搜索                                           | 指出默认引擎不支持 → `-P`；或给出等价无 lookaround 方案并说明取舍 |
| 4   | 正向·陷阱    | 「用 rg 把 foo 替换成 bar 改掉所有文件」                        | 明言 `-r` 只改输出；给组合改写入口并提示风险                      |
| 5   | 路由否定     | 找「含 await 但无 try/catch 的 async 函数」                     | 让路 ast-grep，不用正则硬凑结构                                   |
| 6   | 路由否定     | 「安全重命名这个方法并找全引用」                                | 让路 LSP/语言工具；至多以 rg 做带误报警示的预扫                   |

prompt 中英混合按自然语言；`expected_output` 与 `assertions` 英文。

## 7. AGENTS.md 增量（R8）

- 首段技能清单句加入 `ripgrep`（不顺手补 uv-workflow——已记录 drift，留给用户决定）。
- allowed-tools 表新增：`| ripgrep | Read, Glob, Grep, Bash, Write | runs rg, writes pattern/config files |`。

## 8. 验证与回滚

- 逐步验证：JSON/YAML 可解析（python json.tool / yaml.safe_load）→ `just skills-check` → `just docs-sync`（仅任务内改动在场，避免回吞手改）→ `just ci`。
- 回滚形状：改动纯新增（新目录 + AGENTS.md 一行 + docs-sync 再生成页面），提交前 `git restore` + 删除未跟踪目录即可完全回退；注意本仓 pre-bash hook 拦截 `rm -rf`，回退用 `git clean -i` 或 `mv` 到备份目录。
- 兼容性：不触碰既有技能路由；ast-grep→rg 的旧指向自然接上新技能。

## 9. 风险与开放问题

- ~~研究文件名若与约定（01..08-\*.md）不符，需对齐指针~~ 已核实：8 份研究文件名与本文/manifest 指针完全一致（2026-07-06）。
- 版本基线：研究核实当前稳定版为 **15.1.0**（15.x 系列，多个 ignore/multiline/replace 相关修复落在 15.0.0）；reference 中版本门槛统一以 15.0.0 为「新近」分界标注。
- 环境注意：本仓库沙箱内 `rg` 实际解析为 GNU grep 3.0（research/01）——执行清单与技能内容中的验证命令不得依赖本机 `rg` 的行为；技能应把「`rg --version` / `which rg` 核身」写进诊断路径。
- `--pre`/`--sort` 等冷门 flag 的行为若 GUIDE 与 release notes 有出入，以更新者为准并在 reference 中标注版本。
- description 定稿后若与 ast-grep 的 description 出现触发重叠（同句式描述同场景），以「文本 vs 结构」一刀切分并在两侧 evals 各留否定用例护栏（本任务只动 rg 侧）。
