# Code Quality Review

- `feature`: order-service
- `target`: order_service.ts (single file supplied by the user)
- `base`: n/a (no git diff; reviewed full file as-is)
- `report_language`: en
- `created_at`: 2026-06-01T03:31:33Z

## Verdict

REQUEST CHANGES

`processCheckout` charges the customer before validating the order and silently weakens its type and money contracts, so it should not merge without a structural fix.

## Findings

### CQ-001 [Blocker] Payment is charged before the order is validated

- Location: order_service.ts:39-41
- Evidence:
  ```ts
  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
  `findOrder(input.orderId) ?? {}` (line 20) means a missing order becomes `{}`, so `order.userId` is `undefined`. The code then calls `db.payments.charge(undefined, total)` and only afterward checks `if (!order.userId)` and returns `{ ok: false }`.
- Why it matters: this is a half-applied / out-of-order side-effect sequence (the "orchestration and atomicity" row of the checklist). The charge happens against an invalid/undefined user, and on the failure path the function returns `{ ok: false }` after money may already have moved, with no compensating refund and no order record updated. The ordering also makes the validation guard dead for its stated purpose. This is unsafe to ship and unsafe for future changes to build on.
- Recommended remediation: validate first, charge last. Resolve and validate the order (reject a missing order explicitly instead of `?? {}`), compute the total, then charge, then persist — and treat charge + status update as an atomic unit (or wrap them so a failed persist triggers a refund/rollback). At minimum the guard must run before `db.payments.charge`.
- Confidence: High

### CQ-002 [High] `?? {}` fallback hides "order not found" and propagates an invalid shape

- Location: order_service.ts:20 (and `findOrder` at 11-13)
- Evidence: `const order = findOrder(input.orderId) ?? {};` turns a missing order into an empty object that flows into the charge/validate/persist sequence below.
- Why it matters: the boundary silently converts "no such order" into "an order with no fields," so the not-found failure mode leaks downstream into payment and persistence instead of being handled at the source. This is the same boundary anti-pattern the skill calls out: a silent empty-object fallback that erases the real invariant.
- Recommended remediation: make the missing-order case explicit. Type `findOrder` to return `Order | null`, and have `processCheckout` reject (early return / throw) when the order is null, before any total math or charge.
- Confidence: High

### CQ-003 [High] Pervasive `any` erases the function's type contract

- Location: order_service.ts:6 (`cents: any`), 11 (`findOrder(id: any)`), 15-19 (`input: any`, `opts: any`, `Promise<any>`)
- Evidence: the public entry point `processCheckout(input: any, mode: string, opts: any): Promise<any>` and helpers are typed with `any`, including `formatMoney(cents: any)`.
- Why it matters: every caller loses compiler help, and the real shapes (`items[].price/qty`, `opts.coupon/cycles/trial/wrapFee`, the `{ ok, total, label }` result) are only discoverable by reading the body. Field typos and shape drift become silent runtime bugs, and refactors can't be checked. `mode: string` likewise should be a closed union.
- Recommended remediation: introduce explicit types — e.g. `CheckoutInput`, a `CheckoutMode = "standard" | "subscription" | "gift"` union, a `CheckoutOpts` shape, and a typed `CheckoutResult`; type `formatMoney(cents: number)`. Let the compiler enforce the contract at the boundary.
- Confidence: High

### CQ-004 [Medium] `mode` branching duplicates pricing logic and scatters policy

- Location: order_service.ts:23-36
- Evidence: each `mode` branch re-implements the `for (const it of input.items) total += it.price * it.qty` line-item loop and applies coupon/trial/wrap/cycle adjustments inline; the `else` branch silently sets `total = 0`.
- Why it matters: this is branching-complexity / structural-simplification: the core line-item sum is duplicated three times, and per-mode policy (coupon, trial→0, wrapFee, cycles) is interleaved with it, so adding a mode or changing coupon rules means editing several branches. The silent `else → 0` also masks an unknown mode rather than rejecting it.
- Recommended remediation: compute the base subtotal once (`items.reduce(...)`), then apply mode-specific policy via a small per-mode strategy/helper (a map keyed by the `CheckoutMode` union). Make an unknown mode an explicit error rather than a silent `0`.
- Confidence: Medium

### CQ-005 [Medium] Local `formatMoney` duplicates the canonical `shared/money.ts` helper

- Location: order_service.ts:5-8
- Evidence: the file's own comment states `a formatMoney already lives in shared/money.ts and is used elsewhere`, yet a second `formatMoney` is defined locally.
- Why it matters: canonical-ownership / duplication. Two implementations of money formatting will drift (rounding, currency symbol, locale), and money formatting is exactly the kind of logic that should be defined once. The local copy also takes `cents: any`, so it can format non-numeric input without complaint.
- Recommended remediation: delete the local function and import `formatMoney` from `shared/money.ts`; if the shared one is insufficient, extend it there rather than forking it here.
- Confidence: High

### CQ-006 [Low] `findOrder` is a thin pass-through wrapper that adds no value

- Location: order_service.ts:10-13
- Evidence: `function findOrder(id: any) { return db.orders.find(id); }` — its own comment labels it a "pass-through wrapper around db.orders.find."
- Why it matters: abstraction quality — the wrapper adds an indirection without hiding any complexity. It is only worth keeping if it earns its place (e.g., by adding typing/not-found handling per CQ-002).
- Recommended remediation: either inline `db.orders.find(input.orderId)` at the call site, or repurpose the wrapper to add real value — a typed signature and explicit not-found handling — which would also resolve CQ-002.
- Confidence: Medium

## Checked but not flagged

- File size and module organization: the file is ~45 lines and single-purpose; no file-growth concern.
- Logging: `logger.info` usage at line 43 is benign and not a maintainability risk.
- Coupon arithmetic could in theory drive `total` negative, but with no validation contract supplied I treat that as part of CQ-001/CQ-003 (missing input validation) rather than a separate finding.

## Scope limitations

- Single file only. The referenced modules `./db`, `./logger`, and `shared/money.ts` were not provided, so the exact `db.orders.find` return type, `db.payments.charge` semantics (idempotency, throw-vs-return), and the canonical `formatMoney` signature could not be inspected. The duplication and ordering findings rely on the file's own comments and on standard checkout semantics; confirm against the real modules.
- No git diff / base ref was available, so this reviews the file as a whole rather than an incremental change. No tests, lint, or build config were supplied, so no verification was run.
