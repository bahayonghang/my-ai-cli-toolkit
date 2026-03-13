# OpenSpec Interview — Example Walkthrough

## Scenario: Adding CSV Export to a Dashboard Application

### Phase 1 — Proposal Interview

> **User**: "interview-openspec add-csv-export"
>
> **System**: Created change `add-csv-export` at `openspec/changes/add-csv-export/`.
>
> Let's start by understanding the business motivation.

**AskUserQuestion call:**
```
questions: [
  {
    question: "What is the primary business driver for CSV export?",
    header: "Motivation",
    options: [
      { label: "Compliance", description: "Regulatory requirement to export audit data" },
      { label: "User request", description: "Top-voted feature request from customers" },
      { label: "Internal ops", description: "Operations team needs data for offline analysis" }
    ]
  },
  {
    question: "What data needs to be exportable?",
    header: "Scope",
    options: [
      { label: "Current view", description: "Export whatever is visible on screen" },
      { label: "Full dataset", description: "Export all records matching current filters" },
      { label: "Custom selection", description: "User selects specific rows to export" }
    ]
  }
]
```

> **User selects**: "User request" + "Full dataset"
>
> **System**: Good. Since this is user-requested and covers the full dataset, let me probe the scope boundary — do we need to support datasets over 100K rows? Large exports might require async processing with download links instead of direct browser downloads.
>
> *(After 2-3 more rounds of convergent questions)*
>
> **System**: Phase 1 complete. Writing `proposal.md`...

**Generated `proposal.md`:**
```markdown
# Proposal: add-csv-export

## Why
CSV export is the #1 feature request (142 votes). Users need to extract
filtered dashboard data for offline analysis in Excel and BI tools.

## What Changes
- Add "Export CSV" button to dashboard toolbar
- Implement server-side CSV generation for datasets >10K rows
- Add export job queue with progress tracking

## Capabilities
- csv-export: Generate and download CSV files from dashboard data

## Impact
- Files: src/components/toolbar/, src/api/export/, src/workers/
- Dependencies: papaparse (new)
- Risk: medium — large exports may impact DB query performance
```

---

### Phase 2 — Specs Interview

> **System**: Now let's define the `csv-export` capability requirements. I'll ask about specific scenarios.

**AskUserQuestion call:**
```
questions: [
  {
    question: "How should column headers be determined?",
    header: "Headers",
    options: [
      { label: "Match display", description: "Use the column labels shown in the UI" },
      { label: "Raw field names", description: "Use database field names as-is" },
      { label: "User chooses", description: "Let user select which columns to include" }
    ]
  },
  {
    question: "What happens when export fails mid-way?",
    header: "Error handling",
    options: [
      { label: "Retry automatically", description: "Retry up to 3 times, then notify" },
      { label: "Partial download", description: "Deliver whatever was generated so far" },
      { label: "Clean failure", description: "Delete partial file, show error message" }
    ]
  }
]
```

> **User selects**: "User chooses" + "Clean failure"
>
> *(After scenario elicitation rounds)*
>
> **System**: Phase 2 complete. Writing `specs/csv-export/spec.md`...

**Generated `specs/csv-export/spec.md`:**
```markdown
# CSV Export

## Purpose
Allow users to export filtered dashboard data as CSV files with column selection.

## ADDED Requirements

### Column Selection
Users can choose which columns to include in the export.

**Scenarios:**
- WHEN user clicks "Export CSV", THEN a column picker dialog appears, AND all currently visible columns are pre-selected
- WHEN user deselects all columns, THEN the "Export" button is disabled, AND a hint reads "Select at least one column"

### Large Dataset Handling
Exports over 10K rows are processed asynchronously.

**Scenarios:**
- WHEN dataset has ≤10K rows, THEN CSV is generated client-side and downloaded immediately
- WHEN dataset has >10K rows, THEN a server job is queued, AND user sees a progress bar, AND a download link is provided on completion
- WHEN server job fails, THEN partial file is deleted, AND user sees an error message with retry option
```

---

### Phase 3 — Design Interview

> **System**: Let's discuss technical decisions. We have client-side vs server-side generation to decide.

*(Architecture tradeoff questions via AskUserQuestion)*

> **System**: Phase 3 complete. Writing `design.md`...

---

### Phase 4 — Tasks Interview

> **System**: Finally, let's break this into implementation tasks.

*(Task breakdown and priority questions via AskUserQuestion)*

> **System**: Phase 4 complete. Writing `tasks.md`...

---

### Completion

> **System**: All 4 artifacts created for `add-csv-export`:
> ```
> ✅ proposal.md
> ✅ specs/csv-export/spec.md
> ✅ design.md
> ✅ tasks.md
> ```
> Run `/opsx:apply` to start implementation, or `/opsx:verify` to validate artifacts.

## Best Practices

- **Context warm-up**: Provide existing project context (language/framework/middleware) before starting to avoid "vacuum architecture" speculation
- **Selective depth**: Simple CRUD features don't need full 4-phase treatment — skip to Phase 4 directly
- **Skip freely**: Tell the system "skip this phase" at any point to advance with defaults
- **Interrupt safely**: Each phase writes its artifact immediately — you can stop after any phase and resume later with `/opsx:continue`

## Phase 1.5 — Approach Proposal Example

### Scenario: Adding CSV Export (continued from above)

> **System** (after Phase 1 proposal.md is written): "Before we dive into specs, let me propose implementation approaches based on what we've discussed."

**AskUserQuestion call:**
```
questions: [
  {
    question: "Here are viable implementation approaches for CSV export:",
    header: "Approach",
    options: [
      {
        label: "A: Client-side only",
        description: "Generate CSV entirely in the browser using papaparse. Pros: simple, no server changes. Cons: fails on large datasets (>50K rows), blocks UI thread"
      },
      {
        label: "B: Hybrid (Recommended)",
        description: "Client-side for small exports (<10K rows), server-side job queue for large ones. Pros: best UX for both cases, progressive enhancement. Cons: two code paths to maintain"
      },
      {
        label: "C: Server-side only",
        description: "All exports processed on server with download links. Pros: consistent behavior, handles any size. Cons: slower for small exports, requires job queue infrastructure"
      }
    ]
  }
]
```

> **User selects**: "B: Hybrid"
>
> **System**: "Good choice. I'll add the hybrid approach to proposal.md and carry it forward into specs and design. The rejected approaches (client-only, server-only) will be documented in design.md's Alternatives Considered section."
>
> **Updated proposal.md** now includes:
> ```markdown
> ## Selected Approach
> Hybrid: Client-side generation for datasets ≤10K rows (immediate download),
> server-side job queue for larger datasets (progress tracking + download link).
> ```

## Visual Companion Offer Example

### Scenario: Dashboard UI Redesign

> **System** (after reading project context): "This project involves UI layout and component design decisions."

**AskUserQuestion call:**
```
questions: [
  {
    question: "This project involves UI design decisions. Enable the browser visual companion? It shows mockups and layout options you can click to select.",
    header: "Visual",
    options: [
      { label: "Enable", description: "Start browser companion — visual questions shown as interactive HTML mockups" },
      { label: "No thanks", description: "Discuss all questions in the terminal as text" }
    ]
  }
]
```

> **User selects**: "Enable"
>
> **System**: "Starting the visual companion server... Please open http://localhost:52341 in your browser. Visual design questions will be shown there; conceptual questions will continue in the terminal."
