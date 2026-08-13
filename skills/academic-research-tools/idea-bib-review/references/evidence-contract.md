# Evidence Contract

Load this reference during inventory, evidence mapping, and final audit.

## Independent states

Keep identity, available content, and claim support separate.

- `identity_status`: `input_only`, `metadata_verified`, `metadata_conflict`, or
  `unresolved`.
- `content_basis`: `metadata`, `abstract`, `full_text`, `user_excerpt`, or
  `unavailable`.
- `support_status`: `supported`, `partial`, `conflicted`, `gap`, or
  `unassessed`.

A DOI response or title match may improve identity status. It does not prove
that the source supports a substantive sentence. An approved candidate is also
not scientifically verified merely because the user approved inclusion.

## BibTeX audit

`bib-audit.json` uses schema `1.0` and contains `sources`, `entries`, `errors`,
and `warnings`. Each entry retains the original `citation_key` and records
`entry_type`, `title`, `authors_raw`, `year`, `doi`, `url`,
`identity_status`, `content_basis`, and diagnostics. Comparison may normalize a
DOI, but source text and keys remain unchanged.

Inventory errors include damaged structure, unresolvable macros, duplicate
keys, and case-colliding keys. Duplicate DOI and missing-field diagnostics are
reported explicitly; no entry is silently repaired or dropped.

## Coverage matrix

`coverage-matrix.json` uses schema `1.0` and records one item per atomic idea
node:

```json
{
  "node_id": "N1",
  "section_goal": "Define the mechanism",
  "claim": "The mechanism changes the observed outcome",
  "essential": true,
  "coverage_status": "partial",
  "citation_keys": ["smith2024"],
  "gap_reason": "Only an abstract is available for the quantitative detail",
  "query_id": "Q1"
}
```

Only `supported` enters factual prose at full strength. `partial` requires
weaker wording plus a limitation. An essential `conflicted` or `gap` blocks a
complete final review.

## Claim-evidence ledger

`claim-evidence.json` uses schema `1.0` with a `claims` array. Every claim has:

- `claim_id`, `claim_kind`, exact `draft_span`, and `draft_hash`;
- `citation_keys`, `support_status`, `limitations`, and `is_inference`;
- one evidence object per cited source with `citation_key`, `content_basis`,
  `identity_status`, `locator`, short `excerpt`, `source_url`, and
  `checked_at`.

Deliverable prose requires `metadata_verified` identity for every cited
evidence record. Keep `input_only`, `metadata_conflict`, and `unresolved`
records in the coverage matrix as limitations or gaps until identity is
resolved; content access does not override an identity failure.

Normalize a span as Unicode NFC, trim it, and collapse whitespace to one ASCII
space before computing lowercase SHA-256. The span itself must occur exactly
once in the auditable draft.

Valid claim kinds and minimum evidence are:

| Claim kind | Minimum evidence |
| --- | --- |
| `bibliographic` | `metadata` with `metadata_verified` identity |
| `descriptive` | `abstract`, `full_text`, or `user_excerpt` |
| `quantitative` | `full_text` or a directly relevant `user_excerpt` |
| `causal` | `full_text` or a directly relevant `user_excerpt` |
| `quotation` | `full_text` or a directly relevant `user_excerpt` |
| `synthesis` | At least two sources, `is_inference: true`, and an explicit limitation |

`partial` claims also require an explicit limitation. `conflicted`, `gap`, and
`unassessed` claims are not deliverable support.

## Semantic boundary

The guard checks schemas, citation membership, exact span occurrence and hash,
span-to-citation coverage, evidence identity, non-empty anchors, and minimum
content basis. It cannot
identify every uncited substantive sentence or decide whether an excerpt
semantically entails the prose. Review every sentence separately with the
available source text; record provider or human evidence only when that review
actually ran.
