---
name: review-code
description: Analyze code across multiple dimensions and generate structured reports. Use when the user requests a code review, "review code", or "审查代码".
argument-hint: [target-files-or-directory]
allowed-tools: Task, AskUserQuestion, Read, Write, Glob, Grep, Bash, mcp__ace-tool__search_context, mcp__ide__getDiagnostics
metadata:
  category: code-quality
  tags:
    - code-review
    - quality-assurance
    - security
    - performance
    - best-practices
    - testing
---

Perform a multi-dimensional code review on `$ARGUMENTS` (defaults to current directory if not provided).

## Prerequisites (Mandatory)
1. Read the following specifications from `$SKILL_DIR/specs/` to understand dimensions and classification standards:
   - `review-dimensions.md`
   - `issue-classification.md`
   - `quality-standards.md`
2. Read the templates from `$SKILL_DIR/templates/`:
   - `review-report.md`
   - `issue-template.md`

## Steps

1. **Setup**: Create a scratchpad directory for outputs:
   ```bash
   mkdir -p ".workflow/.scratchpad/review-code-$(date +%Y%m%d%H%M%S)/findings"
   ```
2. **Collect Context**: Analyze the target `$ARGUMENTS` to identify the technology stack, language, and core files. Write findings to `context.json` in the scratchpad.
3. **Quick Scan**: Perform a quick structural scan to identify high-risk areas. Save summary to `state.json`.
4. **Deep Review**: Conduct an in-depth review for each dimension (Correctness, Readability, Performance, Security, Testing, Architecture). Log structured findings into the `findings/` directory. Use tools like `mcp__ide__getDiagnostics` if applicable.
5. **Generate Report**: Compile all findings. Use the `review-report.md` template to generate the final structured review report at `<scratchpad>/review-report.md`.
6. **Complete**: Complete the review by outputting a brief summary to the user (in Chinese or English), highlighting Critical and High severity issues.

## Error Handling

- If `$ARGUMENTS` is empty or invalid, try to run a review on the current workspace. If the workspace is too large, ask the user to specify a target directory or file.
- If necessary specification files are missing from `$SKILL_DIR/specs/`, warn the user and attempt to infer standard review dimensions.
