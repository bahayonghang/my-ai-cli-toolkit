# Skill Manager

Search, browse, and install 31,767+ community skills from GitHub for your AI agent.

## Overview

Skill Manager is a Claude Code skill management tool that lets you easily discover and install skills from the GitHub community. Features bilingual search support, one-click installation, and automatic configuration.

## Features

- 🔍 **Smart Search** - Quickly find among 31,767 skills with weighted scoring
- 🌏 **Bilingual Support** - Supports both English and Chinese search (99.95% translated)
- 📥 **One-Click Install** - Automatic download and installation from GitHub
- 📊 **GitHub Stats** - Displays stars, forks, and other metrics
- 📖 **Usage Guides** - Automatically shows configuration instructions after installation

## Installation Methods

The skill automatically selects the best available method:

| Method | Speed | Files Downloaded | Requirements |
|--------|-------|------------------|--------------|
| **SVN Export** | ⚡⚡⚡ Fast | All skill files | SVN client |
| **Git Sparse Checkout** | ⚡⚡ Medium | All skill files | Git |
| **SKILL.md Only** | ⚡ Slow | Only SKILL.md | None |

### Installing SVN (Recommended)

::: code-group
```bash [macOS]
brew install svn
```
```bash [Linux (Debian/Ubuntu)]
apt-get install subversion
```
```bash [Linux (RHEL/CentOS)]
yum install subversion
```
```powershell [Windows]
choco install svn
```
:::

## Usage

Simply tell Claude what you're looking for:

```
I need a skill for Python testing
```

```
Find me a skill to help with Docker
```

```
Search for skills related to API development
```

Claude will:
1. Search the skills database
2. Display matching results with ratings
3. Ask you to select one
4. Download the complete skill folder automatically
5. Show you the configuration and usage guide

## Example Interactions

**Search by topic:**
```
User: I need help with Python testing
Assistant: [Searches database and shows results]
1. pytest-helper (by python-community)
   ⭐ 1,250 stars | 🔀 342 forks
   📝 Helps write and run pytest tests with fixtures and assertions...
```

**Install a skill:**
```
User: Install the first one
Assistant: [Downloads complete folder with all scripts]
   ✓ SVN detected - using efficient folder download
   ✓ Method used: SVN
   ✓ Files installed: SKILL.md, pytest_runner.py, fixtures.py, README.md
```

**Search in Chinese:**
```
User: Find me skills for A股
Assistant: [Shows Chinese stock market skills]
```

## Search Algorithm

Intelligent weighted scoring:
- **Name match**: +10 points
- **Description match**: +5 points
- **Author match**: +3 points

Results sorted by relevance and GitHub stars.

## Database Statistics

| Item | Value |
|------|-------|
| Total Skills | 31,767 |
| Chinese Translations | 31,752 (99.95%) |
| Database Size | 30.33 MB |

## Requirements

- Node.js >= 14.0.0
- Internet connection
- SVN client (recommended) or Git

## Notes

- Skills are installed to `~/.claude/skills/[skill-name]/`
- After installation, restart Claude Code to load the new skill
- The database includes skills with GitHub stats for quality reference

## Credits

- Author: [buzhangsan@github](https://github.com/buzhangsan)
- Skills database sourced from skillsmp community
