# API Reference: language_detector.py

**Language**: Python

**Source**: `src/skill_seekers/cli/language_detector.py`

---

## Classes

### LanguageDetector

Unified confidence-based language detection for code blocks.

Supports 20+ programming languages with weighted pattern matching.
Uses two-stage detection:
1. CSS class extraction (high confidence = 1.0)
2. Pattern-based heuristics with confidence scoring (0.0-1.0)

Example:
    detector = LanguageDetector(min_confidence=0.3)
    lang, confidence = detector.detect_from_html(elem, code)

    if confidence >= 0.7:
        print(f"High confidence: {lang}")
    elif confidence >= 0.5:
        print(f"Medium confidence: {lang}")
    else:
        print(f"Low confidence: {lang}")

**Inherits from**: (none)

#### Methods

##### __init__(self, min_confidence: float = 0.15)

Initialize language detector.

Args:
    min_confidence: Minimum confidence threshold (0-1)
                  0.3 = low, 0.5 = medium, 0.7 = high

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| min_confidence | float | 0.15 | - |


##### _compile_patterns(self) → None

Compile regex patterns and cache them for performance

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `None`


##### detect_from_html(self, elem, code: str) → tuple[str, float]

Detect language from HTML element with CSS classes + code content.

Args:
    elem: BeautifulSoup element with 'class' attribute
    code: Code content string

Returns:
    Tuple of (language, confidence) where confidence is 0.0-1.0

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| elem | None | - | - |
| code | str | - | - |

**Returns**: `tuple[str, float]`


##### detect_from_code(self, code: str) → tuple[str, float]

Detect language from code content only (for PDFs, GitHub files).

Args:
    code: Code content string

Returns:
    Tuple of (language, confidence) where confidence is 0.0-1.0

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `tuple[str, float]`


##### extract_language_from_classes(self, classes: list[str]) → str | None

Extract language from CSS class list.

Supports patterns:
- language-*  (e.g., language-python)
- lang-*      (e.g., lang-javascript)
- brush: *    (e.g., brush: java)
- Bare names  (e.g., python, java)

Args:
    classes: List of CSS class names

Returns:
    Language string or None if not found

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| classes | list[str] | - | - |

**Returns**: `str | None`


##### _calculate_confidence(self, code: str) → dict[str, float]

Calculate weighted confidence scores for all languages.

Args:
    code: Code content string

Returns:
    Dictionary mapping language names to confidence scores (0.0-1.0)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `dict[str, float]`



