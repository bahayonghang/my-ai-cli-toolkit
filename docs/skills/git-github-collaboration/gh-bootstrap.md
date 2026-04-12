# GitHub Bootstrap

Bootstrap GitHub repository configuration from vetted upstream templates instead of writing files from memory.

## Overview

`gh-bootstrap` now ships a runtime helper script that handles the repetitive execution pieces:

```bash
python content/skills/git-github-collaboration/gh-bootstrap/scripts/gh_bootstrap_runtime.py detect .
python content/skills/git-github-collaboration/gh-bootstrap/scripts/gh_bootstrap_runtime.py fetch-template <repo-url> .gh-bootstrap-cache/template
python content/skills/git-github-collaboration/gh-bootstrap/scripts/gh_bootstrap_runtime.py render-template <template> <output> --var projectName=my-project
python content/skills/git-github-collaboration/gh-bootstrap/scripts/gh_bootstrap_runtime.py validate-tree .
```

## Workflow

1. Detect languages, frameworks, and existing `.github` files.
2. Read `specs/template-catalog.md` to choose the correct upstream template source.
3. Clone the selected template repository.
4. Render the chosen template file with explicit placeholder replacement.
5. Validate the target tree and stop if any `{{placeholder}}` remains.

## Rules

- Never write CI, issue, PR, or repository config from memory.
- Keep `phases/` and `specs/` as guidance and source-of-truth references.
- Use the runtime helper for detection, clone, rendering, and post-render validation.

## RTK Fast Path

If `rtk` is installed, use it for repo scanning, template inspection, and diff review. Keep template download and file rendering on the raw script path.
