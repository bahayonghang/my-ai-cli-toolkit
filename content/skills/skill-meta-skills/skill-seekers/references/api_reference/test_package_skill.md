# API Reference: test_package_skill.py

**Language**: Python

**Source**: `tests/test_package_skill.py`

---

## Classes

### TestPackageSkill

Test package_skill function

**Inherits from**: unittest.TestCase

#### Methods

##### create_test_skill_directory(self, tmpdir)

Helper to create a test skill directory structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmpdir | None | - | - |


##### test_package_valid_skill_directory(self)

Test packaging a valid skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_creates_correct_zip_structure(self)

Test that packaged zip contains correct files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_excludes_backup_files(self)

Test that .backup files are excluded from zip

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_nonexistent_directory(self)

Test packaging a nonexistent directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_directory_without_skill_md(self)

Test packaging directory without SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_creates_zip_in_correct_location(self)

Test that zip is created in output/ directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_zip_name_matches_skill_name(self)

Test that zip filename matches skill directory name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPackageSkillCLI

Test package_skill.py command-line interface

**Inherits from**: unittest.TestCase

#### Methods

##### test_cli_help_output(self)

Test that skill-seekers package --help works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_executes_without_errors(self)

Test that skill-seekers-package entry point works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



