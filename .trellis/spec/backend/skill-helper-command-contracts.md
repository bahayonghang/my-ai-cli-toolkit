# Skill Helper Command Contracts

## Scenario: Environment-backed argv templates

### 1. Scope / Trigger

Apply this contract when a skill-local helper accepts an environment variable that represents an executable command or command template. The concrete reference is `IMAGE2_COMMAND` in `skills/developer-tools-integrations/image-to-ui-skill/scripts/image2_asset.py`.

This prevents user values such as prompts and Windows paths from being reparsed as shell syntax, and prevents dry-run diagnostics from mutating the workspace or claiming unavailable channels succeeded.

### 2. Signatures

```text
IMAGE2_COMMAND=<POSIX shell-word command or complete argv template>

python "<skill-dir>/scripts/image2_asset.py" generate \
  --prompt <text> --output <path> [--size <size>] [--quality <quality>] \
  [--output-format <format>] [--prefer auto|image2|fallback] [--dry-run]
```

Windows PowerShell may use `py -3` instead of `python`. `<skill-dir>` is a literal path supplied by the skill loader, not an environment variable.

### 3. Contracts

- Parse the command template into argv tokens before injecting user values.
- Supported `IMAGE2_COMMAND` placeholders are `{prompt}`, `{output}`, `{size}`, `{quality}`, and `{output_format}`.
- A command containing any supported placeholder is a complete template. A command without placeholders is a base command to which the helper appends its standard action and options.
- User values remain one argv token even when they contain whitespace, braces, or Windows backslashes.
- Literal braces in the command template use the normal escaped formatter form (`{{` and `}}`).
- Dry-run prints a platform-appropriate command representation and uses `planned-channel=...`; it does not create directories or output files.
- Fallback dry-run reports every missing prerequisite. It may still return `0` because it validates construction rather than execution.

### 4. Validation & Error Matrix

| Condition | Behavior |
| --- | --- |
| Unknown or malformed placeholder | stderr names the invalid template; exit `2`; no traceback |
| `--prefer image2` with no native command | stderr explains the missing command; exit `2` |
| Real fallback with missing CLI and/or credential | stderr lists all missing prerequisites; exit `3` |
| Fallback dry-run with missing prerequisites | stderr uses `fallback not ready`; exit `0`; no filesystem writes |
| Native or fallback dry-run | stdout uses `planned-channel`; no filesystem writes |
| Executed child command returns nonzero | propagate the child code for native execution, then follow the documented auto-fallback policy |

### 5. Good/Base/Bad Cases

- Good: `IMAGE2_COMMAND='mytool --prompt {prompt} --out {output}'` preserves `hello world` and `out\\x.png` as two complete values.
- Base: `IMAGE2_COMMAND='image2'` receives the helper's standard `generate/edit` arguments.
- Bad: formatting the template string before splitting it, which turns prompt whitespace into new argv tokens and consumes Windows backslashes under POSIX shell parsing.
- Bad: creating `output.parent` before checking `--dry-run` or channel readiness.

### 6. Tests Required

- Execute a capture helper and assert the exact argv array for whitespace, backslash, size, quality, and output format values.
- Cover a command with no placeholders and commands whose only placeholder is `{quality}` or `{output_format}`.
- Assert unknown placeholders fail without a traceback.
- Assert native and fallback dry-runs leave the target parent directory absent.
- Assert fallback diagnostics report both a missing CLI and missing credentials.
- Assert documented exit codes `2` and `3` remain distinct.
- Assert every SKILL.md invocation uses `<skill-dir>` and documents the Windows `py -3` fallback.

### 7. Wrong vs Correct

#### Wrong

```python
return shlex.split(template.format(**values))
```

#### Correct

```python
tokens = shlex.split(template)
return [token.format(**values) for token in tokens]
```

The correct order gives the command template shell-word semantics while keeping injected values opaque to the parser.

## Scenario: Opt-in Chromium demo validation

### 1. Scope / Trigger

Apply this contract when a skill ships browser-backed demo validation but the repository's default test command must remain browser-independent. The reference implementation is `scripts/validate_demo.mjs` in `image-to-ui-skill`.

### 2. Signatures

```text
node <demo-dir>/validate.mjs
IMAGE2_SKILL_BROWSER_TESTS=1 just node-test
CHROME_PATH=<absolute Chromium executable>
```

