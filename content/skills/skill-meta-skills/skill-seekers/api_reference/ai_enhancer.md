# API Reference: ai_enhancer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/ai_enhancer.py`

---

## Classes

### AIAnalysis

AI analysis result for patterns or examples

**Inherits from**: (none)



### AIEnhancer

Base class for AI enhancement

**Inherits from**: (none)

#### Methods

##### __init__(self, api_key: str | None = None, enabled: bool = True, mode: str = 'auto')

Initialize AI enhancer.

Args:
    api_key: Anthropic API key (uses ANTHROPIC_API_KEY env if None)
    enabled: Enable AI enhancement (default: True)
    mode: Enhancement mode - "auto" (default), "api", or "local"
          - "auto": Use API if key available, otherwise disable
          - "api": Force API mode (fails if no key)
          - "local": Use Claude Code local mode (opens terminal)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| api_key | str | None | None | - |
| enabled | bool | True | - |
| mode | str | 'auto' | - |


##### _call_claude(self, prompt: str, max_tokens: int = 1000) → str | None

Call Claude API with error handling

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt | str | - | - |
| max_tokens | int | 1000 | - |

**Returns**: `str | None`




### PatternEnhancer

Enhance design pattern detection with AI analysis

**Inherits from**: AIEnhancer

#### Methods

##### enhance_patterns(self, patterns: list[dict]) → list[dict]

Enhance detected patterns with AI analysis.

Args:
    patterns: List of detected pattern instances

Returns:
    Enhanced patterns with AI analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| patterns | list[dict] | - | - |

**Returns**: `list[dict]`


##### _enhance_pattern_batch(self, patterns: list[dict]) → list[dict]

Enhance a batch of patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| patterns | list[dict] | - | - |

**Returns**: `list[dict]`




### TestExampleEnhancer

Enhance test examples with AI analysis

**Inherits from**: AIEnhancer

#### Methods

##### enhance_examples(self, examples: list[dict]) → list[dict]

Enhance test examples with AI context and explanations.

Args:
    examples: List of extracted test examples

Returns:
    Enhanced examples with AI analysis

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[dict] | - | - |

**Returns**: `list[dict]`


##### _enhance_example_batch(self, examples: list[dict]) → list[dict]

Enhance a batch of examples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[dict] | - | - |

**Returns**: `list[dict]`


##### generate_tutorials(self, examples: list[dict]) → dict[str, list[dict]]

Group enhanced examples into tutorial sections.

Args:
    examples: Enhanced examples with AI analysis

Returns:
    Dictionary mapping tutorial groups to examples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`



