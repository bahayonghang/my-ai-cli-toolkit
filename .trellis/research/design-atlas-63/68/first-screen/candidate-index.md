Readers can look up a binding technique on the first screen. **Search notes** starts 166 px from the top on both desktop and mobile, and all three instructions are fully visible before scrolling. Typing `AWL sewing` leaves only **Pierce the sewing holes**, which confirms that a reader can combine a tool name from the instruction with an operation from its heading.

**Audit result:** No changes recommended. The design-atlas scans of `index.html` and its linked stylesheet reported **0 Floor failures, 0 House failures, 0 Reflex findings, and 0 warnings**. No waivers were used or rejected. The project was left unchanged.

### First-screen checklist

| Checklist IDs | Result | Location and evidence |
|---|---|---|
| **44b** | Pass | At scroll position 0, `#query` starts at x=304 on the 1280 × 800 screen and x=32 on the 390 × 844 screen. Tab focuses it first. The last note ends at y=615 and y=696 respectively. |
| **8, 3, 9** | Pass | The reading order is search → result count → three notes. Each bold heading sits with its instruction. Spacing and a fine rule separate it from the next technique. |
| **46a, 54, 69, DA2** | Pass | “Bindery notebook” identifies the collection. “Search notes” remains visible while typing. The count appears once and accurately changes from `3 notes` to `1 note`, then `0 notes` for an unmatched query. Clearing the field restores all three. |
| **40, 65** | Pass | Near-black text on ivory measures **14.66:1**. The keyboard focus outline against ivory measures **8.26:1**. The palette and Georgia type follow `DESIGN.md`. |
| **73, F26, DA3** | Pass | Headings and instructions remain readable without overlap at the tested widths. At 375 and 1280 px, no instruction ends with a single word on its last line. |
| **F4, F21, F23, DA1, DA5** | Pass | Search is immediately available without a competing action. One `h1` introduces three `h2` technique headings. Each instruction adds a practical detail. The page declares its language, title, and description. |
| **11, 29, 38iii, 47c, 66, DA6, DA7** | Pass | The notes are static live text. No misleading hover effect, decorative motion, highlighted heading fragment, or simulated object interrupts reading. |
| **6b, 58, 63, 70, 84, 85, 41, 49a, 68, 76, 80, 83, DA4, DA8** | N/A | This lookup page has no hero, promotional section, middle-dot labels, submission form, product preview, signup, filled button, dark panel, primary navigation, imagery, icons, or nested rounded components. |

**Keep** the visible search label, live result count, and full instructions in their current order. With three entries, readers can scan the whole notebook or filter by tool without opening another view. Search and keyboard focus were exercised in headless Edge. Screen-reader announcements were not tested.