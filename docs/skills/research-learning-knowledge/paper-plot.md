# paper-plot

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Generate publication-quality matplotlib figures in real academic paper styles.

## 触发场景

- Generate publication-quality matplotlib figures in real academic paper styles
- Two modes: from-data (pick a pre-built catalog style, fill in your numbers) and from-image (reproduce an uploaded paper figure as a matplotlib script)
- Use for "把数据画成论文图", "用某风格画我的数据", "复现这张图", or a named catalog style
- Drawing only, no paper reading

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `paper-plot` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `1.0.0` |
| 标签 | `matplotlib`, `plotting`, `figures`, `paper`, `reproduction`, `visualization` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill paper-plot
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/paper-plot/assets` | 目录 | 10 | 素材资源 |
| `skills/research-learning-knowledge/paper-plot/evals` | 目录 | 1 | 评测样例 |
| `skills/research-learning-knowledge/paper-plot/references` | 目录 | 11 | 引用资料 |
| `skills/research-learning-knowledge/paper-plot/scripts` | 目录 | 9 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/research-learning-knowledge/paper-plot/assets` | 素材资源 |
| evals | `skills/research-learning-knowledge/paper-plot/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/paper-plot/references` | 引用资料 |
| scripts | `skills/research-learning-knowledge/paper-plot/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/paper-plot/SKILL.md`
- `skills/research-learning-knowledge/paper-plot`
