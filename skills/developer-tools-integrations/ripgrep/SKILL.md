---
name: ripgrep
description: >-
  Use when the user needs text or regex content search with ripgrep: composing
  rg commands, choosing flags, glob/type filtering, multiline or PCRE2
  searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed
  a file (gitignore, hidden, binary defaults). Not for syntax-aware structural
  queries (ast-grep) or semantic renames/references (language tooling).
version: 0.1.0
category: developer-tools-integrations
tags:
  - ripgrep
  - rg
  - text-search
  - regex
  - code-search
  - grep
argument-hint: "[search-goal-or-pattern] [path]"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# ripgrep Text Search

Use ripgrep (rg) when the user needs fast text or regex content search from
the command line. The useful outcome is a copy-pasteable command plus a clear
statement of what it matches, what it skips, and why.

## Triage

Start with the smallest tool that can answer the question.

- For trivial in-conversation lookups, use the harness's built-in
  ripgrep-backed search tool instead of shelling out to rg.
- Use rg for exact names, strings, regex content searches, file lists, counts,
  and pipeline-friendly output.
- Use ast-grep for syntax shape: descendants, ancestors, call forms,
  decorators, missing constructs, or nested contexts.
- Use language tooling for semantic facts such as type resolution, references,
  imports, or rename safety.

Before trusting local behavior, verify the binary: `rg --version` should print
a ripgrep version plus enabled features such as `+PCRE2`. If it does not, run
`which rg` — an alias or another tool named rg may shadow it.

## Defaults Model

rg is a filter wrapped around a search. By default it:

- searches the current directory recursively (`rg foo` equals `rg foo ./`),
- respects `.gitignore`, `.ignore`, and `.rgignore` rules (precedence:
  `.rgignore` over `.ignore` over `.gitignore`),
- skips hidden files and directories,
- skips binary files (any file containing a NUL byte),
- does not follow symlinks (opt in with `-L/--follow`).

Escalation ladder: `-u` disables ignore-file handling, `-uu` also searches
hidden files, `-uuu` also searches binary files — roughly `grep -r` with no
smart filtering. Individual toggles: `--no-ignore`, `--hidden`, `-a/--text`.

When rg "can't find" a file, diagnose before changing the pattern:

1. `rg --files | rg name` — is the file in the searched set at all?
2. `rg pattern --debug` — which ignore rule or config excluded it? A `*` rule
   in the global gitignore is the most common cause.
3. `rg pattern -uuu` — does the match appear with all filtering off?

## Workflow

1. Compose the simplest command that could work; prefer `-F` for literals.
2. Dry-run the file set with `--files` plus your `-g`/`-t` filters when the
   search scope matters.
3. Run on a narrow path first (`rg pattern src/module`), then widen.
4. For complex or shell-hostile patterns, write one pattern per line to a
   file and use `-f patterns.txt` (patterns are ORed). On Windows this is the
   preferred escape hatch from quoting problems; save the file as UTF-8
   without BOM.
5. Report the command, what it matches, and what it may miss.

## Filtering

- Paths: `rg foo src tests README.md`. Explicitly named files bypass ignore
  rules and hidden-file skipping.
- Globs: `-g '*.toml'` includes; `-g '!*.toml'` excludes — on the command
  line `!` negates, the reverse of gitignore whitelist semantics. Later globs
  override earlier ones. Quote globs so the shell does not expand them.
  `--iglob` is the case-insensitive form. Glob patterns use `/` separators on
  every platform, including Windows.
- Types: `-t py` includes a type, `-T js` excludes one; `--type-list` shows
  the globs behind each type. `--type-add 'web:*.{html,css,js}'` defines a
  type for the current invocation only; persist it in the config file.
- Limits: `--max-filesize 1M` skips large files; `--max-depth NUM` caps
  traversal depth.

## Regex Engines

- The default engine (Rust regex) guarantees worst-case linear time but has
  no lookaround and no backreferences — such patterns fail at compile time
  with a parse error.
- `-P/--pcre2` switches to PCRE2, which supports lookaround and backrefs but
  can backtrack catastrophically. It requires a build with `+PCRE2` in
  `rg --version`; otherwise rg reports PCRE2 is not available.
- `--engine auto` uses the default engine and falls back to PCRE2 only when
  the pattern needs it.
