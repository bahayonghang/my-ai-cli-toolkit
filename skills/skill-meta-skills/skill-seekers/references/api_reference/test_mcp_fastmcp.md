# API Reference: test_mcp_fastmcp.py

**Language**: Python

**Source**: `tests/test_mcp_fastmcp.py`

---

## Classes

### TestFastMCPServerInitialization

Test FastMCP server initialization and setup.

**Inherits from**: (none)

#### Methods

##### test_server_import(self)

Test that FastMCP server module can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_server_has_name(self)

Test that server has correct name.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_server_has_instructions(self)

Test that server has instructions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_all_tools_registered(self)

Test that all 17 tools are registered.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestConfigTools

Test configuration management tools.

**Inherits from**: (none)

#### Methods

##### test_generate_config_basic(self, temp_dirs, monkeypatch)

Test basic config generation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_generate_config_with_options(self, temp_dirs, monkeypatch)

Test config generation with custom options.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_generate_config_unlimited(self, temp_dirs, monkeypatch)

Test config generation with unlimited pages.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_list_configs(self, _temp_dirs)

Test listing available configs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _temp_dirs | None | - | - |


##### test_validate_config_valid(self, sample_config)

Test validating a valid config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_validate_config_unified(self, unified_config)

Test validating a unified config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| unified_config | None | - | - |


##### test_validate_config_missing_file(self, temp_dirs)

Test validating a non-existent config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |




### TestScrapingTools

Test scraping tools.

**Inherits from**: (none)

#### Methods

##### test_estimate_pages_basic(self, sample_config)

Test basic page estimation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_estimate_pages_unlimited(self, sample_config)

Test estimation with unlimited discovery.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_estimate_pages_custom_discovery(self, sample_config)

Test estimation with custom max_discovery.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_scrape_docs_basic(self, sample_config)

Test basic documentation scraping.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_scrape_docs_with_enhancement(self, sample_config)

Test scraping with local enhancement.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_scrape_docs_skip_scrape(self, sample_config)

Test scraping with skip_scrape flag.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_scrape_docs_unified(self, unified_config)

Test scraping with unified config.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| unified_config | None | - | - |


##### test_scrape_docs_merge_mode_override(self, unified_config)

Test scraping with merge mode override.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| unified_config | None | - | - |


##### test_scrape_github_basic(self)

Test basic GitHub scraping.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_github_with_token(self)

Test GitHub scraping with authentication token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_github_options(self)

Test GitHub scraping with various options.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_pdf_basic(self, temp_dirs)

Test basic PDF scraping.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_scrape_pdf_direct_path(self)

Test PDF scraping with direct path.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_codebase_basic(self, temp_dirs)

Test basic codebase scraping.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_scrape_codebase_with_options(self, temp_dirs)

Test codebase scraping with various options.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |




### TestPackagingTools

Test packaging and upload tools.

**Inherits from**: (none)

#### Methods

##### test_package_skill_basic(self, temp_dirs)

Test basic skill packaging.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_package_skill_with_auto_upload(self, temp_dirs)

Test packaging with auto-upload.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_upload_skill_basic(self, temp_dirs)

Test basic skill upload.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_upload_skill_missing_file(self, temp_dirs)

Test upload with missing file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_install_skill_with_config_name(self)

Test complete install workflow with config name.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_skill_with_config_path(self, sample_config)

Test complete install workflow with config path.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_install_skill_unlimited(self)

Test install workflow with unlimited pages.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_skill_no_upload(self)

Test install workflow without auto-upload.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSplittingTools

Test config splitting and router generation tools.

**Inherits from**: (none)

#### Methods

##### test_split_config_auto_strategy(self, sample_config)

Test config splitting with auto strategy.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_split_config_category_strategy(self, sample_config)

Test config splitting with category strategy.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_split_config_size_strategy(self, sample_config)

Test config splitting with size strategy.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_generate_router_basic(self, temp_dirs)

Test router generation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_generate_router_with_name(self, temp_dirs)

Test router generation with custom name.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |




### TestSourceTools

Test config source management tools.

**Inherits from**: (none)

#### Methods

##### test_fetch_config_list_api(self)

Test fetching config list from API.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fetch_config_download_api(self, temp_dirs)

Test downloading specific config from API.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_with_category_filter(self)

Test fetching configs with category filter.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fetch_config_from_git_url(self, temp_dirs)

Test fetching config from git URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_from_source(self, temp_dirs)

Test fetching config from named source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_with_token(self, temp_dirs)

Test fetching config with authentication token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_fetch_config_refresh_cache(self, temp_dirs)

Test fetching config with cache refresh.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_submit_config_with_path(self, sample_config)

Test submitting config from file path.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_submit_config_with_json(self)

Test submitting config as JSON string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_add_config_source_basic(self)

Test adding a config source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_add_config_source_with_options(self)

Test adding config source with all options.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_add_config_source_ssh_url(self)

Test adding config source with SSH URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_config_sources_all(self)

Test listing all config sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_list_config_sources_enabled_only(self)

Test listing only enabled sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_remove_config_source(self)

Test removing a config source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFastMCPIntegration

Test integration scenarios across multiple tools.

**Inherits from**: (none)

#### Methods

##### test_workflow_generate_validate_scrape(self, temp_dirs, monkeypatch)

Test complete workflow: generate → validate → scrape.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_workflow_source_fetch_scrape(self, temp_dirs)

Test workflow: add source → fetch config → scrape.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_workflow_split_router(self, sample_config, temp_dirs)

Test workflow: split config → generate router.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |
| temp_dirs | None | - | - |




### TestErrorHandling

Test error handling across all tools.

**Inherits from**: (none)

#### Methods

##### test_generate_config_invalid_url(self, temp_dirs, monkeypatch)

Test error handling for invalid URL.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_validate_config_invalid_json(self, temp_dirs)

Test error handling for invalid JSON.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |


##### test_scrape_docs_missing_config(self)

Test error handling for missing config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_skill_missing_directory(self)

Test error handling for missing skill directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestTypeValidation

Test type validation for tool parameters.

**Inherits from**: (none)

#### Methods

##### test_generate_config_return_type(self, temp_dirs, monkeypatch)

Test that generate_config returns string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dirs | None | - | - |
| monkeypatch | None | - | - |


##### test_list_configs_return_type(self)

Test that list_configs returns string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_return_type(self, sample_config)

Test that estimate_pages returns string.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |


##### test_all_tools_return_strings(self, sample_config, _temp_dirs)

Test that all tools return string type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| sample_config | None | - | - |
| _temp_dirs | None | - | - |




## Functions

### temp_dirs(tmp_path)

Create temporary directories for testing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| tmp_path | None | - | - |

**Returns**: (none)



### sample_config(temp_dirs)

Create a sample config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| temp_dirs | None | - | - |

**Returns**: (none)



### unified_config(temp_dirs)

Create a sample unified config file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| temp_dirs | None | - | - |

**Returns**: (none)


