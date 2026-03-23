# Paper Interpretation Flow

Combined paper workflow skill that reads one or more papers and then turns each result into a visual card.

## When to use it

- user wants both a paper interpretation and a card for the same source
- user provides multiple papers and wants them processed together
- user says they want a paper flow, paper cards, or a read-then-render workflow

## Core workflow

1. collect all paper sources from the request
2. process each paper through the paper interpretation skill first
3. feed the generated interpretation into the card skill
4. repeat per paper, allowing multiple papers to run in parallel
5. report each paper with its interpretation path and card path

## Output contract

- for each paper, produces one interpretation note and one PNG card
- keeps the interpretation step before the card step
- returns a completion summary with paths for every artifact

## Main supporting assets

- `paper-interpretation` for the reading and explanation step
- `card` for the visual rendering step
- the flow logic embedded in `SKILL.md`

## Key constraints

- card rendering must use the interpretation output, not the raw paper
- per-paper steps are sequential even when multiple papers are processed in parallel
- each downstream skill keeps its own quality rules and output format

## Notes

- This skill is an orchestration layer, not a new analysis method.
- It exists to compress a two-step workflow into one command.
