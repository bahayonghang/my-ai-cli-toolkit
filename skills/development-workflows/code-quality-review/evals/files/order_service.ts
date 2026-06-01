// order_service.ts — handles order checkout and fulfillment.
import { db } from "./db";
import { logger } from "./logger";

// NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere.
function formatMoney(cents: any): string {
  return "$" + (cents / 100).toFixed(2);
}

// pass-through wrapper around db.orders.find
function findOrder(id: any) {
  return db.orders.find(id);
}

export async function processCheckout(
  input: any,
  mode: string,
  opts: any,
): Promise<any> {
  const order = findOrder(input.orderId) ?? {};

  let total = 0;
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

  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });

  logger.info("checkout " + formatMoney(total));
  return { ok: true, total, label: formatMoney(total) };
}
