# API Reference: test_real_world_fastmcp.py

**Language**: Python

**Source**: `tests/test_real_world_fastmcp.py`

---

## Classes

### TestRealWorldFastMCP

Real-world integration test using FastMCP repository.

This test requires:
- Internet connection
- GitHub API access (optional GITHUB_TOKEN for higher rate limits)
- 20-60 minutes for C3.x analysis

Run with: pytest tests/test_real_world_fastmcp.py -v -s

**Inherits from**: (none)

#### Methods

##### github_token(self)

Get GitHub token from environment (optional).

**Decorators**: `@pytest.fixture(scope='class')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### output_dir(self, tmp_path_factory)

Create output directory for test results.

**Decorators**: `@pytest.fixture(scope='class')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path_factory | None | - | - |


##### fastmcp_analysis(self, github_token, output_dir)

Perform complete FastMCP analysis.

This fixture runs the full pipeline and caches the result
for all tests in this class.

**Decorators**: `@pytest.fixture(scope='class')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| github_token | None | - | - |
| output_dir | None | - | - |


##### test_01_three_streams_present(self, fastmcp_analysis)

Test that all 3 streams are present and populated.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| fastmcp_analysis | None | - | - |


##### test_02_c3x_components_populated(self, fastmcp_analysis)

Test that C3.x components have ACTUAL data (not placeholders).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| fastmcp_analysis | None | - | - |


##### test_03_router_generation(self, fastmcp_analysis, output_dir)

Test router generation with GitHub integration.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| fastmcp_analysis | None | - | - |
| output_dir | None | - | - |


##### test_04_quality_metrics(self, fastmcp_analysis, output_dir)

Test that quality metrics meet architecture targets.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| fastmcp_analysis | None | - | - |
| output_dir | None | - | - |


##### test_05_skill_quality_assessment(self, output_dir)

Manual quality assessment of generated router skill.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| output_dir | None | - | - |


##### test_06_final_report(self, fastmcp_analysis, output_dir)

Generate final test report.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| fastmcp_analysis | None | - | - |
| output_dir | None | - | - |



