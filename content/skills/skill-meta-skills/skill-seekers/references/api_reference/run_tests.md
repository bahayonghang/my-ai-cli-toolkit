# API Reference: run_tests.py

**Language**: Python

**Source**: `src/skill_seekers/cli/run_tests.py`

---

## Classes

### ColoredTextTestResult

Custom test result class with colored output

**Inherits from**: unittest.TextTestResult

#### Methods

##### __init__(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### addSuccess(self, test)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test | None | - | - |


##### addError(self, test, err)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test | None | - | - |
| err | None | - | - |


##### addFailure(self, test, err)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test | None | - | - |
| err | None | - | - |


##### addSkip(self, test, reason)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test | None | - | - |
| reason | None | - | - |




### ColoredTextTestRunner

Custom test runner with colored output

**Inherits from**: unittest.TextTestRunner



## Functions

### discover_tests(test_dir = 'tests')

Discover all test files in the tests directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| test_dir | None | 'tests' | - |

**Returns**: (none)



### run_specific_suite(suite_name)

Run a specific test suite

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| suite_name | None | - | - |

**Returns**: (none)



### print_summary(result)

Print a detailed test summary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| result | None | - | - |

**Returns**: (none)



### main()

Main test runner

**Returns**: (none)


