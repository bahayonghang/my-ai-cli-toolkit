# docx

Create, read, edit, and manipulate Word documents (.docx files).

## Use Cases

- Creating professional Word documents with formatting (TOC, headers, page numbers)
- Editing existing .docx files with tracked changes
- Adding comments and replies to documents
- Extracting content from Word files
- Converting between formats (.doc → .docx, .docx → PDF/images)
- Find-and-replace operations in Word documents

## How It Works

A `.docx` file is a ZIP archive containing XML files. This skill provides two main approaches:

| Task | Approach |
|------|----------|
| Create new document | Use `docx-js` (JavaScript library) |
| Edit existing document | Unpack → Edit XML → Repack |

## Quick Reference

### Creating New Documents

```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter in DXA
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({ children: [new TextRun("Hello World")] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Editing Existing Documents

```bash
# Step 1: Unpack
python scripts/office/unpack.py document.docx unpacked/

# Step 2: Edit XML files in unpacked/word/

# Step 3: Repack
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```

### Reading Content

```bash
# Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Accepting Tracked Changes

```bash
python scripts/accept_changes.py input.docx output.docx
```

### Adding Comments

```bash
# Add a comment
python scripts/comment.py unpacked/ 0 "Comment text"

# Add a reply to comment 0
python scripts/comment.py unpacked/ 1 "Reply text" --parent 0
```

## Key Features

### Document Creation (docx-js)

- **Page Setup**: US Letter (12240×15840 DXA) or A4 (11906×16838 DXA)
- **Styles**: Override built-in headings with custom fonts/sizes
- **Lists**: Use `LevelFormat.BULLET` or `LevelFormat.DECIMAL` (never unicode bullets)
- **Tables**: Always use `WidthType.DXA` with dual widths (table + cells)
- **Images**: Requires `type` parameter (png/jpg/etc)
- **TOC**: Use `HeadingLevel` only, include `outlineLevel` in styles

### XML Editing

- **Tracked Changes**: `<w:ins>` for insertions, `<w:del>` for deletions
- **Comments**: Use `comment.py` helper, then add markers to document.xml
- **Smart Quotes**: Use XML entities (`&#x201C;`, `&#x201D;`, etc.)
- **Validation**: Auto-repair for common issues during repack

## Critical Rules

| Rule | Reason |
|------|--------|
| Set page size explicitly | docx-js defaults to A4 |
| Never use `\n` in text | Use separate Paragraph elements |
| Never use unicode bullets | Use numbering config |
| PageBreak must be in Paragraph | Standalone creates invalid XML |
| Use `WidthType.DXA` for tables | Percentages break in Google Docs |
| Use `ShadingType.CLEAR` | SOLID causes black backgrounds |

## Dependencies

| Tool | Purpose |
|------|---------|
| `docx` (npm) | Create new documents |
| `pandoc` | Text extraction |
| `LibreOffice` | PDF conversion, accept changes |
| `Poppler` | PDF to images (`pdftoppm`) |

## Scripts Reference

| Script | Description |
|--------|-------------|
| `scripts/office/unpack.py` | Extract and pretty-print DOCX XML |
| `scripts/office/pack.py` | Validate and repack to DOCX |
| `scripts/office/validate.py` | Validate DOCX structure |
| `scripts/office/soffice.py` | LibreOffice wrapper |
| `scripts/accept_changes.py` | Accept all tracked changes |
| `scripts/comment.py` | Add comments/replies |

## Output

- Location: Working directory or specified path
- Format: `.docx` (Office Open XML)
