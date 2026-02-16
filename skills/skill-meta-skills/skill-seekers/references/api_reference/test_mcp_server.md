# API Reference: test_mcp_server.py

**Language**: Python

**Source**: `tests/test_mcp_server.py`

---

## Classes

### TestMCPServerInitialization

Test MCP server initialization

**Inherits from**: unittest.TestCase

#### Methods

##### test_server_import(self)

Test that server module can be imported

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_server_initialization(self)

Test server initializes correctly

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestListTools

Test list_tools functionality

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_list_tools_returns_tools(self)

Test that list_tools returns all expected tools

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_tool_schemas(self)

Test that all tools have valid schemas

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGenerateConfigTool

Test generate_config tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generate_config_basic(self)

Test basic config generation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generate_config_with_options(self)

Test config generation with custom options

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generate_config_defaults(self)

Test that default values are applied correctly

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestEstimatePagesTool

Test estimate_pages tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_success(self, mock_streaming)

Test successful page estimation

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |


##### test_estimate_pages_with_max_discovery(self, mock_streaming)

Test page estimation with custom max_discovery

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |


##### test_estimate_pages_error(self, mock_streaming)

Test error handling in page estimation

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |




### TestScrapeDocsTool

Test scrape_docs tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_docs_basic(self, mock_streaming)

Test basic documentation scraping

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |


##### test_scrape_docs_with_skip_scrape(self, mock_streaming)

Test scraping with skip_scrape flag

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |


##### test_scrape_docs_with_dry_run(self, mock_streaming)

Test scraping with dry_run flag

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |


##### test_scrape_docs_with_enhance_local(self, mock_streaming)

Test scraping with local enhancement

**Decorators**: `@patch('skill_seekers.mcp.tools.scraping_tools.run_subprocess_with_streaming')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_streaming | None | - | - |




### TestPackageSkillTool

Test package_skill tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_skill_success(self, mock_run)

Test successful skill packaging

**Decorators**: `@patch('subprocess.run')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_run | None | - | - |


##### test_package_skill_error(self, mock_run)

Test error handling in skill packaging

**Decorators**: `@patch('subprocess.run')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_run | None | - | - |




### TestListConfigsTool

Test list_configs tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_configs_success(self)

Test listing all configs

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_configs_empty(self)

Test listing configs when directory is empty

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_configs_no_directory(self)

Test listing configs when directory doesn't exist

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestValidateConfigTool

Test validate_config tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### asyncSetUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### asyncTearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_valid_config(self)

Test validating a valid config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_invalid_config(self)

Test validating an invalid config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_nonexistent_config(self)

Test validating a nonexistent config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCallToolRouter

Test call_tool routing

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_call_tool_unknown(self)

Test calling an unknown tool

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_call_tool_exception_handling(self)

Test that exceptions are caught and returned as errors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestMCPServerIntegration

Integration tests for MCP server

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_full_workflow_simulation(self)

Test complete workflow: generate config -> validate -> estimate

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSubmitConfigTool

Test submit_config MCP tool

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_submit_config_requires_token(self)

Should error without GitHub token

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_validates_required_fields(self)

Should reject config missing required fields

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_validates_name_format(self)

Should reject invalid name characters

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_validates_url_format(self)

Should reject invalid URL format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_accepts_legacy_format(self)

Should accept valid legacy config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_accepts_unified_format(self)

Should accept valid unified config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_from_file_path(self)

Should accept config_path parameter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_submit_config_detects_category(self)

Should auto-detect category from config name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



