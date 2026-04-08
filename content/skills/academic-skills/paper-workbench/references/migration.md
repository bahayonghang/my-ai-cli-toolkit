# Migration

`paper-workbench` remains the only public paper-analysis entrypoint, but it is
no longer just a thin `json / interpret / xray` router.

## Stable contracts

- `paper-record` remains the canonical normalization schema
- `json`, `interpret`, and `xray` remain valid public modes
- `normalize_paper.py` remains the single-paper normalization helper

## New contracts

- `researcher-profile`
- `paper-deep-read`
- `literature-synthesis`
- `review-outline`

## Alias mapping

- “先快速扫一下” / “预判” → `scan`
- “精读这篇” / “解构这篇” → `deep-read`
- “只做卡片” → `card`
- “整合这几篇” / “对比分析” / “找研究空白” → `synthesis`
- “搭综述框架” / “写这一段” → `review`

## Backward-compatibility rule

When an old workflow only expects a normalized machine-readable artifact, stay
in `json` mode and do not silently upgrade to a higher-level analysis mode.
