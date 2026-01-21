# Skill Seekers

Generate LLM skills from documentation, codebases, and GitHub repositories with AI-enhanced analysis.

## Overview

Skill Seekers is a powerful tool that automatically generates comprehensive AI skills from various sources. It analyzes code structure, extracts documentation, identifies design patterns, and creates test examples to build production-ready skills for LLM agents.

## Features

- 📁 **Multi-Source Support** - Analyze local codebases, documentation URLs, GitHub repos, and PDFs
- 🎯 **Deep Analysis** - Extract API references, dependency graphs, and design patterns
- 🧪 **Test Extraction** - Automatically pull high-quality code examples from test files
- ⚙️ **Config Detection** - Identify and document configuration patterns
- 🤖 **AI Enhancement** - Optional AI mode for improved analysis quality
- 📦 **Ready to Package** - Output structured skills ready for Claude Code

## Installation

```bash
pip install skill-seekers
# Or: uv pip install skill-seekers
```

## Quick Start

### Analyze Local Codebase

```bash
# Basic analysis
skill-seekers-codebase --directory ./path/to/project --output output/my-skill/

# Deep analysis with AI enhancement
skill-seekers-codebase --directory ./path/to/project --depth deep --ai-mode api --output output/my-skill/

# Package for Claude Code
yes | skill-seekers package output/my-skill/ --no-open
```

### Scrape Documentation

```bash
skill-seekers scrape --url https://docs.example.com --output output/docs-skill/
```

### Analyze GitHub Repository

```bash
skill-seekers github --repo owner/repo --output output/repo-skill/
```

### Process PDF Documentation

```bash
skill-seekers pdf --file documentation.pdf --output output/pdf-skill/
```

## Commands

| Source | Command | Description |
|--------|---------|-------------|
| **Local Code** | `skill-seekers-codebase --directory ./path` | Analyze local codebase |
| **Docs URL** | `skill-seekers scrape --url https://...` | Scrape web documentation |
| **GitHub** | `skill-seekers github --repo owner/repo` | Analyze GitHub repository |
| **PDF** | `skill-seekers pdf --file doc.pdf` | Extract from PDF documents |

## Options

| Flag | Description | Values |
|------|-------------|--------|
| `--depth` | Analysis depth level | `surface`, `deep`, `full` |
| `--skip-patterns` | Skip design pattern detection | - |
| `--skip-test-examples` | Skip test example extraction | - |
| `--ai-mode` | AI enhancement mode | `none`, `api`, `local` |

## Analysis Output

Skill Seekers generates comprehensive skill documentation:

### 📊 Codebase Statistics

- **Languages detected** with file counts
- **Analysis coverage** for each module
- **Design patterns** identified (Factory, Strategy, Observer, etc.)
- **Configuration patterns** extracted

### 🎨 Design Patterns

Automatically detects common design patterns:
- Factory Pattern
- Strategy Pattern
- Observer Pattern
- Builder Pattern
- Command Pattern

### 📝 Code Examples

Extracts high-quality examples from test files:
- Functionality demonstrations
- Configuration examples
- Edge case handling
- Best practices

### ⚙️ Configuration Patterns

Analyzes configuration files to document:
- Available settings
- Default values
- Environment-specific configs
- Pattern usage

## Output Structure

```
output/my-skill/
├── SKILL.md                 # Main skill definition
├── api_reference/           # Extracted API docs
├── dependencies/            # Dependency graphs
├── patterns/                # Design pattern analysis
├── test_examples/           # Code examples from tests
├── config_patterns/         # Configuration docs
└── code_analysis.json       # Complete analysis data
```

## Use Cases

### 1. Create Skills from Existing Projects

Turn your codebase into an AI assistant:

```bash
skill-seekers-codebase --directory ./my-project --output ./my-project-skill/
skill-seekers package ./my-project-skill/
```

### 2. Document External Libraries

Generate skills from public documentation:

```bash
skill-seekers scrape --url https://library.docs.com --output ./library-skill/
```

### 3. Package GitHub Repositories

Convert any GitHub repo to a skill:

```bash
skill-seekers github --repo facebook/react --output ./react-skill/
```

## Analysis Depth Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **surface** | Quick overview, basic structure | Initial exploration |
| **deep** | Full analysis, patterns, tests | **Recommended for skills** |
| **full** | Maximum detail, all extras | Comprehensive documentation |

## AI Enhancement Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| **none** | Pure static analysis | None (fastest) |
| **api** | Cloud API enhancement | API key configured |
| **local** | Local AI model | Local LLM setup |

## Best Practices

1. **Use `deep` analysis** for production skills
2. **Enable AI mode** for better quality results
3. **Review generated SKILL.md** before packaging
4. **Test the skill** after installation
5. **Keep skills focused** on specific domains

## Example Workflow

```bash
# 1. Analyze a codebase
skill-seekers-codebase \
  --directory ./my-project \
  --depth deep \
  --ai-mode api \
  --output ./skills/my-project-skill/

# 2. Review the generated skill
cat ./skills/my-project-skill/SKILL.md

# 3. Package for Claude Code
skill-seekers package ./skills/my-project-skill/

# 4. Install to Claude
cp -r ./skills/my-project-skill ~/.claude/skills/
```

## Requirements

- Python 3.8+
- Network connection (for web scraping and GitHub)
- (Optional) AI API credentials for enhanced analysis

## Notes

- Generated skills follow the standard SKILL.md format
- Test examples are extracted from actual test files
- Design pattern detection uses confidence scoring (> 0.7)
- Configuration analysis supports multiple file formats

## Credits

- Tool: Skill Seekers
- Generated skills use C3.x analysis methodology
