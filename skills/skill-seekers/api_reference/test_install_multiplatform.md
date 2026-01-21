# API Reference: test_install_multiplatform.py

**Language**: Python

**Source**: `tests/test_install_multiplatform.py`

---

## Classes

### TestInstallCLI

Test install_skill CLI with multi-platform support

**Inherits from**: unittest.TestCase

#### Methods

##### test_cli_accepts_target_flag(self)

Test that CLI accepts --target flag

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_rejects_invalid_target(self)

Test that CLI rejects invalid --target values

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallToolMultiPlatform

Test install_skill_tool with multi-platform support

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_install_tool_accepts_target_parameter(self)

Test that install_skill_tool accepts target parameter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_tool_uses_correct_adaptor(self)

Test that install_skill_tool uses the correct adaptor for each platform

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_install_tool_platform_specific_api_keys(self)

Test that install_tool checks for correct API key per platform

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestInstallWorkflowIntegration

Integration tests for full install workflow

**Inherits from**: unittest.IsolatedAsyncioTestCase

#### Methods

##### test_dry_run_shows_correct_platform(self)

Test dry run shows correct platform in output

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



