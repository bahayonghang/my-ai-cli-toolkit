# API Reference: test_excluded_dirs_config.py

**Language**: Python

**Source**: `tests/test_excluded_dirs_config.py`

---

## Classes

### TestExcludedDirsDefaults

Test default EXCLUDED_DIRS behavior (backward compatibility).

**Inherits from**: unittest.TestCase

#### Methods

##### test_defaults_when_no_config(self, _mock_github)

Test that default exclusions are used when no config provided.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_defaults_exclude_common_dirs(self, _mock_github)

Test that default exclusions work correctly.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_dot_directories_always_excluded(self, _mock_github)

Test that directories starting with '.' are always excluded.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsAdditional

Test exclude_dirs_additional (extend mode).

**Inherits from**: unittest.TestCase

#### Methods

##### test_extend_with_additional_dirs(self, _mock_github)

Test adding custom exclusions to defaults.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_extend_excludes_additional_dirs(self, _mock_github)

Test that additional directories are actually excluded.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_extend_with_empty_list(self, _mock_github)

Test that empty additional list works correctly.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsReplace

Test exclude_dirs (replace mode).

**Inherits from**: unittest.TestCase

#### Methods

##### test_replace_with_custom_list(self, _mock_github)

Test replacing default exclusions entirely.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_replace_excludes_only_specified_dirs(self, _mock_github)

Test that only specified directories are excluded in replace mode.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_replace_with_empty_list(self, _mock_github)

Test that empty replace list allows all directories (except dot-prefixed).

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsPrecedence

Test precedence when both options provided.

**Inherits from**: unittest.TestCase

#### Methods

##### test_replace_takes_precedence_over_additional(self, _mock_github)

Test that exclude_dirs takes precedence over exclude_dirs_additional.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsEdgeCases

Test edge cases and error handling.

**Inherits from**: unittest.TestCase

#### Methods

##### test_duplicate_exclusions_in_additional(self, _mock_github)

Test that duplicates in additional list are handled (set deduplication).

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_case_sensitive_exclusions(self, _mock_github)

Test that exclusions are case-sensitive.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsWithLocalRepo

Test exclude_dirs integration with local_repo_path.

**Inherits from**: unittest.TestCase

#### Methods

##### test_exclude_dirs_with_local_repo_path(self, _mock_github)

Test that exclude_dirs works when local_repo_path is provided.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_replace_mode_with_local_repo_path(self, _mock_github)

Test that replace mode works with local_repo_path.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsLogging

Test logging output for exclude_dirs configuration.

**Inherits from**: unittest.TestCase

#### Methods

##### test_extend_mode_logs_info(self, mock_logger, _mock_github)

Test that extend mode logs INFO level message.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`, `@patch('skill_seekers.cli.github_scraper.logger')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_logger | None | - | - |
| _mock_github | None | - | - |


##### test_replace_mode_logs_warning(self, mock_logger, _mock_github)

Test that replace mode logs WARNING level message.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`, `@patch('skill_seekers.cli.github_scraper.logger')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_logger | None | - | - |
| _mock_github | None | - | - |


##### test_no_config_no_logging(self, mock_logger, _mock_github)

Test that default mode doesn't log exclude_dirs messages.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`, `@patch('skill_seekers.cli.github_scraper.logger')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_logger | None | - | - |
| _mock_github | None | - | - |




### TestExcludedDirsTypeHandling

Test type handling for exclude_dirs configuration.

**Inherits from**: unittest.TestCase

#### Methods

##### test_exclude_dirs_with_tuple(self, _mock_github)

Test that tuples are converted to sets correctly.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |


##### test_exclude_dirs_additional_with_set(self, _mock_github)

Test that sets work correctly for exclude_dirs_additional.

**Decorators**: `@patch('skill_seekers.cli.github_scraper.Github')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _mock_github | None | - | - |



