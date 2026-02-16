# API Reference: enhance_skill.py

**Language**: Python

**Source**: `src/skill_seekers/cli/enhance_skill.py`

---

## Classes

### SkillEnhancer

**Inherits from**: (none)

#### Methods

##### __init__(self, skill_dir, api_key = None)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| skill_dir | None | - | - |
| api_key | None | None | - |


##### read_current_skill_md(self)

Read existing SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |


##### enhance_skill_md(self, references, current_skill_md)

Use Claude to enhance SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| references | None | - | - |
| current_skill_md | None | - | - |


##### _build_enhancement_prompt(self, references, current_skill_md)

Build the prompt for Claude with multi-source awareness

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| references | None | - | - |
| current_skill_md | None | - | - |


##### save_enhanced_skill_md(self, content)

Save the enhanced SKILL.md

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| content | None | - | - |


##### run(self)

Main enhancement workflow

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |




## Functions

### main()

**Returns**: (none)


