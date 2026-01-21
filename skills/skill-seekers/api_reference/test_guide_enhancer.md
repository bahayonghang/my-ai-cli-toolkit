# API Reference: test_guide_enhancer.py

**Language**: Python

**Source**: `tests/test_guide_enhancer.py`

---

## Classes

### TestGuideEnhancerModeDetection

Test mode detection logic

**Inherits from**: (none)

#### Methods

##### test_auto_mode_with_api_key(self)

Test auto mode detects API when key present and library available

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_auto_mode_without_api_key(self)

Test auto mode falls back to LOCAL when no API key

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_explicit_api_mode(self)

Test explicit API mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_explicit_local_mode(self)

Test explicit LOCAL mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_explicit_none_mode(self)

Test explicit none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_claude_cli_check(self)

Test Claude CLI availability check

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGuideEnhancerStepDescriptions

Test step description enhancement

**Inherits from**: (none)

#### Methods

##### test_enhance_step_descriptions_empty_list(self)

Test with empty steps list

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_step_descriptions_none_mode(self)

Test step descriptions in none mode returns empty

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_step_descriptions_api_mode(self, mock_call)

Test step descriptions with API mode

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |


##### test_enhance_step_descriptions_malformed_json(self)

Test handling of malformed JSON response

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGuideEnhancerTroubleshooting

Test troubleshooting enhancement

**Inherits from**: (none)

#### Methods

##### test_enhance_troubleshooting_none_mode(self)

Test troubleshooting in none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_troubleshooting_api_mode(self, mock_call)

Test troubleshooting with API mode

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |




### TestGuideEnhancerPrerequisites

Test prerequisite enhancement

**Inherits from**: (none)

#### Methods

##### test_enhance_prerequisites_empty_list(self)

Test with empty prerequisites

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_prerequisites_none_mode(self)

Test prerequisites in none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_prerequisites_api_mode(self, mock_call)

Test prerequisites with API mode

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |




### TestGuideEnhancerNextSteps

Test next steps enhancement

**Inherits from**: (none)

#### Methods

##### test_enhance_next_steps_none_mode(self)

Test next steps in none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_next_steps_api_mode(self, mock_call)

Test next steps with API mode

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |




### TestGuideEnhancerUseCases

Test use case enhancement

**Inherits from**: (none)

#### Methods

##### test_enhance_use_cases_none_mode(self)

Test use cases in none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_use_cases_api_mode(self, mock_call)

Test use cases with API mode

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |




### TestGuideEnhancerFullWorkflow

Test complete guide enhancement workflow

**Inherits from**: (none)

#### Methods

##### test_enhance_guide_none_mode(self)

Test full guide enhancement in none mode

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_enhance_guide_api_mode_success(self, mock_call)

Test successful full guide enhancement via API

**Decorators**: `@patch.object(GuideEnhancer, '_call_claude_api')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_call | None | - | - |


##### test_enhance_guide_error_fallback(self)

Test graceful fallback on enhancement error

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGuideEnhancerLocalMode

Test LOCAL mode (Claude Code CLI)

**Inherits from**: (none)

#### Methods

##### test_call_claude_local_success(self, mock_run)

Test successful LOCAL mode call

**Decorators**: `@patch('subprocess.run')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_run | None | - | - |


##### test_call_claude_local_timeout(self, mock_run)

Test LOCAL mode timeout handling

**Decorators**: `@patch('subprocess.run')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_run | None | - | - |




### TestGuideEnhancerPromptGeneration

Test prompt generation

**Inherits from**: (none)

#### Methods

##### test_create_enhancement_prompt(self)

Test comprehensive enhancement prompt generation

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_steps_for_prompt(self)

Test step formatting for prompts

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_format_steps_empty(self)

Test formatting empty steps list

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestGuideEnhancerResponseParsing

Test response parsing

**Inherits from**: (none)

#### Methods

##### test_parse_enhancement_response_valid_json(self)

Test parsing valid JSON response

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_enhancement_response_with_extra_text(self)

Test parsing JSON embedded in text

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_parse_enhancement_response_invalid_json(self)

Test handling invalid JSON

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



