# API Reference: test_install_skill.py

**Language**: Python

**Source**: `tests/test_install_skill.py`

---

## Classes

### TestInstallSkillValidation

Test input validation

**Inherits from**: (none)

#### Methods

##### test_validation_no_config(self)

Test error when neither config_name nor config_path provided

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validation_both_configs(self)

Test error when both config_name and config_path provided

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallSkillDryRun

Test dry-run mode

**Inherits from**: (none)

#### Methods

##### test_dry_run_with_config_name(self)

Test dry run with config name (includes fetch phase)

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_dry_run_with_config_path(self)

Test dry run with config path (skips fetch phase)

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallSkillEnhancementMandatory

Test that enhancement is always included

**Inherits from**: (none)

#### Methods

##### test_enhancement_is_mandatory(self)

Test that enhancement phase is always present and mandatory

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallSkillPhaseOrchestration

Test phase orchestration and data flow

**Inherits from**: (none)

#### Methods

##### test_full_workflow_with_fetch(self, mock_env_get, mock_open, mock_upload, mock_package, mock_subprocess, mock_scrape, mock_fetch)

Test complete workflow when config_name is provided

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.fetch_config_tool')`, `@patch('skill_seekers.mcp.server.scrape_docs_tool')`, `@patch('skill_seekers.mcp.server.run_subprocess_with_streaming')`, `@patch('skill_seekers.mcp.server.package_skill_tool')`, `@patch('skill_seekers.mcp.server.upload_skill_tool')`, `@patch('builtins.open')`, `@patch('os.environ.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_env_get | None | - | - |
| mock_open | None | - | - |
| mock_upload | None | - | - |
| mock_package | None | - | - |
| mock_subprocess | None | - | - |
| mock_scrape | None | - | - |
| mock_fetch | None | - | - |


##### test_workflow_with_existing_config(self, mock_env_get, mock_open, mock_package, mock_subprocess, mock_scrape)

Test workflow when config_path is provided (skips fetch)

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.scrape_docs_tool')`, `@patch('skill_seekers.mcp.server.run_subprocess_with_streaming')`, `@patch('skill_seekers.mcp.server.package_skill_tool')`, `@patch('builtins.open')`, `@patch('os.environ.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_env_get | None | - | - |
| mock_open | None | - | - |
| mock_package | None | - | - |
| mock_subprocess | None | - | - |
| mock_scrape | None | - | - |




### TestInstallSkillErrorHandling

Test error handling at each phase

**Inherits from**: (none)

#### Methods

##### test_fetch_phase_failure(self, mock_fetch)

Test handling of fetch phase failure

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.fetch_config_tool')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetch | None | - | - |


##### test_scrape_phase_failure(self, mock_open, mock_scrape)

Test handling of scrape phase failure

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.scrape_docs_tool')`, `@patch('builtins.open')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_open | None | - | - |
| mock_scrape | None | - | - |


##### test_enhancement_phase_failure(self, mock_open, mock_subprocess, mock_scrape)

Test handling of enhancement phase failure

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.scrape_docs_tool')`, `@patch('skill_seekers.mcp.server.run_subprocess_with_streaming')`, `@patch('builtins.open')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_open | None | - | - |
| mock_subprocess | None | - | - |
| mock_scrape | None | - | - |




### TestInstallSkillOptions

Test various option combinations

**Inherits from**: (none)

#### Methods

##### test_no_upload_option(self)

Test that no_upload option skips upload phase

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unlimited_option(self)

Test that unlimited option is passed to scraper

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_custom_destination(self)

Test custom destination directory

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



