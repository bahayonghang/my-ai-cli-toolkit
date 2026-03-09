# Quick Review Checklist

## 🔴 Blocking Issues (Must Fix)

- [ ] **Functional correctness**: Does the code implement the intended functionality?
- [ ] **Obvious defects**: Are there obvious logic errors or unhandled edge cases?
- [ ] **Security risks**: Are there SQL injection, XSS, or sensitive data exposure issues?
- [ ] **Performance issues**: Are there obvious performance bottlenecks (e.g., N+1 queries, infinite loops)?
- [ ] **Error handling**: Are errors handled correctly without causing crashes?

## 🟠 Important Issues (Strongly Recommended)

- [ ] **Code readability**: Is the code easy to understand? Are names clear?
- [ ] **Duplicate code**: Is there extractable duplicate logic?
- [ ] **Test coverage**: Do critical paths have sufficient test coverage?
- [ ] **Documentation**: Do public APIs have appropriate documentation and comments?
- [ ] **Type safety**: Is the type system fully leveraged (TypeScript / Python type hints, etc.)?

## 🟡 Improvement Suggestions (Optional)

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
- [ ] Are useEffect dependency arrays complete?
- [ ] Are memory leaks avoided (event listener cleanup)?
- [ ] Are Promise errors handled correctly?

### Go
- [ ] Are errors handled correctly (not ignored)?
- [ ] Do goroutines have exit mechanisms?
- [ ] Is context propagated correctly?
- [ ] Is gofmt formatting applied?

### Rust
- [ ] Is `unwrap` usage appropriate?
- [ ] Are lifetime annotations correct?
- [ ] Does ownership transfer match expectations?
- [ ] Are error types clear?

### Java
- [ ] Are appropriate collection types used?
- [ ] Is exception handling adequate?
- [ ] Is Stream API used instead of loops where appropriate?
- [ ] Is Optional used correctly?

### Vue
- [ ] Are props mutated directly?
- [ ] Do computed properties have side effects?
- [ ] Do watchers have cleanup functions?
- [ ] Is component responsibility single?

### React
- [ ] Are Hooks called at the top level?
- [ ] Are useEffect dependency arrays complete?
- [ ] Are unnecessary re-renders avoided?
- [ ] Are components too large?

## Review Priority

1. **High priority**: Blocking issues, security issues
2. **Medium priority**: Important issues, code readability
3. **Low priority**: Improvement suggestions, code style

## Feedback Principles

- **Specific**: Point out exact code locations and issues
- **Constructive**: Provide improvement suggestions, not just complaints
- **Respectful**: Maintain a professional and respectful tone
- **Educational**: Explain why the suggestion is better; help team members grow
