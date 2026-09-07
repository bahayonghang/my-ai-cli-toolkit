# Design

## Ownership

编辑 `platforms/claude/hooks/pre-bash.py`、`log-prompt.py`、`hooks.json`、`platforms/claude/code_map.md`；删除 `platforms/claude/hooks/inject-spec.py`；新增 `platforms/claude/hooks/tests/test_hooks.py`。不编辑 justfile、公共说明或共享 spec。

## Mechanism

R1：事件入口读取 UTF-8 JSON 和 tool_input.command，使用既有规则。匹配返回 2，安全输入返回 0；无效输入在此唯一边界诊断并返回 2。不增加旧 argv 分支。当前 error-handling spec 的旧 exit 1 hook 例已确认为陈旧，C1 按官方协议及本计划执行，由 C4 同步正式规范，不能用旧 spec 将修复改回 1。

R2：使用事件 session_id 作为身份，以事件 cwd 定位项目本地日志；缺少必要身份或有效项目目录时 stderr 诊断、返回 1、不写 default 混合文件。日志失败不是权限门，不返回 2 阻断用户 prompt。保持当前截断长度，不扩大采集。文件名仅做必要的路径分隔/越界拒绝。

R3：明确 hooks.json 是可分发源资产，当前不是已安装插件。保留已有 plugin-root 根目录布局约定（脚本位于该根），给展开路径加引号、去掉旧输入 argv；解释器统一为本仓库检查链使用的 `python`（要求 Python 3）。例如 `python "${CLAUDE_PLUGIN_ROOT}/pre-bash.py"`，logger 同形。离线接线测试从 hooks.json 读取真实 command，在含空格的合成 plugin root 和非交互 shell 中传 stdin，不能只绕过配置直接调用 sys.executable。部署时核实 root 与 Python 3，不新建安装器或全局配置。删除 no-op 及接线，description/code_map 只保留实际事件。

R4：标准库 unittest/subprocess 仅运行 Python 检查器；合成命令永不交 shell。TemporaryDirectory 覆盖 stdin 命中/安全/坏输入、同/不同会话、事件 cwd 与进程 cwd 不同、含空格脚本路径。

## Traceability and evidence

R1 → 输入与退出码 → AC1；R2 → 身份/cwd → AC2；R3 → 接线/说明 → AC3；R4 → 标准库离线回归 → AC4。

离线测试不能证明本机 Claude 加载了资产。真实接线使用合成只读命令验证，访问或授权不足时标 UNVERIFIED，不伪装成本地断言失败。保持 hook 规则集合不变；它不是完备的安全隔离机制。
