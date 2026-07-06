# Research: ripgrep manual filtering (globs, types, path scoping)

- **Query**: -g/--glob, --iglob, -t/-T type filters, --type-add, --type-list, path args, --max-filesize, --max-depth, -L/--follow
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]). Complements automatic filtering in [[02-core-behavior]].

## Findings

### Path arguments (scope the search)

- `rg foo` searches CWD recursively; `rg foo src` limits to `src`; multiple paths allowed: `rg foo src tests`.
- A path can be a single file: `rg foo README.md`. Explicitly named files bypass ignore rules and hidden-skipping (they were named on purpose), and named binary files are searched in "binary mode" (see [[02-core-behavior]]).
- Source: GUIDE "Recursive search" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### `-g/--glob` and `--iglob` (ad-hoc glob filtering)

- `-g GLOB` requires every searched file to match the glob: `rg lexopt -g '*.toml'`.
- Leading `!` **negates** (blacklist) on the command line: `rg lexopt -g '!*.toml'`. NOTE: this is the reverse of `.gitignore`, where `!` means whitelist. (GUIDE calls this out explicitly.)
- Globs are interpreted exactly like `.gitignore` patterns; **later globs override earlier ones**. `rg -g '!*.toml' -g '*.toml'` searches only `*.toml`. Reversing the order matches nothing (a non-negated glob imposes a "must match at least one glob" requirement, then the blacklist removes everything).
- Quote globs in single quotes so the shell doesn't expand `*` (`'*.toml'`).
- `--iglob GLOB` is the case-insensitive form of `-g`.
- `-g` can be repeated freely and combined with `-t`.
- **Nested curly braces / nested alternates** in globs are supported since **15.0.0** (e.g. `*.{c,{h,hpp}}`); older versions rejected nesting.
- Sources: GUIDE "Manual filtering: globs" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md ; CHANGELOG 15.0.0 FEATURE #3048 — https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md

### File types: `-t/--type`, `-T/--type-not`

- `-t TYPE` (include) / `-T TYPE` (exclude). Short forms attach directly: `-trust`, `-Trust`, `-tpy`, `-Tjs`.
- A type is a name mapped to one or more globs. Example equivalence: `rg 'int main' -tc` ≈ `rg 'int main' -g '*.{c,h}'`.
- `--type-list` prints all types and their globs. Filter it: `rg --type-list | rg '^make:'`.
- **Special `all` type**: `--type all` searches any file matching a known type (equivalent to listing every `--type`). Consequence: extensionless files (e.g. a shell script named `my-shell-script` with no extension) are NOT matched by `--type sh` or `--type all`, but `--type-not all` WOULD search them.
- Sources: GUIDE "Manual filtering: file types" incl. "The special `all` file type" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### `--type-add` (define a type for THIS invocation only)

- `rg --type-add 'web:*.{html,css,js}' -tweb title` defines type `web`, then uses it.
- Multiple globs by repeating the flag: `--type-add 'web:*.html' --type-add 'web:*.css'`.
- **Not persistent** — it only affects the current command. To make it permanent, put it in a shell alias or the config file (`--type-add=web:*.{html,css,js}`). See config file details in [[06-config-and-advanced]].
- A type can include another type via `include`: form is `--type-add 'foo:include:html,css'` (references existing type names). (Man page / `--help`.)
- Source: GUIDE "Manual filtering: file types" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Size / depth / symlink controls

| Flag                                   | Effect                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--max-filesize NUM+SUFFIX?`           | Skip files larger than the limit, e.g. `--max-filesize 1M`, `--max-filesize 50K`, `--max-filesize 500` (bytes). Suffixes: `K`, `M`, `G`. |
| `--max-depth NUM` (alias `--maxdepth`) | Limit directory-traversal depth. `--max-depth 0` searches only the given paths themselves; `--max-depth 1` = immediate children.         |
| `-L/--follow`                          | Follow symbolic links (off by default; see [[02-core-behavior]]).                                                                        |
| `-d`/`--max-depth`                     | `-d` is NOT a short flag for max-depth in current ripgrep; use `--max-depth`.                                                            |

- `--max-filesize` example appears in the FAQ regex-size section (`--max-filesize 44444444444444444444` in a test). Suffix parsing and the depth flag are documented in `rg --help` / man page.
- Sources: `rg --help` (man page), FAQ — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

## Caveats / Not Found

- Exact byte-suffix grammar for `--max-filesize` (whether lowercase `k`/`m` is accepted) is documented in `rg --help`; not fully quoted in GUIDE/FAQ. Treat uppercase `K`/`M`/`G` as canonical.
- `--type-add` `include:` sub-syntax is documented in the man page rather than the GUIDE; verify exact spelling with `rg --help` on the target machine before relying on it.
- Behavior of `-g` vs `.gitignore` precedence: command-line `-g`/`--iglob` overrides are applied as an "overrides" layer distinct from ignore files; a `-g` whitelist can resurrect a gitignored path.

### Source URLs

- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- CHANGELOG (nested globs, 15.0.0): https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
