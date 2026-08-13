# Review Workflow

Load this reference at intake and return to it after any supplement approval.

## State machine

```text
INTAKE -> INVENTORIED -> EVIDENCE_MAPPED -> COVERAGE_READY
  -> DRAFTED -> AUDITED -> DELIVERED

COVERAGE_READY -> GAPS_FOUND
  -> QUERY_PACK_DELIVERED                         (search unavailable/forbidden)
  -> CANDIDATE_REVIEW_REQUIRED                    (candidates found; stop)
  -> SUPPLEMENT_APPROVED -> INVENTORIED           (explicit IDs/keys only)
```

The approved supplement transition always restarts inventory, identity/content
verification, evidence mapping, coverage, drafting, and audit. Keep original,
candidate, and approved BibTeX sources separate.

## Intake and decomposition

1. Confirm the user supplied an argument or outline and at least one `.bib`.
   Ask for only the highest-value missing input.
2. Record language, target length, output format, citation syntax, network
   constraints, and save path when explicit. Default to the user's language and
   Markdown/Pandoc citations.
3. Convert the argument into ordered atomic nodes. Each node needs one section
   goal, one claim or question, and `essential: true|false`.
4. Inventory all input BibTeX. Fail closed before drafting if the corpus cannot
   be parsed or citation keys are ambiguous.

## Evidence mapping

For every node, list candidate input keys, verify identity where possible, and
inspect only lawfully available abstracts, full text, or user excerpts. Store a
short locator/excerpt rather than copying copyrighted text wholesale.

Assign `supported`, `partial`, `conflicted`, or `gap`. Use `partial` only when a
weaker claim is defensible. Preserve real disagreements as `conflicted`; do not
average them into false consensus.

## Drafting

Draft only after every essential node is `supported`. Organize by the supplied
argument, not one paragraph per paper. Each section should establish its goal,
integrate evidence across sources, expose disagreement or limitations, and
make the transition to the next idea node explicit.

Mark synthesis as the review's inference. Keep claim spans compact enough that
each citation occurrence belongs to one ledger claim and each span is unique in
the draft. Unsupported optional nodes appear in limitations rather than factual
prose.

## Audit and delivery

Run the deterministic guard, fix structural failures, and rerun until it exits
zero. Then perform sentence-level semantic review against the recorded excerpts
or source text. A script pass is reported as structural evidence only.

If the target citation format is unsupported by the guard, first produce and
audit a Markdown/Pandoc intermediate draft, then convert it while retaining the
audited source and artifacts.

Persist only on request. When the target exists, ask before replacement or use
a new filename. The original `.bib`, candidate list, and existing draft remain
immutable inputs.
