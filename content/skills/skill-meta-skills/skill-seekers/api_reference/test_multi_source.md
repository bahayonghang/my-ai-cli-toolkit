# API Reference: test_multi_source.py

**Language**: Python

**Source**: `tests/test_multi_source.py`

---

## Classes

### TestUnifiedScraperDataStructure

Test scraped_data list structure in unified_scraper.

**Inherits from**: unittest.TestCase

#### Methods

##### test_scraped_data_uses_list_structure(self)

Test that scraped_data uses list for each source type.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_source_counters_initialized_to_zero(self)

Test that source counters start at zero.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_empty_lists_initially(self)

Test that source lists are empty initially.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnifiedSkillBuilderDocsReferences

Test documentation reference generation for multiple sources.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_subdirectory_per_source(self)

Test that each doc source gets its own subdirectory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_index_per_source(self)

Test that each source subdirectory has its own index.md.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_main_index_listing_all_sources(self)

Test that main index.md lists all documentation sources.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_copies_reference_files_to_source_dir(self)

Test that reference files are copied to source subdirectory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnifiedSkillBuilderGitHubReferences

Test GitHub reference generation for multiple repositories.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_subdirectory_per_repo(self)

Test that each GitHub repo gets its own subdirectory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_readme_per_repo(self)

Test that README.md is created for each repo.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_issues_file_when_issues_exist(self)

Test that issues.md is created when repo has issues.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_main_index_listing_all_repos(self)

Test that main index.md lists all GitHub repositories.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestUnifiedSkillBuilderPdfReferences

Test PDF reference generation for multiple sources.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_creates_pdf_index_with_count(self)

Test that PDF index shows correct document count.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



