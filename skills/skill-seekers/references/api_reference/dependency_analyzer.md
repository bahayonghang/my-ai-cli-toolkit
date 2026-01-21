# API Reference: dependency_analyzer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/dependency_analyzer.py`

---

## Classes

### DependencyInfo

Information about a single dependency relationship.

**Inherits from**: (none)



### FileNode

Represents a file node in the dependency graph.

**Inherits from**: (none)



### DependencyAnalyzer

Multi-language dependency analyzer using NetworkX.

Analyzes import/require/include statements and builds dependency graphs
with circular dependency detection.

**Inherits from**: (none)

#### Methods

##### __init__(self)

Initialize dependency analyzer.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### analyze_file(self, file_path: str, content: str, language: str) → list[DependencyInfo]

Extract dependencies from a source file.

Args:
    file_path: Path to source file
    content: File content
    language: Programming language (Python, JavaScript, TypeScript, C, C++, C#, Go, Rust, Java, Ruby, PHP)

Returns:
    List of DependencyInfo objects

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| file_path | str | - | - |
| content | str | - | - |
| language | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_python_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract Python import statements using AST.

Handles:
- import module
- import module as alias
- from module import name
- from . import relative

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_js_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract JavaScript/TypeScript import statements.

Handles:
- import x from 'module'
- import { x } from 'module'
- import * as x from 'module'
- const x = require('module')
- require('module')

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_cpp_includes(self, content: str, file_path: str) → list[DependencyInfo]

Extract C++ #include directives.

Handles:
- #include "local/header.h"
- #include <system/header.h>

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_csharp_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract C# using statements.

Handles:
- using System;
- using MyNamespace;
- using static MyClass;
- using alias = Namespace;

Regex patterns based on C# language specification:
https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-directive

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_go_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract Go import statements.

Handles:
- import "package"
- import alias "package"
- import ( "pkg1" "pkg2" )

Regex patterns based on Go language specification:
https://go.dev/ref/spec#Import_declarations

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_rust_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract Rust use statements.

Handles:
- use std::collections::HashMap;
- use crate::module;
- use super::sibling;
- use self::child;

Regex patterns based on Rust reference:
https://doc.rust-lang.org/reference/items/use-declarations.html

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_java_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract Java import statements.

Handles:
- import java.util.List;
- import java.util.*;
- import static java.lang.Math.PI;

Regex patterns based on Java language specification:
https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html#jls-7.5

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_ruby_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract Ruby require/require_relative/load statements.

Handles:
- require 'gem_name'
- require_relative 'file'
- load 'script.rb'

Regex patterns based on Ruby documentation:
https://ruby-doc.org/core/Kernel.html#method-i-require

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### _extract_php_imports(self, content: str, file_path: str) → list[DependencyInfo]

Extract PHP require/include/use statements.

Handles:
- require 'file.php';
- require_once 'file.php';
- include 'file.php';
- include_once 'file.php';
- use Namespace\Class;

Regex patterns based on PHP language reference:
https://www.php.net/manual/en/function.require.php

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| file_path | str | - | - |

**Returns**: `list[DependencyInfo]`


##### build_graph(self) → nx.DiGraph

Build dependency graph from analyzed files.

Returns:
    NetworkX DiGraph with file dependencies

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `nx.DiGraph`


##### _resolve_import(self, _source_file: str, imported_module: str, _is_relative: bool) → str | None

Resolve import statement to actual file path.

This is a simplified resolution - a full implementation would need
to handle module resolution rules for each language.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _source_file | str | - | - |
| imported_module | str | - | - |
| _is_relative | bool | - | - |

**Returns**: `str | None`


##### detect_cycles(self) → list[list[str]]

Detect circular dependencies in the graph.

Returns:
    List of cycles, where each cycle is a list of file paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[list[str]]`


##### get_strongly_connected_components(self) → list[set[str]]

Get strongly connected components (groups of mutually dependent files).

Returns:
    List of sets, each containing file paths in a component

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[set[str]]`


##### export_dot(self, output_path: str)

Export graph as GraphViz DOT format.

Args:
    output_path: Path to save .dot file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_path | str | - | - |


##### export_json(self) → dict[str, Any]

Export graph as JSON structure.

Returns:
    Dictionary with nodes and edges

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`


##### export_mermaid(self) → str

Export graph as Mermaid diagram format.

Returns:
    Mermaid diagram as string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### get_statistics(self) → dict[str, Any]

Get graph statistics.

Returns:
    Dictionary with various statistics

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict[str, Any]`



