# uv Command Patterns

Use these patterns when applying the `uv-workflow` skill.

## Cache Setup

Set `UV_CACHE_DIR` when the default uv cache may be outside the writable workspace or sandbox.

PowerShell:

```powershell
$env:UV_CACHE_DIR = Join-Path $env:TEMP 'uv-cache-codex'
uv run path\to\script.py
```

POSIX shell:

```bash
UV_CACHE_DIR=/tmp/uv-cache uv run path/to/script.py
```

If a workspace already defines a project-specific temporary cache directory, prefer that over a generic temp path.

## Execution Patterns

Run a script:

```powershell
uv run scripts\demo.py
```

Run a module:

```powershell
uv run -m package.module
```

Run a one-liner:

```powershell
uv run python -c "print('hello')"
```

Run with an ad hoc dependency:

```powershell
uv run --with httpx python -c "import httpx; print(httpx.get('https://example.com').status_code)"
```

Run a tool exposed by dependencies:

```powershell
uv run pytest
```

Use `uv help run` when the correct `uv run` invocation is unclear.

## Standalone PEP 723 Scripts

Create a script:

```powershell
uv init --script scripts\demo.py
```

Add dependencies:

```powershell
uv add --script scripts\demo.py httpx rich
```

Remove dependencies:

```powershell
uv remove --script scripts\demo.py rich
```

Run the script:

```powershell
uv run scripts\demo.py
```

Rules:

- Treat `uv init --script` as the supported way to create the script header and inline metadata.
- Treat `uv add --script` and `uv remove --script` as the supported ways to change script dependencies.
- Edit normal Python code in the script as needed, but leave inline metadata management to `uv`.
- If a user asks to hand-edit metadata, call out the conflict and prefer the matching `uv` command.
- Use `uv help init`, `uv help add`, or `uv help remove` when flags are unclear.

## Full Projects

If the workspace has a `pyproject.toml` and the task is project-oriented, use normal project `uv` workflows. Examples include `uv run`, `uv add`, `uv remove`, `uv sync`, and `uv lock`.

Do not use `uv init --script`, `uv add --script`, or `uv remove --script` for project dependency management.
