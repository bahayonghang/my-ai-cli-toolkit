# Implement — literature-mentor 领域改造与拆分

- Task: `.trellis/tasks/06-20-litmentor-redomain`
- 关联: `prd.md`、`design.md`
- 前置: 本任务 `task.py start` 后方可执行；建议先完成 `06-20-pw-skilldir-fix`（无文件冲突，仅排序）。

## 执行清单（有序）

### 阶段 A：基线与备份
1. [ ] 记录基线：`wc -l skills/research-learning-knowledge/literature-mentor/SKILL.md`（应为 450）。
2. [ ] `git status` 确认 `literature-mentor/` 干净，便于回滚。
3. [ ] 通读现 SKILL.md，按 `design.md` §2.2 标出每段的去向（保留 / 下沉到哪个 references 文件）。

### 阶段 B：建 references 骨架（下沉重内容）
4. [ ] 新建 `references/reading-protocol.md`，迁入 §2/§3/§3.1/§4/§5 内容（领域无关，先迁后改皮肤）。
5. [ ] 新建 `references/figure-reading.md`，迁入 §6.1–§6.4。
6. [ ] 新建 `references/research-generation.md`，迁入 §8.2–§8.5。
7. [ ] 新建 `references/mentor-style.md`，迁入「解读风格」整段。
8. [ ] 验证：迁移后内容无丢失（逐段核对原文 → references）。

### 阶段 C：领域换肤（牛基因组学 → CS/DL/自动化）
9. [ ] 按 `design.md` §1.1 重写 `figure-reading.md` 的图片类型指南为 CS/DL 图类。
10. [ ] 按 `design.md` §1.2 重写 `mentor-style.md` 的领域背景整合段；去除"3700样本/中国黄牛"。
11. [ ] 按 `design.md` §1.3 微调 `reading-protocol.md` 的叙事类型示例为 CS 语境。
12. [ ] 全局清查：`rg -n "牛|黄牛|基因组|群体遗传|GATK|PLINK|ADMIXTURE|SNeP|Fst|ROH|Manhattan|LD decay|3700" skills/research-learning-knowledge/literature-mentor` → 应为空（或仅剩明确的"已替换"说明）。

### 阶段 D：精简 SKILL.md 主干
13. [ ] 把 §2–§6、§8 的长内容替换为"一句话职责 + 参见 references/<file>.md"指针。
14. [ ] 保留 §0 模式表、§1 获取链、§7 逐图停顿禁止行为、§8.1 核心提炼输出契约于主文件。
15. [ ] 顶部加入个人向 CS/DL/自动化定位 + "何时改用 paper-workbench" 边界（`design.md` §3）。
16. [ ] 改 frontmatter：description 换领域口径 + 边界 + 个人定位；`tags` 调整；`version` 升次版本。
17. [ ] 验证：`wc -l SKILL.md` ≤ 220；references 链接全部可达。

### 阶段 E：验证与门禁
18. [ ] `python scripts/check.py skills/research-learning-knowledge/literature-mentor` → `[OK]`，description ≤ 1024 且无尖括号。
19. [ ] `just skills-check` 通过。
20. [ ] 人工复核 `prd.md` 全部 Acceptance Criteria 逐条勾选。
21. [ ] 通知 `06-20-rlk-conventions`：领域口径已定稿，可据此补三模式触发 eval。

## 验证命令汇总

```bash
# 残留领域词清查（应为空）
rg -n "牛|黄牛|基因组|群体遗传|GATK|PLINK|ADMIXTURE|SNeP|Fst|ROH|Manhattan|3700" \
  skills/research-learning-knowledge/literature-mentor

# 行数与结构
wc -l skills/research-learning-knowledge/literature-mentor/SKILL.md
ls skills/research-learning-knowledge/literature-mentor/references/

# 元数据门禁
python scripts/check.py skills/research-learning-knowledge/literature-mentor
just skills-check
```

## 评审门禁（Review Gates）

- **G1（阶段 B 后）**：references 拆分骨架成形、内容零丢失 → 再进入换肤。
- **G2（阶段 C 后）**：领域词清查为空、CS/DL 图类指南成形 → 再精简主干。
- **G3（阶段 E）**：全部 Acceptance Criteria 通过 → 进入 Phase 3（spec 更新 / commit）。

## 回滚点

- 任一阶段失败：`git checkout -- skills/research-learning-knowledge/literature-mentor`
  （本任务纯文档、无脚本/依赖，回滚无副作用）。
- 若拆分导致行为契约漂移（如逐图停顿规则被弱化），回到 G1 重新规划分段，不在主干外补丁式修。
