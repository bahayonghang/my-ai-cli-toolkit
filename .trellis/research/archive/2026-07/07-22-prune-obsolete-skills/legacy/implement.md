# Implement — 删除 6 个过时 skill

按顺序执行；每步带验证。上下文见 `prd.md` → `design.md` → `research/reference-triage.md`。

## Step 1 — 先修 A 类交叉引用（删除前改，避免中间态断链）

1. `skills/development-workflows/AGENTS.md` — 移除 cold-shower/geju/goudi/handoff/
   implementation-notes；范式示例改指存活 skill（存活集合：code-refactor、codex-bridge、
   codex-dynamic-workflows、html-artifact、spark、unknowns-first）。
2. `skills/developer-tools-integrations/AGENTS.md` — 移除 archive-planning；script-bearing
   示例收敛为 goal-meta-skill。
3. `skills/development-workflows/unknowns-first/SKILL.md` — 行 3 去掉 "(cold-shower)"；
   行 15 删除 cold-shower/implementation-notes 路由句；行 131 收敛为本地
   `references/implementation-notes-template.md`。
4. `skills/development-workflows/html-artifact/evals/README.md` — 约定示例路径改存活 skill。
5. `.gitignore` — 删除 `goudi-workspace/` 行。

**验证**：`git diff` 目测这 5 个文件；仅动到目标行，风格一致。

## Step 2 — 删除 6 个 skill 目录

```bash
git rm -r skills/development-workflows/cold-shower \
          skills/development-workflows/geju \
          skills/development-workflows/goudi \
          skills/development-workflows/handoff \
          skills/development-workflows/implementation-notes \
          skills/developer-tools-integrations/archive-planning
```

**验证**：`git status` 显示 6 目录全部 deleted；目录在工作树消失。

## Step 3 — 重新生成 docs

```bash
just docs-sync
```

**验证**：6 个 skill 的 `docs/skills/**` 与 `docs/en/skills/**` 页被移除；
`docs/.vitepress/generated/catalog.mjs`、`docs/skills.md`、`docs/commands.md` 已更新。

## Step 4 — 质量校验

```bash
just skills-check      # frontmatter 元数据
just python-check      # 编译所有 *.py
just node-test         # 存活 skill 的 node 测试（删除的测试随目录消失）
```

**验证**：三项全绿。

## Step 5 — 残留引用复核

```bash
grep -rniE 'cold-shower|geju|goudi|handoff|implementation-notes|archive-planning' \
  --include='*.md' --include='*.json' --include='*.mjs' --include='*.toml' \
  skills platforms .gitignore 2>/dev/null
```

**验证**：剩余命中只属于 C 类（通用 "handoff"/"implementation" 词）或 D 类历史快照；
无任何指向已删 skill 的「有效引用」。

## Step 6 — 全量 CI

```bash
just ci
```

**验证**：含 `docs-check`（catalog 无漂移）在内全部通过。

## Review gates

- Gate 1（Step 1 后）：交叉引用改动是否精准、无过度重写。
- Gate 2（Step 5 后）：残留命中是否已全部归入 B/C/D，无遗漏悬挂链接。

## Rollback

- 提交前任一步出错：`git checkout -- <paths>` / `git restore --staged <paths>` 还原。
- docs 生成异常：还原 docs/ 后重跑 `just docs-sync`。