The runner targets plain Node 20 and uses Chromium `--remote-debugging-pipe` over child fds 3/4.

### 3. Contracts

- Default Node tests always run deterministic structure, server, discovery, and CDP framing tests; only real browser smoke tests skip.
- Explicit opt-in is fail-closed: browser absence, unsupported capability, unexecuted demos, and nonzero demo exits fail the test.
- An explicit `CHROME_PATH` is authoritative. An invalid path returns exit `2` without falling back to auto-discovery.
- CDP messages are NUL-delimited JSON; pending requests are rejected on timeout, pipe close, process exit, or spawn error.
- stdout ends with one JSON result line. Human diagnostics use stderr.
- Temporary browser profiles are removed only after the child exits, with Windows retry handling.

### 4. Validation & Error Matrix

| Condition | Behavior |
| --- | --- |
| Browser unavailable or invalid explicit path | exit `2` |
| Runtime/Chromium capability unsupported | exit `3` |
| Server, process, pipe, timeout, or CDP failure | exit `4` |
| Demo assertion failure | exit `1` with failed step |
| Default test without opt-in | browser subtests skip visibly; core tests pass |
| Explicit opt-in with any missing prerequisite | test fails; never converts the failure to skip |

### 5. Good/Base/Bad Cases

- Good: CI sets `IMAGE2_SKILL_BROWSER_TESTS=1` and both demos return `ok=true` with desktop/mobile screenshots.
- Base: local `just node-test` runs all deterministic checks and reports exactly two browser skips.
- Bad: treating exit `2` or `3` as skip after the user or CI explicitly enabled browser tests.
- Bad: deleting a legacy validator before a recorded old/new parity matrix is green.

### 6. Tests Required

- Browser discovery tests for Windows, macOS, Linux, and invalid explicit override.
- Static server tests for MIME, 404, plain traversal, and percent-encoded traversal.
- CDP tests for split frames, session ids, error responses, timeout, and spawn failure.
- Direct demo tests for exit code, final JSON, assertion results, and screenshot size.
- A default full-suite run with visible skips and an opt-in full-suite run with zero skips.
- Asset and tracked screenshot diff checks before completion.

### 7. Wrong vs Correct

#### Wrong

```js
if (result.status === 2 || result.status === 3) test.skip('browser unavailable');
```

#### Correct

```js
const enabled = process.env.IMAGE2_SKILL_BROWSER_TESTS === '1';
test('browser smoke', { skip: !enabled }, () => {
  assert.equal(result.status, 0, result.stderr);
});
```

The skip decision belongs only to the absence of explicit opt-in, never to the result of an enabled validation run.

## Scenario: Resolve npm CLI shims before shell-free execution on Windows

### 1. Scope / Trigger

Apply this contract when a Python skill helper launches a CLI that may be installed by npm and must keep `shell=False`. On Windows, npm commonly exposes `tool.cmd`; `subprocess.run(["tool", ...], shell=False)` does not apply `PATHEXT` lookup and can raise `FileNotFoundError` even when PowerShell and `where.exe` find the command.

### 2. Signatures

```python
executable = shutil.which("codex")
subprocess.run([executable, *args], shell=False, check=False)
```

The executable name is fixed by the helper. User-controlled values may populate later argv elements but never the executable name or a shell command string.

### 3. Contracts

- Resolve the fixed executable with `shutil.which()` immediately before execution.
- Treat a missing result as an expected CLI error; print a concise stderr message and return the helper's documented not-found code.
- Pass the resolved absolute executable and all arguments as a list with `shell=False`.
- Preserve user paths, model names, and configuration values as individual argv elements.
- Record the actual resolved argv when the helper persists execution provenance.
- A dry run may display the resolved argv but must not execute the child or mutate runtime files.
- Do not use `shell=True`, `cmd /c`, or PowerShell command strings merely to make an npm shim discoverable.

### 4. Validation & Error Matrix

| Condition | Behavior |
| --- | --- |
| Native executable or npm `.cmd` is found | Execute the resolved absolute path with the original argv list |
| Executable is absent from `PATH` | stderr names the missing CLI; return the documented not-found code; no traceback |
| Child returns nonzero | Preserve the child exit/status evidence under the helper contract |
| Project path contains spaces or non-ASCII text | Keep the path as one argv element; execution behavior is unchanged |
| Dry run requested | Print the planned argv; do not execute or write state |

