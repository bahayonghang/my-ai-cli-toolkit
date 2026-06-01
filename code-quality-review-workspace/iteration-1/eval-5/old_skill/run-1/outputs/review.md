# Code Quality Review — `order_service.ts`

Focus: maintainability. Read-only review; no files were changed.

## Verdict

REQUEST CHANGES

The checkout flow concentrates several maintainability regressions — a sprawling mode-based branch, duplicated pricing logic, a duplicated `formatMoney` that shadows a canonical helper, pervasive `any` at the public boundary, and a charge-before-validate ordering that couples brittle structure to incorrect control flow.

## Findings

### 1. [Blocker] `processCheckout` public boundary is fully untyped (`any`)

- Location: order_service.ts:6, 11, 15-19
- Evidence: `processCheckout(input: any, mode: string, opts: any): Promise<any>`, plus `formatMoney(cents: any)` and `findOrder(id: any)`. Every field access (`input.items`, `input.orderId`, `opts.coupon`, `opts.cycles`, `opts.trial`, `opts.wrapFee`, `order.userId`) is therefore unchecked.
- Why it matters: This is the exported entry point of the module — the contract future callers and maintainers rely on. With `any`, the real invariants (shape of `input`, allowed `mode` values, optional `opts` keys, return shape) are invisible. The compiler cannot catch a renamed field, a missing `items` array, or a misspelled `coupon`, so refactors and feature additions are unsafe and silently break at runtime. The two return shapes (`{ ok: false }` vs `{ ok: true, total, label }`) are also untyped, so consumers cannot rely on a discriminated result.
- Recommended remediation: Introduce explicit types: a `CheckoutInput` interface (`{ orderId: string; items: Array<{ price: number; qty: number }> }`), a `CheckoutMode` union (`"standard" | "subscription" | "gift"`), per-mode `opts` types (or a discriminated union keyed on `mode`), and a `CheckoutResult` discriminated union. Type `formatMoney(cents: number)` and `findOrder(id: string)`.
- Confidence: High

### 2. [High] Mode dispatch is a scattered if/else chain with duplicated pricing logic

- Location: order_service.ts:22-36
- Evidence: Three near-identical loops — `for (const it of input.items) total += it.price * it.qty` appears in `standard` and `gift` verbatim, and `subscription` repeats it with a `* (opts.cycles || 1)` factor. Coupon handling (`total = total - opts.coupon`) is copy-pasted in two branches; the trailing `else { total = 0 }` silently swallows unknown modes.
- Why it matters: Pricing policy is spread across parallel branches instead of living in one place. Adding a new mode, or changing how coupons/line-item totals are computed, requires editing multiple branches and risks them drifting apart (the coupon rule is already inconsistent — applied in `standard`/`subscription` but not `gift`). The silent `else` hides invalid input rather than surfacing it.
- Recommended remediation: Extract a single `lineItemSubtotal(items)` helper, then make each mode a small policy that adjusts the subtotal (cycles multiplier, wrap fee, trial override, coupon). Drive dispatch from a typed `mode` union with a `default` that throws/returns an explicit error rather than silently zeroing the total. This collapses the duplicated loops into one and isolates per-mode policy.
- Confidence: High

### 3. [High] Duplicated `formatMoney` shadows the canonical `shared/money.ts` helper

