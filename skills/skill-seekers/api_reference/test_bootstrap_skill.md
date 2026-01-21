# API Reference: test_bootstrap_skill.py

**Language**: Python

**Source**: `tests/test_bootstrap_skill.py`

---

## Classes

### TestBootstrapSkillScript

Tests for scripts/bootstrap_skill.sh

**Inherits from**: (none)

#### Methods

##### test_script_exists(self, project_root)

Test that bootstrap script exists and is executable.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| project_root | None | - | - |


##### test_header_template_exists(self, project_root)

Test that skill header template exists.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| project_root | None | - | - |


##### test_header_has_required_sections(self, project_root)

Test that header template has required operational sections.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| project_root | None | - | - |


##### test_header_has_yaml_frontmatter(self, project_root)

Test that header has valid YAML frontmatter.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| project_root | None | - | - |


##### test_bootstrap_script_runs(self, project_root)

Test that bootstrap script runs successfully.

Note: This test is slow as it runs full codebase analysis.
Run with: pytest -m slow

**Decorators**: `@pytest.mark.slow`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| project_root | None | - | - |




## Functions

### project_root()

Get project root directory.

**Returns**: (none)