### 5. Good/Base/Bad Cases

- Good: Windows resolves `codex.cmd`, runs it with `shell=False`, and records the `.cmd` path as argv element zero.
- Base: Linux/macOS resolves a native executable or executable shim and uses the same list contract.
- Bad: `subprocess.run(["codex", ...], shell=False)` assumes Windows performs `PATHEXT` resolution.
- Bad: changing to `shell=True` makes project paths and model/config values part of shell parsing.

### 6. Tests Required

- Prepend a temporary fake-bin directory to `PATH` and install a `tool.cmd` fixture on Windows plus an executable shim on POSIX.
- Run the helper against a project path containing spaces and non-ASCII characters.
- Assert success provenance records an argv array and, on Windows, argv element zero ends in `.cmd`.
- Assert a missing executable fails without a traceback and leaves no false success status.
- Assert dry run is side-effect free.

### 7. Wrong vs Correct

#### Wrong

```python
subprocess.run(["codex", "exec", "--cd", str(project)], shell=False)
```

#### Correct

```python
executable = shutil.which("codex")
if executable is None:
    print("ERROR: codex executable was not found on PATH", file=sys.stderr)
    return 127
subprocess.run([executable, "exec", "--cd", str(project)], shell=False)
```

## Scenario: UTF-8 native command capture on Windows

### 1. Scope / Trigger

Apply this contract when a skill-local Python helper captures text from a native CLI whose output contract is UTF-8, including `gh` JSON, GraphQL, and Actions logs. Windows Python may otherwise decode `text=True` pipes with the active legacy code page (commonly GBK), causing a background `UnicodeDecodeError` and leaving `stdout` as `None`.

### 2. Signatures

```text
subprocess.run(argv, capture_output=True, text=True,
               encoding="utf-8", errors="replace")
```

Use a binary subprocess contract instead when the command intentionally returns archives, images, or other bytes; decode only the text error channel explicitly.

### 3. Contracts

- Pass argv as a list and capture stdout/stderr without a shell.
- Set `encoding="utf-8"` and `errors="replace"` on every text subprocess boundary whose CLI contract is UTF-8.
- Treat replacement characters as degraded evidence, not as a reason to crash the helper.
- Keep binary payloads in bytes. Decode stderr with UTF-8 and `errors="replace"` when reporting failures.
- Normalize a defensively typed text result with `result.stdout or ""` before calling text methods when an injected or mocked runner can return `None`.

### 4. Validation & Error Matrix

| Condition | Behavior |
| --- | --- |
| UTF-8 output contains characters outside the active Windows code page | Decode successfully with UTF-8; no reader-thread exception |
| Output contains malformed UTF-8 bytes | Replace invalid sequences; preserve the rest of the evidence |
| Native command returns nonzero | Report decoded stderr/stdout under the helper's documented exit-code contract |
| Command returns a binary success payload | Keep stdout as bytes; never enable `text=True` |
| Captured text is unexpectedly `None` in a test double | Normalize to empty text or fail with a specific contract error, never an unrelated `AttributeError` |

### 5. Good/Base/Bad Cases

- Good: an Actions log containing Chinese or arbitrary Unicode is captured and summarized on Windows.
- Base: ASCII JSON behaves identically across Windows, macOS, and Linux.
- Bad: `subprocess.run(..., text=True)` relies on the locale and fails inside Python's pipe-reader thread before application error handling can run.
- Bad: enabling text mode for a job-log archive corrupts or rejects the binary payload.

### 6. Tests Required

- Mock `subprocess.run` and assert `encoding="utf-8"` plus `errors="replace"` for text CLI wrappers.
- Include a non-ASCII stdout fixture and assert it survives unchanged.
- Cover nonzero exit handling with non-ASCII stderr.
- Keep a separate binary-wrapper test when the helper downloads bytes.
- When practical, run one read-only live smoke test against the actual CLI on Windows; unit tests cannot reproduce Python's background pipe-reader failure with a prebuilt string.

### 7. Wrong vs Correct

#### Wrong

```python
process = subprocess.run(argv, capture_output=True, text=True)
```

#### Correct

```python
process = subprocess.run(
    argv,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace",
)
```

The explicit encoding makes the native command's output contract authoritative instead of the host console code page.

## Scenario: Lint chat payloads without creating files

### 1. Scope / Trigger

