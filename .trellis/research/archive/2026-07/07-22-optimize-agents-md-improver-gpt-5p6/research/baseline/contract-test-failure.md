# 1.1.0 contract-test failure

Command:

```powershell
node --test `
  'skills\developer-tools-integrations\agents-md-improver\tests\contracts.test.mjs'
```

Expected baseline result: fail (`7` tests, `2` passed, `5` failed).

Confirmed failures:

1. Entry-point estimate was `2641 > 1000` tokens.
2. Active guidance still contained the stale repo skill root and lacked the
   current discovery reference.
3. `agents/interface.yaml` lacked the Production compatibility contract and no
   `manifest.json` existed.
4. `references/report-format.md` lacked the prioritized evidence/proposed-diff
   contract.
5. The new Codex semantics reference and focused quality reports did not yet
   exist or link from `SKILL.md`.

Confirmed passing fixture infrastructure:

- repo/output eval JSON parsed and covered the planned route boundaries;
- existing root and nested shared `code_map.md` fenced blocks were
  byte-identical to `claude-md-improver`.

This is the intended red phase. The test was rerun after fixing its frontmatter
parser so Markdown table separators could not truncate the measured body.
