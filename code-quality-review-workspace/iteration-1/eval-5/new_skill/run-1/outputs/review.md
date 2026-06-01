## Verdict

REQUEST CHANGES — `processCheckout` couples an untyped boundary, scattered mode branching, and a non-atomic charge/persist sequence that together make this function unsafe to change.

## Findings

### CQ-001 [Blocker] Charge happens before validation, leaving payment and order state divergent

- Location: order_service.ts:38-41
- Evidence:
  ```ts
  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
- Why it matters: the order is fetched with a `?? {}` fallback (CQ-002), so a missing order yields `order.userId === undefined`. The code still calls `db.payments.charge(undefined, total)` before the `if (!order.userId)` guard runs, then returns `{ ok: false }` without ever updating the order. Even for a valid order, if `db.orders.update` throws, the customer is charged but the order is never marked `paid`. The ordering — charge, then validate, then persist — guarantees the system can reach a state where money moved but order state did not, which is the hardest class of bug to reason about and unwind later. The leading comment even documents the wrong order as if intentional, so future maintainers cannot tell the sequencing is a defect.
- Recommended remediation: validate first (resolve and verify the order/user before any side effect), then charge, then persist, and make the charge+update a single atomic unit (transaction or compensating action) so the two writes cannot diverge. At minimum, reorder so the `!order.userId` guard runs before `db.payments.charge`.
- Confidence: High

### CQ-002 [High] `any`-typed boundary plus silent `?? {}` fallback erases the contract and hides "order not found"

- Location: order_service.ts:6, 11, 15-20 (signature and `findOrder(...) ?? {}`)
- Evidence:
  ```ts
  function formatMoney(cents: any): string { ... }
  function findOrder(id: any) { return db.orders.find(id); }
  export async function processCheckout(input: any, mode: string, opts: any): Promise<any> {
    const order = findOrder(input.orderId) ?? {};
  ```
- Why it matters: `input`, `opts`, the return type, and the helper params are all `any`, so the compiler offers zero help when callers pass the wrong shape or when downstream code reads `order.userId`, `input.items`, `opts.coupon`, etc. The `?? {}` fallback then converts a missing order into an empty object that is structurally indistinguishable from a real order with no fields — callers cannot tell "no such order" from "order with no user". This is what lets CQ-001 silently charge `undefined`. Every future change to the order/input shape is unverified and risks runtime breakage.
- Recommended remediation: type the boundary explicitly — define `OrderInput`, `CheckoutOpts`, and an `Order` type; make `findOrder` return `Order | null`; type `processCheckout`'s return (e.g. `CheckoutResult`). Replace `?? {}` with an explicit `if (!order) return ...` so "not found" is a handled case, not a disguised empty object.
- Confidence: High

### CQ-003 [High] Mode-based pricing branching with duplicated coupon logic

- Location: order_service.ts:22-36
- Evidence:
  ```ts
  if (mode === "standard") {
    for (const it of input.items) total += it.price * it.qty;
    if (opts && opts.coupon) total = total - opts.coupon;
  } else if (mode === "subscription") {
    for (const it of input.items)
      total += it.price * it.qty * (opts.cycles || 1);
    if (opts && opts.coupon) total = total - opts.coupon;
    if (opts && opts.trial) total = 0;
  } else if (mode === "gift") {
    for (const it of input.items) total += it.price * it.qty;
    total = total + (opts.wrapFee || 0);
  } else {
    total = 0;
  }
  ```
- Why it matters: `mode` is a `string`, so the branching is unconstrained and the unknown-mode case silently produces `total = 0` (a free order) rather than rejecting an invalid mode. The line-item summation and the coupon-subtraction logic are copy-pasted across branches, so adding a new pricing rule (e.g. tax, a new mode) means editing several branches and risks them drifting apart. The pricing policy is interleaved with control flow, making each rule hard to read in isolation and hard to test independently.
- Recommended remediation: model `mode` as a discriminated union/enum and extract a shared `subtotal(items)` helper. Move per-mode adjustments (cycles multiplier, trial reset, wrap fee, coupon) into a small per-mode strategy table or focused functions so each pricing rule lives in one place, and make an unknown mode an explicit error instead of a silent free order.
- Confidence: High

### CQ-004 [Medium] Duplicated `formatMoney` shadows the canonical helper in `shared/money.ts`

- Location: order_service.ts:5-8
- Evidence:
  ```ts
  // NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere.
  function formatMoney(cents: any): string {
    return "$" + (cents / 100).toFixed(2);
  }
  ```
- Why it matters: the file's own comment states a canonical `formatMoney` already exists and is used elsewhere. This local re-implementation duplicates currency-formatting logic that should have a single owner; the two copies will drift (rounding, locale, currency symbol) and bug fixes applied to one will not reach the other. Money formatting is exactly the kind of cross-cutting concern that belongs in one canonical module.
- Recommended remediation: delete the local `formatMoney` and import the canonical one from `shared/money.ts`. (Note I could not read `shared/money.ts` in this fixture — confirm its signature, but the comment indicates it is the intended source.)
- Confidence: Medium

### CQ-005 [Low] Thin pass-through wrapper `findOrder` adds indirection without value

- Location: order_service.ts:10-13
- Evidence:
  ```ts
  // pass-through wrapper around db.orders.find
  function findOrder(id: any) {
    return db.orders.find(id);
  }
  ```
- Why it matters: the wrapper does nothing but forward to `db.orders.find` (its own comment says so), adding a layer of indirection a reader must follow without hiding any complexity or adding behavior. It also re-introduces an `any` parameter. Thin wrappers like this accumulate and obscure the actual data access.
- Recommended remediation: inline the call (`db.orders.find(input.orderId)`) — or, if a boundary helper is genuinely wanted, give it a real return type (`Order | null`) and a typed `id` so it earns its place (this dovetails with CQ-002).
- Confidence: High

## Checked but not flagged

- File size and overall structure: at 45 lines this is a single, small, focused module; no file-growth or splitting concern.
- Logging (`logger.info`): the call itself is fine; it correctly uses the formatter, and its only issue is the duplicated formatter tracked in CQ-004.
- Naming and formatting: clear and consistent; intentionally not nit-picked given the structural findings above.

## Scope limitations

- The fixture provides only `order_service.ts`. `shared/money.ts`, `./db`, and `./logger` are referenced but not available to read, so CQ-004's exact signature match and the precise contracts of `db.orders.find` / `db.payments.charge` / `db.orders.update` (e.g. whether a transaction API exists for CQ-001's atomicity fix) could not be confirmed — confidence on those points is set accordingly.
- No tests, callers, or project `CLAUDE.md`/contributor guide were present for this module, so judgments about canonical layering rely on the file's own inline comments rather than verified repository conventions.
