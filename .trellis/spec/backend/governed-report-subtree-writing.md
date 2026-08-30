# Governed Report Subtree Writing

> Use these rules only for deterministic report packages whose inputs and rendered artifacts live under a fixed, ignored `reports/<report-kind>/` subtree.

## 1. Scope and Trigger

This guide is a narrow specialization of [Governed File Writing](./governed-file-writing.md). It applies only when all of the following are true:

- the user has explicitly authorized a named report package and its exact repository root;
- the helper hard-codes a registered report kind instead of accepting an arbitrary destination directory;
- one validated JSON draft is intentionally reused to render two or more deterministic report artifacts; and
- every persisted input and output is derived as a fixed descendant of `<repo-root>/reports/<report-kind>/`.

The first registered consumer is `skill-session-review`, with `.input/<skill-name>.json`, `<skill-name>.md`, and `<skill-name>.html` as its only payload-bearing paths.

This guide does not authorize report generation, replacement, deletion, browser launch, Git mutation, or network access by itself. The agent must preview the exact paths and effects and obtain explicit authorization. It does not relax [Governed File Writing](./governed-file-writing.md) for files outside the fixed report subtree. In particular, a repo-root `.gitignore` update is a separate governed-file operation and must never be a side effect of an input or report writer.

## 2. Command Signatures and Operation Boundaries

Use separate commands for the reusable input draft and each rendered artifact:

```text
python "<skill-dir>/scripts/<input-manager>.py" create \
  --repo-root "<confirmed-root>" --name <safe-basename>

python "<skill-dir>/scripts/<input-manager>.py" replace \
  --repo-root "<confirmed-root>" --name <safe-basename> \
  --expected-sha256 <64-lowercase-hex>

python "<skill-dir>/scripts/<report-writer>.py" \
  --repo-root "<confirmed-root>" --name <safe-basename> \
  --format <registered-format> \
  --review-json "<confirmed-root>/reports/<report-kind>/.input/<safe-basename>.json"

python "<skill-dir>/scripts/<input-manager>.py" remove \
  --repo-root "<confirmed-root>" --name <safe-basename> \
  --expected-sha256 <input-sha256> \
  --artifact-sha256 <format>=<sha256> [--artifact-sha256 <format>=<sha256> ...]
```

`create` and `replace` receive the complete JSON document through raw standard input. A report-writer invocation reads exactly one validated input file and writes exactly one selected artifact. `remove` deletes exactly one input file and accepts no payload on standard input. Opening a report is a separate execute-only command after all required artifacts exist.

An invocation may create missing, fixed ancestor directories inside `reports/<report-kind>/` only after all applicable preflight checks pass. It must not create arbitrary sibling paths or more than one payload-bearing file.

## 3. Required Contracts

### Repository, names, and paths

- Accept a literal, explicitly confirmed repository root; never infer it from the current directory.
- Hard-code the report kind and allowed output formats in the helper. Do not accept a caller-provided report directory, extension, or destination path.
- Validate the basename with a documented allow-list expression. Reject absolute names, separators, traversal, alternate extensions or casing, symlinks, junctions, and reparse-point escapes.
- Derive the input as `<root>/reports/<report-kind>/.input/<name>.json` and each artifact as `<root>/reports/<report-kind>/<name>.<registered-extension>`. A supplied input path must resolve to the derived input path exactly.
- In a Git repository, require the fixed report subtree to be effectively ignored before creating or replacing an input or artifact. If the ignore rule is missing, stop and route the repo-root `.gitignore` change through a separately authorized helper that follows [Governed File Writing](./governed-file-writing.md). In a non-Git repository, report `non-repo` and do not create a `.gitignore` implicitly.

### Input lifecycle

- Before `create` or `replace` performs any filesystem mutation, decode strict UTF-8, normalize line endings, validate the complete schema and cross-field invariants, and scan for likely secrets.
- Make input creation no-clobber. Input replacement requires `replace` plus the caller's SHA-256 of the current input, rechecked immediately before finalization.
- Return the input path, mode, normalized byte count, SHA-256, and Git visibility without echoing the JSON body.
- A report writer must strictly decode, fully revalidate, recompute protected fields, and rescan the persisted JSON before creating directories, temporary files, or artifacts. This defends against changes between input preparation and rendering.
- Keep the input after any partial report failure so the missing artifact can be retried from identical bytes.
- Remove the input only while holding the same per-destination advisory leases used by writers, acquired in one documented order for the input and every registered artifact. Re-read and validate every proof inside the complete lease set, bind the final input read to its regular-file identity, and verify that the destination still names that identity immediately before removal. A mismatch, missing artifact, incomplete format set, lease contention, late replacement, or identity drift must preserve every object not authorized by the submitted proofs.

### Artifact persistence and side effects

