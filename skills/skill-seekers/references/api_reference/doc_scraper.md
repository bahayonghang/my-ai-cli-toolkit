# API Reference: doc_scraper.py

**Language**: Python

**Source**: `src/skill_seekers/cli/doc_scraper.py`

---

## Classes

### DocToSkillConverter

**Inherits from**: (none)

#### Methods

##### __init__(self, config: dict[str, Any], dry_run: bool = False, resume: bool = False) → None

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | dict[str, Any] | - | - |
| dry_run | bool | False | - |
| resume | bool | False | - |

**Returns**: `None`


##### is_valid_url(self, url: str) → bool

Check if URL should be scraped based on patterns.

Args:
    url (str): URL to validate

Returns:
    bool: True if URL matches include patterns and doesn't match exclude patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |

**Returns**: `bool`


##### save_checkpoint(self) → None

Save progress checkpoint

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### load_checkpoint(self) → None

Load progress from checkpoint

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### clear_checkpoint(self) → None

Remove checkpoint file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### extract_content(self, soup: Any, url: str) → dict[str, Any]

Extract content with improved code and pattern detection

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| soup | Any | - | - |
| url | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_markdown_content(self, content: str, url: str) → dict[str, Any]

Extract structured content from a Markdown file.

Parses markdown files from llms.txt URLs to extract:
- Title from first h1 heading
- Headings (h2-h6, excluding h1)
- Code blocks with language detection
- Internal .md links for BFS crawling
- Content paragraphs (>20 chars)

Auto-detects HTML content and falls back to _extract_html_as_markdown.

Args:
    content: Raw markdown content string (or HTML if server returned HTML)
    url: Source URL for resolving relative links

Returns:
    Dict with keys:
        - url: str - Source URL
        - title: str - Extracted from first # heading
        - content: str - Paragraphs joined with double newlines
        - headings: List[Dict] - {'level': 'h2', 'text': str, 'id': str}
        - code_samples: List[Dict] - {'code': str, 'language': str}
        - links: List[str] - Absolute URLs to other .md files
        - patterns: List - Empty (reserved for future use)

