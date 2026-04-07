# Migration

`paper-workbench` replaces the earlier split paper skill surface with one primary entrypoint.

## Current contract

The canonical schema is now `paper-record`.

## Current expectation

- use `paper-workbench` as the only public paper skill entrypoint
- keep normalization, interpretation, and x-ray analysis under one skill surface
- accept only `paper-record` JSON as the normalized interchange format
