Execute the Slint GUI development task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the GUI component or application.
2. Read `$SKILL_DIR/references/SLINT_GUIDE.md` for core concepts, layout systems, styling, and animations.
3. Review `$SKILL_DIR/GETTING_STARTED.md` and `$SKILL_DIR/DOC.md` if further context is needed.
4. If the user wants to start a new project, use the templates from `$SKILL_DIR/templates/`.
5. Implement the required UI components and associated Rust logic based on the user's prompt.
6. Verify the UI handles cross-platform requirements if specified.

## Examples

**User Request:** "Create a simple login form with Slint."
**Response Strategy:** Generate a .slint file using VerticalLayout, TextInput for username and password, and a Button for submit. Include property bindings for the fields.

## Troubleshooting

- If a component fails to render, verify that the bindings between Rust ModelRc and Slint properties are correctly set up.
- If performance issues are observed, ensure `ListView` is used for long lists and heavy property animations are optimized.
