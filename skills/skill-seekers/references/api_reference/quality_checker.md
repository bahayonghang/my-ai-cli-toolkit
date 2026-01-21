# API Reference: quality_checker.py

**Language**: Python

**Source**: `src/skill_seekers/cli/quality_checker.py`

---

## Classes

### QualityIssue

Represents a quality issue found during validation.

**Inherits from**: (none)



### QualityReport

Complete quality report for a skill.

**Inherits from**: (none)

#### Methods

##### add_error(self, category: str, message: str, file: str = None, line: int = None)

Add an error to the report.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| category | str | - | - |
| message | str | - | - |
| file | str | None | - |
| line | int | None | - |


##### add_warning(self, category: str, message: str, file: str = None, line: int = None)

Add a warning to the report.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| category | str | - | - |
| message | str | - | - |
| file | str | None | - |
| line | int | None | - |


##### add_info(self, category: str, message: str, file: str = None, line: int = None)

Add info to the report.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| category | str | - | - |
| message | str | - | - |
| file | str | None | - |
| line | int | None | - |


##### has_errors(self) → bool

Check if there are any errors.

**Decorators**: `@property`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### has_warnings(self) → bool

Check if there are any warnings.

**Decorators**: `@property`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### is_excellent(self) → bool

Check if quality is excellent (no errors, no warnings).

**Decorators**: `@property`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### quality_score(self) → float

Calculate quality score (0-100).

**Decorators**: `@property`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `float`


##### quality_grade(self) → str

Get quality grade (A-F).

**Decorators**: `@property`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`




### SkillQualityChecker

Validates skill quality and generates reports.

**Inherits from**: (none)

#### Methods

##### __init__(self, skill_dir: Path)

Initialize quality checker.

Args:
    skill_dir: Path to skill directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | Path | - | - |


##### check_all(self) → QualityReport

Run all quality checks and return report.

Returns:
    QualityReport: Complete quality report

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `QualityReport`


##### _check_skill_structure(self)

Check basic skill structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _check_enhancement_quality(self)

Check if SKILL.md was properly enhanced.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _check_content_quality(self)

Check content quality.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _check_links(self)

Check internal markdown links.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _check_skill_completeness(self)

Check skill completeness based on best practices.

Validates that skills include verification/prerequisites sections,
error handling guidance, and clear workflow steps.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### print_report(report: QualityReport, verbose: bool = False)

Print quality report to console.

Args:
    report: Quality report to print
    verbose: Show all info messages

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| report | QualityReport | - | - |
| verbose | bool | False | - |

**Returns**: (none)



### main()

Main entry point.

**Returns**: (none)


