# API Reference: codebase_scraper.py

**Language**: Python

**Source**: `src/skill_seekers/cli/codebase_scraper.py`

---

## Functions

### detect_language(file_path: Path) → str

Detect programming language from file extension.

Args:
    file_path: Path to source file

Returns:
    Language name or 'Unknown'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file_path | Path | - | - |

**Returns**: `str`



### load_gitignore(directory: Path) → pathspec.PathSpec | None

Load .gitignore file and create pathspec matcher.

Args:
    directory: Root directory to search for .gitignore

Returns:
    PathSpec object if .gitignore found, None otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| directory | Path | - | - |

**Returns**: `pathspec.PathSpec | None`



### should_exclude_dir(dir_name: str, excluded_dirs: set) → bool

Check if directory should be excluded from analysis.

Args:
    dir_name: Directory name
    excluded_dirs: Set of directory names to exclude

Returns:
    True if directory should be excluded

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| dir_name | str | - | - |
| excluded_dirs | set | - | - |

**Returns**: `bool`



### walk_directory(root: Path, patterns: list[str] | None = None, gitignore_spec: pathspec.PathSpec | None = None, excluded_dirs: set | None = None) → list[Path]

Walk directory tree and collect source files.

Args:
    root: Root directory to walk
    patterns: Optional file patterns to include (e.g., ['*.py', '*.js'])
    gitignore_spec: Optional PathSpec object for .gitignore rules
    excluded_dirs: Set of directory names to exclude

Returns:
    List of source file paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| root | Path | - | - |
| patterns | list[str] | None | None | - |
| gitignore_spec | pathspec.PathSpec | None | None | - |
| excluded_dirs | set | None | None | - |

**Returns**: `list[Path]`



### analyze_codebase(directory: Path, output_dir: Path, depth: str = 'deep', languages: list[str] | None = None, file_patterns: list[str] | None = None, build_api_reference: bool = True, extract_comments: bool = True, build_dependency_graph: bool = True, detect_patterns: bool = True, extract_test_examples: bool = True, build_how_to_guides: bool = True, extract_config_patterns: bool = True, enhance_with_ai: bool = True, ai_mode: str = 'auto') → dict[str, Any]

Analyze local codebase and extract code knowledge.

Args:
    directory: Directory to analyze
    output_dir: Output directory for results
    depth: Analysis depth (surface, deep, full)
    languages: Optional list of languages to analyze
    file_patterns: Optional file patterns to include
    build_api_reference: Generate API reference markdown
    extract_comments: Extract inline comments
    build_dependency_graph: Generate dependency graph and detect circular dependencies
    detect_patterns: Detect design patterns (Singleton, Factory, Observer, etc.)
    extract_test_examples: Extract usage examples from test files
    build_how_to_guides: Build how-to guides from workflow examples (C3.3)
    extract_config_patterns: Extract configuration patterns from config files (C3.4)
    enhance_with_ai: Enhance patterns and examples with AI analysis (C3.6)
    ai_mode: AI enhancement mode for how-to guides (auto, api, local, none)

Returns:
    Analysis results dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| directory | Path | - | - |
| output_dir | Path | - | - |
| depth | str | 'deep' | - |
| languages | list[str] | None | None | - |
| file_patterns | list[str] | None | None | - |
| build_api_reference | bool | True | - |
| extract_comments | bool | True | - |
| build_dependency_graph | bool | True | - |
| detect_patterns | bool | True | - |
| extract_test_examples | bool | True | - |
| build_how_to_guides | bool | True | - |
| extract_config_patterns | bool | True | - |
| enhance_with_ai | bool | True | - |
| ai_mode | str | 'auto' | - |

**Returns**: `dict[str, Any]`



### _generate_skill_md(output_dir: Path, directory: Path, results: dict[str, Any], depth: str, build_api_reference: bool, build_dependency_graph: bool, detect_patterns: bool, extract_test_examples: bool, extract_config_patterns: bool)

Generate rich SKILL.md from codebase analysis results.

Creates a 300+ line skill file with:
- Front matter (name, description)
- Repository info (path, languages, file count)
- When to Use section
- Quick Reference (patterns, languages, stats)
- Code Examples (from test files)
- API Reference (from code analysis)
- Architecture Overview
- Configuration Patterns
- Available References

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |
| directory | Path | - | - |
| results | dict[str, Any] | - | - |
| depth | str | - | - |
| build_api_reference | bool | - | - |
| build_dependency_graph | bool | - | - |
| detect_patterns | bool | - | - |
| extract_test_examples | bool | - | - |
| extract_config_patterns | bool | - | - |

**Returns**: (none)



### _get_language_stats(files: list[dict]) → dict[str, int]

Count files by language from analysis results.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| files | list[dict] | - | - |

**Returns**: `dict[str, int]`



### _format_patterns_section(output_dir: Path) → str

Format design patterns section from patterns/detected_patterns.json.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: `str`



### _format_examples_section(output_dir: Path) → str

Format code examples section from test_examples/test_examples.json.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: `str`



### _format_api_section(output_dir: Path) → str

Format API reference section.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: `str`



### _format_architecture_section(output_dir: Path) → str

Format architecture section from architecture/architectural_patterns.json.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: `str`



### _format_config_section(output_dir: Path) → str

Format configuration patterns section.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: `str`



### _generate_references(output_dir: Path)

Generate references/ directory structure by symlinking analysis output.

Creates a clean references/ directory that links to all analysis outputs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| output_dir | Path | - | - |

**Returns**: (none)



### main()

Command-line interface for codebase analysis.

**Returns**: (none)


