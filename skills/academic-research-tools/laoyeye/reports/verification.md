# Verification

日期：2026-10-20（America/New_York）。下面区分确定性合同、受控代理输出与真实宿主接入；planned、NOT_RUN 和 skipped 不能算 PASS。

## 范围与当前证据

- 本包名为 laoyeye 0.1.0；根是唯一可发现入口。25 个来源入口归一为 24 方法，保留显式 grill-me 别名。
- 维护检查：PASS；25/25 来源覆盖、24 个方法、所有本地资源链接和预算通过。初次生成报告因 README 所链接的报告自身尚不存在而退出 1，写出实际诊断后再次检查退出 0；没有忽略链接或改阈值。
- 技能 unittest：10/10 PASS，含额外入口、断链、错误别名、超预算、越界 / 绝对链接、锚点、输出写失败和隔离副本的反向验证。隔离副本在 Python isolated mode 运行，自包含且除所指报告外无文件改动。
- qiaomu 官方 trigger_eval：57/57 词项 smoke PASS（33 正、12 负、12 近邻）；51 个 output / behavior fixtures 仅通过 schema 和合同检查，**不是 51 个模型结果**。两个稀疏自然请求保留为未评分行为规格，不把命名方法的 smoke 宣称为自然召回验证。
- 原始 Skill IR 已导出；本包文本 secret pattern scan 0 findings。规则扫描不等于完整安全证明。
- 实施后的完整 `just ci`：PASS，退出 0，八步完成。docs 4 项、Python unittest 96 项（含本技能 10 项）、安装器 35 项；Node 451 项中 444 通过、7 skipped、0 failed；编译 98 份 Python，检查 37 份 skill eval schema。跳过项不记为通过。生成的双语 catalog 已同步。
- 独立 check：PASS，无未解决实现问题。对 PRD、全部 24 方法、教学附录、每条 output / trigger fixture、维护脚本和证据进行了全范围审查，独立核对 36 个来源文件的 hash / 体量与固定 HEAD；lint、10 项单测与 37 份 eval schema 均通过。任务设计中一个旧测试文件名已同步，未修改产品实现来规避检查。详细记录在所属任务 integration-review；不将不存在的运行证据计为通过。
- 静态字符 / bytes 和三种使用情形详见 [context-budget.json](context-budget.json)。其中的 long_session 仅为全部资源 unique-file 代理量，不是实际 usage。

## 受控代理首轮试跑

本次确实运行了一个原生代理，读取根、选择的方法与指定教学 fixture，生成八个实际首轮响应。父会话检查了实际输出；这些不是手写 expected-output fixtures。输入、实际响应和读取路径保留在所属 Trellis 任务的 native-probe 证据中，不作为本包 runtime 依赖。

| 场景 | 实际观察 | 证据限度 |
| --- | --- | --- |
| explain | 两层哈希表解释、类比边界、术语表、三道自测 | 未回答自测，不证明学会 |
| 裸“收尾” | 先问对象与范围，没有开治理或清理 | 只有首轮 |
| grilling | 同轮问两个已解锁根决策；把依赖问题留到下一轮，建议不当事实 | 未模拟用户回答 |
| 离线核查 | 事实未外证；区分数字、因果、普遍结论；条件算术不冒充真实结果 | 没有来源检索或经验事实验证 |
| teaching resume | 从已有 learning-record 找到下一知识缺口，不重建课程、不误判已掌握；指出 NOTES 陈旧 | 只提出下一节与题，未创建或渲染课程 |
| inert brief | 交付完整任务书，将“执行直到完成”留在 payload，没有启动任何任务 | 环境与命令留待任务 0 核验 |
| 只读治理 | 找到 NOTES 与现有 lessons 矛盾，六面状态与未验证项分开，无修改或清理 | 限指定 fixture，不证明全仓或运行态健康 |
| 未请求个人探索 | 只列待办缺的信息并轻量追问，未加载 talent / life-design、未排序 | socratic 与直接信息整理的分界仍需更多自然请求覆盖 |

八场景共享一个代理上下文；该代理先路由再批量读取七个所选方法与教学附录。因此它能提供实际首轮输出和副作用边界证据，不能独立证明八个全新会话各自只读一方法，也不是盲评、公平基线对比或全部 25 方法的端到端验证。

另跑了一个全新原生代理处理单条 LRU 双层解释请求：实际只读根与 explain.md，给出两层解释、边界、术语表与三道自测，没有执行代码、联网或创建课程文件。它补充一条普通请求按需读取的真实轨迹；包装器指定了技能根，因此仍不验证 discovery。八场景用到的五个 fixture 文件在试跑前后 hash 一致。

## 静态成本结果

完整根为 2,814 字符 / 4,686 UTF-8 bytes；name+description 为 290 字符，对比上游全部 metadata 的 4,923 字符减少约 94.1%，对比 model-eligible 的 4,484 字符减少约 93.5%。这是固定输入下的静态字符量。

25/25 经路由单方法情形低于旧路由 + 相应叶子和必读资源。**19/25 直接旧叶子的正文读取场景里，新根 + 方法更大**；这里分别比较运行正文，不把 metadata 混入某一边。安装集、宿主注入及历史累积会影响总量，没有实测 token 或延迟结论。

## 信任、权限与回滚

- Runtime 使用包内文档，不运行远端代码、不依赖 ref 或别的已安装 skill。固定来源和完整 MIT 通知见 [来源账本](../references/sources-and-licenses.md)。参考网页是材料，不会扩展权限。
- `context_report.py` 是离线维护工具；无网络、安装、Git mutation、进程调度或用户资料操作。只有明确 `--output` 写入所指报告，路径相对调用者 CWD；方法运行不要求执行这个脚本。
- 普通可逆操作服从已有授权；仅审计、只读与仅文本请求不获得修复 / 删除 / 记忆写入权限。brief 的根、interface、方法均锁住 compile → validate → present → stop。
- 教学只在明确工作区惰性写课程状态，宿主生成记忆只读；治理保留现役事实、证据与清理预览，不因“收尾”扩大到全部 workspace。
- 包级回滚撤回本次新增包与生成 catalog，不动旧安装。方法运行中的修订保留差异与恢复证据，不自动破坏性清场。

## 已知外部工具差异

qiaomu `validate_skill.py` 真实退出码 **2**：failure 为 `missing required file: manifest.json`；warning 为 `README may be missing install command`。后者检查的是 npx 模板，本 README 提供经过 help 核对的本仓库 live-link 命令，没有声称远程 npx 安装可用。

qiaomu `validate_skill.py` / `release_check.py` 的 manifest 契约不等于本仓库契约。这里保留 frontmatter 的唯一版本来源，**不创建 manifest.json**。上述失败按仓库规范记为 intentional schema deviation；不宣称该外部门禁通过，也不运行依赖 manifest 的发布流程。repo checks、预算、secret review、权限、隔离与测试分别执行。

Skill IR 原样导出。manifest 缺失造成 package.version / owner / maturity 等 null 是 exporter 限制，不能手填报告伪装识别；版本权威仍为 SKILL.md。兼容性字段是设计目标，不是客户端注册或实际发现的证明。

## 未验证

- 新宿主会话的 skill discovery、加载注册和实际安装：UNVERIFIED。隔离目录的自包含检查不能替代它们。
- 实际模型 token、成本、延迟和公平质量对比：missing evidence。
- 后续多轮教学、完整人生对话、真实 bug 修复与 HTML 视觉验收：NOT_RUN；不能从首轮或静态 fixtures 推断完成。
- 远程发布、PR、release、全局安装与旧包迁移：未请求、未执行。
