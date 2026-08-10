# Prior-Art Research

- Researched at: 2026-08-10
- Queries: `literature review bibtex agent skill`; `evidence grounded literature review citations`; `academic literature synthesis bibtex`; `citation hallucination research writing`
- Catalogs: skills.sh CLI, SkillsMP, GitHub source
- Rating evidence: unavailable; installs and repository stars are not ratings
- Unified runner: failed on Windows because `research_prior_art.py` invoked `npx` instead of `npx.cmd`; underlying catalog calls were run separately. The missing merged JSON is `missing evidence`.

## Shortlist

| Candidate | Role and dated signal | Inspected source | Keep/adapt | Reject/limit |
|---|---|---|---|---|
| `lingzhi227/agent-research-skills@survey-generation` | Popularity anchor; 1.3K skills.sh installs observed 2026-08-10; repository 265 stars and updated 2026-08-09 | GitHub commit `9e6c085d65e313e475e921fdfe795ac11eb7589e` | Preserve a closed collected-paper list, validate citations after drafting, and run coherence editing without changing citations | No detected repository license, hardcoded home paths, undeclared multi-LLM/NLI claims, generated BibTeX after writing, and minimum-word-count incentives are not adopted |
| `bytedance/deer-flow@systematic-literature-review` | Trust anchor; ByteDance repository, MIT, 79,653 GitHub stars observed 2026-08-10; SkillsMP catalog result | GitHub commit `17531d7c118d6111b863f945ff910a7889a235b0` | Explicit planning, short focused queries, no padding when retrieval is thin, source-count reporting, thematic synthesis, and routing negatives | arXiv-only retrieval, abstract-only extraction, fixed `/mnt` paths, runtime-specific subagent rules, and calling the result systematic without a complete protocol do not fit this skill |
| `AlterLab-IEU/AlterLab-Academic-Skills` literature review + citation verifier | Complementary integrity anchor; MIT, 58 GitHub stars, updated 2026-08-06; literature-review had 66 skills.sh installs | GitHub commit `a0064fd54180541785cd1986ad8eb1689b834270` | Separate reference existence from claim support, cross-check DOI/title metadata, emit `unverified` offline, record search/screening provenance, and distinguish abstract/full-text evidence | Fixed fuzzy thresholds cannot prove identity alone; abstract lexical overlap/NLI cannot prove full-text entailment; claimed keyless OpenAlex availability is currently false in this environment due exhausted paid budget; biomedical PRISMA workflow is not the default |
| Local `paper-workbench` | Nearest repository neighbor; no external popularity metric applicable | `skills/research-learning-knowledge/paper-workbench/` at local `dev` | Reuse normalized vocabulary for source provenance, cross-paper thematic synthesis, explicit gaps, and review-vs-single-paper routing | Do not duplicate its generic paper intake, profile workflow, deep reading, synthesis artifacts, or outline ownership |

## Contribution ledger

### Keep

- Constrain citations to an explicit approved corpus.
- Synthesize thematically rather than serially summarizing papers.
- Validate citation keys and metadata after drafting.
- Report retrieval gaps and do not pad results.

### Adapt

- Replace “paper list” with a first-class BibTeX inventory that preserves the user's citation keys.
- Split existence verification from claim support and record evidence level per claim.
- Use repository-portable `<skill-dir>` commands and standard-library scripts.
- Apply narrative-review quality criteria by default; method-driven reporting is opt-in and evidence-gated.

### Reject

- Creating citations after prose has already been written.
- Treating DOI resolution, title similarity, citation count, or abstract keyword overlap as semantic support.
- Silent retries, result padding, hardcoded host paths, automatic dependency installation, proprietary access assumptions, or broad claims of exhaustive/systematic coverage.
- Multi-agent or multi-LLM ceremony without an independently testable need.

### Invent

- `idea -> atomic claims -> approved BibTeX keys -> evidence level/anchor -> draft sentence` as the central traceability path.
- A four-state idea coverage matrix (`supported`, `partial`, `conflicted`, `gap`) that may block or weaken prose before drafting.
- Separate `supplement-candidates.bib` from the user corpus, with an explicit approval transition.
- A deterministic final audit that cross-checks review citation keys, BibTeX inventory, claim ledger, and evidence-level sufficiency while admitting that semantic entailment still requires model/human judgment.

## Advantages and evidence status

- Design advantage: the name and trigger require both the user argument and `.bib`, reducing overlap with generic literature-search/review skills.
- Design advantage: identity, content access, and semantic support are separate states instead of one “verified citation” flag.
- Hypothesis: claim-level ledgers and fail-closed gap handling should reduce fabricated or overstated review claims, but provider-backed A/B and human blind review are `missing evidence` until implementation evals run.

## Source links

- https://skills.sh/lingzhi227/agent-research-skills/survey-generation
- https://github.com/lingzhi227/agent-research-skills/tree/9e6c085d65e313e475e921fdfe795ac11eb7589e/skills/survey-generation
- https://github.com/bytedance/deer-flow/tree/17531d7c118d6111b863f945ff910a7889a235b0/skills/public/systematic-literature-review
- https://github.com/AlterLab-IEU/AlterLab-Academic-Skills/tree/a0064fd54180541785cd1986ad8eb1689b834270/skills/writing-tools/alterlab-literature-review
- https://github.com/AlterLab-IEU/AlterLab-Academic-Skills/tree/a0064fd54180541785cd1986ad8eb1689b834270/skills/core/alterlab-citation-verifier
