---
name: imitate-auto
description: UI design workflow with direct code/image input for design token extraction and prototype generation
argument-hint: "[--input "<value>"] [--session <id>]"
allowed-tools: SlashCommand(*), TodoWrite(*), Read(*), Write(*), Bash(*)
---

# UI Design Imitate-Auto Workflow Command

## Overview & Execution Model

**Fully autonomous design orchestrator**: Efficiently create UI prototypes through sequential execution from design token extraction to system integration.

**Direct Input Strategy**: Accepts local code files and images:
- **Code Files**: Detect file paths in `--prompt` parameter
- **Images**: Reference images via `--images` glob pattern
- **Hybrid**: Combine both code and visual inputs

**Autonomous Flow** (⚠️ CONTINUOUS EXECUTION - DO NOT STOP):
1. User triggers: `/workflow:ui-design:imitate-auto [--input "..."]`
2. Phase 0: Initialize and detect input sources
3. Phase 2: Style extraction → **Attach tasks → Execute → Collapse** → Auto-continues
4. Phase 2.3: Animation extraction → **Attach tasks → Execute → Collapse** → Auto-continues
5. Phase 2.5: Layout extraction → **Attach tasks → Execute → Collapse** → Auto-continues
6. Phase 3: Batch UI assembly → **Attach tasks → Execute → Collapse** → Auto-continues
7. Phase 4: Design system integration → **Execute orchestrator task** → Reports completion

**Phase Transition Mechanism**:
- **Task Attachment**: SlashCommand execute **ATTACHES** tasks to current workflow
- **Task Execution**: Orchestrator **EXECUTES** these attached tasks itself
- **Task Collapse**: After tasks complete, collapse them into phase summary
- **Phase Transition**: Automatically execute next phase after collapsing
- No user interaction required after initial parameter parsing

**Auto-Continue Mechanism**: TodoWrite tracks phase status with dynamic task attachment/collapse. After executing all attached tasks, you MUST immediately collapse them, restore phase summary, and execute the next phase. No user intervention required. The workflow is NOT complete until reaching Phase 4.

**Task Attachment Model**: SlashCommand execute is NOT delegation - it's task expansion. The orchestrator executes these attached tasks itself, not waiting for external completion.

## Execution Process

```
Input Parsing:
   ├─ Parse flags: --input, --session (legacy: --images, --prompt)
   └─ Decision (input detection):
      ├─ Contains * or glob matches → images_input (visual)
      ├─ File/directory exists → code import source
      └─ Pure text → design prompt

Phase 0: Parameter Parsing & Input Detection
   ├─ Step 1: Normalize parameters (legacy deprecation warning)
   ├─ Step 2: Detect design source (hybrid | code_only | visual_only)
   └─ Step 3: Initialize directories and metadata

Phase 0.5: Code Import (Conditional)
   └─ Decision (design_source):
      ├─ hybrid → Execute /workflow:ui-design:import-from-code
      └─ Other → Skip to Phase 2

Phase 2: Style Extraction
   └─ Decision (skip_style):
      ├─ code_only AND style_complete → Use code import
      └─ Otherwise → Execute /workflow:ui-design:style-extract

Phase 2.3: Animation Extraction
   └─ Decision (skip_animation):
      ├─ code_only AND animation_complete → Use code import
      └─ Otherwise → Execute /workflow:ui-design:animation-extract

Phase 2.5: Layout Extraction
   └─ Decision (skip_layout):
      ├─ code_only AND layout_complete → Use code import
      └─ Otherwise → Execute /workflow:ui-design:layout-extract

Phase 3: UI Assembly
   └─ Execute /workflow:ui-design:generate

Phase 4: Design System Integration
   └─ Decision (session_id):
      ├─ Provided → Execute /workflow:ui-design:update
      └─ Not provided → Standalone completion
```

## Core Rules

