# Validation Traceability

This matrix maps the upstream shell validator and recorded R1-R8 gaps to deterministic tests in `bundle-scripts.test.mjs`.

| Contract | Python owner | Test evidence | Status |
| --- | --- | --- | --- |
| Required bundle files | `validate_bundle.py` | `preflight reports missing files...` | Absorbed |
| Manifest/schema JSON validity | `validate_bundle.py` | `invalid project config...`; post-response fixtures | Absorbed |
| Required manifest fields | `validate_bundle.py` | valid and tampered preflight fixtures | Absorbed |
| Unfilled request placeholders | `validate_bundle.py` | `preflight reports missing files...` | Absorbed |
| Non-empty `files/` | `validate_bundle.py` | `preflight reports missing files...` | Absorbed |
| Scenario enum and positive round | create/validate helpers | `create preserves documented input exit codes`; tampered preflight | Absorbed |
| First-gap automatic round selection | `create_bundle.py` | `automatic round selection fills the first gap` | Absorbed |
| `previous_rounds` required after round 1 | `validate_bundle.py` | verification focused fixture | Absorbed |
| Round above max requires allowed purpose | `validate_bundle.py` | verification focused fixture | Absorbed |
| Schema title matches scenario | `validate_bundle.py` | all valid post-response fixtures | Absorbed |
| F10 exactly one verification source | `validate_bundle.py` | verification focused fixture | Absorbed |
| F11 no recursive verification and round binding | `validate_bundle.py` | verification focused fixture | Absorbed |
| F12 strict verification purpose | `validate_bundle.py` | verification focused fixture | Absorbed |
| F13 extracted patterns and source response | `validate_bundle.py` | verification focused fixture | Absorbed |
| Standard response fields/types/enums | `validate_bundle.py` | complete and invalid-dimension response tests | Absorbed |
| Four plan-review dimensions | `validate_bundle.py` | complete plan response | Absorbed; incomplete coverage warns |
| Verification response fields/types/enums | `validate_bundle.py` | verification focused fixture | Absorbed |
| Codify/review `files_changed` shape | `validate_bundle.py` | validator implementation plus full suite | Absorbed |
| R1 session JSONL field | `validate_bundle.py` | valid preflight warning path | Absorbed as compatibility warning |
| R2 absolute existing previous paths | `validate_bundle.py` | verification focused fixture | Absorbed |
| R4 `files_changed` uniqueness | `validate_bundle.py` | `post-response rejects duplicate and forbidden changed paths` | Absorbed |
| R5 command/exit/status update | `run_bundle.py` | fake success and nonzero execution tests | Absorbed |
| R6 forbidden changed paths | `validate_bundle.py` | `post-response rejects duplicate and forbidden changed paths` | Absorbed |
| R7 separate post-response phase | `validate_bundle.py` | missing-response and valid-response tests | Absorbed |
| R8 primary-agent decision log | Workflow documentation | Not automated in v1.0 | Deferred to v1.1 |
| Sandbox cannot be raised by project or manifest | create/run/validate helpers | override and tampered-manifest tests | Added safety contract |
| Windows `codex.cmd` resolution | `run_bundle.py` | fake Codex success test | Added portability contract |
| Live Codex codify behavior | External runtime | No representative run recorded | `missing evidence` |
