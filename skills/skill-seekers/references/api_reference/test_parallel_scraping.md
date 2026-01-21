# API Reference: test_parallel_scraping.py

**Language**: Python

**Source**: `tests/test_parallel_scraping.py`

---

## Classes

### TestParallelScrapingConfiguration

Test parallel scraping configuration and initialization

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


##### test_single_worker_default(self)

Test default is single-worker mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multiple_workers_creates_lock(self)

Test multiple workers creates thread lock

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_workers_from_config(self)

Test workers parameter is read from config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnlimitedMode

Test unlimited scraping mode

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


##### test_unlimited_with_none(self)

Test max_pages: None enables unlimited mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unlimited_with_minus_one(self)

Test max_pages: -1 enables unlimited mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_limited_mode_default(self)

Test default max_pages is limited

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRateLimiting

Test rate limiting configuration

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


##### test_rate_limit_from_config(self)

Test rate_limit is read from config

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rate_limit_default(self)

Test default rate_limit is 0.5

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_zero_rate_limit_disables(self)

Test rate_limit: 0 disables rate limiting

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestThreadSafety

Test thread-safety fixes

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


##### test_lock_protects_visited_urls(self)

Test visited_urls operations are protected by lock

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_single_worker_no_lock(self)

Test single worker doesn't create unnecessary lock

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestScrapingModes

Test different scraping mode combinations

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


##### test_single_threaded_limited(self)

Test traditional single-threaded limited mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parallel_limited(self)

Test parallel scraping with page limit

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parallel_unlimited(self)

Test parallel scraping with unlimited pages

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fast_scraping_mode(self)

Test fast scraping with low rate limit and workers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestDryRunWithNewFeatures

Test dry-run mode works with new features

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


##### test_dry_run_with_parallel(self)

Test dry-run with parallel workers

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_dry_run_with_unlimited(self)

Test dry-run with unlimited mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