1. **Start Immediately**: TodoWrite initialization → Phase 2 execution
2. **No Preliminary Validation**: Sub-commands handle their own validation
3. **Parse & Pass**: Extract data from each output for next phase
4. **Track Progress**: Update TodoWrite dynamically with task attachment/collapse pattern
5. **⚠️ CRITICAL: Task Attachment Model** - SlashCommand execute **ATTACHES** tasks to current workflow. Orchestrator **EXECUTES** these attached tasks itself, not waiting for external completion. This is NOT delegation - it's task expansion.
6. **⚠️ CRITICAL: DO NOT STOP** - This is a continuous multi-phase workflow. After executing all attached tasks, you MUST immediately collapse them and execute the next phase. Workflow is NOT complete until Phase 4.

## Parameter Requirements

**Recommended Parameter**:
- `--input "<value>"`: Unified input source (auto-detects type)
  - **Glob pattern** (images): `"design-refs/*"`, `"screenshots/*.png"`
  - **File/directory path** (code): `"./src/components"`, `"/path/to/styles"`
  - **Text description** (prompt): `"Focus on dark mode"`, `"Emphasize minimalist design"`
  - **Combination**: `"design-refs/* modern dashboard style"` (glob + description)
  - Multiple inputs: Separate with `|` → `"design-refs/*|modern style"`

**Detection Logic**:
- Contains `*` or matches existing files → **glob pattern** (images)
- Existing file/directory path → **code import**
- Pure text without paths → **design prompt**
- Contains `|` separator → **multiple inputs** (glob|prompt or path|prompt)

**Legacy Parameters** (deprecated, use `--input` instead):
- `--images "<glob>"`: Reference image paths (shows deprecation warning)
- `--prompt "<desc>"`: Design description (shows deprecation warning)

**Optional Parameters**:
- `--session <id>`: Workflow session ID
  - Integrate into existing session (`.workflow/active/WFS-{session}/`)
  - Enable automatic design system integration (Phase 4)
  - If not provided: standalone mode (`.workflow/`)

**Input Rules**:
- Must provide: `--input` OR (legacy: `--images`/`--prompt`)
- `--input` can combine multiple input types
- File paths are automatically detected and trigger code import

## Execution Modes

**Input Sources**:
- **Code Files**: Automatically detected from `--prompt` file paths
  - Triggers `/workflow:ui-design:import-from-code` for token extraction
  - Analyzes existing CSS/JS/HTML files
- **Visual Input**: Images via `--images` glob pattern
  - Reference images for style extraction
  - Screenshots or design mockups
- **Hybrid Mode**: Combines code import with visual supplements
  - Code provides base tokens
  - Images supplement missing design elements

**Token Processing**:
- **Direct Generation**: Complete design systems generated in style-extract phase
  - Production-ready design-tokens.json with WCAG compliance
  - Complete style-guide.md documentation
  - No separate consolidation step required (~30-60s faster)

**Session Integration**:
- `--session` flag determines session integration or standalone execution
- Integrated: Design system automatically added to session artifacts
- Standalone: Output in `.workflow/active/{run_id}/`

## 5-Phase Execution

### Phase 0: Parameter Parsing & Input Detection

