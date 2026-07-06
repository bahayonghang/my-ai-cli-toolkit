# ripgrep CLI Reference

Depth reference for the ripgrep skill. Facts follow the official README,
GUIDE, FAQ, and CHANGELOG for ripgrep **15.1.0** (current stable, 2025-10-22).
Flags marked "since 15.0.0" are absent or buggy on older builds; check
`rg --version` first. The binary is `rg`; most official release binaries ship
with `+PCRE2`, distro packages may not.

## Default filtering and ignore precedence

When traversing directories, rg skips, in this order of rule precedence
(highest last):

1. `.gitignore` — including the global `core.excludesFile` (usually
   `$XDG_CONFIG_HOME/git/ignore`), `$GIT_DIR/info/exclude`, and `.gitignore`
   files in parent directories of the same git repo.
2. `.ignore` — application-agnostic; overrides `.gitignore`.
3. `.rgignore` — ripgrep-specific; overrides `.ignore`.

Within one file, later globs override earlier ones; a `!` rule in `.ignore` or
`.rgignore` whitelists a path `.gitignore` excluded. rg also skips hidden
files/dirs, binary files (any file containing a NUL byte), and does not follow
symlinks.

| Need                                     | Flag                                           |
| ---------------------------------------- | ---------------------------------------------- |
| Disable all ignore-file filtering        | `--no-ignore` (== `-u`)                        |
| Search hidden files/dirs                 | `--hidden` / `-.`                              |
| Search binary files as text              | `-a/--text`                                    |
| Follow symlinks                          | `-L/--follow`                                  |
| Everything at once                       | `-u`, `-uu`, `-uuu` (ignore, +hidden, +binary) |
| Apply gitignore rules outside a git repo | `--no-require-git`                             |

Finer-grained variants: `--no-ignore-dot`, `--no-ignore-vcs`,
`--no-ignore-parent`, `--no-ignore-global`, `--no-ignore-exclude`,
`--no-ignore-files`, `--no-ignore-messages`.
`--ignore-file-case-insensitive` matches ignore globs case-insensitively
(useful on Windows/macOS filesystems, off by default, has a perf cost).

Binary handling has three modes: default (stop at first NUL during recursive
traversal; explicitly named binary files get "binary mode" automatically),
`--binary` (search to EOF or first match), and `-a/--text` (no binary
detection at all). Detection depth depends on whether mmap is used; add
`--no-mmap` for consistent detection.

Parent-directory gitignore handling received multiple correctness fixes in
15.0.0; older versions may ignore or apply parent rules differently.

Diagnosis flags: `--files` (list what would be searched), `--debug` (why a
path was excluded, which config loaded), `--trace` (search strategy detail).

## Globs and file types

- `-g GLOB` requires files to match; leading `!` negates (blacklist) — the
  reverse of gitignore, where `!` whitelists. Globs are interpreted like
  `.gitignore` patterns and later globs override earlier ones:
  `rg -g '!*.toml' -g '*.toml'` searches only `*.toml`, while the reversed
  order matches nothing. `--iglob` is case-insensitive. A `-g` whitelist can
  resurrect a gitignored path. Nested curly-brace alternates like
  `*.{c,{h,hpp}}` work since 15.0.0.
- `-t TYPE` includes a type, `-T TYPE` excludes; short forms attach directly
  (`-trust`, `-Tjs`). `--type-list` prints every type with its globs.
- The special `all` type matches any file of a known type; extensionless
  files match neither `-t sh` nor `-t all`, but `--type-not all` would search
  them.
- `--type-add 'web:*.{html,css,js}'` defines a type for the current
  invocation only; repeat the flag for more globs. A type can include another
  via `--type-add 'foo:include:html,css'` (verify spelling with `rg --help`).
  Persist definitions in the config file.
- `--max-filesize NUM` with `K`/`M`/`G` suffixes; `--max-depth NUM`
  (`--max-depth 0` searches only the named paths themselves).

## Engine comparison

| Aspect         | Default (Rust regex)                          | PCRE2 (`-P/--pcre2`)                                                                              |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Time guarantee | worst-case linear                             | backtracking, can blow up                                                                         |
| Lookaround     | no — compile-time error                       | yes                                                                                               |
| Backreferences | no — compile-time error                       | yes (`rg -P '(\w{10})\1'`)                                                                        |
| Availability   | always                                        | only builds with `+PCRE2` in `rg --version`                                                       |
| Unicode        | on by default, `(?-u:...)` to disable locally | on; disable with `--no-pcre2-unicode`                                                             |
| Speed notes    | SIMD + literal optimizations                  | often slower: line-by-line search, UTF-8 transcoding; mitigate with `-U` and `--no-pcre2-unicode` |

- `--engine (default|pcre2|auto)`: `auto` falls back to PCRE2 only when the
  pattern needs lookaround/backrefs. `--auto-hybrid-regex` is the older
  equivalent; `--engine` is the current interface.
- Pattern sources: `-e PAT` (repeatable, ORed, and the safe way to pass a
  pattern starting with `-`), `-f FILE` (one pattern per line, ORed).
- `-w/--word-regexp` uses half word boundaries
  (`\b{start-half}...\b{end-half}`), so `rg -w -e -2` matches `-2` inside
  `(-2)` where `\b-2\b` would not.
