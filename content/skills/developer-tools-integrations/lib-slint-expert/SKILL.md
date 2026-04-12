---
name: lib-slint-expert
version: "1.1.0"
description: "Build native GUI applications with Slint and Rust. Use this skill when creating desktop UI, cross-platform apps, embedded UI, declarative UI components, or reusable component libraries with Slint — prefer it over generic Rust advice for any Slint UI task."
category: developer-tools-integrations
tags:
  - slint
  - rust
  - gui
  - ui-toolkit
  - cross-platform
  - native-ui
  - embedded-ui
  - declarative-ui
argument-hint: [prompt]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Execute the Slint GUI development task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the GUI component or application.
2. Read `$SKILL_DIR/references/SLINT_GUIDE.md` for core concepts, layout systems, styling, and animations.
3. If the user wants to start a new project, use the templates from `$SKILL_DIR/templates/`.
4. For additional API details or usage patterns, consult `$SKILL_DIR/docs/README.md` or `$SKILL_DIR/examples/README.md`.
5. Implement the required UI components and associated Rust logic based on the user's prompt.
6. Verify the UI handles cross-platform requirements if specified.

## Examples

**User Request:** "Create a simple login form with Slint."
**Response Strategy:** Generate a .slint file using VerticalLayout, TextInput for username and password, and a Button for submit. Include property bindings for the fields.

## Troubleshooting

- If a component fails to render, verify that the bindings between Rust ModelRc and Slint properties are correctly set up.
- If performance issues are observed, ensure `ListView` is used for long lists and heavy property animations are optimized.
