# humanizer-paper

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Register-aware academic language polisher for English journal articles and Chinese doctoral dissertations.

## 触发场景

- Register-aware academic language polisher for English journal articles and Chinese doctoral dissertations
- Removes AI-writing tells while keeping academic norms: calibrates hedging instead of deleting it, preserves section-appropriate passive voice, enforces terminology consistency, and fixes ghost citations, hollow generalities, uniform sentence cadence, and templated structure
- Dual mode, en-journal and zh-dissertation, selected by CJK ratio or asked when ambiguous
- Use it whenever the user wants to polish, 降AI味, 润色, or norm-check an academic draft, paper section, abstract, or 学位论文 paragraph

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `humanizer-paper` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `3.0.0` |
| 标签 | `academic-writing`, `humanizer`, `ai-tells`, `journal`, `dissertation`, `zh`, `en`, `polishing` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill humanizer-paper
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/humanizer-paper/AGENTS.md` | 文件 | 1 | 顶层文件 |
| `skills/research-learning-knowledge/humanizer-paper/evals` | 目录 | 1 | 评测样例 |
| `skills/research-learning-knowledge/humanizer-paper/README.md` | 文件 | 1 | 顶层文件 |
| `skills/research-learning-knowledge/humanizer-paper/references` | 目录 | 3 | 引用资料 |
| `skills/research-learning-knowledge/humanizer-paper/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/research-learning-knowledge/humanizer-paper/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/research-learning-knowledge/humanizer-paper/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/humanizer-paper/references` | 引用资料 |
| scripts | `skills/research-learning-knowledge/humanizer-paper/scripts` | 可执行脚本 |
| tests | `skills/research-learning-knowledge/humanizer-paper/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/humanizer-paper/SKILL.md`
- `skills/research-learning-knowledge/humanizer-paper`
