# Workflow Reference

## Common: File Detection

All workflows share this file detection logic:
1. If file path specified → use directly
2. Otherwise → scan project root for .typ/.tex files (exclude templates/, examples/, output/, .claude/)
3. Sort by modification time, use most recent
4. Script: `python scripts/detect_file.py [--root DIR]`

## 1. Create Slides

**Trigger**: "创建幻灯片", "create slides", "make presentation"

Steps:
1. Parse arguments: topic (required), --engine (typst|latex, default: typst), --theme (default: university), --lang (zh|en, default: zh), --slides (default: 12)
2. Read template: `templates/typst/touying-{theme}.typ` or `templates/beamer/{theme}.tex`
3. Design content structure:
   - Title page → Outline → Introduction (2-3 slides) → Core content (2-3 sections × 2-3 slides) → Summary (1-2) → References & Q&A (1-2)
   - Each slide ≤ 6 bullet points
   - Use animations (#pause / \pause) for progressive reveal
4. Generate file: replace template placeholders with content, save as `{topic-keyword}-slides.{typ|tex}`
5. Compile: `python scripts/compile.py <file>`
6. On failure: read errors, fix, retry (max 3 times)

## 2. From Paper

**Trigger**: "论文转幻灯片", "paper to slides", "convert paper"

Steps:
1. Parse arguments: paper source (required), --engine, --theme, --duration (15|20|30 min, default: 15), --lang
2. Read paper content (file or pasted text)
3. Extract structure: metadata, abstract, introduction, methods, experiments, results, discussion, conclusion, key formulas, figure references
4. Allocate slides by duration (~1 slide/min):
   | Section | 15min | 20min | 30min |
   |---------|-------|-------|-------|
   | Title+Outline | 2 | 2 | 2 |
   | Background | 2 | 3 | 4 |
   | Methods | 4 | 5 | 8 |
   | Results | 4 | 6 | 10 |
   | Discussion | 1 | 2 | 3 |
   | Conclusion | 1 | 1 | 2 |
   | Refs+Q&A | 1 | 1 | 1 |
5. Generate slides preserving key formulas and figure placeholders
6. Compile and verify

## 3. Edit Slides

**Trigger**: "编辑幻灯片", "edit slide", "modify slide", "添加一页"

Steps:
1. Detect target file
2. Run `python scripts/analyze_structure.py <file>` to get structure overview
3. Interpret edit instruction (add/delete/modify/reorder pages, batch changes, add animation)
4. Apply precise edits using Edit tool (not full rewrite), maintain style consistency
5. Compile to verify

## 4. Switch Theme

**Trigger**: "切换主题", "change theme", "switch theme"

Steps:
1. Parse: theme name (required), --file, --aspect (16:9|4:3), --color, --font
2. Detect current engine and theme
3. Apply changes (see resources/THEME_REFERENCE.md for details)
4. Compile to verify

## 5. Compile

**Trigger**: "编译", "compile", "build", "生成PDF"

Steps:
1. Detect source file
2. Run `python scripts/compile.py <file> [--clean]`
3. Report result: success/failure, PDF path, file size
4. On failure: analyze errors (see resources/ERROR_PATTERNS.md), fix, retry (max 3)

## 6. Review

**Trigger**: "审查", "review slides", "检查幻灯片"

Steps:
1. Detect target file
2. Run `python scripts/analyze_structure.py <file>` for structure
3. Run `python scripts/review_metrics.py <file>` for scores
4. Generate review report with scores, issues, highlights
5. If --auto-fix: apply fixable issues using Edit tool
