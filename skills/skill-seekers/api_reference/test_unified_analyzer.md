# API Reference: test_unified_analyzer.py

**Language**: Python

**Source**: `tests/test_unified_analyzer.py`

---

## Classes

### TestAnalysisResult

Test AnalysisResult data class.

**Inherits from**: (none)

#### Methods

##### test_analysis_result_basic(self)

Test basic AnalysisResult creation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_analysis_result_with_github(self)

Test AnalysisResult with GitHub data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestURLDetection

Test GitHub URL detection.

**Inherits from**: (none)

#### Methods

##### test_is_github_url_https(self)

Test detection of HTTPS GitHub URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_is_github_url_ssh(self)

Test detection of SSH GitHub URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_is_github_url_local_path(self)

Test local paths are not detected as GitHub URLs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_is_github_url_other_git(self)

Test non-GitHub git URLs are not detected.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestBasicAnalysis

Test basic analysis mode.

**Inherits from**: (none)

#### Methods

##### test_basic_analysis_local(self, tmp_path)

Test basic analysis on local directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_list_files(self, tmp_path)

Test file listing.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_get_directory_structure(self, tmp_path)

Test directory structure extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_extract_imports_python(self, tmp_path)

Test Python import extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_extract_imports_javascript(self, tmp_path)

Test JavaScript import extraction.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_find_entry_points(self, tmp_path)

Test entry point detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_compute_statistics(self, tmp_path)

Test statistics computation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestC3xAnalysis

Test C3.x analysis mode.

**Inherits from**: (none)

#### Methods

##### test_c3x_analysis_local(self, tmp_path)

Test C3.x analysis on local directory with actual components.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_c3x_includes_basic_analysis(self, tmp_path)

Test that C3.x includes all basic analysis data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestGitHubAnalysis

Test GitHub repository analysis.

**Inherits from**: (none)

#### Methods

##### test_analyze_github_basic(self, mock_fetcher_class, tmp_path)

Test basic analysis of GitHub repository.

**Decorators**: `@requires_github`, `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |


##### test_analyze_github_c3x(self, mock_fetcher_class, tmp_path)

Test C3.x analysis of GitHub repository.

**Decorators**: `@requires_github`, `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |


##### test_analyze_github_without_metadata(self, mock_fetcher_class, tmp_path)

Test GitHub analysis without fetching metadata.

**Decorators**: `@requires_github`, `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |




### TestErrorHandling

Test error handling.

**Inherits from**: (none)

#### Methods

##### test_invalid_depth_mode(self, tmp_path)

Test invalid depth mode raises error.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_nonexistent_directory(self)

Test nonexistent directory raises error.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_file_instead_of_directory(self, tmp_path)

Test analyzing a file instead of directory raises error.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestTokenHandling

Test GitHub token handling.

**Inherits from**: (none)

#### Methods

##### test_github_token_from_env(self, mock_fetcher_class, tmp_path)

Test GitHub token loaded from environment.

**Decorators**: `@requires_github`, `@patch.dict('os.environ', {'GITHUB_TOKEN': 'test_token'})`, `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |


##### test_github_token_explicit(self, mock_fetcher_class, tmp_path)

Test explicit GitHub token parameter.

**Decorators**: `@requires_github`, `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |




### TestIntegration

Integration tests.

**Inherits from**: (none)

#### Methods

##### test_local_to_github_consistency(self, tmp_path)

Test that local and GitHub analysis produce consistent structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |



