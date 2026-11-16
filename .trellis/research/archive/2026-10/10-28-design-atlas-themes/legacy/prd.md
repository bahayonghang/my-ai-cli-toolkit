# 导入 hallmark 主题（去重）

父任务：`10-28-design-atlas-upgrade`。依赖：`10-28-design-atlas-rename` 已完成。跨任务契约见父任务 `design.md` §2–§4。

## Goal

hallmark 的 50 个材质主题作为 `theme:<slug>` 进入目录，与现有 153 个条目没有材质重复。

## Requirements

- `build_catalog.py`：
  - 新增参数 `--hallmark <checkout>` 与 `--commit-hallmark`。
  - 读取 `skills/hallmark/references/themes/*.md`（跳过 README.md），按父 design §3 转换后写到 `themes/<slug>.md`。
  - 在 index 中写入 `theme`、`preview_url`、`cluster`、`superseded_by` 等字段，在 `sources` 中加入 hallmark。
  - 拷贝 `LICENSE` 到 `LICENSES/hallmark.LICENSE`。
  - 清理过期文件的逻辑覆盖 `themes/`。
  - 为保持向后兼容，三个上游参数都给齐时才重建全部；只给前两个时，保持现有行为并保留 themes 不动。具体实现方式在 design.md 中确定。
- `categories.json`：新增 4 个 theme 分类（父 design §2）。
- `assets/catalog/overlays/dedup.json`：50 个 slug 全覆盖。每个 `supersede` / `cluster` 结论都要并排读过两份条目文件后再写，reason 写明材质异同。
- `references/texture.md`：从 hallmark `references/texture.md` 移植，删掉其中只适用于 hallmark 流程的内容（戳、gate 豁免语法改指 anti-slop），保留配方本身。
- `design_catalog.py`：
  - `--kind` 增加 `theme`。
  - `list` / `search` 默认隐藏 `superseded_by` 条目，`--all` 显示。
  - `show` / `apply` 被取代的条目时，向 stderr 打印 “superseded by theme:x”，但仍然执行。
  - provenance 支持 hallmark 来源。
  - `search` 的匹配范围包括 theme 的 keywords 与 material。
- `references/design-md-format.md`：在 §1 表中增加 `theme` 格式，说明 oklch 值、`x-theme` 字段，以及主题“材质不是页面结构”的约束。
- `brand-boundary.md`：说明 theme 条目不涉及品牌资产，不适用品牌禁令。
- 测试：在 `test_build_catalog.py` 中用一个最小 hallmark fixture（2–3 个主题文件 + LICENSE）覆盖转换、引用改写、dedup 校验（缺 slug、target 不存在、reason 过短）、字节稳定；在 `test_design_catalog.py` 中覆盖 `--kind theme`、隐藏与 `--all`、被取代条目的提示、theme 条目的 apply provenance。

## Acceptance Criteria

- [ ] 以 `ref/repo/hallmark`（commit `8f6969f8`）重建目录后，`themes/` 下有 50 个文件，index 中有 50 个 `theme:*` 条目。
- [ ] 重建两次，`git status` 无差异（字节稳定）。
- [ ] 断言测试：所有 `themes/*.md` 中出现的 `references/*.md` 引用都能在包内找到；不残留 `layout.md`、`craft.md`、`imagery.md`、`gates.md`、`flow.md` 字样。
- [ ] `dedup.json` 有 50 条，每条 reason 合格；`supersede` 的 target 在 `list` 默认输出中不可见，在 `list --all` 中可见并带标记。
- [ ] `apply theme:riso --root <tmp>` 写出的 DESIGN.md 含 provenance（hallmark@8f6969f）、可用的 oklch token 和完整章节。
- [ ] `apply style:riso` 仍成功，并在 stderr 打印 superseded 提示。
- [ ] 现有 153 个条目的文件内容与 id 不变（被取代条目只在 index 中加字段）。
- [ ] `just python-test`、`just skills-check` 全绿。
