# ast-grep Rule Reference

This reference summarizes rule syntax for agents writing ast-grep searches. It
is intentionally compact; verify non-trivial rules with the local `ast-grep`
CLI before using them on a repository.

Examples in this file target `ast-grep 0.43.0`.

## Rule Object Basics

An ast-grep rule matches one target node. The fields on a rule object are
combined as an implicit AND.

Most useful rules include a positive matcher:

- `pattern`
- `kind`
- `any` or `all` containing a positive matcher

Constraints such as `regex`, `nthChild`, and `range` are not enough by
themselves in current ast-grep CLI behavior. Pair them with `kind`, `pattern`,
or another positive matcher.

Full scan rules need this shape:

```yaml
id: rule-id
language: javascript
rule:
  pattern: console.log($$$ARGS)
```

Save YAML rule files as UTF-8 without BOM. On Windows PowerShell, prefer an
editor that writes UTF-8 no BOM or write with:

```powershell
[System.IO.File]::WriteAllText(
  "rule.yml",
  $ruleText,
  [System.Text.UTF8Encoding]::new($false)
)
```

If ast-grep reports `missing field language` for a file that visibly contains
`language`, suspect a BOM before changing the rule.

## Atomic Rules

### pattern

Use `pattern` when the code shape can be expressed as source text.

```yaml
id: console-call
language: javascript
rule:
  pattern: console.log($$$ARGS)
```

Pattern object form is useful when the parser needs context or when only one
subnode should be selected:

```yaml
id: class-field
language: javascript
rule:
  pattern:
    context: class C { $FIELD = 1 }
    selector: field_definition
```

### kind

Use `kind` when source patterns are ambiguous or when a structural node is
clearer than source text.

```yaml
id: call-expression
language: javascript
rule:
  kind: call_expression
```

Use `ast-grep run --pattern '<sample>' --lang <lang> --debug-query=ast` to find
the current grammar's node kind names.

### regex

`regex` filters the complete text of the target node. Pair it with a positive
matcher.

```yaml
id: identifier-prefix
language: javascript
rule:
  all:
    - kind: identifier
    - regex: "^use[A-Z]"
```

### nthChild

`nthChild` filters a node by its position among siblings. Pair it with a
positive matcher such as `kind`.

```yaml
id: first-argument
language: javascript
rule:
  all:
    - kind: identifier
    - nthChild: 1
  inside:
    kind: arguments
```

### range

`range` filters by 0-based line and column offsets. Use it for generated or
editor-driven positions, not as a general search strategy.

```yaml
id: node-in-range
language: javascript
rule:
  all:
    - kind: identifier
    - range:
        start: { line: 0, column: 0 }
        end: { line: 0, column: 20 }
```

## Relational Rules

Relational rules connect the target node to surrounding or descendant nodes.
Use `stopBy: end` for deep searches unless you intentionally want the default
neighbor behavior.

### has

Use `has` when the target must contain a descendant.

```yaml
id: function-with-await
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

### inside

Use `inside` when the target must appear within an ancestor.

```yaml
id: console-inside-method
language: javascript
rule:
  pattern: console.log($$$ARGS)
  inside:
    kind: method_definition
    stopBy: end
```

### precedes and follows

Use `precedes` or `follows` for sibling or sequence-sensitive searches.

```yaml
id: return-after-await
language: javascript
rule:
  pattern: return $VALUE
  follows:
    pattern: await $EXPR
    stopBy: end
```

## Composite Rules

### all

`all` requires every sub-rule to match. It is also useful when constraints need
to be ordered or grouped.

```yaml
id: named-hook
language: javascript
rule:
  all:
    - kind: identifier
    - regex: "^use[A-Z]"
```

### any

`any` matches one of several alternatives.

```yaml
id: console-method
language: javascript
rule:
  any:
    - pattern: console.log($$$ARGS)
    - pattern: console.warn($$$ARGS)
    - pattern: console.error($$$ARGS)
```

### not

`not` excludes a matching sub-rule.

```yaml
id: await-without-try
language: javascript
rule:
  all:
    - any:
        - kind: function_declaration
        - kind: arrow_function
        - kind: method_definition
    - has:
        pattern: await $EXPR
        stopBy: end
    - not:
        has:
          kind: try_statement
          stopBy: end
```

### matches

`matches` references a named utility rule from an ast-grep project
configuration. Use it only when the repository has shared rule definitions.

## Metavariables

- `$VAR` captures one named node.
- `$$VAR` captures one unnamed node, such as punctuation or an operator.
- `$$$VAR` captures zero or more nodes.
- `$_` and names beginning with `_` are non-capturing placeholders.

Metavariables work best when the metavariable is the whole syntax node.

Usually works:

```yaml
pattern: fetch($URL)
```

Usually does not work:

```yaml
pattern: obj.on$EVENT()
```

## Debugging Commands

Inspect a query pattern:

```powershell
ast-grep run --pattern "class User { constructor() {} }" --lang javascript --debug-query=ast
```

Available debug formats include:

- `ast`: named nodes only
- `cst`: concrete syntax tree with punctuation
- `pattern`: ast-grep's interpreted pattern
- `sexp`: S-expression output

`--debug-query` is diagnostic output. It can return a non-zero exit code even
when it prints the tree you need.

## Common Patterns

### React useEffect with empty dependencies

```yaml
id: empty-use-effect
language: tsx
rule:
  pattern: useEffect($CALLBACK, [])
```

### Python decorated function

```yaml
id: decorated-function
language: python
rule:
  pattern: |
    @$DECORATOR
    def $NAME($$$ARGS):
        $$$BODY
```

### Python bare except

```yaml
id: bare-except-clause
language: python
rule:
  all:
    - kind: except_clause
    - regex: '^except\s*:'
```

This selects the `except_clause` itself. A larger `try: ... except: ...`
pattern can also find bare handlers, but it selects the enclosing
`try_statement`, which is noisier for cleanup tasks.

## Troubleshooting

1. If the rule does not parse, check that full scan rules have `id`,
   `language`, and `rule`.
2. If the rule file has those keys but ast-grep says `missing field language`,
   check for a UTF-8 BOM.
3. If the rule parses but misses, inspect the sample with `--debug-query=ast`.
4. If a relational rule is too shallow, add `stopBy: end`.
5. If a metavariable is not detected, make the metavariable the whole syntax
   node or use a broader pattern with `has`.
6. If a rule works on one code form but not another, enumerate node kinds with
   `any`.
