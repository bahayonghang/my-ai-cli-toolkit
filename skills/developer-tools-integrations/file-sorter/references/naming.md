# Naming

## Labels

Category and subcategory must:

- be non-empty after sanitization
- be at most 80 characters
- exclude `<>:"/\|?*` and control characters
- not look like a file extension (`notes.pdf`)
- not be a Windows reserved name (`con`, `prn`, `aux`, `nul`, `com1`–`com9`, `lpt1`–`lpt9`)
- not be `.` or `..`
- differ from each other (case-insensitive)

The helper sanitizes forbidden path characters to spaces before validation.

## Filenames

- Keep the original extension.
- Prefer lowercase underscore slugs for suggestions.
- No leading or trailing space or dot.
- Same reserved-name rules as labels, applied to the stem.

## Uniqueness

Within one `target_dir`, names are compared case-insensitively. Collisions become `stem_2.ext`, `stem_3.ext`. The helper owns uniquifying; the model does not invent numeric suffixes unless the user asked for a specific name.

Date suffixes on category folders are optional overlays. Do not store them as the canonical category label.
