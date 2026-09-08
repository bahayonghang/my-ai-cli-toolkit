# Implementation plan

1. 用户批准后读取父报告与 justfile/CI，核已有 unittest 用例与 hook tests 已就绪。
2. 添加五工具安装行为用例，先运行 `just install-projects-test`，确认现有行为与书面路径契约一致（R2）。
3. 添加 `just python-test` 并接入 ci/help/步骤计数（R1）；不新增依赖。
4. 运行 `just python-test` 与 `just install-projects-test`。套件计数不得为零；hook 用例必须覆盖之前的失败。
5. 核 hosted workflow 没有绕过 just ci，保留 OS 矩阵和 browser 条件（R3）。
6. 定向门通过后保持 in_progress 并交接 C2，不要求本项 completed。父任务协调生成说明同步后运行最终 `just ci` 并回填 AC3；之前不归档。任何失败保留原始输出并分析，不关闭测试。
7. 强模型独立核对覆盖与结果分类；填 AC1—AC4。远程发布未获授权时不触发 run，记新SHA hosted UNVERIFIED（R4）。

## Routing

Codex 强模型适合根因追踪、测试入口和CI审查；其他 harness 强模型可做独立代码审查。较便宜模型负责已规定的 recipe 和有限 tempfile 用例；是否跳过测试、扩大依赖或修改权限由主会话判断。

## Acceptance evidence

每条命令附 exit/计数/必要日志位置；可选 runner 缺 pytest 不等于被测逻辑失败，且不能抹去。真实客户端加载检验仍是各原生 harness 的独立证据。
