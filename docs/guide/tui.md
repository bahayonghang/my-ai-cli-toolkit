# TUI (Terminal User Interface) Guide

The TUI provides a modern, visual interface for managing AI Skills Hub resources with an intuitive table layout and real-time update detection.

## Quick Start

Launch the TUI:

```bash
uv run python src/install_tui.py
```

## Features Overview

### 🎯 Visual Platform Selection
- Claude Code
- Codex CLI
- Gemini CLI
- Qwen Code
- Google Antigravity
- Windsurf

### 📊 Table Layout

The TUI displays items in a clean, aligned table format:

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ✓ article-cover            Generate professional article cover images as SV 01-02 15:43 01-02 15:43
  ☑ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
  ☐ ○ paper-check              学术论文全流程检查工具，支持格式检查和内容分析（ 01-19 22:34 N/A        
```

### Column Definitions

| Column | Symbol | Width | Description |
|--------|--------|-------|-------------|
| (arrow) | ▶/space | 1 | Highlight indicator (▶ for current row) |
| ☐ | ☐/☑ | 1 | Selection status (☐ unselected / ☑ selected) |
| ✓ | ✓/⚠/○ | 1 | Installation status (✓ installed / ⚠ needs update / ○ not installed) |
| Name | - | 24 | Item name (supports Chinese characters) |
| Description | - | 48 | Item description (supports Chinese characters) |
| Src Time | - | 11 | Source file modification time |
| Tgt Time | - | 11 | Target file modification time |

### 🔄 Update Detection

The TUI automatically detects when installed items need updates by comparing file modification times:

- **✓ (Green Check)**: Installed and up-to-date (source time = target time)
- **⚠ (Yellow Warning)**: Installed but outdated (source time > target time)
- **○ (Empty Circle)**: Not installed (target file doesn't exist)

### 📋 Tabbed Interface

Switch between two tabs:
- **Skills**: All available skills
- **Commands/Workflows**: Platform-specific commands or workflows

### 🌏 Chinese Character Support

The TUI fully supports Chinese characters with proper width calculation:
- Chinese characters: 2 display width
- English characters: 1 display width
- Automatic truncation and padding to maintain column alignment

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `k` | Move up |
| `↓` / `j` | Move down |
| `Tab` | Switch between Skills/Commands tabs |
| `Esc` | Clear search / Return to platform selection |

### Selection

| Key | Action |
|-----|--------|
| `Space` | Toggle selection of current item |
| `a` | Select all items in current tab |

### Installation

| Key | Action |
|-----|--------|
| `Enter` | Install focused item |
| `i` | Install all selected items (batch) |

### Search

| Key | Action |
|-----|--------|
| `/` | Open search box |
| `Esc` | Close search box |

### Other

| Key | Action |
|-----|--------|
| `q` | Quit application |

## Usage Workflow

### 1. Check for Updates

1. Launch TUI: `uv run python src/install_tui.py`
2. Select your platform (e.g., Claude)
3. Look for items with ⚠ status in the **St** column
4. Compare **Src Time** and **Tgt Time** columns
5. Bottom status bar shows: `⚠ X need update`

### 2. Batch Update Outdated Items

1. Use `Space` to select all items with ⚠ status
2. Press `i` to install selected items
3. Wait for installation to complete
4. Status bar shows progress: `Installing X/Y items`

### 3. Install New Items

1. Look for items with ○ status (not installed)
2. Use `Space` to select desired items
3. Press `i` to install
4. **Tgt Time** will change from `N/A` to actual time

### 4. Search for Specific Items

1. Press `/` to open search box
2. Type item name (partial match supported)
3. List filters in real-time
4. Press `Esc` to clear search

## Status Bar Information

The bottom status bar displays:

```
✓ Installed 25/27  ⚠ 2 need update
```

- **Installed count**: Number of installed items / Total items
- **Update warning**: Number of items that need updates (if any)
- **Selection count**: Number of selected items (when selecting)

## Examples

### Example 1: Check Update Status

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ✓ article-cover            Generate professional article cover images       01-02 15:43 01-02 15:43
```

- **✓**: installed
- **Src Time** = **Tgt Time**: Up-to-date, no update needed

### Example 2: Needs Update

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
```

- **⚠**: needs update
- **Src Time** (01-21) > **Tgt Time** (01-07): Source file updated, needs reinstall

### Example 3: Not Installed

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ○ skill-manager            A Claude Code skill that allows you to search    01-16 15:01 N/A        
```

- **○**: not installed
- **Tgt Time**: N/A (target file doesn't exist)

### Example 4: Selected Item

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☑ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
```

- **☑**: selected
- Press `i` to install this item

## Technical Details

### Display Width Calculation

The TUI uses intelligent width calculation for proper alignment:

```python
# Chinese characters = 2 width, English = 1 width
get_display_width("Hello")      # Returns: 5
get_display_width("你好")        # Returns: 4
get_display_width("Hello世界")  # Returns: 9
```

### Truncation and Padding

Text is automatically truncated and padded to maintain column width:

```python
truncate_to_width("学术论文全流程检查工具，支持格式检查", 48)
# Returns: "学术论文全流程检查工具，支持格式检查和内容分析（"

pad_to_width("Hello", 48)
# Returns: "Hello                                           "
```

### File Modification Time

The TUI compares file modification times to determine update status:

1. Get source file mtime: `datetime.fromtimestamp(source_path.stat().st_mtime)`
2. Get target file mtime: `datetime.fromtimestamp(target_path.stat().st_mtime)`
3. Compare: If source > target, status = OUTDATED

## Requirements

- Python 3.10+
- Textual library

Install dependencies:

```bash
uv add textual
```

## Troubleshooting

### TUI doesn't start

**Issue**: `ModuleNotFoundError: No module named 'textual'`

**Solution**: Install Textual library
```bash
uv add textual
```

### Chinese characters misaligned

**Issue**: Chinese text causes column misalignment

**Solution**: This should be fixed in the latest version. If you still see issues, please report with:
- Terminal emulator name and version
- Font being used
- Screenshot of the issue

### Update detection not working

**Issue**: Items show ✓ but should show ⚠

**Solution**: 
1. Check if source files were actually modified
2. Verify file modification times: `ls -l skills/skill-name/`
3. Try reinstalling the item manually

## Advanced Usage

### Project-Specific Installation

Install to a specific project directory:

```bash
uv run python src/install_tui.py
# Select platform
# Choose "Project-specific installation"
# Enter project path
```

### Kiro Structure Support

For Kiro-based projects:

```bash
uv run python src/install_tui.py
# Select platform
# Enable "Use Kiro structure"
```

## Related Documentation

- [Installation Guide](./installation.md)
- [Creating Skills](./creating-skills.md)
- [Commands Guide](./commands.md)
