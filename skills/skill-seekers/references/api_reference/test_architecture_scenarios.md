# API Reference: test_architecture_scenarios.py

**Language**: Python

**Source**: `tests/test_architecture_scenarios.py`

---

## Classes

### TestScenario1GitHubThreeStream

Scenario 1: GitHub with Three-Stream (Architecture Lines 2227-2253)

Config:
{
  "name": "fastmcp",
  "sources": [{
    "type": "codebase",
    "source": "https://github.com/jlowin/fastmcp",
    "analysis_depth": "c3x",
    "fetch_github_metadata": true,
    "split_docs": true,
    "max_issues": 100
  }],
  "router_mode": true
}

Expected Result:
- ✅ Code analyzed with C3.x
- ✅ README/docs extracted
- ✅ 100 issues analyzed
- ✅ Router + 4 sub-skills generated
- ✅ All skills include GitHub insights

**Inherits from**: (none)

#### Methods

##### mock_github_repo(self, tmp_path)

Create mock GitHub repository structure.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### mock_github_api_data(self)

Mock GitHub API responses.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scenario_1_github_three_stream_fetcher(self, mock_github_repo, mock_github_api_data)

Test GitHub three-stream fetcher with mock data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_github_repo | None | - | - |
| mock_github_api_data | None | - | - |


##### test_scenario_1_unified_analyzer_github(self, mock_github_repo, mock_github_api_data)

Test unified analyzer with GitHub source.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_github_repo | None | - | - |
| mock_github_api_data | None | - | - |


##### test_scenario_1_router_generation(self, tmp_path)

Test router generation with GitHub streams.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_scenario_1_quality_metrics(self, tmp_path)

Test quality metrics meet architecture targets.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestScenario2MultiSource

Scenario 2: Documentation + GitHub Multi-Source (Architecture Lines 2255-2286)

Config:
{
  "name": "react",
  "sources": [
    {
      "type": "documentation",
      "base_url": "https://react.dev/",
      "max_pages": 200
    },
    {
      "type": "codebase",
      "source": "https://github.com/facebook/react",
      "analysis_depth": "c3x",
      "fetch_github_metadata": true,
      "max_issues": 100
    }
  ],
  "merge_mode": "conflict_detection",
  "router_mode": true
}

Expected Result:
- ✅ HTML docs scraped (200 pages)
- ✅ Code analyzed with C3.x
- ✅ GitHub insights added
- ✅ Conflicts detected (docs vs code)
- ✅ Hybrid content generated
- ✅ Router + sub-skills with all sources

**Inherits from**: (none)

#### Methods

##### test_scenario_2_issue_categorization(self)

Test categorizing GitHub issues by topic.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scenario_2_conflict_detection(self)

Test conflict detection between docs and code.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scenario_2_multi_layer_merge(self)

Test multi-layer source merging priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestScenario3LocalCodebase

Scenario 3: Local Codebase (Architecture Lines 2287-2310)

Config:
{
  "name": "internal-tool",
  "sources": [{
    "type": "codebase",
    "source": "/path/to/internal-tool",
    "analysis_depth": "c3x",
    "fetch_github_metadata": false
  }],
  "router_mode": true
}

Expected Result:
- ✅ Code analyzed with C3.x
- ❌ No GitHub insights (not applicable)
- ✅ Router + sub-skills generated
- ✅ Works without GitHub data

**Inherits from**: (none)

#### Methods

##### local_codebase(self, tmp_path)

Create local codebase for testing.

**Decorators**: `@pytest.fixture`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_scenario_3_local_analysis_basic(self, local_codebase)

Test basic analysis of local codebase.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| local_codebase | None | - | - |


##### test_scenario_3_local_analysis_c3x(self, local_codebase)

Test C3.x analysis of local codebase.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| local_codebase | None | - | - |


##### test_scenario_3_router_without_github(self, tmp_path)

Test router generation without GitHub data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestQualityMetricsValidation

Test all quality metrics from Architecture Section 8 (Lines 1963-2084)

**Inherits from**: (none)

#### Methods

##### test_github_overhead_within_limits(self)

Test GitHub overhead is 20-60 lines (Architecture Section 8.3, Line 2017).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_router_size_within_limits(self)

Test router size is 150±20 lines (Architecture Section 8.1, Line 1970).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_content_quality_requirements(self)

Test content quality (Architecture Section 8.2, Lines 1977-2014).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestTokenEfficiencyCalculation

Test token efficiency (Architecture Section 8.4, Lines 2050-2084)

Target: 35-40% reduction vs monolithic (even with GitHub overhead)

**Inherits from**: (none)

#### Methods

##### test_token_efficiency_calculation(self)

Calculate token efficiency with GitHub overhead.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



