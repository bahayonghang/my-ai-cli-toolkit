# API Reference: test_merge_sources_github.py

**Language**: Python

**Source**: `tests/test_merge_sources_github.py`

---

## Classes

### TestIssueCategorization

Test issue categorization by topic.

**Inherits from**: (none)

#### Methods

##### test_categorize_issues_basic(self)

Test basic issue categorization.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_categorize_issues_keyword_matching(self)

Test keyword matching in titles and labels.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_categorize_issues_multi_keyword_topic(self)

Test topics with multiple keywords.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_categorize_issues_no_match_goes_to_other(self)

Test that unmatched issues go to 'other' category.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_categorize_issues_empty_lists(self)

Test categorization with empty input.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestHybridContent

Test hybrid content generation.

**Inherits from**: (none)

#### Methods

##### test_generate_hybrid_content_basic(self)

Test basic hybrid content generation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generate_hybrid_content_with_conflicts(self)

Test hybrid content with conflicts.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_generate_hybrid_content_no_github_data(self)

Test hybrid content with no GitHub data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIssueToAPIMatching

Test matching issues to APIs.

**Inherits from**: (none)

#### Methods

##### test_match_issues_to_apis_basic(self)

Test basic issue to API matching.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_match_issues_to_apis_no_matches(self)

Test when no issues match any APIs.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_match_issues_to_apis_dotted_names(self)

Test matching with dotted API names.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRuleBasedMergerWithGitHubStreams

Test RuleBasedMerger with GitHub streams.

**Inherits from**: (none)

#### Methods

##### test_merger_with_github_streams(self, tmp_path)

Test merger with three-stream GitHub data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_merger_merge_all_with_streams(self, tmp_path)

Test merge_all() with GitHub streams.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_merger_without_streams_backward_compat(self)

Test backward compatibility without GitHub streams.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIntegration

Integration tests for Phase 3.

**Inherits from**: (none)

#### Methods

##### test_full_pipeline_with_streams(self, tmp_path)

Test complete pipeline with three-stream data.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |



