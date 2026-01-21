# API Reference: test_issue_219_e2e.py

**Language**: Python

**Source**: `tests/test_issue_219_e2e.py`

---

## Classes

### TestIssue219Problem1LargeFiles

E2E Test: Problem #1 - Large file download via download_url

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_large_file_extraction_end_to_end(self)

E2E: Verify large files (encoding='none') are downloaded via URL

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_large_file_fallback_on_error(self)

E2E: Verify graceful handling if download_url fails

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIssue219Problem2CLIFlags

E2E Test: Problem #2 - CLI flags working through main.py dispatcher

**Inherits from**: unittest.TestCase

#### Methods

##### test_github_command_has_enhancement_flags(self)

E2E: Verify --enhance-local flag exists in github command help

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_github_command_accepts_enhance_local_flag(self)

E2E: Verify --enhance-local flag doesn't cause 'unrecognized arguments' error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_dispatcher_forwards_flags_to_github_scraper(self)

E2E: Verify main.py dispatcher forwards flags to github_scraper.py

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIssue219Problem3CustomAPIEndpoints

E2E Test: Problem #3 - Custom API endpoint support

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up test environment

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_anthropic_base_url_support(self)

E2E: Verify ANTHROPIC_BASE_URL environment variable is supported

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_anthropic_auth_token_support(self)

E2E: Verify ANTHROPIC_AUTH_TOKEN is accepted as alternative to ANTHROPIC_API_KEY

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_thinking_block_handling(self)

E2E: Verify ThinkingBlock doesn't cause .text AttributeError

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIssue219IntegrationAll

E2E Integration: All 3 problems together

**Inherits from**: unittest.TestCase

#### Methods

##### test_all_fixes_work_together(self)

E2E: Verify all 3 fixes work in combination

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



