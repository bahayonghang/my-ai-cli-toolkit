# API Reference: generate_router.py

**Language**: Python

**Source**: `src/skill_seekers/cli/generate_router.py`

---

## Classes

### RouterGenerator

Generates router skills that direct to specialized sub-skills with GitHub integration

**Inherits from**: (none)

#### Methods

##### __init__(self, config_paths: list[str], router_name: str = None, github_streams: Optional['ThreeStreamData'] = None)

Initialize router generator with optional GitHub streams.

Args:
    config_paths: Paths to sub-skill config files
    router_name: Optional router skill name
    github_streams: Optional ThreeStreamData with docs and insights

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config_paths | list[str] | - | - |
| router_name | str | None | - |
| github_streams | Optional['ThreeStreamData'] | None | - |


##### load_config(self, path: Path) → dict[str, Any]

Load a config file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| path | Path | - | - |

**Returns**: `dict[str, Any]`


##### infer_router_name(self) → str

Infer router name from sub-skill names

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### extract_routing_keywords(self) → dict[str, list[str]]

Extract keywords for routing to each skill (Phase 4 enhanced).

Enhancement: Weight GitHub issue labels 2x in topic scoring.
Uses C3.x patterns, examples, and GitHub insights for better routing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, list[str]]`


##### _extract_skill_specific_labels(self, _skill_name: str, skill_keywords: set) → list[str]

Extract labels from GitHub issues that match this specific skill.

Scans all common_problems and known_solutions for issues whose labels
match the skill's keywords, then extracts ALL labels from those issues.
This provides richer, skill-specific routing keywords.

Args:
    skill_name: Name of the skill
    skill_keywords: Set of keywords already associated with the skill

Returns:
    List of skill-specific labels (excluding generic ones)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _skill_name | str | - | - |
| skill_keywords | set | - | - |

**Returns**: `list[str]`


##### _generate_frontmatter(self, _routing_keywords: dict[str, list[str]]) → str

Generate YAML frontmatter compliant with agentskills.io spec.

Required fields:
- name: router name (1-64 chars, lowercase-hyphen)
- description: when to use (1-1024 chars, keyword-rich)

Optional fields:
- license: MIT (from config or default)
- compatibility: Python version, dependencies

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _routing_keywords | dict[str, list[str]] | - | - |

**Returns**: `str`


##### _extract_clean_readme_section(self, readme: str) → str

Extract and clean README quick start section.

Args:
    readme: Full README content

Returns:
    Cleaned quick start section (HTML removed, properly truncated)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| readme | str | - | - |

**Returns**: `str`


##### _extract_topic_from_skill(self, skill_name: str) → str

Extract readable topic from skill name.

Examples:
- "fastmcp-oauth" -> "OAuth authentication"
- "react-hooks" -> "React hooks"
- "django-orm" -> "Django ORM"

Args:
    skill_name: Skill name (e.g., "fastmcp-oauth")

Returns:
    Readable topic string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_name | str | - | - |

**Returns**: `str`


##### _generate_dynamic_examples(self, routing_keywords: dict[str, list[str]]) → str

Generate examples dynamically from actual sub-skill names and keywords.

Creates 2-3 realistic examples showing:
1. Single skill activation
2. Different skill activation
3. Complex query routing (if 2+ skills)

Args:
    routing_keywords: Dictionary mapping skill names to keywords

Returns:
    Formatted examples section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| routing_keywords | dict[str, list[str]] | - | - |

**Returns**: `str`


##### _generate_examples_from_github(self, routing_keywords: dict[str, list[str]]) → str

Generate examples from real GitHub issue titles.

Uses actual user questions from GitHub issues to create realistic examples.
Matches issues to skills based on labels for relevance.
Fallback to keyword-based examples if no GitHub data available.

Args:
    routing_keywords: Dictionary mapping skill names to keywords

Returns:
    Formatted examples section with real user questions

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| routing_keywords | dict[str, list[str]] | - | - |

**Returns**: `str`


##### _convert_issue_to_question(self, issue_title: str) → str

Convert GitHub issue title to natural question format.

Examples:
- "OAuth fails on redirect" → "How do I fix OAuth redirect failures?"
- "ApiKey Header documentation" → "How do I use ApiKey Header?"
- "Add WebSocket support" → "How do I handle WebSocket support?"

Args:
    issue_title: Raw GitHub issue title

Returns:
    Natural question format suitable for examples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| issue_title | str | - | - |

**Returns**: `str`


##### _extract_common_patterns(self) → list[dict[str, str]]

Extract problem-solution patterns from closed GitHub issues.

Analyzes closed issues (known_solutions) to identify common patterns
that users encountered and resolved. These patterns are shown in the
Common Patterns section of the router skill.

Returns:
    List of pattern dicts with 'problem', 'solution', 'issue_number'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, str]]`


