---
name: ast-grep
description: >-
  Write, debug, and validate ast-grep structural code search rules. Use this
  skill when the user needs syntax-aware code search, AST pattern matching,
  structural refactor discovery, language-construct queries, or searches that
  plain text tools like rg can miss, such as finding functions with particular
  descendants, calls inside specific contexts, missing error handling, React
  hook shapes, decorators, or other Tree-sitter-backed code structures.
version: 0.1.0
category: developer-tools-integrations
tags:
  - ast-grep
  - structural-search
  - code-search
  - tree-sitter
  - static-analysis
  - refactoring
argument-hint: "[code-pattern-or-search-goal] [path]"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# ast-grep Structural Search

Use ast-grep when the user needs code structure, not just text. The useful
outcome is a validated rule plus a clear statement of what it matches and what
it may miss.

## Triage

Start with the smallest tool that can answer the question.

- Use `rg` for exact names, strings, comments, or simple text.
- Use language tooling for semantic facts such as type resolution, references,
  imports, or rename safety.
- Use ast-grep for syntax shape: descendants, ancestors, call forms, decorators,
  missing constructs, nested contexts, or multi-language structural searches.

If ast-grep is not installed, say so and offer an `rg` fallback only when the
fallback will not pretend to be structural.

## Workflow

1. Identify the language and target files.
   - Infer from paths and extensions when possible.
   - Ask only if the language or include/exclude scope cannot be inferred.

2. Write a tiny fixture before searching the real repository.
   - Include at least one positive example.
   - Add a negative example when false positives would be costly.

3. Start with the simplest pattern.
   - Use `ast-grep run --pattern ... --lang ...` for a single-node search.
   - Move to a YAML rule when the search needs `has`, `inside`, `not`, `any`,
     `all`, `regex`, `nthChild`, or reusable metadata.

4. Debug the parsed structure when the first rule misses.
   - Use `ast-grep run --pattern '<sample code>' --lang <lang> --debug-query=ast`.
   - `--debug-query` prints diagnostic output and may exit non-zero; treat the
     printed tree as useful debug output, not as a failed repository search.

5. Validate on the fixture before running on the repository.
   - Keep the rule as simple as possible until it matches the fixture.
   - Then scan the real path and report expected false-negative boundaries.

6. Report the final rule, command, and caveats.
   - Name node kinds or language constructs intentionally excluded.
   - Prefer JSON output when a downstream script will consume matches.

## Rule File First

Rule files avoid most shell quoting problems and are the preferred form for
complex searches.

On Windows, save rule files as UTF-8 without BOM. If `ast-grep scan --rule`
reports `missing field language` even though the YAML has `language`, check for
a BOM at the start of the file.

```yaml
# async-await.yml
id: async-await
language: javascript
rule:
  any:
    - kind: function_declaration
    - kind: arrow_function
    - kind: method_definition
  has:
    pattern: await $EXPR
    stopBy: end
```

```powershell
$rule = @'
id: async-await
language: javascript
rule:
  any:
    - kind: function_declaration
    - kind: arrow_function
    - kind: method_definition
  has:
    pattern: await $EXPR
    stopBy: end
'@
[System.IO.File]::WriteAllText(
  "async-await.yml",
  $rule,
  [System.Text.UTF8Encoding]::new($false)
)

ast-grep scan --rule async-await.yml .\src
ast-grep scan --rule async-await.yml .\src --json
```

```bash
ast-grep scan --rule async-await.yml ./src
ast-grep scan --rule async-await.yml ./src --json
```

## Inline Smoke Tests

Use inline rules only for quick checks. In PowerShell, single-quoted here-strings
preserve `$META` variables without escaping.

```powershell
$rule = @'
id: console-call
language: javascript
rule:
  pattern: console.log($$$ARGS)
'@

"console.log('debug', value);" | ast-grep scan --inline-rules $rule --stdin
```

In POSIX shells, quote the YAML with single quotes or escape `$`.

```bash
printf '%s\n' "console.log('debug', value);" |
  ast-grep scan --inline-rules 'id: console-call
language: javascript
rule:
  pattern: console.log($$$ARGS)' --stdin
```

Every `scan --inline-rules` example must include `id`, `language`, and `rule`.

## Debugging Checklist

When a rule produces no matches:

1. Confirm the language: `--lang javascript` is different from `--lang tsx`.
2. Print the query tree with `--debug-query=ast` or `--debug-query=cst`.
3. Check that rule files are UTF-8 without BOM.
4. Replace the complex rule with one `pattern` or one `kind`.
5. Add relational rules back one at a time.
6. Add `stopBy: end` to deep `has` / `inside` searches.
7. Check whether metavariables occupy a whole syntax node.
8. Broaden node kinds if the language has several forms of the same concept.

## Avoid Silent False Negatives

Do not assume one node kind covers a user concept.

For JavaScript and TypeScript, "function" may include:

- `function_declaration`
- `function`
- `arrow_function`
- `method_definition`
- class fields or object properties containing functions

For React, decide whether the user means `.js`, `.jsx`, `.ts`, or `.tsx`.

For Python, inspect the parsed shape before relying on indentation-sensitive
multi-line patterns.

## Output Contract

When answering an ast-grep task, include:

1. `Rule`: the YAML rule or inline pattern.
2. `Validation`: the fixture command you used or recommend.
3. `Repository command`: the command for the user's target path.
4. `Caveats`: likely false positives, false negatives, and language forms not
   covered.

## Reference

Load `references/rule_reference.md` when the task needs detailed syntax for
atomic rules, relational rules, composite rules, metavariables, or troubleshooting.
