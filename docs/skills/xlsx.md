# xlsx

Create, read, edit, and analyze Excel spreadsheets (.xlsx files).

## Use Cases

- Creating new Excel files with data, formulas, and formatting
- Editing existing spreadsheets while preserving formulas
- Data analysis and visualization with pandas
- Building financial models with proper color coding
- Extracting and transforming tabular data

## How It Works

This skill uses Python libraries for Excel operations:

| Library | Best For |
|---------|----------|
| `pandas` | Data analysis, bulk operations, simple export |
| `openpyxl` | Complex formatting, formulas, Excel-specific features |

## Quick Reference

### Reading Data

```python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')  # First sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets

# Analyze
df.head()      # Preview
df.describe()  # Statistics
```

### Creating Files

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

wb = Workbook()
sheet = wb.active

# Add data and formulas
sheet['A1'] = 'Revenue'
sheet['B1'] = 1000
sheet['B2'] = '=SUM(B1:B10)'  # Use formulas, not hardcoded values!

# Formatting
sheet['A1'].font = Font(bold=True)
wb.save('output.xlsx')
```

### Recalculating Formulas

```bash
# Required after adding formulas
python scripts/recalc.py output.xlsx
```

## Key Features

### Formula Best Practices

- **Always use Excel formulas** instead of calculating in Python
- Use cell references (`=B5*(1+$B$6)`) not hardcoded values
- Run `scripts/recalc.py` after saving to calculate values

### Financial Model Standards

| Element | Convention |
|---------|------------|
| Blue text | Hardcoded inputs |
| Black text | Formulas |
| Green text | Links from other sheets |
| Yellow background | Key assumptions |

### Number Formatting

- Currency: `$#,##0` with units in headers
- Percentages: `0.0%` format
- Negatives: Use parentheses `(123)` not `-123`
- Zeros: Display as `-`

## Common Workflow

1. **Choose tool**: pandas for data, openpyxl for formulas/formatting
2. **Create/Load**: Create new or load existing file
3. **Modify**: Add data, formulas, formatting
4. **Save**: Write to file
5. **Recalculate**: Run `scripts/recalc.py`
6. **Verify**: Check for formula errors (#REF!, #DIV/0!, etc.)

## Dependencies

| Tool | Purpose |
|------|---------|
| `pandas` | Data analysis |
| `openpyxl` | Excel file manipulation |
| `LibreOffice` | Formula recalculation |

## Output

- Location: Working directory or specified path
- Format: `.xlsx` (Office Open XML Spreadsheet)
