# 代码质量审查：order_service.ts

- 审查目标：`order_service.ts`（单文件，evals 输入）
- 关注重点：可维护性与结构问题（按用户要求）
- 报告语言：中文
- 创建时间：2026-06-01

## Verdict

REQUEST CHANGES

`processCheckout` 把三种结算模式、类型边界与"先扣款后校验"的危险时序揉在一个 `any` 入口里，结构与可维护性问题足以阻塞合并；同时重复实现了已有的 `formatMoney`。

## Findings

### CQ-001 [Blocker] 先扣款、后校验、再持久化——非原子时序会留下半完成状态

- Location: order_service.ts:38-41
- Evidence:
  ```ts
  // charge first, then validate, then persist order status
  await db.payments.charge(order.userId, total);
  if (!order.userId) return { ok: false };
  await db.orders.update(input.orderId, { status: "paid", total });
  ```
- Why it matters: 这是结构性的执行顺序缺陷，不只是代码风格问题。当 `order` 退化为 `{}`（见 CQ-002）时 `order.userId` 为 `undefined`，代码会先用 `undefined` 去 `charge`，再在下一行才判断 `!order.userId` 并提前返回——此时扣款可能已经发生，但订单状态永远不会被更新成 `paid`。这会造成"扣了钱、订单没标记成已支付"的半完成状态，是后续所有维护者都要反复绕开的地雷，且很难在不重构时序的情况下安全地新增逻辑。
- Recommended remediation: 把校验前置到任何副作用之前（先校验 `order`/`userId` 合法，再 `charge`，再 `update`）；并将 charge 与状态更新放入同一事务或补偿流程，保证两者要么都成功要么都回滚，使相关更新保持原子性。
- Confidence: High

### CQ-002 [Blocker] 全链路 `any` + `?? {}` 静默兜底，类型契约形同虚设

- Location: order_service.ts:6, 11, 15-20
- Evidence: `processCheckout(input: any, mode: string, opts: any): Promise<any>`，`formatMoney(cents: any)`，以及 `const order = findOrder(input.orderId) ?? {}`。
- Why it matters: 参数、返回值、订单对象全部是 `any`，编译器无法对 `input.items`、`opts.coupon`、`order.userId`、返回结构提供任何保护；`?? {}` 又把"订单不存在"静默变成一个空对象，让"查无此单"和"字段为空的单"无法区分（直接导致 CQ-001 的失败路径）。返回值形态也不统一——失败分支 `{ ok: false }` 与成功分支 `{ ok: true, total, label }` 字段不一致，调用方只能靠猜。这类边界一旦扩散，未来任何修改都是不安全的。
- Recommended remediation: 为边界建立显式类型：`input: CheckoutInput`、`opts: CheckoutOptions`、返回 `CheckoutResult`（成功/失败用可辨识联合 discriminated union 表达）；`findOrder` 返回 `Order | null` 并让调用方显式处理 `null`，去掉 `?? {}` 兜底。
- Confidence: High

### CQ-003 [High] `processCheckout` 用 `mode` 字符串分支承载三套结算策略，分支复杂度集中且易扩散

- Location: order_service.ts:22-36
- Evidence: `if (mode === "standard") … else if (mode === "subscription") … else if (mode === "gift") … else …`，三个分支各自重复 `for … total += it.price * it.qty` 的求和循环，并各自夹带特例（`coupon`、`cycles`、`trial`、`wrapFee`）。
- Why it matters: 每新增一种结算模式都要回到这个函数里加一段 `else if`，求和逻辑被复制三遍，优惠/折扣特例散落在不同分支中。这是典型的分支复杂度集中：函数职责过多，单元测试要覆盖所有 mode×特例组合，且 `else` 分支静默把 `total` 置 0（未知 mode 直接当免费单），属于危险的隐式行为。
- Recommended remediation: 抽出公共的小计计算（`subtotal = items.reduce(...)`），把每种 mode 的差异收敛为按 `mode` 索引的策略表/策略函数（如 `pricingStrategies[mode]`），未知 mode 显式报错而非静默置 0；让分支策略各自拥有自己的特例逻辑。
- Confidence: High

### CQ-004 [High] 重复实现已存在的 `formatMoney`，与 canonical 工具产生分叉

- Location: order_service.ts:5-8
- Evidence: 文件顶部注释明确写道 `// NOTE: a formatMoney already lives in shared/money.ts and is used elsewhere.`，紧接着却又本地定义了一份 `formatMoney(cents: any)`。
- Why it matters: 这是 canonical ownership（规范层归属）问题——金额格式化已有共享实现并在别处使用，本地再造一份会导致两处实现可能逐渐分叉（精度、货币符号、四舍五入规则不一致），维护者改了共享版却漏改这里。本地版还用了 `any` 入参，进一步弱化契约。
- Recommended remediation: 删除本地 `formatMoney`，改为 `import { formatMoney } from "./shared/money"`（按实际路径），复用规范实现；如共享版签名不满足需求，应去增强共享版而非另起一份。
- Confidence: High

### CQ-005 [Medium] `findOrder` 是无附加值的 pass-through 包装，增加间接层

- Location: order_service.ts:10-13
- Evidence:
  ```ts
  // pass-through wrapper around db.orders.find
  function findOrder(id: any) {
    return db.orders.find(id);
  }
  ```
- Why it matters: 该包装只是原样转发 `db.orders.find`，注释本身也承认是 pass-through。它没有隐藏任何复杂度（不做校验、不做类型收窄、不统一错误处理），只增加一层需要跳转阅读的间接。薄包装会让读者误以为这里有额外语义。
- Recommended remediation: 要么直接内联调用 `db.orders.find(input.orderId)`；要么让这个边界真正承担价值——返回 `Order | null` 的显式类型、集中处理"未找到"，使抽象"加深"到值得保留。
- Confidence: Medium

## Checked but not flagged

- 文件规模：仅 45 行，远未触及文件膨胀阈值（~1000 行），无需拆分，未作为问题列出。
- 模块导入结构（`db`/`logger`）：导入简单清晰，无循环依赖迹象，未发现问题。
- 日志调用 `logger.info(...)`：行为无害，仅为字符串拼接，非结构性问题。

## Scope limitations

- 仓库中只提供了 `order_service.ts` 单文件，未能查看 `shared/money.ts`、`./db`、`./logger` 的实际实现与类型定义；CQ-004 中"已有 canonical formatMoney"依据的是文件内注释而非源码本身，建议结合 `shared/money.ts` 的真实签名确认复用方式。
- 无调用方代码与测试用例，无法验证调用方实际依赖的返回结构、各 `mode` 的预期行为，以及"未知 mode 置 0"是否为有意设计；CQ-001 的扣款副作用是否可补偿也需结合 `db.payments` 的事务能力进一步确认。
- 未运行任何测试或类型检查（无相关请求且缺少可运行的项目上下文）。
