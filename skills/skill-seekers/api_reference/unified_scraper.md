# API Reference: unified_scraper.py

**Language**: Python

**Source**: `src/skill_seekers/cli/unified_scraper.py`

---

## Classes

### UnifiedScraper

Orchestrates multi-source scraping and merging.

Main workflow:
1. Load and validate unified config
2. Scrape all sources (docs, GitHub, PDF)
3. Detect conflicts between sources
4. Merge intelligently (rule-based or Claude-enhanced)
5. Build unified skill

**Inherits from**: (none)

#### Methods

##### __init__(self, config_path: str, merge_mode: str | None = None)

Initialize unified scraper.

Args:
    config_path: Path to unified config JSON
    merge_mode: Override config merge_mode ('rule-based' or 'claude-enhanced')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_path | str | - | - |
| merge_mode | str | None | None | - |


##### _setup_logging(self)

Setup file logging for this scraping session.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### scrape_all_sources(self)

Scrape all configured sources.

Routes to appropriate scraper based on source type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _scrape_documentation(self, source: dict[str, Any])

Scrape documentation website.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source | dict[str, Any] | - | - |


##### _clone_github_repo(self, repo_name: str, idx: int = 0) → str | None

Clone GitHub repository to cache directory for C3.x analysis.
Reuses existing clone if already present.

Args:
    repo_name: GitHub repo in format "owner/repo"
    idx: Source index for unique naming when multiple repos

Returns:
    Path to cloned repo, or None if clone failed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_name | str | - | - |
| idx | int | 0 | - |

**Returns**: `str | None`


##### _scrape_github(self, source: dict[str, Any])

Scrape GitHub repository.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source | dict[str, Any] | - | - |


##### _scrape_pdf(self, source: dict[str, Any])

Scrape PDF document.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source | dict[str, Any] | - | - |


##### _load_json(self, file_path: Path) → dict

Load JSON file safely.

Args:
    file_path: Path to JSON file

Returns:
    Dict with JSON data, or empty dict if file doesn't exist or is invalid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |

**Returns**: `dict`


##### _load_guide_collection(self, tutorials_dir: Path) → dict

Load how-to guide collection from tutorials directory.

Args:
    tutorials_dir: Path to tutorials directory

Returns:
    Dict with guide collection data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tutorials_dir | Path | - | - |

**Returns**: `dict`


##### _load_api_reference(self, api_dir: Path) → dict[str, Any]

Load API reference markdown files from api_reference directory.

Args:
    api_dir: Path to api_reference directory

Returns:
    Dict mapping module names to markdown content, or empty dict if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_dir | Path | - | - |

**Returns**: `dict[str, Any]`


##### _run_c3_analysis(self, local_repo_path: str, source: dict[str, Any]) → dict[str, Any]

Run comprehensive C3.x codebase analysis.

Calls codebase_scraper.analyze_codebase() with all C3.x features enabled,
loads the results into memory, and cleans up temporary files.

Args:
    local_repo_path: Path to local repository
    source: GitHub source configuration dict

Returns:
    Dict with keys: patterns, test_examples, how_to_guides,
    config_patterns, architecture

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| local_repo_path | str | - | - |
| source | dict[str, Any] | - | - |

**Returns**: `dict[str, Any]`


##### detect_conflicts(self) → list

Detect conflicts between documentation and code.

Only applicable if both documentation and GitHub sources exist.

Returns:
    List of conflicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list`


##### merge_sources(self, conflicts: list)

Merge data from multiple sources.

Args:
    conflicts: List of detected conflicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| conflicts | list | - | - |


##### build_skill(self, merged_data: dict | None = None)

Build final unified skill.

Args:
    merged_data: Merged API data (if conflicts were resolved)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| merged_data | dict | None | None | - |


##### run(self)

Execute complete unified scraping workflow.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### main()

Main entry point.

**Returns**: (none)


