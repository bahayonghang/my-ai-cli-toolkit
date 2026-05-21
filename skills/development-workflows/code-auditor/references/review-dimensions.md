# Review Dimensions

Code review dimension definitions and checkpoint specifications.

## When to Use

| Phase | Usage | Section |
|-------|-------|---------|
| Deep Review | Retrieve dimension-specific checklists | All |
| Generate Report | Dimension name mapping | Dimension Names |

---

## Dimension Overview

| Dimension | Weight | Focus | Key Indicators |
|-----------|--------|-------|----------------|
| **Correctness** | 25% | Functional correctness | Boundary conditions, error handling, type safety |
| **Security** | 25% | Security risks | Injection attacks, sensitive data, permissions |
| **Performance** | 15% | Execution efficiency | Algorithm complexity, resource usage |
| **Readability** | 15% | Maintainability | Naming, structure, comments |
| **Testing** | 10% | Test quality | Coverage, boundary tests |
| **Architecture** | 10% | Architectural consistency | Layering, dependencies, patterns |

---

## 1. Correctness

### Checklist

- [ ] **Boundary condition handling**
  - Empty arrays / empty strings
  - Null / Undefined
  - Numeric boundaries (0, negatives, MAX_INT)
  - Collection boundaries (first element, last element)

- [ ] **Error handling**
  - Try-catch coverage
  - Errors not silently swallowed
  - Meaningful error messages
  - Resources properly released

- [ ] **Type safety**
  - Correct type conversions
  - Avoid implicit coercion
  - TypeScript strict mode

- [ ] **Logic completeness**
  - Complete if-else branches
  - Switch has default case
  - Loop termination conditions correct

### Common Issue Patterns

```javascript
// BAD: Missing null check
function getName(user) {
  return user.name.toUpperCase();  // user may be null
}

// GOOD
function getName(user) {
  return user?.name?.toUpperCase() ?? 'Unknown';
}

// BAD: Empty catch block
try {
  await fetchData();
} catch (e) {}  // Error silently swallowed

// GOOD
try {
  await fetchData();
} catch (e) {
  console.error('Failed to fetch data:', e);
  throw e;
}
```

---

## 2. Security

### Checklist

- [ ] **Injection prevention**
  - SQL injection (use parameterized queries)
  - XSS (avoid innerHTML)
  - Command injection (avoid exec)
  - Path traversal

- [ ] **Authentication & authorization**
  - Complete permission checks
  - Token validation
  - Session management

- [ ] **Sensitive data**
  - No hardcoded secrets
  - Logs free of sensitive info
  - Transport encryption

- [ ] **Dependency security**
  - No known vulnerable dependencies
  - Versions pinned

### Common Issue Patterns

```javascript
// BAD: SQL injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD: Parameterized query
const query = `SELECT * FROM users WHERE id = ?`;
db.query(query, [userId]);

// BAD: XSS risk
element.innerHTML = userInput;

// GOOD
element.textContent = userInput;

// BAD: Hardcoded secret
const apiKey = 'sk-xxxxxxxxxxxx';

// GOOD
const apiKey = process.env.API_KEY;
```

---

## 3. Performance

### Checklist

- [ ] **Algorithm complexity**
  - Avoid O(n^2) on large datasets
  - Use appropriate data structures
  - Avoid unnecessary loops

- [ ] **I/O efficiency**
  - Batch operations vs. loop-per-item
  - Avoid N+1 queries
  - Appropriate caching

- [ ] **Resource usage**
  - Memory leaks
  - Connection pooling
  - Stream processing for large files

- [ ] **Async handling**
  - Parallel vs. sequential
  - Promise.all usage
  - Avoid blocking

### Common Issue Patterns

```javascript
// BAD: N+1 query
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
}

// GOOD: Batch query
const userIds = users.map(u => u.id);
const posts = await db.query('SELECT * FROM posts WHERE user_id IN (?)', [userIds]);

// BAD: Sequential execution of parallelizable operations
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// GOOD: Parallel execution
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
```

---

## 4. Readability

### Checklist

- [ ] **Naming conventions**
  - Self-descriptive variable names
  - Function names express actions
  - Constants use UPPER_CASE
  - Avoid abbreviations and single letters

- [ ] **Function design**
  - Single responsibility
  - Length < 50 lines
  - Parameters < 5
  - Nesting < 4 levels

- [ ] **Code organization**
  - Logical grouping
  - Blank line separation
  - Import ordering

- [ ] **Comment quality**
  - Explain WHY, not WHAT
  - Kept up to date
  - No redundant comments

### Common Issue Patterns

```javascript
// BAD: Unclear naming
const d = new Date();
const a = users.filter(x => x.s === 'active');

// GOOD
const currentDate = new Date();
const activeUsers = users.filter(user => user.status === 'active');

// BAD: Overly long function with mixed responsibilities
function processOrder(order) {
  // ... 200 lines covering validation, calculation, saving, notification
}

// GOOD: Split by responsibility
function validateOrder(order) { /* ... */ }
function calculateTotal(order) { /* ... */ }
function saveOrder(order) { /* ... */ }
function notifyCustomer(order) { /* ... */ }
```

---

## 5. Testing

### Checklist

- [ ] **Test coverage**
  - Core logic has tests
  - Boundary conditions tested
  - Error paths tested

- [ ] **Test quality**
  - Tests are independent
  - Assertions are explicit
  - Mocks used appropriately

- [ ] **Test maintainability**
  - Clear naming
  - Consistent structure
  - Avoid duplication

### Common Issue Patterns

```javascript
// BAD: Tests not independent
let counter = 0;
test('increment', () => {
  counter++;  // Depends on external state
  expect(counter).toBe(1);
});

// GOOD: Each test is independent
test('increment', () => {
  const counter = new Counter();
  counter.increment();
  expect(counter.value).toBe(1);
});

// BAD: Missing boundary test
test('divide', () => {
  expect(divide(10, 2)).toBe(5);
});

// GOOD: Includes boundary case
test('divide by zero throws', () => {
  expect(() => divide(10, 0)).toThrow();
});
```

---

## 6. Architecture

### Checklist

- [ ] **Layered structure**
  - Clear layer boundaries
  - Correct dependency direction
  - No circular dependencies

- [ ] **Modularity**
  - High cohesion, low coupling
  - Clear interface definitions
  - Single responsibility

- [ ] **Design patterns**
  - Appropriate pattern usage
  - Avoid over-engineering
  - Follow existing project patterns

### Common Issue Patterns

```javascript
// BAD: Layer violation (Controller directly accesses database)
class UserController {
  async getUser(req, res) {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  }
}

// GOOD: Proper layering
class UserController {
  constructor(private userService: UserService) {}

  async getUser(req, res) {
    const user = await this.userService.findById(req.params.id);
    res.json(user);
  }
}

// BAD: Circular dependency
// moduleA.ts
import { funcB } from './moduleB';
// moduleB.ts
import { funcA } from './moduleA';

// GOOD: Extract shared module or use dependency injection
```

---

## Severity Mapping

| Severity | Criteria |
|----------|----------|
| **Critical** | Security vulnerabilities, data corruption risk, crash risk |
| **High** | Functional defects, severe performance issues, important unhandled boundaries |
| **Medium** | Code quality issues, maintainability concerns |
| **Low** | Style issues, optimization suggestions |
| **Info** | Informational suggestions, learning opportunities |
