# API Reference: test_github_fetcher.py

**Language**: Python

**Source**: `tests/test_github_fetcher.py`

---

## Classes

### TestDataClasses

Test data class definitions.

**Inherits from**: (none)

#### Methods

##### test_code_stream(self)

Test CodeStream data class.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_docs_stream(self)

Test DocsStream data class.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_insights_stream(self)

Test InsightsStream data class.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_three_stream_data(self)

Test ThreeStreamData combination.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGitHubFetcherInit

Test GitHubThreeStreamFetcher initialization.

**Inherits from**: (none)

#### Methods

##### test_parse_https_url(self)

Test parsing HTTPS GitHub URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_https_url_with_git(self)

Test parsing HTTPS URLs with .git suffix.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_git_url(self)

Test parsing git@ URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_invalid_url(self)

Test invalid URL raises error.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_github_token_from_env(self)

Test GitHub token loaded from environment.

**Decorators**: `@patch.dict('os.environ', {'GITHUB_TOKEN': 'test_token'})`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestFileClassification

Test file classification into code vs docs.

**Inherits from**: (none)

#### Methods

##### test_classify_files(self, tmp_path)

Test classify_files separates code and docs correctly.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_classify_excludes_hidden_files(self, tmp_path)

Test that hidden files are excluded (except in docs/).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_classify_various_code_extensions(self, tmp_path)

Test classification of various code file extensions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestIssueAnalysis

Test GitHub issue analysis.

**Inherits from**: (none)

#### Methods

##### test_analyze_issues_common_problems(self)

Test extraction of common problems (open issues with 5+ comments).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_issues_known_solutions(self)

Test extraction of known solutions (closed issues with comments).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_issues_top_labels(self)

Test counting of top issue labels.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analyze_issues_limits_to_10(self)

Test that analysis limits results to top 10.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGitHubAPI

Test GitHub API interactions.

**Inherits from**: (none)

#### Methods

##### test_fetch_github_metadata(self, mock_get)

Test fetching repository metadata via GitHub API.

**Decorators**: `@patch('requests.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get | None | - | - |


##### test_fetch_github_metadata_failure(self, mock_get)

Test graceful handling of metadata fetch failure.

**Decorators**: `@patch('requests.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get | None | - | - |


##### test_fetch_issues(self, mock_get)

Test fetching issues via GitHub API.

**Decorators**: `@patch('requests.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get | None | - | - |


##### test_fetch_issues_filters_pull_requests(self, mock_get)

Test that pull requests are filtered out of issues.

**Decorators**: `@patch('requests.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get | None | - | - |




### TestReadFile

Test file reading utilities.

**Inherits from**: (none)

#### Methods

##### test_read_file_success(self, tmp_path)

Test successful file reading.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_read_file_not_found(self, tmp_path)

Test reading non-existent file returns None.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_read_file_encoding_fallback(self, tmp_path)

Test fallback to latin-1 encoding if UTF-8 fails.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestIntegration

Integration tests for complete three-stream fetching.

**Inherits from**: (none)

#### Methods

##### test_fetch_integration(self, mock_get, mock_run, tmp_path)

Test complete fetch() integration.

**Decorators**: `@patch('subprocess.run')`, `@patch('requests.get')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_get | None | - | - |
| mock_run | None | - | - |
| tmp_path | None | - | - |




## Functions

### api_side_effect()

**Returns**: (none)


