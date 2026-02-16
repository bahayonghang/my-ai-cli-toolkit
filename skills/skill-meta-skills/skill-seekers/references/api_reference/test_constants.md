# API Reference: test_constants.py

**Language**: Python

**Source**: `tests/test_constants.py`

---

## Classes

### TestConstants

Test that all constants are defined and have sensible values.

**Inherits from**: unittest.TestCase

#### Methods

##### test_scraping_constants_exist(self)

Test that scraping constants are defined.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scraping_constants_types(self)

Test that scraping constants have correct types.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_scraping_constants_ranges(self)

Test that scraping constants have sensible values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_content_analysis_constants(self)

Test content analysis constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_categorization_constants(self)

Test categorization scoring constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhancement_constants_exist(self)

Test that enhancement constants are defined.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhancement_constants_values(self)

Test enhancement constants have expected values.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhancement_limits_hierarchy(self)

Test that API limits are higher than local limits.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimation_constants(self)

Test page estimation constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_file_limit_constants(self)

Test file limit constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestConstantsUsage

Test that constants are properly used in other modules.

**Inherits from**: unittest.TestCase

#### Methods

##### test_doc_scraper_imports_constants(self)

Test that doc_scraper imports and uses constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_estimate_pages_imports_constants(self)

Test that estimate_pages imports and uses constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_skill_imports_constants(self)

Test that enhance_skill imports constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_skill_local_imports_constants(self)

Test that enhance_skill_local imports constants.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestConstantsExports

Test that constants module exports are correct.

**Inherits from**: unittest.TestCase

#### Methods

##### test_all_exports_exist(self)

Test that all items in __all__ exist.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_all_exports_count(self)

Test that __all__ has expected number of exports.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



