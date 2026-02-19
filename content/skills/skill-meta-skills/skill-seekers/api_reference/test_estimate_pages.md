# API Reference: test_estimate_pages.py

**Language**: Python

**Source**: `tests/test_estimate_pages.py`

---

## Classes

### TestEstimatePages

Test estimate_pages function

**Inherits from**: unittest.TestCase

#### Methods

##### test_estimate_pages_with_minimal_config(self)

Test estimation with minimal configuration

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_returns_discovered_count(self)

Test that result contains discovered page count

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_respects_max_discovery(self)

Test that estimation respects max_discovery limit

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_with_start_urls(self)

Test estimation with custom start_urls

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestEstimatePagesCLI

Test estimate_pages command-line interface (via entry point)

**Inherits from**: unittest.TestCase

#### Methods

##### test_cli_help_output(self)

Test that skill-seekers estimate --help works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_executes_with_help_flag(self)

Test that skill-seekers-estimate entry point works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_requires_config_argument(self)

Test that CLI requires config file argument

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_all_flag_lists_configs(self)

Test that --all flag lists all available configs

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_all_flag_with_direct_entry_point(self)

Test --all flag works with skill-seekers-estimate entry point

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestEstimatePagesWithRealConfig

Test estimation with real config files (if available)

**Inherits from**: unittest.TestCase

#### Methods

##### test_estimate_with_real_config_file(self)

Test estimation using a real config file (if exists)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



