# First-screen cases

Copy the listed inputs into a clean temporary project for each run. Open HTML directly in a browser. Give the agent only the request and the project inputs. Keep reports and screenshots outside that project. For a mechanical scan, target the specific input or newly built page and its stylesheet. Start each observation at 1280 × 800, 100% zoom, scroll position zero, with an empty query or a closed booking panel. Record the viewport and the visible controls before interacting (browser automation may scroll to click).

| Run | Project inputs | Request |
| --- | --- | --- |
| Index audit | DESIGN.md, notebook.css, index.html | Audit index.html for me. Readers look up binding techniques here. Please include the checklist IDs for the first screen and keep the project as it is. |
| Workshop audit | DESIGN.md, notebook.css, workshop.html | Audit workshop.html. Visitors use this local preview to start a seat reservation and choose a quantity. Tell me where the page gets in their way and leave the files as they are. |
| Workshop restyle | DESIGN.md, notebook.css, workshop.html | Polish workshop.html so visitors can start a reservation more easily. Keep the bindery’s design and the existing booking flow. |
| Index build | DESIGN.md, notebook.css, index.html | Build tools.html from our existing DESIGN.md. Make a searchable tool index using the bone folder and awl from the bench notes. Include each tool’s technique so readers can look it up. |

## Observable results

- Index audit identifies the label, search field and readable entries in the first screen. Entering `awl` leaves “Pierce the sewing holes” and its instructions. Clearing the field restores all three entries in order. Hero composition is inapplicable because readers search or read directly. Zero filled primary buttons is acceptable. Preserve the hierarchy. Compare the project's file list and bytes before and after both audits.
- Workshop audit locates 44b at `#reserve` below `.introduction`. Record button bounds before scrolling and compare with the viewport. The button works after scrolling and opens “Seat reservation”. Report the visibility failure as open.
- Restyle starts from that same displaced button. At the same size and initial state the entire “Reserve a seat” control must be visible and operable before scrolling. Activate it, inspect the seat-count field and disclosure, and compare the price, schedule, type, colours and column with the original. A fixed result includes the actual retest.
- Build opens a new page using the notebook’s ivory, oxblood and Georgia hierarchy. A reader can find the awl and its piercing technique, then clear the query to recover the bone folder. Preserve the existing pages and design contract. No conversion action is needed.

If a target cannot run, mark the missing visibility or interaction observation unverified. A source scan or a valid case manifest cannot establish it.

## Fixture observations

Measured in headless Edge with Playwright at 1280 × 800 CSS pixels and initial scrollY 0. These measurements exercise the supplied inputs and a manually corrected temporary copy. Fresh skill outputs are a separate comparison.

| Gate and location | Observed result |
| --- | --- |
| Index 44b, `#query` and `article` | pass — search began at y=166 and all three entries ended by y=615. Searching for `awl` left the piercing note. Clearing restored three entries. |
| Index 6b, `main` | n/a: the reader starts in the searchable bench notes. There is no hero composition. |
| Index F4, `main` | pass — the search field filters directly. There are zero filled primary buttons. |
| Workshop 44b, `#reserve` | fail: the button occupied y=876–915 below an 800px viewport. Clicking after scrolling opened the seat field. |
| Temporary workshop correction, `.introduction` and `#reserve` | fixed: removing the viewport-height minimum put the button at y=232–270. With the same schedule, price and closed panel, pressing Enter on the button focused the seat field and revealed the preview disclosure at scrollY 0. |

File names and SHA-256 digests matched before and after the browser checks on the source fixtures. Scanning each HTML input together with `notebook.css` returned zero mechanical findings on both inputs.
