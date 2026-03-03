# Codex Web Search Commands

## Batch Retrieval Template

```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Return RAW search results with URLs. Search: <specific query>"
```

## Query Tips

- Add year constraints: `2024 2025`
- Request raw links: `Return RAW search results with URLs`
- Focus each query on single topic, avoid overly broad searches
- **IMPORTANT**: Always include the exact product name in query (e.g., "OpenSearch" not "Elasticsearch" if researching OpenSearch)

## Example Queries

```bash
# Architecture features
"Return RAW search results with URLs. Search: OpenSearch unique features architecture 2024 2025"

# Comparison
"Return RAW search results with URLs. Search: OpenSearch vs Elasticsearch key differences 2024 2025"

# Performance data
"Return RAW search results with URLs. Search: OpenSearch performance benchmark 2024 2025"

# History
"Return RAW search results with URLs. Search: OpenSearch history timeline fork Elasticsearch"
```

## Link Validation Command

After drafting report, validate all links:

```bash
codex e -m gpt-5.3-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Use web search to verify if these URLs are valid. For each URL that returns 404, search for the correct replacement URL:
1. <url1>
2. <url2>
...
Report: which URLs are valid, which are 404, and provide correct replacement URLs for broken ones."
```

## Validation Rules

- Let user verify simple URLs by clicking (faster than codex)
- Use codex validation only when user requests or for batch verification
- If URL is 404, codex can search for replacement in same request
- Ensure reference name matches actual page content
