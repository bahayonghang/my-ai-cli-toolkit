# UV Expert

Expert guidance for uv, the extremely fast Python package and project manager.

## Overview

UV Expert provides comprehensive guidance for uv, a Python package and project manager written in Rust. UV offers a unified interface for dependency management, project creation, virtual environments, and more - all with blazing fast performance.

## Features

- ⚡ **10-100x Faster** - Rust-powered speed for all operations
- 📦 **Unified Interface** - One tool for packages, projects, and environments
- 🔄 **pip Compatible** - Drop-in replacement for pip
- 🎯 **Project Management** - Create and manage Python projects
- 🌐 **Virtual Environments** - Fast venv creation and management
- 🔒 **Lock Files** - Reproducible dependency resolution

## Core Commands

### Package Management

```bash
# Install packages (like pip install)
uv pip install requests

# Install from requirements.txt
uv pip install -r requirements.txt

# Uninstall packages
uv pip uninstall requests

# List installed packages
uv pip list
```

### Project Management

```bash
# Create new project
uv init my-project

# Add dependencies
uv add requests pandas

# Remove dependencies
uv remove requests

# Run project
uv run python main.py

# Run scripts defined in pyproject.toml
uv run my-script
```

### Virtual Environments

```bash
# Create virtual environment
uv venv

# Create with specific Python version
uv venv --python 3.11

# Activate (same as regular venv)
source .venv/bin/activate  # Unix
.venv\Scripts\activate     # Windows
```

## Usage

Ask for guidance on any uv topic:

```
How do I create a new Python project with uv?
```

```
Show me how to manage dependencies with uv
```

```
What's the uv equivalent of pip install?
```

## Key Advantages

### Speed
- 10-100x faster than pip
- Parallel downloads
- Efficient caching
- Optimized resolver

### Simplicity
- Single tool for everything
- Intuitive commands
- Clear error messages
- Minimal configuration

### Reliability
- Reproducible builds
- Lock file support
- Dependency resolution
- Version constraints

## Project Structure

UV projects use `pyproject.toml`:

```toml
[project]
name = "my-project"
version = "0.1.0"
dependencies = [
    "requests>=2.31.0",
    "pandas>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=7.0.0",
]
```

## Common Workflows

### Starting a New Project

```bash
# Create project
uv init my-app
cd my-app

# Add dependencies
uv add fastapi uvicorn

# Create virtual environment
uv venv

# Run application
uv run python main.py
```

### Migrating from pip

```bash
# Replace pip install
pip install requests  →  uv pip install requests

# Replace pip freeze
pip freeze  →  uv pip freeze

# Replace requirements.txt
pip install -r requirements.txt  →  uv pip install -r requirements.txt
```

## Best Practices

- Use `uv init` for new projects
- Commit `uv.lock` for reproducibility
- Use `uv add` instead of manual pyproject.toml edits
- Leverage `uv run` for consistent execution
- Use `--dev` flag for development dependencies

## Configuration

UV can be configured via:
- `pyproject.toml` - Project-specific settings
- `uv.toml` - Global configuration
- Environment variables - Runtime overrides

## Requirements

- Python 3.8+
- No other dependencies (uv is self-contained)

## Installation

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# With pip
pip install uv

# With pipx
pipx install uv
```

## Resources

- Official documentation
- CLI reference
- Configuration guide
- Migration guide from pip

## License

MIT
