# Design Atlas 成品质感与交互精修

## Goal

提升 `skills/development-workflows/design-atlas` 生成 UI 的成品质感：在保留项目风格与业务行为的前提下，让排版、组件反馈、浮层、动态内容和状态转换更稳定、明确、连贯。不是增加统一的视觉特效风格。

## Background and confirmed facts

- 用户明确要求阅读 Jakevin 的 X 帖子，结合 qiaomu-meta 创建优化 Trellis 任务；本轮授权研究与规划，不包含实现、发布或提交。
- 原帖已通过 ego-browser 阅读正文。它是对 Kubai 设计技巧的二次整理，原始技巧与参数未独立核验，证据及逐项取舍见 `research/source-analysis.md`。
- 现有版本 0.5.0 已有 202 个目录条目、统一 token、状态覆盖、DA4 同心圆角、DA5 渐进披露、DA6 动效克制、DA8 图标一致性与运行时验证。
- 待补的是可执行的精修决策及状态场景评测，不是再加一套目录或重复现有审查规则。

## Requirements

- R1 风格优先：精修遵循已有 DESIGN.md、组件库、variant、token、API/props、语义与依赖边界；不默认重选主题，不将 flat/terminal/brutalism 玻璃化或拟物化。
- R2 核心精修：补充按角色组织的动效与可中断性、浮层内容/交互决策、中英混排与数字稳定、流式/加载状态的视觉稳定。复用现有圆角、图标和无障碍规则。
- R3 按需配方：按钮触感、菜单安全区、拖拽落点/取消、表面层次与深浅主题只在实际场景适用时加载。每项解释适用条件、不适用条件、token、状态、降级与验证方法。
- R4 冲突处理：不弱化 Floor；spring/overshoot、Halo、假浏览器图示遵循现有 gate。动画只使用现有允许的属性；不能以美观为由删除权限确认、关键说明或实现不存在的撤销。
- R5 证据保真：注明二手来源；参数是示例而非黄金规则；兼容性未核实则不声明最低版本。无运行环境时逐项标记未验证。
- R6 可评测交付：补充触发/近邻边界、行为样例与输出比较计划，保留 schema check、确定性测试、模型执行及人工审美验证的区别。

## Acceptance criteria

- AC1 / R1：保留风格场景不运行 route/apply、不替换组件库、不引入依赖；flat/terminal 场景不因“质感”自动增加玻璃/弹跳。
- AC2 / R2：精修说明能让执行者为每项变更写出触发、状态、token、取消/打断、键盘/触屏与 reduced-motion 结果；非适用项注明原因。
- AC3 / R2：混排文档覆盖窄屏、长词、标点、动态数字；聊天覆盖流式更新与用户主动滚离底部；不把正常文本增长误判为禁止的布局变化。
- AC4 / R3：每个纳入配方包含适用与排除条件、回退及运行检查；源帖数值不得成为跨主题硬编码门槛。
- AC5 / R4：可点击内容不放进 Tooltip；关键说明不变为 hover-only；授权/支付/不可逆行为的确认不被精修移除；无后端支持不声称可撤销。
- AC6 / R4：既有 gate 等级、waiver 与退出码不变。无新纯审美 FAIL，无新增目录条目或修改 0.5.0 色板选择契约。
- AC7 / R5–R6：至少五种输出场景有同输入的 baseline/candidate 比较协议；至少两条近邻负例；报告区分实际执行与 missing evidence。不得用 `just evals-check` 冒充模型/审美评测。
- AC8 / R6：目标测试、`just skills-check`、`just evals-check`、必要的 docs-sync 与最终 `just ci` 结果可追溯；未通过项如实列出。

## Out of scope

不实现 Kaze/Lumno 功能；不做拼音搜索、URL 容错或浏览器 Peek；不新增风格/颜色引擎；不引入动画依赖；不默认实现液态折射、Halo、3D 翻书、动态 Bento 或 SVG 空状态；不重写检测器；不修改用户全局 skills；不发布或推送。

## Risks and deferred evidence

视觉收益尚属 hypothesis。浏览器新 CSS 兼容性、性能、人类盲评与模型实跑待实施阶段取证；无证据不得宣称提升已验证。高成本特效留作后续明确需求，不阻塞本任务。

## Planning state

已完成需求收敛与 PRD 合并整理，无未决产品问题。`design.md` 与 `implement.md` 为建议实施方案；保持 planning，等待用户对最终规划的后续明确批准。任务创建不是实施批准。
