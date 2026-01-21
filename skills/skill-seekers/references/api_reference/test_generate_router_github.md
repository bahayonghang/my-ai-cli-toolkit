# API Reference: test_generate_router_github.py

**Language**: Python

**Source**: `tests/test_generate_router_github.py`

---

## Classes

### TestRouterGeneratorBasic

Test basic router generation without GitHub streams (backward compat).

**Inherits from**: (none)

#### Methods

##### test_router_generator_init(self, tmp_path)

Test router generator initialization.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_infer_router_name(self, tmp_path)

Test router name inference from sub-skill names.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_extract_routing_keywords_basic(self, tmp_path)

Test basic keyword extraction without GitHub.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestRouterGeneratorWithGitHub

Test router generation with GitHub streams (Phase 4).

**Inherits from**: (none)

#### Methods

##### test_router_with_github_metadata(self, tmp_path)

Test router generator with GitHub metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_extract_keywords_with_github_labels(self, tmp_path)

Test keyword extraction with GitHub issue labels (2x weight).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_generate_skill_md_with_github(self, tmp_path)

Test SKILL.md generation with GitHub metadata.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_generate_skill_md_without_github(self, tmp_path)

Test SKILL.md generation without GitHub (backward compat).

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestSubSkillIssuesSection

Test sub-skill issue section generation (Phase 4).

**Inherits from**: (none)

#### Methods

##### test_generate_subskill_issues_section(self, tmp_path)

Test generation of issues section for sub-skills.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |


##### test_generate_subskill_issues_no_matches(self, tmp_path)

Test issues section when no issues match the topic.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |




### TestIntegration

Integration tests for Phase 4.

**Inherits from**: (none)

#### Methods

##### test_full_router_generation_with_github(self, tmp_path)

Test complete router generation workflow with GitHub streams.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| tmp_path | None | - | - |



