# Research: ripgrep core behavior (default filtering)

- **Query**: Default smart filtering, ignore precedence, hidden/binary skipping, -u ladder, "why didn't rg find my file"
- **Scope**: external
- **Date**: 2026-07-05

## Findings

### Recursive-by-default

- `rg foo` searches the **current directory recursively**. `rg foo` is equivalent to `rg foo ./`. No `-r` flag needed (unlike grep).
- `rg foo src` limits the search to `src`.

### What ripgrep skips by default

When traversing a directory, ripgrep ignores all of the following (GUIDE "Automatic filtering"):

1. Files/dirs matching glob rules in these files, **in increasing precedence**:
   1. `.gitignore` (incl. global `core.excludesFile`, usually `$XDG_CONFIG_HOME/git/ignore`, and repo `$GIT_DIR/info/exclude`; also `.gitignore` in **parent directories that are part of the same git repo**, unless `--no-require-git`).
   2. `.ignore` (application-agnostic) — **takes precedence over** `.gitignore`.
   3. `.rgignore` (ripgrep-specific) — **takes precedence over** `.ignore`.
2. **Hidden** files and directories (dotfiles).
3. **Binary** files — a file is "binary" iff it contains a `NUL` byte anywhere.
4. **Symbolic links are not followed.**

Precedence summary: `.rgignore` > `.ignore` > `.gitignore`. Within one file, later globs override earlier ones. A `!`-prefixed rule in `.ignore`/`.rgignore` whitelists a path that `.gitignore` excluded (e.g. `!log/`).

### Individual toggles

| Behavior                          | Flag              |
| --------------------------------- | ----------------- |
| Disable all ignore-file filtering | `--no-ignore`     |
| Search hidden files/dirs          | `--hidden` (`-.`) |
| Search binary files as text       | `--text` (`-a`)   |
| Follow symlinks                   | `--follow` (`-L`) |

Finer-grained `--no-ignore` family (all verified in `defs.rs`): `--no-ignore-dot`, `--no-ignore-vcs`, `--no-ignore-parent`, `--no-ignore-global`, `--no-ignore-exclude`, `--no-ignore-files`, `--no-ignore-messages`. `--no-require-git` makes ripgrep apply gitignore rules even outside a git repo / stop requiring a `.git` for parent-dir rules.

### The `-u` / `--unrestricted` escalation ladder

Repeating `-u` disables more filtering (GUIDE + README):

- `-u` → disable `.gitignore`/`.ignore`/`.rgignore` handling (same as `--no-ignore`).
- `-uu` → also search **hidden** files/dirs (adds `--hidden`).
- `-uuu` → also search **binary** files (adds `--text`). `rg -uuu` ≈ `grep -r` with no smart filtering.

Great quick diagnostic: if you suspect filtering is hiding results, tack on `-uuu`.

### Binary-file modes (three modes, GUIDE "Binary data")

1. **Default**: on recursive traversal, stop searching a file as soon as a `NUL` is seen; warn if a match was already printed. (An explicitly-named binary file, e.g. `rg foo bin`, is searched in "binary mode" automatically.)
2. **Binary mode** (`--binary`): keep searching until EOF or first match; if no match reported, there truly is none.
3. **Text mode** (`-a/--text`): disable binary detection entirely (can use lots of memory on huge binaries).

Subtlety: binary detection depends on whether mmap is used — with mmap, only the first few KB + each matching line are checked; without mmap, all searched bytes are checked. Use `--no-mmap` for consistent detection.

### "Why didn't ripgrep find my file?" — diagnosis

- **Most common cause** (called out in the GUIDE): a `*` rule in `$HOME/.gitignore` (global gitignore) excludes everything.
- Other causes: the file is hidden, gitignored, binary (has a NUL), or a symlink.
- **Diagnose with:**
  - `--debug` → shows which ignore rule/file excluded a path and which config was loaded.
  - `--files` → prints the list of files ripgrep _would_ search (without searching).
  - `-uuu` → bypass all automatic filtering as a quick test.
  - `--trace` → even more verbose than `--debug` (search strategy, transcoding, etc.).
- `--ignore-file-case-insensitive` matches ignore globs case-insensitively (useful on Windows/macOS case-insensitive FS) but carries a performance penalty and is off by default.

## Caveats / Not Found

- Parent-directory gitignore handling was a frequent source of bugs; several fixes landed in **15.0.0** (BUG #829/#2731/#3067 et al.). Behavior on parent-dir rules is more correct on 15.x than older versions — flag this if a user reports version-dependent ignore behavior.

### Source URLs

- GUIDE (Automatic filtering / Binary data): https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
- README (filtering overview): https://github.com/BurntSushi/ripgrep/blob/master/README.md
- Flag names verified in: https://github.com/BurntSushi/ripgrep/blob/master/crates/core/flags/defs.rs
