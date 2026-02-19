# API Reference: test_claude_adaptor.py

**Language**: Python

**Source**: `tests/test_adaptors/test_claude_adaptor.py`

---

## Classes

### TestClaudeAdaptor

Test Claude adaptor functionality

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

Test valid Claude API keys

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


##### test_format_skill_md_with_frontmatter(self)

Test that Claude format includes YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_skill_md_with_existing_content(self)

Test that existing SKILL.md content is preserved

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_creates_zip(self)

Test that package creates ZIP file with correct structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_excludes_backup_files(self)

Test that backup files are excluded from package

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_success(self, mock_post)

Test successful upload to Claude

**Decorators**: `@patch('requests.post')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_post | None | - | - |


##### test_upload_failure(self, mock_post)

Test failed upload to Claude

**Decorators**: `@patch('requests.post')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_post | None | - | - |


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


##### test_package_with_custom_output_path(self)

Test packaging to custom output path

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_to_directory(self)

Test packaging to directory (should auto-name)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestClaudeAdaptorEdgeCases

Test edge cases and error handling

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test adaptor

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_with_minimal_metadata(self)

Test formatting with only required metadata fields

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_with_special_characters_in_name(self)

Test formatting with special characters in skill name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_api_key_validation_edge_cases(self)

Test API key validation with edge cases

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_with_network_error(self)

Test upload with network errors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



