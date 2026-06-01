## Verdict

REQUEST CHANGES

`processCheckout` has a charge-before-validate ordering bug and pervasive `any` boundaries that make the order pipeline unsafe to change, on top of duplicated/wrapper helpers and scattered per-mode branching that should be consolidated.

## Findings

### CQ-001 [Blocker] Payment is charged before the order is validated, and updates can leave half-applied state

- Location: order_service.ts:39-41
- Evidence:
  ```ts
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
  When `findOrder` returns the `{}` fallback (order not found), `order.userId` is `undefined`. The code still calls `db.payments.charge(undefined, total)` first, and only _after_ charging does it check `!order.userId` and bail with `{ ok: false }`. The order status is never updated, but money may already have moved.
- Why it matters: This is the worst kind of maintainability hazard — the ordering of side effects encodes a correctness invariant that the structure actively violates. The comment on line 38 ("charge first, then validate, then persist") documents the wrong order as if intentional, so any future maintainer reading it will preserve the bug. The charge and the status update are not atomic: a failure (or the early `return`) between them leaves a paid charge with no `status: "paid"` record. `total` can also be `0` (e.g. `subscription` + `trial`, or the fallthrough `else`) and is charged without comment.
- Recommended remediation: Validate first, then charge, then persist — and make the charge + status update atomic (single transaction or compensating rollback). Resolve the order before doing any work; if it is missing, return/throw before touching payments. Treat a `0` total explicitly (skip the charge or assert it is intended) rather than silently charging it.
- Confidence: High

### CQ-002 [High] `any` on every boundary discards the type contract of the core checkout function

- Location: order_service.ts:6 (`cents: any`), 11 (`id: any`), 15-19 (`input: any`, `opts: any`, `Promise<any>`)
- Evidence: `processCheckout(input: any, mode: string, opts: any): Promise<any>`, plus `findOrder(id: any)` and `formatMoney(cents: any)`. The function reads `input.orderId`, `input.items[].price/.qty`, `opts.coupon/.cycles/.trial/.wrapFee`, and returns either `{ ok: false }` or `{ ok: true, total, label }`.
- Why it matters: The most-changed function in the file has zero compiler help. Callers cannot tell that `input.items` must exist (it is iterated unguarded on lines 24/27/32), that `opts` is optional, or that the return shape differs between the success and failure branches. `mode: string` accepts any string but only three values are handled, with a silent `total = 0` for everything else. Every future edit risks a runtime `undefined` access that types would have caught.
- Recommended remediation: Introduce explicit models — `CheckoutInput { orderId: OrderId; items: LineItem[] }`, `LineItem { price: number; qty: number }`, a discriminated `CheckoutOptions`, and a `mode: "standard" | "subscription" | "gift"` union (or a discriminated `mode` carried inside the input). Type the return as a single `CheckoutResult` union. Type `findOrder` as `Order | null` and `formatMoney(cents: number)`.
- Confidence: High

### CQ-003 [High] Silent `{}` fallback for a missing order hides "not found"

- Location: order_service.ts:20
- Evidence: `const order = findOrder(input.orderId) ?? {};`
- Why it matters: Coalescing a missing order to an empty object erases the not-found signal at the boundary and pushes the failure downstream, where it surfaces as `charge(undefined, ...)` (see CQ-001) instead of a clear error. This is exactly the failure mode the project's own conventions warn against (a missing row silently becoming `{}`).
- Recommended remediation: Let `findOrder` return `Order | null` and handle `null` explicitly at the top of `processCheckout` (early return/throw with a clear result) before any computation or charge. Do not coalesce to `{}`.
- Confidence: High

### CQ-004 [Medium] `formatMoney` duplicates the canonical `shared/money.ts` helper

- Location: order_service.ts:5-8
- Evidence: The file's own comment states "a formatMoney already lives in shared/money.ts and is used elsewhere," yet a local `formatMoney(cents: any)` is redefined and used on lines 43-44.
- Why it matters: A second copy of a money-formatting helper guarantees drift — currency, rounding, and locale rules will diverge between this copy and the canonical one, and the bug surface doubles. Money formatting is a cross-cutting concern that should have one owner.
- Recommended remediation: Delete the local `formatMoney` and import the canonical one from `shared/money.ts`. If the shared version lacks something this needs, extend the shared version rather than forking it.
- Confidence: High

### CQ-005 [Medium] Per-mode pricing is scattered branching with duplicated logic

- Location: order_service.ts:23-36
- Evidence: Three `if/else if` arms each re-implement the `for (const it of input.items) total += it.price * it.qty` line-item loop, and the coupon subtraction (`total = total - opts.coupon`) is copy-pasted in both `standard` and `subscription`. Mode-specific rules (cycles multiplier, trial→0, wrap fee) are interleaved with the shared summation, and the `else` silently yields `total = 0`.
- Why it matters: Adding or changing a pricing mode means editing a growing `if/else` ladder and remembering which arms need the shared coupon/summation logic — a classic source of divergence and missed cases. The shared "sum line items" step and the "apply coupon" step are obscured by the branching.
- Recommended remediation: Extract the shared `subtotal(items)` step once, then move per-mode policy into a small map/strategy keyed by `mode` (e.g. `{ standard, subscription, gift }`), each returning its adjustment. Replace the silent `else` with an exhaustive switch over the `mode` union so an unknown mode is a compile error or explicit failure, not a silent `0`.
- Confidence: Medium

### CQ-006 [Low] `findOrder` is a thin pass-through wrapper that adds indirection

- Location: order_service.ts:10-13
- Evidence: `function findOrder(id: any) { return db.orders.find(id); }` — a one-line wrapper with no added behavior, and its own comment labels it "pass-through."
- Why it matters: A wrapper that neither narrows types, handles errors, nor centralizes a policy just adds a hop to trace through. (If it _did_ return `Order | null` and was the single typed gateway to order lookups, it would earn its place — see CQ-003.)
- Recommended remediation: Either inline `db.orders.find(input.orderId)` at the call site, or deepen the wrapper so it actually adds value (typed `Order | null` return, not-found handling). Do not keep it as a bare pass-through.
- Confidence: Medium

## Checked but not flagged

- Logging (line 43): `logger.info` usage is fine in isolation; its only issue is the duplicated `formatMoney`, already covered by CQ-004.
- File size / growth: at 45 lines the file is small; no split is warranted.
- Imports (lines 2-3): `db` and `logger` imports are reasonable module boundaries; the concern is the `any`/duplication inside, not the dependency graph.

## Scope limitations

- `shared/money.ts`, `./db`, and `./logger` are not present in the reviewed tree (the fixture is a single self-contained file). The canonical-duplication finding (CQ-004) relies on the in-file NOTE comment rather than direct inspection of `shared/money.ts`; if that helper does not actually exist or differs, downgrade CQ-004 accordingly.
- The real signatures of `db.orders.find`, `db.payments.charge`, and `db.orders.update` are unknown, so the atomicity/transaction remediation in CQ-001 assumes a typical async DB/payment client. Confirm whether a transaction or compensating-rollback primitive is available.
- No tests or callers of `processCheckout` were available, so I could not confirm the expected return-shape contract or the intended set of `mode` values beyond what the function handles.
