# Workflow Guidance

## 1. Understand the product task

Start from the user's goal, not from a visual trope.

Capture:

- who the user is
- what they are trying to do
- what success looks like in the prototype
- which parts need to feel interactive versus merely visible

## 2. Ground in real context

If the user gives:

- screenshots
- code paths
- component files
- tokens
- copy
- product notes

read them before inventing anything. Reuse the product vocabulary you find there.

## 3. Lock the artifact mode

Pick one of the artifact modes before writing:

- concept screen
- flow prototype
- interactive demo
- comparative exploration

This prevents a vague “nice-looking HTML page” from drifting away from the user's actual need.

## 4. Design around tasks and states

A product prototype should show how the interface behaves for a user goal.

Include only the states that make the concept easier to understand:

- empty
- loading
- populated
- selected
- validation / error
- success / completion

You do not need all of them. Use only the states that clarify the idea.

## 5. Keep the artifact implementation-simple

Default to:

- one standalone HTML file
- inline CSS
- light inline JavaScript

Only split files when the prototype becomes hard to read or maintain as one document.

## 6. Prefer believable content over filler

Use concise, concrete UI copy. Avoid placeholder slop like:

- “Lorem ipsum”
- meaningless KPIs
- generic testimonials
- fake enterprise logos
- decorative feature grids unrelated to the workflow

If the user did not provide real content, invent only the minimum realistic copy needed to make the task understandable.

## 7. Close with explicit assumptions

When returning the artifact, state:

- what you assumed
- what context you used
- why you chose this prototype mode

This makes the artifact easier to iterate on in the next turn.