- Location: order_service.ts:5-8
- Evidence: The file's own comment states `a formatMoney already lives in shared/money.ts and is used elsewhere`, yet a local `formatMoney(cents: any)` is redefined here and used at lines 43-44.
- Why it matters: Money formatting is exactly the kind of cross-cutting concern that must have one canonical owner. A second copy means currency/locale/rounding rules can diverge between this module and the rest of the codebase, and a future fix to the shared helper won't reach this call site. The local copy also weakens the type (`any` instead of `number`).
- Recommended remediation: Delete the local function and import the canonical helper: `import { formatMoney } from "./shared/money"` (adjust path to the real location). Confirm the shared signature matches the `cents: number` usage here.
- Confidence: Medium (the canonical helper's existence is asserted by an in-file comment; I could not open `shared/money.ts` in this scope — see Scope limitations)

### 4. [High] Charge happens before validation and before any atomicity guarantee

- Location: order_service.ts:38-41
- Evidence: The comment reads `charge first, then validate, then persist order status`, and the code does exactly that: `await db.payments.charge(order.userId, total)` runs first, then `if (!order.userId) return { ok: false }`, then `db.orders.update(...)`.
- Why it matters: Although this is partly a correctness bug, it is also a maintainability/boundary smell that the review checklist flags under orchestration and atomicity: a payment side effect fires before the guard that determines whether the order is even valid, and before the order status is persisted. If `order.userId` is missing, the code charges (passing `undefined` as the user) and then returns `{ ok: false }` with no compensating action, leaving the system in a half-applied state. The validate/charge/persist steps are sequenced in an order that makes the failure modes hard to reason about and hard to change safely.
- Recommended remediation: Reorder to validate-then-charge-then-persist: resolve and validate `order` (return early if `userId`/order missing) before any charge, compute `total`, then charge and persist as an atomic unit (transaction or charge-then-update with a rollback/compensation path on failure). At minimum, move the `if (!order.userId)` guard above the `charge` call.
- Confidence: High

### 5. [Medium] `findOrder` is a thin pass-through wrapper, and `order` falls back to `{}`

- Location: order_service.ts:10-13, 20
- Evidence: `function findOrder(id: any) { return db.orders.find(id); }` adds no logic over `db.orders.find`, and its own comment labels it a `pass-through wrapper`. At line 20, `const order = findOrder(input.orderId) ?? {}` substitutes an empty object on a miss.
- Why it matters: The wrapper adds indirection without hiding any complexity (an abstraction-quality smell), and the `?? {}` fallback masks the "order not found" case as a valid-but-empty order. Downstream code then reads `order.userId` off an empty object, which is what makes finding #4's guard fire only after the charge. The fallback hides the real invariant (order may not exist) instead of forcing the caller to handle it.
- Recommended remediation: Inline `findOrder` (call `db.orders.find` directly) or give it real value (typed return, not-found handling). Replace `?? {}` with an explicit not-found branch that returns early with a typed error result before any pricing or charging.
- Confidence: Medium

### 6. [Low] String concatenation for log/label and repeated `formatMoney(total)` calls

- Location: order_service.ts:43-44
- Evidence: `logger.info("checkout " + formatMoney(total))` and `label: formatMoney(total)` — `formatMoney(total)` is computed twice, and the log message is built by `+` concatenation.
- Why it matters: Minor. The double call is a trivial redundancy; concatenated log strings are slightly harder to grep/structure than a single formatted value or structured log field. Not merge-blocking.
- Recommended remediation: Compute `const label = formatMoney(total)` once and reuse it for both the log line and the return value; optionally pass structured fields to `logger.info`.
- Confidence: High

## Checked but not flagged

- File size: at 46 lines the file is well under any growth threshold; no split needed today. The concern is internal structure (mode branch, duplication), not length.
- Imports: `db` and `logger` are imported normally; no obvious wrong-layer dependency beyond the duplicated-helper issue in #3.
- Return-value naming: `{ ok, total, label }` shape is reasonable once typed (see #1); no separate finding.

## Scope limitations

- Only `order_service.ts` was available in the review scope. `./db`, `./logger`, and the referenced `shared/money.ts` are not present in this directory or the evals tree, so findings #3, #4, and #5 rely on in-file comments and call-site usage rather than the actual module contracts. The existence and signature of the canonical `formatMoney` (finding #3) and the semantics of `db.payments.charge` / `db.orders.find`/`update` (finding #4) could not be verified directly — confidence is lowered accordingly.
- No tests or callers were available, so I could not confirm whether consumers depend on the current untyped return shape or the silent unknown-mode behavior.
- No line-level diff was provided; this is a whole-file review of the current state rather than a change-scoped review.
