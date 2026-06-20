# paper-workbench

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Researcher-profile-driven paper intake and literature workbench for academic workflows.

## 触发场景

- the user only says things like “精读这篇”, “整合这几篇”, “找研究空白”, or “搭综述框架”

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `paper-workbench` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `1.1.0` |
| 标签 | `paper`, `research`, `normalization`, `literature-review`, `synthesis`, `doi`, `arxiv`, `analysis` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill paper-workbench
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/paper-workbench/evals` | 目录 | 1 | 评测样例 |
| `skills/research-learning-knowledge/paper-workbench/references` | 目录 | 15 | 引用资料 |
| `skills/research-learning-knowledge/paper-workbench/scripts` | 目录 | 3 | 可执行脚本 |
| `skills/research-learning-knowledge/paper-workbench/tests` | 目录 | 4 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/research-learning-knowledge/paper-workbench/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/paper-workbench/references` | 引用资料 |
| scripts | `skills/research-learning-knowledge/paper-workbench/scripts` | 可执行脚本 |
| tests | `skills/research-learning-knowledge/paper-workbench/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/paper-workbench/SKILL.md`
- `skills/research-learning-knowledge/paper-workbench`
