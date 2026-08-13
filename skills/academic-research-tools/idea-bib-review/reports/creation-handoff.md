# Creation Handoff

## Result

- Skill: `idea-bib-review` `0.1.0`
- Job: draft a narrative or critical review from both a user argument and an
  approved BibTeX corpus, with deterministic citation/evidence audit and an
  explicit supplement approval gate
- Location: `skills/academic-research-tools/idea-bib-review`
- Owner: 向阳乔木
- Publication: local repository implementation only; no push, PR, release, or
  remote install was performed
- Review cadence: after evidence schema, parser, approval-state, or routing
  changes, and at least quarterly while actively shared

## Reference skills studied

- `lingzhi227/agent-research-skills@survey-generation`: shortlisted from 1.3K
  skills.sh installs and 265 repository stars observed 2026-08-10; its closed
  paper set and post-draft citation checks informed the approved-corpus and
  audit workflow. Citation-after-prose and word-count incentives were rejected.
- `bytedance/deer-flow@systematic-literature-review`: MIT trust anchor with
  79,653 repository stars observed 2026-08-10; its explicit plan, focused
  queries, source counts, and thematic synthesis informed
  `review-workflow.md` and `search-supplement.md`. ArXiv-only retrieval and
  unsupported systematic naming were rejected.
- `AlterLab-IEU/AlterLab-Academic-Skills`: MIT integrity anchor with 58
  repository stars observed 2026-08-10; separating reference identity from
  claim support informed `evidence-contract.md`. Fixed fuzzy thresholds and
  abstract overlap were rejected as proof of identity or entailment.
- Local `paper-workbench`: its source provenance, thematic synthesis, and gap
  vocabulary were retained. Generic intake, deep reading, synthesis artifacts,
  and review-outline ownership remain there.

Full commits, metric semantics, licenses, and source links are preserved in
`reports/prior-art-research.md`.

## Absorbed and rejected

- **Keep:** explicit approved corpus, thematic synthesis, post-draft citation
  validation, and honest gap reporting.
- **Adapt:** a first-class BibTeX inventory preserves user keys; identity,
  content access, and support are independent states; deterministic logic uses
  only the Python standard library.
- **Reject:** prose-first citation creation, single-score verification, result
  padding, hardcoded host paths, proprietary access assumptions, automatic
  dependencies, and unsupported systematic/exhaustive claims.
- **Invent:** idea-node-to-draft-span traceability, a four-state coverage
  matrix, a separate candidate approval transition, and occurrence-level ledger
  coverage with normalized hashes.

## Advantages and evidence

- **Design advantage:** the router requires the conjunction of supplied idea,
  supplied BibTeX, and review-writing intent, while naming single-paper,
  generic synthesis, topic research, cleanup, and polishing exclusions.
- **Design advantage:** `evidence-contract.md` keeps source identity, available
  content, and claim support independent instead of collapsing them into one
  verified flag.
- **Validated advantage:** `review_guard.py` passed 16/16 recorded fixture tests
  covering conservative parsing, collision diagnostics, inert prompt injection,
  empty-input rejection, Pandoc/LaTeX citations, hash and occurrence coverage,
  verified identities, evidence minima, and the candidate approval gate.
- **Validated advantage:** Qiaomu's lexical trigger smoke test passed 15/15
  task-local positive, negative, and near-neighbor cases. This is routing smoke
  evidence, not model-selection evidence.
- **Hypothesis:** claim ledgers and fail-closed gaps should reduce fabricated or
  overstated review claims. Provider-backed comparison and blinded human review
  are `missing evidence`.

## Verification and limits

- Repository `just ci`: pass, including docs build/catalog check, skill metadata,
  Python compilation, the full Node suite, and `git diff --check`.
- Repository `just skills-check`: pass.
- Focused Node test: 16/16 pass.
- Python compile and CLI help: pass.
- Qiaomu trigger eval: 15/15 pass in `reports/trigger-eval.json`.
- Qiaomu Skill IR: generated, but `version`, `owner`, maturity metadata, and
  package-local trigger buckets are absent because the exporter reads them from
  a Qiaomu `manifest.json` and `evals/trigger_cases.json`. The repository
  contract intentionally uses `SKILL.md` frontmatter and task-local trigger
  cases; IR completeness is `missing evidence`.
- Qiaomu package validation: expected block on absent `manifest.json`; it also
  warns about its alternate package-local trigger-case convention. No duplicate
  manifest or eval format was added to manufacture a pass.
- Qiaomu release check: expected incompatibility; it attempts to read the
  absent manifest before completing its gates. No release was requested.
- Qiaomu release-check secret scanner invoked directly: pass with zero findings.
- `resource_boundary_check.py` and `trust_check.py`: unavailable in the
  installed Qiaomu package, so their results are `missing evidence`.
- Provider/model output comparison, blinded human review, telemetry, full live
  online route coverage, public release, and clean remote install:
  `missing evidence`.

The deterministic audit validates structure and evidence levels only. It does
not prove semantic entailment or detect every uncited substantive sentence.

## Trust, permissions, and rollback

The skill reads user-provided idea, BibTeX, and evidence files; performs only
anonymous read-only verification/search when available; writes new artifacts
only on request; and forbids credentials, access-control bypass, source
overwrites, and execution of embedded evidence instructions.

Rollback removes the new `idea-bib-review` directory and reruns `just docs-sync`
to remove only its generated catalog entries. No existing skill behavior was
changed.
