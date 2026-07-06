# Research: ripgrep pitfalls and real-world recipes

- **Query**: common mistakes, ~15 useful GUIDE one-liners, grep/ag/ack differences that change expectations
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]). Consolidates [[02-core-behavior]]–[[07-windows-notes]].

## Findings

### Expectation-changing differences vs grep/ag/ack

- **Recursive by default**: `rg foo` == `rg foo ./`. No `-r` needed (grep needs `-r`).
- **.gitignore/.ignore/.rgignore respected by default**, plus hidden files and binary files skipped. `grep -r` searches everything. To match grep's behavior use `rg -uuu` (see [[02-core-behavior]]).
- **Line numbers ON by default at a TTY, OFF when piped.** grep is the opposite (needs `-n`). Force with `-n`/`-N`.
- **Color ON at a TTY, OFF when piped** (auto). Force through pipes with `--color=always`.
- **Output order is non-deterministic** (parallel). Use `--sort path` (disables parallelism) for stable order — see [[05-output-and-integration]].
- **Not POSIX / not a drop-in grep replacement** (FAQ "posix4ever"): don't use it in portable shell scripts; different flags, no bug-for-bug compatibility.
- **`-c/--count` counts matched LINES, not total matches** — use `--count-matches` for total occurrences.
- **stdin vs tty detection**: piping into `rg` (`cat f | rg foo`) searches stdin; `rg` at a bare TTY with no path searches CWD recursively. This TTY-detection also drives the color/line-number/heading defaults.
- **Leading-dash patterns**: `rg -foo` is parsed as flags. Use `rg -e -foo` or `rg -- -foo`.
- **Word boundaries** via `-w` use half-boundaries (`\b{start-half}`), so `rg -w -e -2` matches `-2` in `(-2)` where `\b-2\b` would not (see [[04-regex-engines]]).
- Sources: FAQ — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; README — https://github.com/BurntSushi/ripgrep/blob/master/README.md

### Common mistakes (and fixes)

1. **"ripgrep found no files."** Usually a `*` rule in `$HOME/.gitignore` (global gitignore) excluding everything. Diagnose with `--debug`; bypass with `-uuu`. (Called out at the top of the GUIDE.)
2. **File is hidden / gitignored / binary / a symlink** → not searched. Add `--hidden`, `--no-ignore`, `-a/--text`, or `-L` respectively; or `-uuu` to bypass all.
3. **Regex with `(` `)` `|` etc. unescaped** → treated as regex operators. Escape them, or use `-F` for a literal (`rg -F 'fn write('`).
4. **Trying to lookaround/backref on the default engine** → compile error. Add `-P` (PCRE2) — see [[04-regex-engines]].
5. **Expecting `-r/--replace` to edit files** → it only rewrites OUTPUT. Pipe `rg -l ... | xargs sed -i ...` to actually edit (see [[05-output-and-integration]]).
6. **Config file `--flag value` on one line** → parse failure. Use `--flag=value` or two lines (see [[06-config-and-advanced]]).
7. **Single quotes in cmd.exe / `$` in PowerShell double quotes** → shell mangles the pattern (see [[07-windows-notes]]).
8. **`-z` won't search `*.tar.gz` contents** — only the compression layer, not archive members.
9. **Bare `\n` literal** in a non-multiline pattern → `the literal '"\n"' is not allowed`. Use `-U/--multiline`.

### ~15 high-value one-liners (from GUIDE/FAQ/README)

| Command                                              | What it does                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `rg fast README.md`                                  | Search a single file for a literal-ish pattern.                     |
| `rg 'fn write\('`                                    | Recursive regex search from CWD (escaped paren).                    |
| `rg -F 'fn write('`                                  | Same, treating the pattern as a literal string.                     |
| `rg lexopt -g '*.toml'`                              | Restrict to files matching a glob.                                  |
| `rg lexopt -g '!*.toml'`                             | Exclude files matching a glob (`!` = blacklist on CLI).             |
| `rg 'fn run' -trust`                                 | Restrict to a file type (Rust); `-Trust` excludes it.               |
| `rg --type-add 'web:*.{html,css,js}' -tweb title`    | Define an ad-hoc type and search it.                                |
| `rg --type-list \| rg '^make:'`                      | Inspect the globs behind a type.                                    |
| `rg fast -r FAST` / `rg fast -or FAST`               | Rewrite matched text in OUTPUT (never edits files).                 |
| `rg 'fast\s+(\w+)' -r 'fast-$1'`                     | Replacement using a capture group.                                  |
| `rg foo -l \| xargs sed -i 's/foo/bar/g'`            | Actual on-disk search & replace (GNU sed).                          |
| `rg -P '(\w{10})\1'`                                 | Backreference search via PCRE2 (finds repeats/palindromes).         |
| `rg 'Шерлок' some-utf16-file`                        | Transparent UTF-16 search (auto BOM transcode).                     |
| `rg --pre ./preprocess --pre-glob '*.pdf' 'pattern'` | Search PDFs via a preprocessor, only for `*.pdf`.                   |
| `rg -uuu foo`                                        | Disable ALL smart filtering (ignore + hidden + binary) ≈ `grep -r`. |
| `rg foo --files` / `rg foo --debug`                  | List files that would be searched / explain why a file is skipped.  |
| `rg '(?-u:.)'`                                       | Disable Unicode for part of a pattern (byte-oriented `.`).          |
| `rg -w '[A-Z]+_SUSPEND' -n`                          | Word-bounded search with line numbers (README benchmark example).   |

- Sources: GUIDE — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md ; FAQ — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; README — https://github.com/BurntSushi/ripgrep/blob/master/README.md

### Diagnostic toolkit (memorize these)

- `--files` — list files ripgrep would search.
- `--debug` — why a file is ignored / what config loaded.
- `--trace` — even more verbose (search strategy, transcoding).
- `-uuu` — bypass all automatic filtering as a quick test.
- `rg --version` — confirm version + `+PCRE2` / `+SIMD` features.

## Caveats / Not Found

- The one-liner table blends GUIDE, FAQ, and README examples; each is individually sourced above but they don't all appear in one place in the docs.
- `--count-matches` vs `-c` distinction is documented in the man page and CHANGELOG 15.0.0 (BUG #3131), not prominently in the GUIDE.

### Source URLs

- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
