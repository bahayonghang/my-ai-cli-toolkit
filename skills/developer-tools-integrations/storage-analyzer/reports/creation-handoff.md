# Creation handoff — storage-analyzer 0.1.0

## 1. Result

- Skill: `storage-analyzer` 0.1.0
- Job: read-only macOS/Windows disk hotspot scan, three-light classification, static HTML report; Trash only after this-turn path approval
- Path: `skills/developer-tools-integrations/storage-analyzer/`
- Publication: not published; isolated `npx skills add` install is `missing evidence`

## 2. Reference skills studied

- Local khazix `storage-analyzer` (MIT, 数字生命卡兹克). Lesson: three-light HTML reading flow and loopback allowlist. Mapped to template + optional `server.py`.
- Local `file-sorter`. Lesson: default dry-run, this-turn approval, absolute `--output`. Mapped to SKILL workflow and helper flags.
- Local `windows-dev-process-cleanup`. Lesson: audit-first, injected destructive shims, Windows env traps. Mapped to `--check-allowlist`, `--stub-actions`, GetLogicalDrives, junction skip.

skills.sh listing dated 2026-09-02 (install counts, not quality): Xcode disk cleanup 212, win-disk-cleaner 114, macos-cleaner 86. Source SKILL.md files were not inspected. SkillsMP: `missing evidence`.

## 3. Absorbed and rejected

- Keep: hotspot scan, three lights, HTML report, stdlib Python, RAM exclusion.
- Adapt: static report default, cache prefix table, Windows default roots, HTML `\u003c` inject, Recycle Bin double-NUL buffer.
- Reject: default one-click delete, v1 `rm`, cwd-relative `scripts/` commands, `/tmp` output, merging with process cleanup or file-sorter.
- Invent: `paths.py` prefix enforcement, `--check-allowlist`, `--program-files` test override.

## 4. Advantages

| Label | Claim |
|---|---|
| design advantage | Green trash cannot leave the cache prefix table even if the model lists Documents. |
| design advantage | Static HTML has no delete token. |
| hypothesis | Prefix locks reduce accidental Trash of user documents. Provider comparison is `missing evidence`. |

## 5. Verification and limits

- Node tests: `tests/storage-analyzer.test.mjs`
- House evals: `evals/evals.json` (CI does not execute them)
- Real Recycle Bin, isolated install, provider output comparison, human blind review: `missing evidence`
