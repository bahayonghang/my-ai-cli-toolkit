# Idea Bib Review

`idea-bib-review` turns a user-supplied argument plus a bounded BibTeX corpus
into a narrative or critical literature review with auditable citation and
claim-evidence artifacts. It preserves citation keys, separates source identity
from content support, and keeps discovered papers outside the approved corpus
until the user selects them explicitly.

Copyright (c) 向阳乔木

- X: https://x.com/vista8
- GitHub: https://github.com/joeseesun/

## Inputs and outputs

Provide an idea, argument, or section outline and one or more local `.bib`
files. Optional inputs include a target language, length, citation syntax,
available abstracts/full text/excerpts, and an output directory.

The conversational result contains the review, evidence boundary, unsupported
idea nodes, and search status. A requested saved run also produces BibTeX and
review audits, a coverage matrix, a claim-evidence ledger, a search log, and
separate candidate or approved supplement files when applicable.

## Install

From a local checkout, install or link the
`skills/academic-research-tools/idea-bib-review` directory using the skill
manager supported by your agent runtime. After this repository revision is
available remotely, a compatible Skills CLI command is:

```bash
npx skills add https://github.com/joeseesun/my-claude-code-settings --skill idea-bib-review
```

Remote publication and clean-install verification are not part of the current
local package evidence.

## 你可以直接这样说

- “按这份论证思路和 `references.bib` 写文献综述，逐条核验引用证据。”
- “Use my outline and two BibTeX files to draft related work; stop for approval
  before citing any newly found papers.”
- “我批准候选 C03，请把它放进独立补充库，重新核验后继续原来的综述。”

Requests that only clean BibTeX, read one paper, search an open topic, compare
papers without a `.bib`, or polish an existing draft belong to neighboring
skills.

## Verification

From the repository root:

```powershell
python -X utf8 "skills/academic-research-tools/idea-bib-review/scripts/review_guard.py" --help
node --test "skills/academic-research-tools/idea-bib-review/tests/review-guard.test.mjs"
just skills-check
just python-check
just node-test
```

The Qiaomu package audit can also be run with:

```powershell
python -X utf8 "<qiaomu-meta-dir>/scripts/validate_skill.py" `
  "skills/academic-research-tools/idea-bib-review"
```

For this repository-compliant package it is expected to block on Qiaomu's
required `manifest.json` and alternate package-local trigger-case convention.
The repository keeps version metadata in `SKILL.md` and behavior evals in
`evals/evals.json`; it does not duplicate either contract to manufacture a
Qiaomu pass.

The guard uses only the Python standard library. Online identity/content checks
depend on read-only sources actually available in the current environment; no
specific API, key, or full-text access is promised.

## Troubleshooting

- **Inventory exits nonzero:** repair the source BibTeX structure or duplicate
  keys explicitly. The guard does not rewrite the source.
- **Only metadata is available:** keep substantive idea nodes as gaps or reduce
  the deliverable to bibliographic statements.
- **A candidate looks relevant:** approve its candidate ID or citation key
  explicitly before it can enter the approved supplement or prose.
- **Audit passes but support still looks wrong:** perform the required semantic
  sentence review. Structural checks cannot prove that an excerpt entails a
  claim.

## Limits

The default output is not a systematic review, meta-analysis, exhaustive search,
or proof that hallucination is impossible. Provider-backed comparison, blinded
human review, full online-route coverage, public release, and clean remote
installation are currently `missing evidence`.

Owner: 向阳乔木. Review after any evidence schema, citation parser, search
approval, or routing change, and at least quarterly while the skill is actively
shared.
