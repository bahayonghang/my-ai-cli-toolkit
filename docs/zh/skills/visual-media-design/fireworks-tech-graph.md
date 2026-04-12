# Fireworks Tech Graph

生成高质量技术图，默认交付 SVG，并在本地导出工具可用时追加 PNG。

## 使用场景

适合以下需求：
- 想把系统描述转成正式的技术图，而不是 Mermaid 代码
- 需要架构图、流程图、数据流图、时序图、Agent 图、记忆图、对比图或时间线
- 希望按视觉风格出图，而不是白板草图
- 希望得到可发布的 SVG，或在工具可用时直接拿到 PNG

如果用户明确要 Mermaid、README 内嵌图，或者只是要一句文字解释，不应优先触发这个 skill。

## 默认行为

- **必交付物**：`.svg`
- **增强交付物**：`.png`（仅当本地存在 `rsvg-convert`）
- **默认风格**：Style 1 / Flat Icon
- **可选风格**：Dark Terminal、Blueprint、Notion Clean、Glassmorphism

## 工作流

1. 先判断图类型
2. 提取结构：节点、分层、数据流、语义分组
3. 先做布局规划，再写 SVG
4. 默认读取 `references/style-1-flat-icon.md`
5. 如果出现具体产品，再读取 `references/icons.md`
6. 写出 SVG 文件
7. 若用户要求 PNG，或 PNG 对交付有明显价值，则尝试导出
8. 明确返回实际生成的文件路径，并区分 SVG 成功 / PNG 成功 / PNG 跳过 / PNG 失败

## 支持的图类型

- **架构图**：适合服务、组件、基础设施分层
- **数据流图**：强调数据从哪里来、到哪里去
- **流程图**：适合决策树、审批流、操作流程
- **Agent 架构图**：适合 LLM、工具、记忆、编排器关系
- **记忆架构图**：适合 Mem0、MemGPT 风格的读写路径图
- **时序图**：适合 API 调用链和交互过程
- **对比矩阵**：适合方案/产品能力比较
- **时间线 / 甘特图**：适合阶段规划与里程碑
- **概念图 / 思维导图**：适合能力地图与技术栈地图

## 平台与导出

### 基本规则
- 永远先保证 `.svg` 成功生成。
- 只有在本地导出工具存在时，才承诺 `.png`。

### 检查命令
- bash 类环境：`command -v rsvg-convert`
- PowerShell：`Get-Command rsvg-convert`

### Windows 支持
- Windows 用户优先使用 PowerShell 检查依赖。
- 路径里如果有空格，调用命令时必须加引号。
- 如果用户给的是 `C:\Users\...` 这种 Windows 绝对路径，按原样保留，不要擅自改写成 POSIX 形式。

### macOS / Linux
- macOS 常见来源是 `librsvg`
- Linux 常见来源是 `librsvg2-bin` 或同类包

### 失败回退
- 如果 `rsvg-convert` 不存在：仍然交付 SVG，并明确说明 PNG 被跳过
- 如果导出命令失败：保留 SVG，并报告失败原因与 SVG 路径
- 不要在没有依据时编造下载地址或安装链接

## 风格系统

| 风格 | 适用场景 |
|------|----------|
| Flat Icon | 博客、文档、幻灯片 |
| Dark Terminal | README、开发者文章、暗色展示 |
| Blueprint | 架构设计、工程规范 |
| Notion Clean | 内部文档、Wiki、知识库 |
| Glassmorphism | 演示稿、较强视觉表现的场景 |

## 语义约定

### 常见形状
- User：圆形或人物
- LLM / Model：双边框圆角矩形
- Agent / Orchestrator：六边形或强调控制器框
- Short-term Memory：虚线圆角矩形
- Long-term Memory / Vector Store：圆柱
- Tool：工具框
- API / Gateway：六边形
- File / Document：折角矩形
- Decision：菱形
- Process：圆角矩形

### 常见箭头语义
- 蓝色实线：主数据流 / 主请求流
- 橙色实线：控制 / 触发
- 绿色实线：记忆读取
- 绿色虚线：记忆写入
- 灰色虚线：异步 / 事件
- 紫色：循环、转换或嵌入

当一张图里用了 2 种以上语义箭头时，应补一个图例。

## 输出要求

返回时至少说明：
- 图类型
- 选用风格
- SVG 路径
- PNG 路径或 PNG 跳过/失败状态

## 常见问题

- 箭头穿过节点：应改走绕行路径
- 图太乱：先加分组容器，再减少颜色类型
- 文字溢出：缩短标签或增大节点尺寸
- 只生成了 SVG：这是允许的，但必须明确告诉用户 PNG 未成功导出
