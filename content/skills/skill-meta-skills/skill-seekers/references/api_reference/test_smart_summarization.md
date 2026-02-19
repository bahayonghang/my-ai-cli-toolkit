# API Reference: test_smart_summarization.py

**Language**: Python

**Source**: `tests/test_smart_summarization.py`

---

## Classes

### TestSmartSummarization

Test smart summarization feature for large skills

**Inherits from**: (none)

#### Methods

##### test_summarize_reference_basic(self, tmp_path)

Test basic summarization preserves structure

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_summarize_preserves_code_blocks(self, tmp_path)

Test that code blocks are prioritized and preserved

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_summarize_large_content(self, tmp_path)

Test summarization with very large content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_create_prompt_without_summarization(self, tmp_path)

Test prompt creation with normal-sized content

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_create_prompt_with_summarization(self, tmp_path)

Test prompt creation with summarization enabled

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_run_detects_large_skill(self, tmp_path, monkeypatch, capsys)

Test that run() automatically detects large skills

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |
| monkeypatch | None | - | - |
| capsys | None | - | - |




## Functions

### mock_headless(_prompt_file, _timeout)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| _prompt_file | None | - | - |
| _timeout | None | - | - |

**Returns**: (none)


