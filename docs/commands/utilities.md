# Standalone Utility Commands

General-purpose commands available at the root command level, not tied to a specific workflow family.

## Commands

### `enhance-prompt`

**Description**: Transform user prompts into actionable specifications using session memory and intent analysis.
**Usage**: `/enhance-prompt "user input to enhance"`

Applies a 3-stage enhancement pipeline: Intent Translation, Context Integration, and Structured Output. Translates ambiguous verbs ("fix", "improve", "add", "refactor") into precise technical specifications by leveraging session memory, conversation history, and implicit technical requirements.

### `version`

**Description**: Display version information and check for updates.
**Usage**: `/version`

Checks local (`./.claude/version.json`) and global (`~/.claude/version.json`) installation versions, fetches the latest release from GitHub, and provides upgrade suggestions when newer versions are available.

## Examples

```bash
# Enhance a vague request into a detailed specification
/enhance-prompt "fix the login page"

# Check current version and available updates
/version
```

## Notes

- `enhance-prompt` works best when session memory contains relevant project context.
- `version` requires network access to check for remote updates via GitHub API.
