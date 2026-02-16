# Theme Reference

## Typst Touying Themes

| Theme | Import | Show Rule | Font (EN) | Font (CN) |
|-------|--------|-----------|-----------|-----------|
| university | `#import themes.university: *` | `#show: university-theme.with(...)` | Linux Libertine | Source Han Serif SC |
| metropolis | `#import themes.metropolis: *` | `#show: metropolis-theme.with(...)` | Fira Sans | Source Han Sans SC |
| simple | `#import themes.simple: *` | `#show: simple-theme.with(...)` | Linux Libertine | Source Han Serif SC |
| dewdrop | `#import themes.dewdrop: *` | `#show: dewdrop-theme.with(...)` | Linux Libertine | Source Han Serif SC |
| aqua | `#import themes.aqua: *` | `#show: aqua-theme.with(...)` | Linux Libertine | Source Han Serif SC |

### Typst Theme Switch Steps

1. Replace `#import themes.{old}: *` → `#import themes.{new}: *`
2. Replace `#show: {old}-theme.with(...)` → `#show: {new}-theme.with(...)`
3. If switching to **metropolis**: change font to `("Fira Sans", "Source Han Sans SC")`
4. If switching from **metropolis**: change font to `("Linux Libertine", "Source Han Serif SC")`
5. If switching to **dewdrop**: add `navigation: "mini-slides"` parameter in show rule
6. If `--aspect` specified: modify `aspect-ratio: "16-9"` or `"4-3"`

### Typst Font Configuration

```typst
// Chinese (serif body)
#set text(font: ("Linux Libertine", "Source Han Serif SC"), size: 20pt)
// Chinese (sans title, for metropolis)
#set text(font: ("Fira Sans", "Source Han Sans SC"), size: 20pt)
```

## LaTeX Beamer Themes

| Theme | Command | Style |
|-------|---------|-------|
| metropolis | `\usetheme{metropolis}` | Modern minimal |
| default (Madrid) | `\usetheme{Madrid}` | Classic with navigation |
| Berlin | `\usetheme{Berlin}` | Navigation bar |
| minimalist | `\usetheme{default}` + custom | Ultra-clean academic |

### LaTeX Theme Switch Steps

1. Replace `\usetheme{old}` → `\usetheme{new}`
2. If switching to **minimalist**: add navigation removal settings:
   ```latex
   \setbeamertemplate{navigation symbols}{}
   \setbeamertemplate{footline}{}
   \setbeamertemplate{headline}{}
   ```
3. If `--aspect` specified: modify `aspectratio=169` or `aspectratio=43` in `\documentclass`
4. If `--color` specified: add/modify `\usecolortheme{colorname}`

### LaTeX Chinese Support

Uncomment `\usepackage{ctex}` and compile with `latexmk -xelatex`.

## Aspect Ratio

| Format | Typst | LaTeX |
|--------|-------|-------|
| 16:9 | `aspect-ratio: "16-9"` | `aspectratio=169` |
| 4:3 | `aspect-ratio: "4-3"` | `aspectratio=43` |
