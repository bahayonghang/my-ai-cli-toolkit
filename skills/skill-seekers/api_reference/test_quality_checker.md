# API Reference: test_quality_checker.py

**Language**: Python

**Source**: `tests/test_quality_checker.py`

---

## Classes

### TestQualityChecker

Test quality checker functionality

**Inherits from**: unittest.TestCase

#### Methods

##### create_test_skill(self, tmpdir, skill_md_content, create_references = True)

Helper to create a test skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmpdir | None | - | - |
| skill_md_content | None | - | - |
| create_references | None | True | - |


##### test_checker_detects_missing_skill_md(self)

Test that checker detects missing SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_missing_references(self)

Test that checker warns about missing references

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_invalid_frontmatter(self)

Test that checker detects invalid YAML frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_missing_name_field(self)

Test that checker detects missing name field in frontmatter

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_code_without_language(self)

Test that checker warns about code blocks without language tags

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_approves_good_skill(self)

Test that checker gives high score to well-formed skill

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_broken_links(self)

Test that checker detects broken internal links

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_quality_score_calculation(self)

Test that quality score is calculated correctly

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_quality_grade_calculation(self)

Test that quality grades are assigned correctly

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_is_excellent_property(self)

Test is_excellent property

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCompletenessChecks

Test completeness check functionality

**Inherits from**: unittest.TestCase

#### Methods

##### create_test_skill(self, tmpdir, skill_md_content)

Helper to create a test skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmpdir | None | - | - |
| skill_md_content | None | - | - |


##### test_checker_detects_prerequisites_section(self)

Test that checker detects prerequisites section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_troubleshooting_section(self)

Test that checker detects troubleshooting section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_detects_workflow_steps(self)

Test that checker detects workflow steps

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_checker_suggests_adding_prerequisites(self)

Test that checker suggests adding prerequisites when missing

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestQualityCheckerCLI

Test quality checker CLI

**Inherits from**: unittest.TestCase

#### Methods

##### test_cli_help_output(self)

Test that CLI help works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_with_nonexistent_directory(self)

Test CLI behavior with nonexistent directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



