# Prior-art research — storage-analyzer 0.1.0

Date: 2026-09-02

## Queries

- storage analysis disk cleanup skill
- Windows disk usage cache cleanup SKILL.md
- disk full HTML report agent skill

## Catalogs

skills.sh (`npx.cmd --yes skills find "disk cleanup storage analysis"`, 2026-09-02). Install counts are adoption metrics, not quality scores. None of these packages were opened beyond the catalog listing in this task:

| Package | Installs |
|---|---:|
| avdlee/xcode-disk-cleanup-agent-skill@xcode-disk-cleanup | 212 |
| orzcls/win-disk-cleaner@win-disk-cleaner | 114 |
| julianobarbosa/claude-code-skills@macos-cleaner | 86 |
| choism4/macos-disk-cleanup@macos-disk-cleanup | 46 |
| efoo-team/skills@cleanup-storage | 24 |

Closest Windows-oriented listing: `orzcls/win-disk-cleaner`. Closest macOS cache cleaners: Xcode/macos-disk-cleanup. This import keeps the khazix three-light HTML report and does not copy those packages.

SkillsMP: not run. `missing evidence`.

## In-repo anchors (inspected)

- `file-sorter`: review-before-mutate, `--execute` gate, prefix/root safety.
- `windows-dev-process-cleanup`: audit first, WhatIf, no registry mutation, fixture tests.
- Source package `ref/repo/khazix-skills/storage-analyzer`: three-light HTML report and optional loopback trash API.

## Keep / adapt / reject / invent

See `reports/creation-handoff.md`. External popularity metrics were not used as quality scores.

## Missing evidence

- skills.sh install counts and SkillsMP stars for a dedicated storage-analyzer skill, if the live catalog call failed or returned no dedicated match.
