# UV Quick Reference

## Essential Commands

### Project Management
```bash
uv init <name>              # Initialize new project
uv sync                     # Sync dependencies
uv add <package>            # Add dependency
uv add --dev <package>      # Add dev dependency
uv remove <package>         # Remove dependency
uv lock                     # Generate lockfile
```

### Running Code
```bash
uv run <command>            # Run in project env
uv run python script.py     # Run Python script
uv venv                     # Create virtual env
```

### Package Management
```bash
uv pip install <pkg>        # Install package
uv pip uninstall <pkg>      # Uninstall package
uv pip list                 # List packages
uv pip freeze               # List installed packages
```

### Python Version Management
```bash
uv python list              # List available Pythons
uv python install <version> # Install Python
uv python pin <version>     # Pin Python version
```

### Tool Management
```bash
uv tool install <tool>      # Install tool
uv tool list                # List tools
uv tool uninstall <tool>    # Uninstall tool
```

## Migration Cheatsheet

| From pip | To UV |
|----------|-------|
| `pip install pkg` | `uv pip install pkg` |
| `pip install -r req.txt` | `uv pip install -r req.txt` |
| `pip freeze` | `uv pip freeze` |

| From poetry | To UV |
|-------------|-------|
| `poetry add pkg` | `uv add pkg` |
| `poetry install` | `uv sync` |
| `poetry run cmd` | `uv run cmd` |

## File Structure

```
project/
├── pyproject.toml    # Project config
├── uv.lock          # Dependency lockfile
├── .venv/           # Virtual environment
└── src/             # Source code
```