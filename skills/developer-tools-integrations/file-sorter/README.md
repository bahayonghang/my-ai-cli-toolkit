# file-sorter

Review-first helper for categorizing and renaming files in one local folder. Default output is a dry-run plan. Moves happen only after the user approves the shown `plan_id`.

This package re-expresses sorting rules from [hyperfield/ai-file-sorter](https://github.com/hyperfield/ai-file-sorter) (AGPL-3.0). It is not that desktop application and does not use its trademarks.

## Install

This catalog skill is used from the repository checkout. Point the host at `skills/developer-tools-integrations/file-sorter/`. Isolated `npx skills add` installation is `missing evidence`.

## Examples

```text
帮我整理 D:\Inbox，先出计划再移动
Suggest renames for pictures in D:\Inbox\pics, do not make category folders
Execute plan_id abcd after I approve that plan
```

## Commands

```text
python "<skill-dir>/scripts/file_sorter.py" scan --root <abs> [--recursive]
python "<skill-dir>/scripts/file_sorter.py" assemble-plan --scan scan.json --proposals proposals.json
python "<skill-dir>/scripts/file_sorter.py" apply --plan plan.json
python "<skill-dir>/scripts/file_sorter.py" apply --plan plan.json --execute
python "<skill-dir>/scripts/file_sorter.py" undo --undo plan.undo.json --execute
```

`--execute` is a mutation. Do not pass it without this-turn approval.

## Outputs

JSON on stdout (UTF-8). Optional `--output` writes the same document. Apply `--execute` writes `plan.undo.json` beside the plan when at least one move succeeded.

## Verification

```text
python "<skill-dir>/scripts/file_sorter.py" --help
node --test "<skill-dir>/tests/file-sorter.test.mjs"
```

From the repository root: `just skills-check`, `just python-check`, `just node-test`.

## Troubleshooting

- `root must be an absolute path`: pass a full path, not `Downloads`.
- `ok_to_scan` is false: the folder is a protected project root (Git, Node, Python, …). Choose a clutter folder instead.
- `source size or mtime drifted`: the file changed after the plan; scan again.
- `destination already exists`: the helper will not overwrite; rename or move the occupant first.

## Risks

- Moves can fail after a partial run. Use the undo sidecar for completed entries only.
- Git, Node, Python, and other project roots are skipped so relative project files stay put.
- Classification quality versus a hosted model is `missing evidence`.

## License

Skill package: MIT, Copyright (c) 向阳乔木. Upstream rule source: AGPL-3.0, see `THIRD_PARTY_NOTICES.md`.
