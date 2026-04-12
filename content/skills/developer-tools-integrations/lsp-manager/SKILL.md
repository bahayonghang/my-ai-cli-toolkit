---
name: lsp-manager
version: "1.1.0"
description: "Detect project languages, configure LSP servers, and troubleshoot language-server integration. Use this skill when setting up code intelligence, autocomplete, type checking, IDE integration, or diagnosing LSP failures — prefer it over manual config for any language-server task."
category: developer-tools-integrations
tags:
  - lsp
  - language-server
  - code-intelligence
  - diagnostics
  - configuration
  - troubleshooting
  - ide-integration
  - autocomplete
argument-hint: [prompt]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Execute the LSP configuration or troubleshooting task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting the user to specify their project path or language.
2. To detect the project's language, run `python $SKILL_DIR/scripts/detect_language.py <target_directory>`.
3. To check installed language servers, run `python $SKILL_DIR/scripts/check_server.py`.
4. For generating custom config, run `python $SKILL_DIR/scripts/generate_config.py <Languages...>`.
5. Read `$SKILL_DIR/references/servers.md` and `$SKILL_DIR/references/troubleshooting.md` if specific servers or troubleshooting steps are needed.

## Output

Information about the detected languages, recommended LSP servers, or instructions for fixing integration issues.

## Error Handling

- If scripts return an error, consult `$SKILL_DIR/references/troubleshooting.md` for guidance on how to fix common problems before presenting them to the user.
