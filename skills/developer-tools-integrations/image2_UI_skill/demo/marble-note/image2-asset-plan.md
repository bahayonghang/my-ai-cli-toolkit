# Marble Note Image2 Asset Plan

This demo is currently a clickable code/SVG/CSS structure replica. No real image2 bitmap output is claimed because this environment does not expose a confirmed project image2 entrypoint.

## Code-rendered UI

- iOS phone frames, status bars, Dynamic Island, buttons, folder chips, cards, document text, bottom toolbars, and click states.
- All readable copy remains selectable HTML text.
- The current hand-drawn marks are inline SVG/CSS placeholders so the page can run offline.

## Pending image2 assets

| id | UI area | target path | size | image2 prompt |
| --- | --- | --- | --- | --- |
| cover-doodles | Left cover hero doodles: flower, pencil, paper plane, stickers, ruled paper texture | `assets/generated/cover-doodles.png` | 900x1500 transparent PNG | Hand-drawn creative notebook cover doodle set, chunky blue marker flower with yellow scribble fill, black outlined pencil, pink paper plane, small pastel alphabet stickers, playful scanned marker texture, transparent background, no text, no logo, no UI chrome. |
| home-card-doodles | Center home screen folder and recent-note doodles | `assets/generated/home-card-doodles.png` | 900x1200 transparent PNG | Cute productivity notebook doodle asset sheet, rounded folder tab sketch, simple cloud schedule mascot, small star and smiley marks, blue yellow lilac mint palette, marker and crayon line texture, transparent background, no readable text, no UI controls. |
| meeting-signature | Right document screen blue signature stroke | `assets/generated/meeting-signature.png` | 900x420 transparent PNG | Loose blue marker signature scribble, one continuous expressive stroke, thick ink with slight pressure variation, transparent background, no letters, no watermark. |
| paper-texture | Subtle notebook paper background lines for the cover screen | `assets/generated/paper-texture.png` | 900x1600 PNG | Warm off-white notebook paper texture with soft lavender diagonal ruled lines, faint scan grain, clean minimal surface, no text, no shadows, seamless enough for app background. |

## Integration notes

- Keep titles, paragraphs, buttons, folder names, and meeting notes as HTML text.
- Place generated transparent assets inside the existing phone screens with fixed dimensions and `pointer-events: none`.
- After image2 is available, rerun `validate.ps1`, regenerate screenshots, and update this file with actual generated paths.
