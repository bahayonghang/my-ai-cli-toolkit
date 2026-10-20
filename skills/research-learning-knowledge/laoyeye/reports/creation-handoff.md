# Creation Handoff — laoyeye 0.1.0

一个可安装包、一个可发现入口，按需运行 24 套内部方法，覆盖上游 25 个功能入口。用户指定沿用 laoyeye，不使用 qiaomu 名称前缀。当前是仓库内本地实现，没有公开发布或修改用户安装。

## 研究与取舍

- LearnPrompt/laoyeye：保留可观察的选择信号、拒绝硬路由和全部行为合同；将 grill-me 变为内部别名，不保留 26 入口或原文全载。
- mattpocock/skills 的 ask-matt、grilling、teach、diagnosing-bugs：吸收先读方法、依赖 frontier、课程状态与真实红灯；按本包工具和权限改造，不转调其他 skill。
- thinking-socratic：明确任务停止盘问，环境事实自行核验；用于适用边界与回归案例。
- critical-thinking-logical-reasoning：先准确理解论证、不凭弱论证断言事实为假；不复制其 Apache 文本。

来源、观察日期、指标含义与候选逐项教训见 [prior-art-research.md](prior-art-research.md)。没有候选用户评分或公平输出比较，不称全局更优。

保留行为与节奏，改造为方法级资源；拒绝巨型根入口、多独立发现项、统一问卷、自动执行 task payload 和未经授权的原文再分发。新增覆盖账本、上下文三场景比较，以及 token 示例误索取 / 三方案误接二选一等回归合同。

## 优势标签

- **design advantage**：包内完整能力、直接方法链接、内部别名、明确长模式与副作用门，不需要先安装 25 个叶子。
- **validated advantage**：metadata 静态字符 4,923→290，完整根 2,814 字符，25/25 经路由场景低于对应旧版本。10/10 确定性单测、57/57 词项 smoke、实施后完整仓库 CI 通过；受控八场景首轮输出和另一个新代理的单请求读取见 [verification.md](verification.md)。它们仅支持所标范围，不证明实际 token / 质量提升。
- **hypothesis**：更少 metadata 和路由材料可能降低整体使用成本；实际 token、延迟、跨宿主发现与质量提升仍缺证据。直接调用旧叶子可能更省正文，不能隐藏该场景。

## 使用与交接

从 README 的自然请求开始，明确时可点名原方法。新旧路由同名，安装时必须选择版本；旧叶子不被自动清理。静态 fixture、schema 与词项 smoke 不是模型行为通过率，稀疏自然请求另列行为规格。

需要继续评估时优先覆盖自然请求的路由、多轮状态恢复与实际宿主发现。不要为满足 qiaomu 的独立 manifest schema 添加平行版本来源，也不要手改生成 Skill IR 的 null。没有安装 / 发布授权就保持本地包与现有用户安装各自独立。

qiaomu 独立 validator 真实退出 2：缺 manifest，另有 npx 安装模板 warning，按仓库契约记录差异，未声称通过。19/25 直接旧叶子的正文更省；本包优化目标是整体安装与经路由使用。当前工作没有提交、推送、安装或发布。
