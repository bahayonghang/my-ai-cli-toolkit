# 实施顺序

批准本计划后再执行。批准前不改 `skills/development-workflows/design-md/`。

## 清单

1. 用与 `build_catalog.normalize` 相同的规则处理 `ref/design/BI`，写入：
   - `skills/development-workflows/design-md/assets/catalog/first-party/bi.md`
   - `skills/development-workflows/design-md/assets/catalog/scenes/analytics/bi.md`
   两份字节必须相同。用 Python `write_text(..., encoding="utf-8", newline="\n")` 或直接写 bytes。不用 PowerShell 重定向。
2. 把 `assets/catalog/first-party/manifest.json` 改为数组，保留 `style:airy-glass`，追加 `design.md` 里的 `scene:bi` 对象。
3. 在 `assets/catalog/categories.json` 与 `assets/catalog/index.json` 增加 `scene-analytics`。在 `index.json` 的 `entries` 末尾追加同一条目。
4. 修改 `scripts/design_catalog.py`：`--kind` 接受 `scene`，列表标题分开统计三种 kind。
5. 修改 `scripts/build_catalog.py`：清理不在本次 `files` 中的 `scenes/**/*.md`。`brands/` 与 `styles/` 的清理保持原样。
6. 按 `design.md` 更新 `SKILL.md`、`agents/interface.yaml`、`README.md`、`references/design-md-format.md`、`references/implementation.md`、`references/brand-boundary.md`、`evals/evals.json`。`description` 使用 `design.md` 中的 832 字文本。
7. 更新 `tests/test_design_catalog.py`：153 条、19 类、三项计数、`search` 的三个词、`show scene:bi`、临时目录 `apply` 与 `--force`。
8. 在 `tests/test_build_catalog.py` 增加一个用例，不改共享 `CATEGORIES`：
   - 向该用例自己的 `out/categories.json` 追加 `scene-analytics`。
   - manifest 写成数组，同时包含现有风格条目和 `scene:bi`。
   - 源文件放在 `out/first-party/bi.md`。
   - 预先放一个 `out/scenes/analytics/stale.md`。
   - 断言 `scene:bi` 在索引末尾，`scenes/analytics/bi.md` 与源文件正规化后的字节一致，`stale.md` 被删除，`style:airy-glass` 仍在。
9. 跑下面的定向测试。通过后执行 `just docs-sync`。
10. 在 `.trellis/spec/guides/skill-authoring-conventions.md` 的 design-md first-party 一节补上：场景条目使用 `scenes/<category>/<slug>.md`，manifest 可以是数组，重建会清理过期的 `scenes/**/*.md`。这属于收尾时的 spec 更新。
11. 从仓库根跑 `just ci`。失败则先修再收尾。

## 验证命令

```bash
python -m unittest skills/development-workflows/design-md/tests/test_design_catalog.py skills/development-workflows/design-md/tests/test_build_catalog.py
python skills/development-workflows/design-md/scripts/design_catalog.py search BI
python skills/development-workflows/design-md/scripts/design_catalog.py search 经营分析
python skills/development-workflows/design-md/scripts/design_catalog.py show scene:bi
just docs-sync
just ci
```

`apply` 的成功与拒绝用例放在临时目录，不写本仓库根的 `DESIGN.md`。

## 风险与回退

- 高风险文件：`assets/catalog/index.json`、`assets/catalog/first-party/manifest.json`、`scripts/build_catalog.py`。
- manifest 改数组前先保留 `style:airy-glass` 的全部字段。漏掉它时，下次真实上游重建会删掉 `styles/airy-glass.md`。
- `scenes/**/*.md` 清理不要扩到 `first-party/` 或 `LICENSES/`。
- 单文件回退：恢复上述索引和脚本，删除 `first-party/bi.md` 与 `scenes/analytics/`。已安装到其他项目的链接会在下次安装时跟上，本任务不改安装器。

## 开始前核对

- `prd.md`、`design.md`、`implement.md` 都在，且写入位置仍是项目根 `DESIGN.md`。
- `implement.jsonl` 与 `check.jsonl` 已有 curated 条目。
- 用户已经明确批准这份计划。批准前不运行 `task.py start`。
