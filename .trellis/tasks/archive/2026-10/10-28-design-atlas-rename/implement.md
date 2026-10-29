# 执行计划：改名

1. [ ] 基线：`python skills/development-workflows/design-md/scripts/design_catalog.py list > <scratchpad>/list-before.txt`，`list --format json` 也存一份。
2. [ ] `rg -n "design-md" --hidden -g '!.git' -g '!ref/**' -g '!**/archive/**' -g '!docs/.vitepress/**' -g '!docs/node_modules/**'` 列出全部命中，逐条归类为“改 / 保留 / 生成物”。
3. [ ] `git mv skills/development-workflows/design-md skills/development-workflows/design-atlas`。
4. [ ] 按 prd 清单修改 skill 内文件，并把版本号改为 0.3.0。
5. [ ] 修改仓库级引用（AGENTS.md、spec、code_map）。
6. [ ] `just docs-sync`，确认旧生成页已删除、新页已生成（如脚本不删除旧页，手动 `git rm`）。
7. [ ] 对比 list 输出与基线，确认一致。
8. [ ] `just ci`。
9. [ ] 提交：`refactor(skills): 🚚 rename design-md to design-atlas`。

回滚：revert 该提交即可。
