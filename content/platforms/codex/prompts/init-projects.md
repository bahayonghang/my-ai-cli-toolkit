---
description: Initialize Codex project context, generate/update root-level and subdirectory AGENTS.md guidance
allowed-tools: Read(**), Write(AGENTS.md, **/AGENTS.md)
argument-hint: <PROJECT_SUMMARY_OR_NAME>
---

## Usage

`/init-project <PROJECT_SUMMARY_OR_NAME>`

## Objective

Initialize Codex project guidance using a mixed strategy of "concise at root + scoped detail in subdirectories":

- Generate/update root-level `AGENTS.md` with repository-wide guidance: project purpose, architecture overview, module map, global commands, coding standards, testing gates, and safety boundaries.
- Generate/update local `AGENTS.md` files in meaningful subdirectories when scoped guidance would help future Codex agents: module responsibilities, entry points, dependencies, tests, generated artifacts, and local conventions.
- Preserve Codex `AGENTS.md` semantics: a file governs its own directory and all descendants until a deeper `AGENTS.md` adds or overrides guidance.
- For readability, add a Mermaid structure diagram in the root `AGENTS.md` when it helps and add breadcrumbs in each subdirectory `AGENTS.md` so agents can navigate back to the root and sibling modules.

## Orchestration Instructions

**Step 1**: Obtain the current timestamp using the available local time/date tool or shell command.

**Step 2**: Analyze the repository directly or delegate one bounded architecture/indexing pass to an appropriate Codex sub-agent when that improves throughput, with input:

- `project_summary`: $ARGUMENTS
- `current_timestamp`: (timestamp from step 1)

## Execution Strategy (Agent adapts automatically, no user parameters needed)

- **Stage A: Repository Census (Lightweight)**
  Quickly count files and directories, read existing root/subdirectory `AGENTS.md` files, and identify module roots (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `apps/*`, `packages/*`, `services/*`, etc.).
- **Stage B: Module Priority Scanning (Medium)**
  For each module, perform targeted reading and sampling of "entry/interfaces/dependencies/tests/data models/quality tools".
- **Stage C: Deep Supplementation (As Needed)**
  If repository is small or module scale is small, expand reading scope; if large, perform batch supplemental scanning on high-risk/high-value paths.
- **Stage D: Guidance Placement**
  Keep root guidance short and global. Create subdirectory `AGENTS.md` files only where the subtree has distinct commands, conventions, architecture, generated files, safety rules, or ownership boundaries.
- **Coverage Measurement and Resumability**
  Output "scanned files / estimated total files, covered module ratio, ignored/skipped reasons" and list "recommended next-step deep-dive sub-paths". When running `/init-project` repeatedly, perform **incremental updates** and **breakpoint resumable scanning** based on previous index.

## Security and Boundaries

- Only read/write `AGENTS.md` documentation files; do not modify source code, package metadata, generated artifacts, or runtime configuration.
- Preserve existing human guidance. Merge updates into existing `AGENTS.md` files instead of replacing them wholesale unless the file is clearly generated and obsolete.
- Do not duplicate root guidance into every module. Put global rules at root and local rules in the narrowest applicable subdirectory.
- If a subdirectory already has stronger or more specific guidance, keep it and clarify how it relates to the root file.
- Ignore common generated artifacts and binary large files by default.
- Print "summary" in main dialog, write full content to repository.

## Output Requirements

- Print "Initialization Result Summary" in main dialog, including:
  - Whether root-level `AGENTS.md` was created/updated, major section overview.
  - Number of identified modules and their path list.
  - Generation/update status of each subdirectory `AGENTS.md`.
  - Explicitly mention whether a Mermaid structure diagram was generated and how many subdirectory files received navigation breadcrumbs.
  - Coverage and major gaps.
  - If not fully read: explain "why stopped here" and list **recommended next steps** (e.g., "suggest priority supplemental scanning: packages/auth/src/controllers").