Note:
    Only .md links are extracted to avoid client-side rendered HTML pages.
    Anchor fragments (#section) are stripped from links.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | str | - | - |
| url | str | - | - |

**Returns**: `dict[str, Any]`


##### _extract_html_as_markdown(self, html_content: str, url: str) → dict[str, Any]

Extract content from HTML and convert to markdown-like structure.

Fallback method when .md URL returns HTML content instead of markdown.
Uses BeautifulSoup to extract structured data from HTML elements.

Extraction strategy:
1. Title from <title> tag
2. Main content from <main>, <article>, [role="main"], or <body>
3. Headings (h1-h6) with text and id attributes
4. Code blocks from <pre><code> or <pre> tags
5. Text content from paragraphs

Args:
    html_content: Raw HTML content string
    url: Source URL (for reference in result dict)

Returns:
    Dict with keys:
        - url: str - Source URL
        - title: str - From <title> tag, cleaned
        - content: str - Text content from main area
        - headings: List[Dict] - {'level': 'h2', 'text': str, 'id': str}
        - code_samples: List[Dict] - {'code': str, 'language': str}
        - links: List - Empty (HTML links not extracted to avoid client-side routes)
        - patterns: List - Empty (reserved for future use)

Note:
    Prefers <main> or <article> tags for content area.
    Falls back to <body> if no semantic content container found.
    Language detection uses detect_language() method.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| html_content | str | - | - |
| url | str | - | - |

**Returns**: `dict[str, Any]`


##### detect_language(self, elem, code)

Detect programming language from code block

UPDATED: Now uses confidence-based detection with 20+ languages

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| elem | None | - | - |
| code | None | - | - |


##### extract_patterns(self, main: Any, _code_samples: list[dict[str, Any]]) → list[dict[str, str]]

Extract common coding patterns (NEW FEATURE)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| main | Any | - | - |
| _code_samples | list[dict[str, Any]] | - | - |

**Returns**: `list[dict[str, str]]`


##### clean_text(self, text: str) → str

Clean text content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| text | str | - | - |

**Returns**: `str`


##### save_page(self, page: dict[str, Any]) → None

Save page data (skip pages with empty content)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| page | dict[str, Any] | - | - |

**Returns**: `None`


##### scrape_page(self, url: str) → None

Scrape a single page with thread-safe operations.

Args:
    url (str): URL to scrape

Returns:
    dict or None: Page data dict on success, None on failure

Note:
    Uses threading locks when workers > 1 for thread safety
    Supports both HTML pages and Markdown (.md) files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |

**Returns**: `None`


##### scrape_page_async(self, url: str, semaphore: asyncio.Semaphore, client: httpx.AsyncClient) → None

Scrape a single page asynchronously.

Args:
    url: URL to scrape
    semaphore: Asyncio semaphore for concurrency control
    client: Shared httpx AsyncClient for connection pooling

Note:
    Uses asyncio.Lock for async-safe operations instead of threading.Lock
    Supports both HTML pages and Markdown (.md) files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| url | str | - | - |
| semaphore | asyncio.Semaphore | - | - |
| client | httpx.AsyncClient | - | - |

**Returns**: `None`


##### _convert_to_md_urls(self, urls: list[str]) → list[str]

Convert URLs to .md format, trying /index.html.md suffix for non-.md URLs.
不预先检查 URL 是否存在，直接加入队列，在爬取时再验证。

Args:
    urls: List of URLs to process

Returns:
    List of .md URLs (未验证)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| urls | list[str] | - | - |

**Returns**: `list[str]`


##### _try_llms_txt(self) → bool

Try to use llms.txt instead of HTML scraping.
Downloads ALL available variants and stores with .md extension.

Returns:
    True if llms.txt was found and processed successfully

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### scrape_all(self) → None

Scrape all pages (supports llms.txt and HTML scraping)

Routes to async version if async_mode is enabled in config.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### scrape_all_async(self) → None

Scrape all pages asynchronously (async/await version).

This method provides significantly better performance for parallel scraping
compared to thread-based scraping, with lower memory overhead and better
CPU utilization.

Performance: ~2-3x faster than sync mode with same worker count.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### save_summary(self) → None

Save scraping summary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### load_scraped_data(self) → list[dict[str, Any]]

Load previously scraped data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `list[dict[str, Any]]`


##### smart_categorize(self, pages: list[dict[str, Any]]) → dict[str, list[dict[str, Any]]]

Improved categorization with better pattern matching

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pages | list[dict[str, Any]] | - | - |

**Returns**: `dict[str, list[dict[str, Any]]]`


##### infer_categories(self, pages: list[dict[str, Any]]) → dict[str, list[str]]

Infer categories from URL patterns (IMPROVED)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pages | list[dict[str, Any]] | - | - |

**Returns**: `dict[str, list[str]]`


##### generate_quick_reference(self, pages: list[dict[str, Any]]) → list[dict[str, str]]

Generate quick reference from common patterns (NEW FEATURE)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| pages | list[dict[str, Any]] | - | - |

**Returns**: `list[dict[str, str]]`


##### create_reference_file(self, category: str, pages: list[dict[str, Any]]) → None

Create enhanced reference file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| category | str | - | - |
| pages | list[dict[str, Any]] | - | - |

**Returns**: `None`


##### create_enhanced_skill_md(self, categories: dict[str, list[dict[str, Any]]], quick_ref: list[dict[str, str]]) → None

Create SKILL.md with actual examples (IMPROVED)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| categories | dict[str, list[dict[str, Any]]] | - | - |
| quick_ref | list[dict[str, str]] | - | - |

**Returns**: `None`


##### create_index(self, categories: dict[str, list[dict[str, Any]]]) → None

Create navigation index

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| categories | dict[str, list[dict[str, Any]]] | - | - |

**Returns**: `None`


##### build_skill(self) → bool

Build the skill from scraped data.

Loads scraped JSON files, categorizes pages, extracts patterns,
and generates SKILL.md and reference files.

Returns:
    bool: True if build succeeded, False otherwise

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`




## Functions

### setup_logging(verbose: bool = False, quiet: bool = False) → None

Configure logging based on verbosity level.

Args:
    verbose: Enable DEBUG level logging
    quiet: Enable WARNING level logging only

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| verbose | bool | False | - |
| quiet | bool | False | - |

**Returns**: `None`



### infer_description_from_docs(base_url: str, first_page_content: str | None = None, name: str = '') → str

Infer skill description from documentation metadata or first page content.

Tries multiple strategies:
1. Extract meta description tag from first page
2. Extract first meaningful paragraph from content
3. Fall back to improved template

Args:
    base_url: Documentation base URL
    first_page_content: HTML content of first page (optional)
    name: Skill name

Returns:
    Description string suitable for "Use when..." format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| base_url | str | - | - |
| first_page_content | str | None | None | - |
| name | str | '' | - |

**Returns**: `str`



### validate_config(config: dict[str, Any]) → tuple[list[str], list[str]]

Validate configuration structure and values.

Args:
    config (dict): Configuration dictionary to validate

Returns:
    tuple: (errors, warnings) where each is a list of strings

Example:
    >>> errors, warnings = validate_config({'name': 'test', 'base_url': 'https://example.com'})
    >>> if errors:
    ...     print("Invalid config:", errors)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config | dict[str, Any] | - | - |

**Returns**: `tuple[list[str], list[str]]`



### load_config(config_path: str) → dict[str, Any]

Load and validate configuration from JSON file.

Args:
    config_path (str): Path to JSON configuration file

Returns:
    dict: Validated configuration dictionary

Raises:
    SystemExit: If config is invalid or file not found

Example:
    >>> config = load_config('configs/react.json')
    >>> print(config['name'])
    'react'

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | str | - | - |

**Returns**: `dict[str, Any]`



### interactive_config() → dict[str, Any]

Interactive configuration wizard for creating new configs.

Prompts user for all required configuration fields step-by-step
and returns a complete configuration dictionary.

Returns:
    dict: Complete configuration dictionary with user-provided values

Example:
    >>> config = interactive_config()
    # User enters: name=react, url=https://react.dev, etc.
    >>> config['name']
    'react'

**Returns**: `dict[str, Any]`



### check_existing_data(name: str) → tuple[bool, int]

Check if scraped data already exists for a skill.

Args:
    name (str): Skill name to check

Returns:
    tuple: (exists, page_count) where exists is bool and page_count is int

Example:
    >>> exists, count = check_existing_data('react')
    >>> if exists:
    ...     print(f"Found {count} existing pages")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | str | - | - |

**Returns**: `tuple[bool, int]`



### setup_argument_parser() → argparse.ArgumentParser

Setup and configure command-line argument parser.

Creates an ArgumentParser with all CLI options for the doc scraper tool,
including configuration, scraping, enhancement, and performance options.

Returns:
    argparse.ArgumentParser: Configured argument parser

Example:
    >>> parser = setup_argument_parser()
    >>> args = parser.parse_args(['--config', 'configs/react.json'])
    >>> print(args.config)
    configs/react.json

**Returns**: `argparse.ArgumentParser`



### get_configuration(args: argparse.Namespace) → dict[str, Any]

Load or create configuration from command-line arguments.

Handles three configuration modes:
1. Load from JSON file (--config)
2. Interactive configuration wizard (--interactive or missing args)
3. Quick mode from command-line arguments (--name, --url)

Also applies CLI overrides for rate limiting and worker count.

Args:
    args: Parsed command-line arguments from argparse

Returns:
    dict: Configuration dictionary with all required fields

Example:
    >>> args = parser.parse_args(['--name', 'react', '--url', 'https://react.dev'])
    >>> config = get_configuration(args)
    >>> print(config['name'])
    react

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| args | argparse.Namespace | - | - |

**Returns**: `dict[str, Any]`



### execute_scraping_and_building(config: dict[str, Any], args: argparse.Namespace) → Optional['DocToSkillConverter']

Execute the scraping and skill building process.

Handles dry run mode, existing data checks, scraping with checkpoints,
keyboard interrupts, and skill building. This is the core workflow
orchestration for the scraping phase.

Args:
    config (dict): Configuration dictionary with scraping parameters
    args: Parsed command-line arguments

Returns:
    DocToSkillConverter: The converter instance after scraping/building,
                        or None if process was aborted

Example:
    >>> config = {'name': 'react', 'base_url': 'https://react.dev'}
    >>> converter = execute_scraping_and_building(config, args)
    >>> if converter:
    ...     print("Scraping complete!")

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config | dict[str, Any] | - | - |
| args | argparse.Namespace | - | - |

**Returns**: `Optional['DocToSkillConverter']`



### execute_enhancement(config: dict[str, Any], args: argparse.Namespace) → None

Execute optional SKILL.md enhancement with Claude.

Supports two enhancement modes:
1. API-based enhancement (requires ANTHROPIC_API_KEY)
2. Local enhancement using Claude Code (no API key needed)

Prints appropriate messages and suggestions based on whether
enhancement was requested and whether it succeeded.

Args:
    config (dict): Configuration dictionary with skill name
    args: Parsed command-line arguments with enhancement flags

Example:
    >>> execute_enhancement(config, args)
    # Runs enhancement if --enhance or --enhance-local flag is set

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config | dict[str, Any] | - | - |
| args | argparse.Namespace | - | - |

**Returns**: `None`



### main() → None

**Returns**: `None`


