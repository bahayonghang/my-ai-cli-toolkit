# Word Flow

Word-to-card workflow skill that analyzes one or more explicit English words and then turns each result into an infograph card.

## When to use it

- user wants both a deep word analysis and a visual output
- user provides a clear list of English vocabulary items and wants them handled together
- user asks for a word flow or word card workflow

## Core workflow

1. collect only explicitly targeted words from the user request
2. process each word through the `word` skill first
3. feed the full analysis into `card -i`
4. run multiple words in parallel when possible, while keeping each word's two steps in order
5. report the generated PNG paths at the end

## Output contract

- for each word, produces a word analysis and an infograph PNG
- keeps analysis before rendering
- returns a completion summary with each saved image path

## Main supporting assets

- `word` for the semantic analysis step
- `card -i` for the infograph rendering step
- the orchestration logic embedded in `SKILL.md`

## Key constraints

- do not treat every English token in a sentence as a target word
- render cards from the word analysis, not a raw dictionary lookup
- keep the per-word sequence stable even when multiple words are processed together
- if a card fails, report the failure instead of inventing a path

## Notes

- This skill is a workflow wrapper for compound vocabulary study.
- It depends on `word` and `card`, not the older `ljg-*` names.
