# API Reference: pdf_extractor_poc.py

**Language**: Python

**Source**: `src/skill_seekers/cli/pdf_extractor_poc.py`

---

## Classes

### PDFExtractor

Extract text and code from PDF documentation

**Inherits from**: (none)

#### Methods

##### __init__(self, pdf_path, verbose = False, chunk_size = 10, min_quality = 0.0, extract_images = False, image_dir = None, min_image_size = 100, use_ocr = False, password = None, extract_tables = False, parallel = False, max_workers = None, use_cache = True)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pdf_path | None | - | - |
| verbose | None | False | - |
| chunk_size | None | 10 | - |
| min_quality | None | 0.0 | - |
| extract_images | None | False | - |
| image_dir | None | None | - |
| min_image_size | None | 100 | - |
| use_ocr | None | False | - |
| password | None | None | - |
| extract_tables | None | False | - |
| parallel | None | False | - |
| max_workers | None | None | - |
| use_cache | None | True | - |


##### log(self, message)

Print message if verbose mode enabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| message | None | - | - |


##### extract_text_with_ocr(self, page)

Extract text from scanned PDF page using OCR (Priority 2).
Falls back to regular text extraction if OCR is not available.

Args:
    page: PyMuPDF page object

Returns:
    str: Extracted text

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page | None | - | - |


##### extract_tables_from_page(self, page)

Extract tables from PDF page (Priority 2).
Uses PyMuPDF's table detection.

Args:
    page: PyMuPDF page object

Returns:
    list: List of extracted tables as dicts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page | None | - | - |


##### get_cached(self, key)

Get cached value (Priority 3).

Args:
    key: Cache key

Returns:
    Cached value or None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| key | None | - | - |


##### set_cached(self, key, value)

Set cached value (Priority 3).

Args:
    key: Cache key
    value: Value to cache

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| key | None | - | - |
| value | None | - | - |


##### detect_language_from_code(self, code)

Detect programming language from code content using patterns.
Enhanced in B1.4 with confidence scoring.

UPDATED: Now uses shared LanguageDetector with 20+ languages

Returns (language, confidence) tuple

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | None | - | - |


##### validate_code_syntax(self, code, language)

Validate code syntax (basic checks).
Enhanced in B1.4 with syntax validation.

Returns (is_valid, issues) tuple

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | None | - | - |
| language | None | - | - |


##### score_code_quality(self, code, language, confidence)

Score the quality/usefulness of detected code block.
New in B1.4.

Returns quality score (0-10)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | None | - | - |
| language | None | - | - |
| confidence | None | - | - |


##### detect_code_blocks_by_font(self, page)

Detect code blocks by analyzing font properties.
Monospace fonts typically indicate code.

Returns list of detected code blocks with metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page | None | - | - |


##### detect_code_blocks_by_indent(self, text)

Detect code blocks by indentation patterns.
Code often has consistent indentation.

Returns list of detected code blocks.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| text | None | - | - |


##### detect_code_blocks_by_pattern(self, text)

Detect code blocks by common code patterns (keywords, syntax).

Returns list of detected code snippets.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| text | None | - | - |


##### detect_chapter_start(self, page_data)

Detect if a page starts a new chapter/section.

Returns (is_chapter_start, chapter_title) tuple.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page_data | None | - | - |


##### merge_continued_code_blocks(self, pages)

Merge code blocks that are split across pages.

Detects when a code block at the end of one page continues
on the next page.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pages | None | - | - |


##### create_chunks(self, pages)

Create chunks of pages for better organization.

Returns array of chunks, each containing:
- chunk_number
- start_page, end_page
- pages (array)
- chapter_title (if detected)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pages | None | - | - |


##### extract_images_from_page(self, page, page_num)

Extract images from a PDF page and save to disk (NEW in B1.5).

Returns list of extracted image metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page | None | - | - |
| page_num | None | - | - |


##### extract_page(self, page_num)

Extract content from a single PDF page.

Returns dict with page content, code blocks, and metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page_num | None | - | - |


##### extract_all(self)

Extract content from all pages of the PDF.
Enhanced with password support and parallel processing.

Returns dict with metadata and pages array.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### main()

**Returns**: (none)


