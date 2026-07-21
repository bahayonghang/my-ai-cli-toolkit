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
