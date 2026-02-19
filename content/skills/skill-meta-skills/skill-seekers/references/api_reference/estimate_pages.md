# API Reference: estimate_pages.py

**Language**: Python

**Source**: `src/skill_seekers/cli/estimate_pages.py`

---

## Functions

### estimate_pages(config, max_discovery = DEFAULT_MAX_DISCOVERY, timeout = 30)

Estimate total pages that will be scraped

Args:
    config: Configuration dictionary
    max_discovery: Maximum pages to discover (safety limit, use -1 for unlimited)
    timeout: Timeout for HTTP requests in seconds

Returns:
    dict with estimation results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config | None | - | - |
| max_discovery | None | DEFAULT_MAX_DISCOVERY | - |
| timeout | None | 30 | - |

**Returns**: (none)



### is_valid_url(url, base_url, include_patterns, exclude_patterns)

Check if URL should be crawled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| url | None | - | - |
| base_url | None | - | - |
| include_patterns | None | - | - |
| exclude_patterns | None | - | - |

**Returns**: (none)



### print_results(results, config)

Print estimation results

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| results | None | - | - |
| config | None | - | - |

**Returns**: (none)



### load_config(config_path)

Load configuration from JSON file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| config_path | None | - | - |

**Returns**: (none)



### find_configs_directory()

Find the configs directory using the same logic as the API.

Returns:
    Path to configs directory or None if not found

**Returns**: (none)



### list_all_configs()

List all available configuration files.
Uses the same directory logic as the API.

**Returns**: (none)



### main()

Main entry point

**Returns**: (none)


