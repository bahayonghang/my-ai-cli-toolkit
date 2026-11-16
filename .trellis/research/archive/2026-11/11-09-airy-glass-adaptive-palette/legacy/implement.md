# Implement: airy-glass 色板拨盘

技能根目录：`skills/development-workflows/design-atlas/`（下文路径相对于它）。

## 顺序清单

1. **颜色数学（`scripts/palette.py`）**
   - [ ] OKLCH ↔ sRGB、色域裁剪、WCAG 对比度、0.78 白纸合成（sRGB 逐通道取整）。
   - [ ] `gates(colors) -> list[dict]`，按 design.md §3 的 8 个门禁对计算。
   - [ ] 测试 `tests/test_palette.py`：mint 复现原表 8 个比值（±0.01）。← **回滚点 A**：此项不过就不要往下做。
2. **推导与选择**
   - [ ] `derive(h)` 按 design.md §3.1；`choose(...)` 按 §3.2。
   - [ ] 测试：0–345° 每 15° 推导全部过门禁、字段 C ≤ 0.04、output 不在保留色相带；`choose` 覆盖 accent 命中预设 / 推导 / 灰色 accent / 关键词 / 回退 / override / dark 附注；确定性。
3. **色板数据（`assets/catalog/overlays/palettes.json`）**
   - [ ] 用 `derive` 生成 sky / apricot / slate 初值，人工微调后固定 hex；mint 照抄现值。
   - [ ] 测试：每个预设过门禁；每个预设有中英关键词；JSON 结构校验。
   - [ ] 确认 `build_catalog.py` 重建时保留 `overlays/palettes.json`（读代码 + 现有 `test_build_catalog.py` 的保留断言，必要时补一条）。
4. **条目模板**
   - [ ] 改写 `assets/catalog/first-party/airy-glass.md`：token 改名、去色名、加 `## Colourway` 说明与 `palette:begin/end` 生成块、对比度表放入生成块、反例行改为通用规则。复制到 `assets/catalog/styles/airy-glass.md`（逐字节一致）。
   - [ ] 同步 `first-party/manifest.json` 与 `index.json` 中该条目的 description（不再写 green/purple）。若 `index.json` 由 `build_catalog.py` 生成，按其约定更新。
   - [ ] 现有 `test_airy_glass_matches_first_party_source` 继续通过（无 `—`、有 `### Do`、无 `## Components`）。
5. **CLI（`scripts/design_catalog.py`）**
   - [ ] `signals.palette` 增加 `accent_C`、`accent_hex`（现有字段不变）。
   - [ ] `apply --palette`，渲染按 design.md §4；provenance 追加 palette 行；stdout 打印 `palette:` 行。
   - [ ] 新增只读 `palette` 子命令（text/json）。
   - [ ] 测试（`tests/test_design_catalog.py` 或 `test_palette.py`）：`#2563EB` 项目写出的 DESIGN.md 不含 mint 三个 hex、含新色值与 `--color-primary` 理由；`--palette sky`、`hue:18` 覆盖；非法值、非色板条目 + `--palette` → 退出码 2 且未写文件；其他条目（如 `theme:riso`、`brand:vercel`）`apply` 输出与改动前逐字节一致。← **回滚点 B**
6. **slop_check 联动**
   - [ ] 在 `tests/fixtures/` 下加一个最小页面，使用推导出的字段渐变；对 apply 后的目录跑 `slop_check.mjs`，断言没有 2a FAIL。可放在 `tests/slop_check.test.mjs`（Node）中，DESIGN.md 用预先生成的 fixture。
7. **文档与评测**
   - [ ] SKILL.md：命令表加 `--palette` 与 `palette` 子命令一行；版本 0.4.0 → 0.5.0；description 不需要改（已含 轻盈毛玻璃）。
   - [ ] README.md：轻盈毛玻璃一节说明色板拨盘与预设。
   - [ ] `references/routing.md`：Picks 块示例中，选中 airy-glass 时加一行 `Palette: sky — --color-primary #2563EB`，以及切换方式 `--palette`。
   - [ ] `references/design-md-format.md` §4：换色板用 `apply --force --palette`，不要手改 hex。
   - [ ] `evals/evals.json`：新增 2 条：①「用轻盈毛玻璃做运营后台，项目主色 #2563EB」→ 色板跟随蓝色、不默认浅绿、DESIGN.md 附实测对比度；②「轻盈毛玻璃，餐饮会员系统，没有现成配色」→ 按内容选暖色预设并说明理由。
8. **规格沉淀（Phase 3.3）**：若「条目级色板拨盘 + 生成块」成为约定，记入 `.trellis/spec/guides/skill-authoring-conventions.md` 或 backend quality guide。

## 验证命令

```bash
# 迭代中
python -m unittest discover -s skills/development-workflows/design-atlas/tests -p "test_*.py"
node --test skills/development-workflows/design-atlas/tests/
python skills/development-workflows/design-atlas/scripts/design_catalog.py palette style:airy-glass --palette hue:18
just skills-check
just python-check
just evals-check
just docs-check   # SKILL.md 版本 / README 变化后

# 收尾
just ci
```

## 评审关口

- 回滚点 A 之后：贴出 mint 复现表，确认口径一致再继续。
- 第 3 步后：展示 4 套预设色值与对比度表，人工看一眼色板是否「轻盈」（低彩度字段、语义色可区分）。
- 第 5 步后：在一个带 `--color-primary` 的临时项目里实际跑 `apply`，阅读写出的 DESIGN.md 全文，确认没有残留的绿/紫描述。
- 收尾：`trellis-check` 全量复核 + `just ci`。

## 回滚

- A 前失败：删除 `palette.py` 与测试即可。
- B 前失败：还原条目文件、`palettes.json`、`design_catalog.py`。
- 合并后发现问题：还原本任务的提交；已写出的项目 DESIGN.md 不受影响。
