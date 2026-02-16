# API Reference: test_upload_skill.py

**Language**: Python

**Source**: `tests/test_upload_skill.py`

---

## Classes

### TestUploadSkillAPI

Test upload_skill_api function

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Store original API key state

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Restore original API key state

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### create_test_zip(self, tmpdir)

Helper to create a test .zip file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmpdir | None | - | - |


##### test_upload_without_api_key(self)

Test that upload fails gracefully without API key

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_with_nonexistent_file(self)

Test upload with nonexistent file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_with_invalid_zip(self)

Test upload with invalid zip file (not a zip)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_upload_accepts_path_object(self)

Test that upload_skill_api accepts Path objects

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUploadSkillCLI

Test upload_skill.py command-line interface

**Inherits from**: unittest.TestCase

#### Methods

##### test_cli_help_output(self)

Test that skill-seekers upload --help works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_executes_without_errors(self)

Test that skill-seekers-upload entry point works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_requires_zip_argument(self)

Test that CLI requires zip file argument

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



