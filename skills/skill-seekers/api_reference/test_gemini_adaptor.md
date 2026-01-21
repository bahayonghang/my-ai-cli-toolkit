# API Reference: test_gemini_adaptor.py

**Language**: Python

**Source**: `tests/test_adaptors/test_gemini_adaptor.py`

---

## Classes

### TestGeminiAdaptor

Test Gemini adaptor functionality

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test adaptor

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_platform_info(self)

Test platform identifiers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_api_key_valid(self)

Test valid Google API key

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_api_key_invalid(self)

Test invalid API keys

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_env_var_name(self)

Test environment variable name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_supports_enhancement(self)

Test enhancement support

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_skill_md_no_frontmatter(self)

Test that Gemini format has no YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_creates_targz(self)

Test that package creates tar.gz file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_success(self)

Test successful upload to Gemini - skipped (needs real API for integration test)

**Decorators**: `@unittest.skip('Complex mocking - integration test needed with real API')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_missing_library(self)

Test upload when google-generativeai is not installed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_invalid_file(self)

Test upload with invalid file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_wrong_format(self)

Test upload with wrong file format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_success(self)

Test successful enhancement - skipped (needs real API for integration test)

**Decorators**: `@unittest.skip('Complex mocking - integration test needed with real API')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_missing_library(self)

Test enhance when google-generativeai is not installed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



