# API Reference: github_scraper.py

**Language**: Python

**Source**: `src/skill_seekers/cli/github_scraper.py`

---

## Classes

### GitHubScraper

GitHub Repository Scraper (C1.1-C1.9)

Extracts repository information for skill generation:
- Repository structure
- README files
- Code comments and docstrings
- Programming language detection
- Function/class signatures
- Test examples
- GitHub Issues
- CHANGELOG
- Releases

**Inherits from**: (none)

#### Methods

##### __init__(self, config: dict[str, Any], local_repo_path: str | None = None)

Initialize GitHub scraper with configuration.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict[str, Any] | - | - |
| local_repo_path | str | None | None | - |


##### _get_token(self) → str | None

Get GitHub token from env var or config (both options supported).
Priority: GITHUB_TOKEN env var > config file > None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str | None`


##### scrape(self) → dict[str, Any]

Main scraping entry point.
Executes all C1 tasks in sequence.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### _fetch_repository(self)

C1.1: Fetch repository structure using GitHub API.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _get_file_content(self, file_path: str) → str | None

Safely get file content, handling symlinks and encoding issues.

Args:
    file_path: Path to file in repository

Returns:
    File content as string, or None if file not found/error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |

**Returns**: `str | None`


##### _extract_readme(self)

C1.2: Extract README.md files.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_code_structure(self)

C1.3-C1.6: Extract code structure, languages, signatures, and test examples.
Surface layer only - no full implementation code.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_languages(self)

C1.4: Detect programming languages in repository.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### should_exclude_dir(self, dir_name: str, dir_path: str = None) → bool

Check if directory should be excluded from analysis.

Args:
    dir_name: Directory name (e.g., "Examples & Extras")
    dir_path: Full relative path (e.g., "TextMesh Pro/Examples & Extras")

Returns:
    True if directory should be excluded

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dir_name | str | - | - |
| dir_path | str | None | - |

**Returns**: `bool`


##### _load_gitignore(self) → Optional['pathspec.PathSpec']

Load .gitignore file and create pathspec matcher (C2.1).

Returns:
    PathSpec object if .gitignore found, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `Optional['pathspec.PathSpec']`


##### _extract_file_tree(self)

Extract repository file tree structure (dual-mode: GitHub API or local filesystem).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_file_tree_local(self)

Extract file tree from local filesystem (unlimited files).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_file_tree_github(self)

Extract file tree from GitHub API (rate-limited).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_signatures_and_tests(self)

C1.3, C1.5, C1.6: Extract signatures, docstrings, and test examples.

Extraction depth depends on code_analysis_depth setting:
- surface: File tree only (minimal)
- deep: Parse files for signatures, parameters, types
- full: Complete AST analysis (future enhancement)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_issues(self)

C1.7: Extract GitHub Issues (open/closed, labels, milestones).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_changelog(self)

C1.8: Extract CHANGELOG.md and release notes.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _extract_releases(self)

C1.9: Extract GitHub Releases with version history.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _save_data(self)

Save extracted data to JSON file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### GitHubToSkillConverter

Convert extracted GitHub data to Claude skill format (C1.10).

**Inherits from**: (none)

#### Methods

##### __init__(self, config: dict[str, Any])

Initialize converter with configuration.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict[str, Any] | - | - |


##### _load_data(self) → dict[str, Any]

Load extracted GitHub data from JSON.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### build_skill(self)

Build complete skill structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_skill_md(self)

Generate main SKILL.md file (rich version with C3.x data if available).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _format_languages(self) → str

Format language breakdown.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _format_recent_releases(self) → str

Format recent releases (top 3).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _format_pattern_summary(self, c3_data: dict[str, Any]) → str

Format design patterns summary (C3.1).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_code_examples(self, c3_data: dict[str, Any]) → str

Format code examples (C3.2).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_api_reference(self, c3_data: dict[str, Any]) → str

Format API reference (C2.5).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_architecture(self, c3_data: dict[str, Any]) → str

Format architecture overview (C3.7).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_data | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_known_issues(self) → str

Format known issues from GitHub.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _generate_references(self)

Generate all reference files.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_issues_reference(self)

Generate issues.md reference file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_releases_reference(self)

Generate releases.md reference file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_file_structure_reference(self)

Generate file_structure.md reference file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### extract_description_from_readme(readme_content: str, repo_name: str) → str

Extract a meaningful description from README content for skill description.

Parses README to find the first meaningful paragraph that describes
what the project does, suitable for "Use when..." format.

Args:
    readme_content: README.md content
    repo_name: Repository name (e.g., 'facebook/react')

Returns:
    Description string, or improved fallback if extraction fails

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| readme_content | str | - | - |
| repo_name | str | - | - |

**Returns**: `str`



### main()

C1.10: CLI tool entry point.

**Returns**: (none)


