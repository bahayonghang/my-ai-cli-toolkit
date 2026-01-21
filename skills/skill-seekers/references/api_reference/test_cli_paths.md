# API Reference: test_cli_paths.py

**Language**: Python

**Source**: `tests/test_cli_paths.py`

---

## Classes

### TestModernCLICommands

Test that all CLI scripts use modern unified CLI commands

**Inherits from**: unittest.TestCase

#### Methods

##### test_doc_scraper_uses_modern_commands(self)

Test doc_scraper.py uses skill-seekers commands

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_skill_local_uses_modern_commands(self)

Test enhance_skill_local.py uses skill-seekers commands

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_uses_modern_commands(self)

Test estimate_pages.py uses skill-seekers commands

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_skill_uses_modern_commands(self)

Test package_skill.py uses skill-seekers commands

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_github_scraper_uses_modern_commands(self)

Test github_scraper.py uses skill-seekers commands

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnifiedCLIEntryPoints

Test that unified CLI entry points work correctly

**Inherits from**: unittest.TestCase

#### Methods

##### test_main_cli_help_output(self)

Test skill-seekers --help works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_main_cli_version_output(self)

Test skill-seekers --version works

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestNoHardcodedPaths

Test that no scripts have hardcoded absolute paths

**Inherits from**: unittest.TestCase

#### Methods

##### test_no_hardcoded_paths_in_cli_scripts(self)

Test that CLI scripts don't have hardcoded paths

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPackageStructure

Test that package structure is correct

**Inherits from**: unittest.TestCase

#### Methods

##### test_src_layout_exists(self)

Test that src/ layout directory exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_package_exists(self)

Test that CLI package exists in src/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_package_exists(self)

Test that MCP package exists in src/

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_main_cli_file_exists(self)

Test that main.py unified CLI exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



