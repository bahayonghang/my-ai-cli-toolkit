# API Reference: test_language_detector.py

**Language**: Python

**Source**: `tests/test_language_detector.py`

---

## Classes

### TestCSSClassDetection

Test language detection from CSS classes

**Inherits from**: (none)

#### Methods

##### test_language_prefix(self)

Test language- prefix pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_lang_prefix(self)

Test lang- prefix pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_brush_pattern(self)

Test brush: pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_bare_class_name(self)

Test bare language name as class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unknown_language(self)

Test unknown language class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_empty_classes(self)

Test empty class list

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_from_html_with_css_class(self)

Test HTML element with CSS class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_from_html_with_parent_class(self)

Test parent <pre> element with CSS class

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnityCSharpDetection

Test Unity C# specific patterns (CRITICAL - User's Primary Issue)

**Inherits from**: (none)

#### Methods

##### test_unity_monobehaviour_detection(self)

Test Unity MonoBehaviour class detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_lifecycle_methods(self)

Test Unity lifecycle method detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_coroutine_detection(self)

Test Unity coroutine detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_serializefield_attribute(self)

Test Unity attribute detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_types(self)

Test Unity type detection (GameObject, Transform, etc.)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_namespace(self)

Test Unity namespace detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generic_csharp_vs_unity(self)

Test generic C# doesn't false-positive as Unity

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_minimal_code(self)

Test minimal Unity code (edge case)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_input_system(self)

Test Unity Input system detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unity_full_script(self)

Test complete Unity script (high confidence expected)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestLanguageDetection

Test detection for major programming languages

**Inherits from**: (none)

#### Methods

##### test_python_detection(self)

Test Python code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_detection(self)

Test JavaScript code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_typescript_detection(self)

Test TypeScript code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_detection(self)

Test Java code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_detection(self)

Test Go code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_detection(self)

Test Rust code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_detection(self)

Test PHP code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_jsx_detection(self)

Test JSX code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_vue_detection(self)

Test Vue SFC detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_sql_detection(self)

Test SQL code detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestEdgeCases

Test edge cases and error handling

**Inherits from**: (none)

#### Methods

##### test_short_code_snippet(self)

Test code snippet too short for detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_empty_code(self)

Test empty code string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_whitespace_only(self)

Test whitespace-only code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_comments_only(self)

Test code with only comments

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mixed_languages(self)

Test code with multiple language patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_confidence_threshold(self)

Test minimum confidence threshold

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_html_with_embedded_css(self)

Test HTML with embedded CSS

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_case_insensitive_patterns(self)

Test that patterns are case-insensitive

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_r_language_detection(self)

Test R language detection (edge case: single letter)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_julia_detection(self)

Test Julia language detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_gdscript_detection(self)

Test GDScript (Godot) detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multiple_confidence_scores(self)

Test that multiple languages can have scores

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIntegration

Integration tests with doc_scraper patterns

**Inherits from**: (none)

#### Methods

##### test_detect_from_html_fallback_to_patterns(self)

Test fallback from CSS classes to pattern matching

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_backward_compatibility_with_doc_scraper(self)

Test that detector can be used as drop-in replacement

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



