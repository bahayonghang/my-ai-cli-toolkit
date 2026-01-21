# API Reference: test_config_validation.py

**Language**: Python

**Source**: `tests/test_config_validation.py`

---

## Classes

### TestConfigValidation

Test configuration validation

**Inherits from**: unittest.TestCase

#### Methods

##### test_valid_minimal_config(self)

Test valid minimal configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_complete_config(self)

Test valid complete configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_missing_name(self)

Test missing required field 'name'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_missing_base_url(self)

Test missing required field 'base_url'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_name_special_chars(self)

Test invalid name with special characters

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_name_formats(self)

Test various valid name formats

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_base_url_no_protocol(self)

Test invalid base_url without protocol

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_url_protocols(self)

Test valid URL protocols

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_selectors_not_dict(self)

Test invalid selectors (not a dictionary)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_missing_recommended_selectors(self)

Test warning for missing recommended selectors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_url_patterns_not_dict(self)

Test invalid url_patterns (not a dictionary)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_url_patterns_include_not_list(self)

Test invalid url_patterns.include (not a list)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_categories_not_dict(self)

Test invalid categories (not a dictionary)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_category_keywords_not_list(self)

Test invalid category keywords (not a list)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_rate_limit_negative(self)

Test invalid rate_limit (negative)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_rate_limit_too_high(self)

Test invalid rate_limit (too high)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_rate_limit_not_number(self)

Test invalid rate_limit (not a number)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_rate_limit_range(self)

Test valid rate_limit range

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_max_pages_zero(self)

Test invalid max_pages (zero)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_max_pages_too_high(self)

Test invalid max_pages (too high)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_max_pages_not_int(self)

Test invalid max_pages (not an integer)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_max_pages_range(self)

Test valid max_pages range

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_start_urls_not_list(self)

Test invalid start_urls (not a list)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_start_urls_bad_protocol(self)

Test invalid start_urls (bad protocol)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_valid_start_urls(self)

Test valid start_urls

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_config_with_llms_txt_url(self)

Test config validation with explicit llms_txt_url

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_config_with_skip_llms_txt(self)

Test config validation accepts skip_llms_txt

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_config_with_skip_llms_txt_false(self)

Test config validation accepts skip_llms_txt as False

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



