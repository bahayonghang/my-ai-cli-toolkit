# Tech selection: categorized local skills installer

Date: 2026-09-02. Planning evidence. Product decisions landed in `prd.md` D1–D4.

## Problem

Need a repo-local CLI that lists first-party skills by `skills/<category>/`, lets a human pick a category or one skill, and installs the selection into the current project for testing. Also expose `just install-projects`.

## Fundamental truths

- Catalog layout is `skills/<category>/<skill-name>/SKILL.md`. Validators and docs already depend on that (`scripts/check.py`, `docs/scripts/sync_docs_catalog.py`).
- Official `npx skills add` already installs from a local path, defaults to **project** scope (`./<agent>/skills/`), supports `--skill`, `--list`, `-a`, `-y`, `--copy`, and 73 agents. Its picker is **flat by skill name**, not by this repo's category directories.
- Official symlink mode copies/links through a canonical `.agents/skills/<name>` tree. It does **not** keep a live working-tree link to `skills/<category>/<skill>`.
- This repository is a content catalog. Shared operational code lives in `scripts/`. There is no root `package.json` or `Cargo.toml`. CI is Node 20 + Python 3.12 + PyYAML + `just` on ubuntu/macOS/windows.
- Spec forbids a new `src/` tree and forbids a dependency-heavy framework for file-backed catalog work (`.trellis/spec/backend/directory-structure.md`, `quality-guidelines.md`).
- README and `code_map.md` say runtime consumers own install/link target resolution; this repo no longer has `platforms.toml`.
- Windows: `justfile` uses PowerShell; npm shims are `npx.cmd`; Python `subprocess` without `shutil.which` misses `PATHEXT`; SkillPort notes already record that Python calling bare `npx` fails on Windows.

## Language comparison

| | Python | Node | Rust |
|---|---|---|---|
| Fit to this repo | Matches `scripts/check.py` and catalog discovery | Official skills CLI is TypeScript; Node is already on CI | User has SkillPort/PromptHub Rust apps; **this** repo has no Cargo |
| New toolchain | None. PyYAML already installed in CI | Root `package.json` would be a new convention (only `docs/` has npm) | Adds `rustc`/`cargo` to `just check-deps` and the OS matrix |
| Tests | `unittest` next to the script, same pattern as `docs/scripts/test_sync_docs_catalog.py` | `just node-test` only discovers `skills/**/tests/*.mjs` | New `cargo test` recipe |
| Interactive UX | Numbered TTY menu with stdlib. No clack-quality TUI unless we add a dep | Can mimic `@clack/prompts`, but that pulls npm deps into a content repo | Need a TUI crate; overkill |
| Windows | Existing contracts: `shutil.which`, UTF-8 subprocess, junctions | `npx.cmd` already in justfile | Junctions/symlink privileges; SkillPort already solved this **elsewhere** |
| Cost if wrapping `npx skills` | Spawn resolved `npx.cmd` / `npx` with argv list | Same spawn, slightly more natural | Binary wrapping npx is pointless |

Recommendation: **Python 3 stdlib + existing PyYAML**, entrypoint under `scripts/`. Do not add a Node package or a Rust crate to this content repository.

Node would only win if the deliverable were a published npm CLI meant to replace `npx skills`. That is not the request.

Rust would only win if this repo were becoming a shipping binary (SkillPort already is). It would expand CI and violate the current directory contract.

## Installer strategy options

### A. Category front-end, then `npx skills add <catalog> --skill …` (project scope)

Reuse 73-agent destinations, lockfile, symlink/copy, and `-y`. This CLI only groups by category and builds the `--skill` list.

Trade-off: install is a **snapshot into canonical `.agents/skills/`**, not a live view of `skills/<category>/<skill>`. Editing SKILL.md in the catalog does not appear until reinstall. Interactive TUI of official CLI is skipped when we pass `-y --skill`.

### B. First-party live link: agent skill dir → source tree

Create project-local junctions/symlinks such as `.claude/skills/git-commit` → `skills/git-github-collaboration/git-commit`. Best for iterative skill testing.

Trade-off: this repo must own a dest map (or a tiny hardcoded test-agent set). That fights the current "no platforms.toml" rule and reimplements a subset of vercel-labs/skills + SkillPort. Windows junctions vs file symlinks need privilege handling.

### C. Reimplement a full installer

Copy the official dest table into this repo.

Rejected as research: duplicates a 73-agent moving target, contradicts README, and is not needed to list categories.

## `just install-projects`

Proposed shape (not approved):

```just
install-projects *args:
    {{ python_cmd }} scripts/install_projects.py {{ args }}
```

Default in a TTY: list categories, allow category or skill selection, then install into **project** scope (no `-g`). Non-TTY: require `--list`, `--category`, or `--skill` and fail closed.

`justfile` currently has no install recipe; `help` only documents docs/check/ci.

## Evidence anchors

- Catalog discovery: `docs/scripts/sync_docs_catalog.py` `discover_skills()` (SKILL.md under `skills/<category>/<slug>/`).
- Category slugs: `scripts/check.py` `CANONICAL_CATEGORY_SLUGS` (6 slugs, including `academic-research-tools`).
- README category list is stale: it omits `academic-research-tools`.
- Official local add: vercel-labs/skills README `npx skills add ./my-local-skills`.
- Official dest: project default `./<agent>/skills/`; canonical dir `.agents/skills/`.
- Windows npx spawn: `.trellis/spec/backend/skill-helper-command-contracts.md` "Resolve npm CLI shims".

## Decisions recorded 2026-09-02

- Language: Python 3. Invoke with `python`, not `python3` (Windows has no `python3`).
- Install: live-link to `skills/<category>/<skill>`, not `npx skills add`.
- Default dest: project `.agents/skills` (never `.agent`). Extra dests only if that agent root already exists.
- Target project: `--project` or CWD. Catalog root is always this repo.
