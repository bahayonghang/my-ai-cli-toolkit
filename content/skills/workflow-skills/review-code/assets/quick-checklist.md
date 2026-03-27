# Quick Review Checklist

Use this checklist as a review memory aid, not as literal output text.

- Localize the final review to the user's language.
- In Chinese mode, map blocking items to `[必须修复]`, important items to `[建议修改]`, and optional items to `[仅供参考]`.
- In English mode, map them to `Must Fix`, `Should Fix`, and `Nice to Have`.
- When intent is unclear, ask a focused question instead of pretending certainty.

## Blocking Issues (Must Fix)

- [ ] **Functional correctness**: Does the code implement the intended functionality?
- [ ] **Obvious defects**: Are there obvious logic errors or unhandled edge cases?
- [ ] **Security risks**: Are there SQL injection, XSS, or sensitive data exposure issues?
- [ ] **Performance issues**: Are there obvious performance bottlenecks such as N+1 queries or infinite loops?
- [ ] **Error handling**: Are errors handled correctly without causing crashes?

## Important Issues (Strongly Recommended)

- [ ] **Code readability**: Is the code easy to understand? Are names clear?
- [ ] **Duplicate code**: Is there extractable duplicate logic?
- [ ] **Test coverage**: Do critical paths have sufficient test coverage?
- [ ] **Documentation**: Do public APIs have appropriate documentation and comments?
- [ ] **Type safety**: Is the type system fully leveraged?

## Improvement Suggestions (Optional)

- [ ] **Code style**: Does the code follow project coding standards?
- [ ] **Performance optimization**: Is there a more efficient implementation?
- [ ] **Design patterns**: Could a better design pattern be applied?
- [ ] **Logging**: Is there appropriate logging for debugging?

## Language-Specific Checks

### Python
- [ ] Are type annotations used?
- [ ] Are there bare `except` statements?
- [ ] Are mutable default arguments avoided?
- [ ] Is async code handled correctly?

### JavaScript/TypeScript
- [ ] Is the `any` type avoided?
- [ ] Are effect dependency arrays complete?
- [ ] Are memory leaks avoided such as missing cleanup for listeners or timers?
- [ ] Are Promise errors handled correctly?

### Go
- [ ] Are errors handled correctly instead of ignored?
- [ ] Do goroutines have exit mechanisms?
- [ ] Is context propagated correctly?
- [ ] Is formatting delegated to `gofmt` rather than argued about in review?

### Rust
- [ ] Is `unwrap` usage appropriate?
- [ ] Are lifetime annotations correct?
- [ ] Does ownership transfer match expectations?
- [ ] Are error types clear?

### Java
- [ ] Are appropriate collection types used?
- [ ] Is exception handling adequate?
- [ ] Is Stream API used appropriately?
- [ ] Is `Optional` used correctly?

### Vue
- [ ] Are props mutated directly?
- [ ] Do computed properties have side effects?
- [ ] Do watchers have cleanup functions?
- [ ] Is component responsibility single?

### React
- [ ] Are Hooks called at the top level?
- [ ] Are effect dependency arrays complete?
- [ ] Are unnecessary re-renders avoided?
- [ ] Are components too large?

## Review Priority

1. High priority: blocking issues and security issues
2. Medium priority: important issues and code readability
3. Low priority: improvement suggestions and style details

## Feedback Principles

- **Specific**: Point out exact code locations and issues
- **Constructive**: Provide improvement suggestions, not just complaints
- **Respectful**: Maintain a professional and respectful tone
- **Educational**: Explain why the suggestion is better; help team members grow
- **Ask, don't assume**: When the author's intent is unclear, ask a precise question before treating it as a defect
- **Praise concretely**: Recognize specific good practices instead of generic approval
