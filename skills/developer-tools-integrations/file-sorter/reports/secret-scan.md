# Secret scan

- Date: 2026-08-21
- Scope: `skills/developer-tools-integrations/file-sorter/`
- Method: repository search for `api_key`, `password`, PEM headers, and `sk-` tokens

## Result

No credentials, tokens, or private keys in the package.

Hits on `.secret.txt` are the Windows hidden-file fixture name in `tests/file-sorter.test.mjs`. They are not secrets.

Provider-backed secret scanning SaaS was not run: `missing evidence`.
