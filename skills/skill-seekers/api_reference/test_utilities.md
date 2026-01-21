# API Reference: test_utilities.py

**Language**: Python

**Source**: `tests/test_utilities.py`

---

## Classes

### TestAPIKeyFunctions

Test API key utility functions

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


##### test_has_api_key_when_set(self)

Test has_api_key returns True when key is set

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_has_api_key_when_not_set(self)

Test has_api_key returns False when key is not set

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_has_api_key_when_empty_string(self)

Test has_api_key returns False when key is empty string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_has_api_key_when_whitespace_only(self)

Test has_api_key returns False when key is whitespace

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_api_key_returns_key(self)

Test get_api_key returns the actual key

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_api_key_returns_none_when_not_set(self)

Test get_api_key returns None when not set

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_api_key_strips_whitespace(self)

Test get_api_key strips whitespace from key

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGetUploadURL

Test get_upload_url function

**Inherits from**: unittest.TestCase

#### Methods

##### test_get_upload_url_returns_correct_url(self)

Test get_upload_url returns the correct Claude skills URL

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_upload_url_returns_string(self)

Test get_upload_url returns a string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFormatFileSize

Test format_file_size function

**Inherits from**: unittest.TestCase

#### Methods

##### test_format_bytes_below_1kb(self)

Test formatting bytes below 1 KB

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_kilobytes(self)

Test formatting KB sizes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_megabytes(self)

Test formatting MB sizes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_zero_bytes(self)

Test formatting zero bytes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_large_files(self)

Test formatting large file sizes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestValidateSkillDirectory

Test validate_skill_directory function

**Inherits from**: unittest.TestCase

#### Methods

##### test_valid_skill_directory(self)

Test validation of valid skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nonexistent_directory(self)

Test validation of nonexistent directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_file_instead_of_directory(self)

Test validation when path is a file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_directory_without_skill_md(self)

Test validation of directory without SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestValidateZipFile

Test validate_zip_file function

**Inherits from**: unittest.TestCase

#### Methods

##### test_valid_zip_file(self)

Test validation of valid .zip file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_nonexistent_file(self)

Test validation of nonexistent file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_directory_instead_of_file(self)

Test validation when path is a directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_wrong_extension(self)

Test validation of file with wrong extension

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPrintUploadInstructions

Test print_upload_instructions function

**Inherits from**: unittest.TestCase

#### Methods

##### test_print_upload_instructions_runs(self)

Test that print_upload_instructions executes without error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_print_upload_instructions_accepts_string_path(self)

Test print_upload_instructions accepts string path

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRetryWithBackoff

Test retry_with_backoff function

**Inherits from**: unittest.TestCase

#### Methods

##### test_successful_operation_first_try(self)

Test operation that succeeds on first try

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_successful_operation_after_retry(self)

Test operation that fails once then succeeds

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_all_retries_fail(self)

Test operation that fails all retries

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_exponential_backoff_timing(self)

Test that retry delays are applied

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRetryWithBackoffAsync

Test retry_with_backoff_async function

**Inherits from**: unittest.TestCase

#### Methods

##### test_async_successful_operation(self)

Test async operation that succeeds

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_retry_then_success(self)

Test async operation that fails then succeeds

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_all_retries_fail(self)

Test async operation that fails all retries

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### operation()

**Returns**: (none)



### operation()

**Returns**: (none)



### operation()

**Returns**: (none)



### operation()

**Returns**: (none)



### operation()

**Async function**

**Returns**: (none)



### operation()

**Async function**

**Returns**: (none)



### operation()

**Async function**

**Returns**: (none)


