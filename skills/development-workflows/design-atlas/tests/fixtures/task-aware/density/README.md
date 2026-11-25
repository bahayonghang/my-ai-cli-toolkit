# Equipment directory

Open `cards.html` or `comparison.html` directly. Each uses the same 24 fictional instruments, prices, depots, Inspect and Pick actions, and `DESIGN.md`. For an isolated run, copy the chosen HTML, `directory.js`, `directory.css` and `DESIGN.md` into an empty folder. Scan that folder. Run an audit there with output outside it, or restyle a temporary copy.

## User requests and expected observations

- **Audit either input.** “用 design-atlas 审查这个设备租借目录。值班人员要比较各设备的地点、日租和操作，请指出需要改的地方，也说明哪些可以保留。只出报告，页面保持原样。”
- **Restyle the inefficient input.** “用 design-atlas 改一下这个设备租借目录。值班人员需要快速比较设备、查看详情并挑选器材。保留现有设计语言、数据和操作，说明改动前后在桌面和窄屏上的差别。”
- **Conditional restyle of the control.** “用 design-atlas 检查并在需要时调整目录的行距和操作分组。值班人员要对比同类设备、看清每个按钮属于哪台设备。已经合适的布局请原样保留。保持现有数据、文字和行为。”

In `cards.html`, compare the first pair of instruments. The first Inspect/Pick pair sits closer to the *next* title than to its own details. A colour-only fix that leaves that ambiguity fails. Accept tighter grouping, rows or another readable structure. The user should see the density tradeoff and retain the data and both actions.

In `comparison.html`, headings, depots, daily rates and controls align within ruled rows; the stack of buttons stays inside its row at narrow widths. A report can pass that composition and retain it unchanged even when a screen contains over 80 words. Audit reports current observations only. Keep the full prices, depot labels, equipment IDs and accessible action names.

## Repeat the browser observation

Use a Python environment with Playwright and Chromium available. From this directory run:

```sh
python measure.py cards.html
python measure.py comparison.html
```

Pass `--channel msedge` to use an installed Edge, or `--screenshots <external-directory>` for first-screen captures. For a restyle, run the same script against its edited copy. The browser check is fixture-only; the stdlib regression under `tests/test_density_samples.py` runs in normal CI.

The report identifies the input, CSS viewport, picked state, pane, actual settled offset, scroll height, complete record IDs and actions per ID. A complete record fits on both axes inside the intersection of the window and the pane’s client area; partial rows are excluded. A counted action fits, accepts pointer input at its centre and is enabled and tabbable. Per viewport (1440 × 900 and 390 × 844), it requests 0, 0 and 360 CSS pixels of scroll **inside the pane**. The two stable positions produce two observations. At each it clicks Inspect on a complete row, tabs to Pick, uses Space to pick and undo, and verifies the affected ID, state and live feedback. Read the first adjacent rows at normal size as well; a correct event handler alone cannot establish visual ownership.
