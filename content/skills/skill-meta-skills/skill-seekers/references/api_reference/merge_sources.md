# API Reference: merge_sources.py

**Language**: Python

**Source**: `src/skill_seekers/cli/merge_sources.py`

---

## Classes

### RuleBasedMerger

Rule-based API merger using deterministic rules with GitHub insights.

Multi-layer architecture (Phase 3):
- Layer 1: C3.x code (ground truth)
- Layer 2: HTML docs (official intent)
- Layer 3: GitHub docs (README/CONTRIBUTING)
- Layer 4: GitHub insights (issues)

Rules:
1. If API only in docs → Include with [DOCS_ONLY] tag
2. If API only in code → Include with [UNDOCUMENTED] tag
3. If both match perfectly → Include normally
4. If conflict → Include both versions with [CONFLICT] tag, prefer code signature

**Inherits from**: (none)

#### Methods

##### __init__(self, docs_data: dict, github_data: dict, conflicts: list[Conflict], github_streams: Optional['ThreeStreamData'] = None)

Initialize rule-based merger with GitHub streams support.

Args:
    docs_data: Documentation scraper data (Layer 2: HTML docs)
    github_data: GitHub scraper data (Layer 1: C3.x code)
    conflicts: List of detected conflicts
    github_streams: Optional ThreeStreamData with docs and insights (Layers 3-4)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| docs_data | dict | - | - |
| github_data | dict | - | - |
| conflicts | list[Conflict] | - | - |
| github_streams | Optional['ThreeStreamData'] | None | - |


##### merge_all(self) → dict[str, Any]

Merge all APIs using rule-based logic with GitHub insights (Phase 3).

Returns:
    Dict containing merged API data with hybrid content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### _merge_single_api(self, api_name: str) → dict[str, Any]

Merge a single API using rules.

Args:
    api_name: Name of the API to merge

Returns:
    Merged API dict

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_name | str | - | - |

**Returns**: `dict[str, Any]`


##### _create_merged_signature(self, code_info: dict, docs_info: dict) → str

Create merged signature preferring code data.

Args:
    code_info: API info from code
    docs_info: API info from docs

Returns:
    Merged signature string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code_info | dict | - | - |
| docs_info | dict | - | - |

**Returns**: `str`




### ClaudeEnhancedMerger

Claude-enhanced API merger using local Claude Code with GitHub insights.

Opens Claude Code in a new terminal to intelligently reconcile conflicts.
Uses the same approach as enhance_skill_local.py.

Multi-layer architecture (Phase 3):
- Layer 1: C3.x code (ground truth)
- Layer 2: HTML docs (official intent)
- Layer 3: GitHub docs (README/CONTRIBUTING)
- Layer 4: GitHub insights (issues)

**Inherits from**: (none)

#### Methods

##### __init__(self, docs_data: dict, github_data: dict, conflicts: list[Conflict], github_streams: Optional['ThreeStreamData'] = None)

Initialize Claude-enhanced merger with GitHub streams support.

Args:
    docs_data: Documentation scraper data (Layer 2: HTML docs)
    github_data: GitHub scraper data (Layer 1: C3.x code)
    conflicts: List of detected conflicts
    github_streams: Optional ThreeStreamData with docs and insights (Layers 3-4)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| docs_data | dict | - | - |
| github_data | dict | - | - |
| conflicts | list[Conflict] | - | - |
| github_streams | Optional['ThreeStreamData'] | None | - |


##### merge_all(self) → dict[str, Any]

Merge all APIs using Claude enhancement.

Returns:
    Dict containing merged API data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### _create_workspace(self) → str

Create temporary workspace with merge context.

Returns:
    Path to workspace directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _write_context_files(self, workspace: str)

Write context files for Claude to analyze.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workspace | str | - | - |


##### _count_by_field(self, field: str) → dict[str, int]

Count conflicts by a specific field.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| field | str | - | - |

**Returns**: `dict[str, int]`


##### _launch_claude_merge(self, workspace: str)

Launch Claude Code to perform merge.

Similar to enhance_skill_local.py approach.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workspace | str | - | - |


##### _read_merged_results(self, workspace: str) → dict[str, Any]

Read merged results from workspace.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workspace | str | - | - |

**Returns**: `dict[str, Any]`




## Functions

### categorize_issues_by_topic(problems: list[dict], solutions: list[dict], topics: list[str]) → dict[str, list[dict]]

Categorize GitHub issues by topic keywords.

Args:
    problems: List of common problems (open issues with 5+ comments)
    solutions: List of known solutions (closed issues with comments)
    topics: List of topic keywords to match against

Returns:
    Dict mapping topic to relevant issues

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| problems | list[dict] | - | - |
| solutions | list[dict] | - | - |
| topics | list[str] | - | - |

**Returns**: `dict[str, list[dict]]`



### generate_hybrid_content(api_data: dict, github_docs: dict | None, github_insights: dict | None, conflicts: list[Conflict]) → dict[str, Any]

Generate hybrid content combining API data with GitHub context.

Args:
    api_data: Merged API data
    github_docs: GitHub docs stream (README, CONTRIBUTING, docs/*.md)
    github_insights: GitHub insights stream (metadata, issues, labels)
    conflicts: List of detected conflicts

Returns:
    Hybrid content dict with enriched API reference

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| api_data | dict | - | - |
| github_docs | dict | None | - | - |
| github_insights | dict | None | - | - |
| conflicts | list[Conflict] | - | - |

**Returns**: `dict[str, Any]`



### _match_issues_to_apis(apis: dict[str, dict], problems: list[dict], solutions: list[dict]) → dict[str, list[dict]]

Match GitHub issues to specific APIs by keyword matching.

Args:
    apis: Dict of API data keyed by name
    problems: List of common problems
    solutions: List of known solutions

Returns:
    Dict mapping API names to relevant issues

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| apis | dict[str, dict] | - | - |
| problems | list[dict] | - | - |
| solutions | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`



### merge_sources(docs_data_path: str, github_data_path: str, output_path: str, mode: str = 'rule-based', github_streams: Optional['ThreeStreamData'] = None) → dict[str, Any]

Merge documentation and GitHub data with optional GitHub streams (Phase 3).

Multi-layer architecture:
- Layer 1: C3.x code (ground truth)
- Layer 2: HTML docs (official intent)
- Layer 3: GitHub docs (README/CONTRIBUTING) - from github_streams
- Layer 4: GitHub insights (issues) - from github_streams

Args:
    docs_data_path: Path to documentation data JSON
    github_data_path: Path to GitHub data JSON
    output_path: Path to save merged output
    mode: 'rule-based' or 'claude-enhanced'
    github_streams: Optional ThreeStreamData with docs and insights

Returns:
    Merged data dict with hybrid content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| docs_data_path | str | - | - |
| github_data_path | str | - | - |
| output_path | str | - | - |
| mode | str | 'rule-based' | - |
| github_streams | Optional['ThreeStreamData'] | None | - |

**Returns**: `dict[str, Any]`