Apply when a skill promises chat-only output but requires its generated command
to pass a bundled linter. The reference is goal-meta-skill's
`scripts/lint_goal_command.py` and `tests/lint-goal-command.test.mjs`.

### 2. Signatures

```text
python "<skill-dir>/scripts/lint_goal_command.py" --platform codex -
python "<skill-dir>/scripts/lint_goal_command.py" --contract --expected-path GOAL.md -
```

Pass the candidate on stdin; existing UTF-8 file arguments remain available.

### 3. Contracts

- Decode stdin bytes as UTF-8 with optional BOM. A candidate contract must not
  silently replace invalid bytes or require a temporary file to be linted.
- Validate each copied `/goal` payload separately. Wrapper prose and another
  command cannot supply missing fields or a platform's positive completion proof.
- Raw commands end at an empty line or the next `/goal`; fenced commands end
  at their closing fence or the next `/goal`. Retain fenced blank lines for
  explicit rejection instead of accepting a truncated prefix.
- Measure only the extracted objective, excluding `/goal` and Markdown fences.
- Keep envelope layout and whole-output forbidden-command checks at their
  existing layer. Persisted contracts keep their separate section parser;
  short launchers are not full inline contracts.

### 4. Validation & Error Matrix

| Input | Result |
| --- | --- |
| Valid UTF-8/BOM through a file or stdin | Same validation outcome; no candidate output file |
| Invalid UTF-8 or repeated `-` | Nonzero exit with an input/argument error |
| Incomplete command plus complete wrapper or adjacent command | Nonzero exit identifying the incomplete Goal |
| Fenced command with an internal blank line | Nonzero exit; no silent truncation |
| Objective at the existing budget, raw or fenced | Same length result; no wrapper characters counted |

### 5. Good/Base/Bad Cases

Good: lint the reviewed Chinese candidate through stdin before presenting it.
Base: lint an existing file through the same validation path.
Bad: let the English mirror supply fields missing from the Chinese command.

### 6. Tests Required

Cover stdin/file parity, BOM, invalid UTF-8, duplicate stdin arguments, no
candidate output files, wrapper borrowing, a malformed second Goal, exact
length and length-plus-one, and fenced blank lines. Keep writer and optional
profile regressions passing; these tests do not prove provider behavior.

### 7. Wrong vs Correct

Wrong: validate required fields against the entire presentation packet and
count characters until a blank line, including the closing fence.

Correct: extract each command once for local validation and length accounting;
validate the presentation envelope separately without lending it to a command.

## Scenario: design-atlas colourway dial (`apply --palette`, `palette`)

### 1. Scope / Trigger

- Trigger: `skills/development-workflows/design-atlas/scripts/design_catalog.py`
  gained a flag and a subcommand that rewrite an entry's colours per project.
  Applies when adding a dial to another entry, changing preset data, or
  touching the token reader in `collect_signals`.

### 2. Signatures

```text
design_catalog.py apply <id> [--root DIR] [--force] [--palette auto|<preset>|hue:<0-359>] [--prompt TEXT]
design_catalog.py palette <id> [--root DIR] [--prompt TEXT] [--palette ...] [--format text|json]
```

- `scripts/palette.py`: `load_palettes()`, `gates(colors, fixed, theme="light")`
  (`theme` is `light` or `dark`), `failed_gates(colors, dark, fixed)`,
  `derive(hue, spec)`, `choose(spec, *, signal, prompt, project, override)`,
  `render(template, choice, spec)`. Pure functions; no project writes.
- A colourway is two groups with the same nine roles (design-atlas 0.7.0,
  `bahayonghang/my-ai-cli-toolkit#51`). `derive` and `choose` return the light
  group as `colors` and the dark group as `dark`. `apply` always writes both.
- Data: `assets/catalog/overlays/palettes.json`, keyed by entry id. Only
  `style:airy-glass` has a dial today.

### 3. Contracts

- `palettes.json` per entry: `default`, `match_degrees`, `min_accent_chroma`,
  `min_accent_lightness`, `output_offsets`, `reserved_hues` (a band with
  lo > hi wraps through 0), `fixed`, and `presets.<name>` with `anchor`,
  `label.{zh,en}`, nine role hex values (`field-start`, `field-end`,
  `blob-start`, `blob-end`, `blob-mid`, `input`, `input-wash`, `output`,
  `output-wash`), `dark` with the same nine roles, and `keywords_en` /
  `keywords_zh`.
