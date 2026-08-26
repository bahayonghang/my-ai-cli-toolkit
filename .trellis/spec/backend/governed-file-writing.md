# Governed File Writing

> Use these rules when an installable skill can create or replace a user-visible file in a project.

## 1. Scope and Trigger

This guide applies to helpers that persist generated contracts, plans, prompts, configuration, or other user-visible artifacts. Drafting, reconnaissance, planning approval, or a request to "show" content does not authorize a write. Before invoking a writer, the agent must show the exact target and effect, then obtain explicit authorization for creation or replacement.

## 2. Command Signature

Prefer a narrow helper interface whose destination is derived from a confirmed repository root:

```text
python "<skill-dir>/scripts/<writer>.py" --repo-root "<confirmed-root>" [--name <basename>]
python "<skill-dir>/scripts/<writer>.py" --repo-root "<confirmed-root>" --replace --expected-sha256 <64-lowercase-hex> [--name <basename>]
```

Pass the complete artifact through raw standard input. Do not place contract contents in command arguments or use shell redirection to write the destination.

## 3. Required Contracts

- Accept a literal, explicitly confirmed repository root; do not infer it from the process working directory.
- Restrict the destination to a direct child of that root and reject absolute names, separators, traversal, symlinks, and reparse-point escapes.
- Decode strict UTF-8, allow a leading BOM only when intentionally supported, and normalize line endings to LF before validation and hashing.
- Validate the complete artifact schema and scan for likely secrets before any filesystem mutation.
- Make creation no-clobber by default. Replacement must require an explicit flag plus the caller's SHA-256 of the previously reviewed file, rechecked immediately before finalization.
- Create the temporary sibling exclusively without following links; refuse a pre-existing sibling, track whether this invocation created it, and never delete foreign residue during cleanup.
- Flush the owned temporary sibling and finalize with an operation that cannot expose a partial destination. On failure, clean up only the temporary file owned by this invocation.
- Emit bounded metadata such as path, mode, byte count, SHA-256, and Git visibility. Never echo the artifact body or secret-like input.
- Write exactly one requested file. Do not stage, commit, execute, or send network requests as a side effect.

## 4. Verification Matrix

Cover these cases before treating a governed writer as complete:

| Case | Expected behavior |
|------|-------------------|
| Repository root is missing or ambiguous | Refuse before reading or writing the destination |
| Content is invalid or secret-like | Refuse and leave no destination or temporary residue |
| Destination already exists | Refuse creation without changing the file |
| Replacement hash is stale | Refuse replacement and preserve the current bytes |
| Destination is a symlink, reparse point, or path escape | Refuse without following it |
| Temporary sibling already exists or is a link/reparse point | Refuse without changing or deleting the sibling, its target, or the destination |
| Finalization fails | Preserve the previous version and remove temporary files where safely possible |
| Finalization succeeds | Read back and verify the normalized bytes and SHA-256 |
| Git repository state varies | Report ignored, tracked, untracked, or non-repository status without staging |

## 5. Examples

Good: an agent previews `D:\work\repo\GOAL.md`, obtains create approval, pipes the validated contract to a helper, and reports the returned hash.

Borderline: an agent receives general implementation approval but has not shown that it will replace an existing contract. It must request replacement approval and include the reviewed hash.

Bad: a skill silently writes to `$PWD`, accepts `../GOAL.md`, overwrites an existing file, prints the contract body, or stages the result.

## 6. Test Requirements

- Add deterministic tests for creation, existing-file refusal, authorized replacement, stale-hash refusal, invalid UTF-8, BOM/LF normalization, secret detection, path escape, and symlink/reparse rejection.
- Cover stale ordinary temporary siblings and hostile temporary symlink/reparse paths; assert they and any external targets remain unchanged and that cleanup removes only invocation-owned files.
- Verify both Git and non-Git reporting, including ignored, tracked, and untracked outcomes.
- Exercise every platform or adapter named by the skill and preserve compatibility aliases intentionally exposed by the interface.
- Assert failure safety: original bytes remain intact and temporary siblings do not leak.
- Run the skill-local tests, repository metadata checks, Python compilation, and the full repository CI gate.

## 7. Wrong vs Correct

Wrong:

```text
Write GOAL.md in the current directory and overwrite whatever is there.
```

Correct:

```text
Target: <confirmed-repository-root>/GOAL.md
Effect: create only; no overwrite, staging, execution, or network access
Input: validated UTF-8 contract over stdin
Success evidence: read-back SHA-256 plus Git visibility
Replacement: separate confirmation and expected SHA-256 required
```
