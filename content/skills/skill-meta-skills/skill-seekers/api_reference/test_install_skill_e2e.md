# API Reference: test_install_skill_e2e.py

**Language**: Python

**Source**: `tests/test_install_skill_e2e.py`

---

## Classes

### TestInstallSkillE2E

End-to-end tests for install_skill MCP tool

**Inherits from**: (none)

#### Methods

##### test_config_file(self, tmp_path)

Create a minimal test config file

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### mock_scrape_output(self, tmp_path)

Mock scrape_docs output to avoid actual scraping

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_e2e_with_config_path_no_upload(self, test_config_file, tmp_path, mock_scrape_output)

E2E test: config_path mode, no upload

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |
| tmp_path | None | - | - |
| mock_scrape_output | None | - | - |


##### test_e2e_with_config_name_fetch(self, tmp_path)

E2E test: config_name mode with fetch phase

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_e2e_dry_run_mode(self, test_config_file)

E2E test: dry-run mode (no actual execution)

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |


##### test_e2e_error_handling_scrape_failure(self, test_config_file)

E2E test: error handling when scrape fails

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |


##### test_e2e_error_handling_enhancement_failure(self, test_config_file, mock_scrape_output)

E2E test: error handling when enhancement fails

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |
| mock_scrape_output | None | - | - |




### TestInstallSkillCLI_E2E

End-to-end tests for skill-seekers install CLI

**Inherits from**: (none)

#### Methods

##### test_config_file(self, tmp_path)

Create a minimal test config file

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_cli_dry_run(self, test_config_file)

E2E test: CLI dry-run mode (via direct function call)

**Decorators**: `@pytest.mark.asyncio`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |


##### test_cli_validation_error_no_config(self)

E2E test: CLI validation error (no config provided)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_help(self)

E2E test: CLI help command

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_full_workflow_mocked(self, mock_package, mock_enhance, mock_scrape, test_config_file, tmp_path)

E2E test: Full CLI workflow with mocked phases (via direct call)

**Decorators**: `@pytest.mark.asyncio`, `@patch('skill_seekers.mcp.server.scrape_docs_tool')`, `@patch('skill_seekers.mcp.server.run_subprocess_with_streaming')`, `@patch('skill_seekers.mcp.server.package_skill_tool')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_package | None | - | - |
| mock_enhance | None | - | - |
| mock_scrape | None | - | - |
| test_config_file | None | - | - |
| tmp_path | None | - | - |


##### test_cli_via_unified_command(self, test_config_file)

E2E test: Using 'skill-seekers install' unified CLI

Note: Skipped because subprocess execution has asyncio.run() issues.
The functionality is already tested in test_cli_full_workflow_mocked
via direct function calls.

**Decorators**: `@pytest.mark.skip(reason='Subprocess-based CLI test has asyncio issues; functionality tested in test_cli_full_workflow_mocked')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_config_file | None | - | - |




### TestInstallSkillE2E_RealFiles

E2E tests with real file operations (no mocking except upload)

**Inherits from**: (none)

#### Methods

##### real_test_config(self, tmp_path)

Create a real minimal config that can be scraped

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_e2e_real_scrape_with_mocked_enhancement(self, real_test_config, tmp_path)

E2E test with real scraping but mocked enhancement/upload

**Decorators**: `@pytest.mark.asyncio`, `@pytest.mark.slow`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| real_test_config | None | - | - |
| tmp_path | None | - | - |