- `-F` treats the pattern as a literal string; `-w` requires word boundaries;
  `-x` requires the pattern to match the whole line; `-e PAT` or `--` safely
  pass patterns that start with `-`.
- Case: `-i` insensitive, `-s` sensitive, `-S` smart-case (insensitive unless
  the pattern contains an uppercase letter).
- Multiline: `-U` lets a match span lines; add `--multiline-dotall` when `.`
  must match newlines. A bare `\n` in a pattern errors without `-U`.
- Unicode is on by default; disable it for a sub-pattern with `(?-u:...)`.

## Output & Pipelines

- Context: `-A NUM`, `-B NUM`, `-C NUM`.
- `-o` prints only the matched text; `-r REPL` rewrites the match in the
  output, supporting `$1`, `$0`, and named groups. See Hard Constraints.
- Machine-readable: `--json` emits JSON Lines with byte offsets and
  submatches; `--vimgrep` prints `file:line:column:text` with one match per
  line; `--column` adds column numbers.
- Lists and counts: `-l` prints files with matches, `--files-without-match`
  the inverse; `-c` counts matched lines per file — use `--count-matches` for
  total matches; `--stats` appends aggregate totals.
- Piping changes defaults: at a TTY rg shows colors, line numbers, and
  headings; when piped it drops them. Force with `--color=always`, `-n`, or
  `--heading`.
- Output order is non-deterministic because rg searches in parallel.
  `--sort path` gives stable order but disables parallelism; `-j1` is a
  cheaper determinism knob.

## Windows Quoting

- cmd.exe: only double quotes delimit strings; single quotes are literal
  characters, so `rg '^foo'` searches for a pattern containing quotes. Use
  `rg "^foo"`. Escape a literal `%` as `%%`.
- PowerShell: prefer single quotes for regexes; `$` inside double quotes
  triggers variable expansion, so `rg "foo$"` breaks while `rg 'foo$'` works.
- Git Bash / MSYS2: POSIX single quotes work, but a pattern or argument
  starting with `/` may be silently rewritten by path translation. Fix with a
  doubled slash (`rg //foo`) or `MSYS_NO_PATHCONV=1 rg /foo`.
- Escape hatch for any shell: put the pattern in a file and use `-f file`,
  saved as UTF-8 without BOM.
- UTF-16 files (common on Windows) are transcoded automatically via BOM
  sniffing; force an encoding with `-E utf-16le` when there is no BOM.

## Hard Constraints

1. `-r/--replace` rewrites rg's OUTPUT only. ripgrep never modifies files and
   has no in-place edit flag. For real edits use the sanctioned pipeline
   `rg foo -l -0 | xargs -0 sed -i 's/foo/bar/g'` (BSD/macOS sed needs
   `-i ''`), or a purpose-built tool such as fastmod.
2. Zero matches usually means default filtering, not a bad regex. Walk the
   Defaults Model diagnosis (`--files`, `--debug`, `-uuu`) before rewriting
   the pattern.
3. Lookaround or backreferences on the default engine fail at compile time.
   Route to `-P/--pcre2` after checking `rg --version` for `+PCRE2`, or
   restate the pattern without those features.

## Debugging Checklist

Zero matches:

1. Verify the binary: `rg --version` and `which rg`.
2. `rg --files | rg name` — is the target file searched at all?
3. Add `--debug` — which ignore rule or config file excluded it?
4. Try `-uuu` — do matches appear with all filtering disabled?
5. Simplify: drop to a `-F` literal, then add regex features back.
6. On Windows, suspect shell quoting; move the pattern to `-f file`.
7. For non-UTF-8 files without a BOM, set `-E` explicitly.

Too many matches:

1. Scope with a path argument, `-g`, or `-t`.
2. Add `-w` for word boundaries or `-x` for whole-line matches.
3. Use `-s` when smart-case or `-i` over-matches.
4. Cap with `-m NUM` matching lines per file.

## Output Contract

When answering an rg task, include:

1. `Command`: copy-pasteable, naming the target shell when quoting matters.
2. `Why these flags`: one line per non-obvious flag.
3. `What it matches / misses`: the filtering and engine boundaries in effect.
4. `Caveats`: ignore-file surprises, output ordering, encoding, or version
   gates (this skill documents ripgrep 15.1.0 behavior).

## Reference

Load `references/cli_reference.md` when the task needs detailed flag
semantics, the engine comparison, config-file format, preprocessors and
compressed search, encodings, or JSON output details.