```bash
# Step 0: Parse and normalize parameters
images_input = null
prompt_text = null

# Handle legacy parameters with deprecation warning
IF --images OR --prompt:
    WARN: "⚠️  DEPRECATION: --images and --prompt are deprecated. Use --input instead."
    WARN: "   Example: --input \"design-refs/*\" or --input \"modern dashboard\""
    images_input = --images
    prompt_text = --prompt

# Parse unified --input parameter
IF --input:
    # Split by | separator for multiple inputs
    input_parts = split(--input, "|")

    FOR part IN input_parts:
        part = trim(part)

        # Detection logic
        IF contains(part, "*") OR glob_matches_files(part):
            # Glob pattern detected → images
            images_input = part
        ELSE IF file_or_directory_exists(part):
            # File/directory path → will be handled in code detection
            IF NOT prompt_text:
                prompt_text = part
            ELSE:
                prompt_text = prompt_text + " " + part
        ELSE:
            # Pure text → prompt
            IF NOT prompt_text:
                prompt_text = part
            ELSE:
                prompt_text = prompt_text + " " + part

# Validation
IF NOT images_input AND NOT prompt_text:
    ERROR: "No input provided. Use --input with glob pattern, file path, or text description"
    EXIT 1

# Step 1: Detect design source from parsed inputs
code_files_detected = false
code_base_path = null
has_visual_input = false

IF prompt_text:
    # Extract potential file paths from prompt
    potential_paths = extract_paths_from_text(prompt_text)
    FOR path IN potential_paths:
        IF file_or_directory_exists(path):
            code_files_detected = true
            code_base_path = path
            BREAK

IF images_input:
    # Check if images parameter points to existing files
    IF glob_matches_files(images_input):
        has_visual_input = true

# Step 2: Determine design source strategy
design_source = "unknown"
IF code_files_detected AND has_visual_input:
    design_source = "hybrid"  # Both code and visual
ELSE IF code_files_detected:
    design_source = "code_only"  # Only code files
ELSE IF has_visual_input OR --prompt:
    design_source = "visual_only"  # Only visual/prompt
ELSE:
    ERROR: "No design source provided (code files, images, or prompt required)"
    EXIT 1

STORE: design_source, code_base_path, has_visual_input

# Step 3: Initialize directories
design_id = "design-run-$(date +%Y%m%d)-$RANDOM"

IF --session:
    session_id = {provided_session}
    relative_base_path = ".workflow/active/WFS-{session_id}/{design_id}"
    session_mode = "integrated"
ELSE:
    session_id = null
    relative_base_path = ".workflow/active/{design_id}"
    session_mode = "standalone"

# Create base directory and convert to absolute path
Bash(mkdir -p "{relative_base_path}")
base_path=$(cd "{relative_base_path}" && pwd)

# Write metadata
metadata = {
    "workflow": "imitate-auto",
    "run_id": design_id,
    "session_id": session_id,
    "timestamp": current_timestamp(),
    "parameters": {
        "design_source": design_source,
        "code_base_path": code_base_path,
        "images": images_input OR null,
        "prompt": prompt_text OR null,
        "input": --input OR null  # Store original --input for reference
    },
    "status": "in_progress"
}

Write("{base_path}/.run-metadata.json", JSON.stringify(metadata, null, 2))

# Initialize default flags
animation_complete = false
needs_visual_supplement = false
style_complete = false
layout_complete = false

# Initialize TodoWrite
TodoWrite({todos: [
  {content: "Initialize and detect design source", status: "completed", activeForm: "Initializing"},
  {content: "Extract style (complete design systems)", status: "pending", activeForm: "Extracting style"},
  {content: "Extract animation (CSS auto mode)", status: "pending", activeForm: "Extracting animation"},
  {content: "Extract layout (structure templates)", status: "pending", activeForm: "Extracting layout"},
  {content: "Assemble UI prototypes", status: "pending", activeForm: "Assembling UI"},
  {content: session_id ? "Integrate design system" : "Standalone completion", status: "pending", activeForm: "Completing"}
]})
```

### Phase 0.5: Code Import & Completeness Assessment (Conditional)

**Step 0.5.1: Execute** - Import design system from code files

