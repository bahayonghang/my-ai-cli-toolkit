# Prior-Art Research

- Researched: 2026-08-10
- Queries: `literature review bibtex agent skill`,
  `evidence grounded literature review citations`,
  `academic literature synthesis bibtex`, and
  `citation hallucination research writing`
- Catalogs inspected: skills.sh CLI, SkillsMP, GitHub source, and the local skill
  catalog
- Rating evidence: `missing evidence`; installs and repository stars are not
  ratings or quality scores
- Unified Qiaomu runner: `missing evidence` on Windows because its `npx` call
  did not resolve `npx.cmd`; underlying catalog routes were inspected separately

## Inspected candidates

| Candidate | Dated signal | Mechanism adopted | Limit or rejection |
| --- | --- | --- | --- |
| `lingzhi227/agent-research-skills@survey-generation` | 1.3K skills.sh installs, 265 repository stars, updated 2026-08-09; inspected commit `9e6c085d65e313e475e921fdfe795ac11eb7589e` | Closed collected-paper list, post-draft citation validation, coherence editing without citation changes | No detected license, hardcoded home paths, undeclared multi-model/NLI claims, citation generation after prose, and word-count incentives were rejected |
| `bytedance/deer-flow@systematic-literature-review` | MIT; 79,653 repository stars observed 2026-08-10; inspected commit `17531d7c118d6111b863f945ff910a7889a235b0` | Explicit planning, focused queries, no retrieval padding, source-count reporting, thematic synthesis, routing negatives | arXiv-only/abstract-only retrieval, fixed `/mnt` paths, runtime-specific agent ceremony, and unsupported systematic-review naming were rejected |
| `AlterLab-IEU/AlterLab-Academic-Skills` literature review and citation verifier | MIT; 58 repository stars, updated 2026-08-06; literature-review showed 66 skills.sh installs; inspected commit `a0064fd54180541785cd1986ad8eb1689b834270` | Separate reference identity from claim support, compare multiple DOI/title metadata fields, emit unverified offline, record search provenance | Fixed fuzzy thresholds and abstract overlap cannot prove identity or entailment; OpenAlex was not treated as guaranteed keyless access after quota errors in this environment |
| Local `paper-workbench` | Repository neighbor on local `dev`; no external popularity metric applies | Source provenance vocabulary, cross-paper thematic synthesis, explicit gaps, and routing distinction from single-paper reading | Generic paper intake, profiles, deep reading, synthesis artifacts, and outline ownership remain in `paper-workbench` |

## Keep, adapt, reject, invent

**Keep:** an explicit approved corpus, thematic synthesis, citation validation,
and honest retrieval gaps.

**Adapt:** make BibTeX inventory first-class; preserve user keys; split identity,
content access, and claim support; use portable `<skill-dir>` commands and a
standard-library audit; default to narrative/critical review.

**Reject:** prose-first citation generation, single-score identity decisions,
silent retry or padding, proprietary access assumptions, hardcoded host paths,
automatic dependencies, and systematic/exhaustive claims without method
evidence.

**Invent:** the trace `idea node -> approved BibTeX key -> evidence
basis/anchor -> unique draft span`; a four-state coverage matrix; a separate
candidate approval transition; and deterministic occurrence-to-ledger auditing
that preserves the semantic-review boundary.

## Sources

- https://skills.sh/lingzhi227/agent-research-skills/survey-generation
- https://github.com/lingzhi227/agent-research-skills/tree/9e6c085d65e313e475e921fdfe795ac11eb7589e/skills/survey-generation
- https://github.com/bytedance/deer-flow/tree/17531d7c118d6111b863f945ff910a7889a235b0/skills/public/systematic-literature-review
- https://github.com/AlterLab-IEU/AlterLab-Academic-Skills/tree/a0064fd54180541785cd1986ad8eb1689b834270/skills/writing-tools/alterlab-literature-review
- https://github.com/AlterLab-IEU/AlterLab-Academic-Skills/tree/a0064fd54180541785cd1986ad8eb1689b834270/skills/core/alterlab-citation-verifier
