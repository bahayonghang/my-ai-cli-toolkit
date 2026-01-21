# API Reference: test_integration.py

**Language**: Python

**Source**: `tests/test_integration.py`

---

## Classes

### TestDryRunMode

Test dry-run mode functionality

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_dry_run_no_directories_created(self)

Test that dry-run mode doesn't create directories

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_dry_run_flag_set(self)

Test that dry_run flag is properly set

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_normal_mode_creates_directories(self)

Test that normal mode creates directories

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestConfigLoading

Test configuration loading and validation

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up temporary directory for test configs

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


##### test_load_valid_config(self)

Test loading a valid configuration file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_load_invalid_json(self)

Test loading an invalid JSON file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_load_nonexistent_file(self)

Test loading a nonexistent file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_load_config_with_validation_errors(self)

Test loading a config with validation errors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRealConfigFiles

Test that real config files in the repository are valid

**Inherits from**: unittest.TestCase

#### Methods

##### test_godot_config(self)

Test Godot config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_react_config(self)

Test React config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_vue_config(self)

Test Vue config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_django_config(self)

Test Django config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fastapi_config(self)

Test FastAPI config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_steam_economy_config(self)

Test Steam Economy config is valid

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestURLProcessing

Test URL processing and validation

**Inherits from**: unittest.TestCase

#### Methods

##### test_url_normalization(self)

Test URL normalization in converter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_start_urls_fallback(self)

Test that start_urls defaults to base_url

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multiple_start_urls(self)

Test multiple start URLs

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestLlmsTxtIntegration

Test llms.txt integration into scraping workflow

**Inherits from**: unittest.TestCase

#### Methods

##### test_scraper_has_llms_txt_attributes(self)

Test that scraper has llms.txt detection attributes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scraper_has_try_llms_txt_method(self)

Test that scraper has _try_llms_txt method

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestContentExtraction

Test content extraction functionality

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test converter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_empty_content(self)

Test extracting from empty HTML

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_basic_content(self)

Test extracting basic content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFullLlmsTxtWorkflow

Test complete llms.txt workflow with mocked HTTP requests

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test configuration and temporary directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up temporary directory and test output

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_full_llms_txt_workflow(self)

Test complete workflow: config -> scrape (llms.txt) -> build -> verify

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multi_variant_download(self)

Test downloading all 3 llms.txt variants

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### test_no_content_truncation()

Test that content is NOT truncated in reference files

**Returns**: (none)



### mock_download(url)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| url | None | - | - |

**Returns**: (none)


