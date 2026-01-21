# API Reference: code_analyzer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/code_analyzer.py`

---

## Classes

### Parameter

Represents a function parameter.

**Inherits from**: (none)



### FunctionSignature

Represents a function/method signature.

**Inherits from**: (none)

#### Methods

##### __post_init__(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### ClassSignature

Represents a class signature.

**Inherits from**: (none)



### CodeAnalyzer

Analyzes code at different depth levels.

**Inherits from**: (none)

#### Methods

##### __init__(self, depth: str = 'surface')

Initialize code analyzer.

Args:
    depth: Analysis depth ('surface', 'deep', 'full')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| depth | str | 'surface' | - |


##### analyze_file(self, file_path: str, content: str, language: str) → dict[str, Any]

Analyze a single file based on depth level.

Args:
    file_path: Path to file in repository
    content: File content as string
    language: Programming language (Python, JavaScript, C#, Go, Rust, Java, Ruby, PHP, etc.)

Returns:
    Dict containing extracted signatures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |
| content | str | - | - |
| language | str | - | - |

**Returns**: `dict[str, Any]`


##### _analyze_python(self, content: str, file_path: str) → dict[str, Any]

Analyze Python file using AST.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_python_class(self, node: ast.ClassDef) → ClassSignature

Extract class signature from AST node.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.ClassDef | - | - |

**Returns**: `ClassSignature`


##### _extract_python_function(self, node, is_method: bool = False) → FunctionSignature

Extract function signature from AST node.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | None | - | - |
| is_method | bool | False | - |

**Returns**: `FunctionSignature`


##### _analyze_javascript(self, content: str, _file_path: str) → dict[str, Any]

Analyze JavaScript/TypeScript file using regex patterns.

Note: This is a simplified approach. For production, consider using
a proper JS/TS parser like esprima or ts-morph.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_js_methods(self, class_body: str) → list[dict]

Extract method signatures from class body.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_body | str | - | - |

**Returns**: `list[dict]`


##### _parse_js_parameters(self, params_str: str) → list[dict]

Parse JavaScript parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _analyze_cpp(self, content: str, _file_path: str) → dict[str, Any]

Analyze C/C++ header file using regex patterns.

Note: This is a simplified approach focusing on header files.
For production, consider using libclang or similar.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _parse_cpp_parameters(self, params_str: str) → list[dict]

Parse C++ parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_python_comments(self, content: str) → list[dict]

Extract Python comments (# style).

Returns list of comment dictionaries with line number, text, and type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _extract_js_comments(self, content: str) → list[dict]

Extract JavaScript/TypeScript comments (// and /* */ styles).

Returns list of comment dictionaries with line number, text, and type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _extract_cpp_comments(self, content: str) → list[dict]

Extract C++ comments (// and /* */ styles, same as JavaScript).

Returns list of comment dictionaries with line number, text, and type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_csharp(self, content: str, _file_path: str) → dict[str, Any]

Analyze C# file using regex patterns.

Note: This is a simplified regex-based approach. For production use with Unity/ASP.NET,
consider using tree-sitter-c-sharp or Roslyn via pythonnet for more accurate parsing.

Regex patterns inspired by C# language specification:
https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_csharp_methods(self, class_body: str) → list[dict]

Extract C# method signatures from class body.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_body | str | - | - |

**Returns**: `list[dict]`


##### _parse_csharp_parameters(self, params_str: str) → list[dict]

Parse C# parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_csharp_comments(self, content: str) → list[dict]

Extract C# comments (// and /* */ and /// XML docs).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_go(self, content: str, _file_path: str) → dict[str, Any]

Analyze Go file using regex patterns.

Note: This is a simplified regex-based approach. For production,
consider using go/parser from the Go standard library via subprocess.

Regex patterns based on Go language specification:
https://go.dev/ref/spec

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _parse_go_parameters(self, params_str: str) → list[dict]

Parse Go parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_go_comments(self, content: str) → list[dict]

Extract Go comments (// and /* */ styles).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_rust(self, content: str, _file_path: str) → dict[str, Any]

Analyze Rust file using regex patterns.

Note: This is a simplified regex-based approach. For production,
consider using syn crate via subprocess or tree-sitter-rust.

Regex patterns based on Rust language reference:
https://doc.rust-lang.org/reference/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _parse_rust_parameters(self, params_str: str) → list[dict]

Parse Rust parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_rust_comments(self, content: str) → list[dict]

Extract Rust comments (// and /* */ and /// doc comments).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_java(self, content: str, _file_path: str) → dict[str, Any]

Analyze Java file using regex patterns.

Note: This is a simplified regex-based approach. For production,
consider using Eclipse JDT or JavaParser library.

Regex patterns based on Java language specification:
https://docs.oracle.com/javase/specs/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_java_methods(self, class_body: str) → list[dict]

Extract Java method signatures from class body.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_body | str | - | - |

**Returns**: `list[dict]`


##### _parse_java_parameters(self, params_str: str) → list[dict]

Parse Java parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_java_comments(self, content: str) → list[dict]

Extract Java comments (// and /* */ and /** JavaDoc */).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_ruby(self, content: str, _file_path: str) → dict[str, Any]

Analyze Ruby file using regex patterns.

Note: This is a simplified regex-based approach. For production,
consider using parser gem or tree-sitter-ruby.

Regex patterns based on Ruby language documentation:
https://ruby-doc.org/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _parse_ruby_parameters(self, params_str: str) → list[dict]

Parse Ruby parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_ruby_comments(self, content: str) → list[dict]

Extract Ruby comments (# style).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`


##### _analyze_php(self, content: str, _file_path: str) → dict[str, Any]

Analyze PHP file using regex patterns.

Note: This is a simplified regex-based approach. For production,
consider using nikic/PHP-Parser via subprocess or tree-sitter-php.

Regex patterns based on PHP language reference:
https://www.php.net/manual/en/langref.php

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| _file_path | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_php_methods(self, class_body: str) → list[dict]

Extract PHP method signatures from class body.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| class_body | str | - | - |

**Returns**: `list[dict]`


##### _parse_php_parameters(self, params_str: str) → list[dict]

Parse PHP parameter string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| params_str | str | - | - |

**Returns**: `list[dict]`


##### _extract_php_comments(self, content: str) → list[dict]

Extract PHP comments (// and /* */ and # and /** PHPDoc */).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |

**Returns**: `list[dict]`



