# API Reference: unified_skill_builder.py

**Language**: Python

**Source**: `src/skill_seekers/cli/unified_skill_builder.py`

---

## Classes

### UnifiedSkillBuilder

Builds unified skill from multi-source data.

**Inherits from**: (none)

#### Methods

##### __init__(self, config: dict, scraped_data: dict, merged_data: dict | None = None, conflicts: list | None = None, cache_dir: str | None = None)

Initialize skill builder.

Args:
    config: Unified config dict
    scraped_data: Dict of scraped data by source type
    merged_data: Merged API data (if conflicts were resolved)
    conflicts: List of detected conflicts
    cache_dir: Optional cache directory for intermediate files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict | - | - |
| scraped_data | dict | - | - |
| merged_data | dict | None | None | - |
| conflicts | list | None | None | - |
| cache_dir | str | None | None | - |


##### build(self)

Build complete skill structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _load_source_skill_mds(self) → dict[str, str]

Load standalone SKILL.md files from each source.

Returns:
    Dict mapping source type to SKILL.md content
    e.g., {'documentation': '...', 'github': '...', 'pdf': '...'}

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, str]`


##### _parse_skill_md_sections(self, skill_md: str) → dict[str, str]

Parse SKILL.md into sections by ## headers.

Args:
    skill_md: Full SKILL.md content

Returns:
    Dict mapping section name to content
    e.g., {'When to Use': '...', 'Quick Reference': '...'}

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_md | str | - | - |

**Returns**: `dict[str, str]`


##### _synthesize_docs_github(self, skill_mds: dict[str, str]) → str

Synthesize documentation + GitHub sources with weighted merge.

Strategy:
- Start with docs frontmatter and intro
- Add GitHub metadata (stars, topics, language stats)
- Merge "When to Use" from both sources
- Merge "Quick Reference" from both sources
- Include GitHub-specific sections (patterns, architecture)
- Merge code examples (prioritize GitHub real usage)
- Include Known Issues from GitHub
- Fix placeholder text (httpx_docs → httpx)

Args:
    skill_mds: Dict with 'documentation' and 'github' keys

Returns:
    Synthesized SKILL.md content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_mds | dict[str, str] | - | - |

**Returns**: `str`


##### _synthesize_docs_github_pdf(self, skill_mds: dict[str, str]) → str

Synthesize all three sources: documentation + GitHub + PDF.

Strategy:
- Start with docs+github synthesis
- Insert PDF chapters after Quick Reference
- Add PDF key concepts as supplementary section

Args:
    skill_mds: Dict with 'documentation', 'github', and 'pdf' keys

Returns:
    Synthesized SKILL.md content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_mds | dict[str, str] | - | - |

**Returns**: `str`


##### _generate_skill_md(self)

Generate main SKILL.md file using synthesis formulas.

Strategy:
1. Try to load standalone SKILL.md from each source
2. If found, use synthesis formulas for rich content
3. If not found, fall back to legacy minimal generation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _synthesize_docs_pdf(self, skill_mds: dict[str, str]) → str

Synthesize documentation + PDF sources.

Strategy:
- Start with docs SKILL.md
- Insert PDF chapters and key concepts as supplementary sections

Args:
    skill_mds: Dict with 'documentation' and 'pdf' keys

Returns:
    Synthesized SKILL.md content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_mds | dict[str, str] | - | - |

**Returns**: `str`


##### _synthesize_github_pdf(self, skill_mds: dict[str, str]) → str

Synthesize GitHub + PDF sources.

Strategy:
- Start with GitHub SKILL.md (has C3.x analysis)
- Add PDF documentation structure as supplementary section

Args:
    skill_mds: Dict with 'github' and 'pdf' keys

Returns:
    Synthesized SKILL.md content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_mds | dict[str, str] | - | - |

**Returns**: `str`


##### _generate_minimal_skill_md(self) → str

Generate minimal SKILL.md (legacy fallback behavior).

Used when no source SKILL.md files are available.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _format_merged_apis(self) → str

Format merged APIs section with inline conflict warnings.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _format_api_entry(self, api_data: dict, inline_conflict: bool = False) → str

Format a single API entry.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_data | dict | - | - |
| inline_conflict | bool | False | - |

**Returns**: `str`


##### _format_code_signature(self, code_info: dict) → str

Format code signature for display.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code_info | dict | - | - |

**Returns**: `str`


##### _generate_references(self)

Generate reference files organized by source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_docs_references(self, docs_list: list[dict])

Generate references from multiple documentation sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| docs_list | list[dict] | - | - |


##### _generate_github_references(self, github_list: list[dict])

Generate references from multiple GitHub sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| github_list | list[dict] | - | - |


##### _generate_pdf_references(self, pdf_list: list[dict])

Generate references from PDF sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pdf_list | list[dict] | - | - |


##### _generate_merged_api_reference(self)

Generate merged API reference file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_c3_analysis_references(self, repo_id: str = 'github')

Generate codebase analysis references (C3.5) for a specific GitHub source.

Args:
    repo_id: Repository identifier (e.g., 'encode_httpx') for multi-source support

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| repo_id | str | 'github' | - |


##### _generate_architecture_overview(self, c3_dir: str, c3_data: dict, github_data: dict)

Generate comprehensive ARCHITECTURE.md (C3.5 main deliverable).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| c3_data | dict | - | - |
| github_data | dict | - | - |


##### _generate_pattern_references(self, c3_dir: str, patterns_data: dict)

Generate design pattern references (C3.1).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| patterns_data | dict | - | - |


##### _generate_example_references(self, c3_dir: str, examples_data: dict)

Generate test example references (C3.2).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| examples_data | dict | - | - |


##### _generate_guide_references(self, c3_dir: str, guides_data: dict)

Generate how-to guide references (C3.3).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| guides_data | dict | - | - |


##### _generate_config_references(self, c3_dir: str, config_data: dict)

Generate configuration pattern references (C3.4).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| config_data | dict | - | - |


##### _copy_architecture_details(self, c3_dir: str, arch_data: dict)

Copy architectural pattern JSON details (C3.7).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_dir | str | - | - |
| arch_data | dict | - | - |


##### _format_c3_summary_section(self, c3_data: dict) → str

Format C3.x analysis summary for SKILL.md.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| c3_data | dict | - | - |

**Returns**: `str`


##### _generate_conflicts_report(self)

Generate detailed conflicts report.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



