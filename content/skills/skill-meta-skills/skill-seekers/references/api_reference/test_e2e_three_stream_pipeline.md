# API Reference: test_e2e_three_stream_pipeline.py

**Language**: Python

**Source**: `tests/test_e2e_three_stream_pipeline.py`

---

## Classes

### TestE2EBasicWorkflow

Test E2E workflow with basic analysis (fast).

**Inherits from**: (none)

#### Methods

##### test_github_url_to_basic_analysis(self, mock_fetcher_class, tmp_path)

Test complete pipeline: GitHub URL → Basic analysis → Merged output

This tests the fast path (1-2 minutes) without C3.x analysis.

**Decorators**: `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |


##### test_issue_categorization_by_topic(self)

Test that issues are correctly categorized by topic keywords.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestE2ERouterGeneration

Test E2E router generation with GitHub integration.

**Inherits from**: (none)

#### Methods

##### test_router_generation_with_github_streams(self, tmp_path)

Test complete router generation workflow with GitHub streams.

Validates:
1. Router config created
2. Router SKILL.md includes GitHub metadata
3. Router SKILL.md includes README quick start
4. Router SKILL.md includes common issues
5. Routing keywords include GitHub labels (2x weight)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestE2EQualityMetrics

Test quality metrics as specified in Phase 5.

**Inherits from**: (none)

#### Methods

##### test_github_overhead_within_limits(self, tmp_path)

Test that GitHub integration adds ~30-50 lines per skill (not more).

Quality metric: GitHub overhead should be minimal.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_router_size_within_limits(self, tmp_path)

Test that router SKILL.md is ~150 lines (±20).

Quality metric: Router should be concise overview, not exhaustive.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestE2EBackwardCompatibility

Test that old code still works without GitHub streams.

**Inherits from**: (none)

#### Methods

##### test_router_without_github_streams(self, tmp_path)

Test that router generation works without GitHub streams (backward compat).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_analyzer_without_github_metadata(self, mock_fetcher_class, tmp_path)

Test analyzer with fetch_github_metadata=False.

**Decorators**: `@patch('skill_seekers.cli.unified_codebase_analyzer.GitHubThreeStreamFetcher')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_fetcher_class | None | - | - |
| tmp_path | None | - | - |




### TestE2ETokenEfficiency

Test token efficiency metrics.

**Inherits from**: (none)

#### Methods

##### test_three_stream_produces_compact_output(self, tmp_path)

Test that three-stream architecture produces compact, efficient output.

This is a qualitative test - we verify that output is structured and
not duplicated across streams.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |



