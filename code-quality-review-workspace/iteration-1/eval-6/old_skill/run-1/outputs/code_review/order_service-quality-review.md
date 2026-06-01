# Code Quality Review — `order_service.ts`

Reviewed file: `skills/development-workflows/code-quality-review/evals/files/order_service.ts`
Review type: Code quality / maintainability (read-only; input file unchanged)
Saved for: team audit / later reference

## Verdict

REQUEST CHANGES

The checkout flow charges the customer before validating the order and weakens every boundary with `any`, so the structure is unsafe to extend in its current shape.

## Findings

### 1. [Blocker] Payment is charged before the order is validated

- Location: `order_service.ts:38-41`
- Evidence:
  ```ts
  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
- Why it matters: `findOrder` falls back to `{}` (line 20), so `order.userId` can be `undefined`. The code charges `db.payments.charge(undefined, total)` and only then checks `!order.userId` and returns `{ ok: false }`. The payment side effect already happened, but the order is never marked `paid` — leaving money taken with no corresponding order update (a half-applied, non-atomic state). The ordering is also self-contradicted by its own comment ("charge first, then validate"). This is a structural correctness/atomicity defect that makes the function unsafe to build on.
- Recommended remediation: Validate first (resolve and assert `order.userId`, reject unknown orders), compute the total, then charge, then persist — and keep charge+persist atomic (transaction or compensating refund on persist failure). Return early on a missing order before any side effect.
- Confidence: High

### 2. [Blocker] Pervasive `any` erases the order/checkout contract

- Location: `order_service.ts:6,11,15-19` (signature `input: any, mode: string, opts: any): Promise<any>`)
- Evidence: `formatMoney(cents: any)`, `findOrder(id: any)`, and `processCheckout(input: any, mode: string, opts: any): Promise<any>`. `mode` is an open `string` rather than a closed union.
- Why it matters: Every input and the return value are untyped, so the real invariants (item shape, coupon/cycles/trial/wrapFee option keys, the set of valid modes, the result shape) live only in the reader's head. Typos like `opts.cycle` vs `opts.cycles` or an unknown `mode` fail silently (see Finding 4). This is the boundary/type-contract problem the checklist flags: optionality and `any` hide the true shape and make future changes unsafe.
- Recommended remediation: Introduce explicit types — `CheckoutInput` (with a typed `items: LineItem[]`), `CheckoutMode = "standard" | "subscription" | "gift"`, a discriminated `CheckoutOptions`, and a typed `CheckoutResult`. Type `findOrder` against the `Order` model so `order.userId` is known nullable rather than `any`.
- Confidence: High

### 3. [High] Per-mode branching duplicates the total calculation and scatters policy

- Location: `order_service.ts:22-36`
- Evidence: The `standard` / `subscription` / `gift` / else branches each re-run the `for (const it of input.items) total += it.price * it.qty` loop, and coupon handling is copy-pasted into two branches while trial/cycles/wrapFee rules are interleaved with the summation.
- Why it matters: This is branching complexity plus duplication. Adding a new mode or a new pricing rule means touching multiple branches and risking divergence (e.g., the coupon is applied for `standard` and `subscription` but silently dropped for `gift`). The subtotal loop and the modifiers (coupon, cycles, trial, wrap fee) are independent concepts entangled in one conditional ladder.
- Recommended remediation: Compute the line-item subtotal once, then apply mode-specific modifiers via a focused, table-driven helper (a map of `mode -> priceModifier` or small per-mode functions). This collapses the duplicated loop and makes each pricing rule own a single, testable place.
- Confidence: High

### 4. [High] Unknown `mode` silently resolves to a zero-cost, successful checkout

- Location: `order_service.ts:34-36` and `38-44`
- Evidence:
  ```ts
  } else {
    total = 0;
  }
  ```
  followed unconditionally by `charge(...)`, `update(... status: "paid" ...)`, and `return { ok: true, total: 0, ... }`.
- Why it matters: An unrecognized `mode` (typo, new caller, renamed mode) is not rejected — it falls through to `total = 0` and then reports `{ ok: true }` with a `paid` order for $0.00. Combined with the open `string` type (Finding 2), this is a silent fallback that hides a real invariant: callers will not learn their mode was invalid.
- Recommended remediation: Make `mode` a closed union and treat an unknown mode as an error (exhaustive `switch` with a `never` default, or an explicit rejected result), rather than coercing it to a free, successful order.
- Confidence: High

### 5. [Medium] `formatMoney` re-implements a canonical helper

- Location: `order_service.ts:5-8`
- Evidence:
  ```ts
  // NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere.
  function formatMoney(cents: any): string {
    return "$" + (cents / 100).toFixed(2);
  }
  ```
- Why it matters: Canonical-ownership / duplication concern. The code's own comment states a shared `formatMoney` already exists in `shared/money.ts`. Re-defining it here means money formatting (currency symbol, rounding, locale) can drift between this service and the rest of the codebase. The local copy also takes `cents: any`, so it will happily format `NaN`/`undefined`.
- Recommended remediation: Import and reuse `formatMoney` from `shared/money.ts`; delete the local copy. (`shared/money.ts` was not available in this scope — see Scope limitations — so confirm the import path and that the signature matches before removing.)
- Confidence: Medium

### 6. [Medium] `findOrder` is a pass-through wrapper, and its `?? {}` fallback masks "order not found"

- Location: `order_service.ts:10-13` and the call site `order_service.ts:20`
- Evidence:
  ```ts
  // pass-through wrapper around db.orders.find
  function findOrder(id: any) {
    return db.orders.find(id);
  }
  ...
  const order = findOrder(input.orderId) ?? {};
  ```
- Why it matters: Abstraction-quality smell — the wrapper adds indirection (and a second untyped surface) without hiding any complexity. More importantly, the `?? {}` at the call site converts a missing order into an empty object, which is what allows the charge-before-validate bug in Finding 1 to proceed with `order.userId === undefined`.
- Recommended remediation: Inline the call to `db.orders.find` (or keep it only if it gains real responsibility, e.g. typing/normalization), and replace `?? {}` with an explicit not-found guard that returns/throws before any payment side effect.
- Confidence: Medium

## Checked but not flagged

- File size and module growth: the file is 45 lines and well under any size threshold; no split needed.
- Logging: `logger.info("checkout " + formatMoney(total))` is benign and not a maintainability concern on its own.
- Orchestration/parallelism: the function is short and sequential by necessity (charge → persist); there is no needlessly serialized independent work to parallelize. The atomicity concern is captured in Finding 1.
- Return-shape inconsistency (`{ ok: false }` vs `{ ok: true, total, label }`) is real but is subsumed by the typing fix in Finding 2 (a typed `CheckoutResult` union resolves it).

## Scope limitations

- Only `order_service.ts` was provided. `./db`, `./logger`, and `shared/money.ts` are not present in this scope, so I could not verify the exact `Order`/payment APIs or the canonical `formatMoney` signature. A repo search found no other `formatMoney` definition outside this file and the eval config; Finding 5 therefore relies on the file's own comment as file-level evidence (Confidence: Medium).
- No tests or callers were available, so I could not confirm which `mode` values and `opts` keys are exercised in practice. The mode/options contract findings are based on the code as written.
- No line-accurate diff was supplied; this is a whole-file review of the current contents.
