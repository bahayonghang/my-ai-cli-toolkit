# 弃用技能清理与提交前 CI — 2026-09-10

用户本轮明确要求清理已删除技能的残留，并提交所有改动、归档当前任务。本实施子代理仅负责清理和集成验证；提交、归档与任务状态由主会话负责。

## 诊断与变更

起始运行 `rtk proxy python -X utf8 docs/scripts/sync_docs_catalog.py --check` 已通过：41 skills、89 generated files。前一轮已经同步两个已删除技能的派生文档，本轮没有复现用户所述历史 CI 报错，不能将以下引用问题宣称为该报错的已验证根因。

按 code_map 路由搜索现用 skills、scripts、docs、CI 和入口文件，发现并最小清理：

- `skills/developer-tools-integrations/AGENTS.md`：移除已删 `codex-workflow-recommender` 的清单、工具表及评测例子；接口例子改为确实存在的 `codex-context-improver`。
- `skills/research-learning-knowledge/dual-steelman/SKILL.md`：description 与边界路由去掉已删 `web-research`，保留原有 `deep-research-pro` 调研归属，其他行为未变。
- 运行 `rtk proxy just docs-sync` 成功：82 技能详情页、89 总生成文件。新增本轮派生变化仅为中英 `dual-steelman` 详情页中的失效路由表述。

搜索中保留的同名字串均有当前用途：`job-application-kit/references/web-research.md` 实际存在，相关调用指向包内参考；roundtable 的 `web-research/citation-oriented skill` 是能力泛指；新 Codex 技能测试检查旧入口不存在。历史任务与来源报告未重写。没有恢复已删除技能、添加依赖、修改全局/忽略的运行时链接或执行 Git 写操作。

## 最终验证

清理后执行一次 `rtk proxy just ci`，exit 0，七步全部完成：

| 检查 | 实际结果 |
| --- | --- |
| docs catalog | 41 skills、89 files，最新 |
| docs generator tests | 4/4 通过 |
| VitePress build | 通过；依赖已存在，跳过安装 |
| skill metadata | 41/41 通过 |
| Python byte compilation | 65 文件通过；不等同类型检查 |
| Python unittest | gh-pr-release 22/22、hooks 16/16 通过 |
| installer unittest | 35/35 通过 |
| Node tests | 416 总计、412 通过、0 失败、4 跳过 |
| git diff --check | 通过 |

四项跳过为两个 opt-in 浏览器 smoke、一个非 Windows 大小写路径用例、一个 Linux-only 存储用例。构建保留两条现有 VueUse PURE 注释警告；Git 提示部分源文件的自动换行转换，均非失败。无需为此次可逆的引用删除新建镜像实现的测试；既有门禁已运行。

后续由独立检查代理审阅本轮 delta，主会话按用户授权提交全部改动并归档。除非发现新修改或问题，不重复完整 CI。本地 CI 不证明远端多系统矩阵、真实宿主加载或 provider 效果；原任务 qiaomu README schema 差异与其他缺证据边界保持不变。
