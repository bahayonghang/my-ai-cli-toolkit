# PR #8 and Tessl Rescan Findings

## PR #8 Evidence

- PR: `https://github.com/bahayonghang/my-claude-code-settings/pull/8`
- Title: `feat(skills): improve skill review scores for 5 skills`
- Author: `rohan-tessl`
- State: open
- GitHub mergeability: `CONFLICTING`
- Base: `main` at `447e45607c2c2fff793a5a055ab100723e41fa13`
- Head: `6652f48d15eb3ba573e7da3dc7ad8f96368bacda`
- Author-stated tool: `tessl skill review`
- Author-stated scope: 5 lowest-scoring skills from the old scan.

Local PR ref was fetched with:

```powershell
git fetch origin refs/pull/8/head:refs/remotes/origin/pr/8
```

Local diff evidence:

```text
M content/skills/academic-skills/paper-replication/SKILL.md
M content/skills/ai-llm-skills/codex/SKILL.md
M content/skills/ai-llm-skills/gemini-image/SKILL.md
M content/skills/ai-llm-skills/gemini/SKILL.md
M content/skills/document-skills/touying/SKILL.md
```

Diff stat:

```text
5 files changed, 25 insertions(+), 43 deletions(-)
```

Current repository evidence:

- `content/` does not exist on current `main`.
- Current installable skills live under `skills/<category>/<skill-name>/SKILL.md`.
- Current `rg --files skills -g 'SKILL.md'` count: 27.
- Current categories:
  - `developer-tools-integrations`
  - `development-workflows`
  - `docs-writing-publishing`
  - `git-github-collaboration`
  - `research-learning-knowledge`

Conclusion: PR #8 is stale relative to the current architecture. It modifies paths that no longer exist and should not be merged as-is.

## Tessl CLI Rescan

Installed/transient CLI:

```powershell
npx -y @tessl/cli --version
# 0.82.0
```

Help confirms the relevant command:

```text
tessl skill review [--json] [--optimize] [--max-iterations count] [--skill name] [--yes] [--threshold score] [<path-or-url>]
```

Important safety note: only `--json` was used. `--optimize` was not used because it edits skill files.

Attempting a catalog-level scan failed:

```powershell
npx -y @tessl/cli skill review --json skills
# SKILL.md not found at: D:/Documents/Code/Agents/my-claude-code-settings/skills/SKILL.md
```

Tessl CLI treats the argument as a single skill directory or `SKILL.md`, not as a nested catalog root. The rescan therefore ran one command per current skill directory.

Artifacts:

- Raw per-skill JSON: `research/tessl-review-json/*.json`
- Raw per-skill stderr: `research/tessl-review-json/*.stderr.txt`
- Initial command summary: `research/tessl-review-summary.json`
- Normalized summary: `research/tessl-review-normalized-summary.json`

## Rescan Results

27 current skills were reviewed.

- 16 skills completed deterministic validation and received full Tessl LLM judge results.
- 11 skills failed deterministic validation and received a score of 17 because the LLM judge was skipped.
- All 11 deterministic failures share the same blocker: Tessl requires `allowed-tools` to be a string, but these files use a YAML array/object shape.
- Tessl warns on all 27 skills that this repository's top-level `category`, `tags`, and `version` keys are unknown. This conflicts with this repository's own documented frontmatter contract.

Blocking deterministic failures:

| Skill | Tessl Score | Blocker |
|---|---:|---|
| `agents-md-improver` | 17 | `allowed-tools` must be a string, got object |
| `archive-planning` | 17 | `allowed-tools` must be a string, got object |
| `claude-md-improver` | 17 | `allowed-tools` must be a string, got object |
| `codex-workflow-recommender` | 17 | `allowed-tools` must be a string, got object |
| `html-artifact` | 17 | `allowed-tools` must be a string, got object |
| `beautiful-mermaid-editor` | 17 | `allowed-tools` must be a string, got object |
| `touying` | 17 | `allowed-tools` must be a string, got object |
| `gh-address-comments` | 17 | `allowed-tools` must be a string, got object |
| `gh-bootstrap` | 17 | `allowed-tools` must be a string, got object |
| `gh-fix-ci` | 17 | `allowed-tools` must be a string, got object |
| `git-commit` | 17 | `allowed-tools` must be a string, got object |

Lowest successful scores:

| Skill | Tessl Score | Main Tessl feedback |
|---|---:|---|
| `codex-dynamic-workflows` | 75 | Description lacks a clear "what this does" statement; content is useful but verbose and references unavailable bundle files. |
| `bidwriter` | 80 | Needs more concrete actions/examples and referenced support files. |
| `document-writer` | 80 | Needs concrete examples and clearer relationship between inline workflow and referenced files. |
| `deep-research-pro` | 82 | Needs concrete tool invocation examples; metadata shape gets Tessl warnings. |
| `code-refactor` | 83 | Strong description; content could add executable examples and trim generic guidance. |
| `geju` | 86 | Good trigger boundaries; has a dangling `references/output-template.md` reference. |
| `goudi` | 86 | Good workflow; has a dangling `references/output-template.md` reference. |

Highest successful score:

- `paper-workbench`: 98.

## Repository Validator Cross-Check

Command:

```powershell
just skills-check
```

Result:

- All 27 current skills passed the repository validator.
- Only warning: `deep-research-pro` has unexpected frontmatter key `homepage`.

This means Tessl's deterministic validator is not identical to this repository's contract. Tessl's comments are useful review signals, but its pass/fail and score must be interpreted against local repo rules before making changes.

## Recommendation

Do not merge PR #8 as-is. It targets removed `content/skills/...` paths and was based on an older repository architecture.

Use the current Tessl rescan as fresh input instead:

1. First decide whether this repo wants to conform `allowed-tools` to Tessl's string-only expectation. This could raise 11 scores from deterministic-failure 17 to judgeable, but it may affect runtime/frontmatter compatibility and should be checked against local consumers.
2. Fix genuine stale references that Tessl found, especially missing `references/output-template.md` in `geju` and `goudi`.
3. Consider targeted improvements for the lowest successful scores: `codex-dynamic-workflows`, `bidwriter`, `document-writer`, `deep-research-pro`, and `code-refactor`.
4. Keep `category`, `tags`, and `version` unless the repository frontmatter contract changes, because local `skills/AGENTS.md` requires them as applicable.
