# Darwin Scorecard

Date: 2026-04-15  
Scope: `content/skills/research-learning-knowledge/*/SKILL.md`  
Eval mode: `dry_run`

## Summary

| Skill | Before | After | Delta | Weakness Before | Main Improvement |
| --- | ---: | ---: | ---: | --- | --- |
| deep-research-pro | 62 | 84 | +22 | Host-specific paths and unclear portability | Environment-neutral workflow and sourcing contract |
| knowledge-absorber | 69 | 86 | +17 | Over-reliance on host-specific prompt/runtime assumptions | Clear ingestion modes, host-specific guardrail, explicit fallback |
| learn | 84 | 88 | +4 | Ambiguous concept selection and save behavior | Added concept extraction and no-save branch |
| memory-system | 72 | 86 | +14 | Weak human-readable contract and cleanup semantics | Added output contract, path rules, cleanup clarification |
| paper-workbench | 84 | 90 | +6 | Routing and edge-case defaults too implicit | Stronger mode defaults and profile-light handling |
| paper2code | 78 | 89 | +11 | Implicit install and weak failure gating | Added dependency gate, honesty rules, stage-level stop conditions |
| plain | 86 | 89 | +3 | Multi-input scope and save behavior implicit | Added scope control and no-save branch |
| rank | 83 | 87 | +4 | Applicability and “未定” exit under-specified | Added applicability and honesty constraints |
| roundtable | 88 | 91 | +3 | Fictional-person handling and one-shot mode implicit | Added participant guardrails and one-shot full discussion branch |
| word | 84 | 89 | +5 | Sense disambiguation and example quality too loose | Added context-aware sense lock and natural example requirement |
| word-flow | 80 | 88 | +8 | Dependency and failure handling incomplete | Added dependency gate, partial completion, honest path reporting |

## Dimension Notes

Scoring rubric follows `darwin-skill`:

1. Frontmatter quality
2. Workflow clarity
3. Boundary coverage
4. Checkpoint design
5. Instruction specificity
6. Resource integration
7. Overall architecture
8. Tested performance

All scores here are `dry_run` scores derived from structure review plus
prompt-walkthrough simulation, not sub-agent A/B execution.

## Overall Change

- Average before: `79.1`
- Average after: `87.9`
- Average delta: `+8.8`
- Largest gain: `deep-research-pro` (`+22`)
- Smallest gain: `plain`, `roundtable` (`+3`)

## Read Together With

- [darwin-results.tsv](/D:/Documents/Code/Agents/my-claude-code-settings/content/skills/research-learning-knowledge/darwin-results.tsv)
- [darwin-optimization-report.md](/D:/Documents/Code/Agents/my-claude-code-settings/content/skills/research-learning-knowledge/darwin-optimization-report.md)
