# API Reference: how_to_guide_builder.py

**Language**: Python

**Source**: `src/skill_seekers/cli/how_to_guide_builder.py`

---

## Classes

### PrerequisiteItem

Enhanced prerequisite with explanation (AI enhancement)

**Inherits from**: (none)



### TroubleshootingItem

Enhanced troubleshooting with solutions (AI enhancement)

**Inherits from**: (none)



### WorkflowStep

Single step in a workflow guide

**Inherits from**: (none)



### HowToGuide

Complete how-to guide generated from workflow(s)

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Convert to dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`




### GuideCollection

Collection of guides organized by category

**Inherits from**: (none)

#### Methods

##### to_dict(self) → dict

Convert to dictionary

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |

**Returns**: `dict`




### WorkflowAnalyzer

Analyze workflow examples to extract steps and metadata

**Inherits from**: (none)

#### Methods

##### analyze_workflow(self, workflow: dict) → tuple[list[WorkflowStep], dict]

Deep analysis of workflow structure.

Args:
    workflow: TestExample dict from C3.2

Returns:
    (steps, metadata) where metadata includes prerequisites, complexity, etc.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflow | dict | - | - |

**Returns**: `tuple[list[WorkflowStep], dict]`


##### _extract_steps_python(self, code: str, workflow: dict) → list[WorkflowStep]

Extract steps from Python code using AST

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |
| workflow | dict | - | - |

**Returns**: `list[WorkflowStep]`


##### _extract_steps_heuristic(self, code: str, _workflow: dict) → list[WorkflowStep]

Extract steps using heuristics (for non-Python or invalid syntax)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |
| _workflow | dict | - | - |

**Returns**: `list[WorkflowStep]`


##### _generate_step_description(self, node: ast.AST, code: str) → str

Generate human-readable description from AST node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.AST | - | - |
| code | str | - | - |

**Returns**: `str`


##### _describe_value(self, node: ast.AST) → str

Describe AST value node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.AST | - | - |

**Returns**: `str`


##### _get_name(self, node: ast.AST) → str

Extract name from AST node

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| node | ast.AST | - | - |

**Returns**: `str`


##### _infer_description_from_code(self, code: str) → str

Infer description from code using patterns

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `str`


##### _detect_prerequisites(self, workflow: dict) → dict

Detect prerequisites from workflow

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflow | dict | - | - |

**Returns**: `dict`


##### _find_verification_points(self, code: str) → list[str]

Find assertion statements in code

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| code | str | - | - |

**Returns**: `list[str]`


##### _calculate_complexity(self, steps: list[WorkflowStep], workflow: dict) → str

Calculate complexity level

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[WorkflowStep] | - | - |
| workflow | dict | - | - |

**Returns**: `str`


##### _estimate_time(self, steps: list[WorkflowStep]) → str

Estimate time to complete guide

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[WorkflowStep] | - | - |

**Returns**: `str`




### WorkflowGrouper

Group related workflows into coherent guides

**Inherits from**: (none)

#### Methods

##### group_workflows(self, workflows: list[dict], strategy: str = 'ai-tutorial-group') → dict[str, list[dict]]

Group workflows using specified strategy.

Args:
    workflows: List of workflow examples
    strategy: "ai-tutorial-group", "file-path", "test-name", "complexity"

Returns:
    Dict mapping group name to list of workflows

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflows | list[dict] | - | - |
| strategy | str | 'ai-tutorial-group' | - |

**Returns**: `dict[str, list[dict]]`


##### _group_by_ai_tutorial_group(self, workflows: list[dict]) → dict[str, list[dict]]

Group by AI-generated tutorial_group (from C3.6 enhancement)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflows | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`


##### _group_by_file_path(self, workflows: list[dict]) → dict[str, list[dict]]

Group workflows from same test file

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflows | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`


##### _group_by_test_name(self, workflows: list[dict]) → dict[str, list[dict]]

Group by common test name prefixes

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflows | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`


##### _group_by_complexity(self, workflows: list[dict]) → dict[str, list[dict]]

Group by complexity level

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| workflows | list[dict] | - | - |

**Returns**: `dict[str, list[dict]]`


##### _clean_test_name(self, test_name: str) → str

Clean test name to readable title

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_name | str | - | - |

**Returns**: `str`


##### _extract_prefix(self, test_name: str) → str

Extract prefix from test name

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| test_name | str | - | - |

**Returns**: `str`




### GuideGenerator

Generate markdown guides from workflow data

**Inherits from**: (none)

#### Methods

##### generate_guide_markdown(self, guide: HowToGuide) → str

Generate complete markdown guide.

Args:
    guide: HowToGuide object with all data

