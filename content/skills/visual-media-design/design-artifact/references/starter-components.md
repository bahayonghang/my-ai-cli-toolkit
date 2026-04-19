# Starter Components

Load this reference when one of the shipped templates clearly saves time or prevents brittle hand-rolled scaffolding.

Skip it when a simple standalone HTML page is enough.

## Copy Flow

Use the lightest path available in the host:

```bash
cp "$SKILL_DIR/templates/<template-file>" ./<template-file>
```

Or read the template and write a customized copy into the working directory.

These templates are starter scaffolds, not final designs. Customize them to match the artifact instead of leaving the default styling untouched.

## JSX Templates

`design_canvas.jsx`, `browser_window.jsx`, `ios_frame.jsx`, and `animations.jsx` use inline React plus Babel. If you use any of them, include these exact script tags:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

Do not use generic `const styles = {}` names across multiple Babel files. Give each style object a specific name.

## Template Catalog

| Template | Use it for | What it solves |
| --- | --- | --- |
| `design_canvas.jsx` | comparative exploration | labeled multi-direction grid inside one artifact |
| `browser_window.jsx` | desktop product or page framing | browser chrome and viewport framing |
| `ios_frame.jsx` | mobile concepts | phone framing and status-bar shell |
| `deck_stage.js` | HTML deck or storyboard | slide scaling, navigation, labeling, print-friendly slide shell |
| `animations.jsx` | motion demo | timeline, scrubber, play/pause, and timing helpers |

## Template Notes

### `design_canvas.jsx`

- Best for 2-4 directions in one artifact
- Label each direction clearly
- Use it for structure comparisons, not just cosmetic variants

### `browser_window.jsx`

- Good for desktop product concepts and framed landing pages
- Do not leave the default URL untouched; update the framing details to match the artifact

### `ios_frame.jsx`

- Best when the mobile context itself matters
- Customize the content density so it reads like a real app screen, not a mini website inside a phone shell

### `deck_stage.js`

- Use for any slide or storyboard artifact
- Each slide should be a direct child `<section>` inside `<deck-stage>`
- Keep controls outside the slide canvas so they stay usable at smaller viewport sizes

### `animations.jsx`

- Use for timed demos, animated reveals, and motion studies
- Prefer a small number of clear animated moments over many decorative ones
- Persist the timeline position so the artifact is easy to revisit during iteration
