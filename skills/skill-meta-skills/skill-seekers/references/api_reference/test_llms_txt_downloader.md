# API Reference: test_llms_txt_downloader.py

**Language**: Python

**Source**: `tests/test_llms_txt_downloader.py`

---

## Functions

### test_successful_download()

Test successful download with valid markdown content

**Returns**: (none)



### test_timeout_with_retry()

Test timeout scenario with retry logic

**Returns**: (none)



### test_empty_content_rejection()

Test rejection of content shorter than 100 chars

**Returns**: (none)



### test_non_markdown_rejection()

Test rejection of content that doesn't look like markdown

**Returns**: (none)



### test_http_error_handling()

Test handling of HTTP errors (404, 500, etc.)

**Returns**: (none)



### test_exponential_backoff()

Test that exponential backoff delays are correct

**Returns**: (none)



### test_markdown_validation()

Test markdown pattern detection

**Returns**: (none)



### test_custom_timeout()

Test custom timeout parameter

**Returns**: (none)



### test_custom_max_retries()

Test custom max_retries parameter

**Returns**: (none)



### test_user_agent_header()

Test that custom user agent is set

**Returns**: (none)



### test_get_proper_filename()

Test filename conversion from .txt to .md

**Returns**: (none)



### test_get_proper_filename_standard()

Test standard variant naming

**Returns**: (none)



### test_get_proper_filename_small()

Test small variant naming

**Returns**: (none)



### test_is_markdown_rejects_html_doctype()

Test that HTML with DOCTYPE is rejected (prevents redirect trap)

**Returns**: (none)



### test_is_markdown_rejects_html_tag()

Test that HTML with <html> tag is rejected (prevents redirect trap)

**Returns**: (none)



### test_is_markdown_rejects_html_meta()

Test that HTML with <meta> or <head> tags is rejected

**Returns**: (none)



### test_is_markdown_accepts_markdown_with_html_words()

Test that markdown mentioning 'html' word is still accepted

**Returns**: (none)



### test_html_detection_only_scans_first_500_chars()

Test that HTML detection only scans first 500 characters for performance

**Returns**: (none)



### test_html_redirect_trap_scenario()

Test real-world scenario: llms.txt redirects to HTML product page

**Returns**: (none)



### test_download_rejects_html_redirect()

Test that download() properly rejects HTML redirects

**Returns**: (none)


