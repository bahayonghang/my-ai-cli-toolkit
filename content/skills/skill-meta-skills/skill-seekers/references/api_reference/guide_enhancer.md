# API Reference: guide_enhancer.py

**Language**: Python

**Source**: `src/skill_seekers/cli/guide_enhancer.py`

---

## Classes

### StepEnhancement

Enhanced step information (internal use only)

**Inherits from**: (none)



### GuideEnhancer

AI enhancement for how-to guides with dual-mode support.

Modes:
- api: Uses Claude API (requires ANTHROPIC_API_KEY)
- local: Uses Claude Code CLI (no API key needed)
- auto: Automatically detect best mode

**Inherits from**: (none)

#### Methods

##### __init__(self, mode: str = 'auto')

Initialize GuideEnhancer.

Args:
    mode: Enhancement mode - "api", "local", or "auto"

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mode | str | 'auto' | - |


##### _detect_mode(self, requested_mode: str) → str

Detect the best enhancement mode.

Args:
    requested_mode: User-requested mode

Returns:
    Detected mode: "api", "local", or "none"

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| requested_mode | str | - | - |

**Returns**: `str`


##### _check_claude_cli(self) → bool

Check if Claude Code CLI is available.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `bool`


##### enhance_guide(self, guide_data: dict) → dict

Apply all 5 enhancements to a guide.

Args:
    guide_data: Guide data dictionary with title, steps, etc.

Returns:
    Enhanced guide data with all 5 enhancements

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `dict`


##### enhance_step_descriptions(self, steps: list[dict]) → list[StepEnhancement]

Enhancement 1: Add natural language explanations to steps.

Args:
    steps: List of workflow steps

Returns:
    List of step enhancements with explanations

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[dict] | - | - |

**Returns**: `list[StepEnhancement]`


##### enhance_troubleshooting(self, guide_data: dict) → list[TroubleshootingItem]

Enhancement 2: Generate diagnostic flows + solutions.

Args:
    guide_data: Guide data with title, steps, language

Returns:
    List of troubleshooting items with solutions

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `list[TroubleshootingItem]`


##### enhance_prerequisites(self, prereqs: list[str]) → list[PrerequisiteItem]

Enhancement 3: Explain why prerequisites are needed.

Args:
    prereqs: List of prerequisite names

Returns:
    List of enhanced prerequisites with explanations

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prereqs | list[str] | - | - |

**Returns**: `list[PrerequisiteItem]`


##### enhance_next_steps(self, guide_data: dict) → list[str]

Enhancement 4: Suggest related guides and variations.

Args:
    guide_data: Guide data with title, topic

Returns:
    List of next step suggestions

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `list[str]`


##### enhance_use_cases(self, guide_data: dict) → list[str]

Enhancement 5: Generate real-world scenario examples.

Args:
    guide_data: Guide data with title, description

Returns:
    List of use case examples

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `list[str]`


##### _call_ai(self, prompt: str, max_tokens: int = 4000) → str | None

Call AI with the given prompt.

Args:
    prompt: Prompt text
    max_tokens: Maximum tokens in response

Returns:
    AI response text or None if failed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt | str | - | - |
| max_tokens | int | 4000 | - |

**Returns**: `str | None`


##### _call_claude_api(self, prompt: str, max_tokens: int = 4000) → str | None

Call Claude API.

Args:
    prompt: Prompt text
    max_tokens: Maximum tokens in response

Returns:
    API response text or None if failed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt | str | - | - |
| max_tokens | int | 4000 | - |

**Returns**: `str | None`


##### _call_claude_local(self, prompt: str) → str | None

Call Claude Code CLI.

Args:
    prompt: Prompt text

Returns:
    CLI response text or None if failed

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prompt | str | - | - |

**Returns**: `str | None`


##### _enhance_via_api(self, guide_data: dict) → dict

Enhance guide via API mode.

Args:
    guide_data: Guide data dictionary

Returns:
    Enhanced guide data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `dict`


##### _enhance_via_local(self, guide_data: dict) → dict

Enhance guide via LOCAL mode.

Args:
    guide_data: Guide data dictionary

Returns:
    Enhanced guide data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `dict`


##### _create_enhancement_prompt(self, guide_data: dict) → str

Create comprehensive enhancement prompt for all 5 enhancements.

Args:
    guide_data: Guide data dictionary

Returns:
    Complete prompt text

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `str`


##### _create_step_description_prompt(self, steps: list[dict]) → str

Create prompt for step descriptions only.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[dict] | - | - |

**Returns**: `str`


##### _create_troubleshooting_prompt(self, guide_data: dict) → str

Create prompt for troubleshooting items.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `str`


##### _create_prerequisites_prompt(self, prereqs: list[str]) → str

Create prompt for prerequisites enhancement.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| prereqs | list[str] | - | - |

**Returns**: `str`


##### _create_next_steps_prompt(self, guide_data: dict) → str

Create prompt for next steps suggestions.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `str`


##### _create_use_cases_prompt(self, guide_data: dict) → str

Create prompt for use case examples.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide_data | dict | - | - |

**Returns**: `str`


##### _format_steps_for_prompt(self, steps: list[dict]) → str

Format steps for inclusion in prompts.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[dict] | - | - |

**Returns**: `str`


##### _parse_enhancement_response(self, response: str, guide_data: dict) → dict

Parse AI enhancement response.

Args:
    response: AI response text (should be JSON)
    guide_data: Original guide data

Returns:
    Enhanced guide data

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| response | str | - | - |
| guide_data | dict | - | - |

**Returns**: `dict`




### PrerequisiteItem

**Inherits from**: (none)



### TroubleshootingItem

**Inherits from**: (none)


