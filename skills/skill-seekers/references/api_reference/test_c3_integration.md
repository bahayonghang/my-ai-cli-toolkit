# API Reference: test_c3_integration.py

**Language**: Python

**Source**: `tests/test_c3_integration.py`

---

## Classes

### TestC3Integration

Test C3.5 integration features.

**Inherits from**: (none)

#### Methods

##### temp_dir(self)

Create temporary directory for tests.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### mock_config(self, temp_dir)

Create mock unified config with GitHub source.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dir | None | - | - |


##### mock_c3_data(self)

Create mock C3.x analysis data.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_codebase_analysis_enabled_by_default(self, mock_config, temp_dir)

Test that enable_codebase_analysis defaults to True.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| temp_dir | None | - | - |


##### test_skip_codebase_analysis_flag(self, mock_config, temp_dir)

Test --skip-codebase-analysis CLI flag disables analysis.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| temp_dir | None | - | - |


##### test_architecture_md_generation(self, mock_config, mock_c3_data, temp_dir)

Test ARCHITECTURE.md is generated with all 8 sections.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| mock_c3_data | None | - | - |
| temp_dir | None | - | - |


##### test_c3_reference_directory_structure(self, mock_config, mock_c3_data, temp_dir)

Test correct C3.x reference directory structure is created.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| mock_c3_data | None | - | - |
| temp_dir | None | - | - |


##### test_graceful_degradation_on_c3_failure(self, mock_config, temp_dir)

Test skill builds even if C3.x analysis fails.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| temp_dir | None | - | - |


##### test_config_validator_accepts_c3_properties(self, temp_dir)

Test config validator accepts new C3.5 properties.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dir | None | - | - |


##### test_config_validator_rejects_invalid_ai_mode(self, temp_dir)

Test config validator rejects invalid ai_mode values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| temp_dir | None | - | - |


##### test_skill_md_includes_c3_summary(self, mock_config, mock_c3_data, temp_dir)

Test SKILL.md includes C3.x architecture summary.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_config | None | - | - |
| mock_c3_data | None | - | - |
| temp_dir | None | - | - |



