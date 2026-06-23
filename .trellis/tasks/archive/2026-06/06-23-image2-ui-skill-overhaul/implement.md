# Implement — image2_UI_skill 全面整改

> 路径简写:`SK = skills/developer-tools-integrations/image2_UI_skill`(改名后为 `skills/developer-tools-integrations/image-to-ui-skill`)。
> 所有 `git` 命令用 `rtk proxy git ...` 取地面真相;所有 python 加 `PYTHONUTF8=1`。
> 每个 Phase 结束为一个**审查门 / 提交点**。

## Phase 0 — 基线快照(只读,不改文件)

- [ ] 记录证据基线(见 design.md §0),保存当前 SKILL.md 行数、`check.py --json` 输出。
- [ ] 记录 `SK/.git` 的 `HEAD` commit 与 remote:`rtk proxy git -C SK rev-parse HEAD` / `... remote -v`。
- [ ] 全仓 grep 外部引用:`rg -n "image2_UI_skill" --glob '!**/.git/**'`(改名影响面)。
- 验证:基线数据齐全,改名影响面已知。

## Phase 1 — 去 vendor 化纳管(R1)【阻塞后续】

- [ ] 在 README 顶部加一行 upstream 溯源(URL + Phase 0 记录的 commit)。
- [ ] 删除嵌套 git:`rm -rf SK/.git`。
- [ ] 评估 `SK/.gitignore`:其规则(`demo/*/screenshots/validate-*.png`)合并进父仓库忽略策略或保留为目录级 ignore。
- [ ] `rtk proxy git add SK` 并确认**无** `embedded git repository` 警告。
- 验证(AC1):
  - `rtk proxy git add --dry-run SK` 无 embedded 警告。
  - `rtk proxy git ls-files SK | wc -l` > 0。
- [ ] **提交点 1**:`feat(skills): [AI] vendor image-to-ui-skill into repo`(仅纳管,不掺杂其他改动)。
- 回退点:此提交前可 `rm -rf SK` 重新 clone 还原。

## Phase 2 — 元数据 + 命名合规(R3)

- [ ] 补 frontmatter:`category` / `tags` / `version`(+ 可选 `argument-hint`),按 design.md §3。
- [ ] `git mv SK skills/developer-tools-integrations/image-to-ui-skill`。
- [ ] 改名后修正引用:README 安装路径、Phase 0 grep 命中处、catalog 索引(若有)。
- [ ] 同步 `validate.ps1` 必需文件断言到新结构。
- 验证(AC2 / AC5):
  - `PYTHONUTF8=1 python scripts/check.py <新路径> --json` → `ok:true`,无 `category` 警告。
  - 目录名 == frontmatter `name`。
  - `rg -n "image2_UI_skill"` 无残留(除 upstream 溯源说明)。
- [ ] **提交点 2**:`chore(skills): [AI] align image-to-ui-skill metadata and naming`。

## Phase 3 — fallback 依赖诚实化(R2,路线 A)

- [ ] SKILL.md + `references/image2-entrypoint.md`:把「必须自动备案/确保生成」改为「备案通道前置条件 + 缺失时报错,不得谎称生图」。
- [ ] SKILL.md 增「依赖与前置条件」段:声明 `openrouter-icu-image` / `OPENROUTER_ICU_IMAGE_CLI` 外部依赖。
- [ ] 复核 `scripts/image2_asset.py` 报错文案是否已足够可操作(`_fallback_ready` 已返回 CLI 路径,确认即可,非必要不改逻辑)。
- 验证(AC3):
  - 干净环境跑 `--prefer fallback --dry-run` 观察行为;无凭据时报错指向缺失 CLI / 环境变量。
  - 文档无「无条件已生图」表述(`missing evidence`:无 KEY,不做真实生图回归)。
- [ ] **提交点 3**:`fix(skills): [AI] make image2 fallback claims match actual availability`。

## Phase 4 — SKILL.md 瘦身(R4)

- [ ] 按 design.md §4 建 `references/review-and-gap-check.md`、`integration-rules.md`、`delivery-app-and-web.md`,搬运对应章节。
- [ ] SKILL.md 各章保留一句话规则 + 指针;收敛 `description`。
- [ ] 用 Phase 0 规则清单 diff,确认无规则丢失。
- 验证(AC4):
  - SKILL.md 行数显著下降;`check.py` 仍 `ok:true`。
  - 抽查 3 条被搬规则,均能在 references 找到。
- [ ] **提交点 4**:`refactor(skills): [AI] slim image-to-ui SKILL.md into references`。

## Phase 5 — 资产瘦身 + 孤儿清理(R5 / R6)

- [ ] 统计 `assets/` `demo/` 二进制体积,产出数字。
- [ ] 依 design.md §5 决策矩阵处置 `*.mp4`(默认外链/移出;如随仓分发评估 LFS)——**在进父历史前决定**。
- [ ] 孤儿文档:为 `fashion-shopping-app-case-study.md` / `museum-app-case-study.md` 加引用,或删除。
- 验证(AC7):
  - 无未被引用的 references 文档。
  - `validate.ps1`(`-RunDemos` 可选)在 Windows 通过;必需文件断言与现状一致。
- [ ] **提交点 5**:`chore(skills): [AI] trim image-to-ui assets and fix orphan refs`。

## Phase 6 — 全量验证(R6 / 收尾)

- [ ] `just ci` 全绿(`skills-check` + `python-check` + `node-test` + `git diff --check`)。
- [ ] 复跑 design.md §0 全部基线命令,前后对照填入 check 记录。
- [ ] 逐条勾选 prd.md 的 AC1–AC7。
- 验证(AC6):`just ci` 退出 0。
- [ ] **提交点 6(如有收尾改动)**:`chore(skills): [AI] finalize image-to-ui-skill overhaul`。

## 验证命令速查

```bash
# 跟踪态(地面真相)
rtk proxy git ls-files skills/developer-tools-integrations/image-to-ui-skill | wc -l
rtk proxy git add --dry-run skills/developer-tools-integrations/image-to-ui-skill
# 元数据
PYTHONUTF8=1 python scripts/check.py skills/developer-tools-integrations/image-to-ui-skill --json
# 全量 CI
just ci
# Windows 深度结构校验(可选)
pwsh skills/developer-tools-integrations/image-to-ui-skill/validate.ps1
```

## 评审门总览

P1(纳管)→ P2(元数据/命名)→ P3(fallback 诚实化)→ P4(瘦身)→ P5(资产/孤儿)→ P6(全量验证)。
P1 是硬阻塞:未纳管前的任何编辑同样不入库。各 Phase 独立提交,任一可单独 revert。