##### _parse_issue_pattern(self, issue_title: str) → tuple

Parse issue title to extract problem-solution pattern.

Analyzes the structure of closed issue titles to infer the problem
and solution pattern. Common patterns include fixes, additions, and resolutions.

Examples:
- "Fixed OAuth redirect" → ("OAuth redirect not working", "See fix implementation")
- "Added API key support" → ("Missing API key support", "Use API key support feature")
- "Resolved timeout errors" → ("Timeout errors issue", "See resolution approach")

Args:
    issue_title: Title of closed GitHub issue

Returns:
    Tuple of (problem_description, solution_hint)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| issue_title | str | - | - |

**Returns**: `tuple`


##### _detect_framework(self) → str | None

Detect framework from router name and GitHub metadata.

Identifies common frameworks (fastapi, django, react, etc.) from
router name or repository description. Used to provide framework-specific
hello world templates when README lacks code examples.

Returns:
    Framework identifier (e.g., 'fastapi', 'django') or None if unknown

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str | None`


##### _get_framework_hello_world(self, framework: str) → str

Get framework-specific hello world template.

Provides basic installation + hello world code for common frameworks.
Used as fallback when README doesn't contain code examples.

Args:
    framework: Framework identifier (e.g., 'fastapi', 'react')

Returns:
    Formatted Quick Start section with install + hello world code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| framework | str | - | - |

**Returns**: `str`


##### _generate_comprehensive_description(self) → str

Generate router description that covers all sub-skill topics.

Extracts key topics from all sub-skill descriptions and combines them
into a comprehensive "Use when working with:" list.

Returns:
    Comprehensive description string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### generate_skill_md(self) → str

Generate router SKILL.md content (Phase 4 enhanced).

Enhancement: Include repository stats, README quick start, and top 5 GitHub issues.
With YAML frontmatter for agentskills.io compliance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### generate_subskill_issues_section(self, _skill_name: str, topics: list[str]) → str

Generate "Common Issues" section for a sub-skill (Phase 4).

Args:
    skill_name: Name of the sub-skill
    topics: List of topic keywords for this skill

Returns:
    Markdown section with relevant GitHub issues

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _skill_name | str | - | - |
| topics | list[str] | - | - |

**Returns**: `str`


##### create_router_config(self) → dict[str, Any]

Create router configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### _generate_github_issues_reference(self) → str

Generate detailed GitHub issues reference file.

Returns:
    Markdown content for github_issues.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _generate_getting_started_reference(self) → str

Generate getting started reference from README.

Returns:
    Markdown content for getting_started.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _generate_reference_files(self, references_dir: Path)

Generate reference files for progressive disclosure.

Files created:
- github_issues.md: Detailed GitHub issues with solutions
- getting_started.md: Full README quick start

Args:
    references_dir: Path to references/ directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| references_dir | Path | - | - |


##### generate(self, output_dir: Path = None) → tuple[Path, Path]

Generate router skill and config with progressive disclosure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | Path | None | - |

**Returns**: `tuple[Path, Path]`




## Functions

### main()

**Returns**: (none)


