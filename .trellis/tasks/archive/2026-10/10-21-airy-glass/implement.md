# 实施顺序

批准本计划后再执行。不要在批准前改 `skills/development-workflows/design-md/`。

## 顺序

1. 写 `assets/catalog/first-party/airy-glass.md` 与 `manifest.json`。token 与规则以 `design.md` 的表为准，出处与禁令以 `research/airy-glass-sources.md` 为准。文件 UTF-8、LF、行尾无空格、文件末尾一个换行。
2. 把同一 markdown 字节写到 `assets/catalog/styles/airy-glass.md`。
3. 把 manifest 里的条目按 slug 字母序插进 `assets/catalog/index.json` 的 `entries`。不要改 `sources`，不要把 slug 写进 `categories.json` 的上游风格列表。
4. 改 `scripts/build_catalog.py`：上游条目合并完、写文件之前，读取 `out/first-party/manifest.json`（没有就跳过）。校验 category 存在、源文件存在、id 不与上游冲突。把 markdown 放进 `files`，把条目并入 `entries`。
5. 改 `scripts/design_catalog.py` 的 `provenance()`，让 `source == "first-party"` 不查 `index["sources"]`。
6. 更新计数与触发：`SKILL.md` description、`README.md`、必要时 `agents/interface.yaml`。description 保持不超过 1024，且含「轻盈毛玻璃」。
7. 更新测试：
   - 目录计数 152、风格 68、列表标题含 `152 entries`。
   - `search 轻盈毛玻璃` 命中 `style:airy-glass`。
   - `apply` 的来源注释含 `source=first-party`，不含上游仓库 URL。
   - 构建：在临时 `out` 放一份 first-party 后，重建结果含该条目和复制出的 `styles` 文件；另放一个不属于上游也不属于 first-party 的 `styles/*.md`，重建后它被删除。无 first-party 的现有测试仍通过。
8. 在条目 Known Gaps 或 Accessibility 里记下 `design.md` 那张对比度表的比值，不新造未复算的比值。
9. 运行 `just docs-sync`。

## 验证

```bash
python skills/development-workflows/design-md/scripts/design_catalog.py search 轻盈毛玻璃
python skills/development-workflows/design-md/scripts/design_catalog.py show style:airy-glass
python -m unittest skills/development-workflows/design-md/tests/test_design_catalog.py skills/development-workflows/design-md/tests/test_build_catalog.py
just skills-check
just docs-sync
```

`just ci` 留到提交前的 Phase 3.4。本任务不在实施中途跑完整 CI，除非上述命令暴露了 docs 或校验以外的失败。

## 风险点

- `index.json` 很大。只插入一个对象，不要重排其他条目。
- Windows 上写出 CRLF 会让 `test_assets_are_normalized` 失败。用二进制或 `newline="\n"` 写目录文件。
- `print_grouped` 使用了 `—`。不要为了本任务去改它。新条目正文不用 em dash。

## 回滚

按 `design.md` 的回滚组一次撤回。构建器与 `provenance()` 必须和索引条目一起撤，避免留下只对 first-party 特殊处理、但目录里没有这种条目的死分支。若死分支留着且无调用，可以接受，但不要在失败的中途提交半份索引。
