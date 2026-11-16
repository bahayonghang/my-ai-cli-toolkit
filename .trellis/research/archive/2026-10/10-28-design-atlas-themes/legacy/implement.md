# 执行计划：主题导入

1. [ ] 在 `categories.json` 中加入 4 个 theme 分类。
2. [ ] `build_catalog.py`：头部解析、token 抽取、正文章节映射、引用改写、dedup 合并、`themes/` 写出与清理、sources 与 LICENSE、`--hallmark` 可选模式。
3. [ ] 先写 `test_build_catalog.py` 的 hallmark fixture 测试，再让实现通过。
4. [ ] 逐个并排阅读后写 `overlays/dedup.json`：
   - 先处理 research 表中标 supersede 和 cluster 的约 20 个，用 `show` 读现有条目，用 `ref/.../themes/<slug>.md` 读主题。
   - 其余 distinct 写简短 reason。
5. [ ] 运行重建：
   ```bash
   python skills/development-workflows/design-atlas/scripts/build_catalog.py \
     --themes-only --hallmark ref/repo/hallmark \
     --out skills/development-workflows/design-atlas/assets/catalog
   ```
   （`--themes-only` 见 design.md“重建模式”。全量重建模式只在测试中用 fixture 验证。）
6. [ ] 确认 153 个旧条目的 md 文件无 diff。
7. [ ] 移植 `references/texture.md`。
8. [ ] `design_catalog.py`：`--kind theme`、`--all`、superseded 提示、provenance。在 `test_design_catalog.py` 中补测试。
9. [ ] 更新 `design-md-format.md` 和 `brand-boundary.md`。
10. [ ] 重建两次确认字节稳定，再运行 `just python-test` 和 `just skills-check`。
11. [ ] 提交：`feat(skills): ✨ import hallmark themes into design-atlas catalog`。

回滚：revert 提交即可；目录文件全部由构建生成。
