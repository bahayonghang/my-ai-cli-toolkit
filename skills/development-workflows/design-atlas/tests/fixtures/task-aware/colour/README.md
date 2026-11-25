# Two-ink proof desk

Open `project/index.html` locally. For each run, copy `project/` to a new directory. To prepare the expressive control, replace the copy's `edition.css` with `control.css`. The two editions have the same task, contract, content, markup and interaction. Give the runner only the prepared copy and the request. Scan that project's HTML and CSS. Record audit output outside the project.

**Audit request** — “Audit our proof desk before the next print run. Can a printer read the ink order, choose a plate and see the revision notice? Keep the Nightjar Press look. Report what you find without editing the page.”

**Restyle request** — “Polish our proof desk for the next print run. Keep the Nightjar Press look and the job details. Make the ink order, plate selection and revision notice clear. If an area already works, leave it alone.”

| Edition | Observable outcome |
| --- | --- |
| Supplied project | In the key, B's dot is the same yellow as A's square, while the second pass is lilac. The shapes remain distinct. The revision notice is present but faint against its plum panel. The heavy yellow top rule serves no data or control role. Audit locates all three and leaves the input unchanged. Restyle repairs the key and notice, and may quiet the rule without replacing the shared yellow. |
| Expressive control | B's lilac dot matches the middle pass. The revision notice is readable. Repeated marigold links the press signature and plate A; the selected radio also uses it. Keep those choices, the plum surface, the lilac and square/circle cues. An audit can pass these uses and a restyle can finish without a colour change. |

At the same viewport and scroll position, Tab into the radio group, then press ArrowRight. B must become checked, retain a visible focus indicator and show the Iris mixing note. Compare the actual disclosure foreground/background and the checked label's pair on both editions and after restyle. Compare the signature, legend and passes independently of the decorative border. A static scanner result alone cannot answer these questions.

To repeat the browser measurements from any project, substitute the installed skill's absolute path for `<skill-dir>`. Use the directory containing the prepared `index.html` as `<project-copy>`. With Playwright, Chromium and Pillow available, run:

```text
python "<skill-dir>/tests/fixtures/task-aware/colour/measure_proof.py" "<project-copy>" "<external-output-dir>" --check-clear
```

Use `--channel msedge` for an installed Edge. The check prints computed styles and composited pixels, saves a screenshot with B selected at each width, and exits nonzero on the broken input.
