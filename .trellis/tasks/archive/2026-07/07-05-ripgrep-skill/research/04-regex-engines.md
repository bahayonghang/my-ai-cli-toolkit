# Research: ripgrep regex engines and matching modes

- **Query**: default Rust regex engine capabilities/limits, PCRE2, -F/-w/-x, case flags + smart case, multiline, Unicode defaults
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]).

## Findings

### Default engine: Rust `regex` (finite automata)

- ripgrep's default engine is Rust's `regex` crate, built on finite automata with SIMD + literal optimizations. It guarantees **worst-case linear time** on all inputs.
- Full syntax reference: https://docs.rs/regex/1/regex/#syntax
- **Deliberately unsupported** (because FSM can't do them in linear time):
  - **Lookaround** (lookahead/lookbehind, `(?=...)`, `(?<=...)`, etc.) — not supported.
  - **Backreferences** (`\1`, `\k<name>`) — not supported.
- Error behavior when you use them: ripgrep errors at pattern-compile time (e.g. an "unrecognized/unsupported" regex parse error). To use them you must switch to PCRE2 (`-P`). FAQ shows PCRE2 finding palindromes with `rg -P '(\w{10})\1'`.
- **`\n` literal restriction**: in single-line (default) mode ripgrep statically prevents a match from crossing `\n`. It auto-strips `\n` from classes like `\s`; if it can't (e.g. a bare `\n` literal), it errors: `the literal '"\n"' is not allowed in a regex`. This restriction is lifted under `-U/--multiline`.
- Sources: FAQ "How do I use lookaround and/or backreferences?" and "Why does ripgrep get slower when I enable PCRE2" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; README "Is it really faster" — https://github.com/BurntSushi/ripgrep/blob/master/README.md

### PCRE2 engine (`-P/--pcre2`)

- `-P` / `--pcre2` switches to PCRE2, a backtracking engine that DOES support lookaround and backreferences (but loses the linear-time guarantee — catastrophic backtracking becomes possible).
- Availability: **most official GitHub release binaries ship with PCRE2 enabled**; distro/package builds may not. If unavailable: `PCRE2 is not available in this build of ripgrep`. Check `rg --version` for `+PCRE2`.
- Performance: PCRE2 is often slower in ripgrep because (a) it forces line-by-line searching (ripgrep can't strip `\n` for it) and (b) its Unicode mode requires valid UTF-8, so ripgrep transcodes first. Speed tips from the FAQ: add `-U` (multiline, lets it memory-map) and `--no-pcre2-unicode` when you don't need Unicode.
- Sources: FAQ "fancy" and "pcre2-slow" sections — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Engine selection

- `-P/--pcre2`: always use PCRE2.
- `--engine (default|pcre2|auto)`: explicit selector. `--engine auto` uses the default engine, but automatically falls back to PCRE2 **only if** the pattern uses features the default engine lacks (lookaround/backrefs).
- `--auto-hybrid-regex`: older equivalent of `--engine auto` (still documented; `--engine` is the newer form).
- Source: README "Why should I use ripgrep?" bullet on PCRE2 — https://github.com/BurntSushi/ripgrep/blob/master/README.md

### Literal / word / line matching

| Flag                 | Meaning                                                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-F/--fixed-strings` | Treat the pattern as a literal string, not a regex. `rg -F 'fn write('` needs no escaping.                                                                                                          |
| `-w/--word-regexp`   | Require matches to be bounded by word boundaries. Implemented as `\b{start-half}(?:pattern)\b{end-half}` — half-boundaries, so `rg -w -e -2` matches `-2` in `(-2)` even though `\b-2\b` would not. |
| `-x/--line-regexp`   | Require the pattern to match the WHOLE line.                                                                                                                                                        |
| `-e/--regexp PAT`    | Supply pattern(s) explicitly; repeatable for multiple patterns (OR). Also the safe way to pass a pattern starting with `-`.                                                                         |
| `-f/--file FILE`     | Read one pattern per line from FILE (OR of all). Large files can be slow — see `--dfa-size-limit` in [[06-config-and-advanced]].                                                                    |

- Source: GUIDE "Common options" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Case handling

- `-i/--ignore-case`: case-insensitive. `rg -i fast` matches `fast`, `FAST`, `fASt`.
- `-s/--case-sensitive`: force case-sensitive (overrides `-i`/`-S`).
- `-S/--smart-case`: case-insensitive **unless the pattern contains an uppercase letter**, in which case it becomes case-sensitive. Usually set in an alias or config file (not on by default).
- Precedence: later flag wins; `-s` beats `-S` beats `-i` when combined per ripgrep's override rules.
- Source: GUIDE "Common options" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Multiline

- `-U/--multiline`: permit a single match to span multiple lines.
- `--multiline-dotall`: makes `.` match newlines too (only meaningful with `-U`; off by default even under `-U`).
- Cost: multiline can't search incrementally — ripgrep must hold the whole file (heap/mmap), so memory use rises on huge files.
- `-m/--max-count` + `-U` interaction had an over-counting bug fixed in **15.0.0** (BUG #2094/#3076); a `-U` + `-r` panic was also fixed in 15.0.0 (BUG #3180). Flag this if a user is on an older build.
- Sources: FAQ "multiline" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md ; CHANGELOG 15.0.0 — https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md

### Unicode defaults

- **Unicode is ON by default** and stays fast (unlike GNU grep, ripgrep doesn't consult locale). `\w`, `\d`, `\s`, `.` etc. are Unicode-aware; `.` matches any Unicode codepoint (not any byte), so it won't match invalid UTF-8.
- Disable Unicode inline with `(?-u:...)`: `rg '(?-u:.)'` makes `.` match any byte (useful for binary/invalid-UTF-8 data). Works on any sub-part: `rg '\w(?-u:\w)\w'`.
- For PCRE2, disable Unicode with `--no-pcre2-unicode` instead.
- ripgrep does not require input to be valid UTF-8; it searches arbitrary bytes, but Unicode-only patterns simply won't match non-UTF-8 regions.
- Sources: GUIDE "File encoding" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md ; README — https://github.com/BurntSushi/ripgrep/blob/master/README.md

## Caveats / Not Found

- The exact wording of the parse error for lookaround/backrefs on the default engine varies by version; the reliable signal is that it fails at compile time and works under `-P`.
- `--engine auto` vs `--auto-hybrid-regex`: both exist; `--engine` is the current documented interface. Confirm on target with `rg --help`.

### Source URLs

- Regex syntax: https://docs.rs/regex/1/regex/#syntax
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
