# API Reference: test_rate_limit_handler.py

**Language**: Python

**Source**: `tests/test_rate_limit_handler.py`

---

## Classes

### TestRateLimitHandler

Test RateLimitHandler functionality.

**Inherits from**: (none)

#### Methods

##### test_create_headers_no_token(self)

Test header creation without token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_create_headers_with_token(self)

Test header creation with token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_init_without_token(self)

Test initialization without token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_init_with_token(self)

Test initialization with token.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_init_with_config_strategy(self, mock_get_config)

Test initialization pulls strategy from config.

**Decorators**: `@patch('skill_seekers.cli.rate_limit_handler.get_config_manager')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get_config | None | - | - |


##### test_extract_rate_limit_info(self)

Test extracting rate limit info from response headers.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_check_upfront_no_token_declined(self, mock_input)

Test upfront check with no token, user declines.

**Decorators**: `@patch('builtins.input', return_value='n')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_input | None | - | - |


##### test_check_upfront_no_token_accepted(self, mock_input)

Test upfront check with no token, user accepts.

**Decorators**: `@patch('builtins.input', return_value='y')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_input | None | - | - |


##### test_check_upfront_no_token_non_interactive(self)

Test upfront check with no token in non-interactive mode.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_check_upfront_with_token_good_status(self, mock_get_config, mock_get)

Test upfront check with token and good rate limit status.

**Decorators**: `@patch('requests.get')`, `@patch('skill_seekers.cli.rate_limit_handler.get_config_manager')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get_config | None | - | - |
| mock_get | None | - | - |


##### test_check_response_not_rate_limited(self)

Test check_response with normal 200 response.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_check_response_other_403(self)

Test check_response with 403 but not rate limit.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_non_interactive_fail_strategy(self, mock_get_config)

Test non-interactive mode with fail strategy raises error.

**Decorators**: `@patch('skill_seekers.cli.rate_limit_handler.get_config_manager')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get_config | None | - | - |




### TestConfigManagerIntegration

Test ConfigManager integration with rate limit handler.

**Inherits from**: (none)

#### Methods

##### test_config_manager_creates_default_config(self, tmp_path, monkeypatch)

Test that ConfigManager creates default config structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |
| monkeypatch | None | - | - |


##### test_add_and_retrieve_github_profile(self, tmp_path, monkeypatch)

Test adding and retrieving GitHub profiles.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |
| monkeypatch | None | - | - |


##### test_get_next_profile(self, tmp_path, monkeypatch)

Test profile switching.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |
| monkeypatch | None | - | - |



