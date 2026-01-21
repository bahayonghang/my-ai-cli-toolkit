# API Reference: test_codebase_scraper.py

**Language**: Python

**Source**: `tests/test_codebase_scraper.py`

---

## Classes

### TestLanguageDetection

Tests for language detection from file extensions

**Inherits from**: unittest.TestCase

#### Methods

##### test_python_detection(self)

Test Python file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_javascript_detection(self)

Test JavaScript file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_typescript_detection(self)

Test TypeScript file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cpp_detection(self)

Test C++ file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_csharp_detection(self)

Test C# file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_go_detection(self)

Test Go file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_rust_detection(self)

Test Rust file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_java_detection(self)

Test Java file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ruby_detection(self)

Test Ruby file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_php_detection(self)

Test PHP file detection.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_unknown_language(self)

Test unknown file extension.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestDirectoryExclusion

Tests for directory exclusion logic

**Inherits from**: unittest.TestCase

#### Methods

##### test_node_modules_excluded(self)

Test that node_modules is excluded.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_venv_excluded(self)

Test that venv is excluded.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_git_excluded(self)

Test that .git is excluded.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_normal_dir_not_excluded(self)

Test that normal directories are not excluded.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestDirectoryWalking

Tests for directory walking functionality

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


##### test_walk_empty_directory(self)

Test walking empty directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_walk_with_python_files(self)

Test walking directory with Python files.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_walk_excludes_node_modules(self)

Test that node_modules directory is excluded.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_walk_with_subdirectories(self)

Test walking nested directory structure.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGitignoreLoading

Tests for .gitignore loading

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


##### test_no_gitignore(self)

Test behavior when no .gitignore exists.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_load_gitignore(self)

Test loading valid .gitignore file.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