- `fixed` (design-atlas 0.7.0): `ink`, `muted`, `sheet-alpha` (0.62),
  `overlay-alpha` (0.82), `blob-alpha` (0.7), `well-alpha` (0.04), and
  `control-edge` as `{color, alpha}` (`#24303A`, 0.54). The entry frontmatter
  repeats these as `rgba()` tokens; `tests/test_palette.py` keeps them equal.
- `fixed.dark`: `ink` (`#E7EDF3`), `muted` (`#A3AFBD`), and six
  `{color, alpha}` layers: `sheet` (`#1C2530`, 0.6), `overlay` (`#1E2834`,
  0.84), `sheet-edge` (white, 0.08), `sheet-highlight` (white, 0.06),
  `overlay-highlight` (white, 0.08), `control-edge` (white, 0.36). Dark paper
  is its own colour at an alpha, never white at an alpha. `blob-alpha` and
  `well-alpha` are shared by both groups. The entry repeats the dark values as
  `-dark` keys in `colors:` and `elevation:`.
- `derive` adds the three blobs at fixed OKLCH lightness and chroma: the input
  hue, the output hue, and the hue halfway between on the shorter arc. The six
  colours derived before 0.7.0 do not change. A colourway that fails a gate is
  refused; lower the blob chroma or `blob-alpha`, never raise `sheet-alpha`.
- `derive` builds the dark group from the same three hues, each role at a
  fixed OKLCH lightness and chroma. A hue whose light or dark group fails a
  gate is refused with `ValueError`; a failed dark gate is named
  `dark <id>`.
- Selection order for `auto`: explicit `--palette`; first accent-named CSS
  token that clears both chroma and lightness floors (nearest preset within
  `match_degrees`, else derived from its hue); preset keywords in prompt
  (weight 1) and project text (weight 0.5); `default`.
- `signals.palette` keeps `band`, `paper_var`, `L`, `accent_var`,
  `accent_hue`, and adds `accent_C`, `accent_hex`, `accents[]`. When an accent
  exists and no paper token does, it is an object whose `band`, `paper_var`,
  and `L` are null. Consumers test `band` for truthiness.
- `signals.frameworks` (design-atlas 0.7.0) lists npm frameworks in
  `FRAMEWORKS` order, then Cargo frameworks read from the root `Cargo.toml`
  only: `[dependencies]`, `[workspace.dependencies]`, and every
  `[target.<cfg>.dependencies]`. A dependency whose key or `package` field is
  `gpui` adds `gpui`; `gpui-component` or `gpui-kit` adds `gpui` and
  `gpui-kit`. Other published names of the same crates go in the same
  `CARGO_FRAMEWORKS` table and in the test (`gpui-pre`, `gpui-ce`: checked
  against crates.io and `gpui-ce/gpui-ce` on 2026-11-16).
  - With `gpui` reported and no CSS token layer, the note
    `no CSS token layer found` is replaced by one saying the tokens are in
    Rust source, which the script does not read, and that the colourway comes
    from `--palette` or `--prompt`.
  - With `gpui` reported, `notes` also carries one line that names
    `references/implementation-gpui.md` (`GPUI_SPEC`), with or without a CSS
    token layer (`bahayonghang/my-ai-cli-toolkit#52`). The path is relative
    to the skill directory and must exist; `tests/test_gpui_contract.py`
    checks it. The child-crate hint below does not carry this line.
  - With no GPUI dependency in the root manifest, `<child>/Cargo.toml` one
    level down is checked, skipping `SKIP_DIRS`. A hit adds a note with that
    relative path and the `--root` to rerun with; `frameworks` does not change.
  - The keys of the `signals` object do not change, `signals` stays
    read-only, and `route` scoring does not read Cargo dependencies.
  - Inference, not confirmed by the ticket: `gpui-fast` is in the table;
    `[dev-dependencies]` and `[build-dependencies]` are not read; the child
    check also runs when the root has no `Cargo.toml`.
