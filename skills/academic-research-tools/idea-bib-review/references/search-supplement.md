# Search Supplement

Load this reference only when the coverage matrix contains a gap or unresolved
identity. Search is read-only and produces candidates, never automatic corpus
membership.

## Verification order

1. Resolve a supplied DOI or stable identifier and compare title, authors, and
   year.
2. Without an identifier, search the title plus author and year; require
   agreement across multiple metadata fields rather than one fuzzy score.
3. Retrieve abstracts or full text only from lawful accessible sources or
   user-provided files.
4. Keep failures, timeouts, rate limits, quota errors, and no-result routes as
   `unresolved` or `unavailable`.

Use sources actually reachable in the current environment, such as Crossref,
Europe PMC/PubMed, arXiv, and publisher or open-access landing pages. OpenAlex,
Semantic Scholar, and other services are optional routes whose current quota
or availability must be logged. Search snippets are discovery data, not claim
evidence.

## Gap-to-query record

For each gap, create 2-4 concept groups with synonyms or controlled terms,
exclusions, scope qualifiers, and a portable Boolean query. Add database-specific
variants only for databases actually named. Recommend date or field filters
with a rationale.

Each executed search-log item records:

- `query_id`, gap, platform/interface, complete query, and filters;
- run time, returned count, screened count, candidate IDs, and errors.

Do not list a route as searched unless it ran. If web access is forbidden or
unavailable, deliver the query pack and mark every route unrun.

## Candidate approval gate

Each candidate records a stable `candidate_id`, temporary citation key,
identity and content states, relevance rationale, and source. Put candidate
BibTeX in `supplement-candidates.bib`, separate from every input file.

Stop after presenting candidates. Only an explicit reply naming candidate IDs
or citation keys authorizes an `approved-supplement.bib` or equivalent approved
set. Approval never authorizes overwriting the original corpus and does not
replace identity or content verification.

Use anonymous public access by default. Do not bypass paywalls, login walls,
CAPTCHAs, or access controls; do not use private sessions or request/store API
credentials as a convenience fallback.
