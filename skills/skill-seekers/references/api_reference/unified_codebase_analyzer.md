# API Reference: unified_codebase_analyzer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/unified_codebase_analyzer.py`

---

## Classes

### AnalysisResult

Unified analysis result from any codebase source.

**Inherits from**: (none)



### UnifiedCodebaseAnalyzer

Unified analyzer for ANY codebase (local or GitHub).

Key insight: C3.x is a DEPTH MODE, not a source type.

Usage:
    analyzer = UnifiedCodebaseAnalyzer()

    # Analyze from GitHub
    result = analyzer.analyze(
        source="https://github.com/facebook/react",
        depth="c3x",
        fetch_github_metadata=True
    )

    # Analyze local directory
    result = analyzer.analyze(
        source="/path/to/project",
        depth="c3x"
    )

    # Quick basic analysis
    result = analyzer.analyze(
        source="/path/to/project",
        depth="basic"
    )

**Inherits from**: (none)

#### Methods

##### __init__(self, github_token: str | None = None)

Initialize analyzer.

Args:
    github_token: Optional GitHub API token for higher rate limits

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| github_token | str | None | None | - |


##### analyze(self, source: str, depth: str = 'c3x', fetch_github_metadata: bool = True, output_dir: Path | None = None, interactive: bool = True) → AnalysisResult

Analyze codebase with specified depth.

Args:
    source: GitHub URL or local path
    depth: 'basic' or 'c3x'
    fetch_github_metadata: Whether to fetch GitHub insights (only for GitHub sources)
    output_dir: Directory for temporary files (GitHub clones)
    interactive: Whether to show interactive prompts (False for CI/CD and tests)

Returns:
    AnalysisResult with all available streams

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source | str | - | - |
| depth | str | 'c3x' | - |
| fetch_github_metadata | bool | True | - |
| output_dir | Path | None | None | - |
| interactive | bool | True | - |

**Returns**: `AnalysisResult`


##### _analyze_github(self, repo_url: str, depth: str, fetch_metadata: bool, output_dir: Path | None, interactive: bool = True) → AnalysisResult

Analyze GitHub repository with three-stream fetcher.

Args:
    repo_url: GitHub repository URL
    depth: Analysis depth mode
    fetch_metadata: Whether to fetch GitHub metadata
    output_dir: Output directory for clone
    interactive: Whether to show interactive prompts (False for CI/CD and tests)

Returns:
    AnalysisResult with all 3 streams

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_url | str | - | - |
| depth | str | - | - |
| fetch_metadata | bool | - | - |
| output_dir | Path | None | - | - |
| interactive | bool | True | - |

**Returns**: `AnalysisResult`


##### _analyze_local(self, directory: str, depth: str) → AnalysisResult

Analyze local directory.

Args:
    directory: Path to local directory
    depth: Analysis depth mode

Returns:
    AnalysisResult with code analysis only

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | str | - | - |
| depth | str | - | - |

**Returns**: `AnalysisResult`


##### basic_analysis(self, directory: Path) → dict

Fast, shallow analysis (1-2 min).

Returns:
- File structure
- Imports
- Entry points
- Basic statistics

Args:
    directory: Path to analyze

Returns:
    Dict with basic analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict`


##### c3x_analysis(self, directory: Path) → dict

Deep C3.x analysis (20-60 min).

Returns:
- Everything from basic
- C3.1: Design patterns
- C3.2: Test examples
- C3.3: How-to guides
- C3.4: Config patterns
- C3.7: Architecture

Args:
    directory: Path to analyze

Returns:
    Dict with full C3.x analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict`


##### _load_c3x_results(self, output_dir: Path) → dict

Load C3.x analysis results from output directory.

Args:
    output_dir: Directory containing C3.x analysis output

Returns:
    Dict with C3.x data (c3_1_patterns, c3_2_examples, etc.)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | Path | - | - |

**Returns**: `dict`


##### is_github_url(self, source: str) → bool

Check if source is a GitHub URL.

Args:
    source: Source string (URL or path)

Returns:
    True if GitHub URL, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source | str | - | - |

**Returns**: `bool`


##### list_files(self, directory: Path) → list[dict]

List all files in directory with metadata.

Args:
    directory: Directory to scan

Returns:
    List of file info dicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `list[dict]`


##### get_directory_structure(self, directory: Path) → dict

Get directory structure tree.

Args:
    directory: Directory to analyze

Returns:
    Dict representing directory structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict`


##### extract_imports(self, directory: Path) → dict[str, list[str]]

Extract import statements from code files.

Args:
    directory: Directory to scan

Returns:
    Dict mapping file extensions to import lists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict[str, list[str]]`


##### find_entry_points(self, directory: Path) → list[str]

Find potential entry points (main files, setup files, etc.).

Args:
    directory: Directory to scan

Returns:
    List of entry point file paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `list[str]`


##### compute_statistics(self, directory: Path) → dict

Compute basic statistics about the codebase.

Args:
    directory: Directory to analyze

Returns:
    Dict with statistics

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict`



