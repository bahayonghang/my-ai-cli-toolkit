# API Reference: test_markdown_parsing.py

**Language**: Python

**Source**: `tests/test_markdown_parsing.py`

---

## Classes

### TestMarkdownContentExtraction

Test Markdown file parsing in doc_scraper.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up output directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_title_from_h1(self)

Test extracting title from first h1.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_headings_h2_to_h6(self)

Test extracting h2-h6 headings (not h1).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_code_blocks_with_language(self)

Test extracting code blocks with language tags.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_markdown_links_only_md_files(self)

Test that only .md links are extracted.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_content_paragraphs(self)

Test extracting paragraph content.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_html_in_md_url(self)

Test that HTML content is detected when .md URL returns HTML.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestHtmlAsMarkdownExtraction

Test HTML to markdown-like extraction.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up output directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_title_from_html(self)

Test extracting title from HTML title tag.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_find_main_content_area(self)

Test finding main content from various selectors.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_code_blocks_from_html(self)

Test extracting code blocks from HTML pre/code tags.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_fallback_to_body_when_no_main(self)

Test fallback to body when no main/article element.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestLlmsTxtUrlExtraction

Test URL extraction from llms.txt content.

**Inherits from**: unittest.TestCase

#### Methods

##### test_extract_markdown_style_links(self)

Test extracting [text](url) style links.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_extract_bare_urls(self)

Test extracting bare URLs without markdown syntax.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_resolve_relative_urls(self)

Test resolving relative URLs with base_url.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_clean_url_invalid_anchor_pattern(self)

Test cleaning URLs with invalid anchor patterns.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_clean_url_valid_anchor(self)

Test that valid anchors are preserved.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_clean_url_no_anchor(self)

Test that URLs without anchors are unchanged.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_deduplicate_urls(self)

Test that duplicate URLs are removed.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestSavePageContentFiltering

Test content filtering in save_page.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Set up test fixtures.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Clean up output directory.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_empty_content(self)

Test that pages with empty content are skipped.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_skip_short_content_under_50_chars(self)

Test that pages with content < 50 chars are skipped.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_save_content_over_50_chars(self)

Test that pages with content >= 50 chars are saved.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



