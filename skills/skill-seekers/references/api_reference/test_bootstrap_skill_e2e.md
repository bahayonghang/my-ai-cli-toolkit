# API Reference: test_bootstrap_skill_e2e.py

**Language**: Python

**Source**: `tests/test_bootstrap_skill_e2e.py`

---

## Classes

### TestBootstrapSkillE2E

End-to-end tests for bootstrap skill

**Inherits from**: (none)

#### Methods

##### test_bootstrap_creates_output_structure(self, run_bootstrap, output_skill_dir)

Verify bootstrap creates correct directory structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |


##### test_bootstrap_prepends_header(self, run_bootstrap, output_skill_dir)

Verify header template prepended to SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |


##### test_bootstrap_validates_yaml_frontmatter(self, run_bootstrap, output_skill_dir)

Verify generated SKILL.md has valid YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |


##### test_bootstrap_output_line_count(self, run_bootstrap, output_skill_dir)

Verify output SKILL.md has reasonable line count

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |


##### test_skill_installable_in_venv(self, run_bootstrap, output_skill_dir, tmp_path)

Test skill is installable in clean virtual environment

**Decorators**: `@pytest.mark.slow`, `@pytest.mark.venv`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |
| tmp_path | None | - | - |


##### test_skill_packageable_with_adaptors(self, run_bootstrap, output_skill_dir, tmp_path)

Verify bootstrap output works with all platform adaptors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| run_bootstrap | None | - | - |
| output_skill_dir | None | - | - |
| tmp_path | None | - | - |




## Functions

### project_root()

Get project root directory.

**Returns**: (none)



### run_bootstrap(project_root)

Execute bootstrap script and return result

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| project_root | None | - | - |

**Returns**: (none)



### output_skill_dir(project_root)

Get path to bootstrap output directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| project_root | None | - | - |

**Returns**: (none)



### _run(timeout = 600)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| timeout | None | 600 | - |

**Returns**: (none)


