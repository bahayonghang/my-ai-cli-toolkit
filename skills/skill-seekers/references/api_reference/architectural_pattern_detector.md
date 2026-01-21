# API Reference: architectural_pattern_detector.py

**Language**: Python

**Source**: `src/skill_seekers/cli/architectural_pattern_detector.py`

---

## Classes

### ArchitecturalPattern

Detected architectural pattern

**Inherits from**: (none)



### ArchitecturalReport

Complete architectural analysis report

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Export to dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`




### ArchitecturalPatternDetector

Detect high-level architectural patterns.

Analyzes entire codebase structure, not individual files.

**Inherits from**: (none)

#### Methods

##### __init__(self, enhance_with_ai: bool = True)

Initialize detector.

Args:
    enhance_with_ai: Enable AI enhancement for detected patterns (C3.6)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| enhance_with_ai | bool | True | - |


##### analyze(self, directory: Path, files_analysis: list[dict]) → ArchitecturalReport

Analyze codebase for architectural patterns.

Args:
    directory: Root directory of codebase
    files_analysis: List of analyzed files from CodeAnalyzer

Returns:
    ArchitecturalReport with detected patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |
| files_analysis | list[dict] | - | - |

**Returns**: `ArchitecturalReport`


##### _analyze_directory_structure(self, directory: Path) → dict[str, int]

Analyze directory structure and count files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| directory | Path | - | - |

**Returns**: `dict[str, int]`


##### _detect_frameworks(self, _directory: Path, files: list[dict]) → list[str]

Detect frameworks being used

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| _directory | Path | - | - |
| files | list[dict] | - | - |

**Returns**: `list[str]`


##### _detect_mvc(self, dirs: dict[str, int], files: list[dict], frameworks: list[str]) → list[ArchitecturalPattern]

Detect MVC pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| files | list[dict] | - | - |
| frameworks | list[str] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _detect_mvvm(self, dirs: dict[str, int], files: list[dict], frameworks: list[str]) → list[ArchitecturalPattern]

Detect MVVM pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| files | list[dict] | - | - |
| frameworks | list[str] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _detect_repository(self, dirs: dict[str, int], files: list[dict]) → list[ArchitecturalPattern]

Detect Repository pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| files | list[dict] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _detect_service_layer(self, dirs: dict[str, int], files: list[dict]) → list[ArchitecturalPattern]

Detect Service Layer pattern

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| files | list[dict] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _detect_layered_architecture(self, dirs: dict[str, int], _files: list[dict]) → list[ArchitecturalPattern]

Detect Layered Architecture (3-tier, N-tier)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| _files | list[dict] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _detect_clean_architecture(self, dirs: dict[str, int], _files: list[dict]) → list[ArchitecturalPattern]

Detect Clean Architecture

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| dirs | dict[str, int] | - | - |
| _files | list[dict] | - | - |

**Returns**: `list[ArchitecturalPattern]`


##### _enhance_with_ai(self, report: ArchitecturalReport) → dict

Enhance architectural analysis with AI insights

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| report | ArchitecturalReport | - | - |

**Returns**: `dict`



