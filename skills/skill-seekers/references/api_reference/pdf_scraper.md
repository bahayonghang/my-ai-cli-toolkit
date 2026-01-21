# API Reference: pdf_scraper.py

**Language**: Python

**Source**: `src/skill_seekers/cli/pdf_scraper.py`

---

## Classes

### PDFToSkillConverter

Convert PDF documentation to Claude skill

**Inherits from**: (none)

#### Methods

##### __init__(self, config)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| config | None | - | - |


##### extract_pdf(self)

Extract content from PDF using pdf_extractor_poc.py

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### load_extracted_data(self, json_path)

Load previously extracted data from JSON

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| json_path | None | - | - |


##### categorize_content(self)

Categorize pages based on chapters or keywords

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### build_skill(self)

Build complete skill structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### _generate_reference_file(self, cat_key, cat_data)

Generate a reference markdown file for a category

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| cat_key | None | - | - |
| cat_data | None | - | - |


##### _generate_index(self, categorized)

Generate reference index

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| categorized | None | - | - |


##### _generate_skill_md(self, categorized)

Generate main SKILL.md file (enhanced with rich content)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| categorized | None | - | - |


##### _format_key_concepts(self) → str

Extract key concepts from headings across all pages.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _format_patterns_from_content(self) → str

Extract common patterns from text content.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `str`


##### _sanitize_filename(self, name)

Convert string to safe filename

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| name | None | - | - |




## Functions

### infer_description_from_pdf(pdf_metadata: dict = None, name: str = '') → str

Infer skill description from PDF metadata or document properties.

Tries to extract meaningful description from:
1. PDF metadata fields (title, subject, keywords)
2. Falls back to improved template

Args:
    pdf_metadata: PDF metadata dictionary with title, subject, etc.
    name: Skill name for fallback

Returns:
    Description string suitable for "Use when..." format

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| pdf_metadata | dict | None | - |
| name | str | '' | - |

**Returns**: `str`



### main()

**Returns**: (none)


