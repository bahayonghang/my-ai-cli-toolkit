# API Reference: main.py

**Language**: Python

**Source**: `src/skill_seekers/cli/main.py`

---

## Functions

### create_parser() → argparse.ArgumentParser

Create the main argument parser with subcommands.

**Returns**: `argparse.ArgumentParser`



### main(argv: list[str] | None = None) → int

Main entry point for the unified CLI.

Args:
    argv: Command-line arguments (defaults to sys.argv)

Returns:
    Exit code (0 for success, non-zero for error)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| argv | list[str] | None | None | - |

**Returns**: `int`


