# gh-bootstrap System Rules & Architecture

## Architecture Overview
1. **Phase 1: Detection**: Scan project for languages/frameworks.
2. **Phase 2: Collection**: interactive discovery via `AskUserQuestion`.
3. **Phase 3: Conflict**: Manage pre-existing files.
4. **Phase 4: Execution**: Download templates and perform variable substitution.
5. **Phase 5: Report**: Final summary.

## Critical Constraints
- **NO MEMORY GENERATION**: Must `git clone` from URLs in `specs/template-catalog.md`.
- **EXACT CLOPY**: Do not rewrite logic; only replace `{{variables}}`.
- **LANGUAGE**: Ask user for preferred communication and template language at the start.

## Output Structure
Targets `.github/workflows/`, Issue templates, PR templates, README, and LICENSE.
