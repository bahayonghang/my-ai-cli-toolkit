# API Reference: test_adaptors_e2e.py

**Language**: Python

**Source**: `tests/test_adaptors/test_adaptors_e2e.py`

---

## Classes

### TestAdaptorsE2E

End-to-end tests for all platform adaptors

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test environment with sample skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up temporary directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _create_sample_skill(self)

Create a sample skill directory with realistic content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_all_platforms_from_same_skill(self)

Test that all platforms can package the same skill

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_claude_workflow(self)

Test complete Claude workflow: package + verify structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_gemini_workflow(self)

Test complete Gemini workflow: package + verify structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_openai_workflow(self)

Test complete OpenAI workflow: package + verify structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_markdown_workflow(self)

Test complete Markdown workflow: package + verify structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_package_format_validation(self)

Test that each platform creates correct package format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_package_filename_convention(self)

Test that package filenames follow convention

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_all_platforms_preserve_references(self)

Test that all platforms preserve reference files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_metadata_consistency(self)

Test that metadata is consistent across platforms

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_format_skill_md_differences(self)

Test that each platform formats SKILL.md differently

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_upload_without_api_key(self)

Test upload behavior without API keys (should fail gracefully)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_e2e_markdown_no_upload_support(self)

Test that markdown adaptor doesn't support upload

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAdaptorsWorkflowIntegration

Integration tests for common workflow patterns

**Inherits from**: unittest.TestCase

#### Methods

##### test_workflow_export_to_all_platforms(self)

Test exporting same skill to all platforms

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_workflow_package_to_custom_path(self)

Test packaging to custom output paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_workflow_api_key_validation(self)

Test API key validation for each platform

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAdaptorsErrorHandling

Test error handling in adaptors

**Inherits from**: unittest.TestCase

#### Methods

##### test_error_invalid_skill_directory(self)

Test packaging with invalid skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_error_upload_nonexistent_file(self)

Test upload with nonexistent file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_error_upload_wrong_format(self)

Test upload with wrong file format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



