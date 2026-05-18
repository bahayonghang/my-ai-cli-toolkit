# Git & GitHub Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


Git operations and GitHub integration for commits, issue fixes, and pull request reviews.

## Commands

### `commit`

**Description**: Analyze Git changes and automatically generate Conventional Commits style commit messages.
**Usage**: `/gh:commit [options]`

#### Options

| Option | Description |
|--------|-------------|
| `--no-verify` | Skip local Git hooks (`pre-commit`/`commit-msg`) |
| `--all` | Auto `git add -A` when staging area is empty |
| `--amend` | Amend the previous commit |
| `--signoff` | Add `Signed-off-by` line (DCO compliance) |
| `--emoji` | Include emoji prefix in commit message |
| `--scope <scope>` | Specify commit scope (e.g., `ui`, `docs`, `api`) |
| `--type <type>` | Force commit type (e.g., `feat`, `fix`, `docs`) |

#### How It Works

1. **Repository Validation** - Check Git repository and branch status
2. **Change Detection** - Analyze changes via `git status --porcelain` and `git diff`
3. **Split Suggestions** - Recommend splitting commits based on different concerns, types, file patterns, or size (>300 lines)
4. **Message Generation** - Create Conventional Commits format: `[<emoji>] <type>(<scope>)?: <subject>` (header <=72 chars), body with bullet points, footer with breaking changes and issue references
5. **Commit Execution** - Run `git commit` with generated message

#### Commit Types

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 📝 | `docs` | Documentation |
| 🎨 | `style` | Code style/formatting |
| ♻️ | `refactor` | Code refactoring |
| ⚡️ | `perf` | Performance improvement |
| ✅ | `test` | Tests |
| 🔧 | `chore` | Build/tooling |
| 👷 | `ci` | CI/CD |
| ⏪️ | `revert` | Revert commit |

#### Commit Message Examples

**With emoji:**
```
✨ feat(ui): add user authentication flow
🐛 fix(api): handle token refresh race condition
📝 docs: update API usage examples
```

**Without emoji:**
```
feat(ui): add user authentication flow
fix(api): handle token refresh race condition
docs: update API usage examples
```

**With body:**
```
feat(auth): add OAuth2 login flow

- implement Google and GitHub third-party login
- add user authorization callback handling
- improve login state persistence logic

Closes #42
```

**Breaking change:**
```
feat(api)!: redesign authentication API

- migrate from session-based to JWT authentication
- update all endpoint signatures
- remove deprecated login methods

BREAKING CHANGE: authentication API has been completely redesigned
```

#### Validation & Tooling

- **commitlint**: Validates commit messages against Conventional Commits rules (type-enum, subject-case, header-max-length, etc.)
- **Husky**: Git hooks integration for automatic validation on commit
- **Commitizen**: Interactive commit tool with guided type/scope/subject selection

### `fix-issue`

**Description**: Analyze and fix GitHub issues with a structured plan-create-test-PR workflow.
**Usage**: `/gh:fix-issue [issue-number]`

#### Workflow

1. **Plan** - Fetch issue details via `gh issue view`, search for related PRs and prior art, break down into manageable tasks, record plan in a scratchpad
2. **Create** - Create a new branch, implement the fix in small steps, commit after each step
3. **Test** - Write unit tests, run the full test suite, fix any failures before proceeding
4. **Open PR** - Submit a pull request and request review

All GitHub operations use the `gh` CLI.

### `review-pr`

**Description**: Expert code review for GitHub pull requests with detailed analysis.
**Usage**: `/gh:review-pr [pr-number]`

#### Workflow

1. If no PR number provided, list open PRs via `gh pr list`
2. Fetch PR details via `gh pr view`
3. Get code diff via `gh pr diff`
4. Analyze changes and post review comments via `gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments`

#### Review Focus

- Code correctness
- Project conventions compliance
- Performance impact
- Test coverage
- Security considerations

Review comments focus on suggestions and necessary changes only -- no summaries of what the PR does.

## Examples

```bash
# Analyze current changes and commit
/gh:commit

# Stage all and commit with emoji
/gh:commit --all --emoji

# Specify scope and type
/gh:commit --scope ui --type feat

# Amend last commit with sign-off
/gh:commit --amend --signoff

# Fix a specific GitHub issue
/gh:fix-issue 42

# Review a pull request
/gh:review-pr 78

# List open PRs then review
/gh:review-pr
```

## Notes

- `commit` is Git-only: no package managers or build commands are used
- `commit` respects local Git hooks by default; use `--no-verify` to skip
- `commit` is non-destructive: only writes to `.git/COMMIT_EDITMSG` and staging area
- `commit` prompts for confirmation in rebase/merge conflict or detached HEAD states
- `fix-issue` and `review-pr` require the `gh` CLI to be installed and authenticated
