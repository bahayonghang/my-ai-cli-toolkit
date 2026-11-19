# 按分类安装一方 skills 到本项目

## Goal

在本仓库提供一个本地 CLI：按 `skills/<category>/` 列出一方 skills，允许选择整个分类或单个 skill，把选中项 **live-link** 到当前项目的 agent skills 目录做开发测试。根 `justfile` 增加 `just install-projects` 作为同一入口。

用户价值：改一方 skill 时不必记扁平的 `npx skills add … --skill <name>`，也不必从 GitHub 再拉一份；按本仓库真实分类挑选后，源树改动立刻出现在项目级 agent 目录。

## Background

- 2026-09-02 用户要求类似 `npx skills add` 的分类选择 CLI、Python/Node/Rust 选型、`just install-projects`，并创建 Trellis 任务。
- 公开远程安装仍用 `npx skills add bahayonghang/my-claude-code-settings/skills`。官方 CLI 按 skill name 扁平列出，symlink 指向 canonical `.agents/skills/<name>` 快照，不是本仓库工作树。
- 选型证据：`research/tech-selection.md`。技术边界：`design.md`。

## Confirmed facts

- F1 一方 catalog 为 `skills/<category>/<skill-name>/SKILL.md`。
- F2 权威分类是 `scripts/check.py` 的 `CANONICAL_CATEGORY_SLUGS`（6 个，含 `academic-research-tools`）。docs catalog 标签与之对齐；生成文档当前 6 类 41 skills。
- F3 根 README / README_CN 分类列表缺少 `academic-research-tools`，不能当发现源。
- F4 仓库级可执行代码在 `scripts/`。无根 `package.json`、无 `Cargo.toml`。规范禁止无故新增 `src/` 或给文件 catalog 上框架。
- F5 现有 Python 入口：`scripts/check.py`、`docs/scripts/sync_docs_catalog.py`、`docs/scripts/test_sync_docs_catalog.py`。CI 为 Python 3.12 + PyYAML；`just python-check` 编译 `scripts/**/*.py`。
- F6 `justfile` 的 `python_cmd` 是 `python`。本机 Windows 没有 `python3` 命令。
- F7 `justfile` 现无任何 install 配方。Windows shell 是 PowerShell。
- F8 官方 `skills` 1.5.23 支持本地路径与项目级默认安装；本任务不调用它。
- F9 仓库不再维护 `platforms.toml`；不搬 73-agent dest 全表。
- F10 `.claude/`、`.agents/`、`.agent/`、`.codex/` 等项目级目录已被 `.gitignore` 忽略。
- F11 `.agent/` 与 `.agents/` 同时被忽略。官方 universal 项目路径是 `.agents/skills/`。

## Decisions

- D1 安装语义：项目级 live-link（POSIX symlink；Windows 目录 junction）。不调用 `npx skills add`，不写 canonical 快照。
- D2 默认必定写入 `.agents/skills/<skill>`（目录不存在则创建）。额外只链 allowlist 里已经存在的其他项目级 agent 根。`--agent` 可追加。永不写入 `.agent/`。
- D3 源 catalog 根永远是本仓库。目标项目根 = `--project` 否则进程 CWD。`just install-projects` 在仓库根调用时目标就是本仓。
- D4 语言：Python 3。用户与 just 入口一律 `python`，不使用 `python3` 作为命令名。

## Requirements

- R1 发现：扫描本仓库 `skills/<category>/<skill>/SKILL.md`，按 category 分组。分类以磁盘 + `CANONICAL_CATEGORY_SLUGS` 为准。
- R2 列出：`--list` 打印分类（slug、中文标签、数量）及各类 skill `name`。`--json` 为机器可读。无安装参数且非 TTY 时，`--list` 是合法只读动作。
- R3 选择：TTY 先用 `npx skills` 式分组多选 skills，回车后再选 Agents（默认全选已知 agent，可改）。非 TTY 安装必须给 `--category` 和/或 `--skill`，否则非 0 且不写磁盘。
- R4 安装：对每个选中 skill，在目标项目（D3）按 D2 创建指向源 skill 目录的 live-link。已存在且指向同一源则成功；已存在普通目录或错误目标则拒绝覆盖、非 0、无半安装。
- R5 入口：`just install-projects *args` 调用 `python scripts/install_projects.py`。`just help` 包含该配方。
- R6 失败：坏参数、未知分类/skill、链接失败 → stderr、非 0、无半安装。校验失败不打 traceback。
- R7 测试：stdlib unittest 覆盖发现、分类展开、未知 slug、非 TTY 缺参、`--project` 临时目录里的 junction/symlink、永不写 `.agent/`。`just ci` 不跑交互安装。不 spawn `npx`。
- R8 文档：README / README_CN 写本地分类安装、`just install-projects`、`python scripts/install_projects.py`；补上 `academic-research-tools`。文档站若提到该命令则 `just docs-sync`。

## Acceptance Criteria

- [ ] A1 仓库根 `python scripts/install_projects.py --list` 输出 6 个 canonical 分类及 skill 名，含 `academic-research-tools`。映射 R1、R2。
- [ ] A2 `--category git-github-collaboration` 选中该类全部 skill；`--skill git-commit` 只选一个。未知 slug/name 非 0 且不写磁盘。映射 R3、R6。
- [ ] A3 非 TTY、非 `--list`、且无 `--category`/`--skill` 时非 0，不写磁盘。映射 R3。
- [ ] A4 `just install-projects --list` 与 `python scripts/install_projects.py --list` 一致。`just help` 含该配方。映射 R5、D4。
- [ ] A5 `python scripts/test_install_projects.py`（或同等 unittest）通过；`just python-check` 通过；`just ci` 不依赖交互 TTY。映射 R7。
- [ ] A6 README / README_CN 写明本地分类安装；分类列表含 `academic-research-tools`；命令示例用 `python` 不用 `python3`。映射 R8、D4。
- [ ] A7 `--project <tmpdir> --skill <one>` 后，`<tmpdir>/.agents/skills/<name>` 是指向源 `SKILL.md` 父目录的 symlink/junction；改源文件可经该路径读到。已存在非链接目录不覆盖。映射 R4、D1、D3。
- [ ] A8 默认安装创建 `.agents/skills/<skill>`；不创建 `.agent/skills/`。目标项目没有其他 agent 根时只写 `.agents/skills`。映射 R4、D2。
- [ ] A9 `--project <tmpdir>` 不在进程 CWD 写链接；源路径仍是本仓库 `skills/<category>/<skill>`。映射 R4、D3。

## Out of Scope

- 替代或发布官方 `npx skills` npm 包。
- 从 GitHub 远程安装。
- 全局安装（`-g`）作为默认。
- 桌面 UI（skills-manage / SkillPort）。
- 封装或依赖 `npx skills add`。
- 把 73-agent dest 表搬进 `platforms.toml`。
- 根 npm 包或 Cargo 工程。
- 默认或隐式安装到 `.agent/`。
- 修改 `skills/<category>/<skill>/` 包内容。
- 以 `python3` 作为 Windows/just 调用名。

## Notes

- 复杂任务：`prd.md` + `design.md` + `implement.md`。
- 规划摘要待用户明确批准后才允许 `task.py start`。
