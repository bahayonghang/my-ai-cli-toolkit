# API Reference: test_terminal_detection.py

**Language**: Python

**Source**: `tests/test_terminal_detection.py`

---

## Classes

### TestDetectTerminalApp

Test the detect_terminal_app() function.

**Inherits from**: unittest.TestCase

#### Methods

##### setUp(self)

Save original environment variables.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### tearDown(self)

Restore original environment variables.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_skill_seeker_env(self)

Test that SKILL_SEEKER_TERMINAL env var takes highest priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_term_program_known(self)

Test detection from TERM_PROGRAM with known terminal (iTerm).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_term_program_ghostty(self)

Test detection from TERM_PROGRAM with Ghostty terminal.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_term_program_apple_terminal(self)

Test detection from TERM_PROGRAM with Apple Terminal.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_term_program_wezterm(self)

Test detection from TERM_PROGRAM with WezTerm.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_with_term_program_unknown(self)

Test fallback behavior when TERM_PROGRAM is unknown (e.g., IDE terminals).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_default_fallback(self)

Test default fallback when no environment variables are set.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_priority_order(self)

Test that SKILL_SEEKER_TERMINAL takes priority over TERM_PROGRAM.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_subprocess_popen_called_with_correct_args(self, mock_popen)

Test that subprocess.Popen is called with correct arguments on macOS.

**Decorators**: `@patch('subprocess.Popen')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_popen | None | - | - |


##### test_detect_terminal_whitespace_handling(self)

Test that whitespace is stripped from environment variables.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_empty_string_env_vars(self)

Test that empty string env vars fall through to next priority.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_detect_terminal_empty_string_both_vars(self)

Test that empty strings on both vars falls back to default.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### test_terminal_launch_error_handling(self, mock_popen)

Test error handling when terminal launch fails.

**Decorators**: `@patch('subprocess.Popen')`

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| mock_popen | None | - | - |


##### test_output_message_unknown_terminal(self)

Test that unknown terminal prints warning message.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




### TestTerminalMapCompleteness

Test that TERMINAL_MAP covers all documented terminals.

**Inherits from**: unittest.TestCase

#### Methods

##### test_terminal_map_has_all_documented_terminals(self)

Verify TERMINAL_MAP contains all terminals mentioned in documentation.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |



