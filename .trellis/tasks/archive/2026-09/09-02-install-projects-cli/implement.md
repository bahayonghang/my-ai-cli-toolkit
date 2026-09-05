# Implement: categorized live-link installer

## Checklist

1. Add `scripts/install_projects.py`
   - argparse: `--list`, `--json`, `--category`, `--skill`, `--project`, `--agent`
   - discover `skills/<category>/<slug>/SKILL.md` using `CANONICAL_CATEGORY_SLUGS`
   - TTY numbered menu; non-TTY fail closed without selection flags
   - dest resolution per `design.md` (always `.agents/skills`, never `.agent`)
   - POSIX symlink / Windows `cmd /c mklink /J` with `shell=False`
   - no half install: revert this-run links on failure
   - user-facing strings and help use `python`, not `python3`
2. Add `scripts/test_install_projects.py`
   - unittest + `TemporaryDirectory`
   - discovery of real catalog (list contains `academic-research-tools` and `git-commit`)
   - unknown category/skill → nonzero, dest tree unchanged
   - `--project tmp` installs only under tmp `.agents/skills/<name>` pointing at source `SKILL.md`
   - does not create `.agent/`
   - CWD vs `--project` isolation
   - Windows junction follow-read; POSIX symlink follow-read
3. Root `justfile`
   - `install-projects *args` → `{{ python_cmd }} scripts/install_projects.py {{ args }}`
   - `install-projects-test` → `{{ python_cmd }} scripts/test_install_projects.py`
   - include `install-projects-test` in `just ci` after `python-check`
   - `help` text
4. README.md + README_CN.md
   - local classified install
   - `just install-projects` / `python scripts/install_projects.py`
   - add `academic-research-tools` to the category list
5. If generated docs mention install commands, run `just docs-sync`. Do not hand-edit generated pages.

## Validation

```text
python scripts/install_projects.py --list
python scripts/test_install_projects.py
just install-projects --list
just install-projects-test
just python-check
just ci
git status --porcelain -uall
```

Windows extra: `just install-projects --skill git-commit` then confirm `.agents/skills/git-commit` is a junction to `skills/git-github-collaboration/git-commit`.

## Risky files / rollback

- `justfile` — `ci` step count / help strings. Revert recipe if CI grows a TTY dependency.
- README* — keep remote `npx skills add` instructions; only add a local section.
- Do not touch `skills/**` packages.
- Failed install must not leave `.agent/` or half-linked dests.

## Before task.py start

- PRD/design/implement reviewed.
- User explicitly approved the latest planning summary.
- Then `python ./.trellis/scripts/task.py start`.
