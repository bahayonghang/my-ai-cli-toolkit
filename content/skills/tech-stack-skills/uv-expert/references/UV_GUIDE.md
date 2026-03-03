Execute the `uv` related task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the desired Python project setup or dependency task.
2. Read `$SKILL_DIR/references/UV_GUIDE.md` for core `uv` commands, usage patterns, and migration guides.
3. Review the official documentation in `$SKILL_DIR/source/uv/docs/` if specific configuration details or API references are needed.
4. Execute the appropriate `uv` commands using the bash tool to accomplish the user's goal.
5. Verify the environment or dependencies have been set up correctly.

## Output

A summary of the executed `uv` commands and the final state of the project or environment.

## Examples

**User Request:** "Initialize a new Python project with pytest using uv."
**Response:** Run `uv init my-project`, `cd my-project`, and `uv add pytest --dev`. Inform the user that the project is ready.

## Troubleshooting

- If cache corruption occurs, run `uv cache clean` as described in the guide.
- If there are Python version conflicts, use `uv python pin` to set the correct version.
