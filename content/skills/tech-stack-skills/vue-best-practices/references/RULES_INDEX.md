Execute the Vue 3 / TypeScript task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the Vue component task.
2. Read `$SKILL_DIR/references/RULES_INDEX.md` to find the relevant rule file based on your task keywords.
3. Read the specific rule file from `$SKILL_DIR/rules/<rule-file.md>` that applies to the current scenario.
4. Implement, review, or refactor the Vue component code according to the best practices described in the rule file.
5. Verify that Volar and vue-tsc type checking requirements are satisfied.

## Output

Modified or reviewed Vue code applying the specific best practices, along with a brief explanation of the rules applied.

## Examples

**User Request:** "Extract props from this imported Vue component."
**Response:** Read `rules/extract-component-props.md`. Use `ComponentProps` helper from `vue-component-type-helpers` to extract and extend the props properly.

## Troubleshooting

- If type errors persist after applying a rule, refer to `rules/volar-3-breaking-changes.md` to ensure compatibility with recent Volar updates.

