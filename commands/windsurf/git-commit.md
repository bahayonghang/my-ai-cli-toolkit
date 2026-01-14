# Git Commit

Generate a well-structured git commit based on the current changes.

## Description

Analyzes staged changes and generates a commit message following Conventional Commits format.

## Steps

1. Run `git status` and `git diff --staged` to understand the current changes.
2. If no changes are staged, run `git diff` to see unstaged changes and suggest which files to stage.
3. Analyze the changes and generate a commit message following the Conventional Commits format:
   - `feat`: A new feature
   - `fix`: A bug fix
   - `docs`: Documentation only changes
   - `style`: Changes that do not affect the meaning of the code
   - `refactor`: A code change that neither fixes a bug nor adds a feature
   - `perf`: A code change that improves performance
   - `test`: Adding missing tests or correcting existing tests
   - `chore`: Changes to the build process or auxiliary tools
4. Format the commit message as:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
5. Show the proposed commit command for approval.
