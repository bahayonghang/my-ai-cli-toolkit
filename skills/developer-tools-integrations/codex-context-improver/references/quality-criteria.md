# Context quality and guidance creation criteria

Use evidence rather than a composite score to decide what guidance should exist.

## Existing guidance quality

Assess each active or intentionally audited file. Cite the source for every
material deduction.

| Criterion | Evidence |
| --- | --- |
| Scope and precedence | Governing subtree, authority, override role and actual loading evidence are accurate. |
| Commands and gates | Commands exist, identify CWD, and match manifests/CI; required gates survive cleanup. |
| Local contracts | Non-obvious ownership, generated-file, API, data and change-coupling rules remain reachable. |
| Permissions and completion | Read-only intent stays read-only; explicit scoped changes complete; real missing authority has an exact source and prepared result. |
| Trigger and disclosure | Natural descriptions exclude near neighbors; references load for a task reason, not unconditionally. |
| Delegation and verification | Independent work and tools justify delegation; changed claims/risk justify tests; no endless expansion after acceptance. |
| Clarity | Concise outcome, material evidence and no unsupported model-performance claim. |

Prioritize demonstrated behavioral impact. Do not judge deletion by a fixed age,
line count, copy count, arbitrary score or a model upgrade. For each relevant
redundancy/conflict explain keep, narrow, move or delete and what constraint
survives. Conditional detail may stay in a rarely read reference.

## Independent creation decisions

Every source subtree gets two decisions:

| Durable local instruction need | Navigation/routing need | Outcome |
| --- | --- | --- |
| no | no | create nothing |
| no | yes | local `code_map.md` only |
| yes | no | nested `AGENTS.md`; point to the nearest useful map |
| yes | yes | nested `AGENTS.md` and local `code_map.md` |

### AGENTS hard minimum

`AGENTS decision: create` requires at least one verified, durable,
non-inferable local contract:

- a distinct command or gate future Codex work must use;
- a local safety, generated-file, data, external-service, or permission boundary;
- a local ownership, public-contract, or cross-file change rule;
- a recurring agent error or repeated review finding;
- an intentional override of broader guidance.

Complexity, file count, a separate manifest, or a different language cannot
satisfy this minimum alone. Record a no-create reason when it is absent.

### code_map evidence

`code_map decision: create` may use navigation evidence such as many internal
routes, several entry points, hard-to-discover search anchors, generated/vendor
boundaries, or repeated broad-search cost. A map is navigation, not another
behavior policy.

## Automatic exclusions

Do not create guidance or maps inside dependencies, generated output, caches,
build output, vendored source, runtime state, or third-party snapshots unless
the request is explicitly about recovery for that path. File count and obvious
directory names are not evidence.

## Assessment record

For each candidate return:

- `AGENTS decision`: create, update, keep, or do not create;
- instruction evidence and no-create reason;
- `code_map decision`: create, update, keep, or do not create;
- navigation evidence and no-create reason;
- confidence or `missing evidence`;
- nearest applicable guidance and map paths.

Neither complexity nor a quality score bypasses the AGENTS minimum condition.
