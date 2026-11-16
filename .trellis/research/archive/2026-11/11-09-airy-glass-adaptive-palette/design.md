# Design: airy-glass 色板拨盘

## 1. 边界

| 层 | 变化 |
| --- | --- |
| `assets/catalog/overlays/palettes.json`（新增） | 色板数据：每个支持拨盘的条目一个键，目前只有 `style:airy-glass`。overlays/ 是 first-party，`build_catalog.py` 重建时保留。 |
| `scripts/palette.py`（新增，stdlib） | 颜色与对比度数学、预设选择、按色相推导、渲染 DESIGN.md 文本。纯函数，不读写项目文件。 |
| `scripts/design_catalog.py` | `apply` 增加 `--palette`；新增只读子命令 `palette`；`signals` 的 `palette` 对象增加 `accent_C`（及 `accent_hex`）。其余命令不变。 |
| `assets/catalog/first-party/airy-glass.md` + `styles/airy-glass.md` | 改写为「默认 mint 色板 + 拨盘说明」，作为渲染模板；两份保持逐字节一致。 |
| 文档 / 评测 | SKILL.md、README.md、`references/routing.md`、`references/design-md-format.md`、`evals/evals.json`。 |

不改：路由打分、`slop_check.mjs` 门禁逻辑、`build_catalog.py`（只需确认 overlays 被保留）、其他条目。

## 2. 数据契约：`palettes.json`

```json
{
  "style:airy-glass": {
    "default": "mint",
    "match_degrees": 20,
    "min_accent_chroma": 0.03,
    "output_offsets": [126, -126, 150, -150],
    "reserved_hues": [[0, 40], [60, 100]],
    "fixed": {"ink": "#24303A", "muted": "#5C6B76", "sheet-alpha": 0.78},
    "presets": {
      "mint":    {"anchor": 163, "label": {"zh": "薄荷 → 薰衣草", "en": "mint to lavender"},
                  "field-start": "#E7F6F1", "field-end": "#EDE7F8",
                  "input": "#187A56", "input-wash": "#E7F7F0",
                  "output": "#6D4BD6", "output-wash": "#F3EEFC",
                  "keywords_en": [...], "keywords_zh": [...]},
      "sky":     {...}, "apricot": {...}, "slate": {...}
    }
  }
}
```

- 预设至少 4 套：`mint`（现值，逐字不变）、`sky`（冷蓝，约 245°）、`apricot`（暖杏，约 55–70°，output 走冷色）、`slate`（低彩度蓝灰，偏企业/合规）。最终 hex 在实现时用 `palette.py` 推导后**手工固定**写入，测试负责证明它们过门禁；固定是为了让预设不随算法微调漂移。
- 关键词（R2 第 2 步）示例：sky ← finance、fintech、cloud、data、金融、云、数据；apricot ← food、education、community、creator、餐饮、教育、社区、亲子；slate ← enterprise、security、compliance、legal、企业、安全、合规、法务；mint ← health、climate、ESG、wellness、健康、环保、医疗。实现时可微调，但每个预设都需要中英关键词。
- `reserved_hues`：错误红 0–40°、警告琥珀 60–100°（OKLCH 色相），output 不得落入。input 跟随项目主色，不受此限制（项目主色就是红也照用）。

## 3. 颜色模型（`palette.py`）

- OKLCH ↔ sRGB 双向转换（现有 `_srgb_to_oklch` 只给 L/H，`palette.py` 自带完整 L/C/H 与反向转换，超出 sRGB 色域时降彩度直到落入色域）。
- WCAG 2.x 相对亮度与对比度。
- 合成背景：sRGB 逐通道 `round(a*fg + (1-a)*bg)`，a = 0.78。已验证可复现原表 13.47 / 13.16 / 5.37 / 4.79 / 5.31 / 5.08 / 5.79 / 1.11。
- 门禁对（R6），按最差值判定：

| id | 前景 | 背景 | 下限 |
| --- | --- | --- | --- |
| ink-white | ink | `#FFFFFF` | 4.5 |
| ink-sheet | ink | 白 0.78 叠 field-start / field-end 中较差者 | 4.5 |
| muted-sheet | muted | 同上 | 4.5 |
| input-wash | input | input-wash | 4.5 |
| input-white | input | `#FFFFFF` | 4.5（覆盖焦点环 3:1） |
| output-wash | output | output-wash | 4.5 |
| output-white | output | `#FFFFFF` | 4.5 |
| edge-field | `#FFFFFF` | field-start | 仅报告，预期 < 3 |

### 3.1 按色相推导 `derive(h)`

以 mint 的 OKLCH 参数为模板，只换色相：

1. input 色相 = h；output 色相 = 依次尝试 `h + offset`（`output_offsets`），取第一个不在 `reserved_hues` 内的值。
2. field-start = 色相 h、field-end = output 色相，L ≈ 0.95、C 上限 0.03（低于 slop_check 2a 的 0.04 有彩阈值，保证字段渐变不会被判为 purple-to-blue 等禁用渐变）。
3. wash：同色相，L ≈ 0.96、C ≈ 0.02。
4. input / output：起点 L ≈ 0.52、C ≈ 0.12；若任一门禁不过，以 0.005 步长降低 L（最多降到 0.30），仍不过则降 C；记录最终值。理论上降 L 总能过 4.5:1，测试覆盖全色相。
5. 输出 hex（大写 6 位），与预设同样的结构。

### 3.2 自动选择 `choose(signals, prompt, override)`

