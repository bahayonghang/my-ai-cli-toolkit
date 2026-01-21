# API Reference: test_code_analyzer.py

**Language**: Python

**Source**: `tests/test_code_analyzer.py`

---

## Classes

### TestPythonParsing

Tests for Python AST parsing

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test analyzer with deep analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_function_signature_basic(self)

Test basic Python function signature extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_function_with_type_hints(self)

Test Python function with type annotations.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_function_with_defaults(self)

Test Python function with default parameter values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_async_function(self)

Test async Python function detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_class_extraction(self)

Test Python class extraction with inheritance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_docstring_extraction(self)

Test docstring extraction for functions and classes.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_decorators(self)

Test decorator extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_syntax_error_handling(self)

Test handling of malformed Python code.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestJavaScriptParsing

Tests for JavaScript/TypeScript regex parsing

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test analyzer with deep analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_function_basic(self)

Test basic JavaScript function extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_arrow_function(self)

Test arrow function detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_class_methods(self)

Test ES6 class method extraction.

Note: Regex-based parser has limitations in extracting all methods.
This test verifies basic method extraction works.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_typescript_type_annotations(self)

Test TypeScript type annotation extraction.

Note: Current regex-based parser extracts parameter type hints
but NOT return types. Return type extraction requires a proper
TypeScript parser (ts-morph or typescript library).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_async_detection(self)

Test async function detection in JavaScript.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCppParsing

Tests for C++ regex parsing

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test analyzer with deep analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_function_signature(self)

Test C++ function declaration parsing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_class_extraction(self)

Test C++ class extraction with inheritance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_pointer_parameters(self)

Test C++ function with pointer/reference parameters.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_default_parameters(self)

Test C++ function with default parameter values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestDepthLevels

Tests for depth level behavior

**Inherits from**: unittest.TestCase

#### Methods

##### test_surface_depth_returns_empty(self)

Test that surface depth returns empty analysis.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_deep_depth_extracts_signatures(self)

Test that deep depth extracts full signatures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unknown_language_returns_empty(self)

Test that unknown language returns empty dict.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIntegration

Integration tests

**Inherits from**: unittest.TestCase

#### Methods

##### test_analyze_file_interface(self)

Test the analyze_file public interface.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multiple_items_extraction(self)

Test extracting multiple classes and functions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCommentExtraction

Tests for comment extraction

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test analyzer with deep analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_comment_extraction(self)

Test Python # comment extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_comment_line_numbers(self)

Test Python comment line number tracking.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_python_skip_shebang_and_encoding(self)

Test that shebang and encoding declarations are skipped.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_inline_comments(self)

Test JavaScript // comment extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_block_comments(self)

Test JavaScript /* */ block comment extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_mixed_comments(self)

Test JavaScript mixed inline and block comments.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_comment_extraction(self)

Test C++ comment extraction (uses same logic as JavaScript).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_todo_fixme_comment_detection(self)

Test that TODO/FIXME comments are extracted.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCSharpParsing

Tests for C# code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_csharp_class_extraction(self)

Test C# class extraction with inheritance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_csharp_method_extraction(self)

Test C# method extraction with parameters.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_csharp_property_extraction(self)

Test C# property extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_csharp_async_method(self)

Test C# async method detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGoParsing

Tests for Go code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_function_extraction(self)

Test Go function extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_method_with_receiver(self)

Test Go method with receiver.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_struct_extraction(self)

Test Go struct extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_multiple_return_values(self)

Test Go function with multiple return values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRustParsing

Tests for Rust code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_function_extraction(self)

Test Rust function extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_struct_extraction(self)

Test Rust struct extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_async_function(self)

Test Rust async function detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_impl_block(self)

Test Rust impl block method extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestJavaParsing

Tests for Java code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_class_extraction(self)

Test Java class extraction with inheritance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_method_extraction(self)

Test Java method extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_interface_implementation(self)

Test Java interface implementation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_generic_class(self)

Test Java generic class.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRubyParsing

Tests for Ruby code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ruby_class_extraction(self)

Test Ruby class extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ruby_method_extraction(self)

Test Ruby method extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ruby_class_inheritance(self)

Test Ruby class inheritance.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ruby_predicate_methods(self)

Test Ruby predicate methods (ending with ?).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPHPParsing

Tests for PHP code analysis

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_class_extraction(self)

Test PHP class extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_method_extraction(self)

Test PHP method extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_class_inheritance(self)

Test PHP class inheritance and interfaces.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_namespace(self)

Test PHP namespace handling.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



