# design.md - idea-bib-review 技术设计

依据：`prd.md`（R1-R17 / A1-A11）、`research/local-boundaries.md`、`research/prior-art-research.md`、`research/evidence-and-search-standards.md`、`research/qiaomu-tooling-compatibility.md`。

## D1 交付边界与任务形态

本任务交付一个内聚 skill 包及其仓库文档。路由、证据契约、审计脚本和 eval 共同定义同一条行为链，不能独立上线，因此不拆父子任务；在单任务内按可回滚阶段实施和验证。

成熟度按 Qiaomu `Governed` 设计，但仓库本地规范优先：公开包保持一个根 `SKILL.md`，不自动发布，不使用账号/密钥，不修改用户原始 `.bib`，只在用户要求时写出新产物。

## D2 包结构

```text
skills/academic-research-tools/idea-bib-review/
├── SKILL.md
├── README.md
├── agents/
│   └── interface.yaml
├── references/
│   ├── evidence-contract.md
│   ├── review-workflow.md
│   ├── search-supplement.md
│   └── quality-rubric.md
├── scripts/
│   └── review_guard.py
├── tests/
│   ├── review-guard.test.mjs
│   └── fixtures/
│       ├── valid-complex.bib
│       ├── invalid-truncated.bib
│       ├── duplicate-and-conflict.bib
│       ├── supported-review.md
│       ├── unsupported-review.md
│       └── claim-evidence.*.json
├── evals/
│   └── evals.json
└── reports/
    ├── skill-ir.json
    ├── trigger-eval.json
    ├── prior-art-research.md
    ├── creation-handoff.md
    └── output-evidence.json
```

不创建空目录、示例根 `SKILL.md`、网络下载脚本或重复模板。`SKILL.md` 只保留触发、状态机、最小命令和输出硬边界；详细判断进入 `references/`。

仓库房规要求 `SKILL.md` frontmatter 是版本唯一事实来源，并要求 `evals/evals.json` 为包内唯一 eval 格式。因此不提交 Qiaomu `manifest.json` 或 `evals/trigger_cases.json`；Qiaomu 专用 trigger cases 保存在本任务 `research/`，生成的结果进入包内 `reports/trigger-eval.json`。工具兼容性见 D10。

## D3 入口与路由

计划中的 description 必须同时覆盖四个概念：

1. 输入包含用户给定的 idea/argument/outline/思路/框架；
2. 输入包含一个或多个 BibTeX `.bib`；
3. 目标是 literature review/related work/文献综述写作；
4. 行为包含 evidence-grounded citation/证据与引用审计。

正向路由要求 1-3 同时成立。只有主题、只有论文、只有 `.bib` 清洗或只有成稿润色均走近邻：

| 请求 | 所有者 |
|---|---|
| 单篇 Zotero/PDF 深读 | `literature-mentor` |
| 多篇论文 intake、归一化、综合或 review outline | `paper-workbench` |
| 开放主题的当前网络调研 | `deep-research-pro` |
| 已有学术正文的语言润色 | `humanizer-paper` |
| 给定思路 + `.bib` 后写可审计综述 | `idea-bib-review` |

如果已触发但缺少 idea 或 `.bib` 的实际内容，只询问一个最高价值缺失输入；不凭主题自行构造 corpus。

## D4 运行状态机

```text
INTAKE
  -> INVENTORIED
  -> EVIDENCE_MAPPED
  -> COVERAGE_READY
       | all essential nodes supported
       v
     DRAFTED -> AUDITED -> DELIVERED

COVERAGE_READY
  -> GAPS_FOUND
       | web forbidden/unavailable
       +-> QUERY_PACK_DELIVERED
       | candidates found
       +-> CANDIDATE_REVIEW_REQUIRED -- stop
              | explicit candidate IDs/keys approved later
              v
          SUPPLEMENT_APPROVED
              -> INVENTORIED -> EVIDENCE_MAPPED -> COVERAGE_READY
```

核心思路节点必须标 `essential: true|false`。任何 essential 节点为 `gap` 或 `conflicted` 时，不得生成假装完整的 final review。可选节点不足时允许交付，但必须在局限/缺口中显式列出。

两阶段策略的硬门：`supplement-candidates.bib` 永远不是 approved corpus。只有用户明确回复 candidate ID/citation key 后，才生成独立 `approved-supplement.bib` 或等价内存集合；不得合并或覆盖原始 `.bib`，且纳入后必须从 inventory 重新运行整条链。

## D5 数据契约

### D5.1 `bib-audit.json`

```json
{
  "schema_version": "1.0",
  "sources": ["references.bib"],
  "entries": [
    {
      "citation_key": "smith2024example",
      "entry_type": "article",
      "title": "...",
      "authors_raw": "...",
      "year": "2024",
      "doi": "10.x/...",
      "identity_status": "input_only",
      "content_basis": "unavailable",
      "diagnostics": []
    }
  ],
  "errors": [],
  "warnings": []
}
```

`identity_status`: `input_only | metadata_verified | metadata_conflict | unresolved`。