```
override 为预设名           → 该预设，reason=explicit
override 为 hue:N (0–359)   → derive(N)，reason=explicit hue
palette.accent_hue 存在且 accent_C ≥ min_accent_chroma:
    最近预设色相差 ≤ match_degrees → 该预设，reason=accent <var> <hex> near <preset>
    否则                          → derive(accent_hue)，reason=accent <var> <hex>
prompt + 项目文本命中预设关键词   → 命中最多者（并列按 presets 顺序），reason=keywords …
否则                              → default，reason=fallback (no palette or content signal)
```

项目 `palette.band == "dark"` 时额外附注：本条目只有浅色，写入照常进行。结果是确定性的。

## 4. 渲染 DESIGN.md

模板即 catalog 中的条目文件（默认 mint 值）。渲染步骤：

1. **Token 改名**：`canvas-mint` / `canvas-lavender` → `field-start` / `field-end`（键名是角色，符合 `design-md-format.md` §2）。正文统一用 `{colors.field-start}` 等引用。
2. **Hex 映射替换**：模板中出现的 6 个默认 hex 与所选配色一一替换（默认 hex 互不相同，替换安全）。frontmatter、正文、CSS 示例块都覆盖。
3. **生成块**：Accessibility 对比度表与 `## Colourway` 当前色板说明放在标记之间，渲染时整块重写：
   ```
   <!-- palette:begin contrast -->
   ...
   <!-- palette:end contrast -->
   ```
   `#1F8A62` 反例行改为通用规则（「更亮的 input 若在 wash 上 < 4.5:1 不得作为 token」），不再写死某个 hex。
4. **去色名**：description、Overview、Colors 中「薄荷 / 绿 / 紫 / green / purple / mint-to-lavender」改为角色描述（「input 色」「output 色」「字段两端」），色名只出现在 Colourway 生成块中。
5. **Provenance**：在现有注释下追加一行 `<!-- palette: <name|hue:N>; reason: <reason> -->`。
6. 选 mint 且不传 `--palette`、无信号时，输出 = 模板 + provenance + palette 注释；`show` 仍原样打印模板。

## 5. CLI 契约

```
apply <id> [--root DIR] [--force] [--palette auto|<preset>|hue:<0-359>]
palette <id> [--root DIR] [--prompt TEXT] [--palette ...] [--format text|json]
```

- 有色板数据的条目，`apply` 不传 `--palette` 等同 `auto`。
- 无色板数据的条目：传 `--palette` → stderr 报错、退出码 2、不写文件；不传则行为与现在逐字节相同。
- 非法预设名、hue 越界或格式错误 → 退出码 2。
- `apply` stdout 在 `wrote:` 之后增加一行 `palette: <name> (<reason>)`。
- `palette` 子命令只读：文本模式打印选中配色、理由、6 个 token、对比度表；JSON 模式输出 `{entry, palette, reason, colors, contrast:[{id,fg,bg,ratio,min,pass}]}`。退出码 0；任一门禁失败（理论上不会发生）退出码 1。
- 遵循 `.trellis/spec/backend/error-handling.md`：错误写 stderr，退出码语义与现有 catalog 一致（0/1/2/3）。

## 6. 兼容性与回滚

- 已写出的旧 DESIGN.md 不受影响；用户想换色板就 `apply --force --palette ...`（会备份）。
- 新 token 名 `field-start/field-end` 只影响新写出的文件；`slop_check` 读的是 DESIGN.md 中的颜色值，2a 豁免依旧成立（渐变色值都出现在 frontmatter colors 中）。
- 回滚：删除 `palette.py`、`palettes.json`，还原条目文件和 `design_catalog.py` 的 apply 分支即可；没有数据迁移。

## 7. 取舍

- 预设 hex 手工固定，算法只负责推导兜底：牺牲一点「完全自动」，换来常见项目的可预期结果和可审阅的色值。
- ink / muted 不随色相染色：保证正文对比度永远是同一组数，暖色板下略偏冷，记为 Known Gap。
- 机制按条目键控（`palettes.json` 以条目 id 为键），以后其他条目可以加入，但本次只填 airy-glass，不做通用化文档。

## 8. 实现后的最终取值（2026-11-10，以代码和 `palettes.json` 为准）

评审和复核之后，以下几处与上文不同：

- `reserved_hues` 为 `[[340, 40], [60, 100]]`，红色带跨 0° 连续；`output_offsets` 为 `[126, -126, 150, -150, 100]`。
- 新增 `min_accent_lightness: 0.25`：近黑的主色（如 shadcn 默认 `--primary` `#0F172A`）不算 accent。
- accent 候选不止第一个：所有 accent 命名的 token 依次尝试，取第一个同时过彩度和明度下限的；`signals.palette` 增加 `accents[]`，且在只有 accent、没有 paper token 时是一个 `band` 为 null 的对象。
- 关键词表只保留行业或产品领域词；community、security、enterprise、cloud、health 等任何 README 都会出现的词已删除。
- `apply` 也接受 `--prompt`；`apply` 在写文件前检查对比度门禁，不过关时退出码 1。
- 门禁为 10 行：ink 和 muted 在字段两端各列一行，两端都必须通过。
- 推导常数：字段 L 0.96 / 0.94，wash L 0.965（§3.1 写的是约 0.95 / 0.96）。
- CSS token 读取接受末尾不带分号的最后一条声明，并先去掉注释；这会影响所有条目的 `signals` / `route`。

已知限制：红色带与琥珀带之间只有 41°–59° 的空隙。输入色相 275–293（紫色系）推导出的 output 落在这个橙色区间，输入色相 227–235、335–343 的 output 落在 101°–108°（橄榄色，紧贴琥珀带上沿）。都在保留带之外并通过全部门禁，但与警告色接近。
