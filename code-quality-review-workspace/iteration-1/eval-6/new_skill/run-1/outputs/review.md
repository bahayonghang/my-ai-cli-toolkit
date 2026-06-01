## Verdict

REQUEST CHANGES

`processCheckout` collapses three pricing modes, untyped boundaries, a duplicated money helper, and a charge-before-validate ordering into one function, several of which make future changes unsafe and should be restructured before merge.

## Findings

### CQ-001 [Blocker] Payment is charged before the order is validated, allowing charges with no atomic rollback

- Location: order_service.ts:39-41
- Evidence:
  ```ts
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
  The charge runs first; the `!order.userId` guard runs _after_ the money has moved; and the status update is a separate, non-transactional call.
- Why it matters: This is a boundary/atomicity defect, not a style nit. When `order.userId` is missing, `db.payments.charge(undefined, total)` is still executed, then the function returns `{ ok: false }` having already attempted a charge with no compensating refund. Even on the happy path, a failure between `charge` and `orders.update` leaves a paid charge with no recorded `status: "paid"` — a half-applied state. Future maintainers cannot reason about the success/failure contract because "returned `{ ok: false }`" does not mean "nothing happened".
- Recommended remediation: Validate inputs and `order` existence _before_ any side effect, then perform charge + status update as one atomic unit (DB transaction or charge-then-persist with a documented compensating refund on failure). Order the flow validate → compute → charge+persist atomically.
- Confidence: High

### CQ-002 [High] Untyped boundaries (`any` on input, opts, params, and return) erase the contract

- Location: order_service.ts:6, 11, 15-19
- Evidence: `formatMoney(cents: any)`, `findOrder(id: any)`, and `processCheckout(input: any, mode: string, opts: any): Promise<any>`. `mode` is a bare `string` rather than a union.
- Why it matters: Every caller loses compiler help. Nothing enforces that `input.items` exists, that `opts.coupon` is a number, that `mode` is one of the three handled values, or what the returned shape is (`{ ok: false }` vs `{ ok: true, total, label }` are structurally incompatible and undocumented). Typos in `mode` silently fall into the `total = 0` branch. This makes refactors unsafe and pushes failures downstream.
- Recommended remediation: Introduce explicit types: `type CheckoutMode = "standard" | "subscription" | "gift"`, a `CheckoutInput` with typed `items: { price: number; qty: number }[]`, a typed `CheckoutOpts`, and a discriminated-union return (`{ ok: false; reason: string } | { ok: true; total: number; label: string }`). Type `findOrder`'s return as `Order | undefined`.
- Confidence: High

### CQ-003 [High] Duplicated `formatMoney` shadows the canonical `shared/money.ts` helper

- Location: order_service.ts:5-8
- Evidence: The file's own comment states `// NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere`, yet a second local copy is defined with `cents: any`.
- Why it matters: Canonical-ownership violation and duplication. Two implementations of money formatting will drift (currency symbol, rounding, locale), and bug fixes to the shared helper will not reach this copy. The local version is also weaker-typed (`any`) than a shared utility should be.
- Recommended remediation: Delete the local `formatMoney` and import from `shared/money.ts`. If the shared signature does not fit, extend the canonical helper rather than forking it.
- Confidence: High

### CQ-004 [Medium] Branching complexity: three pricing modes inlined with duplicated loops and scattered coupon logic

- Location: order_service.ts:22-36
- Evidence: The `if (mode === "standard") / "subscription" / "gift" / else` ladder repeats the `for ... total += it.price * it.qty` loop three times, applies `opts.coupon` in two separate branches, and silently zeroes `total` in both the `trial` case and the unknown-mode `else`.
- Why it matters: Pricing policy is smeared across one growing conditional. Adding a fourth mode or a new coupon rule means editing multiple branches and risking the duplicated subtotal loop diverging. The two distinct `total = 0` paths (intentional trial vs. fallback for an unrecognized mode) are indistinguishable to callers.
- Recommended remediation: Extract a shared `subtotal(items)` helper, then move per-mode pricing into a small strategy map keyed by `CheckoutMode` (or per-mode functions). Apply coupon/trial/wrap adjustments in one place. Treat an unknown mode as an explicit error rather than a silent `total = 0`.
- Confidence: High

### CQ-005 [Medium] `findOrder` thin pass-through wrapper adds indirection without value, and the `?? {}` fallback hides "not found"

- Location: order_service.ts:10-13, 20
- Evidence: `function findOrder(id) { return db.orders.find(id); }` is a one-line pass-through; `const order = findOrder(input.orderId) ?? {}` then coerces a missing order into an empty object.
- Why it matters: The wrapper adds a layer that hides nothing (same signature, same behavior). The `?? {}` fallback turns "order does not exist" into "an order with all-undefined fields", which is exactly what lets CQ-001's charge-on-missing-user bug slip through. A missing order should be a distinct, handled outcome.
- Recommended remediation: Inline `db.orders.find` (or keep the wrapper only if it gains real typing/error handling), and handle a missing order explicitly (early return / typed error) instead of `?? {}`.
- Confidence: High

## Checked but not flagged

- File size and module organization: at ~45 lines this is small; no file-growth concern.
- Logging: `logger.info("checkout " + formatMoney(total))` is benign; not flagged beyond its dependence on the duplicated helper (CQ-003).
- Import structure: `db` and `logger` imports are reasonable; no layering concern in what is visible.

## Scope limitations

- This was a single-file review with no surrounding repository, no diff/base ref, and no tests provided. `shared/money.ts`, `./db`, and `./logger` were not available to inspect, so CQ-003's duplication finding rests on the file's own NOTE comment and CQ-001/CQ-002 assume conventional semantics for `db.payments.charge` and `db.orders.update`.
- No project `CLAUDE.md`/`AGENTS.md` or contributor conventions were in scope, so canonical-layer judgments are inferred from the file itself.
- The intended return contract (e.g., whether `{ ok: false }` callers expect a reason) is unknown; the discriminated-union recommendation in CQ-002 may need to match an existing caller expectation.