```javascript
# Only execute if code files detected
IF design_source == "hybrid":
    REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    REPORT: "🔍 Phase 0.5: Code Import & Analysis"
    REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    REPORT: "   → Source: {code_base_path}"
    REPORT: "   → Mode: Hybrid (Web + Code)"

    command = "/workflow:ui-design:import-from-code --design-id \"{design_id}\" " +
              "--source \"{code_base_path}\""

    TRY:
        # SlashCommand execute ATTACHES import-from-code's tasks to current workflow
        # Orchestrator will EXECUTE these attached tasks itself:
        #   - Phase 0: Discover and categorize code files
        #   - Phase 1.1-1.3: Style/Animation/Layout Agent extraction
        SlashCommand(command)
    CATCH error:
        WARN: "Code import failed: {error}"
        WARN: "Falling back to web-only mode"
        design_source = "web"

    IF design_source == "hybrid":
        # Check file existence and assess completeness
        style_exists = exists("{base_path}/style-extraction/style-1/design-tokens.json")
        animation_exists = exists("{base_path}/animation-extraction/animation-tokens.json")
        layout_count = bash(ls {base_path}/layout-extraction/layout-*.json 2>/dev/null | wc -l)
        layout_exists = (layout_count > 0)

        style_complete = false
        animation_complete = false
        layout_complete = false
        missing_categories = []

        # Style completeness check
        IF style_exists:
            tokens = Read("{base_path}/style-extraction/style-1/design-tokens.json")
            style_complete = (
                tokens.colors?.brand && tokens.colors?.surface &&
                tokens.typography?.font_family && tokens.spacing &&
                Object.keys(tokens.colors.brand || {}).length >= 3 &&
                Object.keys(tokens.spacing || {}).length >= 8
            )
            IF NOT style_complete AND tokens._metadata?.completeness?.missing_categories:
                missing_categories.extend(tokens._metadata.completeness.missing_categories)
        ELSE:
            missing_categories.push("style tokens")

        # Animation completeness check
        IF animation_exists:
            anim = Read("{base_path}/animation-extraction/animation-tokens.json")
            animation_complete = (
                anim.duration && anim.easing &&
                Object.keys(anim.duration || {}).length >= 3 &&
                Object.keys(anim.easing || {}).length >= 3
            )
            IF NOT animation_complete AND anim._metadata?.completeness?.missing_items:
                missing_categories.extend(anim._metadata.completeness.missing_items)
        ELSE:
            missing_categories.push("animation tokens")

        # Layout completeness check
        IF layout_exists:
            # Read first layout file to verify structure
            first_layout = bash(ls {base_path}/layout-extraction/layout-*.json 2>/dev/null | head -1)
            layout_data = Read(first_layout)
            layout_complete = (
                layout_count >= 1 &&
                layout_data.template?.dom_structure &&
                layout_data.template?.css_layout_rules
            )
            IF NOT layout_complete:
                missing_categories.push("complete layout structure")
        ELSE:
            missing_categories.push("layout templates")

        # Report code analysis results
        IF len(missing_categories) > 0:
            REPORT: ""
            REPORT: "⚠️  Code Analysis Partial"
            REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            REPORT: "Missing Design Elements:"
            FOR category IN missing_categories:
                REPORT: "  • {category}"
            REPORT: ""
            REPORT: "Web screenshots will supplement missing elements"
            REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        ELSE:
            REPORT: ""
            REPORT: "✅ Code Analysis Complete"
            REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            REPORT: "All design elements extracted from code"
            REPORT: "Web screenshots will verify and enhance findings"
            REPORT: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        STORE: style_complete, animation_complete, layout_complete

TodoWrite(mark_completed: "Initialize and detect design source",
          mark_in_progress: "Extract style (complete design systems)")
```

### Phase 2: Style Extraction

**Step 2.1: Execute** - Extract style design system

```javascript
# Determine if style extraction needed
skip_style = (design_source == "code_only" AND style_complete)

IF skip_style:
    REPORT: "✅ Phase 2: Style (Using Code Import)"
ELSE:
    REPORT: "🚀 Phase 2: Style Extraction"

    # Build command with available inputs
    command_parts = [f"/workflow:ui-design:style-extract --design-id \"{design_id}\""]

    IF images_input:
        command_parts.append(f"--images \"{images_input}\"")

    IF prompt_text:
        extraction_prompt = prompt_text
        IF design_source == "hybrid":
            extraction_prompt = f"{prompt_text} (supplement code-imported tokens)"
        command_parts.append(f"--prompt \"{extraction_prompt}\"")

    command_parts.extend(["--variants 1", "--refine", "--interactive"])

    extract_command = " ".join(command_parts)

    # SlashCommand execute ATTACHES style-extract's tasks to current workflow
    # Orchestrator will EXECUTE these attached tasks itself
    SlashCommand(extract_command)

    # After executing all attached tasks, collapse them into phase summary
    TodoWrite(mark_completed: "Extract style", mark_in_progress: "Extract animation")
```

### Phase 2.3: Animation Extraction

**Step 2.3.1: Execute** - Extract animation patterns

