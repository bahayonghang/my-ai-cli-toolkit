# Excalidraw

生成可编辑的 Excalidraw 图表，适合架构图、流程图、时序图和自由布局的系统可视化。

## 使用场景

适合以下情况：
- 需要可编辑的 Excalidraw 文件
- 需要自由布局，而不是 Markdown 里的 Mermaid
- 需要白板、草图或 workshop 风格图
- 系统里有 3 个以上组件、分组区域或反馈箭头

如果用户明确要 README / Markdown 里的 Mermaid 图，或者只是要一句解释，不应触发这个 skill。

## 默认行为

- **默认风格**：专业技术图
- **草图模式**：只有在用户明确要求手绘、白板、brainstorm、rough draft 时才启用
- **必交付物**：`.excalidraw.json`
- **可选交付物**：`.svg` / `.png`，前提是导出工具可用

## 关键规则

1. **箭头必须双向绑定**
   - 箭头需要 `startBinding` 和 `endBinding`
   - 被连接的形状要在 `boundElements` 里记录对应箭头

2. **文字必须显式设置**
   - 每个文字元素都要有 `width`、`height`、`strokeColor`
   - 放在框内的文字要设置 `containerId`

3. **容器语义要正确**
   - 外部箭头应连接外层容器，而不是容器内部的某个子步骤
   - 背景区域必须完整包住所有子元素，并留出 padding

4. **布局必须避免穿模**
   - 返回箭头如果会穿过中间组件，就改成绕行路径或 2D 布局
   - 表示并行分支的 sibling 应该横向摆放，不要纵向堆叠

## 视觉系统

### 风格模式

| 模式 | 默认值 |
|------|--------|
| 专业模式 | `roughness: 0`、`fontFamily: 2`、清爽技术图风格 |
| 草图模式 | `roughness: 1`、`fontFamily: 1`、保持结构但更像白板草稿 |

### 语义色板

| 类别 | 背景 | 描边 |
|------|------|------|
| Primary / Input | `#dbeafe` | `#1e40af` |
| Success / Data | `#dcfce7` | `#166534` |
| Warning / Decision | `#fef9c3` | `#854d0e` |
| Error / Critical | `#fee2e2` | `#991b1b` |
| External / Storage | `#f3e8ff` | `#6b21a8` |
| Process / Default | `#e0f2fe` | `#0369a1` |
| Trigger / Start | `#fed7aa` | `#c2410c` |
| Neutral / Container | `#f1f5f9` | `#475569` |

### 文字颜色

- 标题：`#1e293b`
- 标签：`#334155`
- 说明：`#64748b`

## 布局启发式

- 坐标尽量对齐到 20 的倍数
- 组件最小尺寸建议 `160x60`
- 无关元素之间至少留 `40px`
- 容器内边距建议 `50-60px`
- 有标签箭头的间距通常用 `150-200px`
- 无标签箭头可收紧到 `100-120px`

## 图表模式说明

- **流程图**：起止点用椭圆，判断用菱形，步骤用矩形
- **架构图**：入口在左/上，处理层在中间，存储和外部系统在右/下
- **时序图**：参与者横向排开，复杂多阶段时按阶段重复参与者
- **泳道图**：用浅色背景矩形做泳道，标题用独立文字放在左上角

## 输出

- 必选文件：`<descriptive-name>.excalidraw.json`
- 可选导出：
  - 用 `curl + Kroki` 导出 SVG
  - 用 `excalidraw-brute-export-cli` 导出 PNG/SVG
- 结果可直接拖进 excalidraw.com 或用 VS Code Excalidraw 扩展打开

## 常见失败模式

- 文字看不见：通常是漏了 `strokeColor`
- 箭头不吸附：通常只配了单边 binding
- 分组标题压住内容：通常是把标题绑到了背景矩形上
- 返回箭头变面条：通常是还在强行用单排横向布局
