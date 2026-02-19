# API Reference: test_base.py

**Language**: Python

**Source**: `tests/test_adaptors/test_base.py`

---

## Classes

### TestSkillMetadata

Test SkillMetadata dataclass

**Inherits from**: unittest.TestCase

#### Methods

##### test_basic_metadata(self)

Test basic metadata creation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_full_metadata(self)

Test metadata with all fields

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAdaptorRegistry

Test adaptor registry and factory

**Inherits from**: unittest.TestCase

#### Methods

##### test_list_platforms(self)

Test listing available platforms

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_is_platform_available(self)

Test checking platform availability

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_adaptor_claude(self)

Test getting Claude adaptor

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_adaptor_invalid(self)

Test getting invalid adaptor raises error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_adaptor_with_config(self)

Test getting adaptor with custom config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestBaseAdaptorInterface

Test base adaptor interface methods

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test adaptor

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_validate_api_key_default(self)

Test default API key validation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_get_env_var_name(self)

Test environment variable name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_supports_enhancement(self)

Test enhancement support check

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



