# Research: Replying to Review Comments as PR Author (etiquette, thread resolution, disagreement)

- **Query**: responding to review comments etiquette, who resolves threads, suggested changes, disagreeing constructively
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### Core Etiquette

Google eng-practices "How to handle reviewer comments" (google.github.io/eng-practices/review/developer/handling-comments.html):

- **Never respond in anger.** It's a serious breach of professional etiquette that lives forever in the review tool. If too annoyed to reply kindly, walk away and reply later when calm.
- When a comment reads as harsh, reframe it: "What is the _constructive_ thing the reviewer is trying to communicate?" and respond as if that's what they said.
- First question on every comment: **"Do I understand what the reviewer is asking for?"** — before agreeing or disagreeing.
- Courtesy and respect are the first priority; assume competence and goodwill. (chromium cl_respect.md)

### Address Every Comment

Chromium "Respectful Changes" (chromium docs/cl_respect.md):

- **Be sure reviewers feel all comments are addressed before you commit/merge.** Each comment must be resolved one of these ways:
  - **Question** → addressed by providing an answer.
  - **Suggestion** → addressed one of three ways: (1) adopt it now ("Done."), (2) defer it to a follow-up change (leave a `TODO` with a bug #), or (3) push back with additional information.
- When pushing back, make sure everyone agrees on the _problem_ before discussing the _solution_; if it keeps needing explanation, consider adding a code comment or expanding docs.
- **Wait for LGTM:** as a rule, even after addressing a comment in a new patch, don't merge until the reviewer gives their LGTM/approval — unless they OK'd it in advance. If you must land urgently while a reviewer is OOO, land it, send a note explaining why, and commit to acting on follow-up comments in a subsequent PR.

### Disagreeing Constructively

- If you understand a comment but disagree, think **collaboratively, not combatively or defensively**. Ask for clarification, discuss pros/cons, explain why your approach is better for the codebase/users. (handling-comments.html)
- Consider that the reviewer may be right — they sometimes see things you don't. If their argument makes sense from a code-health perspective, concede and move on.
- **First step in any conflict = reach consensus** with the reviewer. If stuck, a quick face-to-face/VC often resolves it faster than comment ping-pong — but **record the outcome as a CL comment** for future readers. If still unresolved, escalate (tech lead, maintainer, eng manager). Don't work around a reviewer. (standard.html; pushback.html; cl_respect.md)

### Who Resolves Threads (convention)

- No single GitHub-enforced rule, but the common convention: **the reviewer who raised a thread resolves it** once satisfied (or the author resolves after the reviewer confirms), rather than the author unilaterally resolving to hide unaddressed feedback. Chromium's guidance ("be convinced your reviewers feel all comments have been addressed") supports reviewer-confirmed resolution.
- GitHub permits either party with access to resolve a conversation; teams often configure branch protection to **require all conversations resolved before merge**.

### Suggested Changes (GitHub feature)

- Reviewers can propose exact edits via a `suggestion` code block in a review comment; the author can **apply it with one click** ("Commit suggestion"), which creates a commit crediting the reviewer. This is the fastest path for small, concrete fixes — reviewers are encouraged to use it (Conventional Comments recommends pairing `suggestion`/`issue` with patches).

## Caveats / Not Found

- GitHub does not enforce a "reviewer resolves" rule; it's a team convention. The strongest documented signal (Google/Chromium) is that the _author must not consider a comment done until the reviewer agrees it's addressed_.
