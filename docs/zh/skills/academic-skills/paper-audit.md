# Paper Audit

统一的中英文论文审计技能，支持 `.tex`、`.typ`、`.pdf` 输入。

## 适用场景

- 投稿前论文检查
- reviewer 风格的论文审阅
- 正式润色前的对抗式质量排查

## 工作流程

1. 提供目标论文路径
2. 读取 `references/` 中的审查标准
3. 运行 `scripts/audit.py`
4. 输出 Markdown 报告，并区分自动化发现与判断类评分

## 主要资源

- `scripts/audit.py`
- `references/REVIEW_CRITERIA.md`
- `references/CHECKLIST.md`
- `references/SCHOLAR_EVAL_GUIDE.md`

## 说明

- 技能支持 audit、review、polish 等不同模式。
- 如果没有提供目标路径，应先确认论文源文件。
