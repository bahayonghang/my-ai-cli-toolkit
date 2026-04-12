# Typst Troubleshooting

## Missing font warnings

If you see "unknown font family" warnings, remove the font specification to use system defaults. Font warnings do not prevent compilation; the document will use fallback fonts.

## Template/Package not found

If import fails with "package not found":

- Verify the exact package name and version on Typst Universe.
- Check for typos in `@preview/package:version` syntax.
- Typst uses fully qualified imports with specific versions — there is no package cache to update.

## Compilation errors

Common fixes:

- **"expected content, found ..."**: Code used where markup is expected — wrap in `#{ }` or use proper syntax.
- **"expected expression, found ..."**: Missing `#` (or `#(...)`) in markup/content blocks.
- **"unknown variable"**: Check spelling, ensure imports are correct.
- **Array/dictionary errors**: Review syntax — use `()` for both, dictionaries need `key: value`, singleton arrays are `(elem,)`.
