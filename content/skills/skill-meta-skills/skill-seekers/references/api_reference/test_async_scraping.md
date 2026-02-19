# API Reference: test_async_scraping.py

**Language**: Python

**Source**: `tests/test_async_scraping.py`

---

## Classes

### TestAsyncConfiguration

Test async mode configuration and initialization

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Save original working directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Restore original working directory

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_mode_default_false(self)

Test async mode is disabled by default

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_mode_enabled_from_config(self)

Test async mode can be enabled via config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_mode_with_workers(self)

Test async mode works with multiple workers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncScrapeMethods

Test async scraping methods exist and have correct signatures

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_page_async_exists(self)

Test scrape_page_async method exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_all_async_exists(self)

Test scrape_all_async method exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncRouting

Test that scrape_all() correctly routes to async version

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_all_routes_to_async_when_enabled(self)

Test scrape_all calls async version when async_mode=True

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scrape_all_uses_sync_when_async_disabled(self)

Test scrape_all uses sync version when async_mode=False

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncDryRun

Test async scraping in dry-run mode

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_dry_run_completes(self)

Test async dry run completes without errors

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncErrorHandling

Test error handling in async scraping

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_async_handles_http_errors(self)

Test async scraping handles HTTP errors gracefully

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncPerformance

Test async performance characteristics

**Inherits from**: unittest.TestCase

#### Methods

##### test_async_uses_semaphore_for_concurrency_control(self)

Test async mode uses semaphore instead of threading lock

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestAsyncLlmsTxtIntegration

Test async mode with llms.txt detection

**Inherits from**: unittest.TestCase

#### Methods

##### test_async_respects_llms_txt(self)

Test async mode respects llms.txt and skips HTML scraping

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### run_test()

**Async function**

**Returns**: (none)