`content_basis`: `metadata | abstract | full_text | user_excerpt | unavailable`。身份与内容状态不得合并。

### D5.2 `coverage-matrix.json`

每个思路节点包含：`node_id`、`section_goal`、`claim`、`essential`、`coverage_status`、`citation_keys`、`gap_reason`、`query_id`。

`coverage_status`: `supported | partial | conflicted | gap`。只有 `supported` 可直接进入事实型正文；`partial` 必须降级措辞并写限制。

### D5.3 `claim-evidence.json`

每个最终 claim 包含：

- `claim_id` 与 `claim_kind`；
- 正文中的精确 `draft_span` 及规范化 SHA-256；
- `citation_keys`；
- 每条证据的 `content_basis`、`locator`、短 `excerpt`、`source_url`、`checked_at`；
- `support_status` 与 `limitations`；
- 综合判断的 `is_inference: true`。

`claim_kind`: `bibliographic | descriptive | quantitative | causal | quotation | synthesis`。

完整性分成可机检与语义两层：确定性审计要求每个正文 citation occurrence 落在唯一 ledger `draft_span` 中，并验证所有 ledger span、hash、key 与证据层级；“无引用句是否仍构成实质性 claim”以及 excerpt 是否在语义上支持该 claim，必须由模型或人工逐句复核。没有 provider-backed 或人工证据时，不得把结构审计表述为“已证明所有 claim 均有支持”。

最低证据规则：

| claim kind | 最低证据 |
|---|---|
| bibliographic | `metadata` + identity verified |
| descriptive | `abstract`、`full_text` 或 `user_excerpt` |
| quantitative / causal / quotation | `full_text` 或包含对应内容的 `user_excerpt` |
| synthesis | 至少两个可用来源，且标记 `is_inference` 与限制 |

脚本只能验证结构、键集合、锚点与层级规则，不能证明语义蕴含；语义判断属于模型/人工审阅，缺失时不得宣称“消除幻觉”。

### D5.4 `search-log.json`

每次实际搜索记录 `query_id`、gap、平台/接口、完整检索式、过滤条件、运行时间、returned/screened 数、候选 ID 和错误。未运行路线不出现在 coverage 中，只能列为未覆盖。

候选条目另含 `candidate_id`、临时 citation key、身份状态、内容状态、与 gap 的相关性理由和来源。用户批准通过明确 candidate ID/key 表达，不通过模糊的“看起来不错”推断。

## D6 `review_guard.py`

单一纯标准库 CLI，两个子命令：

```powershell
python -X utf8 "<skill-dir>/scripts/review_guard.py" inventory `
  --bib "references.bib" --output "bib-audit.json"

python -X utf8 "<skill-dir>/scripts/review_guard.py" audit `
  --bib "references.bib" `
  --approved-bib "approved-supplement.bib" `
  --review "review.md" `
  --ledger "claim-evidence.json" `
  --output "review-audit.json"
```

`inventory` 使用保守状态机解析 BibTeX：支持花括号/引号/多行字段、注释、preamble、字符串宏与 `#` 拼接；保留原 key；标准化 DOI 只用于比较，不改写源文件；损坏的括号/引号、无法解析的 entry 和重复 key 必须 fail closed。精确重复、大小写碰撞、重复 DOI 和缺字段分别报告。

`audit` 支持 Markdown/Pandoc `[@key]` 与 LaTeX `\cite{key}`，检查：

- 所有正文 key 属于原始或 approved BibTeX；
- 未批准候选 key 不得出现；
- ledger 的 `draft_span` 在正文恰好出现一次且哈希一致；
- span 内引用与 ledger key 集合一致；
- 每个正文 citation occurrence 都落在唯一 ledger `draft_span` 中；
- claim kind 满足最低证据层级；
- evidence key 能回到 BibTeX inventory；
- `conflicted/gap/unassessed` 不得标为可交付支持；
- unused entry 只作 warning，不自动删除。

脚本不联网、不生成学术结论、不自动修复或合并 `.bib`，也不判定未标记句子的语义类型，以便单元测试确定且不把 API 可用性或结构覆盖误当成语义正确性。

## D7 检索与来源核验

`references/search-supplement.md` 规定：

1. 先按 DOI/稳定 ID 核验身份，再用题名 + 作者 + 年份回退；单一模糊分数不能判定 verified。
2. 优先当前环境真实可用的 Crossref、Europe PMC/PubMed、arXiv、出版方/OA 页面；OpenAlex、Semantic Scholar 等为可选路线，必须记录限流/额度状态。
3. 搜索片段不是证据；必须打开元数据记录或正文来源。
4. 自动搜索只生成候选；不得下载付费全文、绕过访问控制、调用私人登录态或请求 API key。
5. 用户批准后仍需核验身份和内容，批准不是科学真实性证明。

## D8 输出与写作

默认使用用户语言与 Markdown/Pandoc citations。用户可请求 LaTeX 或指定 citation syntax；若目标格式不能被 `audit` 支持，先生成可审计 Markdown 中间稿，再转换，并保留审计产物。

