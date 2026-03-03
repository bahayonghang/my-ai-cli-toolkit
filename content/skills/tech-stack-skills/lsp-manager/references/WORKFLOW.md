Execute the LSP configuration or troubleshooting task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting the user to specify their project path or language.
2. Read `$SKILL_DIR/references/WORKFLOW.md` for the overarching workflow instructions.
3. To detect the project's language, run `python $SKILL_DIR/scripts/detect_language.py <target_directory>`.
4. To check the server status, run `bash $SKILL_DIR/scripts/check_server.sh`.
5. For generating custom config, run `python $SKILL_DIR/scripts/generate_config.py <Languages...>`.
6. Read `$SKILL_DIR/references/servers.md` and `$SKILL_DIR/references/troubleshooting.md` if specific servers or troubleshooting steps are needed.

## Output

Information about the detected languages, recommended LSP plugins, or instructions for fixing integration issues.

## Error Handling

- If scripts return an error, consult `$SKILL_DIR/references/troubleshooting.md` for guidance on how to fix common problems before presenting them to the user.

