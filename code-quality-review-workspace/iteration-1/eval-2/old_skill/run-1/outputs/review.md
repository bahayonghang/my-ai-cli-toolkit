## Verdict

REQUEST CHANGES

`order_service.ts` 把支付、校验、持久化的顺序写反并且非原子，叠加 `any` 全覆盖的契约缺失、重复的 `formatMoney`、按字符串 `mode` 散落的分支逻辑，使该文件在可维护性与结构上存在需要重构后才能合入的问题。

## Findings

### 1. [Blocker] 先扣款再校验、且更新非原子，控制流顺序错误

- Location: `order_service.ts:38-41`
- Evidence:
  ```ts
  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
- Why it matters: 这是结构性的「编排与原子性」问题，不只是风格。`charge` 在 `if (!order.userId)` 校验之前执行；当 `order` 因 `findOrder(...) ?? {}` 退化为 `{}` 时，`order.userId` 为 `undefined`，代码会先用 `undefined` 作为用户去扣款、再返回 `{ ok: false }`，留下「已扣款但订单未标记为 paid」的半完成状态。注释甚至把这个错误顺序当成既定设计写了下来（charge → validate → persist），后续维护者很容易据此继续叠加逻辑，使坏状态扩散。
- Recommended remediation: 调整为「校验 → 计费 → 扣款 → 持久化」的顺序：先确认 `order` 存在且 `order.userId` 有效再进入计费/扣款；把扣款与订单状态更新放进同一事务或补偿流程，保证两者要么同时成功要么可回滚，消除半应用状态。
- Confidence: High

### 2. [High] `formatMoney` 重复实现，绕开了 `shared/money.ts` 的规范实现

- Location: `order_service.ts:5-8`
- Evidence:
  ```ts
  // NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere.
  function formatMoney(cents: any): string {
    return "$" + (cents / 100).toFixed(2);
  }
  ```
- Why it matters: 规范归属（canonical ownership）问题。文件自己的注释承认 `shared/money.ts` 已有同名工具且在别处使用，这里又造了一份本地副本。金额格式化属于跨领域共享关注点，重复实现会导致币种符号、舍入规则、千分位等行为分叉，未来任何一处改动都要记得同步两份，是典型的维护负担来源。
- Recommended remediation: 删除本地 `formatMoney`，改为 `import { formatMoney } from "../shared/money"`（按实际路径），统一走规范层；若本地需要不同行为，应在共享实现中扩展参数而非复制。
- Confidence: High

### 3. [High] 公共边界全部使用 `any`，契约完全缺失

- Location: `order_service.ts:6,11,15-19`(`input: any, mode: string, opts: any): Promise<any>`)
- Evidence: `processCheckout(input: any, mode: string, opts: any): Promise<any>`、`formatMoney(cents: any)`、`findOrder(id: any)`。
- Why it matters: 边界与类型契约问题。`input.items`、`it.price`、`it.qty`、`opts.coupon`、`opts.cycles`、`opts.trial`、`opts.wrapFee`、返回值结构等关键不变量全被 `any` 抹掉，类型系统无法保护调用方，重构与字段改名时不会有任何编译期反馈。`mode: string` 同理无法约束到合法取值集合。`any` 在收银这种核心路径上尤其危险。
- Recommended remediation: 为 `input`（含 `OrderItem[]`）、`opts`（按各 mode 的可选项）、返回值定义显式接口；`mode` 收敛为字面量联合类型 `"standard" | "subscription" | "gift"`；金额统一用 `number`（cents）并在边界做一次校验。
- Confidence: High

### 4. [Medium] 按字符串 `mode` 散落的分支，合计与优惠逻辑重复

- Location: `order_service.ts:22-36`
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
- Why it matters: 分支复杂度问题。三个 mode 各自重复「遍历 items 求小计」和「应用 coupon」的代码；新增计费模式或新增一种调整项（如税费）时，要在多个分支里重复修改，且容易漏改某一支（例如 gift 分支就没有应用 coupon，无法判断是有意还是遗漏）。`else { total = 0 }` 静默吞掉非法 mode，进一步掩盖问题。
- Recommended remediation: 抽出 `subtotal(items)` 公共函数计算小计，再用按 mode 分派的策略（映射表或小型策略对象）只描述各模式「在小计之上做什么调整」，把共享步骤上提、差异下沉；对未知 mode 显式报错而非静默置 0。
- Confidence: Medium

### 5. [Medium] `findOrder` 是无价值的 pass-through 包装

- Location: `order_service.ts:10-13`
- Evidence:
  ```ts
  // pass-through wrapper around db.orders.find
  function findOrder(id: any) {
    return db.orders.find(id);
  }
  ```
- Why it matters: 抽象质量问题。该函数仅原样转发 `db.orders.find(id)`，既不增加类型、校验也不增加错误处理，纯粹增加一层间接，注释自己也标明是 pass-through。这类薄包装会让读者多跳一跳却得不到任何认知收益。
- Recommended remediation: 直接内联为 `db.orders.find(input.orderId)`；若确有需要保留（例如统一加「未找到则抛错」语义），就让它承担真正的复杂度（校验/抛错/类型收窄），而不是空转发。
- Confidence: High

### 6. [Medium] `findOrder(...) ?? {}` 静默吞掉「订单不存在」

- Location: `order_service.ts:20`
- Evidence: `const order = findOrder(input.orderId) ?? {};`
- Why it matters: 边界与隐式回退问题。用空对象兜底，使「订单不存在」与「订单存在但缺 userId」两种情况坍缩成同一条 `!order.userId` 路径，丢失了真实不变量；这也是 Finding 1 中能用 `undefined` 扣款的根因之一。
- Recommended remediation: 不要用 `?? {}` 掩盖；查不到订单时显式提前返回错误/抛出领域异常，让后续代码可以假设 `order` 与 `order.userId` 有效。
- Confidence: Medium

## Checked but not flagged

- 文件规模（45 行）远未触及文件增长阈值，无需拆分。
- `logger.info(...)` 的字符串拼接属于轻微风格，存在上述结构性问题时不单独列为发现。
- 未对性能、安全、格式化/命名做专项审查（不在本次可维护性/结构审查范围内）。

## Scope limitations

- 仅评审了单个文件 `order_service.ts`；`./db`、`./logger`、`shared/money.ts` 在本次范围内不存在于工作区，无法核对 `db.orders.find`/`db.payments.charge`/`db.orders.update` 的真实签名、事务能力，以及规范 `formatMoney` 的确切路径与行为。涉及这些依赖的建议（如事务化、import 路径）请按真实模块签名落地。
- 无调用方与测试可供查看，无法确认 `processCheckout` 当前返回结构 `{ ok, total, label }` 的下游契约，类型化建议需结合调用方再细化。
- 这是静态评审，未运行类型检查或测试（本次为只读审查，用户未要求验证）。
