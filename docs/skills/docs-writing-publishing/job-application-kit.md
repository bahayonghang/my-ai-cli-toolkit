# job-application-kit

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

求职申请与面试准备套件：针对目标职位（JD/职位描述）量身定制简历与求职信，在诚实边界内修改与包装既有经历， 生成阶段化面试准备包并支持模拟面试。触发词：写简历、改简历、简历定制、tailor resume、resume、CV、 resume writing、求职信、cover letter、投递、申请职位、job posting、JD、职位描述、岗位匹配、fit 评估、 面试准备、面试问题、interview prep、mock interview、模拟面试、包装经历、量化成果。

## 触发场景

- 求职申请与面试准备套件：针对目标职位（JD/职位描述）量身定制简历与求职信，在诚实边界内修改与包装既有经历， 生成阶段化面试准备包并支持模拟面试。触发词：写简历、改简历、简历定制、tailor resume、resume、CV、 resume writing、求职信、cover letter、投递、申请职位、job posting、JD、职位描述、岗位匹配、fit 评估、 面试准备、面试问题、interview prep、mock interview、模拟面试、包装经历、量化成果。 不适用于：职位批量抓取与申请追踪管理、通用营销或商务文案、学术论文写作、招聘方视角的简历筛选。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `job-application-kit` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.0.0` |
| 标签 | `resume`, `cover-letter`, `interview-prep`, `job-application`, `career`, `简历`, `求职信`, `面试准备` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill job-application-kit
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/job-application-kit/agents` | 目录 | 1 | 配套 agent |
| `skills/docs-writing-publishing/job-application-kit/assets` | 目录 | 3 | 素材资源 |
| `skills/docs-writing-publishing/job-application-kit/evals` | 目录 | 2 | 评测样例 |
| `skills/docs-writing-publishing/job-application-kit/README.md` | 文件 | 1 | 顶层文件 |
| `skills/docs-writing-publishing/job-application-kit/references` | 目录 | 9 | 引用资料 |
| `skills/docs-writing-publishing/job-application-kit/reports` | 目录 | 2 | 顶层目录 |
| `skills/docs-writing-publishing/job-application-kit/scripts` | 目录 | 1 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/docs-writing-publishing/job-application-kit/agents` | 配套 agent |
| assets | `skills/docs-writing-publishing/job-application-kit/assets` | 素材资源 |
| evals | `skills/docs-writing-publishing/job-application-kit/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/job-application-kit/references` | 引用资料 |
| scripts | `skills/docs-writing-publishing/job-application-kit/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/docs-writing-publishing/job-application-kit/SKILL.md`
- `skills/docs-writing-publishing/job-application-kit`
