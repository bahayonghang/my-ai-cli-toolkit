# API Reference: github_fetcher.py

**Language**: Python

**Source**: `src/skill_seekers/cli/github_fetcher.py`

---

## Classes

### CodeStream

Code files for C3.x analysis.

**Inherits from**: (none)



### DocsStream

Documentation files from repository.

**Inherits from**: (none)



### InsightsStream

GitHub metadata and issues.

**Inherits from**: (none)



### ThreeStreamData

Complete output from GitHub fetcher.

**Inherits from**: (none)



### GitHubThreeStreamFetcher

Fetch from GitHub and split into 3 streams.

Usage:
    fetcher = GitHubThreeStreamFetcher(
        repo_url="https://github.com/facebook/react",
        github_token=os.getenv('GITHUB_TOKEN')
    )

    three_streams = fetcher.fetch()

    # Now you have:
    # - three_streams.code_stream (for C3.x)
    # - three_streams.docs_stream (for doc parser)
    # - three_streams.insights_stream (for issue analyzer)

**Inherits from**: (none)

#### Methods

##### __init__(self, repo_url: str, github_token: str | None = None, interactive: bool = True, profile_name: str | None = None)

Initialize fetcher.

Args:
    repo_url: GitHub repository URL (e.g., https://github.com/owner/repo)
    github_token: Optional GitHub API token for higher rate limits
    interactive: Whether to show interactive prompts (False for CI/CD)
    profile_name: Name of the GitHub profile being used

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_url | str | - | - |
| github_token | str | None | None | - |
| interactive | bool | True | - |
| profile_name | str | None | None | - |


##### parse_repo_url(self, url: str) → tuple[str, str]

Parse GitHub URL to extract owner and repo.

Args:
    url: GitHub URL (https://github.com/owner/repo or git@github.com:owner/repo.git)

Returns:
    Tuple of (owner, repo)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |

**Returns**: `tuple[str, str]`


##### fetch(self, output_dir: Path = None) → ThreeStreamData

Fetch everything and split into 3 streams.

Args:
    output_dir: Directory to clone repository to (default: /tmp)

Returns:
    ThreeStreamData with all 3 streams

Raises:
    RateLimitError: If rate limit cannot be handled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | Path | None | - |

**Returns**: `ThreeStreamData`


##### clone_repo(self, output_dir: Path) → Path

Clone repository to local directory.

Args:
    output_dir: Parent directory for clone

Returns:
    Path to cloned repository

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | Path | - | - |

**Returns**: `Path`


##### fetch_github_metadata(self) → dict

Fetch repo metadata via GitHub API.

Returns:
    Dict with stars, forks, language, open_issues, etc.

Raises:
    RateLimitError: If rate limit cannot be handled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### fetch_issues(self, max_issues: int = 100) → list[dict]

Fetch GitHub issues (open + closed).

Args:
    max_issues: Maximum number of issues to fetch

Returns:
    List of issue dicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| max_issues | int | 100 | - |

**Returns**: `list[dict]`


##### _fetch_issues_page(self, state: str, max_count: int) → list[dict]

Fetch one page of issues.

Args:
    state: 'open' or 'closed'
    max_count: Maximum issues to fetch

Returns:
    List of issues

Raises:
    RateLimitError: If rate limit cannot be handled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| state | str | - | - |
| max_count | int | - | - |

**Returns**: `list[dict]`


##### classify_files(self, repo_path: Path) → tuple[list[Path], list[Path]]

Split files into code vs documentation.

Code patterns:
- *.py, *.js, *.ts, *.go, *.rs, *.java, etc.
- In src/, lib/, pkg/, etc.

Doc patterns:
- README.md, CONTRIBUTING.md, CHANGELOG.md
- docs/**/*.md, doc/**/*.md
- *.rst (reStructuredText)

Args:
    repo_path: Path to repository

Returns:
    Tuple of (code_files, doc_files)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_path | Path | - | - |

**Returns**: `tuple[list[Path], list[Path]]`


##### analyze_issues(self, issues: list[dict]) → dict

Analyze GitHub issues to extract insights.

Returns:
{
    "common_problems": [
        {
            "title": "OAuth setup fails",
            "number": 42,
            "labels": ["question", "oauth"],
            "comments": 15,
            "state": "open"
        },
        ...
    ],
    "known_solutions": [
        {
            "title": "Fixed OAuth redirect",
            "number": 35,
            "labels": ["bug", "oauth"],
            "comments": 8,
            "state": "closed"
        },
        ...
    ],
    "top_labels": [
        {"label": "question", "count": 23},
        {"label": "bug", "count": 15},
        ...
    ]
}

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| issues | list[dict] | - | - |

**Returns**: `dict`


##### read_file(self, file_path: Path) → str | None

Read file content safely.

Args:
    file_path: Path to file

Returns:
    File content or None if file doesn't exist or can't be read

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |

**Returns**: `str | None`