正文必须是跨文献论证而非逐篇摘要。每节明确论证目标、证据、分歧/限制和到下一节的逻辑。综合判断必须标识为作者/系统综合，不把多个来源的并列陈述伪装成已发表共识。

未要求保存时不写文件；对话交付包含正文、证据边界摘要、未覆盖节点和已运行/未运行搜索说明。要求保存时使用用户路径或工作区相对路径，若目标存在则先询问或选新文件名，绝不覆盖。

## D9 测试与评估

### 确定性测试

`tests/review-guard.test.mjs` 通过 Node `spawnSync` 调 Python，使用临时目录并设置 `PYTHONUTF8=1`。覆盖：复杂合法 BibTeX、损坏输入、宏/拼接、Unicode、重复 key/DOI、未知 citation、候选未批准、证据层级不足、hash 漂移、受控正例和提示注入字段作为纯数据。

### 仓库行为 eval

`evals/evals.json` 使用房规 schema，至少：

- 5 个正例：中英文 idea+bib review、gap 搜索停在候选门、批准候选后重跑、仅摘要降级、保存完整审计产物；
- 5 个负例/失败例：单篇精读、多论文通用综合、topic-only research、BibTeX 清洗、已有草稿润色、prompt injection 或假 DOI。

### Qiaomu trigger eval

使用任务内 `research/trigger-cases.json`：

```powershell
python -X utf8 "<qiaomu-meta-dir>/scripts/trigger_eval.py" `
  "<skill-dir>" `
  --cases "../../../.trellis/tasks/08-10-create-idea-bib-review-skill/research/trigger-cases.json" `
  --output "reports/trigger-eval.json"
```

当前 runner 的领域 concepts 已内嵌在 cases JSON，不存在单独 `semantic_config` 参数。该 eval 是词汇路由 smoke test，不证明模型实际选择或输出正确。
`--cases` 和 `--output` 的相对路径都以 skill 根目录解析，因此 cases
路径必须先返回仓库根目录，而报告路径直接写 `reports/...`。

### 输出证据

先使用 synthetic/recorded fixtures 验证确定性契约，`reports/output-evidence.json` 明确 `evidence_kind: recorded_fixture`。它只能证明 fixture 中已枚举 claim 的结构、引用与最低证据层级检查，不能证明任意成稿不存在未标记 claim 或语义误引。provider-backed A/B 和人工 blind review 不在默认实现授权内，保持 `missing evidence`；不得据此宣传“已证明防止幻觉”。

## D10 Qiaomu 与仓库工具兼容

当前 Qiaomu `validate_skill.py` 强制 `manifest.json` 并建议包内 `evals/trigger_cases.json`；其 `release_check.py` 又把任何 validator warning 视为 block。仓库更具体的规则要求 frontmatter 是版本唯一来源、包内 eval 统一为 `evals/evals.json`，因此不能同时零差异满足两套结构。

决策：仓库规则优先，不提交 manifest 或第二套包内 eval。实施时：

- 运行 Qiaomu `trigger_eval.py`、`export_skill_ir.py` 和 `validate_skill.py`；
- 保存 trigger/IR 结果；
- 将 validator 对 manifest/trigger-cases 的预期失败记录为工具兼容性 `missing evidence`，不伪造 PASS；
- 不运行不存在的 `resource_boundary_check.py` / `trust_check.py`；入口隔离由 validator 的递归 `SKILL.md` 检查和仓库测试覆盖，secret scan 使用 `release_check.py` 的现有逻辑若可在临时兼容投影中运行，否则记录缺口；
- 仓库 `just ci` 是最终合入门禁。

`release_check.py --run-tests` 在当前 Windows 实现硬编码 `python3`，且需要 manifest；不把它列为无条件通过标准。任何临时兼容投影只能作为工具行为证据，不能冒充实际包验证。

## D11 归属、版本与报告

- 初始版本：`0.1.0`，唯一权威在 `SKILL.md` frontmatter。
- owner：向阳乔木；README/报告列 X 与 GitHub 链接。
- `reports/prior-art-research.md` 从任务研究压缩转写，保留观察日期、指标语义、commit 和拒绝项。
- `reports/skill-ir.json` 导出后检查 name/version/边界/权限与实际文件一致；若导出器依赖 manifest 而失败，保存明确的兼容性缺口，不手写伪造“已导出”。
- `reports/creation-handoff.md` 区分 design advantage、validated advantage 与 hypothesis。

## D12 回滚与范围

产品变更限定为新 skill 目录、`docs/` 自动同步结果及必要的近邻反向路由句。默认不改 `paper-workbench` 行为；只有 trigger eval 证明必须增加反向路由时，才提出最小 description 追加并在实施中单独复核。

新包可通过删除新增目录并重跑 `just docs-sync` 回滚。现有六个 `.trellis` 更新文件属于用户工作，不得回退、格式化或纳入产品提交。最终 staging 必须使用显式白名单。
