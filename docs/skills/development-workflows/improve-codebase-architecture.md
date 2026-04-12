# Improve Codebase Architecture

Architecture review skill that looks for friction in module boundaries, refactoring seams, and safer interfaces.

## When to use it

- user wants to improve a subsystem or module boundary
- user asks for refactoring opportunities or architectural review
- user wants an RFC draft for a better interface or test boundary

## Core workflow

1. define the scope from the user's path, subsystem, or architectural theme
2. explore the codebase and identify friction points
3. rank a small set of candidate deepening opportunities
4. if one candidate is worth pursuing, frame the constraints and likely failure modes
5. design a few materially different interface options
6. compare them and draft an RFC when appropriate

## Output contract

- returns candidate opportunities, a recommendation, or a draft RFC
- includes trade-offs, migration shape, and test impact when proposing designs
- saves the RFC locally when the workflow reaches that stage

## Main supporting assets

- `references/deepening-guide.md`
- the skill's RFC template and evaluation heuristics
- local codebase discovery tools used during review

## Key constraints

- do not invent an RFC if no strong candidate exists
- keep the analysis inside the requested scope unless the user asks for a broader scan
- prefer observable behavior and boundary tests over internals
- do not publish to external systems unless the user explicitly asks

## Notes

- The skill is optimized for maintainer-facing architecture work.
- It favors deep modules over shallow helpers.