```javascript
skip_animation = (design_source == "code_only" AND animation_complete)

IF skip_animation:
    REPORT: "✅ Phase 2.3: Animation (Using Code Import)"
ELSE:
    REPORT: "🚀 Phase 2.3: Animation Extraction"

    # Build command with available inputs
    command_parts = [f"/workflow:ui-design:animation-extract --design-id \"{design_id}\""]

    IF images_input:
        command_parts.append(f"--images \"{images_input}\"")

    IF prompt_text:
        command_parts.append(f"--prompt \"{prompt_text}\"")

    command_parts.extend(["--refine", "--interactive"])

    animation_extract_command = " ".join(command_parts)

    # SlashCommand execute ATTACHES animation-extract's tasks to current workflow
    # Orchestrator will EXECUTE these attached tasks itself
    SlashCommand(animation_extract_command)

    # After executing all attached tasks, collapse them into phase summary
    TodoWrite(mark_completed: "Extract animation", mark_in_progress: "Extract layout")
```

### Phase 2.5: Layout Extraction

**Step 2.5.1: Execute** - Extract layout templates

```javascript
skip_layout = (design_source == "code_only" AND layout_complete)

IF skip_layout:
    REPORT: "✅ Phase 2.5: Layout (Using Code Import)"
ELSE:
    REPORT: "🚀 Phase 2.5: Layout Extraction"

    # Build command with available inputs
    command_parts = [f"/workflow:ui-design:layout-extract --design-id \"{design_id}\""]

    IF images_input:
        command_parts.append(f"--images \"{images_input}\"")

    IF prompt_text:
        command_parts.append(f"--prompt \"{prompt_text}\"")

    # Default target if not specified
    command_parts.append("--targets \"home\"")
    command_parts.extend(["--variants 1", "--refine", "--interactive"])

    layout_extract_command = " ".join(command_parts)

    # SlashCommand execute ATTACHES layout-extract's tasks to current workflow
    # Orchestrator will EXECUTE these attached tasks itself
    SlashCommand(layout_extract_command)

    # After executing all attached tasks, collapse them into phase summary
    TodoWrite(mark_completed: "Extract layout", mark_in_progress: "Assemble UI")
```

### Phase 3: UI Assembly

**Step 3.1: Execute** - Assemble UI prototypes from design tokens and layout templates

```javascript
REPORT: "🚀 Phase 3: UI Assembly"
generate_command = f"/workflow:ui-design:generate --design-id \"{design_id}\""

# SlashCommand execute ATTACHES generate's tasks to current workflow
# Orchestrator will EXECUTE these attached tasks itself
SlashCommand(generate_command)

# After executing all attached tasks, collapse them into phase summary
TodoWrite(mark_completed: "Assemble UI", mark_in_progress: session_id ? "Integrate design system" : "Completion")
```

### Phase 4: Design System Integration

**Step 4.1: Execute** - Integrate design system into workflow session

```javascript
IF session_id:
    REPORT: "🚀 Phase 4: Design System Integration"
    update_command = f"/workflow:ui-design:update --session {session_id}"

    # SlashCommand execute ATTACHES update's tasks to current workflow
    # Orchestrator will EXECUTE these attached tasks itself
    SlashCommand(update_command)

# Update metadata
metadata = Read("{base_path}/.run-metadata.json")
metadata.status = "completed"
metadata.completion_time = current_timestamp()
metadata.outputs = {
    "screenshots": f"{base_path}/screenshots/",
    "style_system": f"{base_path}/style-extraction/style-1/",
    "prototypes": f"{base_path}/prototypes/",
    "captured_count": captured_count,
    "generated_count": generated_count
}
Write("{base_path}/.run-metadata.json", JSON.stringify(metadata, null, 2))

TodoWrite(mark_completed: session_id ? "Integrate design system" : "Standalone completion")

# Mark all phases complete
TodoWrite({todos: [
  {content: "Initialize and parse url-map", status: "completed", activeForm: "Initializing"},
  {content: capture_mode == "batch" ? f"Batch screenshot capture ({len(target_names)} targets)" : f"Deep exploration (depth {depth})", status: "completed", activeForm: "Capturing"},
  {content: "Extract style (complete design systems)", status: "completed", activeForm: "Extracting"},
  {content: "Extract animation (CSS auto mode)", status: "completed", activeForm: "Extracting animation"},
  {content: "Extract layout (structure templates)", status: "completed", activeForm: "Extracting layout"},
  {content: f"Assemble UI for {len(target_names)} targets", status: "completed", activeForm: "Assembling"},
  {content: session_id ? "Integrate design system" : "Standalone completion", status: "completed", activeForm: "Completing"}
]})
```

