# image2 入口发现与验真

这份文档用于回答一个关键问题：当前项目里“image2”到底怎么调用。只有确认了项目指定入口或本仓库备案通道，才可以进入真实生图闭环。

## 1. 先确认项目约束

优先读取这些位置：

1. 当前会话或项目根目录的 `AGENTS.md`
2. 用户在消息里明确写出的 image2 调用方式
3. 项目 README、scripts、package scripts、CLI 文档或已有 demo 记录
4. 环境变量、命令行工具或本地脚本中明确命名为 image2 的入口

推荐搜索关键词：

```powershell
rg -n "image2|IMAGE2|generate.*image|image.*generate|生图|出图|绘图|assets.*generated" .
```

如果项目有多层目录，先从用户指定的工作目录开始搜索，再扩大到仓库根目录。

## 2. 什么可以算 image2 入口

只有满足以下条件之一，才可以把它视为项目指定 image2：

- 用户明确说“用这个命令/脚本/API 调 image2”
- 项目文档明确把某个命令、脚本、MCP 工具或服务命名为 image2
- 当前 Codex 环境的 AGENTS.md 明确规定了 image2 调用方式
- 既有代码中存在稳定的 image2 封装，并且命名、参数、输出路径都能确认
- 本仓库的 `scripts/image2_asset.py` 成功执行；它会先尝试原生 image2，失败后自动备案到 OpenRouter ICU `gpt-image-2`

确认后，在执行前记录：

- 调用命令或工具名
- 输入图片或提示词来源
- 输出目录
- 期望尺寸和文件格式
- 是否支持透明背景、参考图、局部编辑或批量生成

## 3. 什么不能冒充 image2 或备案通道

以下都不能当作 image2 或本仓库备案通道，除非用户明确允许作为替代方案：

- imagegen skill
- 未经 `scripts/image2_asset.py` 统一入口调用的 gpt-image 系列 CLI/API
- 未经本仓库备案规则确认的 OpenRouter、ICU 或其他中转图片 API
- OpenAI SDK 自写生图脚本
- 只检查 `OPENAI_API_KEY` 后自行调用图片模型
- 用 CSS、SVG、渐变、噪点或截图近似复杂视觉
- 从网络下载图片后声称已经生图

如果使用了这些替代方案，最终必须明确写成“替代方案”，不能写成“已调用 image2”。如果使用 `scripts/image2_asset.py` 自动走 OpenRouter ICU `gpt-image-2`，最终写成“openrouter-icu-gpt-image-2 备案通道”。

## 4. 找不到入口时怎么办

如果无法确认原生 image2 入口：

1. 先调用 `scripts/image2_asset.py`，让脚本自动尝试原生 image2 和 OpenRouter ICU `gpt-image-2` 备案通道。
2. 如果备案通道成功，继续完成生图接入和页面截图验真，并标明实际通道。
3. 如果原生 image2 和备案通道都不可用，继续完成 UI 拆解、资产清单、提示词和代码骨架。
4. 明确标注“尚未完成真实位图资产生成”。
5. 不要生成或接入其它模型图片来冒充 image2。
6. 最终列出待执行的 image2 资产和提示词，方便用户补充入口后继续。

可使用这段说明：

```text
当前环境无法确认项目指定 image2 调用入口，且 OpenRouter ICU gpt-image-2 备案通道也不可用。我已经完成 UI 拆解、资产清单和提示词准备，但尚未完成真实位图资产生成。为了避免误报，我没有使用 imagegen、未登记的 OpenRouter/gpt-image 调用或自写 OpenAI SDK 脚本替代 image2。
```

## 5. 生图后的验真记录

真实调用 image2 后，最终回复至少列出：

| 项目 | 内容 |
| --- | --- |
| image2 入口 | 实际命令、脚本或工具名 |
| 实际通道 | `native-image2` 或 `openrouter-icu-gpt-image-2` |
| 生成资产 | 文件路径和用途 |
| 接入位置 | 哪个页面、组件或 CSS 槽位 |
| 截图验证 | 截图路径、视口尺寸、检查结果 |
| 剩余代码近似 | 哪些区域仍由 CSS/SVG/代码实现 |

如果图片只生成但没有接回页面，只能说“已生成资产”，不能说“已完成 image2 UI 复刻”。
