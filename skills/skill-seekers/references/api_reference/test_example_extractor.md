# API Reference: test_example_extractor.py

**Language**: Python

**Source**: `src/skill_seekers/cli/test_example_extractor.py`

---

## Classes

### TestExample

Single extracted usage example from test code

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Convert to dictionary for JSON serialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### to_markdown(self) → str

Convert to markdown format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`




### ExampleReport

Summary of test example extraction results

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Convert to dictionary for JSON serialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`


##### to_markdown(self) → str

Convert to markdown format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`




### PythonTestAnalyzer

Deep AST-based test example extraction for Python

**Inherits from**: (none)

#### Methods

##### __init__(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### extract(self, file_path: str, code: str) → list[TestExample]

Extract examples from Python test file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |
| code | str | - | - |

**Returns**: `list[TestExample]`


##### _extract_imports(self, tree: ast.AST) → list[str]

Extract imported modules

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tree | ast.AST | - | - |

**Returns**: `list[str]`


##### _is_test_class(self, node: ast.ClassDef) → bool

Check if class is a test class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.ClassDef | - | - |

**Returns**: `bool`


##### _is_test_function(self, node: ast.FunctionDef) → bool

Check if function is a test function

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.FunctionDef | - | - |

**Returns**: `bool`


##### _extract_from_test_class(self, class_node: ast.ClassDef, file_path: str, imports: list[str]) → list[TestExample]

Extract examples from unittest.TestCase class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_node | ast.ClassDef | - | - |
| file_path | str | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _extract_from_test_function(self, func_node: ast.FunctionDef, file_path: str, imports: list[str]) → list[TestExample]

Extract examples from pytest test function

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _extract_setup_method(self, class_node: ast.ClassDef) → str | None

Extract setUp method code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_node | ast.ClassDef | - | - |

**Returns**: `str | None`


##### _extract_fixtures(self, func_node: ast.FunctionDef) → str | None

Extract pytest fixture parameters

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |

**Returns**: `str | None`


##### _analyze_test_body(self, func_node: ast.FunctionDef, file_path: str, imports: list[str], setup_code: str | None = None) → list[TestExample]

Analyze test function body for extractable patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| imports | list[str] | - | - |
| setup_code | str | None | None | - |

**Returns**: `list[TestExample]`


##### _detect_tags(self, func_node: ast.FunctionDef, imports: list[str]) → list[str]

Detect test tags (pytest, mock, async, etc.)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| imports | list[str] | - | - |

**Returns**: `list[str]`


##### _find_instantiations(self, func_node: ast.FunctionDef, file_path: str, description: str, setup_code: str | None, tags: list[str], imports: list[str]) → list[TestExample]

Find object instantiation patterns: obj = ClassName(...)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| description | str | - | - |
| setup_code | str | None | - | - |
| tags | list[str] | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _find_method_calls_with_assertions(self, func_node: ast.FunctionDef, file_path: str, description: str, setup_code: str | None, tags: list[str], imports: list[str]) → list[TestExample]

Find method calls followed by assertions

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| description | str | - | - |
| setup_code | str | None | - | - |
| tags | list[str] | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _find_config_dicts(self, func_node: ast.FunctionDef, file_path: str, description: str, setup_code: str | None, tags: list[str], imports: list[str]) → list[TestExample]

Find configuration dictionary patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| description | str | - | - |
| setup_code | str | None | - | - |
| tags | list[str] | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _find_workflows(self, func_node: ast.FunctionDef, file_path: str, description: str, setup_code: str | None, tags: list[str], imports: list[str]) → list[TestExample]

Find multi-step workflow patterns (integration tests)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| file_path | str | - | - |
| description | str | - | - |
| setup_code | str | None | - | - |
| tags | list[str] | - | - |
| imports | list[str] | - | - |

**Returns**: `list[TestExample]`


##### _is_meaningful_instantiation(self, node: ast.Assign) → bool

Check if instantiation has meaningful parameters

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.Assign | - | - |

**Returns**: `bool`


##### _get_class_name(self, call_node: ast.Call) → str

Extract class name from Call node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| call_node | ast.Call | - | - |

**Returns**: `str`


##### _is_assertion(self, node: ast.stmt) → bool

Check if statement is an assertion

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.stmt | - | - |

**Returns**: `bool`


##### _is_config_dict(self, dict_node: ast.Dict) → bool

Check if dictionary looks like configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dict_node | ast.Dict | - | - |

**Returns**: `bool`


##### _is_integration_test(self, func_node: ast.FunctionDef) → bool

Check if test looks like an integration test

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |

**Returns**: `bool`


##### _extract_assertion_after(self, func_node: ast.FunctionDef, target_node: ast.AST) → str

Find assertion that follows the target node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |
| target_node | ast.AST | - | - |

**Returns**: `str`


##### _extract_final_assertion(self, func_node: ast.FunctionDef) → str

Extract the final assertion from test

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| func_node | ast.FunctionDef | - | - |

**Returns**: `str`


##### _calculate_complexity(self, code: str) → float

Calculate code complexity score (0-1)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `float`


##### _generate_id(self, code: str) → str

Generate unique ID for example

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `str`




### GenericTestAnalyzer

Regex-based test example extraction for non-Python languages

**Inherits from**: (none)

#### Methods

##### extract(self, file_path: str, code: str, language: str) → list[TestExample]

Extract examples from test file using regex patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |
| code | str | - | - |
| language | str | - | - |

**Returns**: `list[TestExample]`


##### _create_example(self, test_name: str, category: str, code: str, language: str, file_path: str, line_number: int) → TestExample

Create TestExample from regex match

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_name | str | - | - |
| category | str | - | - |
| code | str | - | - |
| language | str | - | - |
| file_path | str | - | - |
| line_number | int | - | - |

**Returns**: `TestExample`




### ExampleQualityFilter

Filter out trivial or low-quality examples

**Inherits from**: (none)

#### Methods

##### __init__(self, min_confidence: float = 0.7, min_code_length: int = 20)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| min_confidence | float | 0.7 | - |
| min_code_length | int | 20 | - |


##### filter(self, examples: list[TestExample]) → list[TestExample]

Filter examples by quality criteria

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[TestExample] | - | - |

**Returns**: `list[TestExample]`


##### _is_trivial(self, code: str) → bool

Check if code contains trivial patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `bool`




### TestExampleExtractor

Main orchestrator for test example extraction

**Inherits from**: (none)

#### Methods

##### __init__(self, min_confidence: float = 0.7, max_per_file: int = 10, languages: list[str] | None = None, enhance_with_ai: bool = True)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| min_confidence | float | 0.7 | - |
| max_per_file | int | 10 | - |
| languages | list[str] | None | None | - |
| enhance_with_ai | bool | True | - |


##### extract_from_directory(self, directory: Path, recursive: bool = True) → ExampleReport

Extract examples from all test files in directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |
| recursive | bool | True | - |

**Returns**: `ExampleReport`


##### extract_from_file(self, file_path: Path) → list[TestExample]

Extract examples from single test file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |

**Returns**: `list[TestExample]`


##### _find_test_files(self, directory: Path, recursive: bool) → list[Path]

Find test files in directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |
| recursive | bool | - | - |

**Returns**: `list[Path]`


##### _detect_language(self, file_path: Path) → str

Detect programming language from file extension

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | Path | - | - |

**Returns**: `str`


##### _create_report(self, examples: list[TestExample], file_path: str | None = None, directory: str | None = None) → ExampleReport

Create summary report from examples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[TestExample] | - | - |
| file_path | str | None | None | - |
| directory | str | None | None | - |

**Returns**: `ExampleReport`




## Functions

### main()

Main entry point for CLI

**Returns**: (none)


