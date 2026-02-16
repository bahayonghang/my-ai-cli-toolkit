# API Reference: test_package_structure.py

**Language**: Python

**Source**: `tests/test_package_structure.py`

---

## Classes

### TestCliPackage

Test skill_seekers.cli package structure and imports.

**Inherits from**: (none)

#### Methods

##### test_cli_package_exists(self)

Test that skill_seekers.cli package can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_has_version(self)

Test that skill_seekers.cli package has __version__.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_has_all(self)

Test that skill_seekers.cli package has __all__ export list.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_llms_txt_detector_import(self)

Test that LlmsTxtDetector can be imported from skill_seekers.cli.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_llms_txt_downloader_import(self)

Test that LlmsTxtDownloader can be imported from skill_seekers.cli.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_llms_txt_parser_import(self)

Test that LlmsTxtParser can be imported from skill_seekers.cli.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_open_folder_import(self)

Test that open_folder can be imported from skill_seekers.cli (if utils exists).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_exports_match_all(self)

Test that exported items in __all__ can actually be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestMcpPackage

Test skill_seekers.mcp package structure and imports.

**Inherits from**: (none)

#### Methods

##### test_mcp_package_exists(self)

Test that skill_seekers.mcp package can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_has_version(self)

Test that skill_seekers.mcp package has __version__.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_has_all(self)

Test that skill_seekers.mcp package has __all__ export list.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_tools_package_exists(self)

Test that skill_seekers.mcp.tools subpackage can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_tools_has_version(self)

Test that skill_seekers.mcp.tools has __version__.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPackageStructure

Test overall package structure integrity (src/ layout).

**Inherits from**: (none)

#### Methods

##### test_cli_init_file_exists(self)

Test that src/skill_seekers/cli/__init__.py exists.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_init_file_exists(self)

Test that src/skill_seekers/mcp/__init__.py exists.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_tools_init_file_exists(self)

Test that src/skill_seekers/mcp/tools/__init__.py exists.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cli_init_has_docstring(self)

Test that skill_seekers.cli/__init__.py has a module docstring.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_mcp_init_has_docstring(self)

Test that skill_seekers.mcp/__init__.py has a module docstring.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestImportPatterns

Test that various import patterns work correctly.

**Inherits from**: (none)

#### Methods

##### test_direct_module_import(self)

Test importing modules directly.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_class_import_from_package(self)

Test importing classes from package.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_package_level_import(self)

Test importing entire packages.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestBackwardsCompatibility

Test that existing code patterns still work.

**Inherits from**: (none)

#### Methods

##### test_direct_file_import_still_works(self)

Test that direct file imports still work (backwards compatible).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_module_path_import_still_works(self)

Test that full module path imports still work.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestRootPackage

Test root skill_seekers package.

**Inherits from**: (none)

#### Methods

##### test_root_package_exists(self)

Test that skill_seekers root package can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_root_has_version(self)

Test that skill_seekers root package has __version__.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_root_has_metadata(self)

Test that skill_seekers root package has metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCLIEntryPoints

Test that CLI entry points are properly configured.

**Inherits from**: (none)

#### Methods

##### test_main_cli_module_exists(self)

Test that main.py module exists and can be imported.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_main_cli_has_parser(self)

Test that main.py has parser creation function.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



