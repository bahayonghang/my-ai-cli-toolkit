# API Reference: api_reference_builder.py

**Language**: Python

**Source**: `src/skill_seekers/cli/api_reference_builder.py`

---

## Classes

### APIReferenceBuilder

Builds markdown API reference from code analysis results.

Processes code analysis data and generates well-formatted markdown
documentation for each analyzed source file.

**Inherits from**: (none)

#### Methods

##### __init__(self, code_analysis: dict[str, Any])

Initialize builder with code analysis results.

Args:
    code_analysis: Dictionary containing analyzed files and their code structures.
                  Expected format: {'files': [{'file': 'path', 'classes': [...], 'functions': [...]}]}

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code_analysis | dict[str, Any] | - | - |


##### build_reference(self, output_dir: Path) → dict[str, Path]

Generate markdown files for each analyzed source file.

Args:
    output_dir: Directory to save generated markdown files

Returns:
    Dictionary mapping source file paths to generated markdown file paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | Path | - | - |

**Returns**: `dict[str, Path]`


##### _get_output_filename(self, source_file: str) → str

Generate output filename from source file path.

Args:
    source_file: Path to source file

Returns:
    Safe filename for markdown output

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| source_file | str | - | - |

**Returns**: `str`


##### _generate_file_reference(self, file_data: dict[str, Any], source_file: str, language: str) → str

Generate complete markdown reference for a single file.

Args:
    file_data: Analysis data for the file
    source_file: Path to source file
    language: Programming language

Returns:
    Complete markdown content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_data | dict[str, Any] | - | - |
| source_file | str | - | - |
| language | str | - | - |

**Returns**: `str`


##### _format_class(self, class_sig: dict[str, Any]) → str

Format class signature as markdown.

Args:
    class_sig: Class signature dictionary

Returns:
    Formatted markdown for class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_sig | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_method(self, method_sig: dict[str, Any]) → str

Format method signature as markdown.

Args:
    method_sig: Method signature dictionary

Returns:
    Formatted markdown for method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| method_sig | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_function(self, func_sig: dict[str, Any]) → str

Format function signature as markdown.

Args:
    func_sig: Function signature dictionary

Returns:
    Formatted markdown for function

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_sig | dict[str, Any] | - | - |

**Returns**: `str`


##### _build_signature(self, sig: dict[str, Any]) → str

Build function/method signature string.

Args:
    sig: Signature dictionary

Returns:
    Formatted signature string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sig | dict[str, Any] | - | - |

**Returns**: `str`


##### _format_parameters(self, params: list[dict]) → str

Format parameter list as markdown table.

Args:
    params: List of parameter dictionaries

Returns:
    Formatted markdown table

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params | list[dict] | - | - |

**Returns**: `str`




## Functions

### main()

Command-line interface for API reference generation.

Reads code analysis JSON and generates markdown API documentation.

**Returns**: (none)


