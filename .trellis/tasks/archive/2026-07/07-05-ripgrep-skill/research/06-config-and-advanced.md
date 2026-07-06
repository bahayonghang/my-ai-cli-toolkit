# Research: ripgrep configuration file and advanced flags

- **Query**: RIPGREP_CONFIG_PATH format/gotchas, --no-config, --pre + --pre-glob, -z/--search-zip, -E/--encoding, -j/--threads, --mmap, perf tips
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]).

## Findings

### Configuration file (`RIPGREP_CONFIG_PATH`)

- ripgrep reads NO config file automatically. You must set the env var `RIPGREP_CONFIG_PATH` to the file's path (any name/location, e.g. `~/.ripgreprc` or `~/.config/ripgrep/rc`).
- **Format rules (exactly two):**
  1. Every line is a single shell argument after trimming whitespace.
  2. Lines starting with `#` (optionally indented) are comments; blank lines are OK.
- **No escaping, no shell parsing.** Each line is passed verbatim as ONE argument.
- **Gotcha — flags that take a value:** put flag and value on the SAME line joined by `=` (`--max-columns=150`), OR on TWO separate lines (flag on one line, value on the next). You may NOT write `--max-columns 150` (space-separated) on a single line — the parser treats the whole line as one argument and fails.
- The config is **prepended** to your command-line args, and later args override earlier ones, so anything in the file can be overridden at the prompt (e.g. config sets `--max-columns=150`, CLI `-M0` overrides).
- Diagnose which config loaded and what args came from it with `--debug`.
- Example config (from GUIDE):
  ```
  --max-columns=150
  --max-columns-preview
  --type-add
  web:*.{html,css,js}*
  --hidden
  --glob=!.git/*
  --smart-case
  ```
- Source: GUIDE "Configuration file" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### `--no-config`

- Guarantees ripgrep ignores `RIPGREP_CONFIG_PATH` and any future env-based config, regardless of what's set. Use for reproducible/scripted invocations.
- Source: GUIDE "Configuration file" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Preprocessor: `--pre CMD` and `--pre-glob GLOB`

- `--pre CMD` runs `CMD` on every file before searching; ripgrep passes the file path as the sole argument and the file contents on stdin, and searches CMD's stdout. Enables searching PDFs, etc. (e.g. wrap `pdftotext - -`).
- CMD must be on `PATH` or given as an absolute path.
- **`--pre-glob GLOB`** restricts which files invoke the preprocessor (huge perf win — otherwise every file pays process-spawn overhead). Example: `rg --pre pre-rg --pre-glob '*.pdf' 'fn is_empty'`.
- A robust preprocessor script should `exec cat` for non-target files so plain files still search normally.
- Source: GUIDE "Preprocessor" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Compressed search: `-z/--search-zip`

- Off by default. Decompresses on the fly by **shelling out** to external binaries. Supported formats: gzip, bzip2, xz, lzma, lz4, Brotli, Zstd — each needs the corresponding binary (`gzip`, `bzip2`, `xz`, `lz4`, `brotli`, `zstd`) installed.
- **Does NOT search archive formats** — `*.tar.gz` (the tar layer) is skipped; only the compression layer is handled.
- Source: FAQ "compressed" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Encoding: `-E/--encoding`

- Default is `--encoding auto`: input assumed ASCII-compatible (ASCII/latin1/UTF-8). ripgrep does **UTF-16 BOM sniffing** by default — reads the first 3 bytes; if a UTF-16 BOM is present it transcodes UTF-16→UTF-8 before searching (perf penalty; invalid UTF-16 → replacement codepoint).
- `-E LABEL` forces an encoding from the WHATWG Encoding Standard (e.g. `utf-16le`, `latin1`, `gbk`, `euc-jp`, `shift_jis`); ripgrep assumes ALL searched files use it (unless a BOM says otherwise) and transcodes.
- `-E none`: disable ALL encoding logic including BOM sniffing — search raw bytes with no transcoding.
- Sources: GUIDE "File encoding" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md ; README — https://github.com/BurntSushi/ripgrep/blob/master/README.md

### Threads and memory maps

- `-j/--threads NUM`: cap worker threads. `-j1` forces single-threaded (also yields deterministic order, cheaper than `--sort`). Default is a heuristic based on CPU count.
- `--mmap` / `--no-mmap`: ripgrep auto-chooses memory-mapped vs incremental buffered reads (mmap tends to win for single large files; buffered for big trees). `--no-mmap` forces buffered reads — relevant because **binary detection differs** by strategy (see [[02-core-behavior]]): with mmap only the first few KB + matching lines are checked; without mmap all searched bytes are checked. Use `--no-mmap` for consistent binary detection at a small perf cost.
- Source: GUIDE "Binary data" and "Common options" — https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md

### Regex/DFA size limits (perf tuning)

- `--regex-size-limit` (default ~10 MB, error: `Compiled regex exceeds size limit of 10485760 bytes`): raise for huge patterns, e.g. `--regex-size-limit 1G`. Raising the limit doesn't force that much memory use — it's a ceiling.
- `--dfa-size-limit`: cache size for the lazy DFA; raising it (e.g. `--dfa-size-limit 1G`) speeds up large `-f/--file` pattern sets that would otherwise spill to a slower engine.
- Source: FAQ "size-limit" and "dfa-size" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Man page & completions (generated, not shipped in repo)

- `rg --generate man` prints the roff man page; `rg --generate complete-{bash,zsh,fish,powershell}` prints shell completions. Man page content == `rg --help`; `rg -h` is the condensed one-line-per-flag form.
- Source: FAQ "manpage"/"complete" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

## Caveats / Not Found

- Config file value-splitting is the #1 config gotcha: `--flag value` on one line silently fails to parse as intended. Always use `--flag=value` or two lines.
- `-z` archive limitation frequently surprises users expecting `*.tar.gz` contents to be searched — they are not.
- Exact default `-j` thread count is host-dependent; not a fixed number.

### Source URLs

- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