### Phase 4: Completion Report

**Completion Message**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ UI Design Imitate-Auto Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ 📊 Workflow Summary ━━━

Mode: Direct Input ({design_source})
Session: {session_id or "standalone"}
Run ID: {run_id}

Phase 0 - Input Detection: ✅ {design_source} mode
  {IF design_source == "code_only": "Code files imported" ELSE IF design_source == "hybrid": "Code + visual inputs" ELSE: "Visual inputs"}

Phase 2 - Style Extraction: ✅ Production-ready design systems
  Output: style-extraction/style-1/ (design-tokens.json + style-guide.md)
  Quality: WCAG AA compliant, OKLCH colors

Phase 2.3 - Animation Extraction: ✅ Animation tokens
  Output: animation-extraction/ (animation-tokens.json + animation-guide.md)

Phase 2.5 - Layout Extraction: ✅ Structure templates
  Templates: {template_count} layout structures

Phase 3 - UI Assembly: ✅ {generated_count} prototypes assembled
  Configuration: 1 style × 1 layout × {generated_count} pages

Phase 4 - Integration: {IF session_id: "✅ Integrated into session" ELSE: "⏭️ Standalone mode"}

━━━ 📂 Output Structure ━━━

{base_path}/
├── style-extraction/               # Production-ready design systems
│   └── style-1/
│       ├── design-tokens.json
│       └── style-guide.md
├── animation-extraction/           # CSS animations and transitions
│   ├── animation-tokens.json
│   └── animation-guide.md
├── layout-extraction/              # Structure templates
│   └── layout-home-1.json          # Layout templates
└── prototypes/                     # {generated_count} HTML/CSS files
    ├── home-style-1-layout-1.html + .css
    ├── compare.html                # Interactive preview
    └── index.html                  # Quick navigation

━━━ ⚡ Performance ━━━

Total workflow time: ~{estimate_total_time()} minutes
  Style extraction: ~{extract_time}
  Animation extraction: ~{animation_time}
  Layout extraction: ~{layout_time}
  UI generation: ~{generate_time}

━━━ 🌐 Next Steps ━━━

1. Preview prototypes:
   • Interactive matrix: Open {base_path}/prototypes/compare.html
   • Quick navigation: Open {base_path}/prototypes/index.html

