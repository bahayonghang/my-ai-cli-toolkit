# Running the task-aware cases

Paths in [evals.json](evals.json) are relative to the skill directory. For IDs 38–54, start each case in a new empty project. Use the listed inputs under their basenames, following the case-specific setup below. Give the runner the `prompt` and the absolute skill path. Keep the assertions, fixture READMEs, browser captures and scoring notes outside the project.

| Cases | Setup and observations |
| --- | --- |
| 38–41, 54 | Use the [bindery inputs](../tests/fixtures/task-aware/first-screen/README.md). Start with an empty query or closed booking panel at scroll zero. Record the button bounds before clicking because the browser may scroll it into view. |
| 42–45 | Use the [proof desk](../tests/fixtures/task-aware/colour/README.md). In 44–45, copy the listed `control.css` into the project as `edition.css`. The page always loads that filename. Use the same initial Plate A state, then select B by keyboard. |
| 46–49 | Use the [equipment directory](../tests/fixtures/task-aware/density/README.md). At each viewport, reset the pick list and measure settled positions inside `#records`. The fixture includes the repeatable browser check. |
| 50 | Open the three listed files together as a read-only [catalog preview](../assets/reference/scandinavian/index.html) outside the empty project. End this turn after the comparison. To test the follow-up in the same conversation, say “我选刚才比较过的北欧方案。把这个选择写成项目 DESIGN.md，页面先不做。” Check the first-party provenance and that only DESIGN.md was written. |
| 51–52 | Supply the same two original PNGs as read-only artwork to each fresh project. The prompt supplies the content and controls. Compare both built pages at matched viewport, theme, selected plate and scroll position. |
| 53 | Start with an empty project. |

For read-only or no-change outcomes compare the complete file list and file bytes before and after. Render the actual edited or built project to grade its assertions. The repository's `just evals-check` validates manifest structure.
