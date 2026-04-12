# Word

Single-word English mastery skill that deconstructs one word into semantic image, usage map, confusion points, and a memorable closing line.

## When to use it

- user asks to explain a specific English word
- user wants deeper meaning and usage, not just a translation
- user wants a vocabulary breakdown that can actually help them use the word

## Core workflow

1. normalize the target word and anchor the common modern sense
2. recover the original image and core semantic formula
3. explain how the deeper sense shows up in modern usage
4. add a usage map with contexts, collocations, and register
5. compare the word against nearby confusing words or common traps
6. end with a bilingual one-line epiphany

## Output contract

- produces Markdown directly in the conversation
- follows the skill's fixed multi-part structure
- covers meaning, usage, and confusion points rather than a dictionary dump

## Main supporting assets

- the output structure described in `SKILL.md`
- the word's etymology and image-based semantic framing

## Key constraints

- the goal is mastery, not mere translation
- keep the explanation vivid and specific
- do not flatten the word into a single Chinese gloss when the meaning is broader
- do not use this skill for phrases or multiple words at once

## Notes

- This skill is designed for one-word deep dives.
- Multi-word card workflows should go to `word-flow`.
