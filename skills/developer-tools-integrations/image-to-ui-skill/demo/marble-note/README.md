# Marble Note Demo

Responsive, clickable iOS-style prototype for a creative notebook mobile app.

## Run

```powershell
cd demo/marble-note
python -m http.server 4190 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4190/
```

## Interactions

- Cover -> Home via `Get started`.
- Home -> Folder via the `My Work` folder card.
- Home -> Search via the search icon or bottom navigation.
- Home -> Create note via the plus button or Daily Goals card.
- Home -> Schedule via the purple Schedule card.
- Home -> Settings via the bottom navigation.
- Folder/Search/Schedule -> Meeting note via matching note cards.
- Meeting note -> Home via the back button.
- Save on the Create page returns to the Folder page.
- Other controls show local feedback states.

## Screenshots

- `screenshots/marble-note-desktop.png`
- `screenshots/marble-note-mobile.png`

## Validate

```powershell
powershell -ExecutionPolicy Bypass -File demo/marble-note/validate.ps1
```

The validation checks page startup, screenshot creation, the cover/home/detail flow, all added logical pages (`folder`, `search`, `create`, `schedule`, `settings`), iOS frame details, local images, and broken image count.

## Asset Notes

This demo uses local code/SVG/CSS artwork placeholders. It does not claim real image2 generation because no confirmed image2 entrypoint is available in this environment.

See `image2-asset-plan.md` for the pending real image2 asset breakdown and prompts.