- Case precedence when combined: `-s` beats `-S` beats `-i` (later flag
  wins per rg's override rules).

## Multiline and encoding

- `-U/--multiline` permits matches spanning lines and lifts the "bare `\n`
  literal not allowed" compile error. `--multiline-dotall` additionally makes
  `.` match newlines (off by default even under `-U`). Multiline search must
  hold whole files in memory. A `-m`+`-U` over-count bug and a `-U`+`-r`
  panic were fixed in 15.0.0.
- Default encoding handling (`--encoding auto`): input assumed
  ASCII-compatible, with UTF-16 BOM sniffing — UTF-16 files with a BOM are
  transcoded to UTF-8 transparently. `-E LABEL` forces a WHATWG encoding
  (`utf-16le`, `latin1`, `gbk`, `shift_jis`, ...); `-E none` disables all
  encoding logic including BOM sniffing (raw bytes).
- Unicode classes (`\w`, `\d`, `\s`, `.`) are Unicode-aware by default and
  `.` will not match invalid UTF-8; use `(?-u:.)` for a byte-oriented dot.

## Output formats

- Context: `-A`/`-B`/`-C NUM`; non-adjacent groups are separated by `--`
  (customize with `--context-separator`, drop with
  `--no-context-separator`).
- `-o/--only-matching` prints only the matched portion, one match per line.
- `-r/--replace REPL` rewrites the matched portion **in the output only** —
  the GUIDE states ripgrep "will never modify your files" and there is no
  in-place flag. Supports `$0`, `$1`, and `$name` with `(?P<name>...)`.
  Whole-line rewrite: `rg '^.*fast.*$' -r FAST` or `rg fast -or FAST`.
  `-r` works with `--json` since 15.0.0; line terminators are preserved
  (fixed in 15.0.0). Sanctioned on-disk edit pipeline:
  `rg foo -l | xargs sed -i 's/foo/bar/g'` (GNU sed; BSD/macOS needs
  `-i ''`; use `-l -0 | xargs -0` for paths with spaces), or fastmod.
- `--json` emits JSON Lines messages: `begin`, `match`, `context`, `end`,
  then a final `summary`, with byte offsets, line numbers, and submatches.
  Exact key names (`type`, `data`, `path.text`, `submatches`) are specified
  in the man page's grep-printer JSON section. Consumers include `delta`.
- `--vimgrep` prints `file:line:column:text`, every match on its own line
  (quickfix-ready); `--column` shows the 1-based column of the first match.
- `-n`/`-N` force line numbers on/off (default: on at a TTY, off when
  piped).
- `-l/--files-with-matches`, `--files-without-match`, `-q/--quiet` (exit
  code only; a `-q --files-without-match` exit-code inversion was fixed in
  15.0.0).
- `-c/--count` counts matched **lines** per file; `--count-matches` counts
  total matches (can exceed line count).
- `--stats` appends totals (matches, files searched, bytes, elapsed);
  bytes-searched and `--json` summary miscounts were fixed in 15.0.0.
- `-m/--max-count NUM` stops after NUM matching lines per file.
- Ordering: parallel search makes output order non-deterministic. `--sort
path|mtime|created|accessed` (and `--sortr`) force an order but disable
  parallelism; `-j1` also yields deterministic order.
- Layout: `--heading` (TTY default) groups matches under a path header;
  `--no-heading` prints grep-style `path:match` lines. `-M/--max-columns`
  truncates long lines (`-M0` disables); `--max-columns-preview` previews
  truncated lines.
- Color: `--color=auto` (default) colors only at a TTY; force through pipes
  with `--color=always` (or `ansi`). `--colors '{type}:{attr}:{value}'`
  customizes `path|line|column|match`; the `highlight` type and `italic`
  style exist since 15.0.0.

## Configuration file

- No config is read unless `RIPGREP_CONFIG_PATH` points at a file (any name,
  e.g. `~/.ripgreprc`).
- Format: every line is exactly one shell argument after trimming; `#` lines
  are comments; blank lines OK. No escaping, no shell parsing.
- **Gotcha:** a flag with a value must be `--flag=value` on one line, or the
  flag and value on two separate lines. `--flag value` on a single line is
  parsed as one bogus argument and fails.
- Config args are prepended to the command line, so CLI flags override them
  (config `--max-columns=150` vs CLI `-M0`).
- `--no-config` guarantees the config is ignored — use it in scripts for
  reproducibility. `--debug` shows which config loaded and what it
  contributed.

Example:

```
--max-columns=150
--max-columns-preview
--type-add
web:*.{html,css,js}*
--hidden
--glob=!.git/*
--smart-case
```

## Preprocessors and compressed files

- `--pre CMD` runs CMD on each file (path as sole argument, contents on
  stdin) and searches its stdout — e.g. wrap `pdftotext - -` to search PDFs.
  CMD must be on PATH or absolute.
- `--pre-glob GLOB` restricts which files invoke the preprocessor; without it
  every file pays process-spawn overhead. A robust script should `exec cat`
  for non-target files.
- `-z/--search-zip` decompresses gzip/bzip2/xz/lzma/lz4/Brotli/Zstd by
  shelling out to the matching binary. It does **not** enter archive
  formats: the tar layer of `*.tar.gz` is not searched.

## Performance knobs

- `-j/--threads NUM` caps worker threads (`-j1` = single-threaded,
  deterministic, cheaper than `--sort`). Default is CPU-count heuristic.
- `--mmap`/`--no-mmap` override the automatic memory-map choice; mmap tends
  to win on single large files, buffered reads on big trees. Binary
  detection differs between the two strategies.
- `--regex-size-limit` (default ~10 MB) raises the compiled-regex ceiling
  when you see `Compiled regex exceeds size limit`; raising it is a ceiling,
  not a forced allocation.
- `--dfa-size-limit` enlarges the lazy-DFA cache — speeds up huge
  `-f/--file` pattern sets that would otherwise spill to a slower engine.

## Generated docs

`rg --generate man` prints the man page (same content as `rg --help`);
`rg --generate complete-{bash,zsh,fish,powershell}` prints shell completions.
`rg -h` is the condensed flag summary.

## Sources

- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