- The entry file is the render template. The default hex values of both
  groups are replaced in one regex pass; the `<!-- palette:begin NAME -->` /
  `<!-- palette:end NAME -->` blocks are rewritten whole. There are four:
  `colourway`, `colourway-dark`, `contrast`, `contrast-dark`. A block name is
  lowercase words joined by single hyphens (`[a-z]+(?:-[a-z]+)*`); a
  well-formed name outside the four, or a missing one, is `ValueError`.
  `apply` appends `<!-- palette: <name>; reason: ... -->` under the provenance
  comment and prints `palette: <name> (<reason>)` after `wrote:`.
- The swap is hex for hex. The 18 default values are distinct, and no preset
  or derived colourway may use a default hex in a different role, or a second
  render of the same file swaps the wrong role.
- `palette --format json`: `entry`, `palette`, `reason`, `notes`, `colors`,
  `contrast[]` of `{id, fg, bg, ratio, min, pass}`, and `dark`. A reported row
  has `min: null` and `pass: null`. The six keys before `dark` are the light
  group and keep the meaning they had before the dark group.
  - `dark` (0.7.0) is `{colors, contrast[]}`: `colors` holds the nine dark
    role hex values, and `contrast[]` rows have the same six keys, in the dark
    gate order below.
- `palette` text output: `colors:` and `contrast:` for the light group, then
  `dark colors:` and `dark contrast:`. The light lines are the ones printed
  before the dark group existed.
- Contrast: each layer is mixed over the one below per sRGB channel and
  rounded to 8 bits, then WCAG 2.x luminance. The field has eight backgrounds:
  the two ends, and each blob at `blob-alpha` over each end. Paper is white at
  `sheet-alpha` over one of them; the neutral well is `ink` at `well-alpha`
  over that paper. A `-worst` row uses the background with the lowest ratio
  for that pair.
- Dark contrast uses the same eight-background rule with the dark values:
  paper is `fixed.dark.sheet` over one of them, an overlay is
  `fixed.dark.overlay` over one of them, and the neutral well is the dark
  `ink` at `well-alpha` over that paper. The paper-to-field ratio stays
  reported only.
- Gate rows, in order. Minimum 4.5 unless stated: `ink-white`,
  `ink-sheet-start`, `ink-sheet-end`, `muted-sheet-start`, `muted-sheet-end`,
  `ink-sheet-worst`, `muted-sheet-worst`, `muted-well-worst`,
  `ink-field-worst`, `muted-field-worst` (reported), `control-edge-sheet`
  (3.0), `input-wash`, `input-sheet-worst`, `input-white`, `output-wash`,
  `output-sheet-worst`, `output-white`, `edge-field` (reported), `sheet-field`
  (reported; the smallest paper-to-field ratio, which is about 1.07 by design).
- Dark gate rows, in order: the 19 rows above with `ink-solid`,
  `input-solid` and `output-solid` in place of the three `-white` rows, then
  `ink-overlay-worst`, `muted-overlay-worst`, `control-edge-overlay` (3.0),
  `input-overlay-worst`, `output-overlay-worst`. 24 rows, 21 gated.
- Inference, not confirmed by the ticket: the rows `muted-well-worst`,
  `input-sheet-worst`, `output-sheet-worst` and `sheet-field`, the
  `well-alpha` of 0.04, and the blob lightness and chroma template.
- Inference, not confirmed by `bahayonghang/my-ai-cli-toolkit#51`:
  - the five dark overlay rows. A dark overlay is lighter than dark paper, so
    it is the weaker surface for light text; a light overlay is whiter than
    light paper, so the light group has no overlay rows;
  - the `-solid` rows measure the opaque paper colour (`#1C2530`), which is
    also the dark opaque fallback for overlays and the label on an input fill
    (`on-input-dark`);
  - the dark `edge-field` row is `sheet-edge` over paper against the field
    start;
  - the block names, the key name `dark` and its shape, and the text section
    names;
  - the dark derivation template, the dark accents of `mint`, and the two
    `mint` dark washes, which are hand values chosen so that no derived hue
    reuses them in another role.

### 4. Validation & Error Matrix

| Input | Result |
| --- | --- |
| `--palette` not `auto`, a preset name, or `hue:0`–`hue:359` | exit 2, nothing written |
| `--palette` or `--prompt` on an entry with no dial | exit 2, nothing written |
| Chosen colourway fails a gate in either group, or a `palette:` marker is missing | exit 1, nothing written. stderr names each failed gate; a dark one as `dark <id>` |
| `palette` on a colourway that fails a gate in either group | The report is still printed; exit 1, with the same names on stderr |
| Any failure together with `--force` | Existing `DESIGN.md` is not renamed |
| Accent below `min_accent_chroma` or `min_accent_lightness` | Skipped with a note; next candidate tried |
| Entry without a dial, no palette flags | Output byte-identical to before |

