# Research: ripgrep on Windows (quoting, paths, encoding, color)

- **Query**: PowerShell vs cmd vs Git Bash quoting pitfalls, glob path separators, UTF-16, FAQ Windows entries, console color
- **Scope**: external
- **Date**: 2026-07-06
- **Version basis**: ripgrep 15.1.0 (see [[01-sources-and-version]]). Windows has first-class support; binaries are static.

## Findings

### Shell quoting: the metacharacter minefield

ripgrep receives its pattern AFTER the shell processes it, so the shell — not ripgrep — is usually to blame for "why didn't my regex work" on Windows.

- **cmd.exe**: uses double quotes only; single quotes are literal characters, NOT string delimiters. So `rg '^foo'` in cmd searches for the pattern `'^foo'` (with literal quotes). Use `rg "^foo"`. `%VAR%` expands; escape a literal `%` as `%%`. `^` is cmd's escape char outside quotes.
- **PowerShell**: both `'single'` (no interpolation) and `"double"` (interpolates `$`) quote. `$` inside double quotes triggers PowerShell variable expansion — use single quotes for regexes containing `$`, e.g. `rg 'foo$'` not `rg "foo$"`. PowerShell also has its own parsing of `|`, `>`, `&`; keep the whole pattern quoted. The stop-parsing token `--%` can pass args through raw.
- **Git Bash / MSYS2 / Cygwin**: POSIX quoting (single quotes best for regex literals), BUT path translation mangles patterns/args beginning with `/` (see below).

Practical rule for the skill: on Windows prefer **double quotes in cmd**, **single quotes in PowerShell** (for patterns with `$`/backslashes), and be explicit; use `-e PATTERN` or `--` before a pattern that begins with `-`.

### Leading `/` under Git Bash/Cygwin/MSYS2 (path translation)

- A pattern or arg starting with `/` may be rewritten by the POSIX layer: `rg /foo` can become `rg C:/msys64/foo` silently.
- Fixes (FAQ "because-cygwin"): (1) don't use cygwin; (2) double the slash `rg //foo`; (3) set `MSYS_NO_PATHCONV=1`, e.g. `MSYS_NO_PATHCONV=1 rg /foo`.
- Source: FAQ "Why does using a leading `/` on Windows fail?" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Glob path separators

- Globs (`-g`, ignore files) use forward slashes `/` internally regardless of platform. Write `-g 'src/**/*.rs'`, not backslashes. Backslashes in globs are treated as escape characters, not path separators, so a Windows-style `src\**` glob will not behave as expected — always use `/`.
- Path ARGUMENTS on the command line may use either separator (`rg foo src\core` works), but GLOB PATTERNS should use `/`.

### UTF-16 and non-ASCII I/O

- UTF-16 is common on Windows; ripgrep **BOM-sniffs and transcodes UTF-16→UTF-8 automatically** (see [[06-config-and-advanced]] / [[02-core-behavior]]), so `rg 'Шерлок' some-utf16-file` just works. Force with `-E utf-16le` when there's no BOM.
- `--ignore-file-case-insensitive` helps on case-insensitive Windows/macOS filesystems so `.gitignore` globs match regardless of case (off by default, perf cost).
- **Piping non-ASCII INTO rg in PowerShell**: controlled by `$OutputEncoding`, which defaults to US-ASCII — non-ASCII chars become `?` before ripgrep ever sees them. Fix: `$OutputEncoding = [System.Text.UTF8Encoding]::new()` (put in your profile to persist). May also need `[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8`.
- Source: FAQ "pipe-non-ascii-windows" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Console color on Windows

- True color works out of the box in Cygwin-style terminals and on Windows 10+ Windows consoles (cmd/PowerShell), with one caveat: clear ripgrep's default `match` style first, because Win10 VT100 can't combine bold + true-color. Use `--colors 'match:none' --colors 'match:fg:0x33,0x66,0xFF'`. Pre-Windows-10 consoles have no known true-color path.
- If killing ripgrep leaves the console foreground color messed up: run `color` in cmd, or `echo -ne "\033[0m"` on Unix-like shells; PowerShell users can add a `Reset-ForegroundColor` helper (FAQ provides the snippet).
- Sources: FAQ "truecolors-windows" and "stop-ripgrep" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Aliases on Windows (PowerShell)

- PowerShell function-aliases don't auto-propagate stdin/args like Unix aliases. The FAQ gives a `grep` wrapper that checks `@($input).Count` and forwards `$args` so both piped and non-piped use work. Simple `function grep() { $input | rg.exe --hidden $args }` is NOT sufficient.
- Source: FAQ "rg-alias-windows" — https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md

### Platform artifacts (recent)

- **15.0.0** added `aarch64` (ARM64) Windows release artifacts; Windows binaries are static executables. Winget install: `winget install BurntSushi.ripgrep.MSVC`.
- Source: CHANGELOG 15.0.0 — https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md

## Caveats / Not Found

- Exact cmd.exe vs PowerShell quoting behavior is general Windows shell knowledge; the ripgrep FAQ documents the leading-`/`, non-ASCII-pipe, alias, and color cases specifically. Treat the `$`-in-double-quotes and single-vs-double distinctions as shell facts, not ripgrep-documented ones.
- There is no ripgrep flag that changes shell quoting — the fix is always at the shell level or via `-e`/`--`.

### Source URLs

- FAQ: https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md
- GUIDE: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
