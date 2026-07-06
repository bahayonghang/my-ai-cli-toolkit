# Research: ripgrep output control and tool integration

- **Query**: context flags, -o, -r/--replace, --json, --vimgrep, -l, --files-without-match, -c, --stats, --sort, -m, --column, --heading, color-when-piping
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]).

## Findings

### Context lines

- `-A NUM/--after-context`, `-B NUM/--before-context`, `-C NUM/--context` (both sides).
- Between non-adjacent match groups ripgrep prints a `--` separator (configurable via `--context-separator`, disable with `--no-context-separator`).
- Source: GUIDE "Common options" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### `-o/--only-matching`

- Print only the matched portion of each line, one match per output line. Combine with `-r` to transform matches (see below).

### `-r/--replace` — OUTPUT ONLY, NEVER edits files

- **Critical**: `--replace` rewrites only ripgrep's OUTPUT. GUIDE states verbatim: "ripgrep **will never modify your files**... And there is no flag to let you do a replacement in a file." There is no in-place edit mode.
- Applies to the matched portion only. To replace a whole line, match the whole line (`rg '^.*fast.*$' -r FAST`) or combine with `-o` (`rg fast -or FAST`).
- Supports capture groups: `$1`, `$0` (whole match), and named `$name` with `(?P<name>...)`. Example: `rg 'fast\s+(\w+)' -r 'fast-$1'`.
- Line terminators are preserved when using `-r` (bug fixed in 15.0.0, BUG #3100).
- `-r` now works together with `--json` (added in 15.0.0, FEATURE #1872).
- **Sanctioned edit pipeline** (FAQ "search-and-replace"): ripgrep alone cannot edit; pipe filenames to `sed`:
  - `rg foo -l | xargs sed -i 's/foo/bar/g'` (GNU sed)
  - BSD/macOS sed needs an arg: `rg foo -l | xargs sed -i '' 's/foo/bar/g'`
  - Paths with spaces: `rg foo -l -0 | xargs -0 sed -i 's/foo/bar/g'` (NUL-delimited).
  - FAQ also points to Facebook's `fastmod` for an ergonomic search/replace built on ripgrep's libraries.
- Sources: GUIDE "Replacements" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md ; FAQ "search-and-replace" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; CHANGELOG 15.0.0.

### Machine-readable / editor output

| Flag                                       | Output                                                                                                                                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--json`                                   | JSON Lines stream: `begin`, `match`, `context`, `end`, then a final `summary` message. Each carries byte offsets, line numbers, submatches, and (optionally) `-r` replacements. Consumed by tools like `delta` (`rg --json pattern \| delta`). |
| `--vimgrep`                                | One line per match as `file:line:column:text`, every match on its own line — ideal for editor quickfix lists. Forces column numbers and one-match-per-line.                                                                                    |
| `--column`                                 | Show 1-based column of the first match on each line.                                                                                                                                                                                           |
| `-n/--line-number` / `-N/--no-line-number` | Line numbers are ON by default when printing to a terminal, OFF when piping; these force the choice.                                                                                                                                           |

- Source: README "Related tools" (delta) — https://github.com/BurntSushi/ripgrep/blob/master/README.md ; man page for `--json`/`--vimgrep`.

### File-list and count modes

| Flag                      | Output                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `-l/--files-with-matches` | Print only paths that contain ≥1 match.                                                    |
| `--files-without-match`   | Print only paths with ZERO matches.                                                        |
| `-c/--count`              | Per file, print count of matched **lines** (not total matches).                            |
| `--count-matches`         | Per file, count total matches (can exceed matched-line count).                             |
| `--files`                 | List files ripgrep WOULD search, without searching (diagnostic; see [[02-core-behavior]]). |
| `-q/--quiet`              | Print nothing; exit as soon as a match is found (exit code signals result).                |

- Note: 15.0.0 documented that `-c/--count` and `--files-with-matches` differ (BUG #3131), and fixed `-q --files-without-match` exit-code inversion (BUG #3108).
- Source: CHANGELOG 15.0.0 — https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md

### `--stats`

- Prints aggregate totals (matches, matched lines, files searched, files with matches, bytes searched, elapsed time) after results. A "bytes searched" miscount and a `--json` summary bug were both fixed in 15.0.0 (BUG #2944, #3178).

### `-m/--max-count NUM`

- Stop after NUM matching lines **per file**. (Combined with `-U/--multiline`, an over-count bug was fixed in 15.0.0.)

### `--sort` / ordering and parallelism cost

- ripgrep searches in **parallel by default**, so output order is **non-deterministic** across runs.
- `--sort path` (also `mtime`, `created`, `accessed`) forces a stable order but **disables parallelism**, so it can be slower (on small repos the difference is often negligible). `--sortr` sorts in reverse (the `--sortr=path` regression was fixed back in 14.0.3).
- Only way to get consistent ordering is `--sort`.
- Source: FAQ "order" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Heading and columns layout

- `--heading` groups matches under a file-path header (default when printing to a TTY); `--no-heading` prints the path on every match line (grep-style, good for piping).
- `-M/--max-columns NUM` truncates long printed lines (`-M0` disables the limit); `--max-columns-preview` shows a short preview of truncated lines.

### Color behavior when piping

- `--color=auto` (default) enables color ONLY when writing to a terminal; piping to a file/process suppresses color automatically. Values: `never`, `auto`, `always`, `ansi`.
- `--colors '{type}:{attribute}:{value}'` customizes colors (types `path|line|column|match`; since 15.0.0 also `highlight` for non-matching text in a matching line). `italic` style added in 15.0.0.
- Force color through a pipe with `--color=always` (or `ansi`).
- Source: FAQ "colors" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; CHANGELOG 15.0.0.

## Caveats / Not Found

- `--json` schema field names (`type`, `data`, `path.text`, `submatches`) are documented in the man page's "grep-printer JSON" section, not the GUIDE/FAQ; treat the man page as authoritative for exact keys.
- `-c/--count` counts matched LINES; users expecting total-match counts want `--count-matches`. This is a frequent expectation mismatch (see [[08-pitfalls-and-recipes]]).

### Source URLs

- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