### 5. Good/Base/Bad Cases

- Good: `--color-primary: #2563EB` picks `sky` and the reason names the token.
- Base: no CSS tokens and no domain keyword falls back to `mint`, labelled as
  a fallback.
- Bad: a README `## Community` heading, or shadcn's near-black `--primary`
  (`#0F172A`), selecting a preset.

### 6. Tests Required

`tests/test_palette.py` must keep asserting:

- the mint rows that do not depend on paper reproduce 13.47 / 4.79 / 5.31 /
  5.08 / 5.79 / 1.11; paper over the bare field ends gives 12.97 / 12.56
  (ink) and 5.29 / 5.13 (muted);
- the mint worst-background rows are 12.16 (`ink-sheet-worst`), 4.96
  (`muted-sheet-worst`), 10.19 (`ink-field-worst`), 4.16
  (`muted-field-worst`), 3.17 (`control-edge-sheet`) and 1.07 (`sheet-field`).
  3.17 is this entry's ink; 3.29 in the parent issue needs SkillPort's ink
  `#1F2A37`, and the test asserts both;
- every preset and all 360 derived hues pass every gate, field chroma stays
  at or below 0.03, and the output hue is outside the reserved bands;
- the mint dark worst-background rows are 13.04 (`ink-sheet-worst`), 6.90
  (`muted-sheet-worst`), 12.86 (`ink-field-worst`), 6.81
  (`muted-field-worst`), 3.24 (`control-edge-sheet`) and 1.01 (`sheet-field`),
  the dark column of the parent issue's table; the other 18 mint dark rows are
  fixed as literals too;
- the dark group of every preset and of all 360 derived hues passes every dark
  gate, and a colourway whose dark group alone fails is refused by `derive`,
  `apply` and `palette`;
- no preset or derived colourway uses a default hex of either group in a
  different role;
- `hue:202` still derives the six colours it derived at 0.6.0;
- the entry names `backdrop-filter` only in overlay rules and overlay CSS, and
  `styles/airy-glass.md` equals `first-party/airy-glass.md` byte for byte;
- `assets/reference/airy-glass/index.html` has the mint `:root` values, blurs
  only `.overlay`, makes no external request, and passes `slop_check` next to
  the `apply` output. Its two dark token blocks (system appearance, and
  `data-theme="dark"`) are equal to each other, to `presets.mint.dark` and to
  `fixed.dark`. `slop_check` reads one value per token, last declaration
  wins, so the test runs it on the page as shipped (dark values) and on the
  page without the dark blocks (light values);
- rendering a rendered file again with the same choice changes nothing, and
  no default hex that the chosen colourway does not use is left in the output;
- every exit-2 and exit-1 path leaves the project directory unchanged;
- for every other entry, `show` prints the catalog file and `apply` writes it
  plus provenance only, with or without project signals;
- `tests/fixtures/slop/airy-glass-field/DESIGN.md` equals current `apply` output.

`tests/test_routing.py` (`CargoSignalTests`) must keep one fixture for each
`signals.frameworks` case above, and `SignalTests` must keep
`frameworks == ["next"]` for the npm fixture.

### 7. Wrong vs Correct

#### Wrong

```python
# First accent-named token wins, and the renamed backup happens first.
accent = _pick_prop(props, ACCENT_NAMES)
backup_existing(root)
colors = choose(...)          # may fail after the rename
```

A gray `--accent` hides a chromatic `--primary`, and a failed run loses the
user's `DESIGN.md` name.

#### Correct

```python
for candidate in accents:     # skip gray and near-black, note each skip
    ...
choice = choose(...)          # validate and gate first
if failed_gates(choice["colors"], choice["dark"], fixed):   # both groups
    return 1
backup_existing(root)         # only after every check passed
```

> **Warning**: keyword lists must name an industry or product domain. Words
> that appear in any README (`community`, `security`, `enterprise`, `cloud`,
> `health`) select a preset from a heading alone.

> **Warning**: the CSS token reader accepts a last declaration with no
> trailing semicolon. Strip comments before reading, or
> `/* --brand: #f00 */` is read as a token.
