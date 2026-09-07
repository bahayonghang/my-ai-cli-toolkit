# Implementation plan

## Preconditions

保持 planning，用户批准最终父子计划后才 start。读取父任务审查报告、platforms/claude/AGENTS.md、backend spec，并核当前官方 hook 协议。

## Ordered steps

1. 添加安全回归，先复现 stdin 放行、exit 1、会话混合。
2. 按 R1/R2 修复入口，保持规则集合和采集长度不变。
3. 修正配置与 code_map，删除废弃 inject-spec.py。
4. 运行 `python -m unittest discover -s platforms/claude/hooks/tests -p "test_*.py"`，全部通过。
5. 运行 `python -m json.tool platforms/claude/hooks/hooks.json`、`just python-check`、`git diff --check`。
6. 强模型独立核对协议/权限/会话隔离；把源布局与解释器条件交给说明子任务。
7. 定向检查通过后向下游交接，任务仍保持 in_progress；说明子任务不必等本项 completed 即可同步生成文档。父任务在生成同步后协调最终 `just ci` 并回填 AC4，在此之前不归档或宣称全库通过。

## Routing

Claude Code 强模型优先审查原生 hook 语义，Codex 强模型交叉审查。冻结后的字段提取、返回码与回归实现可交较便宜模型，限本任务文件；协议和失败策略判断保留强模型。

## Completion and rollback

附 AC1—AC4 命令与结果；真实客户端未验收保持 UNVERIFIED。只回退本任务文件，不触碰安装目录。规范回写由知识子任务负责。
