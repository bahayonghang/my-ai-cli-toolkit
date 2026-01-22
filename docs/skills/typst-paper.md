# Typst Paper Skill

Typst academic paper assistant with modular workflow for English and Chinese papers.

## Overview

This skill provides a comprehensive toolkit for writing academic papers using Typst, a modern alternative to LaTeX with faster compilation and simpler syntax. It supports modular workflows including compilation, format checking, grammar analysis, long sentence decomposition, academic expression improvement, translation, bibliography management, de-AI editing, and template configuration.

## Features

- **Fast Compilation**: Millisecond-level compilation speed (vs LaTeX's seconds)
- **Modular Workflow**: Independent modules that can be triggered separately
- **Multi-language Support**: English and Chinese academic papers
- **Format Checking**: Page margins, line spacing, fonts, headings, figures, tables, citations
- **Grammar Analysis**: Subject-verb agreement, article usage, tense consistency, Chinglish detection
- **Long Sentence Analysis**: Detect and simplify sentences >50 words (English) or >60 characters (Chinese)
- **Academic Expression**: Replace weak verbs with academic alternatives
- **Translation**: Chinese to English with domain-specific terminology
- **Bibliography Management**: BibTeX and Hayagriva format support with multiple citation styles
- **De-AI Editing**: Reduce AI writing traces while maintaining technical accuracy
- **Template Support**: IEEE, ACM, Springer, NeurIPS, and custom templates

## Installation

```bash
# Install the skill
python3 install.py install typst-paper

# Or install all skills
python3 install.py install-all
```

## Prerequisites

Install Typst CLI:

```bash
# Using Cargo (Rust package manager)
cargo install typst-cli

# Using Homebrew (macOS)
brew install typst

# Using package manager (Linux)
# Arch Linux
sudo pacman -S typst

# Or download binary from https://github.com/typst/typst/releases
```

## Trigger Words

Each module can be invoked independently using specific trigger words:

| Module | Trigger Words | Description |
|--------|---------------|-------------|
| Compile | `compile`, `编译`, `typst compile` | Compile Typst files to PDF |
| Format Check | `format`, `格式检查`, `lint` | Check page margins, fonts, spacing |
| Grammar | `grammar`, `语法`, `proofread` | Analyze grammar and fix errors |
| Long Sentence | `long sentence`, `长句`, `simplify` | Detect and simplify complex sentences |
| Academic Tone | `academic tone`, `学术表达` | Improve academic writing style |
| Translation | `translate`, `翻译`, `中译英` | Chinese to English translation |
| Bibliography | `bib`, `bibliography`, `参考文献` | Manage references and citations |
| De-AI Editing | `deai`, `去AI化`, `humanize` | Reduce AI writing traces |
| Template | `template`, `模板`, `IEEE`, `ACM` | Configure paper templates |

## Usage Examples

### 1. Compile Paper

```
Compile main.typ to PDF
```

or

```
编译 main.typ
```

**Typst Compilation Commands**:

```bash
# Basic compilation
typst compile main.typ

# Watch mode (auto-recompile on changes)
typst watch main.typ

# Specify output file
typst compile main.typ output.pdf

# Export to PNG
typst compile --format png main.typ

# List available fonts
typst fonts

# Use custom font path
typst compile --font-path ./fonts main.typ
```

### 2. Format Checking

```
Check format of my paper
```

or

```
格式检查
```

Checks:
- Page margins (typically 1 inch / 2.54cm)
- Line spacing (single/double)
- Font (Times New Roman 10-12pt)
- Heading hierarchy and numbering
- Figure and table captions
- Citation format consistency

### 3. Grammar Analysis (English)

```
Check grammar in the introduction section
```

or

```
语法检查
```

Focuses on:
- Subject-verb agreement
- Article usage (a/an/the)
- Tense consistency
- Chinglish detection

### 4. Long Sentence Analysis

```
Simplify long sentences in the methods section
```

or

```
长句拆解
```

Detects sentences:
- English: >50 words or >3 clauses
- Chinese: >60 characters or >3 clauses

### 5. Academic Expression

```
Improve academic tone in the results section
```

or

```
学术表达
```

Replaces weak verbs:
- use → employ, utilize, leverage
- get → obtain, achieve, acquire
- make → construct, develop, generate
- show → demonstrate, illustrate, indicate

### 6. Translation (Chinese to English)

```
Translate this Chinese paragraph to English
```

or

```
翻译这段中文
```

Workflow:
1. Domain identification (deep learning, time series, industrial control)
2. Terminology confirmation
3. Translation with annotations
4. Chinglish checking

### 7. Bibliography Management

```
Check my bibliography for missing fields
```

or

```
参考文献检查
```

Supports citation styles:
- `ieee` - IEEE numerical citations
- `apa` - APA author-year
- `chicago-author-date` - Chicago author-year
- `mla` - MLA humanities
- `gb-7714-2015` - Chinese national standard

### 8. De-AI Editing

```
Reduce AI traces in the abstract
```

or

```
去AI化编辑
```

Detects and removes:
- Empty phrases (significant, comprehensive, effective)
- Over-certainty (obviously, necessarily, completely)
- Mechanical parallelism
- Template expressions (in recent years, more and more)

### 9. Template Configuration

```
Set up IEEE template for my paper
```

or

```
配置 IEEE 模板
```

Supports:
- IEEE two-column format
- ACM format
- Generic academic paper template
- Chinese paper template

## Modular Workflow

### Complete English Paper Review

1. Format Check → Fix format issues
2. Grammar Analysis → Fix grammar errors
3. De-AI Editing → Reduce AI writing traces
4. Long Sentence Analysis → Simplify complex sentences
5. Academic Expression → Improve academic tone

### Complete Chinese Paper Review

1. Format Check → Fix format issues
2. De-AI Editing → Reduce AI writing traces
3. Academic Expression → Improve expression
4. Long Sentence Analysis → Simplify complex sentences
5. Bibliography → Verify citations

## Output Protocol

All suggestions follow a unified format:

```typst
// <Module>（Line <N>）[Severity: <Critical|Major|Minor>] [Priority: <P0|P1|P2>]: <Issue>
// Original: ...
// Modified: ...
// Reason: ...
// ⚠️ 【Evidence Needed】: <when evidence/data is required>
```

## Typst vs LaTeX

| Feature | Typst | LaTeX |
|---------|-------|-------|
| Compilation Speed | Milliseconds | Seconds |
| Syntax | Simple and intuitive | Complex and verbose |
| Error Messages | Clear and friendly | Obscure and difficult |
| Learning Curve | Gentle | Steep |
| Real-time Preview | Native support | Requires additional tools |

## Best Practices

1. **Use Watch Mode**: `typst watch main.typ` for real-time preview
2. **Modular Approach**: Invoke specific modules as needed rather than full review
3. **Incremental Compilation**: Typst only recompiles changed parts
4. **Font Management**: Use `typst fonts` to check available fonts
5. **Version Control**: Typst files are plain text, perfect for Git

## Templates

### IEEE Template

```typst
#import "@preview/charged-ieee:0.1.0": ieee

#show: ieee.with(
  title: [Your Paper Title],
  authors: (
    (
      name: "Author Name",
      department: [Department],
      organization: [University],
      location: [City, Country],
      email: "author@email.com"
    ),
  ),
  abstract: [Your abstract here...],
  index-terms: ("Machine Learning", "Deep Learning"),
  bibliography: bibliography("references.bib"),
)
```

### Generic Academic Paper

```typst
#set page(paper: "a4", margin: (x: 2.5cm, y: 2.5cm))
#set text(font: "Times New Roman", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em, first-line-indent: 1.5em)
#set heading(numbering: "1.1")
```

### Chinese Paper

```typst
#set page(paper: "a4", margin: (x: 3.17cm, y: 2.54cm))
#set text(
  font: ("Source Han Serif", "Noto Serif CJK SC"),
  size: 12pt,
  lang: "zh",
  region: "cn"
)
#set par(justify: true, leading: 1em, first-line-indent: 2em)
#set heading(numbering: "1.1")
```

## Supported Domains

- Deep Learning
- Time Series Analysis
- Industrial Control
- Computer Science

## Links

- [Typst Official Website](https://typst.app/)
- [Typst Documentation](https://typst.app/docs/)
- [Typst Universe](https://typst.app/universe/) - Templates and packages

## License

MIT