{IF session_id:
2. Create implementation tasks:
   /workflow:plan --session {session_id}

3. Generate tests (if needed):
   /workflow:test-gen {session_id}
ELSE:
2. To integrate into a workflow session:
   • Create session: /workflow:session:start
   • Copy design-tokens.json to session artifacts

3. Explore prototypes in {base_path}/prototypes/ directory
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## TodoWrite Pattern

```javascript
// Initialize IMMEDIATELY at start of Phase 0 to track multi-phase execution (6 orchestrator-level tasks)
TodoWrite({todos: [
  {content: "Phase 0: Initialize and Detect Design Source", status: "in_progress", activeForm: "Initializing"},
  {content: "Phase 2: Style Extraction", status: "pending", activeForm: "Extracting style"},
  {content: "Phase 2.3: Animation Extraction", status: "pending", activeForm: "Extracting animation"},
  {content: "Phase 2.5: Layout Extraction", status: "pending", activeForm: "Extracting layout"},
  {content: "Phase 3: UI Assembly", status: "pending", activeForm: "Assembling UI"},
  {content: "Phase 4: Design System Integration", status: "pending", activeForm: "Integrating"}
]})

// ⚠️ CRITICAL: Dynamic TodoWrite task attachment strategy:
//
// **Key Concept**: SlashCommand execute ATTACHES tasks to current workflow.
// Orchestrator EXECUTES these attached tasks itself, not waiting for external completion.
//
// Phase 2-4 SlashCommand Execute Pattern (when tasks are attached):
// Example - Phase 2 with sub-tasks:
// [
//   {"content": "Phase 0: Initialize and Detect Design Source", "status": "completed", "activeForm": "Initializing"},
//   {"content": "Phase 2: Style Extraction", "status": "in_progress", "activeForm": "Extracting style"},
//   {"content": "  → Analyze design references", "status": "in_progress", "activeForm": "Analyzing references"},
//   {"content": "  → Generate design tokens", "status": "pending", "activeForm": "Generating tokens"},
//   {"content": "  → Create style guide", "status": "pending", "activeForm": "Creating guide"},
//   {"content": "Phase 2.3: Animation Extraction", "status": "pending", "activeForm": "Extracting animation"},
//   ...
// ]
//
// After sub-tasks complete, COLLAPSE back to:
// [
//   {"content": "Phase 0: Initialize and Detect Design Source", "status": "completed", "activeForm": "Initializing"},
//   {"content": "Phase 2: Style Extraction", "status": "completed", "activeForm": "Extracting style"},
//   {"content": "Phase 2.3: Animation Extraction", "status": "in_progress", "activeForm": "Extracting animation"},
//   ...
// ]
//
```

## Error Handling

### Pre-execution Checks
- **Input validation**: Must provide at least one of --images or --prompt
- **Design source detection**: Error if no valid inputs found
- **Code import failure**: Fallback to visual-only mode in hybrid, error in code-only mode

### Phase-Specific Errors
- **Code import failure (Phase 0.5)**:
  - code_only mode: Terminate with clear error
  - hybrid mode: Warn and fallback to visual-only mode

- **Style extraction failure (Phase 2)**:
  - If extract fails: Terminate with clear error
  - If design-tokens.json missing: Terminate with debugging info

- **Animation extraction failure (Phase 2.3)**:
  - Non-critical: Warn but continue
  - Can proceed without animation tokens

- **Layout extraction failure (Phase 2.5)**:
  - If extract fails: Terminate with error
  - Need layout templates for assembly

- **UI generation failure (Phase 3)**:
  - If generate fails: Terminate with error
  - If generated_count < expected: Warn but proceed

- **Integration failure (Phase 4)**:
  - Non-blocking: Warn but don't terminate
  - Prototypes already available

### Recovery Strategies
- **Code import failure**: Automatic fallback to visual-only in hybrid mode
- **Generate failure**: Report specific failures, user can re-generate individually
- **Integration failure**: Prototypes still usable, can integrate manually

## Integration Points

- **Input**: `--images` (glob pattern) and/or `--prompt` (text/file paths) + optional `--session`
- **Output**: Complete design system in `{base_path}/` (style-extraction, layout-extraction, prototypes)
- **Sub-commands Executeed**:
  1. `/workflow:ui-design:import-from-code` (Phase 0.5, conditional - if code files detected)
  2. `/workflow:ui-design:style-extract` (Phase 2 - complete design systems)
  3. `/workflow:ui-design:animation-extract` (Phase 2.3 - animation tokens)
  4. `/workflow:ui-design:layout-extract` (Phase 2.5 - structure templates)
  5. `/workflow:ui-design:generate` (Phase 3 - pure assembly)
  6. `/workflow:ui-design:update` (Phase 4, if --session)

## Completion Output

```
✅ UI Design Imitate-Auto Workflow Complete!

Mode: Direct Input ({design_source}) | Session: {session_id or "standalone"}
Run ID: {run_id}

Phase 0 - Input Detection: ✅ {design_source} mode
Phase 2 - Style Extraction: ✅ Production-ready design systems
Phase 2.3 - Animation Extraction: ✅ Animation tokens
Phase 2.5 - Layout Extraction: ✅ Structure templates
Phase 3 - UI Assembly: ✅ {generated_count} prototypes assembled
Phase 4 - Integration: {IF session_id: "✅ Integrated" ELSE: "⏭️ Standalone"}

Design Quality:
✅ Token-Driven Styling: 100% var() usage
✅ Production-Ready: WCAG AA compliant, OKLCH colors
✅ Multi-Source: Code import + visual extraction

📂 {base_path}/
  ├── style-extraction/style-1/     # Production-ready design system
  ├── animation-extraction/         # Animation tokens
  ├── layout-extraction/            # Structure templates
  └── prototypes/                   # {generated_count} HTML/CSS files

🌐 Preview: {base_path}/prototypes/compare.html
  - Interactive preview
  - Design token driven
  - {generated_count} assembled prototypes

Next: [/workflow:execute] OR [Open compare.html → /workflow:plan]
```
