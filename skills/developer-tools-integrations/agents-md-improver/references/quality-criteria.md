# AGENTS.md quality and creation criteria

Use evidence rather than a composite score to decide what guidance should exist.

## Existing guidance quality

Assess each active or intentionally audited file. Cite the source for every
material deduction.

| Criterion | Weight | Full-credit evidence |
| --- | ---: | --- |
| Scope and precedence | 20 | Governing subtree, parent relationship, override role, and active/shadowed state are accurate. |
| Commands and gates | 20 | Essential commands exist, name the correct working directory, and match CI or source manifests. |
| Local contracts | 15 | Non-obvious ownership, generated-file, API, data, or change-coupling rules are concise. |
| Safety and permissions | 15 | Real destructive, credential, production, external, or user-global boundaries are explicit. |
| Codex fit | 15 | Discovery, skills, subagents, and optional tooling are current and evidence-backed. |
| Conciseness and currency | 15 | No stale paths, obvious code restatement, duplicate rules, or navigation bloat. |

Grades (A 90-100, B 70-89, C 50-69, D 30-49, F 0-29) are secondary summaries.
Lead with findings and evidence, not averages.

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

Use scores only after these hard decisions to compare content quality. A score
must never bypass the AGENTS minimum condition.
