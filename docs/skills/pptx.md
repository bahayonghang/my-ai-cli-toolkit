# pptx

Create, read, edit, and design PowerPoint presentations (.pptx files).

## Use Cases

- Creating slide decks and pitch presentations
- Reading and extracting text from existing presentations
- Editing and updating presentation content
- Working with templates, layouts, and speaker notes
- Converting presentations to images for review

## How It Works

| Task | Approach |
|------|----------|
| Read/analyze content | `python -m markitdown presentation.pptx` |
| Edit or use template | Unpack → Edit XML → Repack |
| Create from scratch | Use `pptxgenjs` (JavaScript) |

## Quick Reference

### Reading Content

```bash
# Text extraction
python -m markitdown presentation.pptx

# Visual overview (thumbnail grid)
python scripts/thumbnail.py presentation.pptx

# Raw XML access
python scripts/office/unpack.py presentation.pptx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Creates `slide-01.jpg`, `slide-02.jpg`, etc.

## Design Guidelines

### Color Palettes

Choose colors that match your topic:

| Theme | Primary | Secondary | Accent |
|-------|---------|-----------|--------|
| Midnight Executive | `1E2761` | `CADCFC` | `FFFFFF` |
| Forest & Moss | `2C5F2D` | `97BC62` | `F5F5F5` |
| Coral Energy | `F96167` | `F9E795` | `2F3C7E` |
| Ocean Gradient | `065A82` | `1C7293` | `21295C` |

### Typography

| Element | Size |
|---------|------|
| Slide title | 36-44pt bold |
| Section header | 20-24pt bold |
| Body text | 14-16pt |
| Captions | 10-12pt |

### Layout Tips

- **Every slide needs a visual element** — image, chart, icon, or shape
- Use two-column layouts (text left, illustration right)
- Large stat callouts (60-72pt numbers with small labels)
- 0.5" minimum margins, 0.3-0.5" between content blocks

### Avoid Common Mistakes

- Don't repeat the same layout across slides
- Don't center body text — left-align paragraphs
- Don't use low-contrast elements
- Never use accent lines under titles (AI hallmark)
- Don't create text-only slides

## QA Process

**Required for every presentation:**

1. **Content QA**: Check for missing content, typos
   ```bash
   python -m markitdown output.pptx
   ```

2. **Visual QA**: Convert to images and inspect each slide
   - Look for overlapping elements
   - Check text overflow
   - Verify spacing and alignment

3. **Verification Loop**: Fix → Re-verify → Repeat

## Dependencies

| Tool | Purpose |
|------|---------|
| `markitdown[pptx]` | Text extraction |
| `Pillow` | Thumbnail grids |
| `pptxgenjs` (npm) | Creating from scratch |
| `LibreOffice` | PDF conversion |
| `Poppler` | PDF to images |

## Output

- Location: Working directory or specified path
- Format: `.pptx` (Office Open XML Presentation)
