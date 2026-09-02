# storage-analyzer

Read-only disk hotspot analysis for macOS and Windows. The default output is a static HTML report with copyable commands. Moving cache paths to Trash requires this-turn approval of the shown absolute paths.

Upstream idea: khazix-skills `storage-analyzer` (MIT, 数字生命卡兹克). This catalog package changes the default to static reports and disables hard delete.

## Install

Use the repository checkout at `skills/developer-tools-integrations/storage-analyzer/`. Isolated `npx skills add` installation is `missing evidence`.

## Examples

你可以直接这样说：

```text
C盘满了，先出报告不要删
My disk is full, run a storage analysis
清 pip/npm 缓存，列出路径等我确认后再移废纸篓
```

## Commands

```text
python "<skill-dir>/scripts/scan.py" --output <abs-scan.json>
python "<skill-dir>/scripts/build_report.py" <abs-analysis.json> --output <abs-report.html>
python "<skill-dir>/scripts/server.py" <abs-analysis.json> --no-browser
python "<skill-dir>/scripts/server.py" <abs-analysis.json> --check-allowlist
```

On Windows, `py -3` may replace `python`. Do not start `server.py` without this-turn path approval.

## Outputs

Scan JSON, analysis JSON (agent-written), static HTML. Optional loopback report URL after approval. Trash is reversible until the Recycle Bin is emptied.

## Verification

```text
python "<skill-dir>/scripts/scan.py" --help
node --test "<skill-dir>/tests/storage-analyzer.test.mjs"
```

From the repository root: `just skills-check`, `just python-check`, `just node-test`. Qiaomu local package check: `python validate_skill.py <skill-dir>`.

## Troubleshooting

- `--output must be an absolute path`: pass a full path.
- `green trash_paths rejected`: the path is not under `references/cache-prefixes.json` or not under the user home.
- `unsupported_platform`: Linux is out of scope.
- `rm_disabled`: v1 has no hard-delete API.
- Free space did not rise after Trash: empty the Recycle Bin.

## Risks

- Yellow `trash_paths` are model-proposed. The agent must list exact paths and wait for approval.
- Real Recycle Bin execution in CI is `missing evidence`. Tests use `--check-allowlist` and fixtures.
- Classification quality versus a hosted model is `missing evidence`.

## License

MIT. Upstream copyright 数字生命卡兹克; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.