- Each report-writer invocation writes one requested format only. Creation is no-clobber; replacement requires `--replace --expected-sha256` for that artifact.
- Use an exclusively created temporary sibling without following links. Recheck replacement authorization immediately before atomic finalization, then read back and verify normalized bytes and SHA-256.
- Clean up only temporary files created by the current invocation. Preserve foreign residue and all prior artifact bytes on failure.
- Emit bounded metadata only: path, format, mode, byte count, SHA-256, and Git visibility. Do not echo the report body or secret-like input.
- Input managers and report writers must not mutate `.gitignore`, stage, commit, launch a browser, execute unrelated external programs, or access the network. Read-only Git visibility checks are allowed.

## 4. Validation and Error Matrix

Implement stable non-zero outcomes for the following classes; a consumer may assign exact numeric exit codes but must document and test them.

| Case | Expected behavior |
|------|-------------------|
| Repository root is missing, ambiguous, a link, or not a directory | Refuse before reading or mutating the report subtree |
| Git report subtree is not effectively ignored | Refuse all report-subtree writes; do not mutate `.gitignore` |
| Input or artifact name/path differs from the unique derived path | Refuse without following or creating it |
| Input is invalid UTF-8, schema-invalid, cross-field-invalid, or secret-like | Refuse before creating directories, destinations, or temporary files |
| Input changed after preparation | Report writer revalidation fails or renders the newly validated bytes; it never trusts preparation metadata alone |
| Input or artifact already exists | Refuse creation and preserve current bytes |
| Replacement hash is stale | Refuse replacement and preserve current bytes |
| Destination or temporary sibling is a symlink/reparse point | Refuse without changing the link, its target, or prior bytes |
| Finalization fails | Preserve prior bytes and remove only an invocation-owned temporary file |
| One report format succeeds and another fails | Preserve the validated input and successful artifact; retry only the missing or failed format |
| Input removal lacks a required artifact/hash or sees a stale input hash | Preserve the input and all artifacts |
| Input or artifact writer holds a destination lease during removal | Fail closed, release leases already acquired by the remover, and preserve all files |
| Input or artifact is replaced after an earlier proof read | Detect the changed proof or file identity and preserve the replacement |
| Input removal proof is complete and all leased identities remain stable | Delete only the exact proved input file and report bounded removal metadata |
| Git repository state varies | Report ignored, tracked, untracked, or non-repository status without staging |

## 5. Good, Borderline, and Bad Examples

Good: the agent previews the fixed input, Markdown, and HTML paths; confirms the report subtree is already ignored; pipes validated JSON to an input manager; invokes the report writer once per format; and removes the input only after supplying all three returned hashes.

Borderline: the Markdown artifact succeeds and HTML fails. Keep the input and Markdown artifact, report the partial state, and retry HTML from the same input. Do not delete the draft or silently replace Markdown.

Bad: the report writer accepts `--output ../report.html`, lets the agent directly overwrite `.input/<name>.json`, appends `.gitignore` during rendering, writes Markdown and HTML in one invocation, deletes the input after only one format succeeds, or opens a browser as a write side effect.

## 6. Tests Required

- Test input create, existing-input refusal, authorized replacement, stale-hash refusal, strict UTF-8, BOM/LF normalization, schema and cross-field rejection, secret rejection, read-back hashing, and no residue before validation.
- Test exact-path identity for input and every format, including wrong basename, casing, extension, nested paths, traversal, symlinks, junctions, and reparse points.
- Test the ignored-subtree precondition in Git repositories and `non-repo` behavior. Assert that neither the input manager nor report writer changes `.gitignore` or the Git index.
- Run the full governed persistence matrix for every registered output format: create, no-clobber, authorized replacement, stale replacement, hostile temporary sibling, injected finalization failure, read-back verification, and Git visibility.
- Mutate a prepared input between operations and prove the report writer revalidates and rescans it before any report mutation.
- Test partial success and retry convergence from identical input bytes. Confirm deterministic reruns produce identical artifact hashes.
- Test input removal with missing formats, incomplete hashes, stale input hash, stale artifact hash, live lease contention, late input replacement, late artifact replacement, file-identity swap, and complete proof. Only complete proof revalidated inside the full fixed-order lease set with a stable input identity may delete the input.
- Exercise every platform and adapter named by the consuming skill, then run skill-local tests, metadata checks, Python compilation, and the full repository CI gate.

## 7. Wrong vs Correct

Wrong:

```text
Write .input/example.json directly, then let one report command append .gitignore,
overwrite both report files, open the browser, and delete the input.
```

Correct:

```text
Root: <explicitly-confirmed-repository-root>
Fixed subtree: reports/<registered-report-kind>/
Ignore precondition: verified first; any .gitignore change is separately governed
Input: raw UTF-8 JSON -> validated no-clobber input-manager invocation
Artifacts: one validated input -> one format per report-writer invocation
Replacement: separate operation with the reviewed current SHA-256
Cleanup: fixed-order input/artifact leases -> re-read every proof -> bind input identity
         -> delete only that proved input while all identities remain stable
Other effects: no staging, commit, browser launch, or network access
```
