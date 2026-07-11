# Validator Parity Matrix

Baseline date: 2026-07-11, Windows local Chrome. All old validators were executed before deletion; all new validators were executed with the same tracked demo sources.

| Source | Legacy assertion | Legacy result | New carrier | New result | Evidence |
| --- | --- | --- | --- | --- | --- |
| root validate.ps1:46-54 | required skill/reference/hicolor files | PASS | skill-structure required files | PASS | default node test |
| root validate.ps1:60-69 | SKILL.md runtime contract strings | PASS | structure + wrapper tests | PASS | default node test |
| root validate.ps1:71-73 | interface three fields | PASS | skill-structure interface test | PASS | default node test |
| root validate.ps1:75-79 | README relative links resolve | PASS | skill-structure README test | PASS | default node test |
| root validate.ps1:88-92 | both demo file sets exist | PASS | skill-structure demo entrypoints | PASS | default node test |
| artmuse validate.ps1:39-41 | index/styles/script exist | PASS | config.staticFiles | PASS | ArtMuse JSON `ok=true` |
| artmuse validate.ps1:45 | no remote image URL | PASS | htmlMustNotMatch | PASS | ArtMuse JSON `ok=true` |
| artmuse validate.ps1:46-48 | three local SVG references | PASS | htmlMustMatch x3 | PASS | ArtMuse JSON `ok=true` |
| artmuse validate.ps1:60-67 | server 200 and desktop screenshot >10KB | PASS | node:http + capture threshold | PASS | validate-desktop.png |
| artmuse validate.ps1:141 | ready phone screen | PASS | readyExpression | PASS | ArtMuse JSON `ok=true` |
| artmuse validate.ps1:142-150 | home -> exhibitions -> detail, broken images=0 | PASS | steps x4 | PASS | actuals home/exhibitions/detail/0 |
| marble validate.ps1:39-41 | index/styles/script exist | PASS | config.staticFiles | PASS | Marble JSON `ok=true` |
| marble validate.ps1:45-49 | no remote URL, click paths/views/island/SVG status contract | PASS | htmlMustMatch/htmlMustNotMatch | PASS | Marble JSON `ok=true` |
| marble validate.ps1:61-68 | server 200 and desktop screenshot >10KB | PASS | node:http + capture threshold | PASS | validate-desktop.png |
| marble validate.ps1:142 | ready phone and app view | PASS | readyExpression | PASS | Marble JSON `ok=true` |
| marble validate.ps1:143-167 | eight-step flow and four numeric/image assertions | PASS | steps x12 | PASS | actuals cover/home/search/create/schedule/settings/folder/meeting/0/3/9/6 |
| new mobile coverage | not present | N/A | mobile viewport screenshot | PASS | both validate-mobile.png >10KB |

Deletion gate: PASS. The Node 20 runner preserves every effective legacy assertion and adds mobile screenshot coverage.
