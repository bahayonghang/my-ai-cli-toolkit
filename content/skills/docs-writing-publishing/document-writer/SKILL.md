---
name: document-writer
description: Write or update technical documentation from the real codebase and project files. Use whenever the user asks for README, API docs, architecture guides, user guides, CONTRIBUTING docs, migration notes, or JSDoc/code comments, and also when they want technical documentation rewritten into natural Chinese with correct terminology and formatting.
category: docs-writing-publishing
tags: [documentation, technical-writing, readme, api-docs, architecture, user-guide, contributing, jsdoc, chinese-docs]
argument-hint: [target-path-and-doc-task]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Write or update technical documentation for the target project at `$ARGUMENTS`.

## Preconditions

1. If `$ARGUMENTS` is empty, report: `Error: Please provide the target path and the documentation task (for example: './docs/api.md update the payment API docs' or './src/utils.ts add JSDoc for the public helpers').`
2. Read `$SKILL_DIR/references/WORKFLOW.md`, `$SKILL_DIR/references/DOCUMENT_TYPES.md`, and `$SKILL_DIR/references/VERIFICATION_CHECKLIST.md` before drafting.
3. If the request is in Chinese, the output file is Chinese, or the user wants polishing/rewrite into Chinese, also read `$SKILL_DIR/references/CHINESE_TECH_WRITING.md`.

## Execution Flow

### 1. Classify the task

Determine the closest document type before writing:

- `README.md` or overview docs
- API reference or endpoint documentation
- Architecture or design explanation
- User guide, operator guide, troubleshooting, FAQ
- `CONTRIBUTING`, maintenance, migration, or release notes
- JSDoc, docstrings, or code comments

Infer the type from the requested file, target path, and user request. Ask only if multiple document types would lead to materially different outputs.

### 2. Gather evidence from the codebase

Use the actual project files as the source of truth:

1. Read existing documentation first so you preserve project vocabulary and avoid duplicating stale mistakes.
2. Inspect the directory structure, entrypoints, configs, public interfaces, examples, and tests.
3. Trace important flows from input to output when documenting behavior, not just file names.
4. For API or architecture docs, verify routes, config keys, environment variables, and defaults against code.
5. For JSDoc or comments, read the concrete symbol implementation before writing anything.

### 3. Decide language, audience, and output location

1. Match the language requested by the user or already used by the surrounding docs.
2. If the task is a rewrite into Chinese, follow the Chinese writing reference instead of translating line by line.
3. Prefer updating the explicitly requested file in place.
4. If no exact file is given, use the conventional location:
   - repository root for `README.md`, `CONTRIBUTING.md`, `MIGRATION.md`
   - `docs/` for user, API, or architecture docs
   - source file for JSDoc or code comments
5. If location is still ambiguous after exploring the repo, ask one focused question.

### 4. Draft using the correct structure

1. Apply the matching template and required sections from `DOCUMENT_TYPES.md`.
2. Scale the detail to the real scope:
   - small utility or module: shorter docs, fewer sections
   - multi-component flow or public API: full structure with examples and failure cases
3. Organize around reader tasks, public interfaces, or data flow instead of mirroring the folder tree mechanically.
4. For architecture docs covering more than one component, include a Mermaid diagram unless the repo already uses another explicit format.

### 5. Generate content that can survive verification

1. Base commands, code snippets, function signatures, env vars, and config values on real files.
2. Preserve industry-standard English terms when they are clearer than forced translation.
3. In Chinese docs, prefer natural Chinese phrasing over literal translation.
4. Use `TODO:` only for facts that cannot be derived from the repo and are necessary for completeness.
5. For comments and JSDoc, document public contracts, side effects, invariants, errors, or non-obvious behavior. Do not add boilerplate comments that restate the code.

### 6. Verify before handoff

Walk through `VERIFICATION_CHECKLIST.md` and confirm:

- every important claim is backed by code, config, tests, or existing maintained docs
- examples and commands match the project layout
- links and file paths exist
- no secrets, tokens, private endpoints, or internal-only notes were leaked
- Chinese output follows the Chinese writing reference when applicable

## Rules

- Do not fabricate APIs, CLI flags, configuration defaults, performance numbers, or implementation details.
- Do not copy stale wording from old docs without checking whether the code still matches.
- Do not translate common technical terms into unnatural Chinese when the English form is the norm.
- Keep the tone concise, direct, and professional.
- Output the documentation artifact only. Avoid extra conversational explanation unless the user explicitly asks for it.