Returns:
    Complete markdown string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_header(self, guide: HowToGuide) → str

Create guide header with metadata

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_overview(self, guide: HowToGuide) → str

Create overview section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_prerequisites(self, guide: HowToGuide) → str

Create prerequisites section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_steps_section(self, steps: list[WorkflowStep]) → str

Create step-by-step guide section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| steps | list[WorkflowStep] | - | - |

**Returns**: `str`


##### _create_complete_example(self, guide: HowToGuide) → str

Create complete working example

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_troubleshooting(self, guide: HowToGuide) → str

Create troubleshooting section

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_next_steps(self, guide: HowToGuide) → str

Create next steps and related guides

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### _create_footer(self, guide: HowToGuide) → str

Create guide footer with metadata

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |

**Returns**: `str`


##### generate_index(self, guides: list[HowToGuide]) → str

Generate index/TOC markdown.

Args:
    guides: List of all guides

Returns:
    Index markdown string

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guides | list[HowToGuide] | - | - |

**Returns**: `str`




### HowToGuideBuilder

Main orchestrator for building how-to guides from workflow examples

**Inherits from**: (none)

#### Methods

##### __init__(self, enhance_with_ai: bool = True)

Initialize guide builder.

Args:
    enhance_with_ai: Enable AI enhancement (requires C3.6 AI analysis in workflows)

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| enhance_with_ai | bool | True | - |


##### build_guides_from_examples(self, examples: list[dict], grouping_strategy: str = 'ai-tutorial-group', output_dir: Path | None = None, enhance_with_ai: bool = True, ai_mode: str = 'auto') → GuideCollection

Main entry point - build guides from workflow examples.

Args:
    examples: List of TestExample dicts from C3.2
    grouping_strategy: How to group workflows ("ai-tutorial-group", "file-path", etc.)
    output_dir: Optional directory to save markdown files
    enhance_with_ai: Enable comprehensive AI enhancement (default: True)
    ai_mode: AI enhancement mode - "auto", "api", "local", or "none"

Returns:
    GuideCollection with all generated guides

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[dict] | - | - |
| grouping_strategy | str | 'ai-tutorial-group' | - |
| output_dir | Path | None | None | - |
| enhance_with_ai | bool | True | - |
| ai_mode | str | 'auto' | - |

**Returns**: `GuideCollection`


##### _extract_workflow_examples(self, examples: list[dict]) → list[dict]

Filter to workflow category only

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| examples | list[dict] | - | - |

**Returns**: `list[dict]`


##### _create_guide(self, title: str, workflows: list[dict], enhancer = None) → HowToGuide

Generate single guide from workflow(s).

Args:
    title: Guide title
    workflows: List of related workflow examples
    enhancer: Optional GuideEnhancer instance for AI enhancement

Returns:
    Complete HowToGuide object

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| title | str | - | - |
| workflows | list[dict] | - | - |
| enhancer | None | None | - |

**Returns**: `HowToGuide`


##### _generate_overview(self, primary_workflow: dict, _all_workflows: list[dict]) → str

Generate guide overview

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| primary_workflow | dict | - | - |
| _all_workflows | list[dict] | - | - |

**Returns**: `str`


##### _enhance_guide_with_ai(self, guide: HowToGuide, _ai_analysis: dict, enhancer)

Comprehensively enhance guide with AI using GuideEnhancer.

Applies all 5 enhancements:
1. Step descriptions - Natural language explanations        2. Troubleshooting - Diagnostic flows + solutions
3. Prerequisites - Why needed + setup
4. Next steps - Related guides, variations
5. Use cases - Real-world scenarios

Args:
    guide: HowToGuide object to enhance
    ai_analysis: AI analysis data from C3.6 (for context)
    enhancer: GuideEnhancer instance

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |
| _ai_analysis | dict | - | - |
| enhancer | None | - | - |


##### _enhance_guide_with_ai_basic(self, guide: HowToGuide, ai_analysis: dict)

Basic enhancement using pre-computed AI analysis from C3.6.

This is a fallback when GuideEnhancer is not available.

Args:
    guide: HowToGuide object to enhance
    ai_analysis: AI analysis data from C3.6

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guide | HowToGuide | - | - |
| ai_analysis | dict | - | - |


##### _create_collection(self, guides: list[HowToGuide]) → GuideCollection

Create GuideCollection from guides

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| guides | list[HowToGuide] | - | - |

**Returns**: `GuideCollection`


##### _save_guides_to_files(self, collection: GuideCollection, output_dir: Path)

Save guides to markdown files

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| self | None | - | - |
| collection | GuideCollection | - | - |
| output_dir | Path | - | - |




## Functions

### main()

CLI entry point for how-to guide builder

**Returns**: (none)


