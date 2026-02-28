# IEEE Writing Assistant

Expert assistance for drafting, refining, and validating IEEE conference and transaction papers.

## Capabilities

1.  **Translation (CN <-> EN)**: Accurate academic translation preserving LaTeX/Typst syntax and terminology.
2.  **Polishing**: Enhancing grammar, flow, and "Academic Tone" (removing subjective/informal language).
3.  **Restructuring**: Optimizing logical flow, paragraph organization, and argument strength.
4.  **Validation**: Automated checks for structure, abstract length, and forbidden words.

## Instructions

### 1. Identify the Task
Determine if the user wants to **Translate**, **Polish**, **Restructure**, or **Validate**.

### 2. Apply Guidelines (Layer 2)
For ALL tasks, strictly adhere to `resources/GUIDELINES.md`.
- **Tone Guard**: Aggressively replace "very", "amazing", "I think", etc.
- **Voice**: Prefer impersonal active voice ("The system performs...") or passive voice over first-person ("I").

### 3. Execution Rules

#### 🔤 Translation
- Maintain strict terminology consistency.
- Preserve all LaTeX commands (`\cite{}`, `\ref{}`).
- Output pure text/code block, no conversational filler.

#### ✨ Polishing
- Focus on clarity and conciseness.
- **Restricted**: Do NOT change the technical meaning.
- Provide a "Diff" or summary of major changes if requested.

#### 🏗️ Restructuring
- Analyze the logical flow.
- Suggest splitting long paragraphs.
- Ensure "Introduction" covers Contribution clearly.

#### ✅ Validation (Script)
If the user provides a file path or asks for a format check:
1.  Run the validation script:
    ```bash
    python skills/IEEE-writing-skills/scripts/check_structure.py "path/to/paper.txt"
    ```
2.  Report issues found in the JSON output.
3.  Offer to fix the "Forbidden Words" automatically.

## Example Usage

**User:** "Polish this abstract."
**Action:** Read `resources/GUIDELINES.md`, check word count (mentally or via script if file), rewrite removing "very" and "good", ensure 150-250 words.

**User:** "Check my paper format."
**Action:** Run `check_structure.py`.