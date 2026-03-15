# Bib Search Citation

Search, filter, and format entries from BibTeX/BibLaTeX `.bib` files with a compact query language and citation snippet generation.

## When to use it

- user provides a `.bib` file and wants to find papers by topic, author, year, or other fields
- filtering a Zotero-exported bibliography by multiple criteria
- generating LaTeX (`\cite`, `\parencite`, `\textcite`) or Typst (`@key`, `#cite(<key>)`) citation snippets
- checking which entries have DOI, code, PDF, or abstract

## Workflow

1. identify the `.bib` file path
2. translate the user's request into a compact query or JSON spec
3. run `scripts/search_bib.py` against the file
4. review the JSON output and present the best matches with requested fields
5. include citation snippets in the requested format (LaTeX, Typst, or both)

## Compact query examples

```text
mamba forecasting author:Cheng year>=2024 has:code cite:both limit:5
```

```text
author:Wang year:2023,2024 type:article sort:year_desc
```

Supported filters include `author:`, `year>=`, `year:`, `type:`, `-type:`, `has:`, `-has:`, `sort:`, `limit:`, `fields:`, `cite:`, and `raw:`.

## Main assets

- `scripts/search_bib.py` — pure-Python parser, filter engine, and citation formatter (no external dependencies)
- `references/query-syntax.md` — full syntax reference with natural-language mapping examples

## Notes

- The script is dependency-free and works with standard Python 3.
- Supports both inline JSON specs and compact query expressions.
- Handles Zotero-exported `file` fields, detecting PDFs via `.pdf` extension or `application/pdf` MIME type.
- For empty results, try broadening filters: remove `has:` constraints, widen year range, or use fewer keywords.
