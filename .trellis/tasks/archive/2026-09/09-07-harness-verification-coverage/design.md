# Design

## File ownership

编辑 `justfile`、`scripts/test_install_projects.py`。核查 `.github/workflows/agentkit-desktop.yml`，仅在接入新标准库门需要时改该文件；现有 run: just ci 已能继承新门，默认不改。
不编辑 hook 测试/源代码（C1 所有），不编辑 docs/规则（C2 所有）。
记录更新父任务 `research/test-baseline.md` 或后续验收 ledger。

## Mechanisms

R1：增加一个 python-test recipe，分别调用：
- `python -m unittest discover -s skills/git-github-collaboration/gh-pr-release/tests -p "test_*.py"`
- `python -m unittest discover -s platforms/claude/hooks/tests -p "test_*.py"`

每组由独立 unittest discovery 执行，不新写测试框架；just 顺序执行和现有错误传播保证任一失败停止。放入 ci，更新 help/步骤计数。不会把 optional pytest 模块导入 unittest 后错误报告“0 tests PASS”。

R2：现有 tempfile/安装器测试套路增加五工具参数化场景，检查检测/选择后的真实目录和目标链接，并保持 universal 共享路径。以书面目标布局为预期，不直接用实现映射生成预期。文件链结果只证明 installer，不能替代 runtime。

R3：原 workflow 三 OS 和 browser 开关保持不变。复盘近期已结束失败日志、相关修复 commit、当前通过 run，只为仍存在缺陷安排修复。CI 新门的预期失败路径由 existing just/unittest 的正常非零语义承担，不引入模拟调度系统。

R4：不强行接入明确可选的论文/PDF环境测试。记录缺 pytest 与现有 fixture/依赖条件，未来单独批准扩展时再设门。本项不通过创建付费任务或安装新客户端来填 provider 空白。

## Traceability

R1→python-test/ci→AC1；R2→实际temp布局→AC2；R3→同入口与SHA证据→AC3；R4→结果分类→AC4。

## Rollback

回退本项 recipe 与测试变动，不删除已有测试、不改工作流触发范围。源测试由对应子任务自行负责。
