# API Reference: test_skip_llms_txt.py

**Language**: Python

**Source**: `tests/test_skip_llms_txt.py`

---

## Classes

### TestSkipLlmsTxtConfig

Test skip_llms_txt configuration option.

**Inherits from**: unittest.TestCase

#### Methods

##### test_default_skip_llms_txt_is_false(self)

Test that skip_llms_txt defaults to False when not specified.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_can_be_set_true(self)

Test that skip_llms_txt can be explicitly set to True.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_can_be_set_false(self)

Test that skip_llms_txt can be explicitly set to False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSkipLlmsTxtSyncBehavior

Test skip_llms_txt behavior in sync scraping mode.

**Inherits from**: unittest.TestCase

#### Methods

##### test_llms_txt_tried_when_not_skipped(self)

Test that _try_llms_txt is called when skip_llms_txt is False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_llms_txt_skipped_when_skip_true(self)

Test that _try_llms_txt is NOT called when skip_llms_txt is True.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_llms_txt_skipped_in_dry_run_mode(self)

Test that _try_llms_txt is NOT called in dry-run mode regardless of skip setting.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSkipLlmsTxtAsyncBehavior

Test skip_llms_txt behavior in async scraping mode.

**Inherits from**: unittest.TestCase

#### Methods

##### test_async_llms_txt_tried_when_not_skipped(self)

Test that _try_llms_txt is called in async mode when skip_llms_txt is False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_llms_txt_skipped_when_skip_true(self)

Test that _try_llms_txt is NOT called in async mode when skip_llms_txt is True.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSkipLlmsTxtWithRealConfig

Test skip_llms_txt with real-world config patterns.

**Inherits from**: unittest.TestCase

#### Methods

##### test_telegram_bots_config_pattern(self)

Test the telegram-bots config pattern which uses skip_llms_txt.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_with_multiple_start_urls(self)

Test skip_llms_txt works correctly with multiple start URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSkipLlmsTxtEdgeCases

Test edge cases for skip_llms_txt.

**Inherits from**: unittest.TestCase

#### Methods

##### test_skip_llms_txt_with_int_zero_logs_warning(self)

Test that integer 0 logs warning and defaults to False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_with_int_one_logs_warning(self)

Test that integer 1 logs warning and defaults to False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_with_string_logs_warning(self)

Test that string values log warning and default to False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_llms_txt_with_none_logs_warning(self)

Test that None logs warning and defaults to False.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scraping_proceeds_when_llms_txt_skipped(self)

Test that HTML scraping proceeds normally when llms.txt is skipped.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### mock_scrape(url)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| url | None | - | - |

**Returns**: (none)


