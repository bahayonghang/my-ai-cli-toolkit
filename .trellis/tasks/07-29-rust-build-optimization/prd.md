# Rust 构建分析与优化 skill

## Goal

将 fasterthanli.me《Why is my Rust build so slow?》的诊断方法与优化手段,结合 2025–2026 现状(Rust 1.90 起 Linux x86_64 默认 rust-lld、Cargo 官方 build-performance 指南、wild 链接器、Cranelift 后端、`-Zthreads` 并行前端、sccache/cargo-chef CI 实践),沉淀为可复用的 agent skill,落地到 `skills/development-workflows/rust-build-optimization/`。

## Requirements

- **任务定位**:当用户抱怨 Rust/cargo 构建慢、要求诊断构建时间、或要求配置构建加速时,skill 提供"先测量、后归因、再按瓶颈选优化"的工作流,产出可直接落盘的 `.cargo/config.toml` / `Cargo.toml` 配置与诊断命令。
- **内容分层**:`SKILL.md` 保持精简(triage → measure → diagnose → optimize 决策树);深度内容放 `references/`。
- **时效性**:反映 2025–2026 现状,标注 nightly-only 与平台限定项,不给过时建议(如不再推荐 zld)。

### 交付物

- `skills/development-workflows/rust-build-optimization/SKILL.md`(frontmatter: name/description/category/tags/version,`allowed-tools` 逗号分隔字符串)
- `references/diagnostics.md` — 测量与归因工具(cargo --timings、-Zself-profile + measureme、-Ztime-passes、rlib/RCGU 底层)
- `references/optimizations.md` — 优化配置手册(链接器、增量、profile 覆盖、workspace 拆分、Cranelift、并行前端、CI/sccache)
- `evals/evals.json` — git-commit schema,含 ≥2 个 routing-negative 用例
- `agents/interface.yaml` — 中性接口文件(display_name/short_description/default_prompt)

### 约束

- 遵守 `skills/AGENTS.md` 与 `skills/development-workflows/AGENTS.md`:description ≤1024 字符、无尖括号、含 use-when 触发词与显式 non-triggers;不使用 `$SKILL_DIR`;无 scripts(纯 advisory/command 工作流是合法形态)。
- 归入现有 `development-workflows` 类别,不发明新目录。
- skill 正文用英文(与套件一致);evals 的 prompt 可中英混合,assertions 用英文。

## Acceptance Criteria

- [ ] `just skills-check` 通过;`just ci`(含 docs-sync/docs-check 如适用)通过。
- [ ] description 覆盖正向触发(build 慢、诊断、加速配置)并排除近邻(运行时性能优化、通用 Rust 编码问题)。
- [ ] 内容包含且正确标注:Rust 1.90 Linux 默认 lld 及回退 flag、mold/wild 平台与成熟度、Cranelift 与 `-Zthreads` 为 nightly、macOS split-debuginfo、CI 关增量/关 LTO 实践。
- [ ] evals.json 含正向路由用例与 ≥2 个 routing-negative 用例。

## Notes

- Lightweight 任务:PRD-only,无需 design.md / implement.md。
