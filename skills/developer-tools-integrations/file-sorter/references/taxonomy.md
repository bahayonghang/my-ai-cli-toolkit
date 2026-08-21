# Taxonomy

Canonical labels are English. Display language follows the user.

## Modes

- `more-consistent` (default): image main category is `Images`; document main category is the extension bucket (`Documents`, `Presentations`, `Spreadsheets`, `Data Exports`, `Configs`). The subcategory carries the topic.
- `more-refined`: a more specific main category may be used (`Security` / `PCI DSS`) unless a whitelist forbids it.

## File families

The helper maps extensions to a family and a candidate main-category list. In `more-consistent` mode, the main category must stay in that list. `Other` is only valid when the list contains `Other` and nothing else fits.

| Family | Typical extensions | Candidate mains |
|---|---|---|
| image | jpg, png, webp, heic, svg, … | Images |
| document | pdf, txt, md, docx, xlsx, pptx, csv, ini, … | Documents, Presentations, Spreadsheets, Data Exports, Configs |
| software | exe, msi, deb, dmg, apk, … | Software, Installers, Drivers, Operating Systems, Other |
| archive | zip, 7z, tar.gz, rar, … | Archives, Software, Data Exports, Other |
| audio | mp3, flac, wav, m4a, … | Audio, Other |
| video | mp4, mkv, mov, webm, … | Videos, Other |
| ebook | epub, mobi, azw3, … | Ebooks, Documents, Other |
| font | ttf, otf, woff, … | Fonts, Other |
| generic | anything else | the full generic list |

## Whitelist

JSON:

```json
{
  "categories": ["Documents", "Images"],
  "subcategories": [],
  "subcategories_by_category": {
    "Documents": ["Invoices", "Receipts"],
    "Images": ["Screenshots", "Photos"]
  }
}
```

Global `subcategories` and `subcategories_by_category` are mutually exclusive. Validation uses the full lists. If the constraint count is over 30, the helper may expose at most 8 prompt candidates; still validate against the full list.

## Post-processing

The helper, not the model, owns:

- consistent-mode image/document main-category lock
- software/archive alias normalization (`app` → `Software`, `setup` → `Installers`)
- low-information subcategories → `General`
- path-label sanitization

## Screenshot rule

For screenshots, UI captures, dashboards, and mockups, describe what is on screen. Do not use Software, Operating Systems, Databases, or Installers as the main category for an ordinary image of those things.

## Content

- Document text: host Read, about 8000 characters max, only when the filename is vague.
- Image description: only if the host already has vision.
- Do not upload files to a remote API unless the user asked for remote analysis this turn.
