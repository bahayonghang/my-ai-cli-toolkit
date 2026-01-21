# API Reference: test_pdf_advanced_features.py

**Language**: Python

**Source**: `tests/test_pdf_advanced_features.py`

---

## Classes

### TestOCRSupport

Test OCR support for scanned PDFs (Priority 2)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ocr_initialization(self)

Test OCR flag initialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_text_with_ocr_disabled(self)

Test that OCR can be disabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_text_with_ocr_sufficient_text(self)

Test OCR not triggered when sufficient text exists

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ocr_unavailable_warning(self)

Test warning when OCR requested but pytesseract not available

**Decorators**: `@patch('pdf_extractor_poc.TESSERACT_AVAILABLE', False)`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_ocr_extraction_triggered(self)

Test OCR extraction when text is minimal

**Decorators**: `@unittest.skipUnless(TESSERACT_AVAILABLE, 'pytesseract not installed')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestPasswordProtection

Test password-protected PDF support (Priority 2)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_password_initialization(self)

Test password parameter initialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_encrypted_pdf_detection(self)

Test detection of encrypted PDF

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_wrong_password_handling(self)

Test handling of wrong password

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_missing_password_for_encrypted_pdf(self)

Test error when password is missing for encrypted PDF

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestTableExtraction

Test table extraction (Priority 2)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_table_extraction_initialization(self)

Test table extraction flag initialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_table_extraction_disabled(self)

Test no tables extracted when disabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_table_extraction_basic(self)

Test basic table extraction

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_multiple_tables_extraction(self)

Test extraction of multiple tables from one page

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_table_extraction_error_handling(self)

Test error handling during table extraction

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestCaching

Test caching of expensive operations (Priority 3)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cache_initialization(self)

Test cache is initialized

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cache_set_and_get(self)

Test setting and getting cached values

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cache_miss(self)

Test cache miss returns None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cache_disabled(self)

Test caching can be disabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_cache_overwrite(self)

Test cache can be overwritten

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestParallelProcessing

Test parallel page processing (Priority 3)

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parallel_initialization(self)

Test parallel processing flag initialization

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parallel_disabled_by_default(self)

Test parallel processing is disabled by default

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_worker_count_auto_detect(self)

Test worker count auto-detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_custom_worker_count(self)

Test custom worker count

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestIntegration

Integration tests for advanced features

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_full_initialization_with_all_features(self)

Test initialization with all advanced features enabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_feature_combinations(self)

Test various feature combinations

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_page_data_includes_tables(self)

Test that page data includes table count

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



