# Claim verification

Every statement in a plan that asserts something about the repository is a claim. Classify the claim,
then collect the evidence its class requires. Do not accept a claim because the claim is plausible.

## Claim classes

| Class       | Example in a plan                                               | Required evidence                                                                                             |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Existence   | "`styles.css:1813` defines `.font-picker-list`"                 | Read the file at that line. Confirm the construct.                                                            |
| Behavior    | "the handler repaints the whole page on every push"             | Read the implementation. Trace the call chain to the effect. A name is not evidence of behavior.              |
| Identifier  | "the message kind is `summaryChanged`"                          | Compare character by character against the code. Do not correct a spelling difference; report the difference. |
| Count       | "the change touches 3 files", "the import block stays in order" | Recount from the source. Re-derive the order.                                                                 |
| Absence     | "the settings page has no scroll-tracking node"                 | Search the whole render path, not one function. State the search you ran.                                     |
| Environment | "the test runner uses the node environment"                     | Read the config file. Name the key you found or the key you did not find.                                     |
| External    | "this browser API throws for that input type"                   | Cite the specification or the vendor document. When you cannot check, move the claim to the unverified list.  |

## Citation resolution

A `path:line` citation resolves only when the line holds the construct the text claims.

1. Read the cited line and a few lines around the cited line.
2. Confirm the construct matches the description.
3. Record `resolved`, `wrong construct`, `line out of range`, or `missing file`.

A citation that points at a function body line instead of the declaration is a minor imprecision, not
a finding, when the surrounding text makes the target clear. A citation that points at a different
symbol is a finding.

Citations age. When the task has started, the line numbers in the plan describe the pre-change file.
Verify against the base revision, not the working tree:

```bash
git show <base>:<path>
git diff <base>..HEAD -- <path>
```

Report a shifted line number as a note, not as a defect, when the plan was written before the change.

## Absence claims need a stated search

An absence claim is the easiest claim to get wrong, because a narrow search returns nothing and reads
like proof. Every absence claim in your report states the search that produced the claim: the pattern,
the path, and the range of lines.

Wrong: "no other code reads that field."

Right: "a search for the field name across `src/` returned four call sites, all inside the render
function at lines 981 to 995."

## Do not fabricate evidence

When a claim cannot be checked with the tools available, write the claim in the unverified list and
name the reason. Reasons that belong there:

- The claim concerns a runtime state that static reading cannot show.
- The claim concerns an external service, a device, or a specific operating system build.
- The claim concerns a rendering result that needs a browser.
- The source repository is not present on this machine.

"Probably correct" is not a verdict. A claim with no evidence is neither a finding nor a confirmation.

## Verify the base revision, not your memory

Read the file. Do not answer from a summary earlier in the conversation, and do not answer from
general knowledge of the framework. A plan that cites a real line in a file that changed since the
plan was written needs the base revision, and a summary cannot supply the base revision.
